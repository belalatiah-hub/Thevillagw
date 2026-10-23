/* ============================================================
   PERFORMANCE AUDIT — the numbers Google actually ranks on

   Core Web Vitals are collected from real visitors, most of them on phones
   on mobile networks. A measurement taken on an unthrottled desktop over
   localhost tells you nothing about that, so this throttles CPU and network
   to the profile Lighthouse uses for its mobile score, runs every page
   several times, and reports the median.

   It also separates the two costs that a single-file site confuses: the
   bytes on the wire, and the time the main thread spends parsing and
   executing them before anything can paint.

   Needs the local server:  python3 tools/serve.py 8099
   Usage: node tools/perfaudit.cjs [--runs 5] [--out perf.json]
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const RUNS = parseInt(argOf('--runs', '5'), 10);
const OUT = argOf('--out', path.join(ROOT, 'perf.json'));

// Lighthouse's mobile defaults: Slow 4G, 4x CPU slowdown.
const NET_4G = { offline:false, downloadThroughput: 1.6 * 1024 * 1024 / 8,
                 uploadThroughput: 750 * 1024 / 8, latency: 150 };

const PAGES = [
  ['/en/',                              'Home (EN)'],
  ['/ar/',                              'Home (AR)'],
  ['/en/projects/',                     'Projects index'],
  ['/en/units/',                        'Units index'],
  ['/en/projects/beach-plaza-premium/', 'Project detail'],
  ['/en/developers/',                   'Developers index'],
  ['/en/areas/newcairo/',               'Area detail'],
  ['/en/faqs/',                         'FAQs']
];

const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

async function measure(ctx, url, throttle){
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__p = { lcp: 0, cls: 0, longTaskTime: 0, longTasks: 0 };
    try{ new PerformanceObserver(l => { for(const e of l.getEntries()) window.__p.lcp = e.startTime; })
      .observe({ type:'largest-contentful-paint', buffered:true }); }catch(e){}
    try{ new PerformanceObserver(l => { for(const e of l.getEntries())
      if(!e.hadRecentInput) window.__p.cls += e.value; })
      .observe({ type:'layout-shift', buffered:true }); }catch(e){}
    try{ new PerformanceObserver(l => { for(const e of l.getEntries()){
      window.__p.longTasks++; window.__p.longTaskTime += e.duration; } })
      .observe({ type:'longtask', buffered:true }); }catch(e){}
  });

  const cdp = await ctx.newCDPSession(page);
  if(throttle){
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', NET_4G);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }

  await page.goto(BASE + url, { waitUntil:'load', timeout: 90000 });
  await page.waitForTimeout(2500);          // let LCP and late shifts settle

  const m = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const fcp = (paint.find(p => p.name === 'first-contentful-paint') || {}).startTime || 0;
    const fp = (paint.find(p => p.name === 'first-paint') || {}).startTime || 0;
    return {
      ttfb: n.responseStart || 0,
      respEnd: n.responseEnd || 0,
      fp, fcp,
      domInteractive: n.domInteractive || 0,
      dcl: n.domContentLoadedEventEnd || 0,
      load: n.loadEventEnd || 0,
      transfer: n.transferSize || 0,
      decoded: n.decodedBodySize || 0,
      lcp: window.__p.lcp, cls: window.__p.cls,
      longTasks: window.__p.longTasks, longTaskTime: Math.round(window.__p.longTaskTime)
    };
  });
  await page.close();
  return m;
}

(async () => {
  const browser = await chromium.launch();
  const out = { generated: new Date().toISOString(), runs: RUNS, profiles: {} };

  for(const [profile, opts, throttle] of [
    ['mobile-slow4g', { viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true,
       deviceScaleFactor:3,
       userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }, true],
    ['desktop-fast',  { viewport:{ width:1280, height:900 } }, false]
  ]){
    console.log(`\n=== ${profile} ===`);
    out.profiles[profile] = {};
    for(const [url, label] of PAGES){
      const runs = [];
      for(let i = 0; i < RUNS; i++){
        // A fresh context each run, so nothing is served from a warm cache.
        const ctx = await browser.newContext(opts);
        try{ runs.push(await measure(ctx, url, throttle)); }
        catch(e){ console.log(`  ${label}: run ${i+1} failed — ${e.message.slice(0,60)}`); }
        await ctx.close();
      }
      if(!runs.length) continue;
      const pick = k => Math.round(median(runs.map(r => r[k])));
      const rec = { label, url,
        ttfb: pick('ttfb'), respEnd: pick('respEnd'), fcp: pick('fcp'), lcp: pick('lcp'),
        domInteractive: pick('domInteractive'), dcl: pick('dcl'), load: pick('load'),
        longTaskTime: pick('longTaskTime'), longTasks: pick('longTasks'),
        cls: +median(runs.map(r => r.cls)).toFixed(4),
        transferKB: Math.round(median(runs.map(r => r.transfer)) / 1024),
        decodedKB: Math.round(median(runs.map(r => r.decoded)) / 1024),
        n: runs.length };
      // The gap between the document arriving and the first pixel is the
      // main thread parsing and running what it just received.
      rec.blockedMs = Math.max(0, rec.fcp - rec.respEnd);
      out.profiles[profile][url] = rec;
      console.log(`  ${label.padEnd(20)} TTFB ${String(rec.ttfb).padStart(5)}  FCP ${String(rec.fcp).padStart(5)}  LCP ${String(rec.lcp).padStart(5)}  blocked ${String(rec.blockedMs).padStart(5)}ms  CLS ${rec.cls}`);
    }
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`\nwrote ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
