# Village CRM — Going Live (Backend + Frontend)

This is the end-to-end guide to make the system live. Architecture:

```
[ Web console /  +  Mobile app /app ]   ->   [ Backend API (Node) ]   ->   [ PostgreSQL ]
        static files (Cloudflare)              NestJS + Prisma              (+ optional Redis)
```

You deploy **two things**:
1. **Backend API** — a Node server + PostgreSQL database (this guide).
2. **Frontend** — the static `web/public/` folder (see `web/README.md`), pointed at the API.

The backend is Node 22 + NestJS + Prisma + PostgreSQL 16 (Redis optional). A
production `Dockerfile` is included and already runs migrations on boot.

---

## 0. Prerequisites
- A GitHub account with this repo (you have it).
- One of: a **Railway** / **Render** / **Fly.io** account (managed, easiest), **or** a Linux VPS with Docker.
- Locally (optional, for testing): Node 22+, `npx`, and `openssl`.

Generate your JWT secrets now (run twice, keep both):
```bash
openssl rand -hex 48    # -> JWT_ACCESS_SECRET
openssl rand -hex 48    # -> JWT_REFRESH_SECRET
```

---

## Required environment variables
Set these on whichever host you pick (names come straight from `backend/.env.example`):

| Variable | Required | Value |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `DATABASE_URL` | yes | `postgresql://USER:PASS@HOST:5432/DB?schema=public` (from your DB provider) |
| `JWT_ACCESS_SECRET` | yes | the first `openssl rand -hex 48` (min 16 chars, or prod boot aborts) |
| `JWT_REFRESH_SECRET` | yes | the second `openssl rand -hex 48` |
| `CORS_ORIGINS` | yes | your frontend origin(s), comma-separated, e.g. `https://village-crm.<sub>.workers.dev` |
| `PORT` | usually auto | most hosts inject it; the app reads `PORT` (default 3000) |
| `API_PREFIX` | no | `api` (default) |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | no | `15m` / `30d` |
| `REDIS_URL` | no | `redis://…` if you add Redis (not required to boot) |
| `OPENAI_API_KEY` | no | leave empty → built-in offline AI; set to switch to OpenAI |
| `LEAD_CAPTURE_KEY` | no | shared secret for the public lead-capture endpoint |

---

## Option A — Railway (recommended, ~10 minutes)

1. **Create the database**
   - railway.app → **New Project** → **Provision PostgreSQL**.
   - Open the Postgres service → **Variables** → copy `DATABASE_URL`.

2. **Deploy the API**
   - In the same project → **New** → **GitHub Repo** → select this repo.
   - **Root directory:** `backend`.
   - Railway auto-detects Node and runs the build. If it asks for commands, use:
     - Build: `npm ci && npx prisma generate && npm run build`
     - Start: `npx prisma migrate deploy && node dist/main.js`
   - (Or set **Builder = Dockerfile**, path `backend/Dockerfile` — it already does migrate-deploy + boot.)

3. **Set variables** on the API service (Variables tab): paste `DATABASE_URL`
   (Railway can reference the DB service), `NODE_ENV=production`, both JWT
   secrets, and `CORS_ORIGINS` (your frontend URL — you can fill this after step
   6 and redeploy).

4. **First migration + seed** (one-time). Migrations run automatically on every
   deploy (`prisma migrate deploy`). To create the first company + admin, run the
   seed once from Railway's shell (service → **⋯** → **Shell**) or locally against
   the same `DATABASE_URL`:
   ```bash
   cd backend
   npx prisma migrate deploy      # if not already applied
   npm run prisma:seed            # creates the demo company + admin + lookups
   ```

5. **Get your API URL**: service → **Settings** → **Generate Domain** →
   e.g. `https://village-crm-api.up.railway.app`. Your API base is that URL + `/api`.

6. **Verify**: open `https://<api-url>/api/health` (should return OK) and
   `https://<api-url>/docs` (Swagger UI with every endpoint).

---

## Option B — Render

1. **New → PostgreSQL** → create; copy the **Internal Database URL**.
2. **New → Web Service** → connect the repo → **Root Directory** `backend`.
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/main.js`
3. **Environment** → add the variables from the table above (`DATABASE_URL`,
   `NODE_ENV=production`, JWT secrets, `CORS_ORIGINS`).
4. First deploy runs the migrations. Seed once from the Render **Shell**:
   `cd backend && npm run prisma:seed`.
5. API base = the Render URL + `/api`. Check `/api/health` and `/docs`.

---

## Option C — Docker on your own VPS

```bash
# on the server, with Docker + a PostgreSQL reachable at DATABASE_URL
git clone <your-repo> && cd Thevillagw/backend

docker build -t village-crm-api .

docker run -d --name village-crm-api -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://USER:PASS@DB_HOST:5432/village_crm?schema=public" \
  -e JWT_ACCESS_SECRET="$(openssl rand -hex 48)" \
  -e JWT_REFRESH_SECRET="$(openssl rand -hex 48)" \
  -e CORS_ORIGINS="https://your-frontend-domain" \
  village-crm-api
# The container runs `prisma migrate deploy` then boots automatically.

# Seed once:
docker exec -it village-crm-api npm run prisma:seed
```
Put Nginx/Caddy in front for HTTPS (or use Fly.io / a managed load balancer).

> A `docker-compose.yml` (API + Postgres + Redis) is also in `backend/` for a
> one-command local or single-box stack: `docker compose up -d`.

---

## 6. Connect the frontend to the live API
In **both** `web/public/index.html` and `web/public/app.html`, set the constant
near the top:
```js
var API_BASE = "https://<your-api-url>/api";   // was "" (demo mode)
```
Then deploy the static folder (see `web/README.md` — one Cloudflare deploy serves
the console at `/` and the mobile app at `/app`). Finally, make sure your
frontend's URL is listed in the API's `CORS_ORIGINS`, then redeploy the API.

---

## 7. First login & security hardening (do this immediately)
- Log in with the seeded admin: **`admin@thevillageinvestment.com` / `Admin!2345`**.
- **Change that password immediately** and enable 2FA (Users → your profile).
- Create your real roles/users under **Users** and **Roles & Permissions**.
- Rotate the admin password; never keep the seed default in production.
- Keep JWT secrets private (host env vars only — never commit them).

---

## 8. Day-2 operations
- **Migrations**: every deploy runs `prisma migrate deploy` automatically. To add
  a schema change: edit `prisma/schema.prisma`, run `npx prisma migrate dev
  --name <change>` locally, commit the generated migration, and deploy.
- **Backups**: enable automated backups on your Postgres provider.
- **Logs/health**: `/api/health` for uptime checks; host dashboard for logs.
- **Scaling**: the API is stateless — add instances behind the host's load
  balancer. Add `REDIS_URL` when you want a shared rate-limit/queue store.
- **API docs**: `/docs` (Swagger) lists every endpoint and lets you try them.

---

## Quick checklist
- [ ] PostgreSQL provisioned, `DATABASE_URL` copied
- [ ] JWT secrets generated (2×), set as env vars
- [ ] API deployed (`backend/`), `NODE_ENV=production`
- [ ] Migrations applied + seed run once
- [ ] `/api/health` returns OK, `/docs` loads
- [ ] `API_BASE` set in the two frontend files, static deploy done
- [ ] Frontend origin added to `CORS_ORIGINS`
- [ ] Admin password rotated + 2FA on
