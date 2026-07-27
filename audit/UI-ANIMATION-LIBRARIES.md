# Premium animation for The Village — library study & recommendation

**Question asked:** what are the best UI libraries for building a premium animated
website, and which of them is actually the right fit here?

**Short answer:** the popular "premium animated site" stack (Framer Motion, Aceternity UI,
Magic UI, React Three Fiber) is **incompatible with this site as built** — not because it
is bad, but because all of it assumes React + a bundler, and this site is a single
self-contained HTML file with a CSP that forbids third-party scripts. The right move is a
**~13 KB vendored motion layer** (`motion/mini` + `Lenis`) on top of platform APIs that
cost 0 KB, which buys 90% of the "premium" feeling at 3% of the weight.

All sizes below were **measured**, not quoted: packages installed from npm and bundled
with esbuild (`--bundle --minify --format=iife`), then gzipped.

---

## 1. The three constraints that decide everything

**① The CSP forbids external scripts.**
```
script-src 'self' 'unsafe-inline'
```
No CDN, no `<script src="https://unpkg.com/...">`. Every library must be vendored into
the repo and served same-origin. That rules out the copy-paste-from-CDN workflow most
animation tutorials assume, and it means "small" is not a nice-to-have — it is billed
directly to the visitor on first paint.

**② There is no React and no bundler.**
The app is vanilla JS in one IIFE with a hand-written `h()` hyperscript. Every
React-first library — Framer Motion, Aceternity, Magic UI, shadcn/ui, React Three Fiber,
React Spring — would require rewriting **23 views** before a single animation ran.

**③ Bilingual RTL, mobile-first, on a heavy media library.**
9 areas, 58 projects, 215 units, **60.7 MB of images**. Any library that assumes LTR
(x-offsets, slide-in directions, carousel maths) doubles the QA surface. Any library that
adds a scroll-hijacking main-thread loop competes with 700+ WebP decodes on a mid-range
Android in Cairo.

---

## 2. Measured comparison

Bundled + minified + gzipped, same method for every row:

| Library | gzip | React needed? | Fits this site? | What it's for |
|---|---:|---|---|---|
| **`motion/mini`** | **5.0 KB** | No | ✅ **Yes** | WAAPI animate + spring + scroll; hardware-composited |
| **Lenis** | **5.3 KB** | No | ✅ **Yes** | Smooth momentum scroll, the single biggest "expensive site" tell |
| `@formkit/auto-animate` | 3.3 KB | No | ✅ Yes | One-line list add/remove/reorder — perfect for the finder |
| `embla-carousel` | 7.5 KB | No | 🟡 Maybe | Carousel — but current flippers already work |
| GSAP core | **27.6 KB** | No | 🟡 Overkill | The industry standard; timelines, morphing, precision |
| GSAP + ScrollTrigger | **45.2 KB** | No | 🟡 Overkill | Scroll-linked cinematic sequences |
| GSAP Flip | +9.5 KB | No | 🟡 | FLIP layout transitions (View Transitions does this free) |
| `motion` (full) | **46.4 KB** | No | ❌ No | 9× the mini build for features this site won't use |
| `anime.js` v4 | **42.0 KB** | No | ❌ No | Same capability as GSAP, smaller ecosystem |
| Framer Motion / Motion for React | 46.4 KB + React | **Yes** | ❌ No | Excellent — for a React app |
| Aceternity UI / Magic UI | varies | **Yes** (+ Tailwind) | ❌ No | Copy-paste React+Tailwind components |
| React Three Fiber | ~60 KB + three.js ~150 KB | **Yes** | ❌ No | 3D/WebGL |

**Context:** `index.html` is **167 KB gzipped** today. GSAP+ScrollTrigger would add
**+27%** to the critical bundle. `motion/mini` + Lenis adds **+6%**.

---

## 3. The 0 KB tier — platform APIs, already supported

These ship with the browser. Nothing to vendor, nothing to CSP-allow, nothing to
maintain. **The site currently uses none of them** (`.animate()` count in `index.html`: **0**).

### View Transitions API — the single highest-impact change
Cross-fades and morphs between SPA routes with no library. This site is a History-API SPA
with a central `render()`, so it is a ~10-line change:

```js
function render(route, opts){
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches)
    return renderNow(route, opts);
  document.startViewTransition(() => renderNow(route, opts));
}
```
Add `view-transition-name` to a project card's image and its hero on the detail page and
the card **morphs into the page**. That is the effect people mean by "premium", and it
costs nothing. Non-supporting browsers just don't animate — no polyfill, no fallback code.

### CSS scroll-driven animations (`animation-timeline`)
Reveal-on-scroll, progress bars, parallax — **off the main thread**, declarative, and they
degrade to "always visible" where unsupported:

```css
@supports (animation-timeline: view()) {
  .card { animation: reveal linear both; animation-timeline: view(); animation-range: entry 10% cover 32%; }
  @keyframes reveal { from { opacity:0; transform: translateY(18px); } }
}
```
This replaces roughly what a scroll library would be hired to do, at zero bytes.

### Web Animations API + `@starting-style` + `transition-behavior: allow-discrete`
Enter/exit animation for the media viewer, drawer, chat panel and lead modal —
`display:none` → visible now animates in pure CSS.

---

## 4. What this site already does well (don't rebuild it)

