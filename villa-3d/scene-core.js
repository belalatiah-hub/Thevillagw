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

  /* Coursed sawn travertine — the cladding the whole exterior is built from.
     One tile is CLAD_TILE metres square, and every clad box gets world-scaled
     UVs (see tbox) so a course reads the same height on an 8 m wall as on a
     0.6 m pier. Without that the courses stretch to fit whatever box they
     land on and the facade stops looking like stone. */
  var CLAD_TILE = 2.40;                    // metres per tile: 8 courses of 0.30
  function travertineTexture(base, courses) {
    var N = courses || 8, P = 512, ch = P / N;
    var c = cv(P, P), g = c.getContext('2d');
    g.fillStyle = hex(base); g.fillRect(0, 0, P, P);
    for (var r = 0; r < N; r++) {
      var y = r * ch;
      // each course a shade of its own, the way sawn stone arrives
      g.fillStyle = 'rgba(' + (r % 3 === 0 ? '255,250,238' : '150,132,104') + ',' +
        (0.03 + Math.random() * 0.05).toFixed(3) + ')';
      g.fillRect(0, y, P, ch);
      // travertine's horizontal veining
      for (var v = 0; v < 26; v++) {
        g.fillStyle = 'rgba(146,126,96,' + (0.03 + Math.random() * 0.06).toFixed(3) + ')';
        g.fillRect(Math.random() * P, y + 3 + Math.random() * (ch - 8),
          20 + Math.random() * 90, 1 + Math.random() * 2);
      }
      // bed joint: a fine dark line with a light arris above it
      g.fillStyle = 'rgba(120,104,80,0.42)'; g.fillRect(0, y, P, 2);
      g.fillStyle = 'rgba(255,252,244,0.30)'; g.fillRect(0, y + 2, P, 1);
      // staggered perpends
      var off = (r % 2) * 0.5;
      for (var k = 0; k < 3; k++) {
        var x = ((k + off) / 3) * P;
        g.fillStyle = 'rgba(120,104,80,0.24)'; g.fillRect(x, y + 2, 1.5, ch - 2);
      }
    }
    return tex(c, 1, 1);
  }

  /* Interlocking driveway blocks, laid in running bond. */
  function paverTexture() {
    var c = cv(256, 256), g = c.getContext('2d');
    g.fillStyle = '#B9B2A4'; g.fillRect(0, 0, 256, 256);
    var bw = 64, bh = 32;
    for (var r = 0; r < 256 / bh; r++) {
      var off = (r % 2) * bw / 2;
      for (var k = -1; k < 256 / bw + 1; k++) {
        var x = k * bw + off, y = r * bh;
        var t = 0.06 + Math.random() * 0.12;
        g.fillStyle = 'rgba(' + (Math.random() > .5 ? '255,250,240' : '90,84,76') + ',' + t.toFixed(3) + ')';
        g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
        g.strokeStyle = 'rgba(88,82,74,0.45)'; g.lineWidth = 1.5;
        g.strokeRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
      }
    }
    return tex(c, 1, 1);
  }

  var TX = {};
  function initTextures() {
    TX.clad       = travertineTexture(0xE2D8C3, 8);
    TX.cladFine   = travertineTexture(0xE7DFCC, 4);   // slab edges: fewer, taller courses
    TX.paver      = paverTexture();
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

    /* ---- the exterior envelope -------------------------------------- */
    // walls: coursed travertine. fascia: the same stone sawn smoother, which
    // is what makes a projecting slab edge read as an edge and not as wall.
    M.clad       = std({ map: TX.clad, roughness: 0.82, envMapIntensity: 0.5 });
    M.fascia     = std({ map: TX.cladFine, color: 0xF2EBDC, roughness: 0.72, envMapIntensity: 0.6 });
    M.soffit     = std({ color: 0xDFD6C4, roughness: 0.9 });
    M.reveal     = std({ color: 0x8E8375, roughness: 0.95 });   // shadow gap under a slab
    M.frameDark  = std({ color: 0x24262A, roughness: 0.42, metalness: 0.55 });
    M.paver      = std({ map: TX.paver, roughness: 0.88 });
    // facade glass reflects far more than the interior sliders do — that
    // mirrored sky and palm is half of what the reference elevation is made of
    M.glassFacade = new T.MeshPhysicalMaterial({
      color: 0xAFC6CC, roughness: 0.035, metalness: 0.25,
      transmission: 0.62, transparent: true, opacity: 0.52,
      envMapIntensity: 1.5, side: T.DoubleSide
    });
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
    M.trunkLight = std({ color: 0x8A7358, roughness: 0.95 });
    M.bougain    = std({ color: 0xC2417E, roughness: 0.9 });
    M.agaveA     = std({ color: 0x5F7A55, roughness: 0.92 });
    M.agaveB     = std({ color: 0x7C9468, roughness: 0.92 });
    M.bougainDeep= std({ color: 0x93275C, roughness: 0.9 });
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
  /* Rescale a BoxGeometry's UVs from 0..1-per-face to metres-per-face, so a
     tiling material keeps a constant real-world size whatever the box. Face
     order in BoxGeometry is +X, -X, +Y, -Y, +Z, -Z, four vertices each. */
  function worldUV(geo, w, h, d, tile) {
    var uv = geo.attributes.uv;
    var size = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (var f = 0; f < 6; f++) {
      var su = size[f][0] / tile, sv = size[f][1] / tile;
      for (var i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    }
    uv.needsUpdate = true;
    return geo;
  }
  /* A box with its own geometry and world-scaled UVs — for clad surfaces. */
  function tbox(w, h, d, mat, tile) {
    var m = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d), w, h, d, tile || CLAD_TILE), mat);
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

      openings: [{ at, w, sill, h }] — `at` measured from (x0,y0). Per opening:
        glass:false   a solid void (a doorway through a partition)
        timber:true   an oak panel instead of glass (the front door)
        mullions:n    n vertical glazing bars, the way a wide window is built
      opt.uv sets metres-per-tile for a clad wall; opt.frame picks the frame
      material, and the frame is a real four-sided one — slim dark jambs, head
      and sill — because a facade's character lives in that line.            */
  function wall(g, x0, y0, x1, y1, opt) {
    opt = opt || {};
    var t   = opt.t   != null ? opt.t   : S.ext,
        h   = opt.h   != null ? opt.h   : S.ceil,
        base= opt.base!= null ? opt.base: 0,
        mat = opt.mat || M.plaster,
        uv  = opt.uv || 0,
        fmat= opt.frame || M.frameDark,
        gmat= opt.glassMat || M.glass,
        ops = (opt.openings || []).slice().sort(function (a, b) { return a.at - b.at; });

    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    var ux = dx / len, uy = dy / len;
    var ang = Math.atan2(-dy, dx);           // plan -> world rotation about Y

    /* place a box of size (along, up, through) centred at distance `a` along
       the run and height `yy` above base */
    function at(along, up, through, a, yy, m2) {
      var msh = uv ? tbox(along, up, through, m2, uv) : box(along, up, through, m2);
      msh.position.set(px(x0 + ux * a), base + yy, pz(y0 + uy * a));
      msh.rotation.y = ang;
      g.add(msh);
      return msh;
    }
    function piece(a0, a1, yy0, yy1) {
      if (a1 - a0 < 0.004 || yy1 - yy0 < 0.004) return;
      at(a1 - a0, yy1 - yy0, t, (a0 + a1) / 2, (yy0 + yy1) / 2, mat);
    }

    var cur = 0;
    ops.forEach(function (o) {
      piece(cur, o.at, 0, h);                             // solid before
      piece(o.at, o.at + o.w, 0, o.sill);                 // under sill
      piece(o.at, o.at + o.w, o.sill + o.h, h);           // over head
      cur = o.at + o.w;
      if (o.glass === false && !o.timber) return;         // a plain void

      var mid = o.at + o.w / 2, cy = o.sill + o.h / 2;
      if (o.timber) {
        var d = at(o.w - 0.05, o.h - 0.04, t * 0.55, mid, cy, M.oak);
        d.castShadow = true;
        // a slim vertical pull, the full height of the leaf
        at(0.035, o.h * 0.45, 0.05, mid + o.w * 0.36, cy, M.frameDark);
        return;
      }

      var gl = at(o.w - 0.11, o.h - 0.11, 0.024, mid, cy, gmat);
      gl.castShadow = false;
      // four-sided frame, set just proud of the reveal
      var fd = Math.min(t * 0.8, 0.13), fw = 0.055;
      at(o.w, fw, fd, mid, o.sill + fw / 2, fmat);              // sill
      at(o.w, fw, fd, mid, o.sill + o.h - fw / 2, fmat);        // head
      at(fw, o.h, fd, o.at + fw / 2, cy, fmat);                 // jamb
      at(fw, o.h, fd, o.at + o.w - fw / 2, cy, fmat);           // jamb
      var n = o.mullions || 0;
      for (var k = 1; k <= n; k++) {
        at(0.045, o.h - fw * 2, fd * 0.85, o.at + o.w * k / (n + 1), cy, fmat);
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
    T: T, S: S, C: C, M: M, TX: TX, CLAD_TILE: CLAD_TILE,
    px: px, pz: pz,
    initTextures: initTextures, initMaterials: initMaterials,
    box: box, tbox: tbox, worldUV: worldUV,
    slabAt: slabAt, cyl: cyl, sphere: sphere, group: group,
    wall: wall, archTop: archTop, tex: tex, cv: cv, hex: hex
  };
})();
