# The dashboard, and what protects it

The editorial dashboard at `/admin/` writes to Postgres; the public site is a
static file rebuilt from that database. This is the security review of both
halves, the evidence behind it, and the runbook for using it.

Everything below was tested. Where something could not be tested from the build
environment, it says so and says why.

---

## 1. What an attacker can reach

Tested by impersonating each role inside Postgres and recording what came back.
The results are the outcomes of real statements, not a reading of the policies.

### An anonymous visitor — the publishable key and nothing else

| Attempt | Result |
|---|---|
| `select` from `cms.units` | **blocked** — permission denied for schema cms |
| `select` from `cms.admins` | **blocked** — permission denied for schema cms |
| `select` from `cms.admin_invites` | **blocked** — permission denied for schema cms |
| `update cms.units` | **blocked** — permission denied for schema cms |
| `insert into cms.admins` (grant self owner) | **blocked** — permission denied for schema cms |

The block is at the schema level, which is a stronger stop than row-level
security: an anonymous caller is refused before any policy is consulted.

This is why the publishable key sitting in `admin/index.html` is not a leak. It
identifies the project, it is designed to ship in a browser, and by itself it
opens nothing. The public site does not carry it at all (`0` occurrences).

### A signed-in stranger — a real Supabase account that is not an admin

| Attempt | Result |
|---|---|
| `select` from `cms.units` | 0 rows |
| `select` from `cms.admins` | 0 rows |
| `select` from `cms.audit_log` | 0 rows |
| `update cms.units` | **0 rows changed** |
| `update cms.developers` | **0 rows changed** |
| `delete from cms.projects` | **0 rows deleted** |
| `delete from cms.audit_log` | **0 rows deleted** |
| `insert into cms.admins` (grant self owner) | **refused** — violates row-level security |
| `insert into cms.admin_invites` | **refused** — violates row-level security |

A note on reading this table, because the first run of it nearly produced a
false alarm. A statement that matches no rows **succeeds** — it changes nothing
and raises nothing. Recording "succeeded" for the update and the delete would
have reported a breach that is not there. The number of rows affected is the
answer, and it is zero.

### Signing up is not becoming an admin

Anyone can create a Supabase account. `cms.admins` is a separate table and the
only ways in are an invite the owner created, or an owner inserting the row
directly — both gated by `cms.is_owner()`. A new account that was never invited
is the "signed-in stranger" above: it can see nothing and change nothing.

---

## 2. The permission model

Three predicates, each keyed to `auth.uid()` and each requiring the admin row to
be active:

| Predicate | True for |
|---|---|
| `cms.is_active_admin()` | any active admin — owner, editor or viewer |
| `cms.can_write()` | active owner or editor |
| `cms.is_owner()` | active owner |

Which gives: **viewers read, editors write content, only the owner touches who
else has access.** Every policy on all fifteen tables is built from these three.

Two properties worth naming:

**The audit log is append-only.** `cms.audit_log` has an INSERT policy and a
SELECT policy and no others. With row-level security on, a command with no
policy is denied to everyone — so no admin, the owner included, can edit or
delete an audit entry through the API. The stranger's `delete` returning 0 rows
above is that rule doing its job.

**An owner cannot lock everyone out.** The delete policy on `cms.admins` is
`cms.is_owner() AND id <> auth.uid()`: the owner may remove any other admin and
may not remove themselves.

All nine functions in the `cms` schema pin `search_path` to `cms, public,
pg_temp`. This is the specific thing that stops the classic `SECURITY DEFINER`
attack, where a caller puts a malicious `units` table earlier on the search path
and the elevated function operates on it instead. `apply_price_import` — the
only one that writes — grants `EXECUTE` to `authenticated` and `postgres` only,
never to `anon`, and checks `can_write()` internally regardless.

---

## 3. The two business rules the owner set, enforced by the database

Both are constraints in Postgres, not conventions in JavaScript, so they hold
even if someone bypasses the dashboard and calls the API directly.

**Excel never creates a unit.** A trigger, `units_no_insert_during_import`,
rejects any insert into `cms.units` while an import is running. The importer can
only update rows that already exist.

**No import applies without a preview.** A batch is staged into `import_rows`,
each row carrying both the old and the new value for every field it would
change, and nothing reaches `cms.units` until `apply_price_import(batch)` is
called — which is what the Confirm button does. Every changed field writes its
own audit row.

Creating a unit is the dashboard's job alone.

---

## 4. The browser side

**No credentials in the source.** The shipped bundles were scanned for service
keys, JWTs and password literals. The only key present anywhere is the
publishable one, in the dashboard only.

