#!/usr/bin/env python3
"""Badya's pictures: the apartments brochure, and the three unit archives.

Palm Hills' Badya arrived as five files — a 54-page apartments e-brochure,
three RAR archives of unit renders and plans, and the units sheet. This writes
everything the site keeps, and records what it deliberately leaves behind.

FROM THE BROCHURE  ->  project-media/palmhills/badya/pNN.webp

  p04                              the apartments district as the brochure
                                   draws it, from the page's own image
  p08                              the Unit Typology key and its legend
  p06 p14 p22 p30 p38 p46          one exterior for each of the six apartment
                                   families, full-bleed, taken from the
                                   embedded photograph so the family name
                                   printed over it does not come along
  p07 p15 p23 p31 p39 p44 p47 p52  the interiors, the same way
  p09 p17 p25 p33 p41 p49          the entry floor of each family, rendered
  p12 p20 p28 p36 p43 p51          its penthouse floor, rendered — the room
                                   schedule beside the drawing is the content,
                                   so these pages are rendered whole

  Not used: p03. It is headed BADYA MASTER PLAN and its paragraph is about the
  patios of the TOWNHOUSES — in a brochure that is apartments throughout. The
  heading and the body disagree, so neither is quoted.

  Not used: p01 p02 p53 p54, and the six family title pages p05 p13 p21 p29
  p37 p45 — a word set on a coloured field, with no picture in it.

FROM THE ARCHIVES  ->  project-media/palmhills/badya/units/<name>.webp

  Every file keeps the name the archive gave it, because the sheet's Image ID
  column names units by that name: row 1758 says ap1-bad-0, and the unit
  carries ap1-bad-0 and the five frames numbered after it.

  Four files are the same bytes under two names — ap1-bad-03 = ap2-bad-0,
  ap1-bad-04 = ap2-bad-04, ap1-bad-05 = ap2-bad-03, villa1-bad-02 =
  villa30bad-01. Each is written once, under the first name, and the second
  unit's list points at that file.

  NOT WRITTEN — a third party's watermark

    fp-ap4-bad01   the Trio D area schedule
    fp-ap4-bad02   the Corner C typical floor
    fp-ap5-bad-0   the Trio D ground floor

  All three carry LARIA set across them in large type: a brokerage's mark, not
  Palm Hills'. It is not ours to publish. Two of the three lose nothing:
  fp-ap4-bad01's figure for Apartment *1, 152.05 m², is the 152 m² of sheet row
  1773, whose plan fp-ap4-bad0 is clean and is used; and fp-ap5-bad-0 is the
  same drawing as fp-ap5-bad-01, which is clean, so row 1777 keeps its plan.
  fp-ap4-bad02 is a Corner C and belongs to no row here at all.

  NOT WRITTEN — not a drawing

    fp-ap2-bad     a photograph of a printed plan lying on a cyan sheet, taken
                   at an angle and cut off down the right edge. Row 1765 names
                   it and so has no floor plan; that is reported rather than
                   filled in from another unit's.

  NOT WRITTEN — named by no row

    ap4-bad-0      a street of villas
    ap4-bad-01     a living room

  No sheet row names either. Row 1773 sits where an ap4- code would fall and
  its plan code is fp-ap4-bad0, so they may be its renders — but its Image ID
  column says ap2-bed-0, and a guess about which unit a picture belongs to is
  exactly the guess not to make. They are reported instead.

  mp-bad and location-badya both pass tools/verify_no_drivetimes.py: the
  anchors key map prints a legend, and the location map prints place names.
  Neither prints a minute.
"""
import io
import os
import shutil
import subprocess
import tempfile

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + '201523e2-Badya_Apartments_e-Brochure.pdf'
RARS = [UP + '97492d20-badya1.rar', UP + '40a405a5-badya2.rar',
        UP + '69b59a70-badya3.rar']
OUT = '/home/user/Thevillagw/project-media/palmhills/badya'

# Pages whose content is the photograph behind them.
PHOTO = [4, 6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 44, 46, 47, 52]
# Pages whose content is the drawing and the table beside it.
WHOLE = [8, 9, 12, 17, 20, 25, 28, 33, 36, 41, 43, 49, 51]

SKIP = {'fp-ap4-bad01.png', 'fp-ap4-bad02.PNG', 'fp-ap5-bad-0.png',
        'fp-ap2-bad.PNG', 'ap4-bad-0.PNG', 'ap4-bad-01.PNG'}


def save(im, path, width, quality=84):
    """Down to `width` at most — never up. An upscale would dress 1185 real
    pixels as 1500 and tell the browser to fetch the difference."""
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
        print('  ' + save(im, os.path.join(OUT, 'p%02d.webp' % pn), 1600, 88))


def archives():
    tmp = tempfile.mkdtemp()
    try:
        for r in RARS:
            subprocess.run(['bsdtar', '-xf', r, '-C', tmp], check=True)
        seen, n = {}, 0
        for name in sorted(os.listdir(tmp)):
            if name in SKIP:
                continue
            src = os.path.join(tmp, name)
            with open(src, 'rb') as f:
                digest = f.read()
            if digest in seen:
                print('  %-26s = %s (written once)' % (name, seen[digest]))
                continue
            seen[digest] = name
            stem = os.path.splitext(name)[0]
            im = Image.open(src).convert('RGB')
            # Plans are read, not looked at: they keep their pixels and a
            # higher quality. Renders are looked at, so 1500 is plenty.
            plan = stem.startswith(('fp-', 'mp-', 'location-'))
            print('  ' + save(im, os.path.join(OUT, 'units', stem + '.webp'),
                              2200 if plan else 1500, 90 if plan else 84))
            n += 1
        print('  %d files written, %d skipped' % (n, len(SKIP)))
    finally:
        shutil.rmtree(tmp)


if __name__ == '__main__':
    print('brochure:')
    brochure()
    print('archives:')
    archives()
