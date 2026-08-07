-- ============================================================================
-- Village CRM — 04: HR (attendance, requests, and automatic performance).
-- Run AFTER 01_schema.sql (needs profiles, leads, the helper functions).
-- Safe to re-run.
-- ============================================================================

-- ── Attendance: one row per person per working day ──────────────────────────
create table if not exists public.hr_attendance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null default current_date,
  check_in  timestamptz,
  check_out timestamptz,
  minutes int not null default 0 check (minutes >= 0),
  status text not null default 'present' check (status in ('present','late','absent','leave','holiday')),
  note text,
  created_at timestamptz not null default now(),
  unique (company_id, profile_id, work_date)
);
create index if not exists hr_att_idx on public.hr_attendance(company_id, work_date desc);

-- ── Requests: leave / permission (exit) / salary advance, one table ─────────
create table if not exists public.hr_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('leave','permission','loan')),
  req_type text,                       -- Annual leave / Meeting / Salary advance …
  date_from date,
  date_to date,
  time_from time,
  time_to time,
  days numeric(4,1),
  amount_egp numeric(12,2) check (amount_egp is null or amount_egp >= 0),
  installments int check (installments is null or installments > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create index if not exists hr_req_idx  on public.hr_requests(company_id, status, created_at desc);
create index if not exists hr_req_mine on public.hr_requests(profile_id, created_at desc);

-- ── Optional history: a stored snapshot of each period's score ──────────────
create table if not exists public.hr_performance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  period text not null check (period in ('weekly','monthly')),
  period_start date not null,
  period_end date not null,
  leads_count int not null default 0,
  actions_count int not null default 0,
  calls_count int not null default 0,
  conversion_pct numeric(5,2) not null default 0,
  commission_egp numeric(14,2) not null default 0,
  attendance_pct numeric(5,2) not null default 0,
  punctuality_pct numeric(5,2) not null default 0,
  score numeric(5,2) not null default 0,
  grade text,
  computed_at timestamptz not null default now(),
  unique (company_id, profile_id, period, period_start)
);
create index if not exists hr_perf_idx on public.hr_performance(company_id, period, period_start desc);

