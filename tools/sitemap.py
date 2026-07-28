#!/usr/bin/env python3
"""Generate sitemap.xml from the routes the app actually renders.

The sitemap used to be maintained by hand, which meant it silently fell behind
the data: before this script existed it listed 202 unit URLs for 223 units and
14 developer pages for 24 developers, so roughly a hundred real pages were
invisible to search engines.

Routes come from the app itself — `node tools/domtest.cjs --routes` boots the
real bundle and enumerates every indexable path — so the sitemap cannot drift
from what the site serves.

    python3 tools/build.py && python3 tools/sitemap.py
    python3 tools/sitemap.py --check     # non-zero if sitemap.xml is stale
"""
import datetime
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'sitemap.xml')
HOST = 'https://www.thevillageinvestment.com'


def routes():
    out = subprocess.run(['node', os.path.join(ROOT, 'tools', 'domtest.cjs'), '--routes'],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout.strip().splitlines()[-1])


def build(paths, today):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for en in paths:
        ar = en.replace('/en/', '/ar/', 1)
        # Both language versions are listed, and each carries the full set of
        # hreflang alternates pointing at the other — Google requires the
        # annotation to be reciprocal or it ignores it.
        for loc in (en, ar):
            lines += [
                '  <url>',
                '    <loc>%s%s</loc>' % (HOST, loc),
                '    <lastmod>%s</lastmod>' % today,
                '    <xhtml:link rel="alternate" hreflang="en" href="%s%s"/>' % (HOST, en),
                '    <xhtml:link rel="alternate" hreflang="ar" href="%s%s"/>' % (HOST, ar),
                '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>' % (HOST, en),
                '  </url>',
            ]
    lines.append('</urlset>')
    return '\n'.join(lines) + '\n'


def main():
    check = '--check' in sys.argv
    paths = routes()

    # Reuse the existing lastmod when the URL set has not changed, so a rebuild
    # does not tell every crawler that all 676 pages changed today.
    old = ''
    if os.path.exists(OUT):
        with open(OUT, encoding='utf-8') as f:
            old = f.read()
    today = datetime.date.today().isoformat()
    fresh = build(paths, today)

    def locs(x):
        return sorted(l.strip() for l in x.splitlines() if '<loc>' in l)

    if locs(old) == locs(fresh):
        print('sitemap.xml already lists all %d URLs' % (len(paths) * 2))
        return

    if check:
        missing = set(locs(fresh)) - set(locs(old))
        extra = set(locs(old)) - set(locs(fresh))
        print('sitemap.xml is stale: %d missing, %d stale' % (len(missing), len(extra)))
        for m in sorted(missing)[:10]:
            print('   missing', m)
        raise SystemExit(1)

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(fresh)
    print('sitemap.xml: %d routes x 2 languages = %d URLs' % (len(paths), len(paths) * 2))


if __name__ == '__main__':
    main()
