-- The Village Investment — CMS content model, part 1 of 5:
-- shared types, the location hierarchy, developers, and the amenity vocabulary.
--
-- SCHEMA SCOPING. This Supabase project already carries a different application
-- in `public` — the Village CRM's companies/profiles/leads tables, including
-- its own `units` and `audit_log`. Creating the CMS there would collide with
-- both. The content model therefore lives in its own `cms` schema: nothing
-- existing is renamed, moved or dropped, and the two systems share one database
-- without either being able to break the other.
--
-- The site is published statically: the public pages never query this database.
-- It is the editing system of record, and the build reads from it to regenerate
-- index.html. That is why row-level security (part 4) denies anon everything —
-- nothing anonymous ever needs to read a row.
--
-- Every slug already appears in a live, indexed URL and must not be rewritten
-- casually: /en/areas/<slug>/, /en/developers/<slug>/, /en/projects/<slug>/ and
-- /en/units/<unit_code>/ are all in the sitemap.

create schema if not exists cms;
set search_path = cms, public;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- shared types
create type entity_status     as enum ('draft', 'published', 'archived');
create type location_level    as enum ('country', 'governorate', 'city', 'area', 'subarea');
create type project_stage     as enum ('launch', 'primary', 'ready');
create type unit_availability as enum ('available', 'limited', 'reserved', 'sold', 'to-confirm');
create type media_role        as enum ('cover', 'gallery', 'masterplan', 'floorplan',
                                       'location', 'logo', 'brochure', 'hero', 'feature');
create type admin_role        as enum ('owner', 'editor', 'viewer');

-- `updated_at` is maintained by the database rather than by each caller, so an
-- edit made through SQL, the dashboard or the importer all stamp it the same way.
create or replace function cms.set_updated_at() returns trigger
language plpgsql set search_path = cms, public, pg_temp as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Slugs are the public URL. Rejecting anything but lowercase words joined by
-- single hyphens here stops a bad slug reaching the sitemap in the first place.
create or replace function cms.is_slug(s text) returns boolean
language sql immutable set search_path = cms, public, pg_temp as $$
  select s ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
$$;

-- ------------------------------------------------------------------- locations
-- One self-referencing tree covers country → governorate → city → area →
-- subarea, so an area can be reused by any number of projects instead of being
-- retyped as free text on each one.
create table cms.locations (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references cms.locations(id) on delete restrict,
  level       cms.location_level not null,
  slug        text not null unique check (cms.is_slug(slug)),
  name_en     text not null,
  name_ar     text not null,
  blurb_en    text,
  blurb_ar    text,
  latitude    numeric(9,6) check (latitude between -90 and 90),
  longitude   numeric(9,6) check (longitude between -180 and 180),
  map_url     text,
  seo_title_en        text,
  seo_title_ar        text,
  seo_description_en  text,
  seo_description_ar  text,
  canonical_url       text,
  og_image            text,
  noindex     boolean not null default false,
  nofollow    boolean not null default false,
  status      cms.entity_status not null default 'published',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  -- a country sits at the root; everything below it must name its parent
  constraint locations_root_is_country
    check ((parent_id is null) = (level = 'country'))
);

create index locations_parent_idx on cms.locations (parent_id) where deleted_at is null;
create index locations_level_idx  on cms.locations (level)     where deleted_at is null;
create trigger locations_touch before update on cms.locations
  for each row execute function cms.set_updated_at();

-- A location may not be its own ancestor. Enforced on write because a cycle
-- makes every breadcrumb and every sitemap walk recurse forever.
create or replace function cms.locations_no_cycle() returns trigger
language plpgsql set search_path = cms, public, pg_temp as $$
declare
  hop uuid := new.parent_id;
  depth int := 0;
begin
  while hop is not null loop
    if hop = new.id then
      raise exception 'location % would become its own ancestor', new.id;
    end if;
    depth := depth + 1;
    if depth > 10 then
      raise exception 'location hierarchy deeper than 10 levels';
    end if;
    select parent_id into hop from cms.locations where id = hop;
  end loop;
  return new;
end;
$$;

create trigger locations_check_cycle before insert or update of parent_id on cms.locations
  for each row execute function cms.locations_no_cycle();

-- ------------------------------------------------------------------ developers
create table cms.developers (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (cms.is_slug(slug)),
  name_en     text not null,
  name_ar     text not null,
  tagline_en  text,
  tagline_ar  text,
  description_en text,
  description_ar text,
  -- the descriptive footprint line shown on the card ("New Cairo · Sheikh Zayed")
  areas_line_en  text,
  areas_line_ar  text,
  founded_year   integer check (founded_year between 1800 and 2100),
  brand_colour   text check (brand_colour is null or brand_colour ~ '^#[0-9a-fA-F]{6}$'),
  website        text,
  contact_phone  text,
  contact_email  text,
  seo_title_en       text,
  seo_title_ar       text,
  seo_description_en text,
  seo_description_ar text,
  canonical_url      text,
  og_image           text,
  noindex     boolean not null default false,
  nofollow    boolean not null default false,
  status      cms.entity_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index developers_status_idx on cms.developers (status) where deleted_at is null;
create trigger developers_touch before update on cms.developers
  for each row execute function cms.set_updated_at();

-- ------------------------------------------------------------------- amenities
-- A closed vocabulary: every token has to resolve to an icon the site actually
-- ships, or the tile renders blank. Projects reference these rather than storing
-- free text, so renaming an amenity renames it everywhere at once.
create table cms.amenities (
  id        uuid primary key default gen_random_uuid(),
  token     text not null unique check (token ~ '^[a-z0-9_]+$'),
  name_en   text not null,
  name_ar   text not null,
  icon      text not null,
  category  text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger amenities_touch before update on cms.amenities
  for each row execute function cms.set_updated_at();
