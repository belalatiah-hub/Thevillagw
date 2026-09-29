#!/usr/bin/env python3
"""Creek Town's own brochure and image archive, which arrived after its card.

The card shipped first with figures from the client sheet and pictures from IL
Cazar's company profile, and said plainly that no brochure and no archive had
been sent and that its five units therefore carried no picture of their own.
Both arrived. This closes that gap.

WHAT THE TWO SOURCES AGREE ON. Every code the sheet's four columns name is in
the archive, and every floor plan prints the area its row claims: fp-v-creek1
is headed "BUILT UP AREA 420 M²" over ground 168, first 182, penthouse 70 and
terrace 80; fp-th1-creek-1 is 210 M² over 85, 90, 35 and 45; fp-th2-creek-1 is
185 M² over 76.6, 76.6, 32.1 and 55; fp-ap1-creek is headed "128 M² TWO
BEDROOMS" and fp-ap2-creek "170 M² THREE BEDROOMS". The brochure names the same
five products — PRIME VILLAS 420 M² TYPE K, TOWN VILLAS 210 M² TYPE R, TOWN
VILLAS 185 M² TYPE T, and the 128 and 170 layouts inside APARTMENTS MODEL B and
MODEL A — and those names are what the cards are called.

THE LOCATION MAP IS CROPPED. Both the brochure's p05 and the archive's copy of
the same drawing print "2 Minutes To Rehab City / 5 Minutes To 90 North Road /
5 Minutes To Airport / 12 Minutes To New Capital", once as a list in the map's
top-right corner and once inside the green panel's paragraph on the left. A
single rectangle can drop both: the green panel ends at x=402 and the list
bottoms out at y=176, so cropping to (402, 176) leaves the interchange, the
CREEKTOWN polygon, NEW SUEZ ROAD, TOLIP and REHAB ENTRANCE #2, and no claim.
It costs the top of the cloverleaf, which is the price of the rule. The
brochure page itself does not ship; only the cropped archive drawing does, and
tools/verify_no_drivetimes.py is what says so rather than an eye.

WHAT ELSE IS LEFT OUT. The four facility spreads — CLUBHOUSES, FITNESS, SMART
COMPOUND, CONCIERGE, BICYCLE LANES, COMMERCIAL FACILITIES — are bought
photographs of a tennis player, a pool ball, a gym, a woman at a tablet, two
people shaking hands, a cyclist and a woman with a coffee. Not one of them is
Creek Town. Their words are on the card; their pictures are not, the same call
that cost ORA's kit and The Crest's the same pages. The section dividers are
stock palm leaves, the About page is a stock photograph of the Colosseum, and
the covers carry nothing but the name.

    python3 tools/pull_ilcazar_creek.py
"""
import glob
import os
import subprocess
import tempfile

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'project-media', 'ilcazar', 'creek-town')
UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'

WIDE = 2000          # a 2:1 brochure spread, published whole
UNIT = 1400          # a render or a plan out of the archive

PAGES = [4, 7] + list(range(13, 62))
WITHHELD = {
    1:  'the cover — the name on a green field, no picture',
    2:  'ABOUT ILCAZAR — a stock photograph of the Colosseum',
    3:  'SECTION 01 divider — stock palm leaves',
    5:  'LOCATION — 2 minutes to Rehab City, 5 to 90 North Road, 5 to the '
        'airport, 12 to the New Capital, printed as a list and again in the '
        'paragraph. The archive holds the same drawing and it ships cropped',
    6:  'SECTION 03 divider — stock palm leaves',
    8:  'SECTION 04 divider — a stock leaf',
    9:  'CLUBHOUSES and FITNESS — a stock tennis player, a pool ball, a man in '
        'a gym and a woman with a kettlebell; the words are on the card',
    10: 'SMART COMPOUND and CONCIERGE — a stock woman at a wall tablet and two '
        'people shaking hands',
    11: 'BICYCLE LANES and COMMERCIAL FACILITIES — a stock cyclist and a woman '
        'with a coffee',
    12: 'UNIT TYPES divider — a stock leaf',
    62: 'the back cover — the name on a green field',
}

