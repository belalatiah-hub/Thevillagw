#!/usr/bin/env python3
"""Take the proximity lists off Travco's three location maps.

The site carries no drive times and no distances. That was honoured in the
copy — Ras Soma's location card even says so in both languages — but not in
the pictures: all three Travco maps print the list on the drawing itself, and
all three were live.

  ras-soma/location.webp                 "a mere 35 minute drive from Hurghada
                                          International Airport… 60 km from
                                          Downtown Hurghada… a scenic 4.5 hr
                                          drive from Cairo"
  makadina/units/location-makadina.webp  15 / 20 / 25 / 45 MINUTES TO …
  marina-gate/units/location-…webp       35 MIN / 30 MIN / 45 MIN / 4.5 HR TO …

The map itself is worth keeping: it places the project against Cairo, Luxor,
Safaga, Hurghada, Sharm El Sheikh and Taba, which is orientation, not a claim.
So only the list is removed, by copying a patch of the drawing's own empty
background over it. The LOCATION & PROXIMITY heading stays — a heading is not
a claim — as does every place name on the map.

Boxes come from OCR word positions on each drawing, not from guesswork, and
tools/verify_no_drivetimes.py reads the results back to prove the claims are
gone.
"""
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# file -> (box to clear, y of a same-width patch of empty background)
JOBS = {
    'project-media/travco/marina-gate/units/location-marina-gate.webp':
        ((110, 484, 520, 582), 620),
    'project-media/travco/makadina/units/location-makadina.webp':
        ((34, 574, 440, 648), 470),
    'project-media/travco/ras-soma/location.webp':
        ((188, 490, 635, 580), 640),
}


def fill(im, box, src_y):
    """Rebuild the background inside `box`.

    Pasting a block of background straight in leaves a visible rectangle on
    Marina Gate's map, whose paper is a slow gradient with a fine mottle: the
    block carries the wrong local brightness. So the two are separated — the
    gradient is interpolated from the rows just above and below the box, and
    only the mottle is borrowed from the clean patch at `src_y`, as the patch
    minus its own blur. Flat-coloured maps come out identical either way.
    """
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    a = np.asarray(im, dtype=np.float32)

    # the gradient: blend the clean row above the box into the one below it
    top = a[max(0, y0 - 3), x0:x1]
    bot = a[min(a.shape[0] - 1, y1 + 3), x0:x1]
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    grad = top[None] * (1 - t) + bot[None] * t

    # the mottle: high-frequency detail from a clean patch of the same paper
    patch = im.crop((x0, src_y, x1, src_y + h))
    detail = (np.asarray(patch, dtype=np.float32)
              - np.asarray(patch.filter(ImageFilter.GaussianBlur(12)), dtype=np.float32))

    a[y0:y1, x0:x1] = np.clip(grad + detail, 0, 255)
    return Image.fromarray(a.astype(np.uint8))


def patch(rel, box, src_y, backup=True):
    path = os.path.join(ROOT, rel)
    if backup and not os.path.exists(path + '.orig'):
        shutil.copy2(path, path + '.orig')
    src = path + '.orig' if os.path.exists(path + '.orig') else path
    im = Image.open(src).convert('RGB')
    x0, y0, x1, y1 = box
    if src_y + (y1 - y0) > im.height:
        raise SystemExit(f'{rel}: patch source runs off the bottom')
    fill(im, box, src_y).save(path, 'WEBP', quality=88, method=6)
    print(f'  {rel}')
    print(f'      cleared {x1-x0}x{y1-y0} at ({x0},{y0}), mottle from y={src_y}'
          f'   {os.path.getsize(path)//1024}K')


def main():
    for rel, (box, src_y) in JOBS.items():
        patch(rel, box, src_y)
    print('\nnow run:  python3 tools/verify_no_drivetimes.py ' + ' '.join(JOBS))


if __name__ == '__main__':
    sys.exit(main())
