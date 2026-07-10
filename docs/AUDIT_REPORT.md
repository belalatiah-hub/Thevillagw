# The Village Investment — Professional Platform Audit

**Prepared by:** Product team review (Senior FE/BE, UX/UI, PM, CRO, SEO+GEO+AEO,
Real-Estate, Performance & Accessibility).
**Scope:** the full bilingual (EN/AR · LTR/RTL) primary-sale platform delivered as
`index.html`.
**Method:** static + browserless-DOM inspection of the built file, headless-Chromium
render checks, and structured-data / Core-Web-Vitals / WCAG review.
**Date:** 2026-07-10.

> **Read me first.** This is a *report*, not a change. Per the brief, the one
> **Critical** item — the scroll-to-top bug on dynamic updates — has already been
> **fixed and shipped** (commit `e1db6dd`). Everything else below is documented
> with a priority so we can implement in order, highest-value first. Nothing else
> here has been implemented yet.

---

## 1. Executive summary

The platform is a genuinely strong foundation: a relational primary-sale finder,
a grounded recommendation engine, a selection-aware advisor, compare/shortlist,
payment-plan maths, real bilingual routing, honest "illustrative" provenance on
every figure, and a WCAG pass already applied. It is well ahead of a typical
brochure site.

To compete with Bayut / Property Finder / Zillow / Rightmove, the biggest gaps
are **not** UX polish — they are **machine-readability and buyer decision tools**:

1. **Structured data for listings is missing.** Search engines and AI answer
   engines (Google AI Overviews, ChatGPT, Perplexity, Gemini) cannot extract a
   single price, area, or bedroom count as data. This is the highest-leverage fix.
2. **Buyer self-qualification tools are missing** — no affordability/mortgage
   calculator, no saved-search / new-launch alert, no map. These are the features
   that turn browsers into qualified leads on every leading portal.
3. **Performance has two real render-path costs** — render-blocking third-party
   fonts and a fully client-rendered LCP element.

### Scorecard (honest baseline)

| Dimension | Grade | One-line |
|---|---|---|
| UX | B+ | Relational finder + scroll fix are excellent; full-view re-render and no back-to-top hold it back. |
| UI | B | Coherent teal brand; placeholder art/logos and near-identical project illustrations limit differentiation. |
| Performance / CWV | B− | Good single-file architecture; render-blocking fonts + JS-rendered LCP are the two costs. |
| SEO + GEO + AEO | C+ | Solid fundamentals (canonical, hreflang, sitemap, Org schema); **no listing/FAQ schema, no unit URLs, no llms.txt** — the biggest opportunity. |
| Accessibility (WCAG 2.2 AA) | A− | A dedicated pass was already applied; a few verify-and-tighten items remain. |
| CRO | B− | Strong WhatsApp/advisor hand-offs; missing calculator, alerts, sticky CTA, trust block. |
| Real-estate features | B | Differentiated finder/advisor; missing map, floor plans, delivery timeline, availability. |

**Overall: strong foundation (~7.6/10) with a clear, mostly-additive path to
world-class.**

---

## 2. How to read a finding

Every finding carries the seven required fields:

- **Issue** — what was found.
- **Why** — why it is a problem.
- **Priority** — Critical / High / Medium / Low.
- **Solution** — the recommended fix.
- **Impact** — expected effect.
- **Complexity** — rough build cost (Low / Medium / High).
- **Reference** — the best-practice source.

---

## 3. Resolved this cycle

| ID | Issue | Priority | What shipped |
|---|---|---|---|
| FIX-01 | Page jumped to top on every filter / sort / search / favourite / compare / language change. | **Critical** | `render()` now separates an *in-place update* (same route, only query/state changed) from a real *navigation*, holding the exact scroll offset for the former. Root cause was the `file://` `hashchange` path dropping the `keep` flag; the new `routeKey()` comparison is correct on both the History and hashchange paths. 5 regression assertions added to the DOM harness (97/97). Commit `e1db6dd`. |

---

## 4. Findings by category

