#!/usr/bin/env python3
"""Palm Hills New Cairo's pictures: the 31-page brochure and the unit archive.

These two sources are about DIFFERENT PRODUCTS in the same project, and that
governs everything below. The brochure draws the villa zone — Types A to E, a
Twin House and a Family House (Type G) — and prints an area table for each. The
sheet's six rows and the whole archive are APARTMENTS: a single building drawn
floor by floor, with two schedules naming every flat in it. Not one villa type
in the brochure is any of the six rows, so no brochure plan is ever attached to
a unit here, and the villa figures live on the project card where they belong.

FROM THE BROCHURE  ->  project-media/palmhills/ph-new-cairo/pNN.webp

  p01                              the destination from the air
  p12                              the villa zone from the air
  p16 p18 p20 p22 p24 p26 p28      one perspective for each of the seven types
  p06                              Project in Numbers and the Phase 1 layout,
  p08 p09                          and the two landscape pages — rendered
                                   whole, because the table and the labelled
                                   diagram are the content

  NOT USED — p02. It is the Directional Map, and it prints "New Cairo: 10-15
  mins from AUC", "less 5 mins from Suez Road" and three distance rings at 5,
  10 and 15 km. The site carries no drive time and no distance, in a picture or
  in words, so neither the page nor its sentences appear anywhere.

  NOT USED — p03 p04 p05 p07 p10 p11 p13 p14 p15, which are process diagrams
  (terrain studies, massing, circulation, topography, phasing keys) rather than
  anything a buyer looks at; p17 p19 p21 p23 p25 p27 p29 p30, the villa plans,
  because no unit on this site is one of those villas and a plan beside a unit
  is a claim about that unit; and p31, the back cover.

FROM THE ARCHIVE  ->  project-media/palmhills/ph-new-cairo/units/<name>.webp

  TWO renders, under four names. ap1-pl-0 is byte-for-byte ap2-pl-01, and
  ap1-pl-01 is ap2-pl-0 — the archive holds one pair of pictures of the
  apartment building and names them twice. Each is written once, under its
  ap1- name, and the sheet rows that call for an ap2- name point at the same
  file. Every unit still leads with the frame its own row names.

  SEVEN plan files, and they are one building floor by floor:

      fp-ap1-pl   Ground Floor, with the ground schedule beneath it
      fp-ap2-0    the typical-floor schedule, no drawing
      fp-ap2-05   First Floor          fp-ap2-01   Second Floor
      fp-ap2-02   Third Floor          fp-ap2-03   Fourth Floor
      fp-ap2-04   Fifth Floor

  The numbering is not the floor order, so the site lists them in floor order
  behind whichever file the sheet names. That reorders nothing factual: the
  sheet's own file still leads.

  The two schedules confirm five of the six sheet areas exactly — 70 m² (01A /
  21A, 1 bedroom, one bathroom), 131 m² (02A / 22A), 114 m² (04A ground), 172
  m² (03B ground, 3 bedrooms + nanny) and 154 m² (23A typical). The sixth, 200
  m², appears in neither schedule; the largest either prints is 173.5 m². That
  is reported rather than reconciled.
"""
import io
import os
import shutil
import subprocess
import tempfile

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + '6293a742-Palm-Hills-New-Cairo-Brochure.pdf'
RAR = UP + 'adf8cc83-palm_hills.rar'
OUT = '/home/user/Thevillagw/project-media/palmhills/ph-new-cairo'

PHOTO = [1, 12, 16, 18, 20, 22, 24, 26, 28]
WHOLE = [6, 8, 9]


def save(im, path, width, quality=84):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    return '%-26s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                    os.path.getsize(path) // 1024)


def photo(doc, page_no):
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
            stem = os.path.splitext(name)[0]
            plan = stem.startswith(('fp-', 'mp-', 'loation', 'location'))
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
