THE VILLAGE INVESTMENT — bilingual (EN/AR) primary-sale property website
========================================================================
A self-contained, production-grade static web application. One app file,
real client-side routing, English + Arabic with full RTL, working search /
filter / compare, and an honest lead form. No build step, no server, no
database required. The only external request is Google Fonts over HTTPS.

FILES
  index.html    → the entire application (HTML + CSS + JS + data + bilingual)
  404.html      → deep-link handler for static hosting; renders a real 404 view
  robots.txt    → crawl rules + sitemap pointer
  sitemap.xml   → canonical EN/AR URLs with hreflang
  .nojekyll     → tells GitHub Pages to serve files unmodified
  docs/         → implementation notes + launch-blocker register

WHAT CHANGED vs the earlier preview
  • Brand rebuilt on the real master logo (teal #073D52 / #115F7D + warm bone
    #F3EFE6). The old royal-blue / yellow / olive residue is gone.
  • Real routes: /en/… and /ar/… with working Back/Forward, deep links and a
    genuine 404 view (no more hash-only navigation, no more index==404 clone).
  • Security: no inline event handlers, no innerHTML sinks for dynamic content,
    a Content-Security-Policy, no eval.
  • Honesty: every price / payment plan / delivery figure is illustrative and
    labelled as such; phone & WhatsApp are hidden until verified; the lead form
    never shows a fake "success" — it tells the truth until a CRM is connected.
  • Accessibility & responsive: semantic landmarks, skip link, focus handling,
    keyboard support, AA contrast, RTL parity, no horizontal overflow 320–1440.

------------------------------------------------------------------
DEPLOY — pick ONE (this folder IS the deploy artifact)
------------------------------------------------------------------
A) Netlify:  drag this folder onto https://app.netlify.com/drop
B) Vercel:   import the folder at https://vercel.com/new (preset "Other")
C) GitHub Pages: push to a repo → Settings → Pages → deploy from branch → /(root)

OPENING / HOSTING
  • Double-click index.html to preview locally — it auto-detects that it is
    running from a file:// path and uses hash routing so it just works.
  • Served over http(s) it uses clean History-API routes (/en/… /ar/…).
  • index.html auto-detects its base URL, so it works at a domain root OR in a
    sub-directory with no edits.
  • DEEP LINKS ON A PROJECT SUBPATH (e.g. user.github.io/thevillagw/): only
    404.html needs a one-line tweak — set `var seg = 0;` to `1` so it rebuilds
    deep links correctly. At a custom domain root, leave it at 0.

------------------------------------------------------------------
GO-LIVE CONFIG (edit the CONFIG object near the top of index.html's script)
------------------------------------------------------------------
  phone / whatsapp / email  → add ONLY verified business values; the matching
                              CTAs appear automatically. Empty = hidden.
  LEAD_ENDPOINT             → your CRM / form endpoint (POST JSON). Empty = the
                              form validates then shows an honest "not connected"
                              notice instead of a fake success.
  origin                    → your production origin, used for canonical/OG/sitemap.

See docs/LAUNCH_BLOCKERS.md for everything that still needs owner sign-off
(verified contacts, live inventory/prices, brand approval, legal review, CRM).
Nothing on the site is presented as a verified commercial fact until you supply
and confirm it — by design.
