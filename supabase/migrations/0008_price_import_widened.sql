-- A developer's price list revises more than the price.
--
-- The first cut of the importer carried one column. In practice a revised
-- sheet moves the down payment, the term and the handover date together —
-- and an importer that can only write the price forces the other three to be
-- retyped by hand, one unit at a time, which is exactly the error-prone work
-- this feature exists to remove.
--
-- What does NOT change is the rule underneath: a spreadsheet may only ever
-- update a unit that already exists. `units_no_insert_during_import` still
-- refuses an insert for the whole window, and this function still asks
-- `can_write()` before it touches anything.

alter table cms.import_rows
  add column if not exists old_down_payment_pct numeric(5,2),
  add column if not exists new_down_payment_pct numeric(5,2),
  add column if not exists old_instalment_years numeric(4,1),
  add column if not exists new_instalment_years numeric(4,1),
  add column if not exists old_delivery_label   text,
  add column if not exists new_delivery_label   text,
  add column if not exists changed_fields       text[] not null default '{}';

comment on column cms.import_rows.changed_fields is
  'Which columns the preview found a real difference in. Empty means the row is a no-op.';

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

  -- the window in which no unit may be created, by any code path
  perform set_config('app.import_batch', p_batch_id::text, true);

  for r in
    select ir.*, u.unit_code,
           u.price                as cur_price,
           u.down_payment_pct     as cur_dp,
           u.instalment_years     as cur_years,
           u.delivery_label       as cur_delivery
      from cms.import_rows ir
      join cms.units u on u.id = ir.unit_id
     where ir.batch_id = p_batch_id
       and ir.verdict = 'ok'
       and u.deleted_at is null
     order by ir.row_number
  loop
    -- Only the fields the sheet actually carried, and only where the value
    -- really differs. A column the file left out is never written.
    if 'price' = any(r.changed_fields) and r.cur_price is distinct from r.new_price then
      update units set price = r.new_price where id = r.unit_id;
      insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                             entity_label, field, old_value, new_value, batch_id)
      values (v_actor, v_email, 'update', 'unit', r.unit_id, 'Unit ' || r.unit_code,
              'price', to_jsonb(r.cur_price), to_jsonb(r.new_price), p_batch_id);
      v_applied := v_applied + 1;
    end if;

    if 'down_payment_pct' = any(r.changed_fields)
       and r.cur_dp is distinct from r.new_down_payment_pct then
      update units set down_payment_pct = r.new_down_payment_pct where id = r.unit_id;
      insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                             entity_label, field, old_value, new_value, batch_id)
      values (v_actor, v_email, 'update', 'unit', r.unit_id, 'Unit ' || r.unit_code,
              'down_payment_pct', to_jsonb(r.cur_dp), to_jsonb(r.new_down_payment_pct), p_batch_id);
      v_applied := v_applied + 1;
    end if;

    if 'instalment_years' = any(r.changed_fields)
       and r.cur_years is distinct from r.new_instalment_years then
      update units set instalment_years = r.new_instalment_years where id = r.unit_id;
      insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                             entity_label, field, old_value, new_value, batch_id)
      values (v_actor, v_email, 'update', 'unit', r.unit_id, 'Unit ' || r.unit_code,
              'instalment_years', to_jsonb(r.cur_years), to_jsonb(r.new_instalment_years), p_batch_id);
      v_applied := v_applied + 1;
    end if;

    if 'delivery_label' = any(r.changed_fields)
       and r.cur_delivery is distinct from r.new_delivery_label then
      update units set delivery_label = r.new_delivery_label where id = r.unit_id;
      insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                             entity_label, field, old_value, new_value, batch_id)
      values (v_actor, v_email, 'update', 'unit', r.unit_id, 'Unit ' || r.unit_code,
              'delivery_label', to_jsonb(r.cur_delivery), to_jsonb(r.new_delivery_label), p_batch_id);
      v_applied := v_applied + 1;
    end if;
  end loop;

  update import_batches
     set status = 'applied', rows_applied = v_applied, applied_at = now()
   where id = p_batch_id;

  insert into audit_log (actor_id, actor_email, action, entity_type, entity_id,
                         entity_label, new_value, batch_id)
  values (v_actor, v_email, 'import', 'unit', null,
          'Price import', jsonb_build_object('fields_updated', v_applied), p_batch_id);

  perform set_config('app.import_batch', '', true);
  return v_applied;
end;
$$;

revoke all on function cms.apply_price_import(uuid) from public, anon;
grant execute on function cms.apply_price_import(uuid) to authenticated;
