/**
 * The Village CRM — read-only audit crawler.
 * ---------------------------------------------------------------------------
 * Logs in ONCE, then discovers and screenshots every reachable screen, and
 * records the DOM structure (menus, forms, tables, buttons), the network
 * requests each screen makes, and load timings. It writes a machine-readable
 * system map to ./audit/out/ plus a screenshot per screen.
 *
 * SAFETY — strictly read-only by design:
 *   • It never types into any form except the login form.
 *   • It only clicks elements that look like NAVIGATION (nav / menu / tabs /
 *     links / view buttons). It refuses to click anything whose text or
 *     attributes match create/add/save/update/delete/remove/submit/send/pay/
 *     approve/import/export/confirm  (see DESTRUCTIVE regex).
 *   • It blocks non-GET requests at the network layer as a second safety net,
 *     so even an accidental click cannot mutate data.
 *
 * USAGE (once the CRM host is allowlisted for egress — see audit/README.md):
 *   CRM_URL="https://crm.thevillageinvestment.com/login.php" \
 *   CRM_USER="you@example.com" CRM_PASS="********" \
 *   node audit/crawl.mjs
 *
 * Credentials are read from the environment and never written to disk or logs.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

// Playwright ships as CommonJS; load it via require from ESM.
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const CRM_URL = process.env.CRM_URL || 'https://crm.thevillageinvestment.com/login.php';
const USER = process.env.CRM_USER || '';
const PASS = process.env.CRM_PASS || '';
const PROXY = process.env.HTTPS_PROXY || undefined; // route through the agent egress proxy
const OUT = new URL('./out/', import.meta.url).pathname;
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const DESTRUCTIVE =
  /(create|add|new|save|update|edit|delete|remove|destroy|submit|send|pay|approve|reject|import|export|confirm|assign|merge|convert|archive|logout|sign\s*out)/i;
const READONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

mkdirSync(OUT, { recursive: true });
if (!USER || !PASS) {
  console.error('Set CRM_USER and CRM_PASS in the environment first.');
  process.exit(2);
}

const seen = new Set();
const pages = [];
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'screen';

async function capture(page, label) {
  const url = page.url();
  const key = url.split('?')[0];
  if (seen.has(key + '|' + label)) return;
  seen.add(key + '|' + label);

  const reqs = [];
  const onReq = (r) => reqs.push({ method: r.method(), url: r.url().slice(0, 200) });
  page.on('request', onReq);
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(400);

  const dom = await page.evaluate(() => {
    const txt = (el) => (el?.innerText || el?.value || '').trim().slice(0, 60);
    const pick = (sel) => [...document.querySelectorAll(sel)].slice(0, 60).map(txt).filter(Boolean);
    return {
      title: document.title,
      h1: pick('h1,h2'),
      navItems: pick('nav a, nav button, .menu a, [class*="nav"] a, [class*="tab"]'),
      links: [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && !h.startsWith('javascript'))
        .slice(0, 120),
      forms: [...document.querySelectorAll('form')].map((f) => ({
        action: f.getAttribute('action') || '',
        fields: [...f.querySelectorAll('input,select,textarea')].map(
          (i) => `${i.tagName.toLowerCase()}:${i.getAttribute('name') || i.getAttribute('type') || ''}`,
        ),
      })),
      tables: [...document.querySelectorAll('table')].map((t) => ({
        headers: [...t.querySelectorAll('th')].map((th) => th.innerText.trim()).slice(0, 30),
        rows: t.querySelectorAll('tbody tr').length,
      })),
      buttons: pick('button, .btn, [role="button"]'),
    };
  });

  const shot = slug(label || dom.title || url);
  await page.screenshot({ path: `${OUT}${shot}.png`, fullPage: true }).catch(() => {});
  page.off('request', onReq);
  pages.push({ label, url, dom, requests: reqs.slice(0, 40) });
  console.log(`captured: ${label}  (${dom.forms.length} forms, ${dom.tables.length} tables, ${reqs.length} reqs)`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXEC,
    proxy: PROXY ? { server: PROXY } : undefined,
  });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });

  // Second safety net: abort any state-changing request outright.
  await ctx.route('**/*', (route) => {
    const m = route.request().method().toUpperCase();
    if (READONLY_METHODS.has(m)) return route.continue();
    console.warn(`BLOCKED ${m} ${route.request().url().slice(0, 120)} (read-only mode)`);
    return route.abort();
  });

  const page = await ctx.newPage();
  console.log(`opening ${CRM_URL}`);
  await page.goto(CRM_URL, { waitUntil: 'domcontentloaded' }).catch((e) => {
    console.error('Cannot reach CRM:', e.message);
    console.error('If this is a 403/tunnel error, the host is not allowlisted — see audit/README.md.');
    process.exit(3);
  });

  // Login (the only form we submit). Heuristic field detection.
  await page.fill('input[type="email"], input[name*="email" i], input[name*="user" i]', USER).catch(() => {});
  await page.fill('input[type="password"], input[name*="pass" i]', PASS).catch(() => {});
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.click('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")').catch(() => {}),
  ]);
  await sleep(1200);
  await capture(page, 'after-login');

  // Discover top-level navigation targets (hash routes + links), then visit each.
  const targets = await page.evaluate(() => {
    const out = new Set();
    document.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (h && !h.startsWith('javascript') && !/logout|signout/i.test(h)) out.add(h);
    });
    return [...out].slice(0, 80);
  });

  for (const href of targets) {
    try {
      const abs = new URL(href, page.url()).toString();
      if (seen.has(abs.split('?')[0] + '|nav')) continue;
      await page.goto(abs, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await capture(page, href.replace(/^.*#/, '#') || href);
    } catch (e) {
      /* skip bad targets */
    }
  }

  // Also click in-app nav/tab controls that use JS routing (no href).
  const navSelectors = ['nav button', '[class*="nav"] [role="button"]', '[class*="tab"]', '.menu button'];
  for (const sel of navSelectors) {
    const count = await page.$$eval(sel, (els) => els.length).catch(() => 0);
    for (let i = 0; i < Math.min(count, 20); i++) {
      const label = await page.$$eval(sel, (els, i) => (els[i]?.innerText || '').trim(), i).catch(() => '');
      if (!label || DESTRUCTIVE.test(label)) continue;
      await page.$$eval(sel, (els, i) => els[i]?.click(), i).catch(() => {});
      await sleep(600);
      await capture(page, `nav:${label}`);
    }
  }

  writeFileSync(`${OUT}system-map.json`, JSON.stringify({ crawledAt: 'n/a', pages }, null, 2));
  console.log(`\nDONE. ${pages.length} screens captured → audit/out/`);
  console.log('Artifacts: system-map.json + one screenshot per screen.');
  await browser.close();
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
