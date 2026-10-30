/* ============================================================
   PRERENDER — one real HTML file per URL

   The site is a single-page app: every one of the 1,570 URLs in sitemap.xml
   was served the same document, and the title, the description, the content
   and the structured data were all written by JavaScript after load. Google
   runs JavaScript, but in a separate and later pass; most other engines and
   every AI crawler do not run it at all. What they read was one page repeated
   1,570 times.

   This writes the page each URL actually is. It drives the real application
   in a real browser -- the same code that renders for a visitor -- and saves
   what it produced. Nothing re-implements the rendering, so nothing can drift
   from it.

   Speed comes from not reloading: the bundle is parsed once, and every route
   after that is a History-API navigation inside the same page, which is what
   the app is built to do anyway. 1,570 routes take minutes, not hours.

   The saved file is a shell, not a snapshot of a running app: the markup the
   build produces, with this route's head and this route's content in it, and
   the bundle referenced as a file. When a visitor opens it the app boots and
   re-renders exactly as before -- render() clears #main and rebuilds it, so
   the pre-rendered copy is replaced rather than hydrated, and there is no
   hydration mismatch to go wrong.

   Needs the local server:  python3 tools/serve.py 8099
   Usage: node tools/prerender.cjs [--out dist] [--limit N] [--only /en/]
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const OUT = path.resolve(ROOT, argOf('--out', ROOT));
const LIMIT = parseInt(argOf('--limit', '0'), 10);
const ONLY = argOf('--only', null);

function sitemapUrls(){
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter(u => u.startsWith('/'));
}

/* The shell: index.html with three slots. Everything the build already put
   there stays exactly as it is, which is the point -- a pre-rendered page and
   the app's own page differ only in what the app would have written anyway. */
function shellParts(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const headEnd = html.indexOf('</head>');
  const mainOpen = html.indexOf('<main id="main"');
  if(headEnd < 0 || mainOpen < 0)
    throw new Error('index.html is not the expected shape (no </head> or <main id="main">)');
  const mainTagEnd = html.indexOf('>', mainOpen) + 1;
  const mainClose = html.indexOf('</main>', mainTagEnd);
  if(mainClose < 0) throw new Error('index.html has no </main>');
  return {
    head: html.slice(0, headEnd),             // up to </head>, exclusive
    betweenHeadAndMain: html.slice(headEnd, mainTagEnd),
    afterMain: html.slice(mainClose),
    htmlOpen: (html.match(/<html[^>]*>/) || ['<html lang="en" dir="ltr">'])[0]
  };
}

/* Head elements the app replaces per route. They are stripped from the build's
   head and re-emitted from what the app produced, so a stale default can never
   survive into a page that has a real value for it. */
const PER_ROUTE_HEAD = [
  'title',
  'meta[name="description"]',
  'meta[name="theme-color"]',
  'link[rel="canonical"]',
  'link[rel="alternate"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'script[type="application/ld+json"]'
];

const EXTRACT = () => {
  const d = document;

  /* A pre-rendered file is one document served to every device, so anything
     the app decided from the viewport must not be frozen into it. The hero
     background is exactly that: heroSrc() picks beach-800.webp under 700px and
     beach.webp above it, and this render happens at desktop width. Saved as an
     inline style, every phone was served the desktop image -- on top of the
     correct one the viewport-aware preload in <head> had already started, so
     it fetched both and the larger one became the LCP element at 5.7s.

     It is dropped here rather than corrected, because no single value is right
     for every viewport. The preload still fetches the right variant early and
     the app still applies it on boot, by which time it is in cache. Nothing is
     lost for a crawler either way: a CSS background is decoration, and the
     hero's text, heading and links are in the markup regardless. */
  d.querySelectorAll('.hero__slide').forEach(el => { el.style.backgroundImage = ''; });
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const out = [];
  out.push('<title>' + esc(d.title || '') + '</title>');
  const push = sel => d.querySelectorAll(sel).forEach(el => out.push(el.outerHTML));
  ['meta[name="description"]', 'meta[name="theme-color"]', 'link[rel="canonical"]',
   'link[rel="alternate"]', 'meta[property^="og:"]', 'meta[name^="twitter:"]',
   'script[type="application/ld+json"]'].forEach(push);
  const main = d.getElementById('main');
  return {
    head: out.join('\n  '),
    main: main ? main.innerHTML : '',
    lang: d.documentElement.getAttribute('lang') || 'en',
    dir: d.documentElement.getAttribute('dir') || 'ltr',
    title: d.title || '',
    textLen: main ? (main.innerText || '').replace(/\s+/g, ' ').trim().length : 0,
    links: main ? main.querySelectorAll('a[href^="/"]').length : 0,
    jsonld: d.querySelectorAll('script[type="application/ld+json"]').length
  };
};

/* Strip the head elements this route will supply itself. Done on the text of
   the built head, once, rather than per page. */
function stripPerRouteHead(head){
  let h = head;
  h = h.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  h = h.replace(/<meta\s+name="description"[^>]*>\s*/gi, '');
  h = h.replace(/<meta\s+name="theme-color"[^>]*>\s*/gi, '');
  h = h.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
  h = h.replace(/<link\s+rel="alternate"[^>]*>\s*/gi, '');
  h = h.replace(/<meta\s+property="og:[^"]*"[^>]*>\s*/gi, '');
  h = h.replace(/<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi, '');
  h = h.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  return h;
}

