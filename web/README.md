# Village CRM — Web Console

A single-file, enterprise real-estate CRM console for **The Village Investment**.
Sidebar shell (Dashboard, Leads, Pipeline, Inventory, Automation, Integrations,
Notifications, Users, Roles & Permissions, Audit Log, Reports, Settings),
role-aware navigation, bilingual (English / Arabic RTL), light & dark themes.

- **`public/index.html`** — the entire console (HTML + CSS + JS, no build step).
- **`wrangler.toml` / `worker.js`** — Cloudflare Workers deployment.

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

## Deploy to Cloudflare Workers

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
