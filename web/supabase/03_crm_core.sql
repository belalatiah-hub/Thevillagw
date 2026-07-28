-- ============================================================================
-- Village CRM — 03: contact fields, real-estate hierarchy, and the tables the
-- Calls / WhatsApp / Distribution / Tasks modules need.
-- Run AFTER 01_schema.sql and 02_commissions.sql. Safe to re-run.
-- ============================================================================

-- ── 1. A real-estate CRM must be able to store a phone number ───────────────
-- The live `leads` table had no phone or email at all: no agent could call,
-- WhatsApp or email any lead, and duplicate detection was impossible.
alter table public.leads
  add column if not exists email            text,
  add column if not exists alt_phone        text,
  add column if not exists phone_normalized text,
  add column if not exists notes            text,
  add column if not exists last_contact_at  timestamptz,
  add column if not exists next_action_at   timestamptz;

-- Normalised phone for dedup: digits only, Egyptian local 01… -> 201…
create or replace function public.normalize_phone(p text)
returns text language sql immutable as $$
  select case
    when p is null or btrim(p) = '' then null
    else (
      with d as (select regexp_replace(p, '[^0-9]', '', 'g') as v)
      select case
        when v like '00%'  then substr(v, 3)
        when v like '01%' and length(v) = 11 then '2' || v
        else v
      end from d
    )
  end
$$;

create or replace function public.leads_set_phone_normalized()
returns trigger language plpgsql as $$
begin
  new.phone_normalized := public.normalize_phone(new.phone);
  return new;
end $$;

drop trigger if exists leads_phone_norm on public.leads;
create trigger leads_phone_norm before insert or update of phone on public.leads
  for each row execute function public.leads_set_phone_normalized();

update public.leads set phone = phone where phone is not null;  -- backfill

create index if not exists leads_phone_norm_idx on public.leads(company_id, phone_normalized);
create index if not exists leads_email_idx      on public.leads(company_id, lower(email));

-- ── 2. Developer -> Project -> Phase hierarchy ──────────────────────────────
-- `units` stored developer and project as repeated free text, so renaming a
-- developer meant a mass UPDATE and a typo silently forked it in two.
create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  slug text not null,
  logo_url text,
  about text,
  commission_pct numeric(5,2) check (commission_pct is null or commission_pct between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  developer_id uuid references public.developers(id) on delete set null,
  name text not null,
  slug text not null,
  city text,
  area text,
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  delivery_from date,
  master_plan_url text,
  cover_url text,
  about text,
  amenities text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, slug)
);
create index if not exists projects_dev_idx  on public.projects(company_id, developer_id);
create index if not exists projects_city_idx on public.projects(company_id, city);

create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  delivery_date date,
  sort int not null default 0
);
create index if not exists phases_project_idx on public.project_phases(project_id);

-- Link units to the hierarchy without breaking the existing free-text columns.
alter table public.units
  add column if not exists developer_id uuid references public.developers(id) on delete set null,
  add column if not exists project_id   uuid references public.projects(id)   on delete set null,
  add column if not exists phase_id     uuid references public.project_phases(id) on delete set null,
  add column if not exists floor        int,
  add column if not exists view         text,
  add column if not exists garden_m     int,
  add column if not exists roof_m       int,
  add column if not exists featured     boolean not null default false,
  add column if not exists exclusive    boolean not null default false,
  add column if not exists hot_deal     boolean not null default false;
create index if not exists units_project_idx on public.units(company_id, project_id);
create index if not exists units_status_idx  on public.units(company_id, status);

-- Backfill the hierarchy from the free text already in units.
insert into public.developers (company_id, name, slug)
select distinct u.company_id, u.developer, lower(regexp_replace(u.developer,'[^a-zA-Z0-9]+','-','g'))
from public.units u
where u.developer is not null and btrim(u.developer) <> ''
on conflict (company_id, slug) do nothing;

insert into public.projects (company_id, developer_id, name, slug, city)
select distinct u.company_id, d.id, u.project,
       lower(regexp_replace(u.project,'[^a-zA-Z0-9]+','-','g')), u.city
