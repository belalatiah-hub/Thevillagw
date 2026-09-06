/* Browser QA for the developer rail.
 *
 * The rail is the one component whose whole behaviour lives in layout and
 * pointer state, so tools/domtest.cjs cannot see it: its DOM shim has no
 * scrollLeft, no requestAnimationFrame, and no hit-testing, and railInit()
 * bails out before doing anything. Every defect this component has had —
 * drift that never accumulated, a direction read from the wrong place, a
 * pointer capture that swallowed clicks, and hover-pause freezing the whole
 * strip — was invisible to the unit tests and obvious in a real browser.
 *
 *   python3 tools/serve.py &        # must be running on :8099
 *   node tools/railqa.cjs
 */
const { chromium } = require('./pw.cjs');

const URL = 'http://127.0.0.1:8099';
const results = [];
const ck = (name, ok, extra) => results.push({ name, ok, extra });

async function open(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem('tvi_intro', '1');
    sessionStorage.setItem('tvi_lead', 'done');
  });
  await page.goto(`${URL}/${opts.lang || 'en'}/`, { waitUntil: 'networkidle' });
  // Park the rail mid-viewport with instant scrolling so measurements are stable.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('.dev-rail').scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  return { ctx, page };
}

const drift = async (page, ms = 1500) => {
  const a = await page.evaluate(() => document.querySelector('.dev-rail').scrollLeft);
  await page.waitForTimeout(ms);
  const b = await page.evaluate(() => document.querySelector('.dev-rail').scrollLeft);
  return Math.round(Math.abs(b - a));
};

// Each pointer case gets a fresh page: the rail is moving, so a coordinate
// measured once and reused after a wait no longer points where it did.
async function pointerCase(browser, viewport, where) {
  const { ctx, page } = await open(browser, { viewport });
  const pt = where === 'away' ? { x: 5, y: 5 } : await page.evaluate((mode) => {
    const c = document.querySelector('.dev-rail__track .dev-circle').getBoundingClientRect();
    const r = document.querySelector('.dev-rail').getBoundingClientRect();
    return mode === 'logo'
      ? { x: Math.round(c.left + c.width / 2), y: Math.round(c.top + c.height / 2) }
      : { x: Math.round(r.left + r.width / 2), y: Math.round(r.bottom - 2) };
  }, where);
  await page.mouse.move(pt.x, pt.y);
  await page.waitForTimeout(150);
  const d = await drift(page);
  await ctx.close();
  return d;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const laptop = { width: 1440, height: 900 };
  const phone = { width: 390, height: 844 };

  for (const [label, viewport] of [['laptop', laptop], ['phone', phone]]) {
    ck(`${label}: drifts when the pointer is elsewhere`,
      await pointerCase(browser, viewport, 'away') > 0);
    // The regression that prompted this file: the rail spans the full content
    // width, so a laptop cursor comes to rest inside it after almost any
    // scroll. Pausing on the whole band left it frozen and looked broken.
    ck(`${label}: keeps drifting with the pointer resting in the strip`,
      await pointerCase(browser, viewport, 'gap') > 0);
    ck(`${label}: stops while the pointer is on a logo`,
      await pointerCase(browser, viewport, 'logo') === 0);
  }

  // RTL drifts the other way, but it must still move.
  {
    const { ctx, page } = await open(browser, { viewport: laptop, lang: 'ar' });
    await page.mouse.move(5, 5);
    ck('rtl: the Arabic rail drifts too', await drift(page) > 0);
    await ctx.close();
  }

  // A click on a logo must still navigate — a previous fix captured the pointer
  // on pointerdown, which retargeted the click and killed every link.
  {
    const { ctx, page } = await open(browser, { viewport: laptop });
    const box = await page.evaluate(() => {
      const c = document.querySelector('.dev-rail__track .dev-circle').getBoundingClientRect();
      return { x: Math.round(c.left + c.width / 2), y: Math.round(c.top + c.height / 2) };
    });
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(400);
    const path = await page.evaluate(() => location.pathname);
    ck('click: a logo still opens its developer page', /\/developers?\//.test(path), path);
    await ctx.close();
  }

  // Reduced motion must stop the drift and drop the duplicate track, while
  // leaving a normal, scrollable, visibly-scrollbarred rail behind.
  {
    const { ctx, page } = await open(browser, { viewport: laptop, reducedMotion: 'reduce' });
    await page.mouse.move(5, 5);
    const d = await drift(page);
    const st = await page.evaluate(() => {
      const r = document.querySelector('.dev-rail');
      return {
        scrollable: r.scrollWidth > r.clientWidth,
        tracks: [...document.querySelectorAll('.dev-rail__track')]
          .filter(t => getComputedStyle(t).display !== 'none').length,
      };
    });
    ck('reduced-motion: no auto-drift', d === 0);
    ck('reduced-motion: single track, still scrollable', st.tracks === 1 && st.scrollable,
      JSON.stringify(st));
    await ctx.close();
  }

  await browser.close();

  let pass = 0, fail = 0;
  console.log('\n===== DEVELOPER RAIL (browser) =====');
  for (const r of results) {
    console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.extra ? `  [${r.extra}]` : ''));
    r.ok ? pass++ : fail++;
  }
  console.log(`TOTAL ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
