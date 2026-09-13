#!/usr/bin/env python3
"""Hacienda Waters' pictures: the 41-page brochure and the unit archive.

Palm Hills' Hacienda Waters arrived as a brochure, an archive of fourteen
renders and plans, and six rows in the units sheet. Reading the brochure
settled what the card had wrong and confirmed nearly every figure the sheet
prices.

HOW BIG. The card said "161-acre". Page 21 says AREA: 161.7 FDS — feddans,
not acres, and the site says feddans everywhere else. The same box prints
Lagoons: 18 FDS, Footprint: 12.5%, Landscape & Hardscape: 40.5% and
Commercial & Recreational: 15%.

WHERE. The card said "Km 191". Nothing in the brochure or the archive prints
a kilometre marker, so it is gone. The archive's location map draws the coast
from Marsa Matrouh down to El Alamein with Hacienda Waters between Hacienda
West and Hacienda White, and carries no distance and no drive time — which is
why it is the map on the site. The sheet, the card and the brochure all say
Ras El Hekma, so the area stays as it was.

WHAT THE SHEET PRICES. Six rows. Page 40, the PRODUCT BRIEF, is one table of
every product's areas and bedroom counts, and it confirms four of the six
outright:

    sheet 375   ~ Villa First Row, BUA 374, 6 master beds     (1 m² apart)
    sheet 320   ~ Villa Second Row, BUA 278 + penthouse 46    (4 m² apart)
    sheet 65-72 = Water Condo 3, 1 Bed, 65 - 72.5 m²
    sheet 141   = Water Condo 2, 3 Bed, inside 123 - 146.5 m²
    sheet 41.5  = Cabins, 1 Bed, 41.5 m²                      (exact)

  The one that does not line up is the two-bedroom chalet. The sheet says
  103-114 m². Page 36 and page 40 both print Water Condo 3's two-bedroom as
  106-114 m², and the archive's own copy of that page prints it too. Nothing
  anywhere prints 103, so it is carried as the sheet has it and reported
  rather than reconciled.

  The bathroom counts are the sheet's; the brochure gives bedrooms only. Two
  of them can be checked against the drawings and both hold: the first-row
  villa's plan draws nine (nanny, driver, guest toilet, and one to each of
  the six master bedrooms) and the second-row villa's draws eight.

FROM THE BROCHURE  ->  project-media/palmhills/hacienda-waters/pNN.webp

  p12 p24 p30 p33                  the four CGI renders of the place: a villa,
                                   the villas-and-town-houses street, the
                                   chalets on their lagoon, and the condos
  p21 p22 p23                      the master plan three times — with the area
                                   figures, with the key distribution legend,
                                   and with the zone counts. Rendered whole,
                                   because on these pages the reading matter
                                   is the point
  p27 p28 p29 p31 p32 p34 p37      Water Villa, Water Town House 1 and 2,
  p38 p39                          Water Senior and Junior Chalet, Water Condo
                                   1 and 4, Pieds Dans L'Eau and the Cabanas —
                                   each an area table beside its floors

  NOT USED — p25 p26 p35 p36. These four are the 1st Row Villa, the 2nd Row
  Villa, Water Condo 2 and Water Condo 3, and the archive holds the same four
  drawings as its own files, which the sheet names row by row and which this
  site attaches to the units themselves. Publishing the brochure's copies as
  well would put the same drawing on a card and on a listing. Their area
  tables are quoted on the cards instead, which is the half the archive crops
  do not carry.

  NOT USED — p40, the PRODUCT BRIEF. It is one wide table printed sideways on
  a portrait page; at the size a card shows it, it cannot be read. Every
  figure in it is quoted on the cards instead.

  NOT USED — p01 to p07. The cover, two pages of slogans, the page about Palm
  Hills the company, and four pages about the other Hacienda developments.
  The aerial on p03 is a photograph of a built Palm Hills project on the North
  Coast, not of this one.

  NOT USED — p08 p10 p13 p14 p15 p16 p17 p18 p19 p20. Stock photographs: a
  water park, a child on a float, a man in the sea, children splashing, a
  water slide, an arcade, two people doing push-ups, a playground, a group at
  a bar, children in a cinema. None of them shows any part of Hacienda
  Waters. Their words are quoted on the cards; their pictures were never
  extracted. (Page 30's render has a woman in it, and that is a different
  thing: a CGI render of the project that happens to have a person in it.)

  NOT USED — p11, and this one on purpose rather than for want of a picture.
  It is the LOCATION page and its text reads "Hacienda Waters' location is
  truly exceptional, since it is 20 kilometers before Hacienda West, and 30
  kilometers away from Ras El Hikma". The site carries no distance and no
  drive time. All 41 pages were swept and p11 is the only one that prints one.

  NOT USED — p02 p09, text pages with no picture, and p41, the back cover.

FROM THE ARCHIVE  ->  project-media/palmhills/hacienda-waters/units/<name>.webp

  Fourteen files, no two of them the same bytes. Every file keeps the name the
  archive gave it, because the sheet's Image ID column names units by that
  name. Three contain a space, and a space in a URL has to survive the
  sitemap, the asset audit and every tool that splits a path on whitespace:

      mp water        ->  mp-water.webp
      location water  ->  location-water.webp
      ca-water -fp    ->  ca-water-fp.webp

  v1-water-0 is the only render in the archive of a particular home — a
  two-storey villa with its own pool — and the sheet puts it on the two villa
  rows and on nothing else. v1-water-1, v1-water-2, ch-water-0 and ch-water-1
  are the lagoons and the pool deck, which belong to no one unit; v1-water-3
  is an interior. The sheet names them row by row and in order, and that order
  is what the site follows.
"""
import io
import os
import re
import shutil
import subprocess
import tempfile

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + 'c44008dd-Hacienda_Waters_Brochure_compressed.pdf'
RAR = UP + 'f810a89a-hacienda_water.rar'
OUT = '/home/user/Thevillagw/project-media/palmhills/hacienda-waters'

PHOTO = [12, 24, 30, 33]
WHOLE = [21, 22, 23, 27, 28, 29, 31, 32, 34, 37, 38, 39]


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
            stem = re.sub(r'-{2,}', '-',
                          re.sub(r'\s+', '-', os.path.splitext(name)[0]).strip('-'))
            plan = stem.lower().startswith(('fp-', 'mp-', 'ca-water', 'location'))
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
