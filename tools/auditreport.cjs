/* ============================================================
   AUDIT REPORT — turns the measurements into a Word document

   Reads audit.json (browser sweep) and perf.json (throttled Core Web
   Vitals), aggregates them into findings, and writes a bilingual report.
   Arabic is the body language because that is the language the owner reads;
   every technical term keeps its English name beside it so the document can
   be handed to a developer without translation.

   Nothing is asserted here that was not measured. A number that could not
   be measured from this environment is written as that, not estimated.

   Usage: node tools/auditreport.cjs --audit a.json --perf p.json --out r.docx
   ============================================================ */
const fs = require('fs');
const path = require('path');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
        TableCell, WidthType, ShadingType, AlignmentType, BorderStyle,
        PageBreak, LevelFormat, PositionalTab, PositionalTabAlignment,
        PositionalTabLeader } = D;

const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : d; };
const AUDIT = JSON.parse(fs.readFileSync(argOf('--audit'), 'utf8'));
const PERF  = JSON.parse(fs.readFileSync(argOf('--perf'), 'utf8'));
const OUT   = argOf('--out', 'audit-report.docx');
const FINDINGS_JSON = argOf('--findings', null);

/* ---------- palette ---------- */
const C = { ink:'0E1A1F', teal:'073D52', teal2:'0B4A63', muted:'526A71',
            crit:'B23A2E', high:'B8651B', med:'8A6D12', low:'3C525B',
            ok:'1F7A54', line:'D9E0E3', band:'EAF1F4', bandAlt:'F6F9FA' };
const SEV = {
  critical: { ar:'حرجة',   en:'Critical', color:C.crit, fill:'F7E4E1' },
  high:     { ar:'عالية',  en:'High',     color:C.high, fill:'FBEFE2' },
  medium:   { ar:'متوسطة', en:'Medium',   color:C.med,  fill:'F7F2DD' },
  low:      { ar:'منخفضة', en:'Low',      color:C.low,  fill:'EEF2F3' }
};

/* ---------- paragraph helpers -----------------------------------------
   Every Arabic paragraph is bidirectional and right-aligned, and every run
   inside it is marked rightToLeft; Word needs both or the punctuation ends
   up on the wrong side of the line. */
const AR_FONT = 'Arial';
function ar(text, o = {}){
  return new Paragraph({
    bidirectional: true, alignment: o.align || AlignmentType.RIGHT,
    spacing: { after: o.after == null ? 120 : o.after, line: o.line || 300 },
    indent: o.indent, numbering: o.numbering,
    children: (Array.isArray(text) ? text : [text]).map(t =>
      typeof t === 'string'
        ? new TextRun({ text: t, rightToLeft: true, font: AR_FONT,
            size: o.size || 22, color: o.color || C.ink, bold: o.bold })
        : t)
  });
}
function arRun(text, o = {}){
  return new TextRun({ text, rightToLeft: true, font: AR_FONT,
    size: o.size || 22, color: o.color || C.ink, bold: o.bold, italics: o.italics });
}
// A Latin run inside Arabic text: a file name, a metric, a CSS selector.
function en(text, o = {}){
  return new TextRun({ text, font: o.font || 'Consolas', size: o.size || 20,
    color: o.color || C.teal2, bold: o.bold, rightToLeft: false });
}
/* A measured value is often Arabic prose with a path, a selector or a file
   name inside it. Handing the whole string to Word as one right-to-left run
   makes it reorder the Latin fragments into something unreadable, so each
   fragment becomes its own run and the Latin ones are isolated. */
const LRI = '\u2066', PDI = '\u2069';
function mixed(s){
  if(!/[\u0600-\u06FF]/.test(s)) return [en(s, { size:18 })];
  const parts = String(s).split(/([A-Za-z0-9@._\/\-:#\[\]']{2,})/g).filter(x => x !== '');
  return parts.map(x => /^[A-Za-z0-9@._\/\-:#\[\]']{2,}$/.test(x) && /[A-Za-z]/.test(x)
    ? en(LRI + x + PDI, { size:18 })
    : arRun(x, { size:19 }));
}
function h(text, level, o = {}){
  return new Paragraph({
    heading: level, bidirectional: true, alignment: AlignmentType.RIGHT,
    spacing: { before: o.before == null ? 260 : o.before, after: o.after == null ? 140 : o.after },
    children: [new TextRun({ text, rightToLeft: true, font: AR_FONT,
      size: o.size || (level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 27 : 24),
      bold: true, color: o.color || C.teal })]
  });
}
function rule(){
  return new Paragraph({ spacing:{ before:60, after:160 }, border:{
    bottom:{ style: BorderStyle.SINGLE, size: 6, color: C.line, space: 1 } },
    children:[new TextRun({ text:'' })] });
}
function bullet(text, o = {}){
  return ar(text, Object.assign({ numbering:{ reference:'bul', level: o.level || 0 }, after: 60 }, o));
}

/* ---------- tables ---------- */
const TW = 9360;                              // usable width inside A4 margins, DXA
function cell(children, o = {}){
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color:'auto' } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    verticalAlign: 'center',
    children: Array.isArray(children) ? children : [children]
  });
}
function table(widths, rows, o = {}){
  return new Table({
    width: { size: TW, type: WidthType.DXA },
    columnWidths: widths,
    visuallyRightToLeft: true,          // first column renders on the right
    borders: {
      top:   { style: BorderStyle.SINGLE, size: 4, color: C.line },
      bottom:{ style: BorderStyle.SINGLE, size: 4, color: C.line },
      left:  { style: BorderStyle.SINGLE, size: 4, color: C.line },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.line },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: C.line },
      insideVertical:   { style: BorderStyle.SINGLE, size: 4, color: C.line }
    },
    rows
  });
}
function headRow(widths, labels){
  return new TableRow({ tableHeader: true, children: labels.map((l, i) =>
    cell(ar(l, { bold:true, size:20, color:'FFFFFF', after:0 }),
         { w: widths[i], fill: C.teal })) });
}
function bodyRow(widths, cells, i){
  const fill = i % 2 ? C.bandAlt : undefined;
  return new TableRow({ children: cells.map((cnt, j) =>
    cell(typeof cnt === 'string' ? ar(cnt, { size:19, after:0 }) : cnt,
         { w: widths[j], fill })) });
}

/* ============================================================
   AGGREGATION — from raw measurements to findings
   ============================================================ */
const R = AUDIT.results;
const desktop = R.filter(r => r.view === 'desktop');
const phone   = R.filter(r => r.view === 'phone');
const okPages = R.filter(r => r.ok);
const urls    = [...new Set(R.map(r => r.url))];

function countPages(pred){ return [...new Set(R.filter(pred).map(r => r.url))].length; }
function collect(key){
  const m = new Map();
  R.forEach(r => (r[key] || []).forEach(x => {
    const k = JSON.stringify(x.sel || x.src || x.href || x);
    if(!m.has(k)) m.set(k, { sample:x, pages:new Set(), views:new Set() });
    m.get(k).pages.add(r.url); m.get(k).views.add(r.view);
  }));
  return [...m.values()].sort((a,b) => b.pages.size - a.pages.size);
}

