/* ---------------------------------------------------------------------------
   VDLC Villa B — bohemian / practical furniture library.

   Every piece is built from primitives and returned as a THREE.Group whose
   origin sits on the floor at the piece's centre, facing +Z (south) unless
   noted. place() puts one into the scene using plan coordinates and a plan
   bearing in degrees (0 = facing north).

   The brief: "بوهيمي عملي" — bohemian but practical. So: natural cane and
   rattan, warm oak and walnut, kilim and jute underfoot, terracotta, ochre,
   rust and olive against bone plaster, lots of plants — and underneath it all
   closed storage, wipeable surfaces and modular seating that a family with
   children can actually live in.
--------------------------------------------------------------------------- */
'use strict';

var FURN = (function () {
  var T = THREE, V = VILLA, M = V.M, C = V.C;
  var box = V.box, cyl = V.cyl, sphere = V.sphere, group = V.group;

  /* Put a furniture group on the plan. bearing: 0 = faces north (-Z). */
  function place(parent, obj, x, y, bearing, base) {
    obj.position.set(V.px(x), base || 0, V.pz(y));
    obj.rotation.y = (bearing || 0) * Math.PI / 180;
    parent.add(obj);
    return obj;
  }
  function add(g, mesh, x, y, z) {
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  }

  /* ------------------------------------------------------------ textiles */
  function rug(w, d, mat) {
    var g = group('rug');
    var m = box(w, 0.018, d, mat || M.rugWarm);
    m.castShadow = false;
    add(g, m, 0, 0.009, 0);
    return g;
  }

  /* A cushion is a superellipsoid, not a box: every vertex of a subdivided
     cube is pushed onto |u|⁴+|v|⁴+|t|⁴ = 1, which rounds the corners and
     bellies the faces the way a stuffed cushion actually sits. */
  function cushion(w, h, d, mat) {
    var geo = new T.BoxGeometry(w, h, d, 6, 6, 6);
    var p = geo.attributes.position;
    var hw = w / 2, hh = h / 2, hd = d / 2, n = 4;
    for (var i = 0; i < p.count; i++) {
      var u = p.getX(i) / hw, v = p.getY(i) / hh, t = p.getZ(i) / hd;
      var r = Math.pow(Math.pow(Math.abs(u), n) + Math.pow(Math.abs(v), n) +
                       Math.pow(Math.abs(t), n), 1 / n);
      if (r > 1e-5) p.setXYZ(i, (u / r) * hw, (v / r) * hh, (t / r) * hd);
    }
    geo.computeVertexNormals();
    var g = new T.Mesh(geo, mat);
    g.castShadow = true; g.receiveShadow = true;
    return g;
  }

  /* Floor cushions / poufs — the cheapest bohemian seat and extra seating
     for guests, stacked away when not needed. */
  function pouf(r, mat) {
    var g = group('pouf');
    var b = cyl(r, r * 0.92, 0.34, 20, mat || M.terra);
    add(g, b, 0, 0.17, 0);
    var top = cyl(r * 0.86, r * 0.86, 0.04, 20, M.ochre);
    add(g, top, 0, 0.355, 0);
    return g;
  }

  /* Macramé wall hanging — hung on a dowel. */
  function macrame(w, h) {
    var g = group('macrame');
    add(g, cyl(0.018, 0.018, w + 0.14, 8, M.walnut), 0, 0, 0).rotation.z = Math.PI / 2;
    var n = Math.max(6, Math.round(w / 0.06));
    for (var i = 0; i < n; i++) {
      var len = h * (0.55 + 0.45 * Math.sin(i / n * Math.PI));
      var s = box(0.022, len, 0.012, M.cream);
      s.castShadow = false;
      add(g, s, -w / 2 + (i + 0.5) * (w / n), -len / 2, 0.01);
    }
    return g;
  }

  /* --------------------------------------------------------------- seats */
  /* Modular low sofa: deep seat, loose cushions, washable linen covers,
     storage plinth. `seats` = number of modules. */
  function sofa(seats, mat) {
    var g = group('sofa');
    var w = seats * 0.82, d = 0.95;
    mat = mat || M.linen;
    add(g, box(w, 0.22, d, M.oak), 0, 0.11, 0);                 // plinth
    add(g, box(w - 0.06, 0.20, d - 0.08, mat), 0, 0.32, 0);     // seat base
    for (var i = 0; i < seats; i++) {
      var cx = -w / 2 + (i + 0.5) * (w / seats);
      add(g, cushion(w / seats - 0.05, 0.16, d - 0.14, mat), cx, 0.50, 0.02);
      add(g, cushion(w / seats - 0.05, 0.42, 0.18, mat), cx, 0.63, -d / 2 + 0.11);
    }
    // arms
    [-1, 1].forEach(function (s) {
      add(g, box(0.16, 0.34, d - 0.06, mat), s * (w / 2 - 0.08), 0.42, 0);
    });
    // scatter cushions in kilim colours
    var accents = [M.rust, M.ochre, M.olive, M.terra];
    for (var k = 0; k < seats + 1; k++) {
      var c = cushion(0.38, 0.36, 0.14, accents[k % accents.length]);
      c.rotation.x = -0.22;
      add(g, c, -w / 2 + 0.32 + k * ((w - 0.64) / Math.max(1, seats)), 0.72, -d / 2 + 0.26);
    }
    return g;
  }

  /* Rattan barrel armchair with a cane back. */
  function armchair() {
    var g = group('armchair');
    add(g, cyl(0.34, 0.30, 0.38, 20, M.cane), 0, 0.19, 0);
    add(g, cushion(0.56, 0.14, 0.54, M.cream), 0, 0.45, 0);
    var back = cyl(0.36, 0.36, 0.46, 20, M.cane, true);
    back.geometry = new T.CylinderGeometry(0.36, 0.34, 0.46, 20, 1, true, Math.PI * 0.15, Math.PI * 1.2);
    add(g, back, 0, 0.68, 0);
    back.material = new T.MeshStandardMaterial({ map: V.TX.cane, roughness: .85, side: T.DoubleSide });
    add(g, cushion(0.34, 0.30, 0.12, M.ochre), 0, 0.66, -0.24);
    return g;
  }

  /* Hanging egg / hammock chair for the pergola and the playroom. */
  function hangChair(dropTo) {
    var g = group('hangchair');
    var rope = cyl(0.012, 0.012, dropTo, 6, M.cream);
    add(g, rope, 0, -dropTo / 2, 0);
    var shell = new T.Mesh(
      new T.SphereGeometry(0.42, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new T.MeshStandardMaterial({ map: V.TX.cane, roughness: .85, side: T.DoubleSide })
    );
    shell.castShadow = true;
    add(g, shell, 0, -dropTo - 0.42, 0);
    add(g, cushion(0.5, 0.16, 0.5, M.terra), 0, -dropTo - 0.62, 0);
    return g;
  }

  function diningChair() {
    var g = group('chair');
    add(g, box(0.44, 0.05, 0.44, M.oak), 0, 0.44, 0);
    [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (p) {
      add(g, box(0.045, 0.44, 0.045, M.walnut), p[0], 0.22, p[1]);
    });
    var back = box(0.44, 0.46, 0.035, M.cane);
    add(g, back, 0, 0.70, -0.20);
    add(g, box(0.46, 0.05, 0.05, M.walnut), 0, 0.94, -0.20);
    return g;
  }

  function stool(h, mat) {
    var g = group('stool');
    add(g, cyl(0.17, 0.16, 0.05, 14, mat || M.oak), 0, h, 0);
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * Math.PI * 2;
      var l = box(0.035, h, 0.035, M.walnut);
      l.position.set(Math.cos(a) * 0.12, h / 2, Math.sin(a) * 0.12);
      l.rotation.x = Math.sin(a) * 0.06; l.rotation.z = -Math.cos(a) * 0.06;
      g.add(l);
    }
    return g;
  }

  /* --------------------------------------------------------------- tables */
  function coffeeTable(r) {
    var g = group('coffee');
    r = r || 0.52;
    add(g, cyl(r, r, 0.06, 24, M.walnut), 0, 0.38, 0);
    add(g, cyl(0.10, 0.16, 0.36, 16, M.oak), 0, 0.18, 0);
    add(g, cyl(0.30, 0.30, 0.03, 20, M.oak), 0, 0.02, 0);
    // a stack of books and a bowl, because empty tables look like showrooms
    add(g, box(0.24, 0.05, 0.18, M.rust), -0.12, 0.435, 0.06);
    add(g, box(0.22, 0.04, 0.16, M.ochre), -0.12, 0.478, 0.05);
    var bowl = new T.Mesh(new T.SphereGeometry(0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new T.MeshStandardMaterial({ color: 0xB9724F, roughness: .8, side: T.DoubleSide }));
    bowl.rotation.x = Math.PI; bowl.castShadow = true;
    add(g, bowl, 0.16, 0.52, -0.02);
    return g;
  }

  function sideTable(h, r, mat) {
    var g = group('side');
    add(g, cyl(r, r, 0.05, 18, mat || M.brass), 0, h, 0);
    add(g, cyl(r * 0.55, r * 0.75, h, 14, mat || M.brass), 0, h / 2, 0);
    return g;
  }

  /* Dining table, `n` covers, with chairs. */
  function diningSet(n, w, d) {
    var g = group('dining');
    w = w || 1.90; d = d || 0.95;
    add(g, box(w, 0.06, d, M.walnut), 0, 0.75, 0);
    add(g, box(w * 0.7, 0.10, 0.14, M.oak), 0, 0.66, 0);
    [-1, 1].forEach(function (s) {
      add(g, box(0.10, 0.72, d - 0.16, M.oak), s * (w / 2 - 0.22), 0.36, 0);
    });
    var perSide = Math.ceil((n - 2) / 2);
    for (var i = 0; i < perSide; i++) {
      var cx = -((perSide - 1) / 2) * 0.72 + i * 0.72;
      var a = diningChair(); a.position.set(cx, 0, d / 2 + 0.28); a.rotation.y = Math.PI; g.add(a);
      var b = diningChair(); b.position.set(cx, 0, -d / 2 - 0.28); g.add(b);
    }
    [-1, 1].forEach(function (s) {
      var c = diningChair();
      c.position.set(s * (w / 2 + 0.30), 0, 0);
      c.rotation.y = s * Math.PI / 2; g.add(c);
    });
    // runner + pottery
    var run = box(w - 0.30, 0.008, 0.34, M.rugWarm); run.castShadow = false;
    add(g, run, 0, 0.785, 0);
    add(g, cyl(0.06, 0.09, 0.24, 14, M.terra), -0.30, 0.90, 0);
    add(g, cyl(0.05, 0.07, 0.17, 14, M.ochre), 0.0, 0.865, 0.02);
    add(g, cyl(0.04, 0.06, 0.13, 14, M.cream), 0.26, 0.845, -0.02);
    return g;
  }

  /* ------------------------------------------------------------- storage */
  /* Sideboard / console with cane fronts — closed storage, the practical half
     of the brief. */
  function sideboard(w, h, d) {
    var g = group('sideboard');
    h = h || 0.80; d = d || 0.42;
    add(g, box(w, h - 0.12, d, M.oak), 0, 0.12 + (h - 0.12) / 2, 0);
    var doors = Math.max(2, Math.round(w / 0.55));
    for (var i = 0; i < doors; i++) {
      var cw = (w - 0.08) / doors - 0.03;
      var f = box(cw, h - 0.26, 0.02, M.cane);
      add(g, f, -w / 2 + 0.04 + (i + 0.5) * ((w - 0.08) / doors), 0.12 + (h - 0.12) / 2, d / 2 + 0.011);
      add(g, cyl(0.012, 0.012, 0.10, 8, M.brass),
        -w / 2 + 0.04 + (i + 0.5) * ((w - 0.08) / doors), 0.12 + (h - 0.12) / 2, d / 2 + 0.035);
    }
    add(g, box(w + 0.04, 0.04, d + 0.04, M.walnut), 0, h, 0);
    [-1, 1].forEach(function (s) {
      add(g, box(0.05, 0.12, 0.05, M.walnut), s * (w / 2 - 0.10), 0.06, d / 2 - 0.08);
      add(g, box(0.05, 0.12, 0.05, M.walnut), s * (w / 2 - 0.10), 0.06, -d / 2 + 0.08);
    });
    return g;
  }

  /* Open shelving — baskets, books, plants. */
  function shelf(w, h, d, shelves) {
    var g = group('shelf');
    d = d || 0.32; shelves = shelves || 4;
    [-1, 1].forEach(function (s) { add(g, box(0.04, h, d, M.oak), s * (w / 2 - 0.02), h / 2, 0); });
    for (var i = 0; i <= shelves; i++) {
      add(g, box(w, 0.035, d, M.oak), 0, i * (h / shelves), 0);
    }
    add(g, box(w, 0.02, 0.02, M.oak), 0, h / 2, -d / 2);
    // contents
    var cols = [M.rust, M.ochre, M.olive, M.terra, M.cream, M.walnut];
    for (var s2 = 0; s2 < shelves; s2++) {
      var yy = s2 * (h / shelves) + 0.02;
      var n = 3 + Math.floor(Math.random() * 3);
      for (var k = 0; k < n; k++) {
        var bw = 0.05 + Math.random() * 0.05, bh = 0.16 + Math.random() * 0.10;
        add(g, box(bw, bh, d * 0.7, cols[(s2 + k) % cols.length]),
          -w / 2 + 0.10 + k * 0.10, yy + bh / 2, 0);
      }
      if (s2 % 2 === 1) {
        add(g, cyl(0.13, 0.11, 0.16, 14, M.rattan), w / 2 - 0.22, yy + 0.08, 0);
      }
    }
    return g;
  }

  /* Fitted wardrobe run — the practical answer to four bedrooms. */
  function wardrobe(w, h, d) {
    var g = group('wardrobe');
    h = h || 2.40; d = d || 0.60;
    add(g, box(w, h, d, M.oak), 0, h / 2, 0);
    var doors = Math.max(2, Math.round(w / 0.60));
    for (var i = 0; i < doors; i++) {
      var cw = w / doors - 0.02;
      var f = box(cw, h - 0.06, 0.02, i % 2 ? M.cane : M.oak);
      add(g, f, -w / 2 + (i + 0.5) * (w / doors), h / 2, d / 2 + 0.012);
      add(g, cyl(0.01, 0.01, 0.22, 8, M.brass), -w / 2 + (i + 0.5) * (w / doors) + cw / 2 - 0.05, h / 2, d / 2 + 0.035);
    }
    return g;
  }

  /* --------------------------------------------------------------- beds */
  function bed(w, l) {
    var g = group('bed');
    add(g, box(w, 0.28, l, M.oak), 0, 0.14, 0);                  // storage base
    add(g, box(w - 0.06, 0.26, l - 0.06, M.white), 0, 0.41, 0);  // mattress
    add(g, box(w, 0.10, l - 0.9, M.cream), 0, 0.55, 0.35);       // throw
    var thr = box(w, 0.04, 0.75, M.rugWarm); thr.castShadow = false;
    add(g, thr, 0, 0.56, l / 2 - 0.55);
    /* Cane headboard with a flattened arched top. Extruding one profile is
       both simpler and safer than stacking a panel and a half-cylinder: a
       part-angle CylinderGeometry is not centred on its own origin, so that
       version kept landing as a lopsided quarter-round. */
    var hw = (w + 0.08) / 2, ht = 0.95, rise = 0.42;
    var sh = new T.Shape();
    sh.moveTo(-hw, 0);
    sh.lineTo(hw, 0);
    sh.lineTo(hw, ht);
    sh.quadraticCurveTo(hw, ht + rise, 0, ht + rise);
    sh.quadraticCurveTo(-hw, ht + rise, -hw, ht);
    sh.lineTo(-hw, 0);
    var hb = new T.Mesh(
      new T.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 16 }),
      new T.MeshStandardMaterial({ map: V.TX.cane, roughness: .85, side: T.DoubleSide }));
    hb.castShadow = true; hb.receiveShadow = true;
    add(g, hb, 0, 0.28, -l / 2 - 0.07);
    // pillows
    [-1, 1].forEach(function (s) {
      var p = cushion(w / 2 - 0.10, 0.16, 0.36, M.white);
      p.rotation.x = -0.25;
      add(g, p, s * (w / 4), 0.60, -l / 2 + 0.28);
    });
    add(g, cushion(0.42, 0.14, 0.30, M.ochre), -0.18, 0.72, -l / 2 + 0.50);
    add(g, cushion(0.36, 0.13, 0.26, M.rust), 0.22, 0.71, -l / 2 + 0.52);
    return g;
  }

  function nightstand() {
    var g = group('nightstand');
    add(g, box(0.44, 0.46, 0.36, M.oak), 0, 0.32, 0);
    add(g, box(0.38, 0.16, 0.02, M.cane), 0, 0.36, 0.19);
    [[-0.16, -0.13], [0.16, -0.13], [-0.16, 0.13], [0.16, 0.13]].forEach(function (p) {
      add(g, box(0.035, 0.09, 0.035, M.walnut), p[0], 0.045, p[1]);
    });
    return g;
  }

  /* ------------------------------------------------------------- kitchen */
  function kitchenRun(w, opts) {
    opts = opts || {};
    var g = group('kitchen');
    var d = 0.62;
    add(g, box(w, 0.86, d, M.oak), 0, 0.43, 0);
    add(g, box(w + 0.04, 0.05, d + 0.03, M.stoneTop), 0, 0.885, 0);
    var doors = Math.max(2, Math.round(w / 0.55));
    for (var i = 0; i < doors; i++) {
      var f = box(w / doors - 0.03, 0.78, 0.02, i % 3 === 1 ? M.cane : M.olive);
      add(g, f, -w / 2 + (i + 0.5) * (w / doors), 0.44, d / 2 + 0.012);
      add(g, box(w / doors - 0.20, 0.02, 0.02, M.brass), -w / 2 + (i + 0.5) * (w / doors), 0.78, d / 2 + 0.03);
    }
    if (opts.sink) {
      add(g, box(0.56, 0.03, 0.42, M.steel), opts.sink, 0.905, 0);
      var tap = cyl(0.018, 0.018, 0.34, 8, M.brass); add(g, tap, opts.sink, 1.07, -0.18);
      add(g, box(0.02, 0.02, 0.16, M.brass), opts.sink, 1.24, -0.10);
    }
    if (opts.hob) {
      add(g, box(0.58, 0.02, 0.48, M.charcoal), opts.hob, 0.918, 0);
    }
    if (opts.uppers) {
      add(g, box(w * 0.75, 0.70, 0.34, M.oak), 0, 1.90, -d / 2 + 0.17);
      var ud = Math.max(2, Math.round(w * 0.75 / 0.55));
      for (var k = 0; k < ud; k++) {
        add(g, box(w * 0.75 / ud - 0.03, 0.64, 0.02, k % 2 ? M.cane : M.olive),
          -w * 0.375 + (k + 0.5) * (w * 0.75 / ud), 1.90, -d / 2 + 0.35);
      }
      // open oak shelf with pottery, so the run is not a wall of doors
      add(g, box(w * 0.55, 0.04, 0.24, M.walnut), 0, 1.42, -d / 2 + 0.12);
      for (var q = 0; q < 5; q++) {
        add(g, cyl(0.045 + Math.random() * 0.02, 0.055, 0.14 + Math.random() * 0.08, 12,
          [M.terra, M.ochre, M.cream, M.rust, M.olive][q]),
          -w * 0.22 + q * 0.11, 1.52, -d / 2 + 0.12);
      }
    }
    return g;
  }

  /* Prep island. `stools` adds a breakfast bar — only pass it where the room
     is deep enough to leave 0.75 m of circulation on both sides, which the
     3.80 x 2.95 kitchen here is not. */
  function island(w, d, stools) {
    var g = group('island');
    add(g, box(w, 0.86, d, M.walnut), 0, 0.43, 0);
    add(g, box(w + 0.12, 0.06, d + 0.12, M.white), 0, 0.89, 0);
    var doors = Math.max(2, Math.round(w / 0.55));
    for (var k = 0; k < doors; k++) {
      add(g, box(w / doors - 0.04, 0.74, 0.02, k % 2 ? M.cane : M.walnut),
        -w / 2 + (k + 0.5) * (w / doors), 0.44, -d / 2 - 0.012);
    }
    if (stools) {
      for (var i = 0; i < 3; i++) {
        var s = stool(0.66, M.rattan);
        s.position.set(-0.62 + i * 0.62, 0, d / 2 + 0.42);
        g.add(s);
      }
    }
    add(g, cyl(0.10, 0.13, 0.22, 14, M.terra), -w / 4, 1.03, 0);
    add(g, box(0.30, 0.04, 0.22, M.oak), w / 4, 0.94, 0.02);
    return g;
  }

  /* --------------------------------------------------------- bath fixtures */
  function bathroom(w, d, opt) {
    opt = opt || {};
    var g = group('bath');
    // vanity
    add(g, box(Math.min(1.2, w - 0.3), 0.72, 0.46, M.walnut), -w / 2 + 0.65, 0.36 + 0.08, -d / 2 + 0.25);
    add(g, box(Math.min(1.24, w - 0.26), 0.05, 0.50, M.white), -w / 2 + 0.65, 0.80, -d / 2 + 0.25);
    var basin = new T.Mesh(new T.SphereGeometry(0.20, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new T.MeshStandardMaterial({ color: 0xF6F2EA, roughness: .35, side: T.DoubleSide }));
    basin.rotation.x = Math.PI; basin.castShadow = true;
    add(g, basin, -w / 2 + 0.65, 0.95, -d / 2 + 0.25);
    add(g, cyl(0.016, 0.016, 0.26, 8, M.brass), -w / 2 + 0.65, 0.95, -d / 2 + 0.05);
    // round mirror + sconces
    var mir = cyl(0.28, 0.28, 0.03, 24, new T.MeshStandardMaterial({ color: 0xD8E4E6, roughness: .05, metalness: .9 }));
    mir.rotation.x = Math.PI / 2;
    add(g, mir, -w / 2 + 0.65, 1.55, -d / 2 + 0.06);
    add(g, cyl(0.30, 0.30, 0.02, 24, M.brass), -w / 2 + 0.65, 1.55, -d / 2 + 0.045).rotation.x = Math.PI / 2;
    // wc
    add(g, box(0.36, 0.42, 0.60, M.white), w / 2 - 0.30, 0.21, d / 2 - 0.40);
    add(g, box(0.36, 0.36, 0.16, M.white), w / 2 - 0.30, 0.60, d / 2 - 0.66);
    // shower tray + glass screen
    if (opt.shower !== false) {
      add(g, box(0.90, 0.06, Math.min(0.95, d - 0.4), M.floorTerra), w / 2 - 0.48, 0.03, -d / 2 + 0.55);
      var sc = box(0.03, 2.00, Math.min(0.95, d - 0.4), M.glass); sc.castShadow = false;
      add(g, sc, w / 2 - 0.93, 1.00, -d / 2 + 0.55);
      add(g, cyl(0.04, 0.04, 0.03, 12, M.brass), w / 2 - 0.48, 1.98, -d / 2 + 0.55);
    }
    var r = rug(Math.min(0.9, w - 0.5), 0.55, M.rugOlive); r.position.set(0, 0, d / 2 - 0.75); g.add(r);
    return g;
  }

  /* ------------------------------------------------------------- planting */
  function pot(r, h) {
    var g = group('pot');
    add(g, cyl(r, r * 0.78, h, 16, M.pot), 0, h / 2, 0);
    add(g, cyl(r * 1.06, r * 1.06, 0.05, 16, M.pot), 0, h - 0.02, 0);
    return g;
  }

  /* Leafy indoor plant — monstera-ish, deliberately loose. */
  function plant(scale) {
    scale = scale || 1;
    var g = group('plant');
    g.add(pot(0.22 * scale, 0.30 * scale));
    var n = 9;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + Math.random(), tilt = 0.5 + Math.random() * 0.6;
      var len = (0.45 + Math.random() * 0.35) * scale;
      var stem = cyl(0.012, 0.016, len, 6, M.leaf);
      stem.position.set(Math.cos(a) * 0.05, 0.30 * scale + len / 2 * Math.cos(tilt * 0.5), Math.sin(a) * 0.05);
      stem.rotation.z = -Math.cos(a) * tilt * 0.5; stem.rotation.x = Math.sin(a) * tilt * 0.5;
      g.add(stem);
      // an elongated, tilted blade rather than a flat disc — a lily pad on a
      // stick is the single fastest way to make a 3D plant look fake
      var lf = new T.Mesh(new T.SphereGeometry(0.15 * scale, 9, 6),
        i % 2 ? M.leaf : M.leafLight);
      lf.scale.set(0.52, 0.11, 1.25);
      var reach = 0.05 + len * Math.sin(tilt * 0.5);
      lf.position.set(
        Math.cos(a) * (reach + 0.13 * scale),
        0.30 * scale + len * Math.cos(tilt * 0.5) + 0.02,
        Math.sin(a) * (reach + 0.13 * scale));
      lf.rotation.order = 'YZX';
      lf.rotation.y = -a;
      lf.rotation.z = -0.30 - tilt * 0.30;
      lf.rotation.x = (Math.random() - 0.5) * 0.7;
      lf.castShadow = true;
      g.add(lf);
    }
    return g;
  }

  /* Hanging trailing plant — pothos in a macramé sling. */
  function hangPlant(drop) {
    var g = group('hangplant');
    add(g, cyl(0.006, 0.006, drop, 6, M.cream), 0, -drop / 2, 0);
    g.add(pot(0.15, 0.18).translateY(-drop - 0.18));
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2, len = 0.4 + Math.random() * 0.5;
      var v = cyl(0.008, 0.008, len, 5, M.leafLight);
      v.position.set(Math.cos(a) * 0.13, -drop - 0.18 - len / 2, Math.sin(a) * 0.13);
      v.rotation.z = Math.cos(a) * 0.2; v.rotation.x = -Math.sin(a) * 0.2;
      g.add(v);
      for (var k = 1; k <= 3; k++) {
        var lf = sphere(0.045, M.leaf, 8);
        lf.scale.set(1, 0.4, 1);
        lf.position.set(Math.cos(a) * (0.13 + k * 0.03), -drop - 0.18 - len * k / 3.2, Math.sin(a) * (0.13 + k * 0.03));
        g.add(lf);
      }
    }
    return g;
  }

  /* Olive / ficus garden tree. `spread` is the canopy diameter in metres —
     a 6.70 m deep garden cannot carry the 4 m canopies a bigger plot would. */
  function tree(h, spread, leafMat) {
    var g = group('tree');
    spread = (spread || h * 0.55) * 0.52;
    var tr = cyl(h * 0.035, h * 0.06, h * 0.6, 8, M.trunk);
    add(g, tr, 0, h * 0.3, 0);
    for (var i = 0; i < 4; i++) {
      var a = i / 4 * Math.PI * 2 + 0.4;
      var br = cyl(h * 0.018, h * 0.028, h * 0.35, 6, M.trunk);
      br.position.set(Math.cos(a) * spread * 0.18, h * 0.66, Math.sin(a) * spread * 0.18);
      br.rotation.z = -Math.cos(a) * 0.6; br.rotation.x = Math.sin(a) * 0.6;
      g.add(br);
    }
    var lm = leafMat || M.leaf;
    var blobs = [[0, h * 0.86, 0, spread * 0.62], [spread * 0.30, h * 0.76, spread * 0.16, spread * 0.44],
    [-spread * 0.28, h * 0.79, -spread * 0.20, spread * 0.46], [spread * 0.10, h * 0.98, -spread * 0.26, spread * 0.36],
    [-spread * 0.16, h * 0.95, spread * 0.28, spread * 0.34]];
    blobs.forEach(function (b, i) {
      var s = sphere(b[3], i % 2 ? lm : M.leafLight, 12);
      s.scale.y = 0.8; s.position.set(b[0], b[1], b[2]);
      g.add(s);
    });
    return g;
  }

  /* Date palm — the plant that sets the register of the whole street in the
     reference: a tall clear trunk with a ring of arching fronds. */
  function palm(h, spread) {
    var g = group('palm');
    spread = spread || h * 0.58;             // full crown diameter
    var seg = 9, th = h * 0.70;
    for (var i = 0; i < seg; i++) {
      var t = i / seg;
      var r = 0.21 * (1 - t * 0.38);
      var sg = cyl(r, r * 1.05, th / seg + 0.02, 9, M.trunk);
      sg.position.set(Math.sin(t * 2.0) * h * 0.026, th * t + th / seg / 2, 0);
      g.add(sg);
    }

    /* A frond is a NARROW feather, not a paddle: eight overlapping blades
       0.11 m wide strung along an arc that rises a little and then falls hard.
       Width and droop are what separate a date palm from a fern — earlier
       passes had both wrong and the crown read as bracken. */
    function frond(a, len, rise, drop, mat, wide) {
      for (var q = 1; q <= 8; q++) {
        var u = q / 8, rr = len * u;
        var yy = len * (rise * u - drop * u * u);
        var bl = new T.Mesh(new T.SphereGeometry(1, 7, 4), mat);
        bl.scale.set(len * 0.105, 0.030, (wide || 0.115) * (1.2 - u * 0.7));
        bl.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr);
        bl.rotation.order = 'YZX';
        bl.rotation.y = -a;
        bl.rotation.z = -Math.atan(rise - 2 * drop * u) * 0.85;
        bl.castShadow = q <= 4;
        g.add(bl);
      }
    }

    var N = 18, top = th + 0.16, R = spread / 2;
    for (var k = 0; k < N; k++) {
      var a = k / N * Math.PI * 2 + 0.35;
      var tier = k % 3;
      var len = R * (0.70 + tier * 0.15) * (0.92 + Math.random() * 0.16);
      var crownG = group('frond');
      var rise = [0.62, 0.30, 0.02][tier], drop = [1.05, 0.95, 0.80][tier];
      var sub = group('f'); g.add(sub); sub.position.y = top;
      var save = g; g = sub;
      frond(a, len, rise, drop, k % 2 ? M.leaf : M.leafLight);
      g = save;
    }
    // the skirt of spent fronds every date palm carries under the crown
    for (var d = 0; d < 9; d++) {
      var ad = d / 9 * Math.PI * 2 + 0.9;
      var sub2 = group('skirt'); g.add(sub2); sub2.position.y = top - 0.12;
      var save2 = g; g = sub2;
      frond(ad, R * 0.40, -0.35, 0.85, M.trunkLight, 0.095);
      g = save2;
    }
    var crown = sphere(0.27, M.trunkLight, 9);
    crown.scale.y = 0.75;
    g.add(crown.translateY(th + 0.06));
    return g;
  }

  /* Agave / spiky succulent for the ground-cover beds. */
  function agave(r) {
    var g = group('agave');
    r = r || 0.55;
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * Math.PI * 2 + Math.random() * 0.25;
      // outer blades lie almost flat; only the heart stands up
      var lean = (i % 4 === 0) ? 0.30 : 0.75 + (i % 3) * 0.22;
      var L = r * (0.80 + (i % 3) * 0.16);
      var bl = new T.Mesh(new T.ConeGeometry(0.085, L, 4), i % 2 ? M.agaveA : M.agaveB);
      bl.position.set(Math.cos(a) * L * 0.30, 0.10 + Math.cos(lean) * L * 0.42,
        Math.sin(a) * L * 0.30);
      bl.rotation.order = 'YZX';
      bl.rotation.y = -a;
      bl.rotation.z = lean;
      bl.castShadow = true;
      g.add(bl);
    }
    return g;
  }

  /* Bougainvillea — the magenta the reference plants either side of the door. */
  function bougainvillea(h, r) {
    var g = group('bougainvillea');
    h = h || 1.6; r = r || 0.55;
    add(g, cyl(0.05, 0.07, h * 0.42, 7, M.trunk), 0, h * 0.21, 0);
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2, rr = Math.pow(Math.random(), 0.6) * r;
      var s = sphere(0.13 + Math.random() * 0.09,
        i % 3 === 0 ? M.leaf : (i % 3 === 1 ? M.bougain : M.bougainDeep), 8);
      s.position.set(Math.cos(a) * rr, h * 0.42 + Math.random() * h * 0.55,
        Math.sin(a) * rr);
      g.add(s);
    }
    return g;
  }

  /* Tall clumping bamboo / screening hedge along a boundary. */
  function hedge(len, h, thick) {
    var g = group('hedge');
    var n = Math.max(3, Math.round(len / 0.5));
    for (var i = 0; i < n; i++) {
      var s = sphere(thick * (0.55 + Math.random() * 0.25), i % 2 ? M.leaf : M.leafLight, 10);
      s.scale.set(1, (h / thick) * (0.5 + Math.random() * 0.18), 1);
      s.position.set(-len / 2 + (i + 0.5) * (len / n), h * 0.45, (Math.random() - 0.5) * thick * 0.4);
      g.add(s);
    }
    return g;
  }

  /* Ornamental grasses / low bed planting. */
  function bed_(len, wid) {
    var g = group('bed');
    var n = Math.max(4, Math.round(len * wid * 5));
    var cols = [M.olive, M.leafLight, M.sage, M.ochre];
    for (var i = 0; i < n; i++) {
      var s = sphere(0.16 + Math.random() * 0.12, cols[i % cols.length], 8);
      s.scale.y = 1.3 + Math.random();
      s.position.set((Math.random() - 0.5) * len, 0.22 + Math.random() * 0.14, (Math.random() - 0.5) * wid);
      g.add(s);
    }
    return g;
  }

  /* ---------------------------------------------------------- lighting kit */
  function lantern(r, drop) {
    var g = group('lantern');
    add(g, cyl(0.005, 0.005, drop, 5, M.charcoal), 0, -drop / 2, 0);
    var sh = new T.Mesh(new T.SphereGeometry(r, 12, 9),
      new T.MeshStandardMaterial({ map: V.TX.cane, roughness: .9, side: T.DoubleSide, transparent: true, opacity: .92 }));
    add(g, sh, 0, -drop - r * 0.7, 0);
    var bulb = sphere(r * 0.4, M.lampWarm, 8); bulb.castShadow = false;
    add(g, bulb, 0, -drop - r * 0.7, 0);
    g.userData.bulb = bulb;
    return g;
  }

  function floorLamp() {
    var g = group('floorlamp');
    add(g, cyl(0.16, 0.18, 0.03, 16, M.walnut), 0, 0.015, 0);
    add(g, cyl(0.02, 0.02, 1.45, 8, M.brass), 0, 0.73, 0);
    var sh = new T.Mesh(new T.CylinderGeometry(0.20, 0.26, 0.30, 16, 1, true),
      new T.MeshStandardMaterial({ color: 0xF0E2C6, roughness: .9, side: T.DoubleSide }));
    add(g, sh, 0, 1.55, 0);
    var bulb = sphere(0.07, M.lampWarm, 8); bulb.castShadow = false;
    add(g, bulb, 0, 1.52, 0);
    g.userData.bulb = bulb;
    return g;
  }

  function bollard(h) {
    var g = group('bollard');
    add(g, cyl(0.05, 0.06, h, 10, M.charcoal), 0, h / 2, 0);
    var b = cyl(0.055, 0.055, 0.10, 10, M.lampWarm); b.castShadow = false;
    add(g, b, 0, h - 0.05, 0);
    g.userData.bulb = b;
    return g;
  }

  /* --------------------------------------------------------- kids' pieces */
  function teepee(h) {
    var g = group('teepee');
    h = h || 1.55;
    var r = h * 0.42;
    var cone = new T.Mesh(new T.ConeGeometry(r, h, 4, 1, true),
      new T.MeshStandardMaterial({ color: 0xF2EADA, roughness: .95, side: T.DoubleSide }));
    cone.rotation.y = Math.PI / 4; cone.castShadow = true;
    add(g, cone, 0, h / 2, 0);
    // the poles must lean IN toward the apex: rotating about Z by +φ tips the
    // top toward -X, and about X by -φ tips it toward -Z
    for (var i = 0; i < 4; i++) {
      var a = i / 4 * Math.PI * 2 + Math.PI / 4;
      var p = cyl(0.018, 0.022, h * 1.08, 6, M.walnut);
      p.position.set(Math.cos(a) * r * 0.5, h * 0.54, Math.sin(a) * r * 0.5);
      p.rotation.z = Math.cos(a) * 0.40;
      p.rotation.x = -Math.sin(a) * 0.40;
      g.add(p);
    }
    add(g, box(r * 1.1, 0.03, r * 1.1, M.rugKids), 0, 0.015, 0).castShadow = false;
    [[-0.2, 0.1], [0.18, -0.15], [0.05, 0.24]].forEach(function (p, i) {
      add(g, cushion(0.30, 0.14, 0.30, [M.ochre, M.terra, M.olive][i]), p[0], 0.10, p[1]);
    });
    return g;
  }

  /* Low open toy storage — the single most practical thing in a playroom:
     children can reach it, and it puts itself away. */
  function toyStorage(w) {
    var g = group('toystore');
    var h = 0.62, d = 0.38;
    add(g, box(w, h, d, M.oak), 0, h / 2, 0);
    var cells = Math.max(3, Math.round(w / 0.42));
    for (var i = 0; i < cells; i++) {
      var cw = w / cells - 0.06;
      var basket = box(cw, 0.30, d - 0.08, [M.rattan, M.terra, M.olive, M.ochre][i % 4]);
      add(g, basket, -w / 2 + (i + 0.5) * (w / cells), 0.19, 0.03);
      add(g, box(cw * 0.5, 0.02, 0.02, M.walnut), -w / 2 + (i + 0.5) * (w / cells), 0.30, d / 2 - 0.02);
    }
    add(g, box(w + 0.04, 0.04, d + 0.04, M.walnut), 0, h, 0);
    return g;
  }

  function kidsTable() {
    var g = group('kidstable');
    add(g, cyl(0.44, 0.44, 0.04, 20, M.oak), 0, 0.48, 0);
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * Math.PI * 2;
      var l = cyl(0.026, 0.026, 0.48, 6, M.walnut);
      l.position.set(Math.cos(a) * 0.30, 0.24, Math.sin(a) * 0.30);
      l.rotation.x = Math.sin(a) * 0.10; l.rotation.z = -Math.cos(a) * 0.10;
      g.add(l);
    }
    for (var k = 0; k < 3; k++) {
      var a2 = k / 3 * Math.PI * 2 + 0.6;
      var st = stool(0.30, [M.terra, M.ochre, M.olive][k]);
      st.position.set(Math.cos(a2) * 0.72, 0, Math.sin(a2) * 0.72);
      g.add(st);
    }
    return g;
  }

  /* Climbing / reading nook: a Pikler-style arch and a wall of pegs. */
  function playArch() {
    var g = group('playarch');
    var steps = 11;
    for (var i = 0; i < steps; i++) {
      var a = Math.PI * (i / (steps - 1));
      var r = 0.62;
      var rung = cyl(0.022, 0.022, 0.72, 8, M.oak);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, Math.sin(a) * r, -Math.cos(a) * r);
      g.add(rung);
    }
    [-1, 1].forEach(function (s) {
      var side = new T.Mesh(new T.TorusGeometry(0.62, 0.028, 8, 20, Math.PI),
        M.walnut);
      side.rotation.y = Math.PI / 2;
      side.position.set(s * 0.36, 0, 0);
      side.castShadow = true;
      g.add(side);
    });
    return g;
  }

  function beanbag(r, mat) {
    var g = group('beanbag');
    var b = sphere(r, mat || M.ochre, 14);
    b.scale.set(1, 0.72, 1);
    add(g, b, 0, r * 0.68, 0);
    return g;
  }

  /* ------------------------------------------------------- outdoor pieces */
  function lounger() {
    var g = group('lounger');
    add(g, box(0.72, 0.10, 1.90, M.teak), 0, 0.34, 0);
    [[-0.30, -0.80], [0.30, -0.80], [-0.30, 0.80], [0.30, 0.80]].forEach(function (p) {
      add(g, box(0.06, 0.30, 0.06, M.teak), p[0], 0.15, p[1]);
    });
    var mat = box(0.66, 0.10, 1.80, M.cream); add(g, mat, 0, 0.44, 0);
    var bk = box(0.66, 0.10, 0.62, M.cream);
    bk.rotation.x = -0.75; add(g, bk, 0, 0.62, -0.72);
    add(g, cushion(0.34, 0.12, 0.24, M.terra), 0, 0.72, -0.52);
    return g;
  }

  function parasol(h, r) {
    var g = group('parasol');
    add(g, cyl(0.035, 0.045, h, 10, M.teak), 0, h / 2, 0);
    var canopy = new T.Mesh(new T.ConeGeometry(r, 0.42, 8),
      new T.MeshStandardMaterial({ color: 0xE7DAC2, roughness: .95, side: T.DoubleSide }));
    canopy.castShadow = true;
    add(g, canopy, 0, h - 0.05, 0);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      var rib = cyl(0.012, 0.012, r, 5, M.teak);
      rib.rotation.z = Math.PI / 2; rib.rotation.y = a;
      rib.position.set(Math.cos(a) * r / 2, h - 0.20, Math.sin(a) * r / 2);
      g.add(rib);
    }
    add(g, cyl(0.28, 0.32, 0.10, 14, M.charcoal), 0, 0.05, 0);
    return g;
  }

  /* Outdoor modular seating — same language as indoors, weatherproof frame. */
  function outdoorSofa(seats) {
    var g = group('outsofa');
    var w = seats * 0.80, d = 0.88;
    add(g, box(w, 0.30, d, M.teak), 0, 0.15, 0);
    add(g, box(w - 0.08, 0.16, d - 0.10, M.cream), 0, 0.38, 0.02);
    for (var i = 0; i < seats; i++) {
      var cx = -w / 2 + (i + 0.5) * (w / seats);
      add(g, cushion(w / seats - 0.06, 0.38, 0.18, M.cream), cx, 0.60, -d / 2 + 0.12);
      add(g, cushion(0.34, 0.32, 0.13, [M.terra, M.ochre, M.olive][i % 3]), cx, 0.68, -d / 2 + 0.26).rotation.x = -0.2;
    }
    return g;
  }

  /* Built-in bench with a kilim runner — seats a crowd, stores cushions. */
  function benchRun(len, mat) {
    var g = group('bench');
    add(g, box(len, 0.42, 0.55, mat || M.plaster), 0, 0.21, 0);
    add(g, box(len - 0.04, 0.10, 0.52, M.cream), 0, 0.47, 0);
    var n = Math.max(2, Math.round(len / 0.8));
    for (var i = 0; i < n; i++) {
      add(g, cushion(0.36, 0.34, 0.14, [M.terra, M.ochre, M.olive, M.rust][i % 4]),
        -len / 2 + (i + 0.5) * (len / n), 0.66, -0.19).rotation.x = -0.18;
    }
    return g;
  }

  function firepit(r) {
    var g = group('firepit');
    add(g, cyl(r, r * 1.05, 0.36, 20, M.plaster), 0, 0.18, 0);
    add(g, cyl(r * 0.82, r * 0.82, 0.06, 20, M.charcoal), 0, 0.36, 0);
    var fl = sphere(r * 0.5, new T.MeshStandardMaterial({
      color: 0xFF9C3C, emissive: 0xFF7A1A, emissiveIntensity: 1.4, roughness: 1
    }), 10);
    fl.scale.set(1, 1.3, 1); fl.castShadow = false;
    add(g, fl, 0, 0.46, 0);
    g.userData.bulb = fl;
    return g;
  }

  /* Outdoor kitchen / BBQ counter under the pergola. */
  function outdoorKitchen(w) {
    var g = group('outkitchen');
    add(g, box(w, 0.90, 0.66, M.plaster), 0, 0.45, 0);
    add(g, box(w + 0.06, 0.06, 0.72, M.floorOut), 0, 0.93, 0);
    add(g, box(0.70, 0.06, 0.46, M.charcoal), -w / 4, 0.97, 0);
    add(g, box(0.50, 0.03, 0.40, M.steel), w / 4, 0.965, 0);
    var f = box(w * 0.4, 0.60, 0.02, M.cane);
    add(g, f, w / 4, 0.50, 0.34);
    add(g, cyl(0.018, 0.018, 0.30, 8, M.brass), w / 4, 1.10, -0.14);
    return g;
  }

  return {
    place: place, rug: rug, cushion: cushion, pouf: pouf, macrame: macrame,
    sofa: sofa, armchair: armchair, hangChair: hangChair, diningChair: diningChair,
    stool: stool, coffeeTable: coffeeTable, sideTable: sideTable, diningSet: diningSet,
    sideboard: sideboard, shelf: shelf, wardrobe: wardrobe, bed: bed,
    nightstand: nightstand, kitchenRun: kitchenRun, island: island, bathroom: bathroom,
    pot: pot, plant: plant, hangPlant: hangPlant, tree: tree, hedge: hedge, bed_: bed_,
    palm: palm, agave: agave, bougainvillea: bougainvillea,
    lantern: lantern, floorLamp: floorLamp, bollard: bollard,
    teepee: teepee, toyStorage: toyStorage, kidsTable: kidsTable, playArch: playArch,
    beanbag: beanbag, lounger: lounger, parasol: parasol, outdoorSofa: outdoorSofa,
    benchRun: benchRun, firepit: firepit, outdoorKitchen: outdoorKitchen
  };
})();