### A. UX

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| UX-01 | Applying a filter re-renders the **entire** units view (clears `#main`, rebuilds the filter panel + results) rather than updating only the results grid and facet counts. | More DOM work than needed, resets transient panel state, and adds layout thrash on low-end devices — the opposite of the "seamless" feel of Airbnb/Zillow. Scroll is now preserved, but the update is still heavier than it should be. | High | Partial update: re-render only the results list + facet counts in place; keep the filter-panel DOM. Diff, don't rebuild. | Smoother updates, better INP, no lost focus/expansion state. | Medium | Airbnb / Zillow in-place results pattern; web.dev INP. |
| UX-02 | No **back-to-top** control on long result lists (64 units). | After scrolling deep, the only way back to filters/sort is a long manual scroll. | Medium | Floating back-to-top button that appears after ~2 viewports; `prefers-reduced-motion` aware. | Faster navigation on long lists; less friction. | Low | NN/g long-page navigation. |
| UX-03 | No **loading / busy state** on the results region during an update (`aria-busy` absent, no skeleton). | On slower devices the content swap can flash with no feedback; screen-reader users get no "updating" cue beyond the count. | Medium | Set `aria-busy="true"` on the results region during the swap; optional skeleton cards. | Perceived performance; clearer feedback. | Low | WCAG 4.1.3 status messages; NN/g feedback. |
| UX-04 | No **recently-viewed** units/projects. | Real-estate decisions span multiple sessions; buyers lose their place. | Medium | `localStorage` recently-viewed rail on home / finder. | Return-visit engagement; faster re-entry. | Medium | Zillow/Bayut recently-viewed. |
| UX-05 | Mobile filter toggle (already added) doesn't show the **live result count** on the collapsed control. | The user collapses filters to see units but can't see how many the current filters yield without expanding. | Low | Show "Filters · N results" on the toggle. | Orientation while filtering on mobile. | Low | Mobile faceted-search patterns. |

### B. UI

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| UI-01 | Every project/unit uses a **near-identical generic SVG cityscape**. | A buyer can't visually tell Ogami (coastal) from Ramla (lagoon) from a New Cairo tower — differentiation and perceived quality drop. | Medium | Distinct original SVG art per project archetype (coastal / lagoon / villa / tower), or licensed photography when rights arrive. | Differentiation, perceived quality, engagement. | Medium | Portal listing-card visual differentiation. |
| UI-02 | Developer marks are **monogram placeholders**. | Real logos drive recognition and trust; monograms read as "unbranded". *(Blocked on owner — trademarks.)* | High (business) | Drop in licensed official SVGs via the existing placeholder slots. | Trust, brand recognition. | Low (once assets arrive) | — |
| UI-03 | **Light theme only** (`color-scheme: light`, no `prefers-color-scheme` dark). | A dark mode is increasingly expected; some users read at night. Intentional warm brand makes this Low, not High. | Low | Optional dark palette via CSS tokens (the codebase already themes through variables). | Comfort/preference; modernity signal. | Medium | web.dev dark-mode; `color-scheme`. |

### C. Performance / Core Web Vitals

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| PERF-01 | **Render-blocking Google Fonts** — a `<link>` to `fonts.googleapis.com` for three families (Fraunces, Plus Jakarta Sans, Tajawal) with many weights. | The stylesheet request blocks first paint and adds cross-origin round-trips; on mobile this directly delays FCP/LCP. `display=swap` avoids invisible text but not the request cost. | High | Self-host a **subset** WOFF2 for the weights actually used, `preload` the primary display weight, keep `font-display: swap`; trim weight count. | Faster FCP/LCP; fewer round-trips; resilient offline/`file://`. | Medium | web.dev "Best practices for fonts"; Core Web Vitals. |
| PERF-02 | **LCP element is client-rendered** — the home hero (the LCP candidate) is built by JS after a 347 KB document parses and the script executes. | LCP is gated on script execution, which is slow on low-end CPUs and poor networks. | High | Ship a static, real-HTML hero for the home route so the LCP text paints before JS; let the app replace it on boot. | Better LCP, especially mobile / slow-CPU. | Medium–High | web.dev LCP optimisation. |
| PERF-03 | **One 347 KB (107 KB gz) inline script** parsed + executed on the main thread at boot; chat, compare and recommendation all init eagerly. | Large main-thread work raises TBT and can hurt INP on low-end devices. | Medium | Lazy-init non-critical modules (chat, compare, recommender) via `requestIdleCallback`; keep the finder critical path lean. | Lower TBT/INP; snappier first interaction. | Medium | web.dev TBT/INP; code-splitting principles. |
| PERF-04 | Card-art containers may not reserve space (no explicit `aspect-ratio`), risking **CLS** as the view builds. | Layout shift as art/containers size themselves hurts CLS and feels janky. | Medium | Set `aspect-ratio` on `.artsvg`/card-media containers so space is reserved before paint. | Lower CLS; steadier render. | Low | web.dev CLS; "reserve space for media". |
| PERF-05 | No `preload` for the LCP font weight; resource hints stop at `preconnect`. | The browser discovers the critical font late. | Low–Med | `<link rel="preload" as="font" crossorigin>` the primary display weight (after self-hosting per PERF-01). | Earlier text paint. | Low | web.dev preload critical assets. |

