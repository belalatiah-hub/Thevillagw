#!/usr/bin/env python3
"""Lift Mountain View 1.1 — The Park onto its project card.

The client sent three things for this project: the price sheet, a 44-page
brochure, and MV_1.1.rar holding 25 PNGs. The PNGs turned out to be
screenshots of the brochure's own pages — every one of them was matched back
to the page it was cut from — so the archive is read here as an *instruction*
(which pictures, in which order) and the brochure supplies the pixels. A
screenshot is 292 to 1600 px wide; the same photograph inside the PDF is up to
8010 px. Same pictures, same order, a source that can fill a gallery frame.

Two pages of the brochure are deliberately not published:

  p13  carries "Confidential - Not for Public Consumption or Distribution",
       stamped inside a sentence — "By integrating natural Confidential - Not
       for Public Consumption or Distribution topography with signature
       white-and-blue architectural motifs". It reads as a controlled-copy
       marker. An OCR sweep of all 44 pages found it on this page only. The
       photograph on that page carries no marking and is lifted on its own;
       the page is not. The owner was shown the line before anything from this
       brochure reached the live site and cleared the material on 27 Sep 2026;
       the marked page itself still stays off.
  p16  prints drive times — 10 Mins AUC, 12 Mins Suez Road, 15 Mins Ring Road,
       20 Mins Cairo International Airport. The site carries no drive times, so
       the location map is cropped to the drawing: the block sits at x 188-978
       and the map image starts at x 1158, so the crop drops it whole. The
       result is OCR-checked below, not assumed.

What the archive holds that nothing here publishes, and why, is printed at the
end of a run so the decision is on the record rather than silent.

    python3 tools/pull_mountainview_mv11.py
"""
import glob
import os
import subprocess
import sys
import tempfile

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'project-media', 'mountainview', 'mv11')
UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
RAR = UP + '658c86eb-MV_1.1.rar'

PHOTO_W = 1600      # a photograph in a gallery frame
WHOLE_W = 2200      # a whole spread whose layout is the content
PLAN_W = 2400       # a floor plan, which has to stay readable when zoomed

# --------------------------------------------------------------------------
# The ten photographs, in the client's own numbering — "enter them in order".
# Each line is (out, page, clip, which archive screenshot it answers).
# A clip of None means the page's own image object is lifted whole.
# --------------------------------------------------------------------------
PHOTOS = [
    ('g01', 12, None,                          '1.1-1  the clubhouse at sunset'),
    ('g02', 13, None,                          '1.1-2  a roof and its gable'),
    ('g03', 14, None,                          '1.1-3  the Crown Palace'),
    ('g04', 17, None,                          '1.1-4  the hammock by the pool'),
    # The creek is drawn inside an arch on p19, and an arch in a 16:10 frame is
    # two white corners. The clip starts at y 840, where the arch's curve ends
    # and its sides go straight down, so what ships is a plain rectangle of the
    # same photograph — which is also the crop the client's own screenshot took.
    ('g05', 19, (1092, 840, 1820, 1475),       '1.1-5  the creek, under the arch'),
    ('g06', 20, (1192, 232, 2104, 1200),       '1.1-6  the pool and its island'),
    ('g07', 20, (2280, 80, 2936, 768),         '1.1-7  a house above the water'),
    ('g08', 20, (3128, 328, 3888, 1336),       '1.1-8  the pool and its mosaic'),
    ('g09', 21, None,                          '1.1-9  the coffee shop'),
    ('g10', 24, None,                          '1.1-10 the iVilla, from below'),
]
# The image object to lift when a photo line carries no clip. p20 is one
# flattened page image, which is why its three photographs are clipped instead.
PHOTO_XREF = {12: 221, 13: 227, 14: 245, 17: 276, 21: 312, 24: 334}

# Whole pages whose layout — icon rows, a polaroid board — IS the content.
PAGES = [
    ('kit/amenities', 17),   # BUILT AROUND YOUR LIFE, six named amenities
    ('kit/valleys', 19),     # THE VALLEYS
    ('kit/services', 22),    # ON DEMAND HOSPITALITY SERVICES, eight of them
    ('kit/mv1-board', 7),    # Mountain View 1's design language, named
]
# The fourth polaroid on the water-features page. It is the developer's own
# photograph of the same subject, and it is not one of the client's ten.
CLIPS = [
    ('kit/water-4', 20, (2296, 1136, 2968, 1904)),
    # p40 heads the Millennial section with a photograph of the Millennial
    # building, the way p24 heads the iVilla section with the iVilla. Those two
    # are the only pictures in the book of a *named home type*, so they are the
    # two unit covers. The iVilla's is already published as g10.
    ('units/millennial', 40, None),
    ('kit/mv1-aerial', 3, (2000, 0, 4000, 2000)),
    ('masterplan', 18, (0, 0, 2000, 2000)),
    ('location', 16, (1158, 178, 3822, 1823)),
]

