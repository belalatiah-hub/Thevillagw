#!/usr/bin/env python3
"""Lift IL Cazar's Company Profile 2025 onto the IL Cazar developer page.

Seventy-nine 16:9 spreads covering the company and its eight projects: The C
and Safia on Ras El Hekma, The Crest and Glen in New Cairo, Westdays in West
Cairo, Creek Town and Stoda on the Suez road, and Go Heliopolis. Each project
gets an about page, a location map, a master plan, renders and an icon list of
amenities, in that order, so the pages published here are chosen by role
rather than by eye.

WHAT IS LEFT OUT, AND WHY

Eight pages carry a proximity claim, and the sweep that found them was run
twice — over the text layer and over OCR at 2000px — then every candidate was
rendered and put through tools/verify_no_drivetimes.py, the same gate the rest
of the site passes. Six are titled PROXIMITY MAP outright: Safia p17 (20 mins
El Dabaa, 30 mins Alamein airport, 2:30 hrs Cairo-Alex desert road), The Crest
p29, Glen p45, Creek Town p57, Go Heliopolis p66 and Stoda p74. Two more carry
one inside a paragraph: p05, the second portfolio spread, where Stoda's blurb
reads "minutes away from Cairo International Airport", and p07, where The C is
"ideally located at 188 km along the pristine shores of Ras El Hekma".

That last one is a judgement, so here it is in the open. "188 km" is an
address — the kilometre marker on the Alexandria–Marsa Matrouh road, the way
every North Coast project is identified, and Safia's "KM 186" is the same
thing. It is not a distance to anywhere. But the gate flags it, and a gate
that ships with a known red line stops being read, so the page stays off and
its figures go on the card in words instead. p04 and p16 say "750 m beach
line", which is the length of the project's own beach rather than a distance,
and the gate agrees: both pass.

Seven more pages are dividers — a project logo over a photograph — and five of
those photographs are stock people: a family on the cover, a woman in the sea
before Safia, a face behind flowers before The Crest, another under the Glen
gradient, and three young people on the back cover. A divider's only content
is the project's name, which is the card's title anyway.

The amenity pages ARE published. Each is the developer's own icon set with its
own labels, and the stock photograph beside it is a decorative panel, not a
picture standing in for a facility the project does not have — which is what
cost ORA's kit its gym and café pages.

    python3 tools/pull_ilcazar_profile.py
"""
import glob
import os
import sys

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'project-media', 'ilcazar', 'profile')
UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'

WIDE = 2200          # a 1440x810 spread, published whole

# Every page that ships, in the profile's own order.
PAGES = [
    2, 3,                                   # introduction, about us
    6, 8, 9, 10, 11, 12, 13, 14,            # The C
    16, 18, 19, 20, 21, 22, 23, 24, 25,     # Safia
    27, 28, 30, 31, 32, 33,                 # The Crest
    34, 35, 36, 37, 38, 39, 40, 41,         # Westdays
    43, 44, 46, 47, 48, 49, 50, 51, 52, 53, # Glen
    54, 55, 56, 58, 59, 60, 61, 62,         # Creek Town
    64, 65, 67, 68, 69, 70,                 # Go Heliopolis
    72, 73, 75, 76, 77, 78,                 # Stoda
]

# Named so the reason survives the run. Anything in here must never ship.
WITHHELD = {
    5:  'portfolio spread — Stoda\'s blurb reads "minutes away from Cairo '
        'International Airport"',
    7:  'ABOUT THE C — "ideally located at 188 km along the pristine shores of '
        'Ras El Hekma". A kilometre marker is an address, not a distance, but '
        'the site\'s own gate flags it and the gate is not worth weakening',
    17: 'SAFIA LOCATION & PROXIMITY MAP — 20 mins El Dabaa Axis, 30 mins '
        'Alamein International Airport, 2:30 hrs Cairo-Alex Desert Road',
    29: 'THE CREST PROXIMITY MAP — 2, 5 and 10 mins',
    45: 'GLEN PROXIMITY MAP — 1, 4, 5 and 30 mins',
    57: 'CREEK TOWN PROXIMITY MAP — 2, 5, 5 and 12 mins',
    66: 'GO HELIOPOLIS PROXIMITY MAP — 2, 5, 10, 10 and 20 mins',
    74: 'STODA PROXIMITY MAP — 2, 5, 10, 20 and 20 mins',
    1:  'cover — a stock photograph of a family',
    4:  'portfolio spread — text only, and all of it is on the cards',
    15: 'Safia divider — a stock photograph of a woman in the sea',
    26: 'The Crest divider — a stock photograph of a face behind flowers',
    42: 'Glen divider — a stock photograph under the gradient',
    63: 'Go Heliopolis divider — a logo over an architectural stock photograph',
    71: 'Stoda divider — a logo over a stock photograph',
    79: 'back cover — a stock photograph of three young people',
}


def main():
    pdfs = glob.glob(UP + 'ac440f7c-*.pdf')
    if not pdfs:
        raise SystemExit('the profile is not where this script expects it')
    doc = pymupdf.open(pdfs[0])
    if doc.page_count != 79:
        raise SystemExit('expected the 79-page profile, got %d' % doc.page_count)

    # Nothing may be both published and withheld, and together they must
    # account for every page in the book.
    clash = sorted(set(PAGES) & set(WITHHELD))
    if clash:
        raise SystemExit('pages both published and withheld: %s' % clash)
    missing = sorted(set(range(1, 80)) - set(PAGES) - set(WITHHELD))
    if missing:
        raise SystemExit('pages neither published nor withheld: %s' % missing)

    os.makedirs(OUT, exist_ok=True)
    for n in PAGES:
        p = doc[n - 1]
        z = WIDE / p.rect.width
        pix = p.get_pixmap(matrix=pymupdf.Matrix(z, z))
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        path = os.path.join(OUT, 'p%02d.webp' % n)
        im.save(path, 'WEBP', quality=86, method=6)
        print('  %-44s %4dx%-4d %6.0f KB'
              % (os.path.relpath(path, ROOT), im.width, im.height,
                 os.path.getsize(path) / 1024))
    print('\n%d of %d pages published to %s'
          % (len(PAGES), doc.page_count, os.path.relpath(OUT, ROOT)))

    print('\nwithheld, on purpose:')
    for n in sorted(WITHHELD):
        print('  p%02d — %s' % (n, WITHHELD[n]))


if __name__ == '__main__':
    main()
