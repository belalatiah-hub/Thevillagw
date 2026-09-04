/* ---------------------------------------------------------------------------
   VDLC Villa B — the site: pool, garden, pergola, driveway and boundaries.

   The back garden is 12.25 x 6.70 m. It is laid out in bands parallel to the
   reception's glass wall so that the pool reads as an extension of the room
   rather than an object dropped on the lawn:

       17.80 – 18.70   threshold terrace + two steps down from the reception
       18.70 – 20.00   sun deck (loungers, parasol)
       20.00 – 23.10   pool, 7.00 x 3.10, with a shallow entry bench at the
                       west end for small children
       23.10 – 23.70   north walkway
       23.70 – 24.35   planting bed against the boundary wall

   The pergola sits in the east corner where the side passage arrives from the
   driveway, so guests reach the shaded lounge and the outdoor kitchen without
   crossing the pool deck. The children's play corner is deliberately in the
   FRONT garden — walled, visible from the kitchen window, and on the other
   side of the house from the water.
--------------------------------------------------------------------------- */
'use strict';

var LANDSCAPE = (function () {
  var T = THREE, V = VILLA, F = FURN, M = V.M, S = V.S, C = V.C;
  var box = V.box, cyl = V.cyl, sphere = V.sphere, group = V.group,
      slabAt = V.slabAt, wall = V.wall, place = F.place, px = V.px, pz = V.pz;

  var POOL = { x0: 0.90, x1: 7.90, y0: 20.00, y1: 23.10, depth: 1.45 };
  var PERG = { x0: 8.70, x1: 11.95, y0: 18.30, y1: 22.40, h: 2.55 };

  var labels = [];
  function label(ar, en, x, y, base) { labels.push({ level: 'site', ar: ar, en: en, x: x, y: y, base: base || 0 }); }

  function paved(g, x0, y0, x1, y1, base, mat, thick) {
    var m = slabAt(x0, y0, x1, y1, (base || 0) - (thick || 0.12), thick || 0.12, mat);
    m.castShadow = false; g.add(m);
    return m;
  }

  /* ------------------------------------------------------------- the pool */
  function pool(g) {
    var p = POOL, cw = 0.35;

    // coping ring
    [[p.x0 - cw, p.y0 - cw, p.x1 + cw, p.y0], [p.x0 - cw, p.y1, p.x1 + cw, p.y1 + cw],
     [p.x0 - cw, p.y0, p.x0, p.y1], [p.x1, p.y0, p.x1 + cw, p.y1]].forEach(function (r) {
      var m = slabAt(r[0], r[1], r[2], r[3], -0.02, 0.12, M.floorOut);
      m.receiveShadow = true; g.add(m);
    });

    // basin: floor + four walls, mosaic lined
    g.add(slabAt(p.x0, p.y0, p.x1, p.y1, -p.depth, 0.12, M.poolShell));
    [[p.x0, p.y0 - 0.12, p.x1, p.y0], [p.x0, p.y1, p.x1, p.y1 + 0.12],
     [p.x0 - 0.12, p.y0 - 0.12, p.x0, p.y1 + 0.12], [p.x1, p.y0 - 0.12, p.x1 + 0.12, p.y1 + 0.12]]
      .forEach(function (r) { g.add(slabAt(r[0], r[1], r[2], r[3], -p.depth, p.depth, M.poolShell)); });

    // shallow entry bench at the west end — where the children get in
    g.add(slabAt(p.x0, p.y0, p.x0 + 1.00, p.y1, -p.depth, p.depth - 0.35, M.poolShell));
    g.add(slabAt(p.x0 + 1.00, p.y0, p.x0 + 1.60, p.y1, -p.depth, p.depth - 0.75, M.poolShell));

    // water
    var w = slabAt(p.x0, p.y0, p.x1, p.y1, -0.05, 0.03, M.water);
    w.castShadow = false; w.receiveShadow = false;
    w.name = 'water';
    g.add(w);

    // three underwater lights on the south wall
    for (var i = 0; i < 3; i++) {
      var l = cyl(0.09, 0.09, 0.04, 12, M.lampWarm);
      l.rotation.x = Math.PI / 2; l.castShadow = false;
      l.position.set(px(p.x0 + 1.6 + i * 2.0), -0.55, pz(p.y0 + 0.02));
      l.userData.poolLight = true;
      g.add(l);
    }

    // outdoor shower against the east coping
    var sh = cyl(0.035, 0.035, 2.25, 10, M.brass);
    sh.position.set(px(p.x1 + 0.60), 1.12, pz(p.y1 - 0.20)); g.add(sh);
    var arm = cyl(0.028, 0.028, 0.35, 8, M.brass);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(px(p.x1 + 0.44), 2.22, pz(p.y1 - 0.20)); g.add(arm);
    var head = cyl(0.09, 0.09, 0.04, 12, M.brass);
    head.position.set(px(p.x1 + 0.27), 2.18, pz(p.y1 - 0.20)); g.add(head);

    label('حمام السباحة', 'Pool 7.00 × 3.10', (p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 0);
  }

  /* -------------------------------------------------------- garden pergola */
  function gardenPergola(g, furn) {
    var p = PERG;
    paved(furn, p.x0 - 0.25, p.y0 - 0.25, p.x1 + 0.20, p.y1 + 0.25, 0.04, M.deck, 0.10);
    g.add(BUILDING.pergola(p.x0, p.y0, p.x1, p.y1, 0.04, p.h, 0.30));

    // climbing bougainvillea up the two street-side posts
    [[p.x1, p.y0], [p.x1, p.y1]].forEach(function (c) {
      for (var i = 0; i < 14; i++) {
        var s = sphere(0.13 + Math.random() * 0.09, i % 3 ? M.leaf : M.terra, 8);
        s.position.set(px(c[0]) + (Math.random() - .5) * 0.35,
          0.4 + i * (p.h / 12) * 0.9, pz(c[1]) + (Math.random() - .5) * 0.35);
        g.add(s);
      }
    });

    // lounge: an L of outdoor seating around a low table, on a kilim
    place(furn, F.rug(2.60, 1.90, M.rugWarm), 10.15, 20.90, 0, 0.05);
    place(furn, F.outdoorSofa(3), 10.15, 21.90, 180, 0.04);
    place(furn, F.outdoorSofa(2), 8.95, 20.75, 90, 0.04);
    place(furn, F.coffeeTable(0.48), 10.20, 20.90, 0, 0.04);
    place(furn, F.pouf(0.30, M.ochre), 11.30, 20.30, 0, 0.04);
    place(furn, F.pouf(0.28, M.olive), 9.55, 19.75, 0, 0.04);
    place(furn, F.outdoorKitchen(2.30), 10.35, 18.60, 0, 0.04);
    var hc = F.hangChair(0.35);
    hc.position.set(px(11.45), 2.55, pz(19.35)); furn.add(hc);
    for (var i = 0; i < 6; i++) {
      var ln = F.lantern(0.14, 0.30 + (i % 3) * 0.20);
      ln.position.set(px(9.0 + (i % 3) * 1.15), 2.56, pz(19.6 + Math.floor(i / 3) * 1.9));
      furn.add(ln);
    }
    label('برجولة الجلسة', 'Pergola lounge', (p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 0);
  }

  /* --------------------------------------------------------- back garden */
  function backGarden(g, furn) {
    // threshold terrace + two steps down from the reception
    paved(g, 0.10, S.by1, 8.60, 18.70, 0.30, M.floorOut, 0.10);
    paved(g, 0.10, 18.55, 8.60, 18.72, 0.15, M.floorOut, 0.10);
    // decks around the pool
    [[0.10, 18.70, 8.60, POOL.y0 - 0.35], [0.10, POOL.y1 + 0.35, 8.60, 23.75],
     [0.10, POOL.y0 - 0.35, POOL.x0 - 0.35, POOL.y1 + 0.35],
     [POOL.x1 + 0.35, POOL.y0 - 0.35, 8.60, POOL.y1 + 0.35]].forEach(function (r) {
      paved(g, r[0], r[1], r[2], r[3], 0.02, M.deck, 0.10);
    });
    // side strip of paving joining the pergola to the deck
    paved(g, 8.60, 18.30, 8.95, 23.20, 0.02, M.floorOut, 0.10);
    // lawn in the north-east corner
    paved(g, 8.95, 22.55, 12.05, 23.85, 0.01, M.grass, 0.10);
    // planting beds
    paved(g, 0.10, 23.75, 8.60, 24.35, 0.05, M.grass, 0.12);

    pool(g);
    gardenPergola(g, furn);

    // sun deck: three loungers + a parasol looking down the length of the pool
    place(furn, F.lounger(), 3.45, 19.35, 180, 0.04);
    place(furn, F.lounger(), 4.40, 19.35, 180, 0.04);
    place(furn, F.lounger(), 5.35, 19.35, 180, 0.04);
    place(furn, F.sideTable(0.44, 0.24, M.teak), 4.95, 20.00, 0, 0.04);
    place(furn, F.parasol(2.35, 1.35), 7.15, 19.15, 0, 0.04);
    // a long plaster bench with kilim cushions against the west boundary
    place(furn, F.benchRun(3.20, M.plaster), 0.55, 21.60, 90, 0.04);
    place(furn, F.pot(0.30, 0.45), 0.60, 19.30, 0, 0.04);
    place(furn, F.plant(1.0), 0.60, 19.30, 0, 0.34);
    // fire pit on the north-east lawn
    place(furn, F.firepit(0.42), 10.45, 23.20, 0, 0.05);
    for (var i = 0; i < 4; i++) {
      var a = i / 4 * Math.PI * 2 + 0.5;
      place(furn, F.pouf(0.28, [M.terra, M.ochre, M.olive, M.rust][i]),
        10.45 + Math.cos(a) * 1.05, 23.20 + Math.sin(a) * 0.95, 0, 0.05);
    }

    // planting: a hedge along the north wall, two slim olives in the corners
    var hg = F.hedge(7.60, 1.45, 0.42); place(g, hg, 4.35, 24.10, 0, 0.10);
    place(g, F.tree(3.30, 1.90, M.olive), 0.80, 23.95, 0, 0.10);
    place(g, F.tree(3.00, 1.70, M.olive), 8.10, 23.95, 0, 0.10);
    place(g, F.tree(3.40, 2.00), 11.55, 23.85, 0, 0.10);
    place(g, F.bed_(2.80, 0.50), 6.40, 24.10, 0, 0.10);
    place(g, F.bed_(2.40, 0.45), 2.55, 24.10, 0, 0.10);
    // a green wall of creeper on the west boundary behind the bench
    for (var k = 0; k < 22; k++) {
      var s = sphere(0.14 + Math.random() * 0.09, k % 3 ? M.leaf : M.leafLight, 8);
      s.position.set(px(0.20), 0.6 + Math.random() * 1.7, pz(19.1 + Math.random() * 4.8));
      g.add(s);
    }
    // garden lighting
    [[0.55, 18.95], [0.55, 23.45], [8.30, 18.95], [8.30, 23.45], [8.78, 21.0]].forEach(function (p) {
      place(furn, F.bollard(0.60), p[0], p[1], 0, 0.04);
    });
    label('التراس والحديقة', 'Garden terrace', 4.35, 19.30, 0);
  }

  /* -------------------------------------------------------- front garden */
  function frontGarden(g, furn) {
    // driveway + carport
    paved(g, 8.30, 0.10, 12.15, 6.20, 0.02, M.floorOut, 0.12);
    var post = [[8.75, 0.55], [11.85, 0.55], [8.75, 5.40], [11.85, 5.40]];
    post.forEach(function (p) {
      var c = box(0.16, 2.75, 0.16, M.teak);
      c.position.set(px(p[0]), 1.375, pz(p[1])); g.add(c);
    });
    var beams = group('carport');
    [0.55, 5.40].forEach(function (yy) {
      var bm = box(3.35, 0.18, 0.10, M.teak);
      bm.position.set(px(10.30), 2.83, pz(yy)); beams.add(bm);
    });
    for (var i = 0; i <= 11; i++) {
      var r = box(0.07, 0.14, 5.10, M.teak);
      r.position.set(px(8.75 + i * (3.10 / 11)), 2.98, pz(2.97)); beams.add(r);
    }
    g.add(beams);
    car(g, 10.30, 2.90);

    // entry walk — stone slabs floating on gravel
    paved(g, 4.05, 0.10, 6.20, 2.80, 0.01, M.floorOut, 0.10);
    for (var s = 0; s < 4; s++) {
      paved(g, 4.35, 0.45 + s * 0.62, 5.90, 0.95 + s * 0.62, 0.06, M.stoneTop, 0.08);
    }

    // lawn + children's play corner, walled and away from the water
    paved(g, 0.35, 0.35, 3.95, 3.85, 0.01, M.grass, 0.12);
    place(g, F.tree(3.30, 2.00), 1.05, 3.25, 0, 0.10);
    place(g, F.tree(2.60, 1.55, M.olive), 3.45, 0.85, 0, 0.10);
    place(furn, F.teepee(1.45), 2.35, 2.75, -25, 0.10);
    place(furn, F.rug(1.90, 1.50, M.rugKids), 2.30, 1.65, 0, 0.11);
    place(furn, F.beanbag(0.36, M.terra), 1.60, 1.45, 0, 0.10);
    place(furn, F.beanbag(0.33, M.ochre), 3.00, 1.35, 0, 0.10);
    place(furn, F.playArch(), 0.95, 1.75, 0, 0.10);
    place(furn, F.bollard(0.55), 4.15, 1.20, 0, 0.02);
    place(furn, F.bollard(0.55), 4.15, 3.30, 0, 0.02);
    place(g, F.bed_(3.40, 0.45), 2.15, 0.30, 0, 0.10);
    label('ركن لعب الأطفال', 'Kids play corner', 2.20, 2.20, 0);
    label('الجراج', 'Carport', 10.30, 2.90, 0);
  }

  /* -------------------------------------------------------- side passage */
  function sidePassage(g, furn) {
    paved(g, 8.45, 6.20, 12.05, 18.30, 0.01, M.floorOut, 0.12);
    for (var i = 0; i < 9; i++) {
      paved(g, 9.60, 6.80 + i * 1.25, 10.85, 7.65 + i * 1.25, 0.05, M.stoneTop, 0.08);
    }
    // a run of grasses and a bamboo screen against the east boundary
    for (var k = 0; k < 7; k++) {
      place(g, F.bed_(1.10, 0.55), 11.70, 7.20 + k * 1.55, 0, 0.06);
    }
    var hg = F.hedge(10.5, 1.90, 0.38); place(g, hg, 11.80, 12.30, 90, 0.06);
    place(g, F.tree(2.80, 1.50, M.olive), 9.10, 16.40, 0, 0.06);
    [[8.90, 8.20], [8.90, 12.20], [8.90, 16.20]].forEach(function (p) {
      place(furn, F.bollard(0.60), p[0], p[1], 0, 0.02);
    });
    // pots stepping up the passage
    [[11.55, 9.10], [11.55, 13.60], [11.55, 17.20]].forEach(function (p) {
      place(furn, F.pot(0.26, 0.40), p[0], p[1], 0, 0.02);
      place(furn, F.plant(0.95), p[0], p[1], 0, 0.30);
    });
  }

  /* ------------------------------------------------------------ boundary */
  function boundary(g) {
    var H = 2.40, t = 0.20, mat = M.plaster;
    wall(g, 0.00, 0.00, 0.00, S.plotD, { t: t, h: H, base: 0, mat: mat });
    wall(g, 0.00, S.plotD, S.plotW, S.plotD, { t: t, h: H, base: 0, mat: mat });
    wall(g, S.plotW, 0.00, S.plotW, S.plotD, { t: t, h: H, base: 0, mat: mat });
    // a stone coping band, so 2.40 m of plaster does not read as a blank slab
    [[0, 0, 0, S.plotD], [0, S.plotD, S.plotW, S.plotD], [S.plotW, 0, S.plotW, S.plotD]]
      .forEach(function (r) {
        wall(g, r[0], r[1], r[2], r[3], { t: t + 0.08, h: 0.12, base: H, mat: M.floorOut });
        wall(g, r[0], r[1], r[2], r[3], { t: t + 0.05, h: 0.06, base: H - 0.42, mat: M.floorOut });
      });
    // street frontage: solid piers, a pedestrian gate and a sliding car gate
    wall(g, 0.00, 0.00, 4.05, 0.00, { t: t, h: 1.90, base: 0, mat: mat });
    wall(g, 6.20, 0.00, 8.30, 0.00, { t: t, h: 1.90, base: 0, mat: mat });
    [0.00, 4.05, 6.20, 8.30, 12.25].forEach(function (x) {
      var p = box(0.34, 2.20, 0.34, mat);
      p.position.set(px(x), 1.10, pz(0)); g.add(p);
      var cap = box(0.44, 0.08, 0.44, M.floorOut);
      cap.position.set(px(x), 2.24, pz(0)); g.add(cap);
    });
    // timber slat gates
    function gate(x0, x1, h) {
      var n = Math.round((x1 - x0) / 0.16);
      for (var i = 0; i < n; i++) {
        var s = box(0.09, h, 0.06, M.teak);
        s.position.set(px(x0 + 0.08 + i * ((x1 - x0) / n)), h / 2 + 0.05, pz(0));
        g.add(s);
      }
      [0.20, h - 0.15].forEach(function (yy) {
        var r = box(x1 - x0, 0.10, 0.05, M.walnut);
        r.position.set(px((x0 + x1) / 2), yy, pz(0) - 0.05); g.add(r);
      });
    }
    gate(4.05, 6.20, 2.05);
    gate(8.30, 12.25, 2.05);
    // creeper spilling over the top of the north boundary wall
    for (var i = 0; i < 18; i++) {
      var s = sphere(0.11 + Math.random() * 0.07, i % 3 ? M.leaf : M.leafLight, 8);
      s.position.set(px(0.6 + Math.random() * 11.0), 2.28 + Math.random() * 0.28, pz(24.34));
      g.add(s);
    }
  }

  /* --------------------------------------------------- a stylised saloon */
  function car(g, x, y) {
    var c = group('car');
    var body = box(1.82, 0.62, 4.42, new T.MeshStandardMaterial({ color: 0x2B3138, roughness: .35, metalness: .5 }));
    body.position.y = 0.68; c.add(body);
    var cabin = box(1.62, 0.56, 2.30, new T.MeshStandardMaterial({ color: 0x23282E, roughness: .2, metalness: .4 }));
    cabin.position.set(0, 1.22, -0.12); c.add(cabin);
    var gl = box(1.66, 0.42, 2.10, M.glass); gl.position.set(0, 1.24, -0.12); c.add(gl);
    [[-0.82, 1.42], [0.82, 1.42], [-0.82, -1.42], [0.82, -1.42]].forEach(function (w) {
      var t2 = new T.Mesh(new T.TorusGeometry(0.33, 0.13, 8, 16), M.charcoal);
      t2.rotation.y = Math.PI / 2; t2.position.set(w[0], 0.34, w[1]);
      t2.castShadow = true; c.add(t2);
    });
    c.position.set(px(x), 0.02, pz(y));
    g.add(c);
    return c;
  }

  /* ------------------------------------------------- context beyond the plot */
  function context(g) {
    /* The neighbourhood plane sits well below pool level. It used to be at
       -0.06 — just above the water surface — which quietly capped the pool
       with a sheet of pale ground and made the water invisible from above. */
    var ground = new T.Mesh(new T.PlaneGeometry(220, 220),
      new T.MeshStandardMaterial({ color: 0xCFC3A8, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.34;
    ground.receiveShadow = true; g.add(ground);

    // the plot's own made-up ground, laid around the pool rather than over it
    var soil = new T.MeshStandardMaterial({ color: 0xC2B79C, roughness: 1 });
    [[0, 0, S.plotW, POOL.y0], [0, POOL.y1, S.plotW, S.plotD],
     [0, POOL.y0, POOL.x0, POOL.y1], [POOL.x1, POOL.y0, S.plotW, POOL.y1]]
      .forEach(function (r) {
        var m = slabAt(r[0], r[1], r[2], r[3], -0.32, 0.31, soil);
        m.castShadow = false; g.add(m);
      });

    var street = slabAt(-40, -9.0, 52, -0.20, -0.04, 0.06,
      new T.MeshStandardMaterial({ color: 0x6E6B66, roughness: 1 }));
    street.castShadow = false; g.add(street);
    for (var i = -6; i < 10; i++) {
      var d = slabAt(i * 4.2, -4.75, i * 4.2 + 2.2, -4.55, 0.005, 0.02,
        new T.MeshStandardMaterial({ color: 0xE8E4D8, roughness: 1 }));
      d.castShadow = false; g.add(d);
    }
    /* Neighbouring villas, massed only — enough to say "this is a plot in a
       compound", never enough to compete with the subject. Positions here are
       world coordinates, clear of the 12.25 m plot on either side. */
    var nb = new T.MeshStandardMaterial({ color: 0xDCD2BE, roughness: .95 });
    [[-18.4, 4.0, 8.4, 13.0, 9.3], [-18.4, -10.5, 8.4, 12.0, 9.3],
     [18.4, 4.0, 8.4, 13.0, 9.3], [18.4, -10.5, 8.4, 12.0, 9.3],
     [-6.5, -26.5, 9.5, 12.5, 9.3], [6.5, -26.5, 9.5, 12.5, 9.3]].forEach(function (n) {
      var m = box(n[2], n[4], n[3], nb);
      m.position.set(n[0], n[4] / 2, n[1]);
      m.receiveShadow = true; g.add(m);
      var pr = box(n[2] + 0.3, 0.9, n[3] + 0.3, nb);
      pr.position.set(n[0], n[4] + 0.45, n[1]); g.add(pr);
    });
    [[-11.0, 10.5], [-11.0, -6.0], [11.0, 10.0], [11.0, -6.0], [11.0, -17.0],
     [-11.0, -17.0]].forEach(function (p) {
      var t2 = F.tree(4.4 + Math.random() * 1.0, 2.4);
      t2.position.set(p[0], 0, p[1]); g.add(t2);
    });
  }

  function build() {
    var g = group('site'), furn = group('site-furn');
    context(g);
    boundary(g);
    frontGarden(g, furn);
    sidePassage(g, furn);
    backGarden(g, furn);
    return { shell: g, furn: furn, labels: labels, pool: POOL, pergola: PERG };
  }

  return { build: build };
})();
