-- Units, joined to their project by slug.
insert into cms.units (unit_code, project_id, unit_type_en, label_en, label_ar,
  bedrooms, bathrooms, bua, bua_to, price, down_payment_pct, instalment_years,
  delivery_label, floor, availability, status, published_at)
select v.unit_code, p.id, v.unit_type_en, v.label_en, v.label_ar,
  v.bedrooms::smallint, v.bathrooms::smallint, v.bua::numeric, v.bua_to::numeric,
  v.price::bigint, v.dp::numeric, v.years::numeric,
  v.delivery_label, v.floor, v.availability::cms.unit_availability, 'published', now()
from (values
  ('IC-08','isola-centra','Apartment','Typical floor','دور متكرّر',3,3,168,null,10960000,8,8,'2030',null,'available'),
  ('IC-09','isola-centra','Apartment','Typical floor','دور متكرّر',3,3,208,null,14390000,8,8,'2030',null,'available'),
  ('IC-10','isola-centra','Penthouse','Penthouse with roof','بنتهاوس بروف',2,2,143,null,8580000,8,8,'2030',null,'available'),
  ('IC-11','isola-centra','Penthouse','Penthouse with roof','بنتهاوس بروف',3,3,210,null,11510000,8,8,'2030',null,'available'),
  ('IC-12','isola-centra','Administrative Office','Administrative office','مكتب إداري',null,null,87,null,8800000,8,8,'2030',null,'available'),
  ('IC-13','isola-centra','Administrative Office','Administrative office','مكتب إداري',null,null,108,null,10910000,8,8,'2030',null,'available'),
  ('IC-14','isola-centra','Clinic','Clinic','عيادة',null,null,177,null,17890000,8,8,'2030',null,'available')
) as v(unit_code, project_slug, unit_type_en, label_en, label_ar, bedrooms, bathrooms,
       bua, bua_to, price, dp, years, delivery_label, floor, availability)
join cms.projects p on p.slug = v.project_slug
on conflict (lower(unit_code)) where deleted_at is null do update set
  project_id = excluded.project_id, unit_type_en = excluded.unit_type_en,
  label_en = excluded.label_en, label_ar = excluded.label_ar,
  bedrooms = excluded.bedrooms, bathrooms = excluded.bathrooms,
  bua = excluded.bua, bua_to = excluded.bua_to, price = excluded.price,
  down_payment_pct = excluded.down_payment_pct,
  instalment_years = excluded.instalment_years,
  delivery_label = excluded.delivery_label, floor = excluded.floor,
  availability = excluded.availability;