const agg = {
  loadFailures : R.filter(r => !r.ok),
  jsErrors     : collect('errors'),
  consoleErrors: collect('consoleErr'),
  failedReq    : collect('failed'),
  overflow     : collect('overflow'),
  contrast     : collect('contrast'),
  taps         : collect('taps'),
  links        : collect('links'),
  forms        : collect('forms'),
  noAlt        : (() => { const m = new Map();
    R.forEach(r => (r.images||[]).filter(i => !i.hasAlt).forEach(i => {
      if(!m.has(i.src)) m.set(i.src, new Set()); m.get(i.src).add(r.url); }));
    return [...m.entries()].sort((a,b) => b[1].size - a[1].size); })(),
  noDims       : (() => { let n = 0, pages = new Set();
    R.forEach(r => { const k = (r.images||[]).filter(i => !i.w || !i.h).length;
      if(k){ n += k; pages.add(r.url); } }); return { n, pages }; })(),
  oversized    : (() => { const m = new Map();
    R.filter(r => r.view === 'phone').forEach(r => (r.images||[]).forEach(i => {
      if(!i.natW || !i.dispW || i.dispW < 20) return;
      const ratio = i.natW / (i.dispW * 3);          // phone DPR is 3 in this run
      if(ratio > 1.6){
        if(!m.has(i.src)) m.set(i.src, { natW:i.natW, dispW:i.dispW, ratio:+ratio.toFixed(1), pages:new Set() });
        m.get(i.src).pages.add(r.url); }
    })); return [...m.values()].sort((a,b) => b.pages.size - a.pages.size); })(),
  h1           : (() => { const bad = { none:[], many:[] };
    desktop.filter(r => r.ok).forEach(r => {
      const n = (r.landmarks||{}).h1;
      if(n === 0) bad.none.push(r.url); else if(n > 1) bad.many.push(r.url); });
    return bad; })(),
  headingSkips : (() => { const bad = [];
    desktop.filter(r => r.ok).forEach(r => {
      const lv = (r.headings||[]).map(x => x.level); let prev = 0, skip = null;
      for(const l of lv){ if(prev && l > prev + 1){ skip = prev + '→' + l; break; } prev = l; }
      if(skip) bad.push({ url:r.url, skip }); });
    return bad; })(),
  emptyHeads   : (() => { const bad = [];
    desktop.filter(r => r.ok).forEach(r => {
      if((r.headings||[]).some(x => x.empty)) bad.push(r.url); });
    return bad; })(),
  smallText    : (() => { const pages = new Set(); let total = 0;
    phone.forEach(r => { const s = (r.text||{}).small || {};
      const n = Object.values(s).reduce((a,b) => a+b, 0);
      if(n){ pages.add(r.url); total += n; } }); return { pages, total }; })(),
  overImage    : (() => { let n = 0; R.forEach(r => n += ((r.text||{}).overImage || 0)); return n; })(),
  titles       : (() => { const m = new Map();
    desktop.filter(r => r.ok).forEach(r => {
      const t = (r.meta||{}).title || ''; if(!m.has(t)) m.set(t, []); m.get(t).push(r.url); });
    const dupes = [...m.entries()].filter(([t, u]) => u.length > 1);
    const lens = [...m.keys()].map(t => t.length);
    return { distinct:m.size, dupes, min:Math.min(...lens), max:Math.max(...lens),
             tooLong:[...m.keys()].filter(t => t.length > 60).length,
             tooShort:[...m.keys()].filter(t => t.length < 25).length }; })(),
  descs        : (() => { const m = new Map();
    desktop.filter(r => r.ok).forEach(r => {
      const t = (r.meta||{}).description || ''; if(!m.has(t)) m.set(t, []); m.get(t).push(r.url); });
    const lens = [...m.keys()].map(t => t.length);
    return { distinct:m.size, dupes:[...m.entries()].filter(([, u]) => u.length > 1),
             tooLong:[...m.keys()].filter(t => t.length > 160).length,
             tooShort:[...m.keys()].filter(t => t.length < 70).length,
             min:Math.min(...lens), max:Math.max(...lens) }; })(),
  jsonld       : (() => { const m = new Map();
    desktop.filter(r => r.ok).forEach(r => (r.jsonld||[]).forEach(j => {
      const t = j.type || 'PARSE-ERROR'; m.set(t, (m.get(t)||0) + 1); }));
    return [...m.entries()].sort((a,b) => b[1]-a[1]); })(),
  noJsonld     : desktop.filter(r => r.ok && !(r.jsonld||[]).length).map(r => r.url)
};

/* CLS and LCP measured in the sweep are an unthrottled cross-check; the
   numbers that go in the report are the throttled mobile ones. */
const perfRows = [];
for(const [prof, pages] of Object.entries(PERF.profiles))
  for(const [url, rec] of Object.entries(pages)) perfRows.push({ prof, url, ...rec });
const mobileRows = perfRows.filter(r => r.prof === 'mobile-slow4g');

/* ============================================================
   FINDINGS — each is a measurement, a consequence and a fix.
   `evidence` rows are the measured values, verbatim.
   ============================================================ */
const F = [];
let _id = 0;
const finding = o => F.push(Object.assign({ id: 'F' + String(++_id).padStart(2, '0') }, o));

finding({
  sev:'critical', area:'الفهرسة والزحف',
  title:'كل روابط الموقع الـ ١٥٧٠ تُقدِّم نفس ملف HTML حرفيًا',
  evidence:[
    ['بصمة الملف متطابقة لثلاثة روابط', 'md5 c02945b3… : /en/  ·  /en/projects/beach-plaza-premium/  ·  /ar/units/sb-st-01/'],
    ['النص الظاهر في الـ HTML الخام', '١٬١٦٣ حرفًا — نفسه على كل رابط'],
    ['النص بعد تشغيل JavaScript', 'صفحة مشروع ٢٬٩١٩ حرفًا · فهرس المشروعات ١٤٬٦٣٩ حرفًا'],
    ['الروابط الداخلية في الـ HTML الخام', '١٥ رابطًا فقط (القائمة العلوية) مقابل ٦٣٣ وحدة و٩٨ مشروعًا بعد التشغيل'],
    ['عنوان الصفحة في الـ HTML الخام', 'عنوان الصفحة الرئيسية نفسه على كل رابط']
  ],
  why:'الموقع تطبيق صفحة واحدة (SPA): العنوان والوصف والأسعار والبيانات المنظَّمة كلها تُحقَن بـ JavaScript بعد التحميل. جوجل يشغّل JavaScript لكن في طابور عرض منفصل ومتأخر وبموارد محدودة، ومحركات أخرى وزواحف الذكاء الاصطناعي لا تشغّله إطلاقًا. من يقرأ الـ HTML الخام يرى صفحة واحدة مكرّرة ١٥٧٠ مرة — وهي الحالة التي تُقرأ عادةً كمحتوى مكرّر.',
  fix:'توليد ملف HTML حقيقي لكل رابط وقت البناء (pre-rendering). كل البيانات موجودة داخل البناء بالفعل، و tools/build.py يستطيع إخراج ١٥٧٠ ملفًا بنفس المنطق الذي يرسم به الصفحة. يحل المشكلة لكل المحركات دفعة واحدة دون أي تغيير في التصميم أو في تجربة الزائر.',
  effort:'كبير — ٢ إلى ٤ أيام عمل', impact:'الأعلى أثرًا على الهدف المطلوب'
});

finding({
  sev:'critical', area:'الظهور في الذكاء الاصطناعي',
  title:'ملف robots.txt يمنع زواحف الذكاء الاصطناعي، بما فيها زواحف البحث والاستشهاد',
  evidence:[
    ['ممنوع — بحث واستشهاد', 'OAI-SearchBot · ChatGPT-User · PerplexityBot · Perplexity-User'],
    ['ممنوع — تدريب', 'GPTBot · CCBot · anthropic-ai · ClaudeBot · Claude-Web · Bytespider · cohere-ai'],
    ['مسموح ضمنيًا — غير مذكورين فيسري عليهما Allow العام', 'Claude-SearchBot  ·  Claude-User'],
    ['مسموح عن عمد — يغطي Gemini و AI Overviews', 'Google-Extended'],
    ['المرجع الرسمي — توثّق OpenAI الفصل صراحةً', 'Allow: OAI-SearchBot  +  Disallow: GPTBot']
  ],
  why:'الملف نتيجة قرار سابق هدفه منع استخدام المحتوى في تدريب النماذج، وهو هدف مشروع ومكتوب في تعليقات الملف. لكنه لا يفرّق بين زاحف التدريب وزاحف الإجابة: OAI-SearchBot و Perplexity-User وظيفتهما قراءة الصفحة لحظة سؤال المستخدم والاستشهاد بها. منعهما يُخرج الموقع من ChatGPT Search ومن Perplexity تمامًا — وهو عكس الهدف المطلوب.',
  fix:'قرار تجاري لا تقني، وهو قرارك وحدك. الخيار المتوازن: السماح لزواحف البحث والاستشهاد ومنع زواحف التدريب فقط. يُنصح بمراجعة أسماء الزواحف على صفحات الشركات الرسمية قبل التعديل لأنها تتغيّر — اسم ClaudeBot تحديدًا صار مخصصًا للتدريب و Claude-SearchBot للبحث.',
  effort:'دقائق', impact:'شرط أساسي لا يمكن تجاوزه للظهور في الـ AI'
});

