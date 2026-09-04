-- The Village Investment — content model, part 4 of 4: row-level security and
-- the price importer.
--
-- Security posture: anon gets nothing. The public site is generated statically
-- and never queries this database, so there is no anonymous read to grant and
-- no public API surface to defend. Every policy below therefore requires an
-- authenticated session that also has an active row in `admins`.


-- SCHEMA SCOPING. This Supabase project already carries a different
-- application in `public` — the Village CRM's companies/profiles/leads tables,
-- including its own `units` and `audit_log`. Creating the CMS there would
-- collide with both. The content model therefore lives in its own `cms`
-- schema: nothing existing is renamed, moved or dropped, and the two systems
-- share one database without either being able to break the other.
create schema if not exists cms;
set search_path = cms, public;

alter table locations         enable row level security;
alter table developers        enable row level security;
alter table amenities         enable row level security;
alter table projects          enable row level security;
alter table project_amenities enable row level security;
alter table project_nearby    enable row level security;
alter table payment_plans     enable row level security;
alter table units             enable row level security;
alter table media_assets      enable row level security;
alter table media_links       enable row level security;
alter table admins            enable row level security;
alter table audit_log         enable row level security;
alter table import_batches    enable row level security;
alter table import_rows       enable row level security;

-- Content: any active admin may read; owners and editors may write.
-- One EXECUTE per statement — plpgsql runs a single command per call, so the
-- four policies cannot be batched into one format() string.
do $$
declare t text;
begin
  foreach t in array array['locations','developers','amenities','projects',
                           'project_amenities','project_nearby','payment_plans',
                           'units','media_assets','media_links'] loop
    execute format('create policy %1$I on cms.%2$I for select to authenticated using (cms.is_active_admin())', t || '_read', t);
    execute format('create policy %1$I on cms.%2$I for insert to authenticated with check (cms.can_write())', t || '_insert', t);
    execute format('create policy %1$I on cms.%2$I for update to authenticated using (cms.can_write()) with check (cms.can_write())', t || '_update', t);
    execute format('create policy %1$I on cms.%2$I for delete to authenticated using (cms.can_write())', t || '_delete', t);
  end loop;
end $$;

-- Admins: an admin sees the roster and their own row; only an owner may change
-- it. Without the owner restriction an editor could promote themselves.
create policy admins_read on admins
  for select to authenticated using (is_active_admin());
create policy admins_insert on admins
  for insert to authenticated with check (is_owner());
create policy admins_update on admins
  for update to authenticated using (is_owner()) with check (is_owner());
create policy admins_delete on admins
  for delete to authenticated using (is_owner() and id <> auth.uid());

-- Audit log: append-only. Readable by admins, written by admins, and there is
-- deliberately no update or delete policy, so no session can rewrite history.
create policy audit_read on audit_log
  for select to authenticated using (is_active_admin());
create policy audit_insert on audit_log
  for insert to authenticated with check (is_active_admin());

-- Import batches and their rows follow the content rules.
create policy import_batches_read on import_batches
  for select to authenticated using (is_active_admin());
create policy import_batches_write on import_batches
  for insert to authenticated with check (can_write());
create policy import_batches_update on import_batches
  for update to authenticated using (can_write()) with check (can_write());
create policy import_rows_read on import_rows
  for select to authenticated using (is_active_admin());
create policy import_rows_write on import_rows
  for insert to authenticated with check (can_write());
create policy import_rows_update on import_rows
  for update to authenticated using (can_write()) with check (can_write());

-- ------------------------------------------------- units are never imported
-- The rule is "Excel updates prices, the dashboard creates units". Written as
-- a database guarantee rather than a convention: while a price import is
-- running, a session flag is set, and any attempt to insert a unit in that
-- window is refused no matter which code path issued it.
create or replace function cms.units_block_insert_during_import() returns trigger
language plpgsql set search_path = cms, public, pg_temp as $$
begin
  if coalesce(current_setting('app.import_batch', true), '') <> '' then
    raise exception
      'a price import may not create units (batch %); create units from the dashboard',
      current_setting('app.import_batch', true);
  end if;
  return new;
