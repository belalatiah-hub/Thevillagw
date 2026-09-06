#!/usr/bin/env python3
"""Cut the Shams Soma kit's assets and inline them into the card.

Run:  python3 tools/build_kit.py [path/to/the/deck.pdf]
      python3 tools/verify_kit.py   # then prove the pages came through untouched


Every sheet in the mockup is a page of the client's deck rendered verbatim:
same pixels, same 16:9 proportion, no crop, no colour move, no overlay. The
only asset that is not a brochure page is the Marakez lockup, taken from the
repository's own logo file, turned white so it can sit on the navy board.

Sizes are roughly twice each sheet's largest on-screen size, which is what a
2x display needs and no more than that.
"""
import base64
import io
import os
import re
import sys

import pymupdf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PDF = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
               'b568d808-Shams_Soma_First_56_Pages.pdf')
SRC = os.path.join(HERE, '..', 'docs', 'cards', 'shams-soma-kit.src.html')
OUT = SRC.replace('.src.html', '.html')
LOGO = os.path.join(HERE, '..', 'logos', 'marakez.png')

# token -> (1-based page, target width, webp quality; 0 = lossless)
#
# Every width is a multiple of 16 so the 960x540 pt page lands on a whole
# number of pixels and the sheet is exactly 16:9 with nothing to stretch.
# Quality is high because these pages are the client's artwork, not decoration;
# the two that are flat navy and type are lossless, which costs almost nothing.
SHEETS = {
    'SHEET_COVER':    (1,  1248,  0),   # the cover: flat field, fine type
    'SHEET_AERIAL':   (26, 1184, 94),   # top sheet of the open folder
    'SHEET_LOCATION': (5,   768, 94),
    'SHEET_PLAN':     (25,  768, 94),
    'SHEET_VALLEY':   (31,  768, 94),
    'SHEET_POOL':     (34,  768, 94),
    'SHEET_COAST':    (53,  928, 94),   # the block, seen from above
    'SHEET_DECKS':    (50,  768, 94),
    'SHEET_DIVIDER':  (19,  624, 94),
}


def page_webp(doc, pno, width, q):
    """Render one page at `width` px and return it as a WebP data URI."""
    page = doc[pno - 1]
    zoom = width / page.rect.width
    pm = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
    im = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)
    if im.width != width:                      # rounding, never a reshape
        im = im.resize((width, round(width * pm.height / pm.width)), Image.LANCZOS)
    buf = io.BytesIO()
    if q:
        im.save(buf, 'WEBP', quality=q, method=6)
    else:
        im.save(buf, 'WEBP', lossless=True, quality=100, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), im.size


def lockup():
    """The Marakez lockup, white, for the navy board."""
    im = Image.open(LOGO).convert('RGBA')
    im = im.resize((im.width * 3, im.height * 3), Image.LANCZOS)
    a = im.split()[3]
    white = Image.new('RGBA', im.size, (255, 255, 255, 0))
    white.putalpha(a)
    buf = io.BytesIO()
    white.save(buf, 'WEBP', quality=92, method=6, lossless=True)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), white.size


def main():
    pdf = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF
    if not os.path.exists(pdf):
        sys.exit('need the deck to cut the sheets from: %s' % pdf)
    doc = pymupdf.open(pdf)
    src = open(SRC, encoding='utf-8').read()
    assets, total = {}, 0

    uri, size = lockup()
    assets['MARK'] = uri
    print('%-14s lockup            %-11s %7.1f KB' % ('MARK', '%dx%d' % size, len(uri) / 1365))
    total += len(uri)

    for tok, (pno, w, q) in SHEETS.items():
        uri, size = page_webp(doc, pno, w, q)
        assets[tok] = uri
        total += len(uri)
        exact = abs(size[0] / size[1] - 16 / 9) < 1e-9
        print('%-14s page %-2d  %-11s %-9s %7.1f KB%s'
              % (tok, pno, '%dx%d' % size, 'lossless' if not q else 'q%d' % q,
                 len(uri) / 1365, '' if exact else '   NOT 16:9'))

    missing = [t for t in re.findall(r'__([A-Z_]+)__', src) if t not in assets]
    unused = [t for t in assets if '__%s__' % t not in src]
    if missing:
        sys.exit('src references assets that were not built: %s' % ', '.join(sorted(set(missing))))
    if unused:
        sys.exit('built assets that the src never uses: %s' % ', '.join(sorted(unused)))

    for tok, uri in assets.items():
        src = src.replace('__%s__' % tok, uri)
    open(OUT, 'w', encoding='utf-8').write(src)
    print('\n%-14s %.2f MB  (%.2f MB of it images)'
          % (os.path.basename(OUT), os.path.getsize(OUT) / 1048576, total / 1048576))


if __name__ == '__main__':
    main()
