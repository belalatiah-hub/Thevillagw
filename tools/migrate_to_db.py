#!/usr/bin/env python3
"""Turn the site's JavaScript content model into SQL for the `cms` schema.

The data has only ever existed as JavaScript literals inside src/tpl_script2*.html.
`node tools/domtest.cjs --dump-data` runs the shipped bundle and prints the whole
model as JSON — the literals reference shared path and amenity variables, so they
cannot be parsed out of the source and have to be read after the bundle has run.

This reads that JSON and writes one .sql file per table into supabase/seed/.
Every statement is idempotent (`on conflict do update`), so a re-run corrects
drift instead of duplicating rows.

    node tools/domtest.cjs --dump-data > /tmp/site_data.json
    python3 tools/migrate_to_db.py /tmp/site_data.json
"""
import json
import os
import re
import sys

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'seed')

# The nine areas the site already publishes, placed under the governorate they
# actually sit in. Slugs are untouched: each one is a live, indexed URL.
GOVERNORATE = {
    'newcairo':        ('cairo',   'Cairo',    'القاهرة'),
    'fifthsettlement': ('cairo',   'Cairo',    'القاهرة'),
    'capital':         ('cairo',   'Cairo',    'القاهرة'),
    'mostakbal':       ('cairo',   'Cairo',    'القاهرة'),
    'zayed':           ('giza',    'Giza',     'الجيزة'),
    'october':         ('giza',    'Giza',     'الجيزة'),
    'sahel':           ('matrouh', 'Matrouh',  'مطروح'),
    'raselhekma':      ('matrouh', 'Matrouh',  'مطروح'),
    'sokhna':          ('suez',    'Suez',     'السويس'),
}


def q(v):
    """A SQL literal. None becomes NULL; everything else is quoted text."""
    if v is None or v == '':
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def arr(items):
    """A text[] literal."""
    if not items:
        return "'{}'"
    inner = ','.join('"' + str(i).replace('\\', '\\\\').replace('"', '\\"') + '"' for i in items)
    return "'{" + inner + "}'"


def L(o, lang, default=None):
    """Pull one language out of the site's {en, ar} pairs."""
    if o is None:
        return default
    if isinstance(o, str):
        return o
    return o.get(lang) or default


def write(name, sql):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(sql)
    print('%-28s %6d bytes' % (name, len(sql)))


def build_locations(d):
    rows = ["-- Egypt, its governorates, and the nine areas the site publishes.",
            "insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order) values"]
    rows.append("  ('egypt', 'country', null, 'Egypt', 'مصر', null, null, 0)")
    rows.append("on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;")
    sql = ['\n'.join(rows), '']

    govs = {}
    for a in d['AREAS']:
        slug, name_en, name_ar = GOVERNORATE[a['key']]
        govs[slug] = (name_en, name_ar)
    for slug, (en, ar) in sorted(govs.items()):
        sql.append(
            "insert into cms.locations (slug, level, parent_id, name_en, name_ar)\n"
            "select %s, 'governorate', id, %s, %s from cms.locations where slug = 'egypt'\n"
            "on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;"
            % (q(slug), q(en), q(ar)))
    sql.append('')

    for i, a in enumerate(d['AREAS']):
        gov = GOVERNORATE[a['key']][0]
        sql.append(
            "insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)\n"
            "select %s, 'area', id, %s, %s, %s, %s, %d from cms.locations where slug = %s\n"
            "on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,\n"
            "  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;"
            % (q(a['key']), q(L(a['name'], 'en')), q(L(a['name'], 'ar')),
               q(L(a.get('blurb'), 'en')), q(L(a.get('blurb'), 'ar')), i, q(gov)))
    write('01_locations.sql', '\n'.join(sql) + '\n')


