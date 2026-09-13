#!/usr/bin/env python3
"""P/X's pictures: the 66-page brochure and the unit archive.

Palm Hills' P/X arrived as a brochure, an archive of renders and plans, and
seven rows in the units sheet. Reading the brochure settled two things the
card had wrong and confirmed every apartment area the sheet prices.

WHERE IT IS. The card said New Cairo. Page 9 says P/X is "the grand concluding
development in the renowned WEST CAIRO area", page 21 puts it "on the highest
hill point of the Palm Hills neighborhood in the center of West Cairo", and the
map on that page is labelled Mehwar, 26 July Corridor, Ring Road, Golf Views,
Golf Extension and OCTOBER. The archive's own location map draws Wahat Road,
Waslet Dahshour Road, New Giza Road, Palm Valley and Palm Parks. The sheet says
"6th of October". Every source agrees, and none of them says New Cairo.

HOW BIG. Page 9 says 373 feddans. The card said 370.

WHAT THE SHEET PRICES. Five apartment areas, each a figure in the brochure:

    sheet 77   = SKYE 1 / SKYE 2, Apartment 12 and 22, BUA 77.84 m²
    sheet 138  = DAWN, Apartment 12 and 22, BUA 138.19 m²
    sheet 157  = DUSK, Apartment 11 and 21, BUA 156.56 m²
    sheet 164  = DUSK, Apartment 12 and 22, BUA 164.48 m²
    sheet 171  = DAWN, Apartment 11 and 21, BUA 171.80 m²

  Its two townhouse rows both say 231 m². The brochure prints Town House X
  Corner 01 at 213.61 m² built-up plus a 30.24 m² penthouse, and the archive's
  own table prints 210.82 m² for the corner and 200.72 m² for the middle.
  Nothing anywhere prints 231, so it is carried as the sheet has it and
  reported rather than reconciled.

FROM THE BROCHURE  ->  project-media/palmhills/px/pNN.webp

  p27 p32 p33                      Villa 1 and Villa 2
  p37 p38                          Town House X
  p42 p43 p48 p49                  DUSK and DAWN
  p54 p55                          SKYE 1 — and SKYE 2, which shares one
  p24 p25                          Masterplan Phase 1, and the same plan with
                                   the seven building types keyed — rendered
                                   whole, the legend being the point
  p26                              Lake Zone, Linear Park, Garden Residence
  p28 p34                          Villa 1 and Villa 2 area tables

  p60 is NOT written. It is the SAME EMBEDDED IMAGE OBJECT as p55 — xref 746,
  printed once under SKYE 1 and again under SKYE 2 — so writing both gave two
  files with identical bytes and a gallery that showed one picture twice. Three
  renders cover the four apartment blocks' pages, and no render on this project
  is captioned as one particular block's, because for SKYE 1 and SKYE 2 that
  would not be true.

  NOT USED — p01 to p23 are the brochure's editorial opening: a logo, a run of
  slogans over abstract art, four stock photographs of people, and the pages
  about Palm Hills the company and Chapman Taylor the master planner. Their
  figures are quoted on the cards; the pages themselves carry no picture of
  P/X. p21's map is a sketch without a scale, and the archive's location map
  is the copy the sheet names, so that is the one on the site.

  NOT USED — p29 p30 p31 p35 p36 p39 p40 p41 p44 to p47 p50 to p53 p56 to p59
  p61 to p64, the floor plans. The units this site lists carry the archive's
  own plans, which the sheet names row by row; publishing the brochure's set
  as well would put two drawings of the same floor on one page.

  NOT USED — p65 p66, a photograph of a person and the contact page.

  NOTHING here carries a drive time or a distance. All 66 pages were swept for
  one and the brochure prints none, which is unusual and worth recording.

FROM THE ARCHIVE  ->  project-media/palmhills/px/units/<name>.webp

  Thirty-five files, no two of them the same bytes. Every file keeps the name
  the archive gave it, because the sheet's Image ID column names units by that
  name — including fp-Ap1-px and fp-Ap1-px0, whose capital A is what the sheet
  spells too. The one exception is "location px", which contains a space:

      location px  ->  location-px.webp

  A space in a URL has to survive the sitemap, the asset audit and every tool
  that splits a path on whitespace, and it is not worth the risk.
"""
import io
import os
import shutil
import subprocess
import tempfile

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + '115f7656-PX_E-Brochure_-_Palm_Hills_compressed_compressed_1.pdf'
RAR = UP + '696c68dd-px.rar'
OUT = '/home/user/Thevillagw/project-media/palmhills/px'

# 60 is absent on purpose: it is the same embedded image as 55 — see above.
PHOTO = [27, 32, 33, 37, 38, 42, 43, 48, 49, 54, 55]
WHOLE = [24, 25, 26, 28, 34]


def save(im, path, width, quality=84):
    """Down to `width` at most — never up."""
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    return '%-26s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                    os.path.getsize(path) // 1024)


def photo(doc, page_no):
    """The largest embedded image on the page, by encoded size."""
    best, weight = None, 0
    for x in doc[page_no - 1].get_images(full=True):
        info = doc.extract_image(x[0])
        if len(info['image']) > weight:
            best, weight = info['image'], len(info['image'])
    return Image.open(io.BytesIO(best)).convert('RGB') if best else None


def brochure():
    d = pymupdf.open(PDF)
    for pn in PHOTO:
        im = photo(d, pn)
        if im is None:
            print('  p%02d: no image' % pn)
            continue
        print('  ' + save(im, os.path.join(OUT, 'p%02d.webp' % pn), 1500))
    for pn in WHOLE:
        pm = d[pn - 1].get_pixmap(dpi=150)
        im = Image.open(io.BytesIO(pm.tobytes('png'))).convert('RGB')
        print('  ' + save(im, os.path.join(OUT, 'p%02d.webp' % pn), 1700, 88))


def archive():
    tmp = tempfile.mkdtemp()
    try:
        subprocess.run(['bsdtar', '-xf', RAR, '-C', tmp], check=True)
        seen, n = {}, 0
        for name in sorted(os.listdir(tmp)):
            src = os.path.join(tmp, name)
            with open(src, 'rb') as f:
                digest = f.read()
            if digest in seen:
                print('  %-26s = %s (written once)' % (name, seen[digest]))
                continue
            seen[digest] = name
            stem = os.path.splitext(name)[0].replace(' ', '-')
            plan = stem.lower().startswith(('fp-', 'mp-', 'location'))
            print('  ' + save(Image.open(src).convert('RGB'),
                              os.path.join(OUT, 'units', stem + '.webp'),
                              2200 if plan else 1500, 90 if plan else 84))
            n += 1
        print('  %d files written' % n)
    finally:
        shutil.rmtree(tmp)


if __name__ == '__main__':
    print('brochure:')
    brochure()
    print('archive:')
    archive()