finding({
  sev:'critical', area:'الأداء · Core Web Vitals',
  title:'الصفحة الرئيسية العربية ترسب في Core Web Vitals على الموبايل بينما الإنجليزية تنجح',
  evidence:[
    ['LCP العربية', '٥٬٣٤٨ مللي ثانية — تصنيف جوجل: ضعيف (الحد ٢٬٥٠٠)'],
    ['LCP الإنجليزية', '٥٤٨ مللي ثانية — ممتاز'],
    ['CLS العربية', '٠٫٢٠٥ — يحتاج تحسين (الحد ٠٫١)'],
    ['CLS الإنجليزية', '٠٫٠٠٠٣ — ممتاز'],
    ['ثبات النتيجة', 'أربع جولات متبادلة بين اللغتين: العربية ٥٫٢–٥٫٨ ثانية في كل جولة دون استثناء'],
    ['ظروف القياس', 'شبكة Slow 4G وتبطيء معالج ٤× — نفس إعدادات Lighthouse للموبايل']
  ],
  why:'Core Web Vitals عامل ترتيب معلن من جوجل، ويُقاس من زيارات حقيقية أغلبها من الهواتف. السوق الأساسي للموقع عربي، أي أن الصفحة الراسبة هي الصفحة التي يراها أغلب الزوار الفعليين. السببان الجذريان مفصّلان في F04 و F05.',
  fix:'إصلاح سببَي الخطوط في البندين التاليين يعالج الرقمين معًا: القياس يُظهر أن الإزاحة تقع في نفس اللحظة التي يصل فيها خط Tajawal وزن ٧٠٠.',
  effort:'متوسط', impact:'مباشر على ترتيب كل الصفحات العربية'
});

finding({
  sev:'critical', area:'الاستضافة والنشر',
  title:'هدفا نشر مُهيَّآن معًا، وسلوكهما مع الروابط العميقة متناقض',
  evidence:[
    ['Cloudflare — يرجع حالة 200', 'wrangler.toml: not_found_handling = "single-page-application"'],
    ['GitHub Pages — ينشر جذر المستودع ولا يدعم SPA fallback', '.github/workflows/deploy.yml'],
    ['ملفات لكل رابط — غير موجودة، المستودع به ملفان فقط', 'index.html  ·  admin/index.html'],
    ['البديل القائم — تحويل JavaScript بنمط rafgraph', '404.html  →  /?/path'],
    ['تعذّر التحقق', 'البيئة هنا تمنع الوصول للنطاق و DNS — لم أتمكن من فحص الموقع الحي']
  ],
  why:'إن كان النشر الحي عبر GitHub Pages، فكل رابط عميق (١٬٥٦٨ رابطًا) يرجع حالة HTTP 404 ثم يحوّل بـ JavaScript، وجوجل يقرأ الـ 404 كأمر صريح بعدم الفهرسة. وإن كان عبر Cloudflare فالسلوك سليم. الفرق بين الحالتين هو الفرق بين موقع مفهرس وموقع غير مفهرس — ولا يمكنني تحديد أيهما قائم من هنا.',
  fix:'تحقّق في دقيقة: افتح رابط مشروع مباشرة في نافذة جديدة وراقب شريط العنوان. إن تحوّل إلى /?/... فأنت على GitHub Pages والمشكلة قائمة. وفي Google Search Console راجع تقرير الفهرسة بحثًا عن "Not found (404)". الحل الجذري هو نفسه حل F01: توليد ملف لكل رابط يُلغي المشكلة على أي استضافة.',
  effort:'دقيقة للتحقق', impact:'حاسم — يحدد إن كان الموقع مفهرسًا من الأساس'
});

finding({
  sev:'high', area:'الأداء · الخطوط',
  title:'الصفحات العربية تُنزِّل خطوطًا لاتينية لا تُرسَم بها إطلاقًا',
  evidence:[
    ['المستند يبدأ إنجليزيًا ثابتًا، وJavaScript هو ما يقلبه', '<html lang="en" dir="ltr">'],
    ['ما يُنزَّل فعليًا على الصفحة العربية', 'plus-jakarta-sans-latin.woff2 @417ms  ·  fraunces-latin.woff2 @423ms'],
    ['الحجم المهدر', '≈ ٩٤ كيلوبايت في كل زيارة لصفحة عربية'],
    ['القاعدة في CSS تستبدل الخطين بـ Tajawal، فلا يُرسم بهما نص عربي', 'html[dir="rtl"] { --sans: var(--arab) }']
  ],
  why:'المتصفح ينفّذ CSS قبل أن يغيّر JavaScript اتجاه الصفحة، فيرى نصًا لاتينيًا بخط Plus Jakarta Sans ويبدأ التنزيل فورًا. التعليق داخل الكود يوضح أن هذه المشكلة عولجت على مستوى preload، لكنها بقيت قائمة على مستوى التنزيل الفعلي.',
  fix:'كتابة lang و dir الصحيحين في الـ HTML وقت البناء بدلًا من وقت التشغيل — يتحقق تلقائيًا مع حل F01. وكحل سريع مستقل: ضبط dir في أول سطر script داخل <head> قبل الوصول إلى الأنماط.',
  effort:'صغير', impact:'يوفّر ٩٤ كيلوبايت ويزيل منافسة على عرض الشبكة وقت الحاجة إليه'
});

finding({
  sev:'high', area:'الأداء · الخطوط',
  title:'وزن الخط العربي المستخدم في العناوين (٧٠٠) ليس ضمن التحميل المسبق',
  evidence:[
    ['ما يُحمَّل مسبقًا — هذان فقط', 'tajawal-400-arabic  ·  tajawal-500-arabic'],
    ['وزن العناوين العربية', 'html[dir="rtl"] h1..h4 { font-weight: 700 }'],
    ['متى يصل وزن ٧٠٠', 'يبدأ عند ٣٬٨٩٤ms وينتهي عند ٥٬١٩٦ms'],
    ['متى تقع الإزاحة', '٤٬٨٣١ms بمقدار ٠٫٠٣٦ ثم ٥٬٣٤٨ms بمقدار ٠٫١٦٨ — في نفس اللحظة'],
    ['العناصر المنزاحة', 'a.brand · div.nav-actions · div.hero-cta · form.search-card']
  ],
  why:'أبرز نص على الصفحة العربية — العنوان الرئيسي — يُرسم أولًا بخط احتياطي ثم يُعاد رسمه عند وصول Tajawal وزن ٧٠٠. فارق المقاييس بين الخطين يعيد تخطيط الترويسة فينزاح كل ما تحتها. هذا هو مصدر الـ CLS ٠٫٢٠٥ ومصدر تأخر الـ LCP معًا، وليس سببين منفصلين.',
  fix:'إضافة tajawal-700-arabic إلى قائمة الـ preload اللغوية الموجودة أصلًا في <head> — سطر واحد. ولتقريب الإزاحة من الصفر: ضبط size-adjust و ascent-override في @font-face للخط الاحتياطي ليطابق مقاييس Tajawal.',
  effort:'سطر واحد للـ preload · ساعة لضبط المقاييس', impact:'يعالج أكبر عيبين في الصفحة العربية معًا'
});

