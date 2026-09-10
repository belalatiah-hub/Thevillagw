#!/usr/bin/env python3
"""Pull Ras Soma's pictures out of Travco's own 2023 brochure.

Two kinds of page, handled two ways.

A render page carries one wide photograph that the page crops with its own
edge, so the embedded file is taken and cropped the way the page crops it —
the file itself often runs half as wide again as the page shows.

A drawing page is the opposite: the master plan, the location map and the floor
plans each pair a drawing with a legend or a room schedule set beside it in
type, and the drawing alone is no use without them. Those come from the
rendered page.

Nothing from pages 9 to 13 appears here. Those are Almaza Bay, Travco's North
Coast development, and a picture of one project has no business on another's
page. Nor does the brochure's stock photography of people — the woman in the
hat, the silhouettes at sunset, the couple on the sun loungers, the horse and
rider, the paddleboarder — which shows no part of Ras Soma.

Three of its pages caption a picture with a place the picture does not show:
page 29 heads the sports club with a horse on a beach, page 32 heads the water
activities with a paddleboarder on open water, and page 36 heads RAS SOMA
MARINA with a speedboat and no marina in the frame. None is taken. The marina
here is page 37, which shows the quayside.
"""
import io
import os

import pymupdf
from PIL import Image

SRC = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
       'e3a2a27a-ERasSomaBrochure_062023.pdf')
OUT = '/home/user/Thevillagw/project-media/travco/ras-soma'

# page -> file, taken from the page's own embedded photograph
RENDERS = {
    14: 'bay.webp',                    # the bay and its reef from the air
    17: 'beach-cabana.webp',           # a cabana on the project's own beach
    19: 'steigenberger.webp',
    21: 'steigenberger-lobby.webp',
    26: 'spa.webp',                    # Mivida Spa
    30: 'sports-club.webp',
    34: 'the-town.webp',
    35: 'the-village.webp',
    37: 'marina.webp',
    38: 'beach-club.webp',
    40: 'oasis-lagoon-park.webp',
    41: 'wadi-park.webp',
    42: 'lagoon-beach-club.webp',
    44: 'cover.webp',
    47: 'residences-aerial.webp',
    51: 'beachfront-villa.webp',
    52: 'beachfront-villa-entry.webp',
    61: 'beach-villa.webp',
    62: 'beach-villa-entry.webp',
    66: 'shore-villa.webp',
    67: 'shore-villa-entry.webp',
    72: 'quad-chalet.webp',
    73: 'quad-chalet-entry.webp',
    80: 'apartments.webp',
    81: 'apartments-entry.webp',
    93: 'interior-living.webp',
    94: 'interior-lounge.webp',
}

# page -> file, taken from the rendered page so the legend or the room
# schedule stays with the drawing it explains
DRAWINGS = {
    15: 'location.webp',
    16: 'masterplan-overview.webp',
    46: 'masterplan.webp',
    53: 'plans/beachfront-villa.webp',
    63: 'plans/beach-villa.webp',
    68: 'plans/shore-villa.webp',
    74: 'plans/quad-chalet-ground.webp',
    75: 'plans/quad-chalet-upper.webp',
    82: 'plans/apartments-ground.webp',
    88: 'plans/apartments-upper.webp',
}


def visible(doc, page_no, xref):
    """The part of an embedded photograph its page actually shows."""
    page = doc[page_no - 1]
    info = doc.extract_image(xref)
    im = Image.open(io.BytesIO(info['image'])).convert('RGB')
    rects = page.get_image_rects(xref)
    if not rects:
        return im
    r, pr = rects[0], page.rect
    fx0 = max(0.0, (pr.x0 - r.x0) / r.width)
    fx1 = min(1.0, (pr.x1 - r.x0) / r.width)
    fy0 = max(0.0, (pr.y0 - r.y0) / r.height)
    fy1 = min(1.0, (pr.y1 - r.y0) / r.height)
    box = (int(fx0 * im.width), int(fy0 * im.height),
           int(fx1 * im.width), int(fy1 * im.height))
    if box[2] - box[0] < 200 or box[3] - box[1] < 200:
        return im
    return im.crop(box)


def biggest(doc, page_no):
    best, area = None, 0
    for x in doc[page_no - 1].get_images(full=True):
        info = doc.extract_image(x[0])
        if info['width'] * info['height'] > area:
            best, area = x[0], info['width'] * info['height']
    return best


def save(im, rel, width=1500, quality=82):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=quality, method=6)
    print(f"  {rel:38s} {im.width}x{im.height} {os.path.getsize(path)//1024}K")


def main():
    d = pymupdf.open(SRC)
    print('renders')
    for pn, rel in RENDERS.items():
        xref = biggest(d, pn)
        if not xref:
            print(f"  p{pn}: no image"); continue
        save(visible(d, pn, xref), rel)
    print('drawings')
    for pn, rel in DRAWINGS.items():
        pm = d[pn - 1].get_pixmap(dpi=170)
        save(Image.open(io.BytesIO(pm.tobytes('png'))).convert('RGB'), rel, width=1800)


if __name__ == '__main__':
    main()
