/* ============================================================
   VILLAGE CHAT — browser QA

   The engine and the markup are guarded in domtest; this drives the real
   thing in a real browser, in both writing directions and at phone width,
   because "it reads correctly in RTL" is not something a DOM assertion can
   tell you. It opens the panel, asks a question of each kind, and checks
   that nothing overflows, nothing overlaps and the controls sit on the
   correct edge.

   Needs the local server:  python3 tools/serve.py 8099
   ============================================================ */
const { chromium } = require('playwright');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
let pass = 0, fail = 0;
function ck(name, ok, note){
  const good = ok === true;
  if(good) pass++; else fail++;
  console.log((good ? 'PASS ' : 'FAIL ') + name + (note ? '  [' + note + ']' : '')
              + (good || ok === false ? '' : '  ' + ok));
}

// Ask a question through the real input and wait for the answer bubble.
async function ask(page, text){
  const before = await page.locator('.chat-body .msg.bot, .chat-body .chat-welcome').count();
  await page.fill('.chat-input input', text);
  await page.click('.chat-input button[type=submit]');
  await page.waitForFunction(
    n => document.querySelectorAll('.chat-body .msg.bot, .chat-body .chat-welcome').length > n,
    before, { timeout: 4000 });
  await page.waitForTimeout(60);
  return page.locator('.chat-body .msg.bot').last();
}

