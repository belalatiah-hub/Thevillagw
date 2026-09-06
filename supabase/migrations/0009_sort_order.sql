-- Order is data, and it was being carried only by the source file.
--
-- The site lists areas east-to-coast-to-west rather than alphabetically,
-- developers in a curated order, and — the one that matters most — the units
-- of a project in the exact order of the client's price list, which the owner
-- asked for explicitly. None of that survived the move into Postgres: a query
-- with no ORDER BY returns rows in whatever order the heap gives them, so
-- rebuilding the site from the database would have quietly reshuffled every
-- price list.
--
-- `sort_order` records it. `locations` already had one; these three did not.

alter table cms.developers add column if not exists sort_order integer not null default 0;
alter table cms.projects   add column if not exists sort_order integer not null default 0;
alter table cms.units      add column if not exists sort_order integer not null default 0;

create index if not exists developers_sort_idx on cms.developers (sort_order);
create index if not exists projects_sort_idx   on cms.projects (sort_order);
create index if not exists units_sort_idx      on cms.units (project_id, sort_order);

comment on column cms.units.sort_order is
  'Position in the developer''s price list. The client sheet''s order, preserved.';

-- The values themselves are set by 0009b, which is generated from the site so
-- the numbers are the order the site publishes today rather than a guess.
