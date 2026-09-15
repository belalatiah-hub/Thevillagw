/* Look at a set of project pages, both languages and a phone. */
const { chromium } = require('./pw.cjs');
const OUT = process.argv[2] || '/tmp';
const SLUGS = (process.argv[3] || 'the-estates-zayed,the-estates-residence,june-north-coast,villette,ogami-north-coast').split(',');
(async () => {
  const b = await chromium.launch();
  for (const [tag, lang, w, h] of [['en','en',1280,2400], ['ar','ar',1280,2400], ['m','en',390,2000]]) {
    for (const s of SLUGS) {
      const p = await b.newPage({viewport: {width: w, height: h}});
      const errs = [];
      p.on('pageerror', e => errs.push(String(e)));
      // the brand splash covers the first paint of a fresh session
      await p.addInitScript(() => { try { sessionStorage.setItem('tvi_intro', '1'); } catch (e) {} });
      await p.goto(`http://127.0.0.1:8099/${lang}/projects/${s}/`, {waitUntil: 'networkidle'});
      await p.waitForTimeout(700);
      await p.screenshot({path: `${OUT}/sq-${tag}-${s}.png`});
      const over = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      const broken = await p.evaluate(() =>
        [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')));
      console.log(tag, s, over ? 'SIDEWAYS' : 'ok', broken.length ? 'BROKEN ' + broken : '', errs.length ? errs : '');
      await p.close();
    }
  }
  await b.close();
})();