### D. SEO + GEO + AEO

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| SEO-01 | **No per-listing structured data.** Projects and units carry no `Product` / `Offer` / `Residence` / `RealEstateListing` schema — only `RealEstateAgent`, `BreadcrumbList`, `CollectionPage`, `ItemList` exist. | Neither Google rich results nor AI answer engines can extract a price, area, bedroom count, or developer as **data**. This is the single biggest discoverability gap for a real-estate site. | **Critical** | Emit `Residence`/`Apartment`/`SingleFamilyResidence` + `Offer` (`price`, `priceCurrency: EGP`, `availability`, `floorSize`, `numberOfRooms`, `numberOfBathroomsTotal`) per project/unit; `RealEstateListing` where applicable. Keep figures badged illustrative in copy; schema mirrors the same data. | Rich-result eligibility, AI citation, higher CTR, topical authority. | Medium | Google "RealEstateListing"/"Product" structured data; schema.org/Residence. |
| SEO-02 | **No `FAQPage` structured data** although an FAQs route exists (0 `Question`/`acceptedAnswer` in the build). | FAQ schema is one of the most reliable ways to earn FAQ rich results **and** to be quoted by AI Overviews / ChatGPT / Perplexity. | High | Emit `FAQPage` with `Question`/`acceptedAnswer` on the FAQs route, and per-project FAQ blocks. | FAQ rich results + AEO citations. | Low | Google FAQ structured data; AEO practice. |
| SEO-03 | **Units are not individually routable.** There is no `/units/:id`; a specific unit can't be indexed, shared, or cited. | No long-tail unit landing pages, no shareable unit links, no per-unit schema — a large SEO and AEO surface is missing. | High | Add canonical per-unit routes with their own `<title>`/OG/JSON-LD; add them to the sitemap. | Long-tail SEO, shareability, AI grounding. | Medium–High | Portal per-listing URL architecture. |
| SEO-04 | **No `llms.txt`** and no explicit AI-crawl guidance. | GEO ("generative engine optimisation") increasingly depends on giving LLMs a clean, factual entry point so they represent the brand accurately. | Medium | Add `/llms.txt` summarising the company, projects, developers, areas, and key factual Q&A; set robots policy for reputable AI crawlers per owner preference. | Accurate representation in LLM answers (GEO). | Low | llmstxt.org; emerging GEO practice. |
| SEO-05 | **Thin extractable factual content** for answer engines. | AI answer engines cite pages with clear, self-contained factual answers, comparisons, and definitions — currently sparse. | Medium | Add factual Q&A blocks, comparison tables, and definitional copy ("What is primary-sale property in Egypt?", "Ras El Hekma vs New Cairo for investment") on area/project pages. | AI Overview / answer-engine citation; topical authority. | Medium | AEO content structure; Google helpful-content. |
| SEO-06 | **No geo / `Place` data.** Areas and projects have no `GeoCoordinates`; Org has no verified address (correctly, pending NAP). | Local relevance and map-pack eligibility depend on geographic signals; these are public geographic facts, not fabricated business data. | Medium | Add `Place` + `GeoCoordinates` to areas/projects; complete `LocalBusiness` NAP once the entity is verified. | Local SEO, map relevance, GEO. | Low–Medium | schema.org/Place; Google local structured data. |

### E. Accessibility (WCAG 2.2 AA)

