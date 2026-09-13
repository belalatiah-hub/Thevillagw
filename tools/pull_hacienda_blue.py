#!/usr/bin/env python3
"""Hacienda Blue's pictures: the 29-page brochure and the unit archive.

Palm Hills' Hacienda Blue arrived as a brochure, an archive of unit renders and
plans, and five rows in the units sheet. The brochure and the sheet agree
completely, which is rare and worth stating: every one of the five areas the
sheet prices is a figure printed on a brochure page.

    sheet 164     = SENIOR CHALET GROUND, avg BUA 164 m²        (p23)
    sheet 195     = SENIOR CHALET FIRST, 154.5 + 41 penthouse    (p23)
    sheet 116     = JUNIOR CHALET GROUND, avg BUA 116 m²         (p25)
    sheet 114.5   = JUNIOR CHALET FIRST, avg BUA 114.5 m²        (p25)
    sheet 324     = WATER VILLA, BUA 278 + 46 penthouse          (p18)

FROM THE BROCHURE  ->  project-media/palmhills/hacienda-blue/pNN.webp

  p03 p07 p10                      the destination: the aerial, the lagoon,
                                   and a garden between the homes
  p13 p15 p17 p19 p22 p24 p26      one render for each home the brochure
                                   draws, and the cabins' own beach
  p12                              the master plan with its type-distribution
                                   legend, rendered whole
  p14 p16 p18 p20 p21 p23 p25      the plans and their area tables, rendered
  p27 p28                          whole — the table beside the drawing is
                                   half the content

  NOT USED — stock photography of people

    p04  a woman in the water        p06  a woman sunbathing
    p08  a woman on the beach        p09  two women at a table

  Their words are quoted on the cards; their pictures show no part of the
  project and are not published. p10 is a CGI render of the project that
  happens to have people in it, which is a different thing, and is used.

  NOT USED — p05, the location map. The same drawing arrived in the archive,
  which is the copy the sheet names, so the archive's is the one on the site.
  Neither prints a drive time: the map carries place names only.

  NOT USED — p11, the master plan without its legend. p12 is the same plan
  with the type distribution keyed, so p11 would be the same picture twice.

  NOT USED — p01 p02 cover and title, p29 the contact page.

FROM THE ARCHIVE  ->  project-media/palmhills/hacienda-blue/units/<name>.webp

  Every file keeps the name the archive gave it, because the sheet's Image ID
  column names units by that name — with one exception. Two names contain a
  SPACE, and a space in a URL is a liability rather than a detail: it has to
  survive the sitemap, the asset audit and every tool that splits a path on
  whitespace. Those two are written with hyphens instead:

      mp-hacienda blue        ->  mp-hacienda-blue.webp
      location hascienda blue ->  location-hacienda-blue.webp

  Nothing else is renamed. fp-v-palm.-0 keeps its stray dot, which is ugly but
  URL-safe, and the sheet spells it the same way.

  v-hac-2 does not exist. The villa's renders are v-hac-0, -1 and -3; the
  archive simply has no -2, so that unit carries three frames and not four.
"""
import io
import os
import shutil
import subprocess
import tempfile

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + 'd8fa3ec6-Hacienda_Blue_Brochure_compressed.pdf'
RAR = UP + 'c70a3ec3-hascienda_blue.rar'
OUT = '/home/user/Thevillagw/project-media/palmhills/hacienda-blue'

PHOTO = [3, 7, 10, 13, 15, 17, 19, 22, 24, 26]
WHOLE = [12, 14, 16, 18, 20, 21, 23, 25, 27, 28]


def save(im, path, width, quality=84):
    """Down to `width` at most — never up."""
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    return '%-34s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                    os.path.getsize(path) // 1024)


def photo(doc, page_no):
    """The largest embedded image on the page, by encoded size — not by pixel
    count, which on a textured page picks the paper rather than the render."""
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
                print('  %-34s = %s (written once)' % (name, seen[digest]))
                continue
            seen[digest] = name
            stem = os.path.splitext(name)[0].replace(' ', '-').replace('hascienda', 'hacienda')
            plan = stem.startswith(('fp-', 'mp-', 'location'))
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
