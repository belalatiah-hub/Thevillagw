#!/usr/bin/env python3
"""Read every location map on the site and fail if one prints a drive time.

The site carries no drive times and no distances: a developer's "35 minutes to
the airport" is their claim, not a fact we can stand behind, and it changes
with the road, the traffic and the year. Keeping it out of the copy is easy.
Keeping it out of the *pictures* is not, because a brochure's location map
usually prints the list right on the drawing — and three of ours did, live,
until this check was written.

So the maps are read with OCR and matched against the patterns a proximity
list uses in either language. It is deliberately noisy on the side of
flagging: a false positive costs one look, a false negative puts a claim back
on the site.

Run it over the whole site:      python3 tools/verify_no_drivetimes.py
…or over specific files:         python3 tools/verify_no_drivetimes.py a.webp b.webp
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image
import pytesseract

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A proximity claim, in the shapes brochures actually print it.
PATTERNS = [
    (r'\b\d+(?:\.\d+)?\s*(?:MIN|MINS|MINUTES?)\b', 'minutes'),
    (r'\b\d+(?:\.\d+)?\s*(?:HR|HRS|HOURS?)\b', 'hours'),
    (r'\b\d+(?:\.\d+)?\s*(?:KM|KILOMET)', 'kilometres'),
    (r'\b\d+(?:\.\d+)?\s*دقيق', 'minutes (ar)'),
    (r'\b\d+(?:\.\d+)?\s*ساع', 'hours (ar)'),
    (r'\b\d+(?:\.\d+)?\s*كم\b', 'kilometres (ar)'),
    (r'\bMINUTE\s+DRIVE\b', 'minute drive'),
    (r'\bDRIVE\s+FROM\b', 'drive from'),
]


def site_maps():
    """Every location image the built site actually shows."""
    # via a file: the dump is ~2 MB and a captured pipe truncates it
    with tempfile.NamedTemporaryFile('w+', suffix='.json', delete=False) as fh:
        tmp = fh.name
    with open(tmp, 'w') as out:
        subprocess.run(['node', os.path.join(ROOT, 'tools', 'domtest.cjs'),
                        '--dump-data'], stdout=out, cwd=ROOT, check=True)
    with open(tmp) as fh:
        data = json.load(fh)
    os.unlink(tmp)
    found = set()

    def walk(x):
        if isinstance(x, str):
            if re.search(r'(location|/loc[-_]|proximity)', x, re.I) and x.endswith('.webp'):
                found.add(x)
        elif isinstance(x, dict):
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)

    walk(data)
    return sorted(found)


def read(path):
    im = Image.open(path).convert('L')
    # Upscale small type; the legends are set at 8-10pt on a 1500px drawing.
    if im.width < 2400:
        f = 2400 / im.width
        im = im.resize((2400, round(im.height * f)), Image.LANCZOS)
    return pytesseract.image_to_string(im, lang='eng')


def check(rel):
    # A site path starts with "/" but is rooted at the repo, not at the disk.
    path = (os.path.join(ROOT, rel.lstrip('/'))
            if rel.startswith(('/project-media/', '/media/')) or not os.path.isabs(rel)
            else rel)
    if not os.path.exists(path):
        return [('missing', rel)]
    text = ' '.join(read(path).split()).upper()
    hits = []
    for pat, what in PATTERNS:
        for m in re.finditer(pat, text, re.I):
            a, b = max(0, m.start() - 30), min(len(text), m.end() + 40)
            hits.append((what, text[a:b].strip()))
    return hits


def main():
    targets = sys.argv[1:] or site_maps()
    bad = 0
    for rel in targets:
        hits = check(rel)
        if hits:
            bad += 1
            print(f'FAIL {rel}')
            for what, ctx in hits[:4]:
                print(f'       {what}: …{ctx}…')
        else:
            print(f'ok   {rel}')
    print(f'\n{len(targets)} maps read, {bad} carrying a proximity claim')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
