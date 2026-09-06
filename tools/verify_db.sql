-- The database's own answer to tools/verify_db.py. Same fields, same order,
-- same separators, so a matching md5 means every migrated value is identical
-- to what the site publishes today — not merely that the row counts line up.
-- `collate "C"` is what makes the two agree: Postgres would otherwise order the
-- rows by the database's locale, while Python sorts by code point. The numeric
-- columns are trim_scale'd because their fixed scale would render 10 as 10.00.
with
locations as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select l.slug || '~' || l.level::text || '~' || coalesce(p.slug, '') || '~'
        || l.name_en || '~' || l.name_ar
        || case when l.level = 'area'
                then '~' || coalesce(l.blurb_en, '') || '~' || coalesce(l.blurb_ar, '')
                     || '~' || l.sort_order else '' end as x
    from cms.locations l left join cms.locations p on p.id = l.parent_id) t),
developers as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~', slug, name_en, name_ar, coalesce(tagline_en,''), coalesce(tagline_ar,''),
                     coalesce(description_en,''), coalesce(description_ar,''),
                     coalesce(areas_line_en,''), coalesce(areas_line_ar,''),
                     coalesce(founded_year::text,''), coalesce(brand_colour,'')) as x
    from cms.developers) t),
amenities as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~', token, coalesce(name_en,''), coalesce(name_ar,''), coalesce(icon,'')) as x
    from cms.amenities) t),
projects as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~', p.slug, p.name_en, coalesce(p.name_ar,''), d.slug, l.slug, p.stage::text,
                     coalesce(p.price_from::text,''), coalesce(trim_scale(p.down_payment_pct)::text,''),
                     coalesce(trim_scale(p.instalment_years)::text,''), coalesce(p.delivery_label,''),
                     coalesce(p.unit_types_en,''), coalesce(p.unit_types_ar,''),
                     coalesce(array_to_string(p.tags_en,'^'),''),
                     coalesce(array_to_string(p.tags_ar,'^'),''),
                     coalesce(p.description_en,''), coalesce(p.description_ar,''),
                     coalesce(p.finishing_en,''), coalesce(p.finishing_ar,'')) as x
    from cms.projects p
    join cms.developers d on d.id = p.developer_id
    join cms.locations  l on l.id = p.location_id) t),
units as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~', u.unit_code, p.slug, coalesce(u.unit_type_en,''),
                     coalesce(u.label_en,''), coalesce(u.label_ar,''),
                     coalesce(u.bedrooms::text,''), coalesce(u.bathrooms::text,''),
                     coalesce(trim_scale(u.bua)::text,''), coalesce(trim_scale(u.bua_to)::text,''),
                     coalesce(u.price::text,''), coalesce(trim_scale(u.down_payment_pct)::text,''),
                     coalesce(trim_scale(u.instalment_years)::text,''), coalesce(u.delivery_label,''),
                     coalesce(u.floor,''), u.availability::text) as x
    from cms.units u join cms.projects p on p.id = u.project_id) t),
media_assets as (
  select md5(string_agg(path, '|' order by path collate "C")) h, count(*) n from cms.media_assets),
media_links as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~',
             case when ml.unit_id is not null then 'unit'
                  when ml.project_id is not null then 'project' else 'developer' end,
             lower(coalesce(u.unit_code, pr.slug, dv.slug)),
             ml.role::text, ml.sort_order::text, a.path) as x
    from cms.media_links ml
    join cms.media_assets a on a.id = ml.asset_id
    left join cms.units u      on u.id  = ml.unit_id
    left join cms.projects pr  on pr.id = ml.project_id
    left join cms.developers dv on dv.id = ml.developer_id) t),
project_amenities as (
  select md5(string_agg(x, '|' order by x collate "C")) h, count(*) n from (
    select concat_ws('~', p.slug, a.token, pa.sort_order::text) as x
    from cms.project_amenities pa
    join cms.projects p on p.id = pa.project_id
    join cms.amenities a on a.id = pa.amenity_id) t)
select 'amenities' t, n, h from amenities
union all select 'developers', n, h from developers
union all select 'locations', n, h from locations
union all select 'media_assets', n, h from media_assets
union all select 'media_links', n, h from media_links
union all select 'project_amenities', n, h from project_amenities
union all select 'projects', n, h from projects
union all select 'units', n, h from units
order by 1;
