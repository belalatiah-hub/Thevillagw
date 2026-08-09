-- ============================================================================
-- Village CRM — 05: Payroll. Monthly payslips = base + commission earned
-- − advance instalments − unpaid-leave days. Run after 01/02/04.
-- Safe to re-run.
-- ============================================================================

alter table public.profiles
  add column if not exists base_salary_egp numeric(12,2) not null default 0,
  add column if not exists allowances_egp  numeric(12,2) not null default 0;

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  period_month date not null,                    -- first day of the month
  status text not null default 'draft' check (status in ('draft','approved','paid')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (company_id, period_month)
);

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  run_id uuid not null references public.payroll_runs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  base_egp numeric(12,2) not null default 0,
  commission_egp numeric(14,2) not null default 0,
  allowances_egp numeric(12,2) not null default 0,
  advance_deduction_egp numeric(12,2) not null default 0,
  unpaid_deduction_egp numeric(12,2) not null default 0,
  other_deduction_egp numeric(12,2) not null default 0,
  net_egp numeric(14,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','paid')),
  created_at timestamptz not null default now(),
  unique (run_id, profile_id)
);
create index if not exists payslips_profile_idx on public.payslips(company_id, profile_id);

-- Build (or refresh) every payslip for one month. Commission counted = paid or
-- approved commission booked in that month; advance = one instalment of each
-- approved loan; unpaid = approved unpaid-leave days × (base / 22).
create or replace function public.payroll_generate(p_company uuid, p_month date)
returns public.payroll_runs language plpgsql security definer set search_path = public as $$
declare
  m0 date := date_trunc('month', p_month)::date;
  m1 date := (date_trunc('month', p_month) + interval '1 month - 1 day')::date;
  run public.payroll_runs;
  r record;
  v_comm numeric; v_adv numeric; v_unpaid_days numeric; v_unpaid numeric; v_net numeric;
begin
  insert into public.payroll_runs(company_id, period_month, status, created_by)
  values (p_company, m0, 'draft', auth.uid())
  on conflict (company_id, period_month) do update set status = public.payroll_runs.status
  returning * into run;

  for r in select id, base_salary_egp, allowances_egp from public.profiles
           where company_id = p_company and active loop
    -- commission earned in the month
    begin
      execute 'select coalesce(sum(amount_egp),0) from public.commissions
               where profile_id=$1 and status in (''paid'',''approved'')
                 and created_at::date between $2 and $3'
        into v_comm using r.id, m0, m1;
    exception when undefined_table then v_comm := 0; end;

    -- one instalment of each approved loan
    begin
      execute 'select coalesce(sum(round(amount_egp/greatest(installments,1))),0)
               from public.hr_requests where profile_id=$1 and kind=''loan'' and status=''approved'''
        into v_adv using r.id;
    exception when undefined_table then v_adv := 0; end;

    -- approved unpaid-leave days that fall in the month
    begin
      execute 'select coalesce(sum(days),0) from public.hr_requests
               where profile_id=$1 and kind=''leave'' and status=''approved''
                 and lower(coalesce(req_type,'''')) like ''%unpaid%''
                 and coalesce(date_from,$2) between $2 and $3'
        into v_unpaid_days using r.id, m0, m1;
    exception when undefined_table then v_unpaid_days := 0; end;

    v_unpaid := round(v_unpaid_days * (coalesce(r.base_salary_egp,0)/22.0));
    v_net := coalesce(r.base_salary_egp,0) + coalesce(r.allowances_egp,0) + v_comm - v_adv - v_unpaid;

    insert into public.payslips(company_id, run_id, profile_id, base_egp, commission_egp, allowances_egp,
                                advance_deduction_egp, unpaid_deduction_egp, net_egp)
    values (p_company, run.id, r.id, coalesce(r.base_salary_egp,0), v_comm, coalesce(r.allowances_egp,0),
            v_adv, v_unpaid, v_net)
    on conflict (run_id, profile_id) do update set
      base_egp=excluded.base_egp, commission_egp=excluded.commission_egp, allowances_egp=excluded.allowances_egp,
      advance_deduction_egp=excluded.advance_deduction_egp, unpaid_deduction_egp=excluded.unpaid_deduction_egp,
      net_egp=excluded.net_egp;
  end loop;
  return run;
end $$;
revoke execute on function public.payroll_generate(uuid,date) from public, anon;
grant  execute on function public.payroll_generate(uuid,date) to authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.payroll_runs enable row level security;
alter table public.payslips     enable row level security;

drop policy if exists runs_read on public.payroll_runs;
create policy runs_read on public.payroll_runs for select to authenticated
  using (company_id = public.current_company_id() and public.has_perm('payroll:read'));
drop policy if exists runs_write on public.payroll_runs;
create policy runs_write on public.payroll_runs for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('payroll:approve'))
  with check (company_id = public.current_company_id() and public.has_perm('payroll:approve'));

-- A payslip is visible to its owner, or to anyone who can run payroll.
drop policy if exists payslip_read on public.payslips;
create policy payslip_read on public.payslips for select to authenticated
  using (company_id = public.current_company_id()
         and (profile_id = auth.uid() or public.has_perm('payroll:approve')));
drop policy if exists payslip_write on public.payslips;
create policy payslip_write on public.payslips for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('payroll:approve'))
  with check (company_id = public.current_company_id() and public.has_perm('payroll:approve'));

grant select, insert, update, delete on public.payroll_runs, public.payslips to authenticated;
grant select on public.payroll_runs, public.payslips to anon;
