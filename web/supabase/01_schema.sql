-- ============================================================================
-- Village CRM — base schema, RLS and helper functions.
-- Run FIRST on a new Supabase project, then 02_commissions.sql, then 03_crm_core.sql.
--
-- This file is the source of truth for the live database. Until it existed the
-- production schema lived only inside one Supabase project: it could not be
-- rebuilt, staged, reviewed or restored from this repository.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── core tenancy ────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  is_system boolean not null default true,
  scope text not null default 'own' check (scope in ('own','team','all')),
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  leader_id uuid,
  created_at timestamptz not null default now()
);

-- profiles.id == auth.users.id
create table if not exists public.profiles (
  id uuid primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  email text not null,
  role_id uuid references public.roles(id),
  team_id uuid references public.teams(id),
  manager_id uuid references public.profiles(id),
  department text,
  position text,
  scope text not null default 'own' check (scope in ('own','team','all')),
  active boolean not null default true,
  color text default '#7c6fd6',
  created_at timestamptz not null default now()
);

do $$ begin
  alter table public.teams add constraint teams_leader_fk
    foreign key (leader_id) references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ── inventory ───────────────────────────────────────────────────────────────
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  project text not null,
  developer text,
  city text,
  type text,
  beds int default 0,
  baths int default 0,
  area_m int default 0,
  price_m numeric(8,2) default 0,
  delivery text,
  finish text,
  status text not null default 'available' check (status in ('available','reserved','sold')),
  created_at timestamptz not null default now()
);

-- ── leads & activity ────────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  phone text,
  source text,
  status text not null default 'Interested',
  stage text,
  score int not null default 60 check (score between 0 and 100),
  budget_m numeric(8,2) default 0 check (budget_m >= 0),
  area text,
  owner_id uuid references public.profiles(id) on delete set null,
  dup boolean not null default false,
  resale boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists leads_company_owner_idx on public.leads(company_id, owner_id);
create index if not exists leads_status_idx        on public.leads(company_id, status);
create index if not exists leads_created_idx       on public.leads(company_id, created_at desc);

create table if not exists public.lead_actions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  next_action text not null,
  stage_name text,
  due_at timestamptz,
  comment text,
  rating int check (rating between 1 and 5),
  status text not null default 'PLANNED' check (status in ('PLANNED','DONE')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists lead_actions_lead_idx on public.lead_actions(lead_id);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists feedback_lead_idx on public.feedback(lead_id);

-- ── configuration, audit, notifications ─────────────────────────────────────
create table if not exists public.lookups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null,
  value text not null,
  color text,
  meta jsonb not null default '{}'::jsonb,
  sort int not null default 0
);
create index if not exists lookups_type_idx on public.lookups(company_id, type, sort);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  action text not null,
  verb text,
  entity text,
  actor_id uuid references public.profiles(id) on delete set null,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists audit_company_idx on public.audit_log(company_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notif_profile_idx on public.notifications(profile_id, read);

-- ============================================================================
-- Helper functions. SECURITY DEFINER so RLS policies can call them without
-- recursing through the very policies they are evaluating.
-- ============================================================================
create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_scope()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(scope,'own') from public.profiles where id = auth.uid()
$$;

create or replace function public.has_perm(perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and (r.permissions @> array['*'] or r.permissions @> array[perm])
  )
$$;

create or replace function public.visible_owner_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  with me as (select id, company_id, team_id, scope from public.profiles where id = auth.uid())
  select p.id from public.profiles p, me
  where p.company_id = me.company_id and (
       me.scope = 'all'
    or (me.scope = 'team' and (p.team_id = me.team_id or p.id = me.id or p.manager_id = me.id))
    or (me.scope = 'own' and p.id = me.id)
  )
$$;

-- These run inside policies; they must not be callable anonymously over RPC.
revoke execute on function public.current_company_id()  from public, anon;
revoke execute on function public.current_scope()       from public, anon;
revoke execute on function public.has_perm(text)        from public, anon;
revoke execute on function public.visible_owner_ids()   from public, anon;
grant  execute on function public.current_company_id()  to authenticated;
grant  execute on function public.current_scope()       to authenticated;
grant  execute on function public.has_perm(text)        to authenticated;
grant  execute on function public.visible_owner_ids()   to authenticated;

-- ============================================================================
-- Row-Level Security — the actual permission engine.
-- ============================================================================
alter table public.companies     enable row level security;
alter table public.roles         enable row level security;
alter table public.teams         enable row level security;
alter table public.profiles      enable row level security;
alter table public.units         enable row level security;
alter table public.leads         enable row level security;
alter table public.lead_actions  enable row level security;
alter table public.feedback      enable row level security;
alter table public.lookups       enable row level security;
alter table public.audit_log     enable row level security;
alter table public.notifications enable row level security;

drop policy if exists company_read on public.companies;
create policy company_read on public.companies for select to authenticated
  using (id = public.current_company_id());
drop policy if exists company_update on public.companies;
create policy company_update on public.companies for update to authenticated
  using (id = public.current_company_id() and public.has_perm('settings:update'));

drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles for select to authenticated
  using (company_id = public.current_company_id());
drop policy if exists roles_write on public.roles;
create policy roles_write on public.roles for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('role:update'))
  with check (company_id = public.current_company_id() and public.has_perm('role:update'));

drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams for select to authenticated
  using (company_id = public.current_company_id());
drop policy if exists teams_write on public.teams;
create policy teams_write on public.teams for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('team:create'))
  with check (company_id = public.current_company_id() and public.has_perm('team:create'));

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (company_id = public.current_company_id());
-- A user may edit their own profile but MUST NOT be able to escalate: role_id,
-- scope and company_id are frozen unless they hold user:update.
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and company_id = public.current_company_id()
    and (
      public.has_perm('user:update')
      or (
        role_id is not distinct from (select role_id from public.profiles p2 where p2.id = auth.uid())
        and scope  is not distinct from (select scope  from public.profiles p2 where p2.id = auth.uid())
      )
    )
  );
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('user:update'))
  with check (company_id = public.current_company_id() and public.has_perm('user:update'));

drop policy if exists units_read on public.units;
create policy units_read on public.units for select to authenticated
  using (company_id = public.current_company_id());
drop policy if exists units_write on public.units;
create policy units_write on public.units for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('unit:update'))
  with check (company_id = public.current_company_id() and public.has_perm('unit:update'));

-- Leads: the own / team / all data scope.
drop policy if exists leads_read on public.leads;
create policy leads_read on public.leads for select to authenticated
  using (company_id = public.current_company_id()
         and (public.current_scope() = 'all' or owner_id in (select public.visible_owner_ids())));
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert to authenticated
  with check (company_id = public.current_company_id() and public.has_perm('lead:create'));
drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update to authenticated
  using (company_id = public.current_company_id() and public.has_perm('lead:update')
         and (public.current_scope() = 'all' or owner_id in (select public.visible_owner_ids())))
  with check (company_id = public.current_company_id());
drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads for delete to authenticated
  using (company_id = public.current_company_id() and public.has_perm('lead:delete'));

drop policy if exists actions_read on public.lead_actions;
create policy actions_read on public.lead_actions for select to authenticated
  using (company_id = public.current_company_id() and lead_id in (select id from public.leads));
drop policy if exists actions_insert on public.lead_actions;
create policy actions_insert on public.lead_actions for insert to authenticated
  with check (company_id = public.current_company_id() and public.has_perm('lead:update'));
drop policy if exists actions_update on public.lead_actions;
create policy actions_update on public.lead_actions for update to authenticated
  using (company_id = public.current_company_id() and public.has_perm('lead:update'));

drop policy if exists feedback_read on public.feedback;
create policy feedback_read on public.feedback for select to authenticated
  using (company_id = public.current_company_id() and lead_id in (select id from public.leads));
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to authenticated
  with check (company_id = public.current_company_id() and public.has_perm('lead:update'));

drop policy if exists lookups_read on public.lookups;
create policy lookups_read on public.lookups for select to authenticated
  using (company_id = public.current_company_id());
drop policy if exists lookups_write on public.lookups;
create policy lookups_write on public.lookups for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('settings:update'))
  with check (company_id = public.current_company_id() and public.has_perm('settings:update'));

drop policy if exists audit_read on public.audit_log;
create policy audit_read on public.audit_log for select to authenticated
  using (company_id = public.current_company_id() and public.has_perm('audit:read'));
drop policy if exists audit_insert on public.audit_log;
create policy audit_insert on public.audit_log for insert to authenticated
  with check (company_id = public.current_company_id());

drop policy if exists notif_read on public.notifications;
create policy notif_read on public.notifications for select to authenticated
  using (profile_id = auth.uid());
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