- **60 CSS transitions**, tuned per component.
- **13 `prefers-reduced-motion` guards** — genuinely rare discipline; any new layer must
  keep this bar.
- **5 `@keyframes`** including the brand intro and hero slides.
- **2 IntersectionObservers** for reveal + counters, **6 rAF** loops.
- Photo flippers, pan-and-zoom media viewer, accordions — all hand-rolled and working.

**The gap is not "no animation". It is: no route transitions, no scroll choreography, no
scroll feel, no stagger.**

---

## 5. Recommendation for The Village

### Tier 0 — do these first, 0 KB, ~1 day
| # | Change | Effect |
|---|---|---|
| 1 | **View Transitions** on `render()` | Every route change cross-fades instead of snapping |
| 2 | `view-transition-name` on project/unit cover ↔ detail hero | Card **morphs** into the page — the flagship moment |
| 3 | **CSS scroll-driven reveals** for cards, sections, stats | Content arrives instead of appearing |
| 4 | `@starting-style` on viewer / drawer / chat / modal | Overlays breathe in and out |
| 5 | Stagger via `transition-delay: calc(var(--i) * 40ms)` | Grids cascade with no JS |

### Tier 1 — 10.3 KB vendored, ~2 days
| # | Library | Use |
|---|---|---|
| 6 | **Lenis** (5.3 KB) | Momentum scroll. Sitewide, `prefers-reduced-motion` off-switch. Biggest single perceptual upgrade. |
| 7 | **`motion/mini`** (5.0 KB) | Springs for the flipper, chat bubbles, compare tray, offer cards — where CSS easing feels mechanical. Runs on WAAPI, so it composites off-thread. |

### Tier 2 — only if Tier 0+1 isn't enough
| # | Library | Use |
|---|---|---|
| 8 | `@formkit/auto-animate` (3.3 KB) | Finder results reflowing as filters change |
| 9 | GSAP + ScrollTrigger (45.2 KB) | Only for a genuinely cinematic developer-page sequence. **+27% to the bundle — needs a business reason.** |

### Explicitly not recommended
- **Framer Motion / Motion for React, Aceternity, Magic UI, shadcn/ui, React Three Fiber, React Spring** — all require a React rewrite of 23 views. If you ever *do* move to React/Next, Motion for React is the right choice and this file should be revisited.
- **`motion` (full, 46.4 KB)** — 9× the mini build for features not used here.
- **`anime.js` v4 (42 KB)** — no advantage over GSAP at similar weight.
- **AOS, WOW.js, ScrollReveal** — superseded by CSS scroll-driven animations.
- **Any CDN-hosted library** — blocked by this site's own CSP.

---

## 6. Guardrails for whatever we build

1. **`prefers-reduced-motion` is a hard requirement,** not a nice-to-have. The site
   already honours it in 13 places; the new layer must too, including Lenis (destroy the
   instance, don't just shorten durations).
2. **Animate `transform` and `opacity` only.** Anything touching `width`, `height`, `top`
   or `left` triggers layout on every frame.
3. **RTL is a real test, not a theoretical one.** Direction-aware motion must read
   `document.dir`. Every animation gets tested at `/ar/` on a 390 px viewport.
4. **Budget: +15 KB gzipped, hard cap** (≈9% of the current 167 KB). Tier 0+1 lands at
   10.3 KB with room to spare.
5. **Never animate a first-paint element.** LCP is a project cover photo; a fade-in on it
   directly damages Core Web Vitals.
6. **Vendor everything** into `/vendor/` and serve same-origin. No CSP relaxation.

---

## 7. Expected outcome

| | Now | After Tier 0+1 |
|---|---|---|
| Route change | Instant snap | Cross-fade + shared-element morph |
| Scroll | Native | Momentum (Lenis), reduced-motion aware |
| Cards entering view | Static | Scroll-driven stagger, off main thread |
| Overlays | Class toggle | `@starting-style` enter/exit |
| Micro-interactions | CSS easing | Springs where it matters |
| Bundle | 167 KB gzip | **~177 KB gzip (+6%)** |
| Lighthouse Performance | *TBD in Phase 1* | Target ≥ 90 mobile |

---

## Decisions I need from you

1. **Do we stay vanilla, or is a React/Next rewrite on the table?** Everything above
   assumes vanilla. A React move changes every recommendation — and is a multi-week
   project, not an afternoon.
2. **Is Lenis smooth-scroll wanted?** It is the most noticeable change and the most
   polarising: it feels expensive, and a minority of users dislike momentum scroll.
3. **Where does animation matter most to you** — the homepage hero, project→unit
   navigation, or the developer pages (Modon already has gallery/masterplan/feature
   cards and is the best canvas)?
4. **Do we run this before or after the Phase 1 audit?** My recommendation: **after** —
   Phase 1 gives a Lighthouse baseline, and adding motion without one means we can't
   prove we didn't make the site slower.

---

*Method note: `npm i motion@12 gsap@3 lenis@1 animejs@4 @formkit/auto-animate embla-carousel`,
then per-entry `esbuild --bundle --minify --format=iife` → `gzip -c | wc -c`. Versions
measured: motion 12.42.2 · gsap 3.15.0 · lenis 1.3.25 · animejs 4.5.0 ·
@formkit/auto-animate 0.10.0 · embla-carousel 8.6.0.*
