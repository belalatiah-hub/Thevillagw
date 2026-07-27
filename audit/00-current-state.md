# PHASE 0 — Current State

**Scope:** recon only. Nothing in this phase changed a single line of the site.
**Branch:** `feat/site-audit-and-ai-upgrade` (cut from `claude/deploy-github-connect-oaq96l`).
**Live target:** https://village.belalatiah.workers.dev/en/ · canonical domain `www.thevillageinvestment.com`
**Date of recon:** 2026-07-27 · **Bundle inspected:** `index.html`, 619 KB raw / **167 KB gzipped**

Every number below was measured from this repository. Nothing is estimated unless it
says so.

---

## 1. Stack

| Layer | What it actually is |
|---|---|
| Framework | **None.** Hand-written vanilla ES5-style JS in one IIFE. |
| Templating | Custom hyperscript `h(tag, props, ...children)` + `sEl()` for SVG. No `innerHTML` anywhere for dynamic content (deliberate XSS posture). |
| Routing | **History API**, client-side. `buildPath(name, params, lang)` → `parse(pathname)` → `V.<view>()`. Locale is the first path segment (`/en/…`, `/ar/…`). |
| Styling | One inline `<style>` block. CSS custom properties, logical properties (`inset-inline-*`, `padding-block`) for RTL. No Tailwind, no CSS framework. |
| State | Module-scope vars + `localStorage` (`tv_saved`, `tv_compare_u`) + `sessionStorage` (`tvi_intro`, `tvi_lead`). |
| i18n | `I18N.en` / `I18N.ar` object — **~314 EN keys / ~318 AR keys**. `t(key)` + `L({en,ar})`. |
| Build | Python concatenator: 12 `tpl_*.html` fragments → `index.html`. |
| Tests | `domtest.cjs` — Node `vm` + a hand-written DOM shim. **255 assertions, all passing.** |
| Hosting | Cloudflare Worker (`wrangler.toml`, `[assets] directory="."`, SPA fallback) **and** GitHub Pages (`.github/workflows/deploy.yml`). |

### Content Security Policy — the single biggest architectural constraint

```
script-src 'self' 'unsafe-inline';
style-src  'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src   'self' https://fonts.gstatic.com;
connect-src 'self' https://script.google.com https://script.googleusercontent.com;
img-src 'self' data:;  media-src 'self' data:;
```

**No third-party script may load from a CDN.** Any library must be vendored into the
repo and served same-origin. This governs every recommendation in the animation study
and in the AI-chat plan.

---

## 2. Routes — 23 views, every one bilingual

| Route pattern | View | Content source |
|---|---|---|
| `/{lang}/` | `V.home` | hero + `developerRail()` + curated featured list + `launchStrip()` + Why + stats |
| `/{lang}/projects/` | `V.projects` | `PROJECTS` (58) + `filterUnits` |
| `/{lang}/projects/{slug}/` | `V.project` | `PROJECTS` + its `UNITS` + `PROJECT_COVERS` + `deliveryTimeline` |
| `/{lang}/units/` | `V.units` | `UNITS` (215) + the finder (`FILTER`, `recommendUnits`, facets) |
| `/{lang}/units/{id}/` | `V.unit` | one `UNITS` row + galleries/plans/location + type-keyed recommendations |
| `/{lang}/developers/` | `V.developers` | `DEVELOPERS` (23) |
| `/{lang}/developers/{key}/` | `V.developer` | `DEVELOPERS` + `DEV_GALLERY` + `DEV_FEATURES` + their projects |
| `/{lang}/groups/{slug}/` | `V.group` | `PROJECT_GROUPS` (1 — Stei8ht) |
| `/{lang}/areas/` `/areas/{key}/` | `V.areas` `V.area` | `AREAS` (9) |
| `/{lang}/new-launches/` | `V.projects('launch')` | `NEW_LAUNCH_SLUGS` + `COMING_SOON_LAUNCH` + `launchStrip()` |
| `/{lang}/releases/{slug}/` | `V.release` | `RELEASES` (1 — MODON) |
| `/{lang}/compare/` | `V.compare` | `localStorage` `tv_compare_u` |
| `/{lang}/favorites/` | `V.favorites` | `localStorage` `tv_saved` |
| `/{lang}/search/` | `V.search` | `buildSearchIndex()` over all entities |
| `/{lang}/insights/` `/insights/{slug}/` | `V.insights` `V.insight` | `RESEARCH` (6 articles) |
| `/{lang}/faqs/` | `V.faqs` | `FAQ` (2 groups) |
| `/{lang}/about/` | `V.about` | `ABOUT` |
| `/{lang}/investors/` | `V.investors` | hard-coded copy in the view |
| `/{lang}/contact/` | `V.contact` | `CONFIG` + lead form |
| `/{lang}/privacy/` `/terms/` | `V.privacy` `V.terms` | hard-coded legal copy |
| — | `V.notfound` | `404.html` + rafgraph redirect shim |

