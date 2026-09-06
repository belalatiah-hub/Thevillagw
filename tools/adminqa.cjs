/* Browser QA for the dashboard.
 *
 * tools/admintest.cjs runs the dashboard's logic in a DOM shim, which is the
 * right place to test what the code decides — a role read from cms.admins
 * rather than the token, a 401 that refreshes exactly once, a price import
 * that previews before it writes. It is the wrong place to test what the
 * browser does with the result: the shim has no layout, so a table that
 * overflows the phone, a drawer that opens off-screen, or a right-to-left
 * page that silently stays left-to-right all look identical to a passing test.
 *
 * The owner asked for two things this covers and the shim cannot:
 * mobile-first, and RTL tested for real rather than in principle.
 *
 * Signed out, the dashboard talks to nobody — the gate renders from the
 * bundle alone — so this needs no credentials and reaches no network.
 *
 *   python3 tools/serve.py &        # must be running on :8099
 *   node tools/adminqa.cjs
 */
const { chromium } = require('./pw.cjs');

const URL = 'http://127.0.0.1:8099/admin/';
const results = [];
const ck = (name, ok, extra) => results.push({ name, ok, extra });

const PHONE  = { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1280, height: 800 } };

async function open(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  return { ctx, page, errors };
}

// Horizontal overflow is the defect that a shim can never see and a phone
// always shows. Measured against the documentElement, because a single wide
// table is enough to push the whole page sideways.
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, over: d.scrollWidth - d.clientWidth };
  });
}

async function setLang(page, lang) {
  await page.evaluate(l => {
    // The toggle is whichever control carries the other language's name; find
    // it the way a user would rather than by an internal id.
    const want = l === 'ar' ? 'العربية' : 'English';
    const el = [...document.querySelectorAll('button, a')]
      .find(n => (n.textContent || '').trim().includes(want));
    if (el) el.click();
  }, lang);
  await page.waitForTimeout(120);
}

(async () => {
  const browser = await chromium.launch();
  try {
    /* ---------------------------------------------------- the gate itself */
    {
      const { ctx, page, errors } = await open(browser, LAPTOP);
      const hasPassword = await page.locator('input[type="password"]').count();
      ck('signed out: a password field is on the page', hasPassword >= 1, 'count=' + hasPassword);

      // Nothing behind the gate may be in the document before a session
      // exists. A hidden-but-present admin surface is a real leak: the data
      // would have had to be fetched to render it.
      const leaked = await page.evaluate(() => document.body.innerText);
      const words = ['Developers', 'Projects', 'Units', 'Audit', 'المطوّرون', 'المشاريع'];
      const found = words.filter(w => leaked.includes(w));
      ck('signed out: no content screen is rendered behind the gate',
         found.length === 0, found.join(', ') || 'none');

      ck('signed out: no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
      await ctx.close();
    }

    /* -------------------------------------------------------- phone width */
    {
      const { ctx, page, errors } = await open(browser, PHONE);
      const o = await overflow(page);
      ck('phone: the page does not scroll sideways', o.over <= 1, JSON.stringify(o));

      // A tap target under 40px is the commonest mobile-first miss, and the
      // sign-in button is the only one that matters on this screen.
      const btn = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find(x => x.offsetParent !== null);
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });
      ck('phone: the primary button is a real tap target',
         !!btn && btn.h >= 40, JSON.stringify(btn));
      ck('phone: no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
      await ctx.close();
    }

    /* ------------------------------------------------------- RTL, for real */
    {
      const { ctx, page, errors } = await open(browser, PHONE);
      await setLang(page, 'ar');

      const dir = await page.evaluate(() => ({
        dir: document.documentElement.getAttribute('dir'),
        lang: document.documentElement.getAttribute('lang'),
        computed: getComputedStyle(document.body).direction,
      }));
      ck('rtl: the document flips to Arabic', dir.dir === 'rtl' && dir.lang === 'ar', JSON.stringify(dir));
      // The attribute is not the point — the computed direction is what lays
      // the page out, and a stylesheet can override the attribute.
      ck('rtl: the computed direction is rtl', dir.computed === 'rtl', dir.computed);

      const o = await overflow(page);
      ck('rtl phone: the page does not scroll sideways', o.over <= 1, JSON.stringify(o));

      // In RTL the page must sit against the right edge. A layout that only
      // set `dir` and kept a left-anchored container leaves a gap here.
      const anchored = await page.evaluate(() => {
        const r = document.body.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), win: window.innerWidth };
      });
      ck('rtl phone: the layout fills the viewport',
         Math.abs(anchored.right - anchored.win) <= 2 && anchored.left <= 2,
         JSON.stringify(anchored));

      const arabic = await page.evaluate(() => /[؀-ۿ]/.test(document.body.innerText));
      ck('rtl: the interface is actually in Arabic', arabic);

      ck('rtl: no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
      await ctx.close();
    }

    /* ------------------------------------- back to English, and it stays put */
    {
      const { ctx, page } = await open(browser, LAPTOP);
      await setLang(page, 'ar');
      await setLang(page, 'en');
      const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
      ck('the language toggle goes both ways', dir === 'ltr', String(dir));

      // The choice has to survive a reload, or an Arabic-speaking admin sets
      // it again on every visit.
      await page.reload({ waitUntil: 'networkidle' });
      await setLang(page, 'ar');
      await page.reload({ waitUntil: 'networkidle' });
      const after = await page.evaluate(() => document.documentElement.getAttribute('dir'));
      ck('the language choice survives a reload', after === 'rtl', String(after));
      await ctx.close();
    }

    /* --------------------------------------- the dashboard is not indexable */
    {
      const { ctx, page } = await open(browser, LAPTOP);
      const robots = await page.evaluate(() => {
        const m = document.querySelector('meta[name="robots"]');
        return m ? m.getAttribute('content') : null;
      });
      ck('the dashboard tells crawlers to stay out', !!robots && robots.includes('noindex'), String(robots));
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\n===== DASHBOARD (browser) =====');
  let bad = 0;
  for (const r of results) {
    if (!r.ok) bad++;
    console.log('%s %s%s', r.ok ? 'PASS' : 'FAIL', r.name, r.extra ? '  [' + r.extra + ']' : '');
  }
  console.log('TOTAL %d passed, %d failed', results.length - bad, bad);
  process.exit(bad ? 1 : 0);
})();
