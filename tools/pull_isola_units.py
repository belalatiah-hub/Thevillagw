#!/usr/bin/env python3
"""Convert the client's two ISOLA archives into the site's media folders.

The archives are RGBA PNGs at two to two-and-a-half megabytes each. Every one
is flattened onto white before it becomes a WebP: the floor plans in particular
are line drawings on a transparent ground, and a transparent WebP over the
site's own paper renders as grey-on-grey in dark mode.

Names here are the site's, not the archive's. The archive's are the sheet's
image codes — `fp-ap2-cen.`, `FP-Ap3-cen.PNG`, `fp-adm2-cen-` — which carry
stray dots, trailing hyphens and mixed case from however they were typed into
the spreadsheet. The mapping from code to file is kept in one dict so that a
code can be traced back, and nothing downstream has to quote a filename with a
full stop in the middle of it.
"""
import os

from PIL import Image

SRC = '/tmp/claude-0/-home-user-Thevillagw/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/scratchpad/rar'
OUT = '/home/user/Thevillagw/project-media/elmasria'

# sheet image code -> where it lands on the site
CENTRA = {
    'ap1-cen-0': 'isola-centra/units/render-1.webp',
    'ap1-cen-1': 'isola-centra/units/render-2.webp',
    'ap1-cen-2': 'isola-centra/units/render-3.webp',
    'ap1-cen-3': 'isola-centra/units/render-4.webp',
    'ap1-cen-4': 'isola-centra/units/render-5.webp',
    'ap1-cen-5': 'isola-centra/units/render-6.webp',
    'ap1-cen-6': 'isola-centra/units/render-7.webp',
    'ad-cen-0':  'isola-centra/units/commercial-1.webp',
    'ad-cen-1':  'isola-centra/units/commercial-2.webp',
    'ad-cen-2':  'isola-centra/units/commercial-3.webp',
    'fp-ap1-cen':    'isola-centra/plans/floor-01.webp',
    'fp-ap2-cen.':   'isola-centra/plans/floor-02.webp',
    'FP-Ap3-cen':    'isola-centra/plans/floor-03.webp',
    'FP-Ap4-cen':    'isola-centra/plans/floor-04.webp',
    'FP-Ap5-cen':    'isola-centra/plans/floor-05.webp',
    'FP-Ap6-cen':    'isola-centra/plans/floor-06.webp',
    'FP-Ap7-cen':    'isola-centra/plans/floor-07.webp',
    'FP-Ap8-cen':    'isola-centra/plans/floor-08.webp',
    'FP-Ap9-cen':    'isola-centra/plans/floor-09.webp',
    'FP-Ap10-cen':   'isola-centra/plans/floor-10.webp',
    'fp-adm-cen-0':  'isola-centra/plans/floor-admin-1.webp',
    'fp-adm2-cen-':  'isola-centra/plans/floor-admin-2.webp',
}
QUATTRO = {
    'ap1-qu-0': 'isola-quattro/units/render-1.webp',
    'ap1-qu-1': 'isola-quattro/units/render-2.webp',
    'ap1-qu-2': 'isola-quattro/units/render-3.webp',
    'ap1-qu-3': 'isola-quattro/units/render-4.webp',
    'ap1-qu-4': 'isola-quattro/units/render-5.webp',
    # Three renders in the archive that no sheet row points at. They are
    # unmistakably this project — its own buildings, from the same set — so
    # they join the project gallery rather than any unit.
    'ap1-qu-5': 'isola-quattro/units/render-6.webp',
    'ap1-qu-6': 'isola-quattro/units/render-7.webp',
    'ap1-qu-7': 'isola-quattro/units/render-8.webp',
    'fp-ap1-qu':    'isola-quattro/plans/floor-1-2-bed.webp',
    'fp-ap3bed-qu': 'isola-quattro/plans/floor-3-bed.webp',
}

# The master plan and the location map arrived a second time in these
# archives. They are the same two drawings already extracted from each
# brochure, so the units point at the existing files instead of a duplicate.
SKIP = {'mp-centra', 'location-centra', 'mp-quatro', 'location quatro'}


def convert(src_dir, table):
    seen = set()
    for name in sorted(os.listdir(src_dir)):
        code = os.path.splitext(name)[0]
        if code in SKIP:
            print(f"  skip (already on the site)   {name}")
            continue
        rel = table.get(code)
        if not rel:
            print(f"  UNMAPPED                     {name}")
            continue
        seen.add(code)
        im = Image.open(os.path.join(src_dir, name))
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA')
            flat = Image.new('RGB', im.size, (255, 255, 255))
            flat.paste(im, mask=im.split()[-1])
            im = flat
        else:
            im = im.convert('RGB')
        if im.width > 1400:
            im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.save(dst, 'WEBP', quality=82, method=6)
        print(f"  {code:16s} -> {rel:44s} {im.width}x{im.height} {os.path.getsize(dst)//1024}K")
    missing = set(table) - seen
    if missing:
        print(f"  MISSING FROM ARCHIVE: {', '.join(sorted(missing))}")


print('isola-centra')
convert(os.path.join(SRC, 'centra'), CENTRA)
print('isola-quattro')
convert(os.path.join(SRC, 'quattro'), QUATTRO)
