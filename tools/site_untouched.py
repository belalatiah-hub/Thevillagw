#!/usr/bin/env python3
"""Prove a change did nothing to the public site.

The dashboard and the site live in one repository, and the owner's rule is
that dashboard work must not reach the pages visitors see. That is a claim
about bytes, so this checks bytes rather than intent: it compares everything
the public site is made of between two commits and says whether a visitor
would get a different file.

    python3 tools/site_untouched.py                 # working tree vs HEAD
    python3 tools/site_untouched.py HEAD~3          # working tree vs there
    python3 tools/site_untouched.py HEAD~3 HEAD     # between two commits

Exit code 0 means the public site is byte-identical; 1 means it changed.
A non-zero exit is not automatically wrong — a real site change should
change it — it is there so a dashboard-only change can be gated on it.

What counts as public: the built page and its siblings, everything the
browser can fetch, and the sources the page is built from. `admin/` and
`src/admin/` are deliberately excluded, and so is `docs/`, which
.assetsignore keeps out of the deploy entirely.
"""
import subprocess
import sys

PUBLIC = [
    'index.html', 'sitemap.xml', 'robots.txt', '404.html', 'llms.txt',
    'CNAME', '_headers', '.assetsignore', 'wrangler.toml',
    'src/', 'project-media/', 'logos/', 'fonts/', 'tools/',
]
EXCLUDE = ('src/admin/', 'admin/', 'docs/', 'supabase/', 'data-import-kit/')


def changed(a, b):
    """The files git says differ, filtered to what a visitor can reach."""
    cmd = ['git', 'diff', '--name-only', a] + ([b] if b else [])
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    hits = []
    for f in out.splitlines():
        if f.startswith(EXCLUDE):
            continue
        if any(f == p or f.startswith(p) for p in PUBLIC):
            hits.append(f)
    return hits


def main():
    a = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
    b = sys.argv[2] if len(sys.argv) > 2 else None
    where = '%s..%s' % (a, b) if b else '%s..working tree' % a

    hits = changed(a, b)
    admin = [f for f in subprocess.run(
        ['git', 'diff', '--name-only', a] + ([b] if b else []),
        capture_output=True, text=True, check=True).stdout.splitlines()
        if f.startswith(('admin/', 'src/admin/'))]

    print('%s\n' % where)
    print('  dashboard files changed : %d' % len(admin))
    print('  public files changed    : %d' % len(hits))
    if hits:
        print('\nthe public site WOULD change:')
        for f in hits:
            print('   %s' % f)
        return 1
    print('\nthe public site is byte-identical.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
