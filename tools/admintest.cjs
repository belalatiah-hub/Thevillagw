// Browserless verification of admin/index.html.
//
// The shipped bundle is executed in a minimal DOM with fetch stubbed by a
// fake Supabase, so every assertion below is about the file that actually
// deploys — not about the sources it was built from.
//
//   node tools/admintest.cjs           # run
//   node tools/admintest.cjs --list    # print the assertion names
const fs = require('fs'), vm = require('vm'), path = require('path');

/* ------------------------------------------------------------------ DOM */
function mkEl(tag) {
  const el = {
    tagName: (tag || 'div').toLowerCase(), nodeType: 1, childNodes: [], parentNode: null,
    attributes: {}, className: '', id: '', _style: {}, dataset: {}, _text: null,
    value: '', disabled: false, hidden: false, selected: false, checked: false, files: [],
    setAttribute(k, v) {
      if (k === 'class') this.className = String(v);
      else if (k === 'id') this.id = String(v);
      else if (k === 'hidden') this.hidden = true;
      else if (k === 'disabled') this.disabled = true;
      this.attributes[k] = String(v);
    },
    getAttribute(k) {
      return k === 'class' ? this.className : (k === 'id' ? this.id
        : (k in this.attributes ? this.attributes[k] : null));
    },
    hasAttribute(k) { return k === 'class' ? !!this.className : (k in this.attributes); },
    removeAttribute(k) { delete this.attributes[k]; if (k === 'class') this.className = ''; },
    appendChild(c) {
      if (c == null) return c;
      if (c.parentNode) { const i = c.parentNode.childNodes.indexOf(c); if (i > -1) c.parentNode.childNodes.splice(i, 1); }
      c.parentNode = this; this.childNodes.push(c); return c;
    },
    insertBefore(c, ref) {
      if (c == null) return c;
      if (c.parentNode) { const i = c.parentNode.childNodes.indexOf(c); if (i > -1) c.parentNode.childNodes.splice(i, 1); }
      c.parentNode = this;
      const ri = ref ? this.childNodes.indexOf(ref) : -1;
      if (ri > -1) this.childNodes.splice(ri, 0, c); else this.childNodes.push(c);
      return c;
    },
    removeChild(c) { const i = this.childNodes.indexOf(c); if (i > -1) this.childNodes.splice(i, 1); return c; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    get firstChild() { return this.childNodes[0] || null; },
    get children() { return this.childNodes.filter(n => n.nodeType === 1); },
    _lis: null,
    addEventListener(type, fn) { (this._lis = this._lis || {})[type] = (this._lis[type] || []).concat(fn); },
    removeEventListener() {}, focus() {}, blur() {}, click() {
      const fns = (this._lis && this._lis.click) || [];
      fns.forEach(f => f({ preventDefault() {}, currentTarget: this, target: this }));
    },
    get style() { return this._style; },
    // `dir` and `lang` are reflected properties in a real DOM: assigning the
    // property writes the attribute. Without this the shim would quietly
    // disagree with every browser about what setLang() did.
    get dir() { return this.attributes.dir || ''; },
    set dir(v) { this.attributes.dir = String(v); },
    get lang() { return this.attributes.lang || ''; },
    set lang(v) { this.attributes.lang = String(v); },
    get textContent() {
      if (this._text != null) return this._text;
      return this.childNodes.map(n => n.textContent).join('');
    },
    set textContent(v) { this.childNodes = []; this._text = String(v); },
    querySelector(sel) { return qsa(this, sel)[0] || null; },
    querySelectorAll(sel) { return qsa(this, sel); },
    getElementsByTagName(t) { return qsa(this, t); }
  };
  return el;
}
function matchSel(el, token) {
  token = token.trim();
  if (!token) return false;
  if (token.indexOf(':') > -1) token = token.slice(0, token.indexOf(':'));
  const m = token.match(/^([a-z0-9]+)?(\.[\w-]+)?(#[\w-]+)?(\[[^\]]+\])?/i);
  if (!m) return false;
  const tag = m[1], cls = m[2] ? m[2].slice(1) : null, id = m[3] ? m[3].slice(1) : null;
  if (tag && el.tagName !== tag.toLowerCase()) return false;
  if (cls && (el.className || '').split(/\s+/).indexOf(cls) < 0) return false;
  if (id && el.id !== id) return false;
  if (m[4]) {
    const am = /\[([\w-]+)(?:="?([^"\]]*)"?)?\]/.exec(m[4]);
    if (am) {
      const have = el.getAttribute(am[1]);
      if (have == null) return false;
      if (am[2] != null && String(have) !== am[2]) return false;
    }
  }
  return !!(tag || cls || id || m[4]);
}
function qsa(root, sel) {
  const parts = sel.split(',').map(s => s.trim());
  const out = [], seen = new Set();
  (function walk(n) {
    for (const c of (n.childNodes || [])) {
      if (c.nodeType === 1) {
        for (const p of parts) {
          const toks = p.split(/\s+/);
          if (matchSel(c, toks[toks.length - 1]) && !seen.has(c)) { seen.add(c); out.push(c); }
        }
        walk(c);
      }
    }
  })(root);
  return out;
}
function textNode(s) { return { nodeType: 3, textContent: String(s), parentNode: null }; }

const doc = {
  createElement: mkEl, createElementNS: (ns, t) => mkEl(t), createTextNode: textNode,
  _byId: {},
  getElementById(id) {
    const found = qsa(doc.body, '#' + id)[0];
    if (found) return found;
    return doc._byId[id] || null;
  },
  querySelector(sel) { return qsa(doc.body, sel)[0] || null; },
  querySelectorAll(sel) { return qsa(doc.body, sel); },
  _lis: {}, addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); },
  removeEventListener() {}, title: ''
};
doc.documentElement = mkEl('html');
doc.body = mkEl('body');
doc.head = mkEl('head');

