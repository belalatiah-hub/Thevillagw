// Audit the head the app writes, for every route it publishes.
//
// The site's SEO is not static markup: index.html ships one default head and
// setHead() rewrites the title, description, canonical, hreflang set, robots
// directive, Open Graph block and JSON-LD graph on every navigation. Nothing
// was checking that what it writes is correct — the site tests check the body.
//
// This boots the real bundle and walks all 1,126 URLs in both languages,
// capturing the head each one produces and asserting the things Google, Bing
// and a link-preview crawler actually read. It found two contradictions the
// first time it ran, which is why it exists rather than a one-off report.
//
//     node tools/seoaudit.cjs           # summary + failures
//     node tools/seoaudit.cjs --list    # every finding, including notes
//
// The DOM shim is a trimmed copy of the one in domtest.cjs. It drops that
// file's ALL[] node register, which exists there to let assertions sweep the
// whole tree: keeping it across 1,126 renders would retain every node the app
// ever built and cost about a gigabyte for nothing.
const fs = require('fs'), vm = require('vm'), path = require('path');

const ORIGIN = 'https://www.thevillageinvestment.com';

/* ----------------------------------------------------------------- DOM shim */
function mkEl(tag){
  const el = {
    tagName:(tag||'div').toLowerCase(), nodeType:1, childNodes:[], parentNode:null,
    attributes:{}, className:'', id:'', _style:{}, dataset:{}, _text:null,
    setAttribute(k,v){ if(k==='class'){this.className=String(v);} else if(k==='id'){this.id=String(v);} this.attributes[k]=String(v); },
    getAttribute(k){ return k==='class'?this.className:(k==='id'?this.id:(k in this.attributes?this.attributes[k]:null)); },
    hasAttribute(k){ return k==='class'?!!this.className:(k in this.attributes); },
    removeAttribute(k){ delete this.attributes[k]; if(k==='class') this.className=''; },
    appendChild(c){ if(c==null) return c; if(c.parentNode){ const oi=c.parentNode.childNodes.indexOf(c); if(oi>-1) c.parentNode.childNodes.splice(oi,1); } c.parentNode=this; this.childNodes.push(c); return c; },
    insertBefore(c,ref){ if(c==null) return c; if(c.parentNode){ const oi=c.parentNode.childNodes.indexOf(c); if(oi>-1) c.parentNode.childNodes.splice(oi,1); } c.parentNode=this; const ri=ref?this.childNodes.indexOf(ref):-1; if(ri>-1) this.childNodes.splice(ri,0,c); else this.childNodes.push(c); return c; },
    removeChild(c){ const i=this.childNodes.indexOf(c); if(i>-1) this.childNodes.splice(i,1); return c; },
    remove(){ if(this.parentNode) this.parentNode.removeChild(this); },
    get firstChild(){ return this.childNodes[0]||null; },
    get pathname(){ var hh=this.attributes.href||''; var m=/^https?:\/\/[^\/]+(\/[^?#]*)/.exec(hh); if(m) return m[1]; m=/^(\/[^?#]*)/.exec(hh); return m?m[1]:hh.replace(/[?#].*$/,''); },
    get children(){ return this.childNodes.filter(n=>n.nodeType===1); },
    get childElementCount(){ return this.children.length; },
    addEventListener(){}, removeEventListener(){}, focus(){}, blur(){}, scrollIntoView(){}, click(){},
    get style(){ return this._style; },
    get classList(){ const self=this; return {
      add(c){ const s=new Set(self.className.split(/\s+/).filter(Boolean)); s.add(c); self.className=[...s].join(' '); },
      remove(c){ const s=new Set(self.className.split(/\s+/).filter(Boolean)); s.delete(c); self.className=[...s].join(' '); },
      contains(c){ return self.className.split(/\s+/).indexOf(c)>-1; },
      toggle(c){ this.contains(c)?this.remove(c):this.add(c); } }; },
    get textContent(){ if(this._text!=null) return this._text; return this.childNodes.map(n=>n.textContent).join(''); },
    set textContent(v){ this.childNodes=[]; this._text=String(v); },
    closest(sel){ let n=this; while(n){ if(n.nodeType===1 && matchSel(n, sel)) return n; n=n.parentNode; } return null; },
    contains(node){ let n=node; while(n){ if(n===this) return true; n=n.parentNode; } return false; },
    querySelector(sel){ return (qsa(this,sel)[0])||null; },
    querySelectorAll(sel){ return qsa(this,sel); }
  };
  return el;
}
function matchSel(el, token){
  token=token.trim(); if(!token) return true;
  let m=token.match(/^([a-z0-9]+)?(\.[\w-]+)?(#[\w-]+)?/i);
  let tag=m[1], cls=m[2]?m[2].slice(1):null, id=m[3]?m[3].slice(1):null;
  if(tag && el.tagName!==tag.toLowerCase()) return false;
  if(cls && el.className.split(/\s+/).indexOf(cls)<0) return false;
  if(id && el.id!==id) return false;
  if(!tag && !cls && !id) return false;
  return true;
}
function qsa(root, sel){
  const parts=sel.split(',').map(s=>s.trim());
  const out=[]; const seen=new Set();
  (function walk(n){ for(const c of n.childNodes){ if(c.nodeType===1){
    for(const p of parts){ const toks=p.split(/\s+/); const last=toks[toks.length-1]; if(matchSel(c,last) && !seen.has(c)){ seen.add(c); out.push(c); } }
    walk(c);
  } } })(root);
  return out;
}
function textNode(s){ return { nodeType:3, textContent:String(s), parentNode:null }; }

const doc = {
  createElement:mkEl, createElementNS:(ns,t)=>mkEl(t), createTextNode:textNode,
  _stub:{}, _byId:{},
  getElementById(id){ const found=qsa(doc.documentElement,'#'+id)[0]||qsa(doc.body,'#'+id)[0]; if(found) return found; if(!doc._byId[id]){ const e=mkEl('div'); e.setAttribute('id',id); doc._byId[id]=e; } return doc._byId[id]; },
  querySelector(sel){ const f=qsa(doc.documentElement,sel)[0]||qsa(doc.body,sel)[0]; if(f) return f; if(!doc._stub[sel]) doc._stub[sel]=mkEl('div'); return doc._stub[sel]; },
  querySelectorAll(sel){ return qsa(doc.body,sel).concat(qsa(doc.documentElement,sel)); },
  _lis:{}, addEventListener(type,fn){ (this._lis[type]=this._lis[type]||[]).push(fn); }, removeEventListener(){}, title:'',
};
doc.documentElement = mkEl('html');
doc.documentElement.setAttribute('lang','en'); doc.documentElement.setAttribute('dir','ltr'); doc.documentElement.setAttribute('data-lang','en');
doc.body = mkEl('body'); doc.head = mkEl('head');

const win = {
  location:{ protocol:'https:', host:'www.thevillageinvestment.com', hostname:'www.thevillageinvestment.com', pathname:'/en/', search:'', hash:'' },
  history:{ pushState(){}, replaceState(){} },
  addEventListener(){}, removeEventListener(){},
  pageYOffset:0, scrollTo(){}, open(){ return {focus(){}}; },
  requestAnimationFrame(fn){ return setTimeout(fn,0); },
  matchMedia(){ return {matches:false, addEventListener(){}, addListener(){}}; }, print(){},
  localStorage:{ _d:{}, getItem(k){ return this._d[k]||null; }, setItem(k,v){ this._d[k]=v; }, removeItem(k){ delete this._d[k]; } },
  navigator:{ clipboard:{ writeText(){ return Promise.resolve(); } }, userAgent:'node' },
};

const sandbox = { document:doc, window:win, location:win.location, history:win.history,
  localStorage:win.localStorage, navigator:win.navigator,
  requestAnimationFrame:win.requestAnimationFrame, setTimeout:setTimeout, clearTimeout:clearTimeout,
  setInterval:setInterval, clearInterval:clearInterval,
  Intl:Intl, URLSearchParams:URLSearchParams, Set:Set, Math:Math, Date:Date, JSON:JSON,
  console:console, encodeURIComponent:encodeURIComponent };
sandbox.globalThis = sandbox; sandbox.self = sandbox;

let src = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
src = src.match(/<script>\s*"use strict"[\s\S]*?<\/script>/)[0]
         .replace(/^<script>/,'').replace(/<\/script>$/,'');
src += "\n;globalThis.__api={parse:parse,render:render,buildPath:buildPath," +
       "PROJECTS:PROJECTS,UNITS:UNITS,DEVELOPERS:DEVELOPERS,AREAS:AREAS," +
       "RESEARCH:RESEARCH,RELEASES:RELEASES,PROJECT_GROUPS:PROJECT_GROUPS};";
vm.createContext(sandbox);
vm.runInContext(src, sandbox, {timeout:15000});
const api = sandbox.__api;

/* --------------------------------------------------------------- findings */
const FAIL = [], NOTE = [];
function fail(rule, where, detail){ FAIL.push({rule, where, detail}); }
function note(rule, where, detail){ NOTE.push({rule, where, detail}); }

/* ------------------------------------------------------------ route walk */
// The published URL set comes from the app, via the same `--routes` call the
// sitemap is built from. Auditing that set rather than a list written here is
// what makes "the sitemap and the pages agree" a real check instead of two
// copies of one guess agreeing with each other.
function routePaths(){
  const out = require('child_process').execSync(
    'node ' + JSON.stringify(path.join(__dirname,'domtest.cjs')) + ' --routes',
    {cwd: path.join(__dirname,'..'), maxBuffer: 1<<28}).toString();
  return JSON.parse(out.trim().split('\n').pop());
}

// A unit's code is upper case on the client's sheet and lower case in its URL,
// so /en/units/SB-ST-01/ is a live alias of /en/units/sb-st-01/. An alias is
// only safe while it renders the right page and hands the crawler the real
// address; if it ever starts 404ing or claiming itself, links already in the
// wild break quietly.
function auditAliases(){
  for(const u of api.UNITS){
    const alias = '/en/units/' + u.id + '/';
    const canon = '/en/units/' + String(u.id).toLowerCase() + '/';
    if(alias === canon) continue;
    const r = api.parse(alias);
    if(r.name === '404'){ fail('an upper-case unit URL still resolves', alias, 'parses as 404'); continue; }
    api.render(r);
    const got = head().canonical;
    if(got !== ORIGIN + canon) fail('an upper-case unit URL points at the canonical', alias, 'got ' + got);
  }
}

function head(){
  const id = k => (doc._byId[k] ? doc._byId[k].attributes : {});
  const meta = doc._stub['meta[name="description"]'];
  return {
    title: doc.title || '',
    desc: meta ? (meta.attributes.content || '') : '',
    canonical: id('lnk-canonical').href || '',
    altEn: id('lnk-alt-en').href || '',
    altAr: id('lnk-alt-ar').href || '',
    altX:  id('lnk-alt-x').href || '',
    robots: id('meta-robots').content || '',
    ogTitle: id('og-title').content || '',
    ogDesc: id('og-desc').content || '',
    ogUrl: id('og-url').content || '',
    ogLocale: id('og-locale').content || '',
    ld: doc._byId['ld-page'] ? doc._byId['ld-page'].textContent : '',
  };
}

// A JSON-LD graph is only useful if a machine can read it. Anything that
// serialises to the string "undefined", to null, or to NaN is a value the app
// meant to emit and could not — the node stays valid JSON and silently lies.
function scanLD(node, at, seen){
  if(node === null) return ['null at ' + at];
  if(Array.isArray(node)) return node.flatMap((v,i) => scanLD(v, at+'['+i+']', seen));
  if(typeof node === 'object') return Object.keys(node).flatMap(k => scanLD(node[k], at+'.'+k, seen));
  if(typeof node === 'number' && !isFinite(node)) return ['non-finite number at ' + at];
  if(typeof node === 'string' && (node === 'undefined' || node === 'NaN' ||
     node.indexOf('undefined') > -1)) return ['"'+node+'" at ' + at];
  return [];
}

const seenTitle = new Map(), seenDesc = new Map();
const indexablePaths = new Set(), audited = [];
const PROGRESS = process.argv.includes('--progress');
let t0 = Date.now(), n = 0;

if(PROGRESS) process.stderr.write('deriving routes…\n');
const ROUTES = routePaths();
if(PROGRESS) process.stderr.write('got ' + ROUTES.length + ' routes in ' + (Date.now()-t0) + 'ms\n');

for(const enPath of ROUTES){
  if(PROGRESS && ++n % 50 === 0) process.stderr.write(n + ' ' + (Date.now()-t0) + 'ms\n');
  for(const p of [enPath, enPath.replace('/en/','/ar/')]){
    let r;
    try { r = api.parse(p); } catch(e){ fail('route parses', p, e.message); continue; }
    if(r.name === '404'){ fail('a published route is not a 404', p, 'parse() returned the 404 route'); continue; }
    try { api.render(r); } catch(e){ fail('route renders', p, e.message); continue; }
    const hd = head();
    audited.push({p, r, hd});

    /* --- title and description ------------------------------------- */
    if(!hd.title) fail('title is set', p, '(empty)');
    if(!hd.desc) fail('description is set', p, '(empty)');
    if(hd.desc && hd.desc.length < 50) note('description is long enough to be useful', p, hd.desc.length + ' chars');
    if(hd.title && hd.title.length > 70) note('title fits a result snippet', p, hd.title.length + ' chars');

    /* --- canonical must point at this page, not another one --------- */
    const want = ORIGIN + p;
    if(hd.canonical !== want) fail('canonical is self-referential', p, 'got ' + hd.canonical);
    if(hd.ogUrl !== hd.canonical) fail('og:url matches the canonical', p, 'got ' + hd.ogUrl);

    /* --- hreflang must be reciprocal or Google discards it ---------- */
    const en = ORIGIN + enPath, ar = ORIGIN + enPath.replace('/en/','/ar/');
    if(hd.altEn !== en) fail('hreflang=en points at the English twin', p, 'got ' + hd.altEn);
    if(hd.altAr !== ar) fail('hreflang=ar points at the Arabic twin', p, 'got ' + hd.altAr);
    if(hd.altX !== en) fail('hreflang=x-default points at English', p, 'got ' + hd.altX);

    /* --- locale must follow the language, not the last render ------- */
    const wantLocale = (r.lang === 'ar') ? 'ar_EG' : 'en_US';
    if(hd.ogLocale !== wantLocale) fail('og:locale follows the page language', p, 'got ' + hd.ogLocale);

    /* --- robots ----------------------------------------------------- */
    const indexable = hd.robots.indexOf('noindex') < 0;
    if(indexable) indexablePaths.add(p);

    /* --- duplicate titles and descriptions -------------------------- */
    // Two different URLs sharing a title is the classic thin-content signal.
    // Only indexable pages matter: a noindex page cannot compete with anything.
    if(indexable){
      if(seenTitle.has(hd.title)) fail('title is unique among indexable pages', p, 'same as ' + seenTitle.get(hd.title));
      else seenTitle.set(hd.title, p);
      if(seenDesc.has(hd.desc)) note('description is unique among indexable pages', p, 'same as ' + seenDesc.get(hd.desc));
      else seenDesc.set(hd.desc, p);
    }

    /* --- structured data -------------------------------------------- */
    if(hd.ld){
      let parsed;
      try { parsed = JSON.parse(hd.ld); }
      catch(e){ fail('JSON-LD parses', p, e.message); continue; }
      if(parsed['@context'] !== 'https://schema.org') fail('JSON-LD declares the schema.org context', p, String(parsed['@context']));
      if(!Array.isArray(parsed['@graph'])) fail('JSON-LD is a @graph', p, 'not an array');
      else {
        for(const n of parsed['@graph']) if(!n['@type']) fail('every JSON-LD node has an @type', p, JSON.stringify(n).slice(0,80));
        const bad = scanLD(parsed['@graph'], '@graph');
        if(bad.length) fail('JSON-LD carries no unresolved values', p, bad.slice(0,3).join('; '));
      }
    }
  }
}

auditAliases();

/* ------------------------------------------- sitemap agrees with robots */
// A sitemap is a request to index. Listing a URL that serves `noindex` asks a
// crawler to spend budget fetching a page it is then told to discard.
const sitemap = fs.readFileSync(path.join(__dirname,'..','sitemap.xml'),'utf8');
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].slice(ORIGIN.length)));
for(const p of listed){
  if(!indexablePaths.has(p)) fail('the sitemap lists only indexable URLs', p, 'this URL serves noindex');
}
for(const p of indexablePaths){
  if(!listed.has(p)) fail('every indexable URL is in the sitemap', p, 'missing from sitemap.xml');
}

/* --------------------------------------------- robots.txt and the shipped head */
const robots = fs.readFileSync(path.join(__dirname,'..','robots.txt'),'utf8');
if(robots.indexOf('Sitemap: ' + ORIGIN + '/sitemap.xml') < 0) fail('robots.txt points at the sitemap', 'robots.txt', 'no Sitemap: line');
if(robots.indexOf('Disallow: /admin/') < 0) fail('robots.txt keeps the dashboard out of results', 'robots.txt', 'no /admin/ rule');

// Deep links are served by the SPA fallback, so the head that reaches a crawler
// before any JavaScript runs is the one compiled into index.html. It has to be
// a legitimate page in its own right, because for a non-rendering crawler it is
// the only head there is.
const shipped = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const shippedHead = shipped.slice(0, shipped.indexOf('</head>'));
for(const [what, re] of [['a title', /<title>[^<]{10,}<\/title>/],
                         ['a description', /<meta name="description" content="[^"]{50,}"/],
                         ['a canonical', /<link rel="canonical" href="https:\/\//],
                         ['an og:image', /<meta property="og:image" content="https:\/\//],
                         ['a robots directive', /<meta name="robots" content="index,follow/]]){
  if(!re.test(shippedHead)) fail('the pre-JavaScript head carries ' + what, 'index.html', 'not found');
}

/* ------------------------------------------------------------------ report */
const list = process.argv.includes('--list');
console.log('audited %d URLs (%d indexable, %d noindex)',
            audited.length, indexablePaths.size, audited.length - indexablePaths.size);
const byRule = new Map();
for(const f of FAIL) byRule.set(f.rule, (byRule.get(f.rule)||0) + 1);
if(NOTE.length){
  const nb = new Map();
  for(const n of NOTE) nb.set(n.rule, (nb.get(n.rule)||0) + 1);
  console.log('\nnotes (not failures):');
  for(const [rule, n] of nb) console.log('  ' + rule.padEnd(54) + n);
  if(list) for(const n of NOTE) console.log('     [%s] %s — %s', n.rule, n.where, n.detail);
}
if(FAIL.length){
  console.log('\nFAILURES:');
  for(const [rule, n] of byRule) console.log('  ' + rule.padEnd(54) + n);
  const show = list ? FAIL : FAIL.slice(0, 12);
  console.log('');
  for(const f of show) console.log('  %s\n     %s — %s', f.rule, f.where, f.detail);
  if(!list && FAIL.length > show.length) console.log('  … %d more (--list for all)', FAIL.length - show.length);
  console.log('\nTOTAL %d failures across %d rules', FAIL.length, byRule.size);
  process.exit(1);
}
console.log('\nno SEO defects found');
// Booting the bundle starts the hero carousel's interval, so the event loop
// never drains on its own and the process would sit there having already done
// all of its work. domtest.cjs exits the same way, for the same reason.
process.exit(0);
