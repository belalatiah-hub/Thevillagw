#!/usr/bin/env python3
"""Lift The Crest and Safia onto their own project cards, and their units' media.

Four sources arrived together: The Crest's 40-page apartments brochure, Safia's
71-page e-brochure, an image archive for each, and the client sheet's fourteen
IL Cazar rows across three projects — The Crest (6), Creek Town (5) and Safia
(3).

WHAT COMES FROM WHERE. The archives carry exactly what the sheet's four code
columns name — image, floor plan, master plan, location — and nothing in them
is orphaned or guessed. The brochures carry the projects' own figures and the
rest of their floor-plan books. Where the two overlap they agree: Safia's
Chalet B prints 72 m² for a one-bedroom and Chalet D prints 138 m² for a
three-bedroom and 105 m² for a two-bedroom, which is the sheet's three rows
exactly; The Crest's archive plans print 115, 135, 80, 196, 180 and 220, which
is the sheet's six.

CREEK TOWN HAS NO ARCHIVE. Its five rows name image, plan, master-plan and
location codes like the others, and not one of those files was sent. Its units
go up with their figures and no pictures of their own rather than borrowing
another project's, and the gap is reported.

WHAT IS LEFT OUT

Safia p07 is titled LOCATION MAP and prints 2:30 hours from the Cairo–Alex
desert road, 30 minutes from Alamein International Airport and 20 minutes from
El Dabaa Axis, in a paragraph and again as a list. The same drawing arrived in
the archive as `location safia.PNG` with the same text block. The page does not
ship; the archive copy is CROPPED instead — the travel text ends at y=322 and
the first map pin label starts at y=347, so a cut at y=330 drops every claim
and keeps every pin, which is checked by OCR below rather than assumed. The
crop also loses the coastline's far-western tip, which sat beside the text.

The Crest p04 says its plot is "in close proximity to the AUC and New Capital"
— a qualitative phrase with no number, and the page carries no travel time. The
site's own gate passes it, so the map ships.

Everything else is decided by one rule, applied the same way to both books: a
page ships if it carries a render or photograph OF THE PROJECT, and is withheld
if every picture on it is stock. So The Crest's FACILITIES and GYM/DINING/
NURSERY pages stay off — they put a café, a gym and a child where the built
thing should be, which is what cost ORA's kit the same pages — while its p09
ships, because half of it is the clubhouse at dusk and the couple beside it is
only a panel. Safia's p10, p15, p20 and p21 ship for the same reason: a beach
club, a beach, a gym and a boulevard, each next to a stock photograph that
decorates rather than substitutes. Its p19 does not: a cropped pool edge and a
tennis ball on grass, and there is no telling whose they are. Withheld pages'
words still reach the cards; their pictures do not. Contact pages go too —
this site publishes no phone numbers.

    python3 tools/pull_ilcazar_projects.py
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'

WIDE = 2000          # a brochure spread, published whole
UNIT = 1400          # a render or a plan out of an archive

# ---------------------------------------------------------------- brochures
CREST_PAGES = [4, 5, 6, 7, 13, 15, 16, 17, 18, 19,
               20, 21, 22, 23, 24, 25, 26,
               27, 28, 29, 30, 31, 32,
               33, 34, 35, 36, 37, 38]
CREST_OUT = {
    1: 'cover — a stock photograph of a woman in a hat',
    2: 'a stock photograph of a person holding the brochure',
    3: 'OUR STORY / ABOUT PROJECT — stock flowers over a face; its words are on the card',
    8: '"SPANNING AN IMPRESSIVE 158 ACRES" — half the page is a stock photograph '
       'of a woman in a field; the figure and the five zone names are on the card',
    9:  'half a stock photograph of a couple. The other half is the clubhouse '
        'at dusk, which is published on its own as clubhouse.webp',
    10: 'CONCEPT — stock blurs; its words are on the card',
    11: 'FACILITIES — a hand holding a pomegranate and a restaurant interior, '
        'standing in for the hypermarkets and the clubhouse',
    12: 'GYM / DINING / NURSERY — a gym, a woman in a café and a child, standing '
        'in for three facilities; the six names are on the card',
    14: 'FLOOR PLANS divider — a stock photograph of a woman',
    39: 'blank',
    40: 'the contact page — this site publishes no phone number or address',
}

SAFIA_PAGES = [9, 10, 11, 12, 13, 14, 15, 20, 21] + list(range(22, 70))
SAFIA_OUT = {
    1: 'cover — a stock photograph of a pool',
    2: 'SECTION 01 divider — a stock photograph of a woman',
    3: 'DISCOVER IL CAZAR — stock deckchair and sunglasses; its words are on the card',
    4: 'SECTION 02 divider — a stock photograph of a sunbather',
    5: 'SAFIA\'S SEASIDE HAVEN — a stock photograph of a woman in sunglasses; '
       'the 180 acres, 15%, nine rows, 750 m beachfront, 5–40 m and 1500 m are on the card',
    6: 'SECTION 03 divider — a stock hat and starfish',
    7: 'LOCATION MAP — 2:30 hrs from the Cairo–Alex desert road, 30 mins from '
       'Alamein International Airport, 20 mins from El Dabaa Axis. The archive '
       'copy of this drawing is cropped and published instead',
    8: 'SECTION 04 divider — a stock palm frond',
    16: 'SECTION 06 divider — a stock photograph of a woman',
    17: 'DINE AND SHINE — stock food photography standing in for the restaurants',
    18: 'EXCITING WATERSPORTS — a stock beach ball and jet ski',
    19: 'SPORTS FACILITIES — a cropped pool edge and a tennis ball on grass, '
        'neither of which can be told to be the project\'s own',
    70: 'the contact page — this site publishes no phone number or address',
    71: 'blank',
}

# ------------------------------------------------------------------ archives
# (archive file, published name). Everything the sheet's four code columns name,
# plus the rest of each unit's own set and the extra pages of its plan.
CREST_ARCH = [
    ('crest1.png', 'units/crest1'), ('crest2.PNG', 'units/crest2'),
    ('crest3.PNG', 'units/crest3'), ('crest4.PNG', 'units/crest4'),
    ('th1-crest1.PNG', 'units/th1-crest1'), ('th1-crest2.PNG', 'units/th1-crest2'),
    ('v-crest1.PNG', 'units/v-crest1'), ('v-crest2.PNG', 'units/v-crest2'),
    ('v-crest3.PNG', 'units/v-crest3'), ('v-crest4.PNG', 'units/v-crest4'),
    ('fp-crest1.PNG', 'fp/crest1'), ('fp-ap-crest2.PNG', 'fp/crest2'),
    ('fp-ap3-crest.PNG', 'fp/crest3'), ('fp-penthouse.PNG', 'fp/penthouse'),
    # The townhouse arrived as five files, but three drawings: crest2 and crest
    # are the titled ground and first floors at 2717px, crest3 and crest4 are
    # the same two drawings cropped small and untitled, and crest5 is the only
    # roof. The duplicates are dropped, named in CREST_DUP below.
    ('fp-th1-crest2.png', 'fp/th1-ground'), ('fp-th1-crest.png', 'fp/th1-first'),
    ('fp-th1-crest5.PNG', 'fp/th1-roof'),
    # The villa's first file carries its ground and first floors together.
    ('fp-v1-crest1.PNG', 'fp/v1-plans'), ('fp-v1-crest2.PNG', 'fp/v1-roof'),
]
CREST_DUP = {
    'fp-th1-crest3.PNG': 'the ground floor again, cropped to 615x723 and untitled',
    'fp-th1-crest4.PNG': 'the first floor again, cropped to 578x658 and untitled',
    'mp-the crest.PNG': 'the master plan again. The brochure\'s p05 is the same '
                        'drawing at 2000px, so that is what the site shows',
    'location-the crest.PNG': 'the location map again — the brochure\'s p04, '
                              'same roads, same four markers, at 2000px',
}
SAFIA_ARCH = [
    ('ch1.PNG', 'units/ch1'),
    ('ch2-0.PNG', 'units/ch2-0'), ('ch2-1.PNG', 'units/ch2-1'), ('ch2.PNG', 'units/ch2'),
    ('ch3-0.PNG', 'units/ch3-0'), ('ch3-1.PNG', 'units/ch3-1'), ('ch3.PNG', 'units/ch3'),
    ('fp-ch1-safia-0.PNG', 'fp/ch1'), ('fp-ch2-safia.PNG', 'fp/ch2'),
    ('fp-ch3-safia.PNG', 'fp/ch3'),
]
SAFIA_DUP = {
    'mp-safia.PNG': 'the master plan again. The brochure\'s p09 is the same '
                    'drawing, same nine-line legend, same elevation ladder, '
                    'at 2000px',
    's1.PNG': 'the beach from the air — the brochure\'s p11, at 1220px',
    's2.PNG': 'the boulevard — the brochure\'s p12, at 1220px',
    's3.PNG': 'the pool and the beach — the brochure\'s p13, at 1220px',
    's4.PNG': 'the terrace and its view — the brochure\'s p14, at 1220px',
}
# The two crops in this script, each for the reason set out in the docstring.
# The Crest's location map is not among them: its archive copy duplicates
# brochure p04, which carries no travel claim and ships whole.
SAFIA_LOC = ('location safia.PNG', 'location', (0, 330, 1397, 651))
# The Crest p09 is split down the middle at x=1000 of 2000: the clubhouse at
# dusk on the left, a stock photograph of a couple on a maroon panel on the
# right. The page does not ship; its left half does, under its own name.
CREST_CLUB = (9, 'clubhouse', (0, 0, 1000, 1125))


def rip(rar):
    tmp = tempfile.mkdtemp(prefix='ic-')
    subprocess.run(['bsdtar', '-xf', rar, '-C', tmp], check=True)
    return tmp


def flatten(im):
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert('RGB')


def save(im, out, rel, width):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(out, rel + '.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=86, method=6)
    return path


def pages(doc, keep, out, made):
    for n in keep:
        p = doc[n - 1]
        z = WIDE / p.rect.width
        pix = p.get_pixmap(matrix=pymupdf.Matrix(z, z))
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        made.append(save(im, out, 'kit/p%02d' % n, WIDE))


def archive(tmp, items, out, made, width=UNIT):
    for src, rel in items:
        made.append(save(flatten(Image.open(os.path.join(tmp, src))), out, rel, width))


def account(tmp, items, extra, label):
    """Nothing in an archive may be dropped without being named."""
    had = set(os.listdir(tmp))
    used = {s for s, _ in items} | set(extra)
    gone = sorted(used - had)
    if gone:
        raise SystemExit('%s: named but not in the archive: %s' % (label, gone))
    left = sorted(had - used)
    if left:
        raise SystemExit('%s: in the archive and unaccounted for: %s' % (label, left))


def main():
    made = []

    # ---- The Crest ------------------------------------------------------
    out = os.path.join(ROOT, 'project-media', 'ilcazar', 'the-crest')
    pdf = glob.glob(UP + 'e89bf29f-*.pdf')[0]
    doc = pymupdf.open(pdf)
    if doc.page_count != 40:
        raise SystemExit('The Crest brochure is %d pages, expected 40' % doc.page_count)
    both = sorted(set(CREST_PAGES) & set(CREST_OUT))
    if both:
        raise SystemExit('Crest pages both published and withheld: %s' % both)
    gap = sorted(set(range(1, 41)) - set(CREST_PAGES) - set(CREST_OUT))
    if gap:
        raise SystemExit('Crest pages neither published nor withheld: %s' % gap)
    pages(doc, CREST_PAGES, out, made)
    # The one page published as a crop rather than whole.
    pg = doc[CREST_CLUB[0] - 1]
    z = WIDE / pg.rect.width
    px = pg.get_pixmap(matrix=pymupdf.Matrix(z, z))
    made.append(save(Image.frombytes('RGB', (px.width, px.height), px.samples)
                     .crop(CREST_CLUB[2]), out, CREST_CLUB[1], WIDE))
    tmp = rip(UP + '996e809a-the_crest.rar')
    account(tmp, CREST_ARCH, list(CREST_DUP), 'The Crest')
    archive(tmp, CREST_ARCH, out, made)

    # ---- Safia ----------------------------------------------------------
    out = os.path.join(ROOT, 'project-media', 'ilcazar', 'safia')
    pdf = glob.glob(UP + '0dac93ca-*.pdf')[0]
    doc = pymupdf.open(pdf)
    if doc.page_count != 71:
        raise SystemExit('Safia brochure is %d pages, expected 71' % doc.page_count)
    both = sorted(set(SAFIA_PAGES) & set(SAFIA_OUT))
    if both:
        raise SystemExit('Safia pages both published and withheld: %s' % both)
    gap = sorted(set(range(1, 72)) - set(SAFIA_PAGES) - set(SAFIA_OUT))
    if gap:
        raise SystemExit('Safia pages neither published nor withheld: %s' % gap)
    pages(doc, SAFIA_PAGES, out, made)
    tmp = rip(UP + '73b2ba0a-safia.rar')
    account(tmp, SAFIA_ARCH, list(SAFIA_DUP) + [SAFIA_LOC[0]], 'Safia')
    archive(tmp, SAFIA_ARCH, out, made)
    # The one crop in this script, and the reason it exists is in the docstring.
    loc = flatten(Image.open(os.path.join(tmp, SAFIA_LOC[0]))).crop(SAFIA_LOC[2])
    made.append(save(loc, out, SAFIA_LOC[1], UNIT))

    for path in made:
        im = Image.open(path)
        print('  %-52s %4dx%-4d %6.0f KB'
              % (os.path.relpath(path, ROOT), im.width, im.height,
                 os.path.getsize(path) / 1024))
    print('\n%d files' % len(made))

    print('\nThe Crest — pages withheld, on purpose:')
    for n in sorted(CREST_OUT):
        print('  p%02d — %s' % (n, CREST_OUT[n]))
    print('The Crest — archive files dropped as duplicates:')
    for k in sorted(CREST_DUP):
        print('  %-24s %s' % (k, CREST_DUP[k]))
    print('\nSafia — pages withheld, on purpose:')
    for n in sorted(SAFIA_OUT):
        print('  p%02d — %s' % (n, SAFIA_OUT[n]))
    print('Safia — archive files dropped as duplicates:')
    for k in sorted(SAFIA_DUP):
        print('  %-24s %s' % (k, SAFIA_DUP[k]))
    print('\nCreek Town: the sheet names v-creek-0, th-creek-0, th-creek-1, '
          'ap1-creek-0,\n  ap1-creek-2, mp-creek town, location creek town and five '
          'fp-*-creek files.\n  None was sent. Its five rows go up without pictures '
          'rather than borrowing.')


if __name__ == '__main__':
    main()
