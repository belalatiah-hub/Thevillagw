# Village CRM — Live on Supabase

The console (`public/index.html`) runs **fully live** on Supabase — no separate
Node server. Supabase provides the database, the login (Auth), the REST API, and
enforces every role permission in the database itself (Row-Level Security).

```
[ index.html on Cloudflare ]  ──►  [ Supabase ]
   static file (browser)            Postgres + Auth + REST + RLS
```

## What is already set up (done for you)
- **Schema**: companies, roles, profiles, teams, units, leads, lead_actions,
  feedback, lookups, audit_log, notifications.
- **RLS**: role-scoped visibility — `own` / `team` / `all`. Agents see only their
  leads, a Team Leader sees the whole team, managers/admin see everything. The
  UI menu is also filtered by each role's `resource:action` permissions.
- **Seed**: the company "The Village Investment", the core roles, 9 inventory
  units, 9 leads, and demo users for each job function.
- **Frontend**: `index.html` already points at the project:
  ```js
  var SUPABASE_URL  = "https://xvcrgoeavdwykqflhuiw.supabase.co";
  var SUPABASE_ANON = "sb_publishable_...";   // publishable key — safe in the browser
  ```
  The publishable/anon key is **designed** to ship in client code; RLS is what
  protects the data, not key secrecy.

## What you need to do

### 1. Harden Auth (5 minutes, in the Supabase dashboard)
1. **Change the admin password immediately** (Authentication → Users → the admin
   user → reset), then do the same for the other seeded users, or delete the ones
   you don't need.
2. **Enable leaked-password protection**: Authentication → Policies/Settings →
   turn on "Check against HaveIBeenPwned".
3. (Recommended) Enable **MFA/2FA** for the admin.
4. Under Authentication → **Providers → Email**, keep "Confirm email" as you
   prefer; the seeded users are already confirmed.

### 2. Add your real users
- Authentication → **Add user** (email + password), then in the SQL editor (or a
  Users screen later) insert a matching `public.profiles` row with the right
  `role_id`, `team_id`, and `scope`. Roles live in `public.roles` — edit their
  `permissions` array anytime to change what each role can do.

### 3. Deploy the frontend to Cloudflare
```bash
cd web
npm install
npx wrangler login
npx wrangler deploy      # publishes index.html (console) + app.html (mobile)
```
Add your Cloudflare URL to Supabase only if you enable strict CORS (by default
Supabase allows browser calls from any origin, so it works immediately).

### 4. Sign in
Open your Cloudflare URL and log in with a real user. The menu, the numbers, and
every list now reflect that user's role and scope — enforced by the database.

## Day-2
- **Change permissions**: edit `roles.permissions` (array of `resource:action`),
  and `roles.scope` (`own`/`team`/`all`).
- **Backups**: enable automated backups on the Supabase project.
- **Add tables/columns**: use Supabase migrations; keep RLS enabled on every new
  table (the linter under Advisors will remind you).
- **Security review**: Supabase → Advisors → Security should stay clean.
