"use strict";
(function(){
var s = window.location.search;
if (s && s.charAt(1) === '/') {
var decoded = s.slice(1).split('&').map(function(p){
return p.replace(/~and~/g,'&');
}).join('?');
try {
window.history.replaceState(null,null,
window.location.pathname.slice(0,-1) + decoded + window.location.hash);
} catch (e) {  }
}
})();
function safeUrl(v){
var s = String(v).replace(/[\x00-\x20]/g,'').toLowerCase();
return !/^(javascript|vbscript|data):/.test(s);
}
function h(tag, props){
var e = document.createElement(tag), i, k;
if (props) for (k in props){
if (k === 'class') e.className = props[k];
else if (k === 'text') e.textContent = props[k];
else if (k === 'html') {  }
else if (k.slice(0,2) === 'on') { if (typeof props[k] === 'function') e.addEventListener(k.slice(2), props[k]); }
else if (k === 'dataset') { for (var d in props[k]) e.dataset[d] = props[k][d]; }
else if ((k === 'href' || k === 'src' || k === 'action' || k === 'formaction') && !safeUrl(props[k])) {  }
else if (props[k] === true) e.setAttribute(k,'');
else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k]);
}
for (i = 2; i < arguments.length; i++) append(e, arguments[i]);
return e;
}
function append(parent, child){
if (child == null || child === false) return;
if (Array.isArray(child)) { child.forEach(function(c){ append(parent, c); }); return; }
if (child.nodeType) { parent.appendChild(child); return; }
parent.appendChild(document.createTextNode(String(child)));
}
function svg(path, vb){
var s = document.createElementNS('http://www.w3.org/2000/svg','svg');
s.setAttribute('viewBox', vb||'0 0 24 24'); s.setAttribute('fill','none');
s.setAttribute('stroke','currentColor'); s.setAttribute('stroke-width','1.9');
s.setAttribute('stroke-linecap','round'); s.setAttribute('stroke-linejoin','round');
s.setAttribute('aria-hidden','true');
var arr = Array.isArray(path) ? path : [path];
arr.forEach(function(d){ var p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', d); s.appendChild(p); });
return s;
}
function svgSolid(path, vb){ var s=document.createElementNS('http://www.w3.org/2000/svg','svg');
s.setAttribute('viewBox', vb||'0 0 24 24'); s.setAttribute('fill','currentColor'); s.setAttribute('aria-hidden','true');
var p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', path); s.appendChild(p); return s; }
var ICON = {
pin:'M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11z M12 10a2 2 0 1 0 0-.01',
build:'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16 M14 21V9h4a2 2 0 0 1 2 2v10 M7 7h2M7 11h2M7 15h2',
heart:'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
home:'M3 10.7 12 3.5l9 7.2 M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5',
scale:'M12 3v18 M7 8l-4 7a3 3 0 0 0 8 0zM17 8l-4 7a3 3 0 0 0 8 0z M4 7h16',
check:'M20 6L9 17l-5-5',
search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3',
plus:'M12 5v14M5 12h14',
info:'M12 8h.01M11 12h1v5h1 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
shield:'M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z M9 12l2 2 4-4',
doc:'M7 3h7l4 4v14H7z M14 3v4h4 M9 13h6M9 17h6',
chat:'M4 5h16v11H8l-4 4z',
arrow:'M5 12h14M13 6l6 6-6 6',
globe:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3.5 3 14.5 0 18 M12 3c-3 3.5-3 14.5 0 18',
spark:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
key:'M14 7a3 3 0 1 1-3 3 M13 9l-9 9v3h3l1-1h2v-2h2l2-2 M14.5 8.5',
ban:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M5.6 5.6l12.8 12.8',
phone:'M6.6 3.5 4 4.2C3 4.5 2.6 5.6 3 6.6a17 17 0 0 0 14.4 14.4c1 .4 2.1 0 2.4-1l.7-2.6-4.6-2-1.6 2A13 13 0 0 1 8.6 9.1l2-1.6-2-4z',
wa:'M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12z M9 9c0 4 2 6 6 6',
mail:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6 12 13 2 6',
filter:'M22 3H2l8 9.46V19l4 2v-8.54z',
wa_solid:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
send:'M22 2 11 13 M22 2 15 22l-4-9-9-4z',
pin:'M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 1v3M12 20v3M1 12h3M20 12h3',
layers:'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5 M3 17l9 5 9-5',
bed:['M3 18v-6h13a4 4 0 0 1 4 4v2','M3 12V8h7a3 3 0 0 1 3 3v1','M3 18h18','M20 18v2M4 18v2'],
bath:['M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z','M6 12V6a2 2 0 0 1 3.9-.6','M3 12h18','M7 19l-1 2M18 19l1 2'],
area:['M4 9V4h5','M20 15v5h-5','M4 4l6 6','M20 20l-6-6'],
ty_apartment:['M6 21V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17','M9 7h2M9 11h2M9 15h2','M3 21h18'],
ty_villa:['M3 11l9-7 9 7','M5 10v10h14V10','M10 20v-6h4v6'],
ty_townhouse:['M4 21V8l4-3 4 3v13','M12 21V10l4-3 4 3v11','M3 21h18'],
ty_twinhouse:['M2 21V9l5-4 5 4v12','M12 21V9l5-4 5 4v12','M1 21h22'],
ty_duplex:['M5 21V7l7-4 7 4v14','M5 13h14','M3 21h18'],
ty_penthouse:['M5 21v-8l7-4 7 4v8','M9 21v-5h6v5','M3 21h18'],
ty_studio:['M4 5h16v14H4z','M4 12h16M12 5v7'],
ty_chalet:['M3 12l9-7 9 7','M6 10v9h12v-9','M10 19v-5h4v5','M18 4v3'],
ty_cabin:['M4 12l8-6 8 6','M6 11v8h12v-8','M6 15h12'],
ty_office:['M4 21V4h10v17','M14 9h6v12','M7 8h2M7 12h2M7 16h2','M3 21h18'],
facebook:['M14 4h-2a4 4 0 0 0-4 4v3H5v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h2z'],
instagram:['M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z','M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z','M17.4 6.6h.01'],
linkedin:['M4.5 4.5h15a0 0 0 0 1 0 0v15a0 0 0 0 1 0 0h-15a0 0 0 0 1 0 0v-15a0 0 0 0 1 0 0z','M8 10v7','M8 7v.01','M12 17v-4a2 2 0 0 1 4 0v4','M12 12v5'],
tiktok:['M14 4v10a4 4 0 1 1-4-4','M14 4c.5 2.5 2.5 4.3 5 4.5'],
floorplan:['M3 4h18v16H3z','M13 4v16','M13 14h8','M3 11h10','M7 4v3'],
masterplan:['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z','M9 4v14','M15 6v14'],
gallery:['M3 5h18v14H3z','M3 16l5-5 4 4 3-3 6 6','M8.5 9h.01'],
star:['M12 3.5l2.6 5.7 6.2.6-4.7 4.1 1.4 6.1L12 17l-5.5 3.1 1.4-6.1L3.2 9.8l6.2-.6z'],
x:['M6 6l12 12','M18 6L6 18'],
expand:['M8 4H4v4','M16 4h4v4','M8 20H4v-4','M16 20h4v-4'],
zoomin:['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z','M21 21l-4.3-4.3','M11 8v6','M8 11h6'],
zoomout:['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z','M21 21l-4.3-4.3','M8 11h6'],
chevleft:['M15 6l-6 6 6 6'],
chevdown:['M6 9l6 6 6-6'],
chevright:['M9 6l6 6-6 6'],
am_beach:['M12 3c4 0 8 3 8 7H4c0-4 4-7 8-7z','M12 3v18','M9 21h6'],
am_lagoon:['M3 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0','M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0','M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0'],
am_pool:['M2 16c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0','M2 20c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0','M8 14V5a2 2 0 0 1 4 0','M8 9h4'],
am_club:['M4 20V9l8-5 8 5v11','M4 20h16','M10 20v-5h4v5','M9 10h.01','M15 10h.01'],
am_gym:['M6 9v6','M18 9v6','M4 7v10','M20 7v10','M6 12h12'],
am_security:['M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z','M9.5 12l1.8 1.8 3.5-3.5'],
am_landscape:['M12 3c3 2 4 5 4 8a4 4 0 0 1-8 0c0-3 1-6 4-8z','M12 11v10'],
am_retail:['M6 8h12l-1 12H7z','M9 8V6a3 3 0 0 1 6 0v2'],
am_sports:['M3 12h4l2 6 4-14 2 8h6'],
am_kids:['M12 3a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4z','M12 13v5','M10 21h4'],
am_clinic:['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z','M12 8v8','M8 12h8'],
am_mosque:['M5 20V11c0-3 3-5 7-5s7 2 7 5v9','M4 20h16','M12 6V3','M9 20v-4a3 3 0 0 1 6 0v4'],
am_bms:['M5 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14','M3 21h18','M8 9h.01','M11 9h.01','M8 13h.01','M11 13h.01','M18 8a4 4 0 0 1 0 8'],
am_controls:['M4 6h8','M16 6h4','M4 12h4','M12 12h8','M4 18h8','M16 18h4','M14 4v4','M8 10v4','M14 16v4'],
am_fiber:['M2.5 10.5a13 13 0 0 1 19 0','M5.5 13.6a9 9 0 0 1 13 0','M8.6 16.8a5 5 0 0 1 6.8 0','M12 20h.01'],
am_cctv:['M4 5h11a4 4 0 0 1 4 4v2.5H4z','M7.5 11.5V14a3 3 0 0 0 3 3h1.5','M9.5 21h6','M12 17v4'],
am_heat:['M12 22a5 5 0 0 0 5-5c0-4-5-9-5-9s-5 5-5 9a5 5 0 0 0 5 5z','M12 18a1.6 1.6 0 0 0 1.6-1.6c0-1.4-1.6-3-1.6-3s-1.6 1.6-1.6 3A1.6 1.6 0 0 0 12 18z'],
am_power:['M13 2L5 14h6l-1 8 8-12h-6z'],
am_parking:['M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z','M10 16V8h3a2.5 2.5 0 0 1 0 5h-3'],
am_app:['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z','M11 5h2','M10 18h4'],
am_eco:['M20 4c0 9-5 14-12 14a6 6 0 0 1 0-12c4 0 7-1 12-2z','M4 20c3-5 7-8 12-10'],
am_concierge:['M3 19h18','M6 19a6 6 0 0 1 12 0','M12 8V6','M10 6h4'],
am_laundry:['M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z','M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M8 6h.01','M11 6h.01'],
am_ev:['M3 17h13v-5l-2-4H5l-2 4z','M6.5 17a1.5 1.5 0 1 0 3 0','M12.5 17a1.5 1.5 0 1 0 3 0','M20 7l-2 4h3l-2 4'],
am_yoga:['M12 3.4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z','M12 6.8v5.4','M12 12.2L8.2 20','M12 12.2L15.8 20','M7 10h10'],
am_sauna:['M4 20h16','M6 20a6 6 0 0 1 12 0','M9 9c0-1.6 1-2.1 1-3.6','M12 8c0-1.6 1-2.1 1-3.6','M15 9c0-1.6 1-2.1 1-3.6'],
am_paseo:['M7 4c2 1.4 2.8 3.4 2.8 5.4A2.8 2.8 0 0 1 4.2 9.4C4.2 7.4 5 5.4 7 4z','M7 12.2V16',
'M17 4c2 1.4 2.8 3.4 2.8 5.4a2.8 2.8 0 0 1-5.6 0c0-2 .8-4 2.8-5.4z','M17 12.2V16','M3 19.5h18'],
am_centralpark:['M12 3c2.4 1.7 3.4 4.1 3.4 6.5a3.4 3.4 0 0 1-6.8 0C8.6 7.1 9.6 4.7 12 3z','M12 13v3',
'M12 16c-4.4 0-8 1.3-8 2.9S7.6 21.8 12 21.8s8-1.3 8-2.9-3.6-2.9-8-2.9z'],
am_gardenpark:['M8 4c2.2 1.5 3.1 3.7 3.1 5.9A3.1 3.1 0 0 1 4.9 9.9C4.9 7.7 5.8 5.5 8 4z','M8 13v4.6',
'M13 21c0-4 1.6-6.4 3.4-8C18.2 11.4 19 9.4 19 7'],
am_pavilion:['M2.6 9.4 12 4l9.4 5.4','M5 9.4V19','M12 9.4V19','M19 9.4V19','M3 19h18'],
am_campus:['M12 3.6 2.8 8 12 12.4 21.2 8z','M6.4 10.2v5c0 1.6 2.5 2.9 5.6 2.9s5.6-1.3 5.6-2.9v-5',
'M21.2 8v5.4'],
am_hotel:['M3 19.4V8','M3 13.2h13.6a4.4 4.4 0 0 1 4.4 4.4v1.8','M21 19.4H3',
'M6.4 9.4h3.4a1.6 1.6 0 0 1 1.6 1.6v2.2H4.8V11a1.6 1.6 0 0 1 1.6-1.6z'],
am_lifestyle:['M3.2 11.6a8.8 8.8 0 0 1 17.6 0z','M12 2.8V21','M9.4 21h5.2'],
am_dining:['M7 3v5.4a2.4 2.4 0 0 0 4.8 0V3','M9.4 8.8V21',
'M16.6 3c1.7 2 2.4 4.2 2.4 6.6 0 1.5-.9 2.4-2.4 2.4z','M16.6 12V21'],
am_community:['M9 11.4a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M3 20.4c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4',
'M16.4 6a3 3 0 0 1 0 5.8','M17.6 15.2c2 .7 3.4 2.4 3.4 4.6'],
am_finished:['M3.6 4.8h9.6v4.4H3.6z','M13.2 7h4.4a1.2 1.2 0 0 1 1.2 1.2v2.2a1.2 1.2 0 0 1-1.2 1.2h-5',
'M11.6 11.6v1.8',
'M9.8 13.4h3.6a1.2 1.2 0 0 1 1.2 1.2v4.6a1.2 1.2 0 0 1-1.2 1.2H9.8a1.2 1.2 0 0 1-1.2-1.2v-4.6a1.2 1.2 0 0 1 1.2-1.2z'],
am_office:['M4 20V4.8a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1V20','M15 9.6h4a1 1 0 0 1 1 1V20','M3 20h18',
'M7.4 7.6h1.2','M11 7.6h1.2','M7.4 11.4h1.2','M11 11.4h1.2','M7.4 15.2h1.2','M11 15.2h1.2'],
am_flower:['M12 12.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z','M12 8.2C12 5.4 13.4 3.4 15.6 2.6c.5 2.4-.6 4.4-2.4 5.6',
'M12 8.2C12 5.4 10.6 3.4 8.4 2.6c-.5 2.4.6 4.4 2.4 5.6','M12 12.4V21','M12 16.4c-2 0-3.6-1.3-4.2-3.2 2.1-.5 3.7.6 4.2 2',
'M12 16.4c2 0 3.6-1.3 4.2-3.2-2.1-.5-3.7.6-4.2 2']
};
function ic(name, cls){ var s = svg(ICON[name]); if(cls) s.setAttribute('class',cls); return s; }
var $ = function(s, r){ return (r||document).querySelector(s); };
var CONFIG = {
phone: "+201016000201",
phoneDisplay: "+20 101 600 0201",
whatsapp: "201016000201",
email: "info@thevillageinvestment.com",
social: { facebook:"https://www.facebook.com/share/18vY47m3rz/", instagram:"https://www.instagram.com/thevillageinvestment", linkedin:"https://www.linkedin.com/company/the-village-investment/", tiktok:"https://www.tiktok.com/@thevillageinvestment" },
leadEmail: "leads@thevillageinvestment.com",
LEAD_ENDPOINT: "",
CF_BEACON: "",
origin: "https://www.thevillageinvestment.com",
clientsServed: 899
};
(function(){
if(!CONFIG.CF_BEACON) return;
try{
var s=document.createElement('script');
s.defer=true; s.src='https://static.cloudflareinsights.com/beacon.min.js';
s.setAttribute('data-cf-beacon', JSON.stringify({token:CONFIG.CF_BEACON}));
document.head.appendChild(s);
}catch(e){}
})();
function track(ev, props){
try{
window.dataLayer = window.dataLayer || [];
var o={ event:ev, v:1, locale:(typeof lang!=='undefined'?lang:'en'), route:(typeof currentRoute!=='undefined'&&currentRoute?currentRoute.name:'') };
if(props) for(var k in props){ var val=props[k]; if(val!=null && (typeof val==='string'||typeof val==='number'||typeof val==='boolean')) o[k]=val; }
window.dataLayer.push(o);
}catch(e){}
}
var I18N = {
en: {
invest:"Investment", skip:"Skip to main content", intro_skip:"Skip",
nav_home:"Home", nav_projects:"Projects", nav_developers:"Developers", nav_areas:"Areas",
nav_insights:"Insights", nav_about:"About", nav_launches:"New launches", nav_search:"Search", nav_favorites:"Favorites", nav_maps:"Maps",
maps_kicker:"The Village Maps", maps_h:"The Village Maps",
maps_p:"Explore primary-sale projects across Egypt on one interactive map — filter by area, developer and budget, and read each project's investment signal at a glance.",
map_search_ph:"Search a project or developer…", map_style:"Map style", map_reset:"Reset view",
map_invest:"Investment signal", map_invest_note:"Indicative only — not financial advice.",
score_excellent:"Excellent", score_strong:"Strong", score_solid:"Solid", score_fair:"Fair",
map_view_details:"View project", map_directions:"Directions", map_no_results:"No projects match these filters.",
map_note_h:"About this map", map_note_p:"Marker positions are approximate and schematic, for orientation only. Prices and the investment signal are illustrative — confirm current figures and availability with an advisor.",
price_from:"From", all_areas:"All areas", all_developers:"All developers", any_budget:"Any budget", budget:"Budget", cta_call:"Call", cmp_add:"Compare",
fav_h:"Your favorites", fav_p:"Projects you've saved — kept on this device.", fav_empty:"No favorites yet. Tap the heart on any project to save it here.",
nav_faqs:"FAQs", nav_contact:"Contact", nav_compare:"Compare",
cta_talk:"Talk to an advisor", cta_explore:"Explore projects", cta_details:"View details",
cta_more:"Learn more", cta_all:"View all", cta_reset:"Reset filters", cta_apply:"Apply",
egp:"EGP", from:"Starting From", tba:"On request", perm:"/ month (illustrative)",
f_explore:"Explore", f_company:"Company", f_legal:"Legal",
f_primary:"Primary-sale property only · New launches & developer-direct units",
illustrative:"Illustrative figure — confirm current price & availability with an advisor",
illustrative_short:"Illustrative — confirm with advisor",
call:"Call", whatsapp:"WhatsApp", email_label:"Email",
send_wa:"Send on WhatsApp", send_email:"Send by email",
unit_types_h:"Unit types", unit_types_p:"Unit types available in this project. Layouts are illustrative — confirm current availability and prices with an advisor.",
art_note:"Images are original brand illustrations, not photographs of the actual project. Real photography can replace them once supplied with usage rights.",
devmark_note:"Official developer logos are shown where provided with usage rights; the remaining developers use original placeholder marks until their logos are supplied.",
lead_handoff:"Your enquiry is ready. Send it to an advisor on WhatsApp, or by email.",
derived:"Count derived from projects shown on this site — not full live inventory",
dp:"Down payment", years:"Installment period", delivery:"Delivery", finishing:"Finishing",
status:"Status", area:"Area", developer:"Developer", type:"Type", price:"Starting from", units:"Unit types",
launch:"New launch", primary:"Primary", ready:"Ready to move",
save:"Save", saved:"Saved", compare:"Compare", incompare:"In compare",
results:"results", noresults:"No matching projects", noresults_p:"Try widening your filters or reset to see all primary-sale projects.",
filter_area:"Area", filter_dev:"Developer", filter_status:"Status", filter_price:"Max price", filter_sort:"Sort",
any:"Any", sort_feat:"Featured", sort_price_a:"Price: low to high", sort_price_d:"Price: high to low",
hero_kicker:"Primary-sale real estate · Egypt",
hero_h1a:"Where Smart ", hero_h1b:"Investments Begin", hero_sig:"Invest with Belal Samy in your real estate",
hero_p:"The Village is a real-estate marketing and brokerage company. We help you compare new launches, developers and areas across New Cairo, Fifth Settlement, the New Administrative Capital and the coast — with honest advisory from your first question to unit handover.",
hero_s1:"Areas covered", hero_s2:"Developers tracked", hero_s3:"Curated projects", hero_s4:"Clients served",
find_h:"Find your primary unit", find_p:"Filter the curated selection, then talk to an advisor for live availability.",
home_ours_k:"Marketed by The Village", home_ours_h:"Our featured projects", home_ours_p:"Primary-sale launches we market directly across Ras El Hekma, the North Coast, Ain Sokhna and Greater Cairo. Figures are illustrative — talk to an advisor to confirm current prices and availability.",
home_launch_h:"New launches", home_launch_p:"Our next primary launch — coming soon.", coming_soon:"Coming Soon",
home_devrail_h:"Browse by developer", home_devrail_p:"Tap a developer to explore their primary-sale projects.",
home_feat_h:"Featured projects", home_feat_p:"A hand-picked look across areas and developers. Figures are illustrative pending advisor confirmation.",
home_area_h:"Browse by area", home_area_p:"Egypt's most active primary-sale destinations.",
top_loc_h:"Top locations", top_loc_p:"Egypt's most sought-after primary-sale destinations — updated live from our inventory.", coming_soon:"Coming soon", register_interest:"Register interest",
home_dev_h:"Developers we track", home_dev_p:"Public developer names with original summaries. We show a relationship only when it is documented and approved.",
home_why_h:"Why buyers choose The Village",
why1_h:"Primary sale, done right", why1_p:"New launches, off-plan and developer-direct units only — never resale or owner listings.",
why2_h:"Honest, source-aware advice", why2_p:"Every price and plan is confirmed with the developer before you commit. Illustrative figures are always labelled.",
why3_h:"Built for buyers abroad", why3_p:"Compare, shortlist and reach an advisor in your timezone — from the Gulf, Europe or anywhere Egyptians invest.",
home_trust_h:"How we handle facts",
home_trust_p:"Developer and area names are public facts. Prices, payment plans, delivery dates and availability change often — so we treat every figure on this site as illustrative until an advisor confirms the current developer terms with you. We never invent inventory, contacts, or success messages.",
insights_h:"Buyer guides & insights", insights_p:"Plain-language guidance on buying primary-sale property in Egypt. General educational content — not financial, legal or tax advice.",
about_h:"About The Village", faqs_h:"Frequently asked questions", faqs_p:"Answers about how The Village works, areas, payment plans and advisory.",
contact_h:"Talk to an advisor", contact_p:"Leave your details and preferred area. An advisor follows up to arrange a viewing, answer questions and suggest suitable primary units.",
cmp_h:"Compare units", cmp_p:"Add up to 3 primary-sale units to compare side by side. Figures are illustrative pending advisor confirmation.",
cmp_empty:"No units added yet", cmp_empty_p:"Open any unit and choose “Compare”, or add from the units list.",
form_name:"Full name", form_phone:"Phone (with country code)", form_email:"Email", form_area:"Preferred area", form_msg:"What are you looking for?",
form_consent:"I agree to be contacted about my enquiry and accept the privacy notice.",
form_send:"Request a callback", form_sending:"Checking…",
ask_h:"Need expert advice?", ask_p:"Leave your details and a property consultant will call you back.",
ask_send:"Send", ask_ok:"Thank you — a consultant will call you shortly.",
ask_fail:"We could not send that just now. Please call or WhatsApp us instead.",
err_req:"This field is required", err_email:"Enter a valid email", err_phone:"Enter a valid phone with country code", err_consent:"Please accept the privacy notice to continue",
lead_not_connected:"This preview build is not connected to a live CRM yet, so nothing was sent. Your details are shown below to copy — or configure a lead endpoint to go live.",
lead_copy:"Copy my details", copied:"Copied to clipboard",
contact_blocked:"Verified phone, WhatsApp and email are pending confirmation and are intentionally not shown. This is a launch blocker recorded for the owner.",
p404_h:"Page not found", p404_p:"The page you’re looking for doesn’t exist or may have moved. Explore primary-sale projects instead.",
p404_home:"Back to home", back:"Back",
related:"Related projects", by_dev:"Projects by this developer", in_area:"Projects in this area",
overview:"Overview", facts:"Key facts", enquire:"Enquire about this project", enquire_p:"Ask an advisor for the current price list, payment plan and availability.",
guide_note:"General educational guidance for buyers. Not financial, legal or tax advice. Confirm current terms with an advisor and the developer.",
readmin:"min read", legal_priv:"Privacy notice", legal_terms:"Terms of use",
brand_note:"Identity derived from The Village master logo. Approved brand sign-off pending.",
foot_blocker:"Launch note: verified contacts, live inventory, CRM lead delivery and legal review are pending owner input.",
choose_lang:"العربية", metric_installments:"yr plan",
nav_units:"Units", avail_units:"Available units", new_release:"New release", release_h:"New release price list", release_p:"Updated prices released by the developer for these projects. Primary sale, direct from the developer.", release_units:"Units in this release", fs_installments:"Installments", fs_quarterly:"quarterly", fs_floorplan:"Floor plan", eoi:"EOI", eoi_note:"Expression of interest — refundable reservation to join the release.", no_units_type:"No available units found for this unit type.", awaiting_list:"The developer has not released a price list for this project yet. Ask an advisor for the current unit types, areas and payment terms.",
home_units_h:"Featured units", home_units_p:"Illustrative sample units across our projects — bedrooms, area and price are examples to confirm with an advisor.",
units_h:"Units", units_p:"Browse sample units by type. Figures are illustrative — confirm current availability and prices with an advisor.",
filter_type:"Type", all_types:"All types",
social_h:"Follow us",
chat_open:"Ask us", chat_title:"Village Assistant", chat_sub:"Answers from this site",
a_close:"Close", a_send:"Send", chat_reco:"Recommend from my selection",
chat_hello:"Hi! I’m the Village assistant. Name any project, developer or area and I’ll build the price list from our data — ready to send to your client on WhatsApp.",
chat_ph:"Type your question…",
chat_c1:"New launches", chat_c2:"Payment plans", chat_c3:"Browse areas", chat_c4:"Talk to an advisor",
chat_noanswer:"I don’t have a verified answer to that from the site. Would you like to leave your details so an advisor can help?",
chat_leave:"Leave your details", chat_send_wa:"Ask on WhatsApp",
offer_send:"Send offer on WhatsApp", offer_copy:"Copy offer", offer_open:"Open page", offer_units:"Available units", offer_projects:"Projects in this offer",
chat_found:"Here’s what I found:", chat_none:"I couldn’t find a matching project for that. Try an area or developer name, or leave your details.",
reg_h:"Register your details", reg_p:"Leave your details and an advisor will contact you. Your information is used only to respond to your enquiry.",
finder_h:"Find your primary unit", finder_p:"One relational finder across verified primary-sale inventory — every result matches all your selected filters at once. Figures are illustrative; confirm with an advisor.",
finder_none:"No units match all your filters together. Remove a filter, widen your budget, or talk to an advisor.",
filter_budget:"Budget (total price)", min_price:"Min EGP", max_price:"Max EGP", inc_tbc:"Include units with price to confirm",
filter_floor:"Preferred floor", avoid_ground:"Avoid ground floor", filter_years:"Installment period", years_any:"Any length", years_min_n:"At least {n} years",
filter_project:"Project", filter_beds:"Bedrooms", more_filters:"More filters", fewer_filters:"Fewer filters",
filters:"Filters", hide_filters:"Hide filters",
reco_mode:"Match", reco_balanced_note:"Balanced view: your closest matches, ranked — a few criteria may be relaxed. Each card shows what it matches.", reco_flexible_note:"Flexible view: a wider ranked shortlist to explore — verify the details that matter with an advisor.",
reco_zero_h:"No exact match", reco_few_h:"Only a few exact matches", reco_relax_p:"Loosen one preference to see more (extra units shown):", reco_see_near:"See nearest matches",
price_tbc:"Price & payment plan are being confirmed — talk to an advisor for the developer’s current terms.",
launch_status:"Launch status", availability:"Availability", beds:"Bedrooms",
sort_delivery:"Earliest delivery", sort_newest:"Newest launch", results_h:"Results",
finder_q_ph:"Area, project or developer", switch_projects:"Switch to projects",
facet_more:"Show {n} more", facet_less:"Show less",
nav_search:"Search", search_ph:"Search projects, units, developers, areas, guides…",
search_hint:"Start typing to search across the whole site.", search_none:"No matches. Try a project, developer, area — or ask the assistant.",
search_finder:"Open the unit finder", search_h:"Search results", search_p:"Results across projects, units, developers, areas, guides and questions.",
pay_calc:"Payment estimator", calc_price:"Unit price (EGP)", calc_dp:"Down payment %", calc_years:"Installment years",
calc_dp_amt:"Down payment", calc_monthly:"Est. monthly", calc_total:"Financed",
calc_note:"Indicative estimate only — confirm the developer's current plan with an advisor.",
afford_h:"What can I afford?", afford_monthly:"Monthly budget (EGP)", afford_apply:"Show homes in my budget", afford_upto:"You could consider homes up to",
save_search:"Save search", saved_searches:"Saved searches", get_alerts:"Alerts on new launches", search_saved:"Search saved — get a WhatsApp alert when new matches launch", rm_search:"Remove saved search",
avail_available:"Available", avail_limited:"Limited", avail_reserved:"Reserved", avail_tbc:"To confirm",
timeline_h:"Delivery timeline", tl_launched:"Launched", tl_construction:"Under construction", tl_delivery:"Delivery", tl_ready:"Ready to move", avail_asof:"as of",
lead_title:"Register your interest", lead_sub:"Leave your details and a property advisor will contact you shortly — primary-sale, developer-direct.", lead_name:"Full name", lead_phone:"Phone number", lead_send:"Send request", lead_sending:"Sending…", lead_thanks:"Thank you — an advisor will be in touch shortly.", lead_err:"Please enter your name and a valid phone number.",
print_sheet:"Print / Save as PDF", fs_generated:"Generated", fs_title:"Project factsheet", data_conf:"Data confidence", calc_years_max:"Installment years (max 15)",
fs_hint:"Tap “Print / Save as PDF”. If your app blocks printing, you can also screenshot this page.", fs_preview:"Factsheet preview",
conf_illustrative:"Illustrative", verified:"Verified", to_confirm:"To confirm",
nav_investors:"Investors", investors_h:"GCC & overseas buyers",
investors_p:"Buying Egypt primary-sale property from abroad — a plain, honest view of the process for Gulf, overseas and Egyptian-expatriate buyers.",
invest_note:"General guidance only, not legal, tax or immigration advice. Confirm transfer, power-of-attorney, residency and tax questions with a licensed professional and the developer."
},
ar: {
invest:"للاستثمار العقاري", skip:"تخطَّ إلى المحتوى", intro_skip:"تخطّي",
nav_home:"الرئيسية", nav_projects:"المشروعات", nav_developers:"المطوّرون", nav_areas:"المناطق",
nav_insights:"مقالات", nav_about:"من نحن", nav_launches:"إطلاقات جديدة", nav_search:"بحث", nav_favorites:"المفضّلة", nav_maps:"الخرائط",
maps_kicker:"خرائط ذا فيلدج", maps_h:"خرائط ذا فيلدج",
maps_p:"استكشف مشروعات البيع الأولي في مصر على خريطة تفاعلية واحدة — رشّح حسب المنطقة والمطوّر والميزانية، واقرأ مؤشر الاستثمار لكل مشروع بنظرة.",
map_search_ph:"ابحث عن مشروع أو مطوّر…", map_style:"نمط الخريطة", map_reset:"إعادة الضبط",
map_invest:"مؤشر استثماري", map_invest_note:"مؤشر استرشادي فقط — وليس نصيحة مالية.",
score_excellent:"ممتاز", score_strong:"قوي", score_solid:"جيّد", score_fair:"مقبول",
map_view_details:"عرض المشروع", map_directions:"الاتجاهات", map_no_results:"لا مشروعات تطابق هذه الفلاتر.",
map_note_h:"عن هذه الخريطة", map_note_p:"مواقع العلامات تقريبية وتخطيطية للاسترشاد فقط. الأسعار ومؤشر الاستثمار استرشادية — تأكّد من الأرقام والإتاحة الحالية مع المستشار.",
price_from:"يبدأ من", all_areas:"كل المناطق", all_developers:"كل المطوّرين", any_budget:"أي ميزانية", budget:"الميزانية", cta_call:"اتصال", cmp_add:"قارن",
fav_h:"مفضّلتك", fav_p:"المشروعات التي حفظتها — تُحفظ على هذا الجهاز.", fav_empty:"لا توجد مفضّلة بعد. اضغط القلب على أي مشروع لحفظه هنا.",
nav_faqs:"الأسئلة الشائعة", nav_contact:"تواصل معنا", nav_compare:"المقارنة",
cta_talk:"تحدّث إلى مستشار", cta_explore:"استكشف المشروعات", cta_details:"عرض التفاصيل",
cta_more:"اعرف أكثر", cta_all:"عرض الكل", cta_reset:"مسح الفلاتر", cta_apply:"تطبيق",
egp:"ج.م", from:"يبدأ من", tba:"عند الطلب", perm:"/ شهرياً (تقديري)",
f_explore:"استكشف", f_company:"الشركة", f_legal:"قانوني",
f_primary:"بيع أولي فقط · إطلاقات جديدة ووحدات من المطوّر مباشرة",
illustrative:"رقم تقديري — تأكّد من السعر والإتاحة الحالية مع المستشار",
illustrative_short:"تقديري — تأكّد مع المستشار",
call:"اتصال", whatsapp:"واتساب", email_label:"البريد",
send_wa:"أرسل عبر واتساب", send_email:"أرسل عبر البريد",
unit_types_h:"أنواع الوحدات", unit_types_p:"أنواع الوحدات المتاحة في هذا المشروع. التصاميم استرشادية — أكّد الإتاحة والأسعار الحالية مع المستشار.",
art_note:"الصور رسوم أصلية للعلامة وليست صوراً فوتوغرافية للمشروع الفعلي. يمكن استبدالها بتصوير حقيقي عند توفيره بحقوق الاستخدام.",
devmark_note:"تُعرض شعارات المطوّرين الرسمية حيثما تم توفيرها بحقوق الاستخدام؛ وتظهر بقية المطوّرين بعلامات أصلية مؤقتة لحين توفير شعاراتهم.",
lead_handoff:"استفسارك جاهز. أرسله إلى مستشار عبر واتساب أو البريد.",
derived:"العدد محسوب من المشروعات المعروضة على الموقع — وليس كامل المعروض الفعلي",
dp:"الدفعة المقدمة", years:"مدة التقسيط", delivery:"التسليم", finishing:"التشطيب",
status:"الحالة", area:"المنطقة", developer:"المطوّر", type:"النوع", price:"يبدأ من", units:"أنواع الوحدات",
launch:"إطلاق جديد", primary:"بيع أولي", ready:"استلام فوري",
save:"حفظ", saved:"محفوظ", compare:"قارن", incompare:"في المقارنة",
results:"نتيجة", noresults:"لا توجد مشروعات مطابقة", noresults_p:"جرّب توسيع الفلاتر أو امسحها لعرض كل مشروعات البيع الأولي.",
filter_area:"المنطقة", filter_dev:"المطوّر", filter_status:"الحالة", filter_price:"أقصى سعر", filter_sort:"الترتيب",
any:"الكل", sort_feat:"مميّز", sort_price_a:"السعر: من الأقل للأعلى", sort_price_d:"السعر: من الأعلى للأقل",
hero_kicker:"عقارات البيع الأولي · مصر",
hero_h1a:"من هنا يبدأ ", hero_h1b:"الاستثمار الذكي", hero_sig:"استثمر مع بلال سامي",
hero_p:"The Village شركة تسويق ووساطة عقارية تساعدك على مقارنة الإطلاقات الجديدة والمطوّرين والمناطق في القاهرة الجديدة والتجمع الخامس والعاصمة الإدارية والساحل — باستشارة صادقة من أول سؤال حتى استلام وحدتك.",
hero_s1:"مناطق نغطّيها", hero_s2:"مطوّرون نتابعهم", hero_s3:"مشروعات مختارة", hero_s4:"عميل خدمناهم",
find_h:"اعثر على وحدتك الأولية", find_p:"صفِّ الاختيارات ثم تحدّث إلى مستشار لمعرفة الإتاحة الحالية.",
home_ours_k:"مقدَّمة من The Village", home_ours_h:"مشروعاتنا المميّزة", home_ours_p:"مشروعات بيع أولي نسوّقها مباشرةً في رأس الحكمة والساحل الشمالي والعين السخنة والقاهرة الكبرى. الأرقام استرشادية — تواصل مع مستشار لتأكيد الأسعار والإتاحة الحالية.",
home_launch_h:"إطلاقات جديدة", home_launch_p:"إطلاقنا الأولي القادم — قريباً.", coming_soon:"قريباً",
home_devrail_h:"تصفّح حسب المطوّر", home_devrail_p:"اضغط على أي مطوّر لاستعراض مشروعاته للبيع الأولي.",
home_feat_h:"مشروعات مميّزة", home_feat_p:"نظرة مختارة عبر المناطق والمطوّرين. الأرقام تقديرية لحين تأكيد المستشار.",
home_area_h:"تصفّح حسب المنطقة", home_area_p:"أنشط وجهات البيع الأولي في مصر.",
top_loc_h:"أهم المناطق", top_loc_p:"أكثر وجهات البيع الأولي طلبًا في مصر — تُحدَّث مباشرةً من مخزوننا.", coming_soon:"قريبًا", register_interest:"سجّل اهتمامك",
home_dev_h:"مطوّرون نتابعهم", home_dev_p:"أسماء مطوّرين معروفة مع ملخصات أصلية. لا نذكر شراكة إلا عند توثيقها واعتمادها.",
home_why_h:"لماذا يختار المشترون The Village",
why1_h:"بيع أولي كما يجب", why1_p:"إطلاقات جديدة ووحدات من المطوّر مباشرة فقط — دون إعادة بيع أو عروض مُلّاك.",
why2_h:"نصيحة صادقة وواعية بالمصدر", why2_p:"كل سعر وخطة يُؤكَّد مع المطوّر قبل أي التزام، والأرقام التقديرية موضّحة دائماً.",
why3_h:"مصمَّم للمشترين بالخارج", why3_p:"قارن ورشّح وتواصل مع مستشار بتوقيتك — من الخليج أو أوروبا أو أينما يستثمر المصريون.",
home_trust_h:"كيف نتعامل مع الحقائق",
home_trust_p:"أسماء المطوّرين والمناطق حقائق عامة، أمّا الأسعار وخطط السداد ومواعيد التسليم والإتاحة فتتغيّر كثيراً — لذلك نعتبر كل رقم على الموقع تقديرياً حتى يؤكّد المستشار الشروط الحالية للمطوّر معك. لا نختلق وحدات أو بيانات تواصل أو رسائل نجاح.",
insights_h:"أدلة ومقالات للمشتري", insights_p:"إرشادات مبسّطة لشراء عقارات البيع الأولي في مصر. محتوى تثقيفي عام — وليس استشارة مالية أو قانونية أو ضريبية.",
about_h:"من نحن", faqs_h:"الأسئلة الشائعة", faqs_p:"إجابات عن طريقة عمل The Village والمناطق وخطط السداد والاستشارة.",
contact_h:"تحدّث إلى مستشار", contact_p:"اترك بياناتك والمنطقة المفضّلة، وسيتواصل معك مستشار لترتيب معاينة والإجابة عن أسئلتك واقتراح وحدات أولية مناسبة.",
cmp_h:"قارن الوحدات", cmp_p:"أضف حتى 3 وحدات بيع أولي للمقارنة جنباً إلى جنب. الأرقام تقديرية لحين تأكيد المستشار.",
cmp_empty:"لم تُضِف وحدات بعد", cmp_empty_p:"افتح أي وحدة واختر «قارن»، أو أضِف من قائمة الوحدات.",
form_name:"الاسم الكامل", form_phone:"الهاتف (مع كود الدولة)", form_email:"البريد الإلكتروني", form_area:"المنطقة المفضّلة", form_msg:"عمّا تبحث؟",
form_consent:"أوافق على التواصل معي بخصوص طلبي وأقبل إشعار الخصوصية.",
form_send:"اطلب معاودة الاتصال", form_sending:"جارٍ التحقق…",
ask_h:"محتاج استشارة؟", ask_p:"سيب بياناتك وهيتواصل معاك مستشار عقاري.",
ask_send:"إرسال", ask_ok:"شكراً لك — سيتصل بك مستشار قريباً.",
ask_fail:"تعذّر الإرسال الآن. برجاء الاتصال بنا أو مراسلتنا على واتساب.",
err_req:"هذا الحقل مطلوب", err_email:"أدخل بريداً صحيحاً", err_phone:"أدخل رقماً صحيحاً مع كود الدولة", err_consent:"يرجى قبول إشعار الخصوصية للمتابعة",
lead_not_connected:"هذه النسخة التجريبية غير متصلة بنظام CRM بعد، لذلك لم يُرسَل شيء. بياناتك معروضة أدناه لنسخها — أو اضبط نقطة استقبال للطلبات للتشغيل الفعلي.",
lead_copy:"انسخ بياناتي", copied:"تم النسخ",
contact_blocked:"لم تُعرَض أرقام الهاتف وواتساب والبريد لأنها قيد التأكيد عمداً، وهذا عائق إطلاق مسجَّل لصاحب الموقع.",
p404_h:"الصفحة غير موجودة", p404_p:"الصفحة المطلوبة غير موجودة أو ربما نُقلت. استكشف مشروعات البيع الأولي بدلاً من ذلك.",
p404_home:"العودة للرئيسية", back:"رجوع",
related:"مشروعات ذات صلة", by_dev:"مشروعات هذا المطوّر", in_area:"مشروعات في هذه المنطقة",
overview:"نظرة عامة", facts:"حقائق أساسية", enquire:"استفسر عن هذا المشروع", enquire_p:"اطلب من المستشار قائمة الأسعار الحالية وخطة السداد والإتاحة.",
guide_note:"إرشاد تثقيفي عام للمشترين. ليس استشارة مالية أو قانونية أو ضريبية. تأكّد من الشروط الحالية مع المستشار والمطوّر.",
readmin:"دقائق قراءة", legal_priv:"إشعار الخصوصية", legal_terms:"شروط الاستخدام",
brand_note:"الهوية مستمدة من شعار The Village الرئيسي. اعتماد الهوية النهائي قيد الانتظار.",
foot_blocker:"ملاحظة إطلاق: بيانات التواصل الموثّقة والمعروض الحيّ وتسليم الطلبات للـCRM والمراجعة القانونية قيد إدخال صاحب الموقع.",
choose_lang:"English", metric_installments:"سنوات تقسيط",
nav_units:"الوحدات", avail_units:"وحدات متاحة", new_release:"إطلاق جديد", release_h:"قائمة أسعار الإطلاق الجديد", release_p:"أسعار محدَّثة أصدرها المطوّر لهذه المشاريع. بيع أولي مباشر من المطوّر.", release_units:"وحدات هذا الإطلاق", fs_installments:"عدد الأقساط", fs_quarterly:"قسط ربع سنوي", fs_floorplan:"مخطط الوحدة", eoi:"EOI", eoi_note:"خطاب رغبة — حجز مسترد للدخول في الإطلاق.", no_units_type:"لا توجد وحدات متاحة من هذا النوع.", awaiting_list:"لم يُصدر المطوّر قائمة أسعار لهذا المشروع بعد. اسأل المستشار عن أنواع الوحدات والمساحات وشروط السداد الحالية.",
home_units_h:"وحدات مميّزة", home_units_p:"وحدات نموذجية استرشادية عبر مشروعاتنا — الغرف والمساحة والسعر أمثلة للتأكيد مع المستشار.",
units_h:"الوحدات", units_p:"تصفّح وحدات نموذجية حسب النوع. الأرقام استرشادية — أكّد الإتاحة والأسعار الحالية مع المستشار.",
filter_type:"النوع", all_types:"كل الأنواع",
social_h:"تابعنا",
chat_open:"اسألنا", chat_title:"مساعد The Village", chat_sub:"إجابات من محتوى الموقع",
a_close:"إغلاق", a_send:"إرسال", chat_reco:"رشّح من اختياري",
chat_hello:"أهلاً! أنا مساعد The Village. اكتب اسم أي مشروع أو مطوّر أو منطقة وأجهّز لك قائمة الأسعار من بياناتنا — جاهزة تبعتها لعميلك على واتساب.",
chat_ph:"اكتب سؤالك…",
chat_c1:"إطلاقات جديدة", chat_c2:"خطط السداد", chat_c3:"تصفّح المناطق", chat_c4:"تحدّث إلى مستشار",
chat_noanswer:"لا أملك إجابة مؤكّدة لذلك من الموقع. هل تحب ترك بياناتك ليتواصل معك مستشار؟",
chat_leave:"سجّل بياناتك", chat_send_wa:"اسأل عبر واتساب",
offer_send:"أرسل العرض على واتساب", offer_copy:"نسخ العرض", offer_open:"فتح الصفحة", offer_units:"الوحدات المتاحة", offer_projects:"مشروعات هذا العرض",
chat_found:"إليك ما وجدته:", chat_none:"لم أجد مشروعاً مطابقاً. جرّب اسم منطقة أو مطوّر، أو اترك بياناتك.",
reg_h:"سجّل بياناتك", reg_p:"اترك بياناتك وسيتواصل معك مستشار. تُستخدم بياناتك فقط للردّ على استفسارك.",
finder_h:"اعثر على وحدتك الأولية", finder_p:"محرّك بحث علائقي واحد عبر معروض البيع الأولي — كل نتيجة تطابق جميع الفلاتر المختارة معاً. الأرقام استرشادية؛ أكّد مع المستشار.",
finder_none:"لا توجد وحدات تطابق كل الفلاتر معاً. أزِل فلتراً أو وسّع الميزانية أو تحدّث إلى مستشار.",
filter_budget:"الميزانية (السعر الكلي)", min_price:"أدنى ج.م", max_price:"أقصى ج.م", inc_tbc:"تضمين وحدات سعرها قيد التأكيد",
filter_floor:"الدور المفضّل", avoid_ground:"تجنّب الدور الأرضي", filter_years:"مدة التقسيط", years_any:"أي مدة", years_min_n:"{n} سنوات على الأقل",
filter_project:"المشروع", filter_beds:"غرف النوم", more_filters:"فلاتر إضافية", fewer_filters:"فلاتر أقل",
filters:"الفلاتر", hide_filters:"إخفاء الفلاتر",
reco_mode:"المطابقة", reco_balanced_note:"عرض متوازن: أقرب النتائج مرتّبة حسب المطابقة — قد تُخفَّف بعض المعايير. كل بطاقة توضّح ما يطابقه.", reco_flexible_note:"عرض مرن: قائمة أوسع مرتّبة للاستكشاف — تأكّد من التفاصيل المهمة مع المستشار.",
reco_zero_h:"لا توجد مطابقة تامة", reco_few_h:"مطابقات تامة قليلة فقط", reco_relax_p:"خفِّف أحد التفضيلات لرؤية المزيد (الوحدات الإضافية):", reco_see_near:"اعرض أقرب النتائج",
price_tbc:"يجري تأكيد السعر وخطة السداد — تواصل مع مستشار لمعرفة شروط المطوّر الحالية.",
launch_status:"حالة الإطلاق", availability:"الإتاحة", beds:"غرف النوم",
sort_delivery:"الأقرب تسليماً", sort_newest:"الأحدث إطلاقاً", results_h:"النتائج",
finder_q_ph:"منطقة أو مشروع أو مطوّر", switch_projects:"عرض المشروعات",
facet_more:"عرض {n} أخرى", facet_less:"عرض أقل",
nav_search:"بحث", search_ph:"ابحث في المشروعات والوحدات والمطوّرين والمناطق والأدلة…",
search_hint:"ابدأ الكتابة للبحث في كل الموقع.", search_none:"لا نتائج. جرّب مشروعاً أو مطوّراً أو منطقة — أو اسأل المساعد.",
search_finder:"افتح محرّك البحث عن الوحدات", search_h:"نتائج البحث", search_p:"نتائج عبر المشروعات والوحدات والمطوّرين والمناطق والأدلة والأسئلة.",
pay_calc:"حاسبة السداد", calc_price:"سعر الوحدة (ج.م)", calc_dp:"الدفعة المقدمة %", calc_years:"سنوات التقسيط",
calc_dp_amt:"الدفعة المقدمة", calc_monthly:"القسط الشهري التقديري", calc_total:"المموَّل",
calc_note:"تقدير استرشادي فقط — أكّد خطة المطوّر الحالية مع المستشار.",
afford_h:"ما الذي يناسب ميزانيتي؟", afford_monthly:"القسط الشهري (ج.م)", afford_apply:"اعرض ما يناسب ميزانيتي", afford_upto:"يمكنك النظر في وحدات حتى",
save_search:"احفظ البحث", saved_searches:"عمليات بحث محفوظة", get_alerts:"تنبيهات عند الإطلاقات الجديدة", search_saved:"تم حفظ البحث — ستصلك رسالة واتساب عند توفّر وحدات جديدة مطابقة", rm_search:"إزالة البحث المحفوظ",
avail_available:"متاحة", avail_limited:"محدودة", avail_reserved:"محجوزة", avail_tbc:"قيد التأكيد",
timeline_h:"الجدول الزمني للتسليم", tl_launched:"أُطلق", tl_construction:"قيد الإنشاء", tl_delivery:"التسليم", tl_ready:"جاهزة للاستلام", avail_asof:"حتى",
lead_title:"سجّل اهتمامك", lead_sub:"اترك بياناتك وسيتواصل معك مستشار عقاري قريبًا — بيع أولي من المطوّر مباشرةً.", lead_name:"الاسم الكامل", lead_phone:"رقم الهاتف", lead_send:"إرسال الطلب", lead_sending:"جارٍ الإرسال…", lead_thanks:"شكرًا لك — سيتواصل معك مستشار قريبًا.", lead_err:"من فضلك أدخل اسمك ورقم هاتف صحيح.",
print_sheet:"طباعة / حفظ PDF", fs_generated:"تاريخ الإصدار", fs_title:"ملف المشروع", data_conf:"موثوقية البيانات", calc_years_max:"سنوات التقسيط (بحد أقصى ١٥)",
fs_hint:"اضغط «طباعة / حفظ PDF». وإذا كان التطبيق يمنع الطباعة، يمكنك أيضًا تصوير الشاشة لهذه الصفحة.", fs_preview:"معاينة ملف الوحدة",
conf_illustrative:"استرشادي", verified:"موثّق", to_confirm:"قيد التأكيد",
nav_investors:"المستثمرون", investors_h:"مشترو الخليج والخارج",
investors_p:"شراء عقارات البيع الأولي في مصر من الخارج — نظرة واضحة وصادقة للإجراء لمشتري الخليج والخارج والمصريين المغتربين.",
invest_note:"إرشاد عام فقط، وليس استشارة قانونية أو ضريبية أو خاصة بالهجرة. أكّد مسائل التحويل والتوكيل والإقامة والضرائب مع مختصّ مرخّص ومع المطوّر."
}
};
var AREAS = [
{key:'newcairo', name:{en:'New Cairo',ar:'القاهرة الجديدة'}, blurb:{en:'East Cairo hub of gated communities, schools and business districts.',ar:'قلب شرق القاهرة من الكمبوندات والمدارس ومناطق الأعمال.'}},
{key:'fifthsettlement', name:{en:'Fifth Settlement',ar:'التجمع الخامس'}, blurb:{en:'The premium heart of New Cairo — established compounds and retail.',ar:'قلب القاهرة الجديدة الراقي — كمبوندات مكتملة ومراكز تجارية.'}},
{key:'capital', name:{en:'New Administrative Capital',ar:'العاصمة الإدارية الجديدة'}, blurb:{en:'Egypt\'s new government and business capital, still launching.',ar:'العاصمة الحكومية والتجارية الجديدة، ما زالت تُطرح.'}},
{key:'sahel', name:{en:'North Coast (Sahel)',ar:'الساحل الشمالي'}, blurb:{en:'Mediterranean second-home and resort destinations.',ar:'وجهات المصيف والمنزل الثاني على المتوسط.'}},
{key:'raselhekma', name:{en:'Ras El Hekma',ar:'رأس الحكمة'}, blurb:{en:'The North Coast’s fastest-rising bay — crystalline lagoons, long private beaches and landmark master-planned resorts.',ar:'أسرع خلجان الساحل الشمالي صعوداً — بحيرات كريستالية وشواطئ خاصة طويلة ومنتجعات مخطّطة كبرى.'}},
{key:'zayed', name:{en:'Sheikh Zayed',ar:'الشيخ زايد'}, blurb:{en:'Established West Cairo living with mature communities.',ar:'حياة راقية بغرب القاهرة بمجتمعات مكتملة.'}},
{key:'october', name:{en:'6th of October',ar:'٦ أكتوبر'}, blurb:{en:'Spacious West Cairo city with a wide price range.',ar:'مدينة واسعة بغرب القاهرة بنطاق أسعار متنوع.'}},
{key:'mostakbal', name:{en:'Mostakbal City',ar:'مدينة المستقبل'}, blurb:{en:'Fast-growing East Cairo corridor with new launches.',ar:'محور سريع النمو بشرق القاهرة مع إطلاقات جديدة.'}},
{key:'sokhna', name:{en:'Ain Sokhna',ar:'العين السخنة'}, blurb:{en:'Red Sea coast close to Cairo for weekend homes.',ar:'ساحل البحر الأحمر القريب من القاهرة لمنازل نهاية الأسبوع.'}}
];
var DEVELOPERS = [
{key:'sodic', c1:'#0d6e7d', name:{en:'SODIC',ar:'سوديك'}, since:1996, areas:{en:'New Cairo · Sheikh Zayed · Ras El Hekma',ar:'القاهرة الجديدة · الشيخ زايد · رأس الحكمة'}, tagline:{en:'Design-led living, East & West Cairo',ar:'حياة بتصميم مميّز شرق وغرب القاهرة'}, desc:{en:'Listed on the EGX since 1996 and 85% owned by the ALDAR–ADQ consortium since 2021. Twenty-eight years of operations in West Cairo, East Cairo and the North Coast, with over 14,000 units delivered — 91% of them ahead of schedule — and communities that are home to more than 30,000 people.',ar:'مقيّدة في البورصة المصرية منذ ١٩٩٦، ويملك تحالف «الدار وADQ» ٨٥٪ منها منذ ٢٠٢١. ثمانية وعشرون عاماً من العمل في غرب القاهرة وشرقها وعلى الساحل الشمالي، بأكثر من ١٤٬٠٠٠ وحدة مسلَّمة — ٩١٪ منها قبل موعدها — ومجتمعات يسكنها أكثر من ٣٠٬٠٠٠ نسمة.'}},
{key:'palmhills', c1:'#1e7a5a', name:{en:'Palm Hills Developments',ar:'بالم هيلز'}, since:2005, areas:{en:'New Cairo · Sheikh Zayed · North Coast',ar:'القاهرة الجديدة · الشيخ زايد · الساحل الشمالي'}, tagline:{en:'Large-scale communities & coast',ar:'مجتمعات كبرى ووجهات ساحلية'}, desc:{en:'One of Egypt’s largest developers, building integrated residential communities and North Coast destinations.',ar:'من أكبر المطوّرين في مصر، يبني مجتمعات سكنية متكاملة ووجهات على الساحل الشمالي.'}},
{key:'mountainview', c1:'#2b6ca8', name:{en:'Mountain View',ar:'ماونتن ڤيو'}, since:2005, areas:{en:'New Cairo · 6th of October · North Coast',ar:'القاهرة الجديدة · ٦ أكتوبر · الساحل الشمالي'}, tagline:{en:'Experience Happiness',ar:'عيش السعادة'}, desc:{en:'Launched in 2005 to develop integrated communities around a science of happiness. Twenty years on it has delivered 23 projects and 17,000 units to 50,000 families, and holds a land bank of more than 6,000 acres across East Cairo, West Cairo and the coast.',ar:'تأسّست عام ٢٠٠٥ لتطوير مجتمعات عمرانية متكاملة قائمة على علم السعادة. وبعد عشرين عاماً سلّمت ٢٣ مشروعاً و١٧ ألف وحدة لخمسين ألف أسرة، وتملك محفظة أراضٍ تتجاوز ٦٠٠٠ فدان في شرق القاهرة وغربها وعلى الساحل.'}},
{key:'ora', c1:'#6d52a3', name:{en:'ORA Developers',ar:'أورا'}, since:2016, areas:{en:'New Cairo · Sheikh Zayed · North Coast',ar:'القاهرة الجديدة · الشيخ زايد · الساحل الشمالي'}, tagline:{en:'Premium, design-led destinations',ar:'وجهات راقية بتصميم مميّز'}, desc:{en:'A premium developer creating high-design lifestyle destinations with strong architecture and amenities.',ar:'مطوّر راقٍ يبتكر وجهات لايف ستايل عالية التصميم بعمارة ومرافق قوية.'}},
{key:'tatweer', c1:'#b0692c', name:{en:'Tatweer Misr',ar:'تطوير مصر'}, since:2014, areas:{en:'Ain Sokhna · Mostakbal City · Ras El Hekma · North Coast · Sheikh Zayed',ar:'العين السخنة · مدينة المستقبل · رأس الحكمة · الساحل الشمالي · الشيخ زايد'}, tagline:{en:'Value communities & coastal resorts',ar:'مجتمعات اقتصادية ومنتجعات ساحلية'}, desc:{en:'A developer focused on integrated communities and coastal resorts with a value orientation.',ar:'مطوّر يركّز على المجتمعات المتكاملة والمنتجعات الساحلية بتوجّه اقتصادي.'}},
{key:'misritalia', c1:'#2f8f6a', name:{en:'Misr Italia Properties',ar:'مصر إيطاليا'}, since:1996, areas:{en:'New Administrative Capital · North Coast',ar:'العاصمة الإدارية · الساحل الشمالي'}, tagline:{en:'Biophilic, tech-enabled communities',ar:'مجتمعات خضراء بتقنيات حديثة'}, desc:{en:'A developer associated with green, technology-enabled communities, active in the New Capital and on the coast.',ar:'مطوّر مرتبط بمجتمعات خضراء مزوّدة بالتقنيات، نشط في العاصمة الإدارية والساحل.'}},
{key:'marakez', c1:'#b0473f', name:{en:'Marakez',ar:'مراكز'}, since:2014, areas:{en:'New Cairo · 6th of October · Ras El Hekma',ar:'القاهرة الجديدة · ٦ أكتوبر · رأس الحكمة'}, tagline:{en:'Egypt’s leading mixed-use developer',ar:'المطوّر الرائد متعدد الاستخدامات في مصر'}, desc:{en:'The leading mixed-use developer in Egypt, and the only one that builds the mall, the offices and the entertainment its homes sit around. Grown from a single asset — Mall of Arabia — into Aeon, District Five, Crescent Walk and ramla, and backed by Fawaz Al Hokair Group and its own contractor, FAS Construction.',ar:'المطوّر الرائد متعدد الاستخدامات في مصر، والوحيد الذي يبني المول والمكاتب والترفيه التي تلتف حولها مساكنه. نمت من أصل واحد — مول العرب — إلى إيون وديستريكت فايف وكريسنت ووك ورملة، بدعم من مجموعة فواز الحكير ومقاولها الخاص «FAS Construction».'}},
{key:'lmd', c1:'#3a5a8c', name:{en:'LMD',ar:'إل إم دي'}, since:2013, areas:{en:'New Cairo · North Coast',ar:'القاهرة الجديدة · الساحل الشمالي'}, tagline:{en:'Design-forward communities',ar:'مجتمعات بتصميم متقدّم'}, desc:{en:'A developer known for design-forward, art-infused communities and walkable urban districts.',ar:'مطوّر معروف بمجتمعات بتصميم متقدّم وطابع فني وأحياء حضرية.'}},
{key:'hydepark', c1:'#3f7d3a', name:{en:'Hyde Park Developments',ar:'هايد بارك'}, since:2011, areas:{en:'New Cairo · North Coast',ar:'القاهرة الجديدة · الساحل الشمالي'}, tagline:{en:'Central-park living in East Cairo',ar:'حياة حول حديقة مركزية بشرق القاهرة'}, desc:{en:'A developer building large park-centred communities in East Cairo and coastal projects.',ar:'مطوّر يبني مجتمعات كبيرة حول حدائق مركزية بشرق القاهرة ومشروعات ساحلية.'}},
{key:'marasem', c1:'#8a6d33', name:{en:'Al Marasem Development',ar:'المراسم'}, since:2002, areas:{en:'Fifth Settlement · New Cairo',ar:'التجمع الخامس · القاهرة الجديدة'}, tagline:{en:'Prime Fifth Settlement communities',ar:'مجتمعات مميّزة بالتجمع الخامس'}, desc:{en:'A developer with a prime footprint in the Fifth Settlement and a background in construction and hospitality.',ar:'مطوّر بحضور مميّز في التجمع الخامس وخلفية في الإنشاءات والضيافة.'}},
{key:'qataridiar', c1:'#26305f', name:{en:'Qatari Diar',ar:'الديار القطرية'}, since:2005, areas:{en:'New Administrative Capital · North Coast',ar:'العاصمة الإدارية · الساحل الشمالي'}, tagline:{en:'Large mixed-use destinations',ar:'وجهات كبرى متعددة الاستخدامات'}, desc:{en:'A major regional developer associated with large mixed-use destinations, active in Egypt through flagship projects.',ar:'مطوّر إقليمي كبير مرتبط بوجهات ضخمة متعددة الاستخدامات، ونشط في مصر عبر مشروعات كبرى.'}},
{key:'orascom', c1:'#a9812f', name:{en:'Orascom Development',ar:'أوراسكوم للتطوير'}, since:1994, areas:{en:'6th of October · North Coast · Red Sea',ar:'٦ أكتوبر · الساحل الشمالي · البحر الأحمر'}, tagline:{en:'Integrated towns & resorts',ar:'مدن ومنتجعات متكاملة'}, desc:{en:'A developer known for fully integrated towns and resort destinations across Egypt and the coast.',ar:'مطوّر معروف بالمدن المتكاملة والوجهات السياحية في مصر والساحل.'}},
{key:'msquared', c1:'#8a8378', name:{en:'M squared',ar:'إم سكويرد'}, since:2012, areas:{en:'Ras Al Hekma · New Cairo · 6th of October',ar:'رأس الحكمة · القاهرة الجديدة · ٦ أكتوبر'}, tagline:{en:'Masterfully minded spaces',ar:'مساحات مصمَّمة بإتقان'}, desc:{en:'Founded in 2012, M squared is the real estate arm of INTRO Investments Holding — an Egyptian conglomerate established in the 1970s and privately owned by the Abbas family. It builds across Ras Al Hekma, New Cairo, Maadi and 6th of October, and runs its own hospitality arm.',ar:'تأسّست عام ٢٠١٢، وإم سكويرد هي الذراع العقاري لمجموعة إنترو للاستثمارات القابضة — تكتّل مصري تأسّس في السبعينيات ومملوك لعائلة عباس. تبني في رأس الحكمة والقاهرة الجديدة والمعادي و٦ أكتوبر، وتدير ذراعها الخاص للضيافة.'}},
{key:'modon', c1:'#0f7b8c', name:{en:'Modon',ar:'مدن'}, since:2005, areas:{en:'Ras El Hekma · North Coast',ar:'رأس الحكمة · الساحل الشمالي'}, tagline:{en:'Master-planned coastal destinations',ar:'وجهات ساحلية بمخططات متكاملة'}, desc:{en:'A regional developer building large master-planned coastal destinations, active in Egypt on the Ras El Hekma North Coast.',ar:'مطوّر إقليمي يبني وجهات ساحلية كبرى بمخططات متكاملة، ونشط في مصر بمنطقة رأس الحكمة على الساحل الشمالي.'}},
{key:'tmg', c1:'#1f6f5c', name:{en:'Talaat Moustafa Group',ar:'مجموعة طلعت مصطفى'}, since:2007, areas:{en:'New Cairo · New Capital · North Coast',ar:'القاهرة الجديدة · العاصمة الإدارية · الساحل الشمالي'}, tagline:{en:'Egypt’s largest integrated cities',ar:'أكبر المدن المتكاملة في مصر'}, desc:{en:'One of Egypt’s largest developers, known for very large integrated cities and hospitality assets.',ar:'من أكبر المطوّرين في مصر، معروف بالمدن المتكاملة الضخمة وأصول الضيافة.'}},
{key:'emaarmisr', c1:'#3a7a44', name:{en:'Emaar Misr',ar:'إعمار مصر'}, since:2005, areas:{en:'New Cairo · Sheikh Zayed · North Coast',ar:'القاهرة الجديدة · الشيخ زايد · الساحل الشمالي'}, tagline:{en:'Premium integrated communities',ar:'مجتمعات متكاملة راقية'}, desc:{en:'The Egyptian arm of a leading regional developer, known for premium integrated communities and coastal destinations.',ar:'الذراع المصري لمطوّر إقليمي رائد، معروف بالمجتمعات المتكاملة الراقية والوجهات الساحلية.'}},
{key:'hassanallam', c1:'#b0473f', name:{en:'Hassan Allam Properties',ar:'حسن علام العقارية'}, since:2010, areas:{en:'New Cairo · Mostakbal City · 6th of October',ar:'القاهرة الجديدة · مدينة المستقبل · ٦ أكتوبر'}, tagline:{en:'Engineering-led communities',ar:'مجتمعات بخبرة هندسية'}, desc:{en:'The real-estate arm of a long-established Egyptian engineering and construction group.',ar:'الذراع العقاري لمجموعة هندسة وإنشاءات مصرية عريقة.'}},
{key:'madinetmasr', c1:'#c07a26', name:{en:'Madinet Masr',ar:'مدينة مصر'}, since:1959, areas:{en:'New Cairo · East Cairo',ar:'القاهرة الجديدة · شرق القاهرة'}, tagline:{en:'Established East Cairo communities',ar:'مجتمعات عريقة بشرق القاهرة'}, desc:{en:'A long-established Egyptian developer building large communities in East Cairo.',ar:'مطوّر مصري عريق يبني مجتمعات كبرى بشرق القاهرة.'}},
{key:'cityedge', c1:'#2b6ca8', name:{en:'City Edge Developments',ar:'سيتي إيدج'}, since:2017, areas:{en:'New Alamein · New Capital · North Coast',ar:'العلمين الجديدة · العاصمة الإدارية · الساحل الشمالي'}, tagline:{en:'New-city landmark destinations',ar:'وجهات مميّزة بالمدن الجديدة'}, desc:{en:'A developer focused on landmark destinations across Egypt’s new cities, including North Coast towers.',ar:'مطوّر يركّز على وجهات مميّزة بالمدن الجديدة، منها أبراج الساحل الشمالي.'}},
{key:'ilcazar', c1:'#6d52a3', name:{en:'IL Cazar Developments',ar:'إل كازار'}, since:2016, areas:{en:'New Cairo · North Coast',ar:'القاهرة الجديدة · الساحل الشمالي'}, tagline:{en:'Design-forward launches',ar:'إطلاقات بتصميم متقدّم'}, desc:{en:'A newer developer known for design-forward residential and coastal launches.',ar:'مطوّر حديث معروف بإطلاقات سكنية وساحلية بتصميم متقدّم.'}},
{key:'lavista', c1:'#0d7b8c', name:{en:'La Vista Developments',ar:'لافيستا'}, since:1991, areas:{en:'North Coast · Ain Sokhna · New Cairo',ar:'الساحل الشمالي · العين السخنة · القاهرة الجديدة'}, tagline:{en:'Coastal & second-home specialist',ar:'متخصّص في المصايف والمنزل الثاني'}, desc:{en:'A developer specialising in coastal and second-home communities along Egypt’s coasts.',ar:'مطوّر متخصّص في مجتمعات المصايف والمنزل الثاني على سواحل مصر.'}},
{key:'inertia', c1:'#3f7d3a', name:{en:'Inertia',ar:'إينرشيا'}, since:2007, areas:{en:'North Coast · New Cairo · West Cairo',ar:'الساحل الشمالي · القاهرة الجديدة · غرب القاهرة'}, tagline:{en:'Lifestyle communities & coast',ar:'مجتمعات لايف ستايل ووجهات ساحلية'}, desc:{en:'A developer known for lifestyle-led communities and North Coast destinations.',ar:'مطوّر معروف بمجتمعات لايف ستايل ووجهات على الساحل الشمالي.'}},
{key:'alahlysabbour', c1:'#8a6d33', name:{en:'Al Ahly Sabbour',ar:'الأهلي صبور'}, since:1994, areas:{en:'New Cairo · North Coast · Ain Sokhna',ar:'القاهرة الجديدة · الساحل الشمالي · العين السخنة'}, tagline:{en:'Broad residential portfolio',ar:'محفظة سكنية واسعة'}, desc:{en:'A major developer with a broad residential portfolio across Cairo and the coast.',ar:'مطوّر كبير بمحفظة سكنية واسعة في القاهرة والساحل.'}},
{key:'saudiegyptian', c1:'#26315f', name:{en:'Saudi Egyptian Developers',ar:'السعودية المصرية للتعمير'}, since:1975, areas:{en:'New Cairo · New Capital',ar:'القاهرة الجديدة · العاصمة الإدارية'}, tagline:{en:'Large-scale urban development',ar:'تطوير حضري واسع النطاق'}, desc:{en:'A long-standing developer active in large-scale urban development in Egypt.',ar:'مطوّر عريق نشط في التطوير الحضري واسع النطاق في مصر.'}},
{key:'sumou', c1:'#0077fe', name:{en:'SumouBlvd.',ar:'سمو بوليفارد'}, areas:{en:'Mostakbal City · East Cairo',ar:'مدينة المستقبل · شرق القاهرة'}, tagline:{en:'Hospitality, culture and innovation districts',ar:'وجهات الضيافة والثقافة والابتكار'}, desc:{en:'A leading Saudi developer of hospitality, entertainment and real-estate projects, focused on innovation, luxury and culture. It enters Egypt with Sumou Boulevard in Mostakbal City.',ar:'مطوّر سعودي رائد في مشروعات الضيافة والترفيه والعقارات، يركّز على الابتكار والفخامة والثقافة. يدخل السوق المصري بمشروع سمو بوليفارد في مدينة المستقبل.'}},
{key:'baghush', c1:'#636e63', name:{en:'Marsa Baghush',ar:'مرسى باغوش'}, areas:{en:'Sidi Heneish · North Coast',ar:'سيدي حنيش · الساحل الشمالي'}, tagline:{en:'A place of good spirits',ar:'مكان الأرواح الطيبة'}, desc:{en:'In the most sought-after area of the North Coast, where the sandy beaches and bluest of blue waters of Sidi Heneish are a welcomed reminder of what good living is all about, you can find a gem of the coast called Marsa Baghush. Just off the coastal road and linked to Cairo via the El Alamein and Dabaa roads, this part of the North Coast is now a stone’s throw from the capital.',ar:'في أكثر مناطق الساحل الشمالي رغبةً، حيث الشواطئ الرملية وأصفى مياه سيدي حنيش تذكّرك بمعنى الحياة الجيدة، تجد جوهرة الساحل التي تُسمّى مرسى باغوش. على مقربة من الطريق الساحلي ومتصل بالقاهرة عبر طريقي العلمين والضبعة، أصبح هذا الجزء من الساحل الشمالي على بُعد خطوة من العاصمة.'}},
{key:'beitalbahr', c1:'#444991', name:{en:'Beit Al Bahr',ar:'بيت البحر'}, areas:{en:'Sidi Heneish · North Coast',ar:'سيدي حنيش · الساحل الشمالي'}, tagline:{en:'ELABD Resort, Sidi Heneish',ar:'منتجع العبد، سيدي حنيش'}, desc:{en:'Beit Al Bahr is the result of a collaboration between leading entities in the Egyptian market, collectively forming BAM — a joint venture of El Abd, Gura and J Properties. Its mission is designing and building beachfront units that focus on privacy and exclusivity. A refined beachfront escape spread over 450 acres at El-Abd Resort, Sidi Heneish, with a private 3.5 km beach on the Mediterranean. The master plan loops around people and privacy, bringing homes closer to the seafront, the shimmering pools and the swimmable lagoons, with four boutique hotels, F&B tenants along the shore and native plantations throughout. Design draws on the four elements of life — air, water, earth and fire. Developer-direct primary units.',ar:'بيت البحر نتيجة تعاون بين كيانات رائدة في السوق المصري، تشكّل معاً «BAM» — مشروع مشترك بين العبد وجورا وجي بروبرتيز. ومهمتها تصميم وبناء وحدات على الشاطئ تركّز على الخصوصية والتميّز. ملاذ شاطئي راقٍ على ٤٥٠ فداناً في منتجع العبد بسيدي حنيش، بشاطئ خاص ٣٫٥ كم على البحر المتوسط. الماستر بلان يلتف حول الناس والخصوصية، فيقرّب المنازل من الشاطئ وحمامات السباحة والبحيرات القابلة للسباحة، مع أربعة فنادق بوتيك ومطاعم على الشاطئ ونباتات محلية في كل مكان. التصميم مستوحى من عناصر الحياة الأربعة — الهواء والماء والأرض والنار. وحدات أولية من المطوّر مباشرة.'}}
];
var PROJECTS = [
{slug:'beach-plaza-premium', name:'Beach Plaza Premium', name_ar:'بيتش بلازا بريميوم', dev:'modon', area:'raselhekma', status:'launch', price:19900000, dp:10, years:8, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Ras El Hekma','Beachfront'],ar:['رأس الحكمة','على البحر']}, blurb:{en:'Beach Plaza Premium apartments at Modon Ras El Hekma — beachfront living, fully finished, developer-direct primary units.',ar:'شقق بيتش بلازا بريميوم في مدن رأس الحكمة — معيشة على البحر بتشطيب كامل، وحدات أولية من المطوّر مباشرة.'}},
{slug:'beach-plaza-luxury', name:'Beach Plaza Luxury', name_ar:'بيتش بلازا لاكشري', dev:'modon', area:'raselhekma', status:'launch', price:24600000, dp:10, years:8, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Ras El Hekma','Beachfront'],ar:['رأس الحكمة','على البحر']}, blurb:{en:'Beach Plaza Luxury apartments at Modon Ras El Hekma — the larger beachfront tier, fully finished, developer-direct primary units.',ar:'شقق بيتش بلازا لاكشري في مدن رأس الحكمة — الفئة الأكبر على البحر بتشطيب كامل، وحدات أولية من المطوّر مباشرة.'}},
{slug:'lighthouse-village-luxury', name:'LightHouse Village Luxury', name_ar:'لايت هاوس فيليدج لاكشري', dev:'modon', area:'raselhekma', status:'launch', price:25100000, dp:10, years:8, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Ras El Hekma','Lagoon'],ar:['رأس الحكمة','لاجون']}, blurb:{en:'LightHouse Village Luxury apartments at Modon Ras El Hekma — fully finished homes in the lighthouse district, developer-direct primary units.',ar:'شقق لايت هاوس فيليدج لاكشري في مدن رأس الحكمة — وحدات كاملة التشطيب في حي المنارة، أولية من المطوّر مباشرة.'}},
{slug:'lighthouse-village-ultra-luxury', name:'LightHouse Village Ultra Luxury', name_ar:'لايت هاوس فيليدج ألترا لاكشري', dev:'modon', area:'raselhekma', status:'launch', price:45700000, dp:10, years:8, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Ras El Hekma','Ultra luxury'],ar:['رأس الحكمة','ألترا لاكشري']}, blurb:{en:'LightHouse Village Ultra Luxury at Modon Ras El Hekma — the largest apartments in the lighthouse district, developer-direct primary units.',ar:'لايت هاوس فيليدج ألترا لاكشري في مدن رأس الحكمة — أكبر الشقق في حي المنارة، وحدات أولية من المطوّر مباشرة.'}},
{slug:'wadi-east', name:'Wadi East', name_ar:'وادي إيست', dev:'modon', area:'raselhekma', status:'launch', price:53000000, dp:10, years:8, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Townhouse · Standalone Villa',ar:'تاون هاوس · فيلا مستقلة'}, tags:{en:['Ras El Hekma','Townhouses & villas'],ar:['رأس الحكمة','تاون هاوس وفيلات']}, blurb:{en:'Wadi East at Modon Ras El Hekma — townhouses and standalone villas in the valley district, developer-direct primary units.',ar:'وادي إيست في مدن رأس الحكمة — تاون هاوس وفيلات مستقلة في حي الوادي، وحدات أولية من المطوّر مباشرة.'}},
{slug:'montage', name:'Montage', name_ar:'مونتاج', dev:'modon', area:'raselhekma', status:'launch', price:222800000, dp:10, years:8, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Standalone Villa',ar:'فيلا مستقلة'}, tags:{en:['Ras El Hekma','Signature villas'],ar:['رأس الحكمة','فيلات مميزة']}, blurb:{en:'Montage at Modon Ras El Hekma — the signature standalone villa collection, developer-direct primary units.',ar:'مونتاج في مدن رأس الحكمة — مجموعة الفيلات المستقلة المميزة، وحدات أولية من المطوّر مباشرة.'}},
{slug:'modon-boulevard', name:'Boulevard', name_ar:'بوليفارد', dev:'modon', area:'raselhekma', status:'launch', price:19100000, dp:10, years:8, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Ras El Hekma','Boulevard'],ar:['رأس الحكمة','بوليفارد']}, blurb:{en:'Boulevard apartments inside Modon Ras El Hekma — fully finished homes on the city spine, developer-direct primary units.',ar:'شقق بوليفارد داخل مدن رأس الحكمة — وحدات كاملة التشطيب على محور المدينة، أولية من المطوّر مباشرة.'}},
{slug:'sumou-boulevard', name:'Sumou Boulevard', name_ar:'سمو بوليفارد', dev:'sumou', area:'mostakbal', status:'launch', price:2480000, dp:10, years:10, delivery:'2030', finishing:{en:'Residential fully finished with A/C · Offices core & shell',ar:'السكني كامل التشطيب مع تكييف · المكاتب على المحارة'}, types:{en:'Studio · Studio Plus · Apartment · Smart Office · Office',ar:'استوديو · استوديو بلس · شقة · مكتب ذكي · مكتب'}, tags:{en:['Mostakbal City','Mixed use','Prelaunch'],ar:['مدينة المستقبل','متعدد الاستخدامات','ما قبل الإطلاق']}, blurb:{en:'The biggest mixed-use project in East Cairo and the first of its kind in Mostakbal City — 250,000 m² of land, 500,000 m² built-up, with an innovation district, a cultural boulevard, three hotels and branded residences. Developer-direct primary units.',ar:'أكبر مشروع متعدد الاستخدامات في شرق القاهرة وأول مشروع من نوعه في مدينة المستقبل — ٢٥٠٬٠٠٠ م² أرض و٥٠٠٬٠٠٠ م² مبانٍ، يضم منطقة ابتكار وبوليفارد ثقافي وثلاثة فنادق ومساكن ذات علامة. وحدات أولية من المطوّر مباشرة.'}},
{slug:'salt', name:'Salt', name_ar:'سولت', dev:'tatweer', area:'raselhekma', status:'primary', price:9900000, dp:5, years:8, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Chalet · Townhouse · Twin House · Standalone Villa',ar:'شاليه · تاون هاوس · توين هاوس · فيلا مستقلة'}, tags:{en:['Ras El Hekma','Lagoons'],ar:['رأس الحكمة','بحيرات']}, blurb:{en:'Tatweer Misr\'s Salt on the Ras El Hekma coast — chalets, townhouses and standalone homes, developer-direct primary units.',ar:'سولت من تطوير مصر على ساحل رأس الحكمة — شاليهات وتاون هاوس وفيلات مستقلة، وحدات أولية من المطوّر مباشرة.'}},
{slug:'rivers', name:'Rivers', name_ar:'ريفرز', dev:'tatweer', area:'zayed', status:'primary', price:7800000, dp:5, years:10, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Apartment · Duplex · Standalone Villa',ar:'شقة · دوبلكس · فيلا مستقلة'}, tags:{en:['New Zayed','Waterfront'],ar:['زايد الجديدة','ووتر فرونت']}, blurb:{en:'Tatweer Misr\'s Rivers in New Zayed — waterfront apartments, duplexes and standalone villas, developer-direct primary units.',ar:'ريفرز من تطوير مصر في زايد الجديدة — شقق ودوبلكس وفيلات مستقلة على الووتر فرونت، وحدات أولية من المطوّر مباشرة.'}},
{slug:'d-bay', name:'D-Bay', name_ar:'دي باي', dev:'tatweer', area:'sahel', status:'primary', price:18400000, dp:5, years:8, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Chalet · Twin House · Standalone Villa',ar:'شاليه · توين هاوس · فيلا مستقلة'}, tags:{en:['North Coast','Dabaa'],ar:['الساحل الشمالي','الضبعة']}, blurb:{en:'Tatweer Misr\'s D-Bay on the Dabaa coast, North Coast — chalets, twin houses and lagoon villas, developer-direct primary units.',ar:'دي باي من تطوير مصر على ساحل الضبعة بالساحل الشمالي — شاليهات وتوين هاوس وفيلات لاجون، وحدات أولية من المطوّر مباشرة.'}},
{slug:'scenes', name:'Scenes', name_ar:'سينز', dev:'tatweer', area:'mostakbal', status:'primary', price:14800000, dp:5, years:10, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Townhouse · Twin House · Standalone Villa',ar:'تاون هاوس · توين هاوس · فيلا مستقلة'}, tags:{en:['Mostakbal City','Homes'],ar:['مدينة المستقبل','فيلات']}, blurb:{en:'Tatweer Misr\'s Scenes in Mostakbal City — townhouses, twin houses and standalone villas, developer-direct primary units.',ar:'سينز من تطوير مصر في مدينة المستقبل — تاون هاوس وتوين هاوس وفيلات مستقلة، وحدات أولية من المطوّر مباشرة.'}},
{slug:'villette', name:'Villette', name_ar:'فيليت', dev:'sodic', area:'newcairo', status:'primary', price:9500000, dp:10, years:7, delivery:'2026', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['New Cairo','Family'],ar:['القاهرة الجديدة','عائلي']}, blurb:{en:'Design-led New Cairo community with primary units released directly by SODIC.',ar:'مجتمع بتصميم مميّز بالقاهرة الجديدة مع وحدات أولية تُطرح من سوديك مباشرة.'}},
{slug:'sodic-east', name:'SODIC East', name_ar:'سوديك إيست', dev:'sodic', area:'newcairo', status:'launch', price:6800000, dp:10, years:8, delivery:'2028', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse',ar:'شقة · تاون هاوس'}, tags:{en:['East Cairo','8-yr plan'],ar:['شرق القاهرة','تقسيط ٨ سنوات']}, blurb:{en:'A large master-planned launch in East New Cairo with staged developer inventory.',ar:'إطلاق كبير مخطط في شرق القاهرة الجديدة مع طرح مرحلي من المطوّر.'}},
{slug:'eastown', name:'Eastown', name_ar:'إيستاون', dev:'sodic', area:'newcairo', status:'ready', price:7400000, dp:0, years:0, delivery:'Ready', finishing:{en:'Core & shell / finished',ar:'نصف / كامل التشطيب'}, types:{en:'Apartment · Duplex',ar:'شقة · دوبلكس'}, tags:{en:['Ready to move','Fifth Settlement edge'],ar:['استلام فوري','حدود التجمع']}, blurb:{en:'An established, largely delivered SODIC community in East Cairo with ready resale-free primary stock where available.',ar:'مجتمع سوديك مكتمل إلى حدٍّ كبير بشرق القاهرة مع وحدات جاهزة عند توفّرها.'}},
{slug:'allegria', name:'Allegria', name_ar:'أليجريا', dev:'sodic', area:'zayed', status:'ready', price:18500000, dp:0, years:0, delivery:'Ready', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa · Twin house',ar:'فيلا · توين هاوس'}, tags:{en:['Sheikh Zayed','Golf'],ar:['الشيخ زايد','جولف']}, blurb:{en:'An established premium villa community in West Cairo with a golf setting.',ar:'مجتمع فيلات راقٍ مكتمل بغرب القاهرة بإطلالة على الجولف.'}},
{slug:'mountain-view-icity', name:'Mountain View iCity', name_ar:'ماونتن ڤيو آي سيتي', dev:'mountainview', area:'newcairo', status:'launch', price:7200000, dp:10, years:9, delivery:'2028', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Duplex',ar:'شقة · دوبلكس'}, tags:{en:['Smart city','9-yr plan'],ar:['مدينة ذكية','تقسيط ٩ سنوات']}, blurb:{en:'Themed parks and a connected-home concept, primary release by Mountain View.',ar:'حدائق مميّزة ومفهوم المنزل المتصل، طرح أولي من ماونتن ڤيو.'}},
{slug:'bloomfields', name:'Bloomfields', name_ar:'بلوم فيلدز', dev:'tatweer', area:'mostakbal', status:'launch', price:5800000, dp:5, years:10, delivery:'Ready', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Duplex',ar:'شقة · دوبلكس'}, tags:{en:['Mostakbal City','5% DP'],ar:['مدينة المستقبل','مقدم ٥٪']}, blurb:{en:'A value-focused launch in Mostakbal City with a low down payment from the developer.',ar:'إطلاق اقتصادي بمدينة المستقبل بمقدم منخفض من المطوّر.'}},
{slug:'il-bosco-city', name:'Il Bosco City', name_ar:'إل بوسكو سيتي', dev:'misritalia', area:'capital', status:'launch', price:6100000, dp:10, years:9, delivery:'2029', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['New Capital','Green'],ar:['العاصمة الإدارية','أخضر']}, blurb:{en:'A biophilic community in the New Administrative Capital, primary units from Misr Italia.',ar:'مجتمع أخضر بالعاصمة الإدارية الجديدة، وحدات أولية من مصر إيطاليا.'}},
{slug:'district-5', name:'District 5', name_ar:'ديستريكت ٥', dev:'marakez', area:'newcairo', status:'primary', price:11285000, dp:10, years:7, delivery:'2027', types:{en:'Apartment · Duplex · Office',ar:'شقة · دوبلكس · مكتب'}, tags:{en:['New Cairo','268 acres','Mixed-use'],ar:['القاهرة الجديدة','٢٦٨ فدان','متعدد الاستخدامات']}, blurb:{en:'Marakez’s 268-acre integrated district in New Katameya, New Cairo — one destination to live, shop, work and play, built around District 5 Club, District 5 Campus, the Urbane Hotel, D5M and Mindhaus offices. Homes come in a modern yet earthy architecture with generous interiors, linked by trail systems, bike lanes, landscaped parks and plazas. Apartments, a duplex and offices, part of the project already delivered. Developer-direct primary units.',ar:'حي مراكز المتكامل على ٢٦٨ فداناً في القطامية الجديدة بالقاهرة الجديدة — وجهة واحدة للسكن والتسوق والعمل والترفيه، تدور حول نادي ديستريكت ٥ وكامباس ديستريكت ٥ وفندق أوربان وD5M ومكاتب مايندهاوس. منازل بعمارة عصرية ذات طابع ترابي ومساحات داخلية رحبة، تربطها ممرات ومسارات دراجات وحدائق وساحات. شقق ودوبلكس ومكاتب، وجزء من المشروع مُسلَّم بالفعل. وحدات أولية من المطوّر مباشرة.'}},
{slug:'marsa-baghush', name:'Marsa Baghush', name_ar:'مرسى باغوش', dev:'baghush', area:'sahel', status:'launch', price:19135200, dp:10, years:8, delivery:'2028', types:{en:'Chalet · Twin house · Villa',ar:'شاليه · توين هاوس · فيلا'}, tags:{en:['Sidi Heneish','Five swimmable lagoons','Six clusters'],ar:['سيدي حنيش','خمس بحيرات للسباحة','ستة أحياء']}, blurb:{en:'A gem of the North Coast at Sidi Heneish, just off the coastal road and linked to Cairo via the El Alamein and Dabaa roads. Five crystal-clear lagoons — each over 50 metres wide and 300 metres long, swimmable and lifeguarded — run through six named clusters: The Vineyard, Lemon Bliss, Olive Grove, the Fig Cluster, the Plum Line and Melon Villas. A botanical spine and bike paths link the homes to 20+ commercial shops and restaurants, a state-of-the-art fitness facility and beach service. Chalets, twin houses and villas; the brochure’s type range runs 115 to 615 m². Developer-direct primary units.',ar:'جوهرة الساحل الشمالي في سيدي حنيش، على مقربة من الطريق الساحلي ومتصلة بالقاهرة عبر طريقي العلمين والضبعة. خمس بحيرات صافية — كل واحدة أكثر من ٥٠ متراً عرضاً و٣٠٠ متر طولاً، قابلة للسباحة وبمنقذين — تمتد بين ستة أحياء: ذا فينيارد، ليمون بليس، أوليف جروف، فيج كلاستر، ذا بلَم لاين، وميلون فيلاز. يربط عمود أخضر ومسارات دراجات المنازل بأكثر من ٢٠ متجراً ومطعماً، ومركز لياقة حديث، وخدمة على الشاطئ. شاليهات وتوين هاوس وفيلات؛ ومدى المساحات في البروشور من ١١٥ إلى ٦١٥ م². وحدات أولية من المطوّر مباشرة.'}},
{slug:'alam-al-roum', name:'Alam Al Roum', name_ar:'علم الروم', dev:'qataridiar', area:'sahel', status:'launch', types:{en:'Apartment · Townhouse · Villa · Estate',ar:'شقة · تاون هاوس · فيلا · قصر'}, tags:{en:['North Coast','4,902 feddans','7.2 km shoreline'],ar:['الساحل الشمالي','٤٬٩٠٢ فدان','٧٫٢ كم شاطئ']}, blurb:{en:'A 4,902-feddan coastal city on 7.2 kilometres of Mediterranean shoreline, fifteen minutes from Marsa Matrouh International Airport. Masterplanned by Skidmore, Owings & Merrill as one connected destination: a grand boulevard links the shoreline to the heart of the city, twenty-eight kilometres of swimmable lagoons bring the water into every neighbourhood, and a continuous landscape spine by SWA joins the districts on foot. An international marina, an eighteen-hole championship course between lagoon and sea, town centres, a freezone economy and a longevity quarter give it the civic substance of a true city. Homes run from lagoon-front apartments to the estates of the Royal Quarter.',ar:'مدينة ساحلية على ٤٬٩٠٢ فدان بامتداد ٧٫٢ كيلومتر من ساحل المتوسط، على بعد خمس عشرة دقيقة من مطار مرسى مطروح الدولي. صمّم مخططها العام مكتب سكيدمور أوينجز آند ميريل كوجهة واحدة متصلة: بوليفارد كبير يربط الشاطئ بقلب المدينة، و٢٨ كيلومتراً من البحيرات القابلة للسباحة تُدخل الماء إلى كل حي، وعمود أخضر متواصل من تصميم SWA يصل الأحياء مشياً. مارينا دولية، وملعب جولف بطولة من ثمانية عشر حفرة بين البحيرة والبحر، ومراكز مدينة، واقتصاد منطقة حرة، وحي لطول العمر تمنحها جوهر المدينة الحقيقية. وتمتد المنازل من شقق على البحيرات إلى قصور الحي الملكي.'}},
{slug:'bab-shores', name:'Shores', name_ar:'شورز', dev:'beitalbahr', area:'sahel', status:'launch', price:3930947, dp:10, years:8, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Chalet',ar:'شاليه'}, tags:{en:['Sidi Heneish','16 units','123–245 m²'],ar:['سيدي حنيش','١٦ وحدة','١٢٣–٢٤٥ م²']}},
{slug:'bab-roots', name:'Roots', name_ar:'روتس', dev:'beitalbahr', area:'sahel', status:'launch', price:29282845, dp:10, years:7, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa · Chalet · Twin house',ar:'فيلا · شاليه · توين هاوس'}, tags:{en:['Sidi Heneish','5 units','142–590 m²'],ar:['سيدي حنيش','٥ وحدات','١٤٢–٥٩٠ م²']}},
{slug:'bab-rays', name:'Rays', name_ar:'رايز', dev:'beitalbahr', area:'sahel', status:'launch', price:39950000, dp:10, years:7, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa · Townhouse',ar:'فيلا · تاون هاوس'}, tags:{en:['Sidi Heneish','3 units','185–340 m²'],ar:['سيدي حنيش','٣ وحدات','١٨٥–٣٤٠ م²']}},
{slug:'bab-hills-by-the-sea', name:'Hills by the sea', name_ar:'هيلز باي ذا سي', dev:'beitalbahr', area:'sahel', status:'launch', price:131400000, dp:10, years:7, delivery:'2028', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa',ar:'فيلا'}, tags:{en:['Sidi Heneish','2 units','450–475 m²'],ar:['سيدي حنيش','وحدتان','٤٥٠–٤٧٥ م²']}},
{slug:'bab-hills', name:'Hills', name_ar:'هيلز', dev:'beitalbahr', area:'sahel', status:'launch', price:54573750, dp:50, years:2, delivery:'Ready', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa',ar:'فيلا'}, tags:{en:['Sidi Heneish','1 unit','180 m²'],ar:['سيدي حنيش','وحدة واحدة','١٨٠ م²']}},
{slug:'crescent-walk', name:'Crescent Walk', name_ar:'كريسنت ووك', dev:'marakez', area:'newcairo', status:'launch', price:9495000, dp:5, years:8, delivery:'2029', types:{en:'Apartment · Duplex · Townhouse · Twin house · Villa',ar:'شقة · دوبلكس · تاون هاوس · توين هاوس · فيلا'}, tags:{en:['6th Settlement','Art deco','5% down'],ar:['التجمع السادس','آرت ديكو','مقدم ٥٪']}, blurb:{en:'“A Glimpse of the Past, A Step into the Future.” Marakez’s East Cairo neighbourhood in the 6th Settlement, built around art deco design — lofty, high-ceilinged rooms, expansive glass windows and spacious terraces opening onto lush greenery. An extended green spine and paseo, a central park, street-side garden parks and a neighborhood park run through it, alongside a clubhouse, sports facilities and a commercial park. Seven minutes from Golden Square, twelve from AUC and fourteen from District 5. Developer-direct primary units from 5% down over 8 years, delivery 2029.',ar:'«لمحة من الماضي، خطوة نحو المستقبل». حي مراكز في شرق القاهرة بالتجمع السادس، مبني حول تصميم آرت ديكو — غرف عالية الأسقف ونوافذ زجاجية واسعة وتراسات رحبة تطل على مساحات خضراء وارفة. يمتد بداخله عمود أخضر وممشى، وحديقة مركزية، وحدائق على جانبي الشوارع، وحديقة للحي، إلى جانب كلوب هاوس ومرافق رياضية وبارك تجاري. سبع دقائق من الجولدن سكوير، واثنتا عشرة من الجامعة الأمريكية، وأربع عشرة من ديستريكت ٥. وحدات أولية من المطوّر مباشرة من مقدم ٥٪ على ٨ سنوات، التسليم ٢٠٢٩.'}},
{slug:'stei8ht-eastmed', name:'Stei8ht Eastmed', name_ar:'ستيت إيست ميد', dev:'lmd', area:'newcairo', status:'primary', price:9895200, dp:5, years:5, delivery:'2027', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Clinic',ar:'عيادة'}, tags:{en:['New Cairo','Medical & business'],ar:['القاهرة الجديدة','طبي وتجاري']}, blurb:{en:'LMD\'s Stei8ht Eastmed medical and business address in New Cairo — developer-direct primary clinics and offices.',ar:'حي ستيت إيست ميد الطبي والتجاري من LMD في القاهرة الجديدة — عيادات ومكاتب أولية من المطوّر مباشرة.'}},
{slug:'three-sixty', name:'Three Sixty', name_ar:'ثري سيكستي', dev:'lmd', area:'newcairo', status:'primary', price:25076950, dp:10, years:5, delivery:'Ready', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Administrative Office · Clinic · Office',ar:'مكتب إداري · عيادة · مكتب'}, tags:{en:['New Cairo','Business & medical'],ar:['القاهرة الجديدة','تجاري وطبي']}, blurb:{en:'LMD\'s Three Sixty business and medical hub in New Cairo — developer-direct primary offices, clinics and admin units.',ar:'مركز ثري سيكستي التجاري والطبي من LMD في القاهرة الجديدة — مكاتب وعيادات ووحدات إدارية أولية من المطوّر مباشرة.'}},
{slug:'stei8ht-there', name:'Stei8ht There', name_ar:'ستيت ذير', dev:'lmd', area:'newcairo', status:'primary', price:103950000, dp:10, years:7, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Office',ar:'مكتب'}, tags:{en:['New Cairo','Offices'],ar:['القاهرة الجديدة','مكاتب']}, blurb:{en:'LMD\'s Stei8ht There office address in New Cairo — developer-direct primary office space.',ar:'وجهة ستيت ذير للمكاتب من LMD في القاهرة الجديدة — مساحات مكتبية أولية من المطوّر مباشرة.'}},
{slug:'stei8ht-eastside', name:'Stei8ht Eastside', name_ar:'ستيت إيست سايد', dev:'lmd', area:'newcairo', status:'primary', price:24827985, dp:10, years:8, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Administrative Office',ar:'مكتب إداري'}, tags:{en:['New Cairo','Administrative'],ar:['القاهرة الجديدة','إداري']}, blurb:{en:'LMD\'s Stei8ht Eastside administrative address in New Cairo — developer-direct primary admin offices.',ar:'وجهة ستيت إيست سايد الإدارية من LMD في القاهرة الجديدة — مكاتب إدارية أولية من المطوّر مباشرة.'}},
{slug:'one-ninety', name:'One Ninety', name_ar:'ون ناينتي', dev:'lmd', area:'newcairo', status:'primary', price:72187500, years:3.5, delivery:'2027', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Retail',ar:'محل تجاري'}, tags:{en:['New Cairo','Retail'],ar:['القاهرة الجديدة','تجاري']}, blurb:{en:'LMD\'s One Ninety retail address in New Cairo — developer-direct primary retail space.',ar:'وجهة ون ناينتي التجارية من LMD في القاهرة الجديدة — محلات أولية من المطوّر مباشرة.'}},
{slug:'zoya', name:'ZOYA', name_ar:'زويا', dev:'lmd', area:'sahel', status:'primary', price:18100000, dp:20, years:4, delivery:'2027', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Villa · Twin House · Chalet · Cabin',ar:'فيلا · توين هاوس · شاليه · كابين'}, tags:{en:['North Coast','Beachfront resort'],ar:['الساحل الشمالي','منتجع على البحر']}, blurb:{en:'LMD\'s ZOYA on Ghazala Bay, North Coast — a beachfront resort community of villas, chalets and cabanas; developer-direct primary units.',ar:'زويا من LMD في غزالة باي بالساحل الشمالي — مجتمع منتجعي على البحر من فيلات وشاليهات وكبائن، وحدات أولية من المطوّر مباشرة.'}},
{slug:'phonix-swanlake', name:'The Phonix', name_ar:'ذا فينيكس', dev:'hassanallam', area:'newcairo', status:'primary', price:15700000, dp:10, years:2, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['New Cairo','SwanLake'],ar:['القاهرة الجديدة','سوان ليك']}, blurb:{en:'Hassan Allam\'s The Phonix residences at SwanLake, New Cairo — developer-direct primary apartments.',ar:'مساكن ذا فينيكس من حسن علام في سوان ليك بالقاهرة الجديدة — شقق أولية من المطوّر مباشرة.'}},
{slug:'ampm-swanlake', name:'AM:PM', name_ar:'إيه إم بي إم', dev:'hassanallam', area:'newcairo', status:'primary', price:42600000, dp:5, years:7, delivery:'2028', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Office',ar:'مكتب'}, tags:{en:['New Cairo','Business'],ar:['القاهرة الجديدة','تجاري']}, blurb:{en:'Hassan Allam\'s AM:PM business address at SwanLake, New Cairo — developer-direct primary offices.',ar:'وجهة AM:PM التجارية من حسن علام في سوان ليك بالقاهرة الجديدة — مكاتب أولية من المطوّر مباشرة.'}},
{slug:'the-valleys', name:'The Valleys', name_ar:'ذا فالييز', dev:'hassanallam', area:'mostakbal', status:'primary', price:30400000, dp:10, years:9, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Townhouse · Twin House · Standalone Villa',ar:'تاون هاوس · توين هاوس · فيلا مستقلة'}, tags:{en:['Mostakbal City','Homes'],ar:['مدينة المستقبل','فيلات']}, blurb:{en:'Hassan Allam\'s The Valleys in Mostakbal City — townhouses, twin houses and standalone villas, developer-direct primary units.',ar:'ذا فالييز من حسن علام في مدينة المستقبل — تاون هاوس وتوين هاوس وفيلات مستقلة، وحدات أولية من المطوّر مباشرة.'}},
{slug:'park-central', name:'Park Central', name_ar:'بارك سنترال', dev:'hassanallam', area:'mostakbal', status:'primary', price:8300000, dp:5, years:10, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Mostakbal City','Parkside'],ar:['مدينة المستقبل','على الحديقة']}, blurb:{en:'Hassan Allam\'s Park Central in Mostakbal City — developer-direct primary apartments overlooking green parks.',ar:'بارك سنترال من حسن علام في مدينة المستقبل — شقق أولية من المطوّر مباشرة تطل على الحدائق.'}},
{slug:'the-great-lawn', name:'The Great Lawn', name_ar:'ذا جريت لون', dev:'hassanallam', area:'mostakbal', status:'primary', price:8300000, dp:5, years:10, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['Mostakbal City','Parkside'],ar:['مدينة المستقبل','على الحديقة']}, blurb:{en:'Hassan Allam\'s The Great Lawn at Park Central, Mostakbal City — developer-direct primary apartments.',ar:'ذا جريت لون في بارك سنترال بمدينة المستقبل من حسن علام — شقق أولية من المطوّر مباشرة.'}},
{slug:'swan-lake-west', name:'Swan Lake West', name_ar:'سوان ليك ويست', dev:'hassanallam', area:'october', status:'primary', price:24200000, dp:5, years:10, delivery:'2030', finishing:{en:'To confirm',ar:'تُؤكَّد'}, types:{en:'Apartment · Twin House · Standalone Villa',ar:'شقة · توين هاوس · فيلا مستقلة'}, tags:{en:['6th of October','Lakeside'],ar:['٦ أكتوبر','على البحيرة']}, blurb:{en:'Hassan Allam\'s Swan Lake West in 6th of October — developer-direct primary apartments and twin houses by the lagoons.',ar:'سوان ليك ويست من حسن علام في ٦ أكتوبر — شقق وتوين هاوس أولية من المطوّر مباشرة على البحيرات.'}},
{slug:'hyde-park-new-cairo', name:'Hyde Park New Cairo', name_ar:'هايد بارك القاهرة الجديدة', dev:'hydepark', area:'newcairo', status:'primary', price:8600000, dp:10, years:8, delivery:'2027', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['Central park','Family'],ar:['حديقة مركزية','عائلي']}, blurb:{en:'A large central-park community in New Cairo with developer-direct units.',ar:'مجتمع بحديقة مركزية كبيرة بالقاهرة الجديدة مع وحدات من المطوّر مباشرة.'}},
{slug:'fifth-square', name:'Fifth Square', name_ar:'فيفث سكوير', dev:'marasem', area:'fifthsettlement', status:'primary', price:6200000, dp:10, years:8, delivery:'2027', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Duplex · Villa',ar:'شقة · دوبلكس · فيلا'}, tags:{en:['Fifth Settlement','Prime'],ar:['التجمع الخامس','موقع مميّز']}, blurb:{en:'A prime Fifth Settlement community with developer-direct primary units and long plans.',ar:'مجتمع مميّز بالتجمع الخامس مع وحدات أولية من المطوّر مباشرة وخطط طويلة.'}},
{slug:'cairo-gate', name:'Cairo Gate', name_ar:'كايرو جيت', dev:'emaarmisr', area:'zayed', status:'launch', price:11500000, dp:10, years:8, delivery:'2027', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse',ar:'شقة · تاون هاوس'}, tags:{en:['Sheikh Zayed','Gateway'],ar:['الشيخ زايد','بوابة']}, blurb:{en:'A gateway West Cairo launch by Emaar Misr on the Cairo–Alexandria corridor.',ar:'إطلاق مميّز بغرب القاهرة من إعمار مصر على محور القاهرة–الإسكندرية.'}},
{slug:'aeon', name:'Aeon', name_ar:'إيون', dev:'marakez', area:'october', status:'launch', price:36000000, dp:10, years:4, delivery:'2026', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment',ar:'شقة'}, tags:{en:['6th of October','Mixed-use'],ar:['٦ أكتوبر','متعدد الاستخدامات']}, blurb:{en:'A mixed-use launch in 6th of October pairing homes with retail and offices.',ar:'إطلاق متعدد الاستخدامات ب٦ أكتوبر يجمع السكن مع التجزئة والمكاتب.'}},
{slug:'il-monte-galala', name:'Il Monte Galala', name_ar:'إل مونتي جلالة', dev:'tatweer', area:'sokhna', status:'primary', price:7400000, dp:5, years:10, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Standalone Villa · Studio · Apartment · Chalet · Loft · Twin House · Cabin · Penthouse',ar:'فيلا مستقلة · استوديو · شقة · شاليه · لوفت · توين هاوس · كابين · بنتهاوس'}, tags:{en:['Ain Sokhna','Sea view'],ar:['العين السخنة','إطلالة بحر']}, blurb:{en:'A terraced mountain-and-sea resort in Ain Sokhna by Tatweer Misr.',ar:'منتجع جبلي بحري متدرّج بالعين السخنة من تطوير مصر.'}},
{slug:'ogami-north-coast', name:'Ogami', name_ar:'أوجامي', dev:'sodic', area:'raselhekma', status:'launch', price:22329000, dp:5, years:8, delivery:'2029–2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment · Chalet · Townhouse · Twin house · Villa',ar:'شقة · شاليه · تاون هاوس · توين هاوس · فيلا'}, tags:{en:['Ras El Hekma','Nobu-branded','5% down'],ar:['رأس الحكمة','بشراكة Nobu','مقدم ٥٪']}, blurb:{en:'SODIC’s Japanese-inspired Ras El Hekma resort at Km 205 on 440 feddan — an 800m private crystalline beach, 11km of crystal lagoons (120,000 m² swimmable) and a Nobu hotel with branded residences. Its walkable Botanica Town phase adds G+2 residences with private ground-floor gardens and maid’s rooms, fully finished with built-in AC. Developer-direct primary units from 5% down over up to 8 years.',ar:'منتجع سوديك المستوحى من اليابان برأس الحكمة عند الكيلو ٢٠٥ على مساحة ٤٤٠ فدان — شاطئ كريستالي خاص ٨٠٠ متر و١١ كم بحيرات كريستالية (١٢٠٬٠٠٠ م² قابلة للسباحة) وفندق Nobu بريزيدنسز فندقية. وتضيف مرحلة Botanica Town المخصّصة للمشاة وحدات أرضي+طابقين بحدائق خاصة بالأرضي وغرفة خادمة، كاملة التشطيب بتكييف مدمج. وحدات أولية من المطوّر مباشرة من مقدم ٥٪ وتقسيط حتى ٨ سنوات.'}},
{slug:'ramla-ras-el-hekma', name:'Ramla', name_ar:'رملة', dev:'marakez', area:'raselhekma', status:'launch', price:23418000, dp:10, years:7, delivery:'2027', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Chalet · Duplex · Penthouse · Townhouse · Twin house · Villa',ar:'شاليه · دوبلكس · بنتهاوس · تاون هاوس · توين هاوس · فيلا'}, tags:{en:['Ras El Hekma','1.4km beach','5% down'],ar:['رأس الحكمة','شاطئ ١٫٤ كم','مقدم ٥٪']}, blurb:{en:'Marakez’s Ramla at Kilo 215, Ras El Hekma — a 402-acre beachfront community (WATG master plan) with a 1.4km beach, a 22-acre lagoon and a 13-acre sports campus, laid out across the Breeze, Acacia, Oasis, The Town and Dunes neighbourhoods. Fully finished chalets, duplexes, a penthouse, townhouses, twin houses and villas with concealed AC, plus collaborations with Adrère Amellal, Azza Fahmy and Mariolino. From 10% down over up to 7 years; handover between 2027 and 2030. Developer-direct primary units.',ar:'وجهة رملة من مراكز عند الكيلو ٢١٥ برأس الحكمة — مجتمع شاطئي على ٤٠٢ فدان (تخطيط WATG) بشاطئ ١٫٤ كم وبحيرة ٢٢ فداناً وكامباس رياضي ١٣ فداناً، موزّع على أحياء بريز وأكاسيا وأواسيس وذا تاون وديونز. شاليهات ودوبلكس وبنتهاوس وتاون هاوس وتوين هاوس وفيلات كاملة التشطيب بتكييف مخفي، بالتعاون مع Adrère Amellal وعزة فهمي وMariolino. من مقدم ١٠٪ وتقسيط حتى ٧ سنوات؛ التسليم بين ٢٠٢٧ و٢٠٣٠. وحدات أولية من المطوّر مباشرة.'}},
{slug:'caesar-north-coast', name:'Caesar', name_ar:'قيصر', dev:'sodic', area:'raselhekma', status:'launch', price:39200000, dp:5, years:8, finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Townhouse · Twin house · Villa',ar:'تاون هاوس · توين هاوس · فيلا'}, tags:{en:['Ras El Hekma','1.2km beach','5% down'],ar:['رأس الحكمة','شاطئ ١٫٢ كم','مقدم ٥٪']}, blurb:{en:'SODIC’s Caesar on the North Coast — a terraced bay with 1.2km of pristine beachfront and 20,000+ sqm of swimmable crystal lagoons, a clubhouse, the Matcha retail village and a beachfront pier. Fully finished townhomes, twin homes, urban and standalone villas. Developer-direct primary units, from 5% down over 8 years.',ar:'مشروع قيصر من سوديك على الساحل الشمالي — خليج متدرّج بشاطئ نقي ١٫٢ كم وأكثر من ٢٠٬٠٠٠ م² بحيرات كريستالية للسباحة، وكلوب هاوس وقرية Matcha التجارية وبروميناد على الشاطئ. تاون هاوس وتوين هاوس وفيلات حضرية ومستقلة كاملة التشطيب. وحدات أولية من المطوّر مباشرة، من مقدم ٥٪ وتقسيط ٨ سنوات.'}},
{slug:'june-north-coast', name:'June', name_ar:'جون', dev:'sodic', area:'raselhekma', status:'launch', price:89300000, dp:5, years:8, finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Villa',ar:'فيلا'}, tags:{en:['Ras El Hekma','Miami-inspired','Marriott'],ar:['رأس الحكمة','بإلهام ميامي','ماريوت']}, blurb:{en:'SODIC’s June — a Miami-inspired North Coast beach town where homes rise 50m above sea level for panoramic views, with a Marriott hotel and Lemon Spaces serviced apartments, a boardwalk, swimmable lagoons and infinity pools. Fully finished Coral and Opal villas. Developer-direct primary units, from 5% down over 8 years.',ar:'مشروع جون من سوديك — بلدة شاطئية بإلهام ميامي على الساحل الشمالي ترتفع منازلها ٥٠ متراً فوق سطح البحر لإطلالات بانورامية، بفندق ماريوت وشقق فندقية Lemon Spaces وبوردووك وبحيرات للسباحة وحمّامات إنفينيتي. فيلات Coral وOpal كاملة التشطيب. وحدات أولية من المطوّر مباشرة، من مقدم ٥٪ وتقسيط ٨ سنوات.'}},
{slug:'badya-october', name:'Badya', name_ar:'بادية', dev:'palmhills', area:'october', status:'launch', price:5600000, dp:10, years:8, delivery:'2029', finishing:{en:'Fully finished / core & shell',ar:'تشطيب كامل / خرسانة'}, types:{en:'Apartment · Townhouse · Twin house · Villa',ar:'شقة · تاون هاوس · توين هاوس · فيلا'}, tags:{en:['6th of October','Master-planned city'],ar:['٦ أكتوبر','مدينة متكاملة']}, blurb:{en:'Palm Hills’ large master-planned city in West Cairo, organised into walkable districts with schools, parks and retail. Developer-direct primary units.',ar:'مدينة بالم هيلز المتكاملة الكبرى بغرب القاهرة، مقسّمة إلى أحياء صديقة للمشاة بمدارس وحدائق ومحال. وحدات أولية من المطوّر مباشرة.'}},
{slug:'the-estates-zayed', name:'The Estates', name_ar:'ذي إستيتس', dev:'sodic', area:'zayed', status:'primary', price:12000000, dp:10, years:7, delivery:'2027', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Villa',ar:'شقة · فيلا'}, tags:{en:['New Zayed','Low-density'],ar:['زايد الجديدة','كثافة منخفضة']}, blurb:{en:'A SODIC community in New Zayed, west of Cairo — low-density residences set among landscaped open space. Developer-direct primary units.',ar:'مجتمع من سوديك بزايد الجديدة غرب القاهرة — وحدات بكثافة منخفضة وسط مساحات خضراء منسّقة. وحدات أولية من المطوّر مباشرة.'}},
{slug:'aliva-mostakbal', name:'Aliva', name_ar:'أليفا', dev:'mountainview', area:'mostakbal', status:'launch', price:6000000, dp:5, years:9, delivery:'2029', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['Mostakbal City','Parks & lifestyle'],ar:['مدينة المستقبل','حدائق ولايف ستايل']}, blurb:{en:'A Mountain View community in Mostakbal City built around the developer’s signature parks and lifestyle master plan. Developer-direct primary units.',ar:'مجتمع من ماونتن ڤيو بمدينة المستقبل مبني حول مخطط الحدائق واللايف ستايل المميّز للمطوّر. وحدات أولية من المطوّر مباشرة.'}},
{slug:'mountain-view-11', name:'Mountain View 1.1', name_ar:'ماونتن ڤيو ١٫١', dev:'mountainview', area:'newcairo', status:'primary', tags:{en:['New Cairo','Launched 2022'],ar:['القاهرة الجديدة','أُطلق ٢٠٢٢']}, blurb:{en:'A Mountain View development in East Cairo, launched in 2022 and building in two phases the company kit names The Villas and The Park.',ar:'مشروع من ماونتن ڤيو بشرق القاهرة، أُطلق عام ٢٠٢٢ ويُبنى على مرحلتين يسمّيهما كتيّب الشركة «ذا فيلاز» و«ذا بارك».'}},
{slug:'grand-valleys', name:'Grand Valleys', name_ar:'جراند فالييز', dev:'mountainview', area:'newcairo', status:'primary', tags:{en:['New Cairo','Launched 2025'],ar:['القاهرة الجديدة','أُطلق ٢٠٢٥']}, blurb:{en:'Mountain View’s East Cairo launch of 2025, already photographed under construction in the company kit.',ar:'إطلاق ماونتن ڤيو بشرق القاهرة لعام ٢٠٢٥، ويظهر في كتيّب الشركة قيد الإنشاء بالفعل.'}},
{slug:'icity-october', name:'Mountain View iCity October', name_ar:'ماونتن ڤيو آي سيتي أكتوبر', dev:'mountainview', area:'october', status:'primary', tags:{en:['6th of October','Launched 2017'],ar:['٦ أكتوبر','أُطلق ٢٠١٧']}, blurb:{en:'The West Cairo iCity, launched in 2017. Club park Phase 1 and MV Park are handed over, while Mountain Park, Lagoon Beach Park and Club park Phase 2 have been building since 2022.',ar:'آي سيتي غرب القاهرة، أُطلقت عام ٢٠١٧. سُلّمت «كلوب بارك المرحلة ١» و«إم ڤي بارك»، بينما يجري بناء «ماونتن بارك» و«لاجون بيتش بارك» و«كلوب بارك المرحلة ٢» منذ ٢٠٢٢.'}},
{slug:'kingsway-october', name:'Kingsway', name_ar:'كينجزواي', dev:'mountainview', area:'october', status:'primary', tags:{en:['6th of October','Mountain View Signature'],ar:['٦ أكتوبر','ماونتن ڤيو سيجنتشر']}, blurb:{en:'Launched in 2024 under the Mountain View Signature line, and on site in West Cairo since.',ar:'أُطلق عام ٢٠٢٤ ضمن خط «ماونتن ڤيو سيجنتشر»، والعمل جارٍ في موقعه بغرب القاهرة منذ ذلك الحين.'}},
{slug:'jirian', name:'Jirian', name_ar:'جيريان', dev:'mountainview', area:'october', status:'primary', tags:{en:['West Cairo','With Nations of Sky'],ar:['غرب القاهرة','بالشراكة مع نيشنز أوف سكاي']}, blurb:{en:'A 2025 launch in West Cairo, developed by Mountain View together with Nations of Sky and drawn along the water.',ar:'إطلاق ٢٠٢٥ في غرب القاهرة، تطوّره ماونتن ڤيو بالشراكة مع «نيشنز أوف سكاي»، ومرسوم على امتداد الماء.'}},
{slug:'lvls-north-coast', name:'LVLS', name_ar:'لِفلز', dev:'mountainview', area:'sahel', status:'primary', tags:{en:['North Coast','Launched 2023'],ar:['الساحل الشمالي','أُطلق ٢٠٢٣']}, blurb:{en:'Mountain View’s North Coast development, launched in 2023 and under construction on the shore.',ar:'مشروع ماونتن ڤيو على الساحل الشمالي، أُطلق عام ٢٠٢٣ وتحت الإنشاء على الشاطئ.'}},
{slug:'plage-north-coast', name:'plage', name_ar:'بلاج', dev:'mountainview', area:'sahel', status:'primary', tags:{en:['North Coast','Launched 2024'],ar:['الساحل الشمالي','أُطلق ٢٠٢٤']}, blurb:{en:'A 2024 Mountain View launch on the North Coast.',ar:'إطلاق من ماونتن ڤيو على الساحل الشمالي عام ٢٠٢٤.'}},
{slug:'crysta-north-coast', name:'Crysta', name_ar:'كريستا', dev:'mountainview', area:'sahel', status:'primary', tags:{en:['North Coast','Launched 2025'],ar:['الساحل الشمالي','أُطلق ٢٠٢٥']}, blurb:{en:'Mountain View’s newest coastal launch, dated 2025 in the company kit.',ar:'أحدث إطلاق ساحلي من ماونتن ڤيو، ومؤرَّخ بعام ٢٠٢٥ في كتيّب الشركة.'}},
{slug:'fouka-bay', name:'Fouka Bay', name_ar:'فوكا باي', dev:'tatweer', area:'sahel', status:'primary', price:13900000, dp:5, years:9, delivery:'2030', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Chalet · Apartment',ar:'شاليه · شقة'}, tags:{en:['North Coast','Turquoise lagoons'],ar:['الساحل الشمالي','بحيرات فيروزية']}, blurb:{en:'Tatweer Misr’s North Coast resort near Ras El Hekma, known for terraced beachfront and turquoise swimmable lagoons. Developer-direct primary units.',ar:'منتجع تطوير مصر على الساحل الشمالي قرب رأس الحكمة، معروف بالشاطئ المتدرّج والبحيرات الفيروزية للسباحة. وحدات أولية من المطوّر مباشرة.'}},
{slug:'vinci-capital', name:'Vinci', name_ar:'فينشي', dev:'misritalia', area:'capital', status:'primary', price:6500000, dp:10, years:8, delivery:'2028', finishing:{en:'Semi-finished',ar:'نصف تشطيب'}, types:{en:'Apartment · Villa',ar:'شقة · فيلا'}, tags:{en:['New Capital','Green living'],ar:['العاصمة الإدارية','معيشة خضراء']}, blurb:{en:'Misr Italia’s green, technology-enabled community in the New Administrative Capital, with generous landscaping and amenities. Developer-direct primary units.',ar:'مجتمع مصر إيطاليا الأخضر المزوّد بالتقنيات بالعاصمة الإدارية الجديدة، بمساحات خضراء ومرافق واسعة. وحدات أولية من المطوّر مباشرة.'}},
{slug:'masyaf-ras-alhekma', name:'Masyaf Ras Alhekma', name_ar:'مصياف رأس الحكمة', dev:'msquared', area:'raselhekma', status:'primary', price:12190419, dp:10, years:10, delivery:'2028–2030', types:{en:'Chalet · Duplex · Penthouse · Townhouse · Villa',ar:'شاليه · دوبلكس · بنتهاوس · تاون هاوس · فيلا'}, tags:{en:['Ras Al Hekma','112 feddans','730 m beachfront'],ar:['رأس الحكمة','١١٢ فدان','٧٣٠ م واجهة بحرية']}, blurb:{en:'Inspired by Greek architecture, where floating seascapes and natural simplicity live indoors, Masyaf Ras Alhekma stretches over 112 feddans of land lapping a pristine 730-metre beachfront on the Mediterranean shore. Master planned by M squared, it lifts its homes onto elevated platforms so every owner gets an equal view. Its own downtown carries Ritsa, the Barten restaurant, the Peppermint wellbeing centre and the Marmarica boutique cabanas.',ar:'مستوحى من العمارة اليونانية حيث تعيش المشاهد البحرية والبساطة الطبيعية في الداخل، يمتد مصياف رأس الحكمة على ١١٢ فداناً بواجهة بحرية بكر بطول ٧٣٠ متراً على شاطئ المتوسط. وضعت إم سكويرد مخططه العام ورفعت منازله على منصات متدرّجة ليحصل كل مالك على إطلالة متساوية. ويضم داون تاون خاصاً به يحوي «ريتسا» ومطعم «بارتن» ومركز «بيبرمنت» للعافية وكابانات «مرماريكا» البوتيكية.'}},
{slug:'trio-new-cairo', name:'TRIO', name_ar:'تريو', dev:'msquared', area:'newcairo', status:'primary', price:11637891, dp:10, years:10, delivery:'2027–2028', types:{en:'Apartment · Duplex · Townhouse · Penthouse',ar:'شقة · دوبلكس · تاون هاوس · بنتهاوس'}, tags:{en:['New Cairo','35.5 acres','Three villas per complex'],ar:['القاهرة الجديدة','٣٥٫٥ فدان','ثلاث فيلات لكل مجمّع']}, blurb:{en:'A signature boutique community on 35.5 acres of verdant land at the heart of New Cairo. TRIO is characterised by a “three villas per complex” concept with hanging gardens and flying pools, and each duplex has its own garden and maximum privacy. Three phases sit around a central spine carrying a reading work station, a yoga garden, a meditation zone and a kids’ play zone.',ar:'مجتمع بوتيكي مميّز على ٣٥٫٥ فدان من الأرض الخضراء في قلب القاهرة الجديدة. يتميّز «تريو» بمفهوم «ثلاث فيلات لكل مجمّع» بحدائق معلّقة وحمامات سباحة طائرة، ولكل دوبلكس حديقته الخاصة وأقصى درجات الخصوصية. وتلتفّ ثلاث مراحل حول محور مركزي يضم ركن قراءة وعمل، وحديقة يوجا، ومنطقة تأمّل، ومنطقة لعب للأطفال.'}},
{slug:'mist-new-cairo', name:'MIST', name_ar:'ميست', dev:'msquared', area:'newcairo', status:'launch', price:17602921, dp:5, years:10, delivery:'2030', types:{en:'Apartment · Penthouse · Townhouse',ar:'شقة · بنتهاوس · تاون هاوس'}, tags:{en:['East Cairo Golden Square','45 feddans','18,000 m² of lakes'],ar:['جولدن سكوير شرق القاهرة','٤٥ فدان','١٨٬٠٠٠ م² بحيرات']}, blurb:{en:'In East Cairo’s Golden Square, MIST rises as a new-generation mixed-use development spanning 45 feddans, with over 18,000 square metres of lakes and water paths flowing through the land and more than 80 per cent of the residential space kept green. MIST is not a place you escape to. It is a place you live within, pass through, and engage with fully — a passage, a lifestyle artery and a destination all at once. Rather than rigid zones, the community unfolds in intuitive layers: serene homes flow alongside water and greenery, while a commercial promenade brings daily vibrance, and a public plaza at the centre ties it together. The name was chosen for its relevance to motion, transformation and fluidity.',ar:'في جولدن سكوير بشرق القاهرة يقوم «ميست» كمشروع متعدد الاستخدامات من جيل جديد على ٤٥ فداناً، بأكثر من ١٨٬٠٠٠ متر مربع من البحيرات والممرات المائية تجري في أرضه، وأكثر من ٨٠٪ من المساحة السكنية مُبقاة خضراء. و«ميست» ليس مكاناً تهرب إليه، بل مكان تعيش داخله وتمرّ به وتنخرط فيه بالكامل — ممرّ وشريان لايف ستايل ووجهة في آن. وبدلاً من المناطق الجامدة، ينكشف المجتمع في طبقات بديهية: منازل هادئة تنساب بمحاذاة الماء والخضرة، وبروميناد تجاري يمنح الحياة اليومية حيويتها، وبلازا عامة في المركز تربط كل شيء. واختير الاسم لصلته بالحركة والتحوّل والانسيابية.'}},
{slug:'31-west-october', name:'31 WEST', name_ar:'٣١ ويست', dev:'msquared', area:'october', status:'primary', price:13237120, dp:5, years:10, delivery:'2030', finishing:{en:'Apartments fully finished · single homes semi-finished',ar:'الشقق كاملة التشطيب · المنازل المستقلة نصف تشطيب'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['6th of October','31 acres','570 units'],ar:['٦ أكتوبر','٣١ فدان','٥٧٠ وحدة']}, blurb:{en:'31 WEST epitomises refined living within 31 acres at one of the most exclusive locations in 6th of October, where every detail is curated to exude exclusivity and sophistication. From grand water features and inspiring designs to landscaped surroundings and the first-of-its-kind Senior Executive Suites, the project stands as a testament to timeless elegance and elite living.',ar:'يجسّد «٣١ ويست» السكن الراقي على ٣١ فداناً في أحد أكثر مواقع ٦ أكتوبر تميّزاً، حيث كل تفصيلة منتقاة لتفيض تفرّداً ورقيّاً. ومن المسطحات المائية الكبرى والتصاميم الملهمة إلى المحيط المنسّق والأجنحة التنفيذية الأولى من نوعها، يقف المشروع شاهداً على الأناقة الخالدة والحياة الصفوية.'}},
{slug:'41-business-district', name:'41 Business District', name_ar:'٤١ بيزنس ديستريكت', dev:'msquared', area:'newcairo', status:'primary', price:13962832, dp:10, years:8, delivery:'2029', types:{en:'Office',ar:'مكتب'}, tags:{en:['Kattameya Ring Road','Commercial landmark'],ar:['الطريق الدائري القطامية','معلم تجاري']}, blurb:{en:'A commercial landmark at the heart of the Kattameya Ring Road, connecting multiple districts of the city. 41 Business District is an innovative, multipurpose concept that blends cutting-edge office and clinic spaces with commercial luxuries in one building — a bank, café, restaurant, gym, furniture, barber, sports, jewellery and market at street level.',ar:'معلم تجاري في قلب الطريق الدائري بالقطامية، يربط عدة أحياء بالمدينة. «٤١ بيزنس ديستريكت» مفهوم مبتكر متعدد الاستخدامات يمزج مساحات المكاتب والعيادات الحديثة مع رفاهيات تجارية في مبنى واحد — بنك ومقهى ومطعم وجيم وأثاث وحلاق ورياضة ومجوهرات وسوق على مستوى الشارع.'}},
{slug:'zed-east', name:'ZED East', name_ar:'زيد إيست', dev:'ora', area:'newcairo', status:'launch', price:8900000, dp:10, years:10, delivery:'2027–2030', types:{en:'Apartment · Loft · Studio',ar:'شقة · لوفت · استوديو'}, tags:{en:['New Cairo','8 units','65–300 m²'],ar:['القاهرة الجديدة','٨ وحدات','٦٥–٣٠٠ م²']}, blurb:{en:'ZED East by ORA in New Cairo — 8 primary unit types from the developer\'s own price list: apartment, loft, studio. From 65 m² and EGP 8,900,000, on a 10% down payment over 10 years, handover 2027–2030.',ar:'زيد إيست من أورا في القاهرة الجديدة — ٨ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: شقة، لوفت، استوديو. من ٦٥ م² و٨٬٩٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ١٠ سنوات، والتسليم ٢٠٢٧–٢٠٣٠.'}},
{slug:'zed-east-emerald', name:'ZED East Emerald', name_ar:'زيد إيست إميرالد', dev:'ora', area:'newcairo', status:'launch', price:27000000, dp:10, years:10, delivery:'2030', types:{en:'Duplex · Fourplex · Townhouse · Standalone Villa',ar:'دوبلكس · فوربلكس · تاون هاوس · فيلا مستقلة'}, tags:{en:['New Cairo','6 units','174–290 m²'],ar:['القاهرة الجديدة','٦ وحدات','١٧٤–٢٩٠ م²']}, blurb:{en:'ZED East Emerald by ORA in New Cairo — 6 primary unit types from the developer\'s own price list: duplex, fourplex, townhouse, standalone villa. From 174 m² and EGP 27,000,000, on a 10% down payment over 10 years, handover 2030.',ar:'زيد إيست إميرالد من أورا في القاهرة الجديدة — ٦ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: دوبلكس، فوربلكس، تاون هاوس، فيلا مستقلة. من ١٧٤ م² و٢٧٬٠٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ١٠ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'zed-west', name:'ZED West', name_ar:'زيد ويست', dev:'ora', area:'zayed', status:'launch', price:9000000, dp:10, years:10, delivery:'2030', types:{en:'Studio · Apartment',ar:'استوديو · شقة'}, tags:{en:['New Zayed','7 units','60–219 m²'],ar:['زايد الجديدة','٧ وحدات','٦٠–٢١٩ م²']}, blurb:{en:'ZED West by ORA in New Zayed — 7 primary unit types from the developer\'s own price list: studio, apartment. From 60 m² and EGP 9,000,000, on a 10% down payment over 10 years, handover 2030.',ar:'زيد ويست من أورا في زايد الجديدة — ٧ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: استوديو، شقة. من ٦٠ م² و٩٬٠٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ١٠ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'solana-west', name:'Solana West', name_ar:'سولانا ويست', dev:'ora', area:'zayed', status:'launch', price:15800000, dp:10, years:10, delivery:'2030', types:{en:'Villa · Townhouse · Twin House · Apartment · Loft · Duplex · Penthouse',ar:'فيلا · تاون هاوس · توين هاوس · شقة · لوفت · دوبلكس · بنتهاوس'}, tags:{en:['New Zayed','16 units','126–337 m²'],ar:['زايد الجديدة','١٦ وحدة','١٢٦–٣٣٧ م²']}, blurb:{en:'Solana West by ORA in New Zayed — 16 primary unit types from the developer\'s own price list: villa, townhouse, twin house, apartment, loft, duplex, penthouse. From 126 m² and EGP 15,800,000, on a 10% down payment over 10 years, handover 2030.',ar:'سولانا ويست من أورا في زايد الجديدة — ١٦ نوع وحدة أولية من قائمة أسعار المطوّر نفسه: فيلا، تاون هاوس، توين هاوس، شقة، لوفت، دوبلكس، بنتهاوس. من ١٢٦ م² و١٥٬٨٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ١٠ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'solana-east', name:'Solana East', name_ar:'سولانا إيست', dev:'ora', area:'newcairo', status:'launch', price:13900000, dp:10, years:8, delivery:'2030', types:{en:'Apartment · Twin House · Villa',ar:'شقة · توين هاوس · فيلا'}, tags:{en:['New Cairo','5 units','99–369 m²'],ar:['القاهرة الجديدة','٥ وحدات','٩٩–٣٦٩ م²']}, blurb:{en:'Solana East by ORA in New Cairo — 5 primary unit types from the developer\'s own price list: apartment, twin house, villa. From 99 m² and EGP 13,900,000, on a 10% down payment over 8 years, handover 2030.',ar:'سولانا إيست من أورا في القاهرة الجديدة — ٥ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: شقة، توين هاوس، فيلا. من ٩٩ م² و١٣٬٩٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ٨ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'silversands-crystalline', name:'Silversands Crystalline', name_ar:'سيلفر ساندز كريستالين', dev:'ora', area:'sahel', status:'launch', price:27000000, dp:15, years:8, delivery:'2030', types:{en:'Duplex · Chalet · Twin House · Villa',ar:'دوبلكس · شاليه · توين هاوس · فيلا'}, tags:{en:['Sidi Heneish','9 units','160–380 m²'],ar:['سيدي حنيش','٩ وحدات','١٦٠–٣٨٠ م²']}, blurb:{en:'Silversands Crystalline by ORA in Sidi Heneish — 9 primary unit types from the developer\'s own price list: duplex, chalet, twin house, villa. From 160 m² and EGP 27,000,000, on a 15% down payment over 8 years, handover 2030.',ar:'سيلفر ساندز كريستالين من أورا في سيدي حنيش — ٩ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: دوبلكس، شاليه، توين هاوس، فيلا. من ١٦٠ م² و٢٧٬٠٠٠٬٠٠٠ جنيه، بمقدم ١٥٪ على ٨ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'silversands-silvertown', name:'Silversands Silvertown', name_ar:'سيلفر ساندز سيلفر تاون', dev:'ora', area:'sahel', status:'launch', price:27000000, dp:10, years:10, delivery:'2030', types:{en:'Chalet · Townhouse · Villa',ar:'شاليه · تاون هاوس · فيلا'}, tags:{en:['Sidi Heneish','7 units','150–250 m²'],ar:['سيدي حنيش','٧ وحدات','١٥٠–٢٥٠ م²']}, blurb:{en:'Silversands Silvertown by ORA in Sidi Heneish — 7 primary unit types from the developer\'s own price list: chalet, townhouse, villa. From 150 m² and EGP 27,000,000, on a 10% down payment over 10 years, handover 2030.',ar:'سيلفر ساندز سيلفر تاون من أورا في سيدي حنيش — ٧ أنواع وحدات أولية من قائمة أسعار المطوّر نفسه: شاليه، تاون هاوس، فيلا. من ١٥٠ م² و٢٧٬٠٠٠٬٠٠٠ جنيه، بمقدم ١٠٪ على ١٠ سنوات، والتسليم ٢٠٣٠.'}},
{slug:'village-de-la-capitale', name:'Village de la Capitale', name_ar:'فيلاج دي لا كابيتال', dev:'palmhills', area:'capital', status:'primary', price:6400000, dp:1.5, years:12, delivery:'2029', finishing:{en:'Core & shell',ar:'خرسانة على المحارة'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['New Capital','290 feddans'],ar:['العاصمة الإدارية','٢٩٠ فدان']}, blurb:{en:'A 290-feddan Palm Hills community with apartments, townhouses and villas, water features, sports courts and club houses. Developer-direct primary units on a 12-year plan.',ar:'مجتمع بالم هيلز على ٢٩٠ فداناً يضم شققاً وتاون هاوس وفيلات مع نوافير مائية وملاعب رياضية وكلوب هاوس. وحدات أولية من المطوّر مباشرة بتقسيط ١٢ سنة.'}},
{slug:'palm-hills-new-cairo', name:'Palm Hills New Cairo', name_ar:'بالم هيلز القاهرة الجديدة', dev:'palmhills', area:'newcairo', status:'primary', price:10400000, dp:5, years:8, delivery:'2027', finishing:{en:'Core & shell / fully finished',ar:'خرسانة / تشطيب كامل'}, types:{en:'Apartment · Villa',ar:'شقة · فيلا'}, tags:{en:['New Cairo','500 feddans'],ar:['القاهرة الجديدة','٥٠٠ فدان']}, blurb:{en:'Palm Hills’ established 500-feddan New Cairo community — the fully finished Cleo apartments plus villas, a 40-feddan Palm Hills club, hotel and international school. Developer-direct primary units.',ar:'مجتمع بالم هيلز المتكامل على ٥٠٠ فدان بالقاهرة الجديدة — شقق Cleo كاملة التشطيب وفيلات ونادي بالم هيلز على ٤٠ فداناً وفندق ومدرسة دولية. وحدات أولية من المطوّر مباشرة.'}},
{slug:'97-hills', name:'97 Hills', name_ar:'٩٧ هيلز', dev:'palmhills', area:'newcairo', status:'primary', price:25800000, dp:5, years:10, delivery:'2029', finishing:{en:'Core & shell / fully finished',ar:'خرسانة / تشطيب كامل'}, types:{en:'Townhouse · Twin house · Villa',ar:'تاون هاوس · توين هاوس · فيلا'}, tags:{en:['New Cairo','Lagoons'],ar:['القاهرة الجديدة','بحيرات']}, blurb:{en:'A 97-feddan Palm Hills community in New Cairo built around lagoons and a community centre, with family houses, townhouses, twin houses and villas. Developer-direct primary units over 10 years.',ar:'مجتمع بالم هيلز على ٩٧ فداناً بالقاهرة الجديدة حول البحيرات ومركز مجتمعي، ببيوت عائلية وتاون هاوس وتوين هاوس وفيلات. وحدات أولية من المطوّر مباشرة بتقسيط ١٠ سنوات.'}},
{slug:'palmet-new-cairo', name:'Palmet New Cairo', name_ar:'بالمت القاهرة الجديدة', dev:'palmhills', area:'newcairo', status:'primary', price:13000000, dp:5, years:8, delivery:'2027', finishing:{en:'Core & shell',ar:'خرسانة على المحارة'}, types:{en:'Retail · Offices · Clinics',ar:'محلات · مكاتب · عيادات'}, tags:{en:['New Cairo','Commercial'],ar:['القاهرة الجديدة','تجاري']}, blurb:{en:'A 100-feddan Palm Hills commercial destination in New Cairo on Palm Hills Drive — retail, offices, banks, clinics and pharmacies. Developer-direct primary units.',ar:'وجهة بالم هيلز التجارية على ١٠٠ فدان بالقاهرة الجديدة على Palm Hills Drive — محلات ومكاتب وبنوك وعيادات وصيدليات. وحدات أولية من المطوّر مباشرة.'}},
{slug:'px-new-cairo', name:'PX', name_ar:'بي إكس', dev:'palmhills', area:'newcairo', status:'primary', price:13500000, dp:5, years:8, delivery:'2030', finishing:{en:'Core & shell / fully finished',ar:'خرسانة / تشطيب كامل'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['New Cairo','370 feddans'],ar:['القاهرة الجديدة','٣٧٠ فدان']}, blurb:{en:'PX is Palm Hills’ 370-feddan New Cairo district — G+3 apartments, townhouses and villas with a Palm Hills club and commercial hub. Developer-direct primary units, delivery 2030.',ar:'PX هو حي بالم هيلز على ٣٧٠ فداناً بالقاهرة الجديدة — شقق أرضي+٣ وتاون هاوس وفيلات مع نادي بالم هيلز ومنطقة تجارية. وحدات أولية من المطوّر مباشرة، التسليم ٢٠٣٠.'}},
{slug:'jirian-zayed', name:'Palm Hills Jirian', name_ar:'بالم هيلز جيريان', dev:'palmhills', area:'zayed', status:'primary', price:7800000, dp:5, years:8, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment · Townhouse · Villa',ar:'شقة · تاون هاوس · فيلا'}, tags:{en:['Sheikh Zayed','Nile views'],ar:['الشيخ زايد','إطلالة على النيل']}, blurb:{en:'A 360-feddan Palm Hills community in West Cairo with Nile views — fully finished apartments, townhouses and villas, hotels and a commercial spine. Developer-direct primary units.',ar:'مجتمع بالم هيلز على ٣٦٠ فداناً بغرب القاهرة بإطلالات على النيل — شقق وتاون هاوس وفيلات كاملة التشطيب وفنادق ومحور تجاري. وحدات أولية من المطوّر مباشرة.'}},
{slug:'hacienda-blue', name:'Hacienda Blue', name_ar:'هاسيندا بلو', dev:'palmhills', area:'raselhekma', status:'primary', price:19600000, dp:2.5, years:12, delivery:'2030', finishing:{en:'Fully finished (no kitchen/AC)',ar:'تشطيب كامل (بدون مطبخ وتكييف)'}, types:{en:'Apartment · Cabin · Townhouse · Villa',ar:'شقة · كابين · تاون هاوس · فيلا'}, tags:{en:['Ras El Hekma','400m beachfront'],ar:['رأس الحكمة','واجهة بحرية ٤٠٠م']}, blurb:{en:'Palm Hills’ 118-acre beachfront resort at Ras El Hekma (Km 166) with lagoons, parks and a 400m beach — G+1 apartments, cabins, townhouses and water villas. Developer-direct primary units.',ar:'منتجع بالم هيلز الشاطئي على ١١٨ فداناً برأس الحكمة (كيلو ١٦٦) ببحيرات وحدائق وشاطئ ٤٠٠ متر — شقق أرضي+١ وكبائن وتاون هاوس وفيلات مائية. وحدات أولية من المطوّر مباشرة.'}},
{slug:'hacienda-waters', name:'Hacienda Waters', name_ar:'هاسيندا ووترز', dev:'palmhills', area:'raselhekma', status:'primary', price:14100000, dp:2.5, years:12, delivery:'2029', finishing:{en:'Fully finished (no kitchen/AC)',ar:'تشطيب كامل (بدون مطبخ وتكييف)'}, types:{en:'Chalet · Cabin · Villa',ar:'شاليه · كابين · فيلا'}, tags:{en:['Ras El Hekma','Aqua park'],ar:['رأس الحكمة','أكوا بارك']}, blurb:{en:'A 161-acre Palm Hills beachfront community at Ras El Hekma (Km 191) with lagoons, an aqua park and a 400m beach — chalets, cabins and water villas. Developer-direct primary units.',ar:'مجتمع بالم هيلز الشاطئي على ١٦١ فداناً برأس الحكمة (كيلو ١٩١) ببحيرات وأكوا بارك وشاطئ ٤٠٠ متر — شاليهات وكبائن وفيلات مائية. وحدات أولية من المطوّر مباشرة.'}},
{slug:'hacienda-heneish', name:'Hacienda Heneish', name_ar:'هاسيندا حنيش', dev:'palmhills', area:'raselhekma', status:'primary', price:16000000, dp:5, years:8, delivery:'2029', finishing:{en:'Fully finished',ar:'تشطيب كامل'}, types:{en:'Apartment · Chalet · Townhouse · Villa',ar:'شقة · شاليه · تاون هاوس · فيلا'}, tags:{en:['Ras El Hekma','Marriott hotel'],ar:['رأس الحكمة','فندق ماريوت']}, blurb:{en:'A 420-feddan Palm Hills resort on the North Coast with a Marriott hotel, strip mall and 1.1km of beachfront — G+3 apartments, chalets, townhouses and standalone villas. Developer-direct primary units.',ar:'منتجع بالم هيلز على ٤٢٠ فداناً بالساحل الشمالي بفندق ماريوت وممشى تجاري وواجهة بحرية ١٫١ كم — شقق أرضي+٣ وشاليهات وتاون هاوس وفيلات مستقلة. وحدات أولية من المطوّر مباشرة.'}},
{slug:'hacienda-west', name:'Hacienda West', name_ar:'هاسيندا ويست', dev:'palmhills', area:'raselhekma', status:'primary', price:23800000, dp:10, years:7, delivery:'2027', finishing:{en:'Fully finished / core & shell',ar:'تشطيب كامل / خرسانة'}, types:{en:'Chalet · Cabin · Villa',ar:'شاليه · كابين · فيلا'}, tags:{en:['Ras El Hekma','Beachfront'],ar:['رأس الحكمة','واجهة بحرية']}, blurb:{en:'A 132-feddan Palm Hills beach community at Ras El Hekma (Km 208) with a hotel, clubhouse, lagoons and a 400m beach — chalets, cabins and villas. Developer-direct primary units.',ar:'مجتمع بالم هيلز الشاطئي على ١٣٢ فداناً برأس الحكمة (كيلو ٢٠٨) بفندق وكلوب هاوس وبحيرات وشاطئ ٤٠٠ متر — شاليهات وكبائن وفيلات. وحدات أولية من المطوّر مباشرة.'}}
];
var UNITS = [
{id:'SB-ST-01', project:'sumou-boulevard', type:'Studio', beds:1, baths:1, area:31, areaTo:33, price:2480000},
{id:'SB-SP-01', project:'sumou-boulevard', type:'Studio plus', label:{en:'Studio Plus',ar:'استوديو بلس'}, beds:1, baths:1, area:46, areaTo:50, price:3680000},
{id:'SB-AP-01', project:'sumou-boulevard', type:'Apartment', beds:1, baths:1, area:60, areaTo:95, price:4800000},
{id:'SB-AP-02', project:'sumou-boulevard', type:'Apartment', beds:2, baths:2, area:96, areaTo:129, price:7680000},
{id:'SB-AP-03', project:'sumou-boulevard', type:'Apartment', beds:3, baths:3, area:150, areaTo:196, price:12000000},
{id:'SB-AP-04', project:'sumou-boulevard', type:'Apartment', beds:4, baths:4, area:197, areaTo:240, price:16000000},
{id:'SB-OF-01', project:'sumou-boulevard', type:'Smart Offices', label:{en:'Smart Office',ar:'مكتب ذكي'}, area:60, areaTo:138, price:6900000},
{id:'SB-OF-02', project:'sumou-boulevard', type:'Offices', area:200, price:25000000},
{id:'MD-BP-01', project:'beach-plaza-premium', type:'Apartment', beds:1, baths:2, area:93, price:19900000},
{id:'MD-BP-02', project:'beach-plaza-premium', type:'Apartment', beds:2, baths:3, area:145, price:37600000},
{id:'MD-BP-03', project:'beach-plaza-premium', type:'Apartment', beds:3, baths:3, area:197, price:49200000},
{id:'MD-BPL-01', project:'beach-plaza-luxury', type:'Apartment', beds:1, baths:2, area:109, price:24600000},
{id:'MD-BPL-02', project:'beach-plaza-luxury', type:'Apartment', beds:2, baths:3, area:176, price:36800000},
{id:'MD-BPL-03', project:'beach-plaza-luxury', type:'Apartment', beds:3, baths:3, area:225, price:52500000},
{id:'MD-LH-01', project:'lighthouse-village-luxury', type:'Apartment', beds:1, baths:2, area:112, price:25100000},
{id:'MD-LH-02', project:'lighthouse-village-luxury', type:'Apartment', beds:2, baths:3, area:178, price:43000000},
{id:'MD-LH-03', project:'lighthouse-village-luxury', type:'Apartment', beds:3, baths:4, area:239, price:73600000},
{id:'MD-LHU-01', project:'lighthouse-village-ultra-luxury', type:'Apartment', beds:2, baths:3, area:183, price:45700000},
{id:'MD-LHU-02', project:'lighthouse-village-ultra-luxury', type:'Apartment', beds:3, baths:4, area:235, price:100900000},
{id:'MD-LHU-03', project:'lighthouse-village-ultra-luxury', type:'Apartment', beds:3, baths:5, area:303, price:125700000},
{id:'MD-WD-01', project:'wadi-east', type:'Townhouse', beds:3, baths:4, area:248, price:53000000},
{id:'MD-WD-02', project:'wadi-east', type:'Townhouse', beds:4, baths:5, area:255, price:65400000},
{id:'MD-WD-03', project:'wadi-east', type:'Standalone Villa', beds:3, baths:4, area:244, price:86200000},
{id:'MD-WD-04', project:'wadi-east', type:'Standalone Villa', beds:4, baths:5, area:295, price:94200000},
{id:'MD-WD-05', project:'wadi-east', type:'Standalone Villa', beds:5, baths:6, area:368, price:119300000},
{id:'MD-MON-01', project:'montage', type:'Standalone Villa', beds:3, baths:4, area:398, price:241000000},
{id:'MD-MON-02', project:'montage', type:'Standalone Villa', beds:4, baths:5, area:466, price:222800000},
{id:'MD-MON-03', project:'montage', type:'Standalone Villa', beds:5, baths:6, area:604, price:390600000},
{id:'MD-BL-01', project:'modon-boulevard', type:'Apartment', beds:1, baths:2, area:93, price:19100000},
{id:'MD-BL-02', project:'modon-boulevard', type:'Apartment', beds:2, baths:3, area:145, price:29500000},
{id:'MD-BL-03', project:'modon-boulevard', type:'Apartment', beds:3, baths:3, area:197, price:40700000},
{id:'TM-IM-01', project:'il-monte-galala', type:'Standalone Villa', beds:3, baths:3, area:248, price:27000000},
{id:'TM-IM-02', project:'il-monte-galala', type:'Studio', beds:1, baths:1, area:50, price:7400000},
{id:'TM-IM-03', project:'il-monte-galala', type:'Apartment', beds:1, baths:1, area:65, price:11200000},
{id:'TM-IM-04', project:'il-monte-galala', type:'Apartment', beds:2, baths:2, area:100, price:16000000},
{id:'TM-IM-05', project:'il-monte-galala', type:'Apartment', beds:3, baths:3, area:119, price:18500000},
{id:'TM-IM-06', project:'il-monte-galala', type:'Chalet', beds:1, baths:1, area:65, price:7700000},
{id:'TM-IM-07', project:'il-monte-galala', type:'Chalet', beds:2, baths:2, area:90, price:9900000},
{id:'TM-IM-08', project:'il-monte-galala', type:'Chalet', beds:3, baths:2, area:105, price:12000000},
{id:'TM-IM-09', project:'il-monte-galala', type:'Loft', beds:1, baths:1, area:70, price:8900000},
{id:'TM-IM-10', project:'il-monte-galala', type:'Loft', beds:2, baths:2, area:95, price:11600000},
{id:'TM-IM-11', project:'il-monte-galala', type:'Loft', beds:3, baths:3, area:115, price:13800000},
{id:'TM-IM-12', project:'il-monte-galala', type:'Twin House', beds:3, baths:4, area:140, price:20000000},
{id:'TM-IM-13', project:'il-monte-galala', type:'Standalone Villa', beds:3, baths:3, area:155, price:23000000},
{id:'TM-IM-14', project:'il-monte-galala', type:'Cabin', beds:1, baths:1, area:45, price:8700000},
{id:'TM-IM-15', project:'il-monte-galala', type:'Chalet', beds:1, baths:2, area:70, price:7900000},
{id:'TM-IM-16', project:'il-monte-galala', type:'Chalet', beds:2, baths:3, area:95, price:11100000},
{id:'TM-IM-17', project:'il-monte-galala', type:'Penthouse', beds:3, baths:4, area:220, price:23400000},
{id:'TM-IM-18', project:'il-monte-galala', type:'Studio', beds:1, baths:1, area:50, price:8300000},
{id:'TM-IM-19', project:'il-monte-galala', type:'Apartment', beds:1, baths:1, area:80, price:12500000},
{id:'TM-IM-20', project:'il-monte-galala', type:'Apartment', beds:2, baths:3, area:120, price:17700000},
{id:'TM-IM-21', project:'il-monte-galala', type:'Apartment', beds:3, baths:3, area:160, price:22000000},
{id:'TM-BL-01', project:'bloomfields', type:'Apartment', beds:1, baths:1, area:76, price:5800000},
{id:'TM-BL-02', project:'bloomfields', type:'Apartment', beds:2, baths:2, area:122, price:8600000},
{id:'TM-BL-03', project:'bloomfields', type:'Apartment', beds:3, baths:3, area:149, price:10400000},
{id:'TM-BL-04', project:'bloomfields', type:'Duplex', beds:3, baths:3, area:267, price:22100000},
{id:'TM-BL-05', project:'bloomfields', type:'Apartment', beds:2, baths:3, area:125, price:7700000},
{id:'TM-BL-06', project:'bloomfields', type:'Apartment', beds:3, baths:3, area:165, price:11500000},
{id:'TM-BL-07', project:'bloomfields', type:'Apartment', beds:2, baths:2, area:120, price:7700000},
{id:'TM-BL-08', project:'bloomfields', type:'Apartment', beds:3, baths:2, area:155, price:10000000},
{id:'TM-SL-01', project:'salt', type:'Chalet', beds:1, baths:2, area:80, price:9900000},
{id:'TM-SL-02', project:'salt', type:'Chalet', beds:2, baths:2, area:90, price:11800000},
{id:'TM-SL-03', project:'salt', type:'Chalet', beds:3, baths:2, area:110, price:14700000},
{id:'TM-SL-04', project:'salt', type:'Townhouse', beds:3, baths:3, area:150, price:27000000},
{id:'TM-SL-05', project:'salt', type:'Twin House', beds:3, baths:3, area:165, price:32000000},
{id:'TM-SL-06', project:'salt', type:'Standalone Villa', beds:3, baths:4, area:180, price:38000000},
{id:'TM-RV-01', project:'rivers', type:'Apartment', beds:2, baths:3, area:120, price:7800000},
{id:'TM-RV-02', project:'rivers', type:'Apartment', beds:3, baths:2, area:155, price:10400000},
{id:'TM-RV-03', project:'rivers', type:'Duplex', beds:3, baths:3, area:220, price:16700000},
{id:'TM-RV-04', project:'rivers', type:'Standalone Villa', beds:5, baths:5, area:250, price:30000000},
{id:'TM-RV-05', project:'rivers', type:'Standalone Villa', beds:3, baths:4, area:200, price:23600000},
{id:'TM-FK-01', project:'fouka-bay', type:'Chalet', beds:2, baths:2, area:95, price:13900000},
{id:'TM-FK-02', project:'fouka-bay', type:'Chalet', beds:3, baths:2, area:110, price:16000000},
{id:'TM-FK-03', project:'fouka-bay', type:'Apartment', beds:1, baths:1, area:80, price:14800000},
{id:'TM-FK-04', project:'fouka-bay', type:'Apartment', beds:2, baths:2, area:110, price:21600000},
{id:'TM-DB-01', project:'d-bay', type:'Chalet', beds:3, baths:2, area:110, price:18400000},
{id:'TM-DB-02', project:'d-bay', type:'Twin House', beds:4, baths:5, area:240, price:48500000},
{id:'TM-DB-03', project:'d-bay', type:'Standalone Villa', beds:5, baths:5, area:280, price:62500000},
{id:'TM-SC-01', project:'scenes', type:'Townhouse', beds:3, baths:4, area:165, price:14800000},
{id:'TM-SC-02', project:'scenes', type:'Twin House', beds:3, baths:4, area:185, price:18800000},
{id:'TM-SC-03', project:'scenes', type:'Standalone Villa', beds:4, baths:4, area:210, price:27000000},
{id:'V-A305', project:'villette', type:'Apartment', beds:3, baths:3, area:185, price:9200000},
{id:'V-TH22', project:'villette', type:'Townhouse', beds:4, baths:4, area:230, price:13500000, avail:'limited'},
{id:'SE-T12', project:'sodic-east', type:'Townhouse', beds:4, baths:4, area:240, price:12500000},
{id:'SE-A44', project:'sodic-east', type:'Apartment', beds:2, baths:2, area:135, price:6800000},
{id:'ET-D07', project:'eastown', type:'Duplex', beds:3, baths:3, area:200, price:9800000, avail:'to-confirm'},
{id:'ET-A12', project:'eastown', type:'Apartment', beds:2, baths:2, area:150, price:7400000},
{id:'AL-V03', project:'allegria', type:'Standalone Villa', beds:5, baths:5, area:420, price:38000000, avail:'limited'},
{id:'AL-TW6', project:'allegria', type:'Twin house', beds:4, baths:4, area:300, price:24000000},
{id:'MV-D14', project:'mountain-view-icity', type:'Duplex', beds:4, baths:3, area:210, price:11800000},
{id:'FS-A18', project:'fifth-square', type:'Apartment', beds:3, baths:2, area:160, price:7200000},
{id:'IB-V05', project:'il-bosco-city', type:'Villa', beds:4, baths:4, area:265, price:14500000},
{id:'IB-S02', project:'il-bosco-city', type:'Studio', beds:0, baths:1, area:55, price:3200000},
{id:'D5-A01', project:'district-5', type:'Apartment', beds:3, baths:3, area:224, price:27701000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A02', project:'district-5', type:'Apartment', beds:2, baths:3, area:126, price:14216000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A03', project:'district-5', type:'Apartment', beds:2, baths:3, area:131, price:15082000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A04', project:'district-5', type:'Apartment', beds:2, baths:3, area:144, price:17604000, dp:10, years:7, handover:'2027'},
{id:'D5-A05', project:'district-5', type:'Apartment', beds:2, baths:3, area:154, price:17647000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A06', project:'district-5', type:'Apartment', beds:3, baths:3, area:210, price:24175000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A07', project:'district-5', type:'Apartment', beds:2, baths:3, area:135, price:18505000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A08', project:'district-5', type:'Apartment', beds:2, baths:3, area:139, price:17382000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A09', project:'district-5', type:'Apartment', beds:2, baths:3, area:135, price:18982000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A10', project:'district-5', type:'Apartment', beds:2, baths:3, area:136, price:15884000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A11', project:'district-5', type:'Apartment', beds:3, baths:3, area:224, price:26116000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A12', project:'district-5', type:'Apartment', beds:1, baths:2, area:81, price:12389000, dp:10, years:7, handover:'Delivered'},
{id:'D5-A13', project:'district-5', type:'Apartment', beds:2, baths:3, area:144, price:15617000, dp:10, years:7, handover:'2027'},
{id:'D5-A14', project:'district-5', type:'Apartment', beds:2, baths:3, area:200, price:24885000, dp:10, years:7, handover:'2027'},
{id:'D5-A15', project:'district-5', type:'Apartment', beds:2, baths:3, area:144, price:17114000, dp:10, years:7, handover:'2027'},
{id:'D5-A16', project:'district-5', type:'Apartment', beds:1, baths:2, area:82, price:11285000, dp:10, years:7, handover:'2027'},
{id:'D5-A17', project:'district-5', type:'Apartment', beds:2, baths:3, area:136, price:18612000, dp:10, years:7, handover:'2027'},
{id:'D5-A18', project:'district-5', type:'Apartment', beds:2, baths:3, area:132, price:21177000, dp:10, years:7, handover:'2028'},
{id:'D5-A19', project:'district-5', type:'Apartment', beds:2, baths:3, area:136, price:19965000, dp:10, years:8, handover:'2028'},
{id:'D5-A20', project:'district-5', type:'Apartment', beds:2, baths:3, area:134, price:17288000, dp:10, years:7, handover:'2027'},
{id:'D5-DX01', project:'district-5', type:'Duplex', beds:3, baths:3, area:343, price:43764000, dp:10, years:7, handover:'Delivered'},
{id:'D5-OF01', project:'district-5', type:'Office', area:234, price:59633000, dp:10, years:7, handover:'2029'},
{id:'D5-OF02', project:'district-5', type:'Office', area:139, price:34307000, dp:10, years:5, handover:'2027'},
{id:'D5-OF03', project:'district-5', type:'Office', area:118, price:29353000, dp:10, years:5, handover:'2027'},
{id:'D5-OF04', project:'district-5', type:'Office', area:156, price:39168000, dp:10, years:5, handover:'2027'},
{id:'D5-OF05', project:'district-5', type:'Office', area:138, price:35297000, dp:10, years:5, handover:'2027'},
{id:'CW-V01', project:'crescent-walk', type:'Villa', beds:6, baths:5, area:313, price:61815000, dp:5, years:8, handover:'2029'},
{id:'CW-A01', project:'crescent-walk', type:'Apartment', beds:1, baths:1, area:83, price:9790000, dp:5, years:8, handover:'2029'},
{id:'CW-TW01', project:'crescent-walk', type:'Twin house', beds:5, baths:5, area:241, price:39265000, dp:5, years:8, handover:'2029'},
{id:'CW-A03', project:'crescent-walk', type:'Apartment', beds:2, baths:1, area:148, price:16550000, dp:5, years:8, handover:'2029'},
{id:'CW-A06', project:'crescent-walk', type:'Apartment', beds:3, baths:2, area:186, price:20573000, dp:5, years:8, handover:'2029'},
{id:'CW-DX01', project:'crescent-walk', type:'Duplex', beds:3, baths:3, area:208, price:24381000, dp:5, years:8, handover:'2029'},
{id:'CW-A02', project:'crescent-walk', type:'Apartment', beds:2, baths:1, area:146, price:17999000, dp:5, years:8, handover:'2029'},
{id:'CW-TW03', project:'crescent-walk', type:'Twin house', beds:5, baths:5, area:244, price:34672000, dp:5, years:8, handover:'2029'},
{id:'CW-V03', project:'crescent-walk', type:'Villa', beds:6, baths:6, area:313, price:63363000, dp:5, years:8, handover:'2029'},
{id:'CW-V04', project:'crescent-walk', type:'Villa', beds:7, baths:6, area:372, price:71008000, dp:5, years:8, handover:'2029'},
{id:'CW-DX02', project:'crescent-walk', type:'Duplex', beds:4, baths:4, area:241, price:28008000, dp:5, years:8, handover:'2029'},
{id:'CW-A10', project:'crescent-walk', type:'Apartment', beds:1, baths:1, area:82, price:9576000, dp:5, years:8, handover:'2029'},
{id:'CW-TW04', project:'crescent-walk', type:'Twin house', beds:4, baths:4, area:212, price:39796000, dp:5, years:8, handover:'2029'},
{id:'CW-V05', project:'crescent-walk', type:'Villa', beds:5, baths:5, area:279, price:54651000, dp:5, years:8, handover:'2029'},
{id:'CW-A11', project:'crescent-walk', type:'Apartment', beds:2, baths:2, area:125, price:12508000, dp:5, years:8, handover:'2029'},
{id:'CW-V07', project:'crescent-walk', type:'Villa', beds:5, baths:5, area:279, price:45952000, dp:5, years:8, handover:'2029'},
{id:'CW-A12', project:'crescent-walk', type:'Apartment', beds:3, baths:2, area:175, price:20723000, dp:5, years:8, handover:'2029'},
{id:'CW-A04', project:'crescent-walk', type:'Apartment', beds:3, baths:1, area:185, price:20509000, dp:5, years:8, handover:'2029'},
{id:'CW-A05', project:'crescent-walk', type:'Apartment', beds:1, baths:1, area:131, price:14253000, dp:5, years:8, handover:'2029'},
{id:'CW-A07', project:'crescent-walk', type:'Apartment', beds:1, baths:1, area:84, price:9495000, dp:5, years:8, handover:'2029'},
{id:'CW-A08', project:'crescent-walk', type:'Apartment', beds:3, baths:3, area:190, price:19738000, dp:5, years:8, handover:'2029'},
{id:'CW-A09', project:'crescent-walk', type:'Apartment', beds:2, baths:2, area:148, price:18020000, dp:5, years:8, handover:'2029'},
{id:'CW-TH01', project:'crescent-walk', type:'Townhouse', beds:3, baths:3, area:190, price:29498000, dp:5, years:8, handover:'2029'},
{id:'CW-V06', project:'crescent-walk', type:'Villa', beds:4, baths:4, area:212, price:39796000, dp:5, years:8, handover:'2029'},
{id:'SEM-CL1', project:'stei8ht-eastmed', type:'Clinic', area:106, price:18120892},
{id:'SEM-CL2', project:'stei8ht-eastmed', type:'Clinic', area:57, price:9895200},
{id:'TS-AD1', project:'three-sixty', type:'Administrative Office', area:95, price:25076950},
{id:'TS-AD2', project:'three-sixty', type:'Administrative Office', area:155, price:38341817},
{id:'TS-CL3', project:'three-sixty', type:'Clinic', area:203, price:86625000},
{id:'TS-AD4', project:'three-sixty', type:'Administrative Office', area:106, price:50250000},
{id:'TS-OF5', project:'three-sixty', type:'Office', area:1064, price:238292000},
{id:'STH-OF1', project:'stei8ht-there', type:'Office', area:630, price:103950000},
{id:'SES-AD1', project:'stei8ht-eastside', type:'Administrative Office', area:141, price:24827985},
{id:'ON-RT1', project:'one-ninety', type:'Retail', area:138, price:72187500},
{id:'ZY-SV1', project:'zoya', type:'Villa', beds:4, area:520, price:151000000},
{id:'ZY-HV2', project:'zoya', type:'Villa', beds:4, baths:4, area:300, price:49400000},
{id:'ZY-TW3', project:'zoya', type:'Twin House', beds:4, baths:4, area:260, price:44100000},
{id:'ZY-CH4', project:'zoya', type:'Chalet', beds:2, baths:2, area:115, price:18100000},
{id:'ZY-CB5', project:'zoya', type:'Cabin', area:66, price:21000000},
{id:'PX-AP1', project:'phonix-swanlake', type:'Apartment', beds:2, baths:2, area:110, price:26900000},
{id:'PX-AP2', project:'phonix-swanlake', type:'Apartment', beds:2, baths:3, area:127, price:21000000},
{id:'PX-AP3', project:'phonix-swanlake', type:'Apartment', beds:3, baths:3, area:155, price:34800000},
{id:'PX-AP4', project:'phonix-swanlake', type:'Apartment', beds:3, baths:3, area:155, price:27400000},
{id:'PX-AP5', project:'phonix-swanlake', type:'Apartment', beds:2, baths:1, area:93, price:15700000},
{id:'AP-OF1', project:'ampm-swanlake', type:'Office', area:497, price:142100000},
{id:'AP-OF2', project:'ampm-swanlake', type:'Office', area:221, price:66000000},
{id:'AP-OF3', project:'ampm-swanlake', type:'Office', area:155, price:42600000},
{id:'VL-TH1', project:'the-valleys', type:'Townhouse', beds:4, baths:4, area:175, price:30400000},
{id:'VL-TW2', project:'the-valleys', type:'Twin House', beds:4, baths:4, area:188, price:31000000},
{id:'VL-SV3', project:'the-valleys', type:'Standalone Villa', beds:5, baths:5, area:240, price:42400000},
{id:'VL-SV4', project:'the-valleys', type:'Standalone Villa', beds:5, area:300, price:56000000},
{id:'PC-AP1', project:'park-central', type:'Apartment', beds:1, baths:1, area:81, price:8300000},
{id:'PC-AP2', project:'park-central', type:'Apartment', beds:1, baths:1, area:102, price:11500000},
{id:'PC-AP3', project:'park-central', type:'Apartment', beds:2, baths:3, area:105, price:11200000},
{id:'PC-AP4', project:'park-central', type:'Apartment', beds:2, baths:3, area:150, price:15800000},
{id:'PC-AP5', project:'park-central', type:'Apartment', beds:2, baths:3, area:134, price:16800000},
{id:'PC-AP6', project:'park-central', type:'Apartment', beds:3, baths:3, area:142, price:14600000},
{id:'PC-AP7', project:'park-central', type:'Apartment', beds:3, baths:3, area:215, price:24900000},
{id:'GL-AP1', project:'the-great-lawn', type:'Apartment', beds:1, baths:2, area:85, price:8300000},
{id:'GL-AP2', project:'the-great-lawn', type:'Apartment', beds:2, baths:3, area:143, price:14100000},
{id:'GL-AP3', project:'the-great-lawn', type:'Apartment', beds:3, baths:4, area:171, price:17100000},
{id:'SL-AP1', project:'swan-lake-west', type:'Apartment', beds:2, baths:3, area:151, price:24200000},
{id:'SL-AP2', project:'swan-lake-west', type:'Apartment', beds:3, baths:4, area:190, price:29000000},
{id:'SL-AP3', project:'swan-lake-west', type:'Apartment', beds:3, baths:3, area:190, price:33600000},
{id:'SL-AP4', project:'swan-lake-west', type:'Apartment', beds:5, baths:5, area:348, price:57500000},
{id:'SL-AP5', project:'swan-lake-west', type:'Apartment', beds:4, baths:5, area:365, price:58000000},
{id:'SL-AP6', project:'swan-lake-west', type:'Apartment', beds:4, baths:4, area:265, price:53000000},
{id:'SL-AP7', project:'swan-lake-west', type:'Apartment', beds:4, baths:5, area:373, price:60000000},
{id:'SL-TW8', project:'swan-lake-west', type:'Twin House', beds:3, baths:4, area:237, price:50100000},
{id:'SL-SV9', project:'swan-lake-west', type:'Standalone Villa', beds:3, baths:5, area:376, price:105000000},
{id:'SL-TW10', project:'swan-lake-west', type:'Twin House', beds:3, baths:3, area:254, price:50000000},
{id:'SL-TW11', project:'swan-lake-west', type:'Twin House', beds:3, baths:4, area:260, price:46600000},
{id:'SL-SV12', project:'swan-lake-west', type:'Standalone Villa', beds:3, baths:4, area:300, price:60000000},
{id:'SL-SV13', project:'swan-lake-west', type:'Standalone Villa', beds:5, area:525, price:129000000},
{id:'SL-SV14', project:'swan-lake-west', type:'Standalone Villa', beds:5, baths:6, area:565, price:127000000},
{id:'SL-SV15', project:'swan-lake-west', type:'Standalone Villa', beds:5, baths:6, area:606, price:121000000},
{id:'HP-P03', project:'hyde-park-new-cairo', type:'Penthouse', beds:3, baths:3, area:220, price:12900000},
{id:'HP-V15', project:'hyde-park-new-cairo', type:'Villa', beds:5, baths:5, area:340, price:27500000, avail:'reserved'},
{id:'CG-A05', project:'cairo-gate', type:'Apartment', beds:3, baths:2, area:168, price:9600000},
{id:'VL-IV3', project:'villette', type:'iVilla', beds:4, baths:4, area:280, price:16500000},
{id:'AL-TV2', project:'allegria', type:'Town Villa', beds:4, baths:4, area:290, price:22000000},
{id:'HP-V6B', project:'hyde-park-new-cairo', type:'Villa', beds:6, baths:6, area:420, price:32000000},
{id:'OG-01', project:'ogami-north-coast', type:'Villa', beds:5, baths:7, area:394, price:228019000, dp:5, years:8, handover:'2029'},
{id:'OG-02', project:'ogami-north-coast', type:'Twin house', beds:4, baths:4, area:268, price:56387000, dp:5, years:8, handover:'2030'},
{id:'OG-03', project:'ogami-north-coast', type:'Townhouse', beds:3, baths:3, area:226, price:41920000, dp:5, years:8, handover:'2030'},
{id:'OG-04', project:'ogami-north-coast', type:'Townhouse', beds:3, baths:4, area:232, price:43651000, dp:5, years:8, handover:'2030'},
{id:'OG-05', project:'ogami-north-coast', type:'Chalet', beds:3, baths:3, area:182, price:29430000, dp:5, years:8, handover:'2029'},
{id:'OG-06', project:'ogami-north-coast', type:'Chalet', beds:2, baths:2, area:150, price:23742000, dp:5, years:8, handover:'2030'},
{id:'OG-07', project:'ogami-north-coast', type:'Chalet', beds:2, baths:2, area:154, price:25226000, dp:5, years:8, handover:'2030'},
{id:'OG-08', project:'ogami-north-coast', type:'Apartment', beds:3, baths:4, area:158, price:22329000, dp:5, years:8, handover:'2030'},
{id:'OG-09', project:'ogami-north-coast', type:'Apartment', beds:1, baths:2, area:118, price:30000000, dp:5, years:8, handover:'2030'},
{id:'OG-10', project:'ogami-north-coast', type:'Apartment', beds:2, baths:3, area:163, price:55000000, dp:5, years:8, handover:'2030'},
{id:'RM-VL01', project:'ramla-ras-el-hekma', type:'Villa', label:{en:'Villa · Breeze R8',ar:'فيلا · بريز R8'}, beds:3, baths:3, area:155, price:49194000, dp:10, years:7, handover:'2030'},
{id:'RM-TW01', project:'ramla-ras-el-hekma', type:'Twin house', label:{en:'Twin house · Breeze R8',ar:'توين هاوس · بريز R8'}, beds:3, baths:3, area:152, price:38082000, dp:10, years:7, handover:'2030'},
{id:'RM-DX01', project:'ramla-ras-el-hekma', type:'Duplex', label:{en:'Duplex · Breeze R6',ar:'دوبلكس · بريز R6'}, beds:3, baths:3, area:169, price:29168000, dp:10, years:7, handover:'2030'},
{id:'RM-PH01', project:'ramla-ras-el-hekma', type:'Penthouse', label:{en:'Penthouse · Breeze R8',ar:'بنتهاوس · بريز R8'}, beds:3, baths:3, area:174, price:30634000, dp:10, years:7, handover:'2030'},
{id:'RM-CH01', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · Acacia R5',ar:'شاليه · أكاسيا R5'}, beds:4, baths:4, area:207, price:48417000, dp:10, years:7, handover:'2030'},
{id:'RM-DX02', project:'ramla-ras-el-hekma', type:'Duplex', label:{en:'Duplex · Acacia R8',ar:'دوبلكس · أكاسيا R8'}, beds:4, baths:4, area:193, price:35768000, dp:10, years:7, handover:'2030'},
{id:'RM-TW02', project:'ramla-ras-el-hekma', type:'Twin house', label:{en:'Twin house · Acacia R1',ar:'توين هاوس · أكاسيا R1'}, beds:4, baths:4, area:166, price:81621000, dp:10, years:7, handover:'2030'},
{id:'RM-DX03', project:'ramla-ras-el-hekma', type:'Duplex', label:{en:'Duplex · Oasis R3',ar:'دوبلكس · أواسيس R3'}, beds:4, baths:4, area:189, price:32816000, dp:10, years:5, handover:'2028'},
{id:'RM-CH02', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · Oasis R3',ar:'شاليه · أواسيس R3'}, beds:2, baths:2, area:132, price:23418000, dp:10, years:5, handover:'2028'},
{id:'RM-CH03', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · R2',ar:'شاليه · R2'}, beds:2, baths:2, area:130, price:33782000, dp:10, years:7, handover:'2030'},
{id:'RM-DX04', project:'ramla-ras-el-hekma', type:'Duplex', label:{en:'Duplex · Oasis R3',ar:'دوبلكس · أواسيس R3'}, beds:3, baths:3, area:168, price:32490000, dp:10, years:5, handover:'2028'},
{id:'RM-TW03', project:'ramla-ras-el-hekma', type:'Twin house', label:{en:'Twin house',ar:'توين هاوس'}, beds:4, baths:5, area:273, price:79237000, dp:15, years:4, handover:'2027'},
{id:'RM-TH01', project:'ramla-ras-el-hekma', type:'Townhouse', label:{en:'Townhouse · R2',ar:'تاون هاوس · R2'}, beds:4, baths:5, area:201, price:39493000, dp:10, years:7, handover:'2030'},
{id:'RM-CH04', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · The Town R2',ar:'شاليه · ذا تاون R2'}, beds:3, baths:4, area:170, price:39440000, dp:10, years:7, handover:'2030'},
{id:'RM-VL02', project:'ramla-ras-el-hekma', type:'Villa', label:{en:'Villa · Dunes R1',ar:'فيلا · ديونز R1'}, beds:4, baths:5, area:276, price:80457000, dp:15, years:4, handover:'2027'},
{id:'RM-TH02', project:'ramla-ras-el-hekma', type:'Townhouse', label:{en:'Townhouse · The Town R2',ar:'تاون هاوس · ذا تاون R2'}, beds:3, baths:4, area:173, price:42317000, dp:10, years:7, handover:'2030'},
{id:'RM-VL03', project:'ramla-ras-el-hekma', type:'Villa', label:{en:'Villa · Acacia R5',ar:'فيلا · أكاسيا R5'}, beds:5, baths:6, area:305, price:98524000, dp:10, years:7, handover:'2030'},
{id:'RM-VL04', project:'ramla-ras-el-hekma', type:'Villa', label:{en:'Villa · Dunes R1',ar:'فيلا · ديونز R1'}, beds:5, baths:5, area:245, price:96756000, dp:15, years:4, handover:'2027'},
{id:'RM-CH05', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · The Town R2',ar:'شاليه · ذا تاون R2'}, beds:2, baths:2, area:128, price:27914000, dp:10, years:7, handover:'2030'},
{id:'RM-CH06', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · Breeze R8',ar:'شاليه · بريز R8'}, beds:3, baths:3, area:174, price:34016000, dp:10, years:7, handover:'2030'},
{id:'RM-CH07', project:'ramla-ras-el-hekma', type:'Chalet', label:{en:'Chalet · The Town R2',ar:'شاليه · ذا تاون R2'}, beds:3, baths:4, area:171, price:35395000, dp:10, years:7, handover:'2030'},
{id:'AE-AP01', project:'aeon', type:'Apartment', label:{en:'Apartment',ar:'شقة'}, beds:3, baths:3, area:246, price:36000000, dp:10, years:4, handover:'2026'},
{id:'MB-V01', project:'marsa-baghush', type:'Villa', beds:4, baths:4, area:270, price:104550000, dp:10, years:7, handover:'2028'},
{id:'MB-V02', project:'marsa-baghush', type:'Villa', beds:4, baths:4, area:265, price:69734850, dp:10, years:7, handover:'2028'},
{id:'MB-V03', project:'marsa-baghush', type:'Villa', beds:4, baths:4, area:270, price:48615750, dp:10, years:8, handover:'2029'},
{id:'MB-V04', project:'marsa-baghush', type:'Villa', beds:4, baths:4, area:325, price:67277925, dp:10, years:7, handover:'2028'},
{id:'MB-CH01', project:'marsa-baghush', type:'Chalet', label:{en:'Standalone Chalet',ar:'شاليه مستقل'}, beds:3, baths:3, area:255, price:31887750, dp:10, years:8, handover:'2029'},
{id:'MB-CH02', project:'marsa-baghush', type:'Chalet', label:{en:'Standalone Chalet',ar:'شاليه مستقل'}, beds:3, baths:3, area:210, price:32253675, dp:10, years:8, handover:'2029'},
{id:'MB-CH03', project:'marsa-baghush', type:'Chalet', label:{en:'Standalone Chalet',ar:'شاليه مستقل'}, beds:4, baths:4, area:320, price:34501500, dp:10, years:8, handover:'2029'},
{id:'MB-TW01', project:'marsa-baghush', type:'Twin house', beds:4, baths:4, area:275, price:40774500, dp:10, years:8, handover:'2029'},
{id:'MB-CH04', project:'marsa-baghush', type:'Chalet', beds:3, baths:3, area:170, price:23262375, dp:10, years:8, handover:'2029'},
{id:'MB-CH05', project:'marsa-baghush', type:'Chalet', beds:3, baths:3, area:170, price:23314650, dp:10, years:8, handover:'2029'},
{id:'MB-CH06', project:'marsa-baghush', type:'Chalet', beds:4, baths:4, area:280, price:30894525, dp:10, years:8, handover:'2029'},
{id:'MB-CH07', project:'marsa-baghush', type:'Chalet', beds:2, baths:1, area:130, price:19135200, dp:10, years:8, handover:'2029'},
{id:'MS-MI-01', project:'mist-new-cairo', type:'Penthouse', beds:3, baths:3, area:180, price:17602921, dp:5, years:10, handover:'2030'},
{id:'MS-MI-02', project:'mist-new-cairo', type:'Apartment', beds:3, baths:3, area:157, price:18800203, dp:5, years:10, handover:'2030'},
{id:'MS-MI-03', project:'mist-new-cairo', type:'Apartment', beds:3, baths:3, area:157, price:18133546, dp:5, years:10, handover:'2030'},
{id:'MS-MI-04', project:'mist-new-cairo', type:'Apartment', beds:3, baths:3, area:180, price:18670822, dp:5, years:10, handover:'2030'},
{id:'MS-MI-05', project:'mist-new-cairo', type:'Townhouse', beds:4, baths:5, area:200, price:32405574, dp:5, years:10, handover:'2030'},
{id:'MS-MI-06', project:'mist-new-cairo', type:'Townhouse', beds:4, baths:5, area:200, price:28323179, dp:5, years:10, handover:'2030'},
{id:'MS-3W-01', project:'31-west-october', type:'Apartment', beds:1, baths:1, area:80, price:13237120, dp:5, years:10, handover:'2030'},
{id:'MS-3W-02', project:'31-west-october', type:'Apartment', beds:1, baths:2, area:90, price:13480930, dp:5, years:10, handover:'2030'},
{id:'MS-3W-03', project:'31-west-october', type:'Apartment', beds:2, baths:2, area:115, price:13954172, dp:5, years:10, handover:'2030'},
{id:'MS-3W-04', project:'31-west-october', type:'Apartment', beds:2, baths:2, area:120, price:14422200, dp:5, years:10, handover:'2030'},
{id:'MS-3W-05', project:'31-west-october', type:'Apartment', beds:2, baths:3, area:130, price:15323588, dp:5, years:10, handover:'2030'},
{id:'MS-3W-06', project:'31-west-october', type:'Apartment', beds:2, baths:3, area:135, price:16068966, dp:5, years:10, handover:'2030'},
{id:'MS-3W-07', project:'31-west-october', type:'Apartment', beds:2, baths:3, area:140, price:18270431, dp:5, years:10, handover:'2030'},
{id:'MS-3W-08', project:'31-west-october', type:'Apartment', beds:2, baths:3, area:145, price:17426825, dp:5, years:10, handover:'2030'},
{id:'MS-3W-09', project:'31-west-october', type:'Apartment', beds:3, baths:4, area:155, price:17662250, dp:5, years:10, handover:'2030'},
{id:'MS-3W-10', project:'31-west-october', type:'Apartment', beds:3, baths:4, area:165, price:18979125, dp:5, years:10, handover:'2030'},
{id:'MS-3W-11', project:'31-west-october', type:'Apartment', beds:3, baths:4, area:180, price:20704500, dp:5, years:10, handover:'2030'},
{id:'MS-3W-12', project:'31-west-october', type:'Townhouse', beds:5, baths:5, area:225, price:29206214, dp:5, years:10, handover:'2030'},
{id:'MS-3W-13', project:'31-west-october', type:'Villa', beds:5, baths:6, area:330, price:59267264, dp:5, years:10, handover:'2030'},
{id:'MS-MA-01', project:'masyaf-ras-alhekma', type:'Chalet', beds:1, baths:2, area:81, price:12190419, dp:10, years:10, handover:'2030'},
{id:'MS-MA-02', project:'masyaf-ras-alhekma', type:'Chalet', beds:1, baths:2, area:82, price:13795989, dp:10, years:10, handover:'2030'},
{id:'MS-MA-03', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Lagoon Chalet',ar:'شاليه على البحيرة'}, beds:2, baths:2, area:110, price:14349947, dp:10, years:10, handover:'2029'},
{id:'MS-MA-04', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Staggered Chalet',ar:'شاليه متدرّج'}, beds:1, baths:2, area:75, price:15427454, dp:10, years:10, handover:'2030'},
{id:'MS-MA-05', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Staggered Chalet',ar:'شاليه متدرّج'}, beds:1, baths:2, area:90, price:17390948, dp:10, years:10, handover:'2030'},
{id:'MS-MA-06', project:'masyaf-ras-alhekma', type:'Chalet', beds:2, baths:3, area:118, price:18196293, dp:10, years:10, handover:'2030'},
{id:'MS-MA-07', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Lagoon Chalet',ar:'شاليه على البحيرة'}, beds:2, baths:2, area:105, price:18458638, dp:10, years:10, handover:'2029'},
{id:'MS-MA-08', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Lagoon Chalet',ar:'شاليه على البحيرة'}, beds:2, baths:3, area:120, price:19315368, dp:10, years:10, handover:'2029'},
{id:'MS-MA-09', project:'masyaf-ras-alhekma', type:'Penthouse', beds:4, baths:3, area:145, price:20382683, dp:10, years:10, handover:'2029'},
{id:'MS-MA-10', project:'masyaf-ras-alhekma', type:'Chalet', label:{en:'Staggered Chalet',ar:'شاليه متدرّج'}, beds:2, baths:2, area:110, price:22159434, dp:10, years:10, handover:'2030'},
{id:'MS-MA-11', project:'masyaf-ras-alhekma', type:'Duplex', beds:3, baths:4, area:129, price:29899630, dp:10, years:10, handover:'2030'},
{id:'MS-MA-12', project:'masyaf-ras-alhekma', type:'Townhouse', beds:3, baths:4, area:165, price:37800688, dp:10, years:10, handover:'2029'},
{id:'MS-MA-13', project:'masyaf-ras-alhekma', type:'Townhouse', beds:4, baths:4, area:232, price:42583294, dp:10, years:9, handover:'2028'},
{id:'MS-MA-14', project:'masyaf-ras-alhekma', type:'Townhouse', beds:4, baths:4, area:232, price:52076431, dp:10, years:9, handover:'2028'},
{id:'MS-MA-15', project:'masyaf-ras-alhekma', type:'Villa', beds:6, baths:6, area:365, price:238042927, dp:10, years:9, handover:'2030'},
{id:'MS-TR-01', project:'trio-new-cairo', type:'Apartment', beds:2, baths:3, area:130, price:11637891, dp:10, years:10, handover:'2028'},
{id:'MS-TR-02', project:'trio-new-cairo', type:'Apartment', beds:2, baths:3, area:130, price:14095338, dp:10, years:10, handover:'2028'},
{id:'MS-TR-03', project:'trio-new-cairo', type:'Duplex', beds:2, baths:3, area:145, price:16299184, dp:10, years:7, handover:'2027'},
{id:'MS-TR-04', project:'trio-new-cairo', type:'Apartment', beds:3, baths:3, area:150, price:16559716, dp:10, years:7, handover:'2027'},
{id:'MS-TR-05', project:'trio-new-cairo', type:'Apartment', beds:3, baths:4, area:165, price:18383745, dp:10, years:10, handover:'2028'},
{id:'MS-TR-06', project:'trio-new-cairo', type:'Townhouse', beds:5, baths:4, area:241.7, price:30044440, dp:10, years:10, handover:'2028'},
{id:'MS-TR-07', project:'trio-new-cairo', type:'Penthouse', beds:4, baths:5, area:290, price:31641967, dp:10, years:10, handover:'2028'},
{id:'MS-41-01', project:'41-business-district', type:'Office', area:195, price:19170938, dp:10, years:8, handover:'2029'},
{id:'MS-41-02', project:'41-business-district', type:'Office', area:210, areaTo:220, price:19519946, dp:10, years:8, handover:'2029'},
{id:'MS-41-03', project:'41-business-district', type:'Office', area:180, areaTo:185, price:19870185, dp:10, years:8, handover:'2029'},
{id:'MS-41-04', project:'41-business-district', type:'Office', area:140, areaTo:150, price:15969636, dp:10, years:8, handover:'2029'},
{id:'MS-41-05', project:'41-business-district', type:'Office', area:120, areaTo:130, price:13962832, dp:10, years:8, handover:'2029'},
{id:'OR-ZE-01', project:'zed-east', type:'Apartment', beds:1, baths:1, area:86, areaTo:93, price:12800000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-02', project:'zed-east', type:'Apartment', beds:2, baths:2, area:145, price:21000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-03', project:'zed-east', type:'Apartment', beds:3, baths:3, area:193, price:31000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-04', project:'zed-east', type:'Loft', beds:3, baths:4, area:300, price:46000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-05', project:'zed-east', type:'Studio', beds:1, baths:1, area:65, price:8900000, dp:10, years:10, handover:'2027'},
{id:'OR-ZE-06', project:'zed-east', type:'Apartment', beds:1, baths:1, area:86, areaTo:92, price:11700000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-07', project:'zed-east', type:'Apartment', beds:2, baths:2, area:114, price:16000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZE-08', project:'zed-east', type:'Apartment', beds:3, baths:3, area:145, price:22000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-01', project:'zed-east-emerald', type:'Duplex', label:{en:'Duplex Upper',ar:'دوبلكس علوي'}, beds:3, baths:3, area:188, price:27000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-02', project:'zed-east-emerald', type:'Duplex', label:{en:'Duplex Ground',ar:'دوبلكس أرضي'}, beds:3, baths:3, area:191, price:29000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-03', project:'zed-east-emerald', type:'Fourplex', label:{en:'Fourplex Upper',ar:'فوربلكس علوي'}, beds:3, baths:3, area:174, areaTo:206, price:29000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-04', project:'zed-east-emerald', type:'Townhouse', label:{en:'Town House Middle',ar:'تاون هاوس ميدل'}, beds:3, baths:4, area:215, price:38000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-05', project:'zed-east-emerald', type:'Townhouse', label:{en:'Town House Corner',ar:'تاون هاوس كورنر'}, beds:3, baths:4, area:215, price:41000000, dp:10, years:10, handover:'2030'},
{id:'OR-EM-06', project:'zed-east-emerald', type:'Standalone Villa', beds:4, baths:5, area:250, areaTo:290, price:57000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZW-01', project:'zed-west', type:'Studio', beds:1, baths:1, area:60, price:9000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZW-02', project:'zed-west', type:'Apartment', beds:1, baths:1, area:74, areaTo:76, price:10000000, dp:0, years:10, handover:'2030'},
{id:'OR-ZW-03', project:'zed-west', type:'Apartment', beds:2, baths:2, area:106, price:13000000, dp:0, years:10, handover:'2030'},
{id:'OR-ZW-04', project:'zed-west', type:'Apartment', beds:3, baths:3, area:171, price:24000000, dp:0, years:10, handover:'2030'},
{id:'OR-ZW-05', project:'zed-west', type:'Apartment', beds:1, baths:1, area:85, price:10000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZW-06', project:'zed-west', type:'Apartment', beds:2, baths:3, area:125, price:15000000, dp:10, years:10, handover:'2030'},
{id:'OR-ZW-07', project:'zed-west', type:'Apartment', beds:3, baths:4, area:219, price:27000000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-01', project:'solana-west', type:'Villa', label:{en:'Villa 8',ar:'فيلا ٨'}, beds:5, baths:4, area:245, price:39000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-02', project:'solana-west', type:'Villa', label:{en:'Villa 7',ar:'فيلا ٧'}, beds:3, baths:3, area:196, price:30000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-03', project:'solana-west', type:'Villa', label:{en:'Villa 2',ar:'فيلا ٢'}, beds:4, baths:5, area:319, price:76000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-04', project:'solana-west', type:'Villa', label:{en:'Villa 3',ar:'فيلا ٣'}, beds:4, baths:5, area:337, price:62000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-05', project:'solana-west', type:'Villa', label:{en:'Villa 4',ar:'فيلا ٤'}, beds:4, baths:5, area:250, price:51000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-06', project:'solana-west', type:'Villa', label:{en:'Villa 6',ar:'فيلا ٦'}, beds:4, baths:4, area:224, price:40000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-07', project:'solana-west', type:'Townhouse', beds:3, baths:3, area:174, price:21000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-08', project:'solana-west', type:'Twin House', beds:3, baths:3, area:221, price:24000000, dp:0, years:10, handover:'2030'},
{id:'OR-SW-09', project:'solana-west', type:'Apartment', beds:2, baths:3, area:126, areaTo:147, price:15800000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-10', project:'solana-west', type:'Apartment', beds:2, baths:3, area:131, price:17000000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-11', project:'solana-west', type:'Loft', beds:2, baths:3, area:149, price:20700000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-12', project:'solana-west', type:'Duplex', beds:2, baths:3, area:174, price:23000000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-13', project:'solana-west', type:'Apartment', beds:3, baths:3, area:163, areaTo:181, price:20000000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-14', project:'solana-west', type:'Loft', beds:3, baths:4, area:193, price:22500000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-15', project:'solana-west', type:'Penthouse', beds:3, baths:4, area:200, price:26300000, dp:10, years:10, handover:'2030'},
{id:'OR-SW-16', project:'solana-west', type:'Penthouse', beds:4, baths:6, area:232, price:28000000, dp:10, years:10, handover:'2030'},
{id:'OR-SE-01', project:'solana-east', type:'Apartment', beds:2, baths:2, area:134, price:19500000, dp:10, years:8, handover:'2030'},
{id:'OR-SE-02', project:'solana-east', type:'Apartment', beds:3, baths:3, area:181, price:27500000, dp:10, years:8, handover:'2030'},
{id:'OR-SE-03', project:'solana-east', type:'Apartment', beds:1, baths:1, area:99, price:13900000, dp:10, years:8, handover:'2030'},
{id:'OR-SE-04', project:'solana-east', type:'Twin House', beds:3, baths:4, area:240, price:54000000, dp:10, years:8, handover:'2030'},
{id:'OR-SE-05', project:'solana-east', type:'Villa', beds:4, baths:5, area:369, price:119000000, dp:10, years:8, handover:'2030'},
{id:'OR-CR-01', project:'silversands-crystalline', type:'Duplex', beds:2, baths:3, area:160, price:27000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-02', project:'silversands-crystalline', type:'Duplex', beds:3, baths:3, area:180, price:37000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-03', project:'silversands-crystalline', type:'Chalet', label:{en:'Upper Chalet',ar:'شاليه علوي'}, beds:3, baths:3, area:237, price:45000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-04', project:'silversands-crystalline', type:'Chalet', label:{en:'Ground Chalet',ar:'شاليه أرضي'}, beds:4, baths:3, area:204, price:48000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-05', project:'silversands-crystalline', type:'Twin House', beds:4, baths:3, area:202, price:47000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-06', project:'silversands-crystalline', type:'Twin House', beds:4, baths:4, area:307, price:76000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-07', project:'silversands-crystalline', type:'Villa', label:{en:'Villa 4A',ar:'فيلا 4A'}, beds:5, baths:3, area:232, price:75000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-08', project:'silversands-crystalline', type:'Villa', label:{en:'Villa 3B',ar:'فيلا 3B'}, beds:5, baths:6, area:345, price:128000000, dp:15, years:8, handover:'2030'},
{id:'OR-CR-09', project:'silversands-crystalline', type:'Villa', label:{en:'Villa 2A',ar:'فيلا 2A'}, beds:5, baths:6, area:380, price:180000000, dp:15, years:8, handover:'2030'},
{id:'OR-ST-01', project:'silversands-silvertown', type:'Chalet', beds:3, baths:2, area:156, price:27000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-02', project:'silversands-silvertown', type:'Chalet', beds:4, baths:2, area:192, price:40000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-03', project:'silversands-silvertown', type:'Townhouse', beds:3, baths:3, area:150, price:38000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-04', project:'silversands-silvertown', type:'Townhouse', beds:3, baths:4, area:170, price:42000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-05', project:'silversands-silvertown', type:'Villa', beds:3, baths:4, area:190, price:65000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-06', project:'silversands-silvertown', type:'Villa', beds:3, baths:4, area:210, price:68000000, dp:10, years:10, handover:'2030'},
{id:'OR-ST-07', project:'silversands-silvertown', type:'Villa', beds:4, baths:5, area:250, price:75000000, dp:10, years:10, handover:'2030'},
{id:'BAB-SH01', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:178, price:24575937, dp:10, years:8, handover:'2030'},
{id:'BAB-SH02', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:245, price:31426652, dp:10, years:8, handover:'2030'},
{id:'BAB-SH03', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:210, price:3930947, dp:10, years:8, handover:'2030'},
{id:'BAB-SH04', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:172, price:31288950, dp:10, years:8, handover:'2030'},
{id:'BAB-SH05', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:210, price:38186344, dp:10, years:8, handover:'2030'},
{id:'BAB-SH06', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:212, price:29306147, dp:10, years:8, handover:'2030'},
{id:'BAB-SH07', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:145, price:20310531, dp:10, years:8, handover:'2030'},
{id:'BAB-SH08', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:185, price:28758712, dp:10, years:8, handover:'2030'},
{id:'BAB-SH09', project:'bab-shores', type:'Chalet', beds:3, baths:4, area:175, price:26046562, dp:10, years:8, handover:'2030'},
{id:'BAB-SH10', project:'bab-shores', type:'Chalet', beds:3, baths:3, area:185, price:24959540, dp:10, years:8, handover:'2030'},
{id:'BAB-SH11', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:123, price:20864760, dp:10, years:8, handover:'2030'},
{id:'BAB-SH12', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:126, price:22475391, dp:10, years:8, handover:'2030'},
{id:'BAB-SH13', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:143, price:20312632, dp:10, years:8, handover:'2030'},
{id:'BAB-SH14', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:135, price:19769341, dp:10, years:8, handover:'2030'},
{id:'BAB-SH15', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:132, price:18409545, dp:10, years:8, handover:'2030'},
{id:'BAB-SH16', project:'bab-shores', type:'Chalet', beds:2, baths:3, area:165, price:20828981, dp:10, years:8, handover:'2030'},
{id:'BAB-RO01', project:'bab-roots', type:'Villa', beds:7, baths:8, area:590, price:136258250, dp:10, years:7, handover:'2030'},
{id:'BAB-RO02', project:'bab-roots', type:'Villa', beds:4, baths:5, area:280, price:60648000, dp:10, years:7, handover:'2030'},
{id:'BAB-RO03', project:'bab-roots', type:'Chalet', beds:2, baths:3, area:142, price:29282845, dp:10, years:7, handover:'2029'},
{id:'BAB-RO04', project:'bab-roots', type:'Chalet', beds:3, baths:4, area:190, price:32359959, dp:10, years:7, handover:'2029'},
{id:'BAB-RO05', project:'bab-roots', type:'Twin house', beds:3, baths:3, area:182, price:39726960, dp:10, years:7, handover:'2030'},
{id:'BAB-RY01', project:'bab-rays', type:'Villa', beds:5, baths:6, area:340, price:94400000, dp:10, years:7, handover:'2030'},
{id:'BAB-RY02', project:'bab-rays', type:'Townhouse', beds:3, baths:4, area:185, price:39950000, dp:10, years:7, handover:'2030'},
{id:'BAB-RY03', project:'bab-rays', type:'Townhouse', beds:3, baths:3, area:220, price:47650000, dp:10, years:7, handover:'2030'},
{id:'BAB-HS01', project:'bab-hills-by-the-sea', type:'Villa', beds:5, baths:6, area:475, price:131400000, dp:10, years:7, handover:'2029'},
{id:'BAB-HS02', project:'bab-hills-by-the-sea', type:'Villa', beds:6, baths:8, area:450, price:265500000, dp:10, years:7, handover:'2028'},
{id:'BAB-HL01', project:'bab-hills', type:'Villa', beds:3, baths:4, area:180, price:54573750, dp:50, years:2, handover:'Ready'},
{id:'CS-TH1', project:'caesar-north-coast', type:'Townhouse', beds:3, baths:3, area:225, price:39200000},
{id:'CS-TW1', project:'caesar-north-coast', type:'Twin house', beds:4, baths:4, area:205, price:47300000},
{id:'CS-SV1', project:'caesar-north-coast', type:'Standalone Villa', beds:4, baths:5, area:254, price:59200000},
{id:'JN-CR1', project:'june-north-coast', type:'Standalone Villa', beds:4, baths:4, area:268, price:89300000},
{id:'JN-OP1', project:'june-north-coast', type:'Standalone Villa', beds:4, baths:4, area:254, price:134400000, avail:'limited'},
{id:'BD-AP1', project:'badya-october', type:'Apartment', beds:3, baths:3, area:160, price:6500000},
{id:'BD-TH1', project:'badya-october', type:'Townhouse', beds:4, baths:4, area:220, price:11500000},
{id:'BD-VL1', project:'badya-october', type:'Villa', beds:5, baths:5, area:300, price:19000000, avail:'limited'},
{id:'ES-AP1', project:'the-estates-zayed', type:'Apartment', beds:3, baths:3, area:175, price:12000000},
{id:'ES-VL1', project:'the-estates-zayed', type:'Villa', beds:5, baths:5, area:320, price:30000000, avail:'limited'},
{id:'AL-AP1', project:'aliva-mostakbal', type:'Apartment', beds:3, baths:2, area:150, price:6000000},
{id:'AL-TH1', project:'aliva-mostakbal', type:'Townhouse', beds:4, baths:4, area:215, price:10500000},
{id:'AL-VL1', project:'aliva-mostakbal', type:'Villa', beds:4, baths:4, area:260, price:15500000, avail:'limited'},
{id:'VC-AP1', project:'vinci-capital', type:'Apartment', beds:3, baths:2, area:165, price:6500000},
{id:'VC-VL1', project:'vinci-capital', type:'Villa', beds:4, baths:4, area:280, price:16000000, avail:'limited'},
{id:'VDC-A1', project:'village-de-la-capitale', type:'Apartment', beds:1, baths:1, area:60, price:6400000},
{id:'VDC-T1', project:'village-de-la-capitale', type:'Townhouse', beds:3, baths:3, area:176, price:24100000},
{id:'VDC-V1', project:'village-de-la-capitale', type:'Villa', beds:4, baths:4, area:185, price:28700000, avail:'limited'},
{id:'PHN-A1', project:'palm-hills-new-cairo', type:'Apartment', beds:1, baths:1, area:70, price:10400000},
{id:'PHN-A2', project:'palm-hills-new-cairo', type:'Apartment', beds:2, baths:2, area:114, price:14600000},
{id:'PHN-A3', project:'palm-hills-new-cairo', type:'Apartment', beds:3, baths:3, area:172, price:21000000},
{id:'97H-T1', project:'97-hills', type:'Townhouse', beds:5, baths:5, area:250, price:31200000},
{id:'97H-W1', project:'97-hills', type:'Twin house', beds:5, baths:5, area:250, price:36500000},
{id:'97H-V1', project:'97-hills', type:'Villa', beds:4, baths:5, area:250, price:37400000, avail:'limited'},
{id:'PMT-O1', project:'palmet-new-cairo', type:'Office', baths:1, area:68, price:13000000},
{id:'PMT-O2', project:'palmet-new-cairo', type:'Administrative Office', baths:2, area:150, price:25000000},
{id:'PX-A1', project:'px-new-cairo', type:'Apartment', beds:1, baths:1, area:77, price:13500000},
{id:'PX-T1', project:'px-new-cairo', type:'Townhouse', beds:4, baths:4, area:231, price:26100000},
{id:'PX-V1', project:'px-new-cairo', type:'Villa', beds:4, baths:4, area:280, price:40200000, avail:'limited'},
{id:'JRN-A1', project:'jirian-zayed', type:'Apartment', beds:1, baths:1, area:62, price:7800000},
{id:'JRN-A2', project:'jirian-zayed', type:'Apartment', beds:3, baths:3, area:150, price:16500000},
{id:'JRN-V1', project:'jirian-zayed', type:'Villa', beds:3, baths:4, area:196, price:34400000, avail:'limited'},
{id:'HBL-C1', project:'hacienda-blue', type:'Cabin', beds:1, baths:1, area:42, price:19600000},
{id:'HBL-A1', project:'hacienda-blue', type:'Apartment', beds:3, baths:3, area:116, price:22400000},
{id:'HBL-V1', project:'hacienda-blue', type:'Villa', beds:5, baths:5, area:324, price:67000000, avail:'limited'},
{id:'HWT-C1', project:'hacienda-waters', type:'Chalet', beds:1, baths:1, area:65, price:14100000},
{id:'HWT-C2', project:'hacienda-waters', type:'Chalet', beds:3, baths:3, area:141, price:19700000},
{id:'HWT-V1', project:'hacienda-waters', type:'Villa', beds:5, baths:5, area:320, price:70000000, avail:'limited'},
{id:'HHN-A1', project:'hacienda-heneish', type:'Apartment', beds:2, baths:2, area:105, price:16000000},
{id:'HHN-C1', project:'hacienda-heneish', type:'Chalet', beds:3, baths:3, area:116, price:23000000},
{id:'HHN-V1', project:'hacienda-heneish', type:'Villa', beds:5, baths:5, area:302, price:55000000, avail:'limited'},
{id:'HWS-C1', project:'hacienda-west', type:'Chalet', beds:2, baths:2, area:111, price:23800000},
{id:'HWS-B1', project:'hacienda-west', type:'Cabin', beds:2, baths:2, area:95, price:36600000},
{id:'HWS-V1', project:'hacienda-west', type:'Villa', beds:4, baths:4, area:340, price:113600000, avail:'limited'}
];
var UNIT_EXTRA={'V-A305':{floor:'high'},'V-TH22':{lvl:2},'SE-T12':{lvl:2},'SE-A44':{floor:'middle'},'ET-D07':{floor:'low',lvl:2},'ET-A12':{floor:'low'},'AL-V03':{lvl:2},'AL-TW6':{lvl:2},'MV-D14':{floor:'low',lvl:2},'FS-A18':{floor:'high'},'IB-V05':{lvl:2},'IB-S02':{floor:'low'},'HP-P03':{floor:'top',roof:true},'CG-A05':{floor:'middle'},'VL-IV3':{floor:'ground',lvl:3},'AL-TV2':{lvl:2},'CS-TH1':{lvl:2},'CS-TW1':{lvl:2}};
UNITS.forEach(function(u){ var e=UNIT_EXTRA[u.id]; if(e){ for(var k in e){ u[k]=e[k]; } } });
var TYPE_META = {
'Apartment':{ar:'شقة', icon:'ty_apartment'}, 'Villa':{ar:'فيلا', icon:'ty_villa'},
'Standalone Villa':{ar:'فيلا مستقلة', icon:'ty_villa'},
'Townhouse':{ar:'تاون هاوس', icon:'ty_townhouse'}, 'Twin house':{ar:'توين هاوس', icon:'ty_twinhouse'},
'Duplex':{ar:'دوبلكس', icon:'ty_duplex'}, 'Penthouse':{ar:'بنتهاوس', icon:'ty_penthouse'},
'Studio':{ar:'استوديو', icon:'ty_studio'}, 'Loft':{ar:'لوفت', icon:'ty_studio'},
'Chalet':{ar:'شاليه', icon:'ty_chalet'}, 'Cabin':{ar:'كابين', icon:'ty_cabin'},
'Office':{ar:'مكتب', icon:'ty_office'}, 'Clinic':{ar:'عيادة', icon:'ty_office'}, 'Retail':{ar:'محل تجاري', icon:'ty_office'}
};
var RESEARCH = [
{slug:'primary-vs-resale', cat:{en:'Buyer guide',ar:'دليل المشتري'}, read:6, title:{en:'Primary sale vs resale in Egypt — what actually changes',ar:'البيع الأولي مقابل إعادة البيع في مصر — ما الذي يتغيّر فعلاً'}, excerpt:{en:'Why buying developer-direct affects price, plan and paperwork.',ar:'لماذا يؤثّر الشراء من المطوّر مباشرة على السعر والخطة والأوراق.'}, body:{en:['Primary sale means buying a unit directly from the developer — typically a new launch or off-plan unit — while resale means buying from a current owner. The distinction changes three things buyers care about most: price, payment plan and paperwork.','On price, primary units are usually released at launch pricing with longer installment plans (often several years) but a delivery date in the future. Resale units may cost more per metre because they are ready, but usually require a much larger cash amount up front.','On paperwork, a primary purchase is a contract with the developer and follows the developer’s reservation, contracting and delivery milestones. The Village works only in primary sale, so an advisor can confirm the current developer price list, plan and availability before you commit.'],ar:['البيع الأولي يعني شراء الوحدة مباشرة من المطوّر — عادةً إطلاق جديد أو وحدة على الخريطة — بينما إعادة البيع تكون من مالك حالي. هذا الفرق يغيّر ثلاثة أمور تهمّ المشتري: السعر وخطة السداد والأوراق.','في السعر، تُطرح الوحدات الأولية بأسعار إطلاق مع خطط تقسيط أطول (سنوات غالباً) لكن بتاريخ تسليم مستقبلي. أمّا وحدات إعادة البيع فقد تكون أعلى للمتر لأنها جاهزة، لكنها تتطلّب مبلغاً نقدياً أكبر مقدماً.','في الأوراق، الشراء الأولي عقد مع المطوّر ويتبع مراحل الحجز والتعاقد والتسليم. تعمل The Village في البيع الأولي فقط، لذا يؤكّد المستشار قائمة أسعار المطوّر الحالية والخطة والإتاحة قبل أي التزام.']}},
{slug:'newcairo-vs-capital', cat:{en:'Area guide',ar:'دليل المناطق'}, read:8, title:{en:'New Cairo vs the New Capital for primary investment',ar:'القاهرة الجديدة مقابل العاصمة الإدارية للاستثمار الأولي'}, excerpt:{en:'Delivery timelines, pricing and who each area suits.',ar:'مواعيد التسليم والأسعار ولمن تناسب كل منطقة.'}, body:{en:['New Cairo is an established East Cairo hub with mature compounds, schools, retail and business districts. Prices reflect that maturity, and many communities are partly or fully delivered.','The New Administrative Capital is newer and still launching, which can mean lower entry pricing and longer plans, but a longer wait to delivery and a maturing services picture.','Neither is universally “better”. Your timeline, budget and whether you’re buying to live or to hold matter more than the label. An advisor can compare current launches in both against your goal.'],ar:['القاهرة الجديدة مركز شرق القاهرة المكتمل بكمبوندات ومدارس وتجزئة ومناطق أعمال، وتعكس الأسعار هذا النضج مع تسليم جزئي أو كامل لكثير من المجتمعات.','العاصمة الإدارية الجديدة أحدث وما زالت تُطرح، ما قد يعني أسعار دخول أقل وخططاً أطول، مقابل انتظار أطول للتسليم وخدمات في طور الاكتمال.','لا توجد منطقة «أفضل» للجميع؛ فجدولك الزمني وميزانيتك وهدفك (سكن أم احتفاظ) أهم من الاسم. يقارن المستشار الإطلاقات الحالية في الاثنتين وفق هدفك.']}},
{slug:'gcc-remote-reservation', cat:{en:'GCC guide',ar:'دليل الخليج'}, read:7, title:{en:'How Gulf buyers reserve Egypt property remotely',ar:'كيف يحجز مشترو الخليج عقارات مصر عن بُعد'}, excerpt:{en:'A practical view of reserving from abroad and the documents to prepare.',ar:'نظرة عملية للحجز من الخارج والمستندات المطلوبة.'}, body:{en:['Many Gulf-based buyers shortlist Egypt primary units before travelling. The practical steps are: shortlist projects, ask an advisor for the current developer price list and plan, and confirm reservation terms in writing.','Reserving typically involves a reservation form and a payment to the developer under the developer’s process. Details such as power of attorney and transfers depend on your situation and should be confirmed with the developer and a qualified professional.','The Village supports remote buyers by comparing options in your timezone and confirming figures with the developer — but final legal, transfer and residency questions should be reviewed with a licensed professional.'],ar:['كثير من مشتري الخليج يرشّحون وحدات مصر الأولية قبل السفر. الخطوات العملية: ترشيح المشروعات، وطلب قائمة أسعار المطوّر الحالية والخطة من المستشار، وتأكيد شروط الحجز كتابةً.','يتضمّن الحجز عادةً استمارة حجز ودفعة للمطوّر وفق إجراءاته. أمّا تفاصيل مثل التوكيل والتحويلات فتعتمد على حالتك ويجب تأكيدها مع المطوّر ومختصّ مؤهّل.','تدعم The Village المشترين عن بُعد بمقارنة الخيارات بتوقيتهم وتأكيد الأرقام مع المطوّر — على أن تُراجَع المسائل القانونية والتحويل والإقامة مع مختصّ مرخّص.']}},
{slug:'reading-payment-plans', cat:{en:'Payment plans',ar:'خطط السداد'}, read:5, title:{en:'Reading an Egyptian payment plan before you sign',ar:'قراءة خطة السداد المصرية قبل التوقيع'}, excerpt:{en:'Down payment, installment years and the fees to ask about.',ar:'المقدم وسنوات التقسيط والرسوم التي يجب السؤال عنها.'}, body:{en:['A typical Egyptian primary plan has a down payment (a percentage of the unit price), equal or stepped installments over several years, and a delivery date. Some plans add maintenance and clubhouse fees.','Ask about the total contract price, whether the down payment includes reservation, the installment frequency, any delivery-linked payments, and the maintenance deposit. These change the real cost more than the headline price.','Every figure shown on this site is illustrative. Before signing, ask an advisor for the current developer plan in writing so you compare like for like.'],ar:['الخطة الأولية المصرية النموذجية تتضمّن دفعة مقدمة (نسبة من سعر الوحدة) وأقساطاً متساوية أو متدرّجة على سنوات وتاريخ تسليم، وقد تُضاف رسوم صيانة ونادٍ.','اسأل عن إجمالي سعر التعاقد، وهل يشمل المقدم الحجز، ودورية الأقساط، وأي دفعات مرتبطة بالتسليم، ووديعة الصيانة؛ فهذه تغيّر التكلفة الحقيقية أكثر من السعر المعلن.','كل رقم على الموقع تقديري. قبل التوقيع اطلب من المستشار خطة المطوّر الحالية كتابةً لتقارن على أساس واحد.']}},
{slug:'compare-developers', cat:{en:'Developer guide',ar:'دليل المطوّرين'}, read:6, title:{en:'How to compare Egyptian developers fairly',ar:'كيف تقارن المطوّرين المصريين بإنصاف'}, excerpt:{en:'Track record, delivery and finishing — what to weigh.',ar:'السجل والتسليم والتشطيب — ما الذي يجب موازنته.'}, body:{en:['When comparing developers, look at delivery track record (do they hand over on time?), build and finishing quality, the maturity of their existing communities, and after-sales and facility management.','A big brand is not automatically the right fit — a smaller developer with a strong recent delivery record can suit a specific budget or area better.','Use the developer pages on this site as a starting point for names and areas, then ask an advisor for the current project list and terms for each.'],ar:['عند مقارنة المطوّرين انظر إلى سجل التسليم (هل يسلّمون في المواعيد؟)، وجودة البناء والتشطيب، ونضج مجتمعاتهم القائمة، وخدمات ما بعد البيع وإدارة المرافق.','العلامة الكبيرة ليست دائماً الأنسب؛ فقد يناسبك مطوّر أصغر بسجل تسليم قوي حديث في ميزانية أو منطقة محدّدة.','استخدم صفحات المطوّرين هنا كنقطة بداية للأسماء والمناطق، ثم اطلب من المستشار قائمة المشروعات والشروط الحالية لكلٍّ منهم.']}},
{slug:'egyptians-abroad', cat:{en:'Overseas guide',ar:'دليل الخارج'}, read:7, title:{en:'Egyptians abroad: reserving a unit from overseas',ar:'المصريون بالخارج: حجز وحدة من الخارج'}, excerpt:{en:'Power of attorney, transfers and advisor support.',ar:'التوكيل والتحويلات ودعم المستشار.'}, body:{en:['Egyptians abroad often buy primary units to hold or for family. The workflow is similar to any remote purchase: shortlist, confirm current developer terms, and reserve under the developer’s process.','A power of attorney can let a trusted person or professional complete steps locally on your behalf. The exact wording and transfer method should be confirmed with the developer and a licensed professional for your country.','The Village helps you compare and confirm figures with the developer; it does not provide legal, tax or immigration advice.'],ar:['يشتري المصريون بالخارج غالباً وحدات أولية للاحتفاظ أو للعائلة. الإجراء يشبه أي شراء عن بُعد: ترشيح، وتأكيد شروط المطوّر الحالية، والحجز وفق إجراءاته.','يتيح التوكيل لشخص موثوق أو مختصّ إتمام الخطوات محلياً نيابةً عنك. تُؤكَّد الصياغة الدقيقة وطريقة التحويل مع المطوّر ومختصّ مرخّص في بلدك.','تساعدك The Village على المقارنة وتأكيد الأرقام مع المطوّر، ولا تقدّم استشارة قانونية أو ضريبية أو خاصة بالهجرة.']}}
];
var FAQ = [
{label:{en:'About The Village',ar:'عن The Village'}, items:[
{q:{en:'Who is The Village?',ar:'من هي The Village؟'}, a:{en:'The Village is a real-estate marketing and brokerage company in Egypt. We help you buy or invest in residential and commercial units across the finest areas of New Cairo and Fifth Settlement, with trusted options, honest advisory and flexible payment plans from your first question to unit handover.',ar:'The Village شركة متخصصة في التسويق والوساطة العقارية في مصر، تساعدك على شراء أو استثمار الوحدات السكنية والتجارية في أرقى مناطق القاهرة الجديدة والتجمع الخامس، مع اختيارات موثوقة واستشارة عقارية وأنظمة سداد مرنة من البداية حتى استلام وحدتك.'}},
{q:{en:'Which areas do you offer units in?',ar:'ما المناطق التي توفرون فيها وحدات؟'}, a:{en:'The Village offers residential and commercial units across Egypt’s most important areas such as Fifth Settlement, New Cairo and the New Administrative Capital — including apartments, villas, duplexes and townhouses in a range of sizes and prices suited to both living and investment.',ar:'توفّر The Village وحدات سكنية وتجارية في أهم مناطق مصر مثل التجمع الخامس والقاهرة الجديدة والعاصمة الإدارية الجديدة، وتشمل شققاً وفيلات ودوبلكس وتاون هاوس بمساحات وأسعار متنوعة تناسب السكن والاستثمار.'}},
{q:{en:'Do you offer installment plans, and how long?',ar:'هل تقدّمون أنظمة تقسيط؟ وما مدتها؟'}, a:{en:'Yes. The Village offers flexible payment systems; installment lengths vary by project and developer — currently up to 9 years on selected units. The down payment and plan length differ per project, and every figure shown here is illustrative until an advisor confirms the developer’s current terms with you.',ar:'نعم، توفّر The Village أنظمة سداد مرنة تختلف مدتها حسب المشروع والمطوّر — وتصل حالياً حتى 9 سنوات على وحدات مختارة. تختلف الدفعة المقدمة ومدة التقسيط حسب المشروع، وكل رقم معروض هنا استرشادي حتى يؤكّد المستشار شروط المطوّر الحالية معك.'}},
{q:{en:'What is the difference between primary units and resale?',ar:'ما الفرق بين الوحدات الأولية وإعادة البيع؟'}, a:{en:'Primary units are bought directly from the developer, usually with longer installment plans and launch prices, while resale is from a current owner and may be ready for immediate handover. The Village works in primary sale and helps you understand both so you choose what fits your needs.',ar:'الوحدات الأولية تُشترى مباشرة من المطوّر عادةً بخطط تقسيط أطول وأسعار إطلاق، بينما إعادة البيع تكون من مالك حالي وقد تكون جاهزة للاستلام الفوري. تعمل The Village في البيع الأولي وتساعدك على فهم الخيارين لاختيار الأنسب لك.'}},
{q:{en:'How do I book a viewing or reach an advisor?',ar:'كيف أحجز معاينة أو أتواصل مع مستشار؟'}, a:{en:'Leave your details in the contact form on this site, or reach us directly by phone or WhatsApp — a real-estate advisor will follow up to arrange a viewing, answer your questions and suggest suitable units.',ar:'اترك بياناتك في نموذج التواصل بالموقع، أو تواصل معنا مباشرةً عبر الهاتف أو واتساب، وسيتابع معك مستشار عقاري لترتيب معاينة والإجابة عن أسئلتك واقتراح الوحدات المناسبة.'}},
{q:{en:'Do you offer free real-estate consultations?',ar:'هل تقدّمون استشارات عقارية مجانية؟'}, a:{en:'Yes. The Village offers a free real-estate consultation that helps you understand the market and choose the area, unit and payment plan that fit your goal and budget — with no obligation, before you make any buying decision.',ar:'نعم، تقدّم The Village استشارة عقارية مجانية تساعدك على فهم السوق واختيار المنطقة والوحدة وخطة السداد المناسبة لهدفك وميزانيتك، دون أي التزام، قبل اتخاذ قرار الشراء.'}}
]},
{label:{en:'Buying & figures',ar:'الشراء والأرقام'}, items:[
{q:{en:'Are the prices on this site final?',ar:'هل الأسعار على الموقع نهائية؟'}, a:{en:'No. Every price, down payment, installment length and delivery date shown here is illustrative and can change. We confirm the current developer price list and plan with you before any commitment. We never present an unverified figure as final.',ar:'لا. كل سعر ودفعة مقدمة ومدة تقسيط وتاريخ تسليم معروض هنا تقديري وقابل للتغيّر، ونؤكّد قائمة أسعار المطوّر الحالية والخطة معك قبل أي التزام. لا نقدّم رقماً غير مؤكّد على أنه نهائي.'}},
{q:{en:'Do you sell resale or rental units?',ar:'هل تبيعون وحدات إعادة بيع أو إيجار؟'}, a:{en:'No. The Village focuses on primary sale only — new launches, off-plan and developer-direct units. We do not operate as a resale, owner-listing or rental marketplace.',ar:'لا. تركّز The Village على البيع الأولي فقط — الإطلاقات الجديدة والوحدات على الخريطة ومن المطوّر مباشرة. ولا نعمل كسوق لإعادة البيع أو عروض المُلّاك أو الإيجار.'}},
{q:{en:'Can I buy from outside Egypt?',ar:'هل يمكنني الشراء من خارج مصر؟'}, a:{en:'Yes, many buyers shortlist and reserve remotely. An advisor compares options in your timezone and confirms figures with the developer. Legal, transfer and residency questions should be reviewed with a licensed professional.',ar:'نعم، يرشّح كثير من المشترين ويحجزون عن بُعد. يقارن المستشار الخيارات بتوقيتك ويؤكّد الأرقام مع المطوّر. وتُراجَع المسائل القانونية والتحويل والإقامة مع مختصّ مرخّص.'}}
]}
];
var ABOUT = {en:[
'The Village is a real-estate marketing and brokerage company in Egypt, focused entirely on primary-sale property — new launches, off-plan developments and developer-direct units.',
'We help buyers and investors compare projects, developers and areas across New Cairo, Fifth Settlement, the New Administrative Capital, the North Coast and other active markets, then guide them from the first question to unit handover.',
'Our approach is deliberately honest about facts. Developer and area names are public information, but prices, payment plans, delivery dates and availability change frequently. So we treat every figure on this website as illustrative until an advisor confirms the current developer terms with you. We do not invent inventory, contacts, testimonials or success messages.',
'We work in both English and Arabic and support buyers based in Egypt, the Gulf, Europe and anywhere Egyptians and international investors buy property in Egypt.'
], ar:[
'The Village شركة تسويق ووساطة عقارية في مصر، تركّز بالكامل على عقارات البيع الأولي — الإطلاقات الجديدة والمشروعات على الخريطة والوحدات من المطوّر مباشرة.',
'نساعد المشترين والمستثمرين على مقارنة المشروعات والمطوّرين والمناطق في القاهرة الجديدة والتجمع الخامس والعاصمة الإدارية والساحل الشمالي وأسواق نشطة أخرى، ثم نرافقهم من أول سؤال حتى استلام الوحدة.',
'نهجنا صادق عمداً بشأن الحقائق. أسماء المطوّرين والمناطق معلومات عامة، لكن الأسعار وخطط السداد ومواعيد التسليم والإتاحة تتغيّر كثيراً، لذلك نعتبر كل رقم على الموقع تقديرياً حتى يؤكّد المستشار الشروط الحالية للمطوّر معك. ولا نختلق وحدات أو بيانات تواصل أو شهادات أو رسائل نجاح.',
'نعمل بالعربية والإنجليزية وندعم المشترين في مصر والخليج وأوروبا وأينما يشتري المصريون والمستثمرون الدوليون عقارات في مصر.'
]};
var LEGAL = {
privacy:{title:{en:'Privacy notice',ar:'إشعار الخصوصية'}, summary:{en:'How The Village Investment handles personal data submitted through this website — what we collect, why, and your choices. Preview wording pending legal review.',ar:'كيف تتعامل The Village Investment مع البيانات الشخصية المُرسلة عبر هذا الموقع — ما نجمعه ولماذا وخياراتك. صياغة أولية قيد المراجعة القانونية.'}, body:{en:[
['h','What this notice covers'],
['p','This preview describes how The Village intends to handle personal data submitted through this website, such as your name, phone, email and enquiry details. Final wording is pending legal review before launch.'],
['h','What we collect and why'],
['p','If you submit the contact form we collect the details you provide in order to respond to your property enquiry. In this preview build the form is not connected to a live system, so submissions are not transmitted or stored on a server.'],
['h','Analytics'],
['p','This preview does not load third-party advertising or tracking cookies. Any analytics added before launch will be documented here, loaded only where consent applies, and will exclude personal details.'],
['h','Your choices'],
['p','At launch you will be able to request access to, or deletion of, the details you submitted, using the contact channel published at that time. A verified data-controller identity and contact will be added before this notice is finalised.']
],ar:[
['h','ما الذي يغطّيه هذا الإشعار'],
['p','تصف هذه النسخة التجريبية كيف تعتزم The Village التعامل مع البيانات الشخصية المُرسلة عبر الموقع، مثل الاسم والهاتف والبريد وتفاصيل الاستفسار. الصياغة النهائية قيد المراجعة القانونية قبل الإطلاق.'],
['h','ما الذي نجمعه ولماذا'],
['p','عند إرسال نموذج التواصل نجمع البيانات التي تقدّمها للردّ على استفسارك العقاري. وفي هذه النسخة التجريبية النموذج غير متصل بنظام حيّ، لذلك لا تُرسَل الطلبات أو تُخزَّن على خادم.'],
['h','التحليلات'],
['p','لا تُحمّل هذه النسخة ملفات تتبّع أو إعلانات من أطراف خارجية. وأي تحليلات تُضاف قبل الإطلاق ستُوثَّق هنا وتُحمّل فقط حيث تنطبق الموافقة ودون بيانات شخصية.'],
['h','خياراتك'],
['p','عند الإطلاق يمكنك طلب الاطّلاع على بياناتك أو حذفها عبر قناة التواصل المنشورة حينها. وستُضاف هوية وجهة اتصال موثّقة لمراقب البيانات قبل اعتماد هذا الإشعار.']
]}},
terms:{title:{en:'Terms of use',ar:'شروط الاستخدام'}, summary:{en:'The terms for using The Village Investment’s website, including that all prices, plans and availability are illustrative until confirmed by an advisor. Preview wording pending legal review.',ar:'شروط استخدام موقع The Village Investment، بما في ذلك أن جميع الأسعار والخطط والإتاحة استرشادية حتى يؤكّدها المستشار. صياغة أولية قيد المراجعة القانونية.'}, body:{en:[
['h','Informational purpose'],
['p','This website presents primary-sale property information for general guidance. All prices, payment plans, delivery dates, availability and project details shown are illustrative and do not form an offer or a contract.'],
['h','No professional advice'],
['p','Content here is not financial, legal, tax or investment advice. Confirm current terms with an advisor and the relevant developer, and seek independent professional advice for legal, tax, transfer or residency questions.'],
['h','Third-party names'],
['p','Developer and project names are used to identify publicly known entities for information only. We describe a partnership or authorisation only where it is documented and approved; where it is not, no such relationship is implied.'],
['h','Ownership of this website'],
['p','The design, layout, interface, written descriptions, comparison tools, photography treatment and source code of this website are the property of The Village Investment and are protected by copyright. Developer logos and project renders remain the property of their respective owners and are shown for identification only.'],
['h','What you may not do'],
['p','You may not copy, reproduce, republish or adapt any part of this website — its design, its text or its code — for use on another website or service, whether in whole or in part. You may not use automated means to extract, index, harvest or store its content, including scrapers, crawlers, headless browsers or bulk downloaders, nor build or train a dataset or model on it. You may not frame, mirror or present these pages under another name, brand or domain. Browsing and sharing links is welcome; sending someone a link is always fine.'],
['h','Enforcement'],
['p','Access is provided on these terms. Where they are breached we pursue removal with the host, the registrar and the search engines, and legal remedies where the breach is material. Reproductions are traceable: the site carries markers that identify the source of a copy.'],
['h','Changes'],
['p','Information may change without notice. Final terms, company identity and contact details will be published before public launch.']
],ar:[
['h','غرض معلوماتي'],
['p','يعرض هذا الموقع معلومات عقارات البيع الأولي لأغراض إرشادية عامة. وكل الأسعار وخطط السداد ومواعيد التسليم والإتاحة وتفاصيل المشروعات المعروضة تقديرية ولا تشكّل عرضاً أو عقداً.'],
['h','ليست استشارة مهنية'],
['p','المحتوى هنا ليس استشارة مالية أو قانونية أو ضريبية أو استثمارية. أكّد الشروط الحالية مع المستشار والمطوّر المعني، واطلب استشارة مهنية مستقلّة للمسائل القانونية والضريبية والتحويل والإقامة.'],
['h','أسماء الأطراف الأخرى'],
['p','تُستخدَم أسماء المطوّرين والمشروعات للتعريف بكيانات معروفة للعامة لغرض المعلومات فقط. ولا نصف شراكة أو تفويضاً إلا عند توثيقه واعتماده؛ وحيث لا يوجد، لا يُفهَم أي ارتباط.'],
['h','ملكية هذا الموقع'],
['p','تصميم هذا الموقع وتخطيطه وواجهته ونصوصه الوصفية وأدوات المقارنة فيه ومعالجة الصور والشيفرة المصدرية مملوكة لـ The Village Investment ومحمية بحقوق المؤلف. أما شعارات المطوّرين ورندرات المشروعات فتظل ملكاً لأصحابها وتُعرض للتعريف فقط.'],
['h','ما لا يجوز'],
['p','لا يجوز نسخ أي جزء من هذا الموقع — تصميمه أو نصوصه أو شيفرته — أو إعادة إنتاجه أو نشره أو اقتباسه لاستخدامه في موقع أو خدمة أخرى، كلياً أو جزئياً. ولا يجوز استخدام وسائل آلية لاستخراج محتواه أو فهرسته أو حصده أو تخزينه، بما في ذلك برامج السحب والزواحف والمتصفحات الآلية وأدوات التنزيل بالجملة، ولا بناء أو تدريب مجموعة بيانات أو نموذج عليه. ولا يجوز تأطير هذه الصفحات أو استنساخها أو عرضها تحت اسم أو علامة أو نطاق آخر. أما التصفّح ومشاركة الروابط فمرحّب بهما دائماً.'],
['h','الإنفاذ'],
['p','يُتاح الوصول وفق هذه الشروط. وعند مخالفتها نتابع الإزالة مع جهة الاستضافة ومُسجِّل النطاق ومحرّكات البحث، ونلجأ إلى السبل القانونية عند جسامة المخالفة. والنسخ قابل للتتبّع: يحمل الموقع علامات تكشف مصدر أي نسخة منه.'],
['h','التغييرات'],
['p','قد تتغيّر المعلومات دون إشعار. وستُنشَر الشروط النهائية وهوية الشركة وبيانات التواصل قبل الإطلاق العام.']
]}}
};
function sEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); if(a) for(var k in a) e.setAttribute(k,a[k]);
for(var i=2;i<arguments.length;i++){ if(arguments[i]) e.appendChild(arguments[i]); } return e; }
var ART_ID=0;
function hashN(s){ var n=5381; s=String(s); for(var i=0;i<s.length;i++) n=((n<<5)+n+s.charCodeAt(i))>>>0; return n; }
function rng(seed){ return function(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }
function areaCat(k){ return (k==='sahel'||k==='sokhna'||k==='raselhekma')?'coast':(k==='capital')?'capital':'urban'; }
var NEW_LAUNCH_SLUGS = [];
function isNewLaunch(p){ return !!p && (p.newLaunch===true || NEW_LAUNCH_SLUGS.indexOf(p.slug)>-1); }
function newLaunchProjects(){ return PROJECTS.filter(isNewLaunch); }
var COMING_SOON_LAUNCH = { img:'/project-media/launches/giza-terraces.webp', name:'Giza Terraces', link:'ramla-ras-el-hekma' };
function shade(hex,f){ hex=(hex||'#0d6e7d').replace('#',''); if(hex.length===3) hex=hex.replace(/(.)/g,'$1$1');
var n=parseInt(hex,16), r=(n>>16)&255, g=(n>>8)&255, b=n&255, t=f<0?0:255, a=Math.abs(f);
r=Math.round(r+(t-r)*a); g=Math.round(g+(t-g)*a); b=Math.round(b+(t-b)*a);
return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
function winGrid(svg, bx, by, bw, bh, rand){
for(var y=by+7; y<by+bh-6; y+=13){ for(var x=bx+5; x<bx+bw-5; x+=11){
if(rand()<0.62) svg.appendChild(sEl('rect',{x:x,y:y,width:'5',height:'7',rx:'1',fill:'#F3EFE6',opacity:(0.28+rand()*0.5).toFixed(2)})); } } }
function palm(x,y){ var g=sEl('g',{opacity:'0.92'});
g.appendChild(sEl('path',{d:'M'+x+' '+y+' q 3 -20 0 -34', stroke:'#093a4c','stroke-width':'3', fill:'none'}));
for(var f=0; f<5; f++){ var a=(-150+f*30)*Math.PI/180, ex=x+Math.cos(a)*24, ey=(y-34)+Math.sin(a)*15;
g.appendChild(sEl('path',{d:'M'+x+' '+(y-34)+' Q '+((x+ex)/2)+' '+((y-34+ey)/2-7)+' '+ex+' '+ey, stroke:'#1e7a5a','stroke-width':'3', fill:'none'})); }
return g; }
function tree(x,y){ return sEl('g',{opacity:'0.95'},
sEl('rect',{x:x-2,y:y-13,width:'4',height:'15',fill:'#093a4c'}),
sEl('circle',{cx:x,cy:y-19,r:'12',fill:'#1e7a5a'}),
sEl('circle',{cx:x-7,cy:y-13,r:'8',fill:'#20855f'}),
sEl('circle',{cx:x+7,cy:y-13,r:'8',fill:'#20855f'})); }
var PROJECT_COVERS = {
'aeon':'/project-media/ramla/units/ap-a-03.webp',
'district-5':'/project-media/marakez/units/ap1-d-04.webp',
'crescent-walk':'/project-media/marakez/units/v2-cr-0.webp',
'alam-al-roum':'/project-media/qataridiar/alam-al-roum/city.webp',
'41-business-district':'/project-media/msquared/b41-hero.webp',
'masyaf-ras-alhekma':'/project-media/msquared/masyaf-pool.webp',
'trio-new-cairo':'/project-media/msquared/trio-exterior.webp',
'mist-new-cairo':'/project-media/msquared/units/town1-0.webp',
'31-west-october':'/project-media/msquared/units/ap1-west-0.webp',
'zed-east':'/project-media/ora/ap1-z-0.webp',
'zed-east-emerald':'/project-media/ora/du1-em-0.webp',
'zed-west':'/project-media/ora/st-zw-0.webp',
'solana-west':'/project-media/ora/v8-0.webp',
'solana-east':'/project-media/ora/ap1-se-0.webp',
'silversands-crystalline':'/project-media/ora/ap1-cr-0.webp',
'silversands-silvertown':'/project-media/ora/ap1-ss-0.webp',
'bab-shores':'/project-media/beitalbahr/units/ch1-03-sh.webp',
'bab-roots':'/project-media/beitalbahr/units/v1-01-roo.webp',
'bab-rays':'/project-media/beitalbahr/units/v1-01-rays.webp',
'bab-hills-by-the-sea':'/project-media/beitalbahr/units/v1-01-hills.webp',
'bab-hills':'/project-media/beitalbahr/units/V1-01-H-d1.webp',
'marsa-baghush':'/project-media/baghush/lagoon-firepit.webp',
'sumou-boulevard':'/project-media/sumou/st-03.webp',
'beach-plaza-premium':'/project-media/modon/ap1-bp-03.webp',
'beach-plaza-luxury':'/project-media/modon/ap1-bpl-0.webp',
'lighthouse-village-luxury':'/project-media/modon/ap1-lh-0.webp',
'lighthouse-village-ultra-luxury':'/project-media/modon/ap1-lhu-0.webp',
'wadi-east':'/project-media/modon/th-wd-01.webp',
'montage':'/project-media/modon/v1-mon-0.webp',
'modon-boulevard':'/project-media/modon/ap2-bl-0.webp',
'il-monte-galala':'/project-media/tatweer/tm-sv-il-0.webp',
'bloomfields':'/project-media/tatweer/ap1-bl-0.webp',
'salt':'/project-media/tatweer/ch-sl-0.webp',
'rivers':'/project-media/tatweer/r-0.webp',
'fouka-bay':'/project-media/tatweer/f-0.webp',
'd-bay':'/project-media/tatweer/ch-dp-0.webp',
'scenes':'/project-media/tatweer/th-sc-0.webp',
'villette':'/project-media/villette/i-villa.webp',
'sodic-east':'/project-media/sodic-east/apartment.webp',
'eastown':'/project-media/eastown/apartment.webp',
'allegria':'/project-media/allegria/standalone.webp',
'ogami-north-coast':'/project-media/ogami/apartment.webp',
'caesar-north-coast':'/project-media/caesar/villa.webp',
'june-north-coast':'/project-media/june/standalone-june.webp',
'the-estates-zayed':'/project-media/the-estates/villa.webp',
'ramla-ras-el-hekma':'/project-media/hero/promenade.webp',
'three-sixty':'/project-media/lmd/cover-three-sixty.webp',
'one-ninety':'/project-media/lmd/cover-one-ninety.webp',
'zoya':'/project-media/lmd/cover-zoya.webp',
'stei8ht-eastmed':'/project-media/lmd/cover-stei8ht-eastmed.webp',
'stei8ht-there':'/project-media/lmd/cover-stei8ht-there.webp',
'stei8ht-eastside':'/project-media/lmd/cover-stei8ht-eastside.webp',
'phonix-swanlake':'/project-media/hassan-allam/px-ap1-r1.webp',
'ampm-swanlake':'/project-media/hassan-allam/ap-of1-r1.webp',
'the-valleys':'/project-media/hassan-allam/vl-th1-r1.webp',
'park-central':'/project-media/hassan-allam/pc-ap1-r1.webp',
'the-great-lawn':'/project-media/hassan-allam/gl-ap1-r1.webp',
'swan-lake-west':'/project-media/hassan-allam/sl-ap1-r1.webp',
'mountain-view-11':'/project-media/mountainview/mv11-villas.webp',
'grand-valleys':'/project-media/mountainview/grand-valleys.webp',
'icity-october':'/project-media/mountainview/icity-october-mountain-park.webp',
'kingsway-october':'/project-media/mountainview/kingsway.webp',
'jirian':'/project-media/mountainview/jirian.webp',
'lvls-north-coast':'/project-media/mountainview/lvls.webp',
'plage-north-coast':'/project-media/mountainview/plage.webp',
'crysta-north-coast':'/project-media/mountainview/crysta.webp',
};
var PROJECT_GROUPS = [
{slug:'stei8ht', dev:'lmd', name:'Stei8ht', name_ar:'ستيت',
cover:'/project-media/lmd/cover-stei8ht.webp',
members:['stei8ht-eastmed','stei8ht-there','stei8ht-eastside'],
blurb:{en:'LMD’s Stei8ht collection — business, medical and retail addresses in New Cairo, developer-direct primary units.',
ar:'مجموعة ستيت من LMD — مكاتب وعيادات ومحلات في القاهرة الجديدة، وحدات أولية من المطوّر مباشرة.'}}
];
var GROUP_BY_SLUG = {}, GROUPED_PROJECT = {};
PROJECT_GROUPS.forEach(function(g){ GROUP_BY_SLUG[g.slug]=g; g.members.forEach(function(s){ GROUPED_PROJECT[s]=g.slug; }); });
function groupBySlug(s){ return GROUP_BY_SLUG[s]||null; }
function groupsByDev(k){ return PROJECT_GROUPS.filter(function(g){ return g.dev===k; }); }
function groupMembers(g){ return (g?g.members:[]).map(projBySlug).filter(Boolean); }
function groupFrom(g){ var m=groupMembers(g).map(function(p){return p.price;}).filter(function(x){return x!=null;}); return m.length?Math.min.apply(null,m):null; }
var UNIT_IMAGES = {
'MS-MI-01':'/project-media/msquared/units/pent1-mist-0.webp',
'MS-MI-02':'/project-media/msquared/units/pent2-mist-0.webp',
'MS-MI-03':'/project-media/msquared/units/pent2-mist-0.webp',
'MS-MI-04':'/project-media/msquared/units/pent2-mist-0.webp',
'MS-MI-05':'/project-media/msquared/units/town1-0.webp',
'MS-MI-06':'/project-media/msquared/units/town1-0.webp',
'MS-3W-01':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-02':'/project-media/msquared/units/ap2-west-0.webp',
'MS-3W-03':'/project-media/msquared/units/ap3-west-0.webp',
'MS-3W-04':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-05':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-06':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-07':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-08':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-09':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-10':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-11':'/project-media/msquared/units/ap1-west-0.webp',
'MS-3W-12':'/project-media/msquared/units/thouse1-west-0.webp',
'MS-3W-13':'/project-media/msquared/units/villa-west-0.webp',
'MS-MA-01':'/project-media/msquared/units/chalet-1-masyaf-0.webp',
'MS-MA-02':'/project-media/msquared/units/chalet-2-masyaf-0.webp',
'MS-MA-03':'/project-media/msquared/units/lagoon-chalet1-masyaf-0.webp',
'MS-MA-04':'/project-media/msquared/units/chalet3-masyaf-0.webp',
'MS-MA-05':'/project-media/msquared/units/chalet4-masyaf-0.webp',
'MS-MA-06':'/project-media/msquared/units/chalet5-masyaf-0.webp',
'MS-MA-07':'/project-media/msquared/units/chalet6-masyaf-0.webp',
'MS-MA-08':'/project-media/msquared/units/chalet7-masyaf-0.webp',
'MS-MA-09':'/project-media/msquared/units/pent1-masyaf-0.webp',
'MS-MA-10':'/project-media/msquared/units/chalet8-masyaf-0.webp',
'MS-MA-11':'/project-media/msquared/units/duplex-masyaf-0.webp',
'MS-MA-12':'/project-media/msquared/units/town1-masyaf-0.webp',
'MS-MA-13':'/project-media/msquared/units/town2-masyaf-0.webp',
'MS-MA-14':'/project-media/msquared/units/town3-masyaf-0.webp',
'MS-MA-15':'/project-media/msquared/units/villa-masyaf-0.webp',
'MS-TR-01':'/project-media/msquared/units/ap1-trio-0.webp',
'MS-TR-02':'/project-media/msquared/units/ap2-trio-0.webp',
'MS-TR-03':'/project-media/msquared/units/ap3-trio-0.webp',
'MS-TR-04':'/project-media/msquared/units/ap4-trio-0.webp',
'MS-TR-05':'/project-media/msquared/units/ap5-trio-0.webp',
'MS-TR-06':'/project-media/msquared/units/to1-trio-0.webp',
'MS-TR-07':'/project-media/msquared/units/ap6-trio-0.webp',
'MS-41-01':'/project-media/msquared/units/off1-41-0.webp',
'MS-41-02':'/project-media/msquared/units/off2-41-0.webp',
'MS-41-03':'/project-media/msquared/units/off3-41-0.webp',
'MS-41-04':'/project-media/msquared/units/off4-41-0.webp',
'MS-41-05':'/project-media/msquared/units/off1-41-0.webp',
'OR-ZE-01':'/project-media/ora/ap1-z-0.webp',
'OR-ZE-02':'/project-media/ora/ap2-z-0.webp',
'OR-ZE-03':'/project-media/ora/ap3-z-0.webp',
'OR-ZE-04':'/project-media/ora/lo-z-0.webp',
'OR-ZE-05':'/project-media/ora/stu-z-0.webp',
'OR-ZE-06':'/project-media/ora/ap1-ze-0.webp',
'OR-ZE-07':'/project-media/ora/ap2-ze-0.webp',
'OR-ZE-08':'/project-media/ora/ap3-ze-0.webp',
'OR-EM-01':'/project-media/ora/du1-em-0.webp',
'OR-EM-02':'/project-media/ora/du2-em-0.webp',
'OR-EM-03':'/project-media/ora/four-0.webp',
'OR-EM-04':'/project-media/ora/to1-em-0.webp',
'OR-EM-05':'/project-media/ora/to2-em-0.webp',
'OR-EM-06':'/project-media/ora/st-em-0.webp',
'OR-ZW-01':'/project-media/ora/st-zw-0.webp',
'OR-ZW-02':'/project-media/ora/ap1-zw-0.webp',
'OR-ZW-03':'/project-media/ora/ap3-zw-0.webp',
'OR-ZW-04':'/project-media/ora/ap4-zw-0.webp',
'OR-ZW-05':'/project-media/ora/ap6-zw-0.webp',
'OR-ZW-06':'/project-media/ora/ap6-zw-01.webp',
'OR-ZW-07':'/project-media/ora/ap1-zw-0.webp',
'OR-SW-01':'/project-media/ora/v8-0.webp',
'OR-SW-02':'/project-media/ora/v7-0.webp',
'OR-SW-03':'/project-media/ora/v2-sw-0.webp',
'OR-SW-04':'/project-media/ora/v3-sw-0.webp',
'OR-SW-05':'/project-media/ora/v4-sw-0.webp',
'OR-SW-06':'/project-media/ora/v5-sw-0.webp',
'OR-SW-07':'/project-media/ora/th-sw-0.webp',
'OR-SW-08':'/project-media/ora/tw-sw-0.webp',
'OR-SW-09':'/project-media/ora/ap1-sw-0.webp',
'OR-SW-10':'/project-media/ora/ap2-sw-0.webp',
'OR-SW-11':'/project-media/ora/ap3-sw-0.webp',
'OR-SW-12':'/project-media/ora/ap4-sw-0.webp',
'OR-SW-13':'/project-media/ora/ap5-sw-0.webp',
'OR-SW-14':'/project-media/ora/ap3-sw-0.webp',
'OR-SW-15':'/project-media/ora/pen-sw-0.webp',
'OR-SW-16':'/project-media/ora/pen2.webp',
'OR-SE-01':'/project-media/ora/ap1-se-0.webp',
'OR-SE-02':'/project-media/ora/ap2-se-0.webp',
'OR-SE-03':'/project-media/ora/ap3-se-0.webp',
'OR-SE-04':'/project-media/ora/tw-se-0.webp',
'OR-SE-05':'/project-media/ora/v-se-0.webp',
'OR-CR-01':'/project-media/ora/ap1-cr-0.webp',
'OR-CR-02':'/project-media/ora/ap1-cr-01.webp',
'OR-CR-03':'/project-media/ora/ap1-cr-02.webp',
'OR-CR-04':'/project-media/ora/ap3-cr-0.webp',
'OR-CR-05':'/project-media/ora/ap3-cr-01.webp',
'OR-CR-06':'/project-media/ora/ap3-cr-03.webp',
'OR-CR-07':'/project-media/ora/v1-cr-0.webp',
'OR-CR-08':'/project-media/ora/v2-cr-0.webp',
'OR-CR-09':'/project-media/ora/v1-cr-0.webp',
'OR-ST-01':'/project-media/ora/ap1-ss-0.webp',
'OR-ST-02':'/project-media/ora/ch2-ss-0.webp',
'OR-ST-03':'/project-media/ora/th1-ss-0.webp',
'OR-ST-04':'/project-media/ora/th2-ss-0.webp',
'OR-ST-05':'/project-media/ora/v1-ss-02.webp',
'OR-ST-06':'/project-media/ora/v2-ss-0.webp',
'OR-ST-07':'/project-media/ora/v3-ss-0.webp',
'MB-V01':'/project-media/baghush/units/v1-0.webp',
'MB-V02':'/project-media/baghush/units/v1-02.webp',
'MB-V03':'/project-media/baghush/units/v2-0.webp',
'MB-V04':'/project-media/baghush/units/v3-0.webp',
'MB-CH01':'/project-media/baghush/units/ch1-0.webp',
'MB-CH02':'/project-media/baghush/units/ch2-0.webp',
'MB-CH03':'/project-media/baghush/units/ch2-01.webp',
'MB-TW01':'/project-media/baghush/units/t-0.webp',
'MB-CH04':'/project-media/baghush/units/ch4-0.webp',
'MB-CH05':'/project-media/baghush/units/ch5-0.webp',
'MB-CH06':'/project-media/baghush/units/ch7-0.webp',
'MB-CH07':'/project-media/baghush/units/v1-02.webp',
'BAB-SH01':'/project-media/beitalbahr/units/ch1-02-sh.webp',
'BAB-SH02':'/project-media/beitalbahr/units/ch2-0-sh.webp',
'BAB-SH03':'/project-media/beitalbahr/units/ch3-0-sh.webp',
'BAB-SH04':'/project-media/beitalbahr/units/ch4-0-sh.webp',
'BAB-SH05':'/project-media/beitalbahr/units/ch5-0-sh.webp',
'BAB-SH06':'/project-media/beitalbahr/units/ch6-0-sh.webp',
'BAB-SH07':'/project-media/beitalbahr/units/ch7-0-sh.webp',
'BAB-SH08':'/project-media/beitalbahr/units/ch8-0-sh.webp',
'BAB-SH09':'/project-media/beitalbahr/units/ch9-0-sh.webp',
'BAB-SH10':'/project-media/beitalbahr/units/ch10-0-sh.webp',
'BAB-SH11':'/project-media/beitalbahr/units/ch11-0-sh.webp',
'BAB-SH12':'/project-media/beitalbahr/units/ch12-0-sh.webp',
'BAB-SH13':'/project-media/beitalbahr/units/ch13-0-sh.webp',
'BAB-SH14':'/project-media/beitalbahr/units/ch14-0-sh.webp',
'BAB-SH15':'/project-media/beitalbahr/units/ch15-0-sh.webp',
'BAB-SH16':'/project-media/beitalbahr/units/ch16-0-sh.webp',
'BAB-RO01':'/project-media/beitalbahr/units/v1-0-roo.webp',
'BAB-RO02':'/project-media/beitalbahr/units/v2-0-roo.webp',
'BAB-RO03':'/project-media/beitalbahr/units/ch1-02-roo.webp',
'BAB-RO04':'/project-media/beitalbahr/units/ch2-0-roo.webp',
'BAB-RO05':'/project-media/beitalbahr/units/tw1-0-roo-d2.webp',
'BAB-RY01':'/project-media/beitalbahr/units/v1-0-rays.webp',
'BAB-RY02':'/project-media/beitalbahr/units/tow1-0-rays.webp',
'BAB-RY03':'/project-media/beitalbahr/units/to2-0-rays.webp',
'BAB-HS01':'/project-media/beitalbahr/units/v1-0-hills.webp',
'BAB-HS02':'/project-media/beitalbahr/units/v2-0-hills.webp',
'BAB-HL01':'/project-media/beitalbahr/units/V1-0-H.webp',
'RM-VL01':'/project-media/ramla/units/v1-0.webp',
'RM-TW01':'/project-media/ramla/units/tw2-0.webp',
'RM-DX01':'/project-media/ramla/units/du-02.webp',
'RM-PH01':'/project-media/ramla/units/du-0.webp',
'RM-CH01':'/project-media/ramla/units/ch2-0.webp',
'RM-DX02':'/project-media/ramla/units/du1-0.webp',
'RM-TW02':'/project-media/ramla/units/tw3-0.webp',
'RM-DX03':'/project-media/ramla/units/du2-0.webp',
'RM-CH02':'/project-media/ramla/units/ch3-0.webp',
'RM-CH03':'/project-media/ramla/units/ch4-0.webp',
'RM-DX04':'/project-media/ramla/units/DU3-0.webp',
'RM-TW03':'/project-media/ramla/units/tw4-0.webp',
'RM-TH01':'/project-media/ramla/units/to-0.webp',
'RM-CH04':'/project-media/ramla/units/ch5-0.webp',
'RM-VL02':'/project-media/ramla/units/v2-0.webp',
'RM-TH02':'/project-media/ramla/units/to1-0.webp',
'RM-VL03':'/project-media/ramla/units/v3-0.webp',
'RM-VL04':'/project-media/ramla/units/v4-0.webp',
'RM-CH05':'/project-media/ramla/units/v5-0.webp',
'RM-CH06':'/project-media/ramla/units/ch6-0.webp',
'RM-CH07':'/project-media/ramla/units/ch7-0.webp',
'AE-AP01':'/project-media/ramla/units/ap-a-0.webp',
'D5-A01':'/project-media/marakez/units/ap1-d-0.webp',
'D5-A02':'/project-media/marakez/units/ap2-d-0.webp',
'D5-A03':'/project-media/marakez/units/ap3-d-0.webp',
'D5-A04':'/project-media/marakez/units/ap4--d-0.webp',
'D5-A05':'/project-media/marakez/units/ap1-d-0.webp',
'D5-A06':'/project-media/marakez/units/ap5-d-0.webp',
'D5-A07':'/project-media/marakez/units/ap7-d-0.webp',
'D5-A08':'/project-media/marakez/units/ap8-d-0.webp',
'D5-A09':'/project-media/marakez/units/ap9-d-0.webp',
'D5-A10':'/project-media/marakez/units/ap10-d-0.webp',
'D5-A11':'/project-media/marakez/units/ap11-d-0.webp',
'D5-A12':'/project-media/marakez/units/ap12-d-0.webp',
'D5-A13':'/project-media/marakez/units/ap13-d-0.webp',
'D5-A14':'/project-media/marakez/units/ap14-d-0.webp',
'D5-A15':'/project-media/marakez/units/ap15-d-0.webp',
'D5-A16':'/project-media/marakez/units/ap16-d-0.webp',
'D5-A17':'/project-media/marakez/units/ap17-d-0.webp',
'D5-A18':'/project-media/marakez/units/ap18-d-0.webp',
'D5-A19':'/project-media/marakez/units/ap19-d-0.webp',
'D5-A20':'/project-media/marakez/units/ap13-d-0.webp',
'D5-DX01':'/project-media/marakez/units/ap9-d-0.webp',
'D5-OF01':'/project-media/marakez/units/of1-d-0.webp',
'D5-OF02':'/project-media/marakez/units/of2-d-0.webp',
'D5-OF03':'/project-media/marakez/units/of3-d-0.webp',
'D5-OF04':'/project-media/marakez/units/of4-d-0.webp',
'D5-OF05':'/project-media/marakez/units/of5-d-0.webp',
'CW-TW01':'/project-media/marakez/units/tw-cr-0.webp',
'CW-V01':'/project-media/marakez/units/villa1-cr-0.webp',
'CW-V03':'/project-media/marakez/units/v3-cr-0.webp',
'CW-V04':'/project-media/marakez/units/v4-cr-00.webp',
'CW-V05':'/project-media/marakez/units/v5-cr-0.webp',
'CW-A01':'/project-media/marakez/units/ap1-cr-00.webp',
'CW-A02':'/project-media/marakez/units/ap2-cr-0.webp',
'CW-A03':'/project-media/marakez/units/ap4-cr-0.webp',
'CW-A04':'/project-media/marakez/units/ap5-cr-0.webp',
'CW-A05':'/project-media/marakez/units/ap2-cr-03.webp',
'CW-A06':'/project-media/marakez/units/ap1-cr-002.webp',
'CW-DX01':'/project-media/marakez/units/villa1-cr-0.webp',
'CW-DX02':'/project-media/marakez/units/villa1-cr-0.webp',
'CW-A07':'/project-media/marakez/units/ap1-cr-002.webp',
'CW-TW03':'/project-media/marakez/units/tw-cr-02.webp',
'CW-TW04':'/project-media/marakez/units/tw-cr-0.webp',
'CW-A08':'/project-media/marakez/units/ap8-cr-0.webp',
'CW-A09':'/project-media/marakez/units/ap10-cr-0.webp',
'CW-TH01':'/project-media/marakez/units/th-0-c.webp',
'CW-V06':'/project-media/marakez/units/v3-cr-02.webp',
'CW-V07':'/project-media/marakez/units/v3-cr-03.webp',
'CW-A10':'/project-media/marakez/units/ap2-cr-0.webp',
'CW-A11':'/project-media/marakez/units/ap2-cr-02.webp',
'CW-A12':'/project-media/marakez/units/ap2-cr-0.webp',
'SB-ST-01':'/project-media/sumou/st-0.webp',
'SB-SP-01':'/project-media/sumou/st-05.webp',
'SB-AP-01':'/project-media/sumou/ap2-0.webp',
'SB-AP-02':'/project-media/sumou/ap3-0.webp',
'SB-AP-03':'/project-media/sumou/ap4-0.webp',
'SB-AP-04':'/project-media/sumou/ap5-0.webp',
'SB-OF-01':'/project-media/sumou/of0.webp',
'SB-OF-02':'/project-media/sumou/of2.webp',
'MD-BP-01':'/project-media/modon/ap1-bp-03.webp',
'MD-BP-02':'/project-media/modon/ap2-bp-01.webp',
'MD-BP-03':'/project-media/modon/ap3-bp-0.webp',
'MD-BPL-01':'/project-media/modon/ap1-bpl-0.webp',
'MD-BPL-02':'/project-media/modon/ap2-bpl-0.webp',
'MD-BPL-03':'/project-media/modon/ap3-bpl-0.webp',
'MD-LH-01':'/project-media/modon/ap1-lh-0.webp',
'MD-LH-02':'/project-media/modon/ap2-lh-0.webp',
'MD-LH-03':'/project-media/modon/ap3-lh-0.webp',
'MD-LHU-01':'/project-media/modon/ap1-lhu-0.webp',
'MD-LHU-02':'/project-media/modon/ap2-lhu-0.webp',
'MD-LHU-03':'/project-media/modon/ap3-lhu-0.webp',
'MD-WD-01':'/project-media/modon/th-wd-01.webp',
'MD-WD-02':'/project-media/modon/th2-wd-0.webp',
'MD-WD-03':'/project-media/modon/v-wd-0.webp',
'MD-WD-04':'/project-media/modon/v2-wd-0.webp',
'MD-WD-05':'/project-media/modon/v2-wd-0.webp',
'MD-MON-01':'/project-media/modon/v1-mon-0.webp',
'MD-MON-02':'/project-media/modon/v2-mon-0.webp',
'MD-MON-03':'/project-media/modon/v1-mon-0.webp',
'MD-BL-02':'/project-media/modon/ap2-bl-0.webp',
'MD-BL-03':'/project-media/modon/ap3-bl-0.webp',
'TM-IM-01':'/project-media/tatweer/tm-sv-il-0.webp',
'TM-IM-02':'/project-media/tatweer/tm-st-il-0.webp',
'TM-IM-03':'/project-media/tatweer/tm-ch1-il-0.webp',
'TM-IM-04':'/project-media/tatweer/tm-ap1-il-0.webp',
'TM-IM-05':'/project-media/tatweer/tm-ap2-il-0.webp',
'TM-IM-06':'/project-media/tatweer/tm-ch2-il-0.webp',
'TM-IM-07':'/project-media/tatweer/tm-ch3-il-0.webp',
'TM-IM-08':'/project-media/tatweer/tm-ch4-il-0.webp',
'TM-IM-09':'/project-media/tatweer/tm-lo-il-0.webp',
'TM-IM-10':'/project-media/tatweer/tm-lo2-il-0.webp',
'TM-IM-11':'/project-media/tatweer/tm-lo3-il-0.webp',
'TM-IM-12':'/project-media/tatweer/tm-th1-il-0.webp',
'TM-IM-13':'/project-media/tatweer/tm-sv2-il-0.webp',
'TM-IM-14':'/project-media/tatweer/tm-ca1-il-0.webp',
'TM-IM-15':'/project-media/tatweer/tm-ch5-il-0.webp',
'TM-IM-16':'/project-media/tatweer/tm-ch6-il-0.webp',
'TM-IM-17':'/project-media/tatweer/tm-pe1-il-0.webp',
'TM-IM-18':'/project-media/tatweer/tm-st2-il-01.webp',
'TM-IM-19':'/project-media/tatweer/tm-ap3-il-0.webp',
'TM-IM-20':'/project-media/tatweer/tm-ap4-il-0.webp',
'TM-IM-21':'/project-media/tatweer/tm-ap5-il-0.webp',
'TM-BL-01':'/project-media/tatweer/ap1-bl-0.webp',
'TM-BL-02':'/project-media/tatweer/ap2-bl-0.webp',
'TM-BL-03':'/project-media/tatweer/ap3-blo-0.webp',
'TM-BL-04':'/project-media/tatweer/du-bl-0.webp',
'TM-BL-05':'/project-media/tatweer/ap4-bl-0.webp',
'TM-BL-06':'/project-media/tatweer/ap5-bl-0.webp',
'TM-BL-07':'/project-media/tatweer/ap6-bl-0.webp',
'TM-BL-08':'/project-media/tatweer/ap6-bl-01.webp',
'TM-SL-01':'/project-media/tatweer/ch-sl-0.webp',
'TM-SL-02':'/project-media/tatweer/ch-sl-0.webp',
'TM-SL-03':'/project-media/tatweer/ch3-0.webp',
'TM-SL-04':'/project-media/tatweer/sl-th-0.webp',
'TM-SL-05':'/project-media/tatweer/sl-tw1-0.webp',
'TM-SL-06':'/project-media/tatweer/sl-v-0.webp',
'TM-RV-01':'/project-media/tatweer/r-0.webp',
'TM-RV-02':'/project-media/tatweer/r-ap2-0.webp',
'TM-RV-03':'/project-media/tatweer/du-r-0.webp',
'TM-RV-04':'/project-media/tatweer/sv-r-0.webp',
'TM-RV-05':'/project-media/tatweer/sv-r-0.webp',
'TM-FK-01':'/project-media/tatweer/f-0.webp',
'TM-FK-02':'/project-media/tatweer/f2-0.webp',
'TM-FK-03':'/project-media/tatweer/fouka-8.webp',
'TM-FK-04':'/project-media/tatweer/f4-0.webp',
'TM-DB-01':'/project-media/tatweer/ch-dp-0.webp',
'TM-DB-02':'/project-media/tatweer/tw-dbay-0.webp',
'TM-DB-03':'/project-media/tatweer/d-bay6.webp',
'TM-SC-01':'/project-media/tatweer/th-sc-0.webp',
'TM-SC-02':'/project-media/tatweer/tw-sc-0.webp',
'TM-SC-03':'/project-media/tatweer/sv-sc-0.webp',
'V-A305':'/project-media/villette/apartment.webp',
'V-TH22':'/project-media/villette/town-house.webp',
'VL-IV3':'/project-media/villette/i-villa.webp',
'SE-T12':'/project-media/sodic-east/town-house.webp',
'SE-A44':'/project-media/sodic-east/apartment.webp',
'ET-D07':'/project-media/eastown/duplex.webp',
'ET-A12':'/project-media/eastown/apartment.webp',
'AL-V03':'/project-media/allegria/standalone.webp',
'AL-TW6':'/project-media/allegria/twin-house.webp',
'AL-TV2':'/project-media/allegria/town-house.webp',
'OG-01':'/project-media/ogami/units/v1-ogami-0.webp',
'OG-02':'/project-media/ogami/units/tw1-ogami-0.webp',
'OG-03':'/project-media/ogami/units/th2-ogami-0.webp',
'OG-04':'/project-media/ogami/units/th3-ogami-0.webp',
'OG-05':'/project-media/ogami/units/cha1-ogami-0.webp',
'OG-06':'/project-media/ogami/units/ch2-ogami-0.webp',
'OG-07':'/project-media/ogami/units/ch3-ogamo-0.webp',
'OG-08':'/project-media/ogami/units/ap1-ogami-0.webp',
'OG-09':'/project-media/ogami/units/ap1-ogami-0.webp',
'OG-10':'/project-media/ogami/units/ap3-ogami-0.webp',
'CS-TH1':'/project-media/caesar/town-house.webp',
'CS-TW1':'/project-media/caesar/twin-house.webp',
'CS-SV1':'/project-media/caesar/standalone.webp',
'JN-CR1':'/project-media/june/standalone-june.webp',
'JN-OP1':'/project-media/june/standalone-254.webp',
'ES-AP1':'/project-media/the-estates/apartment.webp',
'ES-VL1':'/project-media/the-estates/villa.webp',
'SEM-CL1':'/project-media/lmd/sem-cl1-r1.webp',
'SEM-CL2':'/project-media/lmd/sem-cl2-r1.webp',
'TS-AD1':'/project-media/lmd/ts-ad1-r1.webp',
'TS-AD2':'/project-media/lmd/ts-ad2-r1.webp',
'TS-CL3':'/project-media/lmd/ts-cl3-r1.webp',
'TS-AD4':'/project-media/lmd/ts-ad4-r1.webp',
'TS-OF5':'/project-media/lmd/ts-of5-r1.webp',
'STH-OF1':'/project-media/lmd/sth-of1-r1.webp',
'SES-AD1':'/project-media/lmd/ses-ad1-r1.webp',
'ON-RT1':'/project-media/lmd/on-rt1-r1.webp',
'ZY-SV1':'/project-media/lmd/zy-sv1-r1.webp',
'ZY-HV2':'/project-media/lmd/zy-hv2-r1.webp',
'ZY-TW3':'/project-media/lmd/zy-tw3-r1.webp',
'ZY-CH4':'/project-media/lmd/zy-ch4-r1.webp',
'ZY-CB5':'/project-media/lmd/zy-cb5-r1.webp',
'PX-AP1':'/project-media/hassan-allam/px-ap1-r1.webp',
'PX-AP2':'/project-media/hassan-allam/px-ap2-r1.webp',
'PX-AP3':'/project-media/hassan-allam/px-ap3-r1.webp',
'PX-AP4':'/project-media/hassan-allam/px-ap4-r1.webp',
'PX-AP5':'/project-media/hassan-allam/px-ap5-r1.webp',
'AP-OF1':'/project-media/hassan-allam/ap-of1-r1.webp',
'AP-OF2':'/project-media/hassan-allam/ap-of2-r1.webp',
'AP-OF3':'/project-media/hassan-allam/ap-of3-r1.webp',
'VL-TH1':'/project-media/hassan-allam/vl-th1-r1.webp',
'VL-TW2':'/project-media/hassan-allam/vl-tw2-r1.webp',
'VL-SV3':'/project-media/hassan-allam/vl-sv3-r1.webp',
'VL-SV4':'/project-media/hassan-allam/vl-sv4-r1.webp',
'PC-AP1':'/project-media/hassan-allam/pc-ap1-r1.webp',
'PC-AP2':'/project-media/hassan-allam/pc-ap2-r1.webp',
'PC-AP3':'/project-media/hassan-allam/pc-ap3-r1.webp',
'PC-AP4':'/project-media/hassan-allam/pc-ap4-r1.webp',
'PC-AP5':'/project-media/hassan-allam/pc-ap5-r1.webp',
'PC-AP6':'/project-media/hassan-allam/pc-ap6-r1.webp',
'PC-AP7':'/project-media/hassan-allam/pc-ap7-r1.webp',
'GL-AP1':'/project-media/hassan-allam/gl-ap1-r1.webp',
'GL-AP2':'/project-media/hassan-allam/gl-ap2-r1.webp',
'GL-AP3':'/project-media/hassan-allam/gl-ap3-r1.webp',
'SL-AP1':'/project-media/hassan-allam/sl-ap1-r1.webp',
'SL-AP2':'/project-media/hassan-allam/sl-ap2-r1.webp',
'SL-AP3':'/project-media/hassan-allam/sl-ap3-r1.webp',
'SL-AP4':'/project-media/hassan-allam/sl-ap4-r1.webp',
'SL-AP5':'/project-media/hassan-allam/sl-ap5-r1.webp',
'SL-AP6':'/project-media/hassan-allam/sl-ap6-r1.webp',
'SL-AP7':'/project-media/hassan-allam/sl-ap7-r1.webp',
'SL-TW8':'/project-media/hassan-allam/sl-tw8-r1.webp',
'SL-SV9':'/project-media/hassan-allam/sl-sv9-r1.webp',
'SL-TW10':'/project-media/hassan-allam/sl-tw10-r1.webp',
'SL-TW11':'/project-media/hassan-allam/sl-tw11-r1.webp',
'SL-SV12':'/project-media/hassan-allam/sl-sv12-r1.webp',
'SL-SV13':'/project-media/hassan-allam/sl-sv13-r1.webp',
'SL-SV14':'/project-media/hassan-allam/sl-sv14-r1.webp',
'SL-SV15':'/project-media/hassan-allam/sl-sv15-r1.webp',
};
var UNIT_GALLERY = {
'MS-MI-01':["/project-media/msquared/units/pent1-mist-0.webp", "/project-media/msquared/units/pent1-mist-01.webp", "/project-media/msquared/units/pent1-mist-02.webp", "/project-media/msquared/units/pent1-mist-03.webp", "/project-media/msquared/units/pent1-mist-04.webp"],
'MS-MI-02':["/project-media/msquared/units/pent2-mist-0.webp", "/project-media/msquared/units/pent2-mist-01.webp", "/project-media/msquared/units/pent2-mist-02.webp"],
'MS-MI-03':["/project-media/msquared/units/pent2-mist-0.webp", "/project-media/msquared/units/pent2-mist-01.webp", "/project-media/msquared/units/pent2-mist-02.webp"],
'MS-MI-04':["/project-media/msquared/units/pent2-mist-0.webp", "/project-media/msquared/units/pent2-mist-01.webp", "/project-media/msquared/units/pent2-mist-02.webp"],
'MS-MI-05':["/project-media/msquared/units/town1-0.webp", "/project-media/msquared/units/town1-01.webp", "/project-media/msquared/units/town1-02.webp"],
'MS-MI-06':["/project-media/msquared/units/town1-0.webp", "/project-media/msquared/units/town1-01.webp", "/project-media/msquared/units/town1-02.webp"],
'MS-3W-01':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-02':["/project-media/msquared/units/ap2-west-0.webp", "/project-media/msquared/units/ap2-west-01.webp", "/project-media/msquared/units/ap2-west-02.webp"],
'MS-3W-03':["/project-media/msquared/units/ap3-west-0.webp", "/project-media/msquared/units/ap3-west-01.webp"],
'MS-3W-04':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-05':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-06':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-07':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-08':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-09':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-10':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-11':["/project-media/msquared/units/ap1-west-0.webp", "/project-media/msquared/units/ap1-west-01.webp", "/project-media/msquared/units/ap1-west-02.webp"],
'MS-3W-12':["/project-media/msquared/units/thouse1-west-0.webp", "/project-media/msquared/units/thouse1-west-01.webp"],
'MS-3W-13':["/project-media/msquared/units/villa-west-0.webp", "/project-media/msquared/units/villa-west-01.webp"],
'MS-MA-01':["/project-media/msquared/units/chalet-1-masyaf-0.webp", "/project-media/msquared/units/chalet-1-masyaf-01.webp", "/project-media/msquared/units/chalet-1-masyaf-02.webp", "/project-media/msquared/units/chalet-1-masyaf-03.webp", "/project-media/msquared/units/chalet-1-masyaf-04.webp", "/project-media/msquared/units/chalet-1-masyaf-05.webp"],
'MS-MA-02':["/project-media/msquared/units/chalet-2-masyaf-0.webp", "/project-media/msquared/units/chalet-2-masyaf-01.webp", "/project-media/msquared/units/chalet-2-masyaf-02.webp", "/project-media/msquared/units/chalet-2-masyaf-03.webp"],
'MS-MA-03':["/project-media/msquared/units/lagoon-chalet1-masyaf-0.webp", "/project-media/msquared/units/lagoon-chalet1-masyaf-01.webp", "/project-media/msquared/units/lagoon-chalet1-masyaf-02.webp"],
'MS-MA-04':["/project-media/msquared/units/chalet3-masyaf-0.webp", "/project-media/msquared/units/chalet3-masyaf-01.webp", "/project-media/msquared/units/chalet3-masyaf-02.webp"],
'MS-MA-05':["/project-media/msquared/units/chalet4-masyaf-0.webp", "/project-media/msquared/units/chalet4-masyaf-01.webp", "/project-media/msquared/units/chalet4-masyaf-02.webp", "/project-media/msquared/units/chalet4-masyaf-03.webp", "/project-media/msquared/units/chalet4-masyaf-05.webp"],
'MS-MA-06':["/project-media/msquared/units/chalet5-masyaf-0.webp", "/project-media/msquared/units/chalet5-masyaf-01.webp", "/project-media/msquared/units/chalet5-masyaf-02.webp", "/project-media/msquared/units/chalet5-masyaf-03.webp", "/project-media/msquared/units/chalet5-masyaf-04.webp"],
'MS-MA-07':["/project-media/msquared/units/chalet6-masyaf-0.webp", "/project-media/msquared/units/chalet6-masyaf-01.webp", "/project-media/msquared/units/chalet6-masyaf-02.webp", "/project-media/msquared/units/chalet6-masyaf-03.webp", "/project-media/msquared/units/chalet6-masyaf-04.webp", "/project-media/msquared/units/chalet6-masyaf-05.webp"],
'MS-MA-08':["/project-media/msquared/units/chalet7-masyaf-0.webp", "/project-media/msquared/units/chalet7-masyaf-01.webp", "/project-media/msquared/units/chalet7-masyaf-02.webp", "/project-media/msquared/units/chalet7-masyaf-03.webp", "/project-media/msquared/units/chalet7-masyaf-04.webp"],
'MS-MA-09':["/project-media/msquared/units/pent1-masyaf-0.webp", "/project-media/msquared/units/pent1-masyaf-01.webp", "/project-media/msquared/units/pent1-masyaf-02.webp", "/project-media/msquared/units/chalet7-masyaf-05.webp"],
'MS-MA-10':["/project-media/msquared/units/chalet8-masyaf-0.webp", "/project-media/msquared/units/chalet8-masyaf-01.webp", "/project-media/msquared/units/chalet8-masyaf-02.webp", "/project-media/msquared/units/chalet8-masyaf-03.webp"],
'MS-MA-11':["/project-media/msquared/units/duplex-masyaf-0.webp", "/project-media/msquared/units/duplex-masyaf-01.webp", "/project-media/msquared/units/duplex-masyaf-02.webp", "/project-media/msquared/units/duplex-masyaf-03.webp", "/project-media/msquared/units/duplex-masyaf-04.webp"],
'MS-MA-12':["/project-media/msquared/units/town1-masyaf-0.webp", "/project-media/msquared/units/town1-masyaf-01.webp", "/project-media/msquared/units/town1-masyaf-02.webp", "/project-media/msquared/units/town1-masyaf-03.webp", "/project-media/msquared/units/town1-masyaf-04.webp"],
'MS-MA-13':["/project-media/msquared/units/town2-masyaf-0.webp", "/project-media/msquared/units/town2-masyaf-01.webp", "/project-media/msquared/units/town2-masyaf-02.webp", "/project-media/msquared/units/town2-masyaf-03.webp"],
'MS-MA-14':["/project-media/msquared/units/town3-masyaf-0.webp", "/project-media/msquared/units/town3-masyaf-01.webp"],
'MS-MA-15':["/project-media/msquared/units/villa-masyaf-0.webp", "/project-media/msquared/units/villa-masyaf-01.webp", "/project-media/msquared/units/villa-masyaf-02.webp", "/project-media/msquared/units/villa-masyaf-03.webp", "/project-media/msquared/units/villa-masyaf-04.webp"],
'MS-TR-01':["/project-media/msquared/units/ap1-trio-0.webp", "/project-media/msquared/units/ap1-trio-01.webp", "/project-media/msquared/units/ap1-trio-02.webp", "/project-media/msquared/units/ap1-trio-03.webp", "/project-media/msquared/units/ap1-trio-04.webp", "/project-media/msquared/units/ap1-trio-05.webp"],
'MS-TR-02':["/project-media/msquared/units/ap2-trio-0.webp", "/project-media/msquared/units/ap2-trio-01.webp", "/project-media/msquared/units/ap2-trio-02.webp", "/project-media/msquared/units/ap2-trio-03.webp", "/project-media/msquared/units/ap2-trio-04.webp", "/project-media/msquared/units/ap2-trio-05.webp"],
'MS-TR-03':["/project-media/msquared/units/ap3-trio-0.webp", "/project-media/msquared/units/ap3-trio-01.webp", "/project-media/msquared/units/ap3-trio-02.webp", "/project-media/msquared/units/ap3-trio-03.webp", "/project-media/msquared/units/ap3-trio-04.webp"],
'MS-TR-04':["/project-media/msquared/units/ap4-trio-0.webp", "/project-media/msquared/units/ap4-trio-01.webp", "/project-media/msquared/units/ap4-trio-02.webp", "/project-media/msquared/units/ap4-trio-03.webp", "/project-media/msquared/units/ap4-trio-04.webp"],
'MS-TR-05':["/project-media/msquared/units/ap5-trio-0.webp", "/project-media/msquared/units/ap5-trio-01.webp", "/project-media/msquared/units/ap5-trio-02.webp", "/project-media/msquared/units/ap5-trio-03.webp", "/project-media/msquared/units/ap5-trio-04.webp"],
'MS-TR-06':["/project-media/msquared/units/to1-trio-0.webp", "/project-media/msquared/units/to1-trio-01.webp", "/project-media/msquared/units/to1-trio-02.webp"],
'MS-TR-07':["/project-media/msquared/units/ap6-trio-0.webp", "/project-media/msquared/units/ap6-trio-01.webp", "/project-media/msquared/units/ap6-trio-02.webp", "/project-media/msquared/units/ap6-trio-03.webp"],
'MS-41-01':["/project-media/msquared/units/off1-41-0.webp", "/project-media/msquared/units/off1-41-01.webp", "/project-media/msquared/units/off1-41-02.webp"],
'MS-41-02':["/project-media/msquared/units/off2-41-0.webp", "/project-media/msquared/units/off2-41-01.webp", "/project-media/msquared/units/off2-41-03.webp", "/project-media/msquared/units/off2-41-02.webp"],
'MS-41-03':["/project-media/msquared/units/off3-41-0.webp", "/project-media/msquared/units/off3-41-01.webp", "/project-media/msquared/units/off3-41-02.webp", "/project-media/msquared/units/off3-41-03.webp"],
'MS-41-04':["/project-media/msquared/units/off4-41-0.webp", "/project-media/msquared/units/off4-41-01.webp", "/project-media/msquared/units/off4-41-02.webp"],
'MS-41-05':["/project-media/msquared/units/off1-41-0.webp", "/project-media/msquared/units/off1-41-01.webp", "/project-media/msquared/units/off1-41-02.webp"],
'OG-01':["/project-media/ogami/units/v1-ogami-0.webp", "/project-media/ogami/units/v1-ogami-01.webp", "/project-media/ogami/units/v1-ogami-02.webp", "/project-media/ogami/units/v1-ogami-03.webp", "/project-media/ogami/units/v1-ogami-04.webp"],
'OG-02':["/project-media/ogami/units/tw1-ogami-0.webp", "/project-media/ogami/units/tw1-ogami-01.webp", "/project-media/ogami/units/tw1-ogami-02.webp", "/project-media/ogami/units/tw1-ogami-03.webp"],
'OG-03':["/project-media/ogami/units/th2-ogami-0.webp"],
'OG-04':["/project-media/ogami/units/th3-ogami-0.webp", "/project-media/ogami/units/th3-ogami-01.webp", "/project-media/ogami/units/th3-ogami-02.webp"],
'OG-05':["/project-media/ogami/units/cha1-ogami-0.webp", "/project-media/ogami/units/cha1-ogami-01.webp", "/project-media/ogami/units/cha1-ogami-02.webp"],
'OG-06':["/project-media/ogami/units/ch2-ogami-0.webp", "/project-media/ogami/units/ch2-ogami-01.webp", "/project-media/ogami/units/ch2-ogami-02.webp"],
'OG-07':["/project-media/ogami/units/ch3-ogamo-0.webp", "/project-media/ogami/units/ch3-ogamo-01.webp", "/project-media/ogami/units/ch3-ogamo-02.webp", "/project-media/ogami/units/ch3-ogamo-03.webp"],
'OG-08':["/project-media/ogami/units/ap1-ogami-0.webp", "/project-media/ogami/units/ap1-ogami-01.webp", "/project-media/ogami/units/ap1-ogami-02.webp"],
'OG-09':["/project-media/ogami/units/ap1-ogami-0.webp", "/project-media/ogami/units/ap1-ogami-01.webp", "/project-media/ogami/units/ap1-ogami-02.webp"],
'OG-10':["/project-media/ogami/units/ap3-ogami-0.webp"],
'OR-ZE-01':["/project-media/ora/ap1-z-0.webp", "/project-media/ora/ap1-z-01.webp", "/project-media/ora/ap1-z-02.webp"],
'OR-ZE-02':["/project-media/ora/ap2-z-0.webp", "/project-media/ora/ap2-z-01.webp", "/project-media/ora/ap2-z-02.webp"],
'OR-ZE-03':["/project-media/ora/ap3-z-0.webp", "/project-media/ora/ap3-z-01.webp", "/project-media/ora/ap3-z-02.webp"],
'OR-ZE-04':["/project-media/ora/lo-z-0.webp", "/project-media/ora/lo-z-01.webp", "/project-media/ora/lo-z-02.webp"],
'OR-ZE-05':["/project-media/ora/stu-z-0.webp", "/project-media/ora/stu-z-01.webp", "/project-media/ora/stu-z-02.webp", "/project-media/ora/stu-z-03.webp"],
'OR-ZE-06':["/project-media/ora/ap1-ze-0.webp", "/project-media/ora/ap1-ze-01.webp", "/project-media/ora/ap1-ze-02.webp", "/project-media/ora/ap1-ze-03.webp"],
'OR-ZE-07':["/project-media/ora/ap2-ze-0.webp", "/project-media/ora/ap2-ze-01.webp", "/project-media/ora/ap2-ze-02.webp"],
'OR-ZE-08':["/project-media/ora/ap3-ze-0.webp", "/project-media/ora/ap3-ze-01.webp", "/project-media/ora/ap3-ze-02.webp", "/project-media/ora/ap3-ze-03.webp"],
'OR-EM-01':["/project-media/ora/du1-em-0.webp", "/project-media/ora/du1-em-01.webp", "/project-media/ora/du1-em-02.webp", "/project-media/ora/du1-em-03.webp"],
'OR-EM-02':["/project-media/ora/du2-em-0.webp", "/project-media/ora/du2-em-01.webp", "/project-media/ora/du2-em-02.webp"],
'OR-EM-03':["/project-media/ora/four-0.webp", "/project-media/ora/four-01.webp", "/project-media/ora/four-02.webp"],
'OR-EM-04':["/project-media/ora/to1-em-0.webp", "/project-media/ora/to1-em-01.webp", "/project-media/ora/to1-em-02.webp"],
'OR-EM-05':["/project-media/ora/to2-em-0.webp", "/project-media/ora/to2-em-01.webp", "/project-media/ora/to2-em-02.webp"],
'OR-EM-06':["/project-media/ora/st-em-0.webp", "/project-media/ora/st-em-01.webp", "/project-media/ora/st-em-02.webp"],
'OR-ZW-01':["/project-media/ora/st-zw-0.webp", "/project-media/ora/st-zw-01.webp", "/project-media/ora/st-zw-02.webp", "/project-media/ora/st-zw-03.webp"],
'OR-ZW-02':["/project-media/ora/ap1-zw-0.webp", "/project-media/ora/ap1-zw-03.webp", "/project-media/ora/ap1-zw-01.webp", "/project-media/ora/ap1-zw-02.webp"],
'OR-ZW-03':["/project-media/ora/ap3-zw-0.webp", "/project-media/ora/ap3-zw-01.webp", "/project-media/ora/ap3-zw-02.webp", "/project-media/ora/ap3-zw-03.webp"],
'OR-ZW-04':["/project-media/ora/ap4-zw-0.webp", "/project-media/ora/ap4-zw-01.webp", "/project-media/ora/ap4-zw-02.webp"],
'OR-ZW-05':["/project-media/ora/ap6-zw-0.webp", "/project-media/ora/ap6-zw-01.webp", "/project-media/ora/ap6-zw-02.webp", "/project-media/ora/ap6-zw-03.webp"],
'OR-ZW-06':["/project-media/ora/ap6-zw-01.webp", "/project-media/ora/ap6-zw-0.webp", "/project-media/ora/ap6-zw-02.webp", "/project-media/ora/ap6-zw-03.webp"],
'OR-ZW-07':["/project-media/ora/ap1-zw-0.webp", "/project-media/ora/ap1-zw-03.webp", "/project-media/ora/ap1-zw-01.webp", "/project-media/ora/ap1-zw-02.webp"],
'OR-SW-01':["/project-media/ora/v8-0.webp", "/project-media/ora/v8-01.webp"],
'OR-SW-02':["/project-media/ora/v7-0.webp", "/project-media/ora/v7-01.webp"],
'OR-SW-03':["/project-media/ora/v2-sw-0.webp", "/project-media/ora/v2-sw-01.webp", "/project-media/ora/v2-sw-02.webp", "/project-media/ora/v2-sw-03.webp"],
'OR-SW-04':["/project-media/ora/v3-sw-0.webp", "/project-media/ora/v3-sw-01.webp", "/project-media/ora/v3-sw-02.webp", "/project-media/ora/v3-sw-03.webp"],
'OR-SW-05':["/project-media/ora/v4-sw-0.webp", "/project-media/ora/v4-sw-01.webp", "/project-media/ora/v4-sw-02.webp", "/project-media/ora/v4-sw-03.webp"],
'OR-SW-06':["/project-media/ora/v5-sw-0.webp", "/project-media/ora/v5-sw-01.webp", "/project-media/ora/v5-sw-02.webp", "/project-media/ora/v5-sw-03.webp"],
'OR-SW-07':["/project-media/ora/th-sw-0.webp", "/project-media/ora/th-sw-01.webp", "/project-media/ora/th-sw-02.webp"],
'OR-SW-08':["/project-media/ora/tw-sw-0.webp", "/project-media/ora/tw-sw-01.webp", "/project-media/ora/tw-sw-02.webp"],
'OR-SW-09':["/project-media/ora/ap1-sw-0.webp", "/project-media/ora/ap1-sw-01.webp", "/project-media/ora/ap1-sw-02.webp", "/project-media/ora/ap1-sw-03.webp", "/project-media/ora/ap1-sw-04.webp"],
'OR-SW-10':["/project-media/ora/ap2-sw-0.webp", "/project-media/ora/ap2-sw-01.webp", "/project-media/ora/ap2-sw-02.webp"],
'OR-SW-11':["/project-media/ora/ap3-sw-0.webp", "/project-media/ora/ap3-sw-01.webp", "/project-media/ora/ap3-sw-03.webp", "/project-media/ora/ap3-sw-02.webp"],
'OR-SW-12':["/project-media/ora/ap4-sw-0.webp", "/project-media/ora/ap4-sw-01.webp", "/project-media/ora/ap4-sw-02.webp"],
'OR-SW-13':["/project-media/ora/ap5-sw-0.webp", "/project-media/ora/ap5-sw-01.webp", "/project-media/ora/ap5-sw-02.webp"],
'OR-SW-14':["/project-media/ora/ap3-sw-0.webp", "/project-media/ora/ap3-sw-01.webp", "/project-media/ora/ap3-sw-03.webp", "/project-media/ora/ap3-sw-02.webp"],
'OR-SW-15':["/project-media/ora/pen-sw-0.webp", "/project-media/ora/pen-sw-01.webp", "/project-media/ora/pen-sw-02.webp"],
'OR-SW-16':["/project-media/ora/pen2.webp", "/project-media/ora/pen2-0.webp", "/project-media/ora/pen2-01.webp"],
'OR-SE-01':["/project-media/ora/ap1-se-0.webp", "/project-media/ora/ap1-se-01.webp", "/project-media/ora/ap1-se-02.webp", "/project-media/ora/ap1-se-03.webp", "/project-media/ora/ap1-se-04.webp"],
'OR-SE-02':["/project-media/ora/ap2-se-0.webp", "/project-media/ora/ap2-se-01.webp", "/project-media/ora/ap2-se-02.webp", "/project-media/ora/ap2-se-03.webp", "/project-media/ora/ap2-se-04.webp"],
'OR-SE-03':["/project-media/ora/ap3-se-0.webp", "/project-media/ora/ap3-se-01.webp", "/project-media/ora/ap3-se-02.webp", "/project-media/ora/ap3-se-03.webp"],
'OR-SE-04':["/project-media/ora/tw-se-0.webp", "/project-media/ora/tw-se-01.webp", "/project-media/ora/tw-se-02.webp", "/project-media/ora/tw-se-03.webp"],
'OR-SE-05':["/project-media/ora/v-se-0.webp", "/project-media/ora/v-se-01.webp", "/project-media/ora/v-se-02.webp"],
'OR-CR-01':["/project-media/ora/ap1-cr-0.webp", "/project-media/ora/ap1-cr-01.webp", "/project-media/ora/ap1-cr-02.webp", "/project-media/ora/ap1-cr-03.webp", "/project-media/ora/ap1-cr-04.webp"],
'OR-CR-02':["/project-media/ora/ap1-cr-01.webp", "/project-media/ora/ap1-cr-02.webp", "/project-media/ora/ap1-cr-03.webp", "/project-media/ora/ap1-cr-04.webp", "/project-media/ora/ap1-cr-0.webp"],
'OR-CR-03':["/project-media/ora/ap1-cr-02.webp", "/project-media/ora/ap1-cr-03.webp", "/project-media/ora/ap1-cr-04.webp", "/project-media/ora/ap1-cr-0.webp", "/project-media/ora/ap1-cr-01.webp"],
'OR-CR-04':["/project-media/ora/ap3-cr-0.webp", "/project-media/ora/ap3-cr-01.webp", "/project-media/ora/ap3-cr-02.webp", "/project-media/ora/ap3-cr-03.webp"],
'OR-CR-05':["/project-media/ora/ap3-cr-01.webp", "/project-media/ora/ap3-cr-02.webp", "/project-media/ora/ap3-cr-03.webp", "/project-media/ora/ap3-cr-0.webp"],
'OR-CR-06':["/project-media/ora/ap3-cr-03.webp", "/project-media/ora/ap3-cr-0.webp", "/project-media/ora/ap3-cr-01.webp", "/project-media/ora/ap3-cr-02.webp"],
'OR-CR-07':["/project-media/ora/v1-cr-0.webp", "/project-media/ora/v1-cr-01.webp", "/project-media/ora/v1-cr-02.webp", "/project-media/ora/v1-cr-03.webp"],
'OR-CR-08':["/project-media/ora/v2-cr-0.webp", "/project-media/ora/v2-cr-01.webp", "/project-media/ora/v2-cr-02.webp", "/project-media/ora/v2-cr-03.webp", "/project-media/ora/v2-cr-04.webp"],
'OR-CR-09':["/project-media/ora/v1-cr-0.webp", "/project-media/ora/v1-cr-01.webp", "/project-media/ora/v1-cr-02.webp", "/project-media/ora/v1-cr-03.webp"],
'OR-ST-01':["/project-media/ora/ap1-ss-0.webp", "/project-media/ora/ap1-ss-01.webp", "/project-media/ora/ap1-ss-02.webp", "/project-media/ora/ap1-ss-03.webp", "/project-media/ora/ap1-ss-04.webp"],
'OR-ST-02':["/project-media/ora/ch2-ss-0.webp", "/project-media/ora/ch2-ss-01.webp", "/project-media/ora/ch2-ss-02.webp", "/project-media/ora/ch2-ss-03.webp"],
'OR-ST-03':["/project-media/ora/th1-ss-0.webp", "/project-media/ora/th1-ss-01.webp", "/project-media/ora/th1-ss-02.webp", "/project-media/ora/th1-ss-03.webp"],
'OR-ST-04':["/project-media/ora/th2-ss-0.webp", "/project-media/ora/th2-ss-01.webp", "/project-media/ora/th2-ss-02.webp", "/project-media/ora/th2-ss-03.webp", "/project-media/ora/th2-ss-04.webp"],
'OR-ST-05':["/project-media/ora/v1-ss-02.webp", "/project-media/ora/v1-ss-0.webp", "/project-media/ora/v1-ss-01.webp", "/project-media/ora/v1-ss-03.webp"],
'OR-ST-06':["/project-media/ora/v2-ss-0.webp", "/project-media/ora/v2-ss-01.webp", "/project-media/ora/v2-ss-02.webp", "/project-media/ora/v2-ss-03.webp", "/project-media/ora/v2-ss-04.webp"],
'OR-ST-07':["/project-media/ora/v3-ss-0.webp", "/project-media/ora/v3-ss-01.webp", "/project-media/ora/v3-ss-02.webp", "/project-media/ora/v3-ss-03.webp", "/project-media/ora/v3-ss-04.webp"],
'MB-V01':["/project-media/baghush/units/v1-0.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-V02':["/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-0.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-V03':["/project-media/baghush/units/v2-0.webp", "/project-media/baghush/units/v2-01.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-V04':["/project-media/baghush/units/v3-0.webp", "/project-media/baghush/units/v3-01.webp", "/project-media/baghush/units/v1-03.webp", "/project-media/baghush/units/v1-02.webp"],
'MB-CH01':["/project-media/baghush/units/ch1-0.webp", "/project-media/baghush/units/ch1-01.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-CH02':["/project-media/baghush/units/ch2-0.webp", "/project-media/baghush/units/ch2-01.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-CH03':["/project-media/baghush/units/ch2-01.webp", "/project-media/baghush/units/ch2-0.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-TW01':["/project-media/baghush/units/t-0.webp", "/project-media/baghush/units/t-01.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-CH04':["/project-media/baghush/units/ch4-0.webp", "/project-media/baghush/units/fp-ch5.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-CH05':["/project-media/baghush/units/ch5-0.webp", "/project-media/baghush/units/ch5-01.webp", "/project-media/baghush/units/v1-03.webp", "/project-media/baghush/units/v1-02.webp"],
'MB-CH06':["/project-media/baghush/units/ch7-0.webp", "/project-media/baghush/units/ch7-01.webp", "/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/v1-03.webp"],
'MB-CH07':["/project-media/baghush/units/v1-02.webp", "/project-media/baghush/units/ch7-0.webp", "/project-media/baghush/units/v1-03.webp"],
'BAB-SH01':["/project-media/beitalbahr/units/ch1-02-sh.webp", "/project-media/beitalbahr/units/ch1-03-sh.webp"],
'BAB-SH02':["/project-media/beitalbahr/units/ch2-0-sh.webp", "/project-media/beitalbahr/units/ch2-01-sh.webp", "/project-media/beitalbahr/units/ch2-02-sh.webp", "/project-media/beitalbahr/units/ch2-03-sh.webp"],
'BAB-SH03':["/project-media/beitalbahr/units/ch3-0-sh.webp", "/project-media/beitalbahr/units/ch3-01-sh.webp", "/project-media/beitalbahr/units/ch3-03-sh.webp"],
'BAB-SH04':["/project-media/beitalbahr/units/ch4-0-sh.webp", "/project-media/beitalbahr/units/ch4-01-sh.webp", "/project-media/beitalbahr/units/ch4-02-sh.webp", "/project-media/beitalbahr/units/ch4-03-sh.webp"],
'BAB-SH05':["/project-media/beitalbahr/units/ch5-0-sh.webp", "/project-media/beitalbahr/units/ch5-01-sh.webp", "/project-media/beitalbahr/units/ch5-02-sh.webp", "/project-media/beitalbahr/units/ch5-03-sh.webp", "/project-media/beitalbahr/units/ch5-04-sh.webp"],
'BAB-SH06':["/project-media/beitalbahr/units/ch6-0-sh.webp", "/project-media/beitalbahr/units/ch6-01-sh.webp", "/project-media/beitalbahr/units/ch6-02-sh.webp", "/project-media/beitalbahr/units/ch6-03-sh.webp", "/project-media/beitalbahr/units/ch6-04-sh.webp"],
'BAB-SH07':["/project-media/beitalbahr/units/ch7-0-sh.webp", "/project-media/beitalbahr/units/ch7-01-sh.webp", "/project-media/beitalbahr/units/ch7-02-sh.webp", "/project-media/beitalbahr/units/ch7-03-sh.webp"],
'BAB-SH08':["/project-media/beitalbahr/units/ch8-0-sh.webp", "/project-media/beitalbahr/units/ch8-01-sh.webp", "/project-media/beitalbahr/units/ch8-02-sh.webp", "/project-media/beitalbahr/units/ch8-03-sh.webp"],
'BAB-SH09':["/project-media/beitalbahr/units/ch9-0-sh.webp", "/project-media/beitalbahr/units/ch9-01-sh.webp", "/project-media/beitalbahr/units/ch9-02-sh.webp", "/project-media/beitalbahr/units/ch9-03-sh.webp"],
'BAB-SH10':["/project-media/beitalbahr/units/ch10-0-sh.webp", "/project-media/beitalbahr/units/ch10-01-sh.webp", "/project-media/beitalbahr/units/ch10-02-sh.webp", "/project-media/beitalbahr/units/ch10-03-sh.webp"],
'BAB-SH11':["/project-media/beitalbahr/units/ch11-0-sh.webp", "/project-media/beitalbahr/units/ch11-01-sh.webp", "/project-media/beitalbahr/units/ch11-02-sh.webp", "/project-media/beitalbahr/units/ch11-03-sh.webp", "/project-media/beitalbahr/units/ch11-04-sh.webp"],
'BAB-SH12':["/project-media/beitalbahr/units/ch12-0-sh.webp", "/project-media/beitalbahr/units/ch12-01-sh.webp", "/project-media/beitalbahr/units/ch12-02-sh.webp", "/project-media/beitalbahr/units/ch12-03-sh.webp"],
'BAB-SH13':["/project-media/beitalbahr/units/ch13-0-sh.webp", "/project-media/beitalbahr/units/ch13-01-sh.webp", "/project-media/beitalbahr/units/ch13-02-sh.webp", "/project-media/beitalbahr/units/ch13-03-sh.webp"],
'BAB-SH14':["/project-media/beitalbahr/units/ch14-0-sh.webp", "/project-media/beitalbahr/units/ch14-01-sh.webp", "/project-media/beitalbahr/units/ch14-02-sh.webp", "/project-media/beitalbahr/units/ch14-03-sh.webp"],
'BAB-SH15':["/project-media/beitalbahr/units/ch15-0-sh.webp", "/project-media/beitalbahr/units/ch15-01-sh.webp", "/project-media/beitalbahr/units/ch15-02-sh.webp"],
'BAB-SH16':["/project-media/beitalbahr/units/ch16-0-sh.webp", "/project-media/beitalbahr/units/ch16-01-sh.webp", "/project-media/beitalbahr/units/ch16-02-sh.webp", "/project-media/beitalbahr/units/ch16-03-sh.webp"],
'BAB-RO01':["/project-media/beitalbahr/units/v1-0-roo.webp", "/project-media/beitalbahr/units/v1-01-roo.webp", "/project-media/beitalbahr/units/v1-02-roo.webp", "/project-media/beitalbahr/units/v1-03-roo.webp", "/project-media/beitalbahr/units/v1-04-roo.webp", "/project-media/beitalbahr/units/v1-05-roo.webp"],
'BAB-RO02':["/project-media/beitalbahr/units/v2-0-roo.webp", "/project-media/beitalbahr/units/v2-01-roo.webp", "/project-media/beitalbahr/units/v2-02-roo.webp", "/project-media/beitalbahr/units/v2-03-roo.webp", "/project-media/beitalbahr/units/v2-04-roo.webp"],
'BAB-RO04':["/project-media/beitalbahr/units/ch2-0-roo.webp", "/project-media/beitalbahr/units/ch2-01-roo.webp", "/project-media/beitalbahr/units/ch1-03-roo.webp"],
'BAB-RO05':["/project-media/beitalbahr/units/tw1-0-roo-d2.webp", "/project-media/beitalbahr/units/tw1-01-roo-d3.webp", "/project-media/beitalbahr/units/tw1-02-roo-d2.webp", "/project-media/beitalbahr/units/tw1-03-roo-d2.webp"],
'BAB-RY01':["/project-media/beitalbahr/units/v1-0-rays.webp", "/project-media/beitalbahr/units/v1-01-rays.webp", "/project-media/beitalbahr/units/v1-02-rays.webp", "/project-media/beitalbahr/units/v1-03-rays.webp"],
'BAB-RY02':["/project-media/beitalbahr/units/tow1-0-rays.webp", "/project-media/beitalbahr/units/tow1-01-rays.webp"],
'BAB-RY03':["/project-media/beitalbahr/units/to2-0-rays.webp", "/project-media/beitalbahr/units/to2-01-rays.webp"],
'BAB-HS01':["/project-media/beitalbahr/units/v1-0-hills.webp", "/project-media/beitalbahr/units/v1-01-hills.webp", "/project-media/beitalbahr/units/v1-02-hills.webp", "/project-media/beitalbahr/units/v1-03-hills.webp", "/project-media/beitalbahr/units/v1-04-hills.webp"],
'BAB-HS02':["/project-media/beitalbahr/units/v2-0-hills.webp", "/project-media/beitalbahr/units/v2-01-hills.webp", "/project-media/beitalbahr/units/v2-02-hills.webp", "/project-media/beitalbahr/units/v2-03-hills.webp"],
'BAB-HL01':["/project-media/beitalbahr/units/V1-0-H.webp", "/project-media/beitalbahr/units/V1-01-H-d1.webp", "/project-media/beitalbahr/units/V1-02-H.webp", "/project-media/beitalbahr/units/V1-03-H.webp"],
'RM-VL01':["/project-media/ramla/units/v1-0.webp", "/project-media/ramla/units/v1-01.webp", "/project-media/ramla/units/v1-02.webp"],
'RM-TW01':["/project-media/ramla/units/tw2-0.webp", "/project-media/ramla/units/tw2-01.webp", "/project-media/ramla/units/tw2-02.webp", "/project-media/ramla/units/tw2-03.webp"],
'RM-DX01':["/project-media/ramla/units/du-02.webp", "/project-media/ramla/units/du-03.webp", "/project-media/ramla/units/du-04.webp"],
'RM-PH01':["/project-media/ramla/units/du-0.webp", "/project-media/ramla/units/du-01.webp"],
'RM-CH01':["/project-media/ramla/units/ch2-0.webp", "/project-media/ramla/units/ch2-01.webp", "/project-media/ramla/units/ch2-02.webp", "/project-media/ramla/units/ch2-03.webp"],
'RM-DX02':["/project-media/ramla/units/du1-0.webp", "/project-media/ramla/units/du1-01.webp", "/project-media/ramla/units/du1-02.webp", "/project-media/ramla/units/du1-03.webp", "/project-media/ramla/units/du1-04.webp"],
'RM-TW02':["/project-media/ramla/units/tw3-0.webp", "/project-media/ramla/units/tw3-01.webp", "/project-media/ramla/units/tw3-02.webp", "/project-media/ramla/units/tw3-04.webp"],
'RM-DX03':["/project-media/ramla/units/du2-0.webp", "/project-media/ramla/units/du2-01.webp", "/project-media/ramla/units/du2-02.webp", "/project-media/ramla/units/tw3-04.webp"],
'RM-CH02':["/project-media/ramla/units/ch3-0.webp", "/project-media/ramla/units/ch3-01.webp", "/project-media/ramla/units/ch3-02.webp", "/project-media/ramla/units/ch3-03.webp"],
'RM-CH03':["/project-media/ramla/units/ch4-0.webp", "/project-media/ramla/units/ch4-01.webp", "/project-media/ramla/units/ch4-02.webp", "/project-media/ramla/units/ch4-03.webp"],
'RM-DX04':["/project-media/ramla/units/DU3-0.webp", "/project-media/ramla/units/DU3-01.webp", "/project-media/ramla/units/DU3-03.webp", "/project-media/ramla/units/DU3-02.webp"],
'RM-TW03':["/project-media/ramla/units/tw4-0.webp", "/project-media/ramla/units/tw4-01.webp", "/project-media/ramla/units/tw4-02.webp", "/project-media/ramla/units/tw4-03.webp", "/project-media/ramla/units/tw4-04.webp"],
'RM-TH01':["/project-media/ramla/units/to-0.webp", "/project-media/ramla/units/to-01.webp", "/project-media/ramla/units/to-02.webp", "/project-media/ramla/units/to-03.webp", "/project-media/ramla/units/to-04.webp"],
'RM-CH04':["/project-media/ramla/units/ch5-0.webp", "/project-media/ramla/units/ch5-01.webp", "/project-media/ramla/units/ch5-02.webp", "/project-media/ramla/units/ch5-03.webp"],
'RM-VL02':["/project-media/ramla/units/v2-0.webp", "/project-media/ramla/units/v2-01.webp", "/project-media/ramla/units/v2-03.webp"],
'RM-TH02':["/project-media/ramla/units/to1-0.webp", "/project-media/ramla/units/to1-01.webp", "/project-media/ramla/units/to1-02.webp", "/project-media/ramla/units/to1-03.webp"],
'RM-VL03':["/project-media/ramla/units/v3-0.webp", "/project-media/ramla/units/v3-01.webp", "/project-media/ramla/units/v3-02.webp"],
'RM-VL04':["/project-media/ramla/units/v4-0.webp", "/project-media/ramla/units/v4-01.webp"],
'RM-CH05':["/project-media/ramla/units/v5-0.webp", "/project-media/ramla/units/v5-01.webp", "/project-media/ramla/units/v5-02.webp", "/project-media/ramla/units/v5-03.webp"],
'RM-CH06':["/project-media/ramla/units/ch6-0.webp", "/project-media/ramla/units/ch6-01.webp", "/project-media/ramla/units/ch4-02.webp", "/project-media/ramla/units/ch4-03.webp"],
'RM-CH07':["/project-media/ramla/units/ch7-0.webp", "/project-media/ramla/units/ch7-01.webp", "/project-media/ramla/units/ch7-02.webp", "/project-media/ramla/units/ch7-03.webp"],
'AE-AP01':["/project-media/ramla/units/ap-a-0.webp", "/project-media/ramla/units/ap-a-01.webp", "/project-media/ramla/units/ap-a-02.webp", "/project-media/ramla/units/ap-a-03.webp", "/project-media/ramla/units/ap-a-04.webp", "/project-media/ramla/units/ap-a-05.webp", "/project-media/ramla/units/ap-a-06.webp"],
'D5-A01':["/project-media/marakez/units/ap1-d-0.webp", "/project-media/marakez/units/ap1-d-01.webp", "/project-media/marakez/units/ap1-d-02.webp", "/project-media/marakez/units/ap1-d-03.webp", "/project-media/marakez/units/ap1-d-04.webp", "/project-media/marakez/units/ap1-d-05.webp"],
'D5-A02':["/project-media/marakez/units/ap2-d-0.webp", "/project-media/marakez/units/ap2-d-01.webp", "/project-media/marakez/units/ap2-d-02.webp", "/project-media/marakez/units/ap2-d-03.webp", "/project-media/marakez/units/ap2-d-04.webp", "/project-media/marakez/units/ap2-d-05.webp"],
'D5-A03':["/project-media/marakez/units/ap3-d-0.webp", "/project-media/marakez/units/ap3-d-01.webp", "/project-media/marakez/units/ap3-d-02.webp", "/project-media/marakez/units/ap3-d-03.webp"],
'D5-A04':["/project-media/marakez/units/ap4--d-0.webp", "/project-media/marakez/units/ap4--d-01.webp", "/project-media/marakez/units/ap4--d-02.webp", "/project-media/marakez/units/ap4--d-03.webp"],
'D5-A05':["/project-media/marakez/units/ap1-d-0.webp", "/project-media/marakez/units/ap1-d-01.webp", "/project-media/marakez/units/ap1-d-02.webp", "/project-media/marakez/units/ap1-d-03.webp", "/project-media/marakez/units/ap1-d-04.webp", "/project-media/marakez/units/ap1-d-05.webp"],
'D5-A06':["/project-media/marakez/units/ap5-d-0.webp", "/project-media/marakez/units/ap5-d-01.webp", "/project-media/marakez/units/ap5-d-02.webp", "/project-media/marakez/units/ap5-d-03.webp", "/project-media/marakez/units/ap5-d-04.webp"],
'D5-A07':["/project-media/marakez/units/ap7-d-0.webp", "/project-media/marakez/units/ap7-d-01.webp", "/project-media/marakez/units/ap7-d-02.webp", "/project-media/marakez/units/ap3-d-04.webp"],
'D5-A08':["/project-media/marakez/units/ap8-d-0.webp", "/project-media/marakez/units/ap8-d-01.webp", "/project-media/marakez/units/ap8-d-02.webp", "/project-media/marakez/units/ap8-d-03.webp", "/project-media/marakez/units/ap8-d-04.webp", "/project-media/marakez/units/ap8-d-05.webp"],
'D5-A09':["/project-media/marakez/units/ap9-d-0.webp", "/project-media/marakez/units/ap9-d-01.webp", "/project-media/marakez/units/ap9-d-02.webp", "/project-media/marakez/units/ap9-d-03.webp", "/project-media/marakez/units/ap9-d-04.webp"],
'D5-A10':["/project-media/marakez/units/ap10-d-0.webp", "/project-media/marakez/units/ap10-d-01.webp", "/project-media/marakez/units/ap10-d-02.webp", "/project-media/marakez/units/ap10-d-03.webp", "/project-media/marakez/units/ap10-d-04.webp"],
'D5-A11':["/project-media/marakez/units/ap11-d-0.webp", "/project-media/marakez/units/ap11-d-01.webp", "/project-media/marakez/units/ap11-d-02.webp", "/project-media/marakez/units/ap11-d-03.webp", "/project-media/marakez/units/ap11-d-04.webp"],
'D5-A12':["/project-media/marakez/units/ap12-d-0.webp", "/project-media/marakez/units/ap12-d-01.webp", "/project-media/marakez/units/ap12-d-02.webp", "/project-media/marakez/units/ap12-d-03.webp", "/project-media/marakez/units/ap12-d-04.webp"],
'D5-A13':["/project-media/marakez/units/ap13-d-0.webp", "/project-media/marakez/units/ap13-d-01.webp", "/project-media/marakez/units/ap13-d-02.webp", "/project-media/marakez/units/ap13-d-03.webp", "/project-media/marakez/units/ap13-d-04.webp"],
'D5-A14':["/project-media/marakez/units/ap14-d-0.webp", "/project-media/marakez/units/ap14-d-01.webp", "/project-media/marakez/units/ap14-d-02.webp", "/project-media/marakez/units/ap14-d-03.webp", "/project-media/marakez/units/ap13-d-05.webp"],
'D5-A15':["/project-media/marakez/units/ap15-d-0.webp", "/project-media/marakez/units/ap15-d-01.webp", "/project-media/marakez/units/ap15-d-02.webp", "/project-media/marakez/units/ap15-d-03.webp"],
'D5-A16':["/project-media/marakez/units/ap16-d-0.webp", "/project-media/marakez/units/ap16-d-01.webp", "/project-media/marakez/units/ap16-d-02.webp", "/project-media/marakez/units/ap16-d-03.webp"],
'D5-A17':["/project-media/marakez/units/ap17-d-0.webp", "/project-media/marakez/units/ap17-d-01.webp", "/project-media/marakez/units/ap17-d-02.webp", "/project-media/marakez/units/ap17-d-03.webp"],
'D5-A18':["/project-media/marakez/units/ap18-d-0.webp", "/project-media/marakez/units/ap18-d-01.webp", "/project-media/marakez/units/ap18-d-02.webp", "/project-media/marakez/units/ap18-d-03.webp", "/project-media/marakez/units/ap18-d-04.webp", "/project-media/marakez/units/ap18-d-05.webp"],
'D5-A19':["/project-media/marakez/units/ap19-d-0.webp", "/project-media/marakez/units/ap19-d-01.webp", "/project-media/marakez/units/ap19-d-02.webp", "/project-media/marakez/units/ap19-d-03.webp", "/project-media/marakez/units/ap19-d-04.webp"],
'D5-A20':["/project-media/marakez/units/ap13-d-0.webp", "/project-media/marakez/units/ap13-d-01.webp", "/project-media/marakez/units/ap13-d-02.webp", "/project-media/marakez/units/ap13-d-03.webp", "/project-media/marakez/units/ap13-d-04.webp"],
'D5-DX01':["/project-media/marakez/units/ap9-d-0.webp", "/project-media/marakez/units/ap9-d-01.webp", "/project-media/marakez/units/ap9-d-02.webp", "/project-media/marakez/units/ap9-d-03.webp", "/project-media/marakez/units/ap9-d-04.webp"],
'D5-OF01':["/project-media/marakez/units/of1-d-0.webp", "/project-media/marakez/units/of1-d-01.webp", "/project-media/marakez/units/of1-d-02.webp", "/project-media/marakez/units/of1-d-03.webp", "/project-media/marakez/units/of1-d-04.webp"],
'D5-OF02':["/project-media/marakez/units/of2-d-0.webp", "/project-media/marakez/units/of2-d-01.webp", "/project-media/marakez/units/of2-d-02.webp", "/project-media/marakez/units/of2-d-03.webp"],
'D5-OF03':["/project-media/marakez/units/of3-d-0.webp", "/project-media/marakez/units/of3-d-01.webp", "/project-media/marakez/units/of3-d-02.webp", "/project-media/marakez/units/of3-d-03.webp"],
'D5-OF04':["/project-media/marakez/units/of4-d-0.webp", "/project-media/marakez/units/of4-d-01.webp", "/project-media/marakez/units/of4-d-02.webp", "/project-media/marakez/units/of4-d-03.webp"],
'D5-OF05':["/project-media/marakez/units/of5-d-0.webp", "/project-media/marakez/units/of5-d-01.webp", "/project-media/marakez/units/of5-d-02.webp", "/project-media/marakez/units/of5-d-03.webp"],
'CW-TW01':["/project-media/marakez/units/tw-cr-0.webp", "/project-media/marakez/units/tw-cr-01.webp"],
'CW-V01':["/project-media/marakez/units/villa1-cr-0.webp", "/project-media/marakez/units/villa1-cr-01.webp"],
'CW-V03':["/project-media/marakez/units/v3-cr-0.webp", "/project-media/marakez/units/v3-cr-01.webp", "/project-media/marakez/units/v3-cr-02.webp", "/project-media/marakez/units/v3-cr-03.webp"],
'CW-V04':["/project-media/marakez/units/v4-cr-00.webp", "/project-media/marakez/units/v4-cr-002.webp", "/project-media/marakez/units/v4-cr-003.webp"],
'CW-A01':["/project-media/marakez/units/ap1-cr-00.webp", "/project-media/marakez/units/ap1-cr-001.webp", "/project-media/marakez/units/ap1-cr-002.webp", "/project-media/marakez/units/ap1-cr-003.webp"],
'CW-A02':["/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp", "/project-media/marakez/units/ap2-cr-02.webp", "/project-media/marakez/units/ap2-cr-03.webp"],
'CW-A04':["/project-media/marakez/units/ap5-cr-0.webp", "/project-media/marakez/units/ap5-cr-01.webp", "/project-media/marakez/units/ap2-cr-02.webp", "/project-media/marakez/units/ap2-cr-03.webp"],
'CW-A05':["/project-media/marakez/units/ap2-cr-03.webp", "/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp", "/project-media/marakez/units/ap2-cr-02.webp"],
'CW-A06':["/project-media/marakez/units/ap1-cr-002.webp", "/project-media/marakez/units/ap4-cr-0.webp", "/project-media/marakez/units/ap1-cr-00.webp", "/project-media/marakez/units/ap1-cr-001.webp"],
'CW-DX01':["/project-media/marakez/units/villa1-cr-0.webp", "/project-media/marakez/units/villa1-cr-01.webp"],
'CW-DX02':["/project-media/marakez/units/villa1-cr-0.webp", "/project-media/marakez/units/villa1-cr-01.webp"],
'CW-A07':["/project-media/marakez/units/ap1-cr-002.webp", "/project-media/marakez/units/ap2-cr-03.webp", "/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp"],
'CW-TW03':["/project-media/marakez/units/tw-cr-02.webp", "/project-media/marakez/units/tw-cr-01.webp", "/project-media/marakez/units/tw-cr-0.webp"],
'CW-TW04':["/project-media/marakez/units/tw-cr-0.webp", "/project-media/marakez/units/tw-cr-02.webp", "/project-media/marakez/units/tw-cr-01.webp"],
'CW-A08':["/project-media/marakez/units/ap8-cr-0.webp", "/project-media/marakez/units/ap8-cr-01.webp", "/project-media/marakez/units/ap8-cr-02.webp", "/project-media/marakez/units/ap8-cr-03.webp", "/project-media/marakez/units/ap2-cr-01.webp", "/project-media/marakez/units/ap2-cr-0.webp"],
'CW-V06':["/project-media/marakez/units/v3-cr-02.webp", "/project-media/marakez/units/v3-cr-03.webp"],
'CW-V07':["/project-media/marakez/units/v3-cr-03.webp", "/project-media/marakez/units/v3-cr-02.webp"],
'CW-A10':["/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp", "/project-media/marakez/units/ap2-cr-02.webp", "/project-media/marakez/units/ap2-cr-03.webp"],
'CW-A11':["/project-media/marakez/units/ap2-cr-02.webp", "/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp"],
'CW-A12':["/project-media/marakez/units/ap2-cr-0.webp", "/project-media/marakez/units/ap2-cr-01.webp", "/project-media/marakez/units/ap2-cr-02.webp", "/project-media/marakez/units/ap2-cr-03.webp"],
'SB-ST-01':["/project-media/sumou/st-0.webp", "/project-media/sumou/st-01.webp", "/project-media/sumou/st-02.webp", "/project-media/sumou/st-03.webp", "/project-media/sumou/st-04.webp", "/project-media/sumou/st-05.webp", "/project-media/sumou/st-06.webp"],
'SB-SP-01':["/project-media/sumou/st-05.webp", "/project-media/sumou/st-0.webp", "/project-media/sumou/st-01.webp", "/project-media/sumou/st-02.webp", "/project-media/sumou/st-03.webp", "/project-media/sumou/st-04.webp"],
'SB-AP-01':["/project-media/sumou/ap2-0.webp", "/project-media/sumou/ap2-01.webp", "/project-media/sumou/ap2-02.webp", "/project-media/sumou/ap2-03.webp", "/project-media/sumou/ap2-04.webp"],
'SB-AP-02':["/project-media/sumou/ap3-0.webp", "/project-media/sumou/ap2-03.webp", "/project-media/sumou/ap3-01.webp", "/project-media/sumou/ap2-01.webp", "/project-media/sumou/ap2-02.webp"],
'SB-AP-03':["/project-media/sumou/ap4-0.webp", "/project-media/sumou/ap3-0.webp", "/project-media/sumou/ap2-03.webp", "/project-media/sumou/ap3-01.webp", "/project-media/sumou/ap2-01.webp", "/project-media/sumou/ap2-02.webp"],
'SB-AP-04':["/project-media/sumou/ap5-0.webp", "/project-media/sumou/ap4-0.webp", "/project-media/sumou/ap3-0.webp", "/project-media/sumou/ap2-03.webp", "/project-media/sumou/ap3-01.webp", "/project-media/sumou/ap2-01.webp", "/project-media/sumou/ap2-02.webp"],
'SB-OF-01':["/project-media/sumou/of0.webp", "/project-media/sumou/of1.webp", "/project-media/sumou/of2.webp", "/project-media/sumou/of3.webp", "/project-media/sumou/of4.webp"],
'SB-OF-02':["/project-media/sumou/of2.webp", "/project-media/sumou/of1.webp", "/project-media/sumou/of0.webp", "/project-media/sumou/of3.webp", "/project-media/sumou/of4.webp"],
'MD-BP-01':["/project-media/modon/ap1-bp-03.webp", "/project-media/modon/ap1-bp-04.webp"],
'MD-BP-02':["/project-media/modon/ap2-bp-01.webp", "/project-media/modon/ap2-bp-02.webp", "/project-media/modon/ap2-bp-03.webp", "/project-media/modon/ap2-bp-04.webp", "/project-media/modon/ap2-bp-05.webp"],
'MD-BP-03':["/project-media/modon/ap3-bp-0.webp", "/project-media/modon/ap3-bp-01.webp", "/project-media/modon/ap3-bp-02.webp", "/project-media/modon/ap3-bp-03.webp", "/project-media/modon/ap3-bp-04.webp", "/project-media/modon/ap3-bp-05.webp"],
'MD-BPL-01':["/project-media/modon/ap1-bpl-0.webp", "/project-media/modon/ap1-bpl-01.webp", "/project-media/modon/ap1-bpl-04.webp", "/project-media/modon/ap1-bpl-05.webp"],
'MD-BPL-02':["/project-media/modon/ap2-bpl-0.webp", "/project-media/modon/ap2-bpl-01.webp", "/project-media/modon/ap2-bpl-02.webp", "/project-media/modon/ap2-bpl-03.webp", "/project-media/modon/ap2-bpl-04.webp"],
'MD-BPL-03':["/project-media/modon/ap3-bpl-0.webp", "/project-media/modon/ap3-bpl-01.webp", "/project-media/modon/ap3-bpl-02.webp", "/project-media/modon/ap3-bpl-03.webp", "/project-media/modon/ap3-bpl-04.webp", "/project-media/modon/ap3-bpl-05.webp", "/project-media/modon/ap3-bpl-06.webp"],
'MD-LH-01':["/project-media/modon/ap1-lh-0.webp", "/project-media/modon/ap1-lh-01.webp", "/project-media/modon/ap1-lh-02.webp", "/project-media/modon/ap1-lh-03.webp", "/project-media/modon/ap1-lh-04.webp", "/project-media/modon/ap1-lh-05.webp"],
'MD-LH-02':["/project-media/modon/ap2-lh-0.webp", "/project-media/modon/ap2-lh-01.webp", "/project-media/modon/ap2-lh-02.webp", "/project-media/modon/ap2-lh-03.webp", "/project-media/modon/ap2-lh-04.webp", "/project-media/modon/ap2-lh-05.webp"],
'MD-LH-03':["/project-media/modon/ap3-lh-0.webp", "/project-media/modon/ap3-lh-01.webp", "/project-media/modon/ap3-lh-02.webp", "/project-media/modon/ap3-lh-03.webp", "/project-media/modon/ap3-lh-04.webp", "/project-media/modon/ap3-lh-05.webp", "/project-media/modon/ap3-lh-06.webp"],
'MD-LHU-01':["/project-media/modon/ap1-lhu-0.webp", "/project-media/modon/ap1-lhu-01.webp", "/project-media/modon/ap1-lhu-02.webp", "/project-media/modon/ap1-lhu-03.webp", "/project-media/modon/ap1-lhu-04.webp", "/project-media/modon/ap1-lhu-05.webp", "/project-media/modon/ap1-lhu-06.webp"],
'MD-LHU-02':["/project-media/modon/ap2-lhu-0.webp", "/project-media/modon/ap2-lhu-01.webp", "/project-media/modon/ap2-lhu-02.webp", "/project-media/modon/ap2-lhu-03.webp", "/project-media/modon/ap2-lhu-04.webp", "/project-media/modon/ap2-lhu-05.webp"],
'MD-LHU-03':["/project-media/modon/ap3-lhu-0.webp", "/project-media/modon/ap3-lhu-01.webp", "/project-media/modon/ap3-lhu-02.webp", "/project-media/modon/ap3-lhu-03.webp", "/project-media/modon/ap3-lhu-04.webp", "/project-media/modon/ap3-lhu-05.webp", "/project-media/modon/ap3-lhu-06.webp"],
'MD-WD-01':["/project-media/modon/th-wd-01.webp", "/project-media/modon/th-wd-02.webp", "/project-media/modon/th-wd-03.webp", "/project-media/modon/th-wd-04.webp", "/project-media/modon/th-wd-05.webp", "/project-media/modon/th-wd-06.webp"],
'MD-WD-02':["/project-media/modon/th2-wd-0.webp", "/project-media/modon/th2-wd-01.webp", "/project-media/modon/th2-wd-02.webp", "/project-media/modon/th2-wd-03.webp", "/project-media/modon/th2-wd-04.webp", "/project-media/modon/th2-wd-05.webp"],
'MD-WD-03':["/project-media/modon/v-wd-0.webp", "/project-media/modon/v-wd-01.webp", "/project-media/modon/v-wd-02.webp", "/project-media/modon/v-wd-03.webp", "/project-media/modon/v-wd-04.webp"],
'MD-WD-04':["/project-media/modon/v2-wd-0.webp", "/project-media/modon/v2-wd-01.webp", "/project-media/modon/v2-wd-03.webp", "/project-media/modon/v2-wd-02.webp", "/project-media/modon/v2-wd-04.webp"],
'MD-WD-05':["/project-media/modon/v2-wd-0.webp", "/project-media/modon/v2-wd-01.webp", "/project-media/modon/v2-wd-03.webp", "/project-media/modon/v2-wd-04.webp", "/project-media/modon/v2-wd-02.webp"],
'MD-MON-01':["/project-media/modon/v1-mon-0.webp", "/project-media/modon/v1-mon-01.webp", "/project-media/modon/v1-mon-02.webp", "/project-media/modon/v1-mon-03.webp", "/project-media/modon/v1-mon-04.webp"],
'MD-MON-02':["/project-media/modon/v2-mon-0.webp", "/project-media/modon/v1-mon-01.webp", "/project-media/modon/v1-mon-02.webp", "/project-media/modon/v1-mon-03.webp", "/project-media/modon/v1-mon-04.webp", "/project-media/modon/v1-mon-0.webp"],
'MD-MON-03':["/project-media/modon/v1-mon-0.webp", "/project-media/modon/v1-mon-03.webp", "/project-media/modon/v1-mon-04.webp"],
'MD-BL-02':["/project-media/modon/ap2-bl-0.webp", "/project-media/modon/ap2-bl-01.webp", "/project-media/modon/ap2-bl-02.webp", "/project-media/modon/ap2-bl-03.webp"],
'MD-BL-03':["/project-media/modon/ap3-bl-0.webp", "/project-media/modon/ap3-bl-01.webp", "/project-media/modon/ap3-bl-03.webp", "/project-media/modon/ap3-bl-02.webp"],
'TM-IM-01':["/project-media/tatweer/tm-sv-il-0.webp", "/project-media/tatweer/tm-sv-il-01.webp", "/project-media/tatweer/tm-sv-il-02.webp"],
'TM-IM-02':["/project-media/tatweer/tm-st-il-0.webp", "/project-media/tatweer/tm-st-il-01.webp", "/project-media/tatweer/tm-st-il-02.webp"],
'TM-IM-03':["/project-media/tatweer/tm-ch1-il-0.webp", "/project-media/tatweer/tm-ch1-il-01.webp", "/project-media/tatweer/tm-ch1-il-02.webp"],
'TM-IM-04':["/project-media/tatweer/tm-ap1-il-0.webp", "/project-media/tatweer/tm-ap1-il-01.webp"],
'TM-IM-05':["/project-media/tatweer/tm-ap2-il-0.webp", "/project-media/tatweer/tm-ap2-il-01.webp", "/project-media/tatweer/tm-ap2-il-02.webp"],
'TM-IM-06':["/project-media/tatweer/tm-ch2-il-0.webp", "/project-media/tatweer/tm-ch2-il-01.webp", "/project-media/tatweer/tm-ch2-il-02.webp"],
'TM-IM-07':["/project-media/tatweer/tm-ch3-il-0.webp", "/project-media/tatweer/tm-ch3-il-01.webp", "/project-media/tatweer/tm-ch3-il-02.webp", "/project-media/tatweer/tm-ch3-il-03.webp"],
'TM-IM-08':["/project-media/tatweer/tm-ch4-il-0.webp", "/project-media/tatweer/tm-ch4-il-01.webp", "/project-media/tatweer/tm-ch4-il-02.webp"],
'TM-IM-09':["/project-media/tatweer/tm-lo-il-0.webp", "/project-media/tatweer/tm-lo-il-01.webp", "/project-media/tatweer/tm-lo-il-03.webp"],
'TM-IM-10':["/project-media/tatweer/tm-lo2-il-0.webp", "/project-media/tatweer/tm-lo2-il-01.webp", "/project-media/tatweer/tm-lo2-il-02.webp", "/project-media/tatweer/tm-lo2-il-03.webp"],
'TM-IM-11':["/project-media/tatweer/tm-lo3-il-0.webp", "/project-media/tatweer/tm-lo3-il-01.webp", "/project-media/tatweer/tm-lo3-il-02.webp"],
'TM-IM-12':["/project-media/tatweer/tm-th1-il-0.webp", "/project-media/tatweer/tm-th1-il-01.webp", "/project-media/tatweer/tm-th1-il-02.webp"],
'TM-IM-13':["/project-media/tatweer/tm-sv2-il-0.webp", "/project-media/tatweer/tm-sv2-il-01.webp", "/project-media/tatweer/tm-sv2-il-02.webp"],
'TM-IM-14':["/project-media/tatweer/tm-ca1-il-0.webp", "/project-media/tatweer/tm-ca1-il-01.webp", "/project-media/tatweer/tm-ca1-il-02.webp", "/project-media/tatweer/tm-ca1-il-03.webp"],
'TM-IM-15':["/project-media/tatweer/tm-ch5-il-0.webp", "/project-media/tatweer/tm-ch5-il-01.webp", "/project-media/tatweer/tm-ch5-il-02.webp", "/project-media/tatweer/tm-ch5-il-03.webp", "/project-media/tatweer/tm-ch5-il-04.webp"],
'TM-IM-16':["/project-media/tatweer/tm-ch6-il-0.webp", "/project-media/tatweer/tm-ch6-il-01.webp", "/project-media/tatweer/tm-ch6-il-02.webp", "/project-media/tatweer/tm-ch6-il-03.webp"],
'TM-IM-17':["/project-media/tatweer/tm-pe1-il-0.webp", "/project-media/tatweer/tm-pe1-il-01.webp", "/project-media/tatweer/tm-pe1-il-02.webp"],
'TM-IM-18':["/project-media/tatweer/tm-st2-il-01.webp", "/project-media/tatweer/mp-tm-st2-il.webp"],
'TM-IM-19':["/project-media/tatweer/tm-ap3-il-0.webp", "/project-media/tatweer/tm-ap3-il-01.webp", "/project-media/tatweer/tm-ap3-il-02.webp"],
'TM-IM-20':["/project-media/tatweer/tm-ap4-il-0.webp", "/project-media/tatweer/tm-ap4-il-01.webp"],
'TM-IM-21':["/project-media/tatweer/tm-ap5-il-0.webp", "/project-media/tatweer/tm-ap5-il-01.webp"],
'TM-BL-01':["/project-media/tatweer/ap1-bl-0.webp", "/project-media/tatweer/ap1-bl-01.webp", "/project-media/tatweer/ap1-bl-02.webp", "/project-media/tatweer/ap1-bl-03.webp"],
'TM-BL-02':["/project-media/tatweer/ap2-bl-0.webp", "/project-media/tatweer/ap2-bl-01.webp", "/project-media/tatweer/ap2-bl-02.webp"],
'TM-BL-03':["/project-media/tatweer/ap3-blo-0.webp", "/project-media/tatweer/ap3-blo-01.webp", "/project-media/tatweer/ap3-blo-02.webp"],
'TM-BL-04':["/project-media/tatweer/du-bl-0.webp", "/project-media/tatweer/du-bl-01.webp", "/project-media/tatweer/du-bl-02.webp"],
'TM-BL-05':["/project-media/tatweer/ap4-bl-0.webp", "/project-media/tatweer/ap4-bl-01.webp", "/project-media/tatweer/ap4-bl-02.webp"],
'TM-BL-06':["/project-media/tatweer/ap5-bl-0.webp", "/project-media/tatweer/ap5-bl-01.webp", "/project-media/tatweer/ap5-bl-02.webp"],
'TM-BL-07':["/project-media/tatweer/ap6-bl-0.webp", "/project-media/tatweer/ap6-bl-01.webp", "/project-media/tatweer/ap6-bl-02.webp"],
'TM-BL-08':["/project-media/tatweer/ap6-bl-01.webp", "/project-media/tatweer/ap6-bl-02.webp", "/project-media/tatweer/ap6-bl-0.webp"],
'TM-SL-01':["/project-media/tatweer/ch-sl-0.webp", "/project-media/tatweer/ch-sl-01.webp", "/project-media/tatweer/ch-sl-02.webp"],
'TM-SL-02':["/project-media/tatweer/ch-sl-0.webp", "/project-media/tatweer/ch-sl-01.webp", "/project-media/tatweer/ch-sl-02.webp"],
'TM-SL-03':["/project-media/tatweer/ch3-0.webp", "/project-media/tatweer/ch3-01.webp", "/project-media/tatweer/ch-sl-01.webp"],
'TM-SL-04':["/project-media/tatweer/sl-th-0.webp", "/project-media/tatweer/sl-th-01.webp", "/project-media/tatweer/sl-th-02.webp"],
'TM-SL-05':["/project-media/tatweer/sl-tw1-0.webp", "/project-media/tatweer/sl-tw1-01.webp"],
'TM-SL-06':["/project-media/tatweer/sl-v-0.webp", "/project-media/tatweer/sl-v-01.webp", "/project-media/tatweer/sl-v-02.webp"],
'TM-RV-01':["/project-media/tatweer/r-0.webp", "/project-media/tatweer/r-01.webp", "/project-media/tatweer/r-02.webp", "/project-media/tatweer/r-03.webp"],
'TM-RV-02':["/project-media/tatweer/r-ap2-0.webp", "/project-media/tatweer/r-ap2-01.webp"],
'TM-RV-03':["/project-media/tatweer/du-r-0.webp", "/project-media/tatweer/du-r-01.webp", "/project-media/tatweer/du-r-02.webp"],
'TM-RV-04':["/project-media/tatweer/sv-r-0.webp", "/project-media/tatweer/sv-r-01.webp", "/project-media/tatweer/sv-r-02.webp"],
'TM-RV-05':["/project-media/tatweer/sv-r-0.webp", "/project-media/tatweer/sv-r-01.webp", "/project-media/tatweer/sv-r-02.webp"],
'TM-FK-01':["/project-media/tatweer/f-0.webp", "/project-media/tatweer/f-01.webp", "/project-media/tatweer/f-02.webp"],
'TM-FK-02':["/project-media/tatweer/f2-0.webp", "/project-media/tatweer/f2-01.webp", "/project-media/tatweer/f2-02.webp"],
'TM-FK-03':["/project-media/tatweer/fouka-8.webp", "/project-media/tatweer/fouka-serviced-apt.webp"],
'TM-FK-04':["/project-media/tatweer/f4-0.webp", "/project-media/tatweer/f4-01.webp"],
'TM-DB-01':["/project-media/tatweer/ch-dp-0.webp", "/project-media/tatweer/ch-dp-01.webp", "/project-media/tatweer/ch-dp-02.webp"],
'TM-DB-02':["/project-media/tatweer/tw-dbay-0.webp", "/project-media/tatweer/tw-dbay-01.webp", "/project-media/tatweer/tw-dbay-02.webp"],
'TM-DB-03':["/project-media/tatweer/d-bay6.webp", "/project-media/tatweer/d-bay4.webp", "/project-media/tatweer/d-bay-villa.webp"],
'TM-SC-01':["/project-media/tatweer/th-sc-0.webp", "/project-media/tatweer/th-sc-01.webp", "/project-media/tatweer/th-sc-02.webp"],
'TM-SC-02':["/project-media/tatweer/tw-sc-0.webp", "/project-media/tatweer/tw-sc-01.webp", "/project-media/tatweer/tw-sc-02.webp"],
'TM-SC-03':["/project-media/tatweer/sv-sc-0.webp", "/project-media/tatweer/sv-sc-01.webp", "/project-media/tatweer/sv-sc-02.webp"],
'SEM-CL1':["/project-media/lmd/sem-cl1-r1.webp", "/project-media/lmd/sem-cl1-r2.webp"],
'SEM-CL2':["/project-media/lmd/sem-cl2-r1.webp", "/project-media/lmd/sem-cl2-r2.webp"],
'TS-AD1':["/project-media/lmd/ts-ad1-r1.webp", "/project-media/lmd/ts-ad1-r2.webp", "/project-media/lmd/ts-ad1-r3.webp"],
'TS-AD2':["/project-media/lmd/ts-ad2-r1.webp", "/project-media/lmd/ts-ad2-r2.webp", "/project-media/lmd/ts-ad2-r3.webp"],
'TS-CL3':["/project-media/lmd/ts-cl3-r1.webp", "/project-media/lmd/ts-cl3-r2.webp", "/project-media/lmd/ts-cl3-r3.webp"],
'TS-AD4':["/project-media/lmd/ts-ad4-r1.webp", "/project-media/lmd/ts-ad4-r2.webp", "/project-media/lmd/ts-ad4-r3.webp"],
'TS-OF5':["/project-media/lmd/ts-of5-r1.webp", "/project-media/lmd/ts-of5-r2.webp"],
'STH-OF1':["/project-media/lmd/sth-of1-r1.webp", "/project-media/lmd/sth-of1-r2.webp", "/project-media/lmd/sth-of1-r3.webp"],
'SES-AD1':["/project-media/lmd/ses-ad1-r1.webp", "/project-media/lmd/ses-ad1-r2.webp"],
'ON-RT1':["/project-media/lmd/on-rt1-r1.webp", "/project-media/lmd/on-rt1-r2.webp"],
'ZY-SV1':["/project-media/lmd/zy-sv1-r1.webp", "/project-media/lmd/zy-sv1-r2.webp", "/project-media/lmd/zy-sv1-r3.webp"],
'ZY-HV2':["/project-media/lmd/zy-hv2-r1.webp", "/project-media/lmd/zy-hv2-r2.webp"],
'ZY-TW3':["/project-media/lmd/zy-tw3-r1.webp", "/project-media/lmd/zy-tw3-r2.webp", "/project-media/lmd/zy-tw3-r3.webp"],
'ZY-CH4':["/project-media/lmd/zy-ch4-r1.webp", "/project-media/lmd/zy-ch4-r2.webp", "/project-media/lmd/zy-ch4-r3.webp"],
'ZY-CB5':["/project-media/lmd/zy-cb5-r1.webp", "/project-media/lmd/zy-cb5-r2.webp", "/project-media/lmd/zy-cb5-r3.webp"],
'PX-AP1':["/project-media/hassan-allam/px-ap1-r1.webp", "/project-media/hassan-allam/px-ap1-r2.webp", "/project-media/hassan-allam/px-ap1-r3.webp"],
'PX-AP2':["/project-media/hassan-allam/px-ap2-r1.webp", "/project-media/hassan-allam/px-ap2-r2.webp", "/project-media/hassan-allam/px-ap2-r3.webp"],
'PX-AP3':["/project-media/hassan-allam/px-ap3-r1.webp", "/project-media/hassan-allam/px-ap3-r2.webp", "/project-media/hassan-allam/px-ap3-r3.webp"],
'PX-AP4':["/project-media/hassan-allam/px-ap4-r1.webp", "/project-media/hassan-allam/px-ap4-r2.webp"],
'PX-AP5':["/project-media/hassan-allam/px-ap5-r1.webp", "/project-media/hassan-allam/px-ap5-r2.webp", "/project-media/hassan-allam/px-ap5-r3.webp"],
'AP-OF1':["/project-media/hassan-allam/ap-of1-r1.webp"],
'AP-OF2':["/project-media/hassan-allam/ap-of2-r1.webp"],
'AP-OF3':["/project-media/hassan-allam/ap-of3-r1.webp"],
'VL-TH1':["/project-media/hassan-allam/vl-th1-r1.webp", "/project-media/hassan-allam/vl-th1-r2.webp", "/project-media/hassan-allam/vl-th1-r3.webp"],
'VL-TW2':["/project-media/hassan-allam/vl-tw2-r1.webp", "/project-media/hassan-allam/vl-tw2-r2.webp"],
'VL-SV3':["/project-media/hassan-allam/vl-sv3-r1.webp", "/project-media/hassan-allam/vl-sv3-r2.webp"],
'VL-SV4':["/project-media/hassan-allam/vl-sv4-r1.webp", "/project-media/hassan-allam/vl-sv4-r2.webp", "/project-media/hassan-allam/vl-sv4-r3.webp", "/project-media/hassan-allam/vl-sv4-r4.webp"],
'PC-AP1':["/project-media/hassan-allam/pc-ap1-r1.webp", "/project-media/hassan-allam/pc-ap1-r2.webp", "/project-media/hassan-allam/pc-ap1-r3.webp"],
'PC-AP2':["/project-media/hassan-allam/pc-ap2-r1.webp", "/project-media/hassan-allam/pc-ap2-r2.webp", "/project-media/hassan-allam/pc-ap2-r3.webp"],
'PC-AP3':["/project-media/hassan-allam/pc-ap3-r1.webp", "/project-media/hassan-allam/pc-ap3-r2.webp"],
'PC-AP4':["/project-media/hassan-allam/pc-ap4-r1.webp", "/project-media/hassan-allam/pc-ap4-r2.webp", "/project-media/hassan-allam/pc-ap4-r3.webp"],
'PC-AP5':["/project-media/hassan-allam/pc-ap5-r1.webp", "/project-media/hassan-allam/pc-ap5-r2.webp"],
'PC-AP6':["/project-media/hassan-allam/pc-ap6-r1.webp", "/project-media/hassan-allam/pc-ap6-r2.webp"],
'PC-AP7':["/project-media/hassan-allam/pc-ap7-r1.webp", "/project-media/hassan-allam/pc-ap7-r2.webp"],
'GL-AP1':["/project-media/hassan-allam/gl-ap1-r1.webp", "/project-media/hassan-allam/gl-ap1-r2.webp", "/project-media/hassan-allam/gl-ap1-r3.webp"],
'GL-AP2':["/project-media/hassan-allam/gl-ap2-r1.webp", "/project-media/hassan-allam/gl-ap2-r2.webp", "/project-media/hassan-allam/gl-ap2-r3.webp"],
'GL-AP3':["/project-media/hassan-allam/gl-ap3-r1.webp", "/project-media/hassan-allam/gl-ap3-r2.webp", "/project-media/hassan-allam/gl-ap3-r3.webp"],
'SL-AP1':["/project-media/hassan-allam/sl-ap1-r1.webp", "/project-media/hassan-allam/sl-ap1-r2.webp", "/project-media/hassan-allam/sl-ap1-r3.webp"],
'SL-AP2':["/project-media/hassan-allam/sl-ap2-r1.webp", "/project-media/hassan-allam/sl-ap2-r2.webp", "/project-media/hassan-allam/sl-ap2-r3.webp"],
'SL-AP3':["/project-media/hassan-allam/sl-ap3-r1.webp", "/project-media/hassan-allam/sl-ap3-r2.webp", "/project-media/hassan-allam/sl-ap3-r3.webp"],
'SL-AP4':["/project-media/hassan-allam/sl-ap4-r1.webp", "/project-media/hassan-allam/sl-ap4-r2.webp", "/project-media/hassan-allam/sl-ap4-r3.webp", "/project-media/hassan-allam/sl-ap4-r4.webp"],
'SL-AP5':["/project-media/hassan-allam/sl-ap5-r1.webp", "/project-media/hassan-allam/sl-ap5-r2.webp", "/project-media/hassan-allam/sl-ap5-r3.webp", "/project-media/hassan-allam/sl-ap5-r4.webp"],
'SL-AP6':["/project-media/hassan-allam/sl-ap6-r1.webp", "/project-media/hassan-allam/sl-ap6-r2.webp", "/project-media/hassan-allam/sl-ap6-r3.webp", "/project-media/hassan-allam/sl-ap6-r4.webp"],
'SL-AP7':["/project-media/hassan-allam/sl-ap7-r1.webp", "/project-media/hassan-allam/sl-ap7-r2.webp", "/project-media/hassan-allam/sl-ap7-r3.webp"],
'SL-TW8':["/project-media/hassan-allam/sl-tw8-r1.webp", "/project-media/hassan-allam/sl-tw8-r2.webp", "/project-media/hassan-allam/sl-tw8-r3.webp", "/project-media/hassan-allam/sl-tw8-r4.webp", "/project-media/hassan-allam/sl-tw8-r5.webp"],
'SL-SV9':["/project-media/hassan-allam/sl-sv9-r1.webp", "/project-media/hassan-allam/sl-sv9-r2.webp", "/project-media/hassan-allam/sl-sv9-r3.webp"],
'SL-TW10':["/project-media/hassan-allam/sl-tw10-r1.webp", "/project-media/hassan-allam/sl-tw10-r2.webp", "/project-media/hassan-allam/sl-tw10-r3.webp"],
'SL-TW11':["/project-media/hassan-allam/sl-tw11-r1.webp", "/project-media/hassan-allam/sl-tw11-r2.webp", "/project-media/hassan-allam/sl-tw11-r3.webp"],
'SL-SV12':["/project-media/hassan-allam/sl-sv12-r1.webp", "/project-media/hassan-allam/sl-sv12-r2.webp"],
'SL-SV13':["/project-media/hassan-allam/sl-sv13-r1.webp", "/project-media/hassan-allam/sl-sv13-r2.webp", "/project-media/hassan-allam/sl-sv13-r3.webp", "/project-media/hassan-allam/sl-sv13-r4.webp"],
'SL-SV14':["/project-media/hassan-allam/sl-sv14-r1.webp", "/project-media/hassan-allam/sl-sv14-r2.webp", "/project-media/hassan-allam/sl-sv14-r3.webp"],
'SL-SV15':["/project-media/hassan-allam/sl-sv15-r1.webp", "/project-media/hassan-allam/sl-sv15-r2.webp"],
'CW-V05':["/project-media/marakez/units/v5-cr-0.webp", "/project-media/marakez/units/v4-cr-00.webp", "/project-media/marakez/units/v4-cr-001.webp", "/project-media/marakez/units/v4-cr-002.webp", "/project-media/marakez/units/v4-cr-003.webp"],
'CW-A03':["/project-media/marakez/units/ap4-cr-0.webp", "/project-media/marakez/units/ap1-cr-00.webp", "/project-media/marakez/units/ap1-cr-001.webp", "/project-media/marakez/units/ap1-cr-002.webp", "/project-media/marakez/units/ap1-cr-003.webp"],
'CW-A09':["/project-media/marakez/units/ap10-cr-0.webp", "/project-media/marakez/units/ap8-cr-01.webp", "/project-media/marakez/units/ap8-cr-02.webp", "/project-media/marakez/units/ap8-cr-03.webp", "/project-media/marakez/units/ap2-cr-01.webp"],
};
var LOC_BASE = '/project-media/locations/';
var AREA_IMAGES = {
newcairo:'newcairo.webp', capital:'capital.webp', sahel:'sahel.webp',
raselhekma:'raselhekma.webp', zayed:'zayed.webp',
elgouna:'elgouna.webp', somabay:'somabay.webp'
};
function areaImageSrc(key){ return (key && AREA_IMAGES[key]) ? (LOC_BASE+AREA_IMAGES[key]) : ''; }
var PLANS_BASE = '/project-media/plans/';
var UNIT_MASTERPLANS = {
'MS-MI-01':["/project-media/msquared/units/mp-mist.webp"],
'MS-MI-02':["/project-media/msquared/units/mp-mist.webp"],
'MS-MI-03':["/project-media/msquared/units/mp-mist.webp"],
'MS-MI-04':["/project-media/msquared/units/mp-mist.webp"],
'MS-MI-05':["/project-media/msquared/units/mp-mist.webp"],
'MS-MI-06':["/project-media/msquared/units/mp-mist.webp"],
'MS-3W-01':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-02':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-03':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-04':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-05':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-06':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-07':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-08':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-09':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-10':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-11':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-12':["/project-media/msquared/units/mp-31west.webp"],
'MS-3W-13':["/project-media/msquared/units/mp-31west.webp"],
'MS-MA-01':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-02':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-03':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-04':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-05':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-06':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-07':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-08':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-09':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-10':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-11':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-12':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-13':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-14':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-MA-15':["/project-media/msquared/units/mp-masyaf.webp"],
'MS-TR-01':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-02':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-03':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-04':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-05':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-06':["/project-media/msquared/units/mp-trio.webp"],
'MS-TR-07':["/project-media/msquared/units/mp-trio.webp"],
'MS-41-01':["/project-media/msquared/units/mp-41.webp"],
'MS-41-02':["/project-media/msquared/units/mp-41.webp"],
'MS-41-03':["/project-media/msquared/units/mp-41.webp"],
'MS-41-04':["/project-media/msquared/units/mp-41.webp"],
'MS-41-05':["/project-media/msquared/units/mp-41.webp"],
'OR-ZE-01':["/project-media/ora/mp-zed.webp"],
'OR-ZE-02':["/project-media/ora/mp-zed.webp"],
'OR-ZE-03':["/project-media/ora/mp-zed.webp"],
'OR-ZE-04':["/project-media/ora/mp-zed.webp"],
'OR-ZE-05':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-z2.webp"],
'OR-ZE-06':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-z2.webp"],
'OR-ZE-07':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-z2.webp"],
'OR-ZE-08':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-z2.webp"],
'OR-EM-01':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-EM-02':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-EM-03':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-EM-04':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-EM-05':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-EM-06':["/project-media/ora/mp-zed.webp", "/project-media/ora/mp-em.webp"],
'OR-ZW-01':["/project-media/ora/mp-zw.webp"],
'OR-ZW-02':["/project-media/ora/mp-zw.webp"],
'OR-ZW-03':["/project-media/ora/mp-zw.webp"],
'OR-ZW-04':["/project-media/ora/mp-zw.webp"],
'OR-ZW-05':["/project-media/ora/mp-zw.webp"],
'OR-ZW-06':["/project-media/ora/mp-zw.webp"],
'OR-ZW-07':["/project-media/ora/mp-zw.webp"],
'OR-SW-01':["/project-media/ora/fp-sw.webp"],
'OR-SW-02':["/project-media/ora/fp-sw.webp"],
'OR-SW-03':["/project-media/ora/fp-sw.webp"],
'OR-SW-04':["/project-media/ora/fp-sw.webp"],
'OR-SW-05':["/project-media/ora/fp-sw.webp"],
'OR-SW-06':["/project-media/ora/fp-sw.webp"],
'OR-SW-07':["/project-media/ora/fp-sw.webp"],
'OR-SW-08':["/project-media/ora/fp-sw.webp"],
'OR-SW-09':["/project-media/ora/mp-sw.webp"],
'OR-SW-10':["/project-media/ora/mp-sw.webp"],
'OR-SW-11':["/project-media/ora/mp-sw.webp"],
'OR-SW-12':["/project-media/ora/mp-sw.webp"],
'OR-SW-13':["/project-media/ora/mp-sw.webp"],
'OR-SW-14':["/project-media/ora/mp-sw.webp"],
'OR-SW-15':["/project-media/ora/mp-sw.webp"],
'OR-SW-16':["/project-media/ora/mp-sw.webp"],
'OR-SE-01':["/project-media/ora/mp-s-e.webp"],
'OR-SE-02':["/project-media/ora/mp-s-e.webp"],
'OR-SE-03':["/project-media/ora/mp-s-e.webp"],
'OR-SE-04':["/project-media/ora/mp-s-e.webp"],
'OR-SE-05':["/project-media/ora/mp-s-e.webp"],
'OR-CR-01':["/project-media/ora/mp-si.webp"],
'OR-CR-02':["/project-media/ora/mp-si.webp"],
'OR-CR-03':["/project-media/ora/mp-si.webp"],
'OR-CR-04':["/project-media/ora/mp-si.webp"],
'OR-CR-05':["/project-media/ora/mp-si.webp"],
'OR-CR-06':["/project-media/ora/mp-si.webp"],
'OR-CR-07':["/project-media/ora/mp-si.webp"],
'OR-CR-08':["/project-media/ora/mp-si.webp"],
'OR-CR-09':["/project-media/ora/mp-si.webp"],
'OR-ST-01':["/project-media/ora/mp-si.webp"],
'OR-ST-02':["/project-media/ora/mp-si.webp"],
'OR-ST-03':["/project-media/ora/mp-si.webp"],
'OR-ST-04':["/project-media/ora/mp-si.webp"],
'OR-ST-05':["/project-media/ora/mp-si.webp"],
'OR-ST-06':["/project-media/ora/mp-si.webp"],
'OR-ST-07':["/project-media/ora/mp-si.webp"],
'MB-V01':["/project-media/baghush/units/mp-m.webp"],
'MB-V02':["/project-media/baghush/units/mp-m.webp"],
'MB-V03':["/project-media/baghush/units/mp-m.webp"],
'MB-V04':["/project-media/baghush/units/mp-m.webp"],
'MB-CH01':["/project-media/baghush/units/mp-m.webp"],
'MB-CH02':["/project-media/baghush/units/mp-m.webp"],
'MB-CH03':["/project-media/baghush/units/mp-m.webp"],
'MB-TW01':["/project-media/baghush/units/mp-m.webp"],
'MB-CH04':["/project-media/baghush/units/mp-m.webp"],
'MB-CH05':["/project-media/baghush/units/mp-m.webp"],
'MB-CH06':["/project-media/baghush/units/mp-m.webp"],
'MB-CH07':["/project-media/baghush/units/mp-m.webp"],
'BAB-SH01':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH02':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH03':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH04':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH05':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH06':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH07':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH08':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH09':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH10':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH11':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH12':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH13':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH14':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH15':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-SH16':["/project-media/beitalbahr/units/mp-shores.webp"],
'BAB-RO01':["/project-media/beitalbahr/units/mp-roots.webp"],
'BAB-RO02':["/project-media/beitalbahr/units/mp-roots.webp"],
'BAB-RO03':["/project-media/beitalbahr/units/mp-roots.webp"],
'BAB-RO04':["/project-media/beitalbahr/units/mp-roots.webp"],
'BAB-RO05':["/project-media/beitalbahr/units/mp-roots.webp"],
'BAB-RY01':["/project-media/beitalbahr/units/mp-rays.webp"],
'BAB-RY02':["/project-media/beitalbahr/units/mp-rays.webp"],
'BAB-RY03':["/project-media/beitalbahr/units/mp-rays.webp"],
'BAB-HS01':["/project-media/beitalbahr/units/mp-hills.webp"],
'BAB-HS02':["/project-media/beitalbahr/units/mp-hills.webp"],
'BAB-HL01':["/project-media/beitalbahr/units/mp-h.webp"],
'RM-VL01':["/project-media/marakez/ramla-aerial.webp"],
'RM-TW01':["/project-media/marakez/ramla-aerial.webp"],
'RM-DX01':["/project-media/marakez/ramla-aerial.webp"],
'RM-PH01':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH01':["/project-media/marakez/ramla-aerial.webp"],
'RM-DX02':["/project-media/marakez/ramla-aerial.webp"],
'RM-TW02':["/project-media/marakez/ramla-aerial.webp"],
'RM-DX03':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH02':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH03':["/project-media/marakez/ramla-aerial.webp"],
'RM-DX04':["/project-media/marakez/ramla-aerial.webp"],
'RM-TW03':["/project-media/marakez/ramla-aerial.webp"],
'RM-TH01':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH04':["/project-media/marakez/ramla-aerial.webp"],
'RM-VL02':["/project-media/marakez/ramla-aerial.webp"],
'RM-TH02':["/project-media/marakez/ramla-aerial.webp"],
'RM-VL03':["/project-media/marakez/ramla-aerial.webp"],
'RM-VL04':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH05':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH06':["/project-media/marakez/ramla-aerial.webp"],
'RM-CH07':["/project-media/marakez/ramla-aerial.webp"],
'AE-AP01':["/project-media/ramla/units/mp-a.webp"],
'D5-A01':["/project-media/marakez/units/mp-ap-0.webp"],
'D5-A02':["/project-media/marakez/units/mp-ap2.webp"],
'D5-A03':["/project-media/marakez/units/mp-ap2.webp"],
'D5-A04':["/project-media/marakez/units/mp-ap4.webp"],
'D5-A05':["/project-media/marakez/units/mp-ap2.webp"],
'D5-A06':["/project-media/marakez/units/mp-ap-0.webp"],
'D5-A07':["/project-media/marakez/units/mp-ap7.webp"],
'D5-A08':["/project-media/marakez/units/mp-d.webp"],
'D5-A09':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A10':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A11':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A12':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A13':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A14':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A15':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A16':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A17':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A18':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A19':["/project-media/marakez/units/mp-ap9.webp"],
'D5-A20':["/project-media/marakez/units/mp-ap9.webp"],
'D5-DX01':["/project-media/marakez/units/mp-ap9.webp"],
'D5-OF01':["/project-media/marakez/units/mp-of-d.webp"],
'D5-OF02':["/project-media/marakez/units/mp-of2.webp"],
'D5-OF03':["/project-media/marakez/units/mp-of2.webp"],
'D5-OF04':["/project-media/marakez/units/mp-of2.webp"],
'D5-OF05':["/project-media/marakez/units/mp-of2.webp"],
'CW-TW01':["/project-media/marakez/units/mp-cr.webp"],
'CW-V01':["/project-media/marakez/units/mp-cr.webp"],
'CW-V03':["/project-media/marakez/units/mp-cr.webp"],
'CW-V04':["/project-media/marakez/units/mp-cr.webp"],
'CW-V05':["/project-media/marakez/units/mp-cr.webp"],
'CW-A01':["/project-media/marakez/units/mp-cr.webp"],
'CW-A02':["/project-media/marakez/units/mp-cr.webp"],
'CW-A03':["/project-media/marakez/units/mp-cr.webp"],
'CW-A04':["/project-media/marakez/units/mp-cr.webp"],
'CW-A05':["/project-media/marakez/units/mp-cr.webp"],
'CW-A06':["/project-media/marakez/units/mp-cr.webp"],
'CW-DX01':["/project-media/marakez/units/mp-cr.webp"],
'CW-DX02':["/project-media/marakez/units/mp-cr.webp"],
'CW-A07':["/project-media/marakez/units/mp-cr.webp"],
'CW-TW03':["/project-media/marakez/units/mp-cr.webp"],
'CW-TW04':["/project-media/marakez/units/mp-cr.webp"],
'CW-A08':["/project-media/marakez/units/mp-cr.webp"],
'CW-A09':["/project-media/marakez/units/mp-cr.webp"],
'CW-TH01':["/project-media/marakez/units/mp-cr.webp"],
'CW-V06':["/project-media/marakez/units/mp-cr.webp"],
'CW-V07':["/project-media/marakez/units/mp-cr.webp"],
'CW-A10':["/project-media/marakez/units/mp-cr.webp"],
'CW-A11':["/project-media/marakez/units/mp-cr.webp"],
'CW-A12':["/project-media/marakez/units/mp-cr.webp"],
'SB-ST-01':["/project-media/sumou/mp-s.webp"],
'SB-SP-01':["/project-media/sumou/mp-s.webp"],
'SB-AP-01':["/project-media/sumou/mp-s.webp"],
'SB-AP-02':["/project-media/sumou/mp-s.webp"],
'SB-AP-03':["/project-media/sumou/mp-s.webp"],
'SB-AP-04':["/project-media/sumou/mp-s.webp"],
'SB-OF-01':["/project-media/sumou/mp-s.webp"],
'SB-OF-02':["/project-media/sumou/mp-s.webp"],
'MD-BP-01':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-BP-02':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-BP-03':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-BPL-01':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-BPL-02':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-BPL-03':["/project-media/modon/mp-ap1-bp-0.webp"],
'MD-LH-01':["/project-media/modon/mp-lh.webp"],
'MD-LH-02':["/project-media/modon/mp-lh.webp"],
'MD-LH-03':["/project-media/modon/mp-lh.webp"],
'MD-LHU-01':["/project-media/modon/mp-lh.webp"],
'MD-LHU-02':["/project-media/modon/mp-lh.webp"],
'MD-LHU-03':["/project-media/modon/mp-lh.webp"],
'MD-WD-01':["/project-media/modon/mp-wd.webp"],
'MD-WD-02':["/project-media/modon/mp-wd.webp"],
'MD-WD-03':["/project-media/modon/mp-wd.webp"],
'MD-WD-04':["/project-media/modon/mp-wd.webp"],
'MD-WD-05':["/project-media/modon/mp-wd.webp"],
'MD-MON-01':["/project-media/modon/mp-mon.webp"],
'MD-MON-02':["/project-media/modon/mp-mon.webp"],
'MD-MON-03':["/project-media/modon/mp-mon.webp"],
'MD-BL-01':["/project-media/modon/mp-ap1-bl.webp"],
'MD-BL-02':["/project-media/modon/mp-ap1-bl.webp"],
'MD-BL-03':["/project-media/modon/mp-ap1-bl.webp"],
'TM-IM-01':["/project-media/tatweer/mp-tm-sv-il.webp"],
'TM-IM-02':["/project-media/tatweer/mp-st-sv-il.webp"],
'TM-IM-03':["/project-media/tatweer/mp-tm-ch1-il.webp"],
'TM-IM-04':["/project-media/tatweer/mp-tm-ap1-il.webp"],
'TM-IM-05':["/project-media/tatweer/mp-ap2-il-tm.webp"],
'TM-IM-06':["/project-media/tatweer/mp-tm-ch2-il.webp"],
'TM-IM-07':["/project-media/tatweer/mp-tm-ch3-il.webp"],
'TM-IM-08':["/project-media/tatweer/mp-tm-ch4-il.webp"],
'TM-IM-09':["/project-media/tatweer/mp-tm-lo-il.webp"],
'TM-IM-10':["/project-media/tatweer/mp-lo2-tm-il.webp"],
'TM-IM-11':["/project-media/tatweer/mp-lo3-tm-il.webp"],
'TM-IM-12':["/project-media/tatweer/mp-tm-th1-il.webp"],
'TM-IM-13':["/project-media/tatweer/mp-tm-sv2-il.webp"],
'TM-IM-14':["/project-media/tatweer/mp-tm-ca1-il.webp"],
'TM-IM-15':["/project-media/tatweer/mp-tm-ch5-il.webp", "/project-media/tatweer/mp-tm-ch5-il-copy.webp", "/project-media/tatweer/mp-tm-ch5-il-copy-copy.webp"],
'TM-IM-16':["/project-media/tatweer/mp-tm-ch5-il-copy.webp", "/project-media/tatweer/mp-tm-ch5-il-copy-copy.webp"],
'TM-IM-17':["/project-media/tatweer/mp-tm-ch5-il-copy-copy.webp"],
'TM-IM-18':["/project-media/tatweer/mp-tm-st2-il.webp"],
'TM-BL-01':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-02':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-03':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-04':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-05':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-06':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-07':["/project-media/tatweer/mp-ap-b.webp"],
'TM-BL-08':["/project-media/tatweer/mp-ap-b.webp"],
'TM-SL-01':["/project-media/tatweer/open-salt-scape-masterplan.webp"],
'TM-SL-02':["/project-media/tatweer/open-salt-scape-masterplan.webp"],
'TM-SL-03':["/project-media/tatweer/open-salt-scape-masterplan.webp"],
'TM-SL-04':["/project-media/tatweer/mp-sl-th.webp"],
'TM-SL-05':["/project-media/tatweer/mp-sl-th.webp"],
'TM-SL-06':["/project-media/tatweer/mp-sl-th.webp"],
'TM-RV-01':["/project-media/tatweer/mp-ap-r.webp"],
'TM-RV-02':["/project-media/tatweer/mp-ap-r.webp"],
'TM-RV-03':["/project-media/tatweer/mp-ap-r.webp"],
'TM-RV-04':["/project-media/tatweer/mp-ap-r.webp"],
'TM-RV-05':["/project-media/tatweer/mp-ap-r.webp"],
'TM-FK-01':["/project-media/tatweer/mp-f.webp"],
'TM-FK-02':["/project-media/tatweer/mp-f.webp"],
'TM-FK-03':["/project-media/tatweer/mp-f.webp"],
'TM-FK-04':["/project-media/tatweer/mp-f.webp"],
'TM-DB-01':["/project-media/tatweer/mp-dbay.webp"],
'TM-DB-02':["/project-media/tatweer/mp-dbay.webp"],
'TM-DB-03':["/project-media/tatweer/mp-dbay.webp"],
'TM-SC-01':["/project-media/tatweer/mp-scene.webp"],
'TM-SC-02':["/project-media/tatweer/mp-scene.webp"],
'TM-SC-03':["/project-media/tatweer/mp-scene.webp"],
'JN-CR1':["mp-JN-CR1.webp"],
'JN-OP1':["mp-JN-OP1.webp"],
'OG-01':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-02':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-03':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-04':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-05':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-06':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-07':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-08':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-09':["/project-media/ogami/units/ogami-masterplan.webp"],
'OG-10':["/project-media/ogami/units/ogami-masterplan.webp"],
'CS-TW1':["mp-CS-TW1.webp"],
'AL-V03':["mp-AL-V03.webp"],
'SEM-CL1':["/project-media/lmd/sem-cl1-mp1.webp"],
'SEM-CL2':["/project-media/lmd/sem-cl2-mp1.webp"],
'TS-AD1':["/project-media/lmd/ts-ad1-mp1.webp"],
'TS-AD2':["/project-media/lmd/ts-ad2-mp1.webp"],
'TS-CL3':["/project-media/lmd/ts-cl3-mp1.webp"],
'TS-AD4':["/project-media/lmd/ts-ad4-mp1.webp"],
'TS-OF5':["/project-media/lmd/ts-of5-mp1.webp"],
'STH-OF1':["/project-media/lmd/sth-of1-mp1.webp"],
'SES-AD1':["/project-media/lmd/ses-ad1-mp1.webp"],
'ON-RT1':["/project-media/lmd/on-rt1-mp1.webp"],
'ZY-SV1':["/project-media/lmd/zy-sv1-mp1.webp"],
'ZY-HV2':["/project-media/lmd/zy-hv2-mp1.webp"],
'ZY-TW3':["/project-media/lmd/zy-tw3-mp1.webp"],
'ZY-CH4':["/project-media/lmd/zy-ch4-mp1.webp"],
'ZY-CB5':["/project-media/lmd/zy-cb5-mp1.webp"],
'PX-AP1':["/project-media/hassan-allam/px-ap1-mp1.webp"],
'PX-AP2':["/project-media/hassan-allam/px-ap2-mp1.webp"],
'PX-AP3':["/project-media/hassan-allam/px-ap3-mp1.webp"],
'PX-AP4':["/project-media/hassan-allam/px-ap4-mp1.webp"],
'PX-AP5':["/project-media/hassan-allam/px-ap5-mp1.webp"],
'AP-OF1':["/project-media/hassan-allam/ap-of1-mp1.webp"],
'AP-OF2':["/project-media/hassan-allam/ap-of2-mp1.webp"],
'AP-OF3':["/project-media/hassan-allam/ap-of3-mp1.webp"],
'VL-TH1':["/project-media/hassan-allam/vl-th1-mp1.webp"],
'VL-TW2':["/project-media/hassan-allam/vl-tw2-mp1.webp"],
'VL-SV3':["/project-media/hassan-allam/vl-sv3-mp1.webp"],
'VL-SV4':["/project-media/hassan-allam/vl-sv4-mp1.webp"],
'PC-AP1':["/project-media/hassan-allam/pc-ap1-mp1.webp"],
'PC-AP2':["/project-media/hassan-allam/pc-ap2-mp1.webp"],
'PC-AP3':["/project-media/hassan-allam/pc-ap3-mp1.webp"],
'PC-AP4':["/project-media/hassan-allam/pc-ap4-mp1.webp"],
'PC-AP5':["/project-media/hassan-allam/pc-ap5-mp1.webp"],
'PC-AP6':["/project-media/hassan-allam/pc-ap6-mp1.webp"],
'PC-AP7':["/project-media/hassan-allam/pc-ap7-mp1.webp"],
'GL-AP1':["/project-media/hassan-allam/gl-ap1-mp1.webp"],
'GL-AP2':["/project-media/hassan-allam/gl-ap2-mp1.webp"],
'GL-AP3':["/project-media/hassan-allam/gl-ap3-mp1.webp"],
'SL-AP1':["/project-media/hassan-allam/sl-ap1-mp1.webp"],
'SL-AP2':["/project-media/hassan-allam/sl-ap2-mp1.webp"],
'SL-AP3':["/project-media/hassan-allam/sl-ap3-mp1.webp"],
'SL-AP4':["/project-media/hassan-allam/sl-ap4-mp1.webp"],
'SL-AP5':["/project-media/hassan-allam/sl-ap5-mp1.webp"],
'SL-AP6':["/project-media/hassan-allam/sl-ap6-mp1.webp"],
'SL-AP7':["/project-media/hassan-allam/sl-ap7-mp1.webp"],
'SL-TW8':["/project-media/hassan-allam/sl-tw8-mp1.webp"],
'SL-SV9':["/project-media/hassan-allam/sl-sv9-mp1.webp"],
'SL-TW10':["/project-media/hassan-allam/sl-tw10-mp1.webp"],
'SL-TW11':["/project-media/hassan-allam/sl-tw11-mp1.webp"],
'SL-SV12':["/project-media/hassan-allam/sl-sv12-mp1.webp"],
'SL-SV13':["/project-media/hassan-allam/sl-sv13-mp1.webp"],
'SL-SV14':["/project-media/hassan-allam/sl-sv14-mp1.webp"],
'SL-SV15':["/project-media/hassan-allam/sl-sv15-mp1.webp"],
};
var UNIT_FLOORPLANS = {
'MS-MI-01':["/project-media/msquared/units/fp-pent1-mist.webp"],
'MS-MI-02':["/project-media/msquared/units/fp-pent2-mist.webp"],
'MS-MI-03':["/project-media/msquared/units/fp-pent3-mist.webp"],
'MS-MI-04':["/project-media/msquared/units/fp-pent4-mist.webp"],
'MS-MI-05':["/project-media/msquared/units/fp-th1.webp", "/project-media/msquared/units/fp-th2.webp"],
'MS-MI-06':["/project-media/msquared/units/fp-th2-b.webp", "/project-media/msquared/units/fp-th20.webp"],
'MS-3W-01':["/project-media/msquared/units/fp-ap1-west.webp"],
'MS-3W-02':["/project-media/msquared/units/fp-ap2-west.webp"],
'MS-3W-03':["/project-media/msquared/units/fp-ap3-west.webp"],
'MS-3W-04':["/project-media/msquared/units/fp-ap4-west.webp"],
'MS-3W-05':["/project-media/msquared/units/fp-ap5-west.webp"],
'MS-3W-06':["/project-media/msquared/units/fp-ap6-west-0.webp", "/project-media/msquared/units/fp-ap6-west-01.webp", "/project-media/msquared/units/fp-ap6-west-02.webp"],
'MS-3W-07':["/project-media/msquared/units/fp-ap7-west.webp"],
'MS-3W-08':["/project-media/msquared/units/fp-ap8-west.webp", "/project-media/msquared/units/fp-ap8-west-0.webp"],
'MS-3W-09':["/project-media/msquared/units/fp-ap9-west-0.webp", "/project-media/msquared/units/fp-ap9-west-01.webp"],
'MS-3W-10':["/project-media/msquared/units/fp-ap10-west.webp"],
'MS-3W-11':["/project-media/msquared/units/fp-ap10-west-0.webp"],
'MS-3W-12':["/project-media/msquared/units/fp-thouse1-west.webp", "/project-media/msquared/units/fp-thouse1-west1.webp", "/project-media/msquared/units/fp-thouse1-west2.webp"],
'MS-3W-13':["/project-media/msquared/units/fp-v-west-0.webp", "/project-media/msquared/units/fp-v-west-01.webp", "/project-media/msquared/units/fp-v-west-02.webp"],
'MS-MA-01':["/project-media/msquared/units/fp-chalet-masyaf-0.webp", "/project-media/msquared/units/fp-chalet-masyaf-01.webp"],
'MS-MA-02':["/project-media/msquared/units/fp-chalet-2-masyaf.webp"],
'MS-MA-03':["/project-media/msquared/units/fp-lagoon-chalet-1-masyaf.webp"],
'MS-MA-04':["/project-media/msquared/units/fp-chalet3-masyaf.webp"],
'MS-MA-05':["/project-media/msquared/units/fp-chalet4-masyaf.webp"],
'MS-MA-06':["/project-media/msquared/units/fp-chalet5-masyaf.webp"],
'MS-MA-07':["/project-media/msquared/units/fp-chalet6-masyaf.webp"],
'MS-MA-08':["/project-media/msquared/units/fp-chalet7-masyaf.webp"],
'MS-MA-09':["/project-media/msquared/units/fp-pen1-masyaf-0.webp", "/project-media/msquared/units/fp-pen1-masyaf-01.webp"],
'MS-MA-10':["/project-media/msquared/units/fp-chalet8-masyaf.webp"],
'MS-MA-11':["/project-media/msquared/units/fp-duplex-masyaf.webp"],
'MS-MA-12':["/project-media/msquared/units/fp-town1-masysf-0.webp", "/project-media/msquared/units/fp-town1-masysf-01.webp", "/project-media/msquared/units/fp-town1-masysf-02.webp"],
'MS-MA-13':["/project-media/msquared/units/fp-town2-masyaf-0.webp", "/project-media/msquared/units/fp-town2-masyaf-01.webp"],
'MS-MA-14':["/project-media/msquared/units/fp-town3-masyaf-0.webp", "/project-media/msquared/units/fp-town3-masyaf-01.webp"],
'MS-MA-15':["/project-media/msquared/units/fp-villa-masyaf.webp"],
'MS-TR-01':["/project-media/msquared/units/fp-ap1-trio-0.webp", "/project-media/msquared/units/fp-ap1-trio-01.webp"],
'MS-TR-02':["/project-media/msquared/units/fp-ap2-trio.webp"],
'MS-TR-03':["/project-media/msquared/units/fp-ap3-trio.webp"],
'MS-TR-04':["/project-media/msquared/units/fp-ap4-trio.webp"],
'MS-TR-05':["/project-media/msquared/units/fp-ap5-trio-0.webp"],
'MS-TR-06':["/project-media/msquared/units/fp-to1-trio.webp", "/project-media/msquared/units/fp-to1-trio0.webp"],
'MS-TR-07':["/project-media/msquared/units/fp-ap6-trio.webp"],
'MS-41-01':["/project-media/msquared/units/fp-off1-0.webp", "/project-media/msquared/units/fp-off1-01.webp"],
'MS-41-02':["/project-media/msquared/units/fp-off2-0.webp"],
'OR-ZE-01':["/project-media/ora/fp-ap1-z-0.webp", "/project-media/ora/fp-ap1-z-01.webp"],
'OR-ZE-02':["/project-media/ora/fp-ap2-z.webp"],
'OR-ZE-03':["/project-media/ora/fp-ap3-z.webp"],
'OR-ZE-04':["/project-media/ora/fp-lo-z.webp"],
'OR-ZE-05':["/project-media/ora/fp-stu-z.webp"],
'OR-ZE-06':["/project-media/ora/fp-ap1-ze-0.webp", "/project-media/ora/fp-ap1-ze-01.webp"],
'OR-ZE-07':["/project-media/ora/fp-ap2-ze.webp"],
'OR-ZE-08':["/project-media/ora/fp-ap3-ze.webp"],
'OR-EM-01':["/project-media/ora/fp-du1-em.webp"],
'OR-EM-02':["/project-media/ora/fp-du2-em.webp"],
'OR-EM-03':["/project-media/ora/fp-four-em.webp", "/project-media/ora/fp-four2-em.webp"],
'OR-EM-04':["/project-media/ora/fp-to1-em-0.webp", "/project-media/ora/fp-to1-em-01.webp"],
'OR-EM-05':["/project-media/ora/fp-to2-em-0.webp", "/project-media/ora/fp-to2-em-01.webp"],
'OR-EM-06':["/project-media/ora/fp-st-em.webp"],
'OR-ZW-01':["/project-media/ora/fp-st-zw.webp"],
'OR-ZW-02':["/project-media/ora/fp-ap1-zw.webp"],
'OR-ZW-03':["/project-media/ora/fp-ap3-zw.webp"],
'OR-ZW-04':["/project-media/ora/fp-ap4-zw.webp"],
'OR-ZW-05':["/project-media/ora/fp-ap6-zw.webp"],
'OR-ZW-06':["/project-media/ora/fp-ap7-zw.webp"],
'OR-ZW-07':["/project-media/ora/fp-ap8-zw.webp"],
'OR-SW-01':["/project-media/ora/fp-zw-0.webp", "/project-media/ora/fp-zw-01.webp"],
'OR-SW-02':["/project-media/ora/fp-v7-0.webp", "/project-media/ora/fp-v7-01.webp"],
'OR-SW-03':["/project-media/ora/fp-v2-sw.webp"],
'OR-SW-04':["/project-media/ora/fp-v3.webp"],
'OR-SW-05':["/project-media/ora/fp-v4-0.webp", "/project-media/ora/fp-v4-01.webp"],
'OR-SW-06':["/project-media/ora/fp-v6-0.webp", "/project-media/ora/fp-v6-01.webp"],
'OR-SW-07':["/project-media/ora/fp-th-sw-0.webp", "/project-media/ora/fp-th-sw-01.webp"],
'OR-SW-08':["/project-media/ora/fp-tw-sw-0.webp", "/project-media/ora/fp-tw-sw-01.webp"],
'OR-SW-09':["/project-media/ora/fp-ap1-sw.webp"],
'OR-SW-10':["/project-media/ora/fp-ap2-sw.webp"],
'OR-SW-11':["/project-media/ora/fp-ap3-sw.webp"],
'OR-SW-12':["/project-media/ora/fp-ap4-sw.webp"],
'OR-SW-13':["/project-media/ora/fp-ap5-sw.webp"],
'OR-SW-14':["/project-media/ora/fp-ap6-sw.webp"],
'OR-SW-15':["/project-media/ora/fp-pen1.webp"],
'OR-SW-16':["/project-media/ora/fp-pen-0.webp", "/project-media/ora/fp-pen-01.webp"],
'OR-SE-01':["/project-media/ora/fp-2b-se.webp"],
'OR-SE-02':["/project-media/ora/fp-3b-se.webp"],
'OR-SE-04':["/project-media/ora/fp-tw-se-0.webp", "/project-media/ora/fp-tw-se-01.webp"],
'OR-SE-05':["/project-media/ora/fp-v.webp"],
'OR-CR-01':["/project-media/ora/fp-du-cr.webp"],
'OR-CR-02':["/project-media/ora/fp-du1-cr.webp"],
'OR-CR-03':["/project-media/ora/fp-ch-cr.webp"],
'OR-CR-04':["/project-media/ora/fp-ch2-cr.webp"],
'OR-CR-05':["/project-media/ora/fp-ch3-cr.webp"],
'OR-CR-06':["/project-media/ora/fp-tw-cr-0.webp"],
'OR-CR-07':["/project-media/ora/fp-v1-cr-0.webp", "/project-media/ora/fp-v1-cr-01.webp"],
'OR-CR-08':["/project-media/ora/fp-v2-cr-0.webp", "/project-media/ora/fp-v2-cr-01.webp"],
'OR-CR-09':["/project-media/ora/fp-v3-cr-0.webp", "/project-media/ora/fp-v3-cr-01.webp"],
'OR-ST-01':["/project-media/ora/fp-ap1-ss.webp"],
'OR-ST-02':["/project-media/ora/fp-ch2-ss.webp"],
'OR-ST-03':["/project-media/ora/fp-th1-ss.webp"],
'OR-ST-04':["/project-media/ora/fp-th2-ss.webp"],
'OR-ST-05':["/project-media/ora/fp-v1-ss-0.webp", "/project-media/ora/fp-v1-ss-01.webp"],
'OR-ST-06':["/project-media/ora/fp-v2-ss-0.webp", "/project-media/ora/fp-v2-ss-01.webp"],
'OR-ST-07':["/project-media/ora/fp-v3-ss-0.webp", "/project-media/ora/fp-v3-ss-01.webp"],
'MB-V01':["/project-media/baghush/units/fp-v3.webp"],
'MB-V02':["/project-media/baghush/units/fp-v2.webp"],
'MB-V03':["/project-media/baghush/units/fp-v1.webp"],
'MB-V04':["/project-media/baghush/units/fp-v4.webp"],
'MB-CH01':["/project-media/baghush/units/fp-c1-0.webp", "/project-media/baghush/units/fp-c1-01.webp"],
'MB-CH02':["/project-media/baghush/units/fp-ch2.webp"],
'MB-CH03':["/project-media/baghush/units/fp-ch3.webp"],
'MB-TW01':["/project-media/baghush/units/fp-t1-0.webp", "/project-media/baghush/units/fp-t1-01.webp"],
'MB-CH04':["/project-media/baghush/units/fp-ch4.webp"],
'MB-CH05':["/project-media/baghush/units/fp-ch6.webp"],
'MB-CH06':["/project-media/baghush/units/fp-ch7.webp"],
'MB-CH07':["/project-media/baghush/units/fp-ch8.webp"],
'BAB-SH01':["/project-media/beitalbahr/units/fp-ch1-shores.webp"],
'BAB-SH02':["/project-media/beitalbahr/units/fp-ch2-shores.webp"],
'BAB-SH03':["/project-media/beitalbahr/units/fp-ch3-shores.webp"],
'BAB-SH04':["/project-media/beitalbahr/units/fp-ch4-sh.webp"],
'BAB-SH05':["/project-media/beitalbahr/units/fp-ch5-sh.webp"],
'BAB-SH06':["/project-media/beitalbahr/units/fp-ch6-sh.webp"],
'BAB-SH07':["/project-media/beitalbahr/units/fp-ch7-sh.webp"],
'BAB-SH08':["/project-media/beitalbahr/units/fp-ch8-sh.webp"],
'BAB-SH09':["/project-media/beitalbahr/units/fp-ch9-sh.webp"],
'BAB-SH10':["/project-media/beitalbahr/units/fp-ch10-sh.webp"],
'BAB-SH11':["/project-media/beitalbahr/units/fp-ch11-sh.webp"],
'BAB-SH12':["/project-media/beitalbahr/units/fp-ch12-sh.webp"],
'BAB-SH13':["/project-media/beitalbahr/units/fp-ch13-sh.webp"],
'BAB-SH14':["/project-media/beitalbahr/units/fp-ch14-sh.webp"],
'BAB-SH15':["/project-media/beitalbahr/units/fp-ch15-sh.webp"],
'BAB-SH16':["/project-media/beitalbahr/units/fp-ch16-sh.webp"],
'BAB-RO01':["/project-media/beitalbahr/units/fp-v1-roo.webp", "/project-media/beitalbahr/units/fp-v1-roo-2.webp"],
'BAB-RO02':["/project-media/beitalbahr/units/fp-v2-roo.webp"],
'BAB-RO03':["/project-media/beitalbahr/units/fp-ch1-roo.webp", "/project-media/beitalbahr/units/fp-ch3-roo.webp"],
'BAB-RO04':["/project-media/beitalbahr/units/fp-ch2-roo.webp", "/project-media/beitalbahr/units/fp-ch2-roo-2.webp"],
'BAB-RO05':["/project-media/beitalbahr/units/tw1-0-roo.webp", "/project-media/beitalbahr/units/tw1-01-roo.webp"],
'BAB-RY01':["/project-media/beitalbahr/units/fp-v1-rays1.webp"],
'BAB-RY02':["/project-media/beitalbahr/units/to1-0-rays.webp", "/project-media/beitalbahr/units/to1-01-rays.webp"],
'BAB-RY03':["/project-media/beitalbahr/units/fp-to2-rays.webp"],
'BAB-HS01':["/project-media/beitalbahr/units/fp-v1-hills.webp", "/project-media/beitalbahr/units/fp-v1-hills2.webp"],
'BAB-HS02':["/project-media/beitalbahr/units/fp-v2-hills.webp"],
'BAB-HL01':["/project-media/beitalbahr/units/FP-H1.webp", "/project-media/beitalbahr/units/FP-H2.webp"],
'CW-V04':["/project-media/marakez/units/v4-cr-01.webp", "/project-media/marakez/units/fp-v4-cr.webp"],
'CW-TH01':["/project-media/marakez/units/fp-th-3-cr.webp"],
'RM-VL01':["/project-media/ramla/units/fp-v1-r.webp"],
'RM-TW01':["/project-media/ramla/units/fp-tw-0.webp", "/project-media/ramla/units/fp-tw-01.webp"],
'RM-DX01':["/project-media/ramla/units/d1-0.webp"],
'RM-PH01':["/project-media/ramla/units/fp-ch1.webp"],
'RM-CH01':["/project-media/ramla/units/fp-ch2.webp"],
'RM-DX02':["/project-media/ramla/units/fp-d1.webp"],
'RM-TW02':["/project-media/ramla/units/fp-tw2.webp"],
'RM-DX03':["/project-media/ramla/units/fp-d2.webp"],
'RM-CH02':["/project-media/ramla/units/fp-ch3.webp"],
'RM-CH03':["/project-media/ramla/units/fp-ch4.webp"],
'RM-DX04':["/project-media/ramla/units/FP-DU.webp"],
'RM-TW03':["/project-media/ramla/units/fp-tw3.webp"],
'RM-TH01':["/project-media/ramla/units/fp-to.webp"],
'RM-CH04':["/project-media/ramla/units/fp-ch5.webp"],
'RM-VL02':["/project-media/ramla/units/fp-v2-0.webp", "/project-media/ramla/units/fp-v2-01.webp"],
'RM-TH02':["/project-media/ramla/units/fp-to2.webp"],
'RM-VL03':["/project-media/ramla/units/fp-v3.webp"],
'RM-VL04':["/project-media/ramla/units/fp-v4.webp"],
'RM-CH05':["/project-media/ramla/units/fp-ch6.webp"],
'RM-CH06':["/project-media/ramla/units/fp-ch7.webp"],
'RM-CH07':["/project-media/ramla/units/fp-ch8.webp"],
'AE-AP01':["/project-media/ramla/units/fp-ay.webp"],
'D5-A01':["/project-media/marakez/units/fp-ap1-d5.webp"],
'D5-A02':["/project-media/marakez/units/fp-ap2-d.webp"],
'D5-A03':["/project-media/marakez/units/fp-ap3-0.webp"],
'D5-A04':["/project-media/marakez/units/fp-ap4-d.webp"],
'D5-A05':["/project-media/marakez/units/fp-ap5-d.webp"],
'D5-A06':["/project-media/marakez/units/fp-ap6.webp"],
'D5-A07':["/project-media/marakez/units/fp-ap7.webp"],
'D5-A08':["/project-media/marakez/units/fp-ap8.webp"],
'D5-A09':["/project-media/marakez/units/fp-ap9-d.webp"],
'D5-A10':["/project-media/marakez/units/fp-ap10.webp"],
'D5-A11':["/project-media/marakez/units/fp-ap11.webp"],
'D5-A12':["/project-media/marakez/units/fp-d-ap12.webp"],
'D5-A13':["/project-media/marakez/units/fp-d-ap13.webp"],
'D5-A14':["/project-media/marakez/units/fp-ap14-d.webp"],
'D5-A15':["/project-media/marakez/units/fp-d-ap15.webp"],
'D5-A16':["/project-media/marakez/units/fp-d-ap16.webp"],
'D5-A17':["/project-media/marakez/units/fp-d-ap17.webp"],
'D5-A18':["/project-media/marakez/units/fp-d-ap18.webp"],
'D5-A19':["/project-media/marakez/units/fp-d-ap19.webp"],
'D5-A20':["/project-media/marakez/units/fp-d-ap20.webp"],
'D5-DX01':["/project-media/marakez/units/fp-d-du.webp"],
'D5-OF01':["/project-media/marakez/units/fp-pf1-d.webp"],
'D5-OF02':["/project-media/marakez/units/fp-off2-d.webp"],
'D5-OF03':["/project-media/marakez/units/fp-of3.webp"],
'D5-OF04':["/project-media/marakez/units/fp-of4.webp"],
'D5-OF05':["/project-media/marakez/units/fp-of5.webp"],
'CW-TW01':["/project-media/marakez/units/fp-tw1-cr-0.webp", "/project-media/marakez/units/fp-tw1-cr-1.webp"],
'CW-V01':["/project-media/marakez/units/fp-v1-cr-0.webp", "/project-media/marakez/units/fp-v1-cr-01.webp"],
'CW-V03':["/project-media/marakez/units/fp-v3-c-0.webp", "/project-media/marakez/units/fp-v3-c-01.webp"],
'CW-V05':["/project-media/marakez/units/fp-v5-cr-0.webp", "/project-media/marakez/units/fp-v5-cr-01.webp"],
'CW-A01':["/project-media/marakez/units/ap1-cr-0.webp"],
'CW-A02':["/project-media/marakez/units/fp-ap2-cr.webp"],
'CW-A03':["/project-media/marakez/units/fp-ap3-cr-0.webp"],
'CW-A04':["/project-media/marakez/units/fp-ap5-cr.webp"],
'CW-A05':["/project-media/marakez/units/fp-ap6-cr.webp"],
'CW-A06':["/project-media/marakez/units/fp-ap7-cr.webp"],
'CW-DX01':["/project-media/marakez/units/fp-du-cr.webp"],
'CW-DX02':["/project-media/marakez/units/fp-d-cr.webp"],
'CW-A07':["/project-media/marakez/units/fp-ap9-cr.webp"],
'CW-TW03':["/project-media/marakez/units/fp-th-cr.webp"],
'CW-TW04':["/project-media/marakez/units/fp-th2-cr.webp"],
'CW-A08':["/project-media/marakez/units/fp-ap8-cr.webp"],
'CW-A09':["/project-media/marakez/units/fp-ap10-cr.webp"],
'CW-V06':["/project-media/marakez/units/fp-v6-cr.webp"],
'CW-V07':["/project-media/marakez/units/fp-v7-c.webp"],
'CW-A10':["/project-media/marakez/units/fp-ap11-c.webp"],
'CW-A11':["/project-media/marakez/units/fp-ap12-cr.webp"],
'CW-A12':["/project-media/marakez/units/fp-ap13-cr.webp"],
'SB-ST-01':["/project-media/sumou/fp-st.webp"],
'SB-SP-01':["/project-media/sumou/fp-st1.webp"],
'SB-AP-01':["/project-media/sumou/fp-ap1-01.webp", "/project-media/sumou/fp-ap1-02.webp", "/project-media/sumou/fp-ap1-03.webp", "/project-media/sumou/fp-ap1-04.webp", "/project-media/sumou/fp-ap1-05.webp", "/project-media/sumou/fp-ap1-06.webp"],
'SB-AP-02':["/project-media/sumou/fp-2-0.webp", "/project-media/sumou/fp-2-01.webp", "/project-media/sumou/fp-2-02.webp", "/project-media/sumou/fp-2-03.webp", "/project-media/sumou/fp-2-04.webp", "/project-media/sumou/fp-2-05.webp", "/project-media/sumou/fp-2-06.webp", "/project-media/sumou/fp-2-07.webp", "/project-media/sumou/fp-2-08.webp", "/project-media/sumou/fp-2-09.webp"],
'SB-AP-03':["/project-media/sumou/fp-3-0.webp", "/project-media/sumou/fp-3-01.webp", "/project-media/sumou/fp-3-02.webp", "/project-media/sumou/fp-3-03.webp", "/project-media/sumou/fp-3-04.webp", "/project-media/sumou/fp-3-05.webp"],
'SB-AP-04':["/project-media/sumou/fp-5-0.webp", "/project-media/sumou/fp-5-01.webp", "/project-media/sumou/fp-5-02.webp"],
'SB-OF-01':["/project-media/sumou/fp-of-0.webp", "/project-media/sumou/fp-of-01.webp", "/project-media/sumou/fp-of-02.webp"],
'SB-OF-02':["/project-media/sumou/fp-of2.webp"],
'MD-BP-01':["/project-media/modon/fp-ap1-bp.webp"],
'MD-BP-02':["/project-media/modon/fp-ap2-bp.webp"],
'MD-BP-03':["/project-media/modon/fp-ap3-bp.webp"],
'MD-LH-01':["/project-media/modon/fp-ap1-lh.webp"],
'MD-LH-02':["/project-media/modon/fp-ap2-lh.webp"],
'MD-LH-03':["/project-media/modon/fp-ap3-lh.webp"],
'MD-LHU-01':["/project-media/modon/fp-ap1-lhu-0.webp", "/project-media/modon/fp-ap1-lhu-01.webp"],
'MD-LHU-02':["/project-media/modon/fp-ap2-lhu-0.webp", "/project-media/modon/fp-ap2-lhu-01.webp", "/project-media/modon/fp-ap2-lhu-02.webp"],
'MD-LHU-03':["/project-media/modon/fp-ap3-lhu-0.webp", "/project-media/modon/fp-ap3-lhu-01.webp"],
'MD-WD-01':["/project-media/modon/fp-th-wd-0.webp", "/project-media/modon/fp-th-wd-01.webp"],
'MD-WD-02':["/project-media/modon/fp-th2-wd-01.webp"],
'MD-WD-03':["/project-media/modon/fp-v-wd-0.webp", "/project-media/modon/fp-v-wd-01.webp", "/project-media/modon/fp-v-wd-02.webp", "/project-media/modon/fp-v-wd-03.webp"],
'MD-WD-05':["/project-media/modon/fp-v2.webp", "/project-media/modon/fp-v2-01.webp", "/project-media/modon/fp-v2-02.webp", "/project-media/modon/fp-v2-03.webp"],
'MD-MON-01':["/project-media/modon/fp-v1-mon-0.webp", "/project-media/modon/fp-v1-mon-01.webp"],
'MD-MON-02':["/project-media/modon/fp-v2-mod-0.webp", "/project-media/modon/fp-v2-mod-01.webp"],
'MD-MON-03':["/project-media/modon/fp-v3-0.webp", "/project-media/modon/fp-v3-01.webp"],
'MD-BL-01':["/project-media/modon/fp-ap1-bl.webp"],
'MD-BL-02':["/project-media/modon/fp-ap2-bl.webp"],
'MD-BL-03':["/project-media/modon/fp-ap3-bl.webp"],
'TM-IM-01':["/project-media/tatweer/fp-tm-sv-il.webp"],
'TM-IM-02':["/project-media/tatweer/fp-st-sv-il.webp"],
'TM-IM-03':["/project-media/tatweer/fp-tm-ch1-il.webp"],
'TM-IM-06':["/project-media/tatweer/fp-tm-ch2-il.webp"],
'TM-IM-07':["/project-media/tatweer/fp-tm-ch3-il-0.webp", "/project-media/tatweer/fp-tm-ch3-il-01.webp"],
'TM-IM-08':["/project-media/tatweer/fp-tm-ch4-il.webp"],
'TM-IM-09':["/project-media/tatweer/fp-tm-lo-il-0.webp", "/project-media/tatweer/fp-tm-lo-il-01.webp"],
'TM-IM-10':["/project-media/tatweer/fp-tm-lo2-il.webp"],
'TM-IM-11':["/project-media/tatweer/fp-tm-lo3-il.webp"],
'TM-IM-12':["/project-media/tatweer/fp-tm-th-il-0.webp", "/project-media/tatweer/fp-tm-th-il-01.webp"],
'TM-IM-13':["/project-media/tatweer/fp-tm-sv2-il-0.webp", "/project-media/tatweer/fp-tm-sv2-il-01.webp"],
'TM-IM-14':["/project-media/tatweer/fp-tm-ca1-il.webp"],
'TM-IM-15':["/project-media/tatweer/fp-tm-ch5-il.webp"],
'TM-IM-16':["/project-media/tatweer/fp-tm-ch6-il.webp"],
'TM-IM-17':["/project-media/tatweer/fp-m-pen1-il.webp"],
'TM-IM-18':["/project-media/tatweer/fp-st2-il.webp"],
'TM-IM-19':["/project-media/tatweer/fp-tm-ap3-il.webp"],
'TM-IM-20':["/project-media/tatweer/fp-tm-ap4-il.webp"],
'TM-IM-21':["/project-media/tatweer/fp-tm-ap4-il.webp"],
'TM-BL-01':["/project-media/tatweer/fp-ap1-b.webp"],
'TM-BL-02':["/project-media/tatweer/fp-ap2-bl.webp"],
'TM-BL-03':["/project-media/tatweer/fp-ap3-bl.webp"],
'TM-BL-04':["/project-media/tatweer/fp-du-bl.webp"],
'TM-BL-05':["/project-media/tatweer/fp-ap4-bl.webp"],
'TM-BL-06':["/project-media/tatweer/fp-ap5-b.webp"],
'TM-SL-01':["/project-media/tatweer/fp-ch1-sl-0.webp", "/project-media/tatweer/fp-ch1-sl-01.webp", "/project-media/tatweer/fp-ch1-sl-02.webp", "/project-media/tatweer/fp-ch1-sl-03.webp"],
'TM-SL-02':["/project-media/tatweer/fp-ch1-sl-0.webp", "/project-media/tatweer/fp-ch1-sl-01.webp", "/project-media/tatweer/fp-ch1-sl-02.webp", "/project-media/tatweer/fp-ch1-sl-03.webp"],
'TM-SL-03':["/project-media/tatweer/fp-ch1-sl-0.webp", "/project-media/tatweer/fp-ch1-sl-01.webp", "/project-media/tatweer/fp-ch1-sl-02.webp", "/project-media/tatweer/fp-ch1-sl-03.webp"],
'TM-SL-04':["/project-media/tatweer/fp-th-sl.webp"],
'TM-SL-05':["/project-media/tatweer/fp-sl-tw.webp"],
'TM-SL-06':["/project-media/tatweer/fp-sl-v.webp"],
'TM-RV-01':["/project-media/tatweer/fp-ap1-r.webp"],
'TM-RV-02':["/project-media/tatweer/fp-r-ap2-0.webp"],
'TM-RV-03':["/project-media/tatweer/fp-d-r.webp"],
'TM-RV-04':["/project-media/tatweer/fp-v-r.webp"],
'TM-RV-05':["/project-media/tatweer/fp-sv-r.webp"],
'TM-FK-01':["/project-media/tatweer/fp-f-0.webp"],
'TM-FK-02':["/project-media/tatweer/fp-f2.webp"],
'TM-FK-03':["/project-media/tatweer/80-b.webp", "/project-media/tatweer/80.webp"],
'TM-FK-04':["/project-media/tatweer/110.webp"],
'TM-DB-01':["/project-media/tatweer/fp-ch-dpay.webp"],
'TM-DB-02':["/project-media/tatweer/fp-tw-db-0.webp", "/project-media/tatweer/fp-tw-db-01.webp"],
'TM-DB-03':["/project-media/tatweer/280-s.webp", "/project-media/tatweer/280-floor-plan.webp"],
'TM-SC-01':["/project-media/tatweer/fp-th-sc.webp", "/project-media/tatweer/fp-th-sc1.webp"],
'TM-SC-02':["/project-media/tatweer/fp-tw-sc-0.webp", "/project-media/tatweer/fp-tw-sc-01.webp", "/project-media/tatweer/fp-tw-sc-02.webp", "/project-media/tatweer/fp-tw-sc-03.webp"],
'TM-SC-03':["/project-media/tatweer/fp-v-sc-0.webp", "/project-media/tatweer/villa-210-scenes-first-floor.webp", "/project-media/tatweer/villa-second-floor-scenes.webp"],
'JN-CR1':["fp-JN-CR1-1.webp"],
'JN-OP1':["fp-JN-OP1-1.webp"],
'OG-01':["/project-media/ogami/units/fp-v1-moun.webp"],
'OG-02':["/project-media/ogami/units/fp-th1-ogami.webp"],
'OG-03':["/project-media/ogami/units/fp-th2-ogami-0.webp", "/project-media/ogami/units/fp-th2-ogami-01.webp"],
'OG-04':["/project-media/ogami/units/fp-th3-ogami-0.webp"],
'OG-05':["/project-media/ogami/units/fp-th4-ogami-0.webp"],
'OG-06':["/project-media/ogami/units/fp-ch2-ogami-0.webp"],
'OG-07':["/project-media/ogami/units/fp-ch3-ogami.webp"],
'OG-08':["/project-media/ogami/units/fp-ap1-ogami.webp"],
'OG-09':["/project-media/ogami/units/fp-ap2-ogami.webp"],
'OG-10':["/project-media/ogami/units/fp-ap3-ogami.webp"],
'CS-TH1':["fp-CS-TH1-1.webp"],
'CS-TW1':["fp-CS-TW1-1.webp"],
'SEM-CL1':["/project-media/lmd/sem-cl1-fp1.webp", "/project-media/lmd/sem-cl1-fp2.webp"],
'SEM-CL2':["/project-media/lmd/sem-cl2-fp1.webp"],
'TS-AD1':["/project-media/lmd/ts-ad1-fp1.webp"],
'TS-AD2':["/project-media/lmd/ts-ad2-fp1.webp"],
'TS-CL3':["/project-media/lmd/ts-cl3-fp1.webp"],
'TS-AD4':["/project-media/lmd/ts-ad4-fp1.webp"],
'TS-OF5':["/project-media/lmd/ts-of5-fp1.webp"],
'STH-OF1':["/project-media/lmd/sth-of1-fp1.webp"],
'SES-AD1':["/project-media/lmd/ses-ad1-fp1.webp"],
'ON-RT1':["/project-media/lmd/on-rt1-fp1.webp"],
'ZY-SV1':["/project-media/lmd/zy-sv1-fp1.webp"],
'ZY-HV2':["/project-media/lmd/zy-hv2-fp1.webp"],
'ZY-TW3':["/project-media/lmd/zy-tw3-fp1.webp"],
'ZY-CB5':["/project-media/lmd/zy-cb5-fp1.webp"],
'PX-AP1':["/project-media/hassan-allam/px-ap1-fp1.webp"],
'PX-AP2':["/project-media/hassan-allam/px-ap2-fp1.webp"],
'PX-AP3':["/project-media/hassan-allam/px-ap3-fp1.webp"],
'PX-AP4':["/project-media/hassan-allam/px-ap4-fp1.webp"],
'PX-AP5':["/project-media/hassan-allam/px-ap5-fp1.webp"],
'VL-TH1':["/project-media/hassan-allam/vl-th1-fp1.webp", "/project-media/hassan-allam/vl-th1-fp2.webp"],
'VL-TW2':["/project-media/hassan-allam/vl-tw2-fp1.webp"],
'PC-AP1':["/project-media/hassan-allam/pc-ap1-fp1.webp"],
'PC-AP2':["/project-media/hassan-allam/pc-ap2-fp1.webp"],
'PC-AP4':["/project-media/hassan-allam/pc-ap4-fp1.webp"],
'PC-AP5':["/project-media/hassan-allam/pc-ap5-fp1.webp"],
'PC-AP7':["/project-media/hassan-allam/pc-ap7-fp1.webp"],
'GL-AP1':["/project-media/hassan-allam/gl-ap1-fp1.webp"],
'GL-AP2':["/project-media/hassan-allam/gl-ap2-fp1.webp"],
'GL-AP3':["/project-media/hassan-allam/gl-ap3-fp1.webp"],
'SL-AP1':["/project-media/hassan-allam/sl-ap1-fp1.webp"],
'SL-AP2':["/project-media/hassan-allam/sl-ap2-fp1.webp"],
'SL-AP3':["/project-media/hassan-allam/sl-ap3-fp1.webp"],
'SL-AP4':["/project-media/hassan-allam/sl-ap4-fp1.webp"],
'SL-AP5':["/project-media/hassan-allam/sl-ap5-fp1.webp"],
'SL-AP6':["/project-media/hassan-allam/sl-ap6-fp1.webp"],
'SL-AP7':["/project-media/hassan-allam/sl-ap7-fp1.webp"],
'SL-TW8':["/project-media/hassan-allam/sl-tw8-fp1.webp"],
'SL-SV9':["/project-media/hassan-allam/sl-sv9-fp1.webp"],
'SL-TW10':["/project-media/hassan-allam/sl-tw10-fp1.webp"],
'SL-TW11':["/project-media/hassan-allam/sl-tw11-fp1.webp"],
'SL-SV12':["/project-media/hassan-allam/sl-sv12-fp1.webp"],
'SL-SV13':["/project-media/hassan-allam/sl-sv13-fp1.webp"],
'SL-SV14':["/project-media/hassan-allam/sl-sv14-fp1.webp"],
'SL-SV15':["/project-media/hassan-allam/sl-sv15-fp1.webp"],
};
var UNIT_LOCATIONS = {
'MS-MI-01':["/project-media/msquared/units/location-mist.webp"],
'MS-MI-02':["/project-media/msquared/units/location-mist.webp"],
'MS-MI-03':["/project-media/msquared/units/location-mist.webp"],
'MS-MI-04':["/project-media/msquared/units/location-mist.webp"],
'MS-MI-05':["/project-media/msquared/units/location-mist.webp"],
'MS-MI-06':["/project-media/msquared/units/location-mist.webp"],
'MS-3W-01':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-02':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-03':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-04':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-05':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-06':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-07':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-08':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-09':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-10':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-11':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-12':["/project-media/msquared/units/location-31-west.webp"],
'MS-3W-13':["/project-media/msquared/units/location-31-west.webp"],
'MS-MA-01':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-02':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-03':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-04':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-05':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-06':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-07':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-08':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-09':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-10':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-11':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-12':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-13':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-14':["/project-media/msquared/units/location-masyaf.webp"],
'MS-MA-15':["/project-media/msquared/units/location-masyaf.webp"],
'MS-TR-01':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-02':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-03':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-04':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-05':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-06':["/project-media/msquared/units/location-trio.webp"],
'MS-TR-07':["/project-media/msquared/units/location-trio.webp"],
'MS-41-01':["/project-media/msquared/units/location-41.webp"],
'MS-41-02':["/project-media/msquared/units/location-41.webp"],
'MS-41-03':["/project-media/msquared/units/location-41.webp"],
'MS-41-04':["/project-media/msquared/units/location-41.webp"],
'MS-41-05':["/project-media/msquared/units/location-41.webp"],
'OG-01':["/project-media/ogami/units/location-ogami.webp"],
'OG-02':["/project-media/ogami/units/location-ogami.webp"],
'OG-03':["/project-media/ogami/units/location-ogami.webp"],
'OG-04':["/project-media/ogami/units/location-ogami.webp"],
'OG-05':["/project-media/ogami/units/location-ogami.webp"],
'OG-06':["/project-media/ogami/units/location-ogami.webp"],
'OG-07':["/project-media/ogami/units/location-ogami.webp"],
'OG-08':["/project-media/ogami/units/location-ogami.webp"],
'OG-09':["/project-media/ogami/units/location-ogami.webp"],
'OG-10':["/project-media/ogami/units/location-ogami.webp"],
'OR-ZE-01':["/project-media/ora/loc-zed.webp"],
'OR-ZE-02':["/project-media/ora/loc-zed.webp"],
'OR-ZE-03':["/project-media/ora/loc-zed.webp"],
'OR-ZE-04':["/project-media/ora/loc-zed.webp"],
'OR-ZE-05':["/project-media/ora/loc-zed.webp"],
'OR-ZE-06':["/project-media/ora/loc-zed.webp"],
'OR-ZE-07':["/project-media/ora/loc-zed.webp"],
'OR-ZE-08':["/project-media/ora/loc-zed.webp"],
'OR-EM-01':["/project-media/ora/loc-zed.webp"],
'OR-EM-02':["/project-media/ora/loc-zed.webp"],
'OR-EM-03':["/project-media/ora/loc-zed.webp"],
'OR-EM-04':["/project-media/ora/loc-zed.webp"],
'OR-EM-05':["/project-media/ora/loc-zed.webp"],
'OR-EM-06':["/project-media/ora/loc-zed.webp"],
'OR-ZW-01':["/project-media/ora/lo-zw.webp"],
'OR-ZW-02':["/project-media/ora/lo-zw.webp"],
'OR-ZW-03':["/project-media/ora/lo-zw.webp"],
'OR-ZW-04':["/project-media/ora/lo-zw.webp"],
'OR-ZW-05':["/project-media/ora/lo-zw.webp"],
'OR-ZW-06':["/project-media/ora/lo-zw.webp"],
'OR-ZW-07':["/project-media/ora/lo-zw.webp"],
'OR-SW-01':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-02':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-03':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-04':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-05':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-06':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-07':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-08':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-09':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-10':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-11':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-12':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-13':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-14':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-15':["/project-media/ora/loc-solana-west.webp"],
'OR-SW-16':["/project-media/ora/loc-solana-west.webp"],
'OR-SE-01':["/project-media/ora/location-solana-east.webp"],
'OR-SE-02':["/project-media/ora/location-solana-east.webp"],
'OR-SE-03':["/project-media/ora/location-solana-east.webp"],
'OR-SE-04':["/project-media/ora/location-solana-east.webp"],
'OR-SE-05':["/project-media/ora/location-solana-east.webp"],
'OR-CR-01':["/project-media/ora/lo-cr.webp"],
'OR-CR-02':["/project-media/ora/lo-cr.webp"],
'OR-CR-03':["/project-media/ora/lo-cr.webp"],
'OR-CR-04':["/project-media/ora/lo-cr.webp"],
'OR-CR-05':["/project-media/ora/lo-cr.webp"],
'OR-CR-06':["/project-media/ora/lo-cr.webp"],
'OR-CR-07':["/project-media/ora/lo-cr.webp"],
'OR-CR-08':["/project-media/ora/lo-cr.webp"],
'OR-CR-09':["/project-media/ora/lo-cr.webp"],
'OR-ST-01':["/project-media/ora/lo-cr.webp"],
'OR-ST-02':["/project-media/ora/lo-cr.webp"],
'OR-ST-03':["/project-media/ora/lo-cr.webp"],
'OR-ST-04':["/project-media/ora/lo-cr.webp"],
'OR-ST-05':["/project-media/ora/lo-cr.webp"],
'OR-ST-06':["/project-media/ora/lo-cr.webp"],
'OR-ST-07':["/project-media/ora/lo-cr.webp"],
'MB-V01':["/project-media/baghush/units/loc-ma.webp"],
'MB-V02':["/project-media/baghush/units/loc-ma.webp"],
'MB-V03':["/project-media/baghush/units/loc-ma.webp"],
'MB-V04':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH01':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH02':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH03':["/project-media/baghush/units/loc-ma.webp"],
'MB-TW01':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH04':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH05':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH06':["/project-media/baghush/units/loc-ma.webp"],
'MB-CH07':["/project-media/baghush/units/loc-ma.webp"],
'BAB-SH01':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH02':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH03':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH04':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH05':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH06':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH07':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH08':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH09':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH10':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH11':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH12':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH13':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH14':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH15':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-SH16':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RO01':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RO02':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RO03':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RO04':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RO05':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RY01':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RY02':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-RY03':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-HS01':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-HS02':["/project-media/beitalbahr/units/locaion-beit.webp"],
'BAB-HL01':["/project-media/beitalbahr/units/locaion-beit.webp"],
'RM-VL01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-TW01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-DX01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-PH01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-DX02':["/project-media/ramla/units/loc-ramla.webp"],
'RM-TW02':["/project-media/ramla/units/loc-ramla.webp"],
'RM-DX03':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH02':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH03':["/project-media/ramla/units/loc-ramla.webp"],
'RM-DX04':["/project-media/ramla/units/loc-ramla.webp"],
'RM-TW03':["/project-media/ramla/units/loc-ramla.webp"],
'RM-TH01':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH04':["/project-media/ramla/units/loc-ramla.webp"],
'RM-VL02':["/project-media/ramla/units/loc-ramla.webp"],
'RM-TH02':["/project-media/ramla/units/loc-ramla.webp"],
'RM-VL03':["/project-media/ramla/units/loc-ramla.webp"],
'RM-VL04':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH05':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH06':["/project-media/ramla/units/loc-ramla.webp"],
'RM-CH07':["/project-media/ramla/units/loc-ramla.webp"],
'AE-AP01':["/project-media/ramla/units/loc-a.webp"],
'D5-A01':["/project-media/marakez/units/lo-d5.webp"],
'D5-A02':["/project-media/marakez/units/lo-d5.webp"],
'D5-A03':["/project-media/marakez/units/lo-d5.webp"],
'D5-A04':["/project-media/marakez/units/lo-d5.webp"],
'D5-A05':["/project-media/marakez/units/lo-d5.webp"],
'D5-A06':["/project-media/marakez/units/lo-d5.webp"],
'D5-A07':["/project-media/marakez/units/lo-d5.webp"],
'D5-A08':["/project-media/marakez/units/lo-d5.webp"],
'D5-A09':["/project-media/marakez/units/lo-d5.webp"],
'D5-A10':["/project-media/marakez/units/lo-d5.webp"],
'D5-A11':["/project-media/marakez/units/lo-d.webp"],
'D5-A12':["/project-media/marakez/units/lo-d.webp"],
'D5-A13':["/project-media/marakez/units/lo-d.webp"],
'D5-A14':["/project-media/marakez/units/lo-d.webp"],
'D5-A15':["/project-media/marakez/units/lo-d.webp"],
'D5-A16':["/project-media/marakez/units/lo-d.webp"],
'D5-A17':["/project-media/marakez/units/lo-d.webp"],
'D5-A18':["/project-media/marakez/units/lo-d.webp"],
'D5-A19':["/project-media/marakez/units/lo-d.webp"],
'D5-A20':["/project-media/marakez/units/lo-d.webp"],
'D5-DX01':["/project-media/marakez/units/lo-d.webp"],
'D5-OF01':["/project-media/marakez/units/lo-d.webp"],
'D5-OF02':["/project-media/marakez/units/lo-d.webp"],
'D5-OF03':["/project-media/marakez/units/lo-d.webp"],
'D5-OF04':["/project-media/marakez/units/lo-d.webp"],
'D5-OF05':["/project-media/marakez/units/lo-d.webp"],
'CW-TW01':["/project-media/marakez/units/loc-cr.webp"],
'CW-V01':["/project-media/marakez/units/loc-cr.webp"],
'CW-V03':["/project-media/marakez/units/loc-cr.webp"],
'CW-V04':["/project-media/marakez/units/loc-cr.webp"],
'CW-V05':["/project-media/marakez/units/loc-cr.webp"],
'CW-A01':["/project-media/marakez/units/loc-cr.webp"],
'CW-A02':["/project-media/marakez/units/loc-cr.webp"],
'CW-A03':["/project-media/marakez/units/loc-cr.webp"],
'CW-A04':["/project-media/marakez/units/loc-cr.webp"],
'CW-A05':["/project-media/marakez/units/loc-cr.webp"],
'CW-A06':["/project-media/marakez/units/loc-cr.webp"],
'CW-DX01':["/project-media/marakez/units/loc-cr.webp"],
'CW-DX02':["/project-media/marakez/units/loc-cr.webp"],
'CW-A07':["/project-media/marakez/units/loc-cr.webp"],
'CW-TW03':["/project-media/marakez/units/loc-cr.webp"],
'CW-TW04':["/project-media/marakez/units/loc-cr.webp"],
'CW-A08':["/project-media/marakez/units/loc-cr.webp"],
'CW-A09':["/project-media/marakez/units/loc-cr.webp"],
'CW-TH01':["/project-media/marakez/units/loc-cr.webp"],
'CW-V06':["/project-media/marakez/units/loc-cr.webp"],
'CW-V07':["/project-media/marakez/units/loc-cr.webp"],
'CW-A10':["/project-media/marakez/units/loc-cr.webp"],
'CW-A11':["/project-media/marakez/units/loc-cr.webp"],
'CW-A12':["/project-media/marakez/units/loc-cr.webp"],
'SB-ST-01':["/project-media/sumou/lo-s.webp"],
'SB-SP-01':["/project-media/sumou/lo-s.webp"],
'SB-AP-01':["/project-media/sumou/lo-s.webp"],
'SB-AP-02':["/project-media/sumou/lo-s.webp"],
'SB-AP-03':["/project-media/sumou/lo-s.webp"],
'SB-AP-04':["/project-media/sumou/lo-s.webp"],
'SB-OF-01':["/project-media/sumou/lo-s.webp"],
'SB-OF-02':["/project-media/sumou/lo-s.webp"],
'MD-BP-01':["/project-media/modon/loc-beachplaza.webp"],
'MD-BP-02':["/project-media/modon/loc-beachplaza.webp"],
'MD-BP-03':["/project-media/modon/loc-beachplaza.webp"],
'MD-BPL-01':["/project-media/modon/loc-beachplaza.webp"],
'MD-BPL-02':["/project-media/modon/loc-beachplaza.webp"],
'MD-BPL-03':["/project-media/modon/loc-beachplaza.webp"],
'MD-WD-01':["/project-media/modon/location-wd.webp"],
'MD-WD-02':["/project-media/modon/location-wd.webp"],
'MD-WD-03':["/project-media/modon/location-wd.webp"],
'MD-WD-04':["/project-media/modon/location-wd.webp"],
'MD-WD-05':["/project-media/modon/location-wd.webp"],
'MD-MON-01':["/project-media/modon/loc-mo.webp"],
'MD-MON-02':["/project-media/modon/loc-mo.webp"],
'MD-MON-03':["/project-media/modon/loc-mo.webp"],
'MD-BL-01':["/project-media/modon/location-modon.webp"],
'MD-BL-02':["/project-media/modon/location-modon.webp"],
'MD-BL-03':["/project-media/modon/location-modon.webp"],
'TM-BL-01':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-02':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-03':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-04':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-05':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-06':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-07':["/project-media/tatweer/lo-bloom.webp"],
'TM-BL-08':["/project-media/tatweer/lo-bloom.webp"],
'TM-SL-01':["/project-media/tatweer/location-salt.webp"],
'TM-SL-02':["/project-media/tatweer/location-salt.webp"],
'TM-SL-03':["/project-media/tatweer/location-salt.webp"],
'TM-SL-04':["/project-media/tatweer/location-salt.webp"],
'TM-SL-05':["/project-media/tatweer/location-salt.webp"],
'TM-SL-06':["/project-media/tatweer/location-salt.webp"],
'TM-RV-01':["/project-media/tatweer/lo-river.webp"],
'TM-RV-02':["/project-media/tatweer/lo-river.webp"],
'TM-RV-03':["/project-media/tatweer/lo-river.webp"],
'TM-RV-04':["/project-media/tatweer/lo-river.webp"],
'TM-RV-05':["/project-media/tatweer/lo-river.webp"],
'TM-DB-01':["/project-media/tatweer/lo-dbay.webp"],
'TM-DB-02':["/project-media/tatweer/lo-dbay.webp"],
'TM-DB-03':["/project-media/tatweer/lo-dbay.webp"],
'TM-SC-01':["/project-media/tatweer/lo-sc.webp"],
'TM-SC-02':["/project-media/tatweer/lo-sc.webp"],
'TM-SC-03':["/project-media/tatweer/lo-sc.webp"],
'TS-AD1':["/project-media/lmd/ts-ad1-loc1.webp"],
'TS-AD2':["/project-media/lmd/ts-ad2-loc1.webp"],
'TS-CL3':["/project-media/lmd/ts-cl3-loc1.webp"],
'TS-AD4':["/project-media/lmd/ts-ad4-loc1.webp"],
'TS-OF5':["/project-media/lmd/ts-of5-loc1.webp"],
'STH-OF1':["/project-media/lmd/sth-of1-loc1.webp"],
'VL-TH1':["/project-media/hassan-allam/vl-th1-loc1.webp"],
'VL-TW2':["/project-media/hassan-allam/vl-tw2-loc1.webp"],
'VL-SV3':["/project-media/hassan-allam/vl-sv3-loc1.webp", "/project-media/hassan-allam/vl-sv3-loc2.webp"],
'PC-AP1':["/project-media/hassan-allam/pc-ap1-loc1.webp"],
'PC-AP2':["/project-media/hassan-allam/pc-ap2-loc1.webp"],
'PC-AP3':["/project-media/hassan-allam/pc-ap3-loc1.webp"],
'PC-AP4':["/project-media/hassan-allam/pc-ap4-loc1.webp"],
'PC-AP5':["/project-media/hassan-allam/pc-ap5-loc1.webp"],
'PC-AP6':["/project-media/hassan-allam/pc-ap6-loc1.webp"],
'PC-AP7':["/project-media/hassan-allam/pc-ap7-loc1.webp"],
'GL-AP1':["/project-media/hassan-allam/gl-ap1-loc1.webp"],
'GL-AP2':["/project-media/hassan-allam/gl-ap2-loc1.webp"],
'GL-AP3':["/project-media/hassan-allam/gl-ap3-loc1.webp"],
};
function planUrl(f){ return f.charAt(0)==='/' ? f : PLANS_BASE+f; }
var PROJECT_PLAN_FALLBACK = (function(){
var out = {};
for(var i=0;i<UNITS.length;i++){
var u = UNITS[i], slot = out[u.project] || (out[u.project] = {mp:null, loc:null});
if(!slot.mp  && UNIT_MASTERPLANS[u.id]) slot.mp  = UNIT_MASTERPLANS[u.id];
if(!slot.loc && UNIT_LOCATIONS[u.id])   slot.loc = UNIT_LOCATIONS[u.id];
}
return out;
})();
function projectPlans(slug){ return PROJECT_PLAN_FALLBACK[slug] || {}; }
function unitMasterplans(u){ var a=u&&(UNIT_MASTERPLANS[u.id]||projectPlans(u.project).mp); return a?a.map(planUrl):[]; }
function unitFloorplans(u){ var a=u&&UNIT_FLOORPLANS[u.id]; return a?a.map(planUrl):[]; }
function unitLocationImg(u){ var a=u&&(UNIT_LOCATIONS[u.id]||projectPlans(u.project).loc); if(a&&a.length) return a[0]; var p=u&&projBySlug(u.project); return p?areaImageSrc(p.area):''; }
function unitGallery(u){ return (u&&UNIT_GALLERY[u.id])||[]; }
function unitGalleryItems(u){
var p=projBySlug(u.project), pnm=p?(lang==='ar'?p.name_ar:p.name):'', g=unitGallery(u), n=g.length;
return g.map(function(s,i){ return {src:s, cap:pnm+(n>1?(' · '+(lang==='ar'?'صورة ':'Photo ')+(i+1)+'/'+n):'')}; });
}
var AMENITY_CAT = {
beach:{icon:'am_beach', en:'Private beach', ar:'شاطئ خاص'},
lagoon:{icon:'am_lagoon', en:'Crystal lagoons', ar:'بحيرات كريستالية'},
pool:{icon:'am_pool', en:'Swimming pools', ar:'حمامات سباحة'},
clubhouse:{icon:'am_club', en:'Clubhouse', ar:'كلوب هاوس'},
gym:{icon:'am_gym', en:'Gym & fitness', ar:'جيم ولياقة'},
security:{icon:'am_security', en:'24/7 security', ar:'أمن على مدار الساعة'},
landscape:{icon:'am_landscape', en:'Green landscapes', ar:'مساحات خضراء'},
retail:{icon:'am_retail', en:'Retail & dining', ar:'محلات ومطاعم'},
sports:{icon:'am_sports', en:'Sports & tracks', ar:'ملاعب ومسارات'},
kids:{icon:'am_kids', en:'Kids areas', ar:'مناطق أطفال'},
clinic:{icon:'am_clinic', en:'Medical center', ar:'مركز طبي'},
mosque:{icon:'am_mosque', en:'Mosque', ar:'مسجد'},
bms:{icon:'am_bms', en:'Smart buildings (BMS)', ar:'مبانٍ ذكية (BMS)'},
controls:{icon:'am_controls', en:'Automated controls', ar:'تحكّم آلي'},
fiber:{icon:'am_fiber', en:'Fibre optic, triple play', ar:'ألياف بصرية ثلاثية الخدمة'},
cctv:{icon:'am_cctv', en:'CCTV with AI', ar:'مراقبة بالذكاء الاصطناعي'},
heat:{icon:'am_heat', en:'Heat detection', ar:'أنظمة كشف حراري'},
generators:{icon:'am_power', en:'Backup generators', ar:'مولّدات احتياطية'},
parking:{icon:'am_parking', en:'Cashless parking', ar:'موقف بلا نقد'},
app:{icon:'am_app', en:'Community app', ar:'تطبيق للمجتمع'},
eco:{icon:'am_eco', en:'Green & eco-friendly', ar:'أخضر وصديق للبيئة'},
concierge:{icon:'am_concierge', en:'Lobbies & concierge', ar:'لوبيهات وكونسيرج'},
housekeeping:{icon:'am_laundry', en:'Hospitality services', ar:'خدمات ضيافة'},
ev:{icon:'am_ev', en:'Car charging stations', ar:'محطات شحن سيارات'},
sauna:{icon:'am_sauna', en:'Sauna', ar:'ساونا'},
nursery:{icon:'am_kids', en:'Nursery & kids play', ar:'حضانة ولعب أطفال'},
outdoorfit:{icon:'am_yoga', en:'Yoga & outdoor fitness', ar:'يوجا ولياقة في الهواء الطلق'},
greenspine:{icon:'am_paseo', en:'Extended green spine & paseo', ar:'عمود أخضر ممتد وباسيو'},
centralpark:{icon:'am_centralpark', en:'Central park', ar:'حديقة مركزية'},
gardenparks:{icon:'am_gardenpark', en:'Street-side garden parks', ar:'حدائق على جانبي الشوارع'},
clubsports:{icon:'am_club', en:'Clubhouse & sports facilities', ar:'كلوب هاوس ومرافق رياضية'},
commercialpark:{icon:'am_pavilion', en:'Commercial park', ar:'بارك تجاري'},
neighborhoodpark:{icon:'am_flower', en:'Neighborhood park', ar:'حديقة الحي'},
d5club:{icon:'am_club', en:'District 5 Club', ar:'نادي ديستريكت ٥'},
d5campus:{icon:'am_campus', en:'District 5 Campus', ar:'كامباس ديستريكت ٥'},
urbanehotel:{icon:'am_hotel', en:'Urbane Hotel', ar:'فندق أوربان'},
d5m:{icon:'am_retail', en:'D5M shopping mall', ar:'مول D5M'},
lifestylearea:{icon:'am_lifestyle', en:'Lifestyle Area', ar:'منطقة اللايف ستايل'},
mindhaus:{icon:'am_office', en:'District 5 Mindhaus offices', ar:'مكاتب مايندهاوس'},
bab_beach:{icon:'am_beach', en:'3.5 km beachfront', ar:'شاطئ ٣٫٥ كم'},
bab_hotels:{icon:'am_hotel', en:'Four hotels', ar:'أربعة فنادق'},
bab_finished:{icon:'am_finished', en:'Fully finished units', ar:'وحدات كاملة التشطيب'},
bab_landscape:{icon:'am_landscape', en:'Landscape', ar:'لاندسكيب'},
bab_heart:{icon:'pin', en:'In the heart of Sidi Heneish', ar:'في قلب سيدي حنيش'},
bab_community:{icon:'am_community', en:'Community living', ar:'حياة مجتمعية'},
bab_lagoons:{icon:'am_lagoon', en:'Swimmable lagoons', ar:'بحيرات للسباحة'},
bab_fnb:{icon:'am_dining', en:'F&B tenants', ar:'مطاعم ومقاهي'},
mb_lagoons:{icon:'am_lagoon', en:'Five swimmable lagoons', ar:'خمس بحيرات للسباحة'},
mb_beach:{icon:'am_beach', en:'Sandy beaches', ar:'شواطئ رملية'},
mb_spine:{icon:'am_paseo', en:'Botanical spine & garden', ar:'عمود أخضر وحديقة نباتية'},
mb_bikes:{icon:'am_sports', en:'Bike paths', ar:'مسارات دراجات'},
mb_retail:{icon:'am_retail', en:'20+ shops & restaurants', ar:'أكثر من ٢٠ متجراً ومطعماً'},
mb_gym:{icon:'am_gym', en:'Fitness facility', ar:'مركز لياقة'},
mb_guards:{icon:'am_security', en:'Lifeguarded lagoons', ar:'منقذون على البحيرات'},
mb_beachsvc:{icon:'am_dining', en:'Beach food & service', ar:'خدمة وطعام على الشاطئ'},
ss_beach:{icon:'am_beach', en:'1 km of beach front', ar:'واجهة شاطئية بطول كيلومتر'},
ss_lagoons:{icon:'am_lagoon', en:'88,000 m² of swimmable lagoons', ar:'٨٨٬٠٠٠ م² من البحيرات القابلة للسباحة'},
ss_hotels:{icon:'am_hotel', en:'Two hotels', ar:'فندقان'},
ss_clubs:{icon:'am_club', en:'Four clubhouses', ar:'أربعة كلوب هاوس'},
ss_hospital:{icon:'am_clinic', en:'Hospital', ar:'مستشفى'},
ss_piazza:{icon:'am_pavilion', en:'Piazza', ar:'بيازا'},
ss_retail:{icon:'am_retail', en:'High-end retail', ar:'محال تجارية راقية'},
ss_land:{icon:'masterplan', en:'503 acres, masterplanned by WATG', ar:'٥٠٣ أفدنة بمخطط عام من WATG'},
ze_club:{icon:'am_sports', en:'ZED Sports Club — 43 acres', ar:'نادي زيد الرياضي — ٤٣ فداناً'},
ze_park:{icon:'am_centralpark', en:'Eight acres of central landscape', ar:'ثمانية أفدنة من الحديقة المركزية'},
ze_mall:{icon:'am_retail', en:'Shopping mall, retail & F&B', ar:'مول ومحال ومطاعم'},
ze_office:{icon:'am_office', en:'Office park', ar:'مجمّع مكاتب'},
ze_clinics:{icon:'am_clinic', en:'Medical clinics', ar:'عيادات طبية'},
ze_finished:{icon:'am_finished', en:'Delivered fully finished, including ACs', ar:'تُسلَّم كاملة التشطيب بما فيها التكييف'},
ze_parking:{icon:'am_parking', en:'Underground parking', ar:'جراج تحت الأرض'},
ze_concierge:{icon:'am_concierge', en:'Concierge, resident & furniture lifts', ar:'كونسيرج ومصعدا سكان وأثاث'},
zw_park:{icon:'am_centralpark', en:'ZED Park — 65 of the project’s 165 acres', ar:'حديقة زيد — ٦٥ من أصل ١٦٥ فداناً'},
zw_sports:{icon:'am_sports', en:'Sports complex — DBB soccer, BTT Barcelona tennis & paddle', ar:'مجمّع رياضي — كرة قدم مع DBB، وتنس وبادل مع BTT برشلونة'},
zw_mall:{icon:'am_retail', en:'High-end mall & the Italiano restaurant', ar:'مول راقٍ ومطعم إيتاليانو'},
zw_lifestyle:{icon:'am_lifestyle', en:'Theatre, zipline & the ZED Winter Festival', ar:'مسرح وزيبلاين ومهرجان زيد الشتوي'},
zw_kids:{icon:'am_kids', en:'Kids area & barbecue area', ar:'منطقة أطفال ومنطقة شواء'},
zw_offices:{icon:'am_office', en:'77,100 m² of offices & clinics', ar:'٧٧٬١٠٠ م² من المكاتب والعيادات'},
zw_parking:{icon:'am_parking', en:'Underground parking, concierge & lifts', ar:'جراج تحت الأرض وكونسيرج ومصاعد'},
zw_finished:{icon:'am_finished', en:'Fully finished with ACs & imported kitchens', ar:'تشطيب كامل مع تكييفات ومطابخ مستوردة'},
sw_club:{icon:'am_club', en:'Clubhouse — 10,000 m²', ar:'كلوب هاوس — ١٠٬٠٠٠ م²'},
sw_football:{icon:'am_sports', en:'Football club — 130,000 m²', ar:'نادٍ لكرة القدم — ١٣٠٬٠٠٠ م²'},
sw_school:{icon:'am_campus', en:'School — 20,000 m²', ar:'مدرسة — ٢٠٬٠٠٠ م²'},
sw_daycare:{icon:'am_kids', en:'Daycare', ar:'حضانة'},
sw_parks:{icon:'am_gardenpark', en:'Parks & water features', ar:'حدائق ومسطحات مائية'},
sw_serviced:{icon:'am_hotel', en:'Serviced apartments', ar:'شقق فندقية'},
sw_ev:{icon:'am_ev', en:'Electric charging', ar:'شحن كهربائي'},
sw_lanes:{icon:'am_paseo', en:'Bike & running lanes', ar:'مسارات دراجات وجري'},
sw_center:{icon:'am_community', en:'Community centre', ar:'مركز مجتمعي'},
sw_entertainment:{icon:'am_lifestyle', en:'Entertainment', ar:'ترفيه'},
sw_retail:{icon:'am_retail', en:'Community retail — 5,000 m²', ar:'تجزئة الحي — ٥٬٠٠٠ م²'},
sw_clinics:{icon:'am_clinic', en:'Clinics', ar:'عيادات'},
ms_beachclub:{icon:'am_club', en:'Barbarossa Beach Club & restaurant', ar:'نادي بربروسا الشاطئي ومطعمه'},
ms_beachsports:{icon:'am_beach', en:'Beach bar, sports & activities', ar:'بار الشاطئ ورياضاته وأنشطته'},
ms_cabanas:{icon:'am_hotel', en:'Marmarica Boutique Cabanas — 18 cabanas', ar:'كابانات مرماريكا البوتيكية — ١٨ كابانا'},
ms_lagoons:{icon:'am_lagoon', en:'Lagoons', ar:'بحيرات'},
ms_downtown:{icon:'am_club', en:'Downtown clubhouse', ar:'كلوب هاوس الداون تاون'},
ms_ritsa:{icon:'am_retail', en:'Ritsa commercial area', ar:'منطقة ريتسا التجارية'},
ms_padel:{icon:'am_sports', en:'Sports & courts, padel tennis by JPadel', ar:'ملاعب ورياضات، وبادل مع JPadel'},
ms_peppermint:{icon:'am_sauna', en:'Peppermint wellbeing centre', ar:'مركز بيبرمنت للعافية'},
ms_kids:{icon:'am_kids', en:'Kids area', ar:'منطقة أطفال'},
ms_mosque:{icon:'am_mosque', en:'Mosque', ar:'مسجد'},
ms_trio_club:{icon:'am_club', en:'Club house & commercial strip', ar:'كلوب هاوس وشريط تجاري'},
ms_trio_yoga:{icon:'am_yoga', en:'Yoga garden & meditation zone', ar:'حديقة يوجا ومنطقة تأمّل'},
ms_trio_read:{icon:'am_office', en:'Reading & work station', ar:'ركن قراءة وعمل'},
ms_trio_fit:{icon:'am_gym', en:'Fitness zone', ar:'منطقة لياقة'},
ms_trio_kids:{icon:'am_kids', en:'Kids play zone', ar:'منطقة لعب للأطفال'},
ms_trio_seat:{icon:'am_flower', en:'Seating areas', ar:'أماكن جلوس'},
ms_trio_gardens:{icon:'am_gardenpark', en:'Hanging gardens & flying pools', ar:'حدائق معلّقة وحمامات سباحة طائرة'},
ms_trio_privacy:{icon:'am_community', en:'Three villas per complex, private gardens', ar:'ثلاث فيلات لكل مجمّع بحدائق خاصة'},
ms_mist_promenade:{icon:'am_paseo', en:'Promenade & deck', ar:'بروميناد وممشى خشبي'},
ms_mist_plaza:{icon:'am_pavilion', en:'Main plaza', ar:'البلازا الرئيسية'},
ms_mist_water:{icon:'am_lagoon', en:'Water deck, waterfront platforms & lakes', ar:'ممشى مائي ومنصات على الماء وبحيرات'},
ms_mist_serviced:{icon:'am_hotel', en:'Serviced apartments', ar:'شقق فندقية'},
ms_mist_gym:{icon:'am_gym', en:'Gym, club house & outdoor gym', ar:'جيم وكلوب هاوس وجيم خارجي'},
ms_mist_sports:{icon:'am_sports', en:'Sports area & outdoor fitness', ar:'منطقة رياضية ولياقة في الهواء الطلق'},
ms_mist_kids:{icon:'am_kids', en:'Nursery, kids area & kids node', ar:'حضانة ومنطقة أطفال وركن أطفال'},
ms_mist_cafe:{icon:'am_dining', en:'Lake cafe', ar:'كافيه البحيرة'},
ms_mist_calm:{icon:'am_yoga', en:'Sitting, relaxation & meditation areas', ar:'أماكن جلوس واسترخاء وتأمّل'},
ms_mist_pets:{icon:'am_flower', en:'Pets park', ar:'حديقة الحيوانات الأليفة'},
ms_w31_lake:{icon:'am_lagoon', en:'Lake & grand water features', ar:'بحيرة ومسطحات مائية كبرى'},
ms_w31_club:{icon:'am_club', en:'Club house', ar:'كلوب هاوس'},
ms_w31_admin:{icon:'am_office', en:'Administration building', ar:'مبنى إداري'},
ms_w31_fnb:{icon:'am_dining', en:'F&B outlets & lake cafe', ar:'مطاعم ومقاهٍ وكافيه البحيرة'},
ms_w31_jog:{icon:'am_sports', en:'Jogging track & workout area', ar:'مضمار جري ومنطقة تمارين'},
ms_w31_calm:{icon:'am_yoga', en:'Meditation zone & relaxing area', ar:'منطقة تأمّل ومكان استرخاء'},
ms_w31_kids:{icon:'am_kids', en:'Kids play zone & cafe', ar:'منطقة لعب أطفال وكافيه'},
ms_w31_pets:{icon:'am_flower', en:'Pets zone & multipurpose area', ar:'منطقة حيوانات أليفة ومساحة متعددة الاستخدامات'},
ms_41_offices:{icon:'am_office', en:'Office & clinic spaces', ar:'مساحات مكاتب وعيادات'},
ms_41_retail:{icon:'am_retail', en:'Bank, market, jewellery & furniture', ar:'بنك وسوق ومجوهرات وأثاث'},
ms_41_dining:{icon:'am_dining', en:'Cafe & restaurant', ar:'كافيه ومطعم'},
ms_41_gym:{icon:'am_gym', en:'Gym & sports', ar:'جيم ورياضة'}
};
var DEV_AMENITIES = {
'sumou': ['bms','controls','fiber','cctv','heat','generators','parking','app',
'eco','landscape','concierge','housekeeping','gym','pool','sauna',
'outdoorfit','nursery','ev'],
'beitalbahr': ['bab_beach','bab_hotels','bab_finished','bab_landscape',
'bab_heart','bab_community','bab_lagoons','bab_fnb'],
'baghush': ['mb_lagoons','mb_beach','mb_spine','mb_bikes',
'mb_retail','mb_gym','mb_guards','mb_beachsvc'],
};
var DEV_FINISHING = {
'sumou': {en:'Residential delivered fully finished with air conditioning and double-glazed windows. Offices delivered core & shell with double-glazed windows.',
ar:'تُسلَّم الوحدات السكنية كاملة التشطيب مع تكييف ونوافذ مزدوجة العزل، وتُسلَّم المكاتب على المحارة مع نوافذ مزدوجة العزل.'},
'beitalbahr': {en:'Units are delivered fully finished, neatly designed and inspired by nature. The brochure specifies no further finishing detail.',
ar:'تُسلَّم الوحدات كاملة التشطيب بتصميم أنيق مستوحى من الطبيعة. ولا يذكر البروشور تفاصيل تشطيب أخرى.'}
};
function amenityAccordion(toks, title, note){
if(!toks || !toks.length) return null;
var grid = h('div',{class:'amen-grid amen-grid--stack'}, toks.map(function(k){
var a = AMENITY_CAT[k]; if(!a) return null;
return h('div',{class:'amen amen--stack'},
h('span',{class:'amen__ic'}, ic(a.icon)),
h('span',{class:'amen__lb'}, lang==='ar'?a.ar:a.en));
}));
var chev = sEl('svg',{class:'accordion__chev',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',
'stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'},
sEl('path',{d:'M6 9l6 6 6-6'}));
var sum = h('summary',{class:'accordion__sum amen-sum'},
h('span',{class:'amen-head'}, ic('star','amen-head__ic'),
h('h2',{class:'accordion__title'}, title)),
chev);
return h('section',{class:'amen-sec', id:'amenities'}, h('div',{class:'wrap'},
h('details',{class:'accordion amen-acc'}, sum,
h('div',{class:'accordion__body'}, grid,
note ? h('p',{class:'amen-note'}, ic('info'), h('span',null, note)) : null))));
}
function devAmenitiesSection(dev){
var fin = DEV_FINISHING[dev.key];
return amenityAccordion(DEV_AMENITIES[dev.key],
lang==='ar'?'المرافق والتشطيب':'Amenities & Finishing', fin ? L(fin) : null);
}
function projectAmenitiesSection(p){
return amenityAccordion(PROJECT_AMENITIES[p.slug],
lang==='ar'?'المرافق والخدمات':'Amenities',
lang==='ar'?'مرافق على مستوى المشروع — تُؤكَّد تفاصيلها مع المستشار.'
: 'Project-level amenities — confirm details with an advisor.');
}
var BAB_AMEN = ['bab_beach','bab_hotels','bab_finished','bab_landscape',
'bab_heart','bab_community','bab_lagoons','bab_fnb'];
var SS_AMEN  = ['ss_beach','ss_lagoons','ss_hotels','ss_clubs',
'ss_hospital','ss_piazza','ss_retail','ss_land'];
var ZE_AMEN  = ['ze_club','ze_park','ze_mall','ze_office',
'ze_clinics','ze_finished','ze_parking','ze_concierge'];
var PROJECT_AMENITIES = {
'crescent-walk': ['greenspine','centralpark','gardenparks',
'clubsports','commercialpark','neighborhoodpark'],
'district-5':    ['d5club','d5campus','urbanehotel',
'd5m','lifestylearea','mindhaus'],
'bab-shores':           BAB_AMEN,
'bab-roots':            BAB_AMEN,
'bab-rays':             BAB_AMEN,
'bab-hills-by-the-sea': BAB_AMEN,
'bab-hills':            BAB_AMEN,
'marsa-baghush': ['mb_lagoons','mb_beach','mb_spine','mb_bikes',
'mb_retail','mb_gym','mb_guards','mb_beachsvc'],
'silversands-crystalline': SS_AMEN,
'silversands-silvertown':  SS_AMEN,
'zed-east':         ZE_AMEN,
'zed-east-emerald': ZE_AMEN,
'zed-west':    ['zw_park','zw_sports','zw_mall','zw_lifestyle',
'zw_kids','zw_offices','zw_parking','zw_finished'],
'solana-west': ['sw_club','sw_football','sw_school','sw_daycare',
'sw_parks','sw_lanes','sw_center','sw_entertainment',
'sw_retail','sw_clinics','sw_serviced','sw_ev'],
'masyaf-ras-alhekma': ['ms_beachclub','ms_beachsports','ms_cabanas','ms_lagoons',
'ms_downtown','ms_ritsa','ms_padel','ms_peppermint',
'ms_kids','ms_mosque'],
'trio-new-cairo':     ['ms_trio_gardens','ms_trio_privacy','ms_trio_club','ms_trio_yoga',
'ms_trio_read','ms_trio_fit','ms_trio_kids','ms_trio_seat'],
'mist-new-cairo':     ['ms_mist_promenade','ms_mist_plaza','ms_mist_water','ms_mist_serviced',
'ms_mist_gym','ms_mist_sports','ms_mist_kids','ms_mist_cafe',
'ms_mist_calm','ms_mist_pets'],
'31-west-october':    ['ms_w31_lake','ms_w31_club','ms_w31_admin','ms_w31_fnb',
'ms_w31_jog','ms_w31_calm','ms_w31_kids','ms_w31_pets'],
'41-business-district':['ms_41_offices','ms_41_retail','ms_41_dining','ms_41_gym']
};
function amenityDefaults(cat){
return (cat==='coast'||cat==='redsea')
? ['beach','lagoon','pool','clubhouse','landscape','sports','retail','security']
: ['clubhouse','pool','gym','landscape','sports','kids','retail','security'];
}
function unitAmenities(u){
var p=u&&projBySlug(u.project); if(!p) return [];
var list = PROJECT_AMENITIES[u.project] || amenityDefaults(areaCat(p.area));
return list.filter(function(k){ return AMENITY_CAT[k]; });
}
function projectCoverSrc(p){ return (p && PROJECT_COVERS[p.slug]) || ''; }
function unitImageSrc(u){ return (u && UNIT_IMAGES[u.id]) || ''; }
function coverImg(src, alt, fallbackFn){
var img=h('img',{class:'artsvg proj-cover', src:src, alt:alt, loading:'lazy', decoding:'async'});
img.addEventListener('error', function(){ if(img.parentNode) img.parentNode.replaceChild(fallbackFn(), img); });
return img;
}
function projectMedia(p){
var src=projectCoverSrc(p);
return src ? coverImg(src, (lang==='ar'?p.name_ar:p.name), function(){ return projectArt(p); }) : projectArt(p);
}
function galleryHero(items, alt, title, chip, fallbackFn){
var media = h('div',{class:'detail-media detail-media--gal'});
var at = 0, n = items.length;
var img = h('img',{class:'artsvg proj-cover', src:items[0].src, alt:alt, loading:'lazy', decoding:'async'});
img.addEventListener('error', function(){
var f = fallbackFn && fallbackFn(); if(f && img.parentNode) img.parentNode.replaceChild(f, img); });
var count = h('span',{class:'gal-badge__n'});
var show = function(i){
at = (i + n) % n; img.src = items[at].src;
count.textContent = n > 1 ? ((at+1)+' / '+n) : (num(n)+' '+(lang==='ar'?'صورة':'photo'));
};
media.appendChild(img);
if(chip) media.appendChild(chip);
media.appendChild(h('span',{class:'gal-badge','aria-hidden':'true'}, ic('gallery','gal-badge__ic'), count));
if(n > 1){
var prev = h('button',{class:'gal-nav gal-nav--prev', type:'button','aria-label':(lang==='ar'?'الصورة السابقة':'Previous photo')}, ic('chevleft'));
var next = h('button',{class:'gal-nav gal-nav--next', type:'button','aria-label':(lang==='ar'?'الصورة التالية':'Next photo')}, ic('chevright'));
prev.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); show(at-1); });
next.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); show(at+1); });
media.appendChild(prev); media.appendChild(next);
}
img.addEventListener('click', function(){ mediaViewer(items, title, at); });
show(0);
return media;
}
var MSQ = '/project-media/msquared/';
var PROJECT_GALLERY = {
'alam-al-roum': ['city','coast','story','masterplan','boulevard','beach','lagoon',
'spine','arch','marina','golf']
.map(function(f){ return '/project-media/qataridiar/alam-al-roum/'+f+'.webp'; }),
'masyaf-ras-alhekma': ['masyaf-pool','masyaf-shore','masyaf-lagoon','masyaf-villa',
'masyaf-real-1','masyaf-interiors','masyaf-marmarica',
'masyaf-marmarica-room','masyaf-peppermint','masyaf-peppermint-in',
'masyaf-barten','masyaf-barten-dining','masyaf-ritsa',
'masyaf-ritsa-day','masyaf-ritsa-night','masyaf-hero']
.map(function(f){ return MSQ+f+'.webp'; }),
'trio-new-cairo': ['trio-exterior','trio-overview','trio-interior','trio-hero']
.map(function(f){ return MSQ+f+'.webp'; }),
'mist-new-cairo': ['mist-townhouse','mist-apartments','mist-name','mist-hero']
.map(function(f){ return MSQ+f+'.webp'; }),
'31-west-october': ['w31-lakeside','w31-villa','w31-garden','w31-overview','w31-hero']
.map(function(f){ return MSQ+f+'.webp'; }),
'41-business-district': ['b41-hero','b41-landmark','b41-interiors','b41-construction']
.map(function(f){ return MSQ+f+'.webp'; }),
};
function projectGalleryItems(p){
var g = PROJECT_GALLERY[p.slug]; if(!g || !g.length) return [];
var nm = lang==='ar' ? p.name_ar : p.name, n = g.length;
return g.map(function(s,i){ return {src:s, cap:nm+' ('+(i+1)+'/'+n+')'}; });
}
function unitMedia(u){
var p=projBySlug(u.project);
var src=unitImageSrc(u);
return src ? coverImg(src, (lang==='ar'?p.name_ar:p.name)+' — '+u.type, function(){ return projectArt(p); }) : projectArt(p);
}
function mediaViewer(items, label, start){
if(!items || !items.length) return;
var idx=0, scale=1, tx=0, ty=0, drag=false, ox=0, oy=0, moved=false;
var img=h('img',{class:'viewer__img', src:items[0].src, alt:label||'', decoding:'async', draggable:'false'});
var cap=h('div',{class:'viewer__cap'});
var counter=h('span',{class:'viewer__count'});
function apply(){ img.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; img.style.cursor=scale>1?'grab':'default'; }
function setZoom(s){ scale=Math.max(1, Math.min(5, Math.round(s*100)/100)); if(scale===1){tx=0;ty=0;} apply(); }
function show(i){ idx=(i+items.length)%items.length; img.src=items[idx].src; scale=1;tx=0;ty=0; apply();
cap.textContent=items[idx].cap||''; cap.style.display=items[idx].cap?'':'none';
counter.textContent=items.length>1?((idx+1)+' / '+items.length):''; }
var stage=h('div',{class:'viewer__stage'}, img);
stage.addEventListener('wheel', function(e){ e.preventDefault(); setZoom(scale+(e.deltaY<0?0.3:-0.3)); }, {passive:false});
img.addEventListener('dblclick', function(e){ e.preventDefault(); setZoom(scale>1?1:2.2); });
img.addEventListener('pointerdown', function(e){ if(scale<=1) return; drag=true; moved=false; ox=e.clientX-tx; oy=e.clientY-ty; if(img.setPointerCapture){ try{img.setPointerCapture(e.pointerId);}catch(_e){} } img.style.cursor='grabbing'; });
img.addEventListener('pointermove', function(e){ if(!drag) return; tx=e.clientX-ox; ty=e.clientY-oy; moved=true; apply(); });
function endDrag(){ drag=false; img.style.cursor=scale>1?'grab':'default'; }
img.addEventListener('pointerup', endDrag); img.addEventListener('pointercancel', endDrag);
function vbtn(icon, aria, fn){ var b=h('button',{class:'viewer__btn', type:'button','aria-label':aria}, ic(icon)); b.addEventListener('click', function(e){ e.stopPropagation(); fn(); }); return b; }
var lastFocus = (typeof document!=='undefined') ? document.activeElement : null;
function onKey(e){ if(e.key==='Escape') close(); else if(e.key==='ArrowLeft'&&items.length>1) show(idx-1); else if(e.key==='ArrowRight'&&items.length>1) show(idx+1); else if(e.key==='+'||e.key==='=') setZoom(scale+0.4); else if(e.key==='-'||e.key==='_') setZoom(scale-0.4); }
function close(){ document.removeEventListener('keydown', onKey); document.body.classList.remove('viewer-open'); if(overlay.parentNode) overlay.parentNode.removeChild(overlay); if(lastFocus&&lastFocus.focus){ try{lastFocus.focus();}catch(_e){} } }
var closeB=vbtn('x', (lang==='ar'?'إغلاق':'Close'), close);
var prev=vbtn('chevleft', (lang==='ar'?'السابق':'Previous'), function(){ show(idx-1); });
var next=vbtn('chevright', (lang==='ar'?'التالي':'Next'), function(){ show(idx+1); });
var bar=h('div',{class:'viewer__bar'},
vbtn('zoomout', (lang==='ar'?'تصغير':'Zoom out'), function(){ setZoom(scale-0.4); }),
vbtn('zoomin', (lang==='ar'?'تكبير':'Zoom in'), function(){ setZoom(scale+0.4); }));
var overlay=h('div',{class:'viewer', role:'dialog','aria-modal':'true','aria-label':label||'Viewer'},
h('div',{class:'viewer__top'}, h('span',{class:'viewer__title'}, label||''), counter, closeB),
items.length>1 ? h('div',{class:'viewer__nav'}, prev, next) : null,
stage,
h('div',{class:'viewer__foot'}, cap, bar));
overlay.addEventListener('click', function(e){ if((e.target===overlay||e.target===stage) && !moved) close(); });
document.addEventListener('keydown', onKey);
document.body.appendChild(overlay); document.body.classList.add('viewer-open');
show(start||0); if(closeB.focus){ closeB.focus(); }
return overlay;
}
function unitFeatureRow(u){
var p=projBySlug(u.project), area=p?areaByKey(p.area):null;
var pnm=p?(lang==='ar'?p.name_ar:p.name):'';
var loc=unitLocationImg(u), fps=unitFloorplans(u), mps=unitMasterplans(u), ams=unitAmenities(u), gal=unitGalleryItems(u);
var row=h('div',{class:'ufeat-row'});
function chip(icon, label, fn){ var b=h('button',{class:'ufeat', type:'button'}, ic(icon,'ufeat__ic'), h('span',null,label)); b.addEventListener('click', fn); return b; }
if(gal.length) row.appendChild(chip('gallery', (lang==='ar'?'صور الوحدة':'Photos'), function(){
mediaViewer(gal, (lang==='ar'?'صور · ':'Photos · ')+pnm); }));
if(loc) row.appendChild(chip('pin', (lang==='ar'?'الموقع':'Location'), function(){
mediaViewer([{src:loc, cap:(area?L(area.name):'')}], (lang==='ar'?'الموقع · ':'Location · ')+(area?L(area.name):pnm)); }));
if(fps.length) row.appendChild(chip('floorplan', (lang==='ar'?'مخطط الوحدة':'Floor Plan'), function(){
mediaViewer(fps.map(function(s,i){ return {src:s, cap:(lang==='ar'?'مخطط الوحدة':'Floor plan')+(fps.length>1?(' '+(i+1)):'')}; }), (lang==='ar'?'مخطط الوحدة · ':'Floor Plan · ')+pnm); }));
if(mps.length) row.appendChild(chip('masterplan', (lang==='ar'?'الماستر بلان':'Master Plan'), function(){
mediaViewer(mps.map(function(s,i){ return {src:s, cap:(lang==='ar'?'الماستر بلان':'Master plan')+(mps.length>1?(' '+(i+1)):'')}; }), (lang==='ar'?'الماستر بلان · ':'Master Plan · ')+pnm); }));
if(ams.length) row.appendChild(chip('star', (lang==='ar'?'المرافق':'Amenities'), function(){
var el=document.getElementById('amenities'); if(el&&el.scrollIntoView){ el.scrollIntoView({behavior:'smooth', block:'start'}); } }));
return row.childNodes.length ? row : null;
}
function amenitiesSection(u){
var ams=unitAmenities(u); if(!ams.length) return null;
var grid=h('div',{class:'amen-grid'}, ams.map(function(k){ var a=AMENITY_CAT[k];
return h('div',{class:'amen'}, h('span',{class:'amen__ic'}, ic(a.icon)), h('span',{class:'amen__lb'}, lang==='ar'?a.ar:a.en)); }));
return h('section',{class:'amen-sec', id:'amenities'}, h('div',{class:'wrap'},
h('div',{class:'amen-head'}, ic('star','amen-head__ic'), h('h2',null, lang==='ar'?'المرافق والخدمات':'Amenities')),
grid,
h('p',{class:'amen-note'}, ic('info'), h('span',null, lang==='ar'?'مرافق على مستوى الكمبوند — تُؤكَّد تفاصيلها مع المستشار.':'Compound-level amenities — confirm details with an advisor.'))));
}
function projectArt(p){
var cat=areaCat(p.area), dev=devByKey(p.dev)||{}, accent=dev.c1||'#1a7ba0';
var rand=rng(hashN(p.slug)), id=(ART_ID++);
var svg=sEl('svg',{viewBox:'0 0 400 250', class:'artsvg', preserveAspectRatio:'xMidYMid slice', role:'img', 'aria-label':(lang==='ar'?p.name_ar:p.name)});
var defs=sEl('defs'), g=sEl('linearGradient',{id:'sk'+id,x1:'0',y1:'0',x2:'0',y2:'1'});
g.appendChild(sEl('stop',{offset:'0','stop-color':cat==='coast'?'#0c5f76':'#0a4a61'}));
g.appendChild(sEl('stop',{offset:'1','stop-color':'#05303f'}));
defs.appendChild(g); svg.appendChild(defs);
svg.appendChild(sEl('rect',{x:'0',y:'0',width:'400',height:'250',fill:'url(#sk'+id+')'}));
var sx=290+rand()*70, sy=44+rand()*26;
svg.appendChild(sEl('circle',{cx:sx,cy:sy,r:'44',fill:accent,opacity:'0.16'}));
svg.appendChild(sEl('circle',{cx:sx,cy:sy,r:'28',fill:accent,opacity:'0.92'}));
var i,bx,bw,bh,by;
if(cat==='coast'){
svg.appendChild(sEl('rect',{x:'0',y:'172',width:'400',height:'78',fill:'#0e6f86',opacity:'0.5'}));
for(i=0;i<3;i++) svg.appendChild(sEl('path',{d:'M0 '+(192+i*15)+' q 50 -8 100 0 t 100 0 t 100 0 t 100 0', stroke:'#bfe3ef', fill:'none','stroke-width':'2', opacity:(0.22-i*0.05).toFixed(2)}));
for(i=0;i<4;i++){ bx=34+i*92+rand()*8; bw=56; by=150;
svg.appendChild(sEl('rect',{x:bx,y:by,width:bw,height:'24',fill:'#F3EFE6',opacity:'0.94'}));
svg.appendChild(sEl('path',{d:'M'+(bx-6)+' '+by+' L'+(bx+bw/2)+' '+(by-19)+' L'+(bx+bw+6)+' '+by+' Z',fill:shade(accent,-0.08)}));
svg.appendChild(sEl('rect',{x:bx+bw/2-5,y:by+8,width:'10',height:'16',fill:shade(accent,-0.2)})); }
for(i=0;i<3;i++) svg.appendChild(palm(72+i*128,150));
} else if(cat==='capital'){
for(i=0;i<6;i++){ bw=32+rand()*12; bx=18+i*63; bh=95+rand()*105; by=250-bh;
svg.appendChild(sEl('rect',{x:bx,y:by,width:bw,height:bh,rx:'2',fill:i%2?shade(accent,-0.18):'#0f5a70',opacity:'0.96'}));
svg.appendChild(sEl('rect',{x:bx+bw/2-2,y:by-12,width:'4',height:'12',fill:accent}));
winGrid(svg,bx,by,bw,bh,rand); }
} else {
for(i=0;i<5;i++){ bw=46+rand()*16; bx=16+i*76; bh=62+rand()*72; by=250-bh;
svg.appendChild(sEl('rect',{x:bx,y:by,width:bw,height:bh,rx:'3',fill:i%2?'#0f5a70':shade(accent,-0.14),opacity:'0.96'}));
winGrid(svg,bx,by,bw,bh,rand); }
for(i=0;i<4;i++) svg.appendChild(tree(52+i*98,236));
}
svg.appendChild(sEl('rect',{x:'0',y:'238',width:'400',height:'12',fill:'#052430'}));
return svg;
}
function unitArt(name){
var n=String(name||'').toLowerCase();
var svg=sEl('svg',{viewBox:'0 0 120 90', class:'unitsvg', preserveAspectRatio:'xMidYMid meet','aria-hidden':'true'});
svg.appendChild(sEl('rect',{x:'0',y:'0',width:'120',height:'90',rx:'10',fill:'#e7f0f3'}));
var teal='#0d6270';
function grid(x0,y0,x1,y1){ for(var y=y0;y<y1-6;y+=10) for(var x=x0;x<x1-6;x+=10) svg.appendChild(sEl('rect',{x:x,y:y,width:'5',height:'6',rx:'1',fill:'#F3EFE6',opacity:'0.9'})); }
if(/villa|twin|town/.test(n)){
svg.appendChild(sEl('rect',{x:'20',y:'70',width:'80',height:'6',fill:'#cfe0e5'}));
svg.appendChild(sEl('rect',{x:'34',y:'44',width:'52',height:'30',fill:teal}));
svg.appendChild(sEl('path',{d:'M28 44 L60 24 L92 44 Z',fill:'#115F7D'}));
svg.appendChild(sEl('rect',{x:'54',y:'54',width:'13',height:'20',fill:'#F3EFE6'}));
svg.appendChild(sEl('circle',{cx:'104',cy:'66',r:'7',fill:'#20855f'}));
} else if(/chalet|cabin/.test(n)){
svg.appendChild(sEl('circle',{cx:'98',cy:'22',r:'9',fill:'#f0b429'}));
svg.appendChild(sEl('rect',{x:'36',y:'42',width:'48',height:'26',fill:teal}));
svg.appendChild(sEl('path',{d:'M30 42 L60 26 L90 42 Z',fill:'#115F7D'}));
svg.appendChild(sEl('rect',{x:'0',y:'72',width:'120',height:'18',fill:'#0e6f86',opacity:'0.5'}));
svg.appendChild(palmSm(20,72));
} else if(/duplex|penthouse|loft/.test(n)){
svg.appendChild(sEl('rect',{x:'36',y:'24',width:'48',height:'52',fill:teal}));
svg.appendChild(sEl('rect',{x:'36',y:'49',width:'48',height:'3',fill:'#e7f0f3'}));
grid(42,30,80,74);
} else {
svg.appendChild(sEl('rect',{x:'42',y:'18',width:'36',height:'58',rx:'3',fill:teal}));
grid(48,24,74,72);
svg.appendChild(sEl('rect',{x:'56',y:'66',width:'8',height:'10',fill:'#F3EFE6'}));
}
svg.appendChild(sEl('rect',{x:'0',y:'76',width:'120',height:'4',fill:'#cfe0e5'}));
return svg;
}
function palmSm(x,y){ return sEl('g',{opacity:'0.9'},
sEl('path',{d:'M'+x+' '+y+' q 2 -12 0 -20',stroke:'#093a4c','stroke-width':'2',fill:'none'}),
sEl('circle',{cx:x,cy:y-20,r:'6',fill:'#1e7a5a'})); }
var LOGO_BASE = '/logos/';
var DEV_LOGOS = {
sodic:'sodic.png', palmhills:'palm-hills.png', mountainview:'mountain-view.png',
ora:'ora.png', tatweer:'tatweer-misr.png', misritalia:'misr-italia.png',
marakez:'marakez.png', lmd:'lmd.png', hydepark:'hyde-park.png',
marasem:'al-marasem.png', modon:'modon.png', msquared:'m-squared.png',
emaarmisr:'emaar-misr.png', orascom:'orascom.png', tmg:'tmg.png',
alahlysabbour:'al-ahly-sabbour.png', hassanallam:'hassan-allam.png',
ilcazar:'il-cazar.png', inertia:'inertia.png', lavista:'la-vista.png',
cityedge:'city-edge.png', madinetmasr:'madinet-masr.png',
qataridiar:'qatari-diar.png', saudiegyptian:'saudi-egyptian.png',
sumou:'sumou.png', beitalbahr:'beit-al-bahr.png', baghush:'marsa-baghush.png'
};
var PROJECT_LOGOS = {
'villette':'villette.png', 'sodic-east':'sodic-east.png', 'eastown':'eastown.png',
'allegria':'allegria.png', 'ogami-north-coast':'ogami.png',
'caesar-north-coast':'caesar.png', 'june-north-coast':'june.png',
'the-estates-zayed':'the-estates.png'
};
function logoNorm(s){ return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]+/g,''); }
var DEV_ALIAS = {};
function setAlias(tok, key){ if(tok) DEV_ALIAS[tok] = key; }
function aliasGet(tok){ return tok ? DEV_ALIAS[tok] : undefined; }
(function(){
for(var i=0;i<DEVELOPERS.length;i++){
var d=DEVELOPERS[i];
setAlias(logoNorm(d.key), d.key);
if(d.name){ setAlias(logoNorm(d.name.en), d.key); setAlias(logoNorm(d.name.ar), d.key); }
}
var extra = { almarasem:'marasem', marasem:'marasem', oradevelopers:'ora',
palmhillsdevelopments:'palmhills', hydeparkdevelopments:'hydepark',
misritaliaproperties:'misritalia', tatweermisr:'tatweer', mountainview:'mountainview' };
for(var k in extra){ if(extra.hasOwnProperty(k) && DEV_ALIAS[k]===undefined) DEV_ALIAS[k]=extra[k]; }
})();
function devKeyFor(dev){
if(!dev) return '';
if(DEV_LOGOS[dev.key]) return dev.key;
var k = aliasGet(logoNorm(dev.key))
|| (dev.name && (aliasGet(logoNorm(dev.name.en)) || aliasGet(logoNorm(dev.name.ar))));
return (k && DEV_LOGOS[k]) ? k : '';
}
function logoFile(name, small){
return String(name).replace(/\.(png|jpe?g)$/i, (small ? '-160' : '') + '.webp');
}
function devLogoSrc(dev, small){
var k=devKeyFor(dev);
return k ? (LOGO_BASE+logoFile(DEV_LOGOS[k], small)) : '';
}
function projectLogoSrc(p){
return (p && PROJECT_LOGOS[p.slug]) ? (LOGO_BASE+'projects/'+logoFile(PROJECT_LOGOS[p.slug])) : '';
}
function logoAlt(name){ return lang==='ar' ? ('شعار '+name) : (name+' logo'); }
function devMonogram(dev, px){
var c=(dev&&dev.c1)?dev.c1:'#0d6e7d';
return h('div',{class:'dev-logo', 'aria-hidden':'true',
style:'width:'+px+'px;height:'+px+'px;border-radius:'+Math.round(px*0.26)+'px;font-size:'+Math.round(px*0.4)+'px;background:linear-gradient(150deg,'+c+','+shade(c,-0.5)+')'},
initials(L(dev.name)));
}
function devBadge(dev, px){
px=px||44;
var src=devLogoSrc(dev, px<=120);
if(src){
var img=h('img',{class:'dev-logo dev-logo--img', src:src, alt:logoAlt(L(dev.name)),
loading:'lazy', decoding:'async', width:px, height:px,
style:'width:'+px+'px;height:'+px+'px;border-radius:'+Math.round(px*0.22)+'px'});
img.addEventListener('error', function(){ if(img.parentNode) img.parentNode.replaceChild(devMonogram(dev,px), img); });
return img;
}
return devMonogram(dev,px);
}
var MV = '/project-media/mountainview/';
var SD = '/project-media/sodic/';
var DEV_GALLERY = {
'marakez':['/project-media/marakez/crescent-park.webp','/project-media/marakez/mall-of-arabia.webp','/project-media/marakez/aeon-tower.webp','/project-media/marakez/d5-campus.webp','/project-media/marakez/the-park.webp'],
'sumou':['/project-media/sumou/st-03.webp','/project-media/sumou/st-01.webp','/project-media/sumou/ap5-0.webp','/project-media/sumou/st-02.webp','/project-media/sumou/ap2-03.webp','/project-media/sumou/of4.webp'],
'modon':['/project-media/modon/m1.webp','/project-media/modon/m2.webp','/project-media/modon/m3.webp',
'/project-media/modon/m4.webp','/project-media/modon/m5.webp','/project-media/modon/m6.webp'],
'sodic':[SD+'sodic-west.webp', SD+'the-estates.webp', SD+'eastown.webp',
SD+'villette.webp', SD+'caesar.webp', SD+'ogami.webp'],
'mountainview':[MV+'park.webp', MV+'jirian.webp',
MV+'crysta.webp', MV+'hyde-park.webp'],
'msquared':['/project-media/msquared/masyaf-pool.webp',
'/project-media/msquared/trio-exterior.webp',
'/project-media/msquared/w31-lakeside.webp',
'/project-media/msquared/mist-townhouse.webp',
'/project-media/msquared/b41-hero.webp',
'/project-media/msquared/masyaf-ritsa-night.webp'],
'ora':['/project-media/ora/brochure/silversands-beach.webp',
'/project-media/ora/brochure/zedeast-park.webp',
'/project-media/ora/brochure/zedwest-park.webp',
'/project-media/ora/brochure/solana-spine.webp',
'/project-media/ora/brochure/solanaeast-lake.webp',
'/project-media/ora/brochure/zedeast-strip.webp'],
'baghush':['/project-media/baghush/beach-aerial.webp','/project-media/baghush/lagoon-drone.webp',
'/project-media/baghush/lagoon-firepit.webp','/project-media/baghush/botanical-path.webp',
'/project-media/baghush/terrace.webp','/project-media/baghush/villa-p1.webp'],
'beitalbahr':['/project-media/beitalbahr/terrace.webp','/project-media/beitalbahr/living.webp',
'/project-media/beitalbahr/interior.webp','/project-media/beitalbahr/landscape.webp',
'/project-media/beitalbahr/lagoon.webp','/project-media/beitalbahr/hotel.webp'],
};
function devGallery(key){ return DEV_GALLERY[key] || []; }
function devGalleryItems(dev){
var g = devGallery(dev.key), n = g.length, nm = L(dev.name);
return g.map(function(s,i){ return {src:s, cap:nm+(n>1?(' · '+(lang==='ar'?'صورة ':'Photo ')+(i+1)+'/'+n):'')}; });
}
function photoFlipper(items, label, cls, w, hgt, eager){
var n = items.length, idx = 0;
var box = h('div',{class:cls});
var img = h('img',{src:items[0].src, alt:label, decoding:'async',
loading:(eager?'eager':'lazy'), width:w, height:hgt});
img.addEventListener('error', function(){ if(box.parentNode) box.parentNode.removeChild(box); });
var count = h('span',{class:'gal-badge__n'});
function show(i){ idx=(i+n)%n; img.src=items[idx].src; count.textContent=(idx+1)+' / '+n; }
box.appendChild(img);
if(n>1){
box.appendChild(h('span',{class:'gal-badge','aria-hidden':'true'}, ic('gallery','gal-badge__ic'), count));
var prev = h('button',{class:'gal-nav gal-nav--prev', type:'button','aria-label':(lang==='ar'?'الصورة السابقة':'Previous photo')}, ic('chevleft'));
var next = h('button',{class:'gal-nav gal-nav--next', type:'button','aria-label':(lang==='ar'?'الصورة التالية':'Next photo')}, ic('chevright'));
prev.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); show(idx-1); });
next.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); show(idx+1); });
box.appendChild(prev); box.appendChild(next);
show(0);
}
img.addEventListener('click', function(){ mediaViewer(items, label, idx); });
return box;
}
function devGalleryStrip(dev){
var items = devGalleryItems(dev); if(!items.length) return null;
return photoFlipper(items, L(dev.name), 'dev-gal', 1280, 549, true);
}
var RELEASES = [{
slug:'modon', dev:'modon', area:'raselhekma',
name:{en:'MODON', ar:'مدن'},
blurb:{en:'A new release of Modon Ras El Hekma apartments, re-priced by the developer. Primary sale, direct from Modon.',
ar:'إطلاق جديد لشقق مدن رأس الحكمة بأسعار محدَّثة من المطوّر. بيع أولي مباشر من مدن.'},
masterplan:[
{src:'/project-media/modon/rk-masterplan-1.webp', cap:{en:'Ras El Hekma · Wadi Yemm masterplan', ar:'رأس الحكمة · الماستر بلان — وادي يم'}},
{src:'/project-media/modon/rk-masterplan-2.webp', cap:{en:'Ras El Hekma · plot detail', ar:'رأس الحكمة · تفاصيل القطع'}}
],
projects:[
{name:{en:'Boulevard', ar:'بوليفارد'}, img:'/project-media/modon/ap2-bl-0.webp',
dp:10, years:8, delivery:'2029', eoi:250000,
units:[{beds:1, baths:2, size:93,  price:16100000},
{beds:2, baths:3, size:145, price:22500000},
{beds:3, baths:3, size:197, price:26700000}]},
{name:{en:'Beach Plaza Premium', ar:'بيتش بلازا بريميوم'}, img:'/project-media/modon/ap1-bp-03.webp',
dp:10, years:8, delivery:'2029', eoi:250000,
units:[{beds:1, baths:2, size:93,  price:19000000},
{beds:2, baths:3, size:145, price:26000000},
{beds:3, baths:3, size:197, price:32000000}]}
]
}];
function releaseBySlug(s){ for(var i=0;i<RELEASES.length;i++){ if(RELEASES[i].slug===s) return RELEASES[i]; } return null; }
function releaseFrom(r){
var all=[]; r.projects.forEach(function(p){ p.units.forEach(function(u){ if(u.price!=null) all.push(u.price); }); });
return all.length ? Math.min.apply(null, all) : null;
}
function releaseMasterplan(r){
return (r.masterplan||[]).map(function(m){ return {src:m.src, cap:L(m.cap)}; });
}
var MP = '/project-media/modon/';
var ORB = '/project-media/ora/brochure/';
var SU = '/project-media/sumou/';
var BAB = '/project-media/beitalbahr/';
var MB  = '/project-media/baghush/';
var DEV_FEATURES = {
'marakez': {
masterplan: {en:'Masterplan — District Five', ar:'الماستر بلان — ديستريكت فايف', icon:'layers', src:'/project-media/marakez/d5-masterplan.webp'},
cards: [
{en:'About Marakez', ar:'عن مراكز', icon:'shield', imgs:['/project-media/marakez/mall-of-arabia.webp'],
copy:{
lead:{en:'Marakez is the leading mixed-use developer in Egypt, with a portfolio spanning Mall of Arabia, Mall of Tanta, Town Center, D5M, Mall of Mansoura, Aeon Towers, Aeon Courtyards, District Five and Mindhaus offices. It grew from a single asset — Mall of Arabia — into one of the country’s most established developers.',
ar:'مراكز هي المطوّر الرائد متعدد الاستخدامات في مصر، بمحفظة تضم مول العرب ومول طنطا وتاون سنتر وD5M ومول المنصورة وأبراج إيون وإيون كورتيارد وديستريكت فايف ومكاتب مايندهاوس. نمت من أصل واحد — مول العرب — لتصبح من أرسخ المطوّرين في البلاد.'},
more:{en:'Its holding company is Fawaz Al Hokair Group, founded in 1989 — a multinational operating across fashion retail, shopping centres, F&B, entertainment and hotels, and later construction, financial services, health care, hospitality and energy. Marakez builds through its own contractor, FAS Construction.',
ar:'الشركة القابضة هي مجموعة فواز الحكير، التي تأسست عام ١٩٨٩ — مجموعة متعددة الجنسيات تعمل في تجارة الأزياء ومراكز التسوق والأغذية والمشروبات والترفيه والفنادق، ثم الإنشاءات والخدمات المالية والرعاية الصحية والضيافة والطاقة. وتبني مراكز عبر مقاولها الخاص «FAS Construction».'},
groups:[
{label:{en:'The group in numbers', ar:'المجموعة بالأرقام'}, rows:[
{k:{en:'Founded',ar:'تأسست'},                                    v:{en:'1989',ar:'١٩٨٩'}},
{k:{en:'International fashion brands',ar:'علامات أزياء عالمية'}, v:{en:'80',ar:'٨٠'}},
{k:{en:'Stores',ar:'متجر'},                                      v:{en:'2,100+',ar:'‏+٢٬١٠٠'}},
{k:{en:'Countries',ar:'دولة'},                                   v:{en:'16',ar:'١٦'}},
{k:{en:'Shopping malls',ar:'مركز تسوق'},                         v:{en:'21',ar:'٢١'}},
{k:{en:'Retail real estate managed',ar:'عقارات تجزئة مُدارة'},   v:{en:'1.5 million m²+',ar:'‏+١٫٥ مليون م²'}}]},
{label:{en:'Firsts in Egypt', ar:'الأوائل في مصر'}, rows:[
{k:{en:'First park inside a shopping centre',ar:'أول حديقة داخل مركز تسوق'},                v:{en:'Mall of Arabia',ar:'مول العرب'}},
{k:{en:'First residential tower outside downtown Cairo',ar:'أول برج سكني خارج وسط القاهرة'}, v:{en:'Aeon Towers',ar:'أبراج إيون'}},
{k:{en:'First developer into Egypt’s secondary cities',ar:'أول مطوّر يدخل مدن مصر الثانوية'}, v:{en:'Tanta, Mansoura',ar:'طنطا، المنصورة'}},
{k:{en:'First compound in New Katameya',ar:'أول كمبوند في القطامية الجديدة'},               v:{en:'District 5 Residences',ar:'ديستريكت ٥ ريزيدنسز'}}]}]
}},
{en:'A District, Not a Compound', ar:'حي متكامل لا مجرد كمبوند', icon:'layers', imgs:['/project-media/marakez/d5-residences.webp','/project-media/marakez/crescent-masterplan.webp'],
copy:{
lead:{en:'District Five is a 268-acre integrated mixed-use development — one destination to live, shop, play, work and grow. It holds District 5 Residences, the D5M mall, District 5 Campus and Mindhaus offices, the District 5 Club and a hotel, all under a single masterplan.',
ar:'ديستريكت فايف تطوير متكامل متعدد الاستخدامات على ٢٦٨ فدان — وجهة واحدة للسكن والتسوق واللعب والعمل والنمو. يضم ديستريكت ٥ ريزيدنسز ومول D5M وديستريكت ٥ كامبس ومكاتب مايندهاوس ونادي ديستريكت ٥ وفندقاً، كلها تحت مخطط واحد.'},
list:[
{en:'District 5 Residences — the first compound in New Katameya',ar:'ديستريكت ٥ ريزيدنسز — أول كمبوند بالقطامية الجديدة'},
{en:'D5M — the first shopping mall in New Cairo',ar:'D5M — أول مول في القاهرة الجديدة'},
{en:'District 5 Campus and Mindhaus offices',ar:'ديستريكت ٥ كامبس ومكاتب مايندهاوس'},
{en:'District 5 Club and the Urbane Hotel',ar:'نادي ديستريكت ٥ وفندق أوربان'},
{en:'Trail systems, bike lanes, landscaped parks and plazas',ar:'مسارات مشي ودراجات وحدائق وساحات'}],
more:{en:'Aeon in West Cairo works the same way: a 21-acre complex of four building blocks around three courtyards, with a promenade that continues past the site boundary directly into Mall of Arabia and its 350+ stores. Phases 1 and 2 of Aeon Courtyards were delivered ahead of schedule.',
ar:'وإيون في غرب القاهرة تعمل بالمنطق نفسه: مجمّع على ٢١ فدان من أربع كتل حول ثلاثة أفنية، مع ممشى يمتد خارج حدود الموقع مباشرة إلى مول العرب وأكثر من ٣٥٠ متجراً. وقد سُلِّمت المرحلتان الأولى والثانية من إيون كورتيارد قبل موعدهما.'},
groups:[
{label:{en:'Land areas', ar:'المساحات'}, rows:[
{k:{en:'District Five',ar:'ديستريكت فايف'},               v:{en:'268 acres',ar:'٢٦٨ فدان'}},
{k:{en:'Aeon',ar:'إيون'},                                 v:{en:'21 acres',ar:'٢١ فدان'}},
{k:{en:'Aeon Courtyards units',ar:'وحدات إيون كورتيارد'}, v:{en:'54–294 m²',ar:'٥٤–٢٩٤ م²'}}]}]
}},
{en:'Retail at the Core', ar:'التجزئة في القلب', icon:'star', imgs:['/project-media/marakez/the-park.webp','/project-media/marakez/mall-of-arabia.webp'],
copy:{
lead:{en:'Marakez builds the mall first and the homes around it. Mall of Arabia covers 621,401 m² (147.95 acres) with over 350 stores, a hypermarket, a cinema-plex and The Park — 34,000 m² of greenery inside the mall, and the first park within a shopping centre in Egypt.',
ar:'مراكز تبني المول أولاً ثم المساكن حوله. مول العرب على ٦٢١٬٤٠١ م² (١٤٧٫٩٥ فدان) بأكثر من ٣٥٠ متجراً وهايبر ماركت ومجمّع سينمات و«ذا بارك» — ٣٤٬٠٠٠ م² من المساحات الخضراء داخل المول، وهي أول حديقة داخل مركز تسوق في مصر.'},
more:{en:'The same model went to the Delta. Mall of Tanta offers 35,000 m² of leasable area and more than 140 shops; Mall of Mansoura spreads over 155,000 m² as an open mall around three plazas, ten minutes from Mansoura University, bringing the first properly planned public realm to the city.',
ar:'ونُقل النموذج نفسه إلى الدلتا. مول طنطا يوفّر ٣٥٬٠٠٠ م² مساحة تأجيرية وأكثر من ١٤٠ متجراً؛ ومول المنصورة يمتد على ١٥٥٬٠٠٠ م² كمول مفتوح حول ثلاث ساحات، على بُعد عشر دقائق من جامعة المنصورة، ليجلب أول نطاق عام مخطّط للمدينة.'},
groups:[
{label:{en:'The malls', ar:'المولات'}, rows:[
{k:{en:'Mall of Arabia',ar:'مول العرب'},      v:{en:'621,401 m² · 350+ stores',ar:'٦٢١٬٤٠١ م² · ‏+٣٥٠ متجر'}},
{k:{en:'Mall of Mansoura',ar:'مول المنصورة'}, v:{en:'155,000 m²',ar:'١٥٥٬٠٠٠ م²'}},
{k:{en:'Town Center',ar:'تاون سنتر'},         v:{en:'64,000 m² · 25,000 m² leasable',ar:'٦٤٬٠٠٠ م² · ٢٥٬٠٠٠ م² تأجيرية'}},
{k:{en:'Mall of Tanta',ar:'مول طنطا'},        v:{en:'35,000 m² · 140+ shops',ar:'٣٥٬٠٠٠ م² · ‏+١٤٠ متجر'}},
{k:{en:'The Park',ar:'ذا بارك'},              v:{en:'34,000 m² of greenery',ar:'٣٤٬٠٠٠ م² مساحات خضراء'}}]}]
}},
{en:'The Coast — ramla', ar:'الساحل — رملة', icon:'pin', imgs:['/project-media/marakez/ramla-aerial.webp','/project-media/marakez/ramla-villa.webp'],
copy:{
lead:{en:'ramla sits on the shores of Ras El Hekma bay, with 1.4 kilometres of white-sand beach. Its masterplan is organised into six neighbourhoods — Seaside East, The Town, Lakeside, The Ranches, Seaside West and The Resort — linked by walkable, bikeable paths.',
ar:'تقع رملة على شواطئ خليج رأس الحكمة، بشاطئ رملي أبيض طوله ١٫٤ كيلومتر. ومخططها منظّم في ستة أحياء — سيسايد إيست، ذا تاون، ليك سايد، ذا رانشز، سيسايد ويست، وذا ريزورت — تربطها ممرات للمشي والدراجات.'},
list:[
{en:'A lifestyle of wellbeing — open spaces to move, gather and connect',ar:'أسلوب حياة قائم على العافية — مساحات مفتوحة للحركة واللقاء والتواصل'},
{en:'The simple pleasure of walking — sandy paths linking every neighbourhood to the beach',ar:'متعة المشي البسيطة — ممرات رملية تربط كل حي بالشاطئ'},
{en:'Authentic modernity — interpreting local traditions in new ways',ar:'حداثة أصيلة — تفسير التقاليد المحلية بطرق جديدة'},
{en:'Ecological intelligence — designed to work with nature, not against it',ar:'ذكاء بيئي — مصمّمة لتعمل مع الطبيعة لا ضدها'}],
more:{en:'Egypt’s North Coast stretches around 1,050 km (650 mi) of Mediterranean shoreline. ramla sits ten minutes from Caesar, twenty from Almaza Bay and thirty-five from Hacienda Red.',
ar:'يمتد الساحل الشمالي لمصر نحو ١٬٠٥٠ كم (٦٥٠ ميلاً) من شاطئ المتوسط. وتقع رملة على بُعد عشر دقائق من قيصر، وعشرين من ألماظة باي، وخمس وثلاثين من هاسيندا ريد.'},
groups:[
{label:{en:'Drive times', ar:'أزمنة الوصول'}, rows:[
{k:{en:'Caesar',ar:'قيصر'},               v:{en:'10 min',ar:'١٠ دقائق'}},
{k:{en:'Almaza Bay',ar:'ألماظة باي'},     v:{en:'20 min',ar:'٢٠ دقيقة'}},
{k:{en:'Hacienda Red',ar:'هاسيندا ريد'},  v:{en:'35 min',ar:'٣٥ دقيقة'}}]}]
}}
]
},
'sumou': {
masterplan: {en:'Masterplan — The Nexus', ar:'الماستر بلان — ذا نيكسس', icon:'layers', src:SU+'mp-s.webp'},
cards: [
{en:'About Sumou Investment', ar:'عن سمو للاستثمار', icon:'shield', imgs:[SU+'st-01.webp'],
copy:{
lead:{en:'Sumou Investment is a leading company in Saudi Arabia that develops hospitality, entertainment and real-estate projects. It focuses on innovation, luxury and culture to create world-class destinations that enhance visitor experiences and support the Kingdom\u2019s tourism and economic growth.',
ar:'سمو للاستثمار شركة رائدة في المملكة العربية السعودية تطوّر مشروعات الضيافة والترفيه والعقارات. تركّز على الابتكار والفخامة والثقافة لصناعة وجهات عالمية المستوى ترتقي بتجربة الزائر وتدعم نمو السياحة والاقتصاد في المملكة.'},
more:{en:'The group operates across Egypt, Saudi Arabia and London, with signed hospitality operators including Rotana, Kempinski, Raffles, Novotel and Marriott. Its Saudi portfolio includes Sumou Park in Riyadh, Sumou Perla and Sumou Center in Khobar, and Sumou Towers on Jeddah\u2019s Corniche.',
ar:'تعمل المجموعة في مصر والسعودية ولندن، ومن مشغّلي الضيافة المتعاقدين معها روتانا وكمبينسكي ورافلز ونوفوتيل وماريوت. وتضم محفظتها السعودية سمو بارك بالرياض، وسمو بيرلا وسمو سنتر بالخبر، وأبراج سمو على كورنيش جدة.'},
groups:[
{label:{en:'Track record', ar:'السجل'}, rows:[
{k:{en:'Years of achievements',ar:'سنوات من الإنجاز'},        v:{en:'16+',ar:'‏+١٦'}},
{k:{en:'Development area',ar:'مساحة التطوير'},                v:{en:'60+ million m\u00b2',ar:'‏+٦٠ مليون م²'}},
{k:{en:'Building areas',ar:'مساحات المباني'},                 v:{en:'3.5M',ar:'٣٫٥ مليون'}},
{k:{en:'Residential units',ar:'وحدات سكنية'},                 v:{en:'12k',ar:'‏١٢ ألف'}},
{k:{en:'Full-scale development projects',ar:'مشروعات تطوير متكاملة'}, v:{en:'10',ar:'١٠'}},
{k:{en:'Superstructure projects',ar:'مشروعات إنشائية'},       v:{en:'07',ar:'٠٧'}},
{k:{en:'Cities in Saudi Arabia',ar:'مدن بالسعودية'},          v:{en:'08',ar:'٠٨'}},
{k:{en:'Provinces in Saudi Arabia',ar:'مناطق بالسعودية'},     v:{en:'06',ar:'٠٦'}},
{k:{en:'Neighbourhoods & communities',ar:'أحياء ومجتمعات'},   v:{en:'03',ar:'٠٣'}}]}]
}},
{en:'A Connected City', ar:'مدينة متصلة', icon:'pin', imgs:[SU+'lo-s.webp'],
copy:{
lead:{en:'Sumou Boulevard is strategically located in Mostakbal City at the heart of East Greater Cairo, positioned between East Cairo and the New Administrative Capital. Its place at the main gateway of the development gives it high visibility and strong footfall from residents and visitors entering the area.',
ar:'يقع سمو بوليفارد في موقع استراتيجي بمدينة المستقبل في قلب شرق القاهرة الكبرى، بين شرق القاهرة والعاصمة الإدارية الجديدة. وموقعه عند المدخل الرئيسي للتطوير يمنحه ظهوراً قوياً وحركة كثيفة من السكان والزوار.'},
more:{en:'The district is easily accessible with strong connectivity to the Middle Ring Road, sitting between the New Capital and Madinaty.',
ar:'الوصول إلى المنطقة سهل باتصال قوي بالطريق الدائري الأوسط، وتقع بين العاصمة الإدارية ومدينتي.'},
groups:[
{label:{en:'Drive times', ar:'أزمنة الوصول'}, rows:[
{k:{en:'Financial District',ar:'الحي المالي'},        v:{en:'10 mins',ar:'١٠ دقائق'}},
{k:{en:'Shorouk',ar:'الشروق'},                        v:{en:'15 mins',ar:'١٥ دقيقة'}},
{k:{en:'Four Seasons Madinaty',ar:'فورسيزونز مدينتي'}, v:{en:'20 mins',ar:'٢٠ دقيقة'}}]}]
}},
{en:'A Mixed-Use Project', ar:'مشروع متعدد الاستخدامات', icon:'layers', imgs:[SU+'st-03.webp',SU+'st-02.webp',SU+'ap5-0.webp'],
copy:{
lead:{en:'Sumou Boulevard is the biggest mixed-use project in East Cairo and the first of its kind in Mostakbal City, developed on 250,000 m\u00b2 of land with a 500,000 m\u00b2 built-up area. An innovation district sits at its centre, flowing into a walkable cultural boulevard of galleries, workshops and open public spaces.',
ar:'سمو بوليفارد أكبر مشروع متعدد الاستخدامات في شرق القاهرة وأول مشروع من نوعه في مدينة المستقبل، على أرض ٢٥٠٬٠٠٠ م² بمساحة مبانٍ ٥٠٠٬٠٠٠ م². تتوسّطه منطقة ابتكار تمتد إلى بوليفارد ثقافي للمشي يضم صالات عرض وورشاً ومساحات عامة مفتوحة.'},
list:[
{en:'Hospitality — three landmark hotels',ar:'ضيافة — ثلاثة فنادق مميّزة'},
{en:'Branded residences & serviced apartments',ar:'مساكن ذات علامة وشقق مخدومة'},
{en:'Office & retail',ar:'مكاتب وتجزئة'},
{en:'Parks & recreation',ar:'حدائق وترفيه'},
{en:'Art & culture',ar:'فنون وثقافة'},
{en:'Restorative landscape & wellbeing',ar:'مساحات خضراء وعافية'}],
more:{en:'The project is expected to generate EGP 100 billion in sales, and is described by the developer as the first regenerative city in MENA \u2014 anchored by the world\u2019s largest innovation-impact boulevard, where culture, innovation and wellbeing converge into a hospitality-driven urban life.',
ar:'يُتوقّع أن يحقّق المشروع مبيعات بقيمة ١٠٠ مليار جنيه مصري، ويصفه المطوّر بأنه أول مدينة تجديدية في الشرق الأوسط وشمال إفريقيا — يتوسّطها أكبر بوليفارد للابتكار في العالم، حيث تلتقي الثقافة والابتكار والعافية في حياة حضرية قائمة على الضيافة.'}
}}
]
},
'ora': {
masterplan: {en:'Masterplan — Silversands', ar:'الماستر بلان — سيلفر ساندز', icon:'layers', src:ORB+'silversands-aerial.webp'},
cards: [
{en:'Ora Developers', ar:'أورا للتطوير', icon:'shield', imgs:[ORB+'chairman.webp'],
copy:{
lead:{en:'Ora Developers is chaired by Eng. Naguib Sawiris, and sits within Gemini Holding alongside its telecom, mining, oil and gas, media, financial services and investment companies. Its line under the mark reads: Reimagining Time.',
ar:'يرأس شركة أورا للتطوير المهندس نجيب ساويرس، وتندرج ضمن مجموعة جيميني القابضة إلى جانب شركاتها في الاتصالات والتعدين والنفط والغاز والإعلام والخدمات المالية والاستثمار. وشعارها تحت العلامة: إعادة تصوّر الزمن.'},
more:{en:'Eng. Naguib has been described as one of the most influential business people of his generation. Widely respected for his work in the telecommunication sector, his leading roles range from establishing Orascom Telecom Holding — acquired by VEON to create the world\'s sixth largest telecommunication firm — to chairing and advising market-changing companies in financial services, energy, agro-industries, logistics and real estate.',
ar:'يوصَف المهندس نجيب بأنه من أكثر رجال الأعمال تأثيراً في جيله. ويحظى باحترام واسع لعمله في قطاع الاتصالات، وتمتد أدواره القيادية من تأسيس أوراسكوم تليكوم القابضة — التي استحوذت عليها «فيون» لتكوين سادس أكبر شركة اتصالات في العالم — إلى رئاسة ومشورة شركات غيّرت أسواقها في الخدمات المالية والطاقة والصناعات الزراعية واللوجستيات والعقارات.'}
}},
{en:'An International Portfolio', ar:'محفظة دولية', icon:'globe', imgs:[ORB+'world.webp'],
copy:{
lead:{en:'Ora builds in Egypt, the United Kingdom, Cyprus, Grenada and Pakistan, with Greece announced as coming soon. In Egypt its earlier work includes Nile City Towers on the East Bank of the Nile — completed in 2004, now home to the company\'s own headquarters and the five-star Fairmont hotel — and Pyramid Hills near the Great Pyramids of Giza.',
ar:'تبني أورا في مصر والمملكة المتحدة وقبرص وغرينادا وباكستان، مع الإعلان عن اليونان قريباً. وفي مصر تشمل أعمالها السابقة أبراج نايل سيتي على الضفة الشرقية للنيل — اكتملت عام ٢٠٠٤ وتضم اليوم المقر الرئيسي للشركة وفندق فيرمونت فئة الخمس نجوم — و«بيراميد هيلز» قرب أهرامات الجيزة.'},
groups:[
{label:{en:'International projects', ar:'المشروعات الدولية'}, rows:[
{k:{en:'Eighteen — Pakistan',ar:'إيتين — باكستان'}, v:{en:'2,225 units on 2.7 million sq. yd. outside Islamabad',ar:'٢٬٢٢٥ وحدة على ٢٫٧ مليون ياردة مربعة خارج إسلام آباد'}},
{k:{en:'Ayia Napa Marina — Cyprus',ar:'آيا نابا مارينا — قبرص'}, v:{en:'219 units, two towers, a 600-berth marina',ar:'٢١٩ وحدة، وبرجان، ومارينا بسعة ٦٠٠ مرسى'}},
{k:{en:'Silversands — Grenada',ar:'سيلفر ساندز — غرينادا'}, v:{en:'11 units; award-winning hotel and resort, 2018–2019',ar:'١١ وحدة؛ فندق ومنتجع حائز على جوائز ٢٠١٨–٢٠١٩'}},
{k:{en:'Nocera — United Kingdom',ar:'نوسيرا — المملكة المتحدة'}, v:{en:'Twenty Grosvenor Square, Mayfair — 37 Four Seasons Residences',ar:'تونتي جروسفينور سكوير بمايفير — ٣٧ وحدة فور سيزونز ريزيدنسز'}}]}
]
}},
{en:'Silversands — North Coast', ar:'سيلفر ساندز — الساحل الشمالي', icon:'layers', imgs:[ORB+'silversands-beach.webp', ORB+'silversands-aerial.webp'],
copy:{
lead:{en:'Silversands takes Ora\'s Caribbean hotel brand to the Egyptian North Coast, at kilometre 243 and four kilometres from Almaza Bay. The masterplan is by WATG London across 503 acres, with one kilometre of beach front.',
ar:'ينقل «سيلفر ساندز» علامة أورا الفندقية الكاريبية إلى الساحل الشمالي المصري، عند الكيلو ٢٤٣ وعلى بعد أربعة كيلومترات من خليج ألماظة. والمخطط العام من تصميم «WATG لندن» على مساحة ٥٠٣ أفدنة، بواجهة شاطئية بطول كيلومتر واحد.'},
list:[{en:'88,000 m² — 22 acres — of swimmable lagoons',ar:'٨٨٬٠٠٠ م² — ٢٢ فداناً — من البحيرات القابلة للسباحة'},
{en:'Two hotels and four clubhouses',ar:'فندقان وأربعة كلوب هاوس'},
{en:'A hospital, a piazza and high-end retail',ar:'مستشفى وبيازا ومحال تجارية راقية'}],
groups:[
{label:{en:'Payment plan (brochure)', ar:'نظام السداد (البروشور)'}, rows:[
{k:{en:'Down payment',ar:'المقدم'},            v:{en:'10%',ar:'١٠٪'}},
{k:{en:'After three months',ar:'بعد ثلاثة أشهر'}, v:{en:'5%',ar:'٥٪'}},
{k:{en:'Balance',ar:'الباقي'},                  v:{en:'Over 6 years',ar:'على ٦ سنوات'}}]}
]
}},
{en:'ZED East', ar:'زيد إيست', icon:'build', imgs:[ORB+'zedeast-park.webp', ORB+'zedeast-strip.webp', ORB+'zedeast-masterplan.webp'],
copy:{
lead:{en:'ZED East sits at the end of Road 90 where it meets the Second Ring Road. The project runs to 360 acres on a WATG masterplan, with a 43-acre ZED Sports Club, an office park, medical clinics, retail, F&B and a shopping mall. Residential buildings are G+8 and look over eight acres of landscape.',
ar:'يقع «زيد إيست» عند نهاية طريق التسعين حيث يلتقي بالطريق الدائري الثاني. ويمتد المشروع على ٣٦٠ فداناً بمخطط عام من «WATG»، ويضم نادي زيد الرياضي على ٤٣ فداناً، ومجمّع مكاتب وعيادات طبية ومحال ومطاعم ومركزاً تجارياً. والمباني السكنية أرضي + ٨ أدوار وتطل على ثمانية أفدنة من المساحات الخضراء.'},
more:{en:'Units are delivered fully finished including air conditioning, over underground parking, with concierge, resident and furniture lifts, a fire escape staircase and a garbage chute. The Parsley phase carries the widest central park frontage in the project, with 62 to 286 metres of uninterrupted green, overlooking the Sage and Mint single-family clusters and within walking distance of the club.',
ar:'تُسلَّم الوحدات كاملة التشطيب بما فيها التكييف، فوق جراج تحت الأرض، مع كونسيرج ومصعدَي سكان وأثاث وسلّم هروب من الحريق ومهبط قمامة. وتتمتع مرحلة «بارسلي» بأوسع واجهة على الحديقة المركزية في المشروع، بامتداد أخضر متصل من ٦٢ إلى ٢٨٦ متراً، مطلّة على مجموعتَي «سيج» و«مينت» للفيلات، وعلى مسافة مشي من النادي.'},
groups:[
{label:{en:'Quoted in the profile', ar:'المذكور في الملف'}, rows:[
{k:{en:'Parsley — average price per metre',ar:'بارسلي — متوسط سعر المتر'}, v:{en:'EGP 130,000',ar:'١٣٠٬٠٠٠ جنيه'}},
{k:{en:'Parsley — payment plan',ar:'بارسلي — نظام السداد'}, v:{en:'5% down, 5% on contract, 90% over 8 years, 7.5% maintenance',ar:'٥٪ مقدم، ٥٪ عند التعاقد، ٩٠٪ على ٨ سنوات، ٧٫٥٪ صيانة'}},
{k:{en:'Administrative Strip',ar:'الستريب الإداري'}, v:{en:'32 acres, average EGP 160,000 per metre, core & shell, 4-year delivery',ar:'٣٢ فداناً، بمتوسط ١٦٠٬٠٠٠ جنيه للمتر، على المحارة، تسليم ٤ سنوات'}},
{k:{en:'Strip — payment plan',ar:'الستريب — نظام السداد'}, v:{en:'5% down, 5% on contract, 90% over 7 years, 10% maintenance',ar:'٥٪ مقدم، ٥٪ عند التعاقد، ٩٠٪ على ٧ سنوات، ١٠٪ صيانة'}}]},
{label:{en:'Club Side Tower', ar:'كلوب سايد تاور'}, rows:[
{k:{en:'Height',ar:'الارتفاع'},        v:{en:'100 metres, G+30 floors',ar:'١٠٠ متر، أرضي + ٣٠ دوراً'}},
{k:{en:'Average areas',ar:'متوسط المساحات'}, v:{en:'1 bed 81 m² · 2 bed 131 m² · 2 bed loft 149 m² · 3 bed 174 m² · 4 bed 249 m²',ar:'غرفة ٨١ م² · غرفتان ١٣١ م² · لوفت بغرفتين ١٤٩ م² · ٣ غرف ١٧٤ م² · ٤ غرف ٢٤٩ م²'}},
{k:{en:'Finishing',ar:'التشطيب'},      v:{en:'Fully finished with ACs and kitchen cabinets',ar:'تشطيب كامل مع تكييفات ومطابخ'}},
{k:{en:'Payment plan',ar:'نظام السداد'}, v:{en:'5% down, 5% contractual, 85% over 7 years',ar:'٥٪ مقدم، ٥٪ تعاقدي، ٨٥٪ على ٧ سنوات'}},
{k:{en:'EOI',ar:'خطاب الرغبة'},        v:{en:'EGP 500,000 (1–2 bed) · EGP 750,000 (3–4 bed)',ar:'٥٠٠٬٠٠٠ جنيه (غرفة–غرفتان) · ٧٥٠٬٠٠٠ جنيه (٣–٤ غرف)'}}]}
]
}},
{en:'ZED — Sheikh Zayed', ar:'زيد — الشيخ زايد', icon:'build', imgs:[ORB+'zedwest-park.webp', ORB+'zedwest-towers.webp', ORB+'zedwest-masterplan.webp', ORB+'zedwest-location.webp'],
copy:{
lead:{en:'ZED at Sheikh Zayed covers 165 acres — 65 of them ZED Park — on a WATG London masterplan, entered from Sheikh Zayed entrance 1. The product mix is 4,800 multi-family units, 77,100 m² of offices and clinics, and 37,100 m² of retail across the ZED Strip and the Towers Mall.',
ar:'يمتد «زيد» بالشيخ زايد على ١٦٥ فداناً — منها ٦٥ فداناً لحديقة زيد — بمخطط عام من «WATG لندن»، ومدخله من بوابة الشيخ زايد الأولى. ويتألف المزيج من ٤٬٨٠٠ وحدة سكنية، و٧٧٬١٠٠ م² من المكاتب والعيادات، و٣٧٬١٠٠ م² من المحال بين «زيد ستريب» و«تاورز مول».'},
list:[{en:'Sports complex with soccer courts operated by the DBB academy',ar:'مجمّع رياضي بملاعب كرة قدم تديرها أكاديمية DBB'},
{en:'Tennis and paddle courts operated by the BTT academy (Barcelona)',ar:'ملاعب تنس وبادل تديرها أكاديمية BTT (برشلونة)'},
{en:'A high-end mall, the Italiano restaurant and a park renovation by Melk',ar:'مول راقٍ ومطعم «إيتاليانو» وتجديد للحديقة من تصميم «Melk»'},
{en:'ZED Winter Festival, a kids\' area, a theatre and a zipline',ar:'مهرجان زيد الشتوي ومنطقة أطفال ومسرح وزيبلاين'}],
groups:[
{label:{en:'Tiers quoted in the profile', ar:'الفئات المذكورة في الملف'}, rows:[
{k:{en:'Residential Towers (G+10)',ar:'الأبراج السكنية (أرضي + ١٠)'}, v:{en:'Average EGP 130,000 per metre · 5% down, 5% after 3 months, 10% on delivery, balance over 7.5 years',ar:'بمتوسط ١٣٠٬٠٠٠ جنيه للمتر · ٥٪ مقدم، ٥٪ بعد ٣ أشهر، ١٠٪ عند التسليم، والباقي على ٧٫٥ سنوات'}},
{k:{en:'Park Towers YA, YB, YC (G+20)',ar:'بارك تاورز YA وYB وYC (أرضي + ٢٠)'}, v:{en:'From EGP 200,000 per metre · delivery in 1 year · 8.75% down then 8.75% every 3 months ×3, balance over 6 years',ar:'من ٢٠٠٬٠٠٠ جنيه للمتر · تسليم خلال سنة · ٨٫٧٥٪ مقدم ثم ٨٫٧٥٪ كل ٣ أشهر ثلاث مرات، والباقي على ٦ سنوات'}},
{k:{en:'Park Side Residence (G+10)',ar:'بارك سايد ريزيدنس (أرضي + ١٠)'}, v:{en:'Average EGP 150,000 per metre · delivery in 3 years · 5% down, 5% after 3 months, balance over 7.5 years',ar:'بمتوسط ١٥٠٬٠٠٠ جنيه للمتر · تسليم خلال ٣ سنوات · ٥٪ مقدم، ٥٪ بعد ٣ أشهر، والباقي على ٧٫٥ سنوات'}},
{k:{en:'Armani Towers (G+10)',ar:'أبراج أرماني (أرضي + ١٠)'}, v:{en:'Sold out',ar:'نفدت'}}]}
]
}},
{en:'Solana — New Zayed', ar:'سولانا — زايد الجديدة', icon:'home', imgs:[ORB+'solana-aerial.webp', ORB+'solana-spine.webp', ORB+'solana-villa.webp', ORB+'solana-amphitheatre.webp'],
copy:{
lead:{en:'Solana runs to 316 feddans — 1,327,981 m² — in New Zayed on the Dabaa axis, next to Vye and Belle Vie and beside the Alexandria road. The masterplan is by WATG London and the community is designed to be walked rather than driven.',
ar:'يمتد «سولانا» على ٣١٦ فداناً — ١٬٣٢٧٬٩٨١ م² — في زايد الجديدة على محور الضبعة، بجوار «فاي» و«بيل في» وإلى جانب طريق الإسكندرية. والمخطط العام من «WATG لندن»، والمجتمع مصمَّم للمشي لا للسيارة.'},
more:{en:'Its four stated strengths are product flexibility, a multi-layered garden, innovative typologies, and a balance of openness and enclosure that gives each home its privacy.',
ar:'ونقاط قوته المعلنة أربع: مرونة المنتج، والحديقة متعددة المستويات، والأنماط المبتكرة، والتوازن بين الانفتاح والانغلاق الذي يمنح كل منزل خصوصيته.'},
groups:[
{label:{en:'Product mix', ar:'مزيج المنتج'}, rows:[
{k:{en:'Single-family units',ar:'وحدات مستقلة'},   v:{en:'865',ar:'٨٦٥'}},
{k:{en:'Multi-family units',ar:'وحدات سكنية'},     v:{en:'1,232',ar:'١٬٢٣٢'}},
{k:{en:'Typologies',ar:'الأنماط'},                v:{en:'The Gemini Villa · The Villa (1 floor) · The Villa (2 floors) · The Twin Villa · The Twin House · The Townhouse',ar:'فيلا جيميني · الفيلا (طابق) · الفيلا (طابقان) · التوين فيلا · التوين هاوس · التاون هاوس'}},
{k:{en:'Clubhouse',ar:'الكلوب هاوس'},             v:{en:'10,000 m²',ar:'١٠٬٠٠٠ م²'}},
{k:{en:'Football club',ar:'النادي الرياضي'},       v:{en:'130,000 m²',ar:'١٣٠٬٠٠٠ م²'}},
{k:{en:'School',ar:'المدرسة'},                    v:{en:'20,000 m²',ar:'٢٠٬٠٠٠ م²'}},
{k:{en:'Community retail centres',ar:'مراكز التجزئة'}, v:{en:'5,000 m²',ar:'٥٬٠٠٠ م²'}}]},
{label:{en:'Villas — payment plan (brochure)', ar:'الفيلات — نظام السداد (البروشور)'}, rows:[
{k:{en:'Down payment',ar:'المقدم'},               v:{en:'5%',ar:'٥٪'}},
{k:{en:'On contract, at three months',ar:'عند التعاقد بعد ثلاثة أشهر'}, v:{en:'5%',ar:'٥٪'}},
{k:{en:'Balance',ar:'الباقي'},                    v:{en:'Over 7 years',ar:'على ٧ سنوات'}}]},
{label:{en:'Facilities & amenities', ar:'المرافق والخدمات'}, rows:[
{k:{en:'Listed in the profile',ar:'المذكورة في الملف'}, v:{en:'Clubhouse · parks and water features · school · daycare · serviced apartments · electric charging · bike and running lanes · community centre · entertainment · community retail · clinics',ar:'كلوب هاوس · حدائق ومسطحات مائية · مدرسة · حضانة · شقق فندقية · شحن كهربائي · مسارات دراجات وجري · مركز مجتمعي · ترفيه · تجزئة · عيادات'}}]}
]
}},
{en:'Solana East', ar:'سولانا إيست', icon:'home', imgs:[ORB+'solanaeast-lake.webp', ORB+'solanaeast-dusk.webp'],
copy:{
lead:{en:'Solana East carries the same brand across to the east of Cairo, on the South 90 axis. The company profile presents it through its masterplan and renders; it publishes no separate fact sheet for it, so no figures are claimed here beyond what the client price list carries on the project page itself.',
ar:'ينقل «سولانا إيست» العلامة نفسها إلى شرق القاهرة على محور التسعين الجنوبي. ويعرضه ملف الشركة عبر مخططه العام ولقطاته المصوّرة، دون أن ينشر له صفحة بيانات مستقلة، ولذلك لا تُذكر هنا أي أرقام تتجاوز ما تحمله قائمة أسعار العميل على صفحة المشروع نفسها.'}
}}
]
},
'msquared': {
cards: [
{en:'Masterfully Minded Spaces', ar:'مساحات مصمَّمة بإتقان', icon:'spark', imgs:[MSQ+'about-community.webp'],
copy:{
lead:{en:'Founded in 2012, M squared is a leading real estate developer renowned for its customer-centric outlook on integrated living, where quality speaks volumes for communities to thrive.',
ar:'تأسّست عام ٢٠١٢، وإم سكويرد مطوّر عقاري رائد معروف بنظرته المتمحورة حول العميل في السكن المتكامل، حيث تتحدّث الجودة عن نفسها لتزدهر المجتمعات.'},
more:{en:'Its commitment reaches beyond its customers: the different green frameworks for sustainable living align naturally with its projects and communities, driving a forward-thinking culture that opens the door to a world of opportunity and an all-around positive environment — supporting local talents, promoting sustainable living, and keeping its communities eco-friendly and green aware.',
ar:'ويمتد التزامها إلى ما هو أبعد من عملائها: تتوافق الأطر الخضراء المختلفة للعيش المستدام بشكل طبيعي مع مشروعاتها ومجتمعاتها، مما يقود ثقافة استشرافية تفتح الباب لعالم من الفرص وبيئة إيجابية شاملة — بدعم المواهب المحلية، وتعزيز العيش المستدام، وإبقاء مجتمعاتها صديقة للبيئة وواعية بالأخضر.'}
}},
{en:'Part of INTRO Investments Holding', ar:'ضمن إنترو للاستثمارات القابضة', icon:'shield', imgs:[MSQ+'about-dna.webp'],
copy:{
lead:{en:'M squared is celebrated as the real estate arm of INTRO Investments Holding, an Egyptian conglomerate established in the 1970s and privately owned by the Abbas family. Across its fifty-year history the company’s shareholders and partners have remained successful by harnessing strategic partnerships, supporting subsidiaries with financing and operational management, and synergising between the companies.',
ar:'تُعرف إم سكويرد بوصفها الذراع العقاري لمجموعة إنترو للاستثمارات القابضة، وهي تكتّل مصري تأسّس في السبعينيات ومملوك لعائلة عباس. وعلى مدى خمسين عاماً ظل مساهمو الشركة وشركاؤها ناجحين بتسخير الشراكات الاستراتيجية، ودعم الشركات التابعة بالتمويل والإدارة التشغيلية، والتكامل فيما بينها.'},
groups:[
{label:{en:'The group', ar:'المجموعة'}, rows:[
{k:{en:'Business divisions',ar:'قطاعات الأعمال'}, v:{en:'Oil & gas · waste management · energy & renewables · technology · retail · real estate & construction · medical services · financial services · ventures capital',ar:'النفط والغاز · إدارة المخلفات · الطاقة والمتجددة · التكنولوجيا · التجزئة · العقارات والإنشاءات · الخدمات الطبية · الخدمات المالية · رأس المال الاستثماري'}},
{k:{en:'Employees',ar:'الموظفون'},        v:{en:'Over 25,000',ar:'أكثر من ٢٥٬٠٠٠'}},
{k:{en:'Countries',ar:'الدول'},           v:{en:'Egypt · USA · UK · Germany · Algeria · Tunisia · Oman · Kuwait · KSA · UAE · Qatar · Bahrain · India · Thailand',ar:'مصر · الولايات المتحدة · بريطانيا · ألمانيا · الجزائر · تونس · عُمان · الكويت · السعودية · الإمارات · قطر · البحرين · الهند · تايلاند'}}]}
]
}},
{en:'DNA & Philosophy', ar:'الحمض والفلسفة', icon:'star', imgs:[MSQ+'about-values.webp'],
copy:{
lead:{en:'“We empower you to live in spaces that reflect who you are, what you need, and what you value.” M squared’s philosophy is rooted in an entrenched belief that no size fits all, so the company puts emphasis on offering a wide range of unique products to cater to different needs.',
ar:'«نمنحك القدرة على العيش في مساحات تعكس من أنت، وما تحتاجه، وما تقدّره.» فلسفة إم سكويرد متجذّرة في قناعة راسخة بأن مقاساً واحداً لا يناسب الجميع، ولذلك تركّز الشركة على تقديم مجموعة واسعة من المنتجات الفريدة لتلبية احتياجات مختلفة.'},
list:[{en:'Authentic communities — built to last, in line with sustainable growth, wellbeing and a genuine sense of belonging',ar:'مجتمعات أصيلة — مبنية لتبقى، بما يتوافق مع النمو المستدام والعافية وحسّ انتماء حقيقي'},
{en:'Spaces that inspire — bringing the beauty of nature and the sustainable rhythm of living inside your home space',ar:'مساحات تُلهم — تجلب جمال الطبيعة وإيقاع العيش المستدام إلى داخل بيتك'},
{en:'Personalized experience — a lifestyle where you are in full control of how you work, live and play',ar:'تجربة شخصية — أسلوب حياة تتحكّم فيه بالكامل في كيفية عملك ومعيشتك ولعبك'},
{en:'Driven by sustainability — embedding ESG principles ever deeper in the way it does business',ar:'مدفوعة بالاستدامة — ترسيخ مبادئ الحوكمة البيئية والاجتماعية أعمق في طريقة عملها'},
{en:'Make life better for everyone — striving for social inclusion of local communities, young artists and the national economy',ar:'حياة أفضل للجميع — السعي للدمج الاجتماعي للمجتمعات المحلية والفنانين الشباب والاقتصاد الوطني'}]
}},
{en:'Pioneering in Ras Alhekma', ar:'ريادة في رأس الحكمة', icon:'pin', imgs:[MSQ+'about-raselhekma.webp'],
copy:{
lead:{en:'Ras Alhekma boasts burgeoning demand and investment opportunity, and M squared asserts its position as one of the pioneering developers in the coastal region. Through Masyaf Ras Alhekma and the Marmarica Boutique Cabanas it has fostered strong relationships with the governmental bodies involved in the area’s development.',
ar:'تشهد رأس الحكمة طلباً متنامياً وفرص استثمار، وتؤكّد إم سكويرد موقعها كأحد المطوّرين الروّاد في هذه المنطقة الساحلية. ومن خلال «مصياف رأس الحكمة» و«كابانات مرماريكا البوتيكية» بَنَت علاقات قوية مع الجهات الحكومية المعنية بتنمية المنطقة.'},
more:{en:'As one of the first developers to set foot in the region, its decision to invest stemmed from a vision to create iconic developments that serve as catalysts for economic growth and community empowerment.',
ar:'وبوصفها من أوائل المطوّرين الذين وطئوا المنطقة، جاء قرار الاستثمار من رؤية لإنشاء مشروعات أيقونية تكون محفّزاً للنمو الاقتصادي وتمكين المجتمع.'}
}},
{en:'A World of Refined Hospitality', ar:'عالم من الضيافة الراقية', icon:'am_hotel', imgs:[MSQ+'about-hospitality.webp'],
copy:{
lead:{en:'M squared Hospitality is a forward-thinking hospitality experience provider made up of a diverse, experienced team of international hoteliers, whose contemporary philosophy promises all guests a unique experience that pampers the soul and serves with grace.',
ar:'إم سكويرد للضيافة مزوّد استشرافي لتجارب الضيافة، يتألف من فريق متنوّع وخبير من الفندقيين الدوليين، وتَعِد فلسفته المعاصرة كل ضيف بتجربة فريدة تدلّل الروح وتخدم بلطف.'}
}},
{en:'Management & Partners', ar:'الإدارة والشركاء', icon:'globe', imgs:[MSQ+'about-community.webp'],
copy:{
lead:{en:'The names and partner categories below are the ones the company profile prints.',
ar:'الأسماء وفئات الشركاء أدناه هي المذكورة في ملف الشركة.'},
groups:[
{label:{en:'Top management', ar:'الإدارة العليا'}, rows:[
{k:{en:'Eng. Karim Malash',ar:'م. كريم ملش'},        v:{en:'CEO',ar:'الرئيس التنفيذي'}},
{k:{en:'Mr. Ibrahim Sallam',ar:'أ. إبراهيم سلام'},    v:{en:'VP & CFO',ar:'نائب الرئيس والمدير المالي'}},
{k:{en:'Eng. Ahmed Said',ar:'م. أحمد سعيد'},          v:{en:'Chief Development Officer',ar:'مدير التطوير'}},
{k:{en:'Sara Sherif',ar:'سارة شريف'},                 v:{en:'Head of Marketing and Communication',ar:'رئيس التسويق والاتصال'}},
{k:{en:'Sherif El Shinnawy',ar:'شريف الشناوي'},        v:{en:'Chief Sales Officer',ar:'مدير المبيعات'}}]},
{label:{en:'Success partners', ar:'شركاء النجاح'}, rows:[
{k:{en:'Governmental bodies',ar:'الجهات الحكومية'}, v:{en:'Strategic partnerships with the institutions involved in the product cycle',ar:'شراكات استراتيجية مع المؤسسات المشاركة في دورة المنتج'}},
{k:{en:'Contractors',ar:'المقاولون'},               v:{en:'A rigorous selection process, effective communication and a problem-solving approach',ar:'عملية اختيار صارمة، وتواصل فعّال، ومنهج لحل المشكلات'}},
{k:{en:'Banks & lenders',ar:'البنوك والممولون'},     v:{en:'A wide range of funding partners, mitigating risk and strategic growth initiatives',ar:'نطاق واسع من شركاء التمويل، وتخفيف المخاطر، ومبادرات نمو استراتيجية'}}]}
]
}}
]
},
'modon': {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:MP+'masterplan.webp'},
cards: [
{en:'About Partnership', ar:'عن الشراكة', icon:'shield', imgs:[MP+'partnership.webp'],
copy:{
lead:{en:'In the presence of President His Highness Sheikh Mohamed bin Zayed Al Nahyan, and His Excellency Abdel Fattah El-Sisi, President of the Arab Republic of Egypt, ADQ, an Abu Dhabi-based investment and holding company, appointed Modon Holding PSC as the master planner for the Ras El Hekma megaproject.',
ar:'بحضور رئيس دولة الإمارات صاحب السمو الشيخ محمد بن زايد آل نهيان، وفخامة الرئيس عبد الفتاح السيسي رئيس جمهورية مصر العربية، كلَّفت «ADQ» — شركة الاستثمار والقابضة ومقرّها أبوظبي — شركة «مدن القابضة» بوضع المخطط العام لمشروع رأس الحكمة.'},
more:{en:'Ras El Hekma is the largest ever international investment into Egypt. The project is expected to become a powerful transformative economic engine, with cumulative investments anticipated to reach US$110 billion by 2045, an annual GDP contribution of around US$25 billion, and approximately 750,000 jobs to be created, both directly and indirectly.',
ar:'يُعد رأس الحكمة أكبر استثمار دولي في تاريخ مصر. ومن المتوقّع أن يتحوّل المشروع إلى محرّك اقتصادي هائل، باستثمارات تراكمية يُتوقّع أن تبلغ ١١٠ مليار دولار أمريكي بحلول عام ٢٠٤٥، ومساهمة سنوية في الناتج المحلي الإجمالي تُقدَّر بنحو ٢٥ مليار دولار، وتوفير ما يقارب ٧٥٠٬٠٠٠ فرصة عمل بشكل مباشر وغير مباشر.'}
}},
{en:'Connected to the World', ar:'متصلة بالعالم', icon:'globe', imgs:[MP+'connected.webp'],
copy:{
lead:{en:'Strategically located near both Europe and the Gulf, Ras El Hekma will be accessible via a new international airport. 50% of the world will be within a 4-hour flight of the city, with seamless connectivity central to the city\'s ethos.',
ar:'بموقع استراتيجي قريب من أوروبا والخليج، سيكون الوصول إلى رأس الحكمة عبر مطار دولي جديد. ٥٠٪ من العالم على بُعد رحلة طيران لا تتجاوز ٤ ساعات من المدينة، مع جعل سهولة الوصول محوراً أساسياً في فلسفة المدينة.'},
more:{en:'In addition, a fast road network, high speed rail and domestic and international marinas have all been embedded in the city\'s design.',
ar:'كما جرى دمج شبكة طرق سريعة وقطار فائق السرعة ومارينات محلية ودولية ضمن تصميم المدينة.'},
groups:[
{label:{en:'By road', ar:'بالسيارة'}, rows:[
{k:{en:'Alexandria',ar:'الإسكندرية'}, v:{en:'Approx. 2 hrs',ar:'نحو ساعتين'}},
{k:{en:'Cairo',ar:'القاهرة'},         v:{en:'Approx. 3 hrs',ar:'نحو ٣ ساعات'}}]},
{label:{en:'By plane', ar:'بالطائرة'}, rows:[
{k:{en:'Abu Dhabi',ar:'أبوظبي'}, v:{en:'Approx. 4 hrs',ar:'نحو ٤ ساعات'}},
{k:{en:'Kuwait',ar:'الكويت'},    v:{en:'Approx. 3 hrs',ar:'نحو ٣ ساعات'}},
{k:{en:'Doha',ar:'الدوحة'},      v:{en:'Approx. 3 hrs 30 mins',ar:'نحو ٣ ساعات ونصف'}},
{k:{en:'Dubai',ar:'دبي'},        v:{en:'Approx. 4 hrs',ar:'نحو ٤ ساعات'}},
{k:{en:'Riyadh',ar:'الرياض'},    v:{en:'Approx. 4 hrs 30 mins',ar:'نحو ٤ ساعات ونصف'}},
{k:{en:'Paris',ar:'باريس'},      v:{en:'Approx. 4 hrs 30 mins',ar:'نحو ٤ ساعات ونصف'}},
{k:{en:'London',ar:'لندن'},      v:{en:'Approx. 5 hrs',ar:'نحو ٥ ساعات'}},
{k:{en:'Rome',ar:'روما'},        v:{en:'Approx. 3 hrs',ar:'نحو ٣ ساعات'}},
{k:{en:'Madrid',ar:'مدريد'},     v:{en:'Approx. 5 hrs',ar:'نحو ٥ ساعات'}},
{k:{en:'Moscow',ar:'موسكو'},     v:{en:'Approx. 4 hrs',ar:'نحو ٤ ساعات'}},
{k:{en:'New York',ar:'نيويورك'}, v:{en:'Approx. 13 hrs',ar:'نحو ١٣ ساعة'}}]}
]
}},
{en:'Major Components', ar:'المكوّنات الرئيسية', icon:'build',
imgs:[MP+'mc1.webp',MP+'mc2.webp',MP+'mc3.webp',MP+'mc4.webp',MP+'mc5.webp',MP+'mc6.webp'],
copy:{list:[
{en:'International Airport',              ar:'مطار دولي'},
{en:'3 Marinas & 1 Cruise Terminal',      ar:'٣ مارينات ومحطة رحلات بحرية'},
{en:'Rapid Transit Network',              ar:'شبكة نقل سريع'},
{en:'Central Business District',          ar:'منطقة أعمال مركزية'},
{en:'Private Sector Free Zone',           ar:'منطقة حرة للقطاع الخاص'},
{en:'Amphitheatre',                       ar:'مدرّج مسرحي'}
]}}
]
},
'sodic': {
masterplan: {en:'Where We Operate — Egypt', ar:'أين نعمل — مصر', icon:'layers', src:SD+'where-we-operate.webp'},
cards: [
{en:'About SODIC', ar:'عن سوديك', icon:'shield',
imgs:[SD+'about.webp', SD+'ownership.webp'],
copy:{
lead:{en:'SODIC is a leading real estate developer in Egypt, with a distinguished track record of 28 years of successful operations in West Cairo, East Cairo and the North Coast. It develops large-scale, mixed-use, vibrant communities that are home to over 30,000 people today.',
ar:'سوديك من كبرى شركات التطوير العقاري في مصر، بسجلّ متميّز يمتد ٢٨ عاماً من العمل الناجح في غرب القاهرة وشرقها وعلى الساحل الشمالي. وتطوّر مجتمعات كبيرة متعددة الاستخدامات ونابضة بالحياة يسكنها اليوم أكثر من ٣٠٬٠٠٠ نسمة.'},
more:{en:'SODIC has been a listed company since inception, traded on the Egyptian stock exchange (EGX) since 1996 under OCDI.CA — one of the few non-family-owned companies traded on the EGX. In 2021 the ALDAR–ADQ consortium acquired 85% of SODIC through a mandatory tender offer, the largest foreign direct investment in the Egyptian real estate market to date.',
ar:'سوديك شركة مقيّدة منذ نشأتها، ومتداولة في البورصة المصرية منذ عام ١٩٩٦ تحت الرمز OCDI.CA — وهي من الشركات القليلة غير العائلية المتداولة في البورصة. وفي عام ٢٠٢١ استحوذ تحالف «الدار وADQ» على ٨٥٪ من سوديك عبر عرض شراء إجباري، وهو أكبر استثمار أجنبي مباشر في سوق العقارات المصري حتى تاريخه.'},
groups:[
{label:{en:'Ownership', ar:'هيكل الملكية'}, rows:[
{k:{en:'ALDAR – ADQ consortium',ar:'تحالف الدار وADQ'}, v:{en:'85%',ar:'٨٥٪'}},
{k:{en:'Ekuity Holding',ar:'إكويتي القابضة'},           v:{en:'5%',ar:'٥٪'}},
{k:{en:'Others',ar:'آخرون'},                            v:{en:'10%',ar:'١٠٪'}}]}
]
}},
{en:'SODIC in Numbers', ar:'سوديك بالأرقام', icon:'star',
imgs:[SD+'sodic-west.webp', SD+'where-we-operate.webp'],
copy:{
lead:{en:'The profile publishes the company\'s scorecard: 28 years of operation, more than 10 developments, over 14,000 units delivered and more than 18,000 sold, on a land bank of over 17 million square metres.',
ar:'ينشر الملف التعريفي سجلّ الشركة: ٢٨ عاماً من العمل، وأكثر من ١٠ مشروعات، وأكثر من ١٤٬٠٠٠ وحدة مسلَّمة وأكثر من ١٨٬٠٠٠ وحدة مباعة، على محفظة أراضٍ تتجاوز ١٧ مليون متر مربع.'},
groups:[
{label:{en:'SODIC in numbers', ar:'سوديك بالأرقام'}, rows:[
{k:{en:'Years of operation',ar:'سنوات العمل'},              v:{en:'28',ar:'٢٨'}},
{k:{en:'Developments',ar:'المشروعات'},                      v:{en:'10+',ar:'+١٠'}},
{k:{en:'Units delivered',ar:'الوحدات المسلَّمة'},            v:{en:'14,000+',ar:'أكثر من ١٤٬٠٠٠'}},
{k:{en:'Units sold',ar:'الوحدات المباعة'},                  v:{en:'18,000+',ar:'أكثر من ١٨٬٠٠٠'}},
{k:{en:'Total land bank',ar:'إجمالي محفظة الأراضي'},        v:{en:'17m+ m², over 70% developed',ar:'أكثر من ١٧ مليون م²، طُوِّر منها أكثر من ٧٠٪'}},
{k:{en:'Residents',ar:'السكان'},                            v:{en:'30,000+',ar:'أكثر من ٣٠٬٠٠٠'}},
{k:{en:'NPS rating',ar:'مؤشر رضا العملاء'},                 v:{en:'58 — leading rating in the market',ar:'٥٨ — الأعلى في السوق'}},
{k:{en:'Families in CSR programmes',ar:'أسر مستفيدة من برامج المسؤولية المجتمعية'}, v:{en:'9,000+ annually',ar:'أكثر من ٩٬٠٠٠ سنوياً'}}]},
{label:{en:'Unlaunched land bank', ar:'الأراضي غير المطروحة'}, rows:[
{k:{en:'Across key markets',ar:'في الأسواق الرئيسية'}, v:{en:'7.2m+ m²',ar:'أكثر من ٧٫٢ مليون م²'}},
{k:{en:'North Coast',ar:'الساحل الشمالي'},             v:{en:'44%',ar:'٤٤٪'}},
{k:{en:'West Cairo',ar:'غرب القاهرة'},                 v:{en:'29%',ar:'٢٩٪'}},
{k:{en:'East Cairo',ar:'شرق القاهرة'},                 v:{en:'27%',ar:'٢٧٪'}}]}
]
}},
{en:'Delivery on or Ahead of Schedule', ar:'التسليم في موعده أو قبله', icon:'target',
imgs:[SD+'delivery-91.webp'],
copy:{
lead:{en:'As part and parcel of its value-driven strategy, SODIC has cemented a solid reputation in the market for prompt project delivery. Its governance framework and disciplined project management have allowed it to deliver ahead of schedule 91% of the time.',
ar:'كجزء أصيل من استراتيجيتها القائمة على القيمة، رسّخت سوديك سمعة قوية في السوق بالتسليم في موعده. وقد أتاح لها إطار الحوكمة والانضباط في إدارة المشروعات التسليم قبل الموعد في ٩١٪ من الحالات.'},
more:{en:'The satellite sequence in the profile follows Villette in East Cairo — a 1.26 million square metre project — from bare land in 2015 to a built community in 2022.',
ar:'وتتابع صور الأقمار الصناعية في الملف مشروع «فيليت» بشرق القاهرة — على ١٫٢٦ مليون متر مربع — من أرض خالية عام ٢٠١٥ إلى مجتمع مبني عام ٢٠٢٢.'}
}},
{en:'West Cairo', ar:'غرب القاهرة', icon:'pin',
imgs:[SD+'sodic-west.webp', SD+'beverly-hills.webp', SD+'allegria-residences.webp',
SD+'six-west.webp', SD+'forty-west.webp', SD+'westown-residences.webp',
SD+'october-plaza.webp', SD+'the-estates.webp', SD+'estates-residences.webp',
SD+'vye-karmell.webp'],
copy:{
lead:{en:'SODIC West is the flagship: 6.3 million square metres — 15% of Sheikh Zayed — carrying over 7,000 units and more than 25,000 residents, with the Allegria 18-hole golf course designed by Greg Norman, three schools, a hospital, two sports clubs and a hotel under construction.',
ar:'«سوديك ويست» هو المشروع الرئيسي: ٦٫٣ مليون متر مربع — أي ١٥٪ من الشيخ زايد — تضم أكثر من ٧٬٠٠٠ وحدة وأكثر من ٢٥٬٠٠٠ ساكن، مع ملعب جولف «أليجريا» من ١٨ حفرة بتصميم جريج نورمان، وثلاث مدارس ومستشفى وناديين رياضيين وفندق تحت الإنشاء.'},
groups:[
{label:{en:'In West Cairo', ar:'في غرب القاهرة'}, rows:[
{k:{en:'Beverly Hills',ar:'بيفرلي هيلز'},                v:{en:'Sheikh Zayed · 1,880 units · delivered',ar:'الشيخ زايد · ١٬٨٨٠ وحدة · مسلَّم'}},
{k:{en:'Allegria Residences',ar:'أليجريا ريزيدنسز'},     v:{en:'Sheikh Zayed · 147 units · delivered',ar:'الشيخ زايد · ١٤٧ وحدة · مسلَّم'}},
{k:{en:'Six West',ar:'سيكس ويست'},                       v:{en:'Sheikh Zayed · 112 units · delivered',ar:'الشيخ زايد · ١١٢ وحدة · مسلَّم'}},
{k:{en:'October Plaza',ar:'أكتوبر بلازا'},               v:{en:'6th of October · 641 units · delivered',ar:'٦ أكتوبر · ٦٤١ وحدة · مسلَّم'}},
{k:{en:'The Estates',ar:'ذي إستيتس'},                    v:{en:'New Zayed · 446 units · first phase delivered 2023',ar:'زايد الجديدة · ٤٤٦ وحدة · سُلّمت المرحلة الأولى ٢٠٢٣'}},
{k:{en:'The Estates Residences',ar:'ذي إستيتس ريزيدنسز'},v:{en:'New Zayed · 981 units · delivery 2026',ar:'زايد الجديدة · ٩٨١ وحدة · التسليم ٢٠٢٦'}},
{k:{en:'VYE & Karmell',ar:'ڤاي وكارميل'},                v:{en:'New Zayed · 5,340 units · first delivery 2025',ar:'زايد الجديدة · ٥٬٣٤٠ وحدة · أول تسليم ٢٠٢٥'}}]}
]
}},
{en:'East Cairo', ar:'شرق القاهرة', icon:'pin',
imgs:[SD+'villette.webp', SD+'eastown.webp', SD+'v-residences.webp',
SD+'sky-condos.webp', SD+'sodic-east.webp', SD+'kattameya-plaza.webp'],
copy:{
lead:{en:'Kattameya Plaza was SODIC\'s first venture into East Cairo. Villette followed as its signature development there — master-planned by the American firm SWA, with over 2,515 units — and Eastown, built on 858,000 square metres beside the American University in Cairo, became its mixed-use centre.',
ar:'كانت «قطامية بلازا» أول مشروعات سوديك في شرق القاهرة. ثم جاء «فيليت» كمشروعها المميّز هناك — بمخطط عام من شركة SWA الأمريكية وأكثر من ٢٬٥١٥ وحدة — و«إيستاون» على ٨٥٨٬٠٠٠ متر مربع بجوار الجامعة الأمريكية بالقاهرة، ليصبح مركزها متعدد الاستخدامات.'},
groups:[
{label:{en:'In East Cairo', ar:'في شرق القاهرة'}, rows:[
{k:{en:'Kattameya Plaza',ar:'قطامية بلازا'}, v:{en:'New Cairo · 488 units · delivered',ar:'القاهرة الجديدة · ٤٨٨ وحدة · مسلَّم'}},
{k:{en:'Eastown',ar:'إيستاون'},              v:{en:'New Cairo · 2,862 units · delivered',ar:'القاهرة الجديدة · ٢٬٨٦٢ وحدة · مسلَّم'}},
{k:{en:'Villette',ar:'فيليت'},               v:{en:'New Cairo · Villette Villas 779 · V Residences 931 · Sky Condos 805 · delivered',ar:'القاهرة الجديدة · فيلات فيليت ٧٧٩ · ڤي ريزيدنسز ٩٣١ · سكاي كوندوز ٨٠٥ · مسلَّم'}},
{k:{en:'V Residences',ar:'ڤي ريزيدنسز'},     v:{en:'New Cairo · 931 units · first phase delivered 2023',ar:'القاهرة الجديدة · ٩٣١ وحدة · سُلّمت المرحلة الأولى ٢٠٢٣'}},
{k:{en:'SODIC East',ar:'سوديك إيست'},        v:{en:'New Cairo · 4,525 units · first delivery 2022 · over 84% open and green space',ar:'القاهرة الجديدة · ٤٬٥٢٥ وحدة · أول تسليم ٢٠٢٢ · أكثر من ٨٤٪ مساحات مفتوحة وخضراء'}}]}
]
}},
{en:'The North Coast', ar:'الساحل الشمالي', icon:'am_beach',
imgs:[SD+'caesar.webp', SD+'june.webp', SD+'ogami.webp'],
copy:{
lead:{en:'Three coastal destinations, all in Ras El Hikma and Matrouh: Caesar, launched in 2015 and fully delivered along 1.1 km of sandy beach; June, the Miami-inspired beach town; and Ogami, the newest, named after the Japanese island and drawn along 11 km of lagoon shoreline.',
ar:'ثلاث وجهات ساحلية، جميعها في رأس الحكمة ومطروح: «قيصر» الذي أُطلق عام ٢٠١٥ وسُلّم بالكامل على امتداد ١٫١ كم من الشاطئ الرملي؛ و«جون» مدينة الشاطئ المستوحاة من ميامي؛ و«أوجامي» الأحدث، المسمّى على اسم الجزيرة اليابانية والممتد على ١١ كم من شاطئ البحيرات.'},
groups:[
{label:{en:'On the coast', ar:'على الساحل'}, rows:[
{k:{en:'Caesar',ar:'قيصر'}, v:{en:'819 units · phase 1 delivered · back plot launched 2023 · home to over 350 families',ar:'٨١٩ وحدة · سُلّمت المرحلة الأولى · طُرحت القطعة الخلفية ٢٠٢٣ · يسكنها أكثر من ٣٥٠ أسرة'}},
{k:{en:'June',ar:'جون'},    v:{en:'2,747 units · first delivery 2025 · June Hotel 200–250 keys, under development',ar:'٢٬٧٤٧ وحدة · أول تسليم ٢٠٢٥ · فندق «جون» ٢٠٠–٢٥٠ غرفة، تحت التطوير'}},
{k:{en:'Ogami',ar:'أوجامي'},v:{en:'1,900 units on 440 acres · 800 m of beachfront · Nobu Hotel & Residences · phase 1 by 2028, complete by 2029',ar:'١٬٩٠٠ وحدة على ٤٤٠ فداناً · ٨٠٠ متر واجهة شاطئية · فندق ومساكن «نوبو» · المرحلة الأولى بحلول ٢٠٢٨ والاكتمال ٢٠٢٩'}}]}
]
}},
{en:'Beyond the Homes', ar:'ما بعد المنازل', icon:'build',
imgs:[SD+'edara.webp', SD+'clubs.webp', SD+'retail.webp'],
copy:{
lead:{en:'Three arms run what SODIC builds after handover: Edara for facility management, SODIC Clubs for sports, and SODIC Retail for the community shops and restaurants its residents use daily.',
ar:'ثلاثة أذرع تدير ما تبنيه سوديك بعد التسليم: «إدارة» لإدارة المرافق، و«أندية سوديك» للرياضة، و«سوديك ريتيل» للمحال والمطاعم التي يستخدمها سكانها يومياً.'},
groups:[
{label:{en:'Edara — facility management', ar:'إدارة — إدارة المرافق'}, rows:[
{k:{en:'Established',ar:'التأسيس'},          v:{en:'2010, 100% owned subsidiary',ar:'٢٠١٠، شركة تابعة مملوكة بالكامل'}},
{k:{en:'Employees',ar:'الموظفون'},           v:{en:'2,415',ar:'٢٬٤١٥'}},
{k:{en:'Projects served',ar:'المشروعات المخدومة'}, v:{en:'5',ar:'٥'}},
{k:{en:'People served',ar:'المخدومون'},      v:{en:'30,000+',ar:'أكثر من ٣٠٬٠٠٠'}},
{k:{en:'Revenue 2022',ar:'الإيرادات ٢٠٢٢'},  v:{en:'EGP 470 mn',ar:'٤٧٠ مليون جنيه'}},
{k:{en:'Certification',ar:'الشهادات'},       v:{en:'ISO 45001, ISO 14001, ISO 9001',ar:'أيزو ٤٥٠٠١ و١٤٠٠١ و٩٠٠١'}}]},
{label:{en:'SODIC Clubs', ar:'أندية سوديك'}, rows:[
{k:{en:'Clubs operating',ar:'أندية عاملة'},   v:{en:'3, with 5 in the pipeline',ar:'٣، و٥ قيد الإعداد'}},
{k:{en:'Memberships',ar:'العضويات'},          v:{en:'5,307',ar:'٥٬٣٠٧'}},
{k:{en:'Academies',ar:'الأكاديميات'},         v:{en:'22+',ar:'أكثر من ٢٢'}}]},
{label:{en:'SODIC Retail', ar:'سوديك ريتيل'}, rows:[
{k:{en:'GLA completed',ar:'المساحة المؤجَّرة المنجزة'},      v:{en:'50,000+ m²',ar:'أكثر من ٥٠٬٠٠٠ م²'}},
{k:{en:'GLA under development',ar:'المساحة تحت التطوير'},    v:{en:'250,000 m²',ar:'٢٥٠٬٠٠٠ م²'}}]}
]
}},
{en:'Awards & Recognition', ar:'الجوائز والتقديرات', icon:'spark',
imgs:[SD+'awards.webp'],
copy:{
lead:{en:'The profile lists the awarding body and year for each recognition, from the EDGE green-building certification issued with the IFC in 2023 back to the ASLA award of merit for The Allegria master plan in 2007.',
ar:'يسرد الملف التعريفي الجهة المانحة والسنة لكل تقدير، من شهادة «EDGE» للمباني الخضراء الصادرة مع مؤسسة التمويل الدولية عام ٢٠٢٣ رجوعاً إلى جائزة الاستحقاق من «ASLA» عن المخطط العام لـ«أليجريا» عام ٢٠٠٧.'},
groups:[
{label:{en:'Certification and corporate', ar:'الشهادات والجوائز المؤسسية'}, rows:[
{k:{en:'EDGE & IFC World Bank — 2023',ar:'EDGE ومؤسسة التمويل الدولية — ٢٠٢٣'}, v:{en:'EDNC awarded EDGE Advanced Green Building Certification',ar:'حصول «EDNC» على شهادة «EDGE» المتقدّمة للمباني الخضراء'}},
{k:{en:'CIPS — 2021',ar:'CIPS — ٢٠٢١'},        v:{en:'Award for Excellence in Procurement',ar:'جائزة التميّز في المشتريات'}},
{k:{en:'MEIRA — 2017, 2018',ar:'MEIRA — ٢٠١٧ و٢٠١٨'}, v:{en:'Best Investor Relations Corporate in Egypt',ar:'أفضل علاقات مستثمرين لشركة في مصر'}},
{k:{en:'Business Today — 2011, 2010',ar:'بيزنس توداي — ٢٠١١ و٢٠١٠'}, v:{en:'BT100 Crystal Award for rank change · Enterprise Innovation Award',ar:'جائزة «BT100» الكريستالية لتغيّر الترتيب · جائزة ابتكار المؤسسات'}}]},
{label:{en:'Development awards', ar:'جوائز التطوير'}, rows:[
{k:{en:'Euromoney — 2016',ar:'يورومني — ٢٠١٦'},   v:{en:'Best Residential Project · Best Offices/Business Project — The Polygon',ar:'أفضل مشروع سكني · أفضل مشروع مكاتب وأعمال — «ذا بوليجون»'}},
{k:{en:'Euromoney — 2014',ar:'يورومني — ٢٠١٤'},   v:{en:'Best Office Business Developer in Egypt — The Polygon',ar:'أفضل مطوّر مكاتب أعمال في مصر — «ذا بوليجون»'}},
{k:{en:'Euromoney — 2011, 2010',ar:'يورومني — ٢٠١١ و٢٠١٠'}, v:{en:'Best Developer Overall — Egypt · Best Mixed-Use and Best Residential Developer — MENA',ar:'أفضل مطوّر إجمالاً — مصر · أفضل مطوّر متعدد الاستخدامات وأفضل مطوّر سكني — الشرق الأوسط وشمال أفريقيا'}},
{k:{en:'Cityscape — 2017',ar:'سيتي سكيب — ٢٠١٧'}, v:{en:'Best Community, Culture and Tourism · Best Commercial Project',ar:'أفضل مجتمع وثقافة وسياحة · أفضل مشروع تجاري'}},
{k:{en:'Cityscape — 2015, 2013',ar:'سيتي سكيب — ٢٠١٥ و٢٠١٣'}, v:{en:'Best Mixed-Use Built Development · Best Residential Project Built — The Allegria · Best Commercial and Mixed-Use Project Future — The Polygon',ar:'أفضل مشروع متعدد الاستخدامات مُنفَّذ · أفضل مشروع سكني مُنفَّذ — «أليجريا» · أفضل مشروع تجاري ومتعدد الاستخدامات مستقبلي — «ذا بوليجون»'}},
{k:{en:'CNBC Property — 2009, 2008',ar:'CNBC بروبرتي — ٢٠٠٩ و٢٠٠٨'}, v:{en:'Best Architecture · Best Development in Egypt (five-star) · Best Golf Course Development (four-star) — The Allegria',ar:'أفضل عمارة · أفضل مشروع في مصر (خمس نجوم) · أفضل تطوير ملعب جولف (أربع نجوم) — «أليجريا»'}},
{k:{en:'ASLA — 2007',ar:'ASLA — ٢٠٠٧'},          v:{en:'Award of Merit — The Allegria master plan by EDAW',ar:'جائزة الاستحقاق — المخطط العام لـ«أليجريا» من «EDAW»'}}]}
]
}}
]
},
'mountainview': {
masterplan: {en:'Projects Map — Egypt & KSA', ar:'خريطة المشروعات — مصر والسعودية', icon:'layers', src:MV+'projects-map.webp'},
cards: [
{en:'About Mountain View', ar:'عن ماونتن ڤيو', icon:'shield',
imgs:[MV+'park.webp', MV+'gate.webp', MV+'vision.webp'],
copy:{
lead:{en:'Mountain View for development and real estate investment was launched in 2005. With a vision aspiring to develop integrated communities and spread happiness, Mountain View has become the leading real estate company offering first class projects encompassing innovation, distinction and the science of happiness.',
ar:'تأسست شركة ماونتن ڤيو للتنمية والاستثمار العقاري عام ٢٠٠٥، بهدف تطوير مجتمعات عمرانية متكاملة من خلال تبني استراتيجية فريدة تقوم على السعادة والابتكار. ومن خلال رؤية «إعمار الأرض وإسعاد من حولنا»، تستخدم ماونتن ڤيو أفضل أدوات التطوير العقاري لتطبيق «علم السعادة وعلم الابتكار» في مشاريعها، مما يتيح لعملائها «عيش السعادة» كل يوم.'},
more:{en:'Over the past 20 years, the company has renewed its promises and confirmed its continuous dedication in delivering 23 distinctive projects. Mountain View owns a substantial land bank amounting to more than 6,000 acres, divided into 3 main districts in Egypt — East Cairo, West Cairo and coastal projects — along with its expansion in KSA. The kit prints its own line for the work: “Bringing life to land and spreading happiness around us.”',
ar:'على مدار العشرين عاماً الماضية، جدّدت الشركة وعودها وأكّدت التزامها المستمر في تنفيذ ٢٣ مشروعاً مميزاً. وتمتلك ماونتن ڤيو محفظة كبيرة من الأراضي تبلغ أكثر من ٦٠٠٠ فدان، موزّعة على ثلاث مناطق رئيسية في مصر — شرق القاهرة وغرب القاهرة والمشروعات الساحلية — بالإضافة إلى توسّعها في المملكة العربية السعودية. وعبارة الكتيّب عن عملها هي: «إعمار الأرض وإسعاد من حولنا».'}
}},
{en:'Success in Numbers', ar:'النجاح بالأرقام', icon:'star',
imgs:[MV+'aerial.webp', MV+'top20.webp', MV+'october-park.webp'],
copy:{
lead:{en:'The Sales Kit 2026 publishes the company\'s scorecard: 20+ years of work, 23+ projects, 6+ city-scale developments and 2 countries, with 50,000 families living in 15 communities that are already handed over.',
ar:'ينشر كتيّب المبيعات ٢٠٢٦ سجلّ الشركة: أكثر من ٢٠ عاماً من العمل، وأكثر من ٢٣ مشروعاً، وأكثر من ٦ مشروعات بحجم مدينة، ودولتان، مع ٥٠ ألف أسرة تعيش في ١٥ مجتمعاً جرى تسليمها بالفعل.'},
groups:[
{label:{en:'Success in numbers', ar:'النجاح بالأرقام'}, rows:[
{k:{en:'Years of success',ar:'سنوات من النجاح'},        v:{en:'20+',ar:'+٢٠'}},
{k:{en:'Projects',ar:'المشروعات'},                      v:{en:'23+',ar:'+٢٣'}},
{k:{en:'City-scale projects',ar:'مشروعات بحجم مدينة'},  v:{en:'6+',ar:'+٦'}},
{k:{en:'Countries',ar:'الدول'},                         v:{en:'2',ar:'٢'}},
{k:{en:'Sales achieved',ar:'المبيعات المحقّقة'},        v:{en:'EGP 315 bn',ar:'٣١٥ مليار جنيه'}},
{k:{en:'Land bank',ar:'محفظة الأراضي'},                 v:{en:'25m+ m²',ar:'أكثر من ٢٥ مليون م²'}},
{k:{en:'Units delivered',ar:'الوحدات المسلَّمة'},        v:{en:'17k',ar:'١٧ ألف'}},
{k:{en:'Families',ar:'الأسر'},                          v:{en:'50k',ar:'٥٠ ألف'}},
{k:{en:'Livable communities',ar:'المجتمعات المأهولة'},   v:{en:'15',ar:'١٥'}}]},
{label:{en:'Market standing', ar:'الترتيب في السوق'}, rows:[
{k:{en:'Top 20 developers 2024',ar:'أفضل ٢٠ مطوّراً ٢٠٢٤'}, v:{en:'3rd — EGP 105 bn (Source: The Board Consultancy 2024)',ar:'المركز الثالث — ١٠٥ مليار جنيه (المصدر: ذا بورد كونسلتانسي ٢٠٢٤)'}},
{k:{en:'Sales',ar:'المبيعات'},                              v:{en:'Among the top 5, five years in a row',ar:'ضمن أفضل ٥، خمس سنوات على التوالي'}},
{k:{en:'Power brands',ar:'أقوى العلامات التجارية'},         v:{en:'Among the top 5, five years in a row',ar:'ضمن أفضل ٥، خمس سنوات على التوالي'}}]}
]
}},
{en:'Building 2026', ar:'البناء في ٢٠٢٦', icon:'target',
imgs:[MV+'construction-2026.webp', MV+'icity-newcairo-lagoon.webp'],
copy:{
lead:{en:'Mountain View is accelerating execution with one of the largest construction budgets in the history of Egypt\'s real estate sector, allocating EGP 25 billion in 2026 to fast-track development across its projects.',
ar:'تُسرّع ماونتن ڤيو وتيرة التنفيذ بواحدة من أكبر ميزانيات الإنشاء في تاريخ قطاع العقارات المصري، بتخصيص ٢٥ مليار جنيه في عام ٢٠٢٦ لتسريع التطوير في كل مشروعاتها.'}
}},
{en:'Projects Timeline', ar:'الخط الزمني للمشروعات', icon:'spark',
imgs:[MV+'timeline-1.webp', MV+'timeline-2.webp', MV+'timeline-3.webp',
MV+'timeline-4.webp', MV+'timeline-5.webp', MV+'timeline-6.webp'],
copy:{
lead:{en:'Twenty years of launches, in the order the kit prints them — from the first Mountain View in New Cairo in 2005 to Jirian and Crysta in 2025.',
ar:'عشرون عاماً من الإطلاقات بالترتيب الذي ينشره الكتيّب — من «ماونتن ڤيو» الأولى بالقاهرة الجديدة عام ٢٠٠٥ إلى «جيريان» و«كريستا» عام ٢٠٢٥.'},
groups:[
{label:{en:'2005 – 2012', ar:'٢٠٠٥ – ٢٠١٢'}, rows:[
{k:{en:'2005',ar:'٢٠٠٥'}, v:{en:'Mountain View 1',ar:'ماونتن ڤيو ١'}},
{k:{en:'2006',ar:'٢٠٠٦'}, v:{en:'Mountain View 2 · MV Ras El Hikma',ar:'ماونتن ڤيو ٢ · إم ڤي رأس الحكمة'}},
{k:{en:'2007',ar:'٢٠٠٧'}, v:{en:'MV Sokhna 1 · MV Sokhna 2',ar:'إم ڤي السخنة ١ · إم ڤي السخنة ٢'}},
{k:{en:'2010',ar:'٢٠١٠'}, v:{en:'Giza Plateau',ar:'جيزة بلاتوه'}},
{k:{en:'2011',ar:'٢٠١١'}, v:{en:'Executive Residence Katameya',ar:'إكزكتيف ريزيدنس القطامية'}},
{k:{en:'2012',ar:'٢٠١٢'}, v:{en:'MV Hyde Park · October Park',ar:'إم ڤي هايد بارك · أكتوبر بارك'}}]},
{label:{en:'2015 – 2019', ar:'٢٠١٥ – ٢٠١٩'}, rows:[
{k:{en:'2015',ar:'٢٠١٥'}, v:{en:'Chillout Park',ar:'تشيل آوت بارك'}},
{k:{en:'2016',ar:'٢٠١٦'}, v:{en:'iCity New Cairo',ar:'آي سيتي القاهرة الجديدة'}},
{k:{en:'2017',ar:'٢٠١٧'}, v:{en:'iCity October',ar:'آي سيتي أكتوبر'}},
{k:{en:'2019',ar:'٢٠١٩'}, v:{en:'DMG · Heartwork',ar:'دي إم جي · هارت وورك'}}]},
{label:{en:'2022 – 2025', ar:'٢٠٢٢ – ٢٠٢٥'}, rows:[
{k:{en:'2022',ar:'٢٠٢٢'}, v:{en:'Mountain View 1.1 · Mountain View 4',ar:'ماونتن ڤيو ١٫١ · ماونتن ڤيو ٤'}},
{k:{en:'2023',ar:'٢٠٢٣'}, v:{en:'LVLS · Aliva · The Lighthouse',ar:'لِفلز · أليفا · ذا لايت هاوس'}},
{k:{en:'2024',ar:'٢٠٢٤'}, v:{en:'plage · Kingsway',ar:'بلاج · كينجزواي'}},
{k:{en:'2025',ar:'٢٠٢٥'}, v:{en:'ONE ون · Grand Valleys · Jirian · Crysta',ar:'ون · جراند فالييز · جيريان · كريستا'}}]}
]
}},
{en:'Where Mountain View Builds', ar:'أين تبني ماونتن ڤيو', icon:'pin',
imgs:[MV+'icity-october-mountain-park.webp', MV+'lvls.webp',
MV+'mv-sokhna1.webp', MV+'raselhikma-lagoon.webp'],
copy:{
lead:{en:'The kit\'s projects map places the portfolio in five clusters: East Cairo, West Cairo, the North Coast, Ain Sokhna and — as the company\'s first move outside Egypt — Saudi Arabia.',
ar:'تضع خريطة المشروعات في الكتيّب المحفظة في خمس مجموعات: شرق القاهرة، وغرب القاهرة، والساحل الشمالي، والعين السخنة، و— كأول خطوة للشركة خارج مصر — المملكة العربية السعودية.'},
groups:[
{label:{en:'On the map', ar:'على الخريطة'}, rows:[
{k:{en:'East Cairo',ar:'شرق القاهرة'},   v:{en:'Mountain View 1 · Mountain View 2 · Mountain View 1.1 · Executive Residence Katameya · MV Hyde Park · iCity New Cairo · Aliva · Grand Valleys',ar:'ماونتن ڤيو ١ · ماونتن ڤيو ٢ · ماونتن ڤيو ١٫١ · إكزكتيف ريزيدنس القطامية · إم ڤي هايد بارك · آي سيتي القاهرة الجديدة · أليفا · جراند فالييز'}},
{k:{en:'West Cairo',ar:'غرب القاهرة'},   v:{en:'Giza Plateau · October Park · Chillout Park · Mountain View 4 · iCity October · Kingsway · Jirian',ar:'جيزة بلاتوه · أكتوبر بارك · تشيل آوت بارك · ماونتن ڤيو ٤ · آي سيتي أكتوبر · كينجزواي · جيريان'}},
{k:{en:'North Coast',ar:'الساحل الشمالي'}, v:{en:'MV Ras El Hikma · LVLS · plage · Crysta',ar:'إم ڤي رأس الحكمة · لِفلز · بلاج · كريستا'}},
{k:{en:'Ain Sokhna',ar:'العين السخنة'},  v:{en:'MV Sokhna 1 · MV Sokhna 2',ar:'إم ڤي السخنة ١ · إم ڤي السخنة ٢'}},
{k:{en:'Saudi Arabia',ar:'المملكة العربية السعودية'}, v:{en:'Hayah · ONE ون',ar:'حياة · ون'}}]}
]
}},
{en:'Livable Communities', ar:'المجتمعات المأهولة', icon:'home',
imgs:[MV+'mv1.webp', MV+'mv2.webp', MV+'exec-katameya.webp',
MV+'hyde-park.webp', MV+'giza-plateau.webp', MV+'october-park.webp',
MV+'mv-raselhikma.webp'],
copy:{
lead:{en:'Fifteen communities are handed over and lived in. The kit lists them by district with the year each was launched.',
ar:'خمسة عشر مجتمعاً جرى تسليمها ويعيش فيها أصحابها. ويسردها الكتيّب حسب المنطقة مع سنة إطلاق كل منها.'},
groups:[
{label:{en:'East Cairo', ar:'شرق القاهرة'}, rows:[
{k:{en:'Mountain View 1',ar:'ماونتن ڤيو ١'},                       v:{en:'Launched 2005',ar:'أُطلق ٢٠٠٥'}},
{k:{en:'Mountain View 2',ar:'ماونتن ڤيو ٢'},                       v:{en:'Launched 2006',ar:'أُطلق ٢٠٠٦'}},
{k:{en:'Executive Residence Katameya',ar:'إكزكتيف ريزيدنس القطامية'}, v:{en:'Launched 2011',ar:'أُطلق ٢٠١١'}},
{k:{en:'MV Hyde Park',ar:'إم ڤي هايد بارك'},                        v:{en:'Launched 2012',ar:'أُطلق ٢٠١٢'}},
{k:{en:'iCity New Cairo — Club park',ar:'آي سيتي القاهرة الجديدة — كلوب بارك'}, v:{en:'Launched 2016',ar:'أُطلق ٢٠١٦'}},
{k:{en:'iCity New Cairo — Mountain View 3',ar:'آي سيتي القاهرة الجديدة — ماونتن ڤيو ٣'}, v:{en:'Launched 2019',ar:'أُطلق ٢٠١٩'}},
{k:{en:'iCity New Cairo — Heartwork',ar:'آي سيتي القاهرة الجديدة — هارت وورك'}, v:{en:'Launched 2019',ar:'أُطلق ٢٠١٩'}},
{k:{en:'iCity New Cairo — MV Park',ar:'آي سيتي القاهرة الجديدة — إم ڤي بارك'}, v:{en:'Launched 2020',ar:'أُطلق ٢٠٢٠'}}]},
{label:{en:'West Cairo', ar:'غرب القاهرة'}, rows:[
{k:{en:'Giza Plateau',ar:'جيزة بلاتوه'},        v:{en:'Launched 2010',ar:'أُطلق ٢٠١٠'}},
{k:{en:'October Park',ar:'أكتوبر بارك'},        v:{en:'Launched 2012',ar:'أُطلق ٢٠١٢'}},
{k:{en:'Chillout Park',ar:'تشيل آوت بارك'},     v:{en:'Launched 2015',ar:'أُطلق ٢٠١٥'}},
{k:{en:'iCity October — Club park Phase 1',ar:'آي سيتي أكتوبر — كلوب بارك المرحلة ١'}, v:{en:'Launched 2017',ar:'أُطلق ٢٠١٧'}},
{k:{en:'iCity October — MV Park',ar:'آي سيتي أكتوبر — إم ڤي بارك'}, v:{en:'Launched 2020',ar:'أُطلق ٢٠٢٠'}},
{k:{en:'Mountain View 4',ar:'ماونتن ڤيو ٤'},    v:{en:'Launched 2022',ar:'أُطلق ٢٠٢٢'}}]},
{label:{en:'Coastal', ar:'الساحل'}, rows:[
{k:{en:'MV Ras El Hikma',ar:'إم ڤي رأس الحكمة'}, v:{en:'Launched 2006',ar:'أُطلق ٢٠٠٦'}},
{k:{en:'MV Sokhna 1',ar:'إم ڤي السخنة ١'},       v:{en:'Launched 2007',ar:'أُطلق ٢٠٠٧'}},
{k:{en:'MV Sokhna 2',ar:'إم ڤي السخنة ٢'},       v:{en:'Launched 2007',ar:'أُطلق ٢٠٠٧'}}]}
]
}},
{en:'Under Construction', ar:'تحت الإنشاء', icon:'build',
imgs:[MV+'mv11-villas.webp', MV+'aliva.webp', MV+'grand-valleys.webp',
MV+'kingsway.webp', MV+'jirian.webp', MV+'crysta.webp'],
copy:{
lead:{en:'The construction-progress pages photograph what is being built right now across the three Egyptian districts, each phase carrying its launch year.',
ar:'تُصوّر صفحات تقدّم الإنشاءات ما يجري بناؤه الآن في المناطق المصرية الثلاث، وتحمل كل مرحلة سنة إطلاقها.'},
groups:[
{label:{en:'East Cairo', ar:'شرق القاهرة'}, rows:[
{k:{en:'iCity New Cairo — Mountain Park · Lagoon Beach Park',ar:'آي سيتي القاهرة الجديدة — ماونتن بارك · لاجون بيتش بارك'}, v:{en:'Launched 2021',ar:'أُطلق ٢٠٢١'}},
{k:{en:'Mountain View 1.1 — The Villas · The Park',ar:'ماونتن ڤيو ١٫١ — ذا فيلاز · ذا بارك'}, v:{en:'Launched 2022',ar:'أُطلق ٢٠٢٢'}},
{k:{en:'Aliva — River park · Fields park',ar:'أليفا — ريفر بارك · فيلدز بارك'}, v:{en:'Launched 2023',ar:'أُطلق ٢٠٢٣'}},
{k:{en:'Grand Valleys',ar:'جراند فالييز'},                v:{en:'Launched 2025',ar:'أُطلق ٢٠٢٥'}}]},
{label:{en:'West Cairo', ar:'غرب القاهرة'}, rows:[
{k:{en:'Chillout Park — Lakeside Villas',ar:'تشيل آوت بارك — ليك سايد فيلاز'}, v:{en:'Launched 2021',ar:'أُطلق ٢٠٢١'}},
{k:{en:'iCity October — Mountain Park · Lagoon Beach Park · Club park Phase 2',ar:'آي سيتي أكتوبر — ماونتن بارك · لاجون بيتش بارك · كلوب بارك المرحلة ٢'}, v:{en:'Launched 2022',ar:'أُطلق ٢٠٢٢'}},
{k:{en:'Kingsway by Mountain View Signature',ar:'كينجزواي من ماونتن ڤيو سيجنتشر'}, v:{en:'Launched 2024',ar:'أُطلق ٢٠٢٤'}},
{k:{en:'Jirian — Mountain View · Nations of Sky',ar:'جيريان — ماونتن ڤيو · نيشنز أوف سكاي'}, v:{en:'Launched 2025',ar:'أُطلق ٢٠٢٥'}}]},
{label:{en:'Coastal', ar:'الساحل'}, rows:[
{k:{en:'MV Ras El Hikma',ar:'إم ڤي رأس الحكمة'}, v:{en:'Lagoon opening summer 2026',ar:'افتتاح البحيرة صيف ٢٠٢٦'}},
{k:{en:'LVLS North Coast',ar:'لِفلز الساحل الشمالي'}, v:{en:'Launched 2023',ar:'أُطلق ٢٠٢٣'}},
{k:{en:'Crysta',ar:'كريستا'},                    v:{en:'Launched 2025',ar:'أُطلق ٢٠٢٥'}}]}
]
}}
]
},
'baghush': {
masterplan: {en:'Coded Masterplan — Marsa Baghush', ar:'الماستر بلان المُرمَّز — مرسى باغوش', icon:'layers', src:MB+'masterplan-coded.webp'},
cards: [
{en:'About Marsa Baghush', ar:'عن مرسى باغوش', icon:'shield', imgs:[MB+'beach-aerial.webp'],
copy:{
lead:{en:'In the most sought-after area of the North Coast, where the sandy beaches and bluest of blue waters of Sidi Heneish are a welcomed reminder of what good living is all about, you can find a gem of the coast called Marsa Baghush.',
ar:'في أكثر مناطق الساحل الشمالي رغبةً، حيث الشواطئ الرملية وأصفى مياه سيدي حنيش تذكّرك بمعنى الحياة الجيدة، تجد جوهرة الساحل التي تُسمّى مرسى باغوش.'},
more:{en:'With a location just off the coastal road, linked to Cairo via the El Alamein and Dabaa roads, this part of the North Coast is now a stone’s throw from the capital. The brochure’s own line for the place is “a place of good spirits”.',
ar:'بموقع على مقربة من الطريق الساحلي، ومتصل بالقاهرة عبر طريقي العلمين والضبعة، أصبح هذا الجزء من الساحل الشمالي على بُعد خطوة من العاصمة. وعبارة البروشور عن المكان هي «مكان الأرواح الطيبة».'}
}},
{en:'The Six Clusters', ar:'الأحياء الستة', icon:'layers', imgs:[MB+'masterplan.webp'],
copy:{
lead:{en:'The master plan is organised into six named clusters, each carrying a fruit of its own, with the lagoons threaded between them.',
ar:'الماستر بلان مقسّم إلى ستة أحياء، كل واحد يحمل اسم فاكهة، والبحيرات تمتد بينها.'},
groups:[
{label:{en:'Clusters', ar:'الأحياء'}, rows:[
{k:{en:'The Vineyard',ar:'ذا فينيارد'},   v:{en:'Villa types V1, V2, V3 — 265 to 270 m²',ar:'فيلات V1 و V2 و V3 — من ٢٦٥ إلى ٢٧٠ م²'}},
{k:{en:'Lemon Bliss',ar:'ليمون بليس'},    v:{en:'',ar:''}},
{k:{en:'Olive Grove',ar:'أوليف جروف'},    v:{en:'Chalet types O1, O2, O3 — 210 to 365 m²',ar:'شاليهات O1 و O2 و O3 — من ٢١٠ إلى ٣٦٥ م²'}},
{k:{en:'The Fig Cluster',ar:'فيج كلاستر'}, v:{en:'Chalet types F1, F2, F4 — 115 to 280 m²',ar:'شاليهات F1 و F2 و F4 — من ١١٥ إلى ٢٨٠ م²'}},
{k:{en:'The Plum Line',ar:'ذا بلَم لاين'}, v:{en:'Villa types P1, P2 — 395 and 615 m²',ar:'فيلات P1 و P2 — ٣٩٥ و ٦١٥ م²'}},
{k:{en:'Melon Villas',ar:'ميلون فيلاز'},  v:{en:'Types M1, M2 — 275 and 403 m²',ar:'النوعان M1 و M2 — ٢٧٥ و ٤٠٣ م²'}}]}]
}},
{en:'Location', ar:'الموقع', icon:'pin', imgs:[MB+'location.webp'],
copy:{
lead:{en:'Marsa Baghush sits on the Sidi Heneish stretch of the North Coast, between Almaza Bay and Ras El-Hekma.',
ar:'يقع مرسى باغوش على امتداد سيدي حنيش بالساحل الشمالي، بين ألماظة باي ورأس الحكمة.'},
more:{en:'The brochure’s location map places it against Marsa Matruh Airport, Almaza Bay, Sidi Heneish Village, Ras El-Hekma, Caesar Bay, Hacienda Red and Hacienda White, with the Dabaa Road running inland. No drive times are given.',
ar:'خريطة البروشور تضعه بالنسبة إلى مطار مرسى مطروح وألماظة باي وقرية سيدي حنيش ورأس الحكمة وقيصر باي وهاسيندا ريد وهاسيندا وايت، مع طريق الضبعة في الداخل. ولا يذكر البروشور أزمنة قيادة.'}
}},
{en:'A Day Here', ar:'يوم هنا', icon:'star', imgs:[MB+'lagoon-firepit.webp'],
copy:{
lead:{en:'The brochure walks one day from 7:45 am to 7:30 pm: waking to birdsong and coffee in the open-sky court within your own home, with plenty of natural light and sea breeze.',
ar:'يستعرض البروشور يوماً واحداً من ٧:٤٥ صباحاً حتى ٧:٣٠ مساءً: تستيقظ على تغريد الطيور وقهوتك في الفناء المفتوح داخل منزلك، بضوء طبيعي وافر ونسيم البحر.'},
more:{en:'A bike ride through the Olive Grove and the botanical spine to the Fig Cluster for fresh pastries at 9:40 am. At 10:40 am you step from your backyard in the Vineyard straight onto one of the five lagoons — over 50 metres wide, 300 metres long, crystal clear and lifeguarded — then on to the fitness facility. Lunch on the beach with friends in the Plum Line at 3:20 pm, towels and loungers brought to you. By 7:30 pm the ride home through the botanical garden, and dinner in your own garden with the beach in view at sunset.',
ar:'رحلة دراجة عبر أوليف جروف والعمود الأخضر إلى فيج كلاستر لمعجّنات طازجة في ٩:٤٠ صباحاً. وفي ١٠:٤٠ تخرج من حديقتك في ذا فينيارد مباشرة إلى إحدى البحيرات الخمس — أكثر من ٥٠ متراً عرضاً و٣٠٠ متر طولاً، صافية وبمنقذين — ثم إلى مركز اللياقة. غداء على الشاطئ مع الأصدقاء في ذا بلَم لاين في ٣:٢٠ عصراً، بمناشف وكراسي تُجلب إليك. وبحلول ٧:٣٠ مساءً العودة عبر الحديقة النباتية، وعشاء في حديقتك مع إطلالة الشاطئ عند الغروب.'}
}}
]
},
'beitalbahr': {
masterplan: {en:'Masterplan — Beit Al Bahr', ar:'الماستر بلان — بيت البحر', icon:'layers', src:BAB+'masterplan.webp'},
cards: [
{en:'About the Developer', ar:'عن المطوّر', icon:'shield', imgs:[BAB+'terrace.webp'],
copy:{
lead:{en:'Beit Al Bahr is the result of a collaboration between leading entities in the Egyptian market, collectively forming BAM, a joint venture.',
ar:'بيت البحر نتيجة تعاون بين كيانات رائدة في السوق المصري، تشكّل معاً «BAM»، وهو مشروع مشترك.'},
groups:[
{label:{en:'The joint venture', ar:'الشركاء'}, rows:[
{k:{en:'El Abd',ar:'العبد'},
v:{en:'The visionary behind identifying Sidi Heneish Bay as one of the North Coast’s most distinctive destinations over 30 years ago.',
ar:'صاحب الرؤية الذي حدّد خليج سيدي حنيش كأحد أكثر وجهات الساحل الشمالي تميّزاً منذ أكثر من ٣٠ عاماً.'}},
{k:{en:'Gura',ar:'جورا'},
v:{en:'A master contractor and home developer founded by the Badawy family, known for their strong expertise in engineering and construction across Alexandria and the North Coast.',
ar:'مقاول رئيسي ومطوّر عقاري أسّسته عائلة بدوي، معروف بخبرته القوية في الهندسة والإنشاءات في الإسكندرية والساحل الشمالي.'}},
{k:{en:'J Properties',ar:'جي بروبرتيز'},
v:{en:'A forward-thinking real estate partner and the driving force behind shaping projects from concept to market. Backed by over 20 years of combined expertise across multiple sectors, J Properties defines how destinations are envisioned, positioned, and brought to life.',
ar:'شريك عقاري ذو نظرة مستقبلية والقوة الدافعة لتشكيل المشروعات من الفكرة إلى السوق. بخبرة مجتمعة تتجاوز ٢٠ عاماً في قطاعات متعددة، تحدّد «جي بروبرتيز» كيف تُتصوَّر الوجهات وتُوضع وتُخرَج إلى الحياة.'}}]}]
}},
{en:'Mission & Vision', ar:'المهمة والرؤية', icon:'star', imgs:[BAB+'landscape.webp'],
copy:{
lead:{en:'Mission — Designing and building beachfront units that focus on privacy and exclusivity. Allowing residents to benefit from a peaceful environment where they can enjoy the sea views and greenery, along with various local activities, all while encouraging community interaction.',
ar:'المهمة — تصميم وبناء وحدات على الشاطئ تركّز على الخصوصية والتميّز، بما يتيح للسكان الاستفادة من بيئة هادئة يستمتعون فيها بإطلالات البحر والمساحات الخضراء إلى جانب أنشطة محلية متنوعة، مع تشجيع التفاعل المجتمعي.'},
more:{en:'Vision — To create communities that connect with nature, providing residents with a quiet environment and easy access to local experiences.',
ar:'الرؤية — إنشاء مجتمعات متصلة بالطبيعة، توفّر للسكان بيئة هادئة ووصولاً سهلاً إلى التجارب المحلية.'}
}},
{en:'Summer Haven Within Reach', ar:'ملاذ صيفي في المتناول', icon:'pin', imgs:[BAB+'lagoon.webp'],
copy:{
lead:{en:'Beit Al Bahr sits at El-Abd Resort Sidi Heneish, precisely at km 46 on the Matrouh–Alexandria road.',
ar:'يقع بيت البحر في منتجع العبد بسيدي حنيش، عند الكيلو ٤٦ على طريق مطروح–الإسكندرية.'},
more:{en:'Beachfront — Immerse yourself in the pristine beauty of the Mediterranean with a private 3.5 km beach offering stunning views while being conveniently close to the lively attractions of the North Coast. Area — This architectural escape is spread over 450 acres, carefully planned to offer spaciousness and expansive views for each unit.',
ar:'الشاطئ — انغمر في جمال البحر المتوسط البِكر بشاطئ خاص طوله ٣٫٥ كم يقدّم إطلالات ساحرة، مع قربٍ مريح من معالم الساحل الشمالي النابضة. المساحة — يمتد هذا الملاذ المعماري على ٤٥٠ فداناً، مخطَّطة بعناية لتوفير رحابة وإطلالات واسعة لكل وحدة.'},
groups:[
{label:{en:'Distances', ar:'المسافات'}, rows:[
{k:{en:'Matrouh–Alexandria road',ar:'طريق مطروح–الإسكندرية'}, v:{en:'km 46',ar:'الكيلو ٤٦'}},
{k:{en:'From Cairo',ar:'من القاهرة'},                        v:{en:'375 km',ar:'٣٧٥ كم'}},
{k:{en:'From Alexandria',ar:'من الإسكندرية'},                v:{en:'241–243 km (the brochure prints both)',ar:'٢٤١–٢٤٣ كم (البروشور يذكر الرقمين)'}},
{k:{en:'Private beach',ar:'شاطئ خاص'},                       v:{en:'3.5 km',ar:'٣٫٥ كم'}},
{k:{en:'Land area',ar:'مساحة الأرض'},                        v:{en:'450 acres',ar:'٤٥٠ فداناً'}}]}]
}},
{en:'Beachfront Beauty Maximized', ar:'جمال الشاطئ إلى أقصاه', icon:'layers', imgs:[BAB+'interior.webp'],
copy:{
lead:{en:'Rolling out on 450 acres of land, Beit Al Bahr is smartly designed from the inside to the outside to glorify the beauty of open spaces, thanks to an innovative configuration that invites a 3.5 km beachfront into every corner of your home.',
ar:'على ٤٥٠ فداناً، صُمّم بيت البحر بذكاء من الداخل إلى الخارج لتعظيم جمال المساحات المفتوحة، بفضل تشكيل مبتكر يجلب شاطئاً بطول ٣٫٥ كم إلى كل زاوية في منزلك.'},
more:{en:'The master-plan’s unique form is looped around people and privacy, bringing them closer to seafront, serenity, shimmering pools and an abundant variety of authentic experiences while lending an original air of flexibility to all unit types. All homes are evenly spread out to guarantee utmost exclusivity, surrounded by a green foliage of native plantations for a daily dose of natural inspiration. The design concept is drawn from the four elements of life: air, water, earth and fire.',
ar:'يلتف شكل الماستر بلان الفريد حول الناس والخصوصية، فيقرّبهم من الشاطئ والسكينة وحمامات السباحة المتلألئة وتنوّع غني من التجارب الأصيلة، مع منح جميع أنواع الوحدات مرونة أصيلة. وتتوزّع كل المنازل بالتساوي لضمان أقصى درجات التميّز، محاطة بغطاء أخضر من النباتات المحلية لجرعة يومية من الإلهام الطبيعي. ومفهوم التصميم مستوحى من عناصر الحياة الأربعة: الهواء والماء والأرض والنار.'},
groups:[
{label:{en:'Master plan key', ar:'مفتاح الماستر بلان'}, rows:[
{k:{en:'Shores',ar:'شورز'},                           v:{en:'',ar:''}},
{k:{en:'Roofs',ar:'روفز'},                            v:{en:'',ar:''}},
{k:{en:'Rays',ar:'رايز'},                             v:{en:'',ar:''}},
{k:{en:'Hills by the Sea',ar:'هيلز باي ذا سي'},        v:{en:'',ar:''}},
{k:{en:'Hotels',ar:'الفنادق'},                        v:{en:'',ar:''}},
{k:{en:'Tides',ar:'تايدز'},                           v:{en:'',ar:''}},
{k:{en:'Eastbay',ar:'إيست باي'},                      v:{en:'',ar:''}},
{k:{en:'Sails',ar:'سيلز'},                            v:{en:'',ar:''}},
{k:{en:'Serviced Apartments',ar:'شقق فندقية'},        v:{en:'',ar:''}},
{k:{en:'Commercial Area',ar:'المنطقة التجارية'},       v:{en:'',ar:''}}]}]
}}
]
}
};
function devFeatures(key){ return DEV_FEATURES[key] || null; }
var AAR = '/project-media/qataridiar/alam-al-roum/';
var PROJECT_BROCHURE = {
'alam-al-roum': {
title: {en:'Digital Brochure', ar:'البروشور الرقمي'},
file:  AAR+'alam-al-roum-brochure.pdf',
pages: [
AAR+'pages/p01.webp',
AAR+'pages/p02.webp',
AAR+'pages/p03.webp',
AAR+'pages/p04.webp',
AAR+'pages/p05.webp',
AAR+'pages/p06.webp',
AAR+'pages/p07.webp',
AAR+'pages/p08.webp',
AAR+'pages/p09.webp',
AAR+'pages/p10.webp',
AAR+'pages/p11.webp',
AAR+'pages/p12.webp',
AAR+'pages/p13.webp',
AAR+'pages/p14.webp',
AAR+'pages/p15.webp',
AAR+'pages/p16.webp',
AAR+'pages/p17.webp',
AAR+'pages/p18.webp',
AAR+'pages/p19.webp',
AAR+'pages/p20.webp',
AAR+'pages/p21.webp',
AAR+'pages/p22.webp',
AAR+'pages/p23.webp',
AAR+'pages/p24.webp',
AAR+'pages/p25.webp',
AAR+'pages/p26.webp',
AAR+'pages/p27.webp',
AAR+'pages/p28.webp',
AAR+'pages/p29.webp',
AAR+'pages/p30.webp',
AAR+'pages/p31.webp',
AAR+'pages/p32.webp',
AAR+'pages/p33.webp',
AAR+'pages/p34.webp',
AAR+'pages/p35.webp',
AAR+'pages/p36.webp',
AAR+'pages/p37.webp',
AAR+'pages/p38.webp',
AAR+'pages/p39.webp',
AAR+'pages/p40.webp',
AAR+'pages/p41.webp',
AAR+'pages/p42.webp',
AAR+'pages/p43.webp',
AAR+'pages/p44.webp',
AAR+'pages/p45.webp',
AAR+'pages/p46.webp',
AAR+'pages/p47.webp'
]
}
};
var PROJECT_FEATURES = {
'alam-al-roum': {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:AAR+'masterplan.webp'},
cards: [
{en:'The Story of Alam Al Roum', ar:'حكاية علم الروم', icon:'spark', imgs:[AAR+'story.webp'],
copy:{
lead:{en:'Two thousand years ago, a single headland marked this coast. Sailors crossing the open Mediterranean watched for it. When it rose from the water, they knew they were near harbour, near shelter, near home. The Romans named it a landmark. They called it Alam Al Roum.',
ar:'قبل ألفي عام كان رأس بري واحد يميّز هذا الساحل. كان البحّارة العابرون للمتوسط يترقّبونه، وحين يظهر من الماء يعرفون أنهم قرب المرفأ، قرب المأوى، قرب البيت. سمّاه الرومان علامة. وأسموه علم الروم.'},
more:{en:'Then, for a long time, the coast forgot. But the light that guided those ancient ships never left. The shape of the bay did not change. The calm of the sheltered water held. Alam Al Roum is the return of this coast to its meaning, restored in full, in all its scale, all its grandeur, all its light. The oldest landmark on the Egyptian Mediterranean is also its newest beginning.',
ar:'ثم نسي الساحل زمناً طويلاً. لكن الضوء الذي هدى تلك السفن القديمة لم يغادر قط. لم يتغيّر شكل الخليج، وظل هدوء المياه المحميّة على حاله. علم الروم هو عودة هذا الساحل إلى معناه، مستعاداً بالكامل، بكل اتساعه وجلاله وضوئه. أقدم معلم على المتوسط المصري هو أيضاً أحدث بداياته.'}
}},
{en:'Overview & Vision', ar:'نظرة عامة والرؤية', icon:'globe', imgs:[AAR+'coast.webp', AAR+'boulevard.webp'],
copy:{
lead:{en:'Along 7.2 kilometres of Mediterranean shoreline, fifteen minutes from Marsa Matrouh International Airport, a 4,902-feddan coastal city is taking shape. Masterplanned by Skidmore, Owings & Merrill, it is designed as one connected destination.',
ar:'على امتداد ٧٫٢ كيلومتر من ساحل المتوسط، وعلى بعد خمس عشرة دقيقة من مطار مرسى مطروح الدولي، تتشكّل مدينة ساحلية على ٤٬٩٠٢ فدان. صمّم مخططها العام مكتب سكيدمور أوينجز آند ميريل، كوجهة واحدة متصلة.'},
more:{en:'A grand boulevard links the shoreline to the heart of the city, while twenty-eight kilometres of swimmable lagoons bring the water into every neighbourhood. Distinct districts are connected by a continuous landscape spine, creating a walkable city with a strong sense of place. Locally it commands the finest stretch of Egypt\'s North Coast, connected by the Alexandria–Matrouh coastal road; regionally it sits within a short flight of Cairo, the Gulf capitals and the major cities of Europe.',
ar:'يربط بوليفارد كبير الشاطئ بقلب المدينة، بينما تُدخل ٢٨ كيلومتراً من البحيرات القابلة للسباحة الماء إلى كل حي. وتتصل الأحياء المتمايزة بعمود أخضر متواصل يصنع مدينة صالحة للمشي بحسّ مكاني قوي. محلياً تتصدّر أجمل امتداد في ساحل مصر الشمالي، متصلة بطريق الإسكندرية–مطروح الساحلي؛ وإقليمياً تقع على مسافة رحلة قصيرة من القاهرة وعواصم الخليج وكبرى مدن أوروبا.'},
groups:[
{label:{en:'Partners of Alam Al Roum', ar:'شركاء علم الروم'}, rows:[
{k:{en:'Masterplanners',ar:'المخطط العام'},                v:{en:'Skidmore, Owings & Merrill',ar:'سكيدمور أوينجز آند ميريل'}},
{k:{en:'Landscape architecture & design',ar:'تنسيق المواقع والتصميم'}, v:{en:'SWA Group',ar:'إس دبليو إيه جروب'}},
{k:{en:'Hospitality partner',ar:'شريك الضيافة'},           v:{en:'HVS',ar:'إتش في إس'}},
{k:{en:'Marina design & operations',ar:'تصميم وتشغيل المارينا'}, v:{en:'Marina Projects',ar:'مارينا بروجكتس'}},
{k:{en:'Infrastructure & mobility consultant',ar:'استشاري البنية التحتية والتنقل'}, v:{en:'SETEC',ar:'سيتك'}},
{k:{en:'Real estate advisory',ar:'الاستشارات العقارية'},   v:{en:'Savills',ar:'سافيلز'}}]}
]
}},
{en:'An Urban Coastal City', ar:'مدينة ساحلية حضرية', icon:'build', imgs:[AAR+'city.webp', AAR+'town.webp'],
copy:{
lead:{en:'Alam Al Roum carries the civic substance of a true city: a vibrant coastal lifestyle, dynamic waterfront destinations, town centres that trade through every season, a thriving freezone economy, a longevity and medical quarter, and educational institutions.',
ar:'يحمل علم الروم جوهر المدينة الحقيقية: أسلوب حياة ساحلي نابض، وجهات مائية حيوية، مراكز مدينة تعمل في كل المواسم، اقتصاد منطقة حرة مزدهر، حي للصحة وطول العمر، ومؤسسات تعليمية.'},
more:{en:'Its neighbourhoods are walkable and climate-responsive, with homes oriented towards water and light and a continuous mobility loop linking every district, designed for people before vehicles. The town centres are the social and cultural anchors: ground-floor retail and waterfront dining sit alongside galleries, café terraces and open-air programming, looking out across the lagoons and trading year-round.',
ar:'أحياؤها صالحة للمشي ومستجيبة للمناخ، بمنازل موجّهة نحو الماء والضوء، وحلقة تنقّل متصلة تربط كل حي، مصمّمة للناس قبل السيارات. ومراكز المدينة هي مرتكزها الاجتماعي والثقافي: تجزئة في الطابق الأرضي ومطاعم على الواجهة المائية إلى جانب صالات عرض وتراسات مقاهٍ وفعاليات في الهواء الطلق، تطل على البحيرات وتعمل طوال العام.'}
}},
{en:'Water Experiences', ar:'تجارب الماء', icon:'am_lagoon', imgs:[AAR+'beach.webp', AAR+'lagoon.webp'],
copy:{
lead:{en:'Water is the first language of Alam Al Roum: 7.2 kilometres of Mediterranean beachfront, twenty-eight of lagoon frontage, and canals that carry the sea into the city\'s heart.',
ar:'الماء هو اللغة الأولى لعلم الروم: ٧٫٢ كيلومتر من واجهة المتوسط، و٢٨ كيلومتراً من واجهات البحيرات، وقنوات تحمل البحر إلى قلب المدينة.'},
more:{en:'The shoreline runs along a naturally sheltered bay where calm waters invite bathing throughout the season, each stretch with its own character, from lively promenades to quiet coves. Inland, twenty-two kilometres of crystalline swimmable lagoons form the city\'s second coastline, with homes opening directly onto the water. Through the centre, a signature canal walk lined with cafés, retail and waterfront dining carries water taxis, connecting the boulevard to the marina in one continuous, walkable thread.',
ar:'يمتد الشاطئ على خليج محمي طبيعياً تدعو مياهه الهادئة للسباحة طوال الموسم، ولكل امتداد طابعه، من الممشى النابض إلى الخلجان الهادئة. وفي الداخل تشكّل ٢٢ كيلومتراً من البحيرات الصافية القابلة للسباحة الساحل الثاني للمدينة، بمنازل تفتح مباشرة على الماء. وفي القلب يمتد ممشى القناة المميّز بمقاهيه ومتاجره ومطاعمه، تحمل مياهه تاكسيات مائية تربط البوليفارد بالمارينا في خيط واحد متصل.'}
}},
{en:'Landscape Experience', ar:'تجربة المساحات الخضراء', icon:'am_landscape', imgs:[AAR+'spine.webp'],
copy:{
lead:{en:'The landscape, shaped by SWA, is the green structure that binds the city\'s districts into one. At its core runs the Spine: a continuous corridor of gardens, shaded walks and trails linking every neighbourhood from the Gateway to the sea — more than thirty kilometres of paths.',
ar:'المساحات الخضراء، بتصميم SWA، هي البنية التي تربط أحياء المدينة في كلٍّ واحد. وفي قلبها يمتد العمود: ممر متواصل من الحدائق والممشيات المظلّلة والمسارات يصل كل حي من البوابة إلى البحر — أكثر من ثلاثين كيلومتراً من الممرات.'},
more:{en:'From it, each neighbourhood draws a distinct landscape character, expressed through its own planting palette, rhythm and mood. The planting is rooted in the place: native and climate-adapted species are preserved and propagated, sustaining biodiversity and easing the city\'s thirst. Throughout, the lagoon and canal network manages stormwater, sustains the wetlands and keeps the waters clear — beauty doing the work of engineering.',
ar:'ومنه يستمد كل حي طابعاً نباتياً متمايزاً بلوحته ونسقه ومزاجه. والزراعة متجذّرة في المكان: أنواع محلية ومتأقلمة مع المناخ يجري الحفاظ عليها وإكثارها، بما يدعم التنوّع الحيوي ويخفّف عطش المدينة. وعلى امتدادها تدير شبكة البحيرات والقنوات مياه الأمطار وتغذّي الأراضي الرطبة وتحافظ على صفاء المياه — جمالٌ يؤدي عمل الهندسة.'}
}},
{en:'Hospitality Experience', ar:'تجربة الضيافة', icon:'am_hotel', imgs:[AAR+'arch.webp'],
copy:{
lead:{en:'Alam Al Roum hosts a calibre of hospitality the Mediterranean reserves for its most celebrated coasts. Ultra-luxury resorts carry the signatures of the world\'s most distinguished houses; between them, intimate boutique hotels offer a quieter register.',
ar:'يستضيف علم الروم مستوى من الضيافة يحفظه المتوسط لأشهر سواحله. منتجعات فائقة الفخامة تحمل توقيع أعرق الأسماء العالمية، وبينها فنادق بوتيك حميمة بنبرة أهدأ.'},
more:{en:'Inland, wellness retreats and a longevity quarter extend hospitality into the science of living well. Across every tier the intent holds: arrival should feel like an occasion, and every return like coming home.',
ar:'وفي الداخل تمتد الضيافة عبر منتجعات العافية وحي طول العمر إلى علم الحياة الجيدة. وفي كل مستوى يبقى المقصد واحداً: أن يكون الوصول مناسبة، وكل عودة كأنها عودة إلى البيت.'}
}},
{en:'Marina & Boating Experiences', ar:'المارينا وتجارب اليخوت', icon:'am_beach', imgs:[AAR+'marina.webp'],
copy:{
lead:{en:'Alam Al Roum returns Egypt\'s North Coast to the Mediterranean\'s great circuit of harbours, offering three distinct ways to meet the water.',
ar:'يعيد علم الروم ساحل مصر الشمالي إلى دائرة موانئ المتوسط الكبرى، بثلاث طرق متمايزة للقاء الماء.'},
more:{en:'At the heart of the city, an international standard marina designed and operated by Marina Projects is built to receive vessels of significant scale. Its waterfront promenade of dining and retail draws residents and visitors from dawn into the night — the social centre of Alam Al Roum and its window to the wider sea. A second, intimate harbour offers fifty berths for residents\' yachts and boats, and private docking brings the water to the door of The Shore Collection residences.',
ar:'في قلب المدينة مارينا بمعايير دولية صمّمتها وتشغّلها مارينا بروجكتس، مهيّأة لاستقبال سفن بأحجام كبيرة. وممشاها المائي بمطاعمه ومتاجره يجذب السكان والزوار من الفجر إلى الليل — المركز الاجتماعي لعلم الروم ونافذته على البحر الأوسع. ومرفأ ثانٍ أصغر يوفّر خمسين مرسى ليخوت السكان وقواربهم، فيما يجلب الرسو الخاص الماء إلى أبواب مساكن ذا شور كوليكشن.'}
}},
{en:'Golf Experience', ar:'تجربة الجولف', icon:'am_gardenpark', imgs:[AAR+'golf.webp'],
copy:{
lead:{en:'At the northern reach of Alam Al Roum, an eighteen-hole championship course is set into the natural contours of the land, its front nine threading the edges of a natural lagoon, its back nine running along the open Mediterranean.',
ar:'في الطرف الشمالي من علم الروم يمتد ملعب بطولة من ثمانية عشر حفرة داخل تضاريس الأرض الطبيعية، تسع حفر أمامية تتبع حواف بحيرة طبيعية، وتسع خلفية تمتد على المتوسط المفتوح.'},
more:{en:'Three signature holes are drawn directly above the sea, where play pauses for the view. A clubhouse and golf academy anchor the course, and the residences that line its fairways enjoy one of the most coveted outlooks in the city: green to one side, blue to the other.',
ar:'ثلاث حفر مميّزة مرسومة فوق البحر مباشرة، حيث يتوقّف اللعب أمام المشهد. ويرتكز الملعب على نادٍ وأكاديمية جولف، وتتمتع المساكن المصطفّة على مساراته بإحدى أجمل الإطلالات في المدينة: الأخضر من جهة والأزرق من الأخرى.'}
}},
{en:'Homes of Alam Al Roum', ar:'منازل علم الروم', icon:'home', imgs:[AAR+'homes.webp'],
copy:{
lead:{en:'The homes span the full register of coastal living, from lagoon-front apartments to standalone villas, from townhouses with sun decks on the water to the signature estates of the Royal Quarter.',
ar:'تغطي المنازل مدى السكن الساحلي كاملاً، من شقق على البحيرات إلى فيلات مستقلة، ومن تاون هاوس بتراسات شمسية على الماء إلى قصور الحي الملكي المميّزة.'},
more:{en:'Each home is designed around the things that endure: natural light, generous proportion, a seamless passage between indoors and out, and a view worth waking to. Façades are composed with restraint and warmth, front and back elevations resolved with equal care so that a home is beautiful from every approach. Whether a first coastal address or a family seat to be passed down, these are residences built to be returned to season after season, generation after generation.',
ar:'كل منزل مصمّم حول ما يدوم: الضوء الطبيعي، والنسب السخيّة، والانتقال السلس بين الداخل والخارج، وإطلالة تستحق الاستيقاظ لها. الواجهات مؤلَّفة بتحفّظ ودفء، والواجهتان الأمامية والخلفية مُعالَجتان بالعناية نفسها ليكون المنزل جميلاً من كل اتجاه. سواء كان أول عنوان ساحلي أو مقرّاً عائلياً يُورَّث، فهذه مساكن بُنيت ليُعاد إليها موسماً بعد موسم وجيلاً بعد جيل.'}
}}
]
}
};
PROJECT_FEATURES['masyaf-ras-alhekma'] = {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:MSQ+'masyaf-masterplan.webp'},
cards: [
{en:'Home to the Light of a Thousand Suns', ar:'موطن ضوء ألف شمس', icon:'spark', imgs:[MSQ+'masyaf-shore.webp', MSQ+'masyaf-lagoon.webp'],
copy:{
lead:{en:'Inspired by Greek architecture where floating seascapes and natural simplicity live indoors, Masyaf Ras Alhekma is a waking dream, stretching out on an impressive 112 feddans of land to lap a pristine 730-metre beachfront on the Mediterranean shore.',
ar:'مستوحى من العمارة اليونانية حيث تعيش المشاهد البحرية والبساطة الطبيعية في الداخل، «مصياف رأس الحكمة» حلم في اليقظة، يمتد على ١١٢ فداناً ليلامس واجهة بحرية بكر بطول ٧٣٠ متراً على شاطئ المتوسط.'},
more:{en:'Expertly master planned by M squared, the destination takes luxury living to new heights through elevated platforms, guaranteeing equal views for all homeowners alike while radiating an expansive air of exclusivity and uninterrupted peace. Life here is natural light and sun-drenched beauty amplified around every corner of your signature home.',
ar:'وبمخطط عام أعدّته إم سكويرد بخبرة، ترفع الوجهة السكن الفاخر إلى آفاق جديدة عبر منصات متدرّجة تضمن إطلالات متساوية لجميع الملّاك، وتشعّ جوّاً واسعاً من التفرّد والسكينة غير المنقطعة. والحياة هنا ضوء طبيعي وجمال مغمور بالشمس يتضاعف في كل ركن من بيتك المميّز.'}
}},
{en:'Marmarica Boutique Cabanas', ar:'كابانات مرماريكا البوتيكية', icon:'am_hotel', imgs:[MSQ+'masyaf-marmarica.webp', MSQ+'masyaf-marmarica-room.webp'],
copy:{
lead:{en:'Set on the Mediterranean’s most glimmering coast inside Masyaf Ras Alhekma, Marmarica Boutique Hotel introduces a luxury-barefoot experience with truly refined hospitality. It presents eighteen contemporary-chic cabanas built out over a blue infinity pool that ends right where the Mediterranean begins, managed by the M squared Hospitality team of international hoteliers.',
ar:'على أكثر سواحل المتوسط تلألؤاً داخل «مصياف رأس الحكمة»، يقدّم فندق «مرماريكا» البوتيكي تجربة فخامة حافية القدمين بضيافة راقية حقاً. ويضم ثماني عشرة كابانا معاصرة أنيقة مبنية فوق مسبح لا نهائي أزرق ينتهي حيث يبدأ المتوسط، ويديره فريق إم سكويرد للضيافة من الفندقيين الدوليين.'}
}},
{en:'Peppermint Wellbeing Centre', ar:'مركز بيبرمنت للعافية', icon:'am_sauna', imgs:[MSQ+'masyaf-peppermint.webp', MSQ+'masyaf-peppermint-in.webp'],
copy:{
lead:{en:'Peppermint is Masyaf’s destination for holistic wellbeing. From expert-led fitness sessions to calming spa treatments and wellness rituals, the centre is designed to recharge the body and mind — all within a tranquil, nature-wrapped setting.',
ar:'«بيبرمنت» وجهة مصياف للعافية الشاملة. ومن جلسات اللياقة بإشراف خبراء إلى علاجات السبا المهدّئة وطقوس العافية، صُمّم المركز لإعادة شحن الجسد والذهن — كل ذلك في محيط هادئ يلفّه الطبيعة.'}
}},
{en:'Barten Masyaf', ar:'بارتن مصياف', icon:'am_dining', imgs:[MSQ+'masyaf-barten.webp', MSQ+'masyaf-barten-dining.webp'],
copy:{
lead:{en:'A coastal expression of the beloved El Gouna hotspot, BARTEN brings its Asian-inspired cuisine and minimalist design to the shores of Masyaf. Perched directly on the sand, it offers a serene, sensory dining experience where the ritual of food meets the rhythm of the sea.',
ar:'تعبير ساحلي عن المكان المحبوب في الجونة، يجلب «بارتن» مطبخه المستوحى من آسيا وتصميمه البسيط إلى شواطئ مصياف. ويقع على الرمال مباشرة، فيقدّم تجربة طعام هادئة وحسّية يلتقي فيها طقس الطعام بإيقاع البحر.'}
}},
{en:'Ritsa — the commercial heart', ar:'ريتسا — القلب التجاري', icon:'am_retail', imgs:[MSQ+'masyaf-ritsa.webp', MSQ+'masyaf-ritsa-night.webp', MSQ+'masyaf-ritsa-day.webp', MSQ+'masyaf-facilities.webp'],
copy:{
lead:{en:'Set to become Ras Alhekma’s most iconic meeting point, Ritsa is Masyaf’s commercial heart, created in collaboration with Wander Commercial Developments. It celebrates the unfiltered beauty of coastal living, where simplicity, togetherness and culture come together.',
ar:'مرشّح ليكون أشهر ملتقى في رأس الحكمة، «ريتسا» هو القلب التجاري لمصياف، أُنشئ بالتعاون مع «واندر» للتطوير التجاري. ويحتفي بجمال الحياة الساحلية بلا تصنّع، حيث تجتمع البساطة والاجتماع والثقافة.'},
groups:[
{label:{en:'Brands the profile names', ar:'العلامات المذكورة في الملف'}, rows:[
{k:{en:'Dining & cafés',ar:'مطاعم ومقاهٍ'}, v:{en:'Boulevard · JJ’s · Howlin’ Birds · Saints · Pào · Mayyal Mayyal · Dara’s Ice Cream · Meat Party Burgers · What The Crust · TBS',ar:'بوليفارد · جيه جيهز · هاولين بيردز · سينتس · باو · ميّال ميّال · دارا آيس كريم · ميت بارتي برجرز · وات ذا كرست · تي بي إس'}},
{k:{en:'Sport & lifestyle',ar:'رياضة ولايف ستايل'}, v:{en:'The Rush Padel · F45 Track · In Your Shoe · Lemonade Concept Store · Elle Salon',ar:'ذا رَش بادل · إف٤٥ تراك · إن يور شو · ليمونيد كونسبت ستور · صالون إيل'}}]}
]
}}
]
};
PROJECT_FEATURES['trio-new-cairo'] = {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:MSQ+'trio-masterplan.webp'},
cards: [
{en:'The TRIO concept', ar:'مفهوم تريو', icon:'home', imgs:[MSQ+'trio-overview.webp', MSQ+'trio-exterior.webp', MSQ+'trio-interior.webp'],
copy:{
lead:{en:'A signature boutique community introducing a new living concept at the heart of New Cairo. A state-of-the-art residential compound expertly planned on 35.5 acres of verdant land, TRIO stands as a true testament to modern-day living.',
ar:'مجتمع بوتيكي مميّز يقدّم مفهوم سكن جديداً في قلب القاهرة الجديدة. مجمّع سكني حديث خُطّط بخبرة على ٣٥٫٥ فدان من الأرض الخضراء، ويقف «تريو» شاهداً حقيقياً على السكن العصري.'},
more:{en:'Designed with varied needs in mind, TRIO is characterised by a “three villas per complex” concept with hanging gardens and flying pools, surrounded by encompassing amenities. Each duplex has its own garden and maximum privacy, and the plan runs over three phases with a commercial strip and a club house along one edge.',
ar:'وقد صُمّم مراعياً احتياجات متنوّعة، ويتميّز «تريو» بمفهوم «ثلاث فيلات لكل مجمّع» بحدائق معلّقة وحمامات سباحة طائرة، تحيط بها مرافق شاملة. ولكل دوبلكس حديقته الخاصة وأقصى خصوصية، ويمتد المخطط على ثلاث مراحل مع شريط تجاري وكلوب هاوس على أحد الأطراف.'}
}}
]
};
PROJECT_FEATURES['mist-new-cairo'] = {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:MSQ+'mist-masterplan.webp'},
cards: [
{en:'A living pathway', ar:'ممرّ حيّ', icon:'spark', imgs:[MSQ+'mist-townhouse.webp', MSQ+'mist-apartments.webp'],
copy:{
lead:{en:'MIST is not a place you escape to. It is a place you live within, pass through, and engage with fully. Inspired by its name, MIST is a passage, a lifestyle artery, and a destination all at once.',
ar:'«ميست» ليس مكاناً تهرب إليه، بل مكان تعيش داخله وتمرّ به وتنخرط فيه بالكامل. ومستوحى من اسمه، «ميست» ممرّ وشريان لايف ستايل ووجهة في آن واحد.'},
more:{en:'Rather than rigid zones, the community unfolds in intuitive layers. Serene homes flow alongside water and greenery, offering moments of calm and retreat. In another direction, the commercial promenade brings daily vibrance, with spaces to work, shop and connect. At the centre, a vibrant public plaza ties it all together — a natural gathering point where life happens easily and often. The name was chosen for its relevance to motion, transformation and fluidity.',
ar:'وبدلاً من المناطق الجامدة، ينكشف المجتمع في طبقات بديهية. تنساب منازل هادئة بمحاذاة الماء والخضرة فتمنح لحظات هدوء وانسحاب. وفي اتجاه آخر يمنح البروميناد التجاري الحياة اليومية حيويتها بمساحات للعمل والتسوّق والتواصل. وفي المركز تربط بلازا عامة نابضة كل شيء — ملتقى طبيعي تحدث فيه الحياة بسهولة وتكرار. واختير الاسم لصلته بالحركة والتحوّل والانسيابية.'}
}}
]
};
PROJECT_FEATURES['31-west-october'] = {
masterplan: {en:'Masterplan', ar:'الماستر بلان', icon:'layers', src:MSQ+'w31-masterplan.webp'},
cards: [
{en:'Thirty One, come home', ar:'ثيرتي وان، عُد إلى البيت', icon:'home', imgs:[MSQ+'w31-lakeside.webp', MSQ+'w31-villa.webp', MSQ+'w31-garden.webp'],
copy:{
lead:{en:'31 WEST epitomises refined living within 31 acres at the most exclusive location in 6th of October, where every detail is meticulously curated to exude exclusivity and sophistication.',
ar:'يجسّد «٣١ ويست» السكن الراقي على ٣١ فداناً في أكثر مواقع ٦ أكتوبر تميّزاً، حيث كل تفصيلة منتقاة بعناية لتفيض تفرّداً ورقيّاً.'},
more:{en:'From grand water features and inspiring designs to landscaped surroundings and the first-of-its-kind Senior Executive Suites, this project stands as a testament to timeless elegance and elite living.',
ar:'ومن المسطحات المائية الكبرى والتصاميم الملهمة إلى المحيط المنسّق والأجنحة التنفيذية الأولى من نوعها، يقف هذا المشروع شاهداً على الأناقة الخالدة والحياة الصفوية.'},
groups:[
{label:{en:'On the master plan', ar:'على الماستر بلان'}, rows:[
{k:{en:'Housing',ar:'السكن'},        v:{en:'Villa · twin villa · town house · terraced flats',ar:'فيلا · توين فيلا · تاون هاوس · شقق بتراسات'}},
{k:{en:'Commercial 1',ar:'التجاري ١'}, v:{en:'Administration building',ar:'مبنى إداري'}},
{k:{en:'Commercial 2',ar:'التجاري ٢'}, v:{en:'Daily use · F&B outlets · club house',ar:'الاستخدام اليومي · مطاعم ومقاهٍ · كلوب هاوس'}}]}
]
}}
]
};
PROJECT_FEATURES['41-business-district'] = {
cards: [
{en:'Commercial Landmark', ar:'معلم تجاري', icon:'build', imgs:[MSQ+'b41-landmark.webp', MSQ+'b41-interiors.webp', MSQ+'b41-construction.webp'],
copy:{
lead:{en:'Take your business and your life to the next level at the heart of Kattameya Ring Road, with the freedom to flawlessly execute work while enjoying commercial luxuries at your door.',
ar:'ارتقِ بعملك وحياتك في قلب الطريق الدائري بالقطامية، بحرية تنفيذ عملك بلا عوائق مع رفاهيات تجارية على بابك.'},
more:{en:'Dynamic, detailed and more than a little dashing, 41 Business District rises to new contemporary heights. Its innovative, multipurpose concept blends cutting-edge office and clinic spaces with commercial luxuries in one iconic landmark. Strategically situated off the Kattameya Ring Road, it connects multiple districts of the city with seamless mobility and urban proximity.',
ar:'ديناميكي ودقيق التفاصيل وأنيق بامتياز، يرتفع «٤١ بيزنس ديستريكت» إلى آفاق معاصرة جديدة. ويمزج مفهومه المبتكر متعدد الاستخدامات مساحات المكاتب والعيادات الحديثة مع رفاهيات تجارية في معلم أيقوني واحد. وبموقعه الاستراتيجي على الطريق الدائري بالقطامية، يربط عدة أحياء بالمدينة بتنقّل سلس وقرب حضري.'}
}}
]
};
function projBrochure(slug){ return PROJECT_BROCHURE[slug] || null; }
function projFeatures(slug){ return PROJECT_FEATURES[slug] || null; }
function projectBrochureSection(p){
var b = projBrochure(p.slug); if(!b) return null;
var nm = L({en:p.name, ar:p.name_ar}), label = L(b.title), n = b.pages.length;
var items = b.pages.map(function(s,i){ return {src:s, cap:nm+' · '+label+' ('+(i+1)+'/'+n+')'}; });
var open = h('button',{class:'ufeat', type:'button'},
ic('doc','ufeat__ic'),
h('span',null, (lang==='ar' ? 'تصفّح البروشور' : 'Read the brochure') + ' · ' + num(n) +
(lang==='ar' ? ' صفحة' : ' pages')));
open.addEventListener('click', function(){ mediaViewer(items, nm+' · '+label, 0); });
var seo = h('img',{src:b.pages[0], alt:nm+' — '+label, width:1200, height:2133,
loading:'lazy', decoding:'async', class:'visually-hidden'});
return h('section',{class:'section--tight band'},
h('div',{class:'wrap'},
h('div',{class:'sec-head'}, h('h2',{class:'dev-feat__title'}, ic('doc','dev-feat__ico'), h('span',null,label))),
h('div',{class:'ufeat-row'}, open), seo));
}
function featImg(src, items, i, alt, w, hgt){
var img = h('img',{src:src, alt:alt, loading:'lazy', decoding:'async', width:w, height:hgt});
img.addEventListener('error', function(){ if(img.parentNode) img.parentNode.removeChild(img); });
img.addEventListener('click', function(){ mediaViewer(items, alt, i); });
return img;
}
function devMasterplanSection(dev){ return masterplanSection(devFeatures(dev.key), L(dev.name)); }
function masterplanSection(f, nm){
if(!f || !f.masterplan) return null;
var m = f.masterplan, label = L({en:m.en, ar:m.ar});
var items = [{src:m.src, cap:nm+' · '+label}];
var head = h('div',{class:'sec-head'},
h('h2',{class:'dev-feat__title'}, ic(m.icon,'dev-feat__ico'), h('span',null,label)));
var open = h('button',{class:'ufeat', type:'button'},
ic('masterplan','ufeat__ic'),
h('span',null, lang==='ar' ? 'عرض الماستر بلان' : 'View master plan'));
open.addEventListener('click', function(){ mediaViewer(items, nm+' · '+label, 0); });
var seo = h('img',{src:m.src, alt:nm+' — '+label, width:1395, height:778,
loading:'lazy', decoding:'async', class:'visually-hidden'});
return h('section',{class:'section--tight band'},
h('div',{class:'wrap'}, head, h('div',{class:'dev-mp'}, open, seo)));
}
function projectPlanSection(p){
var g = projectPlans(p.slug);
var f = projFeatures(p.slug);
var mp = (g.mp || []).slice();
if(f && f.masterplan && mp.indexOf(f.masterplan.src) < 0) mp.unshift(f.masterplan.src);
if(!mp.length) mp = null;
var loc = g.loc || null;
if(!mp && !loc) return null;
var nm = L({en:p.name, ar:p.name_ar});
var MPL = lang==='ar' ? 'الماستر بلان' : 'Master plan';
var LOCL = lang==='ar' ? 'الموقع' : 'Location';
var label = (mp && loc) ? (lang==='ar' ? 'الماستر بلان والموقع' : 'Master plan & location')
: (mp ? MPL : LOCL);
var row = h('div',{class:'dev-mp'});
function btn(list, title, icon, text){
var items = list.map(function(s,i){
return {src:planUrl(s), cap:nm+' · '+title+(list.length>1?(' ('+(i+1)+'/'+list.length+')'):'')};
});
var b = h('button',{class:'ufeat', type:'button'}, ic(icon,'ufeat__ic'), h('span',null,text));
b.addEventListener('click', function(){ mediaViewer(items, nm+' · '+title, 0); });
row.appendChild(b);
row.appendChild(h('img',{src:items[0].src, alt:nm+' — '+title, width:1395, height:778,
loading:'lazy', decoding:'async', class:'visually-hidden'}));
}
if(mp)  btn(mp,  MPL,  'masterplan', lang==='ar' ? 'عرض الماستر بلان' : 'View master plan');
if(loc) btn(loc, LOCL, 'pin',        lang==='ar' ? 'عرض الموقع' : 'View location');
return h('section',{class:'section--tight band'},
h('div',{class:'wrap'},
h('div',{class:'sec-head'},
h('h2',{class:'dev-feat__title'}, ic('layers','dev-feat__ico'), h('span',null,label))),
row));
}
function featCopy(c){
if(!c.copy) return null;
var cp = c.copy;
var wrap = h('div',{class:'feat-copy'});
var lead = cp.lead ? h('p',{class:'feat-copy__p feat-copy__p--lead'}, L(cp.lead)) : null;
if(lead) wrap.appendChild(lead);
var hidden = [];
if(cp.list) hidden.push(h('ul',{class:'feat-copy__list'}, cp.list.map(function(it){
return h('li',{class:'feat-copy__li'}, ic('check'), h('span',null, L(it)));
})));
if(cp.more) hidden.push(h('p',{class:'feat-copy__p'}, L(cp.more)));
(cp.groups||[]).forEach(function(g){
hidden.push(h('div',{class:'feat-copy__grp'},
h('p',{class:'feat-copy__glabel'}, L(g.label)),
g.rows.map(function(r){
return h('div',{class:'feat-copy__row'}, h('b',null, L(r.k)), h('span',null, L(r.v)));
})));
});
if(!hidden.length) return wrap;
var chev = sEl('svg',{class:'accordion__chev',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',
'stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'},
sEl('path',{d:'M6 9l6 6 6-6'}));
var MORE = (lang==='ar'?'اقرأ المزيد':'Read more'), LESS = (lang==='ar'?'عرض أقل':'Show less');
var lbl = h('span',null, MORE);
var det = h('details',{class:'feat-copy__more'},
h('summary',{class:'feat-copy__sum'}, lbl, chev),
h('div',{class:'feat-copy__body'}, hidden));
det.addEventListener('toggle', function(){
lbl.textContent = det.open ? LESS : MORE;
wrap.className = 'feat-copy' + (det.open ? ' is-open' : '');
});
wrap.appendChild(det);
return wrap;
}
function devCardsSection(dev){ return featureCardsSection(devFeatures(dev.key), L(dev.name)); }
function featureCardsSection(f, nm){
if(!f || !f.cards || !f.cards.length) return null;
var cards = f.cards.map(function(c){
var label = L({en:c.en, ar:c.ar}), n = c.imgs.length;
var items = c.imgs.map(function(s,i){
return {src:s, cap:nm+' · '+label+(n>1?(' ('+(i+1)+'/'+n+')'):'')};
});
var media = (n > 1)
? photoFlipper(items, label, 'dev-feat__flip', 900, 600)
: featImg(c.imgs[0], items, 0, label, 926, 750);
return h('article',{class:'dev-feat'},
h('h3',{class:'dev-feat__title'}, ic(c.icon,'dev-feat__ico'), h('span',null,label)),
media, featCopy(c));
});
var cols = cards.length >= 4 ? 'grid--4' : cards.length === 2 ? 'grid--2' : 'grid--3';
return h('section',{class:'section--tight'},
h('div',{class:'wrap'}, h('div',{class:'grid '+cols}, cards)));
}
function devLogoLockup(dev){
var src=devLogoSrc(dev);
if(!src) return devBadge(dev,72);
var img=h('img',{class:'dev-lockup', src:src, alt:logoAlt(L(dev.name)), decoding:'async',
width:220, height:88});
img.addEventListener('error', function(){ var b=devBadge(dev,72); if(img.parentNode) img.parentNode.replaceChild(b, img); });
return h('div',{class:'dev-lockup-wrap'}, img);
}
function devLogoInline(dev, hpx){
var src=devLogoSrc(dev, true); if(!src) return null;
hpx=hpx||22;
var img=h('img',{class:'dev-logo-inline', src:src, alt:logoAlt(L(dev.name)), loading:'lazy',
decoding:'async', style:'height:'+hpx+'px'});
img.addEventListener('error', function(){ if(img.parentNode) img.parentNode.removeChild(img); });
return img;
}
function devChip(dev){
var src=devLogoSrc(dev, true);
var av=h('div',{class:'card__devcircle', title:L(dev.name)});
if(src){
var img=h('img',{class:'dev-logo dev-logo--img', src:src, alt:logoAlt(L(dev.name)), loading:'lazy', decoding:'async', width:60, height:60});
img.addEventListener('error', function(){ if(img.parentNode) img.parentNode.replaceChild(devMonogram(dev,60), img); });
av.appendChild(img);
} else {
av.appendChild(devMonogram(dev,60));
}
return av;
}
function waLink(text){ return CONFIG.whatsapp ? ('https://wa.me/'+CONFIG.whatsapp+(text?('?text='+encodeURIComponent(text)):'')) : ''; }
function typeMeta(t){ return TYPE_META[t] || {ar:t, icon:'ty_apartment'}; }
function typeIcon(t, cls){ return ic(typeMeta(t).icon, cls); }
function typeLabel(t){ return lang==='ar' ? typeMeta(t).ar : t; }
function unitsIn(slug){ return UNITS.filter(function(u){ return u.project===slug; }); }
function unitById(id){ if(id==null) return null; var s=String(id).toLowerCase(); for(var i=0;i<UNITS.length;i++){ if(String(UNITS[i].id).toLowerCase()===s) return UNITS[i]; } return null; }
function field2(label, input){ return h('div',{class:'field',style:'margin:0'}, h('label',{style:'font-size:.72rem'},label), input); }
function paymentCalc(p){
var price=h('input',{type:'number',inputmode:'numeric',value:p.price,'aria-label':t('calc_price')});
var DP_OPTS=[2.5,5,10,15,20], MAX_Y=15;
var startDp = DP_OPTS.indexOf(p.dp)>-1 ? p.dp : 10;
var dp=h('select',{'aria-label':t('calc_dp')}, DP_OPTS.map(function(v){ return opt(String(v), num(v)+'%', v===startDp); }));
var startY=Math.min(MAX_Y, Math.max(1, p.years||8));
var yrs=h('input',{type:'number',inputmode:'numeric',min:'1',max:String(MAX_Y),value:startY,'aria-label':t('calc_years')});
var out=h('div',{style:'margin-top:10px'});
function calc(){ var P=+price.value||0, D=+dp.value||0;
if(+yrs.value>MAX_Y){ yrs.value=MAX_Y; }
var Y=Math.min(MAX_Y, Math.max(1, Math.round(+yrs.value)||1));
var dpAmt=Math.round(P*D/100), monthly=Y>0?Math.round((P-dpAmt)/(Y*12)):0; clear(out);
out.appendChild(h('div',{class:'spec-row'},
h('span',{class:'spec'}, h('span',{class:'spec-lbl'}, t('calc_dp_amt')+': '), h('b',null, money(dpAmt))),
h('span',{class:'spec'}, h('span',{class:'spec-lbl'}, t('calc_monthly')+': '), h('b',null, money(monthly))))); }
price.addEventListener('input', calc);
yrs.addEventListener('input', calc);
dp.addEventListener('change', calc);
calc();
return h('div',{class:'aside-card',style:'margin-top:16px'},
h('div',{class:'muted',style:'font-weight:700;font-size:.85rem'}, t('pay_calc')),
field2(t('calc_price'), price),
h('div',{class:'field-row',style:'margin-top:8px'}, field2(t('calc_dp'), dp), field2(t('calc_years_max'), yrs)),
out, h('div',{class:'prov',style:'margin-top:8px'}, ic('info'), t('calc_note')));
}
function fsEsc(e){ if(e && (e.key==='Escape'||e.keyCode===27)) closeFactsheet(); }
function fsPrintNow(){ try{ window.print(); }catch(e){} }
function closeFactsheet(){
var sheet=document.getElementById('print-sheet'); if(!sheet) return;
sheet.classList.remove('print-sheet--open'); sheet.setAttribute('aria-hidden','true');
sheet.removeAttribute('role'); sheet.removeAttribute('aria-modal');
try{ document.body.classList.remove('fs-lock'); }catch(e){}
document.removeEventListener('keydown', fsEsc);
}
function openFactsheet(){
var sheet=document.getElementById('print-sheet'); if(!sheet) return;
var stale=sheet.querySelector('.fs-toolbar'); if(stale && stale.parentNode) stale.parentNode.removeChild(stale);
var body=h('div',{class:'fs-body'});
while(sheet.firstChild){ body.appendChild(sheet.firstChild); }
var printB=h('button',{type:'button', class:'fs-btn fs-btn--primary'}, ic('doc'), t('print_sheet'));
var closeB=h('button',{type:'button', class:'fs-btn', 'aria-label':t('a_close')}, t('a_close'));
printB.addEventListener('click', fsPrintNow);
closeB.addEventListener('click', closeFactsheet);
var tb=h('div',{class:'fs-toolbar'}, h('span',{class:'fs-hint'}, t('fs_hint')), printB, closeB);
sheet.appendChild(tb); sheet.appendChild(body);
sheet.classList.add('print-sheet--open'); sheet.setAttribute('aria-hidden','false');
sheet.setAttribute('role','dialog'); sheet.setAttribute('aria-modal','true'); sheet.setAttribute('aria-label', t('fs_preview'));
try{ document.body.classList.add('fs-lock'); }catch(e){}
try{ sheet.scrollTop=0; }catch(e){}
document.addEventListener('keydown', fsEsc);
try{ printB.focus(); }catch(e){}
fsPrintNow();
}
function contactNote(waMsg){
var box=h('div',{class:'ps-note'}, t('illustrative'));
var row=h('span',{class:'ps-contact'});
if(CONFIG.phone) row.appendChild(h('a',{href:'tel:'+CONFIG.phone}, CONFIG.phoneDisplay||CONFIG.phone));
if(CONFIG.email) row.appendChild(h('a',{href:'mailto:'+CONFIG.email}, CONFIG.email));
if(CONFIG.whatsapp) row.appendChild(h('a',{href:waLink(waMsg||''), target:'_blank', rel:'noopener'}, 'WhatsApp'));
if(row.childNodes.length) box.appendChild(row);
return box;
}
function projFloorplan(p){
var out='';
UNITS.some(function(u){
if(u.project!==p.slug) return false;
var fps=unitFloorplans(u); if(!fps.length) return false;
out=fps[0]; return true;
});
return out;
}
function installmentCount(p){ return p.years ? Math.round(p.years*4) : null; }
function printFactsheet(p){
var dev=devByKey(p.dev), area=areaByKey(p.area), sheet=document.getElementById('print-sheet'); if(!sheet) return; clear(sheet);
var bimg=document.querySelector('header .brand img'), logo=bimg?bimg.getAttribute('src'):'';
sheet.appendChild(h('div',{class:'ps-head'},
logo?h('img',{src:logo,alt:'The Village'}):h('strong',null,'The Village'),
h('div',{style:'text-align:end;font-size:.78rem;color:#555'}, t('fs_title'), h('div',null, t('fs_generated')+': '+new Date().toLocaleDateString(lang==='ar'?'ar-EG':'en-GB')))));
sheet.appendChild(h('div',{class:'ps-title'}, lang==='ar'?p.name_ar:p.name));
sheet.appendChild(h('div',{style:'color:#333;margin-bottom:8px'}, L(dev.name)+' · '+L(area.name)+' · '+statusLabel(p.status)));
sheet.appendChild(h('div',{class:'ps-media'}, projectMedia(p)));
var tbl=h('table',{class:'ps-table'});
var ins=installmentCount(p);
[[t('price'), money(p.price)+' — '+t('conf_illustrative')],[t('units'),L(p.types)],
[t('delivery'),p.delivery==='Ready'?t('ready'):(p.delivery||t('to_confirm'))],[t('finishing'),L(p.finishing)],
(p.dp ? [t('dp'), num(p.dp)+'%'] : null),
(p.years ? [t('years'), num(p.years)+' '+(lang==='ar'?'سنوات':'years')] : null),
(ins ? [t('fs_installments'), num(ins)+' '+t('fs_quarterly')] : null)]
.forEach(function(r){ if(!r) return; tbl.appendChild(h('tr',null,h('th',null,r[0]),h('td',null,r[1]))); });
sheet.appendChild(tbl);
var fp=projFloorplan(p);
if(fp) sheet.appendChild(h('div',{class:'ps-plan'},
h('div',{class:'ps-plan__k'}, t('fs_floorplan')),
h('img',{src:fp, alt:t('fs_floorplan')+' — '+(lang==='ar'?p.name_ar:p.name), loading:'lazy'})));
sheet.appendChild(h('div',null, L(p.blurb)));
sheet.appendChild(contactNote(lang==='ar'
? ('مهتم بمشروع: '+p.name_ar) : ('Interested in project: '+p.name)));
track('factsheet_requested',{project:p.slug});
openFactsheet();
}
function printUnitFactsheet(u){
var p=projBySlug(u.project), dev=devByKey(p.dev), area=areaByKey(p.area);
var sheet=document.getElementById('print-sheet'); if(!sheet) return; clear(sheet);
var tl=unitTypeLabel(u);
var unitName=unitDisplayName(u, tl);
var pnm=(lang==='ar'?p.name_ar:p.name);
var bimg=document.querySelector('header .brand img'), logo=bimg?bimg.getAttribute('src'):'';
sheet.appendChild(h('div',{class:'ps-head'},
logo?h('img',{src:logo,alt:'The Village'}):h('strong',null,'The Village'),
h('div',{style:'text-align:end;font-size:.78rem;color:#555'}, t('fs_title'), h('div',null, t('fs_generated')+': '+new Date().toLocaleDateString(lang==='ar'?'ar-EG':'en-GB')))));
var page1=h('div',{class:'ps-page'});
page1.appendChild(h('div',{class:'ps-devrow'}, (devLogoInline(dev,40) || devBadge(dev,46)),
h('div',null, h('div',{class:'ps-title',style:'margin:0'}, unitName+' · '+pnm),
h('div',{style:'color:#555;font-size:.9rem'}, L(dev.name)+' · '+L(area.name)))));
page1.appendChild(h('div',{class:'ps-media'}, projectArt(p)));
var tbl=h('table',{class:'ps-table'});
function row(k,v){ tbl.appendChild(h('tr',null,h('th',null,k),h('td',null,v))); }
row(lang==='ar'?'المشروع':'Project', pnm);
row(lang==='ar'?'المطوّر':'Developer', L(dev.name));
row(lang==='ar'?'موقع المشروع':'Location', L(area.name));
row(lang==='ar'?'نوع الوحدة':'Unit type', tl);
var areaStr=areaText(u);
if(u.garden) areaStr+=' · '+(lang==='ar'?'بحديقة':'with garden');
if(u.roof)   areaStr+=' · '+(lang==='ar'?'بروف':'with roof');
row(lang==='ar'?'المساحة':'Area', areaStr);
if(!unitIsCommercial(u)){
row(lang==='ar'?'عدد الغرف':'Bedrooms', u.beds!=null?num(u.beds):'—');
row(lang==='ar'?'عدد الحمامات':'Bathrooms', u.baths!=null?num(u.baths):'—');
}
row(lang==='ar'?'سعر الوحدة':'Unit price', money(u.price)+' — '+t('conf_illustrative'));
page1.appendChild(tbl);
page1.appendChild(contactNote(unitWaMsg(u)));
sheet.appendChild(page1);
track('unit_factsheet_requested',{unit:u.id});
openFactsheet();
}
var TYPES = [
{c:'apartment', en:'Apartment', ar:'شقة', icon:'ty_apartment', fam:'flat', al:['flat','apartment','شقة','شقه']},
{c:'garden-apartment', en:'Garden Apartment', ar:'شقة بجاردن', icon:'ty_apartment', fam:'flat', al:['garden apartment','ground apartment','شقة بحديقة','شقة بجاردن']},
{c:'studio', en:'Studio', ar:'استوديو', icon:'ty_studio', fam:'flat', al:['studio','studio plus','studio+','استوديو','استوديو بلس']},
{c:'loft', en:'Loft', ar:'لوفت', icon:'ty_studio', fam:'flat', al:['loft','لوفت']},
{c:'duplex', en:'Duplex', ar:'دوبلكس', icon:'ty_duplex', fam:'multi', al:['duplex','دوبلكس']},
{c:'fourplex', en:'Fourplex', ar:'فوربلكس', icon:'ty_duplex', fam:'multi', al:['fourplex','four-plex','فوربلكس']},
{c:'penthouse', en:'Penthouse', ar:'بنتهاوس', icon:'ty_penthouse', fam:'flat', al:['penthouse','bent house','benthouse','بنتهاوس','بنت هاوس']},
{c:'ivilla', en:'iVilla', ar:'آي فيلا', icon:'ty_villa', fam:'multi', al:['ivilla','i villa','i-villa','آي فيلا','اي فيلا']},
{c:'sky-villa', en:'Sky Villa', ar:'سكاي فيلا', icon:'ty_penthouse', fam:'flat', al:['sky villa','سكاي فيلا']},
{c:'serviced-apartment', en:'Serviced Apartment', ar:'شقة فندقية', icon:'ty_apartment', fam:'flat', al:['serviced apartment','شقة مخدومة','شقة فندقية']},
{c:'hotel-apartment', en:'Hotel Apartment', ar:'شقة فندقية', icon:'ty_apartment', fam:'flat', al:['hotel apartment','شقة فندقية']},
{c:'villa', en:'Villa', ar:'فيلا', icon:'ty_villa', fam:'house', al:['villa','فيلا']},
{c:'standalone-villa', en:'Standalone Villa', ar:'فيلا مستقلة', icon:'ty_villa', fam:'house', al:['standalone villa','stand-alone villa','stand alone','فيلا مستقلة']},
{c:'town-villa', en:'Town Villa', ar:'تاون فيلا', icon:'ty_villa', fam:'house', al:['town villa','تاون فيلا']},
{c:'townhouse', en:'Townhouse', ar:'تاون هاوس', icon:'ty_townhouse', fam:'house', al:['townhouse','town house','town home','تاون هاوس']},
{c:'twin-house', en:'Twin House', ar:'توين هاوس', icon:'ty_twinhouse', fam:'house', al:['twin house','twinhouse','توين هاوس']},
{c:'bungalow', en:'Bungalow', ar:'بنجلو', icon:'ty_villa', fam:'house', al:['bungalow','بنجلو']},
{c:'chalet', en:'Chalet', ar:'شاليه', icon:'ty_chalet', fam:'flat', al:['chalet','شاليه']},
{c:'cabin', en:'Cabin', ar:'كابين', icon:'ty_cabin', fam:'house', al:['cabin','كابين']},
{c:'office', en:'Office', ar:'مكتب', icon:'ty_office', fam:'commercial', al:['office','offices','smart office','smart offices','loft office','مكتب','مكاتب']},
{c:'administrative-office', en:'Administrative Office', ar:'مكتب إداري', icon:'ty_office', fam:'commercial', al:['administrative office','admin office','مكتب اداري','مكتب إداري']},
{c:'clinic', en:'Clinic', ar:'عيادة', icon:'ty_office', fam:'commercial', al:['clinic','عيادة']},
{c:'medical-unit', en:'Medical Unit', ar:'وحدة طبية', icon:'ty_office', fam:'commercial', al:['medical unit','وحدة طبية']},
{c:'pharmacy', en:'Pharmacy', ar:'صيدلية', icon:'ty_office', fam:'commercial', al:['pharmacy','صيدلية']},
{c:'retail-unit', en:'Retail', ar:'محل تجاري', icon:'ty_office', fam:'commercial', al:['retail','shop','retail unit','store','محل','تجاري']},
{c:'f-and-b-unit', en:'F&B Unit', ar:'وحدة مطاعم', icon:'ty_office', fam:'commercial', al:['f&b','food and beverage','fnb','وحدة مطاعم']},
{c:'hospitality-unit', en:'Hospitality Unit', ar:'وحدة ضيافة', icon:'ty_office', fam:'commercial', al:['hospitality unit','hotel room','وحدة ضيافة']}
];
var TYPE_BY_CANON={}, TYPE_BY_ALIAS={};
TYPES.forEach(function(t){ TYPE_BY_CANON[t.c]=t; TYPE_BY_ALIAS[t.en.toLowerCase()]=t.c; t.al.forEach(function(a){ TYPE_BY_ALIAS[a.toLowerCase()]=t.c; }); });
function normalizeUnitType(src){ if(!src) return 'other'; return TYPE_BY_ALIAS[String(src).toLowerCase().trim()] || 'other'; }
function unitCanon(u){ return normalizeUnitType(u.type); }
function typeLabelC(c){ var t=TYPE_BY_CANON[c]; return t ? (lang==='ar'?t.ar:t.en) : c; }
function typeIconC(c, cls){ var t=TYPE_BY_CANON[c]; return ic(t?t.icon:'ty_apartment', cls); }
function typeFamily(c){ var t=TYPE_BY_CANON[c]; return t?t.fam:'flat'; }
function usesFloorBands(c){ var f=typeFamily(c); return f==='flat'||f==='multi'||f==='commercial'; }
function usesInternalLevels(c){ var f=typeFamily(c); return f==='house'||f==='multi'; }
function unitIsCommercial(u){ return typeFamily(unitCanon(u))==='commercial'; }
function areaValue(u){
if(!u || u.area==null) return null;
var a = num(u.area);
return (u.areaTo && u.areaTo > u.area) ? (a + '–' + num(u.areaTo)) : a;
}
function areaText(u){
var v = areaValue(u);
return v==null ? '—' : (v + ' m²');
}
function unitTypeLabel(u){ return (u && u.label) ? L(u.label) : typeLabelC(unitCanon(u)); }
function unitDisplayName(u, tl){
var lbl = tl || unitTypeLabel(u);
if(unitIsCommercial(u) || u.beds==null) return lbl;
var word = lang==='ar' ? (u.beds<3?'غرفة':'غرف') : 'BR';
return num(u.beds)+' '+word+' '+lbl;
}
function deliveryBucket(p){
if(!p) return 'to-confirm';
if(p.delivery==='Ready' || p.status==='ready') return 'ready';
var y=parseInt(p.delivery,10); if(!y) return 'to-confirm';
var d=y-2026;
return d<=1?'within-1-year':d<=2?'within-2-years':d<=4?'within-3-4-years':'later';
}
function launchStatusOf(p){ return p.status==='launch' ? 'newly-launched' : 'available'; }
function unitAvail(u){ return u.avail || 'available'; }
function unitDpPct(u){ var p=u&&projBySlug(u.project); return (u&&u.dp!=null) ? u.dp : (p?(p.dp||null):null); }
function unitYears(u){ var p=u&&projBySlug(u.project); return (u&&u.years!=null) ? u.years : (p?(p.years||null):null); }
function unitDp(u){ var d=unitDpPct(u); return (u.price!=null && d) ? Math.round(u.price*d/100) : null; }
var FLOOR_BANDS=['ground','low','middle','high','top'];
var FLOOR_LABELS={ground:{en:'Ground floor',ar:'الدور الأرضي'},low:{en:'Low floor',ar:'دور منخفض'},middle:{en:'Middle floor',ar:'دور متوسط'},high:{en:'High floor',ar:'دور مرتفع'},top:{en:'Top / roof',ar:'الأخير / روف'}};
var YEARS_PRESETS=[5,6,7,8];
function unitFloor(u){ return u.floor||null; }
function projYears(u){ return unitYears(u); }
function defaultFilter(){ return {areas:[],devs:[],projects:[],types:[],beds:[],minPrice:null,maxPrice:null,maxDp:null,floors:[],avoidGround:false,minYears:null,launch:[],avail:[],delivery:[],sort:'recommended',mode:'strict',includeUnverified:false}; }
var RECO_MODES=['strict','balanced','flexible'];
var RECO_LABELS={strict:{en:'Exact match',ar:'مطابقة تامة'},balanced:{en:'Balanced',ar:'متوازن'},flexible:{en:'Flexible',ar:'مرن'}};
var FILTER = defaultFilter();
var pendingFocusId = null;
var finderFiltersOpen = false;
function matchUnit(u, f, ignore){
var p=projBySlug(u.project); if(!p) return false;
if(ignore!=='area'   && f.areas.length    && f.areas.indexOf(p.area)<0) return false;
if(ignore!=='dev'    && f.devs.length     && f.devs.indexOf(p.dev)<0) return false;
if(ignore!=='project'&& f.projects.length && f.projects.indexOf(p.slug)<0) return false;
if(ignore!=='type'   && f.types.length    && f.types.indexOf(unitCanon(u))<0) return false;
if(ignore!=='beds'   && f.beds.length){ var bd=u.beds;
if(!f.beds.some(function(v){ return v==='tbc'?(bd==null):(v===6?(bd!=null&&bd>=6):bd===v); })) return false; }
if(ignore!=='price'){
if(u.price==null){ if(!f.includeUnverified && (f.minPrice!=null||f.maxPrice!=null)) return false; }
else { if(f.minPrice!=null && u.price<f.minPrice) return false; if(f.maxPrice!=null && u.price>f.maxPrice) return false; }
}
if(ignore!=='dp' && f.maxDp!=null){ var dp=unitDp(u); if(dp==null || dp>f.maxDp) return false; }
if(ignore!=='floor'){
if(f.floors.length && usesFloorBands(unitCanon(u))){
if(!u.floor){ if(!f.includeUnverified) return false; }
else if(f.floors.indexOf(u.floor)<0) return false;
}
if(f.avoidGround && u.floor==='ground') return false;
}
if(ignore!=='years' && f.minYears!=null){ var yy=projYears(u); if(yy==null || yy<f.minYears) return false; }
if(ignore!=='launch' && f.launch.length && f.launch.indexOf(launchStatusOf(p))<0) return false;
if(ignore!=='avail'){ var av=unitAvail(u);
if(f.avail.length){ if(f.avail.indexOf(av)<0) return false; }
else if(av==='reserved'||av==='sold') return false;
}
if(ignore!=='delivery' && f.delivery.length && f.delivery.indexOf(deliveryBucket(p))<0) return false;
return true;
}
function filterUnits(f){ return UNITS.filter(function(u){ return matchUnit(u,f); }); }
function filteredProjects(f){
var us=filterUnits(f), by={};
us.forEach(function(u){ (by[u.project]=by[u.project]||[]).push(u); });
return Object.keys(by).map(function(slug){ var ps=by[slug].map(function(u){return u.price;}).filter(function(x){return x!=null;});
return {project:projBySlug(slug), units:by[slug], fromPrice: ps.length?Math.min.apply(null,ps):null}; });
}
function facet(group, valueOf){
var base=UNITS.filter(function(u){ return matchUnit(u, FILTER, group); }), m={};
base.forEach(function(u){ var v=valueOf(u); (Array.isArray(v)?v:[v]).forEach(function(x){ if(x!=null&&x!=='') m[x]=(m[x]||0)+1; }); });
return m;
}
function areaFacets(){ return facet('area', function(u){ return projBySlug(u.project).area; }); }
function devFacets(){ return facet('dev', function(u){ return projBySlug(u.project).dev; }); }
function projFacets(){ return facet('project', function(u){ return u.project; }); }
function typeFacets(){ return facet('type', function(u){ return unitCanon(u); }); }
function bedFacets(){ return facet('beds', function(u){ var b=u.beds; return b==null?'tbc':(b>=6?6:b); }); }
function floorFacets(){ return facet('floor', function(u){ return usesFloorBands(unitCanon(u)) ? (u.floor||null) : null; }); }
function launchFacets(){ return facet('launch', function(u){ return launchStatusOf(projBySlug(u.project)); }); }
function availFacets(){ return facet('avail', function(u){ return unitAvail(u); }); }
function deliveryFacets(){ return facet('delivery', function(u){ return deliveryBucket(projBySlug(u.project)); }); }
function reconcileFilter(){
var f=FILTER, changed=false;
function anyUnit(pred, clear){ var f2=Object.assign({}, f); clear.forEach(function(k){ f2[k]=[]; });
return UNITS.some(function(u){ return pred(u) && matchUnit(u, f2); }); }
function keep(list, pred, clear){ var out=list.filter(function(v){ return anyUnit(function(u){ return pred(u,v); }, clear); });
if(out.length!==list.length) changed=true; return out; }
f.areas    = keep(f.areas,    function(u,a){ return projBySlug(u.project).area===a; }, ['areas','devs','projects']);
f.devs     = keep(f.devs,     function(u,d){ return projBySlug(u.project).dev===d;  }, ['devs','projects']);
f.projects = keep(f.projects, function(u,s){ return u.project===s; },                 ['projects']);
f.types    = keep(f.types,    function(u,c){ return unitCanon(u)===c; },               ['types']);
return changed;
}
function sortUnits(list){
var s=FILTER.sort, l=list.slice();
var delOrder={'ready':0,'within-1-year':1,'within-2-years':2,'within-3-4-years':3,'later':4,'to-confirm':5};
if(s==='price-asc') l.sort(function(a,b){ return (a.price==null?1e15:a.price)-(b.price==null?1e15:b.price); });
else if(s==='price-desc') l.sort(function(a,b){ return (b.price||0)-(a.price||0); });
else if(s==='earliest-delivery') l.sort(function(a,b){ return delOrder[deliveryBucket(projBySlug(a.project))]-delOrder[deliveryBucket(projBySlug(b.project))]; });
else if(s==='newest') l.sort(function(a,b){ return (projBySlug(b.project).status==='launch'?1:0)-(projBySlug(a.project).status==='launch'?1:0); });
else l = rotateByDev(l);
return l;
}
function devRotationOffset(now){
var d = now || new Date();
var day = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
return day;
}
function rotateByDev(list){
var order=[], byDev={};
list.forEach(function(u){
var p=projBySlug(u.project), k=p?p.dev:'~';
if(!byDev[k]){ byDev[k]=[]; order.push(k); }
byDev[k].push(u);
});
if(order.length<2) return list;
order.forEach(function(k){
byDev[k] = byDev[k].map(function(u,i){ return {u:u, i:i, shot:hasUnitImage(u)?0:1}; })
.sort(function(a,b){ return a.shot-b.shot || a.i-b.i; })
.map(function(x){ return x.u; });
});
var shot=order.filter(function(k){ return byDev[k].some(hasUnitImage); });
var flat=order.filter(function(k){ return shot.indexOf(k)<0; });
function spin(a){ if(a.length<2) return a; var o=devRotationOffset()%a.length; return a.slice(o).concat(a.slice(0,o)); }
order = spin(shot).concat(spin(flat));
var out=[], left=list.length;
while(left){
order.forEach(function(k){ if(byDev[k].length){ out.push(byDev[k].shift()); left--; } });
}
return out;
}
function hasUnitImage(u){
return !!((UNIT_GALLERY[u.id] && UNIT_GALLERY[u.id].length) || UNIT_IMAGES[u.id]
|| PROJECT_COVERS[u.project]);
}
function filterToQuery(f){
var q=[];
if(f.areas.length) q.push('areas='+f.areas.join(','));
if(f.devs.length) q.push('developers='+f.devs.join(','));
if(f.projects.length) q.push('projects='+f.projects.join(','));
if(f.types.length) q.push('types='+f.types.join(','));
if(f.beds.length) q.push('beds='+f.beds.join(','));
if(f.minPrice!=null) q.push('minPrice='+f.minPrice);
if(f.maxPrice!=null) q.push('maxPrice='+f.maxPrice);
if(f.maxDp!=null) q.push('maxDp='+f.maxDp);
if(f.floors.length) q.push('floors='+f.floors.join(','));
if(f.avoidGround) q.push('avoidGround=1');
if(f.minYears!=null) q.push('minYears='+f.minYears);
if(f.launch.length) q.push('launch='+f.launch.join(','));
if(f.avail.length) q.push('availability='+f.avail.join(','));
if(f.delivery.length) q.push('delivery='+f.delivery.join(','));
if(f.includeUnverified) q.push('incTbc=1');
if(f.mode && f.mode!=='strict') q.push('mode='+f.mode);
if(f.sort && f.sort!=='recommended') q.push('sort='+f.sort);
return q.join('&');
}
function filterFromQuery(search){
var p=new URLSearchParams(search||''), f=defaultFilter();
function arr(k){ var v=p.get(k); return v?v.split(',').filter(Boolean):[]; }
f.areas=arr('areas'); f.devs=arr('developers'); f.projects=arr('projects'); f.types=arr('types');
f.beds=arr('beds').map(function(v){ return v==='tbc'?'tbc':Number(v); }).filter(function(n){return n==='tbc'||!isNaN(n);});
f.launch=arr('launch'); f.avail=arr('availability'); f.delivery=arr('delivery');
if(p.get('minPrice')) f.minPrice=+p.get('minPrice');
if(p.get('maxPrice')) f.maxPrice=+p.get('maxPrice');
if(p.get('maxDp')) f.maxDp=+p.get('maxDp');
f.floors=arr('floors').filter(function(x){ return FLOOR_BANDS.indexOf(x)>-1; });
if(p.get('avoidGround')) f.avoidGround=true;
if(p.get('minYears')) f.minYears=+p.get('minYears');
if(p.get('incTbc')) f.includeUnverified=true;
if(p.get('mode') && RECO_MODES.indexOf(p.get('mode'))>-1) f.mode=p.get('mode');
if(p.get('sort')) f.sort=p.get('sort');
return f;
}
var BUDGET_PRESETS=[[null,3000000],[3000000,5000000],[5000000,8000000],[8000000,12000000],[12000000,20000000],[20000000,null]];
var AVAIL_LABELS={'available':{en:'Available',ar:'متاحة'},'limited':{en:'Limited',ar:'محدودة'},'to-confirm':{en:'To confirm',ar:'قيد التأكيد'},'reserved':{en:'Reserved',ar:'محجوزة'},'sold':{en:'Sold',ar:'مباعة'}};
var LAUNCH_LABELS={'newly-launched':{en:'Newly launched',ar:'إطلاق جديد'},'available':{en:'Available',ar:'متاح'}};
var DELIVERY_LABELS={'ready':{en:'Ready to move',ar:'استلام فوري'},'within-1-year':{en:'Within 1 year',ar:'خلال سنة'},'within-2-years':{en:'Within 2 years',ar:'خلال سنتين'},'within-3-4-years':{en:'3–4 years',ar:'٣–٤ سنوات'},'later':{en:'Later',ar:'لاحقاً'},'to-confirm':{en:'To confirm',ar:'قيد التأكيد'}};
function moneyM(n){ if(n==null) return '—'; var m=Math.round(n/100000)/10; var s=(m%1===0)?String(Math.round(m)):String(m);
return lang==='ar' ? (s.replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.charAt(+d);})+' م') : (s+'M'); }
function finderApply(){ var q=filterToQuery(FILTER); navigateTo(buildPath('units')+(q?('?'+q):''), true); }
function finderToggle(group, v){ var a=FILTER[group], i=a.indexOf(v); if(i>-1) a.splice(i,1); else a.push(v); pendingFocusId='fchip-'+group+'-'+v; reconcileFilter(); finderApply(); }
var RECO_W={area:3,dev:2,project:3,type:3,beds:2,price:3,floor:1,ground:1,years:1,dp:1,delivery:1,launch:1,avail:1};
function bedMatch(bd, arr){ return arr.some(function(v){ return v==='tbc'?(bd==null):(v===6?(bd!=null&&bd>=6):bd===v); }); }
function recoCriteria(u, f){
var p=projBySlug(u.project), C=[];
function crit(active, ok, key, label){ if(active) C.push({key:key, ok:!!ok, label:label, w:RECO_W[key]||1}); }
crit(f.areas.length,    p&&f.areas.indexOf(p.area)>-1,      'area',  p?L(areaByKey(p.area).name):'');
crit(f.devs.length,     p&&f.devs.indexOf(p.dev)>-1,        'dev',   p?L(devByKey(p.dev).name):'');
crit(f.projects.length, p&&f.projects.indexOf(p.slug)>-1,   'project', p?(lang==='ar'?p.name_ar:p.name):'');
crit(f.types.length,    f.types.indexOf(unitCanon(u))>-1,   'type',  typeLabelC(unitCanon(u)));
crit(f.beds.length,     bedMatch(u.beds, f.beds),           'beds',  (u.beds==null?(lang==='ar'?'غرف قيد التأكيد':'beds TBC'):u.beds+(lang==='ar'?' غرف':'BR')));
var priceActive=(f.minPrice!=null||f.maxPrice!=null);
var priceOk = u.price!=null && (f.minPrice==null||u.price>=f.minPrice) && (f.maxPrice==null||u.price<=f.maxPrice);
crit(priceActive, priceOk, 'price', lang==='ar'?'ضمن الميزانية':'In budget');
crit(f.floors.length && usesFloorBands(unitCanon(u)), u.floor&&f.floors.indexOf(u.floor)>-1, 'floor', u.floor?(lang==='ar'?FLOOR_LABELS[u.floor].ar:FLOOR_LABELS[u.floor].en):'');
crit(f.avoidGround, u.floor!=='ground', 'ground', t('avoid_ground'));
crit(f.minYears!=null, (function(){ var y=unitYears(u); return y!=null&&y>=f.minYears; })(), 'years', t('years_min_n').replace('{n}', num(f.minYears||0)));
crit(f.maxDp!=null, (function(){ var dp=unitDp(u); return dp!=null&&dp<=f.maxDp; })(), 'dp', (lang==='ar'?'مقدم مناسب':'Down payment OK'));
crit(f.delivery.length, p&&f.delivery.indexOf(deliveryBucket(p))>-1, 'delivery', p?(lang==='ar'?DELIVERY_LABELS[deliveryBucket(p)].ar:DELIVERY_LABELS[deliveryBucket(p)].en):'');
crit(f.launch.length, p&&f.launch.indexOf(launchStatusOf(p))>-1, 'launch', p?(lang==='ar'?LAUNCH_LABELS[launchStatusOf(p)].ar:LAUNCH_LABELS[launchStatusOf(p)].en):'');
return C;
}
function scoreUnit(u, f){ var C=recoCriteria(u,f), tot=0, got=0;
C.forEach(function(c){ tot+=c.w; if(c.ok) got+=c.w; });
return {score: tot?got/tot:1, total:tot, got:got, crit:C,
matched:C.filter(function(c){return c.ok;}), missed:C.filter(function(c){return !c.ok;})}; }
function matchHard(u, f){ var p=projBySlug(u.project); if(!p) return false;
var av=unitAvail(u);
if(f.avail.length){ if(f.avail.indexOf(av)<0) return false; } else if(av==='reserved'||av==='sold') return false;
if(u.price==null && !f.includeUnverified && (f.minPrice!=null||f.maxPrice!=null)) return false;
return true; }
function recommendUnits(f, mode){
mode = mode || f.mode || 'strict';
if(mode==='strict') return sortUnits(filterUnits(f));
var thresh = mode==='flexible' ? 0.34 : 0.6;
var scored = UNITS.filter(function(u){ return matchHard(u,f); }).map(function(u){ return {u:u, r:scoreUnit(u,f)}; })
.filter(function(x){ return x.r.total===0 || x.r.score>=thresh; });
scored.sort(function(a,b){ return (b.r.score-a.r.score) || ((a.u.price==null?1e15:a.u.price)-(b.u.price==null?1e15:b.u.price)); });
return scored.map(function(x){ return x.u; });
}
function relaxationPlan(f){
var base=filterUnits(f).length, out=[];
function test(key, label, mut){ var f2=JSON.parse(JSON.stringify(f)); mut(f2); var gain=filterUnits(f2).length-base;
if(gain>0) out.push({key:key, label:label, gain:gain}); }
if(f.minPrice!=null||f.maxPrice!=null) test('price', t('filter_budget'), function(x){ x.minPrice=null; x.maxPrice=null; });
[['areas',t('filter_area')],['devs',t('filter_dev')],['projects',t('nav_projects')],['types',t('filter_type')],['beds',t('beds')],['floors',t('filter_floor')],['delivery',t('delivery')],['launch',t('launch_status')],['avail',t('availability')]]
.forEach(function(g){ if(f[g[0]] && f[g[0]].length) test(g[0], g[1], function(x){ x[g[0]]=[]; }); });
if(f.avoidGround) test('ground', t('avoid_ground'), function(x){ x.avoidGround=false; });
if(f.minYears!=null) test('years', t('filter_years'), function(x){ x.minYears=null; });
if(f.maxDp!=null) test('dp', (lang==='ar'?'حد المقدم':'Down-payment cap'), function(x){ x.maxDp=null; });
out.sort(function(a,b){ return b.gain-a.gain; });
return out;
}
function clearFilterKey(key){
if(key==='price'){ FILTER.minPrice=null; FILTER.maxPrice=null; }
else if(key==='ground'){ FILTER.avoidGround=false; }
else if(key==='years'){ FILTER.minYears=null; }
else if(key==='dp'){ FILTER.maxDp=null; }
else if(Array.isArray(FILTER[key])){ FILTER[key]=[]; }
reconcileFilter(); finderApply();
}
function setMode(m){ FILTER.mode=m; pendingFocusId='mode-'+m; finderApply(); }
function activeCriteriaCount(f){ return recoCriteria(UNITS[0]||{}, f).length; }
function hasSelection(f){ return !!(f.areas.length||f.devs.length||f.projects.length||f.types.length||f.beds.length||f.floors.length||f.minPrice!=null||f.maxPrice!=null||f.minYears!=null||f.maxDp!=null||f.avoidGround); }
function bedsPhrase(v){ return v==='tbc'?t('to_confirm'):(v===6?(lang==='ar'?'٦+ غرف':'6+ BR'):v+(lang==='ar'?' غرف':' BR')); }
function selectionSummary(f){
var parts=[];
if(f.types.length)  parts.push(f.types.map(typeLabelC).join(lang==='ar'?'، ':', '));
if(f.beds.length)   parts.push(f.beds.map(bedsPhrase).join(lang==='ar'?'، ':', '));
if(f.areas.length)  parts.push((lang==='ar'?'في ':'in ')+f.areas.map(function(k){return L(areaByKey(k).name);}).join(lang==='ar'?'، ':', '));
if(f.devs.length)   parts.push(f.devs.map(function(k){return L(devByKey(k).name);}).join(lang==='ar'?'، ':', '));
if(f.projects.length) parts.push(f.projects.map(function(s){var p=projBySlug(s);return p?(lang==='ar'?p.name_ar:p.name):s;}).join(lang==='ar'?'، ':', '));
if(f.minPrice!=null||f.maxPrice!=null) parts.push((f.minPrice!=null?moneyM(f.minPrice):'0')+'–'+(f.maxPrice!=null?moneyM(f.maxPrice):'∞'));
if(f.floors.length) parts.push(f.floors.map(function(k){return lang==='ar'?FLOOR_LABELS[k].ar:FLOOR_LABELS[k].en;}).join(lang==='ar'?'، ':', '));
if(f.avoidGround)   parts.push(t('avoid_ground'));
if(f.minYears!=null) parts.push(t('years_min_n').replace('{n}', num(f.minYears)));
if(f.maxDp!=null)   parts.push((lang==='ar'?'مقدم حتى ':'down ≤ ')+moneyM(f.maxDp));
return parts.join(' · ');
}
function missingPrefs(f){ var out=[];
if(!f.areas.length) out.push('area');
if(!f.types.length) out.push('type');
if(f.minPrice==null&&f.maxPrice==null) out.push('budget');
if(!f.beds.length) out.push('beds');
return out; }
var lang = document.documentElement.getAttribute('data-lang') || 'en';
var BASE = (function(){
var p = location.pathname;
var m = p.match(/^(.*?\/)(en|ar)(\/|$)/);
if (m) return m[1];
return p.replace(/[^\/]*$/, '');
})();
var FILEMODE = location.protocol === 'file:';
var CUR = { search: '' };
function replaceURL(u){ try{ history.replaceState(null,'',u); }catch(e){} }
function pushURL(u){ try{ history.pushState(null,'',u); }catch(e){} }
function stripBase(pn){ if(BASE!=='/' && pn.indexOf(BASE)===0) return '/'+pn.slice(BASE.length); return pn.charAt(0)==='/'?pn:'/'+pn; }
var saved = new Set(load('tv_saved', []));
var compare = load('tv_compare_u', []).filter(function(x){ return !!unitById(x); });
function load(k, d){ try{ var v = JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function t(k){ return (I18N[lang] && I18N[lang][k]) || (I18N.en[k]) || k; }
function L(o){ return o ? (o[lang]!=null ? o[lang] : o.en) : ''; }
function devByKey(k){ for(var i=0;i<DEVELOPERS.length;i++) if(DEVELOPERS[i].key===k) return DEVELOPERS[i]; }
function areaByKey(k){ for(var i=0;i<AREAS.length;i++) if(AREAS[i].key===k) return AREAS[i]; }
function projBySlug(s){ for(var i=0;i<PROJECTS.length;i++) if(PROJECTS[i].slug===s) return PROJECTS[i]; }
var RETIRED_SLUG = {'zed-zayed':'zed-west', 'silversands-sahel':'silversands-silvertown'};
function projInArea(k){ return PROJECTS.filter(function(p){ return p.area===k; }); }
function projByDev(k){ return PROJECTS.filter(function(p){ return p.dev===k; }); }
function areaFrom(k){
var ps=projInArea(k).map(function(p){return p.price;}).filter(function(x){return x!=null;});
return ps.length?Math.min.apply(null,ps):null;
}
var FMT={};
function fmt(loc, opts, key){
return FMT[key] || (FMT[key] = new Intl.NumberFormat(loc, opts));
}
function money(n){
if(n==null) return t('tba');
var loc = lang==='ar' ? 'ar-EG' : 'en-US';
try{ return fmt(loc, {maximumFractionDigits:0}, loc+'/0').format(n) + ' ' + t('egp'); }
catch(e){ return n + ' ' + t('egp'); }
}
function statusLabel(s){ return s==='launch'?t('launch'):s==='ready'?t('ready'):t('primary'); }
function num(n){ var loc = lang==='ar' ? 'ar-EG' : 'en-US';
try{ return fmt(loc, undefined, loc).format(n); }catch(e){ return String(n); } }
function U(p){ return BASE + p.replace(/^\//,''); }
function buildPath(name, params, lg){
lg = lg||lang; params = params||{}; var b='/'+lg+'/';
switch(name){
case 'home': return b;
case 'projects': return b+'projects/';
case 'project': return b+'projects/'+params.slug+'/';
case 'units': return b+'units/';
case 'unit': return b+'units/'+String(params.id).toLowerCase()+'/';
case 'investors': return b+'investors/';
case 'search': return b+'search/';
case 'launches': return b+'new-launches/';
case 'release': return b+'releases/'+params.slug+'/';
case 'developers': return b+'developers/';
case 'developer': return b+'developers/'+params.slug+'/';
case 'group': return b+'groups/'+params.slug+'/';
case 'areas': return b+'areas/';
case 'area': return b+'areas/'+params.slug+'/';
case 'compare': return b+'compare/';
case 'insights': return b+'insights/';
case 'insight': return b+'insights/'+params.slug+'/';
case 'faqs': return b+'faqs/';
case 'about': return b+'about/';
case 'favorites': return b+'favorites/';
case 'contact': return b+'contact/';
case 'privacy': return b+'privacy/';
case 'terms': return b+'terms/';
default: return b;
}
}
function parse(pathname){
var p = pathname;
if(BASE!=='/' && p.indexOf(BASE)===0) p = '/' + p.slice(BASE.length);
p = p.replace(/index\.html$/,'');
if(p==='' || p==='/') return {name:'home', lang:'en', params:{}, redirect:true};
var m = p.match(/^\/(en|ar)(\/.*)?$/);
if(!m) return {name:'404', lang:lang, params:{}};
var lg = m[1], rest = m[2]||'/';
if(rest.charAt(rest.length-1)!=='/') rest += '/';
var seg = rest.split('/').filter(Boolean);
var params = {}, name;
if(seg.length===0) name='home';
else if(seg[0]==='projects') { name = seg[1]?'project':'projects'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='units'){ name = seg[1]?'unit':'units'; if(seg[1]) params.id=seg[1]; }
else if(seg[0]==='investors') name='investors';
else if(seg[0]==='search') name='search';
else if(seg[0]==='new-launches') name='launches';
else if(seg[0]==='releases'){ name = seg[1]?'release':'404'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='developers'){ name = seg[1]?'developer':'developers'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='groups'){ name = seg[1]?'group':'404'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='areas'){ name = seg[1]?'area':'areas'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='compare') name='compare';
else if(seg[0]==='insights'){ name = seg[1]?'insight':'insights'; if(seg[1]) params.slug=seg[1]; }
else if(seg[0]==='faqs') name='faqs';
else if(seg[0]==='about') name='about';
else if(seg[0]==='favorites') name='favorites';
else if(seg[0]==='contact') name='contact';
else if(seg[0]==='privacy') name='privacy';
else if(seg[0]==='terms') name='terms';
else name='404';
if(name==='project' && RETIRED_SLUG[params.slug]){
params.slug = RETIRED_SLUG[params.slug]; params.moved = true;
}
if(name==='project' && !projBySlug(params.slug)) name='404';
if(name==='developer' && !devByKey(params.slug)) name='404';
if(name==='group' && !groupBySlug(params.slug)) name='404';
if(name==='release' && !releaseBySlug(params.slug)) name='404';
if(name==='area' && !areaByKey(params.slug)) name='404';
if(name==='insight' && !RESEARCH.some(function(r){return r.slug===params.slug;})) name='404';
if(name==='unit' && !unitById(params.id)) name='404';
return {name:name, lang:lg, params:params};
}
function provBadge(){ return h('div',{class:'prov'}, ic('info'), t('illustrative_short')); }
function sectionHead(kick, title, desc, as){
return h('div',{class:'sec-head'},
kick && h('div',{class:'eyebrow'}, kick),
h(as||'h2',null,title),
desc && h('p',null,desc));
}
function crumbNode(arr){
var c = h('nav',{class:'breadcrumb','aria-label':'Breadcrumb'});
arr.forEach(function(it,i){
if(i) c.appendChild(h('span',{class:'sep','aria-hidden':'true'},'›'));
if(it.path && i<arr.length-1) c.appendChild(h('a',{href:U(it.path)}, it.label));
else c.appendChild(h('span',{'aria-current':'page'}, it.label));
});
return c;
}
function gradIdx(seed){ var s=0; for(var i=0;i<seed.length;i++) s+=seed.charCodeAt(i); return s%3; }
function mediaBox(name, cls, tags){
var g = gradIdx(name);
var grad = ['linear-gradient(150deg,var(--teal-700),var(--teal-900))',
'linear-gradient(150deg,var(--teal-600),var(--teal-800))',
'linear-gradient(150deg,var(--teal-800),var(--teal-900) 70%,var(--teal-700))'][g];
var box = h('div',{class:cls, style:'background:'+grad});
box.appendChild(h('div',{class:'pat'}));
box.appendChild(h('div',{class:'mono','aria-hidden':'true'}, initials(name)));
if(tags && tags.length){
var tw = h('div',{class:'tags'});
tags.forEach(function(x){ tw.appendChild(h('span',{class:'chip'},x)); });
box.appendChild(tw);
}
return box;
}
function initials(s){ var w=String(s).trim().split(/\s+/); return (w.length>1 ? w.slice(0,2).map(function(x){return x.charAt(0);}).join('') : w[0].slice(0,2)).toUpperCase(); }
function saveBtn(slug){
var on = saved.has(slug);
var b = h('button',{class:'card__save', type:'button','aria-pressed':on?'true':'false',
'aria-label':(on?t('saved'):t('save'))+' — '+(projBySlug(slug)?projBySlug(slug).name:'')});
b.appendChild(ic('heart'));
b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); toggleSave(slug, b); });
return b;
}
function toggleSave(slug, btn){
if(saved.has(slug)) saved.delete(slug); else saved.add(slug);
store('tv_saved', Array.from(saved));
var on = saved.has(slug);
if(btn){ btn.setAttribute('aria-pressed', on?'true':'false'); }
if(on) track('save_project', {project:slug});
toast(on?t('saved'):t('save'), 'heart');
}
function projectCard(p){
var dev = devByKey(p.dev), area = areaByKey(p.area);
var card = h('article',{class:'card'});
var media = h('div',{class:'card__media'}, projectMedia(p),
h('div',{class:'tags'}, h('span',{class:'chip'}, statusLabel(p.status))));
media.appendChild(devChip(dev));
media.appendChild(saveBtn(p.slug));
var link = h('a',{href:U(buildPath('project',{slug:p.slug}))});
link.appendChild(media); card.appendChild(link);
card.appendChild(h('div',{class:'card__body'},
h('div',{class:'card__dev'}, L(dev.name)),
h('h3',null, h('a',{href:U(buildPath('project',{slug:p.slug}))}, lang==='ar'?p.name_ar:p.name)),
h('div',{class:'card__facts'},
h('span',null, ic('pin'), ' ', L(area.name)),
h('span',null, L(p.finishing))),
h('div',{class:'card__price'},
h('small',null, t('from')),
money(p.price)),
provBadge(),
h('div',{class:'card__foot'},
h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('project',{slug:p.slug}))}, t('cta_details')),
CONFIG.whatsapp ? h('a',{class:'btn btn--wa btn--sm btn--icon', href:waLink(projWaMsg(p)), target:'_blank', rel:'noopener','aria-label':t('whatsapp')+' — '+(lang==='ar'?p.name_ar:p.name)}, ic('wa')) : null)
));
return card;
}
function groupCard(g){
var dev=devByKey(g.dev), members=groupMembers(g), from=groupFrom(g), nm=L({en:g.name,ar:g.name_ar});
var fallback=function(){ return members[0]?projectMedia(members[0]):mediaBox(nm,'artsvg'); };
var cover=g.cover ? coverImg(g.cover, nm, fallback) : fallback();
var card=h('article',{class:'card'});
var media=h('div',{class:'card__media'}, cover,
h('div',{class:'tags'}, h('span',{class:'chip'}, ic('gallery'), ' '+num(members.length)+' '+(lang==='ar'?'مشروعات':'projects'))));
media.appendChild(devChip(dev));
var link=h('a',{href:U(buildPath('group',{slug:g.slug}))});
link.appendChild(media); card.appendChild(link);
card.appendChild(h('div',{class:'card__body'},
h('div',{class:'card__dev'}, L(dev.name)),
h('h3',null, h('a',{href:U(buildPath('group',{slug:g.slug}))}, nm)),
h('div',{class:'card__facts'},
h('span',null, ic('build'), ' ', num(members.length)+' '+(lang==='ar'?'مشروعات داخل المجموعة':'projects in this group'))),
(from!=null ? h('div',{class:'card__price'}, h('small',null,t('from')), money(from)) : null),
provBadge(),
h('div',{class:'card__foot'},
h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('group',{slug:g.slug}))}, (lang==='ar'?'عرض المجموعة':'View group')))));
return card;
}
function projWaMsg(p){ return (lang==='ar'?'مهتم بمشروع: ':'Interested in project: ')+(lang==='ar'?p.name_ar:p.name)+' ('+t('conf_illustrative')+')'; }
function compareBtn(id){
var on = compare.indexOf(id)>-1;
var b = h('button',{class:'btn btn--ghost btn--sm cmp-btn'+(on?' is-on':''), type:'button','aria-pressed':on?'true':'false'},
ic('scale'), on?t('incompare'):t('compare'));
b.addEventListener('click', function(e){ e.preventDefault(); toggleCompare(id); render(currentRoute,{keep:true}); });
return b;
}
function toggleCompare(id){
var i = compare.indexOf(id);
if(i>-1) compare.splice(i,1);
else { if(compare.length>=3){ toast(lang==='ar'?'الحد الأقصى ٣ وحدات':'Up to 3 units','scale'); return; } compare.push(id); track('compare_unit', {unit:id}); }
store('tv_compare_u', compare);
if(typeof updateCompareFab==='function') updateCompareFab();
}
function spec(icon, val, label){
var txt = val==null ? '—' : (typeof val==='string' ? val : num(val));
return h('span',{class:'spec'}, ic(icon), h('b',null, txt), h('span',{class:'spec-lbl'}, label));
}
function unitWaMsg(u){ var p=projBySlug(u.project); return (lang==='ar'?'مهتم بوحدة: ':'Interested in unit: ')+typeLabel(u.type)+' — '+(lang==='ar'?p.name_ar:p.name)+' ('+u.id+')'; }
var AVAIL_MAP={available:['avail-b--ok','avail_available'],limited:['avail-b--lim','avail_limited'],reserved:['avail-b--res','avail_reserved'],'to-confirm':['avail-b--tbc','avail_tbc']};
function availBadge(u){ var m=AVAIL_MAP[u.avail]||AVAIL_MAP['to-confirm']; return h('span',{class:'avail-b '+m[0]}, t(m[1])); }
function availSummary(units){
var c={available:0,limited:0,reserved:0}; units.forEach(function(u){ if(c[u.avail]!=null) c[u.avail]++; });
var parts=[];
if(c.available) parts.push(num(c.available)+' '+t('avail_available'));
if(c.limited)   parts.push(num(c.limited)+' '+t('avail_limited'));
if(c.reserved)  parts.push(num(c.reserved)+' '+t('avail_reserved'));
if(!parts.length) return null;
var d=new Date().toLocaleDateString(lang==='ar'?'ar-EG':'en-GB');
return h('div',{class:'avail-summary'}, ic('info'), h('span',null, parts.join(' · ')+' · '+t('avail_asof')+' '+d+' — '+t('conf_illustrative')));
}
function deliveryTimeline(p){
var ready=(p.status==='ready'||p.delivery==='Ready');
var yr=(p.delivery && p.delivery!=='Ready')?p.delivery:null;
var stages = ready
? [{l:t('tl_launched'),done:true},{l:t('tl_construction'),done:true},{l:t('tl_ready'),done:true,active:true}]
: [{l:t('tl_launched'),done:true,active:(p.status==='launch')},
{l:t('tl_construction'),done:false,active:(p.status!=='launch')},
{l:t('tl_delivery')+(yr?(' '+yr):''),done:false}];
var row=h('div',{class:'timeline'});
stages.forEach(function(s,i){
if(i>0) row.appendChild(h('div',{class:'tl-bar'+(stages[i-1].done?' tl-bar--done':'')}));
row.appendChild(h('div',{class:'tl-node'+(s.done?' tl-done':'')+(s.active?' tl-active':'')},
h('span',{class:'tl-dot'}), h('span',{class:'tl-lbl'}, s.l)));
});
return h('div',{class:'timeline-wrap'}, h('h2',{class:'tl-h'}, t('timeline_h')), row);
}
function unitCard(u){
var p=projBySlug(u.project), area=areaByKey(p.area), dev=devByKey(p.dev);
var href=U(buildPath('unit',{id:u.id}));
var card=h('article',{class:'card'});
var uc=unitCanon(u), tl=unitTypeLabel(u);
var media=h('div',{class:'card__media'}, unitMedia(u),
h('div',{class:'tags'}, h('span',{class:'chip'}, typeIconC(uc,'chip-ico'), tl)));
media.appendChild(devChip(dev));
media.appendChild(saveBtn(p.slug));
var link=h('a',{href:href,'aria-label':tl+' — '+(lang==='ar'?p.name_ar:p.name)}); link.appendChild(media); card.appendChild(link);
card.appendChild(h('div',{class:'card__body'},
h('div',{class:'card__dev'}, tl+' · '+(lang==='ar'?p.name_ar:p.name)),
h('h3',null, h('a',{href:href}, tl)),
h('div',{class:'card__facts',style:'gap:4px 10px'}, h('span',null, ic('pin'), ' ', L(area.name)), availBadge(u)),
h('div',{class:'spec-row'}, unitIsCommercial(u)?null:spec('bed',u.beds, lang==='ar'?'غرف':'beds'), unitIsCommercial(u)?null:spec('bath',u.baths, lang==='ar'?'حمام':'baths'), spec('area', areaValue(u), 'm²')),
h('div',{class:'card__price'}, money(u.price)),
provBadge(),
h('div',{class:'card__foot'},
h('a',{class:'btn btn--primary btn--sm', href:href}, t('cta_details')),
compareBtn(u.id),
CONFIG.whatsapp ? h('a',{class:'btn btn--wa btn--sm btn--icon', href:waLink(unitWaMsg(u)), target:'_blank', rel:'noopener','aria-label':t('whatsapp')}, ic('wa')) : null)
));
return card;
}
function areaTile(a){
var ps = projInArea(a.key), from = areaFrom(a.key), locSrc = areaImageSrc(a.key);
var grad = ['linear-gradient(160deg,var(--teal-700),var(--teal-900))','linear-gradient(160deg,var(--teal-600),var(--teal-800))','linear-gradient(160deg,var(--teal-800),var(--teal-900))'][gradIdx(a.key)];
var tile = h('a',{class:'tile'+(locSrc?' tile--photo':''), href:U(buildPath('area',{slug:a.key})), style: locSrc?'':('background:'+grad)});
if(locSrc){
tile.appendChild(coverImg(locSrc, L(a.name), function(){ return h('div',{class:'pat'}); }));
tile.appendChild(h('div',{class:'tile__scrim'}));
} else {
tile.appendChild(h('div',{class:'pat'}));
}
tile.appendChild(h('div',{class:'tile__body'},
h('h3',null, L(a.name)),
h('p',null, L(a.blurb)),
h('div',{class:'cnt'}, num(ps.length)+' '+(lang==='ar'?'مشروع':'projects') + (from?(' · '+t('from')+' '+money(from)):'')),
from ? h('div',{class:'tile-note'}, t('illustrative_short')) : null
));
return tile;
}
function locArt(cat){
var gid='la'+(ART_ID++), top = cat==='redsea'?'#0e8fa3':cat==='coast'?'#0e6f86':'#0f5a70', i;
var s=sEl('svg',{viewBox:'0 0 400 200', class:'artsvg', preserveAspectRatio:'xMidYMid slice','aria-hidden':'true'});
var defs=sEl('defs'), lg=sEl('linearGradient',{id:gid,x1:'0',y1:'0',x2:'0',y2:'1'});
lg.appendChild(sEl('stop',{offset:'0','stop-color':top})); lg.appendChild(sEl('stop',{offset:'1','stop-color':'#05303f'}));
defs.appendChild(lg); s.appendChild(defs);
s.appendChild(sEl('rect',{width:'400',height:'200',fill:'url(#'+gid+')'}));
s.appendChild(sEl('circle',{cx:'322',cy:'48',r:'24',fill:'#F3EFE6',opacity:'0.88'}));
if(cat==='coast'||cat==='redsea'){
s.appendChild(sEl('rect',{x:'0',y:'128',width:'400',height:'72',fill:'#0e6f86',opacity:'0.45'}));
for(i=0;i<3;i++) s.appendChild(sEl('path',{d:'M0 '+(132+i*20)+' q 50 -9 100 0 t 100 0 t 100 0 t 100 0', stroke:'#bfe3ef', fill:'none','stroke-width':'3', opacity:(0.4-i*0.1).toFixed(2)}));
s.appendChild(palm(56,150)); s.appendChild(palm(330,150));
} else {
for(i=0;i<6;i++){ var bw=42+((i*37)%18), bx=8+i*66, bh=74+((i*53)%78), by=200-bh;
s.appendChild(sEl('rect',{x:bx,y:by,width:bw,height:bh,rx:'2',fill:i%2?'#F3EFE6':'#cfe0e5',opacity:(0.9-i*0.07).toFixed(2)})); }
}
return s;
}
var TOP_LOCS=[
{key:'newcairo'},{key:'zayed'},{key:'sahel'},{key:'raselhekma'},{key:'capital'},
{coming:true, art:'redsea', locKey:'somabay', name:{en:'Soma Bay',ar:'سوما باي'}},
{coming:true, art:'redsea', locKey:'elgouna', name:{en:'El Gouna',ar:'الجونة'}}
];
function topLocationCard(loc){
var coming=!!loc.coming, key=loc.key, area=key?areaByKey(key):null;
var name=coming?L(loc.name):L(area.name);
var cat=loc.art || (key==='raselhekma'?'coast':areaCat(key));
var count=key?projInArea(key).length:0, from=key?areaFrom(key):null;
var href=coming?U(buildPath('contact')):U(buildPath('area',{slug:key}));
var locSrc=areaImageSrc(key||loc.locKey);
var art=locSrc ? coverImg(locSrc, name, function(){ return locArt(cat); }) : locArt(cat);
var media=h('div',{class:'toploc__media'}, art, h('span',{class:'toploc__pin'}, ic('pin')));
if(coming) media.appendChild(h('span',{class:'toploc__badge'}, t('coming_soon')));
var meta = coming ? t('register_interest')
: (num(count)+' '+(lang==='ar'?'كمبوند':(count===1?'compound':'compounds')) + (from?(' · '+t('from')+' '+moneyM(from)):''));
return h('a',{class:'toploc'+(coming?' toploc--soon':''), href:href},
media, h('div',{class:'toploc__body'}, h('h3',null,name), h('div',{class:'toploc__meta'}, meta)));
}
function devCard(d){
var ps = projByDev(d.key);
var lg = devLogoInline(d,34);
var mark = lg ? h('div',{class:'dev-card__logo'}, lg) : devBadge(d,52);
return h('a',{class:'dev-card', href:U(buildPath('developer',{slug:d.key}))},
mark,
h('div',{class:'meta'},
h('h3',null, L(d.name)),
h('p',null, L(d.tagline)),
h('p',null, ps.length ? (num(ps.length)+' '+(lang==='ar'?'مشروع مُدرج':'listed projects')) : L(d.areas))));
}
function spreadByDev(list){
var order=[], byDev={};
list.forEach(function(p){
if(!byDev[p.dev]){ byDev[p.dev]=[]; order.push(p.dev); }
byDev[p.dev].push(p);
});
var out=[], left=list.length;
while(left){
order.forEach(function(k){ if(byDev[k].length){ out.push(byDev[k].shift()); left--; } });
}
return out;
}
function devCircle(d, inert){
var a=h('a',{class:'dev-circle', href:U(buildPath('developer',{slug:d.key})),
'aria-label':L(d.name), role:inert?false:'listitem', tabindex:inert?'-1':false},
h('span',{class:'dev-circle__av'}, devBadge(d,74)),
h('span',{class:'dev-circle__name'}, L(d.name)));
return a;
}
function developerRail(){
var devs = DEVELOPERS.slice().sort(function(a,b){ return projByDev(b.key).length - projByDev(a.key).length; });
var row=h('div',{class:'sec-row'}, sectionHead('', t('home_devrail_h'), t('home_devrail_p')),
h('a',{class:'btn btn--ghost btn--sm', href:U(buildPath('developers'))}, t('cta_all'), ic('arrow')));
var track=h('div',{class:'dev-rail__track'}, devs.map(function(d){ return devCircle(d,false); }));
var clone=h('div',{class:'dev-rail__track','aria-hidden':'true'}, devs.map(function(d){ return devCircle(d,true); }));
var rail=h('div',{class:'dev-rail', role:'list'}, track, clone);
railInit(rail, track);
return h('section',{class:'section section--flush-b'}, h('div',{class:'wrap'}, row, rail));
}
function railInit(rail, track){
if(typeof requestAnimationFrame==='undefined' || !rail.addEventListener) return;
var SPEED = 0.45;
var reduce = (typeof matchMedia!=='undefined') && matchMedia('(prefers-reduced-motion:reduce)').matches;
var held = false, dragging = false, idleUntil = 0, startX = 0, startScroll = 0, moved = 0, raf = 0;
var pos = 0;
function sync(){ pos = rail.scrollLeft; }
function rtl(){ return (document.documentElement.getAttribute('dir')||'') === 'rtl'; }
function dir(){ return rtl() ? -1 : 1; }
function span(){ return track.offsetWidth || (rail.scrollWidth / 2); }
function wrap(){
var w = span(); if(w <= 0) return;
if(rail.scrollLeft >=  w) rail.scrollLeft -= w;
else if(rail.scrollLeft <= -w) rail.scrollLeft += w;
}
function tick(){
raf = requestAnimationFrame(tick);
if(reduce || held || dragging) return;
if(Date.now() < idleUntil) return;
if(overLogo()) return;
pos += SPEED * dir();
var w = span();
if(w > 0){ if(pos >= w) pos -= w; else if(pos <= -w) pos += w; }
rail.scrollLeft = pos;
}
function start(){ if(!raf) raf = requestAnimationFrame(tick); }
function stop(){ if(raf){ cancelAnimationFrame(raf); raf = 0; } }
var px = -1, py = -1;
function ptr(e){ px = e.clientX; py = e.clientY; }
function ptrGone(){ px = -1; py = -1; }
document.addEventListener('pointermove', ptr, {passive:true});
document.addEventListener('pointerdown', ptr, {passive:true});
document.addEventListener('pointerleave', ptrGone, {passive:true});
window.addEventListener('blur', ptrGone);
function overLogo(){
if(px < 0) return false;
var r = rail.getBoundingClientRect();
if(px < r.left || px > r.right || py < r.top || py > r.bottom) return false;
var el = document.elementFromPoint(px, py);
return !!(el && el.closest && el.closest('.dev-circle'));
}
rail.addEventListener('focusin',  function(){ held = true; });
rail.addEventListener('focusout', function(){ held = false; });
rail.addEventListener('scroll', function(){ if(!dragging){ wrap(); sync(); } }, {passive:true});
rail.addEventListener('wheel',  function(){ idleUntil = Date.now() + 1200; }, {passive:true});
rail.addEventListener('touchstart', function(){ held = true; }, {passive:true});
rail.addEventListener('touchend',   function(){ held = false; idleUntil = Date.now() + 1200; }, {passive:true});
rail.addEventListener('touchcancel', function(){ held = false; }, {passive:true});
var pending = false;
rail.addEventListener('pointerdown', function(e){
if(e.pointerType === 'touch' || e.button !== 0) return;
pending = true; dragging = false; moved = 0;
startX = e.clientX; startScroll = rail.scrollLeft;
});
rail.addEventListener('dragstart', function(e){ e.preventDefault(); });
rail.addEventListener('pointermove', function(e){
if(!pending) return;
var dx = e.clientX - startX;
moved = Math.max(moved, Math.abs(dx));
if(!dragging){
if(moved <= 4) return;
dragging = true;
rail.classList.add('is-drag');
try{ rail.setPointerCapture(e.pointerId); }catch(err){}
}
rail.scrollLeft = startScroll - dx;
wrap(); sync();
});
function endDrag(e){
pending = false;
if(!dragging) return;
dragging = false; idleUntil = Date.now() + 1200; sync();
rail.classList.remove('is-drag');
try{ rail.releasePointerCapture(e.pointerId); }catch(err){}
}
rail.addEventListener('pointerup', endDrag);
rail.addEventListener('pointercancel', endDrag);
rail.addEventListener('click', function(e){
if(moved > 6){ e.preventDefault(); e.stopPropagation(); moved = 0; }
}, true);
sync(); start();
if(typeof IntersectionObserver!=='undefined'){
var io = new IntersectionObserver(function(en){
en.forEach(function(x){ x.isIntersecting ? start() : stop(); });
}, {threshold:0});
io.observe(rail);
}
}
function ctaBand(){
return h('section',{class:'section band-teal'},
h('div',{class:'wrap center'},
h('h2',null, t('enquire')),
h('p',{class:'lead', style:'margin:10px auto 18px;max-width:52ch'}, t('enquire_p')),
(typeof askCard==='function' ? askCard({source:'cta_band'}) : null),
h('a',{class:'btn btn--light', style:'margin-top:16px', href:U(buildPath('contact'))}, t('cta_talk'), ic('arrow'))));
}
var HERO_SLIDES = ['beach','sunset','lagoon','town','clubhouse'];
function heroSrc(nm){
var small = (window.innerWidth || 1200) <= 700;
return '/project-media/hero/' + nm + (small ? '-800' : '') + '.webp';
}
function heroDeferred(bg){
function paint(){
var els = bg.querySelectorAll('[data-bg]');
for (var i = 0; i < els.length; i++){
els[i].style.backgroundImage = "url('" + els[i].getAttribute('data-bg') + "')";
els[i].removeAttribute('data-bg');
}
}
if (window.requestIdleCallback) requestIdleCallback(paint, {timeout: 4000});
else setTimeout(paint, 2000);
}
var V = {};
V.home = function(){
var node = h('div',null);
var hero = h('section',{class:'hero'});
var heroBg = h('div',{class:'hero__bg','aria-hidden':'true'});
HERO_SLIDES.forEach(function(nm,i){
var el = h('div',{class:'hero__slide', style:'animation-delay:'+(i*6)+'s'});
if(i===0) el.style.backgroundImage = "url('"+heroSrc(nm)+"')";
else el.setAttribute('data-bg', heroSrc(nm));
heroBg.appendChild(el);
});
heroDeferred(heroBg);
heroBg.appendChild(h('div',{class:'hero__scrim'}));
hero.appendChild(heroBg);
var typeOpts = [opt('',t('all_types'))].concat(TYPES.map(function(tp){ return opt(tp.c, typeLabelC(tp.c)); }));
var budgetOpts = [opt('',t('any'))].concat(BUDGET_PRESETS.map(function(pr,i){
return opt(i, pr[0]==null?(lang==='ar'?'أقل من ٣ م':'Under 3M'):pr[1]==null?(lang==='ar'?'٢٠ م+':'20M+'):moneyM(pr[0])+'–'+moneyM(pr[1])); }));
var bedOpts = [opt('',t('any'))].concat([1,2,3,4,5].map(function(n){ return opt(n, bedsLabel(n)); }));
var floorOpts = [opt('',t('any'))].concat(FLOOR_BANDS.map(function(b){ return opt(b, L(FLOOR_LABELS[b])); }));
var projSorted = PROJECTS.slice().sort(function(a,b){ return (lang==='ar'?a.name_ar:a.name).localeCompare(lang==='ar'?b.name_ar:b.name); });
var projOpts = [opt('',t('any'))].concat(projSorted.map(function(p){ return opt(p.slug, (lang==='ar'?p.name_ar:p.name)); }));
var searchCard = h('form',{class:'search-card', role:'search'},
h('h2',null, t('find_h')),
h('p',{class:'muted'}, t('find_p')),
h('div',{class:'search-grid'},
field('select','f-area', t('filter_area'), areaOptions()),
field('select','f-dev', t('filter_dev'), devOptions())),
field('select','f-type', t('filter_type'), typeOpts),
h('details',{class:'search-adv'},
h('summary',null, t('more_filters')),
h('div',{class:'search-grid', style:'margin-top:12px'},
field('select','f-project', t('filter_project'), projOpts),
field('select','f-beds', t('filter_beds'), bedOpts),
field('select','f-floor', t('filter_floor'), floorOpts),
field('select','f-budget', t('filter_budget'), budgetOpts))),
h('button',{class:'btn btn--primary btn--block', type:'submit'}, ic('search'), t('cta_explore')));
searchCard.addEventListener('submit', function(e){
e.preventDefault();
var q = [];
function val(id){ var el=$(id,searchCard); return el?el.value:''; }
var a=val('#f-area'), dv=val('#f-dev'), pj=val('#f-project'), ty=val('#f-type'), bd=val('#f-beds'), fl=val('#f-floor'), bi=val('#f-budget');
if(a) q.push('areas='+a);
if(dv) q.push('developers='+dv);
if(pj) q.push('projects='+pj);
if(ty) q.push('types='+ty);
if(bd) q.push('beds='+bd);
if(fl) q.push('floors='+fl);
if(bi!==''){ var pr=BUDGET_PRESETS[+bi]; if(pr[0]!=null) q.push('minPrice='+pr[0]); if(pr[1]!=null) q.push('maxPrice='+pr[1]); }
navigateTo(buildPath('units') + (q.length?('?'+q.join('&')):''));
});
hero.appendChild(h('div',{class:'wrap'},
h('div',{class:'hero-grid'},
h('div',null,
h('div',{class:'eyebrow', style:'color:#bfe3ef'}, t('hero_kicker')),
h('h1',{style:'margin-top:14px'}, t('hero_h1a'), h('em',null,t('hero_h1b'))),
h('p',{class:'hero-sig'}, h('span',null, t('hero_sig'))),
h('p',{class:'lead'}, t('hero_p')),
h('div',{class:'hero-cta'},
h('a',{class:'btn btn--light', href:U(buildPath('projects'))}, t('cta_explore')),
h('a',{class:'btn btn--ghost', href:U(buildPath('contact')), style:'color:var(--bone);border-color:rgba(243,239,230,.35)'}, t('cta_talk'))),
h('div',{class:'hero-trust'},
heroStat(AREAS.length, t('hero_s1')),
heroStat(DEVELOPERS.length, t('hero_s2')),
heroStat(PROJECTS.length, t('hero_s3')),
(CONFIG.clientsServed ? heroStat(CONFIG.clientsServed, t('hero_s4')) : null))),
searchCard)));
node.appendChild(hero);
node.appendChild(developerRail());
var ours = spreadByDev(['ogami-north-coast','ramla-ras-el-hekma','beach-plaza-premium',
'zoya','il-monte-galala','swan-lake-west'].map(projBySlug).filter(Boolean));
if(ours.length) node.appendChild(listSection(t('home_ours_k'), t('home_ours_h'), t('home_ours_p'), ours.map(projectCard),
{label:t('nav_projects'), path:buildPath('projects')}, 'section--flush-t'));
var why = h('section',{class:'section band'});
why.appendChild(h('div',{class:'wrap'},
sectionHead('', t('home_why_h'), ''),
h('div',{class:'grid grid--3'},
feature('shield', t('why1_h'), t('why1_p')),
feature('check', t('why2_h'), t('why2_p')),
feature('globe', t('why3_h'), t('why3_p')))));
node.appendChild(why);
var launchSec=h('section',{class:'section'});
launchSec.appendChild(h('div',{class:'wrap'},
sectionHead(t('nav_launches'), t('home_launch_h'), t('home_launch_p')),
launchStrip()));
node.appendChild(launchSec);
var tlRow=h('div',{class:'sec-row'}, sectionHead('', t('top_loc_h'), t('top_loc_p')),
h('a',{class:'btn btn--ghost btn--sm', href:U(buildPath('areas'))}, t('cta_all'), ic('arrow')));
node.appendChild(h('section',{class:'section band'}, h('div',{class:'wrap'}, tlRow,
h('div',{class:'toploc-grid'}, TOP_LOCS.map(topLocationCard)))));
var trust = h('section',{class:'section'});
trust.appendChild(h('div',{class:'wrap'},
h('div',{class:'notice notice--info', style:'max-width:80ch;margin-inline:auto'},
ic('info'),
h('div',null, h('strong',null, t('home_trust_h')+' — '), t('home_trust_p')))));
node.appendChild(trust);
node.appendChild(ctaBand());
return {node:node, title:t('nav_about')==='من نحن'?'The Village Investment — عقارات البيع الأولي في مصر':'The Village Investment — Primary-Sale Property & New Launches in Egypt',
desc:t('hero_p'), indexable:true, crumbs:[], name:'home'};
};
V.favorites = function(){
var ps=[]; saved.forEach(function(s){ var p=projBySlug(s); if(p) ps.push(p); });
var node=h('div',null);
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_favorites')}]),
sectionHead(t('hero_kicker'), t('fav_h'), t('fav_p'), 'h1')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}), w=h('div',{class:'wrap'});
if(ps.length){ w.appendChild(h('div',{class:'grid grid--3'}, ps.map(projectCard))); }
else { w.appendChild(h('div',{class:'empty-state'}, h('div',{class:'empty-ico'}, ic('heart')),
h('p',null, t('fav_empty')), h('a',{class:'btn btn--primary', href:U(buildPath('projects'))}, t('cta_explore')))); }
sec.appendChild(w); node.appendChild(sec);
node.appendChild(ctaBand());
return {node:node, title:t('nav_favorites')+' · The Village Investment', desc:t('fav_p'), indexable:false,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_favorites')}]};
};
function stat(b,s){ return h('div',{class:'stat'}, h('b',null,b), h('span',null,s)); }
function heroStat(target, label){
var b=h('b',{class:'stat__n'}, num(0));
var box=h('div',{class:'stat stat--count'}, b, h('span',null,label));
var reduce=(typeof matchMedia!=='undefined') && matchMedia('(prefers-reduced-motion:reduce)').matches;
if(typeof requestAnimationFrame==='undefined' || typeof IntersectionObserver==='undefined' || reduce){
b.textContent=num(target)+'+'; return box;
}
var ran=false;
function run(){ if(ran) return; ran=true; var dur=1200, t0=null;
function frame(ts){ if(t0===null) t0=ts; var p=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-p,3);
b.textContent=num(Math.round(target*e)); if(p<1) requestAnimationFrame(frame); else b.textContent=num(target)+'+'; }
requestAnimationFrame(frame);
}
var io=new IntersectionObserver(function(es){ for(var i=0;i<es.length;i++){ if(es[i].isIntersecting){ run(); io.disconnect(); break; } } }, {threshold:0.35});
requestAnimationFrame(function(){ io.observe(b); });
return box;
}
function feature(icon,title,txt){
return h('div',{class:'card', style:'padding:22px'},
h('div',{style:'width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:var(--teal-050);color:var(--teal-700);margin-bottom:14px'}, ic(icon)),
h('h3',{style:'font-size:1.15rem;margin-bottom:8px'},title),
h('p',{class:'muted'},txt));
}
function resultsHeading(label){
return h('h2',{class:'visually-hidden'}, label || t('results_h'));
}
function listSection(kick,title,desc,items,cta,band,gridCls){
var sec = h('section',{class:'section'+(band?(' '+band):'')});
var head = sectionHead(kick,title,desc);
if(cta){ var row=h('div',{style:'display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap'}, head, h('a',{class:'btn btn--ghost btn--sm', href:U(cta.path)}, cta.label, ic('arrow'))); sec.appendChild(h('div',{class:'wrap'}, row, h('div',{class:'grid '+(gridCls||'grid--3'), style:'margin-top:8px'}, items))); }
else sec.appendChild(h('div',{class:'wrap'}, head, h('div',{class:'grid '+(gridCls||'grid--3')}, items)));
return sec;
}
function carouselSection(kick,title,desc,items,cta,band){
var sec=h('section',{class:'section'+(band?(' '+band):'')});
var head=sectionHead(kick,title,desc);
var row=cta ? h('div',{class:'sec-row'}, head, h('a',{class:'btn btn--ghost btn--sm', href:U(cta.path)}, cta.label, ic('arrow'))) : head;
var track=h('div',{class:'hscroll', role:'list', 'aria-label':title});
items.forEach(function(it){ var cell=h('div',{class:'hscroll__cell', role:'listitem'}, it); track.appendChild(cell); });
sec.appendChild(h('div',{class:'wrap'}, row, track));
return sec;
}
function comingSoonLaunch(asLink){
var kids=[
h('img',{class:'cs-img', src:COMING_SOON_LAUNCH.img, alt:COMING_SOON_LAUNCH.name+' — '+t('coming_soon'), width:'1000', height:'1000', loading:'lazy', decoding:'async'}),
h('span',{class:'cs-scrim','aria-hidden':'true'}),
h('span',{class:'cs-badge'}, t('coming_soon'))];
var card = (asLink===false || !COMING_SOON_LAUNCH.link)
? h('figure',{class:'cs-card'}, kids)
: h('a',{class:'cs-card cs-card--link', href:U(buildPath('project',{slug:COMING_SOON_LAUNCH.link})), 'aria-label':COMING_SOON_LAUNCH.name+' — '+t('coming_soon')}, kids);
return h('div',{class:'cs-wrap'}, card);
}
function releaseTeaser(r){
var nm = L(r.name);
return h('a',{class:'cs-card cs-card--link', href:U(buildPath('release',{slug:r.slug}))},
h('img',{class:'cs-img', src:r.projects[0].img, alt:'',
width:'1000', height:'1000', loading:'lazy', decoding:'async'}),
h('span',{class:'cs-scrim','aria-hidden':'true'}),
h('span',{class:'cs-badge'}, t('new_release')),
h('span',{class:'cs-title'}, nm));
}
function launchStrip(){
var wrap = h('div',{class:'cs-wrap'});
var kids=[
h('img',{class:'cs-img', src:COMING_SOON_LAUNCH.img, alt:COMING_SOON_LAUNCH.name+' — '+t('coming_soon'), width:'1000', height:'1000', loading:'lazy', decoding:'async'}),
h('span',{class:'cs-scrim','aria-hidden':'true'}),
h('span',{class:'cs-badge'}, t('coming_soon'))];
wrap.appendChild(COMING_SOON_LAUNCH.link
? h('a',{class:'cs-card cs-card--link', href:U(buildPath('project',{slug:COMING_SOON_LAUNCH.link})), 'aria-label':COMING_SOON_LAUNCH.name+' — '+t('coming_soon')}, kids)
: h('figure',{class:'cs-card'}, kids));
RELEASES.forEach(function(r){ wrap.appendChild(releaseTeaser(r)); });
return wrap;
}
function field(kind,id,label,children){
var control = kind==='select' ? h('select',{id:id,name:id}, children)
: h('input',{id:id,name:id,type:kind});
return h('div',{class:'field'}, h('label',{for:id},label), control);
}
function opt(v,l,sel){ return h('option', sel?{value:v,selected:true}:{value:v}, l); }
function areaOptions(sel){ return [opt('',t('any'))].concat(AREAS.map(function(a){return opt(a.key,L(a.name),sel===a.key);})); }
function devOptions(sel){ return [opt('',t('any'))].concat(DEVELOPERS.map(function(d){return opt(d.key,L(d.name),sel===d.key);})); }
function statusOptions(sel){ return [opt('',t('any')),opt('launch',t('launch'),sel==='launch'),opt('primary',t('primary'),sel==='primary'),opt('ready',t('ready'),sel==='ready')]; }
var chatEls = null;
function chatBuild(){
if(chatEls) return;
var fab=h('button',{class:'chat-fab', type:'button','aria-label':t('chat_open')},
svg(ICON.chat), h('span',{class:'lbl'}, t('chat_open')));
var panel=h('aside',{class:'chat-panel', role:'dialog','aria-label':t('chat_title'),'aria-hidden':'true'});
var titleEl=h('h3',null,t('chat_title')), subEl=h('p',null,t('chat_sub'));
var closeB=h('button',{class:'x', type:'button','aria-label':t('a_close')}, svg('M6 6l12 12M18 6L6 18'));
var head=h('div',{class:'chat-head'}, h('div',{class:'av'}, svg(ICON.spark)), h('div',null, titleEl, subEl), closeB);
var body=h('div',{class:'chat-body'});
var chips=h('div',{class:'chat-chips'});
var input=h('input',{type:'text','aria-label':t('chat_ph'), placeholder:t('chat_ph'), autocomplete:'off'});
var sendB=h('button',{type:'submit','aria-label':t('a_send')}, svg(ICON.send));
var form=h('form',{class:'chat-input'}, input, sendB);
panel.appendChild(head); panel.appendChild(body); panel.appendChild(chips); panel.appendChild(form);
document.body.appendChild(fab); document.body.appendChild(panel);
chatEls={fab:fab, fabLbl:fab.querySelector('.lbl'), panel:panel, title:titleEl, sub:subEl, body:body, chips:chips, input:input, closeB:closeB, sendB:sendB};
fab.addEventListener('click', chatOpen);
closeB.addEventListener('click', chatClose);
form.addEventListener('submit', function(e){ e.preventDefault(); chatUserSend(input.value); });
panel.addEventListener('click', function(e){ if(e.target.closest('a')) chatClose(); });
document.addEventListener('keydown', function(e){ if(e.key==='Escape' && panel.classList.contains('open')) chatClose(); });
chatRefresh();
}
var compareFabEl=null;
function updateCompareFab(){
if(typeof document==='undefined' || !document.body) return;
var n=(typeof compare!=='undefined' && compare)?compare.length:0;
if(!compareFabEl){
compareFabEl=h('a',{class:'compare-fab', href:U(buildPath('compare')), 'aria-label':t('nav_compare')},
ic('scale','compare-fab__ic'), h('span',{class:'compare-fab__lbl'}, t('nav_compare')),
h('span',{class:'compare-fab__badge'}, ''));
document.body.appendChild(compareFabEl);
}
compareFabEl.setAttribute('href', U(buildPath('compare')));
compareFabEl.setAttribute('aria-label', t('nav_compare')+(n?(' ('+num(n)+')'):''));
var lbl=compareFabEl.querySelector('.compare-fab__lbl'); if(lbl) lbl.textContent=t('nav_compare');
var badge=compareFabEl.querySelector('.compare-fab__badge'); if(badge) badge.textContent=n?num(n):'';
compareFabEl.classList.toggle('is-visible', n>0);
}
function chatOpen(){ if(!chatEls) return; chatEls.panel.classList.add('open'); chatEls.panel.setAttribute('aria-hidden','false'); chatEls.fab.style.display='none'; if(compareFabEl) compareFabEl.classList.add('is-hidden-by-chat'); chatRefresh(); track('ai_advisor_open'); setTimeout(function(){ chatEls.input.focus(); },50); }
function chatClose(){ if(!chatEls) return; chatEls.panel.classList.remove('open'); chatEls.panel.setAttribute('aria-hidden','true'); chatEls.fab.style.display=''; if(compareFabEl) compareFabEl.classList.remove('is-hidden-by-chat'); try{ chatEls.fab.focus(); }catch(e){} }
function chatRefresh(){
if(!chatEls) return;
chatEls.fabLbl.textContent=t('chat_open'); chatEls.title.textContent=t('chat_title');
chatEls.sub.textContent=t('chat_sub'); chatEls.input.setAttribute('placeholder', t('chat_ph'));
chatEls.fab.setAttribute('aria-label', t('chat_open')); chatEls.closeB.setAttribute('aria-label', t('a_close')); chatEls.sendB.setAttribute('aria-label', t('a_send'));
chatEls.input.setAttribute('aria-label', t('chat_ph'));
clear(chatEls.chips);
if(hasSelection(FILTER)){
var rb=h('button',{type:'button', class:'chip-key'}, t('chat_reco'));
rb.addEventListener('click', function(){ chatPush(h('div',{class:'msg user'}, t('chat_reco'))); chatPush(chatRecommend()); });
chatEls.chips.appendChild(rb);
}
['chat_c1','chat_c2','chat_c3','chat_c4'].forEach(function(k){
var b=h('button',{type:'button'}, t(k)); b.addEventListener('click', function(){ chatUserSend(t(k)); }); chatEls.chips.appendChild(b); });
if(!chatEls.body.children.length){
chatPush(chatMsg(t('chat_hello')));
if(hasSelection(FILTER)) chatPush(chatMsg((lang==='ar'?'أرى أنك تبحث عن: ':'I can see you’re looking at: ')+selectionSummary(FILTER)+(lang==='ar'?' — اضغط «رشّح من اختياري».':' — tap “Recommend from my selection”.')));
}
}
function chatPush(node){ chatEls.body.appendChild(node); chatEls.body.scrollTop=chatEls.body.scrollHeight; }
function chatMsg(){ var m=h('div',{class:'msg bot'}); for(var i=0;i<arguments.length;i++){ if(arguments[i]!=null && arguments[i]!==false) append(m, arguments[i]); } return m; }
function chatLink(label, path){ return h('a',{href:U(path)}, label); }
function chatList(title, items){
var box=chatMsg(title);
if(!items.length){ box.appendChild(document.createTextNode(' '+t('chat_none'))); return box; }
var ul=h('div',{style:'margin-top:6px;display:flex;flex-direction:column;gap:5px'});
items.slice(0,6).forEach(function(it){ ul.appendChild(h('a',{class:'unit-mini', href:U(it.href)}, it.label)); });
box.appendChild(ul); return box;
}
function chatActions(intro){
var box=chatMsg(intro);
var row=h('div',{style:'display:flex;gap:6px;flex-wrap:wrap;margin-top:9px'});
row.appendChild(h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('contact'))}, t('chat_leave')));
if(CONFIG.whatsapp) row.appendChild(h('a',{class:'btn btn--wa btn--sm', href:waLink(lang==='ar'?'مرحباً، أرغب في التحدث إلى مستشار':'Hello, I would like to talk to an advisor'), target:'_blank', rel:'noopener'}, svg(ICON.wa), t('chat_send_wa')));
if(CONFIG.phone) row.appendChild(h('a',{class:'btn btn--ghost btn--sm', href:'tel:'+CONFIG.phone}, svg(ICON.phone), CONFIG.phoneDisplay||CONFIG.phone));
box.appendChild(row); return box;
}
function chatBriefText(f, recs){
var loc=lang==='ar', lines=[loc?'استفسار من موقع The Village':'Enquiry via The Village website'];
if(hasSelection(f)) lines.push((loc?'المطلوب: ':'Looking for: ')+selectionSummary(f));
if(recs && recs.length){ lines.push(loc?'قائمة مختارة (استرشادية):':'Shortlist (illustrative):');
recs.forEach(function(u){ var p=projBySlug(u.project); lines.push('• '+unitTypeLabel(u)+' — '+(loc?p.name_ar:p.name)+' · '+money(u.price)); }); }
lines.push(loc?'برجاء تأكيد الأسعار والإتاحة الحالية.':'Please confirm current prices and availability.');
return lines.join('\n');
}
function chatAskPrefs(){
var box=chatMsg(lang==='ar'?'لأرشّح لك وحدات مناسبة، اختر منطقة للبداية:':'To shortlist units for you, pick an area to start:');
var row=h('div',{class:'chat-chips',style:'margin-top:8px'});
AREAS.slice(0,5).forEach(function(a){ var b=h('button',{type:'button'}, L(a.name));
b.addEventListener('click', function(){ var f=defaultFilter(); f.areas=[a.key]; f.mode='balanced'; FILTER=f; navigateTo(buildPath('units')+'?areas='+a.key+'&mode=balanced'); chatClose(); }); row.appendChild(b); });
box.appendChild(row);
box.appendChild(h('div',{style:'margin-top:8px'}, h('a',{class:'btn btn--ghost btn--sm', href:U(buildPath('units'))}, svg(ICON.search), t('finder_h'))));
return box;
}
function chatRecommend(){
var f=FILTER;
if(!hasSelection(f)) return chatAskPrefs();
var recs=recommendUnits(f,'balanced').slice(0,5);
var box=chatMsg((lang==='ar'?'حسب اختيارك — ':'Based on your selection — ')+selectionSummary(f)+':');
if(!recs.length){
box.appendChild(h('div',{style:'margin-top:6px'}, lang==='ar'?'لم أجد تطابقاً قريباً؛ يمكن توسيع النطاق أو التحدث مع مستشار.':'No close matches yet — try widening your criteria or talk to an advisor.'));
var pr=relaxationPlan(f);
if(pr.length) box.appendChild(h('div',{class:'chat-illus',style:'margin-top:6px'}, (lang==='ar'?'جرّب تخفيف: ':'Try loosening: ')+pr.slice(0,2).map(function(s){return s.label;}).join('، ')));
box.appendChild(chatRecoActions(f, recs)); return box;
}
var ul=h('div',{style:'margin-top:8px;display:flex;flex-direction:column;gap:5px'});
recs.forEach(function(u){ var p=projBySlug(u.project);
ul.appendChild(h('a',{class:'unit-mini', href:U(buildPath('project',{slug:p.slug}))},
unitTypeLabel(u)+' — '+(lang==='ar'?p.name_ar:p.name)+' · '+money(u.price)+' · '+t('conf_illustrative'))); });
box.appendChild(ul);
box.appendChild(h('div',{class:'chat-illus',style:'margin-top:6px'}, lang==='ar'?'مرتّبة حسب قربها من اختيارك — أكّد التفاصيل مع مستشار.':'Ranked by closeness to your selection — confirm details with an advisor.'));
box.appendChild(chatRecoActions(f, recs));
return box;
}
function chatRecoActions(f, recs){
var row=h('div',{style:'display:flex;gap:6px;flex-wrap:wrap;margin-top:9px'});
var brief=chatBriefText(f, recs);
if(CONFIG.whatsapp) row.appendChild(h('a',{class:'btn btn--wa btn--sm', href:waLink(brief), target:'_blank', rel:'noopener'}, svg(ICON.wa), lang==='ar'?'أرسل القائمة لمستشار':'Send shortlist to advisor'));
row.appendChild(h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('contact'))}, t('chat_leave')));
return row;
}
function chatUserSend(text){
text=(text||'').trim(); if(!text || !chatEls) return;
chatPush(h('div',{class:'msg user'}, text));
chatEls.input.value='';
chatPush(chatRespond(text) || chatActions(t('chat_noanswer')));
}
function offerUrl(path){ return (CONFIG.origin||'') + U(path); }
function planLine(p){
var bits=[];
if(p.dp)    bits.push(num(p.dp)+'% '+t('dp'));
if(p.years) bits.push(num(p.years)+' '+(lang==='ar'?'سنوات':'years'));
return bits.join(' · ');
}
function projMetaLine(p){
var area=areaByKey(p.area), bits=[L(area.name)];
if(p.delivery) bits.push((lang==='ar'?'تسليم ':'Delivery ')+(p.delivery==='Ready'?t('ready'):p.delivery));
if(p.finishing) bits.push(L(p.finishing));
return bits.join(' · ');
}
function offerUnitRows(p, cap){
return UNITS.filter(function(u){ return u.project===p.slug; }).slice(0, cap||8).map(function(u){
var bits=[unitDisplayName(u)];
if(u.area!=null)  bits.push(num(u.area)+' m²');
if(u.price!=null) bits.push(money(u.price));
return {text:bits.join(' · '), href:buildPath('unit',{id:u.id})};
});
}
function offerProjectRows(list){
return list.map(function(p){
var bits=[(lang==='ar'?p.name_ar:p.name)];
if(p.price!=null) bits.push(t('from')+' '+money(p.price));
var pl=planLine(p); if(pl) bits.push(pl);
return {text:bits.join(' · '), href:buildPath('project',{slug:p.slug})};
});
}
function offerText(o){
var ar=(lang==='ar'), out=[];
out.push(ar?'ذا فيليدج للاستثمار — عرض':'The Village Investment — Offer');
out.push(o.title);
if(o.sub) out.push(o.sub);
if(o.price!=null) out.push('');
if(o.price!=null) out.push((ar?'يبدأ من: ':'Starting from: ')+money(o.price));
if(o.plan) out.push((ar?'نظام السداد: ':'Payment plan: ')+o.plan);
if(o.rows && o.rows.length){
out.push('');
out.push((o.rowsTitle||(ar?'الوحدات المتاحة':'Available units'))+':');
o.rows.forEach(function(r){ out.push('• '+r.text); });
}
out.push('');
out.push(ar?'بيع أولي — مباشر من المطوّر.':'Primary sale — direct from the developer.');
out.push(ar?'الأرقام استرشادية؛ برجاء تأكيد الأسعار والإتاحة الحالية.'
:'Figures are illustrative; please confirm current prices and availability.');
if(o.href) out.push(offerUrl(o.href));
var contact=[]; if(CONFIG.phone) contact.push(CONFIG.phoneDisplay||CONFIG.phone);
if(CONFIG.email) contact.push(CONFIG.email);
if(contact.length) out.push(contact.join(' · '));
return out.join('\n');
}
function copyOffer(text, btn){
var done=function(){ toast(lang==='ar'?'تم نسخ العرض':'Offer copied','check'); };
try{
if(navigator.clipboard && navigator.clipboard.writeText){
navigator.clipboard.writeText(text).then(done, function(){ copyFallback(text, done); });
} else copyFallback(text, done);
}catch(e){ copyFallback(text, done); }
}
function copyFallback(text, done){
var ta=h('textarea',{style:'position:fixed;top:-2000px;opacity:0','aria-hidden':'true'});
ta.value=text; document.body.appendChild(ta);
try{ ta.select(); document.execCommand('copy'); done(); }
catch(e){ toast(lang==='ar'?'تعذّر النسخ':'Could not copy','info'); }
if(ta.parentNode) ta.parentNode.removeChild(ta);
}
function chatOffer(o){
var box=chatMsg();
box.appendChild(h('div',{class:'offer__h'}, o.title));
if(o.sub) box.appendChild(h('div',{class:'offer__sub'}, o.sub));
if(o.price!=null) box.appendChild(h('div',{class:'offer__price'},
h('small',null, t('from')), money(o.price)));
if(o.plan) box.appendChild(h('div',{class:'offer__plan'}, ic('doc'), o.plan));
if(o.rows && o.rows.length){
if(o.rowsTitle) box.appendChild(h('div',{class:'offer__rt'}, o.rowsTitle));
var ul=h('div',{style:'margin-top:4px'});
o.rows.forEach(function(r){ ul.appendChild(h('a',{class:'unit-mini', href:U(r.href)}, r.text)); });
box.appendChild(ul);
}
box.appendChild(h('div',{class:'chat-illus',style:'margin-top:8px'}, t('conf_illustrative')));
var text=offerText(o);
var row=h('div',{class:'offer__acts'});
if(CONFIG.whatsapp) row.appendChild(h('a',{class:'btn btn--wa btn--sm', href:waLink(text),
target:'_blank', rel:'noopener'}, svg(ICON.wa), t('offer_send')));
var cp=h('button',{class:'btn btn--ghost btn--sm', type:'button'}, ic('doc'), t('offer_copy'));
cp.addEventListener('click', function(){ copyOffer(text, cp); track('offer_copied',{k:o.kind}); });
row.appendChild(cp);
if(o.href) row.appendChild(h('a',{class:'btn btn--ghost btn--sm', href:U(o.href)}, t('offer_open')));
box.appendChild(row);
track('offer_shown',{k:o.kind});
return box;
}
function projectOffer(p){
var dev=devByKey(p.dev), rows=offerUnitRows(p);
return chatOffer({kind:'project',
title:(lang==='ar'?p.name_ar:p.name)+' · '+L(dev.name),
sub:projMetaLine(p), price:p.price, plan:planLine(p),
rows:rows, rowsTitle:rows.length?t('offer_units'):null,
href:buildPath('project',{slug:p.slug})});
}
function listOffer(kind, title, sub, list, href){
if(!list.length) return null;
var prices=list.map(function(p){ return p.price; }).filter(function(v){ return v!=null; });
return chatOffer({kind:kind, title:title, sub:sub,
price:prices.length?Math.min.apply(null,prices):null,
rows:offerProjectRows(list.slice(0,8)),
rowsTitle:t('offer_projects'), href:href});
}
function typeOffer(tk){
var us=UNITS.filter(function(u){ return u.type===tk; });
if(!us.length) return null;
var prices=us.map(function(u){ return u.price; }).filter(function(v){ return v!=null; });
var rows=us.slice().sort(function(a,b){ return (a.price||0)-(b.price||0); }).slice(0,8).map(function(u){
var p=projBySlug(u.project), bits=[unitDisplayName(u), (lang==='ar'?p.name_ar:p.name)];
if(u.area!=null)  bits.push(num(u.area)+' m²');
if(u.price!=null) bits.push(money(u.price));
return {text:bits.join(' · '), href:buildPath('unit',{id:u.id})};
});
return chatOffer({kind:'type', title:typeLabel(tk),
sub:(lang==='ar'?'عبر ':'Across ')+num(new_Set(us.map(function(u){return u.project;})))+' '+(lang==='ar'?'مشروعات':'projects'),
price:prices.length?Math.min.apply(null,prices):null,
rows:rows, rowsTitle:t('offer_units'), href:buildPath('units')});
}
function new_Set(arr){ var s={},n=0; arr.forEach(function(v){ if(!s[v]){s[v]=1;n++;} }); return n; }
function bestNameMatch(nq, list, names){
var best=null, bestLen=0;
list.forEach(function(o){
names(o).forEach(function(nm){
var n=arNorm(nm); if(!n || n.length<3) return;
if(nq.indexOf(n)>-1 && n.length>bestLen){ best=o; bestLen=n.length; }
});
});
return best;
}
function chatRespond(raw){
var q=raw.trim(), ql=q.toLowerCase(), nq=arNorm(q);
if(/(recommend|suggest|shortlist|best fit|match me|for me|رشّ?ح|اقترح|الأنسب|المناسب|قائمة مختارة)/.test(ql)) return chatRecommend();
if(/(advisor|agent|human|call|phone|whatsapp|contact|register|مستشار|اتصال|تواصل|واتساب|واتس|كلم|سجل|بيانات)/.test(ql)) return chatActions(lang==='ar'?'يسعدنا مساعدتك مباشرة:':'Happy to help you directly:');
if(/(payment|install|plan|deposit|قسط|تقسيط|سداد|دفعة|مقدم)/.test(ql)){
var maxY=Math.max.apply(null, PROJECTS.map(function(p){ return p.years||0; }))||7;
return chatMsg((lang==='ar'
? ('توفّر The Village خطط سداد مرنة تصل حتى '+num(maxY)+' سنوات على وحدات مختارة، ويختلف المقدم والمدة حسب المشروع والمطوّر. ')
: ('The Village offers flexible payment plans up to '+maxY+' years on selected units; the down payment and duration vary by project and developer. ')),
h('em',{class:'chat-illus'}, t('illustrative_short')), ' ',
chatLink(t('nav_faqs'), buildPath('faqs')));
}
var proj=bestNameMatch(nq, PROJECTS, function(p){ return [p.name, p.name_ar]; });
if(proj) return projectOffer(proj);
var dev=bestNameMatch(nq, DEVELOPERS, function(d){ return [d.name.en, d.name.ar]; });
if(dev){
var dl=projByDev(dev.key);
var off=listOffer('dev', L(dev.name), num(dl.length)+' '+(lang==='ar'?'مشروعات':'projects'),
dl, buildPath('developer',{slug:dev.key}));
if(off) return off;
}
var area=bestNameMatch(nq, AREAS, function(a){ return [a.name.en, a.name.ar]; });
if(area){
var al=projInArea(area.key);
var aoff=listOffer('area', L(area.name), num(al.length)+' '+(lang==='ar'?'مشروعات':'projects'),
al, buildPath('area',{slug:area.key}));
if(aoff) return aoff;
}
var tk=Object.keys(TYPE_META).filter(function(k){ return ql.indexOf(k.toLowerCase())>-1 || q.indexOf(TYPE_META[k].ar)>-1; })[0];
if(tk){ var toff=typeOffer(tk); if(toff) return toff; }
if(/(launch|new launch|newly|إطلاق|اطلاق|جديد)/.test(ql)) return chatList(t('chat_found'), newLaunchProjects().map(function(p){ return {label:(lang==='ar'?p.name_ar:p.name), href:buildPath('project',{slug:p.slug})}; }));
var m=(ql.replace(/[,\s]/g,'').match(/(\d{5,})/)||[])[1];
if(m){ var b=parseInt(m,10); var under=PROJECTS.filter(function(p){return p.price<=b;}); if(under.length) return chatList(lang==='ar'?'مشروعات ضمن ميزانيتك:':'Projects within your budget:', under.map(function(p){ return {label:(lang==='ar'?p.name_ar:p.name)+' · '+t('from')+' '+money(p.price)+' · '+t('conf_illustrative'), href:buildPath('project',{slug:p.slug})}; })); }
if(/(who|about|company|من نحن|من انتم|عنكم|شركة)/.test(ql)) return chatMsg(ABOUT[lang][0]+' ', chatLink(t('nav_about'), buildPath('about')));
if(/(area|location|where|مناطق|منطقة|مكان|فين|وين)/.test(ql)) return chatList(t('chat_found'), AREAS.map(function(a){ return {label:L(a.name), href:buildPath('area',{slug:a.key})}; }));
if(/(unit|units|apartment|villa|وحدات|وحدة|شقق|شقة)/.test(ql)) return chatList(t('chat_found'), UNITS.slice(0,6).map(function(u){ var p=projBySlug(u.project); return {label:typeLabel(u.type)+' — '+(lang==='ar'?p.name_ar:p.name)+' · '+money(u.price)+' · '+t('conf_illustrative'), href:buildPath('project',{slug:p.slug})}; }));
if(/(developer|مطور|مطوّر|مطورين)/.test(ql)) return chatList(t('chat_found'), DEVELOPERS.map(function(d){ return {label:L(d.name), href:buildPath('developer',{slug:d.key})}; }));
return chatActions(t('chat_noanswer'));
}
var railEls=null, railNudge={el:null, dismissed:false, timer:null, hideT:null};
function railWaMsg(){ return lang==='ar'?'مرحباً، أرغب في الاستفسار عن عقارات The Village':'Hello, I would like to enquire about The Village properties'; }
function nudgeText(){ return lang==='ar'?'محتاج مساعدة؟ كلّم مستشار الآن':'Need help? Talk to an advisor'; }
function contactRailBuild(){
if(railEls) return;
var rail=h('div',{class:'contact-rail', id:'contact-rail', role:'group'});
var phoneB = CONFIG.phone ? h('a',{class:'cr-btn'}, ic('phone')) : null;
var emailB = CONFIG.email ? h('a',{class:'cr-btn'}, ic('mail')) : null;
var waB    = CONFIG.whatsapp ? h('a',{class:'cr-btn cr-btn--wa', target:'_blank', rel:'noopener'}, svgSolid(ICON.wa_solid)) : null;
[waB,phoneB,emailB].forEach(function(b){ if(b) rail.appendChild(b); });
if(!rail.childNodes.length) return;
document.body.appendChild(rail);
railEls={rail:rail, phone:phoneB, email:emailB, wa:waB};
contactNudgeInit();
railRefresh();
}
function contactNudgeInit(){
if(!CONFIG.whatsapp || railNudge.el) return;
var link=h('a',{class:'rail-nudge', target:'_blank', rel:'noopener', 'aria-hidden':'true', tabindex:'-1'},
h('span',{class:'rail-nudge__ic'}, svgSolid(ICON.wa_solid)), h('span',{class:'rail-nudge__t'}, nudgeText()));
var x=h('button',{class:'rail-nudge__x', type:'button', 'aria-label':t('a_close')}, '×');
link.appendChild(x);
x.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); railNudge.dismissed=true; clearTimeout(railNudge.timer); clearInterval(railNudge.timer); railNudgeHide(); track('contact_nudge_dismissed'); });
link.addEventListener('click', function(){ track('contact_nudge_click'); });
document.body.appendChild(link);
railNudge.el=link;
railNudge.timer=setTimeout(function(){ railNudgeMaybe(); railNudge.timer=setInterval(railNudgeMaybe, 60000); }, 30000);
}
function railNudgeMaybe(){
if(railNudge.dismissed || !railNudge.el) return;
if(document.querySelector('.chat-panel.open, .pal-back.open, .drawer.open')) return;
var ae=document.activeElement; if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName||'')) return;
railNudgeShow();
}
function railNudgeShow(){
var n=railNudge.el; if(!n) return;
n.classList.add('show'); n.setAttribute('aria-hidden','false'); n.setAttribute('tabindex','0');
track('contact_nudge_shown');
clearTimeout(railNudge.hideT); railNudge.hideT=setTimeout(railNudgeHide, 6500);
}
function railNudgeHide(){ var n=railNudge.el; if(!n) return; n.classList.remove('show'); n.setAttribute('aria-hidden','true'); n.setAttribute('tabindex','-1'); }
function railRefresh(){
if(!railEls) return;
railEls.rail.setAttribute('aria-label', lang==='ar'?'قنوات التواصل':'Contact channels');
if(railEls.phone){ railEls.phone.setAttribute('href','tel:'+CONFIG.phone); railEls.phone.setAttribute('aria-label', t('call')+' '+(CONFIG.phoneDisplay||CONFIG.phone)); }
if(railEls.email){ railEls.email.setAttribute('href','mailto:'+CONFIG.email+'?subject='+encodeURIComponent(lang==='ar'?'استفسار عقاري':'Property enquiry')); railEls.email.setAttribute('aria-label', t('email_label')); }
if(railEls.wa){ railEls.wa.setAttribute('href', waLink(railWaMsg())); railEls.wa.setAttribute('aria-label', t('whatsapp')); }
if(railNudge.el){ var tEl=railNudge.el.querySelector('.rail-nudge__t'); if(tEl) tEl.textContent=nudgeText();
railNudge.el.setAttribute('href', waLink(lang==='ar'?'مرحباً، أحتاج مساعدة مستشار':'Hello, I need help from an advisor'));
var x=railNudge.el.querySelector('.rail-nudge__x'); if(x) x.setAttribute('aria-label', t('a_close')); }
}
var LEAD = { shown:0, armed:false, open:false, lastFocus:null };
function leadDone(){ try{ return !!(window.sessionStorage && window.sessionStorage.getItem('tvi_lead')==='done'); }catch(e){ return false; } }
function leadShouldRun(){ return !leadDone() && LEAD.shown<2; }
function leadArm(){ if(LEAD.armed || !leadShouldRun()) return; LEAD.armed=true; setTimeout(leadTryOpen, 2500); }
function leadTryOpen(){
if(!leadShouldRun() || LEAD.open) return;
var ae=document.activeElement;
if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName||'')){ setTimeout(leadTryOpen, 10000); return; }
if(document.querySelector('.drawer.open, .chat-panel.open, .pal-back.open')){ setTimeout(leadTryOpen, 10000); return; }
leadOpenModal();
if(LEAD.shown<2) setTimeout(leadTryOpen, 60000);
}
function leadMarkDone(){ try{ if(window.sessionStorage) window.sessionStorage.setItem('tvi_lead','done'); }catch(e){} }
function leadEsc(e){ if(e.key==='Escape'||e.keyCode===27) leadCloseModal(); }
function leadCloseModal(){
var b=document.getElementById('lead-back'); if(b && b.parentNode) b.parentNode.removeChild(b);
LEAD.open=false; document.removeEventListener('keydown', leadEsc);
if(LEAD.lastFocus){ try{ LEAD.lastFocus.focus(); }catch(e){} }
}
function leadOpenModal(){
if(document.getElementById('lead-back') || !leadShouldRun()) return;
LEAD.open=true; LEAD.shown++; LEAD.lastFocus=document.activeElement;
track('lead_popup_shown', {n:LEAD.shown});
var nameI=h('input',{type:'text', id:'lead-name', autocomplete:'name', placeholder:t('lead_name'), 'aria-label':t('lead_name')});
var phoneI=h('input',{type:'tel', id:'lead-phone', inputmode:'tel', autocomplete:'tel', placeholder:t('lead_phone'), 'aria-label':t('lead_phone')});
var err=h('div',{class:'lead-err', role:'alert', style:'display:none'});
var send=h('button',{type:'submit', class:'lead-send'}, t('lead_send'));
var form=h('form',{class:'lead-form'}, nameI, phoneI, err, send);
var closeB=h('button',{type:'button', class:'lead-x', 'aria-label':t('a_close')}, '×');
var card=h('div',{class:'lead-card', role:'dialog', 'aria-modal':'true', 'aria-label':t('lead_title')},
closeB, h('h2',{class:'lead-h'}, t('lead_title')), h('p',{class:'lead-sub'}, t('lead_sub')),
form, h('div',{class:'lead-note'}, ic('info'), h('span',null, t('conf_illustrative'))));
var back=h('div',{class:'lead-back', id:'lead-back'}, card);
document.body.appendChild(back);
try{ requestAnimationFrame(function(){ back.classList.add('show'); }); }catch(e){ back.classList.add('show'); }
setTimeout(function(){ try{ nameI.focus(); }catch(e){} }, 60);
closeB.addEventListener('click', leadCloseModal);
back.addEventListener('click', function(e){ if(e.target===back) leadCloseModal(); });
document.addEventListener('keydown', leadEsc);
form.addEventListener('submit', function(e){ e.preventDefault();
var nm=(nameI.value||'').trim(), ph=(phoneI.value||'').trim(), digits=ph.replace(/[^0-9]/g,'');
if(nm.length<2 || digits.length<7){ err.textContent=t('lead_err'); err.style.display='block'; return; }
err.style.display='none'; send.disabled=true; send.textContent=t('lead_sending');
leadSubmit(nm, ph).then(function(){ leadMarkDone(); leadThanks(card); });
});
}
function leadThanks(card){
clear(card);
card.appendChild(h('div',{class:'lead-thanks'}, h('div',{class:'lead-check'}, '✓'), h('h2',{class:'lead-h'}, t('lead_thanks'))));
setTimeout(leadCloseModal, 2800);
}
function leadSubmit(name, phone){
var data={ name:name, phone:phone, source:'popup', page:(typeof currentRoute!=='undefined'&&currentRoute?currentRoute.name:''), locale:lang, ts:new Date().toISOString(), site:'thevillageinvestment.com' };
try{ var arr=load('tv_leads',[]); arr.push(data); store('tv_leads', arr.slice(-50)); }catch(e){}
track('lead_submitted', {source:'popup'});
if(CONFIG.LEAD_ENDPOINT && typeof fetch!=='undefined'){
return fetch(CONFIG.LEAD_ENDPOINT, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(data)})
.then(function(){ return true; }).catch(function(){ leadMailFallback(data); return false; });
}
leadMailFallback(data);
return Promise.resolve(null);
}
function leadMailFallback(d){
var to=CONFIG.leadEmail||CONFIG.email; if(!to) return;
var subj=(lang==='ar'?'عميل جديد من الموقع':'New website lead')+' — '+d.name;
var body=(lang==='ar'?'الاسم: ':'Name: ')+d.name+'\n'+(lang==='ar'?'الهاتف: ':'Phone: ')+d.phone+'\n'+(lang==='ar'?'الصفحة: ':'Page: ')+d.page+'\n'+d.ts;
try{ window.open('mailto:'+to+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body), '_blank'); }catch(e){}
}
function arNorm(s){
return String(s==null?'':s).toLowerCase()
.replace(/[ً-ْٰ]/g,'')
.replace(/ـ/g,'')
.replace(/[أإآا]/g,'ا')
.replace(/ى/g,'ي').replace(/ة/g,'ه')
.replace(/ؤ/g,'و').replace(/ئ/g,'ي')
.replace(/ڤ/g,'ف').replace(/پ/g,'ب').replace(/چ/g,'ج').replace(/گ/g,'ك')
.replace(/[^0-9a-z؀-ۿ\s]/g,' ')
.replace(/\s+/g,' ').trim();
}
var SEARCH_TYPES=['project','unit','developer','area','article','faq','page'];
var SEARCH_TYPE_LABEL={project:{en:'Projects',ar:'مشروعات',one:{en:'Project',ar:'مشروع'}},unit:{en:'Units',ar:'وحدات',one:{en:'Unit',ar:'وحدة'}},developer:{en:'Developers',ar:'مطوّرون',one:{en:'Developer',ar:'مطوّر'}},area:{en:'Areas',ar:'مناطق',one:{en:'Area',ar:'منطقة'}},article:{en:'Guides',ar:'أدلة',one:{en:'Guide',ar:'دليل'}},faq:{en:'FAQs',ar:'أسئلة',one:{en:'FAQ',ar:'سؤال'}},page:{en:'Pages',ar:'صفحات',one:{en:'Page',ar:'صفحة'}}};
function searchTypeOne(ty){ var m=SEARCH_TYPE_LABEL[ty]; return m&&m.one?L(m.one):''; }
function buildSearchIndex(){
var idx=[];
function add(type,title,subtitle,href,aliases,extra,icon,key){
idx.push({type:type,title:title,subtitle:subtitle||'',href:href,aliases:aliases||[],icon:icon,key:key||'',
norm:arNorm([title,subtitle,(aliases||[]).join(' '),extra||''].join(' '))});
}
PROJECTS.forEach(function(p){ var d=devByKey(p.dev),a=areaByKey(p.area);
add('project',(lang==='ar'?p.name_ar:p.name),L(d.name)+' · '+L(a.name),buildPath('project',{slug:p.slug}),
[p.name,p.name_ar],L(p.types)+' '+(lang==='ar'?p.tags.ar.join(' '):p.tags.en.join(' '))+' '+a.name.en+' '+a.name.ar+' '+d.name.en+' '+d.name.ar,'build',p.slug); });
UNITS.forEach(function(u){ var p=projBySlug(u.project),a=areaByKey(p.area);
add('unit',unitTypeLabel(u)+' — '+(lang==='ar'?p.name_ar:p.name),L(a.name)+' · '+money(u.price),buildPath('project',{slug:p.slug}),
[u.id,u.type],u.beds+' '+a.name.en+' '+a.name.ar,(TYPE_BY_CANON[unitCanon(u)]||{}).icon||'ty_apartment'); });
DEVELOPERS.forEach(function(d){ add('developer',L(d.name),L(d.tagline),buildPath('developer',{slug:d.key}),[d.name.en,d.name.ar],L(d.areas)+' '+d.areas.en+' '+d.areas.ar,'shield',d.key); });
AREAS.forEach(function(a){ add('area',L(a.name),L(a.blurb),buildPath('area',{slug:a.key}),[a.name.en,a.name.ar],'','pin',a.key); });
RESEARCH.forEach(function(r){ add('article',L(r.title),L(r.cat),buildPath('insight',{slug:r.slug}),[],L(r.excerpt),'doc'); });
FAQ.forEach(function(g){ g.items.forEach(function(it){ add('faq',L(it.q),L(g.label),buildPath('faqs'),[],L(it.a),'chat'); }); });
[['units','finder_h'],['compare','cmp_h'],['insights','insights_h'],['faqs','faqs_h'],['about','about_h'],['contact','contact_h'],['launches','nav_launches']]
.forEach(function(pg){ add('page',t(pg[1]),'',buildPath(pg[0]),[],'','arrow'); });
return idx;
}
function searchAll(q){
var nq=arNorm(q); if(!nq) return [];
var toks=nq.split(' ').filter(Boolean), out=[];
buildSearchIndex().forEach(function(d){
var title=arNorm(d.title), score=0;
if(title===nq) score+=100; else if(title.indexOf(nq)===0) score+=60; else if(title.indexOf(nq)>-1) score+=42;
d.aliases.forEach(function(a){ var na=arNorm(a); if(na===nq) score+=80; else if(na.indexOf(nq)===0) score+=30; });
var hit=toks.filter(function(tk){ return d.norm.indexOf(tk)>-1; }).length;
if(hit===toks.length) score+=22; else score+=hit*5;
if(score>0){ if(d.type==='project'||d.type==='unit') score+=2; out.push({d:d,s:score}); }
});
out.sort(function(a,b){ return b.s-a.s; });
return out.map(function(x){ return x.d; });
}
function recentSearches(){ return load('tv_recent', []); }
function pushRecent(q){ q=(q||'').trim(); if(!q) return; var r=recentSearches().filter(function(x){return x!==q;}); r.unshift(q); store('tv_recent', r.slice(0,6)); }
var palEls=null, palActive=-1, palItems=[];
function searchBuild(){
if(palEls) return;
var back=h('div',{class:'pal-back', id:'pal-back'});
var input=h('input',{type:'text', id:'pal-input', role:'combobox','aria-expanded':'true','aria-controls':'pal-list','aria-autocomplete':'list', autocomplete:'off','aria-label':t('search_ph')});
var top=h('div',{class:'pal-top'}, svg(ICON.search), input, h('kbd',null,'Esc'));
var chips=h('div',{class:'pal-chips', id:'pal-chips'});
var list=h('div',{class:'pal-body', id:'pal-list', role:'listbox'});
var foot=h('div',{class:'pal-foot'}, h('span',null,'↑↓ · Enter · Esc'), h('span',{id:'pal-count','aria-live':'polite'},''));
var pal=h('div',{class:'pal', role:'dialog','aria-label':t('search_ph')}, top, chips, list, foot);
back.appendChild(pal); document.body.appendChild(back);
palEls={back:back,input:input,list:list,chips:chips,count:document.getElementById('pal-count')};
back.addEventListener('click', function(e){ if(e.target===back) searchClose(); });
input.addEventListener('input', function(){ palActive=-1; searchRender(input.value); });
input.addEventListener('keydown', palKey);
document.addEventListener('keydown', function(e){ if((e.metaKey||e.ctrlKey) && (e.key==='k'||e.key==='K')){ e.preventDefault(); searchOpen(); } });
}
function searchOpen(prefill){
searchBuild(); palEls.back.classList.add('open'); palEls.input.value=prefill||'';
document.body.style.overflow='hidden'; searchRender(palEls.input.value);
setTimeout(function(){ palEls.input.focus(); },40);
track('global_search_open');
}
function searchClose(){ if(!palEls) return; palEls.back.classList.remove('open'); document.body.style.overflow=''; }
function palKey(e){
if(e.key==='Escape'){ searchClose(); return; }
if(e.key==='ArrowDown'){ e.preventDefault(); palMove(1); }
else if(e.key==='ArrowUp'){ e.preventDefault(); palMove(-1); }
else if(e.key==='Enter'){ e.preventDefault();
if(palActive>=0 && palItems[palActive]){ palGo(palItems[palActive]); }
else if(palEls.input.value.trim()){ pushRecent(palEls.input.value.trim()); searchClose(); navigateTo(buildPath('search')+'?q='+encodeURIComponent(palEls.input.value.trim())); }
}
}
function palMove(d){ var els=palEls.list.querySelectorAll('.pal-item'); if(!els.length) return;
palActive=(palActive+d+els.length)%els.length;
els.forEach(function(el,i){ var on=(i===palActive); el.classList.toggle('active', on); el.setAttribute('aria-selected', on?'true':'false');
if(on){ el.scrollIntoView({block:'nearest'}); palEls.input.setAttribute('aria-activedescendant', el.id); } }); }
function palGo(d){ pushRecent(palEls.input.value); searchClose(); track('global_search_result_click'); navigateTo(d.href); }
function searchRender(q){
var list=palEls.list, chips=palEls.chips; clear(list); clear(chips); palItems=[];
palEls.input.removeAttribute('aria-activedescendant');
if(!q || !q.trim()){
var rec=recentSearches();
var seeds = rec.length?rec:(lang==='ar'?['العاصمة الإدارية','شقة','بالم هيلز','تقسيط']:['New Cairo','apartment','SODIC','installments']);
seeds.forEach(function(s){ var b=h('button',{type:'button'}, s); b.addEventListener('click',function(){ palEls.input.value=s; searchRender(s); palEls.input.focus(); }); chips.appendChild(b); });
list.appendChild(h('div',{class:'pal-empty'}, t('search_hint')));
palEls.count.textContent=''; palEls.input.setAttribute('aria-expanded','false'); return;
}
var res=searchAll(q); track('global_search_query');
if(!res.length){ list.appendChild(h('div',{class:'pal-empty'}, t('search_none'))); palEls.count.textContent='0'; palEls.input.setAttribute('aria-expanded','false');
var wf=h('button',{type:'button'}, t('search_finder')); wf.addEventListener('click',function(){ searchClose(); navigateTo(buildPath('units')); }); chips.appendChild(wf); return; }
var byType={}; res.forEach(function(d){ (byType[d.type]=byType[d.type]||[]).push(d); });
SEARCH_TYPES.forEach(function(ty){ if(!byType[ty]) return;
var g=h('div',{class:'pal-group', role:'group', 'aria-label':(lang==='ar'?SEARCH_TYPE_LABEL[ty].ar:SEARCH_TYPE_LABEL[ty].en)});
g.appendChild(h('h5',{'aria-hidden':'true'}, (lang==='ar'?SEARCH_TYPE_LABEL[ty].ar:SEARCH_TYPE_LABEL[ty].en)+' · '+num(byType[ty].length)));
byType[ty].slice(0,6).forEach(function(d){
var it=h('div',{class:'pal-item', role:'option', id:'pal-opt-'+palItems.length, 'aria-selected':'false'},
h('div',{class:'pi-ic'}, ic(d.icon||'arrow')),
h('div',null, h('div',{class:'pi-t'}, d.title), d.subtitle?h('div',{class:'pi-s'}, d.subtitle):null));
it.addEventListener('click', function(){ palGo(d); }); g.appendChild(it); palItems.push(d);
});
list.appendChild(g);
});
palEls.count.textContent=num(res.length); palEls.input.setAttribute('aria-expanded', palItems.length?'true':'false');
}
function searchInit(){ searchBuild(); var b=document.getElementById('search-open'); if(b) b.addEventListener('click', function(){ searchOpen(); }); }
V.search = function(){
var qs=new URLSearchParams(CUR.search), q=qs.get('q')||'';
var res=q?searchAll(q):[];
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('search_h')}]),
sectionHead('', t('search_h'), q?('“'+q+'” · '+num(res.length)+' '+t('results')):t('search_p'), 'h1')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}), w=h('div',{class:'wrap'});
var inp=h('input',{type:'text',value:q,placeholder:t('search_ph'),'aria-label':t('search_ph')});
var box=h('form',{class:'toolbar',role:'search',style:'margin-bottom:22px'}, h('div',{class:'field',style:'flex:1;margin:0'}, inp), h('button',{class:'btn btn--primary',type:'submit'}, ic('search'), t('nav_search')));
box.addEventListener('submit', function(e){ e.preventDefault(); navigateTo(buildPath('search')+(inp.value.trim()?('?q='+encodeURIComponent(inp.value.trim())):'')); });
w.appendChild(box);
if(!q) w.appendChild(h('p',{class:'muted'}, t('search_hint')));
else if(!res.length) w.appendChild(h('div',{class:'state'}, ic('search'), h('h3',null,t('search_none')), h('a',{class:'btn btn--primary mt-16', href:U(buildPath('units'))}, t('search_finder'))));
else {
var byType={}; res.forEach(function(d){ (byType[d.type]=byType[d.type]||[]).push(d); });
SEARCH_TYPES.forEach(function(ty){ if(!byType[ty]) return;
w.appendChild(h('h3',{style:'font-size:1.12rem;margin:22px 0 10px'}, (lang==='ar'?SEARCH_TYPE_LABEL[ty].ar:SEARCH_TYPE_LABEL[ty].en)+' · '+num(byType[ty].length)));
var col=h('div',{style:'display:flex;flex-direction:column;gap:8px'});
byType[ty].forEach(function(d){ col.appendChild(h('a',{class:'dev-card', href:U(d.href)},
h('div',{class:'dev-logo', style:'width:40px;height:40px;font-size:1rem'}, ic(d.icon||'arrow')),
h('div',{class:'meta'}, h('h3',{style:'font-size:.98rem'}, d.title), d.subtitle?h('p',null,d.subtitle):null))); });
w.appendChild(col);
});
}
sec.appendChild(w); node.appendChild(sec);
return {node:node, title:(q?('“'+q+'” — '):'')+t('search_h')+' · The Village Investment', desc:t('search_p'),
indexable:false, crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('search_h')}]};
};
V.projects = function(preset){
if(preset==='launch'){
var lnode=h('div',null);
var lhead=h('section',{class:'section--tight'});
lhead.appendChild(h('div',{class:'wrap'},
crumbNode([{label:t('nav_home'), path:buildPath('home')},{label:t('nav_launches')}]),
sectionHead(t('hero_kicker'), t('nav_launches'), t('home_launch_p'), 'h1')));
lnode.appendChild(lhead);
var lmain=h('section',{style:'padding-bottom:clamp(48px,8vw,96px)'});
lmain.appendChild(h('div',{class:'wrap'}, launchStrip()));
lnode.appendChild(lmain);
var nl = newLaunchProjects();
return {node:lnode, title:t('nav_launches')+' · The Village Investment',
desc:t('home_launch_p') + countLine(nl.length,
Object.keys(nl.reduce(function(m,p){ m[p.dev]=1; return m; },{})).length),
indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_launches')}]};
}
var qs = new URLSearchParams(CUR.search);
var f = {
area: qs.get('area')||'',
dev: qs.get('dev')||'',
status: preset==='launch' ? 'launch' : (qs.get('status')||''),
max: qs.get('max')||'',
sort: qs.get('sort')||'feat',
saved: qs.get('saved')==='1'
};
var list = PROJECTS.filter(function(p){
if(preset==='launch' && !isNewLaunch(p)) return false;
if(f.area && p.area!==f.area) return false;
if(f.dev && p.dev!==f.dev) return false;
if(f.status && p.status!==f.status) return false;
if(f.max && p.price>Number(f.max)) return false;
if(f.saved && !saved.has(p.slug)) return false;
return true;
});
if(f.sort==='price_a') list = list.slice().sort(function(a,b){return a.price-b.price;});
if(f.sort==='price_d') list = list.slice().sort(function(a,b){return b.price-a.price;});
var node = h('div',null);
var head = h('section',{class:'section--tight'});
head.appendChild(h('div',{class:'wrap'},
crumbNode([{label:t('nav_home'), path:buildPath('home')},{label: preset==='launch'?t('nav_launches'):t('nav_projects')}]),
sectionHead(t('hero_kicker'), preset==='launch'?t('nav_launches'):t('nav_projects'),
preset==='launch'?t('home_launch_p'):t('home_feat_p'), 'h1')));
node.appendChild(head);
var main = h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'});
var wrap = h('div',{class:'wrap'});
var tb = h('form',{class:'toolbar', role:'search'});
tb.appendChild(field('select','tb-area', t('filter_area'), areaOptions(f.area)));
tb.appendChild(field('select','tb-dev', t('filter_dev'), devOptions(f.dev)));
if(preset!=='launch') tb.appendChild(field('select','tb-status', t('filter_status'), statusOptions(f.status)));
tb.appendChild(field('select','tb-sort', t('filter_sort'), [opt('feat',t('sort_feat'),f.sort==='feat'),opt('price_a',t('sort_price_a'),f.sort==='price_a'),opt('price_d',t('sort_price_d'),f.sort==='price_d')]));
var resultsHost = h('div');
function readFilters(){
return { a:$('#tb-area',tb).value, d:$('#tb-dev',tb).value,
s:$('#tb-sort',tb).value, st:$('#tb-status',tb)?$('#tb-status',tb).value:'' };
}
function computeList(cq){
var lst = PROJECTS.filter(function(p){
if(preset==='launch'){ if(!isNewLaunch(p)) return false; }
else if(cq.st && p.status!==cq.st) return false;
if(cq.a && p.area!==cq.a) return false;
if(cq.d && p.dev!==cq.d) return false;
if(f.max && p.price>Number(f.max)) return false;
if(f.saved && !saved.has(p.slug)) return false;
return true;
});
if(cq.s==='price_a') lst=lst.slice().sort(function(a,b){return a.price-b.price;});
if(cq.s==='price_d') lst=lst.slice().sort(function(a,b){return b.price-a.price;});
return lst;
}
function resetAll(){
$('#tb-area',tb).value=''; $('#tb-dev',tb).value='';
if($('#tb-status',tb)) $('#tb-status',tb).value=''; $('#tb-sort',tb).value='feat';
renderResults();
}
function ftag(label, selId){
var tag=h('span',{class:'filter-tag'}, label, h('button',{type:'button','aria-label':t('cta_reset')+': '+label},'×'));
tag.querySelector('button').addEventListener('click', function(){ var el=$('#'+selId,tb); if(el) el.value=''; renderResults(); });
return tag;
}
function renderResults(){
var cq=readFilters(), lst=computeList(cq);
clear(resultsHost);
var rb=h('div',{class:'result-bar'});
rb.appendChild(h('span',{class:'count','aria-live':'polite'}, num(lst.length)+' '+t('results')));
var af=h('div',{class:'active-filters'});
if(cq.a) af.appendChild(ftag(L(areaByKey(cq.a).name),'tb-area'));
if(cq.d) af.appendChild(ftag(L(devByKey(cq.d).name),'tb-dev'));
if(cq.st && preset!=='launch') af.appendChild(ftag(statusLabel(cq.st),'tb-status'));
if(f.saved) af.appendChild(h('span',{class:'filter-tag'}, t('saved')));
rb.appendChild(af);
if(cq.a||cq.d||(cq.st&&preset!=='launch')||f.saved||cq.s!=='feat')
rb.appendChild(h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:resetAll}, t('cta_reset')));
resultsHost.appendChild(rb);
if(lst.length){ resultsHost.appendChild(resultsHeading());
resultsHost.appendChild(h('div',{class:'grid grid--3'}, lst.map(projectCard))); }
else resultsHost.appendChild(h('div',{class:'state'}, ic('search'), h('h3',null,t('noresults')), h('p',null,t('noresults_p')),
h('button',{class:'btn btn--primary mt-16', type:'button', onclick:resetAll}, t('cta_reset'))));
var q=[];
if(cq.a) q.push('area='+cq.a); if(cq.d) q.push('dev='+cq.d);
if(cq.st && preset!=='launch') q.push('status='+cq.st);
if(cq.s && cq.s!=='feat') q.push('sort='+cq.s);
if(f.saved) q.push('saved=1');
var qs=q.length?('?'+q.join('&')):''; CUR.search=qs;
try{ history.replaceState(history.state,'', U(buildPath(preset==='launch'?'launches':'projects'))+qs); }catch(e){}
}
tb.addEventListener('change', function(){ renderResults(); });
tb.addEventListener('submit', function(e){ e.preventDefault(); renderResults(); });
wrap.appendChild(tb);
wrap.appendChild(resultsHost);
renderResults();
main.appendChild(wrap); node.appendChild(main);
var items = list.map(function(p){ return {name:(lang==='ar'?p.name_ar:p.name), url:CONFIG.origin+buildPath('project',{slug:p.slug})}; });
node.appendChild(ctaBand());
return {node:node, title:(preset==='launch'?t('nav_launches'):t('nav_projects'))+' · The Village Investment',
desc:(preset==='launch'?t('home_launch_p'):t('home_feat_p'))
+ countLine(list.length, Object.keys(list.reduce(function(m,p){ m[p.dev]=1; return m; },{})).length),
indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:preset==='launch'?t('nav_launches'):t('nav_projects')}],
ld:{'@type':'CollectionPage','name':(preset==='launch'?t('nav_launches'):t('nav_projects')),
'mainEntity':{'@type':'ItemList','numberOfItems':items.length,'itemListElement':items.map(function(it,i){return {'@type':'ListItem','position':i+1,'name':it.name,'url':it.url};})}}};
};
function unitAccType(u){
var c = normalizeUnitType(u.type);
if(c==='apartment'||c==='studio'||c==='duplex'||c==='penthouse') return 'Apartment';
if(c==='chalet'||c==='townhouse'||c==='twinhouse'||c==='twin'||c==='villa'||c==='standalone') return 'House';
return 'Accommodation';
}
function offerAvailability(p, u){
if(u && u.avail==='sold') return 'https://schema.org/SoldOut';
if(u && u.avail==='reserved') return 'https://schema.org/LimitedAvailability';
return (p && (p.delivery==='Ready' || p.status==='ready')) ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder';
}
function unitOfferLD(p, u){
var acc = { '@type': unitAccType(u),
'name': L({en:p.name,ar:p.name_ar}) + ' · ' + typeLabelC(normalizeUnitType(u.type)) };
if(!unitIsCommercial(u)){
if(u.beds!=null)  acc.numberOfRooms = u.beds;
if(u.baths!=null) acc.numberOfBathroomsTotal = u.baths;
}
if(u.area!=null){ acc.floorSize = {'@type':'QuantitativeValue','value':u.area,'unitCode':'MTK'};
if(u.areaTo>u.area){ acc.floorSize.minValue=u.area; acc.floorSize.maxValue=u.areaTo; } }
var off = { '@type':'Offer', 'priceCurrency':'EGP', 'availability': offerAvailability(p,u),
'itemOffered': acc, 'seller': {'@id': CONFIG.origin + '/#org'} };
if(u.price!=null) off.price = u.price;
return off;
}
function listingLD(p){
var dev = devByKey(p.dev), area = areaByKey(p.area), us = unitsIn(p.slug);
var nm = L({en:p.name,ar:p.name_ar});
var node = {
'@type': ['Product','Residence'],
'name': nm,
'description': L(p.blurb),
'category': 'Primary-sale residential development',
'brand': {'@type':'Organization','name': L(dev.name)},
'address': {'@type':'PostalAddress','addressRegion': L(area.name),'addressCountry':'EG'},
'areaServed': L(area.name),
'additionalProperty': [
{'@type':'PropertyValue','name':(lang==='ar'?'المطوّر':'Developer'),'value': L(dev.name)},
{'@type':'PropertyValue','name':(lang==='ar'?'المنطقة':'Area'),'value': L(area.name)},
{'@type':'PropertyValue','name':(lang==='ar'?'التسليم':'Delivery'),'value':(p.delivery==='Ready'?t('ready'):(p.delivery||t('to_confirm')))}
]
};
var prices = us.map(function(u){return u.price;}).filter(function(x){return x!=null;});
var low = (p.price!=null) ? p.price : (prices.length?Math.min.apply(null,prices):null);
if(low!=null){
var ao = {'@type':'AggregateOffer','priceCurrency':'EGP','lowPrice':low,
'availability': offerAvailability(p,null), 'seller':{'@id':CONFIG.origin+'/#org'}};
if(prices.length){ ao.highPrice = Math.max.apply(null,prices); ao.offerCount = prices.length; }
node.offers = ao;
}
var out = [node];
if(us.length){
out.push({'@type':'ItemList','name': nm + ' — ' + (lang==='ar'?'الوحدات':'units'),
'numberOfItems': us.length,
'itemListElement': us.map(function(u,i){ return {'@type':'ListItem','position':i+1,'item':unitOfferLD(p,u)}; })});
}
return out;
}
function unitsCollectionLD(){
var valid = UNITS.filter(function(u){ return !!projBySlug(u.project); });
return [{'@type':'CollectionPage','name': t('finder_h'),
'mainEntity': {'@type':'ItemList','numberOfItems': valid.length,
'itemListElement': valid.slice(0,60).map(function(u,i){
return {'@type':'ListItem','position':i+1,'item':unitOfferLD(projBySlug(u.project),u)}; })}}];
}
function projectDesc(p, dev, area){
var b = L(p.blurb);
var nm = lang==='ar' ? p.name_ar : p.name, ty = L(p.types);
if(b) return b;
if(lang==='ar'){
return nm+' من '+L(dev.name)+' في '+L(area.name)+'.'
+ (ty ? (' وحدات '+ty+' للبيع من المطوّر مباشرة.') : '')
+ ' قارن الأسعار وخطط السداد وتحدّث مع مستشار عقاري.';
}
return nm+' by '+L(dev.name)+' in '+L(area.name)+'.'
+ (ty ? (' '+ty+' units for primary sale.') : '')
+ ' Compare prices and payment plans, and speak to a property advisor.';
}
function arCount(n, one, few, many){
if(n <= 2) return one;
return (n <= 10) ? few : many;
}
function countLine(projects, devs){
if(!projects) return '';
if(lang==='ar'){
return ' '+num(projects)+' '+arCount(projects,'مشروع','مشاريع','مشروعًا')
+ ' للبيع الأولي من '+num(devs)+' '+arCount(devs,'مطوّر','مطوّرين','مطوّرًا')+'.';
}
return ' ' + projects + (projects===1?' primary-sale project':' primary-sale projects')
+ ' from ' + devs + (devs===1?' developer':' developers') + '.';
}
function areaDesc(a){
var ps = projInArea(a.key), seen = {};
ps.forEach(function(p){ seen[p.dev]=1; });
return L(a.blurb) + (ps.length ? countLine(ps.length, Object.keys(seen).length) : '');
}
function devDesc(d){
var ps = projByDev(d.key), seen = {};
ps.forEach(function(p){ seen[p.area]=1; });
var base = L(d.desc);
if(!ps.length) return base;
var n = Object.keys(seen).length;
return base + (lang==='ar'
? (' '+num(ps.length)+' '+arCount(ps.length,'مشروع','مشاريع','مشروعًا')
+' في '+num(n)+' '+arCount(n,'منطقة','مناطق','منطقة')+'.')
: (' ' + ps.length + (ps.length===1?' project':' projects') + ' in '
+ n + (n===1?' area.':' areas.')));
}
V.project = function(slug){
var p = projBySlug(slug); if(!p) return V.notfound();
var dev = devByKey(p.dev), area = areaByKey(p.area);
var nm = lang==='ar'?p.name_ar:p.name;
var node = h('div',null);
var top = h('section',{class:'section--tight'});
var wrap = h('div',{class:'wrap'});
wrap.appendChild(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_projects'),path:buildPath('projects')},{label:nm}]));
var pGal = projectGalleryItems(p);
var pChip = h('div',{class:'tags'}, h('span',{class:'chip'}, statusLabel(p.status)));
var media = pGal.length
? galleryHero(pGal, nm, nm, pChip, function(){ return projectArt(p); })
: h('div',{class:'detail-media'}, projectMedia(p), pChip);
var facts = h('table',{class:'fact-table'});
[[t('developer'),L(dev.name)],[t('area'),L(area.name)],[t('status'),statusLabel(p.status)],
[t('units'),L(p.types)],[t('finishing'),L(p.finishing)],[t('delivery'), p.delivery==='Ready'?t('ready'):(p.delivery||t('to_confirm'))]]
.forEach(function(r){ if(!r[1]) return; facts.appendChild(h('tr',null,h('th',{scope:'row'},r[0]),h('td',null,r[1]))); });
if(p.dp) facts.appendChild(h('tr',null,h('th',{scope:'row'},t('dp')),h('td',null,num(p.dp)+'%')));
if(p.years) facts.appendChild(h('tr',null,h('th',{scope:'row'},t('years')),h('td',null,num(p.years)+' '+(lang==='ar'?'سنوات':'years'))));
var aside = h('aside',{class:'aside-card'},
h('div',{class:'muted', style:'font-size:.8rem;font-weight:700'}, t('price')),
h('div',{class:'price-lg'}, money(p.price)),
provBadge(),
h('div',{class:'card__foot', style:'margin-top:16px;flex-wrap:wrap'},
h('a',{class:'btn btn--primary', href:U(buildPath('contact'))+'?p='+p.slug}, t('cta_talk'))),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px'},
h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:function(e){toggleSave(p.slug,null); render(currentRoute,{keep:true});}}, ic('heart'), saved.has(p.slug)?t('saved'):t('save')),
h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:function(){ printFactsheet(p); }}, ic('doc'), t('print_sheet'))),
h('div',{class:'notice notice--warn', style:'margin-top:16px'}, ic('info'), h('div',null, t('illustrative'))));
var asideWrap = h('div',null, aside,
askCard({project:p.slug, area:p.area, source:'project_aside',
prefill:(lang==='ar'?'مهتم بمشروع ':'Interested in ') + nm}));
var plogoSrc = projectLogoSrc(p);
var plogo = null;
if(plogoSrc){
var plimg = h('img',{class:'proj-logo', src:plogoSrc, alt:logoAlt(nm), decoding:'async', loading:'eager', width:200, height:64});
plimg.addEventListener('error', function(){ if(plimg.parentNode) plimg.parentNode.removeChild(plimg); });
plogo = h('div',{class:'proj-logo-wrap'}, plimg);
}
wrap.appendChild(h('div',{class:'detail-hero'},
h('div',null,
media,
plogo,
h('h1',{style:'font-size:clamp(1.7rem,4vw,2.6rem);margin-top:'+(plogo?'12px':'20px')}, nm),
h('div',{class:'card__dev card__dev--logo', style:'margin-top:8px'},
devLogoInline(dev,26),
h('span',null, h('a',{href:U(buildPath('developer',{slug:dev.key}))}, L(dev.name)), ' · ', h('a',{href:U(buildPath('area',{slug:area.key}))}, L(area.name)))),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:14px'},
((p.tags && (lang==='ar'?p.tags.ar:p.tags.en)) || []).map(function(x){return h('span',{class:'chip'},x);})),
(function(){
var chev=sEl('svg',{class:'accordion__chev',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}, sEl('path',{d:'M6 9l6 6 6-6'}));
var sum=h('summary',{class:'accordion__sum'}, h('h2',{class:'accordion__title'}, t('overview')), chev);
return h('details',{class:'accordion'}, sum,
h('div',{class:'accordion__body'}, h('p',{class:'muted', style:'max-width:60ch'}, L(p.blurb))));
})(),
h('h2',{style:'font-size:1.3rem;margin-top:28px;margin-bottom:12px'}, t('facts')),
facts, deliveryTimeline(p)),
h('div',null, asideWrap)));
top.appendChild(wrap); node.appendChild(top);
var pAmen = projectAmenitiesSection(p); if(pAmen) node.appendChild(pAmen);
var pBro = projectBrochureSection(p);                    if(pBro)  node.appendChild(pBro);
var pPlan = projectPlanSection(p);                       if(pPlan) node.appendChild(pPlan);
var pFeat= featureCardsSection(projFeatures(p.slug), L({en:p.name, ar:p.name_ar}));
if(pFeat) node.appendChild(pFeat);
track('project_viewed', {project:p.slug});
if(typeof leadArm==='function') leadArm();
if(COMING_SOON_LAUNCH.link === p.slug){
var lsec=h('section',{class:'section--tight'}), lsw=h('div',{class:'wrap'});
lsw.appendChild(sectionHead(t('nav_launches'), t('home_launch_h'), t('home_launch_p')));
lsw.appendChild(comingSoonLaunch(false));
lsec.appendChild(lsw); node.appendChild(lsec);
}
var typesEn=(p.types && p.types.en) ? p.types.en.split(' · ') : [];
var utsec=h('section',{class:'section--tight band'}), utw=h('div',{class:'wrap'});
utw.appendChild(sectionHead('', t('unit_types_h'), t('unit_types_p')));
if(typesEn.length){
var trow=h('div',{class:'type-row'});
typesEn.forEach(function(te){ var c=normalizeUnitType(te); trow.appendChild(h('div',{class:'type-chip'}, typeIconC(c), h('span',null, typeLabelC(c)))); });
utw.appendChild(trow);
}
var us=unitsIn(p.slug);
if(us.length){
utw.appendChild(h('h3',{style:'font-size:1.25rem;margin:28px 0 10px'}, t('avail_units')));
var asum=availSummary(us); if(asum) utw.appendChild(asum);
utw.appendChild(h('div',{class:'grid grid--3'}, us.map(unitCard)));
} else if(!typesEn.length){
utw.appendChild(h('p',{class:'muted',style:'margin:4px 0 0'}, ic('info'), h('span',null,' '+t('awaiting_list'))));
}
utw.appendChild(h('p',{class:'muted',style:'font-size:.78rem;margin-top:16px'}, t('art_note')));
utsec.appendChild(utw); node.appendChild(utsec);
var rel = projInArea(p.area).filter(function(x){return x.slug!==p.slug;}).slice(0,3);
if(rel.length) node.appendChild(listSection('', t('related'), '', rel.map(projectCard), null, 'band'));
node.appendChild(ctaBand());
return {node:node, title:nm+' — '+L(dev.name)+' · The Village Investment', desc:projectDesc(p, dev, area),
indexable:true, ld:listingLD(p),
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_projects'),path:buildPath('projects')},{label:nm}]};
};
var TWINS={};
function unitTitleTwin(u){
var c = TWINS[lang];
if(!c){
c = TWINS[lang] = {};
UNITS.forEach(function(x){
var k = x.project+'|'+unitDisplayName(x, unitTypeLabel(x))+'|'+areaValue(x);
c[k] = (c[k]||0) + 1;
});
}
return c[u.project+'|'+unitDisplayName(u, unitTypeLabel(u))+'|'+areaValue(u)] > 1;
}
function unitListingLD(u){
var p=projBySlug(u.project), dev=devByKey(p.dev), area=areaByKey(p.area);
var acc={ '@type':['Product', unitAccType(u)],
'name': L({en:p.name,ar:p.name_ar})+' · '+unitTypeLabel(u),
'category': u.type, 'brand':{'@type':'Organization','name':L(dev.name)},
'address':{'@type':'PostalAddress','addressRegion':L(area.name),'addressCountry':'EG'},
'isPartOf':{'@type':'Residence','name':L({en:p.name,ar:p.name_ar}),'url':CONFIG.origin+buildPath('project',{slug:p.slug},lang)} };
if(!unitIsCommercial(u)){
if(u.beds!=null)  acc.numberOfRooms=u.beds;
if(u.baths!=null) acc.numberOfBathroomsTotal=u.baths;
}
if(u.area!=null){ acc.floorSize={'@type':'QuantitativeValue','value':u.area,'unitCode':'MTK'};
if(u.areaTo>u.area){ acc.floorSize.minValue=u.area; acc.floorSize.maxValue=u.areaTo; } }
var off={ '@type':'Offer','priceCurrency':'EGP','availability':offerAvailability(p,u),'seller':{'@id':CONFIG.origin+'/#org'} };
if(u.price!=null) off.price=u.price;
acc.offers=off;
return acc;
}
V.unit = function(id){
var u=unitById(id); if(!u) return V.notfound();
var p=projBySlug(u.project), dev=devByKey(p.dev), area=areaByKey(p.area);
var pnm=lang==='ar'?p.name_ar:p.name, tl=unitTypeLabel(u);
var uLabel=unitDisplayName(u, tl);
var title=uLabel+' · '+pnm;
var av=areaValue(u);
var stem=title+(av ? (' · '+av+' m²') : '');
var pageTitle=(unitTitleTwin(u) || !av) ? (stem+' · '+u.id) : stem;
var node=h('div',null), top=h('section',{class:'section--tight'}), wrap=h('div',{class:'wrap'});
wrap.appendChild(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_units'),path:buildPath('units')},{label:title}]));
var galItems=unitGalleryItems(u);
var uChip=h('div',{class:'tags'}, h('span',{class:'chip'}, typeIconC(unitCanon(u),'chip-ico'), tl));
var media = galItems.length
? galleryHero(galItems, pnm+' — '+tl, pnm, uChip, function(){ return projectArt(p); })
: h('div',{class:'detail-media'}, unitMedia(u), uChip);
var aside=h('aside',{class:'aside-card'},
h('div',{class:'muted',style:'font-size:.8rem;font-weight:700'}, t('price')),
h('div',{class:'price-lg'}, money(u.price)),
provBadge(),
h('div',{style:'margin-top:10px'}, availBadge(u)),
h('div',{class:'spec-row',style:'margin-top:12px'},
unitIsCommercial(u)?null:spec('bed',u.beds, lang==='ar'?'غرف':'beds'), unitIsCommercial(u)?null:spec('bath',u.baths, lang==='ar'?'حمام':'baths'), spec('area', areaValue(u), 'm²')),
h('div',{class:'card__foot',style:'margin-top:16px;flex-wrap:wrap'},
h('a',{class:'btn btn--primary',href:U(buildPath('contact'))+'?p='+p.slug+'&u='+encodeURIComponent(u.id)}, t('cta_talk')),
CONFIG.whatsapp ? h('a',{class:'btn btn--wa',href:waLink(unitWaMsg(u)),target:'_blank',rel:'noopener'}, ic('wa'), t('whatsapp')) : null),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px'},
h('a',{class:'btn btn--ghost btn--sm',href:U(buildPath('project',{slug:p.slug}))}, (lang==='ar'?'عرض المشروع':'View project')),
compareBtn(u.id),
h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:function(){ printUnitFactsheet(u); }}, ic('doc'), t('print_sheet'))),
h('div',{class:'notice notice--warn',style:'margin-top:16px'}, ic('info'), h('div',null, t('illustrative'))));
var facts=h('table',{class:'fact-table'});
[[(lang==='ar'?'النوع':'Type'), tl],[t('developer'),L(dev.name)],[t('area'),L(area.name)],
[(lang==='ar'?'غرف النوم':'Bedrooms'), u.beds!=null?num(u.beds):'—', unitIsCommercial(u)],
[(lang==='ar'?'الحمامات':'Bathrooms'), u.baths!=null?num(u.baths):'—', unitIsCommercial(u)],
[(lang==='ar'?'المساحة':'Area'), areaText(u)],
[t('delivery'), (function(){
var d = u.handover || p.delivery;
return (d==='Ready'||d==='Delivered') ? t('ready') : (d||t('to_confirm'));
})()],
[t('dp'),    (function(){ var d=unitDpPct(u); return d ? num(d)+'%' : ''; })()],
[t('years'), (function(){ var y=unitYears(u); return y ? num(y)+' '+(lang==='ar'?'سنوات':'years') : ''; })()]]
.forEach(function(r){ if(r[2] || !r[1]) return;
facts.appendChild(h('tr',null,h('th',{scope:'row'},r[0]),h('td',null,r[1]))); });
wrap.appendChild(h('div',{class:'detail-hero'},
h('div',null, media,
h('h1',{style:'font-size:clamp(1.6rem,3.6vw,2.4rem);margin-top:20px'}, title),
h('div',{class:'umeta',style:'margin-top:10px'},
h('a',{class:'umeta__item', href:U(buildPath('area',{slug:area.key})), title:t('area')}, ic('pin','umeta__ic'), h('span',null,L(area.name))),
h('a',{class:'umeta__item', href:U(buildPath('developer',{slug:dev.key})), title:t('developer')}, ic('build','umeta__ic'), h('span',null,L(dev.name))),
h('span',{class:'umeta__item', title:t('type')}, typeIconC(unitCanon(u),'umeta__ic'), h('span',null,tl))),
unitFeatureRow(u),
h('h2',{style:'font-size:1.3rem;margin-top:28px;margin-bottom:12px'}, t('facts')), facts),
h('div',null, aside, askCard({project:p.slug, area:p.area, source:'unit_aside', prefill:(lang==='ar'?'مهتم بـ ':'Interested in ') + uLabel + ' · ' + pnm}))));
top.appendChild(wrap); node.appendChild(top);
var amen=amenitiesSection(u); if(amen) node.appendChild(amen);
track('unit_viewed',{unit:u.id});
var recoType=unitCanon(u), recoTl=typeLabelC(recoType);
var recoTitle=(lang==='ar' ? ('وحدات '+recoTl+' متاحة') : ('Available '+recoTl+' units'));
var recos=UNITS.filter(function(x){ var a=unitAvail(x); return x.id!==u.id && unitCanon(x)===recoType && a!=='sold' && a!=='soldout' && a!=='sold-out'; });
recos.sort(function(a,b){ var pa=(a.price==null)?9e18:Math.abs(a.price-(u.price||0)); var pb=(b.price==null)?9e18:Math.abs(b.price-(u.price||0)); return pa-pb; });
recos=recos.slice(0,12);
if(recos.length){
node.appendChild(listSection('', recoTitle, '', recos.map(unitCard), null, 'band'));
} else {
var noSec=h('section',{class:'section--tight band'}), noW=h('div',{class:'wrap'});
noW.appendChild(sectionHead('', recoTitle, ''));
noW.appendChild(h('p',{class:'muted', style:'margin-top:4px'}, t('no_units_type')));
noSec.appendChild(noW); node.appendChild(noSec);
}
node.appendChild(ctaBand());
var desc=uLabel+' — '+pnm+(lang==='ar'?'، ':', ')+L(area.name)+'. '+(u.price!=null?(t('conf_illustrative')+' '+money(u.price)+'. '):'')+t('finder_p');
return {node:node, title:pageTitle+' — The Village Investment', desc:desc, indexable:true, ld:unitListingLD(u),
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_units'),path:buildPath('units')},{label:title}]};
};
var FACET_PEEK = 3;
function facetChips(group, opts){
var row=h('div',{class:'facet-row'});
var live=opts.filter(function(o){ return o.count || FILTER[group].indexOf(o.v)>-1; });
var chips=live.map(function(o){
var active=FILTER[group].indexOf(o.v)>-1;
var b=h('button',{class:'fchip'+(active?' on':''), type:'button', id:'fchip-'+group+'-'+o.v, 'aria-pressed':active?'true':'false'},
o.icon||null, h('span',null,o.label), h('small',null,'('+num(o.count||0)+')'));
b.addEventListener('click', function(){ finderToggle(group, o.v); });
return {el:b, active:active};
});
if(!chips.length){ row.appendChild(h('span',{class:'muted',style:'font-size:.8rem'}, '—')); return row; }
var shown=0;
chips.forEach(function(c){ if(shown<FACET_PEEK || c.active){ c.el.classList.add('is-peek'); shown++; } });
var hidden=chips.filter(function(c){ return !c.el.classList.contains('is-peek'); }).length;
chips.forEach(function(c){ row.appendChild(c.el); });
if(!hidden) return row;
var wrap=h('div',null, row);
var more=h('button',{class:'facet-more', type:'button', id:'facet-more-'+group,
'aria-expanded':'false', 'aria-controls':'facet-row-'+group},
h('span',null, t('facet_more').replace('{n}', num(hidden))), ic('chevdown','facet-more__ic'));
row.setAttribute('id','facet-row-'+group);
row.classList.add('is-clipped');
more.addEventListener('click', function(){
var open=row.classList.toggle('is-clipped')===false;
more.setAttribute('aria-expanded', open?'true':'false');
more.firstChild.textContent = open ? t('facet_less') : t('facet_more').replace('{n}', num(hidden));
more.classList.toggle('is-open', open);
});
wrap.appendChild(more);
return wrap;
}
function fgroup(title, node, key){
var head=h('div',{class:'facet-head'}, h('h4',null,title));
if(key && FILTER[key] && FILTER[key].length){
var r=h('button',{class:'facet-reset', type:'button'}, t('cta_reset'));
r.addEventListener('click', function(){ FILTER[key]=[]; finderApply(); });
head.appendChild(r);
}
return h('div',{class:'facet-group'}, head, node);
}
function bedsLabel(v){ if(v==='tbc') return lang==='ar'?'قيد التأكيد':'To confirm'; if(v===0) return lang==='ar'?'استوديو':'Studio'; if(v===6) return lang==='ar'?'٦+ غرف':'6+ BR'; return num(v)+(lang==='ar'?' غرف':'BR'); }
function searchLabel(f){
var parts=[];
if(f.areas&&f.areas.length) parts.push(f.areas.map(function(k){var a=areaByKey(k);return a?L(a.name):k;}).join(' / '));
if(f.types&&f.types.length) parts.push(f.types.map(function(c){return typeLabelC(c);}).join(' / '));
if(f.beds&&f.beds.length) parts.push(f.beds.map(bedsLabel).join(' / '));
if(f.maxPrice) parts.push('≤ '+moneyM(f.maxPrice));
if(f.devs&&f.devs.length) parts.push(f.devs.map(function(k){var d=devByKey(k);return d?L(d.name):k;}).join(' / '));
return parts.length ? parts.join(' · ') : (lang==='ar'?'كل الوحدات الأولية':'All primary units');
}
function savedSearches(){ var v=load('tv_searches',[]); return Array.isArray(v)?v:[]; }
function saveCurrentSearch(){
var q=filterToQuery(FILTER)||'', list=savedSearches();
if(list.some(function(s){return s.q===q;})) return false;
list.unshift({q:q, label:searchLabel(FILTER)}); store('tv_searches', list.slice(0,8)); return true;
}
function removeSearch(q){ store('tv_searches', savedSearches().filter(function(s){return s.q!==q;})); }
function alertMsg(label){ return (lang==='ar'?'أرغب في تلقّي تنبيه عند توفّر وحدات أولية جديدة مطابقة لـ: ':'Please alert me when new primary units launch matching: ')+(label||searchLabel(FILTER)); }
function finderSearchBar(){
var inp=h('input',{type:'search', id:'finder-q', autocomplete:'off',
placeholder:t('finder_q_ph'), 'aria-label':t('finder_q_ph')});
var sug=h('div',{class:'fsb__sug', id:'finder-q-sug', role:'listbox', hidden:true});
function apply(d){
var f=defaultFilter();
if(d.type==='area') f.areas=[d.key];
else if(d.type==='developer') f.devs=[d.key];
else if(d.type==='project') f.projects=[d.key];
else { navigateTo(buildPath('search')+'?q='+encodeURIComponent(inp.value.trim())); return; }
f.mode=FILTER.mode; FILTER=f; finderApply();
}
function close(){ clear(sug); sug.hidden=true; }
inp.addEventListener('input', function(){
var q=inp.value.trim(); clear(sug);
if(q.length<2){ sug.hidden=true; return; }
var hits=searchAll(q).filter(function(d){
return d.type==='area'||d.type==='developer'||d.type==='project'; }).slice(0,6);
if(!hits.length){ sug.hidden=true; return; }
hits.forEach(function(d){
var b=h('button',{class:'fsb__opt', type:'button', role:'option'},
ic(d.icon||'search','fsb__opt-ic'),
h('span',null, d.title),
h('em',null, searchTypeOne(d.type)));
b.addEventListener('click', function(){ close(); apply(d); });
sug.appendChild(b);
});
sug.hidden=false;
});
inp.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
var form=h('form',{class:'fsb', role:'search'},
h('span',{class:'fsb__ic'}, ic('search')), inp, sug);
form.addEventListener('submit', function(e){
e.preventDefault(); var q=inp.value.trim(); if(!q) return;
var hit=searchAll(q).filter(function(d){
return d.type==='area'||d.type==='developer'||d.type==='project'; })[0];
close(); apply(hit || {type:'free'});
});
return h('div',{class:'fsb-row'}, form,
h('a',{class:'btn btn--ghost btn--sm fsb__switch', href:U(buildPath('projects'))},
ic('layers'), t('switch_projects')));
}
V.units = function(){
FILTER = filterFromQuery(CUR.search); reconcileFilter();
var af=areaFacets(), df=devFacets(), pf=projFacets(), tf=typeFacets(), bf=bedFacets(), ff=floorFacets(), lf=launchFacets(), avf=availFacets(), delf=deliveryFacets();
var mode=FILTER.mode||'strict';
var strictList=filterUnits(FILTER);
var list = (mode==='strict') ? sortUnits(strictList) : recommendUnits(FILTER, mode);
var projSet={}; list.forEach(function(u){ projSet[u.project]=1; }); var projCount=Object.keys(projSet).length;
var node=h('div',null);
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_units')}]),
sectionHead(t('hero_kicker'), t('finder_h'), t('finder_p'), 'h1'),
finderSearchBar()));
var panel=h('div',{class:'finder-panel', id:'finder-panel'});
panel.appendChild(fgroup(t('filter_area'), facetChips('areas', AREAS.map(function(a){return {v:a.key,label:L(a.name),count:af[a.key]||0};})), 'areas'));
panel.appendChild(fgroup(t('filter_dev'), facetChips('devs', DEVELOPERS.map(function(d){return {v:d.key,label:L(d.name),count:df[d.key]||0};})), 'devs'));
panel.appendChild(fgroup(t('nav_projects'), facetChips('projects', PROJECTS.map(function(p){return {v:p.slug,label:(lang==='ar'?p.name_ar:p.name),count:pf[p.slug]||0};})), 'projects'));
panel.appendChild(fgroup(t('filter_type'), facetChips('types', TYPES.map(function(tp){return {v:tp.c,label:typeLabelC(tp.c),icon:typeIconC(tp.c),count:tf[tp.c]||0};})), 'types'));
panel.appendChild(fgroup(t('beds'), facetChips('beds', [0,1,2,3,4,5,6,'tbc'].map(function(v){return {v:v,label:bedsLabel(v),count:bf[v]||0};})), 'beds'));
if(Object.keys(ff).length){
var fwrap=h('div',null);
fwrap.appendChild(facetChips('floors', FLOOR_BANDS.map(function(fb){return {v:fb,label:(lang==='ar'?FLOOR_LABELS[fb].ar:FLOOR_LABELS[fb].en),count:ff[fb]||0};})));
var ag=h('input',{type:'checkbox', id:'avoid-ground', style:'width:18px;height:18px'}); if(FILTER.avoidGround) ag.checked=true;
ag.addEventListener('change', function(){ FILTER.avoidGround=ag.checked; pendingFocusId='avoid-ground'; finderApply(); });
fwrap.appendChild(h('label',{class:'toggle-line', for:'avoid-ground', style:'margin-top:8px'}, ag, t('avoid_ground')));
panel.appendChild(fgroup(t('filter_floor'), fwrap));
}
var bwrap=h('div',null);
var brow=h('div',{class:'facet-row'});
BUDGET_PRESETS.forEach(function(pr){
var on=FILTER.minPrice===pr[0] && FILTER.maxPrice===pr[1];
var lab = pr[0]==null ? (lang==='ar'?'أقل من ٣ م':'Under 3M') : pr[1]==null ? (lang==='ar'?'٢٠ م+':'20M+') : (moneyM(pr[0])+'–'+moneyM(pr[1]));
var b=h('button',{class:'fchip'+(on?' on':''), type:'button'}, lab);
b.addEventListener('click', function(){ if(on){FILTER.minPrice=null;FILTER.maxPrice=null;} else {FILTER.minPrice=pr[0];FILTER.maxPrice=pr[1];} finderApply(); });
brow.appendChild(b);
});
bwrap.appendChild(brow);
var minI=h('input',{type:'number',inputmode:'numeric',placeholder:t('min_price'),value:FILTER.minPrice!=null?FILTER.minPrice:'','aria-label':t('min_price')});
var maxI=h('input',{type:'number',inputmode:'numeric',placeholder:t('max_price'),value:FILTER.maxPrice!=null?FILTER.maxPrice:'','aria-label':t('max_price')});
function commitBudget(){ FILTER.minPrice=minI.value?+minI.value:null; FILTER.maxPrice=maxI.value?+maxI.value:null; finderApply(); }
minI.addEventListener('change', commitBudget); maxI.addEventListener('change', commitBudget);
bwrap.appendChild(h('div',{class:'budget-inputs'}, minI, maxI));
var afM=h('input',{type:'number',inputmode:'numeric',placeholder:t('afford_monthly'),'aria-label':t('afford_monthly')});
var afD=h('input',{type:'number',inputmode:'numeric',value:'10','aria-label':t('calc_dp')});
var afY=h('input',{type:'number',inputmode:'numeric',value:'8','aria-label':t('calc_years')});
var afOut=h('div',{class:'afford-out','aria-live':'polite'});
function afMax(){ var m=+afM.value||0, D=Math.min(90,Math.max(0,+afD.value||0)), Y=Math.max(1,+afY.value||1);
return m>0 ? Math.round(m*Y*12/(1-D/100)) : null; }
function afRender(){ clear(afOut); var mx=afMax();
if(mx){ afOut.appendChild(h('span',{class:'muted'}, t('afford_upto')+' ')); afOut.appendChild(h('b',null, money(mx))); } }
[afM,afD,afY].forEach(function(i){ i.addEventListener('input', afRender); });
var afBtn=h('button',{type:'button', class:'btn btn--ghost btn--sm btn--block', style:'margin-top:10px'}, t('afford_apply'));
afBtn.addEventListener('click', function(){ var mx=afMax(); if(mx){ FILTER.maxPrice=mx; finderApply(); } });
afRender();
bwrap.appendChild(h('details',{class:'afford'},
h('summary',null, t('afford_h')),
h('div',{class:'afford-body'},
field2(t('afford_monthly'), afM),
h('div',{class:'field-row',style:'margin-top:8px'}, field2(t('calc_dp'), afD), field2(t('calc_years'), afY)),
afOut, afBtn,
h('div',{class:'prov',style:'margin-top:8px'}, ic('info'), t('calc_note')))));
var tbc=h('input',{type:'checkbox', id:'inc-tbc', style:'width:18px;height:18px'}); if(FILTER.includeUnverified) tbc.checked=true;
tbc.addEventListener('change', function(){ FILTER.includeUnverified=tbc.checked; finderApply(); });
bwrap.appendChild(h('label',{class:'toggle-line', for:'inc-tbc'}, tbc, t('inc_tbc')));
var yrsSel=h('select',{id:'finder-years','aria-label':t('filter_years')},
[h('option',{value:''}, t('years_any'))].concat(YEARS_PRESETS.map(function(n){
return h('option', FILTER.minYears===n?{value:String(n),selected:true}:{value:String(n)}, t('years_min_n').replace('{n}', num(n))); })));
yrsSel.addEventListener('change', function(){ FILTER.minYears=yrsSel.value?+yrsSel.value:null; pendingFocusId='finder-years'; finderApply(); });
bwrap.appendChild(h('div',{class:'field',style:'margin-top:10px'}, h('label',{for:'finder-years',style:'font-size:.82rem;color:var(--ink-2);display:block;margin-bottom:5px'}, t('filter_years')), yrsSel));
panel.appendChild(fgroup(t('filter_budget'), bwrap));
panel.appendChild(fgroup(t('launch_status'), facetChips('launch', ['newly-launched','available'].map(function(s){return {v:s,label:(lang==='ar'?LAUNCH_LABELS[s].ar:LAUNCH_LABELS[s].en),count:lf[s]||0};})), 'launch'));
panel.appendChild(fgroup(t('availability'), facetChips('avail', ['available','limited','to-confirm'].map(function(s){return {v:s,label:(lang==='ar'?AVAIL_LABELS[s].ar:AVAIL_LABELS[s].en),count:avf[s]||0};})), 'avail'));
panel.appendChild(fgroup(t('delivery'), facetChips('delivery', ['ready','within-1-year','within-2-years','within-3-4-years','later','to-confirm'].map(function(s){return {v:s,label:(lang==='ar'?DELIVERY_LABELS[s].ar:DELIVERY_LABELS[s].en),count:delf[s]||0};})), 'delivery'));
var results=h('div',null);
var rhead=h('div',{class:'results-head'});
rhead.appendChild(h('div',{class:'rc','aria-live':'polite'}, num(list.length)+' '+(lang==='ar'?'وحدة':'units')+' · '+num(projCount)+' '+(lang==='ar'?'مشروع':'projects')));
var sortSel=h('select',{id:'finder-sort','aria-label':t('filter_sort')},
[['recommended','sort_feat'],['price-asc','sort_price_a'],['price-desc','sort_price_d'],['earliest-delivery','sort_delivery'],['newest','sort_newest']]
.map(function(o){ return h('option', FILTER.sort===o[0]?{value:o[0],selected:true}:{value:o[0]}, t(o[1])); }));
sortSel.addEventListener('change', function(){ FILTER.sort=sortSel.value; pendingFocusId='finder-sort'; finderApply(); });
if(mode==='strict') rhead.appendChild(sortSel);
var rActions=h('div',{class:'rhead-actions'});
var saveSearchBtn=h('button',{class:'btn btn--ghost btn--sm', type:'button'}, ic('heart'), t('save_search'));
saveSearchBtn.addEventListener('click', function(){ if(saveCurrentSearch()) toast(t('search_saved')); finderApply(); });
rActions.appendChild(saveSearchBtn);
if(CONFIG.whatsapp) rActions.appendChild(h('a',{class:'btn btn--wa btn--sm', href:waLink(alertMsg()), target:'_blank', rel:'noopener'}, ic('wa'), t('get_alerts')));
rhead.appendChild(rActions);
results.appendChild(rhead);
results.appendChild(modeSelector(mode));
var active=activeFilterChips();
if(active.length){
var af2=h('div',{class:'active-filters',style:'margin-bottom:16px'});
active.forEach(function(a){ af2.appendChild(a); });
af2.appendChild(h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:function(){ FILTER=defaultFilter(); finderApply(); }}, t('cta_reset')));
results.appendChild(af2);
}
var ss=savedSearches();
if(ss.length){
var ssWrap=h('div',{class:'saved-searches'});
ssWrap.appendChild(h('span',{class:'ss-lbl'}, ic('heart'), t('saved_searches')));
ss.forEach(function(s){
var chip=h('span',{class:'ss-chip'});
chip.appendChild(h('a',{href:U(buildPath('units'))+(s.q?('?'+s.q):'')}, s.label));
var rm=h('button',{class:'ss-x', type:'button','aria-label':t('rm_search')}, '×');
rm.addEventListener('click', function(e){ e.preventDefault(); removeSearch(s.q); finderApply(); });
chip.appendChild(rm); ssWrap.appendChild(chip);
});
results.appendChild(ssWrap);
}
if(mode==='strict' && activeCriteriaCount(FILTER)>0 && strictList.length<4){
var plan=relaxationPlan(FILTER);
if(plan.length || strictList.length===0) results.appendChild(relaxPanel(plan, strictList.length));
}
if(mode!=='strict') results.appendChild(h('div',{class:'notice notice--info',style:'margin-bottom:16px'}, ic('spark'),
h('div',null, mode==='balanced'?t('reco_balanced_note'):t('reco_flexible_note'))));
if(list.length){
var grid=h('div',{class:'grid grid--2'});
list.forEach(function(u){ grid.appendChild(mode==='strict'?unitCard(u):recoCard(u)); });
results.appendChild(grid);
} else results.appendChild(h('div',{class:'state'}, ic('search'), h('h3',null,t('noresults')), h('p',null,t('finder_none')),
h('div',{style:'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px'},
h('button',{class:'btn btn--primary', type:'button', onclick:function(){ FILTER=defaultFilter(); finderApply(); }}, t('cta_reset')),
h('a',{class:'btn btn--ghost', href:U(buildPath('contact'))}, t('cta_talk')))));
results.appendChild(h('p',{class:'muted',style:'font-size:.78rem;margin-top:16px'}, t('art_note')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'});
var fToggle=h('button',{class:'finder-toggle', id:'finder-toggle', type:'button', 'aria-controls':'finder-panel', 'aria-expanded':finderFiltersOpen?'true':'false'},
ic('filter'), h('span',null, t('filters')+(active.length?(' · '+num(active.length)):'')), h('span',{class:'ft-caret','aria-hidden':'true'}, '⌄'));
var finderEl=h('div',{class:'finder'+(finderFiltersOpen?' finder--open':'')}, fToggle, panel, results);
fToggle.addEventListener('click', function(){ finderFiltersOpen=!finderFiltersOpen; finderEl.classList.toggle('finder--open', finderFiltersOpen); fToggle.setAttribute('aria-expanded', finderFiltersOpen?'true':'false'); });
sec.appendChild(h('div',{class:'wrap'}, finderEl));
node.appendChild(sec);
node.appendChild(ctaBand());
return {node:node, title:t('finder_h')+' · The Village Investment', desc:t('finder_p'), indexable:true,
ld: unitsCollectionLD(),
announce: num(list.length)+' '+(lang==='ar'?'وحدة':'units')+' · '+num(projCount)+' '+(lang==='ar'?'مشروع':'projects'),
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_units')}]};
};
function modeSelector(mode){
var wrap=h('div',{class:'mode-seg', role:'group','aria-label':t('reco_mode')});
wrap.appendChild(h('span',{class:'mode-seg__lbl'}, t('reco_mode')));
RECO_MODES.forEach(function(m){
var on=(mode===m);
var b=h('button',{class:'mode-seg__btn'+(on?' on':''), id:'mode-'+m, type:'button','aria-pressed':on?'true':'false'}, lang==='ar'?RECO_LABELS[m].ar:RECO_LABELS[m].en);
b.addEventListener('click', function(){ if(!on) setMode(m); });
wrap.appendChild(b);
});
return wrap;
}
function recoCard(u){
var card=unitCard(u);
var sc=scoreUnit(u, FILTER);
if(sc.crit.length){
var strip=h('div',{class:'reco-explain'});
sc.matched.slice(0,4).forEach(function(c){ if(c.label) strip.appendChild(h('span',{class:'rx rx--ok'}, ic('check'), c.label)); });
sc.missed.slice(0,2).forEach(function(c){ if(c.label) strip.appendChild(h('span',{class:'rx rx--no'}, c.label)); });
var body=card.querySelector('.card__body'); if(body) body.appendChild(strip);
}
return card;
}
function relaxPanel(plan, strictN){
var box=h('div',{class:'relax-panel'});
box.appendChild(h('div',{class:'relax-h'}, ic('spark'), h('strong',null, strictN===0?t('reco_zero_h'):t('reco_few_h'))));
if(plan.length){
box.appendChild(h('p',{class:'muted',style:'font-size:.85rem;margin:6px 0 10px'}, t('reco_relax_p')));
var row=h('div',{class:'facet-row'});
plan.slice(0,4).forEach(function(s){
var b=h('button',{class:'fchip', type:'button'}, ic('close'), h('span',null, s.label), h('small',null,'+'+num(s.gain)));
b.addEventListener('click', function(){ clearFilterKey(s.key); });
row.appendChild(b);
});
box.appendChild(row);
}
box.appendChild(h('button',{class:'btn btn--primary btn--sm', type:'button', style:'margin-top:12px', onclick:function(){ setMode('balanced'); }}, ic('spark'), t('reco_see_near')));
return box;
}
function activeFilterChips(){
var out=[];
function push(group, v, label){ var tag=h('span',{class:'filter-tag'}, label, h('button',{type:'button','aria-label':t('cta_reset')+': '+label},'×'));
tag.querySelector('button').addEventListener('click', function(){ finderToggle(group, v); }); out.push(tag); }
FILTER.areas.forEach(function(v){ push('areas', v, L(areaByKey(v).name)); });
FILTER.devs.forEach(function(v){ push('devs', v, L(devByKey(v).name)); });
FILTER.projects.forEach(function(v){ var p=projBySlug(v); push('projects', v, lang==='ar'?p.name_ar:p.name); });
FILTER.types.forEach(function(v){ push('types', v, typeLabelC(v)); });
FILTER.beds.forEach(function(v){ push('beds', v, bedsLabel(v)); });
FILTER.floors.forEach(function(v){ push('floors', v, lang==='ar'?FLOOR_LABELS[v].ar:FLOOR_LABELS[v].en); });
FILTER.launch.forEach(function(v){ push('launch', v, lang==='ar'?LAUNCH_LABELS[v].ar:LAUNCH_LABELS[v].en); });
FILTER.avail.forEach(function(v){ push('avail', v, lang==='ar'?AVAIL_LABELS[v].ar:AVAIL_LABELS[v].en); });
FILTER.delivery.forEach(function(v){ push('delivery', v, lang==='ar'?DELIVERY_LABELS[v].ar:DELIVERY_LABELS[v].en); });
if(FILTER.minPrice!=null||FILTER.maxPrice!=null){ var lab=(FILTER.minPrice!=null?moneyM(FILTER.minPrice):'0')+'–'+(FILTER.maxPrice!=null?moneyM(FILTER.maxPrice):'∞');
var tag=h('span',{class:'filter-tag'}, lab, h('button',{type:'button','aria-label':t('cta_reset')},'×'));
tag.querySelector('button').addEventListener('click', function(){ FILTER.minPrice=null; FILTER.maxPrice=null; finderApply(); }); out.push(tag); }
function pushOne(label, onRemove){ var tag=h('span',{class:'filter-tag'}, label, h('button',{type:'button','aria-label':t('cta_reset')+': '+label},'×'));
tag.querySelector('button').addEventListener('click', onRemove); out.push(tag); }
if(FILTER.avoidGround) pushOne(t('avoid_ground'), function(){ FILTER.avoidGround=false; finderApply(); });
if(FILTER.minYears!=null) pushOne(t('years_min_n').replace('{n}', num(FILTER.minYears)), function(){ FILTER.minYears=null; finderApply(); });
if(FILTER.maxDp!=null) pushOne((lang==='ar'?'مقدم حتى ':'Down ≤ ')+moneyM(FILTER.maxDp), function(){ FILTER.maxDp=null; finderApply(); });
return out;
}
V.investors = function(){
var AUD=[
{t:{en:'GCC investors',ar:'مستثمرو الخليج'}, i:{en:'Buyers across Saudi Arabia, the UAE, Kuwait, Qatar, Bahrain and Oman shortlist Egypt primary-sale units and reserve remotely. We compare options in your timezone and confirm figures with the developer before you commit.',ar:'يرشّح مشترون من السعودية والإمارات والكويت وقطر والبحرين وعُمان وحدات البيع الأولي في مصر ويحجزون عن بُعد. نقارن الخيارات بتوقيتك ونؤكّد الأرقام مع المطوّر قبل أي التزام.'},
s:{en:['Shortlist projects and unit types that fit your goal and budget.','Ask an advisor for the developer’s current price list and payment plan in writing.','Confirm reservation terms and the developer’s process before any payment.','Review transfer, power-of-attorney and residency questions with a licensed professional.'],ar:['رشّح المشروعات وأنواع الوحدات المناسبة لهدفك وميزانيتك.','اطلب من المستشار قائمة أسعار المطوّر الحالية وخطة السداد كتابةً.','أكّد شروط الحجز وإجراء المطوّر قبل أي دفعة.','راجع مسائل التحويل والتوكيل والإقامة مع مختصّ مرخّص.']}},
{t:{en:'Overseas buyers',ar:'المشترون بالخارج'}, i:{en:'Investors in Europe, the UK, North America and beyond can compare Egypt areas, developers and payment plans remotely, then reserve under the developer’s process. Legal and tax questions depend on your country and should be reviewed with a professional.',ar:'يستطيع المستثمرون في أوروبا والمملكة المتحدة وأمريكا الشمالية وغيرها مقارنة مناطق مصر والمطوّرين وخطط السداد عن بُعد، ثم الحجز وفق إجراء المطوّر. وتعتمد المسائل القانونية والضريبية على بلدك وتُراجَع مع مختصّ.'},
s:{en:['Compare areas and developers using the finder and developer pages.','Request current figures and a written reservation offer from an advisor.','Arrange payment and reservation under the developer’s documented process.','Confirm ownership, transfer and tax steps with a licensed professional for your country.'],ar:['قارن المناطق والمطوّرين عبر المحرّك وصفحات المطوّرين.','اطلب الأرقام الحالية وعرض حجز مكتوباً من المستشار.','رتّب الدفع والحجز وفق إجراء المطوّر الموثّق.','أكّد خطوات الملكية والتحويل والضرائب مع مختصّ مرخّص في بلدك.']}},
{t:{en:'Egyptians abroad',ar:'المصريون بالخارج'}, i:{en:'Egyptians living abroad often reserve primary units to hold or for family. A power of attorney can let a trusted person or professional complete local steps on your behalf; the exact method should be confirmed with the developer and a professional.',ar:'يحجز المصريون بالخارج غالباً وحدات أولية للاحتفاظ أو للعائلة. ويتيح التوكيل لشخص موثوق أو مختصّ إتمام الخطوات محلياً نيابةً عنك، وتُؤكَّد الطريقة الدقيقة مع المطوّر ومختصّ.'},
s:{en:['Shortlist and confirm current developer terms with an advisor.','Prepare a power of attorney if someone will complete steps locally.','Reserve under the developer’s process and keep written confirmations.','Confirm transfer and documentation with a licensed professional.'],ar:['رشّح وأكّد شروط المطوّر الحالية مع المستشار.','جهّز توكيلاً إن كان أحد سيُتمّ الخطوات محلياً.','احجز وفق إجراء المطوّر واحتفظ بالتأكيدات المكتوبة.','أكّد التحويل والمستندات مع مختصّ مرخّص.']}}
];
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('investors_h')}]),
sectionHead(t('hero_kicker'), t('investors_h'), t('investors_p'), 'h1')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}), w=h('div',{class:'wrap'});
AUD.forEach(function(a){
var ol=h('ol',{class:'prose',style:'padding-inline-start:22px;margin-top:12px'});
(lang==='ar'?a.s.ar:a.s.en).forEach(function(s){ ol.appendChild(h('li',null,s)); });
w.appendChild(h('div',{class:'card',style:'padding:24px;margin-bottom:18px'},
h('div',{style:'display:flex;gap:12px;align-items:center'},
h('div',{style:'width:44px;height:44px;border-radius:12px;background:var(--teal-050);color:var(--teal-700);display:grid;place-items:center'}, ic('globe')),
h('h2',{style:'font-size:1.35rem'}, L(a.t))),
h('p',{class:'muted',style:'margin-top:12px;max-width:66ch'}, L(a.i)),
ol,
h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('contact'))}, t('cta_talk'))));
});
w.appendChild(h('div',{class:'notice notice--warn'}, ic('info'), h('div',null, t('invest_note'))));
sec.appendChild(w); node.appendChild(sec); node.appendChild(ctaBand());
track('country_page_view');
return {node:node, title:t('investors_h')+' · The Village Investment', desc:t('investors_p'), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('investors_h')}]};
};
V.developers = function(){
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_developers')}]),
sectionHead(t('hero_kicker'), t('home_dev_h'), t('home_dev_p'), 'h1')));
node.appendChild(h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}, h('div',{class:'wrap'},
h('div',{class:'grid grid--2'}, DEVELOPERS.map(devCard)),
h('p',{class:'muted',style:'font-size:.78rem;margin-top:20px'}, t('devmark_note')))));
node.appendChild(ctaBand());
return {node:node, title:t('nav_developers')+' · The Village Investment', desc:t('home_dev_p'), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_developers')}]};
};
V.developer = function(key){
var d = devByKey(key), ps = projByDev(key), node=h('div',null);
var grps = groupsByDev(key);
var devCards = ps.filter(function(p){ return !GROUPED_PROJECT[p.slug]; }).map(projectCard).concat(grps.map(groupCard));
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_developers'),path:buildPath('developers')},{label:L(d.name)}]),
devGalleryStrip(d),
h('div',{class:'detail-hero'},
h('div',null,
devLogoLockup(d),
h('h1',{style:'font-size:clamp(1.8rem,4vw,2.6rem);margin-top:16px'}, L(d.name)),
h('p',{class:'lead', style:'margin-top:10px'}, L(d.tagline)),
h('p',{class:'muted', style:'margin-top:14px;max-width:60ch'}, L(d.desc)),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px'},
h('span',{class:'chip chip--muted'}, ic('pin'), L(d.areas)),
d.since ? h('span',{class:'chip chip--muted'}, (lang==='ar'?'منذ ':'Since ')+d.since) : null)),
h('aside',{class:'aside-card'},
h('div',{class:'muted', style:'font-weight:700;font-size:.85rem'}, t('by_dev')),
h('div',{class:'price-lg', style:'font-size:2.4rem'}, num(ps.length)),
h('div',{class:'prov'}, ic('info'), t('derived')),
h('a',{class:'btn btn--primary btn--block mt-16', href:U(buildPath('contact'))}, t('cta_talk'))))));
var mpSec = devMasterplanSection(d); if(mpSec) node.appendChild(mpSec);
var fcSec = devCardsSection(d);      if(fcSec) node.appendChild(fcSec);
var amSec = devAmenitiesSection(d);  if(amSec) node.appendChild(amSec);
var devUnits = UNITS.filter(function(u){ var p=projBySlug(u.project); return p && p.dev===key; });
if(ps.length===1 && devUnits.length){
var only = ps[0];
var onlyNm = L({en:only.name, ar:only.name_ar});
node.appendChild(listSection('', (lang==='ar' ? ('وحدات '+onlyNm) : ('Units in '+onlyNm)),
L(only.blurb), sortUnits(devUnits).map(unitCard),
{path:buildPath('project',{slug:only.slug}), label:t('cta_details')}, 'band'));
}
else if(devCards.length) node.appendChild(listSection('', t('by_dev'), '', devCards, null, 'band'));
else node.appendChild(h('section',{class:'section band'}, h('div',{class:'wrap'},
h('div',{class:'empty-state'}, h('div',{class:'empty-ico'}, ic('home')),
h('p',null, (lang==='ar'?'نضيف مشروعات '+L(d.name)+' حاليًا — تواصل مع مستشار لمعرفة المتاح الآن.':'We’re adding '+L(d.name)+'’s projects — talk to an advisor for current availability.')),
h('a',{class:'btn btn--primary', href:U(buildPath('contact'))}, t('cta_talk'))))));
node.appendChild(ctaBand());
return {node:node, title:L(d.name)+' — '+t('nav_developers')+' · The Village Investment', desc:devDesc(d), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_developers'),path:buildPath('developers')},{label:L(d.name)}]};
};
function releaseMasterplanBtn(r, label){
var items = releaseMasterplan(r); if(!items.length) return null;
var mp = (lang==='ar'?'الماستر بلان':'Master Plan');
var b = h('button',{class:'ufeat', type:'button'},
ic('masterplan','ufeat__ic'), h('span',null, mp));
b.addEventListener('click', function(){ mediaViewer(items, mp+' · '+label); });
return h('div',{class:'ufeat-row', style:'margin-top:12px'}, b);
}
function releaseCard(r, p){
var nm = L(p.name), dev = devByKey(r.dev), area = areaByKey(r.area);
var from = Math.min.apply(null, p.units.map(function(u){ return u.price; }));
var card = h('article',{class:'card'});
var img = h('img',{class:'artsvg proj-cover', src:p.img, alt:nm+' — '+L(r.name),
loading:'lazy', decoding:'async'});
var media = h('div',{class:'card__media'}, img,
h('div',{class:'tags'}, h('span',{class:'chip chip--rel'}, t('new_release'))));
media.appendChild(devChip(dev));
card.appendChild(media);
var specs = h('table',{class:'rel-table'});
specs.appendChild(h('tr',null,
h('th',{scope:'col'}, lang==='ar'?'الوحدة':'Unit'),
h('th',{scope:'col'}, lang==='ar'?'المساحة':'Area'),
h('th',{scope:'col'}, t('price'))));
p.units.forEach(function(u){
specs.appendChild(h('tr',null,
h('td',null, num(u.beds)+' '+(lang==='ar'?'غرف':'BR')
+ (u.baths!=null ? (' · '+num(u.baths)+' '+(lang==='ar'?'حمام':'ba')) : '')),
h('td',null, num(u.size)+' m²'),
h('td',{class:'rel-table__p'}, money(u.price))));
});
card.appendChild(h('div',{class:'card__body'},
h('div',{class:'card__dev'}, L(dev.name)),
h('h3',null, nm),
h('div',{class:'card__facts'},
h('span',null, ic('pin'), ' ', L(area.name)),
h('span',null, ic('key'), ' ', (lang==='ar'?'تسليم ':'Delivery ')+p.delivery)),
h('div',{class:'card__price'}, h('small',null, t('from')), money(from)),
(p.eoi!=null ? h('div',{class:'eoi', title:t('eoi_note')},
h('span',{class:'eoi__k'}, t('eoi')), h('b',{class:'eoi__v'}, money(p.eoi))) : null),
specs,
h('div',{class:'card__facts', style:'margin-top:10px'},
h('span',null, num(p.dp)+'% '+t('dp')),
h('span',null, num(p.years)+' '+(lang==='ar'?'سنوات':'years'))),
releaseMasterplanBtn(r, nm),
provBadge(),
h('div',{class:'card__foot'},
h('a',{class:'btn btn--primary btn--sm', href:U(buildPath('contact'))+'?p='+r.slug}, t('cta_talk')),
CONFIG.whatsapp ? h('a',{class:'btn btn--wa btn--sm btn--icon', href:waLink(
(lang==='ar'?'مهتم بـ ':'Interested in ')+nm+' — '+L(r.name)+' '+t('new_release')),
target:'_blank', rel:'noopener','aria-label':t('whatsapp')+' — '+nm}, ic('wa')) : null)));
return card;
}
V.release = function(slug){
var r = releaseBySlug(slug); if(!r) return V.notfound();
var nm = L(r.name), dev = devByKey(r.dev), node = h('div',null);
var cr = [{label:t('nav_home'),path:buildPath('home')},
{label:t('nav_launches'),path:buildPath('launches')},{label:nm}];
node.appendChild(sectionWrap(
crumbNode(cr),
h('div',{class:'rel-hero'},
h('span',{class:'chip chip--rel'}, t('new_release')),
h('h1',{style:'font-size:clamp(1.8rem,4vw,2.6rem);margin-top:12px'}, nm),
h('p',{class:'lead', style:'margin-top:10px'}, t('release_h')),
h('p',{class:'muted', style:'margin-top:12px;max-width:60ch'}, L(r.blurb)),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px'},
h('a',{class:'chip chip--muted', href:U(buildPath('developer',{slug:dev.key}))}, devLogoInline(dev,20), L(dev.name)),
h('span',{class:'chip chip--muted'}, ic('pin'), L(areaByKey(r.area).name))))));
node.appendChild(listSection('', t('release_units'), t('release_p'),
r.projects.map(function(p){ return releaseCard(r,p); }), null, 'band', 'grid--2'));
node.appendChild(ctaBand());
return {node:node, title:nm+' — '+t('new_release')+' · The Village Investment',
desc:L(r.blurb), indexable:true, crumbs:cr};
};
V.group = function(slug){
var g = groupBySlug(slug); if(!g) return V.notfound();
var dev = devByKey(g.dev), members = groupMembers(g), node=h('div',null);
var nm = L({en:g.name,ar:g.name_ar});
var cr = [{label:t('nav_home'),path:buildPath('home')},{label:t('nav_developers'),path:buildPath('developers')},{label:L(dev.name),path:buildPath('developer',{slug:dev.key})},{label:nm}];
var mediaFallback=function(){ return members[0]?projectMedia(members[0]):mediaBox(nm,'artsvg'); };
node.appendChild(sectionWrap(
crumbNode(cr),
h('div',{class:'detail-hero'},
h('div',null,
h('div',{class:'detail-media'}, g.cover?coverImg(g.cover, nm, mediaFallback):mediaFallback(),
h('div',{class:'tags'}, h('span',{class:'chip'}, L(dev.name)))),
h('h1',{style:'font-size:clamp(1.8rem,4vw,2.6rem);margin-top:16px'}, nm),
h('p',{class:'lead', style:'margin-top:10px'}, (lang==='ar'?'مجموعة مشاريع داخل ':'A project group within ')+L(dev.name)),
h('p',{class:'muted', style:'margin-top:14px;max-width:60ch'}, L(g.blurb)),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px'},
h('a',{class:'chip chip--muted', href:U(buildPath('developer',{slug:dev.key}))}, ic('build'), L(dev.name)),
h('span',{class:'chip chip--muted'}, num(members.length)+' '+(lang==='ar'?'مشروعات':'projects')))),
h('aside',{class:'aside-card'},
h('div',{class:'muted', style:'font-weight:700;font-size:.85rem'}, (lang==='ar'?'مشروعات المجموعة':'Projects in this group')),
h('div',{class:'price-lg', style:'font-size:2.4rem'}, num(members.length)),
h('div',{class:'prov'}, ic('info'), t('derived')),
h('a',{class:'btn btn--primary btn--block mt-16', href:U(buildPath('contact'))}, t('cta_talk'))))));
if(members.length) node.appendChild(listSection('', nm, '', members.map(projectCard), null, 'band'));
node.appendChild(ctaBand());
return {node:node, title:nm+' — '+L(dev.name)+' · The Village Investment', desc:L(g.blurb), indexable:true, crumbs:cr};
};
V.areas = function(){
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_areas')}]),
sectionHead(t('hero_kicker'), t('home_area_h'), t('home_area_p'), 'h1')));
node.appendChild(h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}, h('div',{class:'wrap'},
resultsHeading(t('nav_areas')), h('div',{class:'grid grid--3'}, AREAS.map(areaTile)))));
node.appendChild(ctaBand());
return {node:node, title:t('nav_areas')+' · The Village Investment',
desc:t('home_area_p') + countLine(PROJECTS.length,
Object.keys(PROJECTS.reduce(function(m,p){ m[p.dev]=1; return m; },{})).length),
indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_areas')}]};
};
V.area = function(key){
var a=areaByKey(key), ps=projInArea(key), from=areaFrom(key), node=h('div',null);
var locSrc=areaImageSrc(key);
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_areas'),path:buildPath('areas')},{label:L(a.name)}]),
h('div',null,
locSrc ? h('div',{class:'area-banner'}, coverImg(locSrc, L(a.name), function(){return h('div',{class:'pat'});}), h('div',{class:'area-banner__pin'}, ic('pin'), L(a.name))) : null,
h('h1',{style:'font-size:clamp(1.8rem,4vw,2.6rem)'}, L(a.name)),
h('p',{class:'lead', style:'margin-top:12px;max-width:62ch'}, L(a.blurb)),
h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px'},
h('span',{class:'chip chip--muted'}, num(ps.length)+' '+(lang==='ar'?'مشروع':'projects')),
from&&h('span',{class:'chip chip--muted'}, t('from')+' '+money(from))),
from&&h('div',{class:'prov', style:'margin-top:8px'}, ic('info'), t('derived')))));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}); var w=h('div',{class:'wrap'});
if(ps.length){ w.appendChild(resultsHeading()); w.appendChild(h('div',{class:'grid grid--3'}, ps.map(projectCard))); }
else w.appendChild(h('div',{class:'state'}, ic('pin'), h('h3',null,lang==='ar'?'لا مشروعات مُدرجة بعد':'No projects listed yet'), h('p',null,lang==='ar'?'تحدّث إلى مستشار لمعرفة الإطلاقات الحالية في هذه المنطقة.':'Talk to an advisor for current launches in this area.'), h('a',{class:'btn btn--primary mt-16', href:U(buildPath('contact'))}, t('cta_talk'))));
sec.appendChild(w); node.appendChild(sec);
node.appendChild(ctaBand());
return {node:node, title:L(a.name)+' — '+t('nav_areas')+' · The Village Investment', desc:areaDesc(a), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_areas'),path:buildPath('areas')},{label:L(a.name)}]};
};
V.compare = function(){
var items = compare.map(unitById).filter(Boolean), node=h('div',null);
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_compare')}]),
sectionHead('', t('cmp_h'), t('cmp_p'), 'h1')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}); var w=h('div',{class:'wrap'});
if(!items.length){
w.appendChild(h('div',{class:'state'}, ic('scale'), h('h3',null,t('cmp_empty')), h('p',null,t('cmp_empty_p')),
h('a',{class:'btn btn--primary mt-16', href:U(buildPath('units'))}, t('cta_explore'))));
} else {
var pOf=function(u){ return projBySlug(u.project); };
var rows = [
{k:(lang==='ar'?'المشروع':'Project'), f:function(u){var p=pOf(u);return lang==='ar'?p.name_ar:p.name;}},
{k:t('developer'), f:function(u){return L(devByKey(pOf(u).dev).name);}},
{k:t('area'), f:function(u){return L(areaByKey(pOf(u).area).name);}},
{k:t('type'), f:function(u){return unitTypeLabel(u);}},
{k:(lang==='ar'?'غرف النوم':'Bedrooms'), com:true, f:function(u){return u.beds!=null?num(u.beds):'—';}},
{k:(lang==='ar'?'الحمامات':'Bathrooms'), com:true, f:function(u){return u.baths!=null?num(u.baths):'—';}},
{k:(lang==='ar'?'المساحة':'Area'), f:function(u){return areaText(u);}},
{k:t('price'), f:function(u){return money(u.price);}},
{k:(lang==='ar'?'الإتاحة':'Availability'), f:function(u){return t((AVAIL_MAP[u.avail]||AVAIL_MAP['to-confirm'])[1]);}},
{k:t('dp'), f:function(u){var d=unitDpPct(u);return d?num(d)+'%':'—';}},
{k:t('years'), f:function(u){var y=unitYears(u);return y?(num(y)+' '+(lang==='ar'?'سنوات':'years')):'—';}},
{k:t('delivery'), f:function(u){var p=pOf(u);return p.delivery==='Ready'?t('ready'):(p.delivery||t('to_confirm'));}}
];
var table=h('table',{class:'cmp'});
var thead=h('tr',null,h('th',{scope:'col'},''));
items.forEach(function(u){
var p=pOf(u), nm=unitDisplayName(u);
var rm=h('button',{class:'btn btn--ghost btn--sm', type:'button', style:'margin-top:8px'}, '× '+t('back'));
rm.addEventListener('click', function(){ toggleCompare(u.id); render(parse(readLoc().path),{keep:false}); });
var th=h('th',{scope:'col'}, h('a',{href:U(buildPath('unit',{id:u.id}))}, nm),
h('div',{class:'muted', style:'font-size:.8rem;font-weight:500'}, lang==='ar'?p.name_ar:p.name), rm);
thead.appendChild(th);
});
table.appendChild(h('thead',null,thead));
var tb=h('tbody',null);
var allCom = items.length>0 && items.every(unitIsCommercial);
rows.forEach(function(r){
if(r.com && allCom) return;
var vals = items.map(r.f);
var differ = vals.some(function(v){return v!==vals[0];});
var tr=h('tr',null,h('th',{scope:'row'},r.k));
items.forEach(function(u,i){ tr.appendChild(h('td', differ?{class:'diff'}:null, vals[i])); });
tb.appendChild(tr);
});
table.appendChild(tb);
w.appendChild(h('div',{class:'cmp-wrap'}, table));
w.appendChild(h('div',{class:'prov', style:'margin-top:12px'}, ic('info'), t('illustrative')));
}
sec.appendChild(w); node.appendChild(sec);
node.appendChild(ctaBand());
return {node:node, title:t('cmp_h')+' · The Village Investment', desc:t('cmp_p'), indexable:false,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_compare')}]};
};
V.insights = function(){
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_insights')}]),
sectionHead('', t('insights_h'), t('insights_p'), 'h1')));
node.appendChild(h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}, h('div',{class:'wrap'},
h('div',{class:'grid grid--3'}, RESEARCH.map(function(r){
return h('a',{class:'card', href:U(buildPath('insight',{slug:r.slug})), style:'padding:20px'},
h('span',{class:'chip', style:'align-self:flex-start'}, L(r.cat)),
h('h3',{style:'margin-top:12px;font-size:1.15rem'}, L(r.title)),
h('p',{class:'muted', style:'margin-top:8px'}, L(r.excerpt)),
h('div',{class:'card__dev', style:'margin-top:14px'}, num(r.read)+' '+t('readmin')));
})))));
node.appendChild(ctaBand());
return {node:node, title:t('insights_h')+' · The Village Investment', desc:t('insights_p'), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_insights')}]};
};
V.insight = function(slug){
var r=null; RESEARCH.forEach(function(x){ if(x.slug===slug) r=x; });
var node=h('div',null);
var body=h('div',{class:'prose'});
L(r.body).forEach(function(par){ body.appendChild(h('p',null,par)); });
node.appendChild(sectionWrap(
crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_insights'),path:buildPath('insights')},{label:L(r.title)}]),
h('div',null,
h('span',{class:'chip'}, L(r.cat)),
h('h1',{style:'font-size:clamp(1.7rem,4vw,2.5rem);margin-top:14px;max-width:22ch'}, L(r.title)),
h('p',{class:'lead', style:'margin-top:12px'}, L(r.excerpt)),
h('hr',{class:'divider'}),
body,
h('div',{class:'notice notice--info mt-24'}, ic('info'), h('div',null,t('guide_note'))))));
node.appendChild(ctaBand());
return {node:node, title:L(r.title)+' · The Village Investment', desc:L(r.excerpt), indexable:false,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_insights'),path:buildPath('insights')},{label:L(r.title)}]};
};
function faqPageLD(){
var qs=[];
FAQ.forEach(function(g){ g.items.forEach(function(it){
qs.push({'@type':'Question','name':L(it.q),'acceptedAnswer':{'@type':'Answer','text':L(it.a)}});
}); });
return qs.length ? {'@type':'FAQPage','mainEntity':qs} : null;
}
V.faqs = function(){
var node=h('div',null);
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_faqs')}]),
sectionHead('', t('faqs_h'), t('faqs_p'), 'h1')));
var sec=h('section',{style:'padding-bottom:clamp(40px,7vw,80px)'}); var w=h('div',{class:'wrap', style:'max-width:820px'});
FAQ.forEach(function(g){
w.appendChild(h('h2',{style:'font-size:1.3rem;margin:26px 0 12px'}, L(g.label)));
g.items.forEach(function(it){ w.appendChild(accordion(L(it.q), L(it.a))); });
});
sec.appendChild(w); node.appendChild(sec);
node.appendChild(ctaBand());
return {node:node, title:t('faqs_h')+' · The Village Investment', desc:t('faqs_p'), indexable:true,
ld:faqPageLD(),
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_faqs')}]};
};
function accordion(q,a){
var panel=h('div',{class:'panel'}, h('div',null,h('p',null,a)));
var btn=h('button',{type:'button','aria-expanded':'false'}, h('span',null,q), h('span',{class:'ico','aria-hidden':'true'}, ic('plus')));
btn.addEventListener('click', function(){
var open = btn.getAttribute('aria-expanded')==='true';
btn.setAttribute('aria-expanded', open?'false':'true');
panel.style.maxHeight = open?'0':(panel.scrollHeight+30)+'px';
});
return h('div',{class:'acc'}, btn, panel);
}
V.about = function(){
var node=h('div',null); var body=h('div',{class:'prose'});
ABOUT[lang].forEach(function(p){ body.appendChild(h('p',null,p)); });
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_about')}]),
h('div',null, h('h1',{style:'font-size:clamp(1.9rem,4.4vw,2.8rem)'}, t('about_h')), h('hr',{class:'divider'}), body,
h('div',{class:'notice notice--info mt-24'}, ic('shield'), h('div',null, t('brand_note'))))));
node.appendChild(ctaBand());
return {node:node, title:t('about_h')+' · The Village Investment', desc:ABOUT[lang][0], indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_about')}]};
};
V.contact = function(){
var node=h('div',null);
var qs=new URLSearchParams(CUR.search), pre=qs.get('p');
var w=h('div',{class:'wrap', style:'max-width:720px'});
w.appendChild(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:t('nav_contact')}]));
w.appendChild(sectionHead('', t('contact_h'), t('contact_p'), 'h1'));
var channels=h('div',{style:'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px'});
if(CONFIG.phone) channels.appendChild(h('a',{class:'btn btn--ghost', href:'tel:'+CONFIG.phone}, ic('phone'), CONFIG.phoneDisplay||CONFIG.phone));
if(CONFIG.whatsapp) channels.appendChild(h('a',{class:'btn btn--wa', href:waLink(lang==='ar'?'مرحباً، أرغب في الاستفسار عن عقارات The Village':'Hello, I would like to enquire about The Village properties'), target:'_blank', rel:'noopener'}, ic('wa'), t('whatsapp')));
if(CONFIG.email) channels.appendChild(h('a',{class:'btn btn--ghost', href:'mailto:'+CONFIG.email}, ic('doc'), CONFIG.email));
if(channels.childNodes.length) w.appendChild(channels);
else w.appendChild(h('div',{class:'notice notice--warn', style:'margin-bottom:18px'}, ic('info'), h('div',null,t('contact_blocked'))));
var summary=h('div',{class:'notice notice--warn', role:'alert', style:'display:none;margin-bottom:16px'});
var form=h('form',{novalidate:true});
form.appendChild(summary);
if(pre && projBySlug(pre)) form.appendChild(h('input',{type:'hidden',name:'project',value:pre}));
var fName=inputField('name', t('form_name'), 'text', {autocomplete:'name', required:true});
var fPhone=inputField('phone', t('form_phone'), 'tel', {autocomplete:'tel', inputmode:'tel', required:true});
var fEmail=inputField('email', t('form_email'), 'email', {autocomplete:'email', inputmode:'email'});
var fArea=h('div',{class:'field'}, h('label',{for:'c-area'},t('form_area')), h('select',{id:'c-area',name:'area'}, areaOptions(pre&&projBySlug(pre)?projBySlug(pre).area:'')));
var fMsg=h('div',{class:'field'}, h('label',{for:'c-message'},t('form_msg')), h('textarea',{id:'c-message',name:'message'}, pre&&projBySlug(pre)?((lang==='ar'?'مهتم بمشروع ':'Interested in ')+ (lang==='ar'?projBySlug(pre).name_ar:projBySlug(pre).name)):''));
var consentWrap=h('label',{class:'field', style:'flex-direction:row;align-items:flex-start;gap:10px;cursor:pointer'},
h('input',{type:'checkbox', id:'c-consent', name:'consent', 'aria-describedby':'err-consent', style:'width:20px;height:20px;margin-top:3px;flex:none'}),
h('span',{style:'font-size:.9rem;color:var(--ink-2)'}, t('form_consent'), ' ', h('a',{href:U(buildPath('privacy')), style:'color:var(--teal-700);text-decoration:underline'}, t('legal_priv'))));
var submit=h('button',{class:'btn btn--primary btn--block', type:'submit', style:'margin-top:8px'}, t('form_send'));
form.appendChild(fName.wrap); form.appendChild(h('div',{class:'field-row'}, fPhone.wrap, fEmail.wrap));
var consentErr=h('div',{class:'field-err', id:'err-consent', style:'color:var(--danger);font-size:.8rem;display:none'});
form.appendChild(fArea); form.appendChild(fMsg); form.appendChild(consentWrap); form.appendChild(consentErr); form.appendChild(submit);
form.appendChild(h('div',{'aria-hidden':'true',
style:'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden'},
h('label',{for:'c-company'},'Company'),
h('input',{type:'text', id:'c-company', name:'company', tabindex:'-1', autocomplete:'off'})));
var openedAt = Date.now();
form.addEventListener('submit', function(e){
e.preventDefault();
var hp = form.querySelector('#c-company');
if((hp && hp.value) || (Date.now() - openedAt) < 3000){ track('lead_blocked'); return; }
handleLead(form, {name:fName,phone:fPhone,email:fEmail}, summary, submit);
});
w.appendChild(form);
node.appendChild(h('section',{class:'section--tight'}, w));
return {node:node, title:t('contact_h')+' · The Village Investment', desc:t('contact_p'), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:t('nav_contact')}]};
};
function inputField(id, label, type, attrs){
var input=h('input', Object.assign({id:'c-'+id, name:id, type:type}, attrs||{}));
var err=h('div',{class:'field-err', id:'err-'+id, style:'color:var(--danger);font-size:.8rem;display:none'});
input.setAttribute('aria-describedby','err-'+id);
var wrap=h('div',{class:'field'}, h('label',{for:'c-'+id}, label), input, err);
return {wrap:wrap, input:input, err:err};
}
var askSeq = 0;
function askCard(opts){
opts = opts || {};
var n = ++askSeq, id = function(k){ return 'ask' + n + '-' + k; };
var form = h('form',{class:'ask-card', novalidate:true});
var head = h('div',{class:'ask-card__head'},
h('span',{class:'ask-card__ic'}, ic('mail')),
h('h2',{class:'ask-card__h'}, t('ask_h')),
h('p',{class:'ask-card__p'}, t('ask_p')));
form.appendChild(head);
function field(k, label, type, attrs){
var input = h('input', Object.assign({id:id(k), name:k, type:type, placeholder:label,
'aria-label':label}, attrs||{}));
var err = h('div',{class:'field-err', id:'e-'+id(k), style:'display:none'});
input.setAttribute('aria-describedby','e-'+id(k));
return {wrap:h('div',{class:'field'}, input, err), input:input, err:err};
}
var fName  = field('name',  t('form_name'),  'text', {autocomplete:'name'});
var fPhone = field('phone', t('form_phone'), 'tel',  {autocomplete:'tel', inputmode:'tel'});
var sel    = h('select',{id:id('area'), name:'area','aria-label':t('form_area')},
areaOptions(opts.area || ''));
var msg    = h('textarea',{id:id('msg'), name:'message', rows:'2',
placeholder:t('form_msg'), 'aria-label':t('form_msg')},
opts.prefill || '');
var submit = h('button',{class:'btn btn--primary btn--block', type:'submit'}, t('ask_send'));
var note   = h('div',{class:'ask-card__note', role:'status'});
form.appendChild(fName.wrap);
form.appendChild(h('div',{class:'field'}, sel));
form.appendChild(fPhone.wrap);
form.appendChild(h('div',{class:'field'}, msg));
form.appendChild(submit);
form.appendChild(note);
form.appendChild(h('div',{'aria-hidden':'true',
style:'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden'},
h('input',{type:'text', id:id('company'), name:'company', tabindex:'-1', autocomplete:'off'})));
var openedAt = Date.now();
form.addEventListener('submit', function(e){
e.preventDefault();
var hp = form.querySelector('#' + id('company'));
if((hp && hp.value) || (Date.now() - openedAt) < 3000){ track('lead_blocked'); return; }
var ok = true;
function mark(f, bad){
f.err.textContent = bad || ''; f.err.style.display = bad ? 'block' : 'none';
if(bad){ f.input.setAttribute('aria-invalid','true'); ok = false; }
else f.input.removeAttribute('aria-invalid');
}
var nm = fName.input.value.trim(), ph = fPhone.input.value.trim();
mark(fName,  nm ? '' : t('err_req'));
mark(fPhone, !ph ? t('err_req') : (/^[+]?[\d\s()-]{7,}$/.test(ph) ? '' : t('err_phone')));
if(!ok){ (form.querySelector('[aria-invalid="true"]')||fName.input).focus(); return; }
var data = {name:nm, phone:ph, email:'', area:sel.value, message:msg.value,
locale:lang, source:opts.source || 'ask', project:opts.project || ''};
var done = function(sent){
note.className = 'ask-card__note ask-card__note--' + (sent ? 'ok' : 'warn');
note.textContent = sent ? t('ask_ok') : t('ask_fail');
submit.disabled = false; submit.textContent = t('ask_send');
if(sent){ form.reset(); track('lead_submitted', {source:data.source}); }
else track('lead_failed', {source:data.source});
};
submit.disabled = true; submit.textContent = t('form_sending');
if(CONFIG.LEAD_ENDPOINT && typeof fetch !== 'undefined'){
fetch(CONFIG.LEAD_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'},
body:JSON.stringify(data)})
.then(function(r){ if(!r.ok) throw new Error('bad'); done(true); })
.catch(function(){ done(false); });
} else {
var to = CONFIG.whatsapp;
var txt = (lang==='ar' ? 'استفسار من الموقع' : 'Website enquiry') + '%0A' +
encodeURIComponent(nm + ' · ' + ph + (data.project ? (' · ' + data.project) : '') +
(msg.value ? ('%0A' + msg.value) : ''));
try{ window.open('https://wa.me/' + to + '?text=' + txt, '_blank', 'noopener'); }catch(e){}
done(true);
}
});
return form;
}
function handleLead(form, fields, summary, submit){
var errs=[];
function setErr(f, msg){ if(msg){ f.err.textContent=msg; f.err.style.display='block'; f.input.setAttribute('aria-invalid','true'); errs.push(msg);} else { f.err.style.display='none'; f.input.removeAttribute('aria-invalid'); } }
setErr(fields.name, fields.name.input.value.trim()?'':t('err_req'));
var phone=fields.phone.input.value.trim();
setErr(fields.phone, !phone?t('err_req'):(/^[+]?[\d\s()-]{7,}$/.test(phone)?'':t('err_phone')));
var email=fields.email.input.value.trim();
setErr(fields.email, !email?'':(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'':t('err_email')));
var consentInput=form.querySelector('#c-consent'), consentErr=form.querySelector('#err-consent');
var consent=consentInput.checked, cerr=consentInput.closest('label');
if(!consent){ errs.push(t('err_consent')); consentInput.setAttribute('aria-invalid','true'); cerr.style.color='var(--danger)';
if(consentErr){ consentErr.textContent=t('err_consent'); consentErr.style.display='block'; } }
else { consentInput.removeAttribute('aria-invalid'); cerr.style.color=''; if(consentErr) consentErr.style.display='none'; }
if(errs.length){
summary.style.display='flex'; while(summary.firstChild) summary.removeChild(summary.firstChild);
summary.appendChild(ic('info'));
if(errs.length===1){ summary.appendChild(document.createTextNode(errs[0])); }
else { var ul=h('ul',{style:'margin:0;padding-inline-start:18px'}); errs.forEach(function(m){ ul.appendChild(h('li',null,m)); }); summary.appendChild(ul); }
var first=form.querySelector('[aria-invalid="true"]')||consentInput; if(first) first.focus();
return;
}
summary.style.display='none';
if(CONFIG.LEAD_ENDPOINT){
submit.disabled=true; submit.textContent=t('form_sending');
var data={name:fields.name.input.value.trim(),phone:phone,email:email,area:form.querySelector('#c-area').value,message:form.querySelector('#c-message').value,locale:lang};
fetch(CONFIG.LEAD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
.then(function(r){ if(!r.ok) throw new Error('bad'); return r; })
.then(function(){ leadResult(form, true); })
.catch(function(){ submit.disabled=false; submit.textContent=t('form_send'); leadResult(form, false); });
} else {
leadResult(form, null, {name:fields.name.input.value.trim(),phone:phone,email:email,area:form.querySelector('#c-area').value,message:form.querySelector('#c-message').value});
}
}
function leadResult(form, ok, details){
track(ok===false?'lead_failed':'lead_submitted');
var box=h('div',{class:'notice '+(ok===true?'notice--ok':ok===false?'notice--warn':'notice--info'), role:'status', style:'margin-top:16px'});
if(ok===true){ box.appendChild(ic('check')); box.appendChild(h('div',null, lang==='ar'?'تم استلام طلبك بنجاح. سيتواصل معك مستشار قريباً.':'Your request was received. An advisor will be in touch shortly.')); form.reset(); }
else if(ok===false){ box.appendChild(ic('info')); box.appendChild(h('div',null, lang==='ar'?'تعذّر إرسال الطلب الآن. برجاء المحاولة لاحقاً — لم نعرض رسالة نجاح زائفة.':'We could not send your request right now. Please try again later — we won’t show a fake success message.')); }
else {
var loc=lang==='ar';
var msg=(loc?'استفسار من موقع The Village':'Enquiry via The Village website')
+'\n'+(loc?'الاسم':'Name')+': '+details.name
+'\n'+(loc?'الهاتف':'Phone')+': '+details.phone
+(details.email?('\n'+(loc?'البريد':'Email')+': '+details.email):'')
+(details.area?('\n'+(loc?'المنطقة':'Area')+': '+details.area):'')
+(details.message?('\n'+(loc?'الطلب':'Message')+': '+details.message):'');
box.appendChild(ic('info'));
var row=h('div',{style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px'});
if(CONFIG.whatsapp) row.appendChild(h('a',{class:'btn btn--wa btn--sm', href:waLink(msg), target:'_blank', rel:'noopener'}, ic('wa'), t('send_wa')));
if(CONFIG.email) row.appendChild(h('a',{class:'btn btn--ghost btn--sm', href:'mailto:'+CONFIG.email+'?subject='+encodeURIComponent(loc?'استفسار عقاري':'Property enquiry')+'&body='+encodeURIComponent(msg)}, ic('doc'), t('send_email')));
row.appendChild(h('button',{class:'btn btn--ghost btn--sm', type:'button', onclick:function(){ copy(msg); }}, ic('doc'), t('lead_copy')));
box.appendChild(h('div',null, h('div',null, t('lead_handoff')), row));
}
form.appendChild(box); box.scrollIntoView({behavior:'smooth',block:'center'});
}
function copy(txt){ try{ navigator.clipboard.writeText(txt).then(function(){toast(t('copied'),'check');}); }catch(e){ toast(t('copied'),'check'); } }
V.privacy = function(){ return legalView('privacy'); };
V.terms = function(){ return legalView('terms'); };
function legalView(kind){
var L2=LEGAL[kind], node=h('div',null), body=h('div',{class:'prose'});
L2.body[lang].forEach(function(b){ body.appendChild(b[0]==='h'?h('h2',null,b[1]):h('p',null,b[1])); });
node.appendChild(sectionWrap(crumbNode([{label:t('nav_home'),path:buildPath('home')},{label:L(L2.title)}]),
h('div',null, h('h1',{style:'font-size:clamp(1.8rem,4vw,2.5rem)'}, L(L2.title)), h('hr',{class:'divider'}), body)));
return {node:node, title:L(L2.title)+' · The Village Investment', desc:L2.summary?L(L2.summary):L(L2.title), indexable:true,
crumbs:[{label:t('nav_home'),path:buildPath('home')},{label:L(L2.title)}]};
}
V.notfound = function(){
var node=h('section',{class:'section', style:'min-height:52vh;display:grid;place-items:center;text-align:center'},
h('div',{class:'wrap', style:'max-width:520px'},
h('div',{class:'eyebrow'}, '404'),
h('h1',{style:'font-size:clamp(1.8rem,5vw,3rem);margin-top:10px'}, t('p404_h')),
h('p',{class:'lead', style:'margin-top:14px'}, t('p404_p')),
h('div',{style:'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px'},
h('a',{class:'btn btn--primary', href:U(buildPath('home'))}, t('p404_home')),
h('a',{class:'btn btn--ghost', href:U(buildPath('projects'))}, t('cta_explore')))));
node.appendChild(ctaBand());
return {node:node, title:t('p404_h')+' · The Village Investment', desc:t('p404_p'), indexable:false, crumbs:[], is404:true};
};
function sectionWrap(){ var w=h('div',{class:'wrap'}); for(var i=0;i<arguments.length;i++){ if(arguments[i]) w.appendChild(arguments[i]); } return h('section',{class:'section--tight'}, w); }
var currentRoute=null;
var NAV=[['units','nav_search','search'],['launches','nav_launches','spark'],['about','nav_about','info'],['favorites','nav_favorites','heart'],['compare','nav_compare','scale']];
var NAV_GROUP={home:'',units:'units',unit:'units',project:'units',projects:'units',launches:'launches',developers:'developers',developer:'developers',areas:'areas',area:'areas',insights:'',insight:'',about:'about',favorites:'favorites',compare:'compare'};
function viewFor(r){
switch(r.name){
case 'home': return V.home();
case 'projects': return V.projects(null);
case 'units': return V.units();
case 'investors': return V.investors();
case 'search': return V.search();
case 'launches': return V.projects('launch');
case 'project': return V.project(r.params.slug);
case 'unit': return V.unit(r.params.id);
case 'developers': return V.developers();
case 'developer': return V.developer(r.params.slug);
case 'group': return V.group(r.params.slug);
case 'release': return V.release(r.params.slug);
case 'areas': return V.areas();
case 'area': return V.area(r.params.slug);
case 'compare': return V.compare();
case 'insights': return V.insights();
case 'insight': return V.insight(r.params.slug);
case 'faqs': return V.faqs();
case 'about': return V.about();
case 'favorites': return V.favorites();
case 'contact': return V.contact();
case 'privacy': return V.privacy();
case 'terms': return V.terms();
default: return V.notfound();
}
}
var footAccInit=false;
function setupFooterAccordions(){
if(footAccInit || typeof document==='undefined') return; footAccInit=true;
var faccs=document.querySelectorAll('.facc'); if(!faccs.length){ footAccInit=false; return; }
var openByDefault=(typeof matchMedia!=='undefined') ? matchMedia('(min-width:720px)').matches : true;
Array.prototype.forEach.call(faccs, function(fa){
var head=fa.querySelector('.facc__head'); if(!head) return;
if(openByDefault){ fa.classList.add('is-open'); head.setAttribute('aria-expanded','true'); }
head.addEventListener('click', function(){
var open=fa.classList.toggle('is-open'); head.setAttribute('aria-expanded', open?'true':'false');
});
});
}
function updateChrome(r){
setupFooterAccordions();
Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function(el){ el.textContent=t(el.getAttribute('data-i18n')); });
var pn=document.getElementById('primary-nav'); clear(pn);
var dn=document.getElementById('drawer-nav'); clear(dn);
var group=NAV_GROUP[r.name]||'';
var onHome=(r.name==='home');
var homeA=h('a',{href:U(buildPath('home')), class:'nav-home'+(onHome?' is-active':''), 'aria-label':t('nav_home'), title:t('nav_home')}, ic('home'), h('span',{class:'nav-home__lbl'}, t('nav_home')));
if(onHome) homeA.setAttribute('aria-current','page');
pn.appendChild(homeA);
var homeA2=h('a',{href:U(buildPath('home')), class:'nav-home nav-home--drawer'+(onHome?' is-active':'')}, ic('home'), h('span',null, t('nav_home')));
if(onHome) homeA2.setAttribute('aria-current','page');
dn.appendChild(homeA2);
NAV.forEach(function(it){
var lbl=t(it[1]) + (it[0]==='compare' && compare.length ? (' ('+num(compare.length)+')') : '');
var a=h('a',{href:U(buildPath(it[0])), class:'nav-item', title:t(it[1])}, ic(it[2],'nav-item__ic'), h('span',{class:'nav-item__lbl'}, lbl)); if(group===it[0]) a.setAttribute('aria-current','page'); pn.appendChild(a);
var a2=h('a',{href:U(buildPath(it[0])), class:'nav-item'}, ic(it[2],'nav-item__ic'), h('span',null, lbl)); if(group===it[0]) a2.setAttribute('aria-current','page'); dn.appendChild(a2);
if(it[1]==='nav_search'){ a2.addEventListener('click', function(){ closeDrawer(); }); }
});
dn.appendChild(h('a',{href:U(buildPath('investors')), class:'nav-item'}, ic('build','nav-item__ic'), h('span',null, t('nav_investors'))));
dn.appendChild(h('a',{href:U(buildPath('faqs')), class:'nav-item'}, ic('info','nav-item__ic'), h('span',null, t('nav_faqs'))));
fill('foot-explore',[['projects','nav_projects'],['units','nav_units'],['launches','nav_launches'],['areas','nav_areas'],['developers','nav_developers'],['compare','nav_compare']]);
fill('foot-company',[['about','nav_about'],['investors','nav_investors'],['insights','nav_insights'],['faqs','nav_faqs'],['contact','nav_contact']]);
fill('foot-legal',[['privacy','legal_priv'],['terms','legal_terms']]);
var ftag=document.getElementById('foot-tag'); if(ftag) ftag.remove();
var fblk=document.getElementById('foot-blocker'); if(fblk) fblk.remove();
document.getElementById('foot-copy').textContent='© '+new Date().getFullYear()+' The Village Investment';
var lt=document.getElementById('lang-toggle'); lt.textContent=lang==='en'?'ع':'EN'; lt.setAttribute('aria-label', lang==='en'?'التبديل إلى العربية':'Switch to English');
document.getElementById('lang-toggle-2').textContent=t('choose_lang');
setHref(document.querySelector('header .brand'), buildPath('home'));
setHref(document.querySelector('.nav-actions a.btn--primary'), buildPath('contact'));
setHref(document.querySelector('#drawer a.btn--primary'), buildPath('contact'));
var mbContact=document.querySelector('#mobile-bar a.btn--primary'); if(mbContact) mbContact.setAttribute('href', U(buildPath('contact')));
var waMsg = lang==='ar' ? 'مرحباً، أرغب في الاستفسار عن عقارات The Village' : 'Hello, I would like to enquire about The Village properties';
var waH=document.getElementById('wa-header'), waM=document.getElementById('wa-mobile');
if(CONFIG.whatsapp){ if(waH){ waH.setAttribute('href', waLink(waMsg)); waH.style.display=''; } if(waM){ waM.setAttribute('href', waLink(waMsg)); waM.style.display=''; } }
else { if(waH) waH.style.display='none'; if(waM) waM.style.display='none'; }
renderSocial();
if(chatEls) chatRefresh();
}
function renderSocial(){
var fc=document.getElementById('foot-contact');
if(fc){ clear(fc);
if(CONFIG.phone) fc.appendChild(h('a',{href:'tel:'+CONFIG.phone}, ic('phone'), h('span',null, CONFIG.phoneDisplay||CONFIG.phone)));
if(CONFIG.email) fc.appendChild(h('a',{href:'mailto:'+CONFIG.email}, ic('mail'), h('span',null, CONFIG.email))); }
var host=document.getElementById('foot-social'); if(!host) return; clear(host);
var nets=[['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn'],['tiktok','TikTok']];
nets.forEach(function(n){
var url=CONFIG.social && CONFIG.social[n[0]];
var el = url ? h('a',{href:url, target:'_blank', rel:'noopener','aria-label':n[1]}, ic(n[0]))
: h('span',{class:'off','aria-label':n[1]+' — '+(lang==='ar'?'قيد الإضافة':'link pending'), title:n[1]}, ic(n[0]));
host.appendChild(el);
});
}
function fill(id, arr){ var c=document.getElementById(id); if(!c) return; clear(c); arr.forEach(function(it){ c.appendChild(h('a',{href:U(buildPath(it[0]))}, t(it[1]))); }); }
function clear(n){ while(n && n.firstChild) n.removeChild(n.firstChild); }
function setHref(a,p){ if(a) a.setAttribute('href', U(p)); }
function setHead(r, view){
document.title=view.title;
setMeta('description', view.desc);
var canonLg=r.lang||lang;
var canonical=CONFIG.origin+buildPath(r.name,r.params,canonLg);
if(view.is404){
var cur = FILEMODE ? (location.hash?location.hash.slice(1):('/'+canonLg+'/')) : (stripBase(location.pathname)+(location.search||''));
if(cur.charAt(0)!=='/') cur='/'+cur;
canonical = CONFIG.origin+cur;
setAttr('lnk-canonical','href',canonical);
setAttr('lnk-alt-en','href',canonical); setAttr('lnk-alt-ar','href',canonical); setAttr('lnk-alt-x','href',canonical);
} else {
setAttr('lnk-canonical','href',canonical);
setAttr('lnk-alt-en','href',CONFIG.origin+buildPath(r.name,r.params,'en'));
setAttr('lnk-alt-ar','href',CONFIG.origin+buildPath(r.name,r.params,'ar'));
setAttr('lnk-alt-x','href',CONFIG.origin+buildPath(r.name,r.params,'en'));
}
setAttr('meta-robots','content', view.indexable?'index,follow,max-image-preview:large':'noindex,follow');
setAttr('og-title','content',view.title); setAttr('og-desc','content',view.desc);
setAttr('og-url','content',canonical);
setAttr('og-locale','content',lang==='ar'?'ar_EG':'en_US');
setAttr('og-locale-alt','content',lang==='ar'?'en_US':'ar_EG');
setAttr('tw-title','content',view.title); setAttr('tw-desc','content',view.desc);
var graph=[];
if(view.crumbs && view.crumbs.length){
graph.push({'@type':'BreadcrumbList','itemListElement':view.crumbs.map(function(c,i){
var o={'@type':'ListItem','position':i+1,'name':c.label}; if(c.path) o.item=CONFIG.origin+c.path; return o; })});
}
if(view.ld){
var lds = Array.isArray(view.ld) ? view.ld : [view.ld];
lds.forEach(function(o,i){ if(o) graph.push(i===0 ? Object.assign({'url':canonical}, o) : o); });
}
setLD({'@context':'https://schema.org','@graph':graph});
}
function setMeta(name,val){ var m=document.querySelector('meta[name="'+name+'"]'); if(m) m.setAttribute('content',val||''); }
function setAttr(id,attr,val){ var e=document.getElementById(id); if(e) e.setAttribute(attr,val); }
function setLD(obj){ var s=document.getElementById('ld-page'); if(s) s.textContent=JSON.stringify(obj); }
function routeKey(r){ return r ? (r.name+'|'+JSON.stringify(r.params||{})) : ''; }
function render(r, opts){
opts=opts||{};
var samePage = opts.keep===true || (currentRoute!=null && routeKey(currentRoute)===routeKey(r));
var keepY = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
currentRoute=r; lang=r.lang||lang;
var de=document.documentElement;
de.setAttribute('lang',lang); de.setAttribute('dir', lang==='ar'?'rtl':'ltr'); de.setAttribute('data-lang',lang);
document.querySelector('meta[name="theme-color"]').setAttribute('content', r.name==='home'?'#073D52':'#faf7f0');
var view=viewFor(r);
var main=document.getElementById('main'); clear(main); main.appendChild(view.node);
updateChrome(r); setHead(r, view);
closeDrawer();
if(view.announce){ var sr=document.getElementById('sr-live'); if(sr) sr.textContent=view.announce; }
if(typeof railRefresh==='function') railRefresh();
if(typeof updateCompareFab==='function') updateCompareFab();
if(pendingFocusId){ var fe=document.getElementById(pendingFocusId); pendingFocusId=null; if(fe){ try{ fe.focus({preventScroll:true}); }catch(e){ fe.focus(); } } }
if(samePage){
try{ window.scrollTo(0, keepY); }catch(e){}
} else {
try{ window.scrollTo(0, 0); }catch(e){}
try{ main.focus({preventScroll:true}); }catch(e){ try{ main.focus(); }catch(_){} }
}
}
function readLoc(){
if(FILEMODE){
var hs=location.hash.slice(1);
if(!hs) return {path:'/en/', search:''};
var qi=hs.indexOf('?');
return qi<0?{path:hs,search:''}:{path:hs.slice(0,qi),search:hs.slice(qi)};
}
return {path:location.pathname, search:location.search};
}
function route(){
var loc=readLoc(); CUR.search=loc.search;
var r=parse(loc.path);
if(r.redirect){
if(FILEMODE){ CUR.search=''; if(location.hash!=='#/en/'){ location.hash='#/en/'; return; } }
else { replaceURL(U('/en/')); }
r={name:'home',lang:'en',params:{}};
}
if(r.params && r.params.moved){
delete r.params.moved;
replaceURL(U(buildPath('project',{slug:r.params.slug}, r.lang)) + (CUR.search||''));
}
render(r);
}
function navigateTo(dest, replace){
var qi=dest.indexOf('?'); var pathOnly=qi<0?dest:dest.slice(0,qi); var search=qi<0?'':dest.slice(qi);
var r=parse(pathOnly); var keep=replace===true && r.name===(currentRoute&&currentRoute.name);
if(FILEMODE){
CUR.search=search;
var nh='#'+pathOnly+search;
if(location.hash===nh){ render(r,{keep:keep}); } else { location.hash=nh; }
return;
}
var url=U(pathOnly)+search;
if(replace) replaceURL(url); else pushURL(url);
CUR.search=search; render(r,{keep:keep});
}
function isExternalLink(href, target){
if(!href || href.charAt(0)==='#') return false;
if(/^(mailto:|tel:)/.test(href)) return false;
if(!/^https?:\/\//i.test(href)) return false;
if(/wa\.me|whatsapp/i.test(href)) return true;
var appOrigin = (typeof location!=='undefined' && location.origin) ? location.origin : '';
if(target!=='_blank' && appOrigin && href.indexOf(appOrigin)===0) return false;
return true;
}
function openExternal(href){
var win=null; try{ win=window.open(href, '_blank'); }catch(e){}
if(win){ try{ win.opener=null; }catch(e2){} }
else { try{ window.location.href=href; }catch(e3){} }
}
document.addEventListener('click', function(e){
var a=e.target.closest && e.target.closest('a'); if(!a) return;
var href=a.getAttribute('href'); if(!href) return;
if(a.hasAttribute('download')) return;
var isWa=/wa\.me|whatsapp/i.test(href);
if(isWa){ track('whatsapp_clicked'); if(typeof leadArm==='function') leadArm(); }
else if(href.indexOf('tel:')===0){ track('phone_clicked'); if(typeof leadArm==='function') leadArm(); }
else if(href.indexOf('mailto:')===0){ track('email_clicked'); if(typeof leadArm==='function') leadArm(); }
if(/^(mailto:|tel:)/.test(href) || href.charAt(0)==='#') return;
if(isExternalLink(href, a.target)){ e.preventDefault(); openExternal(href); return; }
e.preventDefault(); navigateTo(stripBase(a.pathname) + (a.search||''));
});
if(FILEMODE) window.addEventListener('hashchange', route);
else window.addEventListener('popstate', route);
function switchLang(){ var r=parse(readLoc().path); var other=lang==='en'?'ar':'en';
navigateTo(buildPath(r.name==='404'?'home':r.name, r.params, other) + (CUR.search||'')); }
document.getElementById('lang-toggle').addEventListener('click', switchLang);
document.getElementById('lang-toggle-2').addEventListener('click', switchLang);
var drawer=document.getElementById('drawer'), dback=document.getElementById('drawer-back'), burger=document.getElementById('burger');
function openDrawer(){ drawer.classList.add('open'); dback.classList.add('open'); drawer.setAttribute('aria-hidden','false'); burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; document.getElementById('drawer-close').focus(); }
function closeDrawer(){ var wasOpen=drawer.classList.contains('open'), hadFocus=drawer.contains(document.activeElement); drawer.classList.remove('open'); dback.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; if(wasOpen && hadFocus){ try{ burger.focus(); }catch(e){} } }
burger.addEventListener('click', openDrawer);
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
dback.addEventListener('click', closeDrawer);
document.addEventListener('keydown', function(e){ if(e.key==='Escape' && drawer.classList.contains('open')) closeDrawer(); });
var toastTimer=null;
function toast(msg, icon){
var host=document.getElementById('toast-host'); clear(host);
var el=h('div',{class:'toast'}, icon?ic(icon):null, msg); host.appendChild(el);
requestAnimationFrame(function(){ el.classList.add('show'); });
clearTimeout(toastTimer); toastTimer=setTimeout(function(){ el.classList.remove('show'); setTimeout(function(){ clear(host); },250); }, 3000);
}
route();
chatBuild();
searchInit();
contactRailBuild();
(function intro(){
var el=document.getElementById('intro'); if(!el || !el.classList) return;
var reduce=false; try{ reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
var seen=false; try{ seen=window.sessionStorage && window.sessionStorage.getItem('tvi_intro')==='1'; }catch(e){}
var closed=false;
function done(){
if(closed) return; closed=true;
try{ if(window.sessionStorage) window.sessionStorage.setItem('tvi_intro','1'); }catch(e){}
el.classList.add('intro--hide');
setTimeout(function(){ if(el && el.parentNode) el.parentNode.removeChild(el); }, 700);
}
if(reduce || seen){ done(); return; }
setTimeout(done, 1750);
var skip=document.getElementById('intro-skip');
if(skip && skip.addEventListener) skip.addEventListener('click', done);
try{ document.addEventListener('keydown', function(ev){ if(ev.key==='Escape'||ev.keyCode===27) done(); }); }catch(e){}
})();