# Launch blockers & owner inputs

Status of the items that need the brand owner before a full public launch.

## Resolved (owner-provided)
- **Contact phone** — `+20 101 600 0201` (also WhatsApp). Live on the site.
- **Contact email** — `info@thevillageinvestment.com`. Live on the site.
- **Lead delivery** — by request, **no CRM**: the enquiry form and the assistant
  hand off directly to **WhatsApp / email** (a real destination), no fake success.

## Still pending owner input
| # | Item | Why it matters | What the site does today |
|---|------|----------------|--------------------------|
| 1 | **Live, source-backed inventory** (prices, plans, delivery, availability, real units) | Figures change constantly and must be confirmed with the developer | Every price/plan/unit is labelled *illustrative — confirm with an advisor*; counts derived from on-page data |
| 2 | **Official developer logos** | The real logos are trademarked; I can't reproduce third-party marks without the files/rights | Each developer shows an original colored monogram mark as a placeholder; drop official SVG/PNGs in when licensed |
| 3 | **Real project & unit photography** | Real photos are copyrighted; can't be used without rights | Every project/unit shows an original on-brand SVG illustration (clearly not a photo) |
| 4 | **Social profile URLs** (Facebook, Instagram, LinkedIn, TikTok) | Icons are in the footer; links activate only with real URLs | Set `CONFIG.social.{facebook,instagram,linkedin,tiktok}` — icons become live links |
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

## Static-hosting note
Deep-link refreshes work via `404.html` (`pathSegmentsToKeep=1` for the
`/Thevillagw/` project page). For strict per-URL HTTP status codes, front the
site with a server/CDN rewrite.