(async () => {
  const browser = await chromium.launch();

  for(const [lang, dir, sizeName, size] of [
    ['en', 'ltr', 'desktop', { width: 1280, height: 900 }],
    ['ar', 'rtl', 'desktop', { width: 1280, height: 900 }],
    ['ar', 'rtl', 'phone',   { width: 360,  height: 740 }],
    ['en', 'ltr', 'phone',   { width: 360,  height: 740 }]
  ]){
    const tag = `${lang}/${sizeName}`;
    const page = await browser.newPage({ viewport: size });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${BASE}/${lang}/`, { waitUntil: 'networkidle' });

    // The panel is built on first open, from the floating button.
    await page.click('.chat-fab');
    await page.waitForSelector('.chat-panel.open', { timeout: 4000 });

    const panel = page.locator('.chat-panel');
    ck(`${tag}: the panel opens and is announced as a dialog`,
       (await panel.getAttribute('role')) === 'dialog'
       && (await panel.getAttribute('aria-hidden')) === 'false');

    ck(`${tag}: the page direction is ${dir}`,
       (await page.evaluate(() => document.documentElement.getAttribute('dir') || 'ltr')) === dir);

    ck(`${tag}: it is called Village Chat`,
       (await page.locator('.chat-head h3').innerText()).trim() === 'Village Chat');

    // Welcome screen, then six prompts
    ck(`${tag}: the welcome card shows before any question`,
       await page.locator('.chat-welcome').isVisible());
    const chips = await page.locator('.chat-chips button').allInnerTexts();
    const suggested = chips.filter(c => c.trim());
    ck(`${tag}: six suggested prompts are offered`, suggested.length >= 6,
       `${suggested.length} chips`);

    // Nothing may overflow the panel horizontally, in either direction.
    const overflow = await page.evaluate(() => {
      const p = document.querySelector('.chat-panel');
      const pr = p.getBoundingClientRect();
      const out = [];
      p.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if(r.width === 0) return;
        if(r.left < pr.left - 1 || r.right > pr.right + 1)
          out.push((el.className || el.tagName) + '');
      });
      return out.slice(0, 4);
    });
    ck(`${tag}: nothing spills out of the panel sideways`, overflow.length === 0,
       overflow.join(', '));

    // The close and clear controls sit on the trailing edge in both directions.
    const edges = await page.evaluate(() => {
      const head = document.querySelector('.chat-head').getBoundingClientRect();
      const x = document.querySelector('.chat-head .x').getBoundingClientRect();
      const c = document.querySelector('.chat-head__clear').getBoundingClientRect();
      const id = document.querySelector('.chat-head__id').getBoundingClientRect();
      return { rtl: getComputedStyle(document.documentElement).direction === 'rtl',
               headL: head.left, headR: head.right, xL: x.left, xR: x.right,
               cL: c.left, cR: c.right, idL: id.left, idR: id.right };
    });
    const trailingOk = edges.rtl
      ? (edges.xR < edges.idL + 1 && edges.cR < edges.idL + 1)     // RTL: controls to the left of the title
      : (edges.xL > edges.idR - 1 && edges.cL > edges.idR - 1);    // LTR: to the right of it
    ck(`${tag}: the close and clear buttons sit on the trailing edge`, trailingOk,
       `title ${Math.round(edges.idL)}–${Math.round(edges.idR)}, clear ${Math.round(edges.cL)}, close ${Math.round(edges.xL)}`);
    ck(`${tag}: the head controls do not overlap the title`,
       edges.rtl ? edges.cR <= edges.idL + 1 : edges.cL >= edges.idR - 1);

    /* ---- A payment question renders a real schedule ---- */
    const q = lang === 'ar' ? 'خطة السداد في بيتش بلازا بريميوم' : 'payment plan for Beach Plaza Premium';
    const a1 = await ask(page, q);
    const schedText = (await a1.innerText()).trim();
    ck(`${tag}: a payment question answers with a schedule`,
       (await a1.locator('.vc-sched').count()) > 0, schedText.split('\n')[0].slice(0, 46));
    // Each row is label + value, and the value must not sit on top of the label.
    const rows = await a1.locator('.vc-sched__r').count();
    ck(`${tag}: the schedule prints its rows`, rows >= 3, `${rows} rows`);
    const rowOk = await a1.evaluate(el => {
      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      return Array.from(el.querySelectorAll('.vc-sched__r')).every(r => {
        const k = r.querySelector('span').getBoundingClientRect();
        const v = r.querySelector('b').getBoundingClientRect();
        // label leads, value trails, and they never cross
        return rtl ? (v.right <= k.left + 1) : (v.left >= k.right - 1);
      });
    });
    ck(`${tag}: label and figure sit on opposite edges of each row`, rowOk === true);
    /* A money figure, in either numeral system. Arabic pages render
       Arabic-Indic digits with U+066C as the thousands separator, which is a
       different character from the Arabic comma. */
    ck(`${tag}: the schedule carries real money figures`,
       /[\d٠-٩][\d٠-٩,.٫٬]{4,}/.test(schedText),
       schedText.replace(/\n/g, ' · ').slice(0, 70));

    /* ---- Copy / retry / feedback ---- */
    const tools = a1.locator('.chat-tools');
    ck(`${tag}: the answer offers its controls`, (await tools.count()) > 0
       && (await tools.locator('button').count()) >= 4,
       `${await tools.locator('button').count()} buttons`);
    await tools.locator('button').nth(0).click();            // copy
    await page.waitForTimeout(120);
    const copyLabel = (await tools.locator('button').nth(0).innerText()).trim();
    ck(`${tag}: copy confirms itself on the button`, copyLabel.length > 0,
       copyLabel);
    // Feedback is acknowledged and cannot be voted twice.
    const thumbs = tools.locator('.chat-tools__b--ic');
    await thumbs.nth(0).click();
    await page.waitForTimeout(80);
    ck(`${tag}: feedback is acknowledged and closes itself`,
       (await tools.locator('.chat-tools__ok').count()) === 1
       && (await thumbs.nth(0).isDisabled()) && (await thumbs.nth(1).isDisabled()));

    /* ---- A comparison ---- */
    const q2 = lang === 'ar' ? 'قارن بيتش بلازا بريميوم و بيتش بلازا لاكشري'
                             : 'compare Beach Plaza Premium and Beach Plaza Luxury';
    const a2 = await ask(page, q2);
    ck(`${tag}: a comparison renders side by side`,
       (await a2.locator('.vc-cmp__r').count()) >= 4,
       `${await a2.locator('.vc-cmp__r').count()} rows`);
    const cmpOk = await a2.evaluate(el => {
      const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      return Array.from(el.querySelectorAll('.vc-cmp__r')).every(r => {
        const cells = Array.from(r.children).map(c => c.getBoundingClientRect());
        for(let i = 1; i < cells.length; i++){
          if(rtl && cells[i].right > cells[i-1].left + 1) return false;
          if(!rtl && cells[i].left < cells[i-1].right - 1) return false;
        }
        return true;
      });
    });
    ck(`${tag}: comparison columns run in reading order`, cmpOk === true);

    /* ---- A question the site cannot answer ---- */
    const q3 = lang === 'ar' ? 'هل عندكم ايجار في لندن' : 'do you rent flats in London';
    const a3 = await ask(page, q3);
    const t3 = await a3.innerText();
    ck(`${tag}: an unanswerable question hands off instead of guessing`,
       (await a3.locator('a.btn').count()) > 0 && !/\d[\d,]{5,}/.test(t3),
       t3.split('\n')[0].slice(0, 46));

    /* ---- Typing indicator exists while a turn is in flight ---- */
    await page.fill('.chat-input input', q);
    await page.click('.chat-input button[type=submit]');
    const sawTyping = await page.locator('.chat-typing').count() > 0;
    await page.waitForTimeout(500);
    ck(`${tag}: a turn shows a typing indicator and then clears it`,
       sawTyping && (await page.locator('.chat-typing').count()) === 0,
       sawTyping ? 'shown then removed' : 'never shown');

    /* ---- Clear ---- */
    await page.click('.chat-head__clear');
    await page.waitForTimeout(150);
    ck(`${tag}: clearing empties the transcript and restores the welcome`,
       (await page.locator('.chat-body .msg.user').count()) === 0
       && (await page.locator('.chat-welcome').isVisible()));

    /* ---- Keyboard: Escape closes, focus returns to the button ---- */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    ck(`${tag}: Escape closes the panel and returns focus to the button`,
       !(await page.locator('.chat-panel.open').count())
       && (await page.evaluate(() => document.activeElement &&
            document.activeElement.classList.contains('chat-fab'))));

    ck(`${tag}: nothing threw in the browser`, errors.length === 0, errors.slice(0, 2).join(' | '));

    // One screenshot per configuration, for the record.
    await page.click('.chat-fab');
    await page.waitForSelector('.chat-panel.open');
    await ask(page, q);
    await page.locator('.chat-panel').screenshot({
      path: `/tmp/vchat-${lang}-${sizeName}.png` });

    await page.close();
  }

  await browser.close();
  console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
