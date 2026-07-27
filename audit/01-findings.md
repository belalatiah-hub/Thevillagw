# PHASE 1 — Full Audit

**Branch:** `feat/site-audit-and-ai-upgrade` · **Nothing implemented yet — findings only.**
**Method:** Lighthouse 12 (mobile, `--screenEmulation.mobile`) against a local threaded
server serving this exact `index.html`; a Playwright sweep over 18 routes capturing
headings, images, JSON-LD, links and layout; WCAG contrast computed from the real CSS
tokens; and direct reads of the bundle.

---

## Baseline scores (measured, mobile)

| Route | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/en/` (home) | **38** | 95 | 92 | **100** | 10.7 s | 1,160 ms | 0 |
| `/ar/` (home) | **49** | 99 | 92 | **100** | 10.7 s | 520 ms | 0 |
| `/en/projects/beach-plaza-premium/` | **77** | 95 | 92 | **100** | 3.9 s | 60 ms | 0.003 |

The homepage is the worst page on the site and the one every campaign will land on.

---

## Scorecard

| # | Area | Score | One-line verdict |
|---|---|---:|---|
| 1 | Technical SEO | **8.5 / 10** | Genuinely strong. Lighthouse SEO = 100 on every route. Gaps are thin meta descriptions and heading order. |
| 2 | Structured Data | **7.5 / 10** | Better than Phase 0 assumed — `RealEstateAgent` is present sitewide. Missing `Article`, and developer/area pages carry no entity schema. |
| 3 | GEO / AEO | **6.5 / 10** | `llms.txt` is excellent. But no answer-first paragraphs, only 2 FAQ groups, and the numbers an AI would quote are locked in JS. |
| 4 | Performance | **3.5 / 10** | 38 mobile. LCP 10.7 s, TBT 1,160 ms. The 619 KB single file is the cause. |
| 5 | CRO | **5.5 / 10** | CTAs everywhere, but no proof, no testimonials, no licence, and every lead path ends in a `""` endpoint. |
| 6 | Copy | **4.5 / 10** | Describes the company, not the customer. No objection handling. No differentiation a competitor couldn't copy. |
| 7 | Accessibility + RTL | **8 / 10** | 95–99 a11y, RTL genuinely correct via logical properties. Three real defects. |

**Weighted overall: 6.1 / 10** — a technically careful site with a serious performance
problem and commercially weak copy.

---

# 1 · Technical SEO — 8.5/10

Lighthouse SEO scores **100 on all three routes tested**. Canonical, `hreflang`
(en/ar/x-default), OG + Twitter, `robots.txt`, `sitemap.xml` (576 URLs), `404.html` with
the rafgraph SPA shim, `.nojekyll`, `CNAME` — all correct. Every route sets a unique
title and description at runtime.

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| SEO-1 | **Charset declared at byte 1,626** — a 1.5 KB comment banner precedes it. Lighthouse Best-Practices fails; browsers must re-decode. | P1 | Best-Practices 92→100; removes a re-parse | XS | Move `<meta charset>` to the first child of `<head>`; move the banner comment after it. |
| SEO-2 | **Meta descriptions too short on 8 routes.** `/en/new-launches/` = 38 chars, `/en/areas/` = 46, `/en/areas/newcairo/` = 68, `/en/faqs/` = 71. | P1 | Google rewrites short descriptions; CTR loss | S | Write 140–160 char descriptions per route template, EN + AR. |
| SEO-3 | **Heading order jumps on 6 list routes** (`/projects/`, `/units/`, `/developers/`, `/areas/`, `/areas/newcairo/`, `/insights/`) — h1 → h3 with no h2. Lighthouse a11y failure. | P1 | Semantics + a11y score | S | Make `sectionHead()` emit h2 by default; demote card titles to h3. |
| SEO-4 | **Ten developer pages with zero inventory** — qataridiar, orascom, tmg, madinetmasr, cityedge, ilcazar, lavista, inertia, alahlysabbour, saudiegyptian. All in the sitemap. | P1 | Thin-content signal across 20 URLs (EN+AR) | S | Either `noindex` + drop from sitemap until inventory exists, or add real editorial content. |
| SEO-5 | `/en/units/` renders **375 images, 5,618 words, 643 internal links** on one page. | P2 | Crawl-budget dilution; link equity spread thin | M | Paginate or lazy-render below the first 24 units. |
| SEO-6 | Canonical points at `www.thevillageinvestment.com` while the site is served from `village.belalatiah.workers.dev`. | P0 | If the Workers URL gets indexed, every canonical points at a host that may not resolve | XS | Decide the canonical host; add `noindex` on the Workers host, or finish the DNS cutover. |
| SEO-7 | No `WebSite` + `SearchAction` schema despite a working `/search/` route. | P2 | No sitelinks search box eligibility | XS | Add to the sitewide LD block. |

**Evidence:** `index.html:1626` (charset offset); Playwright sweep `desc.length` column;
`headingJumps` column; `recon2.cjs` → `developersWithNoProjects`.

---

# 2 · Structured Data — 7.5/10

**Correction to Phase 0:** `RealEstateAgent` **is** emitted on every route — my Phase 0
grep pattern missed it. Verified by parsing rendered `<script type="application/ld+json">`.

**Present and correct:**
- Sitewide: `RealEstateAgent`, `BreadcrumbList` + `ListItem`
- Project page: `Product,Residence`, `Organization`, `PostalAddress`, `PropertyValue`, `AggregateOffer`, `ItemList`, `Offer`, `Apartment`, `QuantitativeValue`
- Unit page: `Product,Apartment`, `Offer`, `Residence`, `QuantitativeValue`
- List pages: `CollectionPage` + `ItemList`
- FAQs: `FAQPage` + `Question` + `Answer`

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| SD-1 | **6 insights articles carry no `Article` schema** — only `RealEstateAgent`+`BreadcrumbList`. | P1 | No article rich results, no author/date signals | S | Emit `Article` with `headline`, `datePublished`, `author`, `image`, `inLanguage`. |
| SD-2 | **Developer pages carry no `Organization`** for the developer they describe. | P1 | Loses the entity link Google/AI use to connect Modon ↔ its projects | S | `Organization` + `subOrganization`/`brand` + `ItemList` of projects. |
| SD-3 | **Area pages carry no `Place`/`ItemList`.** | P2 | Weak local-entity signal | S | `Place` + `containedInPlace: Egypt` + `ItemList`. |
| SD-4 | No `AggregateRating` / `Review` anywhere. | P2 | Star ratings unavailable in SERPs | M | **Blocked** — needs real reviews. `[NEEDS_INPUT]` |
| SD-5 | `Offer.availability` derives from an `avail` field the copy calls "illustrative". | P2 | Risk of a structured-data mismatch penalty | S | Set `priceValidUntil` and keep `availability` conservative. |

---

# 3 · GEO / AEO — 6.5/10

This decides whether ChatGPT, Claude, Perplexity and AI Overviews cite The Village when
someone asks *"best primary-sale broker in New Cairo"*.

**Strong:** `llms.txt` exists and is unusually good — states the business model, the
market, the languages, and explicitly that all figures are illustrative. Entity clarity is
high (`RealEstateAgent` + consistent NAP). The chat cannot fabricate figures.

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| GEO-1 | **No answer-first paragraphs.** Every page opens with brand or navigation, not with the answer. `/en/areas/` = 227 words; `/en/new-launches/` = 23 words. | P0 | AI engines extract the first substantive paragraph. There isn't one. | M | Open every page with a 40–60 word direct answer. (Phase 3.) |
| GEO-2 | **Only 2 FAQ groups sitewide**, and no FAQ on project, developer or area pages. | P0 | FAQ blocks are the single most-quoted format in AI answers | M | 6–8 Q&A per project/area/developer template, generated from real data. |
| GEO-3 | **The quotable numbers are locked in JavaScript.** 58 projects, 215 units, 23 developers, 9 areas — none appear as text an extractor can lift without executing JS. | P0 | Crawlers that don't run JS see an empty shell | M | Emit a `<noscript>` summary block with the counts and the top entities. |
| GEO-4 | No comparison content ("Modon vs SODIC in Ras El Hekma"), no pricing-range tables in prose. | P1 | Comparison queries are the highest-intent AI queries in real estate | M | Generate comparison sections from `PROJECTS`. |
| GEO-5 | `llms.txt` isn't referenced from `robots.txt` and lists no per-page map. | P2 | Discoverability | XS | Add `# llms: /llms.txt` to robots; extend with a route index. |
| GEO-6 | Insights articles have no author, no date, no citations. | P1 | AI engines weight authorship and recency heavily | S | Add byline + `datePublished` + sources. `[NEEDS_INPUT: author name/credentials]` |

