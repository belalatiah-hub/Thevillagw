#!/usr/bin/env python3
"""Inline a standalone project card's pictures so it is one file.

The cards in docs/cards/ are meant to be sent to someone — attached to an
email, dropped in a chat — and opened wherever they land, with no server and
no network. That only works if every image is inside the HTML, so each card is
written as `<name>.src.html` with `__TOKEN__` where a picture goes, and this
resolves the tokens against `<name>.assets.json`.

    python3 tools/build_card.py shams-soma

The manifest is a plain map, token -> either a path or an object:

    {"HERO":  {"file": "project-media/.../hero.webp", "width": 1600},
     "PLAN":  "project-media/.../masterplan.webp"}

  file     repository-relative
  width    resample down to this before encoding; omitted means leave it alone
  quality  WebP quality, default 82; 0 asks for lossless, which is what a
           flat-colour wordmark wants and what a photograph never does

A token in the source with no entry, or an entry no token uses, stops the
build: a card that silently ships a broken picture is worse than one that
does not ship.
"""
import base64
import io
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, 'docs', 'cards')


def encode(spec):
    """One picture, as a WebP data URI, plus what it cost."""
    if isinstance(spec, str):
        spec = {'file': spec}
    path = os.path.join(ROOT, spec['file'])
    if not os.path.exists(path):
        sys.exit('missing: %s' % spec['file'])

    im = Image.open(path)
    im = im.convert('RGBA') if 'A' in im.getbands() else im.convert('RGB')
    width = spec.get('width')
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)

    q = spec.get('quality', 82)
    buf = io.BytesIO()
    if q:
        im.save(buf, 'WEBP', quality=q, method=6)
    else:
        im.save(buf, 'WEBP', lossless=True, quality=100, method=6)
    raw = buf.getvalue()
    return 'data:image/webp;base64,' + base64.b64encode(raw).decode(), im.size, len(raw), q


def main():
    if len(sys.argv) < 2:
        sys.exit('usage: build_card.py <card-name>')
    name = sys.argv[1]
    src_path = os.path.join(CARDS, name + '.src.html')
    man_path = os.path.join(CARDS, name + '.assets.json')
    out_path = os.path.join(CARDS, name + '.html')
    for p in (src_path, man_path):
        if not os.path.exists(p):
            sys.exit('missing: %s' % os.path.relpath(p, ROOT))

    src = open(src_path, encoding='utf-8').read()
    manifest = json.load(open(man_path, encoding='utf-8'))

    used = set(re.findall(r'__([A-Z_0-9]+)__', src))
    missing = sorted(used - set(manifest))
    unused = sorted(set(manifest) - used)
    if missing:
        sys.exit('the card asks for pictures the manifest has not got: %s' % ', '.join(missing))
    if unused:
        sys.exit('the manifest carries pictures the card never shows: %s' % ', '.join(unused))

    total = 0
    for tok in sorted(manifest):
        uri, size, raw, q = encode(manifest[tok])
        src = src.replace('__%s__' % tok, uri)
        total += raw
        print('%-12s %-11s %-9s %7.1f KB' % (
            tok, '%dx%d' % size, 'lossless' if not q else 'q%d' % q, raw / 1024))

    open(out_path, 'w', encoding='utf-8').write(src)
    print('\n%-12s %.2f MB  (%.2f MB of it pictures, %d of them)'
          % (name + '.html', os.path.getsize(out_path) / 1048576, total / 1048576, len(manifest)))


if __name__ == '__main__':
    main()