-- ── The automatic scorer: reads a person's CRM activity over a window ───────
-- Returns the same metrics the UI computes, so a snapshot and the live view agree.
create or replace function public.hr_score(p_profile uuid, p_from date, p_to date)
returns table (
  leads_count int, actions_count int, calls_count int,
  conversion_pct numeric, commission_egp numeric,
  attendance_pct numeric, punctuality_pct numeric, score numeric, grade text
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_company uuid;
  v_leads int; v_won int; v_actions int; v_calls int;
  v_comm numeric; v_target numeric;
  v_workdays int; v_present int; v_late int;
  v_conv numeric; v_commpct numeric; v_att numeric; v_punc numeric; v_score numeric;
begin
  select company_id into v_company from public.profiles where id = p_profile;

  select count(*) into v_leads from public.leads
   where owner_id = p_profile and created_at::date <= p_to;
  select count(*) into v_won from public.leads
   where owner_id = p_profile and status = 'Won';
  select count(*) into v_actions from public.lead_actions
   where created_by = p_profile and created_at::date between p_from and p_to;

  -- calls table only exists once 03_crm_core.sql has run
  begin
    execute 'select count(*) from public.calls where agent_id=$1 and started_at::date between $2 and $3'
      into v_calls using p_profile, p_from, p_to;
  exception when undefined_table then v_calls := 0; end;

  -- commission table only exists once 02_commissions.sql has run
  begin
    execute 'select coalesce(sum(amount_egp),0) from public.commissions where profile_id=$1 and status in (''paid'',''approved'')'
      into v_comm using p_profile;
  exception when undefined_table then v_comm := 0; end;

  select coalesce(nullif(commission_target_egp,0), 600000) into v_target
    from public.profiles where id = p_profile;
  if v_target is null then v_target := 600000; end if;

  select count(*) filter (where status <> 'absent'),
         count(*) filter (where status = 'late'),
         greatest(count(*),1)
    into v_present, v_late, v_workdays
    from public.hr_attendance
   where profile_id = p_profile and work_date between p_from and p_to;

  v_conv    := case when v_leads > 0 then round(v_won::numeric / v_leads * 100) else 0 end;
  v_commpct := least(100, round(v_comm / v_target * 100));
  v_att     := case when v_workdays > 0 then round(v_present::numeric / v_workdays * 100) else 0 end;
  v_punc    := case when v_present > 0 then round((v_present - v_late)::numeric / v_present * 100) else 100 end;
  v_score   := round(v_conv*0.28 + v_commpct*0.30 + v_att*0.16 + v_punc*0.12 + least(100, v_leads*9)*0.14);

  return query select
    v_leads, v_actions, v_calls, v_conv, v_comm, v_att, v_punc, v_score,
    case when v_score>=85 then 'A' when v_score>=70 then 'B' when v_score>=55 then 'C' else 'D' end;
end $$;
revoke execute on function public.hr_score(uuid,date,date) from public, anon;
grant  execute on function public.hr_score(uuid,date,date) to authenticated;

-- Snapshot every active person for the current week and month. Idempotent
-- (upsert on the unique key), so it is safe to run repeatedly.
create or replace function public.hr_snapshot_performance()
returns void language plpgsql security definer set search_path = public as $$
declare
  r record; s record;
  wk_start date := date_trunc('week', current_date)::date;
  wk_end   date := (date_trunc('week', current_date) + interval '6 days')::date;
  mo_start date := date_trunc('month', current_date)::date;
  mo_end   date := (date_trunc('month', current_date) + interval '1 month - 1 day')::date;
begin
  for r in select id, company_id from public.profiles where active loop
    for s in select * from public.hr_score(r.id, wk_start, wk_end) loop
      insert into public.hr_performance(company_id,profile_id,period,period_start,period_end,leads_count,actions_count,calls_count,conversion_pct,commission_egp,attendance_pct,punctuality_pct,score,grade)
      values (r.company_id,r.id,'weekly',wk_start,wk_end,s.leads_count,s.actions_count,s.calls_count,s.conversion_pct,s.commission_egp,s.attendance_pct,s.punctuality_pct,s.score,s.grade)
      on conflict (company_id,profile_id,period,period_start) do update set
        leads_count=excluded.leads_count, actions_count=excluded.actions_count, calls_count=excluded.calls_count,
        conversion_pct=excluded.conversion_pct, commission_egp=excluded.commission_egp, attendance_pct=excluded.attendance_pct,
        punctuality_pct=excluded.punctuality_pct, score=excluded.score, grade=excluded.grade, computed_at=now();
    end loop;
    for s in select * from public.hr_score(r.id, mo_start, mo_end) loop
      insert into public.hr_performance(company_id,profile_id,period,period_start,period_end,leads_count,actions_count,calls_count,conversion_pct,commission_egp,attendance_pct,punctuality_pct,score,grade)
      values (r.company_id,r.id,'monthly',mo_start,mo_end,s.leads_count,s.actions_count,s.calls_count,s.conversion_pct,s.commission_egp,s.attendance_pct,s.punctuality_pct,s.score,s.grade)
      on conflict (company_id,profile_id,period,period_start) do update set
        leads_count=excluded.leads_count, actions_count=excluded.actions_count, calls_count=excluded.calls_count,
        conversion_pct=excluded.conversion_pct, commission_egp=excluded.commission_egp, attendance_pct=excluded.attendance_pct,
        punctuality_pct=excluded.punctuality_pct, score=excluded.score, grade=excluded.grade, computed_at=now();
    end loop;
  end loop;
end $$;

-- To run the scoring automatically, enable pg_cron (Supabase → Database →
-- Extensions) and schedule it. Weekly every Sunday 00:05, monthly on the 1st:
--   select cron.schedule('hr-perf-weekly',  '5 0 * * 0', $$select public.hr_snapshot_performance()$$);
--   select cron.schedule('hr-perf-monthly', '5 0 1 * *', $$select public.hr_snapshot_performance()$$);
-- Until then the console computes the same score live on every open, so nothing
-- is blocked on the scheduler.

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.hr_attendance  enable row level security;
alter table public.hr_requests    enable row level security;
alter table public.hr_performance enable row level security;

-- Attendance: I manage my own; approvers see the whole company.
drop policy if exists hr_att_read on public.hr_attendance;
create policy hr_att_read on public.hr_attendance for select to authenticated
  using (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('hr:approve')));
drop policy if exists hr_att_write on public.hr_attendance;
create policy hr_att_write on public.hr_attendance for all to authenticated
  using (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('hr:approve')))
  with check (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('hr:approve')));

-- Requests: I file and see my own (needs hr:create); approvers see all.
drop policy if exists hr_req_read on public.hr_requests;
create policy hr_req_read on public.hr_requests for select to authenticated
  using (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('hr:approve')));
drop policy if exists hr_req_insert on public.hr_requests;
create policy hr_req_insert on public.hr_requests for insert to authenticated
  with check (company_id = public.current_company_id()
              and profile_id = auth.uid() and public.has_perm('hr:create'));
-- I may edit or withdraw my own request while it is pending; only an approver
-- can move it to approved/rejected. The WITH CHECK is what stops an employee
-- from approving their own leave or salary advance.
drop policy if exists hr_req_update on public.hr_requests;
create policy hr_req_update on public.hr_requests for update to authenticated
  using (company_id = public.current_company_id()
         and ((profile_id = auth.uid() and status = 'pending') or public.has_perm('hr:approve')))
  with check (company_id = public.current_company_id()
         and (public.has_perm('hr:approve')
              or (profile_id = auth.uid() and status in ('pending','cancelled'))));

-- Performance snapshots: my own, or all for an approver.
drop policy if exists hr_perf_read on public.hr_performance;
create policy hr_perf_read on public.hr_performance for select to authenticated
  using (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('hr:approve')));

grant select, insert, update, delete on public.hr_attendance, public.hr_requests, public.hr_performance to authenticated;
grant select on public.hr_performance to anon;