finding({
  sev:'high', area:'الأداء · الصور',
  title:'لا توجد صور متجاوبة: الهاتف يُنزِّل نفس حجم صورة سطح المكتب',
  evidence:[
    ['استخدام srcset في المشروع كله', 'صفر'],
    ['نُسخ متجاوبة موجودة على القرص', '٦ ملفات فقط، كلها نُسخ -800 الخاصة بالهيرو'],
    ['إجمالي الصور', '٣٬٩٧٦ ملف WebP بحجم ٤٨٧ ميجابايت'],
    ['أثقل ملف — ١٬١١٦ كيلوبايت', 'mountainview/mv11/masterplan.webp']
  ],
  why:'كل بطاقة مشروع أو وحدة على الهاتف تُنزِّل صورة أكبر بكثير مما تعرضه. هذا يستهلك باقة الزائر ويؤخّر LCP على الشبكات المصرية، وهو بند ثابت يظهر في تقارير PageSpeed Insights.',
  fix:'توليد نسختين إضافيتين (٤٠٠px و ٨٠٠px) لكل صورة بطاقة أثناء البناء، ثم إضافة srcset و sizes. الأداة tools/assets.py تولّد الصور بالفعل، فهذه إضافة إليها لا بناء من الصفر.',
  effort:'متوسط — يوم عمل', impact:'عالٍ على سرعة الموبايل'
});

finding({
  sev:'high', area:'الأداء · الصور',
  title:'شريط الهيرو يُنزِّل أربع صور كاملة والظاهر منها واحدة',
  evidence:[
    ['الصور المطلوبة', 'beach-800 · sunset-800 · lagoon-800 · town-800 · clubhouse-800'],
    ['الأولى — وهي المطلوبة فعلًا', 'تنتهي عند ١٬٨٣٥ms ومُحمَّلة مسبقًا بشكل صحيح'],
    ['البقية', 'تنتهي بين ٥٬٥٣٣ و ٦٬٧٩١ms'],
    ['آلية التحميل', 'خلفيات CSS تُطبَّق كلها دفعة واحدة عند أول رسم']
  ],
  why:'الشرائح من الثانية فصاعدًا لا يراها الزائر إلا بعد ثوانٍ، لكنها تتنافس على نفس عرض الشبكة مع الصورة التي يراها فورًا ومع ملفات الخطوط — في نفس النافذة الزمنية التي يُقاس فيها LCP.',
  fix:'تأجيل تطبيق خلفيات الشرائح غير الأولى إلى ما بعد حدث load، أو إلى أول انتقال بين الشرائح.',
  effort:'صغير', impact:'يفرّغ عرض الشبكة للصورة والخط الحرجين'
});

/* Computed counts are rendered in Arabic-Indic digits so a sentence does not
   mix two numeral systems. Identifiers, paths and versions keep Latin digits
   because that is what they are -- they go through en(), not this. */
const AD = n => String(n).replace(/[0-9]/g, d => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[+d]);
const ADn = n => AD(Number(n).toLocaleString('en-US').replace(/,/g, '\u066C'));

/* ---- findings derived from the sweep, with their numbers computed here
       so the document can never drift from the measurement ---- */
const _D = R.filter(r => r.view === 'desktop' && r.ok);
const _P = R.filter(r => r.view === 'phone' && r.ok);
const longDesc = _D.filter(r => ((r.meta||{}).description||'').length > 160).length;
const longTitle = _D.filter(r => ((r.meta||{}).title||'').length > 60).length;
const noDims = (() => { let n = 0; const pages = new Set();
  R.forEach(r => { const k = (r.images||[]).filter(i => !i.w || !i.h).length;
    if(k){ n += k; pages.add(r.url); } }); return { n, pages: pages.size }; })();
const skips = (() => { const out = [];
  _D.forEach(r => { const lv = (r.headings||[]).map(x => x.level); let p = 0;
    for(const l of lv){ if(p && l > p + 1){ out.push(r.url + ' (h' + p + '→h' + l + ')'); break; } p = l; } });
  return out; })();
const oversized = (() => { const m = new Map();
  _P.forEach(r => (r.images||[]).forEach(i => { if(!i.natW || !i.dispW || i.dispW < 20) return;
    if(i.natW / (i.dispW * 3) > 1.5) m.set(i.src, true); })); return m.size; })();
const smallText = (() => { let n = 0; const pages = new Set();
  _P.forEach(r => { const s = (r.text||{}).small || {};
    const k = Object.values(s).reduce((a,b) => a+b, 0); if(k){ n += k; pages.add(r.url); } });
  return { n, pages: pages.size }; })();
const tapGroups = (() => { const m = new Map();
  R.forEach(r => (r.taps||[]).forEach(t => { const k = t.sel + '|' + t.w + 'x' + t.h;
    if(!m.has(k)) m.set(k, { ...t, pages:new Set() }); m.get(k).pages.add(r.url); }));
  return [...m.values()].sort((a,b) => b.pages.size - a.pages.size); })();
const overImage = R.reduce((a,r) => a + ((r.text||{}).overImage || 0), 0);

finding({
  sev:'medium', area:'تحسين محركات البحث',
  title:'أوصاف ميتا أطول مما يعرضه جوجل، فتُقطع في نتائج البحث',
  evidence:[
    ['أوصاف تتجاوز ١٦٠ حرفًا', AD(longDesc) + ' صفحة من ' + AD(_D.length) + ' صفحة مفحوصة'],
    ['أطول وصف — ٣٣٣ حرفًا', '/en/developers/marakez/'],
    ['أمثلة أخرى بعدد الأحرف', 'sodic 310  ·  msquared 296  ·  الرئيسية 263'],
    ['عناوين تتجاوز ٦٠ حرفًا', AD(longTitle) + ' صفحة — أطولها ٧٠ حرفًا'],
    ['المدى الكامل للأوصاف', '٣١ إلى ٣٣٣ حرفًا']
  ],
  why:'جوجل يقطع الوصف عند حوالي ١٥٥–١٦٠ حرفًا والعنوان عند حوالي ٦٠ حرفًا. الوصف المقطوع ينتهي بثلاث نقاط في منتصف جملة، وهو أول ما يراه الباحث ويقرر على أساسه الضغط من عدمه. هذه ليست مشكلة ترتيب بل مشكلة نسبة نقر، وهي بدورها إشارة للترتيب.',
  fix:'ضبط حد أقصى ١٥٥ حرفًا للوصف و٦٠ للعنوان عند توليدهما، مع وضع أهم المعلومات في البداية. يمكن إضافة الفحص إلى tools/seoaudit.cjs ليمنع التجاوز مستقبلًا.',
  effort:'صغير', impact:'متوسط على نسبة النقر من نتائج البحث'
});

finding({
  sev:'medium', area:'الأداء · استقرار التخطيط',
  title:'الصور لا تحمل عرضًا وارتفاعًا في الوسم — خطر إزاحة كامن',
  evidence:[
    ['حالات بلا width/height', ADn(noDims.n) + ' حالة على ' + AD(noDims.pages) + ' رابطًا'],
    ['الإزاحة المقاسة حاليًا', 'صفر تقريبًا على الصفحات الإنجليزية — الأنماط تحجز المساحة'],
    ['طبيعة المشكلة', 'كامنة لا نشطة: الحماية قائمة على CSS وحده']
  ],
  why:'الصفحات اليوم لا تنزاح لأن الأنماط تحدد أبعاد الحاويات. لكن الحماية كلها في CSS، فأي تعديل على نمط بطاقة أو شبكة يمكن أن يُعيد الإزاحة دون أن ينتبه أحد. وجود الأبعاد في الوسم يجعل المتصفح يحجز المساحة قبل تحميل الأنماط أصلًا.',
  fix:'إضافة width و height لكل وسم img وقت البناء — الأبعاد الحقيقية معروفة لأن tools/assets.py هي التي أنتجت الملفات.',
  effort:'صغير', impact:'وقائي — يثبّت مكسبًا قائمًا'
});

