# Villa B — 3D concept model

An interactive 3D model of VDLC **Villa B**, furnished, with a swimming pool,
a garden pergola and a children's playroom. Open `villa-3d/index.html` — no
build step, no server, no external request.

## Where the geometry comes from

Every wall position and room size is read off the dimensioned plans in
`VDLC_Villa_B_Dims_20260206.pdf` (Ground / First / Penthouse). Nothing is
invented where the drawing gives a figure.

| | |
|---|---|
| Plot | 12.25 m (E–W) × 24.50 m = 300 m² |
| Building footprint | 8.05 × 13.80 m, on the west boundary, 4.00 m off the street |
| Ground | reception 7.75 × 4.85, dining, kitchen 3.80 × 2.95, entrance, guest WC, driver room 2.00 × 2.00 + bath |
| First | four master bedrooms (3.85×3.30, 3.80×3.20, 3.85×3.40, 3.80×3.50), all en-suite, dressing 2.50 × 2.10, terrace 4.20 × 1.10 |
| Penthouse | living/bedroom 3.00 × 3.20 + bath 2.80 × 1.35, two roof terraces (3.45 and 4.60 deep), roof pergola 4.70 × 2.20 |
| Free land | back garden 12.25 × 6.70, east side strip 3.95 × 13.80, front 12.25 × 4.00 |

Floor-to-floor is taken as 3.40 m with a 3.00 m clear height — the plans are
dimensioned in plan only, so the section is an assumption.

Orientation is an assumption too: the drawings carry no north point, so the
model treats the street as south. The sun slider exists precisely so that
shading can be checked once the true orientation is known.

## What was designed on top of the plans

- **Pool** 7.00 × 3.10 m, 1.45 m deep, laid across the back garden with a
  1.60 m shallow entry bench at the west end for small children, three
  underwater lights and an outdoor shower.
- **Garden pergola** 3.25 × 4.10 m in the east corner, with an outdoor
  kitchen, reached from the carport along the side passage without crossing
  the pool deck.
- **Children's playroom** on the penthouse — the plan's "Living/Bedroom",
  which already has its own bathroom and opens onto the terrace under the
  existing roof pergola.
- **Children's play corner** in the front garden: walled, visible from the
  kitchen window, and on the far side of the house from the water.
- **Furnishing** throughout in a bohemian-but-practical register: lime
  plaster, oak and walnut, cane and rattan, kilim and jute, terracotta and
  ochre — over closed storage, fitted wardrobes and washable covers.

## Files

| file | what it is |
|---|---|
| `index.html` | page shell, UI, styles |
| `scene-core.js` | dimensions, palette, procedural textures, materials, wall builder |
| `furniture.js` | the furniture library — every piece built from primitives |
| `building.js` | shell, openings, stairs and the furnishing of each level |
| `landscape.js` | pool, garden, pergola, driveway, boundaries, context |
| `app.js` | renderer, sun, orbit camera, view presets, bilingual UI |
| `three.min.js` | three.js r158 UMD, vendored so the page needs no network |

## Controls

Drag to orbit, wheel to zoom, Shift + drag to pan. Keys `1`–`0` jump between
the view presets; `n` toggles night lighting. The panel switches level
(all / ground / first / penthouse), toggles furniture, room names and the
garden, and moves the sun from sunrise to sunset.