*A dedicated accessibility pass was already applied (skip link, focus management,
`#sr-live` count region, combobox ARIA, ≥24 px targets, AA contrast, reduced-motion,
RTL parity). These are verify-and-tighten items.*

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| A11Y-01 | **`aria-busy` not set** on the results region during filter updates. | Screen-reader users get the result count but no "updating" state. | Medium | Toggle `aria-busy` around the results swap (pairs with UX-03). | Clearer async feedback for AT. | Low | WCAG 4.1.3. |
| A11Y-02 | **Focus after a filter re-render** needs verification across *all* facet toggles (a `pendingFocusId` mechanism exists but the full-view rebuild is a risk). | If focus drops to `<body>` after a facet toggle, keyboard/AT users lose their place. | Medium | Guarantee focus returns to the activated control on every facet/sort/mode change (best solved together with UX-01 partial update). | WCAG 2.4.3 focus order. | Low | WCAG 2.4.3. |
| A11Y-03 | **Contrast spot-check** of muted teal / price / illustrative-badge text on the bone ground. | Some muted combinations can fall below 4.5:1. | Medium | Audit with a contrast tool; darken the muted token(s) where needed. | WCAG 1.4.3 compliance. | Low | WCAG 1.4.3. |
| A11Y-04 | **Reduced-motion** coverage for the 30 s/60 s contact nudge and the rail. | The nudge should not slide/pulse for users who request reduced motion. | Low | Ensure the nudge/rail honour `prefers-reduced-motion` (extend existing coverage). | Comfort; WCAG 2.3.3 (AAA) courtesy. | Low | WCAG 2.3.3; `prefers-reduced-motion`. |
| A11Y-05 | **Target size (2.5.8)** verify on rail buttons, favourite hearts, filter chips. | WCAG 2.2 AA requires ≥24×24 CSS px (mostly met; verify the heart + chip). | Low | Confirm/adjust hit areas to ≥24 px. | WCAG 2.5.8. | Low | WCAG 2.5.8. |

### F. CRO (Conversion Rate Optimisation)

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| CRO-01 | **No affordability / mortgage calculator.** A payment-plan calc exists for projects, but nothing lets a buyer enter budget → monthly and filter to what they can afford. | It is the single most-used self-qualification tool on every leading portal; it both engages and produces higher-quality leads. | High | Affordability calculator (price, down-payment %, years → monthly) wired to the finder ("show units in my budget"). | Lead quality + conversion + time-on-site. | Medium | Zillow / Bayut mortgage calculators. |
| CRO-02 | **No saved search / new-launch or price alert.** | Primary buyers track launches; "notify me" is a top lead source — and it fits the no-CRM model (hand off to WhatsApp/email like the enquiry form). | High | "Save this search / notify me" capture → WhatsApp/email hand-off. | Lead capture + retention. | Medium | Portal saved-search alerts. |
| CRO-03 | **No sticky primary CTA on mobile scroll.** The rail covers WhatsApp/phone/email, but the lead-form "Talk to an advisor" CTA scrolls away. | The highest-intent action isn't always reachable. | Medium | Sticky mobile CTA bar (advisor + WhatsApp). | Conversion on long pages. | Low | Mobile sticky-CTA pattern. |
| CRO-04 | **Trust block is thin.** No "how it works", no process, no credentials/verified-entity section. | Trust is the gate to enquiry in real estate; buyers need to know who they're dealing with. | Medium | Honest "how it works" + "what we do" section; add licensed-brokerage/registration once the entity is verified. | Trust → conversion. | Low (content) | NN/g trust; E-E-A-T. |
| CRO-05 | **Factsheet download doesn't offer optional contact capture.** `printFactsheet` exists (good, frictionless). | A soft "email me this" would capture intent without adding friction. | Low–Med | Optional "email me this factsheet" alongside the print action. | Lead capture without dark patterns. | Low–Medium | Lead-magnet best practice. |
| CRO-06 | **No structured "book a viewing / schedule a call".** | Enquiry hands to WhatsApp/email (good), but no time selection for higher-intent buyers. | Medium | Optional scheduling capture (date/time preference) in the enquiry flow. | Higher-intent lead quality. | Medium | Scheduling-CTA pattern. |

### G. Real-estate features

