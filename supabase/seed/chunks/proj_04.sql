-- 84 projects. Every one is `published`: they are all live on the site today,
-- and a migration must not quietly unpublish anything.
insert into cms.projects (slug, name_en, name_ar, developer_id, location_id, stage,
  description_en, description_ar, price_from, down_payment_pct, instalment_years,
  delivery_label, finishing_en, finishing_ar, unit_types_en, unit_types_ar,
  tags_en, tags_ar, status, published_at)
select v.slug, v.name_en, v.name_ar, dev.id, loc.id, v.stage::cms.project_stage,
  v.description_en, v.description_ar, v.price_from, v.dp, v.years,
  v.delivery_label, v.finishing_en, v.finishing_ar, v.unit_types_en, v.unit_types_ar,
  v.tags_en, v.tags_ar, 'published', now()
from (values
  ('hacienda-waters','Hacienda Waters','هاسيندا ووترز','palmhills','raselhekma','primary','A 161-acre Palm Hills beachfront community at Ras El Hekma (Km 191) with lagoons, an aqua park and a 400m beach — chalets, cabins and water villas. Developer-direct primary units.','مجتمع بالم هيلز الشاطئي على ١٦١ فداناً برأس الحكمة (كيلو ١٩١) ببحيرات وأكوا بارك وشاطئ ٤٠٠ متر — شاليهات وكبائن وفيلات مائية. وحدات أولية من المطوّر مباشرة.',14100000,2.5,12,'2029','Fully finished (no kitchen/AC)','تشطيب كامل (بدون مطبخ وتكييف)','Chalet · Cabin · Villa','شاليه · كابين · فيلا','{"Ras El Hekma","Aqua park"}','{"رأس الحكمة","أكوا بارك"}'),
  ('hacienda-heneish','Hacienda Heneish','هاسيندا حنيش','palmhills','raselhekma','primary','A 420-feddan Palm Hills resort on the North Coast with a Marriott hotel, strip mall and 1.1km of beachfront — G+3 apartments, chalets, townhouses and standalone villas. Developer-direct primary units.','منتجع بالم هيلز على ٤٢٠ فداناً بالساحل الشمالي بفندق ماريوت وممشى تجاري وواجهة بحرية ١٫١ كم — شقق أرضي+٣ وشاليهات وتاون هاوس وفيلات مستقلة. وحدات أولية من المطوّر مباشرة.',16000000,5,8,'2029','Fully finished','تشطيب كامل','Apartment · Chalet · Townhouse · Villa','شقة · شاليه · تاون هاوس · فيلا','{"Ras El Hekma","Marriott hotel"}','{"رأس الحكمة","فندق ماريوت"}'),
  ('hacienda-west','Hacienda West','هاسيندا ويست','palmhills','raselhekma','primary','A 132-feddan Palm Hills beach community at Ras El Hekma (Km 208) with a hotel, clubhouse, lagoons and a 400m beach — chalets, cabins and villas. Developer-direct primary units.','مجتمع بالم هيلز الشاطئي على ١٣٢ فداناً برأس الحكمة (كيلو ٢٠٨) بفندق وكلوب هاوس وبحيرات وشاطئ ٤٠٠ متر — شاليهات وكبائن وفيلات. وحدات أولية من المطوّر مباشرة.',23800000,10,7,'2027','Fully finished / core & shell','تشطيب كامل / خرسانة','Chalet · Cabin · Villa','شاليه · كابين · فيلا','{"Ras El Hekma","Beachfront"}','{"رأس الحكمة","واجهة بحرية"}')
) as v(slug, name_en, name_ar, dev_slug, area_slug, stage, description_en, description_ar,
       price_from, dp, years, delivery_label, finishing_en, finishing_ar,
       unit_types_en, unit_types_ar, tags_en, tags_ar)
join cms.developers dev on dev.slug = v.dev_slug
join cms.locations  loc on loc.slug = v.area_slug
on conflict (slug) do update set
  name_en = excluded.name_en, name_ar = excluded.name_ar,
  developer_id = excluded.developer_id, location_id = excluded.location_id,
  stage = excluded.stage, description_en = excluded.description_en,
  description_ar = excluded.description_ar, price_from = excluded.price_from,
  down_payment_pct = excluded.down_payment_pct, instalment_years = excluded.instalment_years,
  delivery_label = excluded.delivery_label, finishing_en = excluded.finishing_en,
  finishing_ar = excluded.finishing_ar, unit_types_en = excluded.unit_types_en,
  unit_types_ar = excluded.unit_types_ar, tags_en = excluded.tags_en, tags_ar = excluded.tags_ar;