end;
$$;

create trigger units_no_insert_during_import before insert on cms.units
  for each row execute function cms.units_block_insert_during_import();

-- ------------------------------------------------------------ apply a batch
-- Applies every row the preview marked `ok`, in one transaction, writing an
-- audit entry per unit. Returns the number of units actually updated.
--
-- `security definer` so the caller cannot be handed the rights to do this by
-- any other route, and the write is still gated on `can_write()` first.
create or replace function cms.apply_price_import(p_batch_id uuid)
returns integer
language plpgsql security definer set search_path = cms, public, pg_temp as $$
declare
  v_actor   uuid := auth.uid();
  v_email   text;
  v_applied integer := 0;
  v_status  text;
  r         record;
begin
  if not can_write() then
    raise exception 'not authorised to apply a price import' using errcode = '42501';
  end if;

  select status into v_status from import_batches where id = p_batch_id for update;
  if v_status is null then
    raise exception 'import batch % not found', p_batch_id;
  end if;
  if v_status <> 'pending' then
    raise exception 'import batch % is already %', p_batch_id, v_status;
  end if;

  select email into v_email from admins where id = v_actor;

  -- marks the window in which units may not be created
  perform set_config('app.import_batch', p_batch_id::text, true);

  for r in
    select ir.unit_id, ir.new_price, u.price as current_price, u.unit_code, ir.row_number
    from cms.import_rows ir
    join cms.units u on u.id = ir.unit_id
    where ir.batch_id = p_batch_id
      and ir.verdict = 'ok'
      and u.deleted_at is null
    order by ir.row_number
  loop
    if r.current_price is distinct from r.new_price then
      update units set price = r.new_price where id = r.unit_id;

      insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                             entity_label, field, old_value, new_value, batch_id)
      values (v_actor, v_email, 'update', 'unit', r.unit_id,
              'Unit ' || r.unit_code, 'price',
              to_jsonb(r.current_price), to_jsonb(r.new_price), p_batch_id);

      v_applied := v_applied + 1;
    end if;
  end loop;

  update import_batches
     set status = 'applied', rows_applied = v_applied, applied_at = now()
   where id = p_batch_id;

  insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                         entity_label, new_value, batch_id)
  values (v_actor, v_email, 'import', 'unit', null,
          'Price import', jsonb_build_object('units_updated', v_applied), p_batch_id);

  perform set_config('app.import_batch', '', true);
  return v_applied;
end;
$$;

revoke all on function cms.apply_price_import(uuid) from public, anon;
grant execute on function cms.apply_price_import(uuid) to authenticated;

-- ---------------------------------------------------------------- grants
-- `authenticated` reaches the tables through RLS; `anon` is denied the schema
-- outright, so an unauthenticated request cannot even see that it exists.
grant usage on schema cms to authenticated;
grant select, insert, update, delete on all tables in schema cms to authenticated;
grant usage, select on all sequences in schema cms to authenticated;
alter default privileges in schema cms grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema cms grant usage, select on sequences to authenticated;

revoke all on schema cms from anon;

-- ------------------------------------------------------------ publish gate
-- What the static build reads. A project is only publishable when it has the
-- fields every page and every schema block needs, so a half-filled draft can
-- never reach the sitemap.
create or replace view cms.publishable_projects
with (security_invoker = true) as
  select p.*
  from cms.projects p
  join cms.developers d on d.id = p.developer_id
  join cms.locations  l on l.id = p.location_id
  where p.deleted_at is null
    and p.status = 'published'
    and d.deleted_at is null and d.status = 'published'
    and l.deleted_at is null and l.status = 'published'
    and coalesce(p.name_en, '') <> ''
    and coalesce(p.name_ar, '') <> '';
