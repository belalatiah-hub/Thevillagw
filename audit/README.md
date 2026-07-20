# Live CRM Audit — access requirements &amp; runbook

This folder contains a **read-only** crawler (`crawl.mjs`) that performs the real,
screen-by-screen audit of the live CRM. It is ready to run the moment network
access to the CRM is available.

---

## Why it can't run yet — and exactly what to allowlist

The Claude Code environment reaches the internet only through an **organization
egress proxy with an allowlist**. Your CRM host is currently **denied** (`403`):

```
CONNECT crm.thevillageinvestment.com:443  →  403 Forbidden (policy denial)
```

The host resolves fine (`162.241.225.147`) — it is purely a network-policy block,
not a DNS or server problem. To enable the audit, **allowlist the following** in
your Claude Code on the web environment's network policy
(see https://code.claude.com/docs/en/claude-code-on-the-web → network access):

| What | Value |
| ---- | ----- |
| Primary host | `crm.thevillageinvestment.com` |
| Ports | `443` (HTTPS) and `80` (HTTP→HTTPS redirect) |
| Resolved IP (if IP-based rules) | `162.241.225.147` |
| Root domain (optional, covers assets) | `thevillageinvestment.com` and `*.thevillageinvestment.com` |
| Any third-party asset/CDN hosts the app loads | add if the app pulls JS/CSS/fonts/maps from other domains |

**Who can do this:** the environment owner / workspace admin, in the environment's
network settings (or by choosing a network policy that permits custom egress).
If your org enforces a locked-down policy, an admin may need to grant it — the
Claude admin settings can also manage access.

### If you cannot open the network policy
Any one of these lets the audit proceed without allowlisting:
1. **Run the crawler yourself** on a machine that can reach the CRM:
   `npm i -D playwright && npx playwright install chromium` then run the command
   below (drop `HTTPS_PROXY`). Send me the generated `audit/out/` folder.
2. **Send screen exports**: a screen recording or screenshots of every module
   (Dashboard, Leads, Lead detail, Inventory, Map, Efficiency, Commission,
   Reports, HR, Marketing, Settings/Permissions, plus every sub-tab and form).
3. **Provide a read-only DB user or a schema dump** (`mysqldump --no-data`) — see
   "Why extra access helps" below.

---

## What the crawler captures (read-only)

For every reachable screen: a full-page **screenshot**, and a structured record
of the **DOM** (headings, nav items, forms + their fields, tables + headers/row
counts, buttons), the **network requests** the screen makes, and basic timing —
written to `audit/out/system-map.json`.

### Read-only guarantees (three independent safeguards)
1. It only ever submits the **login** form; no other form is filled.
2. It only clicks elements that look like **navigation**; it refuses to click
   anything whose text matches `create|add|save|update|delete|submit|send|pay|
   approve|export|…` (the `DESTRUCTIVE` regex).
3. A network gate **aborts every non-GET/HEAD request**, so even an accidental
   click cannot write data.

No credentials are written to disk or logs — they are read from `CRM_USER` /
`CRM_PASS` at runtime only.

## Run

```bash
CRM_URL="https://crm.thevillageinvestment.com/login.php" \
CRM_USER="…"  CRM_PASS="…" \
node audit/crawl.mjs
# → audit/out/*.png  +  audit/out/system-map.json
```

(Inside this Claude environment the crawler auto-routes through `HTTPS_PROXY`, so
allowlisting the host is the only change needed. Running elsewhere, unset it.)

---

## Why extra (read-only) access improves the audit — and only if you want it

The UI crawl gives an accurate **workflow + screen** map. Two optional, still
read-only, additions make the deliverable materially stronger:

- **Read-only DB user or `mysqldump --no-data` (schema only):** the crawler can
  *infer* relationships from screens, but a real **ERD** and index/constraint
  review needs the actual schema. Requested only because "database relationships"
  is an explicit audit goal; grant it only if you're comfortable.
- **A test login per role** (Agent, Team Leader, Manager, Finance, HR, Marketing,
  CEO): lets me verify **permissions are enforced server-side**, not just hidden
  in the UI — the single most important RBAC finding. Without it I can only audit
  the admin view.

I will not request or use anything beyond what you grant, and nothing that writes
data. Tell me when the allowlist is in place (or send the exports) and I'll run
the full crawl and produce the confirmed system map, workflow diagrams, ERD, and
prioritized roadmap — every finding tied to an actual observed screen.