def build_developers(d):
    rows = []
    for dev in d['DEVELOPERS']:
        rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)" % (
            q(dev['key']), q(L(dev['name'], 'en')), q(L(dev['name'], 'ar')),
            q(L(dev.get('tagline'), 'en')), q(L(dev.get('tagline'), 'ar')),
            q(L(dev.get('desc'), 'en')), q(L(dev.get('desc'), 'ar')),
            q(L(dev.get('areas'), 'en')), q(L(dev.get('areas'), 'ar')),
            q(dev.get('since')), q(dev.get('c1'))))
    write('02_developers.sql',
          "-- 27 developers, exactly as the site lists them today.\n"
          "insert into cms.developers (slug, name_en, name_ar, tagline_en, tagline_ar,\n"
          "  description_en, description_ar, areas_line_en, areas_line_ar, founded_year,\n"
          "  brand_colour, status)\n"
          "select v.*, 'published' from (values\n" + ',\n'.join('  ' + r for r in rows) +
          "\n) as v(slug, name_en, name_ar, tagline_en, tagline_ar, description_en,\n"
          "       description_ar, areas_line_en, areas_line_ar, founded_year, brand_colour)\n"
          "on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,\n"
          "  tagline_en = excluded.tagline_en, tagline_ar = excluded.tagline_ar,\n"
          "  description_en = excluded.description_en, description_ar = excluded.description_ar,\n"
          "  areas_line_en = excluded.areas_line_en, areas_line_ar = excluded.areas_line_ar,\n"
          "  founded_year = excluded.founded_year, brand_colour = excluded.brand_colour;\n")


def build_amenities(d):
    rows = [ "(%s,%s,%s,%s,%d)" % (q(tok), q(a.get('en')), q(a.get('ar')), q(a.get('icon')), i)
             for i, (tok, a) in enumerate(sorted(d['AMENITY_CAT'].items())) ]
    write('03_amenities.sql',
          "-- The amenity vocabulary: every token already bound to a shipped icon.\n"
          "insert into cms.amenities (token, name_en, name_ar, icon, sort_order)\n"
          "select * from (values\n" + ',\n'.join('  ' + r for r in rows) +
          "\n) as v(token, name_en, name_ar, icon, sort_order)\n"
          "on conflict (token) do update set name_en = excluded.name_en,\n"
          "  name_ar = excluded.name_ar, icon = excluded.icon;\n")


def build_projects(d):
    """One statement, one VALUES list. The developer and location are joined by
    slug so the insert never has to know a generated id."""
    rows = []
    for p in d['PROJECTS']:
        rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)" % (
            q(p['slug']), q(p['name']), q(p['name_ar']), q(p['dev']), q(p['area']),
            q(p['status']), q(L(p.get('blurb'), 'en')), q(L(p.get('blurb'), 'ar')),
            q(p.get('price')), q(p.get('dp')), q(p.get('years')), q(p.get('delivery')),
            q(L(p.get('finishing'), 'en')), q(L(p.get('finishing'), 'ar')),
            q(L(p.get('types'), 'en')), q(L(p.get('types'), 'ar')),
            arr((p.get('tags') or {}).get('en')), arr((p.get('tags') or {}).get('ar'))))
    sql = """-- 84 projects. Every one is `published`: they are all live on the site today,
-- and a migration must not quietly unpublish anything.
insert into cms.projects (slug, name_en, name_ar, developer_id, location_id, stage,
  description_en, description_ar, price_from, down_payment_pct, instalment_years,
  delivery_label, finishing_en, finishing_ar, unit_types_en, unit_types_ar,
  tags_en, tags_ar, status, published_at)
select v.slug, v.name_en, v.name_ar, dev.id, loc.id, v.stage::cms.project_stage,
  v.description_en, v.description_ar, v.price_from, v.dp, v.years,
  v.delivery_label, v.finishing_en, v.finishing_ar, v.unit_types_en, v.unit_types_ar,
  v.tags_en, v.tags_ar, 'published', now()
from (values
""" + ',\n'.join('  ' + r for r in rows) + """
) as v(slug, name_en, name_ar, dev_slug, area_slug, stage, description_en, description_ar,
       price_from, dp, years, delivery_label, finishing_en, finishing_ar,
       unit_types_en, unit_types_ar, tags_en, tags_ar)
join cms.developers dev on dev.slug = v.dev_slug
join cms.locations  loc on loc.slug = v.area_slug
on conflict (slug) do update set
  name_en = excluded.name_en, name_ar = excluded.name_ar,
  developer_id = excluded.developer_id, location_id = excluded.location_id,
  stage = excluded.stage, description_en = excluded.description_en,
  description_ar = excluded.description_ar, price_from = excluded.price_from,
  down_payment_pct = excluded.down_payment_pct, instalment_years = excluded.instalment_years,
  delivery_label = excluded.delivery_label, finishing_en = excluded.finishing_en,
  finishing_ar = excluded.finishing_ar, unit_types_en = excluded.unit_types_en,
  unit_types_ar = excluded.unit_types_ar, tags_en = excluded.tags_en, tags_ar = excluded.tags_ar;
"""
    write('04_projects.sql', sql)