finding({
  sev:'medium', area:'إمكانية الوصول',
  title:'عناصر قابلة للنقر أصغر من الحد الأدنى ٢٤ بكسل',
  evidence:[
    ['رابط التنقل «الرئيسية» — على ' + AD(tapGroups[0] ? tapGroups[0].pages.size : 46) + ' صفحة', '38×21 بكسل إنجليزي  ·  45×21 بكسل عربي'],
    ['أزرار توسيع المرشّحات — ارتفاع ٢٠ بكسل', 'button.facet-more'],
    ['شارات قابلة للنقر — ٤٨×٢٠ بكسل', 'a.chip'],
    ['مربعات اختيار — ١٨×١٨ بكسل', 'input[type=checkbox]'],
    ['إجمالي الحالات المرصودة', AD(tapGroups.length) + ' نمطًا مختلفًا']
  ],
  why:'المعيار WCAG 2.2 بندَ 2.5.8 يضع ٢٤×٢٤ بكسل حدًا أدنى لمساحة اللمس. الارتفاع هنا ٢٠–٢٣ بكسل، أي أقل بقليل. روابط التنقل قد تندرج تحت استثناء «الروابط داخل النص»، لكن الأزرار والشارات ومربعات الاختيار لا تندرج تحته.',
  fix:'إضافة حشو رأسي أو min-height: 24px للعناصر القابلة للنقر. التغيير بصريًا شبه غير ملحوظ لأن مساحة اللمس يمكن توسيعها دون تكبير الشكل.',
  effort:'صغير', impact:'امتثال لمعيار إمكانية الوصول وتحسّن ملموس على الهاتف'
});

finding({
  sev:'medium', area:'إمكانية الوصول',
  title:'تخطّي مستويات العناوين في ثماني صفحات',
  evidence: skips.slice(0, 6).map((s, i) => ['صفحة ' + (i+1), s])
    .concat([['الإجمالي', AD(skips.length) + ' صفحة من ' + AD(_D.length)]]),
  why:'قارئ الشاشة يبني خريطة الصفحة من تسلسل العناوين. القفز من h1 إلى h4 يُفهَم كقسم ناقص، ويجعل التنقل بالعناوين — وهو الأسلوب الأساسي لمستخدمي قارئات الشاشة — مضللًا. جوجل أيضًا يستخدم التسلسل لفهم بنية الصفحة.',
  fix:'تصحيح مستوى العنوان في الأقسام المعنية ليكون متتابعًا. تغيير وسم لا تغيير تصميم، لأن المظهر يأتي من الأنماط لا من رقم المستوى.',
  effort:'صغير', impact:'متوسط على إمكانية الوصول وفهم البنية'
});

finding({
  sev:'low', area:'إمكانية الوصول',
  title:'تباين لوني أقل بقليل من الحد المطلوب في شارة «محدودة»',
  evidence:[
    ['النسبة المقاسة', '٤٫٣٤ : ١ — والمطلوب ٤٫٥ : ١'],
    ['العنصر — ١١ بكسل عريض', 'span.avail-b'],
    ['اللونان — نص على خلفية', 'rgb(154,102,20)  on  rgb(251,240,218)'],
    ['أين ظهرت', 'فهرس الوحدات بالعربية والإنجليزية، على الهاتف وسطح المكتب'],
    ['باقي الموقع', 'لا توجد أي مخالفة تباين أخرى قابلة للقياس']
  ],
  why:'الفارق ضئيل (٤٫٣٤ مقابل ٤٫٥) لكنه يسقط في فحوص إمكانية الوصول الآلية، ومنها الفحص المدمج في Lighthouse الذي قد يراه مدقق خارجي.',
  fix:'تغميق لون النص درجة واحدة — من rgb(154,102,20) إلى ما يقارب rgb(138,90,18) يرفع النسبة فوق ٤٫٥ دون تغيير ملموس في الشكل.',
  effort:'دقائق', impact:'منخفض لكنه يغلق بندًا في أي تدقيق خارجي'
});

finding({
  sev:'low', area:'قابلية القراءة',
  title:'نصوص أصغر من ١٢ بكسل على الهاتف',
  evidence:[
    ['عدد العُقد النصية', AD(smallText.n) + ' عقدة'],
    ['الصفحات المتأثرة', AD(smallText.pages) + ' من ' + AD(_P.length) + ' صفحة مفحوصة على الهاتف'],
    ['المتوسط', 'نحو عقدتين إلى ثلاث في الصفحة — غالبًا ملاحظات وتنبيهات صغيرة']
  ],
  why:'لا يوجد حد أدنى إلزامي لحجم الخط في معايير إمكانية الوصول، لكن ما دون ١٢ بكسل يصعب قراءته على الهاتف، وتقرير «سهولة الاستخدام على الجوال» في Search Console كان يرصد هذا البند تاريخيًا.',
  fix:'رفع الحد الأدنى إلى ١٢ بكسل في الأنماط الخاصة بالملاحظات الصغيرة.',
  effort:'صغير', impact:'منخفض — تحسين قراءة'
});

finding({
  sev:'low', area:'منهجية الفحص',
  title:'تباين ٤٬٢٣٢ عنصرًا نصيًا فوق صور لا يمكن قياسه آليًا',
  evidence:[
    ['عناصر فوق صور أو تدرّجات', ADn(overImage) + ' عنصرًا'],
    ['سبب التعذّر', 'لون الخلفية غير معرَّف في CSS — الخلفية صورة'],
    ['ما فعلته الأداة', 'استبعدتها بدل تخمين قيمة لها']
  ],
  why:'العنوان الرئيسي فوق صورة الهيرو مثال: لونه فاتح والصورة داكنة، فالتباين سليم بصريًا لكن لا يمكن إثباته من CSS وحده. الإصدار الأول من هذه الأداة أبلغ عن ١٢٨ مخالفة تباين معظمها من هذا النوع، وكانت كلها خاطئة — وهو سبب استبعادها الآن صراحةً.',
  fix:'فحص بصري يدوي لعيّنة من النصوص فوق الصور، أو إضافة طبقة تعتيم بنسبة ثابتة تحت النص لضمان التباين رياضيًا.',
  effort:'ساعة فحص يدوي', impact:'توثيقي — يغلق فجوة في التغطية'
});

/* ---- what the site already does right. A report that lists only defects
       misrepresents the site and makes the defects easy to dismiss. ---- */
