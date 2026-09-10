#!/usr/bin/env python3
"""Cut the V out of the master logo and make a cursor of it.

The mark is the first glyph of the wordmark, a faceted teal check. Three things
had to be settled before it could stand in for the arrow.

It disappears on the dark bands. The teal is close enough to --teal-900 that
the plain mark is invisible over the footer and over a dark photograph, so it
is given a white rim and a soft shadow: the rim carries it on dark ground, the
shadow gives it an edge on the bone. Both are built at 8x and downsampled, so
the rim reads as a clean line rather than a staircase.

Its point is at the bottom, and a cursor's is not. Anchoring the hotspot to the
check's own tip put the whole glyph above the mouse, covering the word being
pointed at. The hotspot is the mark's top-left corner instead, so it sits down
and to the right of the pointer exactly as the arrow it replaces does.

It has to stay small. 28px for the mark, 37px for the canvas once the rim and
the shadow's room are added — near the 32px a system arrow occupies, and well
inside the size a browser will refuse.

Writes src/cursor_v.b64, which tools/build.py inlines at __CURSOR_V__.
"""
import base64
import io
import os

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'logo_dark.b64')
OUT = os.path.join(ROOT, 'src', 'cursor_v.b64')

SCALE = 8      # build at 8x, downsample for a smooth rim
MARK = 28      # the mark's width in CSS pixels
RIM = 1.6      # white rim, in CSS pixels
SHADOW = 3     # room the shadow needs, in CSS pixels


def v_mark():
    """The wordmark's first glyph, trimmed to its ink."""
    raw = base64.b64decode(open(SRC, encoding='utf-8').read().strip())
    logo = Image.open(io.BytesIO(raw)).convert('RGBA')
    alpha = logo.split()[3]
    # the V is the leftmost glyph: take columns up to the first empty one
    cols = [x for x in range(logo.width)
            if alpha.crop((x, 0, x + 1, logo.height)).getextrema()[1] > 8]
    end = cols[0]
    for c in cols[1:]:
        if c > end + 1:
            break
        end = c
    box = alpha.crop((cols[0], 0, end + 1, logo.height)).getbbox()
    return logo.crop((cols[0] + box[0], box[1], cols[0] + box[2], box[3]))


def build():
    v = v_mark()
    w = MARK * SCALE
    h = round(v.height * w / v.width)
    v = v.resize((w, h), Image.LANCZOS)

    grow = max(1, round(RIM * SCALE))
    pad = grow + SHADOW * SCALE
    canvas = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    a = Image.new('L', canvas.size, 0)
    a.paste(v.split()[3], (pad, pad))
    k = max(3, grow * 2 + 1)                       # MaxFilter wants an odd size

    shadow = (a.filter(ImageFilter.MaxFilter(k))
               .filter(ImageFilter.GaussianBlur(SCALE * 1.2))
               .point(lambda p: int(p * 0.40)))
    layer = Image.new('RGBA', canvas.size, (5, 46, 61, 0))
    layer.putalpha(shadow)
    canvas.alpha_composite(layer)

    rim = (a.filter(ImageFilter.MaxFilter(k))
            .filter(ImageFilter.GaussianBlur(SCALE * 0.3))
            .point(lambda p: 255 if p > 120 else 0)
            .filter(ImageFilter.GaussianBlur(SCALE * 0.22)))
    layer = Image.new('RGBA', canvas.size, (255, 255, 255, 0))
    layer.putalpha(rim)
    canvas.alpha_composite(layer)

    top = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    top.paste(v, (pad, pad), v)
    canvas.alpha_composite(top)

    out = canvas.resize((round(canvas.width / SCALE), round(canvas.height / SCALE)),
                        Image.LANCZOS)
    buf = io.BytesIO()
    out.save(buf, 'PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(b64 + '\n')

    hot = round(pad / SCALE)
    print(f'  cursor_v.b64  {out.width}x{out.height}  mark {MARK}px  '
          f'hotspot {hot} {hot}  {len(buf.getvalue())//1}B png, {len(b64)}B base64')
    print(f'  CSS:  cursor:url("data:image/png;base64,__CURSOR_V__") {hot} {hot}, default')


if __name__ == '__main__':
    build()
