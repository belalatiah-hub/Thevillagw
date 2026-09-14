#!/usr/bin/env python3
"""O West's pictures: three archives, and the sheet's twenty-seven rows.

Orascom's O West arrived as three RAR archives and twenty-seven rows in the
units sheet, with no brochure. The archives overlap heavily — the second is a
subset of the third, and the third repeats every floor plan in the second — so
they are read together and written once by content. Sixty-nine distinct files,
and no two of them the same bytes under different names.

WHAT THE DRAWINGS SAY ABOUT THEMSELVES. Almost every plan is headed with the
product's name and its own area table, so the pairings below are the drawing
identifying itself rather than an inference:

    fp-ap1-my / fp-lo2-my   Mid Yard Type A      1-BED 82 · 2-BED 120 · 2-BED LOFT 158
    fp-ap2-my / fp-du-my    Mid Yard Type B      3-BED+N 176 · 3-BED DUPLEX 223
    fp-lo-my                Mid Yard Type A      3-BED LOFT 226
    fp-ap1-core             Core Type A          1BR 77 · 2BR 116
    fp-ap3-core             Core Type B          3BR 156
    fp-ap4-core             Core Type B          4BR+N 214
    fp-du1-core-0           Core Type C          3BR DUPLEX 222
    fp-pent-core            Core Type C mirrored 2BR PENTHOUSE 125
    fp-ap1-cy               Club Yard Type D     3BR+N 186
    fp-ap2-cy               Club Yard Type B     3BR+N 179
    fp-lo-cy                Club Yard Type A     2BR LOFT 153
    fp-lo2-cy               Club Yard Type D m.  3BR LOFT 213
    fp-ap2-ov / fp-ap2-ov-0 Level Residences C and B, Unit 11, 2 BD, BUA 128
    fp-ap3-ov               Level Residences C   Unit 01, 3 BD, BUA 148
    fp-ap1-ps               Smart Apartments     ground: unit 01, 3 bed, 148
    fp-ap2-ps               Smart Apartments     first: unit 11, 2 bed, 99 · unit 13, 2 bed, 117
    fp-pen1-ps              Smart Apartments     second: unit 23, 3 bed pent, 146
    fp-th-0..3              TOWNHOUSE M          corner 172
    fp-th2-0..3             TOWNHOUSE J          corner 169-170
    fp-v-ps-0 / fp-v-ps1    U-VILLA B            total 212-216, penthouse 29

  Twenty-two of the twenty-seven rows are confirmed to the square metre that
  way, including the two ranges the sheet writes out — "169 - 170" is Townhouse
  J's corner band and 212 and 216 are the two ends of U-Villa's.

WHAT THE SHEET NAMES AND NO ARCHIVE HOLDS — eleven renders:

    ap1-my-0  ap1-my-1  ap1-my-2
    ap1-core-0  ap1-core-1  ap1-core-2  ap1-core-3
    ap1-cy-0  ap1-cy-1  ap1-cy-2  ap1-cy-3

  The three Mid Yard ones cost that neighbourhood nothing: every Mid Yard row
  also names ap1-my-3 to ap1-my-7, which are present, so each unit still
  carries five frames in the sheet's own order with the absent ones dropped.

  Core and Club Yard are a different matter. Between them they are TEN of the
  twenty-seven units, and the archives hold no render of either — only plans
  and a phase plan. Those ten units carry their floor plan, their master plan
  and the location map, and no render. Nothing was borrowed from Mid Yard or
  Park Side to fill the gap: a render of one neighbourhood on another
  neighbourhood's listing is a claim about a home nobody has drawn.

TWO ROWS THE SHEET LEAVES WITHOUT A PLAN, AND THE DRAWING SETTLES IT. The
two-bedroom Park Side rows (99 m² and 117 m²) have "location-o west" pasted
into their Floor Plan column, which is not a plan. fp-ap2-ps is in the archive
and named by no row, and it prints unit 11 at 99 m² and unit 13 at 117 m² on
its own face — the two rows exactly. It is attached to both.

WHAT DOES NOT LINE UP, carried as the sheet has it and reported:

  * The three-bedroom O Views apartment, 148 m², is priced at 7,291,000. Its
    two neighbours in the same building are 11,661,000 for 121 m² and
    12,509,000 for 128 m² — about 96,000 a metre against this row's 49,000.
    The area is confirmed exactly by fp-ap3-ov. The price is not confirmed by
    anything and is half what the building's other rows imply.
  * The 121 m² O Views row names fp-ap1-ov, whose table prints 127 m² for both
    units it draws. 121 appears in the sources only as Mid Yard Type A's unit
    0-4, which is a different neighbourhood.
  * The 146 m² Park Side penthouse names fp-pen1-ps, whose unit 23 is 146 m²
    exactly but is drawn as a 3-bed penthouse. The sheet says 2 bedrooms.
  * The villa renders are captioned "U-Villa A" and the villa plans are headed
    "U-VILLA B". The sheet puts them on the same two rows. The listing calls
    the product "U-Villa" without the letter, because the letter is the one
    thing the two sources disagree about.

FROM THE ARCHIVES  ->  project-media/orascom/o-west/<name>.webp

  Every file keeps the name its archive gave it, because the sheet's Image ID
  column names units by that name. Four contain a space:

      location-o west   ->  location-o-west.webp
      location-o views  ->  location-o-views.webp
      mp-o west         ->  mp-o-west.webp
      mp-o views        ->  mp-o-views.webp

  NOTHING here carries a drive time or a distance. Both location maps and all
  six master plans were read: location-o west draws Wahat Road, the Ring Road,
  the 26th of July Corridor, Sheikh Zayed City, Juhayna Square, Arkan Plaza,
  Mall of Egypt and the Egyptian Media Production City as places, with no
  minutes and no kilometres against any of them.
"""
import hashlib
import os
import re
import shutil
import subprocess
import tempfile