**Sitemap:** 576 URLs — 404 unit pages, 102 project pages, 28 developer, 20 area, plus statics.

---

## 3. Data sources — where every number on the site comes from

**All content is hard-coded JavaScript object literals inside `index.html`.** There is no
CMS, no API, no database. Editing content means editing a source template and rebuilding.

| Map | Size | Holds |
|---|---|---|
| `PROJECTS` | 58 | slug, name, name_ar, dev, area, status, price, dp, years, delivery, finishing, types, tags, blurb |
| `UNITS` | 215 | id, project, type, beds, baths, area, price, avail |
| `DEVELOPERS` | 23 | key, brand colour, name, since, areas, tagline, desc |
| `AREAS` | 9 | raselhekma, newcairo, zayed, mostakbal, sahel, capital, october, fifthsettlement, sokhna |
| `RESEARCH` | 6 | insight articles |
| `FAQ` | 2 groups | Q/A pairs, feeds `FAQPage` JSON-LD |
| `TYPE_META` | 14 | unit-type labels + Arabic |
| `RELEASES` | 1 | MODON new release (2 projects, 6 unit rows, EOI, masterplan) |
| `PROJECT_GROUPS` | 1 | Stei8ht (3 LMD projects) |
| `AMENITY_CAT` | 12 | amenity categories |
| `PROJECT_COVERS` `UNIT_IMAGES` `UNIT_GALLERY` `UNIT_FLOORPLANS` `UNIT_MASTERPLANS` `UNIT_LOCATIONS` `DEV_LOGOS` `PROJECT_LOGOS` `DEV_GALLERY` | — | slug/id → `/project-media/**` paths |
| `CONFIG` | — | phone, WhatsApp, email, 4 social URLs, `leadEmail`, `LEAD_ENDPOINT` (**empty**), origin |

### Portfolio distribution

**Projects by developer:** palmhills 11 · sodic 8 · modon 7 · tatweer 7 · lmd 6 · hassanallam 6 · marakez 3 · ora 3 · mountainview 2 · misritalia 2 · hydepark 1 · marasem 1 · emaarmisr 1

**Projects by area:** newcairo 18 · raselhekma 16 · zayed 6 · mostakbal 6 · sahel 4 · capital 3 · october 3 · fifthsettlement 1 · sokhna 1

**Units by developer:** tatweer 50 · hassanallam 37 · palmhills 32 · modon 23 · sodic 20 · marakez 18 · lmd 15 · ora 7 · mountainview 4 · misritalia 4 · hydepark 3 · marasem 1 · emaarmisr 1

### Data coverage — measured gaps

