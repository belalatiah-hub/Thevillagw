#!/usr/bin/env python3
"""Build src/admin/*.html into the single-file dashboard at admin/index.html.

Same rules as the public site: one self-contained document, no third-party
script, and a CSP whose script-src is the sha256 of each inline block rather
than 'unsafe-inline'. The one difference is connect-src, which has to reach
Supabase — the dashboard, unlike the site, does query the database.

    python3 tools/build_admin.py           # build (minified)
    python3 tools/build_admin.py --raw     # unminified, for debugging
    node tools/admintest.cjs               # then always run the tests
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'admin')
OUT_DIR = os.path.join(ROOT, 'admin')
OUT = os.path.join(OUT_DIR, 'index.html')

# Order matters twice over: the browser runs these in sequence, and each
# file registers itself with what the previous one put on window.CMS.
PARTS = [
    'tpl_head.html',
    'tpl_style.html',
    'tpl_body.html',
    'js_core.html',     # h(), icons, strings — everything else needs it
    'js_api.html',      # auth + PostgREST
    'js_shell.html',    # gate, rail, router
    'js_crud.html',     # list/drawer engine
    'js_views.html',    # the content screens register their routes
    'js_sheet.html',    # csv/xlsx reader
    'js_import.html',   # the price importer registers its route
    'js_publish.html',  # publish route, then boot
]

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import (apply_to_blocks, minify_js, minify_css, pin_script_hashes,  # noqa: E402
                   strip_js_comments)


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def check_bilingual(doc):
    """Every UI string is a pair. A missing half is a build failure.

    The site is bilingual by contract, and a dashboard that silently falls
    back to English for one label is how that contract starts to rot.
    """
    m = re.search(r'var STR = \{(.*?)\n  \};', doc, re.S)
    if not m:
        raise SystemExit('build aborted: could not find the STR table')
    bad = []
    for key, en, ar in re.findall(
            r"(\w+):\s*\[\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]", m.group(1)):
        if not en.strip() or not ar.strip():
            bad.append(key)
        elif not re.search(r'[؀-ۿ]', ar) and re.search(r'[A-Za-z]{3}', ar):
            bad.append(key + ' (Arabic side looks English)')
    if bad:
        raise SystemExit('build aborted: %d string(s) not bilingual: %s'
                         % (len(bad), ', '.join(bad[:8])))
    return len(re.findall(r"\w+:\s*\[", m.group(1)))


def main():
    raw = '--raw' in sys.argv
    doc = '\n'.join(read(p) for p in PARTS)

    with open(os.path.join(SRC, '_fontface.css'), encoding='utf-8') as f:
        doc = doc.replace('__FONTFACE__', f.read().rstrip())

    left = doc.count('__FONTFACE__')
    if left:
        raise SystemExit('build aborted: %d placeholder(s) left unresolved' % left)

    pairs = check_bilingual(doc)

    # A raw-HTML sink is the one way a project name typed into a form could
    # become markup on the page. The check runs on comment-stripped code, so
    # naming the hazard in a comment is not itself a build failure.
    code = ''.join(strip_js_comments(b) for b in
                   re.findall(r'<script\b[^>]*>(.*?)</script>', doc, re.S))
    for sink in ('innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write',
                 'eval(', 'new Function('):
        if sink in code:
            raise SystemExit('build aborted: %s is not allowed in the dashboard' % sink)

    before = len(doc.encode('utf-8'))
    if not raw:
        doc = apply_to_blocks(doc, 'script', minify_js)
        doc = apply_to_blocks(doc, 'style', minify_css)
    after = len(doc.encode('utf-8'))

    doc = pin_script_hashes(doc)

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(doc)

    kb = after / 1024.0
    saved = before - after
    print('admin/index.html %d KB  (%d bilingual strings%s)' % (
        round(kb), pairs,
        '' if raw else ', minified: -%d KB, -%d%%' % (saved / 1024.0, round(100.0 * saved / before))))


if __name__ == '__main__':
    main()
