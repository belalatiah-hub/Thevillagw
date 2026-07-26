# Village CRM — Web Console

A single-file, enterprise real-estate CRM console for **The Village Investment**.
Sidebar shell (Dashboard, Leads, Pipeline, Inventory, Automation, Integrations,
Notifications, Users, Roles & Permissions, Audit Log, Reports, Settings),
role-aware navigation, bilingual (English / Arabic RTL), light & dark themes.

- **`public/index.html`** — the desktop console (HTML + CSS + JS, no build step).
- **`public/app.html`** — the mobile app (same backend, phone-sized UI).
- **`wrangler.toml` / `worker.js`** — Cloudflare Workers deployment.

## One deployment serves both frontends

The desktop console and the mobile app are both static files that talk to the
**same backend API**. A single `wrangler deploy` publishes both:

| URL | Serves |
|-----|--------|
| `https://<your-worker>/` | Desktop web console (`index.html`) |
| `https://<your-worker>/app` | Mobile app (`app.html`) |

You do **not** need a separate deployment or a separate link per frontend — one
static deployment hosts both, and both point at the one backend `API_BASE`.

> Architecture: **two deployments total** — (1) this static frontend bundle
> [console + mobile], and (2) the backend API (`../backend`, a Node server +
> PostgreSQL — host it on Railway / Render / Fly / a VPS, not Cloudflare static).
> Set `API_BASE` in **both** `index.html` and `app.html` to that one API URL.

---

## Two run modes

The console reads one constant near the top of `public/index.html`:

```js
var API_BASE = ""; // ← empty = DEMO, or "https://<your-api-host>/api" = LIVE
```

| Mode | When | Behaviour |
|------|------|-----------|
| **Demo** | `API_BASE = ""` | Fully explorable with realistic sample data. No backend needed — great for reviews and screenshots. |
| **Live** | `API_BASE = "https://api.yourdomain.com/api"` | Login calls `POST {API_BASE}/auth/login`, then loads the signed-in user from `/users/me`; navigation is filtered by that user's real permissions. |

> The backend (NestJS) lives in `../backend`. Point `API_BASE` at its public URL
> (including the `/api` prefix). Make sure the backend's CORS allows this origin.

---

## Deploy automatically from GitHub (recommended)

`.github/workflows/deploy-crm.yml` publishes this folder to the **`village-crm`**
Worker on every push that touches `web/**`. It is separate from the marketing
site, which is a different Worker built from the repo root — this never touches it.

**One-time setup (2 minutes):**

1. Create an API token at <https://dash.cloudflare.com/profile/api-tokens> →
   **Create Token** → use the **"Edit Cloudflare Workers"** template.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN` — Value: the token you just created.
   - Optional: `CLOUDFLARE_ACCOUNT_ID`, needed only if the token can reach more
     than one Cloudflare account.
3. Push any change under `web/` (or re-run the job from the **Actions** tab).

The workflow refuses to ship a broken console: it parses the inline JavaScript of
`index.html` and `app.html` first, and after deploying it fetches the live URL and
fails unless it returns HTTP 200 and identifies as Village CRM. The resulting URLs
are printed in the run summary.

> `workflow_dispatch` (the manual "Run workflow" button) only appears once this
> file exists on the repository's **default branch**. Until then, the push trigger
> is what runs it.

## Deploy manually from your machine

Prerequisites: a Cloudflare account and the Wrangler CLI.

```bash
cd web
npm install                 # installs wrangler locally
npx wrangler login          # one-time auth
npx wrangler deploy         # publishes to https://village-crm.<your-subdomain>.workers.dev
```

`wrangler.toml` serves everything in `public/` as static assets, with SPA
fallback and security headers from `worker.js`.

### Custom domain
To serve on `crm.thevillageinvestment.com` (zone must be on Cloudflare), uncomment
the `routes` block in `wrangler.toml` and re-deploy.

### Deploy alongside your existing Worker (`village.belalatiah.workers.dev`)
Either:
- give this its own Worker (`village-crm.<subdomain>.workers.dev`) — simplest; or
- mount it under a path of your existing site by adding a route such as
  `village.belalatiah.workers.dev/crm*` and stripping the `/crm` prefix in your
  main Worker before delegating to this one.

---

## Alternative: Cloudflare Pages (no Worker)

```bash
cd web
npx wrangler pages deploy public --project-name village-crm
```

Pages serves `public/` directly and gives you a `*.pages.dev` URL.

---

## Local preview

```bash
cd web
npm run preview          # serves ./public at http://localhost:3000
# or simply open public/index.html in a browser
```

---

## Going live checklist

1. Deploy the backend (`../backend`) and note its public URL.
2. Set `API_BASE` in `public/index.html` to `https://<backend-host>/api`.
3. Add the console's origin to the backend CORS allow-list.
4. `npx wrangler deploy`.
5. Sign in with a real account — navigation and data now reflect that user's role.