| Metric | Value |
|---|---|
| Projects with a real cover photo | **35 / 58** (23 fall back to generated SVG art) |
| Projects with units | 58 / 58 |
| Projects with no price | 0 |
| Projects with no payment plan | 3 — `eastown`, `allegria`, `one-ninety` |
| Units with a photo gallery | **124 / 215** |
| Units with a floor plan | 116 / 215 |
| Units with a master plan | 129 / 215 |
| Units with a location image | 61 / 215 |
| Units with **no image at all** | **59 / 215** |
| Units with no price | 0 |
| Units with no bathroom count | 17 (13 commercial — correctly blank; 4 blank in the source sheet) |
| Developers with a logo | 23 / 23 |
| Developers with **zero projects** | **10** — qataridiar, orascom, tmg, madinetmasr, cityedge, ilcazar, lavista, inertia, alahlysabbour, saudiegyptian |
| Developers with a gallery | 1 (modon) |

---

## 4. The AI chat as it stands today

**File:** `tpl_script_chat.html` → bundled into `index.html`. **27 functions.**

- **Deterministic, not a model.** `chatRespond(raw)` is a ladder of ~15 regex/name-match
  branches. No LLM, no backend, no embeddings.
- **Grounded by construction.** Every answer reads `PROJECTS` / `UNITS` / `DEVELOPERS`,
  so it structurally cannot hallucinate a price. This is a real strength to preserve.
- **Instant-offer engine (built earlier this week).** Naming a project, developer, area or
  unit type returns an offer card — starting price, payment plan, delivery, finishing,
  unit price list — plus *Send offer on WhatsApp* / *Copy offer* / *Open page*.
  `offerText()` renders the same content as plain text with disclaimer, canonical URL
  and contacts.
- **Name matching** runs through `arNorm()` (Arabic diacritics/alef/ta-marbuta normalisation)
  and prefers the **longest** match, so EN and AR both resolve and sibling projects
  don't collide.
- **Selection-aware.** If the finder has a filter set, `chatRecommend()` ranks units by
  closeness and offers a relaxation plan.
- **Handoff.** Unknown → `chatActions()` → contact form / WhatsApp / phone.

### What it does NOT do (the Phase-4 gap)

1. No progressive brief (budget → area → type → own/invest → cash/instalments → delivery), one question at a time.
2. No conversation memory — every turn is stateless; no session persistence.
3. No lead capture inside the chat, and **`CONFIG.LEAD_ENDPOINT` is empty**, so nothing is posted anywhere.
4. No typing indicator, no suggested-prompt refresh, no copyable message bubbles.
5. Language is taken from the page, not detected from what the visitor types.
6. No explicit guardrail layer (investment advice / politics / competitor comparisons).
7. Insights articles and FAQs are **not** in the chat's answerable surface.

---

## 5. SEO & infrastructure surface (state, not yet scored)

**Present:** canonical, `hreflang` en/ar/x-default, OG + Twitter cards, `theme-color`,
`robots.txt` (disallows `/compare/` and `/search/`), `sitemap.xml` (576 URLs), `llms.txt`,
`404.html` with the rafgraph SPA redirect, `.nojekyll`, `CNAME`.

**JSON-LD types emitted:** `Organization` ×2, `CollectionPage` ×2, `ItemList` ×3,
`ListItem` ×4, `Offer` ×2, `AggregateOffer`, `Residence`, `PropertyValue` ×3,
`QuantitativeValue` ×2, `PostalAddress` ×2, `BreadcrumbList`, `FAQPage`, `Question`, `Answer`.

**Absent (to be scored in Phase 1):** `RealEstateAgent`, `LocalBusiness`, `Article`
(the 6 insights pages), `Product`, `Review`/`AggregateRating`, `WebSite`+`SearchAction`.

**Analytics:** `track()` pushes to `window.dataLayer` — but **no GTM/GA container is
loaded**, so every event currently goes into an array nobody reads.

---

## 6. Performance surface