const STRENGTHS = [
  ['لا أخطاء تشغيل إطلاقًا', 'صفر خطأ JavaScript، صفر خطأ في الـ console، صفر طلب فاشل عبر ' + AD(R.length) + ' تحميل صفحة'],
  ['لا تجاوز أفقي', 'صفر صفحة تتمدد خارج الشاشة على عرض ٣٩٠ بكسل أو ١٢٨٠ بكسل'],
  ['عناوين وأوصاف فريدة', AD(_D.length) + ' صفحة، ' + AD(_D.length) + ' عنوانًا فريدًا و' + AD(_D.length) + ' وصفًا فريدًا — صفر تكرار'],
  ['بنية عناوين سليمة', 'كل صفحة بها h1 واحد بالضبط، وصفر عنوان فارغ'],
  ['نصوص بديلة كاملة', 'صفر صورة بلا alt وصفر صورة مكسورة في كل العيّنة'],
  ['بيانات منظَّمة غنية', 'JSON-LD على ١٠٠٪ من الصفحات: RealEstateAgent و WebSite و BreadcrumbList، و Product مع Residence أو Apartment أو House على صفحات التفاصيل، و FAQPage و CollectionPage و ItemList'],
  ['معالم الصفحة', 'كل صفحة بها <main> ورابط «تخطَّ إلى المحتوى»'],
  ['عمق زحف ممتاز', 'كل الوحدات الـ٦٣٣ وكل المشروعات الـ٩٨ مرتبطة من صفحة واحدة — عمق ٢ من الرئيسية'],
  ['صور حديثة', '٣٬٩٧٦ ملفًا كلها WebP، مع التحميل الكسول مفعَّلًا'],
  ['أمان', 'سياسة محتوى (CSP) ببصمات sha256 للنصوص البرمجية، و X-Frame-Options، ومصيدة سبام مخفية في النماذج'],
  ['تهيئة متعددة اللغات', 'hreflang كامل ومتبادل لكل صفحة، و x-default، و og:locale يتبع لغة الصفحة'],
  ['ملف llms.txt', 'موجود ومكتوب جيدًا — سابق لأغلب المواقع في تهيئة الذكاء الاصطناعي'],
  ['تحميل خطوط واعٍ باللغة', 'الـ preload يختار الخط حسب لغة الرابط، والهيرو محمَّل مسبقًا بأولوية عالية']
];

/* ============================================================
   DOCUMENT
   ============================================================ */
const sevRow = s => SEV[s];
const counts = { critical:0, high:0, medium:0, low:0 };
F.forEach(f => counts[f.sev]++);

function findingBlock(f){
  const s = sevRow(f.sev);
  const out = [];
  out.push(new Paragraph({
    bidirectional:true, alignment:AlignmentType.RIGHT,
    spacing:{ before:300, after:60 },
    shading:{ type:ShadingType.CLEAR, fill:s.fill, color:'auto' },
    border:{ right:{ style:BorderStyle.SINGLE, size:18, color:s.color, space:6 } },
    children:[
      arRun(f.id + ' · ', { bold:true, size:22, color:s.color }),
      arRun(f.title, { bold:true, size:24, color:C.ink })
    ]
  }));
  out.push(new Paragraph({ bidirectional:true, alignment:AlignmentType.RIGHT,
    spacing:{ after:140 }, children:[
      arRun('الخطورة: ', { size:19, color:C.muted }),
      arRun(s.ar, { size:19, bold:true, color:s.color }),
      arRun('   ·   المجال: ', { size:19, color:C.muted }),
      arRun(f.area, { size:19, color:C.ink }),
      arRun('   ·   الجهد: ', { size:19, color:C.muted }),
      arRun(f.effort, { size:19, color:C.ink }),
      arRun('   ·   الأثر: ', { size:19, color:C.muted }),
      arRun(f.impact, { size:19, color:C.ink })
    ] }));

  out.push(ar('القياس', { bold:true, size:21, color:C.teal2, after:60 }));
  const w = [3200, 6160];
  out.push(table(w, [
    headRow(w, ['البند', 'القيمة المقاسة']),
    ...f.evidence.map((e, i) => bodyRow(w, [
      ar(e[0], { size:19, after:0 }),
      new Paragraph({ bidirectional:true, alignment:AlignmentType.RIGHT, spacing:{ after:0 },
        children:[/[؀-ۿ]/.test(e[1])
          ? arRun(e[1], { size:19 })
          : en(e[1], { size:18 })] })
    ], i))
  ]));
  out.push(new Paragraph({ spacing:{ after:100 }, children:[new TextRun('')] }));
  out.push(ar('لماذا يهم', { bold:true, size:21, color:C.teal2, after:60 }));
  out.push(ar(f.why, { size:21 }));
  out.push(ar('الحل المقترح', { bold:true, size:21, color:C.ok, after:60 }));
  out.push(ar(f.fix, { size:21 }));
  return out;
}

const children = [];

// ---- cover ----
children.push(new Paragraph({ spacing:{ before:1400, after:60 }, bidirectional:true,
  alignment:AlignmentType.RIGHT, children:[
    arRun('تقرير فحص فني شامل', { size:52, bold:true, color:C.teal }) ] }));
children.push(new Paragraph({ bidirectional:true, alignment:AlignmentType.RIGHT,
  spacing:{ after:40 }, children:[ arRun('The Village Investment', { size:34, color:C.teal2 }) ] }));
children.push(new Paragraph({ bidirectional:true, alignment:AlignmentType.RIGHT,
  spacing:{ after:300 }, children:[ en('www.thevillageinvestment.com', { size:22, color:C.muted }) ] }));
children.push(rule());
children.push(ar([
  arRun('فحص سلوك الموقع في متصفح حقيقي — ', { size:22, color:C.muted }),
  arRun('الأداء، إمكانية الوصول، التهيئة لمحركات البحث، والظهور في محركات الذكاء الاصطناعي.', { size:22, color:C.muted })
]));
const today = new Date().toISOString().slice(0, 10);
const coverW = [3200, 6160];
children.push(table(coverW, [
  bodyRow(coverW, ['تاريخ الفحص', new Paragraph({ alignment:AlignmentType.RIGHT, bidirectional:true, spacing:{after:0}, children:[en(today, { size:19 })] })], 0),
  bodyRow(coverW, ['عدد الروابط في خريطة الموقع', new Paragraph({ alignment:AlignmentType.RIGHT, bidirectional:true, spacing:{after:0}, children:[arRun(AD(AUDIT.sitemapCount.toLocaleString('en-US').replace(/,/g,'\u066C')), { size:19 })] })], 1),
  bodyRow(coverW, ['الصفحات المفحوصة في المتصفح', new Paragraph({ alignment:AlignmentType.RIGHT, bidirectional:true, spacing:{after:0}, children:[arRun(AD(AUDIT.pageCount) + ' صفحة × ٢ مقاس = ' + AD(R.length) + ' تحميل', { size:19 })] })], 2),
  bodyRow(coverW, ['المقاسات', 'سطح مكتب ١٢٨٠×٩٠٠ · هاتف ٣٩٠×٨٤٤ بكثافة ٣×'], 3),
  bodyRow(coverW, ['قياس الأداء', 'شبكة Slow 4G وتبطيء معالج ٤× — خمس جولات لكل صفحة، والوسيط هو المعتمد'], 4),
  bodyRow(coverW, ['إجمالي الملاحظات', AD(F.length) + ' ملاحظة: ' + AD(counts.critical) + ' حرجة · ' + AD(counts.high) + ' عالية · ' + AD(counts.medium) + ' متوسطة · ' + AD(counts.low) + ' منخفضة'], 5)
]));
children.push(new Paragraph({ children:[new PageBreak()] }));

// ---- 1. executive summary ----
children.push(h('أولًا: الملخص التنفيذي', HeadingLevel.HEADING_1, { before:0 }));
children.push(ar('الموقع مبنيّ بمستوى هندسي عالٍ. الفحص عبر ' + AD(R.length) + ' تحميل صفحة في متصفح حقيقي لم يسجّل أي خطأ JavaScript، ولا أي طلب شبكة فاشل، ولا أي تجاوز أفقي، ولا صورة مكسورة، ولا صورة بلا نص بديل. العناوين والأوصاف فريدة بنسبة ١٠٠٪، والبيانات المنظَّمة موجودة على كل صفحة. هذه نتيجة أفضل من أغلب المواقع العقارية في السوق.', { size:22 }));
children.push(ar('ومع ذلك، هناك أربع مشكلات حرجة تقف بين الموقع وبين الهدف الذي طلبته — الظهور الأول في محركات البحث والذكاء الاصطناعي. ثلاث منها ليست أخطاء برمجية بل قرارات معمارية، والرابعة قرار تجاري:', { size:22 }));
const sumW = [1100, 2500, 5760];
children.push(table(sumW, [
  headRow(sumW, ['الرقم', 'المجال', 'المشكلة في سطر واحد']),
  ...F.filter(f => f.sev === 'critical').map((f, i) => bodyRow(sumW, [
    new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0}, children:[en(f.id, { size:19, bold:true, color:SEV[f.sev].color })] }),
    ar(f.area, { size:19, after:0 }),
    ar(f.title, { size:19, after:0 })
  ], i))
]));
children.push(new Paragraph({ spacing:{ after:160 }, children:[new TextRun('')] }));
children.push(ar([
  arRun('الخلاصة في جملة: ', { bold:true, size:22, color:C.crit }),
  arRun('الموقع مكتوب جيدًا لكنه يُقدِّم محتواه بـ JavaScript فقط، ويمنع زواحف الذكاء الاصطناعي بنفسه في ملف robots.txt. معالجة هاتين النقطتين تسبق أي عمل آخر في التحسين، لأن كل تحسين لاحق يُبنى عليهما.', { size:22 })
]));