from PIL import Image

UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
RARS = [UP + '6a08ad29-o_west1.rar',
        UP + '53ed0497-o_west2.rar',
        UP + '8d8d77a4-o_west3.rar']
OUT = '/home/user/Thevillagw/project-media/orascom/o-west'


def save(im, path, width, quality=84):
    """Down to `width` at most — never up."""
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)
    return '%-22s %4dx%-4d %4dK' % (os.path.basename(path), im.width, im.height,
                                    os.path.getsize(path) // 1024)


def archives():
    tmp = tempfile.mkdtemp()
    try:
        found = {}          # stem -> path on disk
        seen = {}           # md5 -> stem, to catch the same picture twice
        for n, rar in enumerate(RARS, 1):
            here = os.path.join(tmp, 'a%d' % n)
            os.makedirs(here)
            subprocess.run(['bsdtar', '-xf', rar, '-C', here], check=True)
            for name in sorted(os.listdir(here)):
                src = os.path.join(here, name)
                stem = os.path.splitext(name)[0]
                digest = hashlib.md5(open(src, 'rb').read()).hexdigest()
                if stem in found:
                    continue                      # the archives overlap; write once
                if digest in seen:
                    print('  !! %-20s is byte-for-byte %s' % (stem, seen[digest]))
                seen[digest] = stem
                found[stem] = src
        for stem in sorted(found):
            out = re.sub(r'-{2,}', '-', re.sub(r'\s+', '-', stem).strip('-'))
            plan = out.lower().startswith(('fp-', 'mp-', 'location'))
            print('  ' + save(Image.open(found[stem]).convert('RGB'),
                              os.path.join(OUT, out + '.webp'),
                              2200 if plan else 1500, 90 if plan else 84))
        print('  %d files written' % len(found))
    finally:
        shutil.rmtree(tmp)


if __name__ == '__main__':
    print('archives:')
    archives()
