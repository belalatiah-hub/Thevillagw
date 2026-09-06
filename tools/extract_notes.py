#!/usr/bin/env python3
"""Lift the provenance comments out of the data arrays, once.

`src/tpl_script2.html` carries 31 comment lines *inside* AREAS/DEVELOPERS/
PROJECTS/UNITS — section headers that record which client sheet a run of rows
came from, and why a value looks odd. Regenerating those arrays from the
database would delete every one of them, and they are the only record of that
reasoning anywhere.

So they are pulled out and anchored to the key of the row that follows, and
db_to_src.py re-emits each one above the same row. Run once; the JSON is then
edited like any other source file.

    python3 tools/extract_notes.py > tools/section_notes.json
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'tpl_script2.html')

KEYS = {'AREAS': 'key', 'DEVELOPERS': 'key', 'PROJECTS': 'slug', 'UNITS': 'id'}


def main():
    text = open(SRC, encoding='utf-8').read()
    out = {}
    for name, keyprop in KEYS.items():
        m = re.search(r'\n  var %s = \[\n(.*?)\n  \];' % name, text, re.S)
        if not m:
            sys.exit('could not find %s' % name)
        pending, notes, in_block = [], {}, False
        for line in m.group(1).split('\n'):
            s = line.strip()
            if not s:
                continue
            # A /* … */ note runs over several lines and its continuation
            # lines look like prose, not like comments. Track the state, or
            # the second line of every block note is mistaken for a data row.
            if in_block:
                pending.append(line.rstrip())
                if '*/' in s:
                    in_block = False
                continue
            if s.startswith('/*'):
                pending.append(line.rstrip())
                if '*/' not in s[2:]:
                    in_block = True
                continue
            if s.startswith('//'):
                pending.append(line.rstrip())
                continue
            if pending:
                km = re.search(r'\b%s:\s*[\'"]([^\'"]+)' % keyprop, s)
                if km:
                    notes[km.group(1)] = pending
                else:
                    # A comment with no row after it would be lost; say so
                    # rather than dropping it quietly.
                    notes.setdefault('__orphan__', []).extend(pending)
                pending = []
        if pending:
            notes.setdefault('__tail__', []).extend(pending)
        out[name] = notes
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
