#!/usr/bin/env python3
"""Turn a site dump into the shape PostgREST returns, for testing.

`db_to_src.py` reads rows as the database hands them over. To exercise it
without a network round trip, this renames the site's own fields into that
shape — the same mapping `migrate_to_db.py` used on the way in.

That substitution is only legitimate because the two are known to be equal:
tools/verify_db.py and tools/verify_db.sql digest all eight tables field by
field, and all eight match. So a dump built from the site is byte-for-byte
what the database would return for the columns db_to_src reads.

    node tools/domtest.cjs --dump-data > /tmp/site.json
    python3 tools/db_shape.py /tmp/site.json > /tmp/db.json
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from migrate_to_db import GOVERNORATE, L  # noqa: E402


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/site_data.json'
    d = json.load(open(src, encoding='utf-8'))

    locations = [{'id': 'loc-egypt', 'slug': 'egypt', 'level': 'country',
                  'parent_id': None, 'name_en': 'Egypt', 'name_ar': 'مصر',
                  'sort_order': 0, 'status': 'published'}]
    seen = {}
    for a in d['AREAS']:
        g, en, ar = GOVERNORATE[a['key']]
        if g not in seen:
            seen[g] = 'loc-' + g
            locations.append({'id': seen[g], 'slug': g, 'level': 'governorate',
                              'parent_id': 'loc-egypt', 'name_en': en, 'name_ar': ar,
                              'sort_order': 0, 'status': 'published'})
    for i, a in enumerate(d['AREAS']):
        locations.append({
            'id': 'loc-' + a['key'], 'slug': a['key'], 'level': 'area',
            'parent_id': seen[GOVERNORATE[a['key']][0]],
            'name_en': L(a['name'], 'en'), 'name_ar': L(a['name'], 'ar'),
            'blurb_en': L(a.get('blurb'), 'en'), 'blurb_ar': L(a.get('blurb'), 'ar'),
            'sort_order': i, 'status': 'published'})

    developers = [{
        'id': 'dev-' + x['key'], 'slug': x['key'],
        'name_en': L(x['name'], 'en'), 'name_ar': L(x['name'], 'ar'),
        'tagline_en': L(x.get('tagline'), 'en'), 'tagline_ar': L(x.get('tagline'), 'ar'),
        'description_en': L(x.get('desc'), 'en'), 'description_ar': L(x.get('desc'), 'ar'),
        'areas_line_en': L(x.get('areas'), 'en'), 'areas_line_ar': L(x.get('areas'), 'ar'),
        'founded_year': x.get('since'), 'brand_colour': x.get('c1'),
        'sort_order': i, 'status': 'published', 'deleted_at': None
    } for i, x in enumerate(d['DEVELOPERS'])]

    projects = [{
        'id': 'prj-' + p['slug'], 'slug': p['slug'],
        'name_en': p['name'], 'name_ar': p['name_ar'],
        'developer_id': 'dev-' + p['dev'], 'location_id': 'loc-' + p['area'],
        'stage': p['status'],
        'price_from': p.get('price'), 'down_payment_pct': p.get('dp'),
        'instalment_years': p.get('years'), 'delivery_label': p.get('delivery'),
        'finishing_en': L(p.get('finishing'), 'en'), 'finishing_ar': L(p.get('finishing'), 'ar'),
        'unit_types_en': L(p.get('types'), 'en'), 'unit_types_ar': L(p.get('types'), 'ar'),
        'tags_en': (p.get('tags') or {}).get('en') or [],
        'tags_ar': (p.get('tags') or {}).get('ar') or [],
        'description_en': L(p.get('blurb'), 'en'), 'description_ar': L(p.get('blurb'), 'ar'),
        'sort_order': i, 'status': 'published', 'deleted_at': None
    } for i, p in enumerate(d['PROJECTS'])]

    extra = d.get('UNIT_EXTRA') or {}
    units = []
    for i, u in enumerate(d['UNITS']):
        ex = dict(extra.get(u['id']) or {})
        attrs = {}
        for k in ('lvl', 'roof'):
            v = u.get(k, ex.get(k))
            if v is not None:
                attrs[k] = v
        units.append({
            'id': 'unt-' + u['id'], 'unit_code': u['id'],
            'project_id': 'prj-' + u['project'],
            'unit_type_en': u.get('type'),
            'label_en': L(u.get('label'), 'en'), 'label_ar': L(u.get('label'), 'ar'),
            'bedrooms': u.get('beds'), 'bathrooms': u.get('baths'),
            'bua': u.get('area'), 'bua_to': u.get('areaTo'),
            'price': u.get('price'), 'down_payment_pct': u.get('dp'),
            'instalment_years': u.get('years'), 'delivery_label': u.get('handover'),
            'floor': u.get('floor', ex.get('floor')),
            'availability': u.get('avail') or 'available',
            'attrs': attrs, 'sort_order': i, 'status': 'published', 'deleted_at': None
        })

    json.dump({'locations': locations, 'developers': developers,
               'projects': projects, 'units': units},
              sys.stdout, ensure_ascii=False)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