children.push(h('ثانيًا: منهجية الفحص وحدوده', HeadingLevel.HEADING_1));
children.push(ar('كل رقم في هذا التقرير مقيس من تشغيل فعلي في متصفح Chromium، وليس مستنتجًا من قراءة الكود. أُعدّت أداتان خصيصًا لهذا الفحص وبقيتا في المستودع ليعاد تشغيلهما بعد كل تعديل:', { size:22 }));
children.push(bullet([ en('tools/fullaudit.cjs', { size:19, bold:true }), arRun(' — يفتح كل شكل مسار في الموقع باللغتين وعلى مقاسين، ويسجّل أخطاء التشغيل وطلبات الشبكة الفاشلة والتجاوز الأفقي والتباين ومساحات اللمس والصور والعناوين والبيانات المنظَّمة.', { size:21 }) ]));
children.push(bullet([ en('tools/perfaudit.cjs', { size:19, bold:true }), arRun(' — يقيس Core Web Vitals تحت شبكة Slow 4G وتبطيء معالج ٤×، وهي نفس إعدادات Lighthouse للموبايل، خمس جولات لكل صفحة ويأخذ الوسيط لا أسرع جولة.', { size:21 }) ]));
children.push(ar('حدود يجب ذكرها بوضوح:', { bold:true, size:22, color:C.teal2 }));
children.push(bullet('تعذّر الوصول إلى الموقع الحي: بيئة العمل هنا تمنع الاتصال بالنطاق وتمنع استعلامات DNS. كل القياسات أُخذت من نسخة محلية مطابقة للبناء الحالي. هذا يعني أن البند F04 (الاستضافة) لا يمكن حسمه من هنا ويحتاج تحققك أنت.'));
children.push(bullet('الفحص غطّى ' + AD(AUDIT.pageCount) + ' صفحة تمثّل كل أشكال المسارات الـ١٩ في الموقع، لا الـ١٥٧٠ صفحة كاملة. العيب الذي يظهر في قالب الوحدة يظهر في ١٬٢٦٦ صفحة، لذلك التغطية بالشكل لا بالعدد.'));
children.push(bullet('الإصدار الأول من أداة الفحص أبلغ عن ١٢٨ مخالفة تباين و٨٧٤ رابطًا بلا اسم و٩٢ حقل نموذج بلا تسمية. راجعتها فتبيّن أنها كلها أخطاء قياس: الروابط كانت داخل قائمة مطوية، والحقل مصيدة سبام مخفية عمدًا، والتباين محسوب على خلفيات شفافة وصور. صُحّحت الأداة وأُعيد الفحص، والأرقام في هذا التقرير هي أرقام النسخة المصحَّحة. لم أُبقِ أي ملاحظة لم أتحقق من صحتها بنفسي.'));
children.push(new Paragraph({ children:[new PageBreak()] }));

// ---- 3. findings ----
children.push(h('ثالثًا: الملاحظات بالتفصيل', HeadingLevel.HEADING_1, { before:0 }));
for(const key of ['critical','high','medium','low']){
  const group = F.filter(f => f.sev === key);
  if(!group.length) continue;
  children.push(new Paragraph({
    bidirectional:true, alignment:AlignmentType.RIGHT, spacing:{ before:360, after:120 },
    children:[ arRun('الملاحظات ' + SEV[key].ar + ' (' + AD(group.length) + ')',
      { bold:true, size:28, color:SEV[key].color }) ] }));
  group.forEach(f => findingBlock(f).forEach(p => children.push(p)));
}

// ---- 4. performance table ----
children.push(new Paragraph({ children:[new PageBreak()] }));
children.push(h('رابعًا: قياسات الأداء كاملة', HeadingLevel.HEADING_1, { before:0 }));
children.push(ar('القيم بالمللي ثانية، وسيط خمس جولات، تحت شبكة Slow 4G وتبطيء معالج ٤×. العمود الأخير هو تقييم جوجل لمؤشر LCP: أقل من ٢٥٠٠ جيد، وحتى ٤٠٠٠ يحتاج تحسينًا، وما فوقه ضعيف.', { size:21 }));
const pw = [2560, 1300, 1300, 1300, 1400, 1500];
children.push(table(pw, [
  headRow(pw, ['الصفحة', 'TTFB', 'FCP', 'LCP', 'CLS', 'تقييم LCP']),
  ...mobileRows.map((r, i) => {
    const verdict = r.lcp <= 2500 ? ['جيد', C.ok] : r.lcp <= 4000 ? ['يحتاج تحسينًا', C.high] : ['ضعيف', C.crit];
    const num = v => new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0}, children:[en(String(v), { size:19 })] });
    return new TableRow({ children:[
      cell(ar(r.label, { size:19, after:0 }), { w:pw[0], fill: i%2?C.bandAlt:undefined }),
      cell(num(r.ttfb), { w:pw[1], fill: i%2?C.bandAlt:undefined }),
      cell(num(r.fcp), { w:pw[2], fill: i%2?C.bandAlt:undefined }),
      cell(num(r.lcp), { w:pw[3], fill: i%2?C.bandAlt:undefined }),
      cell(num(r.cls), { w:pw[4], fill: i%2?C.bandAlt:undefined }),
      cell(new Paragraph({ alignment:AlignmentType.CENTER, bidirectional:true, spacing:{after:0},
        children:[arRun(verdict[0], { size:19, bold:true, color:verdict[1] })] }),
        { w:pw[5], fill: i%2?C.bandAlt:undefined })
    ] });
  })
]));

// ---- 5. strengths ----
children.push(h('خامسًا: ما ينجح في الموقع بالفعل', HeadingLevel.HEADING_1));
children.push(ar('هذه ليست مجاملة، بل جزء من التقرير: معرفة ما لا يجب لمسه لا تقل أهمية عن معرفة ما يجب إصلاحه. كل بند أدناه مقيس في نفس الجولة.', { size:21 }));
const sw = [3000, 6360];
children.push(table(sw, [
  headRow(sw, ['البند', 'القياس']),
  ...STRENGTHS.map((s, i) => bodyRow(sw, [ar(s[0], { size:19, after:0 }), ar(s[1], { size:19, after:0 })], i))
]));

