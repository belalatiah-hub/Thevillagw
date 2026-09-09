#!/usr/bin/env python3
"""Pull the two ISOLA brochures' pictures out at press resolution.

Two things make this less than a straight extract.

The renders are laid into the page wider than the page is, so the page edge
crops them — but the file itself holds the whole render, and the whole render
is the developer's own asset, so that is what is taken. What the file also
holds, on ISOLA Quattro, is a wide band of the brochure's beige backdrop that
the render fades into; that band is layout, not photograph, so uniform edges
are trimmed off.

The other two are the reverse: ISOLA Quattro's location map and master plan are
drawn as near-black rasters that the page lifts with its own background and
labels. Extracted alone they are unreadable, so those two come from the
rendered page instead.
"""
import io
import os

import pymupdf
from PIL import Image, ImageChops, ImageFilter, ImageStat

OUT = '/home/user/Thevillagw/project-media/elmasria'
CENTRA = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/5726d423-ISOLA_CENTRA_20253.pdf'
QUATTRO = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/e581a406-ISOLA_QUATTRO_2026.pdf'


def trim_backdrop(im, band=8, thr=4.0, gap=6, axis='x'):
    """Keep the part of a wide file that is photograph, drop the brochure's fan.

    ISOLA Quattro composites each render onto a beige fan that fills the other
    half of the file, and fades one into the other, so there is no flat edge to
    walk in from and no colour that separates them — the fan is as saturated as
    the render. What does separate them is detail: the fan is a smooth gradient
    with faint ruled lines and scores about 1 on a high-pass, while the render
    scores 10 to 40. The widest run of columns above `thr` is the photograph.
    """
    if axis == 'both':
        return trim_backdrop(trim_backdrop(im, band, thr, gap, 'x'),
                             band, thr, gap, 'y')
    g = im.convert('L')
    hp = ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(3)))
    w, h = g.size
    if axis == 'y':
        prof = [ImageStat.Stat(hp.crop((0, y, w, y + band))).mean[0]
                for y in range(0, h - band, band)]
    else:
        prof = [ImageStat.Stat(hp.crop((x, 0, x + band, h))).mean[0]
                for x in range(0, w - band, band)]
    on = [i for i, v in enumerate(prof) if v >= thr]
    if not on:
        return im
    best = (on[0], on[0])
    start = prev = on[0]
    for i in on[1:] + [10 ** 9]:
        if i - prev > gap:
            if prev - start > best[1] - best[0]:
                best = (start, prev)
            start = i
        prev = i
    lim = h if axis == 'y' else w
    a, b = best[0] * band, min(lim, (best[1] + 1) * band)
    if b - a <= lim // 4:
        return im
    return im.crop((0, a, w, b)) if axis == 'y' else im.crop((a, 0, b, h))


def trim_flat(im, tol=14):
    """Drop edge rows and columns that are flat backdrop, not picture."""
    px = im.convert('RGB')
    w, h = px.size

    def flat(box, ref):
        crop = px.crop(box)
        lo, hi = zip(*crop.getextrema())
        if max(h2 - l2 for l2, h2 in zip(lo, hi)) > tol:
            return False
        return all(abs(a - b) <= tol * 2 for a, b in zip(crop.getpixel((0, 0)), ref))

    left, right, top, bot = 0, w, 0, h
    ref_l, ref_r = px.getpixel((0, h // 2)), px.getpixel((w - 1, h // 2))
    ref_t, ref_b = px.getpixel((w // 2, 0)), px.getpixel((w // 2, h - 1))
    step = 4
    while left + step < right and flat((left, 0, left + step, h), ref_l):
        left += step
    while right - step > left and flat((right - step, 0, right, h), ref_r):
        right -= step
    while top + step < bot and flat((0, top, w, top + step), ref_t):
        top += step
    while bot - step > top and flat((0, bot - step, w, bot), ref_b):
        bot -= step
    return im.crop((left, top, right, bot)) if (left or top or right != w or bot != h) else im


def embedded(doc, xref):
    info = doc.extract_image(xref)
    return Image.open(io.BytesIO(info['image'])).convert('RGB')


def rendered(path, page_no, dpi=200):
    """The page as the brochure draws it — backdrop, labels and all."""
    d = pymupdf.open(path)
    pm = d[page_no - 1].get_pixmap(dpi=dpi)
    return Image.open(io.BytesIO(pm.tobytes('png'))).convert('RGB')


def save(im, rel, width=1400, quality=82):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=quality, method=6)
    print(f"  {rel:38s} {im.width}x{im.height}  {os.path.getsize(path)//1024}K")


def crop_frac(im, l=0, t=0, r=1, b=1):
    return im.crop((int(l * im.width), int(t * im.height),
                    int(r * im.width), int(b * im.height)))


def main():
    c = pymupdf.open(CENTRA)
    q = pymupdf.open(QUATTRO)

    # ISOLA Centra. Its eleven "BUILDING NO." pages carry only two distinct
    # renders between them, and its four "TYPE" pages only two more, so they
    # are the project's architecture rather than any one building, and are
    # named that way.
    print('isola-centra')
    for name, xref in [('location.webp', 12), ('masterplan.webp', 31),
                       ('residences-a.webp', 1374), ('residences-b.webp', 1400),
                       ('commercial-a.webp', 2151), ('commercial-b.webp', 2152)]:
        save(trim_flat(embedded(c, xref)), 'isola-centra/' + name)
    save(crop_frac(trim_flat(embedded(c, 1374)), 0, 0.04, 1, 0.94),
         'isola-centra/cover.webp', width=1100)

    # ISOLA Quattro. Three of its five type pages head a building elevation and
    # two head a landscape view, so each file is named for what it shows.
    print('isola-quattro')
    for name, xref in [('facade-a.webp', 95), ('terraces.webp', 129),
                       ('walkway.webp', 165), ('facade-d.webp', 199),
                       ('waterway.webp', 233)]:
        save(trim_backdrop(embedded(q, xref)), 'isola-quattro/' + name)
    save(trim_flat(rendered(QUATTRO, 4)),  'isola-quattro/location.webp')
    save(trim_backdrop(rendered(QUATTRO, 11), thr=2.0, axis='both'),
         'isola-quattro/masterplan.webp')
    save(crop_frac(trim_backdrop(embedded(q, 95)), 0, 0.05, 1, 0.92),
         'isola-quattro/cover.webp', width=1100)


if __name__ == '__main__':
    main()
