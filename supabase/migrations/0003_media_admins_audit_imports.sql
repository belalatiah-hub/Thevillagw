-- The Village Investment — content model, part 3 of 4: media, admins,
-- the audit trail, and the price-import batches.

-- ------------------------------------------------------------------ media
-- Split in two so a file can be attached in more than one place without being
-- stored twice. It already happens: one SODIC aerial fronts the developer
-- gallery and a feature card, and one render legitimately serves two unit types
-- when the client sheet says so.

-- SCHEMA SCOPING. This Supabase project already carries a different
-- application in `public` — the Village CRM's companies/profiles/leads tables,
-- including its own `units` and `audit_log`. Creating the CMS there would
-- collide with both. The content model therefore lives in its own `cms`
-- schema: nothing existing is renamed, moved or dropped, and the two systems
-- share one database without either being able to break the other.
create schema if not exists cms;
set search_path = cms, public;

create table media_assets (
  id         uuid primary key default gen_random_uuid(),
  path       text not null unique,        -- '/project-media/ogami/units/v1-ogami-0.webp'
  storage_key text,                       -- object key when it lives in Supabase Storage
  mime_type  text,
  width      integer check (width  is null or width  > 0),
  height     integer check (height is null or height > 0),
  bytes      bigint  check (bytes  is null or bytes  > 0),
  checksum   text,
  alt_en     text,
  alt_ar     text,
  caption_en text,
  caption_ar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger media_assets_touch before update on media_assets
  for each row execute function set_updated_at();

-- One row per placement. Real foreign keys rather than a polymorphic id, so a
-- deleted project takes its attachments with it and a link can never point at
-- a row that is not there.
create table media_links (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references media_assets(id) on delete cascade,
  role         media_role not null,
  sort_order   integer not null default 0,
  developer_id uuid references developers(id) on delete cascade,
  project_id   uuid references projects(id)   on delete cascade,
  unit_id      uuid references units(id)      on delete cascade,
  location_id  uuid references locations(id)  on delete cascade,
  created_at   timestamptz not null default now(),

  constraint media_links_exactly_one_owner check (
    (developer_id is not null)::int + (project_id is not null)::int +
    (unit_id      is not null)::int + (location_id is not null)::int = 1
  )
);

create index media_links_asset_idx     on media_links (asset_id);
create index media_links_developer_idx on media_links (developer_id, role, sort_order);
create index media_links_project_idx   on media_links (project_id,   role, sort_order);
create index media_links_unit_idx      on media_links (unit_id,      role, sort_order);
create index media_links_location_idx  on media_links (location_id,  role, sort_order);

-- An entity has at most one cover, one logo and one masterplan. Galleries and
-- floor plans are ordered lists, so those roles are left unconstrained.
create unique index media_links_one_project_cover on media_links (project_id, role)
  where project_id is not null and role in ('cover', 'logo', 'masterplan');
create unique index media_links_one_developer_cover on media_links (developer_id, role)
  where developer_id is not null and role in ('cover', 'logo', 'masterplan');
create unique index media_links_one_unit_cover on media_links (unit_id, role)
  where unit_id is not null and role = 'cover';

-- ----------------------------------------------------------------- admins
-- Rows are keyed to Supabase Auth users. No password, no hash and no secret is
-- stored here or anywhere in this repository: authentication happens in
-- auth.users, which this database exposes to nobody.
create table admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        admin_role not null default 'editor',
  is_active   boolean not null default true,
  last_seen_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger admins_touch before update on admins
  for each row execute function set_updated_at();

-- Used by every policy in part 4. `security definer` so the check itself is not
-- subject to the policies it is deciding, and the search path is pinned so the
-- function cannot be redirected by a caller-set search_path.
create or replace function is_active_admin() returns boolean
language sql stable security definer set search_path = cms, public, pg_temp as $$
  select exists (
    select 1 from admins
    where id = auth.uid() and is_active
  );
$$;

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = cms, public, pg_temp as $$
  select exists (
    select 1 from admins
    where id = auth.uid() and is_active and role = 'owner'
  );
$$;

create or replace function can_write() returns boolean
language sql stable security definer set search_path = cms, public, pg_temp as $$
  select exists (
    select 1 from admins
    where id = auth.uid() and is_active and role in ('owner', 'editor')
  );
$$;

-- -------------------------------------------------------------- audit log
-- Every write is recorded with who, when, what changed and both values. This is
-- the Review screen's only source, so it is append-only: no policy grants
-- update or delete on it, to anyone.
create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references admins(id) on delete set null,
  actor_email text,
  action      text not null,              -- create | update | delete | restore | publish | import
  entity_type text not null,              -- developer | project | unit | location | media | admin
  entity_id   uuid,
  entity_label text,                      -- human-readable at the time, e.g. 'Unit OG-01'
  field       text,                       -- set when a single field changed
  old_value   jsonb,
  new_value   jsonb,
  batch_id    uuid,                       -- groups the rows of one Excel import
  created_at  timestamptz not null default now()
);

create index audit_log_entity_idx  on audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_idx   on audit_log (actor_id, created_at desc);
create index audit_log_batch_idx   on audit_log (batch_id) where batch_id is not null;
create index audit_log_created_idx on audit_log (created_at desc);

-- ------------------------------------------------------- price imports
-- An upload becomes a batch in `pending` while the admin reads the preview.
-- Nothing touches `units` until the batch is applied, and applying it happens
-- inside one transaction so a failure halfway cannot leave prices half updated.
create table import_batches (
  id            uuid primary key default gen_random_uuid(),
  filename      text not null,
  file_checksum text,
  uploaded_by   uuid references admins(id) on delete set null,
  status        text not null default 'pending'
                check (status in ('pending', 'applied', 'cancelled', 'failed')),
  rows_total    integer not null default 0,
  rows_valid    integer not null default 0,
  rows_invalid  integer not null default 0,
  rows_applied  integer not null default 0,
  error_message text,
  created_at    timestamptz not null default now(),
  applied_at    timestamptz
);

create index import_batches_status_idx on import_batches (status, created_at desc);

create table import_rows (
  id          bigserial primary key,
  batch_id    uuid not null references import_batches(id) on delete cascade,
  row_number  integer not null,
  unit_code   text,
  unit_id     uuid references units(id) on delete set null,
  old_price   bigint,
  new_price   bigint,
  -- ok | unknown_code | duplicate_code | invalid_price | unchanged
  verdict     text not null,
  message     text
);

create index import_rows_batch_idx on import_rows (batch_id, row_number);
create index import_rows_verdict_idx on import_rows (batch_id, verdict);
