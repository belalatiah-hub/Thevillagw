-- Egypt, its governorates, and the nine areas the site publishes.
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order) values
  ('egypt', 'country', null, 'Egypt', 'مصر', null, null, 0)
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;

insert into cms.locations (slug, level, parent_id, name_en, name_ar)
select 'cairo', 'governorate', id, 'Cairo', 'القاهرة' from cms.locations where slug = 'egypt'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;
insert into cms.locations (slug, level, parent_id, name_en, name_ar)
select 'giza', 'governorate', id, 'Giza', 'الجيزة' from cms.locations where slug = 'egypt'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;
insert into cms.locations (slug, level, parent_id, name_en, name_ar)
select 'matrouh', 'governorate', id, 'Matrouh', 'مطروح' from cms.locations where slug = 'egypt'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;
insert into cms.locations (slug, level, parent_id, name_en, name_ar)
select 'suez', 'governorate', id, 'Suez', 'السويس' from cms.locations where slug = 'egypt'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar;

insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'newcairo', 'area', id, 'New Cairo', 'القاهرة الجديدة', 'East Cairo hub of gated communities, schools and business districts.', 'قلب شرق القاهرة من الكمبوندات والمدارس ومناطق الأعمال.', 0 from cms.locations where slug = 'cairo'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'fifthsettlement', 'area', id, 'Fifth Settlement', 'التجمع الخامس', 'The premium heart of New Cairo — established compounds and retail.', 'قلب القاهرة الجديدة الراقي — كمبوندات مكتملة ومراكز تجارية.', 1 from cms.locations where slug = 'cairo'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'capital', 'area', id, 'New Administrative Capital', 'العاصمة الإدارية الجديدة', 'Egypt''s new government and business capital, still launching.', 'العاصمة الحكومية والتجارية الجديدة، ما زالت تُطرح.', 2 from cms.locations where slug = 'cairo'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'sahel', 'area', id, 'North Coast (Sahel)', 'الساحل الشمالي', 'Mediterranean second-home and resort destinations.', 'وجهات المصيف والمنزل الثاني على المتوسط.', 3 from cms.locations where slug = 'matrouh'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'raselhekma', 'area', id, 'Ras El Hekma', 'رأس الحكمة', 'The North Coast’s fastest-rising bay — crystalline lagoons, long private beaches and landmark master-planned resorts.', 'أسرع خلجان الساحل الشمالي صعوداً — بحيرات كريستالية وشواطئ خاصة طويلة ومنتجعات مخطّطة كبرى.', 4 from cms.locations where slug = 'matrouh'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'zayed', 'area', id, 'Sheikh Zayed', 'الشيخ زايد', 'Established West Cairo living with mature communities.', 'حياة راقية بغرب القاهرة بمجتمعات مكتملة.', 5 from cms.locations where slug = 'giza'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'october', 'area', id, '6th of October', '٦ أكتوبر', 'Spacious West Cairo city with a wide price range.', 'مدينة واسعة بغرب القاهرة بنطاق أسعار متنوع.', 6 from cms.locations where slug = 'giza'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'mostakbal', 'area', id, 'Mostakbal City', 'مدينة المستقبل', 'Fast-growing East Cairo corridor with new launches.', 'محور سريع النمو بشرق القاهرة مع إطلاقات جديدة.', 7 from cms.locations where slug = 'cairo'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
insert into cms.locations (slug, level, parent_id, name_en, name_ar, blurb_en, blurb_ar, sort_order)
select 'sokhna', 'area', id, 'Ain Sokhna', 'العين السخنة', 'Red Sea coast close to Cairo for weekend homes.', 'ساحل البحر الأحمر القريب من القاهرة لمنازل نهاية الأسبوع.', 8 from cms.locations where slug = 'suez'
on conflict (slug) do update set name_en = excluded.name_en, name_ar = excluded.name_ar,
  blurb_en = excluded.blurb_en, blurb_ar = excluded.blurb_ar, sort_order = excluded.sort_order;
