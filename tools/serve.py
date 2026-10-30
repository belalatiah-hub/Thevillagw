#!/usr/bin/env python3
"""Local SPA server for QA and Lighthouse runs.

It deliberately mirrors what production (Cloudflare Workers / GitHub Pages)
does, because a dev server that behaves differently produces measurements that
mean nothing:

  * gzip on text responses — without it Lighthouse sees the 574 KB document at
    full size and reports a first paint no real visitor experiences;
  * real Cache-Control — the blanket `no-store` it used to send is the one
    thing that disqualifies a page from the back/forward cache, so every run
    failed the bf-cache audit for a reason that does not exist in production.

    python3 tools/serve.py            # http://127.0.0.1:8099
"""
import gzip
import http.server
import io
import os
import posixpath
import socketserver
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8099

# Compressible types. Images and fonts are already compressed formats — gzipping
# them costs CPU and gains nothing.
TEXT = ('text/', 'application/javascript', 'application/json',
        'image/svg+xml', 'application/xml')


class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = urllib.parse.urlparse(path).path
        p = posixpath.normpath(urllib.parse.unquote(p)).lstrip('/')
        full = os.path.join(ROOT, p)
        if os.path.isdir(full):
            idx = os.path.join(full, 'index.html')
            return idx if os.path.exists(idx) else os.path.join(ROOT, 'index.html')
        if os.path.exists(full):
            return full
        return os.path.join(ROOT, 'index.html')   # SPA fallback

    def send_head(self):
        path = self.translate_path(self.path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404)
            return None

        ctype = self.guess_type(path)
        body = f.read()
        f.close()

        # Assets are content-addressed by path and change name when they change,
        # so they can be cached hard. The document itself must revalidate.
        is_doc = path.endswith('index.html')
        cache = 'no-cache' if is_doc else 'public, max-age=31536000, immutable'

        enc = None
        if any(ctype.startswith(t) for t in TEXT) and \
                'gzip' in self.headers.get('Accept-Encoding', ''):
            buf = io.BytesIO()
            with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6, mtime=0) as g:
                g.write(body)
            body = buf.getvalue()
            enc = 'gzip'

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', cache)
        if enc:
            self.send_header('Content-Encoding', enc)
            self.send_header('Vary', 'Accept-Encoding')
        self.end_headers()
        return io.BytesIO(body)

    def log_message(self, *a):
        pass


class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    # The port was fixed at 8099, which the callers already passed as an
    # argument and which was silently ignored -- so two QA runs could not share
    # a machine, and the second one failed against the first one's server.
    import sys
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            raise SystemExit('usage: serve.py [port]')
    print('serving %s on http://127.0.0.1:%d' % (ROOT, port))
    S(('127.0.0.1', port), H).serve_forever()
