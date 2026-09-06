#!/usr/bin/env python3
"""Digest the site's content model exactly as the database should hold it.

Counting rows only proves nothing was dropped. This builds one md5 per table
from every field that was migrated, so the same number printed by the database
means every value matches — not just how many there are.

    node tools/domtest.cjs --dump-data > /tmp/site_data.json
    python3 tools/verify_db.py /tmp/site_data.json

Then run tools/verify_db.sql against the database and compare line for line.
"""
import hashlib
import json
import re
import sys

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from migrate_to_db import GOVERNORATE, L   # the same field extraction as the load


def n(v):
    """A number the way Postgres renders it back as text."""
    if v is None or v == '':
        return ''
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v)


def s(v):
    return '' if v is None else str(v)


def digest(rows):
    return hashlib.md5('|'.join(sorted(rows)).encode('utf-8')).hexdigest()


def main():
    with open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/site_data.json',
              encoding='utf-8') as fh:
        d = json.load(fh)

    out = {}

    out['locations'] = digest(
        ['egypt~country~~Egypt~مصر'] +
        ['%s~governorate~egypt~%s~%s' % (slug, en, ar)
         for slug, (en, ar) in sorted({GOVERNORATE[a['key']][0]: GOVERNORATE[a['key']][1:]
                                       for a in d['AREAS']}.items())] +
        ['%s~area~%s~%s~%s~%s~%s~%d' % (a['key'], GOVERNORATE[a['key']][0],
                                        L(a['name'], 'en'), L(a['name'], 'ar'),
                                        s(L(a.get('blurb'), 'en')), s(L(a.get('blurb'), 'ar')), i)
         for i, a in enumerate(d['AREAS'])])

    out['developers'] = digest(
        ['~'.join([dev['key'], s(L(dev['name'], 'en')), s(L(dev['name'], 'ar')),
                   s(L(dev.get('tagline'), 'en')), s(L(dev.get('tagline'), 'ar')),
                   s(L(dev.get('desc'), 'en')), s(L(dev.get('desc'), 'ar')),
                   s(L(dev.get('areas'), 'en')), s(L(dev.get('areas'), 'ar')),
                   n(dev.get('since')), s(dev.get('c1'))])
         for dev in d['DEVELOPERS']])

    out['amenities'] = digest(
        ['~'.join([tok, s(a.get('en')), s(a.get('ar')), s(a.get('icon'))])
         for tok, a in d['AMENITY_CAT'].items()])

    out['projects'] = digest(
        ['~'.join([p['slug'], s(p['name']), s(p['name_ar']), p['dev'], p['area'], p['status'],
                   n(p.get('price')), n(p.get('dp')), n(p.get('years')), s(p.get('delivery')),
                   s(L(p.get('types'), 'en')), s(L(p.get('types'), 'ar')),
                   '^'.join((p.get('tags') or {}).get('en') or []),
                   '^'.join((p.get('tags') or {}).get('ar') or []),
                   s(L(p.get('blurb'), 'en')), s(L(p.get('blurb'), 'ar')),
                   s(L(p.get('finishing'), 'en')), s(L(p.get('finishing'), 'ar'))])
         for p in d['PROJECTS']])

    extra = d.get('UNIT_EXTRA') or {}
    out['units'] = digest(
        ['~'.join([u['id'], u['project'], s(u['type']),
                   s(L(u.get('label'), 'en')), s(L(u.get('label'), 'ar')),
                   n(u.get('beds')), n(u.get('baths')), n(u.get('area')), n(u.get('areaTo')),
                   n(u.get('price')), n(u.get('dp')), n(u.get('years')), s(u.get('handover')),
                   s(u.get('floor', (extra.get(u['id']) or {}).get('floor'))),
                   s(u.get('avail') or 'available')])
         for u in d['UNITS']])

    # media, resolved to the URLs the browser actually asks for
    def logo_file(name):
        return re.sub(r'\.(png|jpe?g)$', '.webp', str(name), flags=re.I)

    def plan_url(path):
        return path if str(path).startswith('/') else '/project-media/plans/' + path

    assets, links = set(), []

    def add(kind, owner, role, path, sort=0):
        if path and isinstance(path, str):
            assets.add(path)
            links.append('%s~%s~%s~%d~%s' % (kind, owner.lower(), role, sort, path))

    for slug, path in (d.get('PROJECT_COVERS') or {}).items():
        add('project', slug, 'cover', path)
    for slug, name in (d.get('PROJECT_LOGOS') or {}).items():
        add('project', slug, 'logo', '/logos/projects/' + logo_file(name))
    for key, name in (d.get('DEV_LOGOS') or {}).items():
        add('developer', key, 'logo', '/logos/' + logo_file(name))
    for key, paths in (d.get('DEV_GALLERY') or {}).items():
        for i, path in enumerate(paths or []):
            add('developer', key, 'gallery', path, i)
    for uid, path in (d.get('UNIT_IMAGES') or {}).items():
        add('unit', uid, 'cover', path)
    for map_name, role in (('UNIT_GALLERY', 'gallery'), ('UNIT_MASTERPLANS', 'masterplan'),
                           ('UNIT_FLOORPLANS', 'floorplan'), ('UNIT_LOCATIONS', 'location')):
        plan = map_name in ('UNIT_MASTERPLANS', 'UNIT_FLOORPLANS')
        for uid, paths in (d.get(map_name) or {}).items():
            for i, path in enumerate(paths or []):
                add('unit', uid, role, plan_url(path) if plan else path, i)

    out['media_assets'] = digest(assets)
    out['media_links'] = digest(links)

    out['project_amenities'] = digest(
        ['%s~%s~%d' % (slug, token, i)
         for slug, tokens in (d.get('PROJECT_AMENITIES') or {}).items()
         for i, token in enumerate(tokens or [])])

    counts = {'locations': 1 + len({GOVERNORATE[a['key']][0] for a in d['AREAS']}) + len(d['AREAS']),
              'developers': len(d['DEVELOPERS']), 'amenities': len(d['AMENITY_CAT']),
              'projects': len(d['PROJECTS']), 'units': len(d['UNITS']),
              'media_assets': len(assets), 'media_links': len(links),
              'project_amenities': sum(len(v or []) for v in (d.get('PROJECT_AMENITIES') or {}).values())}

    for k in sorted(out):
        print('%-18s %6d  %s' % (k, counts[k], out[k]))


if __name__ == '__main__':
    main()
