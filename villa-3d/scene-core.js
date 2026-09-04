/* ---------------------------------------------------------------------------
   VDLC Villa B — 3D concept model : core
   Geometry is taken from VDLC_Villa_B_Dims_20260206.pdf (Ground / First /
   Penthouse). Plot 12.25 m (E-W) x 24.50 m (N-S); building footprint
   8.05 m x 13.80 m sitting on the west boundary, 4.00 m off the street.

   Plan coordinates are used throughout: px = metres east from the plot's
   south-west corner, py = metres north from it. planToWorld() maps them onto
   three.js so that north is -Z and the plot is centred on the origin.
--------------------------------------------------------------------------- */
'use strict';

var VILLA = (function () {

  var T = THREE;

  /* ---------------------------------------------------------------- site */
  var S = {
    plotW: 12.25, plotD: 24.50,       // plot
    bx0: 0.25, bx1: 8.30,             // building, east-west
    by0: 4.00, by1: 17.80,            // building, south-north
    ext: 0.15,                        // exterior wall
    inn: 0.10,                        // partition
    garden: 0.00,                     // garden level
    lv: [0.45, 3.85, 7.25],           // slab tops: ground / first / penthouse
    ceil: 3.00,                       // clear height
    roof: 10.65
  };
  S.ix0 = S.bx0 + S.ext; S.ix1 = S.bx1 - S.ext;   // 0.40 .. 8.15  (7.75 clear)
  S.iy0 = S.by0 + S.ext; S.iy1 = S.by1 - S.ext;   // 4.15 .. 17.65 (13.50 clear)

  function px(x) { return x - S.plotW / 2; }
  function pz(y) { return S.plotD / 2 - y; }

  /* ------------------------------------------------------------ palette */
  var C = {
    plaster:   0xE9DFCB,
    plasterIn: 0xF2EBDD,
    stone:     0xD9CFBC,
    travertine:0xE3D9C6,
    terracotta:0xC0684A,
    rust:      0xA65038,
    ochre:     0xD9A441,
    olive:     0x7C8B5E,
    sage:      0x9BA98A,
    cream:     0xE9DECA,
    linen:     0xDED2BC,
    oak:       0xC79B68,
    teak:      0xA9784B,
    walnut:    0x6B4A32,
    rattan:    0xD8B57F,
    jute:      0xC9B189,
    brass:     0xB08D4F,
    charcoal:  0x3A3A38,
    teal:      0x115F7D,
    water:     0x1F8FA8,
    waterDeep: 0x136A80,
    grass:     0x6E8F4E,
    grassDark: 0x5A7A40,
    leaf:      0x4E7042,
    leafLight: 0x7FA05A,
    trunk:     0x6A5240,
    glass:     0xBFD9DF,
    steel:     0x8E8E8C,
    white:     0xFBF8F2
  };

  /* ------------------------------------------------- procedural textures */
  function cv(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    return c;
  }
  function tex(canvas, rx, ry) {
    var t = new T.CanvasTexture(canvas);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 8;
    // colour maps authored in sRGB — without this every texture renders
    // washed out, which is exactly what a bone-and-terracotta palette cannot
    // afford.
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  function hex(n) { return '#' + ('000000' + n.toString(16)).slice(-6); }

  /* Berber / kilim rug — the bohemian anchor of every room. */
  function kilimTexture(bg, a, b, c2) {
    var c = cv(256, 384), g = c.getContext('2d');
    g.fillStyle = hex(bg); g.fillRect(0, 0, 256, 384);
    // border
    g.strokeStyle = hex(a); g.lineWidth = 10;
    g.strokeRect(14, 14, 228, 356);
    // diamond lattice
    var cols = [a, b, c2];
    for (var r = 0; r < 7; r++) {
      for (var q = 0; q < 3; q++) {
        var cx = 50 + q * 78, cy = 54 + r * 46;
        g.fillStyle = hex(cols[(r + q) % 3]);
        g.beginPath();
        g.moveTo(cx, cy - 17); g.lineTo(cx + 24, cy); g.lineTo(cx, cy + 17); g.lineTo(cx - 24, cy);
        g.closePath(); g.fill();
        g.fillStyle = hex(bg);
        g.beginPath();
        g.moveTo(cx, cy - 8); g.lineTo(cx + 11, cy); g.lineTo(cx, cy + 8); g.lineTo(cx - 11, cy);
        g.closePath(); g.fill();
      }
    }
    // zigzag bands
    g.strokeStyle = hex(a); g.lineWidth = 4;
    [30, 354].forEach(function (yy) {
      g.beginPath();
      for (var x = 20; x <= 236; x += 12) g.lineTo(x, yy + (x / 12 % 2 ? 5 : -5));
      g.stroke();
    });
    return tex(c, 1, 1);
  }

  /* Flatweave jute — used under dining and in the bedrooms. */
  function juteTexture() {
    var c = cv(128, 128), g = c.getContext('2d');
    g.fillStyle = hex(C.jute); g.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 1400; i++) {
      g.fillStyle = 'rgba(0,0,0,' + (0.03 + Math.random() * 0.07).toFixed(3) + ')';
      var hor = Math.random() > .5;
      g.fillRect(Math.random() * 128, Math.random() * 128, hor ? 9 : 2, hor ? 2 : 9);
    }
    return tex(c, 3, 3);
  }

  /* Terracotta floor tile with a grout line. */
  function terracottaTexture() {
    var c = cv(128, 128), g = c.getContext('2d');
    g.fillStyle = hex(C.terracotta); g.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 900; i++) {
      g.fillStyle = 'rgba(255,235,215,' + (Math.random() * 0.10).toFixed(3) + ')';
      g.fillRect(Math.random() * 128, Math.random() * 128, 3, 3);
    }
    g.strokeStyle = 'rgba(250,244,232,0.85)'; g.lineWidth = 5;
    g.strokeRect(0, 0, 128, 128);
    return tex(c, 1, 1);
  }

  /* Warm limestone / travertine — indoor floors and pool coping. */
  function stoneTexture(base) {
    var c = cv(256, 256), g = c.getContext('2d');
    g.fillStyle = hex(base); g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 2600; i++) {
      g.fillStyle = 'rgba(120,102,78,' + (Math.random() * 0.05).toFixed(3) + ')';
      g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 5, 1 + Math.random() * 3);
    }
    g.strokeStyle = 'rgba(150,134,110,0.35)'; g.lineWidth = 2;
    for (var k = 0; k <= 256; k += 64) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(256, k); g.stroke();
    }
    return tex(c, 1, 1);
  }

  /* Deck boards — pool deck and pergola floor. */
  function deckTexture() {
    var c = cv(256, 256), g = c.getContext('2d');
    g.fillStyle = hex(C.teak); g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 32) {
      g.fillStyle = 'rgba(0,0,0,' + (0.05 + Math.random() * 0.08).toFixed(3) + ')';
      g.fillRect(0, y, 256, 3);
      for (var i = 0; i < 60; i++) {
        g.fillStyle = 'rgba(255,230,195,' + (Math.random() * 0.06).toFixed(3) + ')';
        g.fillRect(Math.random() * 256, y + 4 + Math.random() * 24, 20, 1);
      }
    }
    return tex(c, 1, 1);
  }

  /* Lawn. */
  function grassTexture() {
    var c = cv(128, 128), g = c.getContext('2d');
    g.fillStyle = hex(C.grass); g.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 2200; i++) {
      g.fillStyle = Math.random() > .5
        ? 'rgba(120,160,80,' + (Math.random() * .5).toFixed(2) + ')'
        : 'rgba(60,90,45,' + (Math.random() * .5).toFixed(2) + ')';
      g.fillRect(Math.random() * 128, Math.random() * 128, 2, 4);
    }
    return tex(c, 8, 8);
  }

  /* Pool bottom — mosaic grid seen through the water. */
  function poolTexture() {
    var c = cv(128, 128), g = c.getContext('2d');
    g.fillStyle = '#DFF1F0'; g.fillRect(0, 0, 128, 128);
    for (var x = 0; x < 128; x += 16) for (var y = 0; y < 128; y += 16) {
      g.fillStyle = 'rgba(120,190,195,' + (0.15 + Math.random() * 0.30).toFixed(2) + ')';
      g.fillRect(x + 1, y + 1, 14, 14);
    }
    return tex(c, 10, 5);
  }

  /* Cane / rattan weave for chair backs and cabinet fronts. */
  function caneTexture() {
    var c = cv(64, 64), g = c.getContext('2d');
    g.fillStyle = hex(C.rattan); g.fillRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(90,60,30,0.45)'; g.lineWidth = 2;
    for (var i = -64; i < 128; i += 9) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke();
      g.beginPath(); g.moveTo(i, 64); g.lineTo(i + 64, 0); g.stroke();
    }
    return tex(c, 4, 2);
  }

  var TX = {};
  function initTextures() {
    TX.kilimWarm  = kilimTexture(C.cream, C.rust, C.ochre, C.charcoal);
    TX.kilimOlive = kilimTexture(C.linen, C.olive, C.terracotta, C.walnut);
    TX.kilimKids  = kilimTexture(C.white, C.teal, C.ochre, C.terracotta);
    TX.jute       = juteTexture();
    TX.terracotta = terracottaTexture();
    TX.stone      = stoneTexture(C.travertine);
    TX.stoneOut   = stoneTexture(C.stone);
    TX.deck       = deckTexture();
    TX.grass      = grassTexture();
    TX.pool       = poolTexture();
    TX.cane       = caneTexture();
  }

  /* ----------------------------------------------------------- materials */
  var M = {};
  function initMaterials() {
    function std(o) { return new T.MeshStandardMaterial(o); }
    M.plaster    = std({ color: C.plaster, roughness: 0.95 });
    M.plasterIn  = std({ color: C.plasterIn, roughness: 0.96 });
    M.accentRust = std({ color: C.rust, roughness: 0.92 });
    M.accentOlive= std({ color: C.olive, roughness: 0.92 });
    M.accentTeal = std({ color: C.teal, roughness: 0.9 });
    M.slab       = std({ color: 0xE0D7C6, roughness: 0.95 });
    M.floorIn    = std({ map: TX.stone, roughness: 0.7 });
    M.floorTerra = std({ map: TX.terracotta, roughness: 0.75 });
    M.floorOut   = std({ map: TX.stoneOut, roughness: 0.85 });
    M.deck       = std({ map: TX.deck, roughness: 0.8 });
    M.grass      = std({ map: TX.grass, roughness: 1 });
    M.oak        = std({ color: C.oak, roughness: 0.65 });
    M.teak       = std({ color: C.teak, roughness: 0.7 });
    M.walnut     = std({ color: C.walnut, roughness: 0.6 });
    M.rattan     = std({ color: C.rattan, roughness: 0.85 });
    M.cane       = std({ map: TX.cane, roughness: 0.85 });
    M.linen      = std({ color: C.linen, roughness: 0.95 });
    M.cream      = std({ color: C.cream, roughness: 0.95 });
    M.white      = std({ color: C.white, roughness: 0.9 });
    M.rust       = std({ color: C.rust, roughness: 0.9 });
    M.ochre      = std({ color: C.ochre, roughness: 0.85 });
    M.olive      = std({ color: C.olive, roughness: 0.9 });
    M.sage       = std({ color: C.sage, roughness: 0.9 });
    M.stoneTop   = std({ color: 0xEDE7DA, roughness: 0.45 });
    M.terra      = std({ color: C.terracotta, roughness: 0.85 });
    M.charcoal   = std({ color: C.charcoal, roughness: 0.8 });
    M.brass      = std({ color: C.brass, roughness: 0.35, metalness: 0.8 });
    M.steel      = std({ color: C.steel, roughness: 0.4, metalness: 0.7 });
    M.leaf       = std({ color: C.leaf, roughness: 0.9 });
    M.leafLight  = std({ color: C.leafLight, roughness: 0.9 });
    M.trunk      = std({ color: C.trunk, roughness: 0.95 });
    M.pot        = std({ color: 0xB9724F, roughness: 0.9 });
    M.glass      = new T.MeshPhysicalMaterial({
      color: C.glass, roughness: 0.06, metalness: 0, transmission: 0.92,
      transparent: true, opacity: 0.32, side: T.DoubleSide
    });
    // Water is a tinted, glossy sheet rather than a transmissive one: a truly
    // see-through surface over a pale mosaic reads as paving from above, which
    // is the one thing a pool must never do.
    // A plain standard material, not a physical one with clearcoat: the
    // clearcoat lobe samples the sky outside envMapIntensity's control and
    // turns the surface into a white mirror seen from above.
    M.water = std({
      color: C.water, roughness: 0.14, metalness: 0.0,
      transparent: true, opacity: 0.92, side: T.DoubleSide,
      envMapIntensity: 0.16
    });
    M.poolShell  = std({ map: TX.pool, color: 0x2E93AB, roughness: 0.45 });
    M.rugWarm    = std({ map: TX.kilimWarm, roughness: 0.98 });
    M.rugOlive   = std({ map: TX.kilimOlive, roughness: 0.98 });
    M.rugKids    = std({ map: TX.kilimKids, roughness: 0.98 });
    M.rugJute    = std({ map: TX.jute, roughness: 1 });
    M.lampWarm   = new T.MeshStandardMaterial({
      color: 0xFFE7BE, emissive: 0xFFC978, emissiveIntensity: 1.1, roughness: 0.6
    });
  }

  /* ------------------------------------------------------------- helpers */
  var GEO_BOX = null;
  function box(w, h, d, mat) {
    if (!GEO_BOX) GEO_BOX = new T.BoxGeometry(1, 1, 1);
    var m = new T.Mesh(GEO_BOX, mat);
    m.scale.set(w, h, d);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  /* A box positioned by its plan footprint: x0..x1 east, y0..y1 north. */
  function slabAt(x0, y0, x1, y1, base, h, mat) {
    var m = box(Math.abs(x1 - x0), h, Math.abs(y1 - y0), mat);
    m.position.set(px((x0 + x1) / 2), base + h / 2, pz((y0 + y1) / 2));
    return m;
  }
  function cyl(rt, rb, h, seg, mat) {
    var m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function sphere(r, mat, seg) {
    var m = new T.Mesh(new T.SphereGeometry(r, seg || 16, (seg || 16) / 2), mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function group(name) { var g = new T.Group(); g.name = name || ''; return g; }

  /*  A straight wall run in plan coordinates, with rectangular openings.
      openings: [{ at, w, sill, h }]  — `at` measured from (x0,y0). */
  function wall(g, x0, y0, x1, y1, opt) {
    opt = opt || {};
    var t   = opt.t   != null ? opt.t   : S.ext,
        h   = opt.h   != null ? opt.h   : S.ceil,
        base= opt.base!= null ? opt.base: 0,
        mat = opt.mat || M.plaster,
        ops = (opt.openings || []).slice().sort(function (a, b) { return a.at - b.at; });

    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    var ux = dx / len, uy = dy / len;
    var ang = Math.atan2(-dy, dx);           // plan -> world rotation about Y

    function piece(a0, a1, yy0, yy1) {
      if (a1 - a0 < 0.004 || yy1 - yy0 < 0.004) return;
      var m = box(a1 - a0, yy1 - yy0, t, mat);
      var mid = (a0 + a1) / 2;
      m.position.set(px(x0 + ux * mid), base + (yy0 + yy1) / 2, pz(y0 + uy * mid));
      m.rotation.y = ang;
      g.add(m);
    }
    var cur = 0;
    ops.forEach(function (o) {
      piece(cur, o.at, 0, h);                             // solid before
      piece(o.at, o.at + o.w, 0, o.sill);                 // under sill
      piece(o.at, o.at + o.w, o.sill + o.h, h);           // over head
      cur = o.at + o.w;
      if (o.glass !== false && o.sill + o.h > o.sill) {
        var gl = box(o.w - 0.06, o.h - 0.06, 0.03, M.glass);
        var mid = o.at + o.w / 2;
        gl.position.set(px(x0 + ux * mid), base + o.sill + o.h / 2, pz(y0 + uy * mid));
        gl.rotation.y = ang;
        gl.castShadow = false;
        g.add(gl);
        if (o.frame !== false) {
          var fr = box(o.w, 0.06, t * 0.6, M.walnut);
          fr.position.set(px(x0 + ux * mid), base + o.sill + o.h, pz(y0 + uy * mid));
          fr.rotation.y = ang; g.add(fr);
        }
      }
    });
    piece(cur, len, 0, h);
    return g;
  }

  /* Arched niche / doorway head — a bohemian signature used at openings. */
  function archTop(g, cx, cy, w, base, mat, thick) {
    var shape = new T.Shape();
    var r = w / 2;
    shape.moveTo(-r, 0); shape.lineTo(-r, 0.02);
    shape.absarc(0, 0.02, r, Math.PI, 0, true);
    shape.lineTo(r, 0); shape.lineTo(-r, 0);
    var geo = new T.ExtrudeGeometry(shape, { depth: thick || 0.16, bevelEnabled: false });
    var m = new T.Mesh(geo, mat || M.plasterIn);
    m.position.set(px(cx), base, pz(cy) + (thick || 0.16) / 2);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  }

  return {
    T: T, S: S, C: C, M: M, TX: TX,
    px: px, pz: pz,
    initTextures: initTextures, initMaterials: initMaterials,
    box: box, slabAt: slabAt, cyl: cyl, sphere: sphere, group: group,
    wall: wall, archTop: archTop, tex: tex, cv: cv, hex: hex
  };
})();
