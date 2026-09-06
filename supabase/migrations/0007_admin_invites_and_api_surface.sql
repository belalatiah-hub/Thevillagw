-- Who is allowed in, and how the browser reaches the data.
--
-- Nobody types a role into the admin app. An owner records an invitation here
-- against an email address; when that person completes Supabase Auth sign-up,
-- a trigger turns the invitation into a `cms.admins` row with exactly the role
-- that was recorded. Until then they are an authenticated user with no admin
-- row, and every RLS policy on every content table refuses them.
--
-- No password, hash or secret is stored here or anywhere in the repository.

create extension if not exists citext with schema extensions;

create table if not exists cms.admin_invites (
  email        extensions.citext primary key,
  role         cms.admin_role not null default 'viewer',
  full_name    text,
  invited_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  accepted_by  uuid references auth.users(id) on delete set null
);

comment on table cms.admin_invites is
  'Pending admin access. A row here is a promise of a role, redeemed by signing up.';

-- The redemption. `security definer` because the person signing up is not yet
-- an admin and so cannot write to cms.admins under their own privileges; the
-- search_path is pinned so the body cannot be redirected by a caller's path.
create or replace function cms.accept_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = cms, public, pg_temp
as $$
declare
  inv cms.admin_invites%rowtype;
begin
  select * into inv from cms.admin_invites
   where email = new.email and accepted_at is null;
  if not found then
    return new;             -- an ordinary signup; no admin row, no access
  end if;

  insert into cms.admins (id, email, full_name, role, is_active)
  values (new.id, new.email, coalesce(inv.full_name, new.raw_user_meta_data->>'full_name'),
          inv.role, true)
  on conflict (id) do update
    set role = excluded.role, is_active = true, email = excluded.email;

  update cms.admin_invites
     set accepted_at = now(), accepted_by = new.id
   where email = inv.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
  after insert on auth.users
  for each row execute function cms.accept_admin_invite();

-- Only an owner may hand out access, and only an owner may read who has been
-- offered it. `anon` is not granted the table at all.
alter table cms.admin_invites enable row level security;

drop policy if exists admin_invites_read on cms.admin_invites;
create policy admin_invites_read on cms.admin_invites
  for select to authenticated using (cms.is_owner());

drop policy if exists admin_invites_write on cms.admin_invites;
create policy admin_invites_write on cms.admin_invites
  for all to authenticated using (cms.is_owner()) with check (cms.is_owner());

grant select, insert, update, delete on cms.admin_invites to authenticated;

-- The first owner. Recorded, not created: the account itself is made through
-- Supabase Auth, and the password never passes through this repository.
insert into cms.admin_invites (email, role, full_name)
values ('belalatiah5@gmail.com', 'owner', 'Belal Atiah')
on conflict (email) do update set role = 'owner';

-- --------------------------------------------------------------- the API
-- PostgREST serves only the schemas the project exposes, and `cms` is not one
-- of them by default. Adding it here keeps the setting with the schema that
-- needs it instead of leaving it as an undocumented dashboard click.
do $$
begin
  execute 'alter role authenticator set pgrst.db_schemas = ' ||
          quote_literal('public, graphql_public, cms');
exception when insufficient_privilege then
  raise notice 'could not set pgrst.db_schemas; add cms under Settings -> API -> Exposed schemas';
end $$;

notify pgrst, 'reload config';