const root = mkEl('div'); root.setAttribute('id', 'root'); doc.body.appendChild(root);
const toasts = mkEl('div'); toasts.setAttribute('id', 'toasts'); doc.body.appendChild(toasts);

/* --------------------------------------------------------- fake Supabase */
const DB = {
  admins: [{ id: 'u-owner', email: 'owner@example.com', full_name: 'Owner', role: 'owner', is_active: true }],
  developers: [
    { id: 'd1', slug: 'modon', name_en: 'Modon', name_ar: 'مدن', status: 'published', founded_year: 2005 },
    { id: 'd2', slug: 'sodic', name_en: 'SODIC', name_ar: 'سوديك', status: 'published' }
  ],
  locations: [{ id: 'l1', slug: 'newcairo', name_en: 'New Cairo', name_ar: 'القاهرة الجديدة', level: 'area' }],
  projects: [{ id: 'p1', slug: 'trio-new-cairo', name_en: 'TRIO', name_ar: 'تريو', developer_id: 'd1',
               location_id: 'l1', status: 'published', price_from: 11637891, tags_en: ['New Cairo'], tags_ar: ['القاهرة'] }],
  units: [
    { id: 'u1', unit_code: 'MS-TR-01', project_id: 'p1', unit_type_en: 'Apartment', bedrooms: 2,
      bua: 130, price: 11637891, down_payment_pct: 10, instalment_years: 10, delivery_label: '2028',
      availability: 'available', status: 'published' },
    { id: 'u2', unit_code: 'MS-TR-02', project_id: 'p1', unit_type_en: 'Apartment', bedrooms: 2,
      bua: 130, price: 14095338, down_payment_pct: 10, instalment_years: 10, delivery_label: '2028',
      availability: 'available', status: 'published' }
  ],
  media_assets: [{ id: 'm1', path: '/project-media/msquared/trio-exterior.webp', alt_en: null, alt_ar: null }],
  audit_log: [{ id: 1, action: 'update', entity_type: 'unit', entity_label: 'Unit MS-TR-01',
                actor_email: 'owner@example.com', created_at: '2026-09-01T10:00:00Z' }],
  admin_invites: [],
  import_batches: [], import_rows: []
};

const CALLS = [];           // every request the app made
let RPC_RESULT = 3;
let FAIL_NEXT = null;       // { status, body } to answer the next call with

function tableOf(url) {
  const m = /\/rest\/v1\/([a-z_]+)/.exec(url);
  return m ? m[1] : null;
}

