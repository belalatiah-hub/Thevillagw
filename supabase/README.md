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
| `0006_fractional_instalment_years.sql` | retypes `instalment_years` so One Ninety's 3.5-year plan survives |

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

Long `values` lists are split across numbered files (`04_projects_01.sql`,
`04_projects_02.sql`, …) because the SQL goes over the wire one statement at a
time. Each file repeats the whole statement, so any one of them can be run alone
and in any order.

**Paths are stored resolved.** The site keeps some references as bare filenames
and expands them at render time — a `.png` logo name becomes the `.webp` that is
actually served, a bare plan name gains `/project-media/plans/`. The database
holds the URL the browser asks for, so nothing downstream has to know those
rules. All 1,830 stored paths exist on disk.

## Checking the load

Row counts only prove nothing was dropped. `tools/verify_db.py` digests the
site's model field by field, and `tools/verify_db.sql` makes the database digest
its own rows the same way:

```sh
python3 tools/verify_db.py /tmp/site_data.json   # then run tools/verify_db.sql
```

Eight md5s, one per table. Matching numbers mean every migrated value is
identical to what the site publishes — 14 locations, 27 developers, 131
amenities, 84 projects, 420 units, 1,830 media assets, 2,968 placements, 152
project amenities.

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

## Proving the policies, rather than reading them

Reading a policy tells you what it says. Running a statement as the role tells
you what it does. This impersonates each caller and records the outcome; the
full results are in `docs/DASHBOARD_AND_SECURITY.md`.

```sql
create temp table probe(seq int generated always as identity,
                        actor text, action text, outcome text);
grant insert on probe to anon, authenticated;

do $$
declare n int;
begin
  -- An anonymous visitor: everything the publishable key alone can do.
  set local role anon;
  begin select count(*) into n from cms.units;
    insert into probe(actor,action,outcome) values ('anon','SELECT units', n||' rows');
  exception when others then
    insert into probe(actor,action,outcome) values ('anon','SELECT units','BLOCKED: '||sqlerrm);
  end;

  -- A signed-in stranger: a real account that is not in cms.admins.
  set local role authenticated;
  perform set_config('request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000000ff","role":"authenticated"}', true);

  select count(*) into n from cms.units;
  insert into probe(actor,action,outcome) values ('stranger','SELECT units', n||' rows');

  -- Row count, not success. A statement that matches no rows succeeds and
  -- changes nothing; recording "succeeded" here would report a breach that is
  -- not there.
  update cms.units set price = price; get diagnostics n = row_count;
  insert into probe(actor,action,outcome) values ('stranger','UPDATE units', n||' rows changed');

  delete from cms.audit_log; get diagnostics n = row_count;
  insert into probe(actor,action,outcome) values ('stranger','DELETE audit_log', n||' rows deleted');

  begin insert into cms.admins(id,email,role,is_active)
        values (gen_random_uuid(),'attacker@example.com','owner',true);
    insert into probe(actor,action,outcome) values ('stranger','self-promote','SUCCEEDED');
  exception when others then
    insert into probe(actor,action,outcome) values ('stranger','self-promote','BLOCKED: '||sqlerrm);
  end;
  reset role;
end $$;

select actor, action, outcome from probe order by seq;
```

Expected: the anonymous role is refused at the schema level; the stranger reads
zero rows, changes zero rows, and is refused outright when it tries to make
itself an owner.

## Outstanding project settings

Two things live in the Supabase dashboard, not in SQL, and are worth turning on:

- **Leaked password protection** (Auth → Policies) — checks new passwords
  against HaveIBeenPwned. Currently off.
- The CRM's four `public.*` `security definer` functions are flagged by the
  linter as callable by signed-in users. They belong to the other application,
  so they were left alone rather than changed from under it.
