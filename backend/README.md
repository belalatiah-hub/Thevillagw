# The Village Investment — CRM API

Enterprise Real Estate CRM backend. **NestJS + PostgreSQL (Prisma) + Redis**,
multi-tenant, JWT + refresh auth, configurable RBAC, and a public lead-capture
endpoint the marketing site posts to.

This is **Phase 1–5 (core)** of the platform roadmap — a real, compiling,
tested foundation, not a stub. See [`../docs/CRM_ARCHITECTURE.md`](../docs/CRM_ARCHITECTURE.md)
for the full architecture and the roadmap for the remaining phases (admin
dashboard, mobile apps, AI, integrations).

---

## Quick start

### Option A — Docker (one command)

```bash
cp .env.example .env          # adjust secrets for anything non-local
docker compose up --build     # Postgres + Redis + API; migrations auto-run
```

API: <http://localhost:3000/api> · Swagger: <http://localhost:3000/docs>

### Option B — Local Node

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy       # or: npm run prisma:migrate  (dev)
npm run prisma:seed             # demo tenant + admin + inventory
npm run start:dev
```

### Demo credentials (from the seed)

| Role                | Email                              | Password    |
| ------------------- | ---------------------------------- | ----------- |
| Super Admin         | `admin@thevillageinvestment.com`   | `Admin!2345` |
| Property Consultant | `sales@thevillageinvestment.com`   | `Sales!2345` |

---

## What's implemented

| Area | Details |
| ---- | ------- |
| **Auth** | Register (self-serve company provisioning), login, JWT access + rotating refresh tokens (argon2-hashed, stored & revocable), logout-everywhere. Google/Apple columns ready. |
| **RBAC** | `resource:action` permission keys, per-company roles, 14 seeded system roles with editable default permission sets, `*` super-admin wildcard. Enforced by a global `PermissionsGuard`. |
| **Multi-tenancy** | Every business row carries `companyId`; all queries are tenant-scoped. |
| **Leads** | Public capture (website + native site-payload endpoints), duplicate detection (normalised phone, 30-day window), transparent rules-based **lead scoring** + temperature, assignment, status workflow with activity logging, UTM attribution. |
| **Customers** | Full profile (nationality, budget range, documents, preferences), activity timeline. |
| **Property catalogue** | Developers → Projects → Units, with inventory search (status/type/beds/price), payment-plan fields, geo. |
| **Pipeline** | Custom pipelines + stages (probability), opportunities, drag-to-stage move, **weighted revenue forecast**. |
| **Users** | Team management, role assignment, soft-deactivate + session revocation, `/users/me`. |
| **Platform** | Global validation, unified error envelope, Prisma error mapping, rate limiting (Throttler), Helmet, CORS allowlist, health probe, Swagger, BigInt-safe money (minor units), audit log. |

## Money & precision

Prices/budgets are stored as **integer minor units** (`BigInt`, e.g. piastres)
to avoid floating-point drift, and serialised as strings in JSON to preserve
precision. Currency is explicit per row (EGP/USD/AED/SAR/EUR/GBP).

---

## Wiring the marketing website

The static site (`../index.html`) already has a `CONFIG.LEAD_ENDPOINT` hook and
posts `{name, phone, source, page, locale, ts, site}` as `text/plain` with
`mode: no-cors`. Point it at the CRM with **no front-end changes**:

```js
// in index.html CONFIG
LEAD_ENDPOINT: "https://api.thevillageinvestment.com/api/leads/site/the-village"
```

The `/api/leads/site/:companySlug` endpoint accepts that native payload
(text/plain or JSON), maps it into the capture pipeline (dedup + scoring), and
returns 2xx. For richer integrations (own attribution, project linkage), POST
JSON to `/api/leads/capture` instead. Protect either with the `LEAD_CAPTURE_KEY`
env + `x-capture-key` header in production.

---

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run start:dev` | Watch-mode dev server |
| `npm run build` | Compile to `dist/` |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests (needs a database) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:seed` | Seed the demo tenant |
| `npm run lint` | ESLint (with Prettier) |

## Project layout

```
src/
  common/        decorators, guards, filters, dto, rbac catalogue, utils
  config/        typed config + fail-fast env validation
  prisma/        PrismaService (global)
  modules/
    auth/        JWT strategy, register/login/refresh/logout
    users/       team + role assignment
    leads/       capture, dedup, scoring, assignment, timeline
    customers/   profiles + interactions
    developers/  developer catalogue
    projects/    projects under developers
    units/       inventory + search
    pipeline/    pipelines, stages, opportunities, forecast
    health/      liveness + DB probe
prisma/
  schema.prisma  the data model
  seed.ts        demo data
test/            e2e specs
```

## Security notes

- Secrets are validated at boot; production refuses to start with missing/weak
  JWT secrets or a missing `DATABASE_URL`.
- Passwords and refresh tokens are hashed with **argon2** — never stored in clear.
- Refresh tokens rotate on use; the presented token is revoked when a new pair
  is issued. Logout revokes all of a user's tokens.
- User responses use an explicit safe field selection — hashes are never returned.
- Rate limiting is global, with a tighter per-endpoint cap on public capture.