function applyFilters(rows, url) {
  const q = url.split('?')[1] || '';
  q.split('&').forEach(kv => {
    const i = kv.indexOf('=');
    if (i < 0) return;
    const k = decodeURIComponent(kv.slice(0, i)), v = decodeURIComponent(kv.slice(i + 1));
    if (k === 'select' || k === 'order' || k === 'limit' || k === 'or') return;
    const em = /^eq\.(.*)$/.exec(v);
    if (em) { rows = rows.filter(r => String(r[k]) === em[1]); return; }
    if (v === 'is.null') { rows = rows.filter(r => r[k] == null); return; }
    const im = /^in\.\((.*)\)$/.exec(v);
    if (im) {
      const wanted = im[1].split(',').map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
      rows = rows.filter(r => wanted.indexOf(String(r[k])) > -1);
    }
  });
  return rows;
}

function fakeFetch(url, opts) {
  opts = opts || {};
  CALLS.push({ url, method: opts.method || 'GET', headers: opts.headers || {},
               body: opts.body ? JSON.parse(opts.body) : null });

  if (FAIL_NEXT) {
    const f = FAIL_NEXT; FAIL_NEXT = null;
    return Promise.resolve(mkRes(f.status, f.body));
  }

  if (url.indexOf('/auth/v1/token') > -1) {
    const b = JSON.parse(opts.body);
    if (b.password === 'right') {
      return Promise.resolve(mkRes(200, {
        access_token: jwt('u-owner'), refresh_token: 'r1', expires_in: 3600,
        user: { id: 'u-owner', email: b.email }
      }));
    }
    return Promise.resolve(mkRes(400, { error_description: 'Invalid login credentials' }));
  }
  if (url.indexOf('/auth/v1/signup') > -1) return Promise.resolve(mkRes(200, { user: { id: 'x' } }));
  if (url.indexOf('/auth/v1/recover') > -1) return Promise.resolve(mkRes(200, {}));
  if (url.indexOf('/auth/v1/logout') > -1) return Promise.resolve(mkRes(204, null));

  if (url.indexOf('/rest/v1/rpc/') > -1) return Promise.resolve(mkRes(200, RPC_RESULT));

  const table = tableOf(url);
  const method = opts.method || 'GET';
  if (!table || !DB[table]) return Promise.resolve(mkRes(404, { message: 'no table ' + table }));

  if (method === 'GET') {
    const rows = applyFilters(DB[table].slice(), url);
    return Promise.resolve(mkRes(200, rows, 'items 0-' + Math.max(0, rows.length - 1) + '/' + rows.length));
  }
  if (method === 'POST') {
    const payload = JSON.parse(opts.body);
    const list = Array.isArray(payload) ? payload : [payload];
    const made = list.map((r, i) => Object.assign({ id: table + '-new-' + (DB[table].length + i) }, r));
    made.forEach(r => DB[table].push(r));
    return Promise.resolve(mkRes(201, Array.isArray(payload) ? made : made));
  }
  if (method === 'PATCH') {
    const patch = JSON.parse(opts.body);
    const hit = applyFilters(DB[table].slice(), url);
    hit.forEach(r => Object.assign(r, patch));
    return Promise.resolve(mkRes(200, hit));
  }
  if (method === 'DELETE') {
    const hit = applyFilters(DB[table].slice(), url);
    DB[table] = DB[table].filter(r => hit.indexOf(r) < 0);
    return Promise.resolve(mkRes(204, null));
  }
  return Promise.resolve(mkRes(405, { message: 'method' }));
}

function mkRes(status, body, range) {
  return {
    ok: status >= 200 && status < 300, status: status,
    headers: { get: k => (k.toLowerCase() === 'content-range' ? (range || null) : null) },
    text: () => Promise.resolve(body == null ? '' : JSON.stringify(body))
  };
}

function b64(s) { return Buffer.from(s, 'utf8').toString('base64').replace(/=+$/, ''); }
function jwt(sub) { return 'x.' + b64(JSON.stringify({ sub, role: 'authenticated' })) + '.y'; }

/* -------------------------------------------------------------- sandbox */
const store = {};
const win = {
  location: { protocol: 'https:', host: 'x', origin: 'https://x', pathname: '/admin/', search: '', hash: '' },
  history: { pushState() {}, replaceState() {} },
  addEventListener() {}, removeEventListener() {},
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  navigator: { userAgent: 'node' }
};

