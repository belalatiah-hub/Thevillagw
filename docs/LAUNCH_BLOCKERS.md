# Launch blockers & owner inputs

Status of the items that need the brand owner before a full public launch.

## Resolved (owner-provided)
- **Contact phone** — `+20 101 600 0201` (also WhatsApp). Live on the site.
- **Contact email** — `info@thevillageinvestment.com`. Live on the site.
- **Lead delivery** — by request, **no CRM**: the enquiry form and the assistant
  hand off directly to **WhatsApp / email** (a real destination), no fake success.
- **Social profiles** — Facebook, Instagram, LinkedIn and TikTok URLs are live in
  the footer and in the Organization `sameAs` structured data.

## Still pending owner input
| # | Item | Why it matters | What the site does today |
|---|------|----------------|--------------------------|
| 1 | **Live, source-backed inventory** (prices, plans, delivery, availability, real units) | Figures change constantly and must be confirmed with the developer | Every price/plan/unit is labelled *illustrative — confirm with an advisor*; counts derived from on-page data |
| 2 | **Official developer logos** | The real logos are trademarked; I can't reproduce third-party marks without the files/rights | Each developer shows an original colored monogram mark as a placeholder; drop official SVG/PNGs in when licensed |
| 3 | **Real project & unit photography** | Real photos are copyrighted; can't be used without rights | Every project/unit shows an original on-brand SVG illustration (clearly not a photo) |
| 5 | **Brand approval** | Final logo/color/type sign-off is the owner's | Identity derived from the master logo; recorded provisional |
| 6 | **Legal review** (privacy, terms, any ownership/tax/residency claims) | Regulated content needs a named reviewer | Privacy/Terms marked "pending legal review"; no return/guarantee claims |
| 7 | **Verified corporate identity** (legal entity, registration, brokerage authorization, office address) | Trust + structured data | Org schema carries verified phone/email only; no fabricated NAP |

## Notes
- **Assistant**: the in-site chat is a deterministic assistant grounded only in
  this site's real content (projects, developers, areas, units, payment info). It
  is not an LLM — a real AI would need a backend + the AI-governance controls in
  the V2.1 contract. When it can't answer it hands off to WhatsApp or the client
  registration form. This is the contract's approved "guided finder" path.
- **`CONFIG`** (top of the script in `index.html`) is the single place to set
  `phone`, `whatsapp`, `email`, `social`, and an optional `LEAD_ENDPOINT` if you
  later decide to POST leads to a backend/CRM.

## Deployment & domain
The site is configured to serve at the **custom-domain root**
`https://www.thevillageinvestment.com/` — every absolute URL (canonical,
hreflang, sitemap, `robots.txt`, Open Graph, JSON-LD) targets that origin, and
`404.html` deep-link restore uses `pathSegmentsToKeep = 0` to match.

**Owner action to go live on the domain:**
1. A `CNAME` file (`www.thevillageinvestment.com`) is committed, so GitHub Pages
   will claim the domain on deploy.
2. Point DNS at GitHub Pages: a `CNAME` record for `www` →
   `belalatiah-hub.github.io`, then enable **Settings → Pages → Enforce HTTPS**.
3. Until DNS resolves, preview via the delivered **`index.html`** opened directly
   (it runs in file:// mode with hash-based routing) or the temporary
   `belalatiah-hub.github.io` URL.

> If you would rather stay on the GitHub **project-page** URL
> (`belalatiah-hub.github.io/thevillagw/`) instead of the custom domain, delete
> `CNAME`, set `seg = 1` in `404.html`, and change `CONFIG.origin` (and the
> sitemap/robots origins) to that URL. As shipped, the custom domain is the
> intended target.

For strict per-URL HTTP 404 status codes, front the site with a server/CDN
rewrite; on GitHub Pages the `404.html` SPA-restore is the supported path.

## Quality pass (multi-agent audit, applied)
A security + SEO/i18n + accessibility + data-integrity review ran against the
built file; all confirmed findings were fixed in this build. Highlights:
- **Honesty**: payment-term copy now derives its ceiling from the dataset (no
  "up to 10 years" overstatement); the assistant badges every price
  *illustrative*; the no-CRM lead hand-off uses a neutral (not green "success")
  state; area tiles carry a provenance note and project cards gained a WhatsApp
  CTA, matching the unit cards.
- **SEO**: real bilingual **Open Graph / Twitter image** (`og-cover.png`,
  1200×630); one `<h1>` per indexable route; localized breadcrumbs;
  self-referential canonical on the 404; per-locale `og:locale:alternate`.
- **Accessibility (WCAG 2.2 AA)**: combobox `aria-activedescendant`/
  `aria-selected` in the command palette; drawer & chat focus-return; darker
  muted text for ≥4.5:1 contrast; a persistent `#sr-live` region announces
  result counts; keyboard focus is restored after finder re-renders; ≥24px
  filter-tag targets; localized icon-button labels; full error summary + linked
  consent error on the contact form.
