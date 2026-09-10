#!/usr/bin/env python3
"""Make the square Coming Soon card from El Masria's Adagio poster.

The poster is portrait, 1045x1506, and the launch strip's cards are square, so
something has to give. A centre crop cuts the wordmark in half and a bottom
crop loses it altogether, so the square is taken from the top: wordmark,
strapline, the villas and the cellist all stay in frame, and only the lower
part of the cello falls outside it.

That leaves one collision. The card's COMING SOON badge sits 14px from the top
and the poster prints NEW CAIRO | SHEIKH ZAYED across the same band, so the
badge lands on top of it and the line reads "| SHEIKH ZAYED". The fix is to
give the badge its own sky: the clear band above the strapline is stretched
from 40px to 170px, which pushes every printed line down clear of the badge
without scaling or moving anything within the artwork itself. Only empty sky
is stretched — no part of the design is resampled.
"""
import os

from PIL import Image

SRC = ('/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'
       '5260a69c-image.jpg')
OUT = '/home/user/Thevillagw/project-media/launches/adagio.webp'

BAND = 40       # the cloudless strip above NEW CAIRO | SHEIKH ZAYED
HEADROOM = 130  # how much clear sky the badge needs
SIDE = 1000     # the card is declared 1000x1000


def main():
    im = Image.open(SRC).convert('RGB')
    w, h = im.size
    sky = im.crop((0, 0, w, BAND)).resize((w, BAND + HEADROOM), Image.LANCZOS)
    tall = Image.new('RGB', (w, h + HEADROOM))
    tall.paste(sky, (0, 0))
    tall.paste(im.crop((0, BAND, w, h)), (0, BAND + HEADROOM))
    card = tall.crop((0, 0, w, w)).resize((SIDE, SIDE), Image.LANCZOS)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    card.save(OUT, 'WEBP', quality=86, method=6)
    print(f"  {os.path.basename(OUT):20s} {card.width}x{card.height} "
          f"{os.path.getsize(OUT)//1024}K  (from {w}x{h})")


if __name__ == '__main__':
    main()