from public.units u
left join public.developers d
  on d.company_id = u.company_id
 and d.slug = lower(regexp_replace(u.developer,'[^a-zA-Z0-9]+','-','g'))
where u.project is not null and btrim(u.project) <> ''
on conflict (company_id, slug) do nothing;

update public.units u
set developer_id = d.id
from public.developers d
where u.developer_id is null and d.company_id = u.company_id
  and d.slug = lower(regexp_replace(u.developer,'[^a-zA-Z0-9]+','-','g'));

update public.units u
set project_id = p.id
from public.projects p
where u.project_id is null and p.company_id = u.company_id
  and p.slug = lower(regexp_replace(u.project,'[^a-zA-Z0-9]+','-','g'));

-- ── 3. Payment plans and media (how Egyptian brokerage actually sells) ──────
create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  unit_id    uuid references public.units(id)    on delete cascade,
  name text not null,
  down_payment_pct numeric(5,2) check (down_payment_pct between 0 and 100),
  years int check (years between 0 and 30),
  frequency text not null default 'quarterly'
    check (frequency in ('monthly','quarterly','biannual','annual')),
  maintenance_pct numeric(5,2),
  cash_discount_pct numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  constraint payment_plan_target check (project_id is not null or unit_id is not null)
);
create index if not exists plans_project_idx on public.payment_plans(company_id, project_id);

create table if not exists public.unit_media (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  unit_id    uuid references public.units(id)    on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null default 'image'
    check (kind in ('image','video','floor_plan','master_plan','tour_360','brochure')),
  url text not null,
  caption text,
  sort int not null default 0,
  constraint unit_media_target check (unit_id is not null or project_id is not null)
);
create index if not exists media_unit_idx    on public.unit_media(unit_id);
create index if not exists media_project_idx on public.unit_media(project_id);

-- ── 4. Activity modules the UI already has screens for ──────────────────────
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  direction text not null default 'outbound' check (direction in ('inbound','outbound')),
  status text not null default 'completed'
    check (status in ('completed','missed','no_answer','busy','failed')),
  outcome text,
  duration_sec int not null default 0 check (duration_sec >= 0),
  recording_url text,
  notes text,
  started_at timestamptz not null default now()
);
create index if not exists calls_company_idx on public.calls(company_id, started_at desc);
create index if not exists calls_agent_idx   on public.calls(company_id, agent_id);

create table if not exists public.wa_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  phone text not null,
  contact_name text,
  status text not null default 'open' check (status in ('open','pending','closed')),
  unread int not null default 0,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wa_conv_idx on public.wa_conversations(company_id, last_message_at desc);

create table if not exists public.wa_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid not null references public.wa_conversations(id) on delete cascade,
  direction text not null check (direction in ('in','out')),
  body text,
  media_url text,
  status text not null default 'sent' check (status in ('queued','sent','delivered','read','failed')),
  sent_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists wa_msg_idx on public.wa_messages(conversation_id, created_at);

create table if not exists public.distribution_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  strategy text not null default 'round_robin'
    check (strategy in ('round_robin','load_balanced','by_area','by_source','manual')),
  match_source text,
  match_area text,
  team_id uuid references public.teams(id) on delete set null,
  daily_cap int check (daily_cap is null or daily_cap > 0),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  assignee_id uuid references public.profiles(id) on delete set null,
  kind text not null default 'task' check (kind in ('task','call','meeting','follow_up','viewing')),
  title text not null,
  notes text,
  due_at timestamptz,
  done boolean not null default false,
  done_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists tasks_assignee_idx on public.tasks(company_id, assignee_id, done, due_at);
create index if not exists tasks_lead_idx     on public.tasks(lead_id);

-- ── 5. RLS for everything added above ───────────────────────────────────────
alter table public.developers         enable row level security;
alter table public.projects           enable row level security;
alter table public.project_phases     enable row level security;
alter table public.payment_plans      enable row level security;
alter table public.unit_media         enable row level security;
alter table public.calls              enable row level security;
alter table public.wa_conversations   enable row level security;
alter table public.wa_messages        enable row level security;
alter table public.distribution_rules enable row level security;
alter table public.tasks              enable row level security;