---

# 4 · Performance — 3.5/10 🔴 the headline problem

| Metric | `/en/` measured | Target |
|---|---:|---:|
| Performance score | **38** | ≥ 90 |
| LCP | **10.7 s** | ≤ 2.5 s |
| TBT | **1,160 ms** | ≤ 200 ms |
| FCP | 3.8 s | ≤ 1.8 s |
| Speed Index | 6.8 s | ≤ 3.4 s |
| CLS | **0** ✅ | ≤ 0.1 |
| Main-thread work | **4.0 s** | ≤ 2 s |
| Total page weight | 1,883 KiB | — |

CLS of 0 is genuinely excellent and must be protected by every fix below.

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| PERF-1 | **One 619 KB HTML file (167 KB gzip) carries all 58 projects, 215 units and both languages** to every visitor. Lighthouse: *unused JavaScript, est. 174 KiB*. | P0 | Root cause of TBT 1,160 ms and main-thread 4.0 s | L | Split the data maps out of the critical bundle; load per-route as JSON. Ship only the active language. |
| PERF-2 | **Nothing is minified.** Est. savings: **69 KiB JS + 10 KiB CSS**; unused CSS a further 54 KiB. | P0 | ~35% off the critical bundle for zero behaviour change | S | Add a minify step to `build.py` (esbuild/terser + lightningcss). |
| PERF-3 | **LCP 10.7 s on home.** The hero renders after the whole bundle parses. | P0 | The single worst number on the site | M | Inline critical CSS, `<link rel=preload>` the hero image, defer the rest of the JS. |
| PERF-4 | **Fonts load from `fonts.googleapis.com`** — render-blocking third-party request on the critical path, plus a GDPR consideration. | P1 | ~300–600 ms on a cold 4G connection | S | Self-host WOFF2 subsets; `font-display: swap`; drop the CSP allowance. |
| PERF-5 | **Images: est. 221 KiB savings.** Four assets exceed 380 KB (`mp-OG-WC1.webp` 417 KB, `ramla/townhouse.webp` 402 KB, `locations/newcairo.webp` 397 KB). 60.7 MB total across 749 files. | P1 | Direct LCP improvement | M | Re-encode at q78 + generate 480/960/1440 `srcset`. |
| PERF-6 | **4 images load eagerly on every route** including ones below the fold. | P1 | Competes with LCP for bandwidth | XS | `loading="lazy"` on everything except the LCP element. |
| PERF-7 | **bfcache blocked — 2 failure reasons.** | P2 | Back/forward navigation re-runs everything | S | Diagnose (likely `unload`/`beforeunload`); remove the blocker. |
| PERF-8 | `/en/units/` renders **375 `<img>` elements** at once. | P1 | Guaranteed poor performance on the highest-intent page | M | Virtualise or paginate. |

