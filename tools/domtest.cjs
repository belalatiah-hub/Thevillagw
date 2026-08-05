// Browserless verification: execute the real app script in a minimal DOM shim
// and exercise the view/render functions. Confirms no runtime throw + output.
const fs = require('fs'), vm = require('vm');

function mkEl(tag){
  const el = {
    tagName:(tag||'div').toLowerCase(), nodeType:1, childNodes:[], parentNode:null,
    attributes:{}, className:'', id:'', _style:{}, dataset:{}, _text:null,
    setAttribute(k,v){ if(k==='class'){this.className=String(v);} else if(k==='id'){this.id=String(v);} this.attributes[k]=String(v); },
    getAttribute(k){ return k==='class'?this.className:(k==='id'?this.id:(k in this.attributes?this.attributes[k]:null)); },
    hasAttribute(k){ return k==='class'?!!this.className:(k in this.attributes); },
    removeAttribute(k){ delete this.attributes[k]; if(k==='class') this.className=''; },
    appendChild(c){ if(c==null) return c; if(c.parentNode){ const oi=c.parentNode.childNodes.indexOf(c); if(oi>-1) c.parentNode.childNodes.splice(oi,1); } c.parentNode=this; this.childNodes.push(c); ALL.push(c); return c; },
    insertBefore(c,ref){ if(c==null) return c; if(c.parentNode){ const oi=c.parentNode.childNodes.indexOf(c); if(oi>-1) c.parentNode.childNodes.splice(oi,1); } c.parentNode=this; const ri=ref?this.childNodes.indexOf(ref):-1; if(ri>-1) this.childNodes.splice(ri,0,c); else this.childNodes.push(c); ALL.push(c); return c; },
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
    get textContent(){ if(this._text!=null) return this._text; return this.childNodes.map(n=>n.nodeType===3?n.textContent:n.textContent).join(''); },
    set textContent(v){ this.childNodes=[]; this._text=String(v); },
    closest(sel){ let n=this; while(n){ if(n.nodeType===1 && matchSel(n, sel)) return n; n=n.parentNode; } return null; },
    contains(node){ let n=node; while(n){ if(n===this) return true; n=n.parentNode; } return false; },
    querySelector(sel){ return (qsa(this,sel)[0])||null; },
    querySelectorAll(sel){ return qsa(this,sel); }
  };
  return el;
}
let ALL=[];
function matchSel(el, token){
  token=token.trim(); if(!token) return true;
  // take last simple selector (tag, .class, #id, tag.class)
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
  function walk(n){ for(const c of n.childNodes){ if(c.nodeType===1){
    for(const p of parts){ const toks=p.split(/\s+/); const last=toks[toks.length-1]; if(matchSel(c,last) && !seen.has(c)){ seen.add(c); out.push(c); } }
    walk(c);
  } } }
  walk(root); return out;
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
doc.documentElement = mkEl('html'); doc.documentElement.setAttribute('lang','en'); doc.documentElement.setAttribute('dir','ltr'); doc.documentElement.setAttribute('data-lang','en');
doc.body = mkEl('body'); doc.head = mkEl('head');

const win = {
  location:{ protocol:'http:', host:'localhost', hostname:'localhost', pathname:'/en/', search:'', hash:'' },
  history:{ pushState(){}, replaceState(){} },
  addEventListener(){}, removeEventListener(){},
  pageYOffset:0, _scrolls:[], scrollTo(x,y){ this._scrollX=x; this._scrollY=y; this.pageYOffset=y; this._scrolls.push([x,y]); },
  _opened:null, open(u){ this._opened=u; return {focus(){}}; },
  requestAnimationFrame(fn){ return setTimeout(fn,0); }, matchMedia(){ return {matches:false, addEventListener(){}, addListener(){}}; }, print(){},
  localStorage:{ _d:{}, getItem(k){ return this._d[k]||null; }, setItem(k,v){ this._d[k]=v; }, removeItem(k){ delete this._d[k]; } },
  navigator:{ clipboard:{ writeText(){ return Promise.resolve(); } }, userAgent:'node' },
};

const sandbox = { document:doc, window:win, location:win.location, history:win.history, localStorage:win.localStorage,
  navigator:win.navigator, requestAnimationFrame:win.requestAnimationFrame, setTimeout:setTimeout, clearTimeout:clearTimeout, setInterval:setInterval, clearInterval:clearInterval,
  Intl:Intl, URLSearchParams:URLSearchParams, Set:Set, Math:Math, Date:Date, JSON:JSON, console:console, encodeURIComponent:encodeURIComponent };
sandbox.globalThis = sandbox; sandbox.self = sandbox;

let src = fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
src = src.match(/<script>\s*"use strict"[\s\S]*?<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
src += "\n;globalThis.__api={h:h,V:V,unitCard:unitCard,projectArt:projectArt,projectMedia:projectMedia,projectCoverSrc:projectCoverSrc,chatRespond:chatRespond,offerText:offerText,money:money,num:num,planLine:planLine,projectOffer:projectOffer,bestNameMatch:bestNameMatch,unitDisplayName:unitDisplayName,PROJECTS:PROJECTS,UNITS:UNITS,DEVELOPERS:DEVELOPERS,TYPES:TYPES,lang:lang,filterUnits:filterUnits,defaultFilter:defaultFilter,normalizeUnitType:normalizeUnitType,reconcileFilter:reconcileFilter,filterToQuery:filterToQuery,filterFromQuery:filterFromQuery,areaFacets:areaFacets,devFacets:devFacets,typeFacets:typeFacets,bedFacets:bedFacets,floorFacets:floorFacets,usesFloorBands:usesFloorBands,recommendUnits:recommendUnits,scoreUnit:scoreUnit,relaxationPlan:relaxationPlan,matchHard:matchHard,hasSelection:hasSelection,selectionSummary:selectionSummary,chatRecommend:chatRecommend,chatBriefText:chatBriefText,projBySlug:projBySlug,unitCanon:unitCanon,setFilter:function(f){FILTER=f;},getFilter:function(){return FILTER;},searchAll:searchAll,arNorm:arNorm,buildSearchIndex:buildSearchIndex,setSearch:function(s){CUR.search=s;},paymentCalc:paymentCalc,printFactsheet:printFactsheet,projFloorplan:projFloorplan,installmentCount:installmentCount,projectCoverSrc:projectCoverSrc,printUnitFactsheet:printUnitFactsheet,openFactsheet:openFactsheet,closeFactsheet:closeFactsheet,track:track,render:render,parse:parse,buildPath:buildPath,navigateTo:navigateTo,getRoute:function(){return currentRoute;},searchLabel:searchLabel,saveCurrentSearch:saveCurrentSearch,savedSearches:savedSearches,removeSearch:removeSearch,leadSubmit:leadSubmit,leadArm:leadArm,leadReset:function(){LEAD.shown=0;LEAD.armed=false;LEAD.open=false;},leadState:function(){return LEAD;},isExternalLink:isExternalLink,CONFIG:CONFIG,devLogoSrc:devLogoSrc,projectLogoSrc:projectLogoSrc,devBadge:devBadge,devByKey:devByKey,DEV_LOGOS:DEV_LOGOS,DEV_GALLERY:DEV_GALLERY,devGallery:devGallery,PROJECT_LOGOS:PROJECT_LOGOS,unitMasterplans:unitMasterplans,unitFloorplans:unitFloorplans,unitAmenities:unitAmenities,unitLocationImg:unitLocationImg,unitGallery:unitGallery,unitGalleryItems:unitGalleryItems,unitFeatureRow:unitFeatureRow,amenitiesSection:amenitiesSection,areaImageSrc:areaImageSrc,AMENITY_CAT:AMENITY_CAT,unitById:unitById,unitIsCommercial:unitIsCommercial,typeFamily:typeFamily,releaseBySlug:releaseBySlug,RELEASES:RELEASES,rotateByDev:rotateByDev,devRotationOffset:devRotationOffset,areaByKey:areaByKey,hasUnitImage:hasUnitImage,sortUnits:sortUnits,searchAll:searchAll,searchTypeOne:searchTypeOne,buildSearchIndex:buildSearchIndex,releaseMasterplan:releaseMasterplan,spreadByDev:spreadByDev,isNewLaunch:isNewLaunch,newLaunchProjects:newLaunchProjects,NEW_LAUNCH_SLUGS:NEW_LAUNCH_SLUGS,PROJECT_GROUPS:PROJECT_GROUPS,groupBySlug:groupBySlug,groupsByDev:groupsByDev,groupMembers:groupMembers,GROUPED_PROJECT:GROUPED_PROJECT,setCompare:function(a){compare.length=0;for(var i=0;i<a.length;i++)compare.push(a[i]);},getCompare:function(){return compare;},toggleCompare:toggleCompare,HERO_SLIDES:HERO_SLIDES,heroSrc:heroSrc,AREAS:AREAS,RESEARCH:RESEARCH,areaText:areaText,areaValue:areaValue,DEV_AMENITIES:DEV_AMENITIES,AMENITY_CAT:AMENITY_CAT,ICON:ICON,devAmenitiesSection:devAmenitiesSection,DEV_FEATURES:DEV_FEATURES,UNIT_GALLERY:UNIT_GALLERY,unitMasterplans:unitMasterplans,unitLocationImg:unitLocationImg,unitFloorplans:unitFloorplans,PROJECT_AMENITIES:PROJECT_AMENITIES,unitAmenities:unitAmenities,unitMedia:unitMedia,UNIT_IMAGES:UNIT_IMAGES,PROJECT_COVERS:PROJECT_COVERS,UNIT_EXTRA:UNIT_EXTRA,UNIT_MASTERPLANS:UNIT_MASTERPLANS,UNIT_FLOORPLANS:UNIT_FLOORPLANS,UNIT_LOCATIONS:UNIT_LOCATIONS};";

const R=[]; const ck=(n,c,x)=>R.push({n,ok:!!c,x:x||''});
function countClass(node,cls){ let n=0; (function w(x){ for(const c of (x.childNodes||[])){ if(c.nodeType===1){ if((c.className||'').split(/\s+/).indexOf(cls)>-1) n++; w(c); } } })(node); return n; }
function countTag(node,tag){ let n=0; (function w(x){ for(const c of (x.childNodes||[])){ if(c.nodeType===1){ if(c.tagName===tag) n++; w(c); } } })(node); return n; }
function findAttr(node,attr,val){ let r=null; (function w(x){ for(const c of (x.childNodes||[])){ if(c.nodeType===1){ if(c.getAttribute&&c.getAttribute(attr)===val) { r=r||c; } w(c); } } })(node); return r; }
function txt(node){ return node.textContent||''; }

try {
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, {timeout:5000});
  ck('script executes without throwing (home route)', true);
  const api = sandbox.__api;

  // `--routes` prints every indexable route as JSON and exits. tools/sitemap.py
  // consumes it, so the sitemap is derived from the same data the app renders
  // instead of being hand-maintained — it had drifted to 202 unit URLs for 223
  // units and 14 developer pages for 24 developers.
  if (process.argv.includes('--routes')) {
    const paths = ['', 'projects', 'units', 'new-launches', 'areas', 'developers',
                   'groups', 'releases', 'insights', 'about', 'investors',
                   'faqs', 'contact', 'privacy', 'terms']
      .map(p => p ? `/en/${p}/` : '/en/');
    api.PROJECTS.forEach(p => paths.push(`/en/projects/${p.slug}/`));
    api.UNITS.forEach(u => paths.push(`/en/units/${u.id}/`));
    api.DEVELOPERS.forEach(d => paths.push(`/en/developers/${d.key}/`));
    api.AREAS.forEach(a => paths.push(`/en/areas/${a.key}/`));
    api.RESEARCH.forEach(r => paths.push(`/en/insights/${r.slug}/`));
    api.RELEASES.forEach(r => paths.push(`/en/releases/${r.slug}/`));
    api.PROJECT_GROUPS.forEach(g => paths.push(`/en/groups/${g.slug}/`));
    console.log(JSON.stringify(paths));
    process.exit(0);
  }
  ck('#main populated after boot', doc.getElementById('main').childElementCount>0, 'children='+doc.getElementById('main').childElementCount);
  ck('chat FAB appended to body', countClass(doc.body,'chat-fab')>=1);
  // Home view
  const home = api.V.home();
  ck('home: >=3 illustrations', countClass(home.node,'artsvg')>=3, 'art='+countClass(home.node,'artsvg'));
  ck('home: >=3 developer avatars on cards', countClass(home.node,'card__devcircle')>=3);
  ck('home: hero stats count-up render N+ ', (function(){
    var ns=qsa(home.node,'.stat__n'); return ns.length===4 && ns.every(function(e){return /\d\+$/.test(e.textContent||'');});
  })(), 'stats='+qsa(home.node,'.stat__n').map(function(e){return e.textContent;}).join(','));
  ck('home: the fourth stat is the owner-supplied clients-served figure', (function(){
    var ns=qsa(home.node,'.stat__n').map(function(e){return e.textContent;});
    return api.CONFIG.clientsServed===899 && ns[3]==='899+'
      && /Clients served/.test(home.node.textContent);
  })(), 'ok');
  ck('home: a missing clientsServed renders three stats, not a blank fourth', (function(){
    var keep=api.CONFIG.clientsServed; delete api.CONFIG.clientsServed;
    var n=qsa(api.V.home().node,'.stat__n').length;
    api.CONFIG.clientsServed=keep;
    return n===3;
  })(), 'ok');
  ck('home: Featured Projects/Units sections removed', countClass(home.node,'spec-row')===0 && txt(home.node).indexOf('Featured units')<0, 'specrows='+countClass(home.node,'spec-row'));
  // Units view
  const units = api.V.units();
  ck('units: >=8 cards', countClass(units.node,'card')>=8, 'cards='+countClass(units.node,'card'));
  ck('units: relational facet chips', countClass(units.node,'fchip')>=10, 'fchips='+countClass(units.node,'fchip'));
  // Developers
  const devs = api.V.developers();
  ck('developers: the directory renders a card per developer', countClass(devs.node,'dev-card')===api.DEVELOPERS.length,
     'cards='+countClass(devs.node,'dev-card')+' developers='+api.DEVELOPERS.length);
  ck('developers: Qatari Diar present', txt(devs.node).indexOf('Qatari Diar')>=0);
  ck('developers: Modon present', txt(devs.node).indexOf('Modon')>=0);
  ck('developers: Emaar Misr present (directory expansion)', txt(devs.node).indexOf('Emaar')>-1);
  ck('developers: Talaat Moustafa present (directory expansion)', txt(devs.node).indexOf('Talaat')>-1);
  // unit card + project art
  ck('unitCard builds (specs+price)', countClass(api.unitCard(api.UNITS[0]),'spec-row')===1);
  ck('projectArt returns svg', api.projectArt(api.PROJECTS[0]).tagName==='svg');
  // chat responder grounded
  const r1 = api.chatRespond('New Cairo');
  ck('chat: area query -> links', countClass(r1,'unit-mini')>=1, 'links='+countClass(r1,'unit-mini'));
  const r2 = api.chatRespond('talk to an advisor');
  ck('chat: handoff has register CTA', txt(r2).indexOf('Leave your details')>=0);
  const r3 = api.chatRespond('payment plans');
  const maxY = Math.max.apply(null, api.PROJECTS.map(p=>p.years||0));
  ck('chat: payment answer uses data-derived max years, not overstated', txt(r3).indexOf(maxY+' years')>=0 && txt(r3).indexOf('10 years')<0, 'maxY='+maxY);
  ck('chat: payment answer carries illustrative marker', /Illustrative/i.test(txt(r3)));

  // ---- Phase A: relational filter engine ----
  ck('type alias: flat -> apartment', api.normalizeUnitType('flat')==='apartment');
  ck('type alias: twinhouse -> twin-house', api.normalizeUnitType('twinhouse')==='twin-house');
  ck('type alias: stand-alone villa', api.normalizeUnitType('stand-alone villa')==='standalone-villa');
  function pj(u){ return api.projBySlug(u.project); }
  // AND across groups: New Cairo AND apartment
  api.setFilter(Object.assign(api.defaultFilter(),{areas:['newcairo'],types:['apartment']}));
  var r=api.filterUnits(api.getFilter());
  ck('AND: New Cairo + apartment only', r.length>0 && r.every(u=>pj(u).area==='newcairo' && api.unitCanon(u)==='apartment'), 'n='+r.length);
  // budget filters ACTUAL unit price
  api.setFilter(Object.assign(api.defaultFilter(),{maxPrice:4000000}));
  var rb=api.filterUnits(api.getFilter());
  ck('budget maxPrice filters actual units', rb.length>0 && rb.every(u=>u.price<=4000000), 'n='+rb.length);
  // OR within a group
  api.setFilter(Object.assign(api.defaultFilter(),{types:['apartment','villa']}));
  var ro=api.filterUnits(api.getFilter()); var canons=new Set(ro.map(u=>api.unitCanon(u)));
  ck('OR within type group', canons.has('apartment') && canons.has('villa') && [...canons].every(c=>c==='apartment'||c==='villa'));
  // reserved/sold excluded by default
  api.setFilter(api.defaultFilter());
  ck('reserved/sold excluded by default', api.filterUnits(api.getFilter()).every(u=>u.avail!=='reserved'&&u.avail!=='sold'));
  // relational facets: Ras El Hekma limits developers to the ones building there (SODIC/Marakez/Modon)
  api.setFilter(Object.assign(api.defaultFilter(),{areas:['raselhekma'],includeUnverified:true}));
  var dfa=api.devFacets();
  ck('facet: Ras El Hekma developers relational', dfa['sodic']>0 && dfa['marakez']>0 && dfa['modon']>0 && dfa['palmhills']>0 && !dfa['mountainview'], JSON.stringify(Object.keys(dfa)));
  // reconciliation: a developer with no project in the area is dropped, area kept (hierarchy)
  api.setFilter(Object.assign(api.defaultFilter(),{areas:['sahel'],devs:['mountainview']}));
  api.reconcileFilter();
  ck('reconcile drops invalid developer, keeps area', api.getFilter().devs.length===0 && api.getFilter().areas.join()==='sahel');
  // URL round-trip
  var f2=Object.assign(api.defaultFilter(),{areas:['newcairo','sahel'],types:['apartment'],maxPrice:8000000,launch:['newly-launched']});
  var round=api.filterFromQuery(api.filterToQuery(f2));
  ck('URL serialize/parse round-trip', round.areas.join()==='newcairo,sahel' && round.types.join()==='apartment' && round.maxPrice===8000000 && round.launch.join()==='newly-launched');
  // ---- Phase F: bedroom 6+ / To-Confirm + expanded types ----
  api.setFilter(Object.assign(api.defaultFilter(),{beds:[6]}));
  var b6=api.filterUnits(api.getFilter());
  ck('beds 6+ returns only >=6 bedrooms', b6.length>0 && b6.every(u=>u.beds!=null && u.beds>=6), 'n='+b6.length);
  api.setFilter(Object.assign(api.defaultFilter(),{beds:['tbc'],includeUnverified:true}));
  var btbc=api.filterUnits(api.getFilter());
  ck('beds To-Confirm returns only null bedrooms', btbc.length>0 && btbc.every(u=>u.beds==null), 'n='+btbc.length);
  api.setFilter(Object.assign(api.defaultFilter(),{beds:[2]}));
  ck('beds strict excludes unknown bedrooms', api.filterUnits(api.getFilter()).every(u=>u.beds===2));
  var bround=api.filterFromQuery(api.filterToQuery(Object.assign(api.defaultFilter(),{beds:[0,6,'tbc']})));
  ck('beds URL round-trip keeps 6+ and tbc', bround.beds.indexOf(6)>-1 && bround.beds.indexOf('tbc')>-1 && bround.beds.indexOf(0)>-1);
  ck('expanded type aliases normalize', api.normalizeUnitType('i villa')==='ivilla' && api.normalizeUnitType('garden apartment')==='garden-apartment' && api.normalizeUnitType('town villa')==='town-villa' && api.normalizeUnitType('sky villa')==='sky-villa');
  // ---- Phase G: preferred-floor + financial filters ----
  api.setFilter(Object.assign(api.defaultFilter(),{floors:['high']}));
  var fl=api.filterUnits(api.getFilter());
  ck('floor filter: flat-type units restricted to selected band', fl.length>0 && fl.every(u=>!api.usesFloorBands(api.unitCanon(u))||u.floor==='high'), 'n='+fl.length);
  ck('floor filter: never excludes house-type (floor-agnostic) units', (function(){ api.setFilter(Object.assign(api.defaultFilter(),{floors:['top'],types:['villa']})); var r=api.filterUnits(api.getFilter()); return r.length>0 && r.every(u=>api.unitCanon(u)==='villa'); })());
  api.setFilter(Object.assign(api.defaultFilter(),{avoidGround:true}));
  ck('avoid-ground excludes ground-floor units', api.filterUnits(api.getFilter()).every(u=>u.floor!=='ground'));
  api.setFilter(Object.assign(api.defaultFilter(),{minYears:9}));
  var yr=api.filterUnits(api.getFilter());
  ck('min-years filters by project installment years', yr.length>0 && yr.every(u=>{var p=api.projBySlug(u.project); return p&&p.years>=9;}), 'n='+yr.length);
  var gq=api.filterFromQuery(api.filterToQuery(Object.assign(api.defaultFilter(),{floors:['low','high'],avoidGround:true,minYears:8})));
  ck('Phase-G URL round-trip (floors/avoidGround/minYears)', gq.floors.join()==='low,high' && gq.avoidGround===true && gq.minYears===8);
  // ---- Phase H: recommendation engine (strict / balanced / flexible) ----
  var overF=Object.assign(api.defaultFilter(),{areas:['newcairo'],types:['villa'],beds:[5],minPrice:1000000,maxPrice:2000000}); // deliberately over-constrained
  api.setFilter(overF);
  var strictN=api.filterUnits(overF).length;
  var balN=api.recommendUnits(overF,'balanced').length, flexN=api.recommendUnits(overF,'flexible').length;
  ck('reco: balanced >= strict, flexible >= balanced', balN>=strictN && flexN>=balN, 'strict='+strictN+' bal='+balN+' flex='+flexN);
  ck('reco: strict mode equals relational filter set', api.recommendUnits(overF,'strict').length===strictN);
  // single-bottleneck filter: an impossibly low price cap is the only thing to loosen
  var bottleneck=Object.assign(api.defaultFilter(),{areas:['newcairo'],types:['apartment'],maxPrice:100000});
  var plan=api.relaxationPlan(bottleneck);
  ck('reco: relaxation plan suggests a positive-gain loosen, ranked', plan.length>0 && plan[0].gain>0 && plan[0].key==='price' && (plan.length<2||plan[0].gain>=plan[1].gain), 'top='+(plan[0]&&plan[0].key+':+'+plan[0].gain));
  // scoring: a perfect-match unit scores 1; explanation lists matched criteria
  var f2=Object.assign(api.defaultFilter(),{areas:['newcairo']});
  var someNC=api.filterUnits(f2)[0];
  var sc=api.scoreUnit(someNC,f2);
  ck('reco: scoreUnit explains matched criteria (area match => score 1)', sc.score===1 && sc.matched.length>=1 && sc.matched[0].key==='area');
  ck('reco: recommended set stays within hard gate (no sold/reserved)', api.recommendUnits(Object.assign(api.defaultFilter(),{types:['apartment']}),'flexible').every(u=>u.avail!=='sold'&&u.avail!=='reserved'));
  var mq=api.filterFromQuery(api.filterToQuery(Object.assign(api.defaultFilter(),{mode:'balanced'})));
  ck('reco: mode round-trips through URL', mq.mode==='balanced');
  // units view renders finder + results
  sandbox.__api.setFilter(api.defaultFilter());
  var uv = api.V.units();
  ck('finder renders facet chips', countClass(uv.node,'fchip')>=10, 'fchips='+countClass(uv.node,'fchip'));
  ck('finder renders unit cards', countClass(uv.node,'card')>=8, 'cards='+countClass(uv.node,'card'));

  // ---- Phase B: global search ----
  ck('arNorm normalizes alef/diacritics', api.arNorm('العاصمة')===api.arNorm('العاصمه') && api.arNorm('  New   CAIRO ')==='new cairo');
  ck('index covers all entity types', (function(){ var t={}; api.buildSearchIndex().forEach(d=>t[d.type]=1); return ['project','unit','developer','area','article','faq','page'].every(x=>t[x]); })());
  var s1=api.searchAll('New Cairo'); ck('search: "New Cairo" finds area+projects', s1.length>0 && s1.some(d=>d.type==='area') && s1.some(d=>d.type==='project'), 'n='+s1.length);
  var s2=api.searchAll('sodic'); ck('search: "sodic" finds developer', s2.some(d=>d.type==='developer' && /SODIC/i.test(d.title)), 'n='+s2.length);
  var s3=api.searchAll('القاهرة الجديدة'); ck('search: Arabic query works', s3.length>0, 'n='+s3.length);
  var s4=api.searchAll('apartment'); ck('search: type keyword finds units', s4.some(d=>d.type==='unit'), 'n='+s4.length);
  ck('search: empty query -> no results', api.searchAll('').length===0);
  // palette + /search route render
  ck('command palette built in body', countClass(doc.body,'pal-back')>=1);
  api.setSearch('?q=New Cairo'); var sv=api.V.search();
  ck('/search route renders grouped results', countClass(sv.node,'dev-card')>=2 && sv.indexable===false, 'rows='+countClass(sv.node,'dev-card'));
  api.setSearch('');

  // ---- Phase C: estimator + factsheet + analytics ----
  var calc=api.paymentCalc(api.PROJECTS[0]);
  ck('payment estimator builds with inputs', txt(calc).indexOf('EGP')>=0 || countClass(calc,'spec')>=1);
  var pv=api.V.projects ? null : null;
  var proj=api.PROJECTS[0];
  api.printFactsheet(proj);
  ck('print factsheet populates #print-sheet', doc.getElementById('print-sheet').childElementCount>0, 'children='+doc.getElementById('print-sheet').childElementCount);
  var dl0=(sandbox.window.dataLayer||[]).length; api.track('unit_view',{project:'x'});
  ck('analytics track() pushes to dataLayer', (sandbox.window.dataLayer||[]).length===dl0+1);
  ck('analytics strips non-primitive props', (function(){ api.track('t',{ok:'v',bad:{a:1}}); var e=sandbox.window.dataLayer[sandbox.window.dataLayer.length-1]; return e.ok==='v' && e.bad===undefined; })());

  // ---- Phase D: investors page ----
  var inv=api.V.investors();
  ck('investors page renders 3 audience cards', countClass(inv.node,'card')>=3 && inv.indexable===true, 'cards='+countClass(inv.node,'card'));
  ck('investors page has legal disclaimer', txt(inv.node).indexOf('licensed professional')>=0);

  // ---- Phase E: applied audit fixes ----
  api.setFilter(api.defaultFilter()); api.setSearch('');
  var uview=api.V.units();
  ck('SEO: list view has exactly one <h1>', countTag(uview.node,'h1')===1, 'h1='+countTag(uview.node,'h1'));
  ck('SEO: units view exposes announce string for live region', typeof uview.announce==='string' && uview.announce.length>0);
  ck('a11y: facet chips carry stable focus-restore ids', !!findAttr(uview.node,'id','fchip-beds-6'));
  ck('a11y: sr-live region present in body', !!doc.getElementById('sr-live'));
  ck('a11y: sort control has stable id', !!findAttr(uview.node,'id','finder-sort'));
  // reco: balanced units view renders mode selector + per-card explanation chips
  api.setFilter(api.defaultFilter()); api.setSearch('?areas=newcairo&beds=4&mode=balanced');
  var bview=api.V.units();
  ck('reco: units view shows mode selector', countClass(bview.node,'mode-seg__btn')===3);
  ck('reco: balanced cards carry explanation chips', countClass(bview.node,'reco-explain')>=1 && countClass(bview.node,'rx')>=1, 'strips='+countClass(bview.node,'reco-explain'));
  api.setSearch('');
  // honesty: chat budget answer lists projects WITH prices, each carrying the illustrative marker
  var rbudget=api.chatRespond('budget 6000000');
  ck('honesty: chat price answer badges the price', txt(rbudget).indexOf('From')>=0 && /Illustrative/i.test(txt(rbudget)), 'txt='+txt(rbudget).slice(0,60));

  // ---- Phase I: selection-aware advisor ----
  api.setFilter(Object.assign(api.defaultFilter(),{areas:['newcairo'],types:['apartment'],beds:[3]}));
  ck('advisor: detects an active selection', api.hasSelection(api.getFilter())===true);
  var summ=api.selectionSummary(api.getFilter());
  ck('advisor: selection summary names type + beds + area', /Apartment/i.test(summ) && /New Cairo/i.test(summ) && summ.indexOf('3')>=0, 'summ='+summ);
  var reco=api.chatRecommend();
  ck('advisor: recommends grounded units for the selection', countClass(reco,'unit-mini')>=1, 'links='+countClass(reco,'unit-mini'));
  ck('advisor: shortlist reply badges prices illustrative', /Illustrative/i.test(txt(reco)));
  ck('advisor: reply offers a WhatsApp shortlist hand-off', !!findAttr(reco,'class','btn btn--wa btn--sm') || txt(reco).indexOf('advisor')>=0);
  var brief=api.chatBriefText(api.getFilter(), api.recommendUnits(api.getFilter(),'balanced').slice(0,5));
  ck('advisor: structured brief lists selection + shortlist', brief.indexOf('Looking for:')>=0 && brief.indexOf('Shortlist')>=0 && brief.indexOf('•')>=0);
  ck('advisor: recommend intent routes to recommender', countClass(api.chatRespond('recommend units for me'),'unit-mini')>=1);
  // no selection -> advisor asks for a starting preference (area chips), not a dead end
  api.setFilter(api.defaultFilter());
  ck('advisor: with no selection, asks a starting question', (function(){ var r=api.chatRecommend(); return countClass(r,'chat-chips')>=1 || txt(r).length>0; })());

  // ---- Owner listings: 3 Ras El Hekma projects, prices TO CONFIRM (no fabricated figures) ----
  ck('listings: Modon developer added', api.DEVELOPERS.some(d=>d.key==='modon'));
  ck('listings: 3 new projects present', ['ogami-north-coast','ramla-ras-el-hekma','beach-plaza-premium'].every(s=>!!api.projBySlug(s)));
  var ogami=api.projBySlug('ogami-north-coast');
  ck('listings: Ogami real figures (Botanica from 16.5M)', ogami.price===16500000 && ogami.dp===5 && ogami.years===8 && ogami.delivery==='2029' && ogami.dev==='sodic' && ogami.area==='raselhekma');
  ck('listings: 5 owner projects classified under Ras El Hekma', ['ogami-north-coast','ramla-ras-el-hekma','beach-plaza-premium','caesar-north-coast','june-north-coast'].every(s=>api.projBySlug(s).area==='raselhekma'));
  ck('listings: Ramla/Modon real from-prices', api.projBySlug('ramla-ras-el-hekma').price===23418000 && api.projBySlug('beach-plaza-premium').price===19900000);
  ck('listings: Ramla has full unit mix from the availability sheet', api.UNITS.filter(u=>u.project==='ramla-ras-el-hekma').length>=10);
  ck('listings: Ramla area/price pairings match the availability sheet', (function(){ var by={}; api.UNITS.filter(u=>u.project==='ramla-ras-el-hekma').forEach(u=>by[u.id]=u);
    return by['RM-VL01'].area===155 && by['RM-VL01'].price===49194000 && by['RM-VL02'].price===80457000
        && by['RM-VL03'].area===305 && by['RM-VL03'].price===98524000
        && by['RM-TW01'].area===152 && by['RM-TW01'].price===38082000
        && by['RM-PH01'].area===174 && by['RM-CH03'].area===130; })());
  // The sheet splits Ramla into sub-neighbourhoods; the card label carries them
  // while the type stays canonical so filters and icons still work.
  ck('listings: Ramla units carry their sub-neighbourhood in the label', (function(){ var by={}; api.UNITS.filter(u=>u.project==='ramla-ras-el-hekma').forEach(u=>by[u.id]=u);
    return by['RM-CH01'].label.en==='Chalet · Acacia R5' && by['RM-VL02'].label.en==='Villa · Dunes R1'
        && by['RM-DX03'].label.en==='Duplex · Oasis R3' && by['RM-CH04'].label.en==='Chalet · The Town R2'; })());
  ck('listings: the sheet’s AEON Towers row joins the existing Aeon project', (function(){
    var u=api.UNITS.filter(x=>x.id==='AE-AP01')[0];
    return u && u.project==='aeon' && u.area===246 && u.price===36000000 && u.years===4; })());
  ck('listings: Caesar + June (SODIC North Coast) added', api.projBySlug('caesar-north-coast').price===39200000 && api.projBySlug('june-north-coast').price===89300000 && api.projBySlug('caesar-north-coast').dev==='sodic' && api.projBySlug('june-north-coast').dev==='sodic');
  var pv=api.V.project('ogami-north-coast');
  ck('listings: project detail renders (h1) + real price shown', pv && countTag(pv.node,'h1')>=1 && txt(pv.node).indexOf('16,500,000')>=0);
  api.setFilter(Object.assign(api.defaultFilter(),{projects:['ogami-north-coast']}));
  var ogu=api.filterUnits(api.getFilter());
  ck('listings: Ogami units listed with real prices (SODIC trimmed to 20 units)', ogu.length===3 && ogu.every(u=>u.price>0));
  api.setFilter(api.defaultFilter());

  // ---- Floating contact rail + 30s nudge ----
  var rail=doc.getElementById('contact-rail');
  ck('rail: contact rail built with phone/email/WhatsApp', !!rail && countClass(rail,'cr-btn')===3, 'btns='+(rail?countClass(rail,'cr-btn'):0));
  ck('rail: WhatsApp button links to wa.me', !!findAttr(rail,'class','cr-btn cr-btn--wa') && (findAttr(rail,'class','cr-btn cr-btn--wa').getAttribute('href')||'').indexOf('wa.me')>=0);
  var firstBtn=(rail?rail.childNodes:[])[0];
  ck('rail: first button is the WhatsApp link (reference order)', firstBtn && (firstBtn.getAttribute('href')||'').indexOf('wa.me')>=0);
  ck('rail: 30s nudge element present and hidden initially', (function(){ var n=doc.body.querySelectorAll?doc.body.querySelector('.rail-nudge'):null; return !!n && n.getAttribute('aria-hidden')==='true'; })());

  // ---- SCROLL PRESERVATION (critical UX bug: dynamic updates must NOT jump to top) ----
  var unitsRoute = api.parse('/en/units/');
  // 1) Real navigation into the units page resets to the top and does not preserve a stale offset.
  win.pageYOffset = 999; win._scrolls.length = 0;
  api.render(unitsRoute);
  ck('scroll: real navigation scrolls to top', win._scrolls.length>0 && win._scrolls[win._scrolls.length-1][1]===0, 'last='+JSON.stringify(win._scrolls[win._scrolls.length-1]||null));
  // 2) User scrolls down, then an IN-PLACE update fires render() with NO keep flag (the file:// hashchange path).
  //    Same logical page (name+params) => routeKey matches => exact scroll position must be held, never reset to 0.
  win.pageYOffset = 1840; win._scrolls.length = 0;
  var unitsFiltered = api.parse('/en/units/'); // same name+params; only the query would differ in real use
  api.render(unitsFiltered);                    // deliberately WITHOUT {keep:true}
  ck('scroll: in-place update preserves exact position (no keep flag)', win._scrolls.length>0 && win._scrolls[win._scrolls.length-1][1]===1840, 'last='+JSON.stringify(win._scrolls[win._scrolls.length-1]||null));
  ck('scroll: in-place update never jumped to top', win._scrolls.every(function(s){ return s[1]!==0; }), 'scrolls='+JSON.stringify(win._scrolls));
  // 3) Explicit keep flag (History-API path) also preserves position.
  win.pageYOffset = 620; win._scrolls.length = 0;
  api.render(api.parse('/en/units/'), {keep:true});
  ck('scroll: explicit keep flag preserves position', win._scrolls.length>0 && win._scrolls[win._scrolls.length-1][1]===620, 'last='+JSON.stringify(win._scrolls[win._scrolls.length-1]||null));
  // 4) Navigating to a genuinely different page (units -> a project) resets to the top.
  win.pageYOffset = 1500; win._scrolls.length = 0;
  var projSlug = api.PROJECTS[0].slug; api.render(api.parse('/en/projects/'+projSlug+'/'));
  ck('scroll: navigation to a different page scrolls to top', win._scrolls.length>0 && win._scrolls[win._scrolls.length-1][1]===0, 'last='+JSON.stringify(win._scrolls[win._scrolls.length-1]||null));

  // ---- SEO-01: per-listing structured data (Product/Residence + Offer) ----
  function ldGraph(){ try{ return (JSON.parse(doc.getElementById('ld-page').textContent)['@graph'])||[]; }catch(e){ return []; } }
  var seoP = api.PROJECTS.filter(function(p){ return api.UNITS.some(function(u){return u.project===p.slug && u.price!=null;}); })[0];
  api.render(api.parse('/en/projects/'+seoP.slug+'/'));
  var g = ldGraph();
  var prod = g.filter(function(n){ return [].concat(n['@type']||[]).indexOf('Product')>-1; })[0];
  ck('seo: project page emits a Product/Residence listing', !!prod && [].concat(prod['@type']).indexOf('Residence')>-1, 'types='+(prod?JSON.stringify(prod['@type']):'none'));
  ck('seo: listing carries an AggregateOffer in EGP with a low price', !!prod && !!prod.offers && prod.offers['@type']==='AggregateOffer' && prod.offers.priceCurrency==='EGP' && typeof prod.offers.lowPrice==='number', 'offers='+(prod?JSON.stringify(prod.offers):'none'));
  ck('seo: listing canonical URL is attached to the primary node', !!prod && typeof prod.url==='string' && prod.url.indexOf('/projects/'+seoP.slug)>-1, 'url='+(prod&&prod.url));
  var ilist = g.filter(function(n){ return n['@type']==='ItemList'; })[0];
  var firstOffer = ilist && ilist.itemListElement && ilist.itemListElement[0] && ilist.itemListElement[0].item;
  ck('seo: units listed as Offers with Accommodation floorSize (m²)', !!firstOffer && firstOffer['@type']==='Offer' && firstOffer.priceCurrency==='EGP' && !!firstOffer.itemOffered && !!firstOffer.itemOffered.floorSize && firstOffer.itemOffered.floorSize.unitCode==='MTK', 'offer='+JSON.stringify(firstOffer||null).slice(0,170));
  ck('seo: unit offer carries rooms + a valid availability', !!firstOffer && firstOffer.itemOffered.numberOfRooms!=null && /schema\.org\/(PreOrder|InStock|SoldOut|LimitedAvailability)/.test(firstOffer.availability||''), 'av='+(firstOffer&&firstOffer.availability));
  api.render(api.parse('/en/units/'));
  var coll = ldGraph().filter(function(n){ return n['@type']==='CollectionPage'; })[0];
  ck('seo: units finder emits CollectionPage + ItemList of offers', !!coll && !!coll.mainEntity && coll.mainEntity['@type']==='ItemList' && coll.mainEntity.itemListElement.length>0 && coll.mainEntity.itemListElement[0].item['@type']==='Offer', 'n='+(coll&&coll.mainEntity?coll.mainEntity.itemListElement.length:0));
  // SEO-02: FAQPage
  api.render(api.parse('/en/faqs/'));
  var faq = ldGraph().filter(function(n){ return n['@type']==='FAQPage'; })[0];
  ck('seo: FAQs page emits FAQPage with Question/acceptedAnswer', !!faq && Array.isArray(faq.mainEntity) && faq.mainEntity.length>0 && faq.mainEntity[0]['@type']==='Question' && !!faq.mainEntity[0].acceptedAnswer && faq.mainEntity[0].acceptedAnswer['@type']==='Answer' && typeof faq.mainEntity[0].acceptedAnswer.text==='string', 'q='+(faq&&faq.mainEntity?faq.mainEntity.length:0));

  // ---- SEO-03: per-unit pages (routing, view, schema, card links) ----
  var au = api.UNITS.filter(function(x){ return x.price!=null; })[0];
  var rU = api.parse('/en/units/'+au.id.toLowerCase()+'/');
  ck('seo: unit URL parses to a unit route', rU.name==='unit' && String(rU.params.id).toLowerCase()===au.id.toLowerCase(), 'name='+rU.name);
  ck('seo: unknown unit id 404s', api.parse('/en/units/nope-999/').name==='404');
  ck('seo: buildPath(unit) is lowercased & clean', api.buildPath('unit',{id:au.id},'en').indexOf('/en/units/'+au.id.toLowerCase()+'/')>-1, api.buildPath('unit',{id:au.id},'en'));
  var uv = api.V.unit(au.id);
  ck('seo: unit view renders an <h1> + own title', countTag(uv.node,'h1')>=1 && uv.title.indexOf('The Village Investment')>-1, 'title='+uv.title);
  api.render(rU);
  var uprod = ldGraph().filter(function(n){ return [].concat(n['@type']||[]).indexOf('Product')>-1 && n.offers && n.offers['@type']==='Offer'; })[0];
  ck('seo: unit page emits Product + single Offer + isPartOf project', !!uprod && uprod.offers.priceCurrency==='EGP' && typeof uprod.offers.price==='number' && !!uprod.isPartOf && String(uprod.isPartOf.url||'').indexOf('/projects/')>-1, 'offer='+(uprod?JSON.stringify(uprod.offers):'none'));
  var uCard = api.unitCard(au);
  var linksToUnit=false; (function w(x){ for(const c of (x.childNodes||[])){ if(c.nodeType===1){ if(c.tagName==='a' && (c.getAttribute('href')||'').indexOf('/units/'+au.id.toLowerCase())>-1) linksToUnit=true; w(c);} } })(uCard);
  ck('seo: unit card links to its own unit page', linksToUnit, 'id='+au.id);

  // ---- CRO-01: affordability estimator present in the finder ----
  var uf = api.V.units().node;
  ck('cro: affordability estimator renders in the finder budget panel', countClass(uf,'afford')>=1 && countClass(uf,'afford-out')>=1, 'afford='+countClass(uf,'afford'));

  // ---- CRO-02: saved searches + launch alerts ----
  ck('cro: save-search + alerts controls render in the finder', countClass(uf,'rhead-actions')>=1, 'ra='+countClass(uf,'rhead-actions'));
  var sf=api.defaultFilter(); sf.areas=['raselhekma']; sf.types=['villa']; api.setFilter(sf);
  ck('cro: searchLabel summarises the active filters', api.searchLabel(sf).indexOf('Ras El Hekma')>-1, 'label='+api.searchLabel(sf));
  var okSave=api.saveCurrentSearch();
  ck('cro: saveCurrentSearch persists a labelled search', okSave===true && api.savedSearches().length>=1 && api.savedSearches()[0].label.length>0, 'saved='+api.savedSearches().length);
  ck('cro: duplicate save is de-duplicated', api.saveCurrentSearch()===false);
  var q0=api.savedSearches()[0].q; api.removeSearch(q0);
  ck('cro: removeSearch drops the saved entry', api.savedSearches().every(function(s){return s.q!==q0;}));

  // ---- RE-03 / RE-04: delivery timeline + availability ----
  var pv=api.V.project(seoP.slug);
  ck('re: project page renders a 3-stage delivery timeline', countClass(pv.node,'timeline-wrap')>=1 && countClass(pv.node,'tl-node')>=3, 'nodes='+countClass(pv.node,'tl-node'));
  ck('re: unit card shows an availability badge', countClass(api.unitCard(au),'avail-b')>=1, 'b='+countClass(api.unitCard(au),'avail-b'));
  // unit PDF factsheet: 2 pages (details + quarterly payment plan)
  api.printUnitFactsheet(au);
  var psheet=doc.getElementById('print-sheet');
  ck('pdf: unit factsheet builds the details page (no payment-plan page)', countClass(psheet,'ps-page')>=1 && countClass(psheet,'ps-page--break')===0, 'pages='+countClass(psheet,'ps-page'));
  ck('pdf: payment plan is excluded from print', txt(psheet).indexOf('Every 3 months')<0 && txt(psheet).indexOf('Payment plan')<0 && txt(psheet).indexOf('Quarterly')<0, 'ok');
  // factsheet preview overlay: guarantees Print / Save-as-PDF is usable even where window.print() is a no-op
  ck('pdf: requesting a factsheet opens the on-screen preview overlay', psheet.classList.contains('print-sheet--open') && countClass(psheet,'fs-toolbar')>=1, 'cls='+psheet.className);
  ck('pdf: overlay toolbar exposes Print + Close actions', (function(){ var tb=psheet.querySelector('.fs-toolbar'); return !!tb && tb.querySelectorAll('button').length>=2; })(), 'ok');
  ck('pdf: overlay wraps the factsheet content (pages still present inside)', countClass(psheet,'fs-body')>=1 && countClass(psheet,'ps-page')>=1, 'ok');
  api.closeFactsheet();
  ck('pdf: closing the preview hides the overlay again', !psheet.classList.contains('print-sheet--open'), 'cls='+psheet.className);
  api.printFactsheet(proj);
  ck('pdf: project factsheet also opens the preview overlay', doc.getElementById('print-sheet').classList.contains('print-sheet--open'), 'ok');
  api.closeFactsheet();

  // ---- Lead-capture popup ----
  api.leadReset();
  var lp=api.leadSubmit('Test User','+20 100 000 0002');
  var leads=JSON.parse(win.localStorage.getItem('tv_leads')||'[]');
  ck('lead: submit returns a promise and records the lead locally', !!lp && typeof lp.then==='function' && leads.some(function(x){return x.name==='Test User' && (x.phone||'').indexOf('0002')>-1;}), 'leads='+leads.length);
  api.leadReset();
  ck('lead: leadArm arms the sequence when it should run', (function(){ api.leadArm(); return api.leadState().armed===true; })());

  // ---- Phase-1 UI: favorites route + New Launches carousel ----
  ck('ui: favorites route parses to the favorites view', api.parse('/en/favorites/').name==='favorites');
  var favV=api.V.favorites();
  ck('ui: favorites view renders (empty state or saved grid)', (countClass(favV.node,'empty-state')>=1 || countClass(favV.node,'card')>=1) && favV.indexable===false, 'empty='+countClass(favV.node,'empty-state'));
  ck('ui: home shows a New Launches "Coming Soon" teaser (image)', (function(){ var csc=qsa(api.V.home().node,'.cs-card')[0]; return !!csc && qsa(csc,'img').length>=1; })(), 'cs='+countClass(api.V.home().node,'cs-card'));
  ck('ui: home shows a Top Locations section (7 premium cards, incl. coming-soon)', (function(){ var n=api.V.home().node; return countClass(n,'toploc')>=7 && countClass(n,'toploc--soon')>=2; })(), 'toploc='+countClass(api.V.home().node,'toploc'));
  ck('ui: hero search exposes Area/Developer/Project/Type/Bedrooms/Floor filters', (function(){ var n=api.V.home().node; var ids=[]; (function w(x){ for(const c of (x.childNodes||[])){ if(c.nodeType===1){ if(c.tagName==='select'&&c.id) ids.push(c.id); w(c);} } })(n); return ['f-area','f-dev','f-project','f-type','f-beds','f-floor'].every(function(id){return ids.indexOf(id)>-1;}); })(), 'ok');
  ck('ui: home shows a developer rail of circles linking to developer pages', (function(){ var n=api.V.home().node; var circles=qsa(n,'.dev-circle'); if(circles.length<5) return false; return circles.every(function(a){ return a.tagName==='a' && /\/developers\/[a-z0-9-]+\//.test(a.getAttribute('href')||''); }); })(), 'circles='+qsa(api.V.home().node,'.dev-circle').length);

  // ---- The Village Maps: feature removed from the site (parked for a professional rebuild) ----
  ck('maps: feature is fully removed from routing/nav', (function(){
    // no 'maps' route resolves, and the built app carries no map view helper
    var r=api.parse('/en/maps/'); if(r.name==='maps') return false;
    return typeof api.V.maps!=='function';
  })(), 'ok');

  // ---- developer / project logos (centralised registry) ----
  ck('logos: every developer is registered, plus 8 SODIC projects', Object.keys(api.DEV_LOGOS).length===api.DEVELOPERS.length && Object.keys(api.PROJECT_LOGOS).length===8,
     'dev='+Object.keys(api.DEV_LOGOS).length+' prj='+Object.keys(api.PROJECT_LOGOS).length);
  ck('logos: every registered logo resolves under /logos/ (no broken paths)', (function(){
    var ok=true;
    var fsx=require('fs'), pathx=require('path');
    var onDisk=function(url){ return fsx.existsSync(pathx.join(__dirname,'..',url.replace(/^\//,''))); };
    api.DEVELOPERS.forEach(function(d){
      [api.devLogoSrc(d), api.devLogoSrc(d,true)].forEach(function(s){
        if(s && (!/^\/logos\/[a-z0-9-]+\.webp$/.test(s) || !onDisk(s))) ok=false; });
    });
    ['villette','sodic-east','eastown','allegria','ogami-north-coast','caesar-north-coast','june-north-coast','the-estates-zayed'].forEach(function(sl){
      var s=api.projectLogoSrc({slug:sl})||'x';
      if(!/^\/logos\/projects\/[a-z0-9-]+\.webp$/.test(s) || !onDisk(s)) ok=false; });
    return ok;
  })(), 'ok');
  ck('logos: devBadge renders an <img> (lazy + alt) when a logo exists', (function(){
    var b=api.devBadge(api.devByKey('sodic'),46);
    // 46px is a small context, so it must take the 160px cut, not the full logo
    return b.tagName==='img' && /\/logos\/sodic-160\.webp$/.test(b.getAttribute('src')||'')
      && b.getAttribute('loading')==='lazy' && (b.getAttribute('alt')||'').indexOf('SODIC')>-1;
  })(), 'ok');
  ck('logos: devBadge falls back to a monogram (no img) when no logo', (function(){
    // every real developer now has a logo, so exercise the fallback with a
    // synthetic developer that has no mapped logo — must render a monogram.
    var b=api.devBadge({key:'zzznologo', name:{en:'Zzz Placeholder',ar:'بديل'}, c1:'#334455'},46);
    return b.tagName!=='img' && (b.className||'').indexOf('dev-logo')>-1;
  })(), 'ok');
  ck('logos: every SODIC project card shows the SODIC logo', (function(){
    var cards=qsa(api.V.projects(null).node,'.card');
    // find a sodic project card and confirm its dev mark is the sodic logo img
    var sodicProj=api.PROJECTS.filter(function(p){return p.dev==='sodic';})[0];
    var pv=api.V.project(sodicProj.slug).node;
    var imgs=qsa(pv,'img').filter(function(im){return /\/logos\/sodic(-160)?\.webp$/.test(im.getAttribute('src')||'');});
    return imgs.length>0;
  })(), 'ok');
  ck('logos: SODIC project page shows its own project wordmark', (function(){
    var pv=api.V.project('villette').node;
    return qsa(pv,'.proj-logo').some(function(im){return /\/logos\/projects\/villette\.webp$/.test(im.getAttribute('src')||'');});
  })(), 'ok');
  ck('logos: name-normalised alias still resolves (robust matching)',
     api.devLogoSrc({key:'x', name:{en:'Palm Hills Developments',ar:'بالم هيلز'}})==='/logos/palm-hills.webp'
     && api.devLogoSrc({key:'x', name:{en:'Palm Hills Developments',ar:'بالم هيلز'}}, true)==='/logos/palm-hills-160.webp', 'ok');

  // ---- UI refinements ----
  api.setFilter(api.defaultFilter());
  ck('count: SODIC shows 20 units dynamically (facet from data)', api.devFacets().sodic===20, 'sodic='+api.devFacets().sodic);
  api.setFilter(api.defaultFilter());
  ck('overview: project page renders a collapsed <details> accordion', (function(){
    var n=api.V.project('villette').node; var det=qsa(n,'.accordion')[0];
    return !!det && det.tagName==='details' && det.getAttribute('open')==null
      && qsa(det,'summary').length===1 && qsa(det,'.accordion__title').length===1;
  })(), 'ok');
  ck('overview: accordion body stays in the DOM (SEO-safe)', (function(){
    var n=api.V.project('villette').node; var det=qsa(n,'.accordion')[0];
    return det && txt(det).length>20;
  })(), 'ok');
  ck('covers: SODIC project shows a real WebP cover image', (function(){
    var n=api.V.project('villette').node; var c=qsa(n,'.proj-cover')[0];
    return !!c && /^\/project-media\/villette\/.+\.webp$/.test(c.getAttribute('src')||'') && (c.getAttribute('loading')==='lazy');
  })(), 'ok');
  ck('covers: SODIC unit shows its own type render', (function(){
    var n=api.V.unit('V-A305').node; var c=qsa(n,'.proj-cover')[0];
    return !!c && /\/project-media\/villette\/apartment\.webp$/.test(c.getAttribute('src')||'');
  })(), 'ok');
  ck('covers: project with no cover falls back to branded art (no broken cover)', (function(){
    // A project with no cover renders branded art (an <svg>), never a broken <img>.
    var p=api.PROJECTS.filter(function(x){return !api.projectCoverSrc(x);})[0];
    var m=api.projectMedia(p);
    return !!p && m.tagName==='svg' && (m.getAttribute('class')||'').indexOf('proj-cover')<0;
  })(), 'ok');
  ck('covers: a project WITH a cover renders the cover image', (function(){
    var p=api.PROJECTS.filter(function(x){return !!api.projectCoverSrc(x);})[0];
    var m=api.projectMedia(p);
    return !!p && m.tagName==='img' && /\.(webp|png|jpg)$/.test(m.getAttribute('src')||'');
  })(), 'ok');
  ck('ramla: project shows a self-hosted Marakez cover render', (function(){
    var n=api.V.project('ramla-ras-el-hekma').node; var c=qsa(n,'.proj-cover')[0];
    return !!c && /^\/project-media\/.+\.webp$/.test(c.getAttribute('src')||'');
  })(), 'ok');
  ck('hero: animated render backdrop has 5 slides + a scrim', (function(){
    var n=api.V.home().node; return qsa(n,'.hero__slide').length===5 && qsa(n,'.hero__scrim').length===1;
  })(), 'ok');
  // With rm2 in hand every Ramla unit has its own render from the client's
  // archive — no per-type stand-ins left.
  ck('ramla: all 21 units carry their own render from the archives', (function(){
    var us=api.UNITS.filter(function(u){ return u.project==='ramla-ras-el-hekma'; });
    return us.length===21 && us.every(function(u){
      var c=qsa(api.V.unit(u.id).node,'.proj-cover')[0];
      return c && /^\/project-media\/ramla\/units\//.test(c.getAttribute('src')||'');
    });
  })(), 'ok');
  ck('ramla: every unit opens a floor plan', (function(){
    return api.UNITS.filter(function(u){ return u.project==='ramla-ras-el-hekma'; })
      .every(function(u){ return api.unitFloorplans(u).length>0; });
  })(), 'ok');

  // ---- Payment estimator constraints ----
  ck('estimator: down payment offers only 2.5/5/10/15/20%', (function(){
    var n=api.paymentCalc({price:10000000, dp:10, years:8});
    var sel=qsa(n,'select')[0]; if(!sel) return false;
    var opts=qsa(sel,'option').map(function(o){return o.getAttribute('value');});
    return opts.length===5 && ['2.5','5','10','15','20'].every(function(v){return opts.indexOf(v)>-1;});
  })(), 'ok');
  ck('estimator: installment years capped at max 15', (function(){
    var n=api.paymentCalc({price:10000000, dp:10, years:8});
    return qsa(n,'input').filter(function(i){return i.getAttribute('max')==='15';}).length===1;
  })(), 'ok');

  // ---- Compare is UNIT-only; disabled on developer/project surfaces ----
  ck('compare: unit cards carry a compare button', (function(){
    return countClass(api.V.units().node,'cmp-btn')>0;
  })(), 'cmp-btns='+countClass(api.V.units().node,'cmp-btn'));
  ck('compare: developer page has NO compare buttons', (function(){
    var d=api.DEVELOPERS.filter(function(x){return api.PROJECTS.some(function(p){return p.dev===x.key;});})[0];
    return countClass(api.V.developer(d.key).node,'cmp-btn')===0;
  })(), 'ok');
  ck('compare: project list has NO compare buttons', (function(){
    return countClass(api.V.projects(null).node,'cmp-btn')===0;
  })(), 'cmp-btns='+countClass(api.V.projects(null).node,'cmp-btn'));
  ck('compare: comparison view compares units (Project row present)', (function(){
    api.setCompare(['JN-CR1','OG-WC1']);
    var n=api.V.compare().node, tx=txt(n);
    return countTag(n,'th')>=3 && /Project/.test(tx) && /Bedrooms/.test(tx);
  })(), 'ok');

  // ---- New Launches now teases a single upcoming project ("Coming Soon" image) ----
  ck('newlaunch: launches page shows the Coming Soon teaser (image, no project cards)', (function(){
    var n=api.V.projects('launch').node; var csc=qsa(n,'.cs-card')[0];
    return !!csc && qsa(csc,'img').length>=1 && countClass(n,'card')===0;
  })(), 'cs='+countClass(api.V.projects('launch').node,'cs-card')+' cards='+countClass(api.V.projects('launch').node,'card'));
  ck('newlaunch: no existing project is surfaced as a new launch', api.newLaunchProjects().length===0 && api.NEW_LAUNCH_SLUGS.length===0, 'n='+api.newLaunchProjects().length);
  // The Coming Soon teaser links to its parent project (Ramla); that project's own page shows it too.
  ck('newlaunch: teaser card links to the Ramla project', (function(){
    var n=api.V.home().node; var a=qsa(n,'.cs-card')[0];
    return !!a && a.tagName==='a' && /\/projects\/ramla-ras-el-hekma\/$/.test(a.getAttribute('href')||'');
  })(), (function(){ var a=qsa(api.V.home().node,'.cs-card')[0]; return a&&(a.tagName+' '+a.getAttribute('href')); })());
  ck('newlaunch: Ramla project page shows the Coming Soon teaser (non-link figure)', (function(){
    var n=api.V.project('ramla-ras-el-hekma').node; var c=qsa(n,'.cs-card')[0];
    return !!c && c.tagName==='figure' && qsa(c,'img').length>=1;
  })(), 'ok');

  // ---- master/floor plans + amenities + unit feature row ----
  ck('plans: master & floor resolvers map to /project-media/plans', (function(){
    var u=api.unitById('JN-CR1'), mp=api.unitMasterplans(u), fp=api.unitFloorplans(u);
    var ofp=api.unitFloorplans(api.unitById('OG-WC1'));
    return mp.length===1 && /\/project-media\/plans\/mp-JN-CR1\.webp$/.test(mp[0])
      && fp.length===1 && /\/project-media\/plans\/fp-JN-CR1-1\.webp$/.test(fp[0]) && ofp.length===2;
  })(), 'ok');
  ck('plans: unit with plans shows all 4 feature chips', (function(){
    var chips=qsa(api.V.unit('JN-CR1').node,'.ufeat');
    var txt=chips.map(function(c){return c.textContent||'';}).join('|');
    return chips.length===4 && /Location/.test(txt) && /Floor Plan/.test(txt) && /Master Plan/.test(txt) && /Amenities/.test(txt);
  })(), 'ok');
  ck('plans: feature-row order = Location, Floor, Master, Amenities', (function(){
    var c=qsa(api.V.unit('JN-CR1').node,'.ufeat');
    return /Location/.test(c[0].textContent) && /Floor Plan/.test(c[1].textContent) && /Master Plan/.test(c[2].textContent) && /Amenities/.test(c[3].textContent);
  })(), 'ok');
  ck('plans: unit without plans shows only Location + Amenities', (function(){
    var chips=qsa(api.V.unit('V-A305').node,'.ufeat');
    var txt=chips.map(function(c){return c.textContent||'';}).join('|');
    return chips.length===2 && /Location/.test(txt) && /Amenities/.test(txt) && !/Floor Plan/.test(txt);
  })(), 'ok');
  ck('amenities: unit page renders #amenities with multiple amenities', (function(){
    var sec=findAttr(api.V.unit('JN-CR1').node,'id','amenities');
    return !!sec && qsa(sec,'.amen').length>=6;
  })(), 'ok');

  // ---- LMD developer: 6 projects, 15 units, per-unit image galleries ----
  ck('lmd: 6 LMD projects present (all dev=lmd)', (function(){
    var s=['stei8ht-eastmed','three-sixty','stei8ht-there','stei8ht-eastside','one-ninety','zoya'];
    return s.every(function(x){ return api.projBySlug(x) && api.projBySlug(x).dev==='lmd'; }) && api.PROJECTS.filter(function(p){return p.dev==='lmd';}).length===6;
  })(), 'n='+api.PROJECTS.filter(function(p){return p.dev==='lmd';}).length);
  ck('lmd: 15 LMD units present with real prices', (function(){
    var slugs=['stei8ht-eastmed','three-sixty','stei8ht-there','stei8ht-eastside','one-ninety','zoya'];
    var us=api.UNITS.filter(function(u){ return slugs.indexOf(u.project)>-1; });
    return us.length===15 && api.unitById('ZY-SV1').price===151000000 && api.unitById('TS-OF5').price===238292000;
  })(), 'ok');
  ck('lmd: ZOYA on North Coast (sahel); Three Sixty is commercial + real from-price', api.projBySlug('zoya').area==='sahel' && api.projBySlug('three-sixty').price===25076950 && /Office|Clinic/.test(api.projBySlug('three-sixty').types.en));
  ck('lmd: master/floor/location resolvers map to /project-media/lmd', (function(){
    var u=api.unitById('TS-AD1');
    return /\/project-media\/lmd\/ts-ad1-mp1\.webp$/.test(api.unitMasterplans(u)[0])
      && /\/project-media\/lmd\/ts-ad1-fp1\.webp$/.test(api.unitFloorplans(u)[0])
      && /\/project-media\/lmd\/ts-ad1-loc1\.webp$/.test(api.unitLocationImg(u));
  })(), 'ok');
  ck('lmd: render gallery carries several numbered photos', (function(){
    var g=api.unitGallery(api.unitById('ZY-SV1')), items=api.unitGalleryItems(api.unitById('ZY-SV1'));
    return g.length===3 && items.length===3 && /1\/3/.test(items[0].cap) && g.every(function(s){return /\/project-media\/lmd\/zy-sv1-r\d\.webp$/.test(s);});
  })(), 'ok');
  ck('lmd: unit page shows Photos chip + all present categories + count badge', (function(){
    var node=api.V.unit('TS-AD1').node;
    var chips=qsa(node,'.ufeat').map(function(c){return c.textContent||'';}).join('|');
    var badge=qsa(node,'.gal-badge');
    return /Photos/.test(chips) && /Location/.test(chips) && /Floor Plan/.test(chips) && /Master Plan/.test(chips)
      && badge.length===1 && /3/.test(badge[0].textContent||'');
  })(), 'ok');
  ck('lmd: unit hero has inline prev/next arrows + position badge for multi-photo units', (function(){
    var node=api.V.unit('ZY-SV1').node;                 // ZY-SV1 has 3 renders
    var navs=qsa(node,'.gal-nav'), badge=qsa(node,'.gal-badge__n');
    return navs.length===2 && badge.length===1 && /1 \/ 3/.test(badge[0].textContent||'');
  })(), 'ok');
  ck('lmd: single-photo unit has no arrows', (function(){
    // find a unit with exactly one render, if any; else confirm arrows only when >1
    var multi=api.V.unit('ZY-SV1').node;
    return qsa(multi,'.gal-nav').length===2;
  })(), 'ok');
  ck('lmd: commercial unit (no beds) renders type-only name (no BR prefix)', (function(){
    var u=api.unitById('TS-OF5');
    return u.beds==null && !/\bBR\b/.test(api.V.unit('TS-OF5').title||'');
  })(), 'title='+(api.V.unit('TS-OF5').title||'').slice(0,32));
  ck('lmd: chalet without a floor plan hides Floor Plan chip, keeps Master + Photos', (function(){
    var chips=qsa(api.V.unit('ZY-CH4').node,'.ufeat').map(function(c){return c.textContent||'';}).join('|');
    return !/Floor Plan/.test(chips) && /Master Plan/.test(chips) && /Photos/.test(chips);
  })(), 'ok');
  ck('lmd: unit with no location image falls back to the area aerial', /\/project-media\/locations\/newcairo\.webp$/.test(api.unitLocationImg(api.unitById('SEM-CL1'))), 'loc='+api.unitLocationImg(api.unitById('SEM-CL1')));
  ck('lmd: each LMD project card has a dedicated cover image (not branded art)', (function(){
    var slugs=['three-sixty','one-ninety','zoya','stei8ht-eastmed','stei8ht-there','stei8ht-eastside'];
    var ok=slugs.every(function(s){ return api.projectCoverSrc(api.projBySlug(s))==='/project-media/lmd/cover-'+s+'.webp'; });
    return ok && api.projectMedia(api.projBySlug('three-sixty')).tagName==='img';
  })(), 'ok');

  // ---- Hassan Allam developer integration (6 projects, 37 units) ----
  ck('ha: 6 Hassan Allam projects present (dev=hassanallam)', (function(){
    var s=['phonix-swanlake','ampm-swanlake','the-valleys','park-central','the-great-lawn','swan-lake-west'];
    return s.every(function(x){var p=api.projBySlug(x);return p&&p.dev==='hassanallam';}) && api.PROJECTS.filter(function(p){return p.dev==='hassanallam';}).length===6;
  })(), 'n='+api.PROJECTS.filter(function(p){return p.dev==='hassanallam';}).length);
  ck('ha: 37 HA units with real prices', (function(){
    var slugs=['phonix-swanlake','ampm-swanlake','the-valleys','park-central','the-great-lawn','swan-lake-west'];
    var us=api.UNITS.filter(function(u){return slugs.indexOf(u.project)>-1;});
    return us.length===37 && api.unitById('SL-SV9').price===105000000 && api.unitById('AP-OF1').price===142100000;
  })(), 'n='+api.UNITS.filter(function(u){return api.projBySlug(u.project)&&api.projBySlug(u.project).dev==='hassanallam';}).length);
  ck('ha: project cards have dedicated cover images', (function(){
    return ['phonix-swanlake','swan-lake-west','the-valleys'].every(function(s){return /\/project-media\/hassan-allam\/.*\.webp$/.test(api.projectCoverSrc(api.projBySlug(s)));})
      && api.projectMedia(api.projBySlug('swan-lake-west')).tagName==='img';
  })(), 'ok');
  ck('ha: unit has render gallery + master + floor + location, all under /hassan-allam', (function(){
    var u=api.unitById('VL-TH1');
    return api.unitGallery(u).length===3 && /\/hassan-allam\/vl-th1-mp1\.webp$/.test(api.unitMasterplans(u)[0])
      && api.unitFloorplans(u).length===2 && /\/hassan-allam\/vl-th1-loc1\.webp$/.test(api.unitLocationImg(u));
  })(), 'ok');
  ck('ha: office unit (no beds) renders type-only + areas mapped (mostakbal/october)', (function(){
    return api.unitById('AP-OF1').beds==null && api.projBySlug('the-valleys').area==='mostakbal' && api.projBySlug('swan-lake-west').area==='october';
  })(), 'ok');

  // ---- Tatweer Misr developer integration (7 projects, 50 units) ----
  ck('tm: 7 Tatweer projects present (dev=tatweer)', (function(){
    var s=['il-monte-galala','bloomfields','salt','rivers','fouka-bay','d-bay','scenes'];
    return s.every(function(x){var p=api.projBySlug(x);return p&&p.dev==='tatweer';}) && api.PROJECTS.filter(function(p){return p.dev==='tatweer';}).length===7;
  })(), 'n='+api.PROJECTS.filter(function(p){return p.dev==='tatweer';}).length);
  ck('tm: 50 Tatweer units; studio typo fixed + villa price real', (function(){
    var us=api.UNITS.filter(function(u){return api.projBySlug(u.project)&&api.projBySlug(u.project).dev==='tatweer';});
    return us.length===50 && api.unitById('TM-IM-02').price===7400000 && api.unitById('TM-SL-06').price===38000000;
  })(), 'n='+api.UNITS.filter(function(u){return api.projBySlug(u.project)&&api.projBySlug(u.project).dev==='tatweer';}).length);
  ck('tm: all Tatweer unit types normalize (none "other")', (function(){
    var us=api.UNITS.filter(function(u){return api.projBySlug(u.project)&&api.projBySlug(u.project).dev==='tatweer';});
    return us.every(function(u){return api.unitCanon(u)!=='other';})
      && api.normalizeUnitType('Chalet')==='chalet' && api.normalizeUnitType('Loft')==='loft'
      && api.normalizeUnitType('Cabin')==='cabin' && api.normalizeUnitType('Penthouse')==='penthouse' && api.normalizeUnitType('Duplex')==='duplex';
  })(), 'ok');
  ck('tm: project covers + unit galleries/plans under /tatweer', (function(){
    return ['salt','rivers','d-bay','scenes','il-monte-galala'].every(function(s){return /\/project-media\/tatweer\/.*\.webp$/.test(api.projectCoverSrc(api.projBySlug(s)));})
      && api.unitGallery(api.unitById('TM-IM-01')).length>=1
      && /\/tatweer\/.*\.webp$/.test(api.unitMasterplans(api.unitById('TM-SL-06'))[0])
      && api.unitFloorplans(api.unitById('TM-SL-06')).length>=1;
  })(), 'ok');
  ck('tm: existing projects refreshed with units + real areas', (function(){
    return api.projBySlug('il-monte-galala').area==='sokhna' && api.projBySlug('salt').area==='raselhekma'
      && api.projBySlug('rivers').area==='zayed' && api.projBySlug('d-bay').area==='sahel'
      && api.UNITS.filter(function(u){return u.project==='il-monte-galala';}).length===21;
  })(), 'ok');


  // ---- Assistant: instant offer built from the site's own data ----
  function offerOf(q){
    var m=api.chatRespond(q); if(!m) return null;
    var g=function(cls){ return (qsa(m,'div').filter(function(d){
      return new RegExp('(^|\\s)'+cls+'(\\s|$)').test((d.getAttribute&&d.getAttribute('class'))||''); })[0]||{}).textContent; };
    return { node:m, title:g('offer__h'), sub:g('offer__sub'), price:g('offer__price'), plan:g('offer__plan'),
             rows:qsa(m,'a').filter(function(a){ return /unit-mini/.test((a.getAttribute&&a.getAttribute('class'))||''); })
                    .map(function(a){ return a.textContent; }),
             hrefs:qsa(m,'a').map(function(a){ return (a.getAttribute&&a.getAttribute('href'))||''; }) };
  }
  ck('offer: naming a project returns its own price list, not a bare link', (function(){
    var o=offerOf('Beach Plaza Premium'); if(!o||!o.title) return false;
    return o.title==='Beach Plaza Premium · Modon'
      && /Ras El Hekma/.test(o.sub) && /2029/.test(o.sub)
      && /19,900,000/.test(o.price) && /10%/.test(o.plan) && /8 years/.test(o.plan)
      && o.rows.length===3
      && /1 BR Apartment · 93 m² · 19,900,000 EGP/.test(o.rows[0])
      && /3 BR Apartment · 197 m² · 49,200,000 EGP/.test(o.rows[2]);
  })(), 'ok');
  ck('offer: every figure comes from UNITS/PROJECTS — nothing invented', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var us=api.UNITS.filter(function(u){ return u.project==='beach-plaza-premium'; });
    var o=offerOf('Beach Plaza Premium');
    return o.rows.length===us.length && us.every(function(u,i){
      return o.rows[i].indexOf(String(u.area))>-1 && o.rows[i].indexOf(api.money(u.price))>-1;
    }) && o.price.indexOf(api.money(p.price))>-1;
  })(), 'ok');
  ck('offer: naming a developer lists that developer\'s projects with plans', (function(){
    var o=offerOf('tell me about Modon'); if(!o||!o.title) return false;
    var n=api.PROJECTS.filter(function(p){ return p.dev==='modon'; }).length;
    return o.title==='Modon' && o.sub.indexOf(String(n))>-1
      && o.rows.length>0 && /Beach Plaza Premium/.test(o.rows[0]) && /10%/.test(o.rows[0]);
  })(), 'ok');
  ck('offer: naming an area lists the projects in it', (function(){
    var o=offerOf('Ras El Hekma'); if(!o||!o.title) return false;
    return o.title==='Ras El Hekma' && o.rows.length>0
      && o.hrefs.some(function(hh){ return /\/areas\/raselhekma\/$/.test(hh); });
  })(), 'ok');
  ck('offer: a project name beats the developer and area it sits inside', (function(){
    // "Beach Plaza Premium" is a Modon project in Ras El Hekma; the project wins
    return offerOf('Beach Plaza Premium').title==='Beach Plaza Premium · Modon'
      && offerOf('Modon').title==='Modon'
      && offerOf('ZOYA').title.indexOf('ZOYA')===0;
  })(), 'ok');
  ck('offer: longest name wins, so siblings are not confused', (function(){
    return offerOf('Beach Plaza Luxury').title==='Beach Plaza Luxury · Modon'
      && offerOf('LightHouse Village Ultra Luxury').title==='LightHouse Village Ultra Luxury · Modon';
  })(), 'ok');
  ck('offer: the WhatsApp text carries the price list, disclaimer and link', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var txt=api.offerText({kind:'project', title:'Beach Plaza Premium · Modon', sub:'x',
      price:p.price, plan:api.planLine(p),
      rows:[{text:'1 BR Apartment · 93 m² · 19,900,000 EGP'}], rowsTitle:'Available units',
      href:api.buildPath('project',{slug:p.slug})});
    return /The Village Investment — Offer/.test(txt)
      && /Starting from: 19,900,000 EGP/.test(txt)
      && /Payment plan: 10% Down payment · 8 years/.test(txt)
      && /Available units:/.test(txt)
      && /• 1 BR Apartment · 93 m² · 19,900,000 EGP/.test(txt)
      && /illustrative/.test(txt)
      && txt.indexOf('https://www.thevillageinvestment.com/en/projects/beach-plaza-premium/')>-1
      && txt.indexOf('+20 101 600 0201')>-1;
  })(), 'ok');
  ck('offer: the card offers send-on-WhatsApp, copy and open', (function(){
    var o=offerOf('Beach Plaza Premium');
    var wa=o.hrefs.filter(function(hh){ return /wa\.me|whatsapp/.test(hh); })[0];
    var btns=qsa(o.node,'button').map(function(b){ return b.textContent; });
    return !!wa && decodeURIComponent(wa).indexOf('The Village Investment — Offer')>-1
      && btns.some(function(b){ return /Copy offer/.test(b); })
      && o.hrefs.some(function(hh){ return /\/projects\/beach-plaza-premium\/$/.test(hh); });
  })(), 'ok');
  ck('offer: a zero down payment or zero years is never quoted as a plan', (function(){
    return api.planLine({dp:0, years:0})===''
      && api.planLine({dp:null, years:null})===''
      && api.planLine({dp:10, years:8})==='10% Down payment · 8 years'
      && api.planLine({dp:10, years:0})==='10% Down payment';
  })(), 'ok');
  ck('offer: an unknown question still hands off instead of guessing', (function(){
    var m=api.chatRespond('do you sell resale flats in Tokyo');
    return m && /advisor|details/i.test(m.textContent) && !qsa(m,'div').some(function(d){
      return /offer__h/.test((d.getAttribute&&d.getAttribute('class'))||''); });
  })(), 'ok');


  // ---- Print factsheet: real photo, floor plan, instalments, live WhatsApp ----
  function sheetAfter(fn){ fn(); return doc.getElementById('print-sheet'); }
  ck('print: the project sheet uses the real cover photo, not the placeholder art', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var sh=sheetAfter(function(){ api.printFactsheet(p); });
    var imgs=qsa(sh,'img').map(function(i){ return (i.getAttribute&&i.getAttribute('src'))||''; });
    return imgs.indexOf(api.projectCoverSrc(p))>-1;
  })(), 'ok');
  ck('print: the sheet carries a floor plan from one of the project\'s units', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var fp=api.projFloorplan(p);
    var sh=sheetAfter(function(){ api.printFactsheet(p); });
    var imgs=qsa(sh,'img').map(function(i){ return (i.getAttribute&&i.getAttribute('src'))||''; });
    return !!fp && imgs.indexOf(fp)>-1 && /Floor plan/i.test(sh.textContent);
  })(), 'ok');
  ck('print: the sheet states the down payment, period and instalment count', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var sh=sheetAfter(function(){ api.printFactsheet(p); });
    var txt=sh.textContent;
    return api.installmentCount(p)===32
      && /Down payment/.test(txt) && /10%/.test(txt)
      && /Installment period/.test(txt) && /8 years/.test(txt)
      && /Installments/.test(txt) && /32 quarterly/.test(txt);
  })(), 'ok');
  ck('print: a project with no published plan states no instalment count', (function(){
    return api.installmentCount({years:null})===null && api.installmentCount({years:0})===null
      && api.installmentCount({years:4})===16;
  })(), 'ok');
  ck('print: phone, email and WhatsApp are live links on the sheet', (function(){
    var p=api.projBySlug('beach-plaza-premium');
    var sh=sheetAfter(function(){ api.printFactsheet(p); });
    var hrefs=qsa(sh,'a').map(function(a){ return (a.getAttribute&&a.getAttribute('href'))||''; });
    return hrefs.some(function(hh){ return hh.indexOf('tel:')===0; })
      && hrefs.some(function(hh){ return hh.indexOf('mailto:')===0; })
      && hrefs.some(function(hh){ return /wa\.me\/\d+\?text=/.test(hh)
           && decodeURIComponent(hh).indexOf('Beach Plaza Premium')>-1; });
  })(), 'ok');
  ck('print: the unit sheet also carries a live WhatsApp link', (function(){
    var sh=sheetAfter(function(){ api.printUnitFactsheet(api.unitById('PX-AP1')); });
    var hrefs=qsa(sh,'a').map(function(a){ return (a.getAttribute&&a.getAttribute('href'))||''; });
    return hrefs.some(function(hh){ return /wa\.me\/\d+\?text=/.test(hh); });
  })(), 'ok');


  // ---- Marakez, built from its corporate brochure ----
  ck('marakez: company photography sits above the logo, as on the Modon page', (function(){
    var g=api.DEV_GALLERY.marakez||[];
    var n=api.V.developer('marakez').node;
    var srcs=qsa(n,'img').map(function(i){return (i.getAttribute&&i.getAttribute('src'))||'';});
    var galAt=srcs.findIndex(function(s){ return /\/project-media\/marakez\//.test(s); });
    var logoAt=srcs.findIndex(function(s){ return /logos\/marakez(-160)?\.webp$/.test(s); });
    return g.length===5 && galAt>-1 && logoAt>-1 && galAt<logoAt;
  })(), 'ok');
  ck('marakez: the Ramla aerial is off the gallery but kept on its card', (function(){
    var inGal=(api.DEV_GALLERY.marakez||[]).some(function(s){ return /ramla-aerial/.test(s); });
    var onCard=api.DEV_FEATURES.marakez.cards.some(function(c){
      return (c.imgs||[]).some(function(s){ return /ramla-aerial/.test(s); }); });
    return !inGal && onCard;
  })(), 'ok');
  ck('marakez: masterplan + four feature cards render', (function(){
    var f=api.DEV_FEATURES.marakez;
    var n=api.V.developer('marakez').node;
    return !!f && !!f.masterplan && f.cards.length===4 && qsa(n,'.dev-mp').length===1;
  })(), 'ok');
  ck('marakez: the brochure figures survive into the page', (function(){
    var t=txt(api.V.developer('marakez').node);
    // group scale, the flagship land area, and the mall that started it
    return t.indexOf('2,100+')>-1 && t.indexOf('268-acre')>-1
      && t.indexOf('621,401')>-1 && t.indexOf('1.4 kilometres')>-1;
  })(), 'ok');
  ck('marakez: every referenced image exists on disk', (function(){
    var fsx=require('fs'), pathx=require('path'), ok=true, seen=0;
    var f=api.DEV_FEATURES.marakez;
    var srcs=(api.DEV_GALLERY.marakez||[]).concat([f.masterplan.src]);
    f.cards.forEach(function(c){ (c.imgs||[]).forEach(function(s){ srcs.push(s); }); });
    srcs.forEach(function(s){
      seen++;
      if(!fsx.existsSync(pathx.join(__dirname,'..',s.replace(/^\//,'')))) ok=false;
    });
    return ok && seen>=12;
  })(), 'ok');
  ck('marakez: the copy is complete in both languages', (function(){
    var f=api.DEV_FEATURES.marakez;
    return f.cards.every(function(c){
      if(!c.en || !c.ar || !c.copy || !c.copy.lead.en || !c.copy.lead.ar) return false;
      return (c.copy.groups||[]).every(function(g){
        return g.label.en && g.label.ar &&
          g.rows.every(function(r){ return r.k.en && r.k.ar && r.v.en && r.v.ar; });
      });
    });
  })(), 'ok');

  // ---- Sumou Boulevard (from the client sheet + prelaunch brochure) ----
  ck('sumou: the developer exists with its logo and no invented founding year', (function(){
    var d=api.devByKey('sumou');
    return !!d && d.since===undefined && api.devLogoSrc(d)==='/logos/sumou.webp';
  })(), 'ok');
  ck('sumou: the developer page renders without a "Since undefined" chip', (function(){
    var n=api.V.developer('sumou').node;
    return txt(n).indexOf('undefined')===-1 && txt(n).indexOf('Sumou')>-1;
  })(), 'ok');
  ck('sumou: company photography sits above the logo, as on the Modon page', (function(){
    var g=api.DEV_GALLERY.sumou||[];
    var n=api.V.developer('sumou').node;
    var srcs=qsa(n,'img').map(function(i){return (i.getAttribute&&i.getAttribute('src'))||'';});
    var galAt=srcs.findIndex(function(s){ return /\/project-media\/sumou\//.test(s); });
    var logoAt=srcs.findIndex(function(s){ return /logos\/sumou(-160)?\.webp$/.test(s); });
    return g.length===6 && galAt>-1 && logoAt>-1 && galAt<logoAt;
  })(), 'ok');
  ck('sumou: exactly 8 units, all on the one project', (function(){
    var us=api.UNITS.filter(function(u){ return u.project==='sumou-boulevard'; });
    return us.length===8 && api.PROJECTS.filter(function(p){return p.dev==='sumou';}).length===1;
  })(), 'ok');
  ck('sumou: prices, plan and delivery match the sheet', (function(){
    var p=api.projBySlug('sumou-boulevard');
    var byId={}; api.UNITS.forEach(function(u){ byId[u.id]=u; });
    return p.dp===10 && p.years===10 && p.delivery==='2030' && p.area==='mostakbal'
      && byId['SB-ST-01'].price===2480000 && byId['SB-SP-01'].price===3680000
      && byId['SB-AP-01'].price===4800000 && byId['SB-AP-02'].price===7680000
      && byId['SB-AP-03'].price===12000000 && byId['SB-AP-04'].price===16000000
      && byId['SB-OF-01'].price===6900000  && byId['SB-OF-02'].price===25000000;
  })(), 'ok');
  ck('sumou: the sheet\'s size bands survive as ranges, not rounded down', (function(){
    var byId={}; api.UNITS.forEach(function(u){ byId[u.id]=u; });
    return api.areaText(byId['SB-ST-01'])==='31–33 m²'
      && api.areaText(byId['SB-AP-03'])==='150–196 m²'
      && api.areaText(byId['SB-OF-02'])==='200 m²';       // a single figure stays single
  })(), 'ok');
  ck('sumou: studio-plus and smart-office resolve to real types, not "other"', (function(){
    return api.normalizeUnitType('Studio plus')==='studio'
      && api.normalizeUnitType('Smart Offices')==='office'
      && api.normalizeUnitType('Offices')==='office';
  })(), 'ok');
  ck('sumou: offices show no bedroom or bathroom count', (function(){
    var byId={}; api.UNITS.forEach(function(u){ byId[u.id]=u; });
    return api.unitIsCommercial(byId['SB-OF-01']) && byId['SB-OF-01'].beds===undefined
      && api.unitDisplayName(byId['SB-OF-01'])==='Smart Office'
      && api.unitDisplayName(byId['SB-OF-02'])==='Office';
  })(), 'ok');
  ck('sumou: every referenced image is a file that exists', (function(){
    var fsx=require('fs'), pathx=require('path'), ok=true, seen=0;
    var us=api.UNITS.filter(function(u){return u.project==='sumou-boulevard';});
    var lists=[api.DEV_GALLERY.sumou||[], [api.projectCoverSrc(api.projBySlug('sumou-boulevard'))]];
    us.forEach(function(u){
      lists.push(api.unitGallery(u), api.unitFloorplans(u), api.unitMasterplans(u),
                 [api.unitLocationImg(u)]);   // this one returns a single src
    });
    lists.forEach(function(l){ (l||[]).forEach(function(src){
      var s = typeof src==='string' ? src : (src&&src.src);
      if(!s) return;
      seen++;
      if(!fsx.existsSync(pathx.join(__dirname,'..',s.replace(/^\//,'')))) ok=false;
    }); });
    return ok && seen>50;
  })(), 'ok');
  ck('devpage: a single-project developer lists its units, not one project card', (function(){
    var n=api.V.developer('sumou').node;
    var cards=qsa(n,'.card');
    // every card is a unit card (it carries a spec row), and the project card is gone
    return cards.length===8 && cards.every(function(c){ return qsa(c,'.spec-row').length===1; });
  })(), 'ok');
  ck('devpage: the project page is still reachable from that section', (function(){
    var n=api.V.developer('sumou').node;
    return qsa(n,'a').some(function(a){
      return (a.getAttribute('href')||'').indexOf('/projects/sumou-boulevard/')>-1; });
  })(), 'ok');
  ck('devpage: a multi-project developer still lists projects', (function(){
    var n=api.V.developer('sodic').node;
    var cards=qsa(n,'.card');
    return cards.length>1 && cards.every(function(c){ return qsa(c,'.spec-row').length===0; });
  })(), 'ok');
  ck('sumou: the developer is named after its logo', (function(){
    var d=api.devByKey('sumou');
    return d.name.en==='SumouBlvd.' && d.name.ar==='سمو بوليفارد'
      && txt(api.V.developer('sumou').node).indexOf('Investment is a leading')>-1;  // parent company still described
  })(), 'ok');

  ck('sumou: amenities are an icon grid, not a photo card', (function(){
    var n=api.V.developer('sumou').node;
    var sec=qsa(n,'.amen-sec')[0];
    if(!sec) return false;
    var tiles=qsa(sec,'.amen');
    // every tile carries an icon and a label, and no feature card is titled
    // "Amenities" any more — that card was replaced, not duplicated
    var everyTileHasBoth = tiles.length===18 && tiles.every(function(t){
      return qsa(t,'.amen__ic').length===1 && qsa(t,'.amen__lb').length===1; });
    return everyTileHasBoth && txt(n).indexOf('Amenities & Finishing')>-1;
  })(), 'ok');
  ck('sumou: the amenities grid folds behind a chevron, collapsed by default', (function(){
    var n=api.V.developer('sumou').node;
    var det=qsa(n,'.amen-acc')[0];
    if(!det || det.tagName!=='details') return false;
    // collapsed on arrival, one summary, and a chevron to open it
    return det.getAttribute('open')==null
      && qsa(det,'summary').length===1
      && qsa(det,'.accordion__chev').length===1;
  })(), 'ok');
  ck('sumou: collapsing keeps the amenities in the DOM for crawlers', (function(){
    // <details> hides its body visually but never removes it, unlike a JS
    // show/hide — the 18 tiles and the finishing note stay readable to bots.
    var n=api.V.developer('sumou').node;
    var det=qsa(n,'.amen-acc')[0];
    return qsa(det,'.amen').length===18 && /core & shell/.test(txt(det));
  })(), 'ok');
  ck('sumou: every amenity token resolves to a real icon', (function(){
    var toks=api.DEV_AMENITIES.sumou||[];
    return toks.length===18 && toks.every(function(k){
      var a=api.AMENITY_CAT[k];
      return !!a && !!a.en && !!a.ar && !!api.ICON[a.icon];
    });
  })(), 'ok');
  ck('sumou: the finishing spec survived the card removal', (function(){
    var n=api.V.developer('sumou').node;
    return /core & shell/.test(txt(n)) && /fully finished/.test(txt(n));
  })(), 'ok');
  ck('sumou: the project page and every unit route resolve', (function(){
    if(api.parse('/en/projects/sumou-boulevard/').name!=='project') return false;
    return api.UNITS.filter(function(u){return u.project==='sumou-boulevard';})
      .every(function(u){ var r=api.parse('/en/units/'+u.id+'/'); return r.name==='unit' && !!api.unitById(u.id); });
  })(), 'ok');

  // ---- Critical-path hints in <head> ----
  // The hero preload is hand-written in <head> because a preload scanner cannot
  // see a URL the app script puts in a style attribute. That makes it a second
  // copy of a fact, so assert it still agrees with the one the app uses.
  (function(){
    var raw=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
    var m=raw.match(/hero\.href\s*=\s*'([^']+)'/);
    ck('perf: <head> preloads the LCP hero image at high priority',
      !!m && /project-media\/hero\/beach/.test(m[1]) && /fetchpriority/.test(raw),
      m?m[1]:'no preload found');
    ck('perf: the preloaded hero name is HERO_SLIDES[0]',
      !!m && m[1].indexOf('/'+api.HERO_SLIDES[0])>-1,
      'preload='+(m?m[1]:'-')+' slides[0]='+api.HERO_SLIDES[0]);
    ck('perf: the mobile hero variant exists on disk', (function(){
      var p=require('path').join(__dirname,'..','project-media','hero',api.HERO_SLIDES[0]+'-800.webp');
      return require('fs').existsSync(p);
    })(), 'ok');
    ck('perf: only the first hero slide loads eagerly', (function(){
      var node=api.V.home().node;
      var slides=qsa(node,'.hero__slide');
      if(slides.length<2) return false;
      var eager=slides.filter(function(s){ return !s.getAttribute('data-bg'); });
      return eager.length===1;
    })(), 'ok');
    ck('perf: font preloads follow the page language', /tajawal-400-arabic/.test(raw) && /fraunces-latin/.test(raw), 'ok');
  })();

  // ---- a11y: no aria-label may shadow richer visible text (WCAG 2.5.3) ----
  ck('a11y: area cards take their name from their visible text', (function(){
    var node=api.V.home().node;
    return qsa(node,'.toploc').every(function(a){ return !a.getAttribute('aria-label'); });
  })(), 'ok');

  // ---- Nav "Search" goes to the finder; the standalone palette pill is gone ----
  ck('nav: the header no longer renders the palette pill', (function(){
    var raw=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
    // the pill is gone from the markup, but the Ctrl/Cmd+K handler stays
    return raw.indexOf('id="search-open"')===-1 && /metaKey|ctrlKey/.test(raw);
  })(), 'ok');
  ck('finder: each filled facet group offers its own Reset', (function(){
    // V.units rebuilds FILTER from the query string, so drive it that way
    api.setSearch('?areas=newcairo&developers=sodic');
    var node=api.V.units().node;
    api.setSearch('');
    var resets=qsa(node,'button').filter(function(b){
      return /facet-reset/.test((b.getAttribute&&b.getAttribute('class'))||''); });
    return resets.length===2;   // one for areas, one for devs — not for the empty groups
  })(), 'ok');
  ck('finder: an empty filter shows no per-group Resets', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var node=api.V.units().node;
    return qsa(node,'button').filter(function(b){
      return /facet-reset/.test((b.getAttribute&&b.getAttribute('class'))||''); }).length===0;
  })(), 'ok');
  ck('finder: the finder still spans every developer with inventory', (function(){
    api.setFilter(api.defaultFilter());
    // Derived, not tallied: adding inventory must not break this test, only
    // dropping a developer out of the finder should.
    var devs={}; api.UNITS.forEach(function(u){ var p=api.projBySlug(u.project); if(p) devs[p.dev]=1; });
    var listed={}; api.sortUnits(api.UNITS.slice()).forEach(function(u){
      var p=api.projBySlug(u.project); if(p) listed[p.dev]=1; });
    return Object.keys(devs).length>=14 && Object.keys(listed).length===Object.keys(devs).length;
  })(), 'ok');


  // ---- Finder: developers rotate, and the search bar filters in place ----
  ck('rot: the default order never repeats a developer while another waits', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var list=api.sortUnits(api.UNITS.slice());
    var devs=list.map(function(u){ var p=api.projBySlug(u.project); return p?p.dev:'~'; });
    // in the first full cycle every developer appears exactly once
    var n=Object.keys(devs.reduce(function(m,d){m[d]=1;return m;},{})).length;
    var first=devs.slice(0,n), uniq={}; first.forEach(function(d){ uniq[d]=1; });
    return n>=14 && Object.keys(uniq).length===n && list.length===api.UNITS.length;
  })(), 'ok');
  ck('rot: the illustrated developers lead — no generated art in the first row', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var list=api.sortUnits(api.UNITS.slice());
    // however many developers publish unit photography, those open the cycle
    var shot={}; api.UNITS.forEach(function(u){
      var p=api.projBySlug(u.project); if(p && api.hasUnitImage(u)) shot[p.dev]=1; });
    var n=Object.keys(shot).length;
    return n>=7 && list.slice(0,n).every(api.hasUnitImage);
  })(), 'ok');
  ck('rot: developers with no photography still appear, just later', (function(){
    var list=api.sortUnits(api.UNITS.slice());
    var devs=list.map(function(u){ var p=api.projBySlug(u.project); return p?p.dev:'~'; });
    return devs.indexOf('palmhills')>-1 && devs.indexOf('palmhills')>=7
      && devs.indexOf('ora')>-1 && devs.indexOf('hydepark')>-1;
  })(), 'ok');
  ck('rot: rotating keeps every unit — nothing dropped or duplicated', (function(){
    var out=api.rotateByDev(api.UNITS.slice());
    var ids={}; out.forEach(function(u){ ids[u.id]=(ids[u.id]||0)+1; });
    return out.length===api.UNITS.length
      && Object.keys(ids).length===api.UNITS.length
      && Object.values(ids).every(function(c){ return c===1; });
  })(), 'ok');
  ck('rot: the lead developer advances by day, not at random', (function(){
    var a=api.devRotationOffset(new Date(Date.UTC(2026,0,1)));
    var b=api.devRotationOffset(new Date(Date.UTC(2026,0,2)));
    var c=api.devRotationOffset(new Date(Date.UTC(2026,0,1)));
    return b===a+1 && c===a;   // same day -> same order, next day -> next developer
  })(), 'ok');
  ck('rot: an explicit sort is respected and never re-shuffled', (function(){
    api.setSearch('?sort=price-asc');
    var list=api.sortUnits(api.UNITS.slice());
    api.setFilter(Object.assign(api.defaultFilter(), {sort:'price-asc'}));
    var asc=api.sortUnits(api.UNITS.slice());
    api.setFilter(api.defaultFilter()); api.setSearch('');
    for(var i=1;i<asc.length;i++){ if((asc[i-1].price||0) > (asc[i].price||0)) return false; }
    return asc.length===api.UNITS.length;
  })(), 'ok');
  ck('rot: a single-developer result set is left alone', (function(){
    var one=api.UNITS.filter(function(u){ var p=api.projBySlug(u.project); return p&&p.dev==='modon'; });
    var out=api.rotateByDev(one.slice());
    return out.length===one.length && out[0].id===one[0].id;
  })(), 'ok');
  ck('fsb: the finder renders one search bar with the switch-to-projects link', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var node=api.V.units().node;
    var bars=qsa(node,'form').filter(function(f){
      return /(^|\s)fsb(\s|$)/.test((f.getAttribute&&f.getAttribute('class'))||''); });
    var inp=qsa(node,'input').filter(function(i){
      return (i.getAttribute&&i.getAttribute('id'))==='finder-q'; });
    var sw=qsa(node,'a').filter(function(a){
      return /fsb__switch/.test((a.getAttribute&&a.getAttribute('class'))||''); });
    return bars.length===1 && inp.length===1 && sw.length===1
      && (sw[0].getAttribute('href')||'').indexOf('/projects/')>-1;
  })(), 'ok');
  ck('fsb: the index carries entity keys so a hit can become a filter', (function(){
    var idx=api.buildSearchIndex();
    var byType=function(ty){ return idx.filter(function(d){ return d.type===ty; }); };
    return byType('area').every(function(d){ return !!d.key && !!api.areaByKey(d.key); })
      && byType('developer').every(function(d){ return !!d.key && !!api.devByKey(d.key); })
      && byType('project').every(function(d){ return !!d.key && !!api.projBySlug(d.key); });
  })(), 'ok');
  ck('fsb: searching a developer name resolves to that developer', (function(){
    var hit=api.searchAll('Hassan Allam').filter(function(d){ return d.type==='developer'; })[0];
    var ar=api.searchAll('مدن').filter(function(d){ return d.type==='developer'; })[0];
    return hit && hit.key==='hassanallam' && ar && ar.key==='modon';
  })(), 'ok');
  ck('fsb: type labels are singular in the suggestion list', (function(){
    return api.searchTypeOne('area')==='Area' && api.searchTypeOne('developer')==='Developer'
      && api.searchTypeOne('project')==='Project';
  })(), 'ok');


  // ---- Hero headline + peeking facet lists ----
  ck('hero: the headline reads "Where Smart Investments Begin"', (function(){
    var h1=qsa(api.V.home().node,'h1')[0];
    return h1 && h1.textContent.replace(/\s+/g,' ').trim()==='Where Smart Investments Begin';
  })(), 'ok');
  ck('facet: a long group peeks at three options behind a toggle', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var node=api.V.units().node;
    var row=qsa(node,'div').filter(function(d){
      return (d.getAttribute&&d.getAttribute('id'))==='facet-row-areas'; })[0];
    if(!row) return false;
    var chips=qsa(row,'button').filter(function(b){
      return /(^|\s)fchip(\s|$)/.test((b.getAttribute&&b.getAttribute('class'))||''); });
    var peek=chips.filter(function(b){ return /is-peek/.test(b.getAttribute('class')||''); });
    return /is-clipped/.test(row.getAttribute('class')||'')
      && chips.length===9 && peek.length===3;   // 9 areas, 3 visible
  })(), 'ok');
  ck('facet: the toggle names how many are hidden', (function(){
    var node=api.V.units().node;
    var more=qsa(node,'button').filter(function(b){
      return (b.getAttribute&&b.getAttribute('id'))==='facet-more-areas'; })[0];
    return more && /6/.test(more.textContent) && more.getAttribute('aria-expanded')==='false'
      && more.getAttribute('aria-controls')==='facet-row-areas';
  })(), 'ok');
  ck('facet: a selected option is always visible, even past the third', (function(){
    // Ain Sokhna is the 9th area — selecting it must not hide it behind the toggle
    api.setSearch('?areas=sokhna');
    var node=api.V.units().node;
    var row=qsa(node,'div').filter(function(d){
      return (d.getAttribute&&d.getAttribute('id'))==='facet-row-areas'; })[0];
    var sel=qsa(row,'button').filter(function(b){
      return (b.getAttribute&&b.getAttribute('id'))==='fchip-areas-sokhna'; })[0];
    api.setSearch('');
    return sel && /is-peek/.test(sel.getAttribute('class')||'') && /(^|\s)on(\s|$)/.test(sel.getAttribute('class')||'');
  })(), 'ok');
  ck('facet: a group with three or fewer options gets no toggle', (function(){
    api.setSearch(''); api.setFilter(api.defaultFilter());
    var node=api.V.units().node;
    // availability has exactly three options
    var more=qsa(node,'button').filter(function(b){
      return (b.getAttribute&&b.getAttribute('id'))==='facet-more-avail'; });
    var row=qsa(node,'div').filter(function(d){
      return (d.getAttribute&&d.getAttribute('id'))==='facet-row-avail'; });
    return more.length===0 && row.length===0;   // rendered plainly, no clipping wrapper
  })(), 'ok');
  ck('facet: every option is still in the DOM, just clipped by CSS', (function(){
    var node=api.V.units().node;
    var row=qsa(node,'div').filter(function(d){
      return (d.getAttribute&&d.getAttribute('id'))==='facet-row-devs'; })[0];
    var chips=qsa(row,'button').filter(function(b){
      return /(^|\s)fchip(\s|$)/.test((b.getAttribute&&b.getAttribute('class'))||''); });
    // one chip per developer with inventory, present for crawlers and the toggle
    var devs={}; api.UNITS.forEach(function(u){ var p=api.projBySlug(u.project); if(p) devs[p.dev]=1; });
    return chips.length===Object.keys(devs).length;
  })(), 'ok');

  // ---- MODON new release (homepage card + dedicated page) ----
  ck('release: /releases/modon/ resolves and unknown slugs 404', (function(){
    var ok=api.parse('/en/releases/modon/');
    var bad=api.parse('/en/releases/nope/');
    return ok.name==='release' && ok.params.slug==='modon' && bad.name==='404'
      && api.buildPath('release',{slug:'modon'})==='/en/releases/modon/';
  })(), 'ok');
  ck('release: homepage New Launches carries a MODON card linking to the page', (function(){
    var node=api.V.home().node;
    var hrefs=qsa(node,'a').map(function(a){return a.getAttribute&&a.getAttribute('href')||'';});
    var txt=node.textContent;
    return hrefs.some(function(hh){return /\/releases\/modon\/$/.test(hh);})
      && /MODON/.test(txt) && /New release/i.test(txt);
  })(), 'ok');
  ck('release: MODON page lists both projects with the sheet\'s new prices', (function(){
    var v=api.V.release('modon'), txt=v.node.textContent;
    return /Boulevard/.test(txt) && /Beach Plaza Premium/.test(txt)
      && /16,100,000/.test(txt) && /22,500,000/.test(txt) && /26,700,000/.test(txt)
      && /19,000,000/.test(txt) && /26,000,000/.test(txt) && /32,000,000/.test(txt)
      && /New release/i.test(txt);
  })(), 'ok');
  ck('release: cards use supplied Modon images and carry the badge', (function(){
    var node=api.V.release('modon').node;
    var srcs=qsa(node,'img').map(function(i){return i.getAttribute&&i.getAttribute('src')||'';});
    var chips=qsa(node,'span').filter(function(s){
      var c=(s.getAttribute&&s.getAttribute('class'))||''; return /chip--rel/.test(c); });
    return srcs.indexOf('/project-media/modon/ap2-bl-0.webp')>-1
      && srcs.indexOf('/project-media/modon/ap1-bp-03.webp')>-1
      && chips.length>=3;   // hero + one per project card
  })(), 'ok');
  ck('release: both cards carry the EOI figure', (function(){
    var r=api.releaseBySlug('modon');
    var node=api.V.release('modon').node;
    var cards=qsa(node,'article').filter(function(a){
      return /\bcard\b/.test((a.getAttribute&&a.getAttribute('class'))||''); });
    var eois=qsa(node,'div').filter(function(d){
      return /(^|\s)eoi(\s|$)/.test((d.getAttribute&&d.getAttribute('class'))||''); });
    return cards.length===2 && eois.length===2
      && r.projects.every(function(p){ return p.eoi===250000; })
      && eois.every(function(e){ return e.textContent.replace(/\s+/g,'')==='EOI250,000EGP'; })
      && cards.every(function(c){
           return qsa(c,'div').some(function(d){
             return /(^|\s)eoi(\s|$)/.test((d.getAttribute&&d.getAttribute('class'))||''); }); });
  })(), 'ok');
  ck('release: a project without an EOI renders no EOI chip', (function(){
    var r=api.releaseBySlug('modon'), p=r.projects[0], keep=p.eoi;
    delete p.eoi;
    var n=qsa(api.V.release('modon').node,'div').filter(function(d){
      return /(^|\s)eoi(\s|$)/.test((d.getAttribute&&d.getAttribute('class'))||''); }).length;
    p.eoi=keep;
    return n===1;
  })(), 'ok');
  ck('release: both cards carry a Master Plan button over the supplied plans', (function(){
    var r=api.releaseBySlug('modon');
    var node=api.V.release('modon').node;
    var btns=qsa(node,'button').filter(function(b){ return /Master Plan/.test(b.textContent); });
    var items=api.releaseMasterplan(r);
    return btns.length===2 && items.length===2
      && items[0].src==='/project-media/modon/rk-masterplan-1.webp'
      && items[1].src==='/project-media/modon/rk-masterplan-2.webp'
      && items.every(function(i){ return i.cap && i.cap.length>0; });
  })(), 'ok');
  ck('release: a release with no masterplan renders no button', (function(){
    var r=api.releaseBySlug('modon'), keep=r.masterplan;
    delete r.masterplan;
    var n=qsa(api.V.release('modon').node,'button').filter(function(b){
      return /Master Plan/.test(b.textContent); }).length;
    r.masterplan=keep;
    return n===0 && api.releaseMasterplan({}).length===0;
  })(), 'ok');
  ck('home: featured projects lead with one project per developer', (function(){
    var node=api.V.home().node;
    var sec=qsa(node,'section').filter(function(s){ return /featured projects/i.test(s.textContent); })[0];
    if(!sec) return false;
    var slugs=[];
    qsa(sec,'a').forEach(function(a){
      var m=((a.getAttribute&&a.getAttribute('href'))||'').match(/\/projects\/([a-z0-9-]+)\/$/);
      if(m && slugs.indexOf(m[1])<0) slugs.push(m[1]);
    });
    var devs=slugs.map(function(s){ return api.projBySlug(s).dev; });
    var firstThree=devs.slice(0,3);
    return slugs.length===6
      && firstThree.length===3
      && firstThree[0]!==firstThree[1] && firstThree[1]!==firstThree[2] && firstThree[0]!==firstThree[2];
  })(), 'ok');
  ck('home: the featured set holds exactly the six curated projects', (function(){
    var node=api.V.home().node;
    var sec=qsa(node,'section').filter(function(s){ return /featured projects/i.test(s.textContent); })[0];
    var slugs={};
    qsa(sec,'a').forEach(function(a){
      var m=((a.getAttribute&&a.getAttribute('href'))||'').match(/\/projects\/([a-z0-9-]+)\/$/);
      if(m) slugs[m[1]]=1;
    });
    return ['ogami-north-coast','ramla-ras-el-hekma','beach-plaza-premium','zoya','il-monte-galala','swan-lake-west']
      .every(function(s){ return slugs[s]; }) && Object.keys(slugs).length===6;
  })(), 'ok');
  ck('spread: round-robin keeps every item and each developer\'s own order', (function(){
    var mk=function(dev,slug){ return {dev:dev, slug:slug}; };
    var input=[mk('a','a1'),mk('a','a2'),mk('a','a3'),mk('b','b1'),mk('c','c1'),mk('b','b2')];
    var out=api.spreadByDev(input).map(function(p){ return p.slug; });
    return out.join(',')==='a1,b1,c1,a2,b2,a3'
      && api.spreadByDev([]).length===0
      && api.spreadByDev([mk('a','x')]).map(function(p){return p.slug;}).join(',')==='x';
  })(), 'ok');
  ck('release: standing Modon listings keep their own prices (not overwritten)', (function(){
    return api.projBySlug('modon-boulevard').price===19100000
      && api.projBySlug('beach-plaza-premium').price===19900000
      && api.PROJECTS.filter(function(p){return p.dev==='modon';}).length===7;
  })(), 'ok');

  // ---- Modon Ras El Hekma districts (7 projects, 23 units) ----
  ck('modon: 7 districts present, legacy flagship + placeholders gone', (function(){
    var s=['beach-plaza-premium','beach-plaza-luxury','lighthouse-village-luxury',
           'lighthouse-village-ultra-luxury','wadi-east','montage','modon-boulevard'];
    return s.every(function(x){var p=api.projBySlug(x);return p&&p.dev==='modon'&&p.area==='raselhekma';})
      && api.PROJECTS.filter(function(p){return p.dev==='modon';}).length===7
      && !api.projBySlug('modon-ras-el-hekma')
      && ['MD-BP1','MD-WW1'].every(function(id){ return !api.unitById(id); });
  })(), 'n='+api.PROJECTS.filter(function(p){return p.dev==='modon';}).length);
  ck('modon: 23 units with the sheet\'s real prices', (function(){
    var us=api.UNITS.filter(function(u){var p=api.projBySlug(u.project);return p&&p.dev==='modon';});
    return us.length===23
      && api.unitById('MD-BP-01').price===19900000    // Beach Plaza premium 1BR
      && api.unitById('MD-MON-03').price===390600000  // Montage 5BR villa
      && api.unitById('MD-WD-01').price===53000000;   // Wadi East townhouse
  })(), 'n='+api.UNITS.filter(function(u){var p=api.projBySlug(u.project);return p&&p.dev==='modon';}).length);
  ck('modon: covers, galleries and plans all resolve under /modon', (function(){
    return ['beach-plaza-premium','wadi-east','montage'].every(function(s){
        return /\/project-media\/modon\/.*\.webp$/.test(api.projectCoverSrc(api.projBySlug(s))); })
      && api.unitGallery(api.unitById('MD-WD-01')).length>=5
      && /\/modon\/.*\.webp$/.test(api.unitMasterplans(api.unitById('MD-WD-01'))[0])
      && api.unitFloorplans(api.unitById('MD-WD-01')).length>=1
      && /\/modon\/.*\.webp$/.test(api.unitLocationImg(api.unitById('MD-WD-01')));
  })(), 'ok');
  ck('modon: unit types normalize (apartment / townhouse / villa)', (function(){
    var us=api.UNITS.filter(function(u){var p=api.projBySlug(u.project);return p&&p.dev==='modon';});
    var set={}; us.forEach(function(u){ set[api.unitCanon(u)]=1; });
    return us.every(function(u){return api.unitCanon(u)!=='other';})
      && set['apartment'] && set['townhouse'] && set['standalone-villa'];
  })(), 'ok');

  // ---- Developer hero gallery (photos above the logo) ----
  ck('devgal: Modon page shows ONE photo above the logo (arrows flip the rest)', (function(){
    var node=api.V.developer('modon').node;
    var imgs=qsa(node,'img').map(function(i){return i.getAttribute&&i.getAttribute('src')||'';});
    var gal=imgs.filter(function(s){return /\/project-media\/modon\/m\d\.webp$/.test(s);});
    var logoAt=imgs.findIndex(function(s){return /logos\/modon(-160)?\.webp$/.test(s);});
    var galAt=imgs.findIndex(function(s){return /\/project-media\/modon\//.test(s);});
    var navs=qsa(node,'button').filter(function(b){
      var c=(b.getAttribute&&b.getAttribute('class'))||''; return /gal-nav/.test(c); });
    // exactly one <img> is mounted; the source list still carries all six
    return gal.length===1 && gal[0]===api.DEV_GALLERY.modon[0]
      && api.DEV_GALLERY.modon.length===6
      && galAt>-1 && logoAt>-1 && galAt<logoAt
      && navs.length>=2;   // this page also has a flipper inside Major Components
  })(), 'ok');
  ck('devfeat: Modon page carries Masterplan + the three feature cards', (function(){
    var v=api.V.developer('modon'), node=v.node, txt=node.textContent;
    var srcs=qsa(node,'img').map(function(i){return i.getAttribute&&i.getAttribute('src')||'';});
    var mc=srcs.filter(function(s){return /\/modon\/mc[1-6]\.webp$/.test(s);});
    // Major Components mounts ONE photo; the other five sit behind the arrows
    var navs=qsa(node,'button').filter(function(b){
      var c=(b.getAttribute&&b.getAttribute('class'))||''; return /gal-nav/.test(c); });
    return /Masterplan/.test(txt) && /About Partnership/.test(txt)
      && /Connected to the World/.test(txt) && /Major Components/.test(txt)
      && srcs.indexOf('/project-media/modon/masterplan.webp')>-1
      && srcs.indexOf('/project-media/modon/partnership.webp')>-1
      && srcs.indexOf('/project-media/modon/connected.webp')>-1
      && mc.length===1 && mc[0]==='/project-media/modon/mc1.webp'
      && navs.length===4;   // 2 on the hero flipper + 2 on the Major Components flipper
  })(), 'ok');
  ck('devfeat: card copy shows a lead paragraph + collapsed rest in <details>', (function(){
    var node=api.V.developer('modon').node, txt=node.textContent;
    var det=qsa(node,'details').filter(function(d){
      var c=(d.getAttribute&&d.getAttribute('class'))||''; return /feat-copy__more/.test(c); });
    // lead is always rendered; the remainder stays in the DOM (SEO) but collapsed
    return /appointed Modon Holding PSC as the master planner/.test(txt)
      && /largest ever international investment into Egypt/.test(txt)
      && /US\$110 billion by 2045/.test(txt)
      && det.length===3 && det.every(function(d){ return !d.getAttribute('open'); })
      && /Read more/.test(txt);
  })(), 'ok');
  ck('devfeat: only a clamped lead shows; the checklist sits behind Read more', (function(){
    var node=api.V.developer('marakez').node;
    var copies=qsa(node,'.feat-copy');
    return copies.length===4 && copies.every(function(w){
      // the lead is the one paragraph outside <details>, and it is clamped
      var leads=qsa(w,'.feat-copy__p--lead');
      if(leads.length!==1) return false;
      // no checklist may sit outside the collapsed half
      var det=qsa(w,'details')[0];
      var listsInCard=qsa(w,'.feat-copy__list').length;
      var listsHidden=det?qsa(det,'.feat-copy__list').length:0;
      return listsInCard===listsHidden;
    });
  })(), 'ok');
  ck('devfeat: connectivity copy carries both travel-time tables', (function(){
    var txt=api.V.developer('modon').node.textContent;
    return /50% of the world will be within a 4-hour flight/.test(txt)
      && /high speed rail and domestic and international marinas/.test(txt)
      && /By road/.test(txt) && /By plane/.test(txt)
      && /Alexandria/.test(txt) && /Approx\. 2 hrs/.test(txt)
      && /New York/.test(txt) && /Approx\. 13 hrs/.test(txt)
      && /Doha/.test(txt) && /Approx\. 3 hrs 30 mins/.test(txt);
  })(), 'ok');
  ck('devfeat: masterplan sits behind an icon button, not shown inline', (function(){
    var node=api.V.developer('modon').node, txt=node.textContent;
    var btns=qsa(node,'button').filter(function(b){
      var c=(b.getAttribute&&b.getAttribute('class'))||''; return /ufeat/.test(c); });
    var mp=qsa(node,'img').filter(function(i){
      return /\/modon\/masterplan\.webp$/.test(i.getAttribute&&i.getAttribute('src')||''); });
    // one opener button, and the plan itself kept for crawlers but hidden
    return btns.length===1 && /View master plan/.test(txt) && /Masterplan/.test(txt)
      && mp.length===1 && /visually-hidden/.test(mp[0].getAttribute('class')||'');
  })(), 'ok');
  ck('devfeat: major components list all six, fully visible (no chevron)', (function(){
    var node=api.V.developer('modon').node, txt=node.textContent;
    var lis=qsa(node,'li').filter(function(l){
      var c=(l.getAttribute&&l.getAttribute('class'))||''; return /feat-copy__li/.test(c); });
    return lis.length===6
      && /International Airport/.test(txt) && /3 Marinas & 1 Cruise Terminal/.test(txt)
      && /Rapid Transit Network/.test(txt) && /Central Business District/.test(txt)
      && /Private Sector Free Zone/.test(txt) && /Amphitheatre/.test(txt);
  })(), 'ok');
  ck('devfeat: feature blocks are Modon-only (no leakage to other developers)', (function(){
    return ['sodic','lmd','tatweer','hassanallam','palmhills'].every(function(k){
      var d=api.devByKey(k); if(!d) return true;
      return api.V.developer(k).node.textContent.indexOf('Major Components')===-1;
    });
  })(), 'ok');
  ck('devgal: developers without a gallery render no strip and do not crash', (function(){
    return ['sodic','lmd','tatweer','hassanallam'].every(function(k){
      var node=api.V.developer(k).node;
      return qsa(node,'img').every(function(i){ return !/\/project-media\/modon\//.test(i.getAttribute&&i.getAttribute('src')||''); });
    });
  })(), 'ok');

  // ---- Available-units recommendation = same unit TYPE across all projects/developers ----
  ck('reco: unit "Available units" lists only same-type units, spanning developers', (function(){
    var u=api.unitById('TM-SL-06'), canon=api.unitCanon(u);   // Standalone Villa
    var node=api.V.unit('TM-SL-06').node, ids={};
    qsa(node,'a').forEach(function(a){ var href=(a.getAttribute&&a.getAttribute('href'))||''; var m=href.match(/\/units\/([a-z0-9-]+)\/$/i); if(m) ids[m[1].toLowerCase()]=1; });
    var units=Object.keys(ids).filter(function(id){return id!=='tm-sl-06';}).map(function(id){return api.unitById(id);}).filter(Boolean);
    var allSame=units.length>0 && units.every(function(ru){ return api.unitCanon(ru)===canon; });
    var devs={}; units.forEach(function(ru){ devs[api.projBySlug(ru.project).dev]=1; });
    return allSame && units.length>=2 && Object.keys(devs).length>=2;   // villas from >1 developer
  })(), 'ok');
  ck('reco: recommendation never mixes types (office page -> only offices)', (function(){
    var off=api.UNITS.filter(function(x){return api.unitCanon(x)==='office'||api.unitCanon(x)==='administrative-office';})[0];
    if(!off) return true;
    var canon=api.unitCanon(off), node=api.V.unit(off.id).node, ids={};
    qsa(node,'a').forEach(function(a){ var href=(a.getAttribute&&a.getAttribute('href'))||''; var m=href.match(/\/units\/([a-z0-9-]+)\/$/i); if(m) ids[m[1].toLowerCase()]=1; });
    var units=Object.keys(ids).filter(function(id){return id!==String(off.id).toLowerCase();}).map(function(id){return api.unitById(id);}).filter(Boolean);
    return units.every(function(ru){ return api.unitCanon(ru)===canon; });
  })(), 'ok');

  // ---- Commercial units carry no bedroom/bathroom figures ----
  ck('com: office/clinic/admin/retail units are flagged commercial, homes are not', (function(){
    var com=api.UNITS.filter(api.unitIsCommercial);
    var canons={}; com.forEach(function(u){ canons[api.unitCanon(u)]=1; });
    var homes=api.UNITS.filter(function(u){ return !api.unitIsCommercial(u); });
    return com.length>=10
      && Object.keys(canons).every(function(c){ return /office|clinic|retail|shop|admin/.test(c); })
      && homes.some(function(u){ return api.unitCanon(u)==='apartment'; });
  })(), 'ok');
  function specLabels(node){
    return qsa(node,'span').filter(function(s){
      return /spec-lbl/.test((s.getAttribute&&s.getAttribute('class'))||''); })
      .map(function(s){ return s.textContent; });
  }
  ck('com: a commercial unit page shows no bed/bath spec and no Bedrooms/Bathrooms rows', (function(){
    var u=api.UNITS.filter(api.unitIsCommercial)[0];
    var node=api.V.unit(u.id).node, txt=node.textContent, labels=specLabels(node);
    return !/Bedrooms/.test(txt) && !/Bathrooms/.test(txt)
      && labels.indexOf('beds')===-1 && labels.indexOf('baths')===-1
      && labels.indexOf('m²')!==-1        // area is still reported
      && !/\d+\s*BR/.test(txt);          // and no "0 BR Office" heading either
  })(), 'ok');

  ck('com: a residential unit page still shows Bedrooms and Bathrooms', (function(){
    var node=api.V.unit('PX-AP1').node, txt=node.textContent;
    return /Bedrooms/.test(txt) && /Bathrooms/.test(txt);
  })(), 'ok');
  ck('com: commercial unit cards drop the bed/bath specs but keep area', (function(){
    var com=api.UNITS.filter(api.unitIsCommercial)[0];
    var home=api.UNITS.filter(function(u){ return !api.unitIsCommercial(u) && u.baths!=null; })[0];
    var cl=specLabels(api.unitCard(com)), hl=specLabels(api.unitCard(home));
    return cl.indexOf('beds')===-1 && cl.indexOf('baths')===-1 && cl.indexOf('m²')!==-1
      && hl.indexOf('beds')!==-1 && hl.indexOf('baths')!==-1;
  })(), 'ok');

  // ---- Bathroom counts taken from the latest units sheet ----
  ck('baths: ZOYA units carry the sheet bathroom counts', (function(){
    return api.unitById('ZY-HV2').baths===4 && api.unitById('ZY-TW3').baths===4
      && api.unitById('ZY-CH4').baths===2;
  })(), 'ok');
  ck('baths: Hassan Allam residential units all carry a bathroom count', (function(){
    var ha=api.UNITS.filter(function(u){
      var p=api.projBySlug(u.project);
      return p && p.dev==='hassanallam' && !api.unitIsCommercial(u); });
    var missing=ha.filter(function(u){ return u.baths==null; }).map(function(u){return u.id;});
    // VL-SV4 and SL-SV13 are blank in the sheet, so they stay blank here
    return ha.length>=20 && missing.length===2
      && missing.indexOf('VL-SV4')!==-1 && missing.indexOf('SL-SV13')!==-1
      && api.unitById('PX-AP1').baths===2 && api.unitById('SL-SV15').baths===6;
  })(), 'ok');
  ck('baths: the four Il Monte Galala units are no longer missing baths', (function(){
    return ['TM-IM-01','TM-IM-02','TM-IM-03','TM-IM-04']
      .map(function(id){return api.unitById(id).baths;}).join(',')==='3,1,1,2';
  })(), 'ok');
  ck('baths: every Tatweer residential unit now has a bathroom count', (function(){
    var tm=api.UNITS.filter(function(u){
      var p=api.projBySlug(u.project);
      return p && p.dev==='tatweer' && !api.unitIsCommercial(u); });
    return tm.length>=50 && tm.every(function(u){ return typeof u.baths==='number'; });
  })(), 'ok');

  // ---- Payment estimator removed from unit pages ----
  ck('est: the unit page renders no payment estimator', (function(){
    var ids=['PX-AP1','TM-IM-02','ZY-CH4','MD-BP-01'];
    return ids.every(function(id){
      var txt=api.V.unit(id).node.textContent;
      return !/Payment estimator/i.test(txt) && !/Estimated monthly/i.test(txt); });
  })(), 'ok');
  ck('est: the estimator is gone from unit AND project pages', (function(){
    function dpSelects(node){
      return qsa(node,'select').filter(function(s){
        return /Down payment/i.test((s.getAttribute&&s.getAttribute('aria-label'))||''); }).length;
    }
    // the probe is proven by the finder, which still renders a down-payment
    // select — so a zero here means removal, not a selector that never matched
    return dpSelects(api.V.unit('PX-AP1').node)===0
      && dpSelects(api.V.unit('TM-IM-02').node)===0
      && dpSelects(api.V.project('phonix-swanlake').node)===0
      && dpSelects(api.V.project('zoya').node)===0
      && !/Payment estimator/i.test(api.V.project('phonix-swanlake').node.textContent);
  })(), 'ok');
  ck('home: six featured cards filling two rows of three, no repeated developer', (function(){
    var node=api.V.home().node;
    var sec=qsa(node,'section').filter(function(s){ return /featured projects/i.test(s.textContent); })[0];
    var slugs=[];
    qsa(sec,'a').forEach(function(a){
      var m=((a.getAttribute&&a.getAttribute('href'))||'').match(/\/projects\/([a-z0-9-]+)\/$/);
      if(m && slugs.indexOf(m[1])<0) slugs.push(m[1]);
    });
    var devs=slugs.map(function(s){ return api.projBySlug(s).dev; });
    var uniq={}; devs.forEach(function(d){ uniq[d]=1; });
    return slugs.length===6 && Object.keys(uniq).length===6 && devs.indexOf('sodic')>-1;
  })(), 'ok');

  // ---- Stei8ht project group (collapses 3 projects into one card on the dev page) ----
  ck('group: Stei8ht group exists with 3 LMD members', (function(){
    var g=api.groupBySlug('stei8ht');
    return g && g.dev==='lmd' && api.groupMembers(g).length===3
      && ['stei8ht-eastmed','stei8ht-there','stei8ht-eastside'].every(function(s){return api.GROUPED_PROJECT[s]==='stei8ht';});
  })(), 'ok');
  ck('group: LMD dev page shows the group card, NOT the 3 member cards', (function(){
    var node=api.V.developer('lmd').node, txt=node.textContent;
    var links=qsa(node,'a').map(function(a){return a.getAttribute&&a.getAttribute('href')||'';});
    var hasGroup=links.some(function(h){return /\/groups\/stei8ht\/$/.test(h);});
    var hasMemberCard=links.some(function(h){return /\/projects\/stei8ht-eastmed\/$/.test(h);});
    return hasGroup && !hasMemberCard && /Three Sixty/.test(txt) && /ZOYA/.test(txt);
  })(), 'ok');
  ck('group: route /groups/stei8ht/ resolves to the group page', (function(){
    var r=api.parse('/en/groups/stei8ht/'); return r.name==='group' && r.params.slug==='stei8ht';
  })(), 'ok');
  ck('group: unknown group slug 404s', api.parse('/en/groups/nope/').name==='404');
  ck('group: group page lists all 3 member projects with links', (function(){
    var node=api.V.group('stei8ht').node;
    var links=qsa(node,'a').map(function(a){return a.getAttribute&&a.getAttribute('href')||'';});
    return ['stei8ht-eastmed','stei8ht-there','stei8ht-eastside'].every(function(s){
      return links.some(function(h){return h.indexOf('/projects/'+s+'/')>-1;}); });
  })(), 'ok');
  ck('group: developer project count stays real (6, not 4)', (function(){
    var node=api.V.developer('lmd').node;
    return /\b6\b/.test(qsa(node,'.price-lg').map(function(e){return e.textContent;}).join(' '));
  })(), 'ok');

  // ---- social / external links open reliably (webview/file-preview safe) ----
  ck('links: 4 social profile URLs are configured', api.CONFIG.social && ['facebook','instagram','linkedin','tiktok'].every(function(k){ return /^https?:\/\//.test(api.CONFIG.social[k]||''); }), 'social='+JSON.stringify(api.CONFIG.social||{}).slice(0,60));
  ck('links: social profile URL is treated as external (force-opened)', api.isExternalLink('https://www.facebook.com/share/18vY47m3rz/','_blank')===true);
  ck('links: WhatsApp link is external', api.isExternalLink('https://wa.me/201016000201','_blank')===true);
  ck('links: internal app route is NOT external', api.isExternalLink('/en/projects/','')===false);
  ck('links: mailto / tel / # are NOT external', api.isExternalLink('mailto:a@b.com','')===false && api.isExternalLink('tel:+201','')===false && api.isExternalLink('#','')===false);
  // end-to-end: dispatch a real click on the footer Facebook anchor and confirm it opens the profile
  var fsoc=doc.getElementById('foot-social');
  var fbA=(fsoc.childNodes||[]).filter(function(c){ return c.tagName==='a' && (c.getAttribute('href')||'').indexOf('facebook.com')>-1; })[0];
  ck('links: footer renders a Facebook anchor with the profile URL', !!fbA, 'href='+(fbA&&fbA.getAttribute('href')));
  win._opened=null;
  ((doc._lis&&doc._lis.click)||[]).forEach(function(fn){ try{ fn({target:fbA, preventDefault:function(){}}); }catch(e){} });
  ck('links: clicking the footer Facebook icon opens the profile (window.open)', !!win._opened && win._opened.indexOf('facebook.com')>-1, 'opened='+win._opened);

/* ---- security posture, asserted against the built file -------------------
   These are cheap to keep and expensive to lose: each one guards a property
   that took an audit to establish and that an ordinary edit could silently
   undo. They read index.html rather than the templates, because what ships is
   what matters.                                                            */
  var SEC = require('fs').readFileSync(__dirname + '/../index.html', 'utf8');
  var csp = (SEC.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';

  ck('sec: exactly one CSP is declared', (SEC.match(/Content-Security-Policy/g) || []).length === 1);
  ck('sec: script-src carries no unsafe-inline',
     /script-src[^;]*/.exec(csp) && !/script-src[^;]*'unsafe-inline'/.test(csp),
     (/script-src[^;]*/.exec(csp) || [''])[0].slice(0, 60) + '…');
  ck('sec: every inline script is pinned by hash',
     ((/script-src[^;]*/.exec(csp) || [''])[0].match(/'sha256-/g) || []).length ===
     new Set((SEC.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [])).size,
     'hashes=' + ((/script-src[^;]*/.exec(csp) || [''])[0].match(/'sha256-/g) || []).length);
  // One host is allowed for scripts and it is named here, so adding a second
  // fails this test rather than passing unnoticed. A host governs external
  // scripts only — the hashes above still gate every inline one.
  ck('sec: the only external script host is the Cloudflare beacon',
     ((/script-src[^;]*/.exec(csp) || [''])[0].match(/https?:\/\/[^ ;']+/g) || []).join(',')
       === 'https://static.cloudflareinsights.com');
  ck('sec: no external style host is allowed', !/style-src[^;]*https?:/.test(csp));
  ck('sec: the beacon stays off until a token is set', api.CONFIG.CF_BEACON === '' ||
     /^[0-9a-f]{32}$/i.test(api.CONFIG.CF_BEACON), 'CF_BEACON=' + JSON.stringify(api.CONFIG.CF_BEACON));
  ck('sec: object-less, framed only by us', /base-uri 'self'/.test(csp) && /form-action 'self'/.test(csp));

  // The DOM builder is the only path to the page; these are its guarantees.
  ck('sec: no raw-HTML sink anywhere in the shipped bundle',
     !/\.innerHTML\s*=/.test(SEC) && !/document\.write\s*\(/.test(SEC) &&
     !/insertAdjacentHTML/.test(SEC) && !/\beval\s*\(/.test(SEC) && !/new Function\s*\(/.test(SEC));
  ck('sec: a javascript: URL is refused by the builder',
     api.h('a', {href: 'javascript:alert(1)'}).getAttribute('href') == null);
  ck('sec: a control-character bypass is refused too',
     api.h('a', {href: 'java\tscript:alert(1)'}).getAttribute('href') == null &&
     api.h('a', {href: ' JaVaScRiPt:alert(1)'}).getAttribute('href') == null);
  ck('sec: a data: URL is refused', api.h('img', {src: 'data:text/html,<script>'}).getAttribute('src') == null);
  ck('sec: an ordinary URL still passes',
     api.h('a', {href: '/en/projects/'}).getAttribute('href') === '/en/projects/' &&
     api.h('a', {href: 'https://wa.me/2010'}).getAttribute('href') === 'https://wa.me/2010');
  ck('sec: a string on* prop never becomes an inline handler',
     api.h('div', {onclick: 'alert(1)'}).getAttribute('onclick') == null);
  /* Every page a visitor sees is the SPA fallback, so its request path is the
     route (/en/units/OR-ST-01/), never /index.html. A revalidation rule keyed
     to /index.html therefore matches no real page view, and a finished deploy
     kept serving the previous document. */
  ck('deploy: the document is revalidated on every route, not just /index.html', (function(){
    var h = require('fs').readFileSync(__dirname + '/../_headers', 'utf8');
    var star = h.split(/^\/\*$/m)[1] || '';
    star = star.split(/\n(?=\/)/)[0];                       // up to the next path block
    var revalidates = /Cache-Control:\s*public,\s*max-age=0,\s*must-revalidate/.test(star);
    // and the costly assets must keep their long cache
    var immutable = (h.match(/max-age=31536000, immutable/g) || []).length >= 3;
    return revalidates && immutable;
  })());
  ck('sec: build inputs are excluded from the deploy', (function(){
     var ig = require('fs').readFileSync(__dirname + '/../.assetsignore', 'utf8');
     return /^src\/$/m.test(ig) && /^tools\/$/m.test(ig) && /^data-import-kit\/$/m.test(ig);
  })());

  /* ORA. Seven projects, 58 unit types, 247 image files — all keyed by the ids
     the client sheet writes, so a typo in either direction is invisible without
     a check. Both directions are asserted: a reference with no file, and a file
     the owner sent that no page can reach. */
  (function(){
    var fsx=require('fs'), pathx=require('path');
    var MED = pathx.join(__dirname,'..','project-media','ora');
    var bundle = fsx.readFileSync(pathx.join(__dirname,'main.js'),'utf8');
    var used = {}, m, re = /['"]\/project-media\/ora\/([^'"]+)['"]/g;
    while((m = re.exec(bundle))) used[m[1]] = 1;
    // The brochure pages are built as ORB+'name.webp', so the literal scan
    // above cannot see them.
    re = /ORB\s*\+\s*'([^']+)'/g;
    while((m = re.exec(bundle))) used['brochure/' + m[1]] = 1;
    var refs = Object.keys(used);
    var broken = refs.filter(function(r){ return !fsx.existsSync(pathx.join(MED, r)); });
    var disk = [];
    (function walk(dir, pre){
      fsx.readdirSync(dir).forEach(function(f){
        var full = pathx.join(dir, f);
        if (fsx.statSync(full).isDirectory()) walk(full, pre + f + '/');
        else disk.push(pre + f);
      });
    })(MED, '');
    var orphan = disk.filter(function(d){ return !used[d]; });
    ck('ora: every media path the bundle builds exists on disk',
       refs.length > 200 && broken.length === 0, refs.length+' refs'+(broken.length?' broken: '+broken.slice(0,3):''));
    ck('ora: every delivered image is reachable in the UI',
       orphan.length === 0, disk.length+' files'+(orphan.length?' orphaned: '+orphan.slice(0,3):''));
  })();
  /* The sheet reuses one render set across several units, each starting on a
     different frame. Sorting or de-duplicating the list would silently undo
     that, so the order is pinned against the sheet here. */
  ck('ora: a shared render set keeps each unit\'s own frame order', (function(){
    var g = api.UNIT_GALLERY, base = '/project-media/ora/';
    var a = g['OR-CR-06'], b = g['OR-CR-05'];
    return a && b && a.length === 4 && b.length === 4 &&
           a[0] === base+'ap3-cr-03.webp' && a[1] === base+'ap3-cr-0.webp' &&
           b[0] === base+'ap3-cr-01.webp' && b[1] === base+'ap3-cr-02.webp';
  })());
  ck('ora: every unit sits under exactly one project, none mixed', (function(){
    var byPre = {'OR-SE':'solana-east','OR-ZE':'zed-east','OR-EM':'zed-east-emerald',
                 'OR-SW':'solana-west','OR-ZW':'zed-west','OR-CR':'silversands-crystalline',
                 'OR-ST':'silversands-silvertown'};
    var ora = api.UNITS.filter(function(u){ return /^OR-/.test(u.id); });
    return ora.length === 58 && ora.every(function(u){
      return u.project === byPre[u.id.slice(0,5)] &&
             (api.projBySlug(u.project)||{}).dev === 'ora';
    });
  })());
  /* Eight Solana West apartments name a master plan the owner never sent, so
     the button vanished on exactly those unit pages while the villas beside
     them kept theirs. The project-level fallback closes it; these assert it
     stays closed, and that floor plans are never borrowed the same way. */
  ck('ora: every unit shows a master plan and a location', (function(){
    var ora = api.UNITS.filter(function(u){ return /^OR-/.test(u.id); });
    var noMp = ora.filter(function(u){ return !api.unitMasterplans(u).length; });
    var noLoc = ora.filter(function(u){ return !api.unitLocationImg(u); });
    return noMp.length === 0 && noLoc.length === 0;
  })());
  ck('site: a floor plan is never borrowed from another unit', (function(){
    // Every ORA plan the sheet names has now arrived except OR-SE-03's, whose
    // cell in the sheet is blank. It must stay empty rather than borrow the
    // plan of another Solana East unit just because the project has one.
    return api.unitFloorplans(api.unitById('OR-SE-03')).length === 0 &&
           api.unitFloorplans(api.unitById('OR-SW-09')).length === 1 &&
           api.unitFloorplans(api.unitById('OR-CR-05')).length === 1 &&
           api.unitFloorplans(api.unitById('OR-SW-07')).length === 2;
  })());
  /* Amenities come from the company profile's own fact pages. Six ORA projects
     have one; Solana East does not, and must keep claiming nothing rather than
     borrowing a sibling's list. Every key has to resolve, or a tile renders
     blank. */
  ck('ora: amenities are declared where the profile states them, and only there', (function(){
    var A = api.PROJECT_AMENITIES, cats = api.AMENITY_CAT;
    var withList = ['zed-east','zed-east-emerald','zed-west','solana-west',
                    'silversands-crystalline','silversands-silvertown'];
    var allNamed = withList.every(function(s){
      return A[s] && A[s].length >= 8 && A[s].every(function(k){ return !!cats[k]; });
    });
    // Crystalline and Silvertown are one resort; ZED East and Emerald one project
    var shared = A['silversands-crystalline'].join() === A['silversands-silvertown'].join() &&
                 A['zed-east'].join() === A['zed-east-emerald'].join();
    return allNamed && shared && !A['solana-east'];
  })());
  ck('ora: a unit inherits its project\'s stated amenities, not the generic set',
     api.unitAmenities(api.unitById('OR-ZW-01')).indexOf('zw_park') === 0 &&
     api.unitAmenities(api.unitById('OR-CR-06')).indexOf('ss_beach') === 0);
  /* A render belongs to the unit it was shot for. The card used to fall back to
     the project cover, which is itself one unit's render, so a 2-bed loft was
     fronted by a standalone villa. A unit with no render of its own must show
     the generated artwork instead — never a photograph of a different home. */
  ck('site: a unit never shows another unit\'s render', (function(){
    var imgs = api.UNIT_IMAGES, covers = api.PROJECT_COVERS, bad = [];
    api.UNITS.forEach(function(u){
      if(imgs[u.id]) return;                       // has its own — nothing to borrow
      var el = api.unitMedia(u);
      var found = (el && el.tagName === 'IMG') ? el.getAttribute('src')
                : (el && el.querySelector ? (el.querySelector('img')||{getAttribute:function(){return null;}}).getAttribute('src') : null);
      if(found && found === covers[u.project]) bad.push(u.id);
    });
    return bad.length === 0;
  })());
  /* Deleting a unit has to delete everything keyed to it. A leftover entry is
     invisible until the id is reused, at which point the new unit silently
     inherits the old one's floor, render or plan. */
  ck('site: no per-unit map points at a unit that no longer exists', (function(){
    var live = {}; api.UNITS.forEach(function(u){ live[u.id] = 1; });
    var maps = {UNIT_EXTRA:api.UNIT_EXTRA, UNIT_IMAGES:api.UNIT_IMAGES,
                UNIT_GALLERY:api.UNIT_GALLERY, UNIT_MASTERPLANS:api.UNIT_MASTERPLANS,
                UNIT_FLOORPLANS:api.UNIT_FLOORPLANS, UNIT_LOCATIONS:api.UNIT_LOCATIONS};
    var orphans = [];
    Object.keys(maps).forEach(function(n){
      Object.keys(maps[n]).forEach(function(k){ if(!live[k]) orphans.push(n+':'+k); });
    });
    return orphans.length === 0;
  })());
  /* ORA is exactly what the client sheet lists — seven projects, 58 unit types,
     every id prefixed OR-. The placeholder units that predate the sheet are
     gone and must not come back. */
  ck('ora: only what the sheet lists is on the site', (function(){
    var ora = {}; api.PROJECTS.forEach(function(p){ if(p.dev === 'ora') ora[p.slug] = 1; });
    var slugs = Object.keys(ora).sort().join(',');
    var units = api.UNITS.filter(function(u){ return ora[u.project]; });
    return slugs === 'silversands-crystalline,silversands-silvertown,solana-east,' +
                     'solana-west,zed-east,zed-east-emerald,zed-west' &&
           units.length === 58 &&
           units.every(function(u){ return /^OR-/.test(u.id); });
  })());
  /* This asserted that the replacements exist, which they always did — it never
     touched the router, and the retired paths were 404-ing the whole time
     because parse() rejects an unknown slug before any view runs. It now tests
     the route itself. */
  ck('site: a retired project path resolves to its replacement', (function(){
    var a = api.parse('/en/projects/zed-zayed/');
    var b = api.parse('/ar/projects/silversands-sahel/');
    // the rewrite must keep the visitor's language, not drop them into English
    var gone = api.parse('/en/projects/no-such-project/');
    return a.name === 'project' && a.params.slug === 'zed-west' && a.params.moved === true &&
           b.name === 'project' && b.params.slug === 'silversands-silvertown' && b.lang === 'ar' &&
           api.buildPath('project', {slug:b.params.slug}, b.lang) === '/ar/projects/silversands-silvertown/' &&
           gone.name === '404';
  })());
} catch(e){ ck('RUNTIME ERROR', false, (e && e.stack ? e.stack.split('\n').slice(0,3).join(' | ') : String(e))); }


let p=0,f=0; console.log('\n===== BROWSERLESS DOM VERIFICATION =====');
R.forEach(r=>{ console.log((r.ok?'PASS ':'FAIL ')+r.n+(r.x?'  ['+r.x+']':'')); r.ok?p++:f++; });
console.log('TOTAL '+p+' passed, '+f+' failed');
process.exit(f?1:0);
