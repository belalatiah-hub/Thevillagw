# Launch blockers — owner input required before public production

This build is deliberately honest: it ships nothing as a *verified commercial
fact*. The items below are recorded per the V2.1 contract and must be supplied
and approved by the brand owner before a public launch.

| # | Blocker | Why it blocks launch | What the site does today |
|---|---------|----------------------|--------------------------|
| 1 | **Verified contact channels** (phone, WhatsApp, email, address, hours) | Publishing placeholder contacts is forbidden; buyers must reach a real destination | Phone/WhatsApp/email CTAs are hidden; contact page shows an honest "pending verification" notice. Set `CONFIG.phone/whatsapp/email` to reveal them |
| 2 | **Live, source-backed inventory** (projects, prices, payment plans, delivery, availability) | Prices/plans change constantly and must be confirmed with the developer | All figures are labelled *illustrative — confirm with an advisor*; counts are derived from on-page data, never claimed as "all inventory" |
| 3 | **CRM / lead endpoint** | A lead must be durably accepted before showing success | Form validates then shows an honest "not connected" notice + copyable details. Set `CONFIG.LEAD_ENDPOINT` to deliver leads |
| 4 | **Brand approval** | Final logo/color/type sign-off is the owner's decision | Identity derived from the master logo (teal/bone). Recorded as provisional in the footer |
| 5 | **Legal review** (privacy, terms, disclaimers, any ownership/tax/residency guidance) | Regulated content needs a named reviewer | Privacy/Terms are clearly marked "pending legal review"; no investment-return or guarantee claims are made |
| 6 | **Verified corporate identity** (legal entity, registration, brokerage authorization) | Required for trust + structured data | Organization schema omits unverified NAP; no fabricated identity claims |
| 7 | **Developer relationships** (any "official/authorized partner" claim) | Must be documented and approved | The site states developer names as public facts only; it claims no partnership |
| 8 | **Real photography / renders / plans with usage rights** | Republishing protected media without rights is forbidden | Uses original brand-tinted monogram tiles instead of unlicensed imagery |
| 9 | **Production HTTP headers** (HSTS, X-Frame-Options/frame-ancestors, etc.) | Some directives only work as response headers, not meta | Documented in the deploy runbook section of README; app-level CSP is in `<meta>` |

## Static-hosting limitation (documented, not hidden)
On static hosts (GitHub Pages/Netlify/Vercel) a genuinely unknown deep path
cannot return a *true* HTTP 404 for every case; the app renders a real, branded,
`noindex` 404 view and the sitemap lists only valid canonical URLs. For strict
HTTP-status control, front the site with a server/CDN rewrite (see README).