---

# 5 · CRO — 5.5/10

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| CRO-1 | **`CONFIG.LEAD_ENDPOINT` is `""`.** The contact form, the lead popup and any chat capture post nowhere. | P0 | **Every lead generated by this site is lost.** Nothing else on this list matters more. | S | `[NEEDS_INPUT: CRM/webhook URL]` — then wire + retry + failure toast. |
| CRO-2 | **`track()` pushes to a `dataLayer` no container reads.** | P0 | No funnel, no attribution, no way to prove any of this worked | S | `[NEEDS_INPUT: GA4/GTM ID]` + CSP allowance. |
| CRO-3 | **No social proof of any kind.** 0 testimonials, 0 reviews, 0 case studies, 0 client logos, no licence or registration number. | P0 | In Egyptian primary sales, trust *is* the conversion | M | `[NEEDS_INPUT: testimonials, brokerage licence no., deals closed, team size]` |
| CRO-4 | **The "illustrative — confirm with advisor" badge appears 52 times.** Honest, but at that density it reads as "we don't know our own prices". | P1 | Undermines confidence on every card | S | Once per page in a trust strip, not once per figure. |
| CRO-5 | **No pricing anchor or affordability entry on the homepage.** The visitor must reach the finder before seeing a number. | P1 | Highest-intent visitors bounce first | S | "Units from EGP X" band, computed from `PROJECTS`. |
| CRO-6 | **`cta_talk` appears 11× and is the only conversion verb.** No "Get a shortlist", "Book a viewing", "Download the price list". | P1 | One offer suits one buyer stage | S | Three CTA tiers matched to intent. |
| CRO-7 | **The lead popup fires on a timer**, not on intent. | P2 | Interrupts before value is delivered | S | Trigger on exit-intent or 2nd project view. |
| CRO-8 | WhatsApp is the strongest channel in this market but is a floating icon, not a primary CTA. | P1 | Leaves the highest-converting channel underused | XS | Promote to a primary button with a pre-filled message. |

