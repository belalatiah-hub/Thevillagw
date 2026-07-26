# Village CRM — The Village Investment

An enterprise real-estate brokerage CRM: a role-aware web console, a mobile app,
and an API. This branch contains **the CRM system only** — the marketing website
lives on its own branch and is deployed separately.

```
web/          front end — desktop console + mobile app (static, Cloudflare Workers)
backend/      API — NestJS + Prisma + PostgreSQL (Docker-ready)
web/supabase/ SQL migrations for the Supabase deployment
dashboard/    stand-alone CRM HTML artifacts (login, console, demo, audit)
audit/        read-only crawler for auditing the live CRM
docs/         CRM architecture & roadmap
```

## Two ways to run the backend

The console talks to **either** backend — pick one:

| Option | What it is | Guide |
|---|---|---|
| **Supabase** (in use) | Postgres + Auth + REST + row-level security. No server to run. | [`web/SUPABASE.md`](web/SUPABASE.md) |
| **NestJS API** | The full `backend/` service, self-hosted on Railway / Render / Docker. | [`DEPLOYMENT.md`](DEPLOYMENT.md) |

## Front end

- **`web/public/index.html`** — the desktop console. A single self-contained file:
  dashboard, leads (cards / table / kanban), inventory, interactive map, calls,
  WhatsApp inbox, automation, lead distribution, efficiency, commission,
  users, roles & permissions, audit log, settings.
- **`web/public/app.html`** — the phone-sized app, same backend.

Both are bilingual (English / Arabic RTL) with light & dark themes, and run with
no build step — open the file, or deploy the folder. See [`web/README.md`](web/README.md).

## Permissions

Access is `resource:action` based, with a per-role data scope of **own / team /
all** — so the same screen shows an agent only their own records, a team leader
the whole team, and a manager everything. On Supabase this is enforced by
row-level security in the database, not just in the UI.

## Deploying

- **Front end** → Cloudflare Workers (`village-crm`). Pushing any change under
  `web/` runs `.github/workflows/deploy-crm.yml`, which validates the console
  and verifies the deploy is live. Setup: [`web/README.md`](web/README.md).
- **Backend** → Supabase (already provisioned) or your own host per
  [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Development

```bash
cd backend
npm install
npx prisma generate
npm run build && npm test        # unit tests
npm run test:e2e                 # end-to-end
```

`.github/workflows/backend-ci.yml` runs lint, build, unit and e2e tests against a
real PostgreSQL service on every change under `backend/`.