| Item | Measured |
|---|---|
| `index.html` | 619 KB raw / **167 KB gzipped** — single request, everything inline |
| Media library | **60.7 MB across 749 files** (718 WebP) |
| Largest assets | `mp-OG-WC1.webp` 417 KB · `ramla/townhouse.webp` 402 KB · `locations/newcairo.webp` 397 KB · `mp-JN-CR1.webp` 383 KB |
| Render-blocking | 1 external stylesheet — Google Fonts `css2` (3 families) |
| Fonts | **Loaded from `fonts.googleapis.com`, not self-hosted** (despite an earlier task claiming otherwise) |
| CSS `transition:` declarations | 60 |
| `@keyframes` | 5 — `accOpen`, `heroSlides`, `introLogo`, `sk`, `viewerIn` |
| `prefers-reduced-motion` guards | 13 |
| `IntersectionObserver` | 2 |
| `requestAnimationFrame` | 6 |
| Web Animations API (`.animate()`) | **0** |

---

## 7. Tech debt — ranked

### 🔴 P0-1 · The build sources are not in the repository

`git ls-files` returns **zero** template or build files. The 12 `tpl_*.html` fragments,
`build.py` and `domtest.cjs` live **only in an ephemeral session scratchpad** at
`/tmp/claude-0/.../scratchpad/`. The repo tracks the *generated* `index.html` only.

**Consequence:** when this container is reclaimed, the only way to change the site is to
hand-edit a 619 KB generated file, and the 255-assertion test suite is gone. This is the
highest-severity item in the entire audit and Phase 2 should fix it first by committing
`src/` + `build.py` + `domtest.cjs`.

### 🔴 P0-2 · No lead destination

`CONFIG.LEAD_ENDPOINT` is `""`. The contact form, the lead popup and any future chat
lead capture have nowhere to post. `leadEmail` (`leads@thevillageinvestment.com`) is the
only fallback. → `[NEEDS_INPUT: CRM or webhook endpoint URL]`

### 🔴 P0-3 · Analytics fires into the void

`track()` pushes to `dataLayer`, but no container script is loaded (and the CSP would
block one anyway without an explicit allowance). Every funnel event is lost.
→ `[NEEDS_INPUT: GA4 / GTM ID, and a decision on the CSP allowance]`

### 🟠 P1-1 · Ten developers with zero inventory

10 of 23 `DEVELOPERS` have no project and no unit. They render developer pages and appear
in the rail and sitemap with nothing behind them — thin pages that dilute crawl budget.

### 🟠 P1-2 · Image coverage holes

59 units (27%) have no image at all; 23 projects (40%) fall back to generated SVG art
rather than a photograph. Media weight is simultaneously *heavy* (60.7 MB) and *patchy*.

### 🟠 P1-3 · Fonts are third-party and render-blocking

Three families pulled from Google Fonts on every page load — an extra DNS + TLS + fetch
on the critical path, and a privacy/GDPR consideration.

### 🟡 P2-1 · Everything is in one 619 KB file

All 58 projects, 215 units and both languages ship to every visitor on the first request,
including the ~200 KB of data a given page never touches.

### 🟡 P2-2 · Copy is written from the company outward

Headlines describe what The Village *is* ("a real-estate marketing and brokerage company")
rather than what the visitor gets. Full assessment in Phase 3.

### 🟡 P2-3 · Two deploy pipelines for one site

GitHub Pages (`deploy.yml`) and Cloudflare Workers both publish from the same branch,
pointing at two different hostnames. Only one can be canonical.

---

## 8. What I need from you before Phase 1

Collected properly in `audit/NEEDS-INPUT.md` at the end, but three block real progress:

1. **CRM / lead webhook URL** — otherwise every lead path stays a dead end.
2. **GA4 or GTM ID** — otherwise there is no before/after to measure.
3. **Confirm the canonical host** — `thevillageinvestment.com` (per `CNAME`, canonical
   tags and sitemap) or the Workers subdomain? Right now the site tells Google one thing
   and serves from another.

---

## Phase 0 verdict

The foundation is stronger than it looks: strict CSP, no `innerHTML`, real bilingual
parity, 255 passing tests, honest "illustrative" badging on every commercial figure, and
a chat that cannot fabricate a price. The problems are **operational** (sources outside
git, no lead endpoint, no analytics) and **editorial** (copy, thin developer pages,
image gaps) far more than they are structural.

**Nothing was modified in Phase 0.** Awaiting your review before Phase 1.
