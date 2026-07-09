THE VILLAGE INVESTMENT — deployable website
===========================================
This is a self-contained static site. Everything (HTML, CSS, JavaScript,
bilingual EN/AR content, the 40-developer directory, location pages,
project & unit pages, blog, and legal pages) lives in one file: index.html
No build step, no server, no database, no environment variables required.
The only external requests are Google Fonts (loaded over HTTPS from a CDN).

FILES
  index.html   → the entire website
  404.html     → a copy of index.html (so any deep path loads the app)
  .nojekyll    → tells GitHub Pages to serve files unmodified

------------------------------------------------------------------
UPLOAD / DEPLOY — pick ONE
------------------------------------------------------------------
A) Netlify (fastest, no account setup needed for a test URL)
   1. Go to  https://app.netlify.com/drop
   2. Drag this whole folder onto the page.
   3. You get a live https URL immediately. Done.

B) Vercel
   1. Go to  https://vercel.com/new
   2. Import this folder (or a GitHub repo containing it).
   3. Framework preset: "Other". Output dir: the folder root. Deploy.

C) GitHub Pages
   1. Create a repo and upload these files to the root.
   2. Settings → Pages → Source: "Deploy from a branch" → main → /(root).
   3. Your site publishes at  https://<user>.github.io/<repo>/

D) Lovable ( https://lovable.dev )
   Lovable is designed to generate/edit React (Vite) apps from prompts, so it
   does not "import" a finished single-file site as its own React code.
   Two ways to use it:
   • Host as-is: create a Lovable project, connect GitHub, and place index.html
     in the repo (root or /public). Lovable's hosting will then serve it.
   • Rebuild as React: if you want Lovable to own this as editable React
     components, it needs to be ported to a React/Next project (same design and
     data, real per-URL routes). Ask your developer (or me) to scaffold that.

NOTE: I can't deploy this or push to your Lovable/hosting account for you —
this folder IS the deploy artifact. Upload it using any option above.

TO GO FULLY PRODUCTION LATER
  • Real developer logo files + professional project/unit photography
    (the current visuals are generated brand art + monogram tiles).
  • Server-rendered per-URL pages, image optimization/lazy-loading, caching
    and Core Web Vitals tuning — i.e. a Next.js build with the same design.
