# Village CRM — Web Console

A single-file, enterprise real-estate CRM console for **The Village Investment**.
Sidebar shell (Dashboard, Leads, Pipeline, Inventory, Automation, Integrations,
Notifications, Users, Roles & Permissions, Audit Log, Reports, Settings),
role-aware navigation, bilingual (English / Arabic RTL), light & dark themes.

- **`public/index.html`** — the desktop console (HTML + CSS + JS, no build step).
- **`public/app.html`** — the mobile app (same backend, phone-sized UI).
- **`worker.js`** — the Worker script (clean `/app` route + security headers).
  Its deploy config is the **root** `../wrangler.toml`, not one in this folder.

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

## Deploying

Cloudflare deploys this automatically. Its Git integration runs
`npx wrangler deploy` **from the repository root**, so the config it reads is the
root [`../wrangler.toml`](../wrangler.toml) — Worker **`black-shape-dfbe`**:

```toml
name = 'black-shape-dfbe'
main = "web/worker.js"
[assets]
directory = "./web/public"      # console at "/", mobile app at "/app"
```

> There is deliberately **no `wrangler.toml` inside `web/`**. A second config
> here would declare a different Worker name, so `cd web && npx wrangler deploy`
> would publish a stray duplicate Worker instead of updating the real one.
> The root config is the single source of truth — keep it at the root, or
> Cloudflare's build fails with *"Could not detect a directory containing static
> files"*.

`.github/workflows/deploy-crm.yml` runs on every push under `web/`: it parses the
inline JavaScript of `index.html` and `app.html` so a syntax error can never ship
a blank console, and checks the root config still points at files that exist. It
does **not** deploy on push — Cloudflare already does that, and racing it would
publish the same Worker twice.

### Deploying by hand

```bash
# from the repository ROOT, not from web/
npx wrangler login          # one-time auth
npx wrangler deploy         # publishes Worker "black-shape-dfbe"
npx wrangler deploy --dry-run   # validate without publishing
```

You can also trigger a deploy from the **Actions** tab → *CRM console — validate
& deploy* → **Run workflow** → tick **deploy**. That path needs a
`CLOUDFLARE_API_TOKEN` repository secret (create it at
<https://dash.cloudflare.com/profile/api-tokens> with the "Edit Cloudflare
Workers" template), plus `CLOUDFLARE_ACCOUNT_ID` if the token can reach more
than one account.

### Custom domain
To serve on `crm.thevillageinvestment.com` (the zone must be on Cloudflare), add
a `routes` block to the root `wrangler.toml` and redeploy.

---

## Alternative: Cloudflare Pages (no Worker)

```bash
# from the repository root
npx wrangler pages deploy web/public --project-name village-crm
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
