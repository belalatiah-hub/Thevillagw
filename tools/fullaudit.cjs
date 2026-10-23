/* ============================================================
   FULL SITE AUDIT — what a browser actually sees

   Opens real pages in a real Chromium, at desktop and phone width, in both
   languages, and records what is wrong rather than what ought to be right.
   Everything here is measured on the page: no rule fires from reading the
   source, because the question the owner asked is what breaks in a browser.

   It writes JSON to the path given in --out, which the report generator
   reads. Nothing here edits the site.

   Needs the local server:  python3 tools/serve.py 8099
   Usage: node tools/fullaudit.cjs [--out file.json] [--sample N] [--all]
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const OUT = argOf('--out', path.join(ROOT, 'audit.json'));
const SAMPLE = parseInt(argOf('--sample', '6'), 10);   // detail pages per shape per language
const ALL = argv.includes('--all');

/* ---------- which pages to open ---------------------------------------
   Every route shape has to be represented, because a defect in the unit
   template is 1,266 pages wide while the same defect on /about/ is one. */
function urlsFromSitemap(){
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1].replace(/^https?:\/\/[^/]+/, ''));
}
function shapeOf(u){
  const p = u.replace(/^\/(en|ar)\//, '/L/');
  return p.replace(/^\/L\/([a-z-]+)\/[^/]+\/$/, '/L/$1/*/');
}
function pickPages(){
  const all = urlsFromSitemap();
  if(ALL) return all;
  const byKey = new Map();
  for(const u of all){
    const lang = u.startsWith('/ar/') ? 'ar' : 'en';
    const key = shapeOf(u) + '|' + lang;
    if(!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(u);
  }
  const out = [];
  for(const [key, list] of byKey){
    const detail = key.includes('/*/');
    // Spread the sample across the list instead of taking the first N, which
    // would only ever see one developer's projects.
    const n = detail ? Math.min(SAMPLE, list.length) : list.length;
    const step = Math.max(1, Math.floor(list.length / n));
    for(let i = 0, c = 0; i < list.length && c < n; i += step, c++) out.push(list[i]);
  }
  return out;
}

/* ---------- the in-page collector -------------------------------------
   One evaluate() so the page is measured in one consistent layout pass. */
const COLLECT = () => {
  const out = { meta:{}, images:[], headings:[], contrast:[], taps:[], links:[],
                forms:[], landmarks:{}, jsonld:[], text:{}, overflow:[], misc:{} };
  const doc = document, de = doc.documentElement;
  /* Anything inside an aria-hidden subtree is not exposed to assistive
     technology, so accessibility rules do not apply to it — a honeypot field
     and a decorative icon both live there legitimately. */
  const hidden = el => !!el.closest('[aria-hidden="true"]');

  // ---- meta ----
  const m = n => { const e = doc.querySelector(`meta[name="${n}"]`); return e ? e.content : null; };
  const p = n => { const e = doc.querySelector(`meta[property="${n}"]`); return e ? e.content : null; };
  out.meta = {
    title: (doc.title || '').trim(),
    description: m('description'),
    robots: m('robots'),
    canonical: (doc.querySelector('link[rel=canonical]') || {}).href || null,
    ogTitle: p('og:title'), ogImage: p('og:image'), ogType: p('og:type'),
    lang: de.getAttribute('lang'), dir: de.getAttribute('dir') || 'ltr',
    viewport: m('viewport'),
    themeColor: m('theme-color'),
    hreflang: [...doc.querySelectorAll('link[rel=alternate][hreflang]')]
                .map(l => ({ h: l.getAttribute('hreflang'), href: l.href }))
  };

  // ---- structured data ----
  [...doc.querySelectorAll('script[type="application/ld+json"]')].forEach(s => {
    try{
      const j = JSON.parse(s.textContent);
      (Array.isArray(j) ? j : [j]).forEach(node => {
        const graph = node['@graph'] ? node['@graph'] : [node];
        graph.forEach(g => out.jsonld.push({ type: g['@type'] || null, keys: Object.keys(g) }));
      });
    }catch(e){ out.jsonld.push({ type:null, parseError: String(e.message).slice(0,80) }); }
  });

  // ---- landmarks & structure ----
  out.landmarks = {
    main: doc.querySelectorAll('main').length,
    nav: doc.querySelectorAll('nav').length,
    header: doc.querySelectorAll('header').length,
    footer: doc.querySelectorAll('footer').length,
    h1: doc.querySelectorAll('h1').length,
    skipLink: !!doc.querySelector('a[href^="#"][class*=skip], .skip-link')
  };

  // ---- headings in document order ----
  [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].forEach(h => {
    const t = (h.innerText || '').trim();
    out.headings.push({ level: +h.tagName[1], text: t.slice(0, 70), empty: !t });
  });

  // ---- images ----
  const vh = innerHeight;
  [...doc.querySelectorAll('img')].forEach(img => {
    const r = img.getBoundingClientRect();
    if(r.width === 0 && r.height === 0 && img.loading !== 'lazy') { /* still record */ }
    out.images.push({
      src: (img.currentSrc || img.src || '').split('/').slice(-1)[0].slice(0, 60),
      alt: img.getAttribute('alt'),
      hasAlt: img.hasAttribute('alt'),
      decorative: img.getAttribute('alt') === '' || img.getAttribute('role') === 'presentation',
      w: img.getAttribute('width'), h: img.getAttribute('height'),
      natW: img.naturalWidth, natH: img.naturalHeight,
      dispW: Math.round(r.width), dispH: Math.round(r.height),
      loading: img.getAttribute('loading'),
      broken: img.complete && img.naturalWidth === 0,
      aboveFold: r.top < vh && r.bottom > 0,
      fetchpriority: img.getAttribute('fetchpriority')
    });
  });

  // ---- contrast ----
  // Parses the computed colour, walks up for an opaque background, and
  // reports pairs below the WCAG AA threshold for their size.
  function rgb(s){
    const m = String(s).match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const v = m[1].split(',').map(parseFloat);
    return { r:v[0], g:v[1], b:v[2], a: v.length > 3 ? v[3] : 1 };
  }
  function lum(c){
    const f = x => { x /= 255; return x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b);
  }
  /* The effective background behind an element.

     Two things make the naive version lie, and both produced false findings
     the first time this ran. A background of rgba(7,61,82,.82) is a dark
     chip, but skipping it for not being fully opaque walks past it to the
     white page and reports bone-on-white. And text over a photograph has no
     background colour at all in CSS — the hero headline looked like bone on
     bone when it sits on a dark image.

     So: composite translucent layers in order, and give up honestly when a
     background image is in the stack rather than inventing a value. */
  function over(fg, bg){            // fg painted on bg, both 0-255, fg.a in 0-1
    const a = fg.a;
    return { r: fg.r*a + bg.r*(1-a), g: fg.g*a + bg.g*(1-a),
             b: fg.b*a + bg.b*(1-a), a: 1 };
  }
  function bgOf(el){
    const layers = [];
    let n = el;
    while(n){
      const cs = getComputedStyle(n);
      if(cs.backgroundImage && cs.backgroundImage !== 'none') return null;   // cannot be read from CSS
      const c = rgb(cs.backgroundColor);
      if(c && c.a > 0.004){
        if(c.a >= 0.999){ layers.push(c); break; }
        layers.push(c);
      }
      if(n === doc.documentElement) break;
      n = n.parentElement;
    }
    let base = { r:255, g:255, b:255, a:1 };
    const last = layers[layers.length - 1];
    if(!last || last.a < 0.999) layers.push(base);
    // Composite from the bottom of the stack upwards.
    let acc = layers[layers.length - 1];
    for(let i = layers.length - 2; i >= 0; i--) acc = over(layers[i], acc);
    return { r: Math.round(acc.r), g: Math.round(acc.g), b: Math.round(acc.b), a: 1 };
  }
  const seenC = new Set();
  [...doc.querySelectorAll('p,span,a,li,td,th,label,button,h1,h2,h3,h4,h5,h6,div,em,small,b,strong')]
    .forEach(el => {
      if(hidden(el)) return;
      if(el.children.length && ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
      const t = (el.innerText || '').trim(); if(!t) return;
      const r = el.getBoundingClientRect(); if(r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if(cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') return;
      const fg = rgb(cs.color); if(!fg || fg.a < 0.5) return;
      const bg = bgOf(el);
      // Over a photograph or a gradient the ratio cannot be read from CSS.
      // Counted, not guessed, so the number is visible without being a finding.
      if(!bg){ out.text.overImage = (out.text.overImage || 0) + 1; return; }
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if(ratio < need){
        const key = cs.color + '|' + `rgb(${bg.r},${bg.g},${bg.b})` + '|' + Math.round(size);
        if(seenC.has(key)) return; seenC.add(key);
        out.contrast.push({ ratio:+ratio.toFixed(2), need, fg:cs.color,
          bg:`rgb(${bg.r}, ${bg.g}, ${bg.b})`, size:Math.round(size), bold,
          sample: t.slice(0, 50), sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') });
      }
    });

  // ---- tap targets & small text ----
  const seenT = new Set();
  [...doc.querySelectorAll('a,button,input,select,textarea,[role=button],[tabindex]')]
    .forEach(el => {
      if(hidden(el)) return;
      const r = el.getBoundingClientRect();
      if(r.width === 0 || r.height === 0) return;
      const cs = getComputedStyle(el);
      if(cs.visibility === 'hidden' || cs.display === 'none') return;
      if(r.width < 24 || r.height < 24){
        const sel = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
        if(seenT.has(sel)) return; seenT.add(sel);
        out.taps.push({ sel, w: Math.round(r.width), h: Math.round(r.height),
          label: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30) });
      }
    });

  /* ---- links ----
     innerText is layout-aware and returns '' for anything not rendered, so a
     closed drawer's links would every one of them look nameless. The name is
     taken from textContent, and a link inside an aria-hidden subtree is not
     exposed to assistive technology at all, so it is not judged here. */
  const seenL = new Set();
  [...doc.querySelectorAll('a')].forEach(a => {
    if(hidden(a)) return;
    const img = a.querySelector('img');
    const name = ((a.textContent || '') + ' ' + (a.getAttribute('aria-label') || '') +
                  ' ' + (a.getAttribute('title') || '') +
                  ' ' + (img ? (img.alt || '') : '') +
                  ' ' + [...a.querySelectorAll('svg title, use')].map(s => s.textContent || '').join(' ')
                 ).replace(/\s+/g, ' ').trim();
    const href = a.getAttribute('href') || '';
    const rec = {};
    if(!name) rec.noName = true;
    if(/^(click here|here|read more|more|link|اضغط هنا|هنا|المزيد)$/i.test(name)) rec.vague = name;
    if(a.target === '_blank' && !/noopener/.test(a.rel || '')) rec.unsafeBlank = true;
    if(href === '#' || href === '') rec.deadHref = true;
    if(Object.keys(rec).length){
      const k = JSON.stringify(rec) + href.slice(0, 40);
      if(seenL.has(k)) return; seenL.add(k);
      out.links.push(Object.assign({ href: href.slice(0, 60), name: name.slice(0, 40) }, rec));
    }
  });

  /* ---- forms ----
     A honeypot sits inside aria-hidden="true" on purpose: no screen reader
     reaches it, so an absent label is not a defect. Judging it as one buries
     the real finding under a false one on every page of the site. */
  [...doc.querySelectorAll('input,select,textarea')].forEach(el => {
    if(el.type === 'hidden' || hidden(el)) return;
    const id = el.id;
    const labelled = (id && doc.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
                     el.closest('label') || el.getAttribute('aria-label') ||
                     el.getAttribute('aria-labelledby') || el.getAttribute('title');
    if(!labelled) out.forms.push({ tag: el.tagName.toLowerCase(), type: el.type || '',
      name: el.name || '', placeholder: el.getAttribute('placeholder') || '' });
  });

  // ---- small text on phones ----
  const sizes = {};
  [...doc.querySelectorAll('p,li,td,span,a,div')].forEach(el => {
    const t = (el.innerText || '').trim(); if(!t || t.length < 12) return;
    if(el.children.length) return;
    const s = Math.round(parseFloat(getComputedStyle(el).fontSize));
    if(s && s < 12) sizes[s] = (sizes[s] || 0) + 1;
  });
  out.text.small = sizes;

  // ---- horizontal overflow: which element actually sticks out ----
  const dw = de.clientWidth;
  if(de.scrollWidth > dw + 1){
    [...doc.querySelectorAll('body *')].forEach(el => {
      const r = el.getBoundingClientRect();
      if(r.width === 0) return;
      if(r.right > dw + 1 || r.left < -1){
        const sel = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
        if(!out.overflow.some(o => o.sel === sel))
          out.overflow.push({ sel, right: Math.round(r.right), left: Math.round(r.left), docW: dw });
      }
    });
    out.overflow = out.overflow.slice(0, 6);
  }

  out.misc = {
    scrollW: de.scrollWidth, clientW: de.clientWidth,
    domNodes: doc.getElementsByTagName('*').length,
    inlineStyleCount: doc.querySelectorAll('[style]').length,
    textLength: (doc.body.innerText || '').replace(/\s+/g, ' ').trim().length,
    hasNoscript: !!doc.querySelector('noscript')
  };
  return out;
};

/* ---------- web vitals in the page ---------- */
const VITALS_INIT = () => {
  window.__v = { lcp: 0, cls: 0, shifts: [], longTasks: 0, longTaskTime: 0 };
  try{
    new PerformanceObserver(l => { for(const e of l.getEntries()) window.__v.lcp = e.startTime; })
      .observe({ type:'largest-contentful-paint', buffered:true });
  }catch(e){}
  try{
    new PerformanceObserver(l => {
      for(const e of l.getEntries()){
        if(e.hadRecentInput) continue;
        window.__v.cls += e.value;
        if(e.value > 0.01 && e.sources && e.sources.length)
          window.__v.shifts.push({ v:+e.value.toFixed(4),
            node: (e.sources[0].node && e.sources[0].node.tagName ? e.sources[0].node.tagName.toLowerCase() +
                   (typeof e.sources[0].node.className === 'string' && e.sources[0].node.className ? '.' + e.sources[0].node.className.trim().split(/\s+/)[0] : '') : '?') });
      }
    }).observe({ type:'layout-shift', buffered:true });
  }catch(e){}
  try{
    new PerformanceObserver(l => { for(const e of l.getEntries()){
      window.__v.longTasks++; window.__v.longTaskTime += e.duration; } })
      .observe({ type:'longtask', buffered:true });
  }catch(e){}
};

/* ---------- driver ---------- */
(async () => {
  const pages = pickPages();
  const started = Date.now();
  console.log(`auditing ${pages.length} pages × 2 viewports…`);

  const browser = await chromium.launch();
  const results = [];
  const VIEWS = [
    { name:'desktop', viewport:{ width:1280, height:900 }, isMobile:false },
    { name:'phone',   viewport:{ width:390, height:844 }, isMobile:true,
      deviceScaleFactor:3, hasTouch:true }
  ];

  for(const v of VIEWS){
    const ctx = await browser.newContext({
      viewport: v.viewport, isMobile: v.isMobile, hasTouch: !!v.hasTouch,
      deviceScaleFactor: v.deviceScaleFactor || 1,
      userAgent: v.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined
    });
    await ctx.addInitScript(VITALS_INIT);

    for(let i = 0; i < pages.length; i++){
      const url = pages[i];
      const page = await ctx.newPage();
      const errors = [], failed = [], consoleErr = [];
      page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
      page.on('console', m => { if(m.type() === 'error') consoleErr.push(m.text().slice(0, 200)); });
      page.on('requestfailed', r => failed.push({ url: r.url().slice(0, 120),
        why: (r.failure() || {}).errorText || '' }));
      page.on('response', r => { if(r.status() >= 400) failed.push({ url: r.url().slice(0, 120), why: 'HTTP ' + r.status() }); });

      let rec = { url, view: v.name, ok: false };
      try{
        const resp = await page.goto(BASE + url, { waitUntil:'load', timeout: 30000 });
        rec.status = resp ? resp.status() : 0;
        await page.waitForTimeout(700);                 // let late shifts land
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(400);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        const data = await page.evaluate(COLLECT);
        const vitals = await page.evaluate(() => window.__v);
        const timing = await page.evaluate(() => {
          const n = performance.getEntriesByType('navigation')[0] || {};
          const paint = performance.getEntriesByType('paint');
          const fcp = (paint.find(p => p.name === 'first-contentful-paint') || {}).startTime || 0;
          const res = performance.getEntriesByType('resource');
          const by = {};
          res.forEach(r => { const t = r.initiatorType || 'other';
            by[t] = by[t] || { n:0, bytes:0 };
            by[t].n++; by[t].bytes += (r.transferSize || 0); });
          return { fcp, domContentLoaded: n.domContentLoadedEventEnd || 0,
                   loadEvent: n.loadEventEnd || 0, transfer: n.transferSize || 0,
                   decoded: n.decodedBodySize || 0, resources: by,
                   resourceCount: res.length };
        });
        Object.assign(rec, { ok:true, ...data, vitals, timing, errors,
                             consoleErr, failed: dedupe(failed) });
      }catch(e){
        rec.loadError = String(e.message).slice(0, 200);
        rec.errors = errors; rec.failed = dedupe(failed);
      }
      results.push(rec);
      await page.close();
      if((i + 1) % 15 === 0 || i === pages.length - 1)
        process.stdout.write(`  ${v.name}: ${i + 1}/${pages.length}\n`);
    }
    await ctx.close();
  }
  await browser.close();

  // ---- site-wide files ----
  const files = {};
  for(const f of ['robots.txt', 'sitemap.xml', 'llms.txt', '_headers', 'CNAME',
                  'manifest.webmanifest', 'site.webmanifest', 'favicon.ico']){
    const fp = path.join(ROOT, f);
    files[f] = fs.existsSync(fp) ? fs.statSync(fp).size : null;
  }
  files['index.html'] = fs.statSync(path.join(ROOT, 'index.html')).size;

  const payload = { generated: new Date().toISOString(), base: BASE,
    pageCount: pages.length, sitemapCount: urlsFromSitemap().length,
    elapsedSec: Math.round((Date.now() - started) / 1000), files, results };
  fs.writeFileSync(OUT, JSON.stringify(payload));
  console.log(`\nwrote ${OUT}  (${results.length} page loads, ${payload.elapsedSec}s)`);
})().catch(e => { console.error(e); process.exit(1); });

function dedupe(list){
  const seen = new Set(), out = [];
  for(const f of list){ const k = f.url + f.why; if(seen.has(k)) continue; seen.add(k); out.push(f); }
  return out.slice(0, 25);
}
