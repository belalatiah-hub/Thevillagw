#!/usr/bin/env python3
"""Palm Hills Developments' own company profile, for the developer page.

The file is "Palm Hills Developments Synopsis — Into The Palm Hills Empire",
89 pages, and its cover is dated MARCH, 2021. That date is the single most
important thing about it: every figure in it is the company's own as of then,
and its project list is the list of March 2021. Eight of the eleven Palm Hills
projects this site sells today are not in it at all, because they had not
launched. The cards say so rather than presenting four-year-old figures as
current ones — the same treatment Orascom's 2019 deck gets.

WHAT IT SAYS ABOUT THE COMPANY

  p03  Founded 1997 as ETIHADEYA, the investment arm through which PHD was
       established; in 2005 Palm Hills Developments came to life by acquiring
       all the assets. A portfolio of 34 projects spreading over 42.5 mn sqm.
  p07  34 projects · EGP 58.2 bn cumulative achieved sales · 70,000 families.
  p08  300,000 residents · 9 global awards in 2020 · 42.5 mn sqm land bank in
       Egypt · 13 projects under construction · 21 years.
  p09  The land bank by region and by status.
  p10  13,323 first homes sold · 3,300 second homes sold · 2.9 mn sqm held for
       commercial, with the asset-by-asset status table.
  p88  The three Accor-managed hotels, with their keys and opening years.

  p04 names every community by region and p05-p06 date them year by year, and
  those two pages are the reason this profile is worth publishing at all: they
  are the company saying, in its own document, what it has built and when.

FROM THE PROFILE  ->  project-media/palmhills/profile/pNN.webp

  p03 p04 p07 p08 p09 p10 p88     the figure pages, rendered whole because on
                                  these pages the reading matter is the point
  p05 p06                         OUR JOURNEY, 2004 to 2020, in polaroids
  p01 p30 p34 p48                 Palm Hills October, The Crown, Badya and
                                  Palm Hills New Cairo
  p64 p69 p76 p81                 Hacienda Bay, Le Sidi, Mazeej and Tawaya

  NOT WRITTEN — p35. It is the SAME EMBEDDED IMAGE OBJECT as p34 — xref 668,
  the Badya apartments render, printed on two facing pages — so writing both
  gave two files with identical bytes and a strip that showed one picture
  twice.

  NOT USED — p38, and this one on purpose rather than for want of a picture.
  It is Badya's Location and it prints a drive-time table: to Mall of Egypt,
  to Palm Hills October, to The Great Pyramids and to the Grand Egyptian
  Museum 20 min each, to The Sphinx Airport 30, to The New Capital 50. The
  site carries no drive time and no distance.

  NOT USED — p82 and p84 for the same reason in words rather than a table.
  p82 opens "Only 18 kilometers south of the airport"; p84 opens "A mere 120
  kilometers east of the pulsating heart of Cairo and a simple 55 kilometers
  south of the Suez". Their pictures are published (p81 is Tawaya's piazza,
  and Sokhna's coast photograph is left off as well since it shows no part of
  any Palm Hills project), but not one sentence of either page is quoted.

  All 89 pages were swept for a drive time or a distance and those three are
  the only ones that print one. The lengths that are NOT proximity claims —
  Sahl Hasheesh's 12.5 km of shoreline, Laguna Bay's 1.5 km of coast — are a
  different thing, and are not quoted either, because both sit inside the
  paragraphs that carry the distances.

  NOT USED — p56 and p83, two photographs that show no part of any Palm Hills
  project: a tree-lined avenue that could be anywhere, and a bare rocky coast.
  They may well be of Capital Gardens and of Ain Sokhna. They are not
  identifiably so, and a picture that has to be taken on trust is not one to
  publish under a developer's name. p77 is left off too — brand artwork, a
  line drawing of Alexandria, not a photograph of anything built.

  NOT USED — the forty-odd project pages, p12 to p31, p39 to p87. Each is one
  project's own figures, and this site has project pages of its own with
  newer sources behind them. Where the two meet they agree: the profile puts
  Palm Hills New Cairo at 2.1 mn sqm, which is the 500 feddans its brochure
  prints. Publishing the 2021 set beside the current set would put two
  answers on one screen.
"""
import io
import os

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = UP + '506f70c3-Palm_Hills_Profile_Company_compressed.pdf'
OUT = '/home/user/Thevillagw/project-media/palmhills/profile'

# 35 is absent on purpose: it is the same embedded image as 34 — see above.
PHOTO = [1, 30, 34, 48, 64, 69, 76, 81]
WHOLE = [3, 4, 5, 6, 7, 8, 9, 10, 88]


def save(im, path, width, quality=84):
    """Down to `width` at most — never up."""
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    return '%-16s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                    os.path.getsize(path) // 1024)


def photo(doc, page_no):
    """The largest embedded image on the page, by encoded size."""
    best, weight = None, 0
    for x in doc[page_no - 1].get_images(full=True):
        info = doc.extract_image(x[0])
        if len(info['image']) > weight:
            best, weight = info['image'], len(info['image'])
    return Image.open(io.BytesIO(best)).convert('RGB') if best else None


def main():
    d = pymupdf.open(PDF)
    seen = {}
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
    # A last guard against the p34/p35 case reappearing if the lists change.
    for name in sorted(os.listdir(OUT)):
        with open(os.path.join(OUT, name), 'rb') as fh:
            body = fh.read()
        if body in seen:
            print('  !! %s is byte-for-byte %s' % (name, seen[body]))
        seen[body] = name
    print('  %d files' % len(seen))


if __name__ == '__main__':
    print('profile:')
    main()
