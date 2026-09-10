#!/usr/bin/env python3
"""The two pages of Marina Gate's sales kit the project page still needed.

The kit's 52 pages were extracted once before as p01…p52.webp, and fourteen of
them are the project's gallery. This adds the two the page wanted and records,
below, why the other pages are not here — because most of what looked missing
turned out to be a second copy of something the units already carry.

Added

  p23  the render behind UNIT TYPES & FLOOR PLANS — the project's own
       architecture, taken from the embedded photograph so the page's title
       does not come with it
  p51  the partners page: WATG, Travco Engineering & Construction, Travco
       Group, HWM, Jaz Hotel Group, Steigenberger Hotels & Resorts. Rendered
       whole, because a row of logos is the content

Already here and used: p10 (the Almaza Bay Ras Soma master plan and its
twenty-one numbered destinations), p50 (a kitchen and living interior), and
the fourteen gallery frames p13–p19, p25, p26, p31, p32, p37, p38, p45, p46.

Deliberately not used — sixteen pages that duplicate a unit's own picture

  p27, p33, p34, p39, p40, p42, p43, p47, p48, p49   the ten floor plans. Each
      one is the same drawing as the matching fp-*.webp in units/, which crops
      it closer. Compared side by side before deciding.
  p22   the Marina Gate layout — the same drawing as units/mp-marina-gate.webp
  p09   the location map — the same drawing as units/location-marina-gate.webp
  p28, p29, p35, p41   interiors already carried as v1-marina-gate-2 and -3,
      tv-marina-gate-2 and th-marina-gate-2

Deliberately not used — stock photography of people, which shows no part of
the project: p18's housekeeper, p21's model on a yacht, p20's sun loungers.
Their words are on the page; their pictures are not.

Not used — pages 5 to 8 are Travco the company, and page 12 is the
destination, not this phase.

Nothing here carries a drive time. The kit prints four on page 9, and the copy
of that map already on the site printed them too until
tools/strip_drivetimes.py took them off.
"""
import io
import os

import pymupdf
from PIL import Image

SRC = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
       '6164bb79-Marina_Gate_SalesKit_2.pdf')
OUT = '/home/user/Thevillagw/project-media/travco/marina-gate'

RENDERS = {23: 'p23.webp'}    # from the page's own embedded photograph
WHOLE = {51: 'p51.webp'}      # the rendered page: the layout is the content


def visible(doc, page_no, xref):
    """The part of an embedded photograph its page actually shows."""
    page = doc[page_no - 1]
    info = doc.extract_image(xref)
    im = Image.open(io.BytesIO(info['image'])).convert('RGB')
    rects = page.get_image_rects(xref)
    if not rects:
        return im
    r, pr = rects[0], page.rect
    fx0 = max(0.0, (pr.x0 - r.x0) / r.width)
    fx1 = min(1.0, (pr.x1 - r.x0) / r.width)
    fy0 = max(0.0, (pr.y0 - r.y0) / r.height)
    fy1 = min(1.0, (pr.y1 - r.y0) / r.height)
    box = (int(fx0 * im.width), int(fy0 * im.height),
           int(fx1 * im.width), int(fy1 * im.height))
    if box[2] - box[0] < 200 or box[3] - box[1] < 200:
        return im
    return im.crop(box)


def photo(doc, page_no):
    """The photograph on the page, chosen by encoded size rather than by pixel
    count. Every page of this kit is backed by a paper texture, and on page 23
    that texture is the larger of the two images — 2540x1325 against the
    render's 2343x1267 — but only 61K against its 512K, because it is nearly
    blank. Picking the bigger one returned a sheet of empty paper."""
    best, weight = None, 0
    for x in doc[page_no - 1].get_images(full=True):
        info = doc.extract_image(x[0])
        if len(info['image']) > weight:
            best, weight = x[0], len(info['image'])
    return best


def save(im, name, width=1500, quality=84):
    # 1500px wide, as every other frame of this kit already on disk
    if im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, 'WEBP', quality=quality, method=6)
    print(f'  {name:12s} {im.width}x{im.height} {os.path.getsize(path)//1024}K')


def main():
    d = pymupdf.open(SRC)
    for pn, name in RENDERS.items():
        xref = photo(d, pn)
        if not xref:
            print(f'  p{pn}: no image'); continue
        save(visible(d, pn, xref), name)
    for pn, name in WHOLE.items():
        pm = d[pn - 1].get_pixmap(dpi=170)
        save(Image.open(io.BytesIO(pm.tobytes('png'))).convert('RGB'), name)


if __name__ == '__main__':
    main()
