#!/usr/bin/env python3
"""Check the Marassi card's unit section against the client sheet, cell by cell.

The card's sixteen unit blocks were generated from the sheet, but generated is
not the same as correct: a wrong column, an off-by-one in the row scan or a
silently reordered image list would all produce a card that looks right. This
reads the workbook again, independently of the generator, and asserts that
what the card says is what the sheet says.

    python3 tools/verify_marassi_units.py [path/to/the.xlsx]

It checks, for every unit in sheet order:

  price, area, bedrooms, bathrooms, down payment, instalment years and the
  availability year, as they appear in the card's table and in the unit block

  that the renders appear in the sheet's order, that none is shared with a
  unit the sheet does not share it with, and that every image the sheet names
  is either shown or listed as missing

Exit code 0 means the card and the sheet agree.
"""
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARD = os.path.join(ROOT, 'docs', 'cards', 'marassi.src.html')
DEFAULT_XLSX = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
                '1b2d0c7e-________________.xlsx')

# Named by the sheet, present in neither archive.
MISSING = {'ap1-marina shore-0', 'v1-horizon-1'}


def sheet_units(path):
    """The EMAAR rows, each with the image ids listed under it, in sheet order."""
    ws = openpyxl.load_workbook(path, data_only=True)['الوحدات']
    units, cur = [], None
    for i in range(3, ws.max_row + 1):
        r = [c.value for c in ws[i]][:15]
        if r[0] and str(r[0]).strip().upper() == 'EMAAR':
            cur = dict(row=i, price=r[6], sqm=r[5], bed=r[4], bath=r[14],
                       dp=r[7], yrs=r[8], avail=r[9], fp=r[12],
                       imgs=[str(r[10]).strip()] if r[10] else [])
            units.append(cur)
        elif cur and r[10] and all(v in (None, '') for v in r[:10]):
            cur['imgs'].append(str(r[10]).strip())
    return units


def token(name):
    return 'U_' + re.sub(r'[^A-Z0-9]+', '_', name.upper()).strip('_')


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    if not os.path.exists(xlsx):
        sys.exit('the sheet is not at %s — pass its path as an argument' % xlsx)

    units = sheet_units(xlsx)
    html = open(CARD, encoding='utf-8').read()
    blocks = re.findall(r'<article class="unit">(.*?)</article>', html, re.S)
    rows = re.findall(r'<tr><td>(\d+)</td>(.*?)</tr>', html, re.S)
    rows = [r for r in rows if 'm&#178;' in r[1]]

    bad = 0

    def check(cond, msg):
        nonlocal bad
        if not cond:
            print('   FAIL  %s' % msg)
            bad += 1

    print('%d units in the sheet, %d blocks and %d table rows in the card\n'
          % (len(units), len(blocks), len(rows)))
    check(len(blocks) == len(units), 'block count')
    check(len(rows) == len(units), 'table row count')

    for n, (u, blk) in enumerate(zip(units, blocks), 1):
        money = '{:,}'.format(int(u['price']))
        label = 'unit %d (sheet row %d)' % (n, u['row'])

        check(money in blk, '%s: price %s not in its block' % (label, money))
        check(money in rows[n - 1][1], '%s: price %s not in its table row' % (label, money))
        check('%s m&#178;' % u['sqm'] in blk, '%s: area %s' % (label, u['sqm']))
        check('%s m&#178;' % u['sqm'] in rows[n - 1][1], '%s: area in table' % label)
        check('<th>Bedrooms</th><td>%s</td>' % u['bed'] in blk, '%s: bedrooms %s' % (label, u['bed']))
        want_bath = str(u['bath']) if u['bath'] else 'Not given in the sheet'
        check('<th>Bathrooms</th><td>%s</td>' % want_bath in blk, '%s: bathrooms %s' % (label, want_bath))
        check('<th>Down payment</th><td>%d&#37;</td>' % round(u['dp'] * 100) in blk,
              '%s: down payment %s' % (label, u['dp']))
        check('<th>Instalments</th><td>%s years</td>' % u['yrs'] in blk, '%s: years %s' % (label, u['yrs']))
        check('<th>Availability</th><td>%s</td>' % u['avail'] in blk, '%s: availability %s' % (label, u['avail']))

        want = [token(i) for i in u['imgs'] if i not in MISSING]
        got = re.findall(r'<img src="__(U_[A-Z0-9_]+)__"', blk)
        got_renders = [g for g in got if not g.startswith('U_FP_')]
        check(got_renders == want,
              '%s: renders out of order\n         sheet wants %s\n         card shows %s'
              % (label, want, got_renders))

        lost = [i for i in u['imgs'] if i in MISSING]
        for miss in lost:
            check(miss in blk, '%s: does not say %s is missing' % (label, miss))

        if u['fp']:
            check(token(str(u['fp']).strip()) in got, '%s: floor plan %s' % (label, u['fp']))

        print('  %2d  %-13s %-6s %s m²  %d bed  %d render%s%s'
              % (n, money, str(u['bath'] or '—'), u['sqm'], u['bed'], len(want),
                 '' if len(want) == 1 else 's',
                 '   (%d listed but absent)' % len(lost) if lost else ''))

    # Nothing from another project may appear anywhere in the unit section.
    unit_section = html[html.index('<div class="units">'):]
    stray = [f for f in re.findall(r'assets/marassi/units/([a-z0-9.-]+)\.webp', html)]
    check(all(re.match(r'(ap1|th1|v\d|fp-|mp-|location)', f) for f in stray),
          'an image outside the Marassi unit set is referenced')

    print('\n%d checks failed' % bad)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
