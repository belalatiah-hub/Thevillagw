/* Browser QA for the public site: does it fit a phone, in both directions.
 *
 * The 363 assertions in tools/domtest.cjs run in a DOM shim with no layout, so
 * the one defect a visitor notices first is the one they cannot see. A page
 * that scrolls sideways on a phone — a table too wide, an image without a
 * max-width, a nowrap heading — passes every unit test and looks broken on the
 * device most of this site's traffic arrives on.
 *
 * The owner asked for mobile-first, and for RTL to be tested for real rather
 * than in principle. This loads one page of every kind at 360px in English and
 * again in Arabic, and measures.
 *
 *   python3 tools/serve.py &        # must be running on :8099
 *   node tools/siteqa.cjs
 *   node tools/siteqa.cjs --all     # every route, not one of each kind
 */
const { chromium } = require('./pw.cjs');
const { execSync } = require('child_process');
const path = require('path');

const BASE = 'http://127.0.0.1:8099';
const PHONE = { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

// One of each kind of page. The finder, the compare table and a project
// detail are the three that have actually overflowed before, so they stay in
// the short list even when it is trimmed.
const SAMPLE = [
  '/en/', '/en/projects/', '/en/units/', '/en/new-launches/', '/en/areas/',
  '/en/developers/', '/en/insights/', '/en/about/', '/en/contact/',
  '/en/faqs/', '/en/investors/', '/en/compare/', '/en/privacy/', '/en/terms/',
];

function everyRoute() {
  const out = execSync('node ' + JSON.stringify(path.join(__dirname, 'domtest.cjs')) + ' --routes',
                       { cwd: path.join(__dirname, '..'), maxBuffer: 1 << 28 }).toString();
  return JSON.parse(out.trim().split('\n').pop());
}

const results = [];
const ck = (name, ok, extra) => results.push({ name, ok, extra });

(async () => {
  const all = process.argv.includes('--all');
  let paths = all ? everyRoute() : SAMPLE.slice();
  if (!all) {
    // Add one real detail page of each kind, discovered rather than named, so
    // this keeps working when the inventory changes.
    const routes = everyRoute();
    for (const prefix of ['/en/projects/', '/en/units/', '/en/developers/', '/en/areas/', '/en/insights/']) {
      const hit = routes.find(r => r.startsWith(prefix) && r.length > prefix.length + 1);
      if (hit) paths.push(hit);
    }
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext(PHONE);
  const page = await ctx.newPage();

  const seen = { over: [], errors: [], noH1: [] };
  let checked = 0;

  try {
    for (const en of paths) {
      for (const p of [en, en.replace('/en/', '/ar/')]) {
        const errors = [];
        const onErr = e => errors.push(String(e));
        page.on('pageerror', onErr);
        await page.goto(BASE + p, { waitUntil: 'networkidle' });
        // The app renders on the next frame after boot.
        await page.waitForTimeout(90);

        const m = await page.evaluate(() => {
          const d = document.documentElement;
          const over = d.scrollWidth - d.clientWidth;
          // When it does overflow, naming the widest element is the whole
          // difference between a red line and a fix.
          let worst = null;
          if (over > 1) {
            let max = 0;
            for (const el of document.querySelectorAll('body *')) {
              const r = el.getBoundingClientRect();
              const right = r.right + window.scrollX;
              if (right > max) {
                max = right;
                worst = (el.tagName.toLowerCase()
                  + (el.id ? '#' + el.id : '')
                  + (el.className && typeof el.className === 'string'
                     ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''))
                  + ' @' + Math.round(right);
              }
            }
          }
          return {
            over, worst,
            dir: d.getAttribute('dir'),
            h1: document.querySelectorAll('h1').length,
          };
        });
        page.off('pageerror', onErr);
        checked++;

        if (m.over > 1) seen.over.push(p + ' by ' + m.over + 'px — widest: ' + m.worst);
        if (errors.length) seen.errors.push(p + ' — ' + errors[0]);
        if (m.h1 !== 1) seen.noH1.push(p + ' — ' + m.h1 + ' h1');

        const wantDir = p.startsWith('/ar/') ? 'rtl' : 'ltr';
        if (m.dir !== wantDir) ck('direction is ' + wantDir + ' on ' + p, false, String(m.dir));
      }
    }
  } finally {
    await browser.close();
  }

  ck('no page scrolls sideways at 360px', seen.over.length === 0,
     seen.over.slice(0, 4).join(' | '));
  ck('no page throws in the browser', seen.errors.length === 0,
     seen.errors.slice(0, 3).join(' | '));
  ck('every page has exactly one h1', seen.noH1.length === 0,
     seen.noH1.slice(0, 4).join(' | '));

  console.log('\n===== SITE ON A PHONE (browser) =====');
  console.log('%d page loads across %d routes, English and Arabic\n', checked, paths.length);
  let bad = 0;
  for (const r of results) {
    if (!r.ok) bad++;
    console.log('%s %s%s', r.ok ? 'PASS' : 'FAIL', r.name, r.extra ? '\n     ' + r.extra : '');
  }
  console.log('\nTOTAL %d passed, %d failed', results.length - bad, bad);
  process.exit(bad ? 1 : 0);
})();
