/* ============================================================
   PRERENDER QA — read the files a crawler would read

   tools/prerender.cjs writes one HTML file per URL. This checks them as
   text, with no browser and no JavaScript, because that is exactly the
   position every engine that does not execute scripts is in — which is most
   of them, and all of the AI crawlers.

   The defect this guards against is specific and was the site's actual state:
   1,570 URLs each serving the same document, the same title and 1,163
   identical characters of text. A pre-render that silently stopped producing
   per-URL content would put that back without anything failing, so these
   checks are written to catch that case first.

   Usage: node tools/prerenderqa.cjs [--dir .] [--sample N]
   Exits non-zero on any failure, so a deploy can gate on it.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const DIR = path.resolve(ROOT, argOf('--dir', ROOT));
const SAMPLE = parseInt(argOf('--sample', '0'), 10);   // 0 = every URL

let pass = 0, fail = 0;
function ck(name, ok, note){
  const good = ok === true;
  if(good) pass++; else fail++;
  console.log((good ? 'PASS ' : 'FAIL ') + name
    + (note ? '  [' + note + ']' : '')
    + (good || ok === false ? '' : '  ' + ok));
}

const ORIGIN = 'https://www.thevillageinvestment.com';
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
let urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1].replace(/^https?:\/\/[^/]+/, ''));
if(SAMPLE && SAMPLE < urls.length){
  const step = Math.floor(urls.length / SAMPLE);
  urls = urls.filter((_, i) => i % step === 0).slice(0, SAMPLE);
}

const fileFor = u => path.join(DIR, u.replace(/^\//, '').replace(/\/$/, ''), 'index.html');

// ---- load ----
const pages = [];
const missing = [];
for(const u of urls){
  const f = fileFor(u);
  if(!fs.existsSync(f)){ missing.push(u); continue; }
  pages.push({ url: u, html: fs.readFileSync(f, 'utf8') });
}
if(missing.length === urls.length){
  console.log('No pre-rendered files found under ' + DIR);
  console.log('Run:  python3 tools/serve.py 8099 &  node tools/prerender.cjs --out .');
  process.exit(2);
}

const one = (re, h) => { const m = h.match(re); return m ? m[1] : null; };
const title = h => one(/<title>([\s\S]*?)<\/title>/i, h);
const desc  = h => one(/<meta\s+name="description"\s+content="([^"]*)"/i, h);
const canon = h => one(/<link\s+rel="canonical"\s+href="([^"]*)"/i, h);
const mainOf = h => { const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/i); return m ? m[1] : ''; };
const textOf = s => s.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                     .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

console.log(`checking ${pages.length} pre-rendered files in ${DIR}\n`);

ck('every URL in the sitemap has a file', missing.length === 0,
   missing.length ? missing.length + ' missing, e.g. ' + missing.slice(0, 3).join(', ') : String(pages.length));

// ---- the defect this exists to prevent ----
const byTitle = new Map();
pages.forEach(p => {
  const t = title(p.html) || '';
  if(!byTitle.has(t)) byTitle.set(t, []);
  byTitle.get(t).push(p.url);
});
const sharedTitles = [...byTitle.entries()].filter(([, u]) => u.length > 1);
ck('every URL has its own title', sharedTitles.length === 0,
   sharedTitles.length
     ? sharedTitles.slice(0, 2).map(([t, u]) => `"${t.slice(0, 40)}" on ${u.length} URLs`).join('; ')
     : byTitle.size + ' distinct');

const byDesc = new Map();
pages.forEach(p => {
  const d = desc(p.html) || '';
  if(!byDesc.has(d)) byDesc.set(d, []);
  byDesc.get(d).push(p.url);
});
const sharedDescs = [...byDesc.entries()].filter(([, u]) => u.length > 1);
ck('every URL has its own description', sharedDescs.length === 0,
   sharedDescs.length
     ? sharedDescs.slice(0, 2).map(([d, u]) => `"${d.slice(0, 32)}…" on ${u.length} URLs`).join('; ')
     : byDesc.size + ' distinct');

ck('no page is missing a description', pages.every(p => (desc(p.html) || '').trim().length > 20),
   String(pages.filter(p => (desc(p.html) || '').trim().length <= 20).length) + ' too short');

// ---- content actually in the HTML, not written later by a script ----
const texts = pages.map(p => ({ url: p.url, n: textOf(mainOf(p.html)).length }));
const thin = texts.filter(t => t.n < 300);
const median = texts.map(t => t.n).sort((a, b) => a - b)[Math.floor(texts.length / 2)];
ck('each page carries its own content without JavaScript',
   thin.length <= 2,                                    // /new-launches/ is genuinely near-empty today
   `median ${median} chars, ${thin.length} under 300` +
   (thin.length ? ': ' + thin.slice(0, 3).map(t => t.url + ' (' + t.n + ')').join(', ') : ''));

ck('content differs from page to page',
   new Set(texts.map(t => t.n)).size > pages.length / 4,
   new Set(texts.map(t => t.n)).size + ' distinct lengths across ' + pages.length + ' pages');

// ---- the head a crawler reads ----
const badCanon = pages.filter(p => canon(p.html) !== ORIGIN + p.url);
ck('canonical on every page points at that page', badCanon.length === 0,
   badCanon.length ? badCanon.length + ' wrong, e.g. ' + badCanon[0].url + ' -> ' + canon(badCanon[0].html) : String(pages.length));

const noAlt = pages.filter(p => (p.html.match(/rel="alternate"/g) || []).length < 2);
ck('every page offers its language alternates', noAlt.length === 0,
   noAlt.length ? noAlt.length + ' incomplete, e.g. ' + noAlt[0].url : 'en + ar + x-default');

const noOg = pages.filter(p => !/property="og:title"/.test(p.html) || !/property="og:url"/.test(p.html));
ck('every page carries Open Graph tags', noOg.length === 0,
   noOg.length ? noOg.length + ' incomplete, e.g. ' + noOg[0].url : String(pages.length));

// ---- structured data ----
const ldProblems = [];
const typeCount = new Map();
pages.forEach(p => {
  const blocks = [...p.html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if(!blocks.length){ ldProblems.push(p.url + ': none'); return; }
  blocks.forEach(b => {
    try{
      const j = JSON.parse(b[1]);
      const nodes = Array.isArray(j) ? j : (j['@graph'] || [j]);
      nodes.forEach(n => {
        const t = Array.isArray(n['@type']) ? n['@type'].join('+') : n['@type'];
        if(!t) ldProblems.push(p.url + ': a node with no @type');
        else typeCount.set(t, (typeCount.get(t) || 0) + 1);
      });
    }catch(e){ ldProblems.push(p.url + ': does not parse — ' + e.message.slice(0, 40)); }
  });
});
ck('structured data is present and parses on every page', ldProblems.length === 0,
   ldProblems.length ? ldProblems.slice(0, 2).join('; ')
     : [...typeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
         .map(([t, n]) => t + '×' + n).join(', '));

// ---- the document itself ----
const langWrong = pages.filter(p => {
  const want = p.url.startsWith('/ar/') ? 'ar' : 'en';
  const m = p.html.match(/<html[^>]*\blang="([^"]*)"/);
  return !m || m[1] !== want;
});
ck('the html element declares the right language', langWrong.length === 0,
   langWrong.length ? langWrong.length + ' wrong, e.g. ' + langWrong[0].url : 'en + ar');

const dirWrong = pages.filter(p => {
  const want = p.url.startsWith('/ar/') ? 'rtl' : 'ltr';
  const m = p.html.match(/<html[^>]*\bdir="([^"]*)"/);
  return !m || m[1] !== want;
});
ck('the html element declares the right direction', dirWrong.length === 0,
   dirWrong.length ? dirWrong.length + ' wrong, e.g. ' + dirWrong[0].url : 'ltr + rtl');

// The bundle must be a file. If it is inline again, every page carries 1.5 MB
// of script and the whole reason for this step is gone.
const inlineBundle = pages.filter(p => /<script>\s*"use strict"/.test(p.html));
ck('the bundle is referenced, not inlined into every page', inlineBundle.length === 0,
   inlineBundle.length ? inlineBundle.length + ' pages inline it' : 'all reference /app.js');

const noApp = pages.filter(p => !/<script src="\/app\.js/.test(p.html));
ck('every page loads the application', noApp.length === 0,
   noApp.length ? noApp.length + ' missing, e.g. ' + noApp[0].url : String(pages.length));

/* A value the app computed from the viewport must not be frozen into a file
   that is served to every viewport. The hero background was: pre-rendering at
   desktop width baked the desktop image into the page every phone received,
   which fetched it on top of the correct one and made it the LCP element. */
const frozen = pages.filter(p => /background-image:\s*url\(/i.test(mainOf(p.html)));
ck('no viewport-dependent value is frozen into the markup', frozen.length === 0,
   frozen.length ? frozen.length + ' pages carry an inline background-image, e.g. ' + frozen[0].url
                 : 'checked ' + pages.length);

// ---- size ----
const sizes = pages.map(p => Buffer.byteLength(p.html));
const total = sizes.reduce((a, b) => a + b, 0);
console.log(`\nsize: ${Math.round(total / 1024 / 1024)} MB total, `
  + `${Math.round(total / pages.length / 1024)} KB average, `
  + `${Math.round(Math.max(...sizes) / 1024)} KB largest`);
console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