-- Catalogue data: everyone in the tenant reads; a specific permission writes.
do $$
declare t text; perm text;
begin
  for t, perm in
    select * from (values
      ('developers','developer:update'), ('projects','project:update'),
      ('project_phases','project:update'), ('payment_plans','unit:update'),
      ('unit_media','unit:update'), ('distribution_rules','distribution:update')
    ) as x(t, perm)
  loop
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format($f$create policy %I_read on public.%I for select to authenticated
                     using (company_id = public.current_company_id())$f$, t, t);
    execute format('drop policy if exists %I_write on public.%I', t, t);
    execute format($f$create policy %I_write on public.%I for all to authenticated
                     using (company_id = public.current_company_id() and public.has_perm(%L))
                     with check (company_id = public.current_company_id() and public.has_perm(%L))$f$,
                   t, t, perm, perm);
  end loop;
end $$;

-- Activity data follows the lead's own visibility, so an agent sees only calls,
-- chats and tasks attached to leads they are allowed to see.
drop policy if exists calls_read on public.calls;
create policy calls_read on public.calls for select to authenticated
  using (company_id = public.current_company_id()
         and (public.current_scope() = 'all'
              or agent_id = auth.uid()
              or lead_id in (select id from public.leads)));
drop policy if exists calls_write on public.calls;
create policy calls_write on public.calls for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('call:create'))
  with check (company_id = public.current_company_id() and public.has_perm('call:create'));

drop policy if exists wa_conv_read on public.wa_conversations;
create policy wa_conv_read on public.wa_conversations for select to authenticated
  using (company_id = public.current_company_id()
         and (public.current_scope() = 'all'
              or assignee_id = auth.uid()
              or lead_id in (select id from public.leads)));
drop policy if exists wa_conv_write on public.wa_conversations;
create policy wa_conv_write on public.wa_conversations for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('whatsapp:update'))
  with check (company_id = public.current_company_id() and public.has_perm('whatsapp:update'));

drop policy if exists wa_msg_read on public.wa_messages;
create policy wa_msg_read on public.wa_messages for select to authenticated
  using (company_id = public.current_company_id()
         and conversation_id in (select id from public.wa_conversations));
drop policy if exists wa_msg_write on public.wa_messages;
create policy wa_msg_write on public.wa_messages for all to authenticated
  using (company_id = public.current_company_id() and public.has_perm('whatsapp:create'))
  with check (company_id = public.current_company_id() and public.has_perm('whatsapp:create'));

drop policy if exists tasks_read on public.tasks;
create policy tasks_read on public.tasks for select to authenticated
  using (company_id = public.current_company_id()
         and (public.current_scope() = 'all'
              or assignee_id = auth.uid()
              or lead_id in (select id from public.leads)));
drop policy if exists tasks_write on public.tasks;
create policy tasks_write on public.tasks for all to authenticated
  using (company_id = public.current_company_id()
         and (assignee_id = auth.uid() or public.has_perm('lead:update')))
  with check (company_id = public.current_company_id());

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- ── 6. Integrity fixes flagged by the audit ─────────────────────────────────
-- A commission could point at another tenant's deal: make the tenant part of
-- the referenced key so Postgres enforces the pair.
do $$ begin
  alter table public.deals add constraint deals_id_company_uq unique (id, company_id);
exception when duplicate_table or duplicate_object then null; end $$;

do $$ begin
  alter table public.commissions
    add constraint commissions_rate_sane check (
      (calc_type = 'percent' and rate >= 0 and rate <= 100)
      or (calc_type in ('value','fixed') and rate >= 0)),
    add constraint commissions_amount_sane check (amount_egp >= 0);
exception when duplicate_object then null; when undefined_table then null; end $$;

-- One commission line per recipient per deal — blocks the double-submit that
-- would otherwise pay an agent twice with nothing to refuse it.
create unique index if not exists commissions_deal_profile_uq
  on public.commissions(deal_id, profile_id);
