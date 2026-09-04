/* ---------------------------------------------------------------------------
   VDLC Villa B — the building: shell, openings, stairs and the furnishing of
   every room, level by level.

   Room boxes below are interior clear dimensions read off the dimensioned
   plans. Ground = reception / dining / kitchen / entrance / guest WC / driver
   suite. First = four master bedrooms, each en-suite, plus a dressing room and
   a north terrace. Penthouse = the children's floor: playroom, bathroom and
   two roof terraces, one of them under the existing roof pergola.
--------------------------------------------------------------------------- */
'use strict';

var BUILDING = (function () {
  var T = THREE, V = VILLA, F = FURN, M = V.M, S = V.S;
  var box = V.box, cyl = V.cyl, sphere = V.sphere, group = V.group,
      slabAt = V.slabAt, wall = V.wall, place = F.place, px = V.px, pz = V.pz;

  var ROOMS = [];          // for the 3D labels
  function label(level, ar, en, x, y, base) {
    ROOMS.push({ level: level, ar: ar, en: en, x: x, y: y, base: base });
  }

  /* A floor slab with its finish laid so that the walking surface is exactly
     `base`. Putting the finish on top of `base` instead sank every piece of
     furniture 2 cm and buried the rugs under the tiles. */
  function floor(g, x0, y0, x1, y1, base, mat, thick) {
    // 0.38 slab + 0.02 finish = the 0.40 the 3.40 floor-to-floor leaves over a
    // 3.00 clear height; a thinner default opened an 80 mm slot in the facade
    // between the top of one storey's walls and the underside of the next slab
    thick = thick || 0.38;
    var s = slabAt(x0, y0, x1, y1, base - thick - 0.02, thick, M.slab);
    s.castShadow = false; g.add(s);
    var f = slabAt(x0, y0, x1, y1, base - 0.02, 0.02, mat);
    f.castShadow = false; g.add(f);
    return f;
  }

  /* Straight flight with a quarter landing, running north (from yBot to yTop). */
  function stair(g, x0, x1, yBot, yTop, base, rise) {
    var w = x1 - x0, run = yTop - yBot;
    var n = Math.max(2, Math.round(rise / 0.185));
    var r = rise / n, go = run / n;
    for (var i = 0; i < n; i++) {
      var st = slabAt(x0, yBot + i * go, x1, yBot + (i + 1) * go + 0.02, base + i * r, r + 0.02, M.stoneTop);
      g.add(st);
    }
    // stringer wall on the west + a slim oak handrail on the east
    var sw = box(0.10, rise + 0.9, run, M.plaster);
    sw.position.set(px(x0 - 0.05), base + (rise + 0.9) / 2 - 0.4, pz((yBot + yTop) / 2));
    g.add(sw);
    for (var k = 0; k <= 6; k++) {
      var t = k / 6;
      var post = cyl(0.014, 0.014, 0.95, 6, M.walnut);
      post.position.set(px(x1 - 0.06), base + rise * t + 0.47, pz(yBot + run * t));
      g.add(post);
    }
    var rail = box(0.05, 0.05, Math.hypot(run, rise), M.walnut);
    rail.position.set(px(x1 - 0.06), base + rise / 2 + 0.95, pz((yBot + yTop) / 2));
    rail.rotation.x = -Math.atan2(rise, run);
    g.add(rail);
    return g;
  }

  /* Parapet / balustrade around a terrace edge. */
  function parapet(g, pts, base, h, mat) {
    for (var i = 0; i < pts.length - 1; i++) {
      wall(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1],
        { t: 0.14, h: h || 1.05, base: base, mat: mat || M.plaster });
    }
    return g;
  }

  /* ====================================================== GROUND FLOOR === */
  function ground(shell, furn) {
    var b = S.lv[0], h = S.ceil;

    floor(shell, S.bx0, S.by0, S.bx1, S.by1, b, M.floorIn);

    /* --- envelope ------------------------------------------------------- */
    // south (street) — entrance door, kitchen and driver-bath windows
    wall(shell, S.bx0, S.by0, S.bx1, S.by0, {
      base: b, h: h, openings: [
        { at: 0.70, w: 1.70, sill: 1.00, h: 1.40 },     // kitchen
        { at: 4.15, w: 1.10, sill: 0.00, h: 2.40, glass: false },  // front door
        { at: 6.55, w: 0.70, sill: 1.70, h: 0.80 }      // driver bath
      ]
    });
    // west — kitchen, service bath, and the three reception windows
    wall(shell, S.bx0, S.by0, S.bx0, S.by1, {
      base: b, h: h, openings: [
        { at: 0.85, w: 1.40, sill: 1.00, h: 1.35 },
        { at: 3.90, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 8.90, w: 1.00, sill: 0.90, h: 1.90 },
        { at: 10.55, w: 1.60, sill: 0.90, h: 1.90 },
        { at: 12.20, w: 1.00, sill: 0.90, h: 1.90 }
      ]
    });
    // east — driver suite, guest WC, dining and reception
    wall(shell, S.bx1, S.by0, S.bx1, S.by1, {
      base: b, h: h, openings: [
        { at: 0.35, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 2.10, w: 1.00, sill: 1.10, h: 1.20 },
        { at: 4.45, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 6.30, w: 1.80, sill: 0.90, h: 1.90 },
        { at: 9.80, w: 1.40, sill: 0.90, h: 1.90 },
        { at: 11.90, w: 1.00, sill: 0.90, h: 1.90 }
      ]
    });
    // north — the reception opens to the garden through two sliding walls
    wall(shell, S.bx0, S.by1, S.bx1, S.by1, {
      base: b, h: h, openings: [
        { at: 0.80, w: 2.60, sill: 0.02, h: 2.55 },
        { at: 4.20, w: 3.30, sill: 0.02, h: 2.55 }
      ]
    });

    /* --- entrance porch -------------------------------------------------- */
    floor(shell, 4.20, 3.10, 6.05, S.by0, b, M.floorOut, 0.12);
    var can = slabAt(4.05, 2.95, 6.20, S.by0 + 0.05, b + 2.70, 0.18, M.plaster);
    shell.add(can);
    [[4.35, 3.25], [5.90, 3.25]].forEach(function (p) {
      var c = cyl(0.10, 0.11, 2.70, 12, M.plaster);
      c.position.set(px(p[0]), b + 1.35, pz(p[1])); shell.add(c);
    });
    // three shallow entry steps
    for (var i = 0; i < 3; i++) {
      shell.add(slabAt(4.20 - i * 0.05, 3.10 - (i + 1) * 0.30, 6.05 + i * 0.05, 3.10 - i * 0.30,
        b - (i + 1) * 0.15, 0.15, M.floorOut));
    }

    /* --- partitions ------------------------------------------------------ */
    var P = { t: S.inn, h: h, base: b, mat: M.plasterIn };
    function part(x0, y0, x1, y1, ops) {
      wall(shell, x0, y0, x1, y1,
        { t: S.inn, h: h, base: b, mat: M.plasterIn, openings: ops || [] });
    }
    var DOOR = function (at, w) { return { at: at, w: w || 0.90, sill: 0, h: 2.20, glass: false }; };

    part(0.40, 7.10, 4.20, 7.10, [DOOR(2.60, 1.00)]);          // kitchen / hall
    part(4.20, 4.15, 4.20, 7.10);                              // kitchen / entrance
    part(4.20, 7.10, 4.20, 7.90);
    part(6.05, 4.15, 6.05, 9.45, [DOOR(1.90), DOOR(4.30)]);    // entrance / driver + WC
    part(6.05, 5.35, S.ix1, 5.35, [DOOR(0.60, 0.80)]);         // driver bath
    part(6.05, 7.90, S.ix1, 7.90);                             // driver room / WC
    part(6.05, 9.45, S.ix1, 9.45);                             // WC / dining
    part(0.40, 7.25, 2.40, 7.25);                              // service bath
    part(0.40, 9.10, 2.40, 9.10, [DOOR(1.30, 0.80)]);
    part(2.40, 7.10, 2.40, 9.30);
    part(0.40, 12.90, 3.55, 12.90);                            // reception / hall
    part(3.70, 9.30, 3.70, 12.90);                             // lobby / stair

    // dining is separated from the lobby by an arched opening, not a door
    part(6.05, 9.45, 6.05, 10.35);
    part(6.05, 12.10, 6.05, 12.90);
    V.archTop(shell, 6.05, 11.22, 1.75, b + 2.20, M.plasterIn, 0.12).rotation.y = Math.PI / 2;

    /* --- stair ----------------------------------------------------------- */
    stair(shell, 2.45, 3.65, 8.30, 12.40, b, S.lv[1] - S.lv[0]);
    // void through the first-floor slab is handled by the slab layout above

    /* ================================================ furnishing: ground = */
    /* Reception — the heart of the house. Two low modular sofas facing each
       other over a big kilim, a cane-and-oak media wall on the south side, and
       the whole north face glazed to the pool. */
    place(furn, F.rug(4.60, 3.10, M.rugWarm), 4.10, 15.35, 0, b + 0.001);
    place(furn, F.sofa(4), 4.10, 13.90, 0, b);                 // faces north/garden
    place(furn, F.sofa(3), 4.10, 16.80, 180, b);
    place(furn, F.armchair(), 1.55, 15.20, 100, b);
    place(furn, F.armchair(), 7.15, 16.85, -145, b);
    place(furn, F.coffeeTable(0.58), 4.10, 15.35, 0, b);
    place(furn, F.pouf(0.32, M.olive), 2.70, 16.30, 0, b);
    place(furn, F.pouf(0.30, M.terra), 5.60, 14.20, 0, b);
    place(furn, F.sideTable(0.52, 0.24), 6.90, 14.10, 0, b);
    place(furn, F.floorLamp(), 7.35, 16.60, 0, b);
    place(furn, F.shelf(1.80, 2.05, 0.32, 5), 1.90, 13.05, 180, b);
    place(furn, F.sideboard(1.90, 0.80, 0.44), 6.40, 13.05, 180, b);
    place(furn, F.plant(1.25), 0.90, 17.10, 0, b);
    place(furn, F.plant(1.0), 7.85, 15.30, 0, b);
    place(furn, F.plant(0.85), 0.95, 12.55, 0, b);
    var mac = F.macrame(1.20, 0.80);
    mac.position.set(px(4.60), b + 2.55, pz(12.86)); furn.add(mac);
    label('ground', 'الريسبشن', 'Reception', 4.10, 15.30, b);

    /* Dining — a walnut table for eight under a cane pendant. */
    place(furn, F.rug(2.60, 3.20, M.rugJute), 7.10, 11.20, 0, b + 0.001);
    place(furn, F.diningSet(8, 1.90, 0.95), 7.10, 11.20, 90, b);
    var pend = F.lantern(0.30, 0.85); pend.position.set(px(7.10), b + h, pz(11.20)); furn.add(pend);
    place(furn, F.sideboard(1.50, 0.82, 0.40), 7.10, 9.75, 0, b);
    place(furn, F.plant(0.9), 6.45, 12.55, 0, b);
    label('ground', 'السفرة', 'Dining', 7.10, 11.20, b);

    /* Kitchen — an L of olive-green doors with cane inserts, a walnut island
       with three rattan stools, and everything wipeable. */
    place(furn, F.kitchenRun(3.40, { sink: -0.6, uppers: true }), 2.20, 4.50, 180, b);
    place(furn, F.kitchenRun(2.30, { hob: 0.0 }), 0.75, 5.90, 90, b);
    place(furn, F.island(1.55, 0.78), 2.55, 5.95, 0, b);
    place(furn, F.plant(0.8), 3.90, 4.55, 0, b);
    var kl1 = F.lantern(0.16, 0.95); kl1.position.set(px(2.10), b + h, pz(5.95)); furn.add(kl1);
    var kl2 = F.lantern(0.16, 0.95); kl2.position.set(px(3.05), b + h, pz(5.95)); furn.add(kl2);
    label('ground', 'المطبخ', 'Kitchen', 2.30, 5.60, b);

    /* Entrance — console, mirror, a bench to sit and take shoes off, baskets. */
    place(furn, F.sideboard(1.20, 0.82, 0.36), 4.55, 4.55, 90, b);
    place(furn, F.plant(0.9), 5.75, 4.55, 0, b);
    place(furn, F.pouf(0.28, M.rust), 5.70, 6.10, 0, b);
    label('ground', 'المدخل', 'Entrance', 5.15, 6.60, b);

    /* Lobby / stair hall. */
    place(furn, F.rug(1.60, 2.60, M.rugOlive), 4.85, 11.00, 0, b + 0.001);
    place(furn, F.sideTable(0.72, 0.26, M.walnut), 4.10, 9.80, 0, b);
    place(furn, F.plant(1.05), 3.95, 12.45, 0, b);
    label('ground', 'الصالة', 'Lobby', 4.85, 10.60, b);

    /* Service rooms. */
    place(furn, F.bathroom(1.80, 1.75, { shower: true }), 1.35, 8.20, 0, b);
    place(furn, F.bathroom(1.95, 1.15, { shower: false }), 7.15, 4.75, 0, b);
    place(furn, F.bathroom(2.05, 1.35, { shower: false }), 7.15, 8.75, 0, b);
    label('ground', 'تواليت الضيوف', 'Guest WC', 7.15, 8.75, b);
    place(furn, F.bed(0.95, 1.95), 6.70, 6.95, 0, b);
    place(furn, F.wardrobe(0.90, 2.10, 0.55), 7.80, 6.95, -90, b);
    label('ground', 'غرفة السائق', 'Driver', 7.10, 6.90, b);
  }

  /* ======================================================= FIRST FLOOR === */
  function first(shell, furn) {
    var b = S.lv[1], h = S.ceil;

    floor(shell, S.bx0, S.by0, S.bx1, S.by1, b, M.floorIn);
    floor(shell, 3.90, S.by1, S.bx1, 18.55, b, M.floorOut, 0.22);   // north terrace

    wall(shell, S.bx0, S.by0, S.bx1, S.by0, {
      base: b, h: h, openings: [
        { at: 0.90, w: 1.80, sill: 0.85, h: 1.85 },
        { at: 4.60, w: 1.80, sill: 0.85, h: 1.85 }
      ]
    });
    wall(shell, S.bx0, S.by0, S.bx0, S.by1, {
      base: b, h: h, openings: [
        { at: 1.05, w: 1.50, sill: 0.85, h: 1.85 },
        { at: 4.05, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 8.90, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 11.05, w: 1.50, sill: 0.85, h: 1.85 }
      ]
    });
    wall(shell, S.bx1, S.by0, S.bx1, S.by1, {
      base: b, h: h, openings: [
        { at: 1.10, w: 1.60, sill: 0.85, h: 1.85 },
        { at: 4.15, w: 0.70, sill: 1.70, h: 0.80 },
        { at: 8.85, w: 0.70, sill: 1.70, h: 0.80 },
        { at: 11.00, w: 1.60, sill: 0.85, h: 1.85 }
      ]
    });
    wall(shell, S.bx0, S.by1, S.bx1, S.by1, {
      base: b, h: h, openings: [
        { at: 1.00, w: 1.60, sill: 0.85, h: 1.85 },
        { at: 4.30, w: 2.20, sill: 0.02, h: 2.35 }        // door to the terrace
      ]
    });

    // cantilevered terrace + its balustrade
    parapet(shell, [[3.90, S.by1], [3.90, 18.55], [S.bx1, 18.55], [S.bx1, S.by1]], b, 1.05);

    var Pt = function (x0, y0, x1, y1, ops) {
      wall(shell, x0, y0, x1, y1,
        { t: S.inn, h: h, base: b, mat: M.plasterIn, openings: ops || [] });
    };
    var DOOR = function (at, w) { return { at: at, w: w || 0.90, sill: 0, h: 2.20, glass: false }; };

    Pt(0.40, 7.55, 4.25, 7.55, [DOOR(2.90, 0.95)]);            // MB03 / bath
    Pt(4.25, 4.15, 4.25, 7.55);                                // MB03 / MB04
    Pt(4.35, 7.65, S.ix1, 7.65, [DOOR(0.35, 0.95)]);           // MB04 / bath
    Pt(0.40, 9.10, 3.05, 9.10, [DOOR(2.00, 0.85)]);            // bath03 / lobby
    Pt(3.05, 7.55, 3.05, 9.10);
    Pt(4.35, 9.25, 6.30, 9.25, [DOOR(0.25, 0.85)]);            // bath04 / lobby
    Pt(6.30, 7.65, 6.30, 9.25);
    Pt(6.10, 9.25, 6.10, 12.40);                               // lobby / MB01 suite
    Pt(4.35, 9.90, 6.10, 9.90);
    Pt(4.35, 12.25, 6.10, 12.25, [DOOR(0.55, 0.85)]);          // bath01
    Pt(4.35, 9.90, 4.35, 12.25);
    Pt(6.15, 12.40, S.ix1, 12.40);                             // dressing
    Pt(6.15, 14.10, S.ix1, 14.10, [DOOR(0.55, 0.90)]);
    Pt(6.15, 12.40, 6.15, 14.10);
    Pt(0.40, 12.55, 3.05, 12.55, [DOOR(2.00, 0.85)]);          // bath02
    Pt(0.40, 13.95, 3.05, 13.95, [DOOR(0.30, 0.85)]);
    Pt(3.05, 12.55, 3.05, 13.95);
    Pt(0.40, 14.10, 4.25, 14.10, [DOOR(3.05, 0.95)]);          // MB02
    Pt(4.25, 14.10, 4.25, S.iy1);                              // MB02 / MB01
    Pt(4.35, 14.10, 6.15, 14.10, [DOOR(0.30, 0.95)]);          // MB01
    Pt(3.20, 9.10, 3.20, 12.55);                               // stair / lobby

    stair(shell, 2.45, 3.65, 8.30, 12.40, b, S.lv[2] - S.lv[1]);

    /* ================================================= furnishing: first = */
    function bedroom(cx, cy, bw, bl, rot, rugMat, wx, wy, wrot, ww, ar, en) {
      place(furn, F.rug(bw + 1.4, bl + 0.9, rugMat), cx, cy + 0.35, 0, b + 0.001);
      place(furn, F.bed(bw, bl), cx, cy, rot, b);
      var dx = rot === 0 ? bw / 2 + 0.35 : 0, dz = rot === 0 ? 0 : bw / 2 + 0.35;
      place(furn, F.nightstand(), cx - (rot === 0 ? bw / 2 + 0.34 : 0), cy - (rot === 0 ? 0 : bw / 2 + 0.34) - (rot === 0 ? bl / 2 - 0.25 : 0), rot, b);
      place(furn, F.nightstand(), cx + (rot === 0 ? bw / 2 + 0.34 : 0), cy - (rot === 0 ? 0 : -(bw / 2 + 0.34)) - (rot === 0 ? bl / 2 - 0.25 : 0), rot, b);
      place(furn, F.wardrobe(ww, 2.35, 0.58), wx, wy, wrot, b);
      label('first', ar, en, cx, cy, b);
    }

    /* Every headboard goes against a solid stretch of wall — never across a
       window or a door swing. That constraint, not the room's centre line, is
       what fixes where each bed lands. */

    // MB03 (front west) — headboard on the north partition, wardrobe east
    place(furn, F.rug(3.10, 2.50, M.rugOlive), 1.90, 6.15, 0, b + 0.001);
    place(furn, F.bed(1.70, 2.05), 1.90, 6.45, 0, b);
    place(furn, F.nightstand(), 0.80, 7.15, 0, b);
    place(furn, F.nightstand(), 3.00, 7.15, 0, b);
    place(furn, F.wardrobe(2.20, 2.35, 0.58), 3.88, 5.30, -90, b);
    place(furn, F.plant(0.8), 0.80, 4.55, 0, b);
    label('first', 'ماستر ٣', 'Master 03', 1.90, 6.15, b);

    // MB04 (front east) — headboard on the solid half of the north partition
    place(furn, F.rug(3.10, 2.50, M.rugWarm), 6.75, 6.25, 0, b + 0.001);
    place(furn, F.bed(1.70, 2.05), 6.75, 6.55, 0, b);
    place(furn, F.nightstand(), 5.65, 7.25, 0, b);
    place(furn, F.nightstand(), 7.85, 7.25, 0, b);
    place(furn, F.wardrobe(2.20, 2.35, 0.58), 4.62, 5.60, 90, b);
    place(furn, F.plant(0.8), 4.75, 4.60, 0, b);
    label('first', 'ماستر ٤', 'Master 04', 6.75, 6.25, b);

    // MB02 (rear west) — headboard on the south partition, foot to the window
    place(furn, F.rug(3.10, 2.60, M.rugWarm), 1.90, 15.55, 0, b + 0.001);
    place(furn, F.bed(1.80, 2.10), 1.90, 15.25, 180, b);
    place(furn, F.nightstand(), 0.78, 14.55, 180, b);
    place(furn, F.nightstand(), 3.02, 14.55, 180, b);
    place(furn, F.wardrobe(2.40, 2.35, 0.58), 3.88, 16.35, -90, b);
    place(furn, F.armchair(), 1.05, 17.05, -140, b);
    place(furn, F.plant(0.95), 2.60, 17.30, 0, b);
    label('first', 'ماستر ٢', 'Master 02', 1.90, 15.55, b);

    // MB01 (principal suite) — the north wall is the terrace door, so the bed
    // turns and takes the west partition; dressing room and terrace adjoin
    place(furn, F.rug(3.20, 2.90, M.rugOlive), 5.95, 15.80, 0, b + 0.001);
    place(furn, F.bed(1.85, 2.10), 5.55, 15.80, 90, b);
    place(furn, F.nightstand(), 4.78, 14.75, 90, b);
    place(furn, F.nightstand(), 4.78, 16.85, 90, b);
    place(furn, F.sideboard(1.60, 0.78, 0.40), 6.60, 14.35, 0, b);
    place(furn, F.armchair(), 7.60, 17.05, -150, b);
    place(furn, F.plant(0.9), 7.85, 14.20, 0, b);
    label('first', 'الماستر الرئيسي', 'Master 01', 6.10, 15.80, b);

    // dressing room
    place(furn, F.wardrobe(1.60, 2.30, 0.55), 7.15, 12.75, 0, b);
    place(furn, F.wardrobe(1.40, 2.30, 0.55), 6.50, 13.30, 90, b);
    place(furn, F.pouf(0.30, M.ochre), 7.40, 13.55, 0, b);
    label('first', 'غرفة الملابس', 'Dressing', 7.15, 13.25, b);

    // bathrooms
    place(furn, F.bathroom(2.55, 1.35), 1.72, 8.35, 0, b);
    place(furn, F.bathroom(1.85, 1.50), 5.30, 8.50, 0, b);
    place(furn, F.bathroom(1.65, 2.25), 5.20, 11.10, 0, b);
    place(furn, F.bathroom(2.55, 1.35), 1.72, 13.25, 180, b);

    // lobby
    place(furn, F.rug(1.40, 2.20, M.rugJute), 3.75, 11.00, 0, b + 0.001);
    place(furn, F.sideTable(0.75, 0.24, M.walnut), 3.60, 9.65, 0, b);
    place(furn, F.plant(0.95), 3.55, 12.30, 0, b);
    label('first', 'صالة النوم', 'Lobby', 3.75, 10.90, b);

    // terrace furniture — morning coffee over the pool
    place(furn, F.outdoorSofa(2), 5.10, 17.95, 180, b);
    place(furn, F.sideTable(0.42, 0.26, M.teak), 6.15, 17.95, 0, b);
    place(furn, F.armchair(), 6.95, 17.95, 160, b);
    place(furn, F.pot(0.24, 0.34), 7.75, 18.25, 0, b);
    label('first', 'تراس', 'Terrace', 6.00, 18.10, b);
  }

  /* ========================================================= PENTHOUSE === */
  function penthouse(shell, furn) {
    var b = S.lv[2], h = S.ceil;

    // roof slab over the first floor = the penthouse terraces
    floor(shell, S.bx0, S.by0, S.bx1, S.by1, b, M.floorOut);

    var Pe = { t: S.ext, h: h, base: b, mat: M.plaster };
    // the enclosed core: bathroom + playroom + lobby
    wall(shell, 0.30, 7.60, 6.45, 7.60, {
      t: S.ext, h: h, base: b, mat: M.plaster, openings: [
        { at: 3.35, w: 2.20, sill: 0.30, h: 2.20 }
      ]
    });
    wall(shell, 0.30, 7.60, 0.30, 12.75, {
      t: S.ext, h: h, base: b, mat: M.plaster, openings: [
        { at: 0.80, w: 0.60, sill: 1.70, h: 0.80 },
        { at: 2.60, w: 1.20, sill: 1.00, h: 1.40 }
      ]
    });
    wall(shell, 0.30, 12.75, 6.45, 12.75, {
      t: S.ext, h: h, base: b, mat: M.plaster, openings: [
        { at: 3.30, w: 2.40, sill: 0.02, h: 2.40 }     // playroom → roof pergola
      ]
    });
    wall(shell, 6.45, 7.60, 6.45, 12.75, {
      t: S.ext, h: h, base: b, mat: M.plaster, openings: [
        { at: 1.10, w: 1.70, sill: 0.60, h: 1.70 },    // long playroom window
        { at: 3.60, w: 1.20, sill: 1.00, h: 1.30 }
      ]
    });

    var Pt = function (x0, y0, x1, y1, ops) {
      wall(shell, x0, y0, x1, y1,
        { t: S.inn, h: h, base: b, mat: M.plasterIn, openings: ops || [] });
    };
    Pt(0.40, 9.15, 3.30, 9.15, [{ at: 2.10, w: 0.85, sill: 0, h: 2.20, glass: false }]);
    Pt(3.30, 7.75, 3.30, 9.15);
    Pt(3.30, 11.35, 6.35, 11.35, [{ at: 0.80, w: 1.40, sill: 0, h: 2.30, glass: false }]);

    // flat roof over the enclosed core, with a small overhang for shade
    shell.add(slabAt(0.15, 7.45, 6.60, 12.90, b + h, 0.28, M.plaster));

    stair(shell, 2.45, 3.65, 8.30, 12.40, b, 0.0);   // arrival landing only
    // (the flight itself belongs to the first floor group)

    // parapets around both terraces and the roof
    parapet(shell, [
      [S.bx0, 7.60], [S.bx0, S.by0], [S.bx1, S.by0], [S.bx1, 7.60]
    ], b, 1.05);
    parapet(shell, [
      [S.bx0, 12.75], [S.bx0, S.by1], [S.bx1, S.by1], [S.bx1, 12.75]
    ], b, 1.05);
    parapet(shell, [[6.45, 7.60], [S.bx1, 7.60]], b, 1.05);
    parapet(shell, [[6.45, 12.75], [S.bx1, 12.75]], b, 1.05);

    /* ---- roof pergola (as drawn on the penthouse plan, 4.70 x 2.20) ------ */
    var pg = pergola(1.70, 13.00, 6.40, 15.20, b, 2.60, 0.34);
    shell.add(pg);

    /* ============================================ furnishing: playroom === */
    /* The children's floor. The plan's "Living/Bedroom" becomes the playroom:
       it has its own bathroom, it opens straight onto the shaded roof terrace
       under the pergola, and everything in it is low, soft and reachable. */
    place(furn, F.rug(2.50, 2.60, M.rugKids), 4.70, 9.70, 0, b + 0.001);
    place(furn, F.toyStorage(2.20), 4.75, 8.08, 0, b);
    place(furn, F.kidsTable(), 5.35, 9.25, 0, b);
    place(furn, F.teepee(1.50), 3.90, 8.95, 20, b);
    place(furn, F.playArch(), 4.15, 10.60, 90, b);
    place(furn, F.beanbag(0.40, M.terra), 5.25, 10.60, 0, b);
    place(furn, F.beanbag(0.36, M.ochre), 5.80, 10.10, 0, b);
    place(furn, F.shelf(1.20, 1.10, 0.28, 3), 6.15, 8.85, -90, b);
    var hc = F.hangChair(0.55);
    hc.position.set(px(3.68), b + h, pz(10.25)); furn.add(hc);
    var hp = F.hangPlant(0.5); hp.position.set(px(3.55), b + h, pz(8.40)); furn.add(hp);
    // the south wall here is nearly all window, so the macramé takes the solid
    // stretch of the east wall instead
    var m2 = F.macrame(0.90, 0.70);
    m2.position.set(px(6.36), b + 2.40, pz(8.10));
    m2.rotation.y = -Math.PI / 2;
    furn.add(m2);
    label('penthouse', 'غرفة ألعاب الأطفال', 'Kids playroom', 4.85, 9.60, b);

    place(furn, F.bathroom(2.70, 1.30), 1.80, 8.40, 0, b);
    label('penthouse', 'حمام', 'Bath', 1.80, 8.40, b);

    place(furn, F.rug(1.20, 1.00, M.rugJute), 4.85, 12.05, 0, b + 0.001);
    place(furn, F.plant(0.85), 6.00, 12.30, 0, b);
    label('penthouse', 'صالة', 'Lobby', 4.85, 12.05, b);

    /* ---- roof terrace under the pergola: family lounge + play deck ------- */
    place(furn, F.rug(3.20, 1.90, M.rugOlive), 4.05, 14.10, 0, b + 0.001);
    place(furn, F.outdoorSofa(3), 4.05, 13.35, 0, b);
    place(furn, F.coffeeTable(0.50), 4.05, 14.30, 0, b);
    place(furn, F.pouf(0.30, M.ochre), 2.60, 14.55, 0, b);
    place(furn, F.pouf(0.28, M.olive), 5.45, 14.60, 0, b);
    place(furn, F.beanbag(0.40, M.olive), 2.35, 13.30, 0, b);
    var hc2 = F.hangChair(0.30);
    hc2.position.set(px(5.85), b + 2.55, pz(13.60)); furn.add(hc2);
    for (var i = 0; i < 5; i++) {
      var ln = F.lantern(0.13, 0.35 + (i % 2) * 0.18);
      ln.position.set(px(2.10 + i * 1.05), b + 2.56, pz(15.05));
      furn.add(ln);
    }
    [[1.15, 16.85], [7.90, 15.25], [1.15, 13.15], [7.90, 13.10]].forEach(function (p, k) {
      place(furn, F.pot(0.28, 0.42), p[0], p[1], 0, b);
      var pl = F.plant(0.95); place(furn, pl, p[0], p[1], 0, b + 0.30);
    });
    place(furn, F.lounger(), 7.10, 16.20, 180, b);
    place(furn, F.lounger(), 1.90, 5.60, 0, b);
    place(furn, F.lounger(), 3.10, 5.60, 0, b);
    place(furn, F.parasol(2.20, 1.20), 4.30, 5.30, 0, b);
    label('penthouse', 'تراس السطح', 'Roof terrace', 4.20, 16.20, b);
    label('penthouse', 'برجولة السطح', 'Roof pergola', 4.05, 14.10, b);
  }

  /* A slatted timber pergola over a plan rectangle. Used on the roof and,
     larger, in the garden. */
  function pergola(x0, y0, x1, y1, base, h, spacing) {
    var g = group('pergola');
    var w = x1 - x0, d = y1 - y0;
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (p) {
      var c = box(0.14, h, 0.14, M.teak);
      c.position.set(px(p[0]), base + h / 2, pz(p[1]));
      g.add(c);
    });
    if (w > 4.0) {
      [[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]].forEach(function (p) {
        var c = box(0.12, h, 0.12, M.teak);
        c.position.set(px(p[0]), base + h / 2, pz(p[1]));
        g.add(c);
      });
    }
    // beams along the long axis
    [y0, y1].forEach(function (yy) {
      var bm = box(w + 0.30, 0.20, 0.10, M.teak);
      bm.position.set(px((x0 + x1) / 2), base + h + 0.10, pz(yy));
      g.add(bm);
    });
    // rafters
    var n = Math.max(3, Math.round(w / (spacing || 0.34)));
    for (var i = 0; i <= n; i++) {
      var r = box(0.07, 0.16, d + 0.40, M.teak);
      r.position.set(px(x0 + i * (w / n)), base + h + 0.28, pz((y0 + y1) / 2));
      g.add(r);
    }
    // a light canvas shade over part of it — kept to 45% so the rafters, and
    // what sits under them, still read from the air
    var canvas = box(w * 0.45, 0.02, d + 0.24,
      new T.MeshStandardMaterial({ color: 0xEFE6D2, roughness: .95, side: T.DoubleSide }));
    canvas.position.set(px(x0 + w * 0.26), base + h + 0.39, pz((y0 + y1) / 2));
    g.add(canvas);
    return g;
  }

  function build() {
    var levels = {
      ground:     { shell: group('ground-shell'),     furn: group('ground-furn') },
      first:      { shell: group('first-shell'),      furn: group('first-furn') },
      penthouse:  { shell: group('penthouse-shell'),  furn: group('penthouse-furn') }
    };
    ground(levels.ground.shell, levels.ground.furn);
    first(levels.first.shell, levels.first.furn);
    penthouse(levels.penthouse.shell, levels.penthouse.furn);
    return { levels: levels, rooms: ROOMS, pergola: pergola };
  }

  return { build: build, pergola: pergola, rooms: ROOMS };
})();