def build_units(d):
    """Units, plus the per-unit extras the site keeps in a side map.

    `floor`, `lvl` and `roof` come from UNIT_EXTRA, which the site stores beside
    UNITS. `lvl` and `roof` have no column of their own and ride in `attrs`, so
    nothing is dropped in the move.
    """
    extra = d.get('UNIT_EXTRA') or {}
    rows = []
    for u in d['UNITS']:
        ex = dict(extra.get(u['id']) or {})
        attrs = {}
        for k in ('lvl', 'roof'):
            v = u.get(k, ex.get(k))
            if v is not None:
                attrs[k] = v
        rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)" % (
            q(u['id']), q(u['project']), q(u['type']),
            q(L(u.get('label'), 'en')), q(L(u.get('label'), 'ar')),
            q(u.get('beds')), q(u.get('baths')), q(u.get('area')), q(u.get('areaTo')),
            q(u.get('price')), q(u.get('dp')), q(u.get('years')), q(u.get('handover')),
            q(u.get('floor', ex.get('floor'))), q(u.get('avail') or 'available')))
    sql = """-- 420 units, joined to their project by slug.
insert into cms.units (unit_code, project_id, unit_type_en, label_en, label_ar,
  bedrooms, bathrooms, bua, bua_to, price, down_payment_pct, instalment_years,
  delivery_label, floor, availability, status, published_at)
select v.unit_code, p.id, v.unit_type_en, v.label_en, v.label_ar,
  v.bedrooms, v.bathrooms, v.bua, v.bua_to, v.price, v.dp, v.years,
  v.delivery_label, v.floor, v.availability::cms.unit_availability, 'published', now()
from (values
""" + ',\n'.join('  ' + r for r in rows) + """
) as v(unit_code, project_slug, unit_type_en, label_en, label_ar, bedrooms, bathrooms,
       bua, bua_to, price, dp, years, delivery_label, floor, availability)
join cms.projects p on p.slug = v.project_slug
on conflict (lower(unit_code)) where deleted_at is null do update set
  project_id = excluded.project_id, unit_type_en = excluded.unit_type_en,
  label_en = excluded.label_en, label_ar = excluded.label_ar,
  bedrooms = excluded.bedrooms, bathrooms = excluded.bathrooms,
  bua = excluded.bua, bua_to = excluded.bua_to, price = excluded.price,
  down_payment_pct = excluded.down_payment_pct,
  instalment_years = excluded.instalment_years,
  delivery_label = excluded.delivery_label, floor = excluded.floor,
  availability = excluded.availability;
"""
    write('05_units.sql', sql)

    # the two fields with no column of their own
    attr_rows = []
    for u in d['UNITS']:
        ex = dict(extra.get(u['id']) or {})
        attrs = {}
        for k in ('lvl', 'roof'):
            v = u.get(k, ex.get(k))
            if v is not None:
                attrs[k] = v
        if attrs:
            attr_rows.append("(%s,%s)" % (q(u['id']), q(json.dumps(attrs, ensure_ascii=False))))
    if attr_rows:
        write('05b_unit_attrs.sql',
              "-- `lvl` and `roof` have no column of their own; they ride in attrs.\n"
              "update cms.units u set attrs = v.attrs::jsonb\n"
              "from (values\n" + ',\n'.join('  ' + r for r in attr_rows) +
              "\n) as v(unit_code, attrs)\nwhere lower(u.unit_code) = lower(v.unit_code);\n")