---

# 6 · Copy — 4.5/10 🔴

**The test: does the copy talk about the customer, or about the company?**

> **H1:** "Invest in your real-estate future with confidence" ✅ customer-facing
> **Sub:** "The Village is a real-estate marketing and brokerage company. We help you compare new launches, developers and areas…" ❌ **company-facing, in the most valuable paragraph on the site**

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| COPY-1 | **The hero sub-headline opens by defining the company.** | P0 | The 5-second test fails at the first paragraph | S | Lead with the visitor's outcome. (Phase 3.) |
| COPY-2 | **No objection handling anywhere** — no "why buy now", "why through you", "where does my money go", "what if the developer delays". | P0 | These are the four questions every Egyptian buyer asks | M | Dedicated section, Home + About. |
| COPY-3 | **"Why buyers choose The Village" is three features, not three benefits** — "Primary sale, done right", "New launches, off-plan and developer-direct units only". | P1 | Any broker could write the same three lines | S | Rewrite benefit-first with proof. |
| COPY-4 | **No proof numbers in prose.** 58 projects, 23 developers, 215 units exist in the data and appear nowhere in the copy as claims. | P1 | Free credibility, unused — and exactly what AI engines quote | S | "58 primary-sale projects across 23 developers and 9 areas." |
| COPY-5 | **Thin pages:** `/en/new-launches/` = 23 words, `/en/areas/` = 227, `/en/insights/` = 156. | P1 | Too thin to rank or be cited | M | 300+ words each, answer-first. |
| COPY-6 | **Arabic is Modern Standard, not Egyptian.** "لماذا يختار المشترون" is correct but formal — it reads like a bank, not an advisor. | P1 | Egyptian buyers trust conversational Egyptian | M | Rewrite in professional Egyptian Arabic. (Phase 3.) |
| COPY-7 | **Brand disclaimers are printed in the public footer** — "Identity derived from The Village master logo. Approved brand sign-off pending", "Launch note: verified contacts, live inventory, CRM lead delivery and legal review are pending owner input." | P0 | **Internal project notes visible to every customer, telling them the site is unfinished.** | XS | Remove from the public site. |

---

# 7 · Accessibility + RTL — 8/10

Accessibility scores **95 (EN) / 99 (AR)**. RTL is done properly — logical properties
throughout, `dir` flips cleanly, no horizontal scroll on any of the 18 routes at 390 px.
Skip link present, 15 `:focus-visible` rules, `role` used correctly in 9 places, 2
`aria-live` regions.

**Measured contrast** (WCAG AA needs 4.5:1 normal, 3:1 large):

| Pair | Ratio | AA |
|---|---:|---|
| WhatsApp button `#fff` on `#1f8f4e` | **4.12** | ❌ FAIL (normal) |
| Focus ring `--teal-500` on `--bone` | **4.17** | ❌ FAIL (non-text 3:1 ✅) |
| Body ink on bone | 15.43 | ✅ |
| Muted `--ink-3` on bone | 5.00 | ✅ |
| Footer `#7e9aa2` on teal-900 | 4.80 | ✅ |
| EOI `--warn-ink` on `--warn-bg` | 5.08 | ✅ |

| ID | Issue | Sev | Impact | Effort | Fix |
|---|---|---|---|---|---|
| A11Y-1 | **WhatsApp button fails AA at 4.12:1.** | P1 | Fails WCAG on the most-used CTA | XS | Darken to `#187a40` (5.39:1 — already the hover colour). |
| A11Y-2 | **Accessible-name mismatch on featured cards** — `aria-label="Ogami"` while the visible text is longer. Lighthouse failure. | P1 | Voice control cannot activate the link | XS | Make `aria-label` start with the visible text, or drop it. |
| A11Y-3 | **Heading order jumps** (same as SEO-3) — footer `h4` after `h1`. | P1 | Screen-reader navigation | S | Fix the hierarchy. |
| A11Y-4 | Focus ring 4.17:1 — passes non-text (3:1) but is faint on bone. | P2 | Keyboard users lose their place | XS | `--teal-700` for the ring. |
| A11Y-5 | No `aria-live` on the finder result count. | P2 | Screen readers don't hear "24 units found" | XS | Add a polite live region. |

---

# ICE Priority Table

*Impact × Confidence ÷ Effort. Effort: XS=1, S=2, M=4, L=8.*

