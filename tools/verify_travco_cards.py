#!/usr/bin/env python3
"""Check the Makadina and Marina Gate cards against the client price sheet.

Both cards were generated from the sheet, and generated is not the same as
correct: a wrong column or an off-by-one in the row scan would produce a card
that reads perfectly and prices a unit wrongly. This reads the workbook again,
independently of the generator, and asserts that what each card says is what
the sheet says — every price, area, bedroom, bathroom and payment term, in the
sheet's own row order.

It also checks the pages: that every page of each kit is embedded exactly once
across the card, so none is silently dropped and none is shown twice.

    python3 tools/verify_travco_cards.py [path/to/the.xlsx]
"""
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_XLSX = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
                '1b2d0c7e-________________.xlsx')

CARDS = {'makadina': ('MAKADINA', 27), 'marina-gate': ('MARINAGATE', 52)}


def sheet_units(path, project):
    """The TRAVCO rows for one project, in sheet order."""
    ws = openpyxl.load_workbook(path, data_only=True)['الوحدات']
    out = []
    for i in range(3, ws.max_row + 1):
        r = [c.value for c in ws[i]][:15]
        dev = str(r[0]).strip().upper() if r[0] else ''
        if dev.startswith('TRAVCO') and str(r[1]).strip().upper() == project:
            out.append(dict(row=i, type=r[3], bed=r[4], sqm=r[5],
                            price=int(str(r[6]).replace(',', '').strip()),
                            dp=r[7], yrs=r[8], avail=r[9], bath=r[14]))
    return out


def main():
    xlsx = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    if not os.path.exists(xlsx):
        sys.exit('the sheet is not at %s — pass its path as an argument' % xlsx)

    bad = 0
    for name, (project, pages) in CARDS.items():
        src = open(os.path.join(ROOT, 'docs/cards/%s.src.html' % name), encoding='utf-8').read()
        us = sheet_units(xlsx, project)
        rows = re.findall(r'<tr><td>(\d+)</td>(.*?)</tr>', src)
        rows = [r for r in rows if 'm&#178;' in r[1]]

        print('%s — %d rows in the sheet, %d in the card' % (name, len(us), len(rows)))

        def check(cond, msg):
            nonlocal bad
            if not cond:
                print('   FAIL  %s' % msg)
                bad += 1

        check(len(rows) == len(us), '%s: row count' % name)
        for n, (u, row) in enumerate(zip(us, rows), 1):
            money = '{:,}'.format(u['price'])
            tag = '%s row %d (sheet row %d)' % (name, n, u['row'])
            check(money in row[1], '%s: price %s' % (tag, money))
            check('<td>%s m&#178;</td>' % u['sqm'] in row[1], '%s: area %s' % (tag, u['sqm']))
            check('<td>%s</td>' % u['bed'] in row[1], '%s: bedrooms %s' % (tag, u['bed']))
            check('<td>%s</td>' % u['bath'] in row[1], '%s: bathrooms %s' % (tag, u['bath']))
            print('  %2d  %-13s %-4s %s m²  %s bed  %s bath'
                  % (n, money, str(u['type'])[:12], u['sqm'], u['bed'], u['bath']))

        # the shared terms the heading claims
        dps = {round(u['dp'] * 100) for u in us}
        yrs = {u['yrs'] for u in us}
        avs = {u['avail'] for u in us}
        check(len(dps) == 1 and len(yrs) == 1 and len(avs) == 1,
              '%s: the card claims one set of terms but the sheet has %s' % (name, (dps, yrs, avs)))
        claim = '%d&#37; down payment, %s years,\n        availability %s' % (
            list(dps)[0], list(yrs)[0], list(avs)[0])
        check(claim in src, '%s: the stated terms do not match the sheet' % name)

        # every page of the kit, once and once only
        used = re.findall(r'__(P\d+)__', src)
        want = ['P%02d' % i for i in range(1, pages + 1)]
        missing = [p for p in want if p not in used]
        twice = sorted({p for p in used if used.count(p) > 1})
        check(not missing, '%s: pages never shown: %s' % (name, missing))
        check(not twice, '%s: pages shown more than once: %s' % (name, twice))
        print('      %d of %d kit pages embedded, none repeated\n' % (len(set(used)), pages))

    print('%d checks failed' % bad)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
