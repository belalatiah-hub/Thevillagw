# The Village CRM — Console (demo)

`crm-demo.html` is a self-contained, browsable demo of the CRM admin console —
the Phase-7 dashboard. It runs entirely in the browser with embedded demo data
that mirrors the seeded backend (`../backend`), so it needs no server to explore.

## What it shows

- **Login** → executive **dashboard** (KPI tiles + SVG charts: leads by source,
  pipeline funnel, temperature donut)
- **Leads** inbox — score-sorted, filterable by temperature, click a row for the
  detail drawer with activity timeline + AI-style next action
- **Pipeline** — kanban board with **drag-and-drop** between stages + weighted
  forecast
- **Inventory** — unit cards with status (available / reserved / sold)
- **Customers**, **Developers**, **Team & Roles** (RBAC permission matrix), **Settings**
- **Bilingual** Arabic / English with full **RTL**, and **dark / light** themes

## Relationship to the real app

This is a faithful UI prototype. In production the same screens call the live
API instead of embedded data:

| Screen | Backend endpoint |
| ------ | ---------------- |
| Dashboard | `GET /api/reports/dashboard` |
| Leads | `GET /api/leads`, `PATCH /api/leads/:id`, `PATCH /api/leads/:id/assign` |
| Lead AI panel | `POST /api/ai/leads/:id/summary` |
| Pipeline board | `GET /api/pipelines/:id`, `PATCH /api/opportunities/:id/move` |
| Forecast | `GET /api/pipelines/:id/forecast` |
| Inventory | `GET /api/units` |
| Finance | `POST /api/finance/contracts`, `.../payments`, `.../commissions` |
| Realtime updates | Socket.io `/realtime` (`lead.captured`, `opportunity.moved`) |

The productionisation step is to replace the in-memory `state`/data arrays with
`fetch` calls to the API and subscribe to the realtime gateway — the layout,
i18n, theming, and interactions carry over unchanged.

## Run locally

Open `crm-demo.html` in any browser. No build step, no network calls.
