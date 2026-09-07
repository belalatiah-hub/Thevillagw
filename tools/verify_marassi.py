#!/usr/bin/env python3
"""Prove the Marassi card reproduces the brochure and does not redraw it.

The brief for that card was that the brochure is the only source: no picture
replaced with a stock shot, no page recoloured, nothing lifted from another
project. That is a claim about bytes, so it is checked against bytes rather
than trusted. For every picture embedded in the card this decodes the data
URI, cuts the same rectangle out of the same brochure page straight from the
PDF, and compares them.

  where    the page it comes from and the fraction of that page it cuts
  drift    mean |difference| per channel, 0-255. Codec quantisation lives
           here and nothing else should: it is noise in fine detail, so it
           stays low and, being noise, cancels in the next column.
  tint     mean *signed* shift per channel. A recolour, a tint or a light
           overlay moves this off zero; quantisation does not.

The brochure pages are already lossy JPEG inside the PDF, and the card
re-encodes them as WebP at q80 after a Lanczos downscale, so drift here is
larger than on a card built from lossless sources. Tint is the column that
catches tampering, and it stays at zero either way.

Run:  python3 tools/verify_marassi.py [path/to/the/pdf]
"""
import base64
import io
import os
import re
import sys

import pymupdf
from PIL import Image, ImageChops

CARD = os.path.join(os.path.dirname(__file__), '..', 'docs', 'cards', 'marassi.html')
SRC = CARD.replace('.html', '.src.html')
DEFAULT_PDF = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
               '649de7f1-Marassi_Red_Sea_First_30_Pages_compressed_1.pdf')

FULL = (0, 0, 1, 1)

# Where every picture in the card came from: its page in the brochure, and the
# rectangle of that page it cuts, as fractions of the page. The order here is
# the order the pages run in, which is also the order the card shows them.
CROPS = {
    'COVER': (1, FULL),
    'P03':   (3, FULL),
    'P04A':  (4, (0.027, 0.047, 0.473, 0.494)),
    'P04B':  (4, (0.027, 0.505, 0.473, 0.951)),
    'P05':   (5, (0, 0.049, 0.500, 1)),
    'P06':   (6, FULL),
    'P07':   (7, (0.500, 0, 1, 1)),
    'P08':   (8, FULL),
    'P09':   (9, (0.037, 0.047, 0.967, 0.951)),
    'P10':  (10, FULL),
    'P11':  (11, (0, 0.049, 0.500, 1)),
    'P12A': (12, (0.030, 0.045, 0.470, 0.952)),
    'P12B': (12, (0.530, 0.045, 0.970, 0.952)),
    'P13':  (13, FULL),
    'P14':  (14, (0, 0.049, 0.500, 1)),
    'P15':  (15, FULL),
    'P16':  (16, (0, 0.049, 0.500, 1)),
    'P17':  (17, (0, 0, 1, 0.822)),
    'P18':  (18, (0.340, 0, 1, 1)),
    'P19':  (19, (0.340, 0, 1, 1)),
    'P20':  (20, (0.340, 0, 1, 1)),
    'P21':  (21, (0.340, 0, 1, 1)),
    'P22':  (22, (0, 0, 1, 0.822)),
    'P23':  (23, (0.520, 0.235, 0.960, 0.765)),
    'P24':  (24, (0.340, 0, 1, 1)),
    'P25':  (25, FULL),
    'P26':  (26, FULL),
    'P27':  (27, (0.340, 0, 1, 1)),
    'P28':  (28, FULL),
    'P29':  (29, FULL),
    'P30':  (30, FULL),
}
DRIFT = 5.0            # counts out of 255; the densest page here re-encodes to 4.3
TINT = 0.40            # counts out of 255, per channel; observed max is 0.33


def pictures():
    """Pair each __TOKEN__ in the source with the data URI that replaced it."""
    src = open(SRC, encoding='utf-8').read()
    out = open(CARD, encoding='utf-8').read()
    parts = re.split(r'__([A-Z_0-9]+)__', src)
    # parts alternates literal, token, literal, token, ... so the literal before
    # and after a token bracket the data URI that took its place.
    found, pos = [], 0
    for i in range(1, len(parts), 2):
        token, before, after = parts[i], parts[i - 1], parts[i + 1]
        start = out.index(before[-40:], pos) + 40
        end = out.index(after[:40], start)
        found.append((token, out[start:end]))
        pos = end
    return found


def page_crop(doc, n, box, size):
    """The same rectangle of the same page, cut to the same pixel size.

    Every page of this brochure is one flattened image, so the page's own
    embedded picture is the source of record — not a re-render of the page.
    Rendering it through MuPDF instead would put a second JPEG decoder in the
    path and shift every comparison by half a count in the same direction,
    which would say more about the two decoders than about the card.
    """
    page = doc[n - 1]
    xrefs = page.get_images(full=True)
    if len(xrefs) != 1:
        raise SystemExit('page %d carries %d images, expected 1' % (n, len(xrefs)))
    im = Image.open(io.BytesIO(doc.extract_image(xrefs[0][0])['image'])).convert('RGB')
    w, h = im.size
    im = im.crop((round(box[0] * w), round(box[1] * h),
                  round(box[2] * w), round(box[3] * h)))
    return im.resize(size, Image.LANCZOS) if im.size != size else im


def compare(a, b):
    """Mean absolute and mean signed difference, per channel, 0-255."""
    n = a.size[0] * a.size[1]
    diff = ImageChops.difference(a, b)
    drift = sum(sum(i * v for i, v in enumerate(diff.split()[c].histogram())) / n
                for c in range(3)) / 3
    tint = sum(
        (sum(i * v for i, v in enumerate(a.split()[c].histogram())) -
         sum(i * v for i, v in enumerate(b.split()[c].histogram()))) / n
        for c in range(3)) / 3
    return drift, tint


def main():
    pdf = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF
    if not os.path.exists(pdf):
        sys.exit('the brochure is not at %s — pass its path as an argument' % pdf)
    doc = pymupdf.open(pdf)

    print('%-7s %-5s %-22s %-11s %8s %8s' %
          ('', 'page', 'cut of the page', 'size', 'drift', 'tint'))
    suspect = 0
    for token, uri in pictures():
        if token not in CROPS:
            print('%-7s  no provenance recorded' % token)
            suspect += 1
            continue
        n, box = CROPS[token]
        raw = base64.b64decode(uri.split(',', 1)[1])
        got = Image.open(io.BytesIO(raw)).convert('RGB')
        want = page_crop(doc, n, box, got.size)
        drift, tint = compare(got, want)
        bad = drift > DRIFT or abs(tint) > TINT
        suspect += bad
        print('%-7s %-5d %-22s %-11s %8.3f %+8.3f%s' % (
            token, n,
            'whole page' if box == FULL else
            'x %.2f-%.2f  y %.2f-%.2f' % (box[0], box[2], box[1], box[3]),
            '%dx%d' % got.size, drift, tint, '   SUSPECT' if bad else ''))

    print('\n%d pictures, %d suspect' % (len(CROPS), suspect))
    return 1 if suspect else 0


if __name__ == '__main__':
    sys.exit(main())