(async () => {
  let urls = sitemapUrls();
  if(ONLY) urls = urls.filter(u => u.startsWith(ONLY));
  if(LIMIT) urls = urls.slice(0, LIMIT);
  if(!urls.length) throw new Error('no URLs selected');

  const parts = shellParts();
  let headBase = stripPerRouteHead(parts.head);

  /* The stylesheet goes back inline, in every generated page.

     It is a separate file in index.html because that page is the application
     shell and a visitor loads it once. A pre-rendered page is the opposite:
     it is a landing page, loaded cold from a search result, and an external
     stylesheet costs a second round trip before anything can paint. Measured
     on the home page over Slow 4G with a 4x CPU slowdown:

       external app.css   FCP 1200ms   LCP 4132ms
       inlined            FCP  636ms   LCP  636ms

     The LCP difference is the larger half. With the stylesheet external the
     page paints unstyled-then-styled, and the app's own render when the
     bundle lands counts as a second, later LCP candidate; with it inline the
     first paint is already final and nothing supersedes it.

     The cost is about 81 KB per file before compression, which is why this is
     done here and not in the build: these files are generated on the deploy
     runner, not carried in the repository. */
  const cssPath = path.join(ROOT, 'app.css');
  if(fs.existsSync(cssPath)){
    const css = fs.readFileSync(cssPath, 'utf8');
    const before = headBase;
    headBase = headBase.replace(/<link rel="stylesheet" href="\/app\.css[^"]*"\s*\/?>/,
      () => '<style>' + css + '</style>');
    if(headBase === before)
      throw new Error('prerender: no /app.css stylesheet link found to inline');
  }
  console.log(`prerendering ${urls.length} URLs → ${OUT}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));

  // One load. Everything after this is an in-page route change.
  await page.goto(BASE + urls[0], { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => {
    const m = document.getElementById('main');
    return m && m.children.length > 0;
  }, null, { timeout: 30000 });

  const stats = { written: 0, bytes: 0, thin: [], noJsonld: [], failed: [] };
  const seenTitles = new Map();
  const t0 = Date.now();

  for(let i = 0; i < urls.length; i++){
    const url = urls[i];
    let data;
    try{
      await page.evaluate(u => {
        history.pushState({}, '', u);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, url);
      // The app renders synchronously inside the popstate handler; this waits
      // for the route it was asked for rather than a fixed delay.
      await page.waitForFunction(u => location.pathname === u &&
        document.getElementById('main') && document.getElementById('main').children.length > 0,
        url, { timeout: 15000 });
      data = await page.evaluate(EXTRACT);
    }catch(e){
      stats.failed.push({ url, why: String(e.message).slice(0, 90) });
      continue;
    }

    /* headBase is index.html up to </head>, so it opens with its own doctype
       and <html lang="en" dir="ltr">. Both are replaced here, because the
       language and direction belong to this route, not to the shell. Stripping
       only the <html> left a second doctype inside every file -- browsers
       ignore it, validators do not. */
    const doc = '<!DOCTYPE html>\n'
      + `<html lang="${data.lang}" dir="${data.dir}" data-lang="${data.lang}">`
      + headBase.replace(/^\s*<!DOCTYPE[^>]*>\s*/i, '').replace(/<html[^>]*>/, '')
      + '\n  ' + data.head + '\n'
      + parts.betweenHeadAndMain
      + data.main
      + parts.afterMain;

    const rel = url.replace(/^\//, '').replace(/\/$/, '');
    const file = path.join(OUT, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, doc);
    stats.written++; stats.bytes += Buffer.byteLength(doc);

    if(data.textLen < 400) stats.thin.push({ url, len: data.textLen });
    if(!data.jsonld) stats.noJsonld.push(url);
    if(!seenTitles.has(data.title)) seenTitles.set(data.title, []);
    seenTitles.get(data.title).push(url);

    if((i + 1) % 200 === 0 || i === urls.length - 1)
      process.stdout.write(`  ${i + 1}/${urls.length}  (${Math.round((Date.now()-t0)/1000)}s)\n`);
  }

  await browser.close();

  const dupes = [...seenTitles.entries()].filter(([, u]) => u.length > 1);
  console.log(`\nwrote ${stats.written} files, ${Math.round(stats.bytes/1024/1024)} MB`
            + `, avg ${Math.round(stats.bytes/stats.written/1024)} KB`);
  console.log(`distinct titles: ${seenTitles.size}/${stats.written}`
            + (dupes.length ? `  (${dupes.length} shared by more than one URL)` : ''));
  if(stats.thin.length) console.log(`thin pages (<400 chars): ${stats.thin.length}`
            + '  e.g. ' + stats.thin.slice(0,3).map(t => t.url + ' ' + t.len).join(', '));
  if(stats.noJsonld.length) console.log(`no JSON-LD: ${stats.noJsonld.length}  e.g. ${stats.noJsonld.slice(0,3).join(', ')}`);
  if(stats.failed.length){
    console.log(`FAILED: ${stats.failed.length}`);
    stats.failed.slice(0, 5).forEach(f => console.log('   ' + f.url + ' — ' + f.why));
  }
  if(errors.length) console.log(`page errors during the run: ${errors.length}  e.g. ${errors[0]}`);
  process.exit(stats.failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