# (archive file, published name). Everything the sheet's columns name, plus the
# rest of each set and the second sheet of each plan.
ARCH = [
    ('v-creek-0.PNG', 'units/v-creek-0'), ('v-creek-1.PNG', 'units/v-creek-1'),
    ('th-creek-0.PNG', 'units/th-creek-0'), ('th-creek-1.PNG', 'units/th-creek-1'),
    ('ap1-creek-0.PNG', 'units/ap1-creek-0'), ('ap1-creek-1.PNG', 'units/ap1-creek-1'),
    ('ap1-creek-2.PNG', 'units/ap1-creek-2'),
    ('fp-v-creek.PNG', 'fp/v-floors'), ('fp-v-creek1.PNG', 'fp/v-penthouse'),
    ('fp-th1-creek-0.PNG', 'fp/th1-floors'), ('fp-th1-creek-1.PNG', 'fp/th1-penthouse'),
    ('fp-th2-creek-0.PNG', 'fp/th2-floors'), ('fp-th2-creek-1.PNG', 'fp/th2-penthouse'),
    ('fp-ap1-creek.PNG', 'fp/ap-128'), ('fp-ap2-creek.PNG', 'fp/ap-170'),
]
DUP = {
    'mp-creek town.PNG': 'the master plan again, at 1205px. The brochure\'s p07 '
                         'is the same drawing at 2000px and is what the site '
                         'shows',
}
# The one crop here, for the reason set out in the docstring. The source is
# 1201x590: the green text panel ends at x=402, the minutes list at y=176.
LOC = ('location creek town.PNG', 'location', (402, 176, 1201, 590))


def flatten(im):
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert('RGB')


def save(im, rel, width):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, rel + '.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=86, method=6)
    return path


def main():
    pdfs = glob.glob(UP + 'bf668369-*.pdf')
    if not pdfs:
        raise SystemExit('the Creek Town brochure is not where this expects it')
    doc = pymupdf.open(pdfs[0])
    if doc.page_count != 62:
        raise SystemExit('expected the 62-spread brochure, got %d' % doc.page_count)
    clash = sorted(set(PAGES) & set(WITHHELD))
    if clash:
        raise SystemExit('spreads both published and withheld: %s' % clash)
    gap = sorted(set(range(1, 63)) - set(PAGES) - set(WITHHELD))
    if gap:
        raise SystemExit('spreads neither published nor withheld: %s' % gap)

    made = []
    for n in PAGES:
        p = doc[n - 1]
        z = WIDE / p.rect.width
        px = p.get_pixmap(matrix=pymupdf.Matrix(z, z))
        made.append(save(Image.frombytes('RGB', (px.width, px.height), px.samples),
                         'kit/p%02d' % n, WIDE))

    tmp = tempfile.mkdtemp(prefix='ck-')
    subprocess.run(['bsdtar', '-xf', UP + '571dc684-creek.rar', '-C', tmp], check=True)
    had = set(os.listdir(tmp))
    used = {s for s, _ in ARCH} | set(DUP) | {LOC[0]}
    if sorted(used - had):
        raise SystemExit('named but not in the archive: %s' % sorted(used - had))
    if sorted(had - used):
        raise SystemExit('in the archive and unaccounted for: %s' % sorted(had - used))
    for src, rel in ARCH:
        made.append(save(flatten(Image.open(os.path.join(tmp, src))), rel, UNIT))
    made.append(save(flatten(Image.open(os.path.join(tmp, LOC[0]))).crop(LOC[2]),
                     LOC[1], UNIT))

    for path in made:
        im = Image.open(path)
        print('  %-50s %4dx%-4d %6.0f KB'
              % (os.path.relpath(path, ROOT), im.width, im.height,
                 os.path.getsize(path) / 1024))
    print('\n%d files' % len(made))
    print('\nspreads withheld, on purpose:')
    for n in sorted(WITHHELD):
        print('  p%02d — %s' % (n, WITHHELD[n]))
    print('archive files dropped as duplicates:')
    for k in sorted(DUP):
        print('  %-22s %s' % (k, DUP[k]))


if __name__ == '__main__':
    main()