def build_media(d):
    """Every image the site references, and where it is attached.

    Six per-unit maps, one per-project cover map, and the developer logo and
    gallery maps collapse into media_assets + media_links.
    """
    assets = {}          # path -> True
    links = []           # (owner_kind, owner_slug_or_code, role, path, sort)

    def add(kind, owner, role, path, sort=0):
        if not path or not isinstance(path, str):
            return
        assets[path] = True
        links.append((kind, owner, role, path, sort))

    for slug, path in (d.get('PROJECT_COVERS') or {}).items():
        add('project', slug, 'cover', path)
    for slug, path in (d.get('PROJECT_LOGOS') or {}).items():
        add('project', slug, 'logo', path)
    for key, name in (d.get('DEV_LOGOS') or {}).items():
        add('developer', key, 'logo', '/logos/' + name if not str(name).startswith('/') else name)
    for key, paths in (d.get('DEV_GALLERY') or {}).items():
        for i, path in enumerate(paths or []):
            add('developer', key, 'gallery', path, i)

    for uid, path in (d.get('UNIT_IMAGES') or {}).items():
        add('unit', uid, 'cover', path)
    for map_name, role in (('UNIT_GALLERY', 'gallery'), ('UNIT_MASTERPLANS', 'masterplan'),
                           ('UNIT_FLOORPLANS', 'floorplan'), ('UNIT_LOCATIONS', 'location')):
        for uid, paths in (d.get(map_name) or {}).items():
            for i, path in enumerate(paths or []):
                add('unit', uid, role, path, i)

    sql = ["-- Every image path the site references, stored once.",
           "insert into cms.media_assets (path) values"]
    sql.append(',\n'.join('  (%s)' % q(p) for p in sorted(assets)))
    sql.append("on conflict (path) do nothing;")
    write('06_media_assets.sql', '\n'.join(sql) + '\n')

    owner_tbl = {'project': ('cms.projects', 'slug', 'project_id'),
                 'developer': ('cms.developers', 'slug', 'developer_id'),
                 'unit': ('cms.units', 'unit_code', 'unit_id')}
    by_kind = {}
    for kind, owner, role, path, sort in links:
        by_kind.setdefault(kind, []).append((owner, role, path, sort))

    n = 0
    for kind, items in sorted(by_kind.items()):
        tbl, key, col = owner_tbl[kind]
        # chunked so no single statement grows past what one round trip carries
        for start in range(0, len(items), 900):
            chunk = items[start:start + 900]
            n += 1
            rows = ',\n'.join('  (%s,%s,%s,%d)' % (q(p), q(o), q(r), s)
                               for o, r, p, s in chunk)
            write('07_media_links_%s_%02d.sql' % (kind, start // 900 + 1),
                  "-- Where each image is attached. A link is only written when both the\n"
                  "-- asset and its owner exist, so a stale reference inserts nothing rather\n"
                  "-- than pointing at the wrong row.\n"
                  "insert into cms.media_links (asset_id, %s, role, sort_order)\n"
                  "select a.id, o.id, v.role::cms.media_role, v.sort_order\n"
                  "from (values\n%s\n) as v(path, owner, role, sort_order)\n"
                  "join cms.media_assets a on a.path = v.path\n"
                  "join %s o on lower(o.%s) = lower(v.owner);\n" % (col, rows, tbl, key))

    return len(assets), len(links)


def build_project_amenities(d):
    rows = []
    for slug, tokens in (d.get('PROJECT_AMENITIES') or {}).items():
        for i, token in enumerate(tokens or []):
            rows.append("(%s,%s,%d)" % (q(slug), q(token), i))
    if not rows:
        return
    write('08_project_amenities.sql',
          "-- Which amenities each project claims.\n"
          "insert into cms.project_amenities (project_id, amenity_id, sort_order)\n"
          "select p.id, a.id, v.sort_order\n"
          "from (values\n" + ',\n'.join('  ' + r for r in rows) +
          "\n) as v(project_slug, token, sort_order)\n"
          "join cms.projects p on p.slug = v.project_slug\n"
          "join cms.amenities a on a.token = v.token\n"
          "on conflict (project_id, amenity_id) do update set sort_order = excluded.sort_order;\n")


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/site_data.json'
    with open(src, encoding='utf-8') as fh:
        d = json.load(fh)

    build_locations(d)
    build_developers(d)
    build_amenities(d)
    build_projects(d)
    build_units(d)
    n_assets, n_links = build_media(d)
    build_project_amenities(d)

    print('\nsource model: %d areas, %d developers, %d projects, %d units'
          % (len(d['AREAS']), len(d['DEVELOPERS']), len(d['PROJECTS']), len(d['UNITS'])))
    print('media:        %d distinct files, %d placements' % (n_assets, n_links))


if __name__ == '__main__':
    main()
