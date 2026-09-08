#!/usr/bin/env python3
"""Check the reloaded SODIC units on the site against the client price sheet.

Villette, June, SODIC East and The Estates were rewritten from the sheet, and
the thing most easily got wrong is the images: a unit may name several, the
order is the sheet's, and a continuation row carries nothing but another image
id. This reads the workbook again, independently of whatever generated the
site, and asserts for each unit in sheet order:

  price, area, bedrooms, bathrooms, down payment, instalment years, handover
  the render list, in the sheet's order, first image first
  the floor plans, the master plan and the location map
  that every path it shows is a file that exists in the repo

Nine SODIC East units are short of renders because the archive holding their
image ids was never supplied. Those ids are reported at the end rather than
failed: the sheet names them, no file exists, and the unit shows what it has.

    python3 tools/verify_sodic_units.py [path/to/the.xlsx]
"""
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_XLSX = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
                'dedaa386-________________.xlsx')

# the sheet's project wording -> the site's slug and unit-id prefix, in the
# order the site lists them. "The Estates Residence" is a separate group in the
# sheet with no archive of its own and is deliberately not carried here.
SPEC = [('Villette', 'villette', 'VL'),
        ('june', 'june-north-coast', 'JN'),
        ('SODIC EAST', 'sodic-east', 'SE'),
        ('THE ESTATES', 'the-estates-zayed', 'ES')]


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.strip().lower()).strip('-')


def sheet_units(path):
    """The SODIC rows, grouped by the sheet's project name, in sheet order.

    A unit is one data row plus the continuation rows beneath it, which carry
    nothing but a further image id (column 10) and sometimes a further floor
    plan (column 12). That is how a unit comes to have more than one picture.
    """
    ws = openpyxl.load_workbook(path, data_only=True)['الوحدات']
    out, cur = {}, None
    for i in range(3, ws.max_row + 1):
        r = [c.value for c in ws[i]][:15]
        dev = str(r[0]).strip().lower() if r[0] else ''
        if dev == 'sodic':
            cur = dict(row=i, proj=str(r[1]).strip(), type=str(r[3]).strip(),
                       bed=r[4], sqm=r[5],
                       price=int(str(r[6]).replace(',', '').strip()),
                       dp=r[7], yrs=r[8], avail=r[9], bath=r[14],
                       imgs=[str(r[10]).strip()] if r[10] else [],
                       fps=[str(r[12]).strip()] if r[12] else [],
                       mp=str(r[11]).strip() if r[11] else None,
                       loc=str(r[13]).strip() if r[13] else None)
            out.setdefault(cur['proj'], []).append(cur)
        elif dev:
            cur = None
        elif cur and all(v in (None, '') for v in r[:10]):
            if r[10]:
                cur['imgs'].append(str(r[10]).strip())
            if r[12]:
                cur['fps'].append(str(r[12]).strip())
    return out


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    if not os.path.exists(xlsx):
        sys.exit('the sheet is not at %s — pass its path as an argument' % xlsx)

    groups = sheet_units(xlsx)
    recs = open(os.path.join(ROOT, 'src/tpl_script2.html'), encoding='utf-8').read()
    media = open(os.path.join(ROOT, 'src/tpl_script2b.html'), encoding='utf-8').read()
    bad, absent = 0, []

    def check(cond, msg):
        nonlocal bad
        if not cond:
            print('   FAIL  %s' % msg)
            bad += 1

    def block(var, uid):
        """The paths one map holds for a unit, or None when it holds no row."""
        seg = media[media.index('var %s = {' % var):]
        seg = seg[:seg.index('\n  };')]
        m = re.search(r"^    '%s':(\[(.*?)\]|'[^']*'),$" % uid, seg, re.M)
        return re.findall(r"'(/[^']+)'", m.group(0)) if m else None

    print('%-7s %-13s %-7s %-6s %s' % ('unit', 'price', 'm2', 'images', 'first image'))
    for name, slug_, code in SPEC:
        rows = groups.get(name) or []
        check(bool(rows), '%s: the sheet has no rows under this name' % name)
        base = '/project-media/sodic/%s/units/' % slug_

        def path(n):
            """The stored path for an image id, or None when no file exists."""
            p = base + slug(n) + '.webp'
            if os.path.exists(os.path.join(ROOT, p.lstrip('/'))):
                return p
            absent.append((name, n))
            return None

        for i, u in enumerate(rows, 1):
            uid = '%s-%02d' % (code, i)
            line = [l for l in recs.split('\n') if "id:'%s'" % uid in l]
            check(bool(line), '%s: no record on the site (sheet row %d)' % (uid, u['row']))
            if not line:
                continue
            line = line[0]
            check("project:'%s'" % slug_ in line, '%s: is not on %s' % (uid, slug_))
            for field, val in (('beds', u['bed']), ('baths', u['bath']),
                               ('area', u['sqm']), ('price', u['price']),
                               ('dp', round(u['dp'] * 100)), ('years', u['yrs'])):
                check('%s:%s,' % (field, val) in line or '%s:%s}' % (field, val) in line,
                      '%s: %s should be %s (sheet row %d)' % (uid, field, val, u['row']))
            check("handover:'%s'" % u['avail'] in line, '%s: handover %s' % (uid, u['avail']))

            # Images the archives supply, in the sheet's order. An id with no
            # file is dropped rather than shown broken, so the site's list is
            # the sheet's list minus whatever was never delivered.
            want_g = [p for p in (path(n) for n in u['imgs']) if p]
            got_g = block('UNIT_GALLERY', uid) or []
            check(got_g == want_g,
                  '%s: gallery out of order\n         sheet %s\n         site  %s'
                  % (uid, want_g, got_g))
            check((block('UNIT_IMAGES', uid) or []) == want_g[:1],
                  '%s: cover is not the sheet\'s first image' % uid)
            check((block('UNIT_FLOORPLANS', uid) or []) ==
                  [p for p in (path(n) for n in u['fps']) if p], '%s: floor plans' % uid)
            check((block('UNIT_MASTERPLANS', uid) or []) ==
                  [p for p in [path(u['mp'])] if p] if u['mp'] else True, '%s: master plan' % uid)
            check((block('UNIT_LOCATIONS', uid) or []) ==
                  [p for p in [path(u['loc'])] if p] if u['loc'] else True, '%s: location' % uid)

            print('%-7s %-13s %-7s %-6s %s'
                  % (uid, '{:,}'.format(u['price']), u['sqm'], '%d/%d' % (len(want_g), len(u['imgs'])),
                     u['imgs'][0] if u['imgs'] else '—'))

    print('\n%d checks failed' % bad)
    seen = sorted({(p, n) for p, n in absent})
    if seen:
        print('%d image ids the sheet names that no archive supplies:' % len(seen))
        for p, n in seen:
            print('   %-12s %s' % (p, n))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
