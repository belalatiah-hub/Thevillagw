# Real Estate CRM — Architecture & Roadmap

This document accompanies the CRM backend in [`../backend`](../backend) and sets
the technical direction for the full platform described in the master brief
(Salesforce/HubSpot/Follow-Up-Boss-class Real Estate CRM).

> **Scope honesty.** The master brief describes a multi-quarter programme for a
> full engineering team — four client platforms, ~40 modules, and dozens of
> third-party integrations. What ships in this repository today is a **real,
> working, tested backend foundation** (Phases 1–5 core). It compiles, runs,
> migrates, seeds, and is verified end-to-end. The rest of the programme is
> laid out below as a roadmap, deliberately built on this one backend so every
> later surface (dashboard, mobile, AI) reuses the same API, data model, and
> auth. No stub files, no fake "done" — each phase lands as working software.

---

## 1. System shape

```
                         ┌──────────────────────────┐
  Marketing site  ─POST─▶│  Public capture endpoints │
  (index.html)           │  /api/leads/site/:slug    │
                         └───────────┬──────────────┘
                                     │
   Admin dashboard  ─────REST/JWT────┤
   (web, Phase 7)                    │        ┌────────────┐
                                     ▼        │ PostgreSQL │
   Mobile apps      ─────REST/JWT───▶ NestJS ─┤  (Prisma)  │
   (iOS/Android,                     API      └────────────┘
    Phase 6)                         │        ┌────────────┐
                                     ├────────┤   Redis    │ cache · throttle
                                     │        └────────────┘  · queues (later)
                                     │
                          Integrations (Phase 8+):
                          OpenAI · FCM · WhatsApp · Maps · Storage
```

**One backend, one database, one API, one auth system** — exactly as the brief
requires. Clients are thin; all business logic and authorization live in the API.

## 2. Design principles

- **Clean, layered modules.** Each domain is a Nest module (controller → service
  → Prisma). Controllers are thin; services hold logic; the schema is the single
  source of truth. Cross-cutting concerns (auth, RBAC, errors, throttling) are
  global providers, not copy-paste.
- **Multi-tenant from row zero.** Every business entity carries `companyId`.
  Services scope every read/write to the caller's tenant. This is cheaper and
  safer to enforce now than to retrofit.
- **Configurable RBAC.** Permissions are `resource:action` strings; roles are
  editable bags of those strings. New modules add keys without a migration. The
  brief's "every permission must be configurable" is satisfied by construction.
- **Money is integer minor units.** No floats for currency, ever. Explicit
  per-row currency for multi-currency support (EGP/USD/AED/SAR/EUR/GBP).
- **Explainable before clever.** Lead scoring is transparent and rules-based
  today, behind a service interface the Phase-8 AI model can slot into without
  touching callers.
- **Fail fast, fail loud.** Env is validated at boot; production won't start
  with weak secrets. Errors return one consistent JSON envelope.

## 3. Data model (Phase 2 — shipped)

Tenancy: `Company → Branch → User → Role/UserRole (RBAC)`.
Catalogue: `Developer → Project → Unit`.
People & deals: `Lead`, `Customer`, `Pipeline → PipelineStage → Opportunity`.
Cross-cutting: `Activity` (calls/meetings/notes/tasks/status timeline),
`RefreshToken`, `AuditLog`.

See [`../backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) — fully
commented, with enums for statuses, sources, unit/project types, and currency.

## 4. Delivered vs. roadmap

| Phase | Brief | Status |
| ----- | ----- | ------ |
| 1 | Architecture | ✅ This document + module structure |
| 2 | Database | ✅ Prisma schema, migration, seed |
| 3 | Backend | ✅ Core CRM modules, REST, Swagger |
| 4 | Authentication | ✅ JWT + refresh + RBAC + multi-tenant (Google/Apple columns ready) |
| 5 | CRM Modules | 🟡 Core shipped: Leads, Customers, Developers, Projects, Units, Pipeline, Users, Activities, Audit. Remaining: Tasks/Calendar UI, Contracts, Reservations, Installments, Payments, Commission, HR/Attendance, Marketing campaigns |
| 6 | Mobile app | ⬜ Flutter (recommended) — thin client on this API |
| 7 | Dashboard | ⬜ Web admin (React/Vite) — thin client on this API |
| 8 | AI | ⬜ OpenAI behind service interfaces (scoring, summaries, next-action, matching) |
| 9 | Testing | 🟡 Unit + e2e smoke in place; expand to full module coverage |
| 10 | Deployment | 🟡 Dockerfile + compose + CI build; add managed Postgres/Redis, secrets, HTTPS termination |

Legend: ✅ done · 🟡 partial · ⬜ not started

## 5. Recommended next steps (in order)

1. **Admin dashboard (Phase 7).** Highest leverage: makes the API usable by the
   sales team. React + Vite + a component kit, talking to this API. Screens:
   auth, leads inbox (score-sorted), lead detail + timeline, pipeline board
   (drag-drop uses `/opportunities/:id/move`), inventory, dashboard KPIs.
2. **Finance & contracts (finish Phase 5).** Reservations → contracts →
   installments → payments → commission. New Nest modules + schema tables; the
   pipeline "Won" transition seeds a reservation.
3. **Realtime + notifications.** Socket.io gateway for live pipeline/lead
   updates; FCM for push. Redis is already provisioned for pub/sub and queues.
4. **AI layer (Phase 8).** Swap the rules-based `LeadScoringService` for an
   OpenAI-backed implementation behind the same interface; add lead/call summary
   and next-action services. Governance: prompt/response logging, PII controls.
5. **Mobile (Phase 6).** Flutter app reusing the same endpoints; offline cache
   with background sync.

## 6. Operational notes

- **Migrations** run automatically on container boot (`prisma migrate deploy`).
- **Health**: `GET /api/health` reports liveness + DB connectivity — wire it to
  your load balancer / uptime monitor.
- **Secrets**: generate with `openssl rand -hex 48`; never commit `.env`.
- **CORS**: set `CORS_ORIGINS` to the marketing site + dashboard origins only.
- **Backups/DR**: use managed Postgres with PITR in production; the schema and
  seed are reproducible from source.
