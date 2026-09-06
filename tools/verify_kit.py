#!/usr/bin/env python3
"""Prove the Shams Soma kit reproduces the brochure and does not redraw it.

The brief for that card was that the deck stays untouched: no crop, no
recolour, no reshaping. That is a claim about bytes, so it is checked against
bytes rather than trusted. For every sheet embedded in the card this decodes
the data URI, re-renders the page it names straight from the PDF at the same
pixel size, and compares them.

  aspect   must be exactly 16:9, the page's own 960x540 pt
  drift    mean |difference| per channel, 0-255. Codec quantisation lives
           here and nothing else should: it is noise in fine detail, so it
           stays low and, being noise, cancels in the next column.
  tint     mean *signed* shift per channel. A recolour, a tint or a light
           overlay moves this off zero; quantisation does not.

Run:  python3 tools/verify_kit.py [path/to/the/pdf]
"""
import base64
import io
import os
import re
import sys

import pymupdf
from PIL import Image, ImageChops

CARD = os.path.join(os.path.dirname(__file__), '..', 'docs', 'cards', 'shams-soma-kit.html')
SRC = CARD.replace('.html', '.src.html')
DEFAULT_PDF = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
               'b568d808-Shams_Soma_First_56_Pages.pdf')

# which page each sheet in the card is
PAGES = {
    'SHEET_COVER': 1, 'SHEET_LOCATION': 5, 'SHEET_DIVIDER': 19, 'SHEET_PLAN': 25,
    'SHEET_AERIAL': 26, 'SHEET_VALLEY': 31, 'SHEET_POOL': 34, 'SHEET_DECKS': 50,
    'SHEET_COAST': 53,
}
DRIFT = 2.0            # counts out of 255; WebP q94 on a dense page sits near 1.8
TINT = 0.25            # counts out of 255, per channel


def sheets():
    """Pair each __TOKEN__ in the source with the data URI that replaced it."""
    src = open(SRC, encoding='utf-8').read()
    out = open(CARD, encoding='utf-8').read()
    tokens = re.findall(r'src="__([A-Z_]+)__"', src)
    uris = re.findall(r'src="(data:image/webp;base64,[^"]+)"', out)
    if len(tokens) != len(uris):
        sys.exit('the card has %d embedded images, the source has %d slots'
                 % (len(uris), len(tokens)))
    return list(zip(tokens, uris))


def main():
    pdf = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF
    if not os.path.exists(pdf):
        sys.exit('need the deck to compare against: %s' % pdf)
    doc = pymupdf.open(pdf)

    print('%-15s %-5s %-11s %-8s %-7s %s'
          % ('sheet', 'page', 'pixels', 'aspect', 'drift', 'tint r/g/b'))
    seen, bad = {}, 0
    for tok, uri in sheets():
        if tok in seen:                       # the same page used twice must be the same bytes
            if seen[tok] != uri:
                print('%-15s two copies of this sheet differ' % tok)
                bad += 1
            continue
        seen[tok] = uri

        im = Image.open(io.BytesIO(base64.b64decode(uri.split(',', 1)[1]))).convert('RGB')
        page = doc[PAGES[tok] - 1]
        zoom = im.width / page.rect.width
        pm = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        ref = Image.frombytes('RGB', (pm.width, pm.height), pm.samples)

        note = ''
        if ref.size != im.size:
            note = '  size %dx%d vs %dx%d' % (ref.size + im.size)
            ref = ref.resize(im.size, Image.LANCZOS)
        px = im.width * im.height
        hist = ImageChops.difference(im, ref).convert('L').histogram()
        drift = sum(i * n for i, n in enumerate(hist)) / px
        # signed, per channel: the average direction the pixels moved
        tint = [sum(im.getchannel(c).histogram()[i] * i for i in range(256)) / px
                - sum(ref.getchannel(c).histogram()[i] * i for i in range(256)) / px
                for c in range(3)]
        square = abs(im.width / im.height - 16 / 9) < 1e-9

        ok = square and drift <= DRIFT and max(abs(t) for t in tint) <= TINT and not note
        bad += not ok
        print('%-15s %-5d %-11s %-8s %-7.3f %+.3f %+.3f %+.3f%s%s'
              % (tok, PAGES[tok], '%dx%d' % im.size, '16:9' if square else 'OFF',
                 drift, tint[0], tint[1], tint[2], note, '' if ok else '   <-- CHECK'))

    print('\n%d sheets, %d suspect' % (len(seen), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