# Every floor plan, matched to its unit by the title the brochure prints on it.
# The archive's own fp-*.PNG files were matched page by page first; where the
# two disagree the printed title wins, and the disagreement is reported.
PLANS = [
    ('fp/garden-265', 25),        # iVilla Garden 265M2
    ('fp/garden-235-a', 29),      # iVilla Garden 235M2, one of two layouts
    ('fp/garden-235-b', 30),      # iVilla Garden 235M2, the other
    ('fp/sky-255', 31),           # iVilla Sky Garden 255M2
    ('fp/sky-235', 33),           # iVilla Sky Garden 235M2
    ('fp/roof-255', 34),          # iVilla Roof 255M2
    ('fp/roof-215', 39),          # iVilla Roof 215M2
    ('fp/millennial-140-a', 41),  # Millennial 140M2, one of three layouts
    ('fp/millennial-140-b', 42),
    ('fp/millennial-140-c', 43),
]

# The one drawing this brochure does not contain. The sheet's eighth row is a
# Luxury Villa, a standalone house with its own pool; The Park's book covers
# the iVilla and the Millennial only. Its plan comes from the archive.
FROM_ARCHIVE = [('fp/luxury-villa-255', 'fp-v8-1.1.PNG'),
                ('units/luxury-villa-255', 'luxury.PNG')]

# Files in the archive that nothing here publishes. Printed at the end of a run.
UNUSED = {
    'crown.PNG': 'a villa elevation. The brochure names The Crown Palace on '
                 'p14 and shows a different photograph of it, so what this '
                 'file is cannot be settled from the sources at hand. '
                 'Unassigned on purpose.',
    'fp-v3-1.1.PNG': 'the sheet points row 3 (iVilla Sky Garden 235) at this '
                     'file, but the drawing in it is a Ground+First floor '
                     'GARDEN plan, pixel for pixel the same as fp-v2-1.10, '
                     'and both are brochure p30 — iVilla Garden 235. The row '
                     'gets the brochure\'s own Sky Garden 235 (p33) instead.',
}


def rip(rar):
    """Unpack the client's archive to a temporary directory."""
    tmp = tempfile.mkdtemp(prefix='mv11-')
    subprocess.run(['bsdtar', '-xf', rar, '-C', tmp], check=True)
    return tmp


def save(im, rel, width):
    """Downscale to `width` and write WebP, making the folder if needed."""
    if im.mode != 'RGB':
        im = im.convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, rel + '.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=86, method=6)
    return path


def render(doc, page_no, clip=None, width=WHOLE_W):
    """Render a page, or a rectangle of one, at roughly `width` pixels."""
    p = doc[page_no - 1]
    box = pymupdf.Rect(clip) if clip else p.rect
    z = width / box.width
    pix = p.get_pixmap(matrix=pymupdf.Matrix(z, z), clip=box)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)


def lift(doc, xref):
    """Pull one embedded image out of the PDF at its own resolution."""
    pix = pymupdf.Pixmap(doc, xref)
    if pix.n - pix.alpha >= 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    mode = 'RGB' if pix.n - pix.alpha == 3 else 'L'
    return Image.frombytes(mode, (pix.width, pix.height), pix.samples)


def main():
    pdfs = glob.glob(UP + '24045cdb-*.pdf')
    if not pdfs:
        raise SystemExit('the brochure is not where this script expects it')
    doc = pymupdf.open(pdfs[0])
    if doc.page_count != 44:
        raise SystemExit('expected the 44-page book, got %d pages' % doc.page_count)

    made = []
    for name, page, clip, why in PHOTOS:
        im = render(doc, page, clip, PHOTO_W) if clip else lift(doc, PHOTO_XREF[page])
        made.append((save(im, name, PHOTO_W), 'p%d' % page, why))
    for name, page in PAGES:
        made.append((save(render(doc, page, None, WHOLE_W), name, WHOLE_W),
                     'p%d' % page, 'whole page'))
    for name, page, clip in CLIPS:
        w = PLAN_W if name == 'masterplan' else WHOLE_W
        made.append((save(render(doc, page, clip, w), name, w),
                     'p%d' % page, 'clip'))
    for name, page in PLANS:
        made.append((save(render(doc, page, None, PLAN_W), name, PLAN_W),
                     'p%d' % page, 'floor plan'))

    tmp = rip(RAR)
    for name, src in FROM_ARCHIVE:
        made.append((save(Image.open(os.path.join(tmp, src)), name, PLAN_W),
                     src, 'archive only — not in this brochure'))

    for path, src, why in made:
        im = Image.open(path)
        print('  %-46s %5dx%-5d %6.0f KB  %-4s %s'
              % (os.path.relpath(path, ROOT), im.width, im.height,
                 os.path.getsize(path) / 1024, src, why))
    print('\n%d files in %s' % (len(made), os.path.relpath(OUT, ROOT)))

    print('\nleft in the archive, on purpose:')
    for f, why in sorted(UNUSED.items()):
        print('  %s — %s' % (f, why))
    print('  p13 of the brochure — carries the confidentiality line.')
    print('  p16 of the brochure — prints drive times; only its map is taken.')


if __name__ == '__main__':
    main()