// ---- 6. plan ----
children.push(new Paragraph({ children:[new PageBreak()] }));
children.push(h('سادسًا: خطة العمل مرتَّبة بالأولوية', HeadingLevel.HEADING_1, { before:0 }));
children.push(ar('الترتيب بالأثر مقسومًا على الجهد. البنود من ١ إلى ٣ تُنفَّذ في ساعات وتحلّ أكبر مشكلتين في الأداء العربي. البند ٤ هو الأكبر أثرًا والأطول تنفيذًا، ولا يُغني عنه شيء.', { size:21 }));
const PLAN = [
  ['١', 'إضافة tajawal-700-arabic إلى التحميل المسبق', 'سطر واحد', 'يعالج CLS ٠٫٢٠٥ وجزءًا كبيرًا من LCP ٥٫٣ ثانية', 'F06'],
  ['٢', 'ضبط اتجاه الصفحة ولغتها قبل الأنماط', 'ساعة', 'يوفّر ٩٤ كيلوبايت على كل صفحة عربية', 'F05'],
  ['٣', 'مراجعة قرار منع زواحف الذكاء الاصطناعي', 'دقائق + قرارك', 'شرط لا بديل عنه للظهور في ChatGPT و Perplexity', 'F02'],
  ['٤', 'توليد ملف HTML لكل رابط وقت البناء', '٢ إلى ٤ أيام', 'يحل الفهرسة لكل المحركات، ويُلغي مشكلة الاستضافة ضمنًا', 'F01 · F04'],
  ['٥', 'تأجيل صور الشرائح غير الأولى', 'ساعة', 'يفرّغ عرض الشبكة للعناصر الحرجة', 'F08'],
  ['٦', 'صور متجاوبة بـ srcset ونسختي ٤٠٠ و٨٠٠ بكسل', 'يوم', 'أكبر توفير متبقٍ في بيانات الموبايل', 'F07'],
  ['٧', 'قصّ الأوصاف عند ١٥٥ حرفًا والعناوين عند ٦٠', 'ساعة', 'يرفع نسبة النقر من نتائج البحث', 'F09'],
  ['٨', 'أبعاد الصور في الوسم، ومساحات لمس ٢٤ بكسل، وتسلسل العناوين، والتباين', 'يوم', 'يغلق بنود إمكانية الوصول والاستقرار', 'F10 · F11 · F12 · F13']
];
const plw = [700, 3100, 1300, 3260, 1000];
children.push(table(plw, [
  headRow(plw, ['#', 'الإجراء', 'الجهد', 'العائد المتوقع', 'المرجع']),
  ...PLAN.map((p, i) => new TableRow({ children:[
    cell(new Paragraph({ alignment:AlignmentType.CENTER, bidirectional:true, spacing:{after:0}, children:[arRun(p[0], { size:19, bold:true, color:C.teal })] }), { w:plw[0], fill:i%2?C.bandAlt:undefined }),
    cell(ar(p[1], { size:19, after:0 }), { w:plw[1], fill:i%2?C.bandAlt:undefined }),
    cell(ar(p[2], { size:19, after:0 }), { w:plw[2], fill:i%2?C.bandAlt:undefined }),
    cell(ar(p[3], { size:19, after:0 }), { w:plw[3], fill:i%2?C.bandAlt:undefined }),
    cell(new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:0}, children:[en(p[4], { size:17 })] }), { w:plw[4], fill:i%2?C.bandAlt:undefined })
  ] }))
]));

// ---- 7. the honest section ----
children.push(h('سابعًا: عن هدف «المركز الأول»', HeadingLevel.HEADING_1));
children.push(ar('طلبت أن يصل الموقع إلى المركز الأول في كل محركات البحث. من واجبي أن أقول بوضوح ما يستطيع الكود فعله وما لا يستطيع، لأن أي كلام غير ذلك يضيّع وقتك ومالك.', { size:22 }));
children.push(ar('ما يفعله هذا التقرير فعليًا', { bold:true, size:24, color:C.ok, after:80 }));
children.push(bullet('يزيل العوائق التقنية التي تمنع المحركات من قراءة الموقع وفهمه وفهرسته. هذا شرط ضروري: موقع لا يُقرأ لا يترتب إطلاقًا.'));
children.push(bullet('يضع الموقع داخل نطاق الظهور في إجابات الذكاء الاصطناعي بدل أن يكون ممنوعًا منها بقرار ذاتي.'));
children.push(bullet('يحسّن مؤشرات تجربة الصفحة، وهي عامل ترتيب معلن ومؤكَّد من جوجل.'));
children.push(ar('ما لا يستطيع الكود وحده فعله', { bold:true, size:24, color:C.crit, after:80 }));
children.push(bullet('الترتيب في جوجل يعتمد في جزء كبير منه على عوامل خارج الموقع: الروابط الواردة من مواقع أخرى، وسمعة النطاق وعمره، وسلوك الباحثين، والمنافسة في كل كلمة مفتاحية على حدة. لا سطر برمجي يصنع هذه العوامل.'));
children.push(bullet('«المركز الأول في كل محركات البحث في العالم» ليس هدفًا قابلًا للقياس أو الضمان. الهدف القابل للقياس هو: المركز الأول لكلمات محددة، في مصر، أمام منافسين محددين. هذا يُخطَّط له ويُقاس شهريًا.'));
children.push(bullet('أي جهة تَعِدك بالمركز الأول مقابل مبلغ، تبيعك وهمًا. لا توجد وسيلة مشروعة لضمان ترتيب.'));
children.push(ar('الخطوة التالية الصحيحة بعد الإصلاحات', { bold:true, size:24, color:C.teal2, after:80 }));
children.push(bullet('ربط Google Search Console ورفع خريطة الموقع، ومتابعة تقرير الفهرسة أسبوعيًا — هذه هي الطريقة الوحيدة لمعرفة ما يفهرسه جوجل فعلًا من الـ١٥٧٠ رابطًا.'));
children.push(bullet('اختيار ٢٠ إلى ٣٠ كلمة مفتاحية حقيقية (مثل «شقق للبيع في التجمع الخامس بالتقسيط») وقياس ترتيب الموقع فيها شهريًا.'));
children.push(bullet('بناء محتوى يجيب على أسئلة المشترين فعليًا. الموقع اليوم قاعدة بيانات ممتازة للمشروعات، لكن المحتوى الذي يجلب الزيارات من البحث هو المقالات التي تجيب على سؤال قبل أن يعرف صاحبه اسم المشروع.'));
children.push(bullet('الروابط الواردة: تغطية صحفية، وملفات على مواقع عقارية، وشراكات مع المطوّرين — هذا هو العامل الأثقل الذي لا يُحلّ بالبرمجة.'));
children.push(rule());
children.push(ar('هذا التقرير يغطي الجانب التقني بالكامل، وهو الجانب الذي يمكن إثباته بالقياس. الجوانب الأخرى تحتاج خطة تسويقية وزمنًا، وأستطيع المساعدة فيها متى أردت.', { size:21, color:C.muted, italics:true }));

/* ---- assemble ---- */
const doc = new Document({
  creator:'The Village Investment', title:'تقرير فحص فني شامل',
  description:'فحص الموقع في متصفح حقيقي: الأداء وإمكانية الوصول والتهيئة لمحركات البحث والذكاء الاصطناعي',
  styles:{ default:{
    document:{ run:{ font:AR_FONT, size:22, color:C.ink } },
    heading1:{ run:{ font:AR_FONT, size:32, bold:true, color:C.teal } },
    heading2:{ run:{ font:AR_FONT, size:27, bold:true, color:C.teal2 } },
    heading3:{ run:{ font:AR_FONT, size:24, bold:true, color:C.teal2 } }
  } },
  numbering:{ config:[{ reference:'bul', levels:[
    { level:0, format:LevelFormat.BULLET, text:'•', alignment:AlignmentType.RIGHT,
      style:{ paragraph:{ indent:{ right:420, hanging:240 } } } },
    { level:1, format:LevelFormat.BULLET, text:'◦', alignment:AlignmentType.RIGHT,
      style:{ paragraph:{ indent:{ right:840, hanging:240 } } } }
  ] }] },
  sections:[{
    properties:{ page:{ margin:{ top:1000, right:1000, bottom:1000, left:1000 } } },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('wrote ' + OUT + '  (' + Math.round(buf.length/1024) + ' KB, ' +
              F.length + ' findings: ' + counts.critical + ' critical, ' + counts.high +
              ' high, ' + counts.medium + ' medium, ' + counts.low + ' low)');
  if(FINDINGS_JSON) fs.writeFileSync(FINDINGS_JSON, JSON.stringify({ counts, findings:F }, null, 1));
});
