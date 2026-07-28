#!/usr/bin/env python3
"""Build src/tpl_*.html into the single-file production index.html.

The site ships as one self-contained HTML document: the CSP forbids
third-party scripts, so everything the page needs is inlined. This script is
the only supported way to produce index.html — edit the templates in src/,
never the generated file.

    python3 tools/build.py            # build (minified)
    python3 tools/build.py --raw      # build unminified, for debugging
    node tools/domtest.cjs            # then always run the tests

Minification touches the inline <script> and <style> blocks only, and is
deliberately conservative: comments and blank lines go, nothing is renamed or
reordered, so a production stack trace still points at recognisable source.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'index.html')

# tpl_script_maps.html (THE VILLAGE MAPS) is intentionally excluded — the
# feature is parked for a rebuild. The source stays in src/ so it can return.
PARTS = [
    'tpl_head.html', 'tpl_style.html', 'tpl_body.html',
    'tpl_script1.html', 'tpl_script2.html', 'tpl_script2b.html',
    'tpl_script_finder.html', 'tpl_script3.html', 'tpl_script_chat.html',
    'tpl_script_search.html', 'tpl_script4.html',
]


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def strip_js_comments(js):
    """Drop // and /* */ comments without touching strings or regex literals.

    Walks character by character: anything inside a quote or a regex is copied
    verbatim, so a comment marker that is really data ("https://…", /[/*]/)
    survives intact.
    """
    out = []
    i, n = 0, len(js)
    while i < n:
        c = js[i]
        if c in '"\'`':
            q = c
            out.append(c)
            i += 1
            while i < n:
                if js[i] == '\\':
                    out.append(js[i])
                    if i + 1 < n:
                        out.append(js[i + 1])
                    i += 2
                    continue
                out.append(js[i])
                if js[i] == q:
                    i += 1
                    break
                i += 1
            continue
        if c == '/' and i + 1 < n:
            nxt = js[i + 1]
            if nxt == '/':
                while i < n and js[i] != '\n':
                    i += 1
                continue
            if nxt == '*':
                j = js.find('*/', i + 2)
                i = (j + 2) if j != -1 else n
                continue
            # Decide slash-as-regex from the previous significant character.
            prev = ''
            for ch in reversed(out):
                if not ch.isspace():
                    prev = ch
                    break
            if prev == '' or prev in '(,=:[!&|?{};+-*%~^<>':
                out.append(c)
                i += 1
                in_class = False
                while i < n:
                    ch = js[i]
                    out.append(ch)
                    if ch == '\\':
                        i += 1
                        if i < n:
                            out.append(js[i])
                        i += 1
                        continue
                    if ch == '[':
                        in_class = True
                    elif ch == ']':
                        in_class = False
                    elif ch == '/' and not in_class:
                        i += 1
                        break
                    elif ch == '\n':
                        i += 1
                        break
                    i += 1
                continue
        out.append(c)
        i += 1
    return ''.join(out)


def minify_js(js):
    """Comments out, indentation out, blank lines out. Line structure kept.

    Newlines are preserved because the source relies on automatic semicolon
    insertion in places; joining lines would change behaviour.
    """
    js = strip_js_comments(js)
    lines = (ln.strip() for ln in js.split('\n'))
    return '\n'.join(ln for ln in lines if ln)


def minify_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', '', css)
    css = re.sub(r'\s{2,}', ' ', css)
    css = re.sub(r'\s*([{};,>])\s*', r'\1', css)
    css = re.sub(r':\s+', ':', css)
    return re.sub(r';}', '}', css).strip()


def apply_to_blocks(doc, tag, fn):
    """Run fn over the body of every <tag>…</tag> block in the document."""
    pat = re.compile(r'(<' + tag + r'[^>]*>)(.*?)(</' + tag + r'>)', re.S)
    return pat.sub(lambda m: m.group(1) + fn(m.group(2)) + m.group(3), doc)


def main():
    raw = '--raw' in sys.argv
    doc = '\n'.join(read(p) for p in PARTS)

    # The brand mark is inlined as a data URI so the first paint needs no extra
    # request. Favicons stay real files — data-URI favicons cache too hard to
    # ever update.
    for token, fname in (('__LOGO_DARK__', 'logo_dark.b64'),
                         ('__LOGO_BONE__', 'logo_bone.b64')):
        with open(os.path.join(SRC, fname), encoding='utf-8') as f:
            doc = doc.replace(token, 'data:image/png;base64,' + f.read().strip())

    left = doc.count('__LOGO') + doc.count('__INTRO_VIDEO__') + doc.count('__FAVICON__')
    if left:
        raise SystemExit('build aborted: %d placeholder(s) left unresolved' % left)

    before = len(doc.encode('utf-8'))
    if not raw:
        doc = apply_to_blocks(doc, 'script', minify_js)
        doc = apply_to_blocks(doc, 'style', minify_css)
    after = len(doc.encode('utf-8'))

    # The engineering banner lives at the END of the document: in <head> it
    # pushed <meta charset> past the 1 KB the parser is required to sniff.
    banner_path = os.path.join(SRC, '_banner.txt')
    if os.path.exists(banner_path):
        with open(banner_path, encoding='utf-8') as f:
            doc = doc.rstrip() + '\n' + f.read().strip() + '\n'

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(doc)

    # main.js is the extracted app bundle that the DOM test suite executes.
    scripts = re.findall(r'<script>(.*?)</script>', doc, re.S)
    main_js = next(s for s in scripts if '"use strict"' in s)
    with open(os.path.join(ROOT, 'tools', 'main.js'), 'w', encoding='utf-8') as f:
        f.write(main_js)

    saved = before - after
    note = '' if raw else '  (minified: -%s KB, -%.0f%%)' % (round(saved / 1024), 100.0 * saved / before)
    print('index.html %s KB%s' % (round(after / 1024), note))


if __name__ == '__main__':
    main()