| ID | Issue | Why | Priority | Solution | Impact | Complexity | Reference |
|---|---|---|---|---|---|---|---|
| RE-01 | **No map / location search.** Areas are text-only; no way to see or filter projects on a map. | Map search is a baseline expectation on Bayut / Property Finder / Zillow. | High | Start with an illustrated Egypt map + area hotspots (offline-safe), then a real tiled map with project pins and filter-by-area. | Expectation parity; spatial decision-making. | High | Property Finder / Bayut map search. |
| RE-02 | **No floor plans.** Unit pages have no layout view. | Buyers weigh layout heavily; its absence lowers engagement and lead quality. | Medium | Original schematic SVG floor plans per unit type (not copyrighted). | Engagement; better-qualified enquiries. | Medium | Portal floor-plan modules. |
| RE-03 | **No delivery-timeline visualisation.** Primary sale hinges on the delivery date, currently text only. | A timeline makes the most decision-critical fact scannable and builds confidence. | Medium | Launch → construction → delivery-quarter timeline per project. | Clarity; trust. | Low–Medium | Off-plan delivery-timeline UI. |
| RE-04 | **No availability context**, though the Ramla availability sheet was provided. | "From X / N unit types" gives no honest sense of what's left. | Medium | Show per-unit-type availability counts from the sheet, badged illustrative + "as of <date>". | Honest urgency; decision support. | Medium | Off-plan availability display. |
| RE-05 | **One image per project; no gallery.** Renders were provided (e.g., Ramla) but aren't surfaced as multiple views. | Galleries are a primary engagement driver on listings. | Medium | Multi-view gallery per project (renders/illustrations), keyboard-accessible. | Engagement; time-on-page. | Medium | Portal gallery UX. |
| RE-06 | **Compare is not persistent / under-promoted.** Compare + shortlist exist but reset per session and aren't prominent. | Comparison is core to high-consideration purchases; persistence aids return visits. | Low–Med | Persist compare/shortlist in `localStorage`; add a visible compare tray. | Return engagement; decision support. | Low | Portal compare tray. |

---

## 5. Recommended implementation order

**Phase 1 — machine-readability & the two render costs (highest leverage, mostly additive)**
1. `SEO-01` per-listing structured data (`Residence`/`Offer`) — *Critical*.
2. `SEO-02` `FAQPage` schema + `SEO-04` `llms.txt` — quick, high AEO/GEO return.
3. `PERF-01` self-host + subset fonts; `PERF-04` reserve media space (CLS).
4. `SEO-03` per-unit routes (unlocks per-unit schema + sitemap).

**Phase 2 — buyer decision tools (conversion)**
5. `CRO-01` affordability calculator wired to the finder.
6. `CRO-02` saved search / launch alerts (WhatsApp/email hand-off).
7. `RE-03` delivery timeline + `RE-04` availability from the provided sheet.
8. `UX-01` partial results update (also resolves `UX-03`/`A11Y-01`/`A11Y-02`).

**Phase 3 — depth & differentiation**
9. `RE-01` map search, `RE-02` floor plans, `RE-05` galleries.
10. `UI-01` distinct per-project art; `CRO-03` sticky mobile CTA; `CRO-04` trust block.
11. `PERF-02`/`PERF-03` static hero + lazy-init modules.
12. `UX-02` back-to-top, `UX-04` recently-viewed, `UI-03` dark mode, remaining A11y tighten-ups.

**Owner-blocked (not engineering):** official developer logos (`UI-02`), real
photography, verified legal entity / NAP (`SEO-06`, `CRO-04`), confirmed live
inventory. Tracked in `docs/LAUNCH_BLOCKERS.md`.

---

## 6. What is already strong (keep it)

- **Relational finder** with facet reconciliation (Area → Developer → Project) and
  three match modes — genuinely better than most portals' AND-only filtering.
- **Grounded recommendation engine** + **selection-aware advisor** that never
  fabricates and always hands off to a real WhatsApp/email destination.
- **Honesty system**: every figure badged *illustrative*, no fake success states,
  payment ceilings derived from data — a real trust asset and an E-E-A-T signal.
- **Bilingual routing** with clean locale paths, real Back/Forward, deep links,
  branded 404, hreflang, and RTL parity.
- **Accessibility foundation** already in place (see §E preamble).
- **Scroll preservation** on dynamic updates — shipped this cycle.

*All commercial figures in the product remain illustrative and advisor-confirmed;
this audit recommends no fabricated data, ratings, or testimonials.*
