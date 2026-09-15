#!/usr/bin/env python3
"""Qatari Diar's corporate profile, "The Art of Real Estate".

Thirty-five spreads, sixty-eight numbered pages. Qatari Diar had a developer
row on this site and nothing under it; it now has what the other profiled
developers have.

THE PROFILE IS UNDATED, AND THE DATE IS THE POINT. Nothing on its cover or its
colophon gives one, but four things inside fix it between 2011 and mid-2013:

  · "In 2011, Qatari Diar and Canary Wharf Group signed an agreement with
    Shell International Limited to redevelop the Shell Centre site"  (p15)
  · East Village's 2,818 homes are "ready for residents to move into in 2013",
    in the future tense                                              (p16)
  · the Hotel Schweizerhof reopened "in summer of 2011"              (p21)
  · Qatar Vision 2030 is credited to "His Highness the Emir Sheikh Hamad Bin
    Khalifa Al-Thani and His Highness the Heir Apparent Sheikh Tamim Bin Hamad
    Al-Thani" — which stopped being true in June 2013                (p04)

  So every figure on the cards is the company's as of then, and its project
  list is that list. It names one project in Egypt, the Nile Corniche, and it
  does not mention Alam Al Roum — the only Qatari Diar project this site
  sells. The first card says so, in both languages, rather than letting a
  decade-old portfolio read as a current one.

WHAT IS NOT PUBLISHED, AND WHY.

  A DISTANCE OR A TRAVEL TIME. All 35 pages were read twice, once through the
  text layer and once with OCR at 170 dpi, and the two sweeps agree on exactly
  four pages:

    p16  East Village — "Canary Wharf can be reached in 12 minutes, the West
         End in 20 minutes and St Pancras International in just 6 minutes"
    p23  Port Tarraco Marina — "95 km south of Barcelona"
    p27  Rawabi — "9 km north of Ramallah, 20 km north of Jerusalem and 25 km
         south of Nablus"
    p34  Grand Paraiso — "50 km southwest of Cuba"

  None of the four is on disk and not a sentence of any of them is quoted,
  which is the same rule the Palm Hills profile was held to. Rawabi is still
  named on the cards, because the Asia divider names it without a distance.

  PHOTOGRAPHS THAT ARE NOT QATARI DIAR'S WORK. The four regional dividers are
  tourist landmarks — the Leaning Tower of Pisa, the Eiffel Tower, Big Ben and
  the Plaza de España for Europe; the Dome of the Rock for Asia; the Pyramids
  with a camel for Africa; the Statue of Liberty for the Americas — and p07,
  the Qatar divider, is Barzan Towers, a dallah and the Doha skyline. Their
  WORDS are on the cards; none of their pictures is. The back cover is an
  illustration of owls and insects in a tree under the line "Better living
  conditions produce brighter communities", which is quoted and not published.

  REPEATED IMAGE OBJECTS. The Lusail gate-fold draws the same seven objects on
  p08, p09 and p10; those pages are written whole, so each is its own
  composition and no two files are the same bytes.

WHAT IS PUBLISHED — 23 spreads, each written whole. The images inside are
tiles of a composed spread, most of them 848x909 or smaller, so lifting the
largest one out returns a fragment of a layout.

  p02             The Art of Real Estate
  p04 p05 p06     Qatar Vision 2030, the company's history, and the vision,
                  the mission and the world map of 22 countries
  p08 p09         Lusail City, its eighteen districts keyed, and its own data
                  block — 38 sq km, mixed-use
  p10 p11 p12     Sheraton Park, the Doha Exhibition & Convention Centre and
                  Qutaifiya Lagoon
  p14 p15 p17     Chelsea Barracks, the Shell Centre and Grosvenor Waterside
  p18 p19 p20     the Majestic Peninsula, Le Royal Monceau, the Excelsior
  p21 p22         Gallia, the Hotel Schweizerhof and Beyond Horizon
  p25 p26         Diar Dushanbe
  p29 p30 p31     the Nile Corniche in Cairo, Mushaireb in Khartoum and
                  Al Houara outside Tangier
  p33             Washington City Centre
"""
import hashlib
import io
import os
import shutil

import pymupdf
from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
PDF = 'b2a804c4-Qatari_Diar_Brochure.pdf'
OUT = '/home/user/Thevillagw/project-media/qataridiar/profile'

WHOLE_W = 2200
PAGES = [2, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 17, 18, 19, 20, 21, 22,
         25, 26, 29, 30, 31, 33]


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    d = pymupdf.open(UP + PDF)
    for pn in PAGES:
        page = d[pn - 1]
        dpi = min(300, max(72, round(WHOLE_W / (page.rect.width / 72.0))))
        im = Image.open(io.BytesIO(page.get_pixmap(dpi=dpi).tobytes('png'))).convert('RGB')
        if im.width > WHOLE_W:
            im = im.resize((WHOLE_W, round(im.height * WHOLE_W / im.width)), Image.LANCZOS)
        path = os.path.join(OUT, 'p%02d.webp' % pn)
        im.save(path, 'WEBP', quality=86, method=6)
        print('  %-10s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                         os.path.getsize(path) // 1024))
    seen = {}
    for name in sorted(os.listdir(OUT)):
        with open(os.path.join(OUT, name), 'rb') as fh:
            h = hashlib.md5(fh.read()).hexdigest()
        if h in seen:
            print('  !! %s is byte-for-byte %s' % (name, seen[h]))
        seen[h] = name
    print('  %d files' % len(seen))


if __name__ == '__main__':
    main()