| Rank | ID | Item | I | C | E | **ICE** | Sev |
|---:|---|---|---:|---:|---:|---:|---|
| 1 | CRO-1 | Wire the lead endpoint | 10 | 10 | 2 | **50.0** | P0 |
| 2 | COPY-7 | Remove internal disclaimers from the footer | 8 | 10 | 1 | **80.0** | P0 |
| 3 | SEO-1 | Move `<meta charset>` into the first 1 KB | 5 | 10 | 1 | **50.0** | P1 |
| 4 | A11Y-1 | Fix WhatsApp button contrast | 6 | 10 | 1 | **60.0** | P1 |
| 5 | A11Y-2 | Fix accessible-name mismatch | 6 | 10 | 1 | **60.0** | P1 |
| 6 | PERF-2 | Minify JS + CSS (−79 KiB) | 9 | 10 | 2 | **45.0** | P0 |
| 7 | CRO-2 | Install analytics | 9 | 10 | 2 | **45.0** | P0 |
| 8 | PERF-6 | Lazy-load non-LCP images | 7 | 9 | 1 | **63.0** | P1 |
| 9 | SEO-6 | Resolve the canonical-host conflict | 8 | 9 | 1 | **72.0** | P0 |
| 10 | SEO-3 / A11Y-3 | Fix heading hierarchy | 6 | 10 | 2 | **30.0** | P1 |
| 11 | PERF-4 | Self-host fonts | 7 | 9 | 2 | **31.5** | P1 |
| 12 | SEO-2 | Rewrite 8 short meta descriptions | 6 | 9 | 2 | **27.0** | P1 |
| 13 | SEO-4 | Handle 10 empty developer pages | 6 | 9 | 2 | **27.0** | P1 |
| 14 | COPY-1 | Rewrite the hero sub-headline | 9 | 8 | 2 | **36.0** | P0 |
| 15 | GEO-1 | Answer-first paragraphs sitewide | 9 | 8 | 4 | **18.0** | P0 |
| 16 | GEO-2 | FAQ blocks on project/area/developer | 9 | 8 | 4 | **18.0** | P0 |
| 17 | SD-1 | `Article` schema on insights | 6 | 9 | 2 | **27.0** | P1 |
| 18 | SD-2 | `Organization` on developer pages | 6 | 9 | 2 | **27.0** | P1 |
| 19 | PERF-5 | Re-encode images + `srcset` | 8 | 9 | 4 | **18.0** | P1 |
| 20 | COPY-2 | Objection-handling section | 9 | 7 | 4 | **15.8** | P0 |
| 21 | PERF-3 | Critical CSS + preload the hero | 9 | 8 | 4 | **18.0** | P0 |
| 22 | CRO-3 | Social proof | 10 | 8 | 4 | **20.0** | P0 |
| 23 | PERF-1 | Split data out of the critical bundle | 10 | 8 | 8 | **10.0** | P0 |
| 24 | PERF-8 | Paginate `/units/` | 7 | 8 | 4 | **14.0** | P1 |
| 25 | GEO-3 | `<noscript>` fact summary | 7 | 7 | 4 | **12.3** | P0 |

---

## Phase 2 execution order (proposed)

**Batch A — quick wins, ~½ day, no `[NEEDS_INPUT]`:**
COPY-7, SEO-1, A11Y-1, A11Y-2, A11Y-4, PERF-6, SEO-7, GEO-5

**Batch B — build pipeline, ~1 day:**
🔴 **Commit `src/` + `build.py` + `domtest.cjs` first** (Phase-0 P0-1 — right now the
build sources exist only in an ephemeral scratchpad), then PERF-2 (minify) and PERF-4
(self-host fonts).

**Batch C — performance, ~2 days:**
PERF-3, PERF-5, PERF-8, PERF-7 → re-measure Lighthouse.

**Batch D — SEO/schema, ~1 day:**
SEO-2, SEO-3, SEO-4, SD-1, SD-2, SD-3.

**Batch E — blocked on you:**
CRO-1 (endpoint), CRO-2 (GA4 ID), CRO-3 (proof), SEO-6 (canonical host), GEO-6 (author).

---

## Honest note on the Lighthouse ≥ 90 target

Performance ≥ 90 on mobile **is not reachable without PERF-1** — splitting the data out of
the critical bundle. Batches A–C should land roughly 38 → 75-ish; the last 15 points
require changing how the site is delivered, which means committing the build pipeline
first. Accessibility ≥ 95 is already met (95/99) and ≥ 98 is reachable in Batch A. SEO is
already 100. Best Practices reaches 100 with SEO-1 alone.

I will report real before/after numbers, not projections.
