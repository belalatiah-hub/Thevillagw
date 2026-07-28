-- ============================================================================
-- Village CRM — Commission / Accounts module
-- Run this in Supabase → SQL Editor (one time). Safe to re-run.
-- Adds: profiles.commission_target_egp, deals, commissions + RLS + seed.
-- Only the Accounts (Finance) user can write; each salesperson reads their own.
-- ============================================================================

-- Annual commission target per person
alter table public.profiles
  add column if not exists commission_target_egp numeric(12,2) not null default 0;

-- A recorded sale
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  client_name text,
  project text,
  unit_code text,
  source text,                                   -- lead source / channel
  value_egp numeric(14,2) not null default 0,
  sold_by uuid references public.profiles(id),
  sold_at date not null default current_date,
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Commission line (one per recipient per deal)
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),   -- recipient
  calc_type text not null default 'percent' check (calc_type in ('percent','value','fixed')),
  rate numeric(12,4) not null default 0,          -- 2 => 2% (percent) OR the EGP amount (value/fixed)
  amount_egp numeric(14,2) not null default 0,
  status text not null default 'pending' check (status in ('forecast','pending','approved','paid')),
  note text,
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists commissions_profile_idx on public.commissions(profile_id, status);
create index if not exists commissions_deal_idx    on public.commissions(deal_id);

alter table public.deals       enable row level security;
alter table public.commissions enable row level security;

-- deals: Accounts see all; a recipient can see the deal behind their commission
drop policy if exists deals_read on public.deals;
create policy deals_read on public.deals for select to authenticated
  using (company_id = public.current_company_id()
         and (public.has_perm('finance:read') or public.has_perm('commission:read')
              or id in (select deal_id from public.commissions c where c.profile_id = auth.uid())));
drop policy if exists deals_write on public.deals;
create policy deals_write on public.deals for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('commission:approve'))
  with check (company_id = public.current_company_id() and public.has_perm('commission:approve'));

-- commissions: Accounts see all; everyone else only their own
drop policy if exists commissions_read on public.commissions;
create policy commissions_read on public.commissions for select to authenticated
  using (company_id = public.current_company_id()
         and (public.has_perm('commission:read') or public.has_perm('finance:read') or profile_id = auth.uid()));
drop policy if exists commissions_write on public.commissions;
create policy commissions_write on public.commissions for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('commission:approve'))
  with check (company_id = public.current_company_id() and public.has_perm('commission:approve'));

grant select, insert, update, delete on public.deals, public.commissions to authenticated;
grant select on public.deals, public.commissions to anon;

-- Which roles receive commissions (Sales Manager / Supervisor / Sales / Admin Sales …):
-- any profile can be a recipient; only Accounts (commission:approve) records them.

-- ── Seed (only if empty) — reproduces the sample Commission view ──────────────
do $$
declare
  co uuid := 'a0000000-0000-4000-8000-000000000001';
  fatma uuid := 'c0000000-0000-4000-8000-000000000004';
  omar  uuid := 'c0000000-0000-4000-8000-000000000002';
  kareem uuid := 'c0000000-0000-4000-8000-000000000003';
  d uuid;
begin
  if exists (select 1 from public.commissions) then return; end if;
  -- Skip the sample rows on a fresh project that has not been seeded yet:
  -- without this the whole file aborts on a foreign-key violation.
  if not exists (select 1 from public.companies where id = co) then
    raise notice 'village-crm: demo company % not present — skipping sample commissions', co;
    return;
  end if;
  if not exists (select 1 from public.profiles where id = fatma) then
    raise notice 'village-crm: demo profiles not present — skipping sample commissions';
    return;
  end if;

  update public.profiles set commission_target_egp = 900000 where id = fatma;

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Ashraf Hussein — IL Bosco City','Ashraf Hussein','IL Bosco City','Facebook',19000000,fatma,'2026-02-10');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,fatma,'percent',2,380000,'paid');

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Mona Adel — Bloomfields','Mona Adel','Bloomfields','Instagram',6500000,fatma,'2026-03-05');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,fatma,'percent',2,130000,'approved');

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Khaled Nabil — HAPTOWN','Khaled Nabil','HAPTOWN','Referral',9200000,fatma,'2026-04-01');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,fatma,'percent',2,184000,'pending');

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Heba Nabil — Aliva','Heba Nabil','Aliva','TikTok',5500000,fatma,'2026-05-01');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,fatma,'percent',2,110000,'forecast');

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Tarek Salah — The Valleys','Tarek Salah','The Valleys','Website',15500000,omar,'2026-03-20');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,omar,'percent',1,155000,'approved');

  d := gen_random_uuid();
  insert into public.deals(id,company_id,title,client_name,project,source,value_egp,sold_by,sold_at)
    values (d,co,'Youssef Tarek — Badya','Youssef Tarek','Badya','Google',7000000,kareem,'2026-02-18');
  insert into public.commissions(company_id,deal_id,profile_id,calc_type,rate,amount_egp,status)
    values (co,d,kareem,'percent',1.5,105000,'paid');
end $$;