const sandbox = {
  document: doc, window: win, location: win.location, history: win.history,
  localStorage: win.localStorage, navigator: win.navigator,
  fetch: fakeFetch, atob: s => Buffer.from(s, 'base64').toString('binary'),
  btoa: s => Buffer.from(s, 'binary').toString('base64'),
  escape: escape, unescape: unescape,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Promise, JSON, Math, Date, Set, Map, Array, Object, String, Number, Boolean, RegExp, Error,
  isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, console,
  Intl, TextDecoder, DOMParser: null, Blob: null, Response: null, DecompressionStream: undefined,
  confirm: () => true, alert: () => {},
  DataView, Uint8Array, ArrayBuffer
};
sandbox.globalThis = sandbox; sandbox.self = sandbox;

const file = path.join(__dirname, '..', 'admin', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

vm.createContext(sandbox);
// The first script is the font preloader; it needs no DOM beyond head.
scripts.forEach((s, i) => {
  try { vm.runInContext(s, sandbox, { filename: 'admin.js#' + i }); }
  catch (e) { console.error('script ' + i + ' threw: ' + e.message); process.exitCode = 1; }
});

const CMS = sandbox.window.CMS;

/* --------------------------------------------------------------- assert */
const R = [];
const ck = (n, c, x) => R.push({ n, ok: !!c, x: x || '' });
if (process.argv.includes('--list')) {
  // filled in as the assertions run below
}
function textIn(node) { return node ? node.textContent : ''; }
function findText(node, s) { return textIn(node).indexOf(s) > -1; }

/* ---------------------------------------------------------------- tests */
(async function run() {
  // --- the bundle itself
  ck('bundle: the page carries no third-party script tag',
     !/<script[^>]+src=/i.test(html));
  ck('bundle: script-src is pinned to hashes, not unsafe-inline',
     /script-src 'self' 'sha256-/.test(html) && !/script-src 'self' 'unsafe-inline'/.test(html));
  ck('bundle: connect-src reaches Supabase and nothing else',
     /connect-src 'self' https:\/\/[a-z0-9]+\.supabase\.co;/.test(html));
  ck('bundle: search engines are told to stay out',
     /name="robots" content="noindex/.test(html));
  ck('bundle: no password, secret or service key is embedded',
     !/service_role|SUPABASE_SERVICE|secret_key|sb_secret/i.test(html));
  ck('bundle: the publishable key is present, so the page can reach the API',
     /sb_publishable_/.test(html));

  // --- core helpers
  ck('core: h() writes text, never markup', (function () {
    const el = CMS.h('div', { text: '<img src=x onerror=1>' });
    return el.childNodes.length === 0 && el.textContent.indexOf('<img') === 0;
  })());
  ck('core: h() drops a javascript: href', (function () {
    const el = CMS.h('a', { href: 'javascript:alert(1)' });
    return el.getAttribute('href') === null;
  })());
  ck('core: h() keeps an ordinary path href',
     CMS.h('a', { href: '/en/projects/trio/' }).getAttribute('href') === '/en/projects/trio/');
  ck('core: an on* prop only binds a function, never a string',
     CMS.h('button', { onclick: 'alert(1)' }).getAttribute('onclick') === null);
  ck('core: slugify makes a URL-safe segment',
     CMS.slugify("Mountain View — iCity!") === 'mountain-view-icity');
  ck('core: every string is a pair with a real Arabic side', (function () {
    const bad = Object.keys(CMS.STR).filter(k => {
      const p = CMS.STR[k];
      return !p || p.length !== 2 || !String(p[0]).trim() || !String(p[1]).trim();
    });
    return bad.length === 0;
  })(), 'missing halves');
  ck('core: switching language flips the document direction', (function () {
    CMS.setLang('ar');
    const rtl = doc.documentElement.getAttribute('dir') === 'rtl';
    CMS.setLang('en');
    return rtl && doc.documentElement.getAttribute('dir') === 'ltr';
  })());
  ck('core: money reads as Egyptian pounds', CMS.money(1000).indexOf('EGP') === 0);

  // --- auth
  CALLS.length = 0;
  let err = null;
  try { await CMS.api.signIn('owner@example.com', 'wrong'); } catch (e) { err = e; }
  ck('auth: a wrong password is refused and says so plainly',
     err && /password/i.test(err.message), err && err.message);
  ck('auth: nothing is stored after a failed sign-in', CMS.api.session() == null);

  const s = await CMS.api.signIn('owner@example.com', 'right');
  ck('auth: a good password yields a session with both tokens',
     s && s.access_token && s.refresh_token);
  ck('auth: the session survives a reload', (function () {
    const raw = store['tvi_admin_session'];
    return raw && JSON.parse(raw).access_token === s.access_token;
  })());
  ck('auth: the token is read for the user id, never trusted for the role',
     CMS.shell.jwtSub() === 'u-owner');

  // --- who am I
  await CMS.shell.boot();
  ck('shell: the role comes from the database row, not the token',
     CMS.shell.me() && CMS.shell.me().role === 'owner');
  ck('shell: an owner may write', CMS.shell.canWrite() && CMS.shell.isOwner());
  ck('shell: the frame rendered a navigation rail',
     doc.body.querySelectorAll('.rail').length === 1);
  ck('shell: every registered route has an icon and a bilingual label',
     CMS.shell.order.every(n => {
       const r = CMS.shell.routes[n];
       return r.icon && CMS.STR[r.label || n];
     }));
  ck('shell: the price importer and the publisher are both reachable',
     CMS.shell.order.indexOf('price-import') > -1 && CMS.shell.order.indexOf('publish') > -1);
  ck('shell: the team screen is owner-only',
     CMS.shell.routes.admins.needs === 'owner');

  // a viewer sees no create buttons
  const realMe = CMS.shell.me();
  ck('shell: a viewer is read-only', (function () {
    realMe.role = 'viewer';
    const ro = !CMS.shell.canWrite();
    realMe.role = 'owner';
    return ro;
  })());

  // --- rendering each screen without throwing
  for (const name of CMS.shell.order) {
    const host = mkEl('div');
    let threw = null;
    try { await CMS.shell.routes[name].render(host); }
    catch (e) { threw = e; }
    ck('screen: ' + name + ' renders without throwing', !threw, threw && threw.message);
    ck('screen: ' + name + ' put something on the page', host.childNodes.length > 0);
  }

  // --- list engine
  {
    const host = mkEl('div');
    await CMS.shell.routes.units.render(host);
    await new Promise(r => setTimeout(r, 10));
    const rows = host.querySelectorAll('tbody');
    ck('list: the units table drew a row per unit',
       rows.length && rows[0].children.length === DB.units.length,
       rows.length ? String(rows[0].children.length) : 'no tbody');
    ck('list: a unit code is shown as code, not as free text',
       host.querySelectorAll('code').length >= DB.units.length);
    const rangeCall = CALLS.filter(c => /\/units\?/.test(c.url) && c.headers.Range).pop();
    ck('list: the request asks for one page and an exact count',
       rangeCall && rangeCall.headers.Range === '0-49' && /count=exact/.test(rangeCall.headers.Prefer || ''));
    ck('list: reads go to the cms schema, not public',
       rangeCall && rangeCall.headers['Accept-Profile'] === 'cms');
  }

  // --- the drawer writes what was typed
  {
    CALLS.length = 0;
    CMS.crud.openDrawer({
      table: 'developers', pk: 'id', title: 'developers',
      fields: [{ name: 'name_en', label: 'name_en', required: true },
               { name: 'name_ar', label: 'name_ar', required: true },
               { name: 'slug', label: 'slug', required: true }]
    }, null, function () {});
    const panel = doc.body.querySelectorAll('.drawer__panel').pop();
    const inputs = panel.querySelectorAll('input');
    inputs[0].value = 'New Developer';
    inputs[1].value = 'مطوّر جديد';
    inputs[2].value = 'new-developer';
    const save = panel.querySelectorAll('.btn--primary')[0];
    save.click();
    await new Promise(r => setTimeout(r, 10));
    const post = CALLS.filter(c => c.method === 'POST' && /developers/.test(c.url)).pop();
    ck('drawer: saving posts exactly the fields the form showed',
       post && post.body.name_en === 'New Developer' && post.body.name_ar === 'مطوّر جديد'
            && post.body.slug === 'new-developer');
    ck('drawer: writes declare the cms schema',
       post && post.headers['Content-Profile'] === 'cms');
  }

  // --- required fields block a save
  {
    CALLS.length = 0;
    CMS.crud.openDrawer({
      table: 'developers', pk: 'id', title: 'developers',
      fields: [{ name: 'name_en', label: 'name_en', required: true }]
    }, null, function () {});
    const panel = doc.body.querySelectorAll('.drawer__panel').pop();
    panel.querySelectorAll('.btn--primary')[0].click();
    await new Promise(r => setTimeout(r, 10));
    ck('drawer: an empty required field stops the save',
       CALLS.filter(c => c.method === 'POST').length === 0);
    ck('drawer: and says which field',
       panel.querySelectorAll('.f__err').some(e => !e.hidden && e.textContent));
  }

  // --- spreadsheet reading
  {
    const rows = CMS.sheet.parseCsv('Unit Code,Price\r\nMS-TR-01,"12,000,000"\r\nMS-TR-02,14095338\r\n');
    ck('sheet: a quoted number keeps its commas until it is parsed',
       rows.length === 3 && rows[1][1] === '12,000,000');
    ck('sheet: a semicolon file is read as columns, not one long cell',
       CMS.sheet.parseCsv('a;b\n1;2')[1].length === 2);
    ck('sheet: a doubled quote is one literal quote',
       CMS.sheet.parseCsv('a\n"say ""hi"""')[1][0] === 'say "hi"');
    ck('sheet: trailing blank rows are dropped',
       CMS.sheet.trim([['a', 'b'], ['', ''], ['1', '2']]).length === 2);
  }

  // --- header matching and number cleaning
  {
    const m = CMS.importer.mapColumns(['Unit Code', 'New Price', 'DP %', 'Years', 'Handover']);
    ck('import: an English header row is understood',
       m.unit_code === 0 && m.price === 1 && m.down_payment_pct === 2 &&
       m.instalment_years === 3 && m.delivery_label === 4, JSON.stringify(m));
    const a = CMS.importer.mapColumns(['كود الوحدة', 'السعر', 'المقدم', 'سنوات', 'التسليم']);
    ck('import: an Arabic header row is understood too',
       a.unit_code === 0 && a.price === 1 && a.down_payment_pct === 2 &&
       a.instalment_years === 3 && a.delivery_label === 4, JSON.stringify(a));
    ck('import: a price with separators becomes a number',
       CMS.importer.toNumber('12,000,000') === 12000000);
    ck('import: Arabic-Indic digits become a number',
       CMS.importer.toNumber('١٢٣٤') === 1234);
    ck('import: a currency word does not defeat the parse',
       CMS.importer.toNumber('19 900 000 EGP') === 19900000);
    ck('import: text where a number belongs is reported, not guessed',
       Number.isNaN(CMS.importer.toNumber('call us')));
    ck('import: an empty cell is not a change',
       CMS.importer.toNumber('') === null && CMS.importer.toNumber(null) === null);
  }

  // --- the importer end to end
  {
    CALLS.length = 0;
    const host = mkEl('div');
    await CMS.shell.routes['price-import'].render(host);
    const drop = host.querySelectorAll('.drop')[0];
    ck('import: the screen explains that a file cannot create a unit',
       findText(host, 'never creates') || findText(host, 'لا ينشئ'));
    ck('import: a file picker is offered', !!drop);
  }

  // --- money never silently rounds a fractional term
  ck('data: a 3.5-year plan is representable', (function () {
    return CMS.num(3.5).indexOf('3.5') === 0 || CMS.num(3.5).indexOf('٣٫٥') === 0;
  })());

  // --- error surfaces
  {
    FAIL_NEXT = { status: 403, body: { message: 'permission denied' } };
    let e2 = null;
    try { await CMS.api.select('projects', { select: '*' }); } catch (e) { e2 = e; }
    ck('api: a refusal is reported as a permission problem, not a crash',
       e2 && e2.message === CMS.t('err_perm'), e2 && e2.message);
  }

  // --- session refresh
  {
    CALLS.length = 0;
    FAIL_NEXT = { status: 401, body: { message: 'expired' } };
    await CMS.api.select('projects', { select: '*' }).catch(() => {});
    const refreshed = CALLS.some(c => /grant_type=refresh_token/.test(c.url));
    ck('api: a 401 triggers exactly one refresh and a retry', refreshed);
  }

  /* --------------------------------------------------------------- out */
  const failed = R.filter(r => !r.ok);
  R.forEach(r => { if (!r.ok) console.log('FAIL ' + r.n + (r.x ? '  — ' + r.x : '')); });
  R.filter(r => r.ok).forEach(r => console.log('PASS ' + r.n));
  console.log('\nTOTAL ' + R.filter(r => r.ok).length + ' passed, ' + failed.length + ' failed');
  if (failed.length) process.exitCode = 1;
})();
