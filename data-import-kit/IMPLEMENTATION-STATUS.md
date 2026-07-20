# The Village Investment — Tier-1 Implementation Status

**Date:** 2026-07-20
**Against:** `thevillage…master-prompt.md` + `thevillage…deep-audit-tier1-roadmap.md`
**Live:** https://www.thevillageinvestment.com (custom domain) · staging: village.belalatiah.workers.dev

---

## 1. Executive reconciliation

The two documents audited the **live SPA without executing JavaScript**, so the reader
saw only the application shell and scored the site **28/100**. Executing the app (or
inspecting this repository) shows a far more complete platform: most "critical" findings
are **already implemented**; they simply weren't visible to a no-JS reader.

The **one genuinely open architectural item** is server-side/pre-rendered per-route HTML
(SSR/SSG). This turn delivers the highest-value, credential-free, architecture-safe slice
of it (crawlable initial HTML) and documents the remaining decision + credential blockers.

---

## 2. Audit findings — reconciled

| Finding | Audit claim | Actual state | Action this turn |
|---|---|---|---|
| F-001 core content absent from initial HTML | Critical | Client-rendered SPA → shell only w/o JS | **Baked crawlable nav + footer + H1 + primary-sale summary + section links into the initial HTML** (progressive enhancement; SPA hydrates over it). Full per-route SSG = next step (decision). |
| F-002 Contact not route-specific | Critical | Route-specific title/desc/H1/JSON-LD **exist** (client `setHead`), but initial HTML is generic w/o JS | Same root cause as F-001; full fix = SSG. |
| F-003 crawlable nav/links absent | Critical | Nav was JS-populated | **Fixed** — real `<a href>` primary nav now in initial HTML. |
| F-004 brand accessible name "Investment" | High | Already `aria-label="The Village Investment — home"` | Already done. ✓ |
| F-005 duplicate advisor controls | High | Responsive controls; hidden ones use CSS | Verify in a11y pass (low risk). |
| F-006 footer groups empty | High | Footer JS-populated | **Fixed** — footer link columns now in initial HTML (+ mobile accordions). |
| F-007 workers.dev hostname | Critical | **Custom domain configured** (`CNAME` = www.thevillageinvestment.com); robots/sitemap use it | Largely done; confirm redirect of workers.dev (owner/Cloudflare). |
| F-008 Arabic public content | High | Full `/ar/` routes, RTL, hreflang, AR metadata **exist** (client-rendered) | Same as F-001 for initial HTML. |
| F-009 crawlable entity graph | Critical | **290-URL sitemap** (EN+AR entities) + per-route JSON-LD | Sitemap covers entity discovery; section links now in initial HTML. |
| F-010 global search | High | `⌘K` command palette + search route **exist** | Functional. |

**Already present (audit didn't credit):** custom domain, robots.txt, 290-URL sitemap,
hreflang en/ar/x-default, canonical, Open Graph, per-route JSON-LD (Residence/Offer/
Breadcrumb/FAQ/ItemList), 404.html, llms.txt, per-route titles/descriptions, relational
filters, unit comparison, bilingual PDF factsheets, rule-based AI advisor, saved items,
delivery timeline, availability signals, lead capture.

---

## 3. Delivered this turn (Phase 0 — crawlable initial HTML)

- Real `<a href>` **primary nav** baked into initial HTML (Home, Search, New launches,
  About, Favorites, Compare).
- **Footer** link columns (Explore / Company / Legal) baked into initial HTML.
- `#main` **no-JS fallback**: one H1, a primary-sale positioning paragraph, and crawlable
  links to Projects, New launches, Units, Developers, Areas, Compare, Research, FAQs,
  About, Contact.
- Verified: no-JS HTML now contains H1 + 7 nav + 10 section + 13 footer links; with JS the
  SPA `clear()`s and re-renders cleanly (nav=6 w/ icons, hero rendered, `.prerender`
  removed — **no duplication**). Tests: **171/171**.

---

## 4. The one architecture decision (owner)

**Full per-route pre-rendering (SSG/SSR).** To give no-JS crawlers/AI *route-specific*
content on every page (not just the shared shell), each public route must emit its own
pre-rendered HTML. Options:

1. **Static generation (recommended):** a build step renders each route (home, projects,
   units, developers, areas, research, faqs, contact… EN+AR) to its own HTML using the
   existing Node render harness, then the SPA hydrates. Keeps Cloudflare/Pages hosting.
   Trade-off: many output files; the ~480 KB inline script is either duplicated per page
   or extracted to an external `main.js` (moves away from the single-file artifact).
2. **Worker SSR layer:** a Cloudflare Worker renders route HTML on request.

This is a real change to the build/deploy pipeline and the single-file architecture the
project has used to date — hence an owner decision.

---

## 5. Blockers requiring owner input / credentials

| Blocker | Impact | Needs |
|---|---|---|
| Real inventory data | Data integrity | Verified prices/availability/floors/payment plans per unit (Excel kit ready) |
| Custom-domain redirect | Canonical host | Confirm workers.dev → www.thevillageinvestment.com 301 in Cloudflare |
| Accounts / login | Saved items sync, account routes | Auth backend decision (Cloudflare Access / D1 / third-party) |
| AI Advisor tool-calling | Grounded LLM answers | LLM API key + backend endpoint (current advisor is deterministic/rule-based) |
| Legal/company facts | Trust pages, ContactPoint | Verified office address, hours, registration, advisor identities |
| Research/GCC/country content | Authority + international SEO | Original EN/AR copy (or approval to draft) |
| Media rights | Real project photography | Developer media-kit authorizations |

---

## 6. Recommended next sequence

1. Owner picks SSG vs. Worker-SSR (Section 4).
2. Implement per-route pre-rendering for the ~16 core route templates (EN+AR).
3. Load verified inventory via the Excel kit → replace illustrative figures.
4. Wire real AI tool-calling + accounts backend (credential-gated).
5. Draft Research/FAQ/GCC/country content (owner approval).
6. Phase-5 certification: field Web Vitals, a11y audit, security headers, regression suite.

*This file is internal (excluded from the public deploy).*
