-- The Village Investment — content model, part 2 of 4: projects and units.

-- -------------------------------------------------------------------- projects

-- SCHEMA SCOPING. This Supabase project already carries a different
-- application in `public` — the Village CRM's companies/profiles/leads tables,
-- including its own `units` and `audit_log`. Creating the CMS there would
-- collide with both. The content model therefore lives in its own `cms`
-- schema: nothing existing is renamed, moved or dropped, and the two systems
-- share one database without either being able to break the other.
create schema if not exists cms;
set search_path = cms, public;

create table projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (is_slug(slug)),
  name_en       text not null,
  name_ar       text not null,
  developer_id  uuid not null references developers(id) on delete restrict,
  location_id   uuid not null references locations(id)  on delete restrict,

  stage         project_stage not null default 'primary',
  short_description_en text,
  short_description_ar text,
  description_en       text,
  description_ar       text,
  address       text,
  latitude      numeric(9,6) check (latitude between -90 and 90),
  longitude     numeric(9,6) check (longitude between -180 and 180),

  -- headline commercial terms. `price_from` is the entry price shown on the
  -- card; a build-time check keeps it equal to the cheapest published unit so
  -- the card and the price list can never drift apart.
  price_from        bigint check (price_from is null or price_from > 0),
  price_to          bigint check (price_to   is null or price_to   > 0),
  down_payment_pct  numeric(5,2) check (down_payment_pct between 0 and 100),
  instalment_years  integer check (instalment_years between 0 and 40),
  delivery_label    text,
  construction_status text,
  total_land_area   numeric(14,2) check (total_land_area is null or total_land_area > 0),
  finishing_en      text,
  finishing_ar      text,
  -- the "Unit types" chip row. Left null when no price list has arrived yet:
  -- a project awaiting its sheet must not claim a unit mix it cannot show.
  unit_types_en     text,
  unit_types_ar     text,
  tags_en           text[] not null default '{}',
  tags_ar           text[] not null default '{}',
  -- room for fields a future brochure introduces, without a schema rebuild
  attrs             jsonb not null default '{}'::jsonb,

  seo_title_en       text,
  seo_title_ar       text,
  seo_description_en text,
  seo_description_ar text,
  seo_keywords       text[],
  canonical_url      text,
  og_title_en        text,
  og_title_ar        text,
  og_description_en  text,
  og_description_ar  text,
  og_image           text,
  noindex     boolean not null default false,
  nofollow    boolean not null default false,

  status      entity_status not null default 'draft',
  featured    boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,

  constraint projects_price_range_ordered
    check (price_to is null or price_from is null or price_to >= price_from)
);

create index projects_developer_idx on projects (developer_id) where deleted_at is null;
create index projects_location_idx  on projects (location_id)  where deleted_at is null;
create index projects_status_idx    on projects (status)       where deleted_at is null;
create index projects_price_idx     on projects (price_from)   where deleted_at is null;
create index projects_attrs_idx     on projects using gin (attrs);
create trigger projects_touch before update on projects
  for each row execute function set_updated_at();

-- Amenities a project claims. Kept as a join so the same token means the same
-- thing everywhere, and so "which projects have a private beach" is one query.
create table project_amenities (
  project_id  uuid not null references projects(id)  on delete cascade,
  amenity_id  uuid not null references amenities(id) on delete restrict,
  sort_order  integer not null default 0,
  primary key (project_id, amenity_id)
);

create index project_amenities_amenity_idx on project_amenities (amenity_id);

-- Nearby landmarks, printed on the project page. Distances are only stored when
-- the developer published them; the site never invents a drive time.
create table project_nearby (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name_en     text not null,
  name_ar     text not null,
  distance_label_en text,
  distance_label_ar text,
  sort_order  integer not null default 0
);

create index project_nearby_project_idx on project_nearby (project_id);

-- Payment plans, one row per published option.
create table payment_plans (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name_en     text,
  name_ar     text,
  down_payment_pct numeric(5,2) check (down_payment_pct between 0 and 100),
  years            integer check (years between 0 and 40),
  instalment_frequency text,
  notes_en    text,
  notes_ar    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index payment_plans_project_idx on payment_plans (project_id);

-- ----------------------------------------------------------------------- units
-- Units are created from the dashboard only. The Excel importer may update the
-- price of a row that already exists here and may never insert one — enforced
-- by `import_units_price_only` in part 4, not by convention.
create table units (
  id            uuid primary key default gen_random_uuid(),
  -- the public identifier: /en/units/<lower(unit_code)>/ and the key the price
  -- sheet matches on. Unique regardless of case so "OG-01" and "og-01" can
  -- never become two rows fighting over one URL.
  unit_code     text not null check (unit_code ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'),
  project_id    uuid not null references projects(id) on delete restrict,

  unit_type_en  text not null,
  unit_type_ar  text,
  -- the sheet's finer wording where it is narrower than the site's vocabulary
  label_en      text,
  label_ar      text,
  building      text,
  phase         text,
  floor         text,
  view_en       text,
  view_ar       text,
  orientation   text,

  bedrooms      smallint check (bedrooms  between 0 and 20),
  bathrooms     smallint check (bathrooms between 0 and 20),
  -- built-up area. `area_to` carries the top of a published band so a range is
  -- shown as published instead of being rounded down to its smallest number.
  bua           numeric(10,2) check (bua is null or bua > 0),
  bua_to        numeric(10,2) check (bua_to is null or bua_to > 0),
  land_area     numeric(10,2),
  garden_area   numeric(10,2),
  terrace_area  numeric(10,2),
  roof_area     numeric(10,2),

  finishing_en  text,
  finishing_ar  text,
  furnishing_en text,
  furnishing_ar text,
  has_ac        boolean,
  kitchen_en    text,
  kitchen_ar    text,
  garage        text,

  price             bigint check (price is null or price > 0),
  down_payment_pct  numeric(5,2) check (down_payment_pct between 0 and 100),
  instalment_years  integer check (instalment_years between 0 and 40),
  instalment_frequency text,
  maintenance_fee   bigint check (maintenance_fee is null or maintenance_fee >= 0),
  club_fee          bigint check (club_fee is null or club_fee >= 0),
  delivery_label    text,

  availability  unit_availability not null default 'available',
  featured      boolean not null default false,
  description_en text,
  description_ar text,
  attrs         jsonb not null default '{}'::jsonb,

  status      entity_status not null default 'draft',
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,

  constraint units_area_band_ordered
    check (bua_to is null or bua is null or bua_to >= bua)
);

-- One live unit per code. A deleted row keeps its code out of the way so the
-- URL it used to own is not silently handed to a different home.
create unique index units_code_unique on units (lower(unit_code)) where deleted_at is null;
create index units_project_idx  on units (project_id)   where deleted_at is null;
create index units_price_idx    on units (price)        where deleted_at is null;
create index units_bedrooms_idx on units (bedrooms)     where deleted_at is null;
create index units_bua_idx      on units (bua)          where deleted_at is null;
create index units_avail_idx    on units (availability) where deleted_at is null;
create index units_status_idx   on units (status)       where deleted_at is null;
create index units_attrs_idx    on units using gin (attrs);
-- the finder's commonest query: available units of a type in a price band
create index units_search_idx on units (project_id, availability, price)
  where deleted_at is null and status = 'published';

create trigger units_touch before update on units
  for each row execute function set_updated_at();
