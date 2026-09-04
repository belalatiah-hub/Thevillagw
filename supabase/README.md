# The Village Investment — CMS database

The public site is a single static `index.html`. It does **not** query this
database at runtime. Postgres is the editing system of record: the admin
dashboard writes here, and the build reads from here to regenerate the static
site. That is why row-level security denies `anon` everything — nothing
anonymous ever needs to read a row.

## Where things live

This Supabase project already carried a different application before the CMS
existed: the **Village CRM** (`public.companies`, `profiles`, `leads`, and its
own `units` and `audit_log`). All of its tables are empty, but they are real and
they are not ours to delete. The CMS therefore lives in its own **`cms`**
schema. Nothing in `public` was renamed, moved or dropped.

## Applying it

`migrations/` runs in order, once, against a fresh project:

| file | what it creates |
|---|---|
| `0001_core_types_and_taxonomy.sql` | enums, `locations`, `developers`, `amenities` |
| `0002_projects_and_units.sql` | `projects`, `units`, amenities/nearby/payment-plan joins |
| `0003_media_admins_audit_imports.sql` | `media_assets`, `media_links`, `admins`, `audit_log`, import batches |
| `0004_rls_and_price_import.sql` | every RLS policy, the price importer, the grants |
| `0005_pin_function_search_paths.sql` | pins two functions the linter flagged |

`seed/` is generated, not hand-written:

```sh
node tools/domtest.cjs --dump-data > /tmp/site_data.json
python3 tools/migrate_to_db.py /tmp/site_data.json
```

The content model only ever existed as JavaScript literals inside
`src/tpl_script2*.html`, and those literals reference shared path and amenity
variables — so they cannot be parsed out of the source and have to be read after
the bundle has run. `--dump-data` does exactly that. Every seed statement is
`on conflict do update`, so re-running corrects drift instead of duplicating.

## The two rules the schema enforces itself

**A price import can never create a unit.** `apply_price_import()` sets a
session flag for the duration of the batch, and a `before insert` trigger on
`cms.units` refuses any insert while that flag is set — whatever code path
issued it. Units are created from the dashboard, full stop.

**The audit log cannot be rewritten.** It has a select policy and an insert
policy and deliberately no update or delete policy, for any role.

## Roles

`cms.admins` rows are keyed to `auth.users`. **No password, hash or secret is
stored in this database or anywhere in this repository** — authentication is
Supabase Auth's job. Three roles: `owner` (may manage admins), `editor` (may
write content), `viewer` (read only).

## Outstanding project settings

Two things live in the Supabase dashboard, not in SQL, and are worth turning on:

- **Leaked password protection** (Auth → Policies) — checks new passwords
  against HaveIBeenPwned. Currently off.
- The CRM's four `public.*` `security definer` functions are flagged by the
  linter as callable by signed-in users. They belong to the other application,
  so they were left alone rather than changed from under it.
