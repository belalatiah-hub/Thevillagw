#!/usr/bin/env python3
"""Derive the shipped image variants from the originals in the repo.

The PNG/large-WebP originals stay in git as the source of truth; everything the
browser actually downloads is generated here, so a variant can never drift from
its source or go missing without this script noticing.

    python3 tools/assets.py            # regenerate, report what changed
    python3 tools/assets.py --check    # fail if anything is missing/stale

What it produces, and why:

  logos/<name>.webp        23 developer + 8 project logos. The originals are
  logos/<name>-160.webp    512px PNGs that get drawn into 60-74px circles —
                           about 8x the pixels painted, in a format with no
                           modern compression. 751 KB became 309 KB, and the
                           160px cut makes a circle cost roughly 4 KB.

  project-media/hero/      The home hero is the LCP element. At 1600x900 it
    <name>-800.webp        shipped desktop pixels to a 390px phone; the 800px
                           cut is a quarter of the bytes and sits behind a
                           94%-opacity scrim, so the upscale is invisible.

Run tools/build.py afterwards only if you changed which files exist — the
build inlines no imagery, it just references these paths.
"""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (source glob, [(suffix, longest-edge or None for native, quality)])
JOBS = [
    ('logos/*.png',            [('', None, 88), ('-160', 160, 86)]),
    ('logos/projects/*.png',   [('', None, 88)]),
    ('project-media/hero/[!.]*[!0].webp', [('-800', 800, 76)]),
]


def derive(src, suffix, edge, quality, check):
    base, _ = os.path.splitext(src)
    out = base + suffix + '.webp'
    if check:
        if not os.path.exists(out):
            return ('MISSING', out, 0)
        if os.path.getmtime(out) < os.path.getmtime(src):
            return ('STALE', out, 0)
        return (None, out, os.path.getsize(out))

    im = Image.open(src)
    if im.mode not in ('RGBA', 'RGB'):
        im = im.convert('RGBA')
    if edge and max(im.width, im.height) > edge:
        sc = float(edge) / max(im.width, im.height)
        im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))),
                       Image.LANCZOS)
    im.save(out, 'WEBP', quality=quality, method=6)
    return ('wrote', out, os.path.getsize(out))


def main():
    check = '--check' in sys.argv
    os.chdir(ROOT)
    problems, n, total = [], 0, 0
    for pattern, variants in JOBS:
        for src in sorted(glob.glob(pattern)):
            # Never treat a generated file as a source.
            if src.endswith('-160.webp') or src.endswith('-800.webp'):
                continue
            for suffix, edge, q in variants:
                status, out, size = derive(src, suffix, edge, q, check)
                if status in ('MISSING', 'STALE'):
                    problems.append('%s %s' % (status, out))
                n += 1
                total += size

    if check:
        for p in problems:
            print(p)
        print('%d variants checked, %d problem(s)' % (n, len(problems)))
        raise SystemExit(1 if problems else 0)
    print('%d variants written, %d KB total' % (n, total // 1024))


if __name__ == '__main__':
    main()
