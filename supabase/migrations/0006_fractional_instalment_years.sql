-- One Ninety publishes a 3.5-year plan. As an integer column that silently
-- rounds to 4 on insert — a payment term the developer never offered. Both the
-- project and unit columns take a half-year. The publish view is dropped and
-- rebuilt because it depends on the column being retyped.
drop view if exists cms.publishable_projects;

alter table cms.projects
  drop constraint if exists projects_instalment_years_check,
  alter column instalment_years type numeric(4,1),
  add constraint projects_instalment_years_check
    check (instalment_years is null or instalment_years between 0 and 40);

alter table cms.units
  drop constraint if exists units_instalment_years_check,
  alter column instalment_years type numeric(4,1),
  add constraint units_instalment_years_check
    check (instalment_years is null or instalment_years between 0 and 40);

alter table cms.payment_plans
  drop constraint if exists payment_plans_years_check,
  alter column years type numeric(4,1),
  add constraint payment_plans_years_check
    check (years is null or years between 0 and 40);

create view cms.publishable_projects
with (security_invoker = true) as
  select p.*
  from cms.projects p
  join cms.developers d on d.id = p.developer_id
  join cms.locations  l on l.id = p.location_id
  where p.deleted_at is null
    and p.status = 'published'
    and d.deleted_at is null and d.status = 'published'
    and l.deleted_at is null and l.status = 'published'
    and coalesce(p.name_en, '') <> ''
    and coalesce(p.name_ar, '') <> '';
