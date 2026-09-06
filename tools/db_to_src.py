#!/usr/bin/env python3
"""Regenerate the site's data literals from the database.

This is the second half of the publish loop. `migrate_to_db.py` took the
JavaScript literals into Postgres; this brings Postgres back out, so an edit
made in the dashboard reaches the static site the next time it is built.

    python3 tools/db_to_src.py --dump db.json     # from a saved dump
    python3 tools/db_to_src.py                    # fetch it first, see below
    python3 tools/db_to_src.py --dump db.json --check   # non-zero if stale

Fetching needs two environment variables, and they belong in CI secrets, not
in this repository:

    SUPABASE_URL   https://<ref>.supabase.co
    SUPABASE_KEY   a key allowed to read the cms schema

What it rewrites, and nothing else: the AREAS, DEVELOPERS, PROJECTS, UNITS and
UNIT_EXTRA arrays in src/tpl_script2.html. The prose around them survives, and
so do the 74 comment lines *inside* them — those record which client sheet a
run of rows came from, so they are re-emitted above the same row they were
written above (tools/section_notes.json, produced once by extract_notes.py).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'tpl_script2.html')
NOTES = os.path.join(ROOT, 'tools', 'section_notes.json')

# The site's area order is editorial, not alphabetical: it runs east Cairo,
# then the coast, then west, then the rest. locations.sort_order carries it.
FLOAT_OK = re.compile(r'\.0$')


# ------------------------------------------------------------------ writing
def js(v):
    """A JavaScript literal. Strings are single-quoted, as the file already is."""
    if v is None:
        return 'null'
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, (int,)):
        return str(v)
    if isinstance(v, float):
        s = repr(v)
        return s[:-2] if s.endswith('.0') else s
    s = str(v)
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def pair(en, ar):
    return '{en:%s,ar:%s}' % (js(en), js(ar))


def arr(items):
    return '[' + ','.join(js(i) for i in items) + ']'


def props(pairs):
    """Only the keys that carry a value, in the order given."""
    return ', '.join('%s:%s' % (k, v) for k, v in pairs if v is not None)


def opt(v):
    """A literal, or nothing at all.

    The difference matters: the site asks `d.since === undefined` to decide
    whether a developer has a public founding year, and reads `beds` the same
    way to decide whether a unit is a home or an office. Writing `since:null`
    instead of omitting the key answers "yes, and the answer is null", which
    put a "Since undefined" chip on a developer page the first time this
    generator ran.
    """
    return None if v is None or v == '' else js(v)


def num(v):
    """A numeric column comes back as a string from PostgREST; 10.0 is 10."""
    if v is None or v == '':
        return None
    f = float(v)
    return int(f) if f == int(f) else f


# ------------------------------------------------------------------ shaping
def areas(db):
    out = []
    for a in sorted(db['locations'], key=lambda l: (l.get('sort_order') or 0)):
        if a.get('level') != 'area':
            continue
        blurb = pair(a.get('blurb_en'), a.get('blurb_ar')) if (a.get('blurb_en') or a.get('blurb_ar')) else None
        out.append((a['slug'], '{' + props([
            ('key', js(a['slug'])),
            ('name', pair(a['name_en'], a['name_ar'])),
            ('blurb', blurb),
        ]) + '}'))
    return out


def developers(db):
    out = []
    for d in sorted(db['developers'], key=lambda x: x.get('sort_order') or 0):
        out.append((d['slug'], '{' + props([
            ('key', js(d['slug'])),
            ('c1', opt(d.get('brand_colour'))),
            ('name', pair(d['name_en'], d['name_ar'])),
            ('since', opt(d.get('founded_year'))),
            ('areas', pair(d.get('areas_line_en'), d.get('areas_line_ar'))
                      if (d.get('areas_line_en') or d.get('areas_line_ar')) else None),
            ('tagline', pair(d.get('tagline_en'), d.get('tagline_ar'))
                        if (d.get('tagline_en') or d.get('tagline_ar')) else None),
            ('desc', pair(d.get('description_en'), d.get('description_ar'))
                     if (d.get('description_en') or d.get('description_ar')) else None),
        ]) + '}'))
    return out


def projects(db):
    dev = {d['id']: d['slug'] for d in db['developers']}
    loc = {l['id']: l['slug'] for l in db['locations']}
    out = []
    for p in sorted(db['projects'], key=lambda x: x.get('sort_order') or 0):
        if p.get('deleted_at') or p.get('status') != 'published':
            continue
        out.append((p['slug'], '{' + props([
            ('slug', js(p['slug'])),
            ('name', js(p['name_en'])),
            ('name_ar', opt(p['name_ar'])),
            ('dev', js(dev.get(p['developer_id']))),
            ('area', js(loc.get(p['location_id']))),
            ('status', js(p['stage'])),
            ('price', opt(num(p.get('price_from')))),
            ('dp', opt(num(p.get('down_payment_pct')))),
            ('years', opt(num(p.get('instalment_years')))),
            ('delivery', opt(p.get('delivery_label'))),
            ('finishing', pair(p.get('finishing_en'), p.get('finishing_ar'))
                          if (p.get('finishing_en') or p.get('finishing_ar')) else None),
            ('types', pair(p.get('unit_types_en'), p.get('unit_types_ar'))
                      if (p.get('unit_types_en') or p.get('unit_types_ar')) else None),
            ('tags', '{en:%s,ar:%s}' % (arr(p.get('tags_en') or []), arr(p.get('tags_ar') or []))
                     if (p.get('tags_en') or p.get('tags_ar')) else None),
            ('blurb', pair(p.get('description_en'), p.get('description_ar'))
                      if (p.get('description_en') or p.get('description_ar')) else None),
        ]) + '}'))
    return out


def units(db):
    proj = {p['id']: p['slug'] for p in db['projects']}
    out, extra = [], []
    for u in sorted(db['units'], key=lambda x: x.get('sort_order') or 0):
        if u.get('deleted_at') or u.get('status') != 'published':
            continue
        label = (pair(u.get('label_en'), u.get('label_ar'))
                 if (u.get('label_en') or u.get('label_ar')) else None)
        out.append((u['unit_code'], '{' + props([
            ('id', js(u['unit_code'])),
            ('project', js(proj.get(u['project_id']))),
            ('type', opt(u.get('unit_type_en'))),
            ('label', label),
            ('beds', opt(num(u.get('bedrooms')))),
            ('baths', opt(num(u.get('bathrooms')))),
            ('area', opt(num(u.get('bua')))),
            ('areaTo', opt(num(u.get('bua_to')))),
            ('price', opt(num(u.get('price')))),
            ('dp', opt(num(u.get('down_payment_pct')))),
            ('years', opt(num(u.get('instalment_years')))),
            ('handover', opt(u.get('delivery_label'))),
            # 'available' is the default the site assumes; the source omits it.
            ('avail', opt(u.get('availability')) if u.get('availability') != 'available' else None),
        ]) + '}'))

        # `floor`, `lvl` and `roof` live beside UNITS in the source, because
        # the site merges them in at boot. attrs carries the last two.
        bits = []
        if u.get('floor'):
            bits.append('floor:' + js(u['floor']))
        attrs = u.get('attrs') or {}
        if isinstance(attrs, str):
            attrs = json.loads(attrs)
        for k in ('lvl', 'roof'):
            if attrs.get(k) is not None:
                bits.append('%s:%s' % (k, js(attrs[k])))
        if bits:
            extra.append("'%s':{%s}" % (u['unit_code'], ','.join(bits)))
    return out, extra


# ------------------------------------------------------------------ splicing
def splice(text, name, rows, notes):
    """Replace `var NAME = [ … ];`, re-emitting each anchored comment."""
    lines = []
    for key, literal in rows:
        for note in notes.get(name, {}).get(key, []):
            lines.append(note)
        lines.append('    ' + literal + ',')
    if lines:
        lines[-1] = lines[-1].rstrip(',')
    block = '\n  var %s = [\n%s\n  ];' % (name, '\n'.join(lines))
    out, n = re.subn(r'\n  var %s = \[\n.*?\n  \];' % name, lambda m: block, text, count=1, flags=re.S)
    if n != 1:
        sys.exit('could not find the %s block to replace' % name)
    return out


def splice_extra(text, extra):
    block = '\n  var UNIT_EXTRA={%s};' % ','.join(extra)
    out, n = re.subn(r'\n  var UNIT_EXTRA=\{.*?\};', lambda m: block, text, count=1, flags=re.S)
    if n != 1:
        sys.exit('could not find the UNIT_EXTRA block to replace')
    return out


# --------------------------------------------------------------------- fetch
def fetch():
    """Read the cms schema over PostgREST. Keys come from the environment."""
    import urllib.request
    url = os.environ.get('SUPABASE_URL', '').rstrip('/')
    key = os.environ.get('SUPABASE_KEY', '')
    if not url or not key:
        sys.exit('set SUPABASE_URL and SUPABASE_KEY, or pass --dump <file>')

    def get(table, select):
        req = urllib.request.Request(
            '%s/rest/v1/%s?select=%s&limit=10000' % (url, table, select),
            headers={'apikey': key, 'Authorization': 'Bearer ' + key,
                     'Accept-Profile': 'cms'})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8'))

    return {
        'locations': get('locations', '*'),
        'developers': get('developers', '*'),
        'projects': get('projects', '*'),
        'units': get('units', '*'),
    }


def main():
    argv = sys.argv[1:]
    check = '--check' in argv
    dump = None
    if '--dump' in argv:
        dump = argv[argv.index('--dump') + 1]

    db = json.load(open(dump, encoding='utf-8')) if dump else fetch()
    for k in ('locations', 'developers', 'projects', 'units'):
        if k not in db:
            sys.exit('dump is missing %s' % k)

    notes = json.load(open(NOTES, encoding='utf-8'))
    before = open(SRC, encoding='utf-8').read()

    text = splice(before, 'AREAS', areas(db), notes)
    text = splice(text, 'DEVELOPERS', developers(db), notes)
    text = splice(text, 'PROJECTS', projects(db), notes)
    unit_rows, extra = units(db)
    text = splice(text, 'UNITS', unit_rows, notes)
    text = splice_extra(text, extra)

    if check:
        same = text == before
        print('src/tpl_script2.html is %s' % ('up to date' if same else 'STALE'))
        sys.exit(0 if same else 1)

    open(SRC, 'w', encoding='utf-8').write(text)
    print('src/tpl_script2.html  %d areas, %d developers, %d projects, %d units, %d extras'
          % (len(areas(db)), len(developers(db)), len(projects(db)), len(unit_rows), len(extra)))


if __name__ == '__main__':
    main()