**Nothing parses markup.** Both apps build every node through `h()`, which sets
text with `textContent`. A developer name or a unit label out of the database
cannot become script because there is no code path that would execute it.

Until this review that held because everyone kept to it. `build_admin.py` had
refused to ship `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
`document.write`, `eval(` or `new Function(` since it was written;
`tools/build.py` did not, so the public side rested on discipline alone. It now
runs the same check, on comment-stripped code so that
`tpl_script1.html`'s own "No innerHTML for dynamic content" header is not
mistaken for a violation. Verified by introducing a sink deliberately: the build
aborts.

**Content Security Policy**, computed at build time and pinned to the exact
script bytes:

- Site: `default-src 'self'`, `script-src 'self'` + 5 sha256 hashes + the
  Cloudflare analytics host, `base-uri 'self'`, `form-action 'self'`. There is
  no `'unsafe-inline'` in `script-src`.
- Dashboard: `default-src 'self'`, `script-src 'self'` + 10 sha256 hashes and
  nothing else, `connect-src 'self' https://xvcrgoeavdwykqflhuiw.supabase.co` —
  the one project it may talk to — and `form-action 'none'`.

Change a script by one byte without rebuilding and the browser refuses to run
it.

`style-src` keeps `'unsafe-inline'`, because the app sets style attributes on
elements it creates. Inline styles cannot execute script; this is a real but
small allowance and it is stated here rather than hidden.

**The session is in `localStorage`.** A static site cannot use an httpOnly
cookie against Supabase, and `sessionStorage` would sign the user out on every
tab close. The mitigation is that reading `localStorage` requires script
execution on that origin, which the pinned-hash CSP is precisely what prevents.
`/admin/*` is additionally sent `Cache-Control: no-store`, `X-Frame-Options:
DENY`, `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex`, and
`robots.txt` disallows it.

---

## 5. Findings that need the owner

### a. Leaked-password protection is off

Supabase can refuse passwords that appear in the HaveIBeenPwned corpus. It is
disabled, and it is a console setting, not something a migration can turn on.

**Dashboard → Authentication → Policies → enable leaked password protection.**

### b. Which host serves the domain decides whether the site is indexable

This is the most consequential open item in this document, and it cannot be
settled from the build environment — outbound HTTPS to the live domain is
blocked by the network policy here, so the check below has to be run by someone
who can reach it.

The repository configures **two** deploys, and they behave differently on every
URL except the homepage:

- **Cloudflare Workers** (`wrangler.toml`) sets
  `not_found_handling = "single-page-application"`. A request for
  `/en/projects/zed-west/` returns **200** with `index.html`, the app renders
  the project, and `_headers` applies. This is correct.
- **GitHub Pages** (`.github/workflows/deploy.yml`, plus `CNAME`) has no
  single-page fallback. There is no `en/` directory in the repository, so
  `/en/projects/zed-west/` returns **404** with `404.html` — the JavaScript
  redirect shim, which is itself `noindex`. Under Pages, every one of the
  1,110 URLs in `sitemap.xml` answers 404 to a crawler, and `_headers` is
  ignored entirely, so the framing block, HSTS and the `/admin/` rules stop
  applying too.

One command settles it:

```
curl -sI https://www.thevillageinvestment.com/en/projects/zed-west/ | head -1
```

`200` means the Worker is serving and nothing needs doing. `404` means Pages is
serving, and the fix is to point the custom domain at the Worker — the
configuration is already in the repository and needs no code change.

### c. The publish workflow needs two repository secrets

`.github/workflows/publish.yml` rebuilds the site from the database. Until
**Settings → Secrets and variables → Actions** holds `SUPABASE_URL` and
`SUPABASE_KEY`, it will fail on its first step. Neither is ever printed: the run
summary reports counts.

### d. Four `SECURITY DEFINER` functions in the `public` schema

Supabase's linter flags `current_company_id()`, `current_scope()`, `has_perm()`
and `visible_owner_ids()` as callable by signed-in users. **These belong to the
pre-existing "Village CRM" in the `public` schema, not to this CMS**, and they
are the helpers its own row-level security policies call — which is why they are
executable. They were left untouched deliberately. Whoever owns the CRM should
confirm that is intended; nothing in `cms` depends on them.

---

## 6. Running it

### First sign-in

The owner's invite is already in the database for **belalatiah5@gmail.com**.
Open `/admin/`, choose **Create account**, use that address, set a password. A
trigger on `auth.users` sees the matching invite, creates the `cms.admins` row
with the owner role, and marks the invite accepted. Signing up with any other
address creates an ordinary account that can see nothing.

The role shown in the dashboard is read from `cms.admins`, never from the token,
so editing the JWT client-side changes nothing.

### Adding someone

**Admins** (owner only) → invite an address with a role:

- **viewer** — reads everything, changes nothing
- **editor** — creates and edits content, runs imports
- **owner** — that, plus managing admins

They sign up at `/admin/` with that address and arrive with the role.

### Editing

Developers, Locations, Projects and Units each have a list and a drawer. Nothing
is deleted outright: `deleted_at` is set, the row stays, and `sort_order` keeps
each project's units in the order the client's price list has them — which is
what stops a rebuild from reshuffling the lists.

Draft and published are separate. Only published rows reach the site.

### Updating prices from a sheet

**Price import** → drop the `.xlsx` or `.csv`. Headers are matched in English or
Arabic; Arabic-Indic digits, thousands separators and currency words are all
read. Then:

1. A preview shows every row that would change, field by field, before and
   after, with unmatched rows listed separately.
2. Nothing is written until **Confirm**.
3. The batch is recorded, and every changed field writes its own audit entry.

A code in the sheet that matches no unit is reported, never created.

### Publishing

**Actions → Publish from the CMS** (or the nightly run). It regenerates the data
literals from the database, rebuilds both bundles, regenerates the sitemap, and
runs all four checks — 363 site assertions, 70 dashboard assertions, the sitemap
check and the SEO audit — **before** committing. A build that fails its tests is
never deployed.

---

## 7. What this does not claim

The site's structured data, canonical URLs, hreflang set and sitemap are correct
and machine-readable, and `tools/seoaudit.cjs` re-proves that on every publish.
That is the part code can do.

It is not a ranking promise. Position in Google depends on the domain's history,
inbound links, and how the market's other sites move — none of which is in this
repository. What can be said is that nothing in the markup is now holding the
site back, and that the sitemap it submits is 1,110 URLs that all resolve, all
declare themselves canonical, and all carry a title no other page uses.

---

## 8. On a phone, and in Arabic

Everything above runs in a DOM shim, which has no layout. That is the right
place to test what the code decides and the wrong place to test what a browser
does with the result: a table one column too wide, a drawer that opens
off-screen, a page that sets `dir="rtl"` and still lays out left-to-right — all
of them pass every shim test and are the first thing a visitor notices.

Three suites run in real Chromium at 360px:

| | |
|---|---|
| `node tools/siteqa.cjs` | the public site — no horizontal scroll, no uncaught error, exactly one `h1`, in both languages. `--all` sweeps every route |
| `node tools/adminqa.cjs` | the dashboard — the gate renders and nothing behind it is in the document, the primary control is a real tap target, the computed direction actually flips, the layout fills the viewport in RTL, the language choice survives a reload |
| `node tools/railqa.cjs` | the developer rail, whose whole behaviour is pointer state and layout |

The full sweep — **1,110 page loads across 555 routes, English and Arabic, at
phone width** — passes with no horizontal overflow anywhere.

It found one defect on its first run, and it is the kind only a browser can
see. Both contact honeypots (the invisible field that a form-filling bot fills
and thereby identifies itself) were hidden with
`position:absolute; left:-9999px`. That is the standard trick and it is correct
in English, where content to the left of the origin creates no scroll. In
Arabic the overflow region runs the other way, so ten thousand pixels to the
left became ten thousand pixels of horizontal scroll: `/ar/contact/` scrolled
sideways by 9,999px on a phone while `/en/contact/` was fine. Both now use the
site's `.visually-hidden` utility, which clips rather than offsets and has no
direction to get wrong. The trap still works — the wrapper renders 1×1 with
`clip:rect(0,0,0,0)`, `elementFromPoint` at the field's centre returns null, and
the input is still in the DOM for a bot to fill.

## 9. How to re-run all of it

```
python3 tools/build.py && python3 tools/build_admin.py
node tools/domtest.cjs        # 363 site assertions
node tools/admintest.cjs      #  70 dashboard assertions
python3 tools/sitemap.py --check
node tools/seoaudit.cjs       # every published URL's head

python3 tools/serve.py &      # the browser suites need it on :8099
node tools/siteqa.cjs
node tools/adminqa.cjs
node tools/railqa.cjs
```

Both builds also refuse to produce a bundle that breaks a rule: a DOM sink
(`innerHTML` and its relatives), or an interface string missing one of its two
languages — 323 on the site, 120 in the dashboard.

The role probes in section 1 are SQL and run against the project directly; they
are reproduced in `supabase/README.md`.
