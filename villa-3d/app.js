/* ---------------------------------------------------------------------------
   VDLC Villa B — viewer: renderer, sun, orbit camera, view presets and UI.
--------------------------------------------------------------------------- */
'use strict';

(function () {
  var T = THREE, V = VILLA, S = V.S, M = V.M;

  V.initTextures();
  V.initMaterials();

  /* ------------------------------------------------------------ renderer */
  var canvas = document.getElementById('view');
  var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(46, 1, 0.15, 900);

  /* ---------------------------------------------------------------- sky */
  function skyTexture(top, bottom) {
    var c = V.cv(4, 256), g = c.getContext('2d');
    var grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, top); grd.addColorStop(0.62, bottom); grd.addColorStop(1, bottom);
    g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
    var t = new T.CanvasTexture(c);
    t.mapping = T.EquirectangularReflectionMapping;
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  var skyDay = skyTexture('#5E9FD4', '#DCD9C6');
  var skyDusk = skyTexture('#22304F', '#D08A56');
  var skyNight = skyTexture('#070E1E', '#1A2340');

  /* Image-based lighting from the same gradient: without it the cane, brass
     and water have nothing to reflect and every surface reads as matte card. */
  var pmrem = new T.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  var envDay = pmrem.fromEquirectangular(skyDay).texture;
  var envDusk = pmrem.fromEquirectangular(skyDusk).texture;
  var envNight = pmrem.fromEquirectangular(skyNight).texture;

  /* ------------------------------------------------------------ lighting */
  var hemi = new T.HemisphereLight(0xCFE3F2, 0xC6B79A, 0.55);
  scene.add(hemi);

  /* A little omnidirectional lift. Rooms are lit through one or two openings
     and the sun does not reach far inside them; without this the interiors
     read as caves whenever the camera goes indoors. */
  var amb = new T.AmbientLight(0xE8E2D4, 0.35);
  scene.add(amb);

  var sun = new T.DirectionalLight(0xFFF2DC, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  var fill = new T.DirectionalLight(0xBBD4E8, 0.35);
  fill.position.set(-24, 16, -20);
  scene.add(fill);

  /* Warm interior/garden lamps, only alive at night. */
  var lamps = [];
  function addLamp(x, y, z, colour, intensity, dist) {
    // physically-correct lights are on, so point-light intensity is in candela:
    // the numbers passed in are "how bright it feels", scaled here.
    var l = new T.PointLight(colour || 0xFFC98A, 0, dist || 9, 2);
    l.position.set(x, y, z);
    l.userData.max = (intensity || 1.0) * 5.5;
    lamps.push(l); scene.add(l);
    return l;
  }

  /* --------------------------------------------------------- build model */
  var world = new T.Group();
  scene.add(world);

  var site = LANDSCAPE.build();
  var bld = BUILDING.build();

  world.add(site.shell, site.furn);
  var LV = bld.levels;
  Object.keys(LV).forEach(function (k) { world.add(LV[k].shell, LV[k].furn); });

  /* Collect every emissive fixture the furniture library flagged, and give the
     important ones a real point light for the night view. */
  [site.furn, site.shell, LV.ground.furn, LV.first.furn, LV.penthouse.furn].forEach(function (g) {
    g.traverse(function (o) {
      if (o.userData && o.userData.bulb) {
        var p = new T.Vector3(); o.userData.bulb.getWorldPosition(p);
        addLamp(p.x, p.y, p.z, 0xFFC078, 1.5, 7.5);
      }
    });
  });
  // pool lights
  world.traverse(function (o) {
    if (o.userData && o.userData.poolLight) {
      var p = new T.Vector3(); o.getWorldPosition(p);
      addLamp(p.x, p.y, p.z, 0x7FE8FF, 2.0, 8);
    }
  });
  // a soft wash in the reception and the playroom so the glass reads at night
  addLamp(V.px(4.1), S.lv[0] + 2.6, V.pz(15.3), 0xFFD9A6, 2.4, 13);
  addLamp(V.px(7.1), S.lv[0] + 2.6, V.pz(11.2), 0xFFD9A6, 1.6, 10);
  addLamp(V.px(2.3), S.lv[0] + 2.6, V.pz(5.6), 0xFFD9A6, 1.6, 10);
  addLamp(V.px(4.85), S.lv[2] + 2.6, V.pz(9.6), 0xFFE0B0, 2.0, 11);
  addLamp(V.px(2.3), S.lv[1] + 2.6, V.pz(15.7), 0xFFD9A6, 1.4, 9);
  addLamp(V.px(6.25), S.lv[1] + 2.6, V.pz(15.7), 0xFFD9A6, 1.4, 9);

  /* ------------------------------------------------------------- labels */
  var labelGroup = new T.Group();
  scene.add(labelGroup);
  var LANG = 'ar';
  var allRooms = bld.rooms.concat(site.labels);

  function labelSprite(text) {
    var pad = 26, fs = 46;
    var c = V.cv(16, 16), g = c.getContext('2d');
    g.font = '600 ' + fs + 'px "Segoe UI", "Noto Sans Arabic", system-ui, sans-serif';
    var w = Math.ceil(g.measureText(text).width) + pad * 2;
    c.width = w; c.height = fs + pad;
    g = c.getContext('2d');
    g.font = '600 ' + fs + 'px "Segoe UI", "Noto Sans Arabic", system-ui, sans-serif';
    g.fillStyle = 'rgba(16,26,32,0.80)';
    var r = (fs + pad) / 2;
    g.beginPath();
    g.moveTo(r, 0); g.lineTo(w - r, 0); g.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
    g.lineTo(r, fs + pad); g.arc(r, r, r, Math.PI / 2, -Math.PI / 2);
    g.fill();
    g.fillStyle = '#F5EFE2'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText(text, w / 2, r + 1);
    var tx = new T.CanvasTexture(c);
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tx, depthTest: false, transparent: true }));
    sp.scale.set(w / 200, (fs + pad) / 200, 1);
    return sp;
  }

  function rebuildLabels() {
    while (labelGroup.children.length) labelGroup.remove(labelGroup.children[0]);
    allRooms.forEach(function (r) {
      var sp = labelSprite(LANG === 'ar' ? r.ar : r.en);
      sp.position.set(V.px(r.x), (r.base || 0) + 1.85, V.pz(r.y));
      sp.userData.level = r.level;
      labelGroup.add(sp);
    });
    applyVisibility();
  }

  /* --------------------------------------------------------- visibility */
  var state = {
    level: 'all',
    furniture: true,
    labels: false,
    site: true,
    night: false,
    sun: 0.30          // 0 = sunrise, 1 = sunset
  };

  function applyVisibility() {
    var order = ['ground', 'first', 'penthouse'];
    order.forEach(function (k, i) {
      var show = state.level === 'all' || state.level === k;
      // when one level is selected, everything above it is stripped away so
      // the plan can be read from the air
      if (state.level !== 'all' && order.indexOf(state.level) > i) show = true;
      LV[k].shell.visible = show;
      LV[k].furn.visible = show && state.furniture;
    });
    if (state.level !== 'all') {
      var idx = order.indexOf(state.level);
      order.forEach(function (k, i) {
        LV[k].shell.visible = i <= idx;
        LV[k].furn.visible = i <= idx && state.furniture;
      });
    }
    site.shell.visible = state.site;
    site.furn.visible = state.site && state.furniture;
    labelGroup.visible = state.labels;
    labelGroup.children.forEach(function (sp) {
      var lv = sp.userData.level;
      sp.visible = lv === 'site'
        ? state.site
        : (state.level === 'all' ? lv === 'ground' : lv === state.level);
    });
  }

  /* --------------------------------------------------------- sun & mood */
  function applySun() {
    var t = state.sun;
    var az = Math.PI * (0.12 + t * 0.80);           // east -> west
    // capped elevation: a near-vertical sun flattens every facade at once
    var el = 0.24 + Math.sin(t * Math.PI) * 0.72;
    var R = 60;
    sun.position.set(Math.cos(az) * Math.cos(el) * R, Math.sin(el) * R + 4, Math.sin(az) * Math.cos(el) * R * 0.72 + 4);
    sun.target.position.set(0, 2, 0);

    if (state.night) {
      scene.background = skyNight;
      scene.environment = envNight;
      sun.intensity = 0.12;
      sun.color.set(0x9FB4D8);
      hemi.intensity = 0.16;
      hemi.color.set(0x33456B); hemi.groundColor.set(0x1A2030);
      fill.intensity = 0.06;
      renderer.toneMappingExposure = 1.25;
    } else {
      var warm = 1 - Math.abs(t - 0.5) * 2;          // 1 at noon, 0 at the ends
      scene.background = warm < 0.28 ? skyDusk : skyDay;
      scene.environment = warm < 0.28 ? envDusk : envDay;
      sun.intensity = 1.1 + warm * 1.9;
      sun.color.set(warm < 0.3 ? 0xFFB877 : 0xFFF3DE);
      hemi.intensity = 0.30 + warm * 0.42;
      hemi.color.set(0xCFE3F2); hemi.groundColor.set(0xC6B79A);
      fill.intensity = 0.18 + warm * 0.24;
      renderer.toneMappingExposure = 1.02 + (1 - warm) * 0.12;
    }
    lamps.forEach(function (l) {
      l.intensity = state.night ? l.userData.max : 0;
    });
    var emis = state.night ? 1.4 : 0.25;
    M.lampWarm.emissiveIntensity = emis;
  }

  /* ------------------------------------------------------ orbit controls */
  var ctrl = {
    target: new T.Vector3(0, 2.2, 0),
    radius: 34, theta: 0.85, phi: 1.02,
    tTarget: new T.Vector3(0, 2.2, 0), tRadius: 34, tTheta: 0.85, tPhi: 1.02,
    minPhi: 0.06, maxPhi: Math.PI / 2 - 0.015
  };
  function applyCamera() {
    var s = Math.sin(ctrl.phi), c = Math.cos(ctrl.phi);
    camera.position.set(
      ctrl.target.x + ctrl.radius * s * Math.sin(ctrl.theta),
      ctrl.target.y + ctrl.radius * c,
      ctrl.target.z + ctrl.radius * s * Math.cos(ctrl.theta));
    camera.lookAt(ctrl.target);
  }
  function goTo(pos, look, dur) {
    var d = new T.Vector3().subVectors(pos, look);
    ctrl.tRadius = d.length();
    ctrl.tPhi = Math.max(ctrl.minPhi, Math.min(ctrl.maxPhi, Math.acos(d.y / ctrl.tRadius)));
    ctrl.tTheta = Math.atan2(d.x, d.z);
    ctrl.tTarget.copy(look);
    if (dur === 0) {
      ctrl.radius = ctrl.tRadius; ctrl.phi = ctrl.tPhi;
      ctrl.theta = ctrl.tTheta; ctrl.target.copy(ctrl.tTarget);
    }
  }

  var drag = null;
  function ptr(e) {
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }
  canvas.addEventListener('pointerdown', function (e) {
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (drag.pan) {
      var k = ctrl.tRadius * 0.0016;
      var right = new T.Vector3(Math.cos(ctrl.tTheta), 0, -Math.sin(ctrl.tTheta));
      var fwd = new T.Vector3(Math.sin(ctrl.tTheta), 0, Math.cos(ctrl.tTheta));
      ctrl.tTarget.addScaledVector(right, -dx * k).addScaledVector(fwd, dy * k);
      ctrl.tTarget.y = Math.max(0.2, Math.min(14, ctrl.tTarget.y));
    } else {
      ctrl.tTheta -= dx * 0.0055;
      ctrl.tPhi = Math.max(ctrl.minPhi, Math.min(ctrl.maxPhi, ctrl.tPhi - dy * 0.0045));
    }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    canvas.addEventListener(ev, function () { drag = null; });
  });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    ctrl.tRadius = Math.max(1.6, Math.min(120, ctrl.tRadius * (1 + Math.sign(e.deltaY) * 0.11)));
  }, { passive: false });

  // pinch zoom
  var pinch = null;
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && pinch) {
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
      ctrl.tRadius = Math.max(1.6, Math.min(120, ctrl.tRadius * (pinch / d)));
      pinch = d;
      e.preventDefault();
    }
  }, { passive: false });
  canvas.addEventListener('touchend', function () { pinch = null; });

  /* ---------------------------------------------------------- view presets */
  function P(x, y, h) { return new T.Vector3(V.px(x), h, V.pz(y)); }
  var VIEWS = {
    aerial:    { ar: 'منظور عام',        en: 'Aerial',        pos: P(21.0, 31.0, 19.0), look: P(5.5, 14.5, 3.0), level: 'all' },
    garden:    { ar: 'الحديقة والمسبح',  en: 'Pool & garden', pos: P(0.80, 18.32, 2.42), look: P(8.40, 22.10, 0.55), level: 'all', fov: 60 },
    pergola:   { ar: 'البرجولة',          en: 'Pergola',       pos: P(4.60, 21.60, 2.05), look: P(10.70, 20.70, 1.10), level: 'all', fov: 58 },
    street:    { ar: 'الواجهة',           en: 'Street',        pos: P(6.0, -13.5, 7.0),  look: P(6.0, 7.0, 2.5),  level: 'all' },
    // interior cameras stand inside the room with every level shown, so the
    // ceiling is there: hiding the floors above would open the room to the sky
    reception: { ar: 'الريسبشن',          en: 'Reception',     pos: P(7.68, 13.35, 1.62), look: P(2.90, 16.80, 1.10), level: 'all', fov: 62 },
    kitchen:   { ar: 'المطبخ',            en: 'Kitchen',       pos: P(4.02, 6.92, 1.98),  look: P(1.20, 4.85, 1.02),  level: 'all', fov: 64 },
    master:    { ar: 'الماستر',           en: 'Master 01',     pos: P(7.82, 14.95, 5.42), look: P(5.15, 16.40, 4.70), level: 'all', fov: 62 },
    playroom:  { ar: 'غرفة الألعاب',      en: 'Playroom',      pos: P(6.12, 11.12, 8.82), look: P(4.20, 8.55, 8.02), level: 'all', fov: 68 },
    roof:      { ar: 'برجولة السطح',      en: 'Roof pergola',  pos: P(7.20, 17.08, 8.90), look: P(3.70, 14.20, 7.95), level: 'all', fov: 62 },
    // the plan view must sit exactly south of its target, or lookAt() runs into
    // the straight-down singularity and the whole site arrives rotated
    plan:      { ar: 'مسقط أفقي',         en: 'Plan view',     pos: P(6.125, 10.6, 38.0), look: P(6.125, 12.25, 0.4), level: 'ground' }
  };

  /* ------------------------------------------------------------------ UI */
  var COPY = {
    ar: {
      dir: 'rtl',
      title: 'فيلا B — تصميم ثلاثي الأبعاد',
      sub: 'قطعة ١٢٫٢٥ × ٢٤٫٥٠ م · مسطح البناء ٨٫٠٥ × ١٣٫٨٠ م · ٣ أدوار',
      views: 'لقطات', levels: 'الأدوار', options: 'خيارات',
      all: 'الكل', ground: 'أرضي', first: 'أول', penthouse: 'بنتهاوس',
      furniture: 'الفرش', labels: 'أسماء الغرف', siteT: 'الحديقة', night: 'إضاءة ليلية',
      sunT: 'حركة الشمس', reset: 'إعادة الضبط', lang: 'EN',
      hint: 'اسحب للدوران · عجلة الماوس للتقريب · Shift + سحب للتحريك',
      legendT: 'مفاتيح التصميم'
    },
    en: {
      dir: 'ltr',
      title: 'Villa B — 3D concept',
      sub: 'Plot 12.25 × 24.50 m · footprint 8.05 × 13.80 m · 3 floors',
      views: 'Views', levels: 'Levels', options: 'Options',
      all: 'All', ground: 'Ground', first: 'First', penthouse: 'Penthouse',
      furniture: 'Furniture', labels: 'Room names', siteT: 'Garden', night: 'Night lighting',
      sunT: 'Sun', reset: 'Reset view', lang: 'ع',
      hint: 'Drag to orbit · wheel to zoom · Shift + drag to pan',
      legendT: 'Design notes'
    }
  };

  var ui = {
    root: document.getElementById('panel'),
    views: document.getElementById('views'),
    levels: document.getElementById('levels'),
    opts: document.getElementById('opts'),
    sun: document.getElementById('sun'),
    hint: document.getElementById('hint'),
    title: document.getElementById('title'),
    sub: document.getElementById('sub'),
    hViews: document.getElementById('h-views'),
    hLevels: document.getElementById('h-levels'),
    hOpts: document.getElementById('h-opts'),
    lang: document.getElementById('lang'),
    reset: document.getElementById('reset'),
    sunLabel: document.getElementById('sun-label')
  };

  var activeView = 'aerial';
  function renderUI() {
    var t = COPY[LANG];
    document.documentElement.lang = LANG;
    document.documentElement.dir = t.dir;
    ui.title.textContent = t.title;
    ui.sub.textContent = t.sub;
    ui.hViews.textContent = t.views;
    ui.hLevels.textContent = t.levels;
    ui.hOpts.textContent = t.options;
    ui.lang.textContent = t.lang;
    ui.reset.textContent = t.reset;
    ui.hint.textContent = t.hint;
    ui.sunLabel.textContent = t.sunT;

    ui.views.innerHTML = '';
    Object.keys(VIEWS).forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'chip' + (k === activeView ? ' on' : '');
      b.textContent = VIEWS[k][LANG];
      b.onclick = function () { setView(k); };
      ui.views.appendChild(b);
    });

    ui.levels.innerHTML = '';
    [['all', t.all], ['ground', t.ground], ['first', t.first], ['penthouse', t.penthouse]]
      .forEach(function (p) {
        var b = document.createElement('button');
        b.className = 'chip' + (state.level === p[0] ? ' on' : '');
        b.textContent = p[1];
        b.onclick = function () { state.level = p[0]; applyVisibility(); renderUI(); };
        ui.levels.appendChild(b);
      });

    ui.opts.innerHTML = '';
    [['furniture', t.furniture], ['labels', t.labels], ['site', t.siteT], ['night', t.night]]
      .forEach(function (p) {
        var b = document.createElement('button');
        b.className = 'chip' + (state[p[0]] ? ' on' : '');
        b.textContent = p[1];
        b.onclick = function () {
          state[p[0]] = !state[p[0]];
          applyVisibility(); applySun(); renderUI();
        };
        ui.opts.appendChild(b);
      });
  }

  function setView(k) {
    activeView = k;
    var v = VIEWS[k];
    camera.fov = v.fov || 46;
    camera.updateProjectionMatrix();
    state.level = v.level;
    applyVisibility();
    goTo(v.pos, v.look);
    renderUI();
  }

  ui.lang.onclick = function () {
    LANG = LANG === 'ar' ? 'en' : 'ar';
    rebuildLabels(); renderUI(); buildLegend();
  };
  ui.reset.onclick = function () { setView('aerial'); };
  ui.sun.oninput = function () { state.sun = +ui.sun.value / 100; applySun(); };

  document.addEventListener('keydown', function (e) {
    var keys = { '1': 'aerial', '2': 'garden', '3': 'pergola', '4': 'street', '5': 'reception',
                 '6': 'kitchen', '7': 'master', '8': 'playroom', '9': 'roof', '0': 'plan' };
    if (keys[e.key]) setView(keys[e.key]);
    if (e.key === 'n' || e.key === 'N') { state.night = !state.night; applySun(); renderUI(); }
  });

  /* --------------------------------------------------------- design notes */
  var NOTES = {
    ar: [
      ['الطراز', 'بوهيمي عملي: بياض جيري، خشب بلوط وجوز، خيزران وروطان، كليم وجوت، فخار وتراكوتا — فوق تخزين مغلق وأقمشة قابلة للغسل.'],
      ['الأرضي', 'ريسبشن ٧٫٧٥ × ٤٫٨٥ م مفتوح على الحديقة بواجهة زجاجية منزلقة، سفرة ٨ أفراد، مطبخ بجزيرة، تواليت ضيوف، وغرفة سائق بحمام.'],
      ['الأول', 'أربع غرف ماستر بحمامات خاصة + غرفة ملابس + تراس شمالي يطل على المسبح.'],
      ['البنتهاوس', 'دور الأطفال: غرفة ألعاب ٣٫٠٠ × ٣٫٢٠ م بحمام، تفتح مباشرة على تراس مظلل تحت برجولة السطح ٤٫٧٠ × ٢٫٢٠ م.'],
      ['المسبح', '٧٫٠٠ × ٣٫١٠ م بعمق ١٫٤٥ م، مع درجة ضحلة عرضها ١٫٦٠ م في الطرف الغربي للأطفال، وإضاءة غاطسة ودش خارجي.'],
      ['البرجولة', 'جلسة مظللة ٣٫٢٥ × ٤٫١٠ م في الركن الشرقي، بمطبخ خارجي وشواية، يصلها الضيف من الجراج دون المرور على المسبح.'],
      ['ركن الأطفال', 'في الحديقة الأمامية — مسوّر، مرئي من شباك المطبخ، وبعيد عن المياه.'],
      ['التنسيق', 'الحديقة الخلفية مقسّمة شرائط موازية لواجهة الريسبشن الزجاجية، فيقرأ المسبح كامتداد للغرفة لا كجسم منفصل.'],
      ['ملاحظة عملية', 'المطبخ عمقه ٢٫٩٥ م فقط، فالجزيرة هنا جزيرة تحضير ١٫٥٥ × ٠٫٧٨ م بدون كراسي — إضافة بار جلوس كانت ستترك ممرًا أقل من ٤٠ سم.'],
      ['افتراضات', 'المساقط لا تحمل سهم شمال، فالنموذج يفترض أن الشارع في الجنوب؛ استخدم متحكم الشمس لمراجعة الظل بعد تأكيد التوجيه. ارتفاع الدور ٣٫٤٠ م بصافي ٣٫٠٠ م افتراض أيضًا — المساقط مقيسة أفقيًا فقط.']
    ],
    en: [
      ['Style', 'Bohemian but practical: lime plaster, oak and walnut, cane and rattan, kilim and jute, terracotta — over closed storage and washable covers.'],
      ['Ground', 'Reception 7.75 × 4.85 m opening to the garden through a sliding glass wall, dining for 8, island kitchen, guest WC, driver room with bath.'],
      ['First', 'Four master bedrooms, all en-suite, plus a dressing room and a north terrace over the pool.'],
      ['Penthouse', "The children's floor: a 3.00 × 3.20 m playroom with its own bath, opening onto a shaded terrace under the 4.70 × 2.20 m roof pergola."],
      ['Pool', '7.00 × 3.10 m, 1.45 m deep, with a 1.60 m shallow entry bench at the west end for small children, underwater lighting and an outdoor shower.'],
      ['Pergola', 'A 3.25 × 4.10 m shaded lounge in the east corner with an outdoor kitchen, reached from the carport without crossing the pool deck.'],
      ['Kids corner', 'In the front garden — walled, visible from the kitchen window, and on the far side of the house from the water.'],
      ['Layout', "The back garden is banded parallel to the reception's glass wall, so the pool reads as an extension of the room."],
      ['A practical call', 'The kitchen is only 2.95 m deep, so it takes a 1.55 × 0.78 m prep island with no stools — a breakfast bar would have left under 400 mm to walk past.'],
      ['Assumptions', 'The plans carry no north point, so the model treats the street as south; use the sun slider to check shading once the orientation is confirmed. The 3.40 m floor-to-floor with a 3.00 m clear height is an assumption too — the drawings are dimensioned in plan only.']
    ]
  };
  function buildLegend() {
    var el = document.getElementById('notes');
    el.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = COPY[LANG].legendT;
    el.appendChild(h);
    NOTES[LANG].forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'note';
      var b = document.createElement('b'); b.textContent = n[0];
      var s = document.createElement('span'); s.textContent = n[1];
      d.appendChild(b); d.appendChild(s); el.appendChild(d);
    });
  }

  /* -------------------------------------------------------------- resize */
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * renderer.getPixelRatio() || canvas.height !== h * renderer.getPixelRatio()) {
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    }
  }
  addEventListener('resize', resize);

  /* ---------------------------------------------------------------- loop */
  var water = null;
  world.traverse(function (o) { if (o.name === 'water') water = o; });
  var clock = new T.Clock();

  function tick() {
    requestAnimationFrame(tick);
    resize();
    var k = 0.12;
    ctrl.radius += (ctrl.tRadius - ctrl.radius) * k;
    ctrl.theta  += (ctrl.tTheta - ctrl.theta) * k;
    ctrl.phi    += (ctrl.tPhi - ctrl.phi) * k;
    ctrl.target.lerp(ctrl.tTarget, k);
    applyCamera();
    if (water) {
      var t = clock.getElapsedTime();
      water.position.y = -0.035 + Math.sin(t * 0.9) * 0.005;
      M.water.opacity = 0.92 + Math.sin(t * 0.7) * 0.02;
    }
    renderer.render(scene, camera);
  }

  rebuildLabels();
  renderUI();
  buildLegend();
  applySun();
  applyVisibility();
  goTo(VIEWS.aerial.pos, VIEWS.aerial.look, 0);
  resize();
  tick();

  // expose a little of the model for the still-image renderer
  window.VILLA_APP = {
    setView: setView, state: state, applySun: applySun,
    applyVisibility: applyVisibility, renderUI: renderUI, goTo: goTo,
    camera: camera, renderer: renderer, scene: scene, views: VIEWS,
    setLang: function (l) { LANG = l; rebuildLabels(); renderUI(); buildLegend(); }
  };
  document.body.classList.add('ready');
})();
