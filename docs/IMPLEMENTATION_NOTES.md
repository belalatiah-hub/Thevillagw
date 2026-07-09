# Implementation notes — The Village Investment website

Bilingual (EN/AR) primary-sale property web app, delivered as a self-contained
static application. This summarises the decisions and the verification evidence.

## Architecture
- **Single-file app** (`index.html`): HTML + tokenised CSS + vanilla JS, no build
  step. Chosen to satisfy the "give me an HTML file" deliverable while still being
  production-quality. A framework (Next.js SSR/SSG) would be required for true
  per-URL server rendering + database/CRM; that path is documented as the next
  step once the launch blockers (verified inventory, CRM, contacts) are resolved.
- **Routing**: History API, clean locale-prefixed paths (`/en/…`, `/ar/…`),
  working Back/Forward, deep links, and a real branded `noindex` 404 view.
  `404.html` implements the standard static-host deep-link restore.
- **Data**: one canonical `PROJECTS` array is the single source of truth; area
  counts and "from" prices are *derived* from it (never hard-coded). Developer
  and area **names** are public facts; every price/plan/delivery value is
  illustrative and badged.
- **Brand**: tokens derived from the approved master logo — teal `#073D52` /
  `#115F7D`, warm bone `#F3EFE6`, ink. The legacy royal-blue/yellow/olive
  residue was removed. Both logo variants (dark for light surfaces, bone for
  dark) are embedded as data URIs.
- **i18n**: full EN/AR with `dir` switching, RTL parity, Tajawal for Arabic,
  Fraunces + Plus Jakarta Sans for Latin. Language toggle preserves the route.

## Security & honesty (contract non-negotiables)
- No inline event handlers; all behaviour via `addEventListener`.
- No `innerHTML` for dynamic/user content — a safe hyperscript `h()` builds DOM
  with `textContent` only (removes the prototype's self-XSS/DOM-XSS risk).
- Content-Security-Policy in `<meta>`; no `eval`.
- No fake success: the lead form only claims success on a real accepted response.
- No placeholder contacts: phone/WhatsApp/email stay hidden until configured.
- No fabricated stats: visible counts come from the on-page dataset.

## Accessibility (target WCAG 2.2 AA)
Semantic landmarks, skip link, focus moved to `<main>` on route change, visible
focus rings, keyboard-operable nav/drawer/accordion/compare, AA contrast, error
summary + field errors with `aria-invalid`, reduced-motion support, ≥44px targets,
single bottom fixed bar on mobile, RTL parity.

## Verification (headless Chromium via Playwright, GitHub-Pages emulation)
Automated suite in the repo scratchpad drives real journeys and asserts:
home redirect + render, project deep-link restore, Back/Forward, filter → URL
state, compare table, EN→AR RTL switch, contact-form validation + honest (non-
fake) result, unknown route → 404 view, and no page-level horizontal overflow at
320px in EN and AR. JS is `node --check` clean. External Google-Fonts requests
fail only in the offline sandbox; they load normally in production.

## Route inventory (indexable unless noted)
`/{en,ar}/` · `/projects/` · `/projects/[slug]/` · `/new-launches/` ·
`/developers/` · `/developers/[slug]/` · `/areas/` · `/areas/[slug]/` ·
`/insights/` · `/insights/[slug]/` (noindex — guides carry no verified author/date) ·
`/faqs/` · `/about/` · `/contact/` · `/privacy/` · `/terms/` ·
`/compare/` (noindex) · 404 (noindex).
