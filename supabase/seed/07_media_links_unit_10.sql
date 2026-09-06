-- Where each image is attached. The path is written once and the owner
-- codes are unnested beside it. A link is only written when both the asset
-- and its owner exist, so a stale reference inserts nothing rather than
-- pointing at the wrong row.
insert into cms.media_links (asset_id, unit_id, role, sort_order)
select a.id, o.id, v.role::cms.media_role, v.sort_order
from (values
  ('/project-media/' || 'orascom/ledge-valley/units/mp-mko.webp','masterplan',0,array['LV-01','LV-02','LV-03','LV-04','LV-05','LV-06','LV-07','LV-08','LV-09','LV-10']),
  ('/project-media/' || 'orascom/siyal/units/mp-siyal.webp','masterplan',0,array['SY-01','SY-02','SY-03','SY-04','SY-05','SY-06','SY-07']),
  ('/project-media/' || 'plans/mp-AL-V03.webp','masterplan',0,array['AL-V03']),
  ('/project-media/' || 'plans/mp-CS-TW1.webp','masterplan',0,array['CS-TW1']),
  ('/project-media/' || 'plans/mp-JN-CR1.webp','masterplan',0,array['JN-CR1']),
  ('/project-media/' || 'plans/mp-JN-OP1.webp','masterplan',0,array['JN-OP1']),
  ('/project-media/' || 'ramla/units/mp-a.webp','masterplan',0,array['AE-AP01']),
  ('/project-media/' || 'sumou/mp-s.webp','masterplan',0,array['SB-ST-01','SB-SP-01','SB-AP-01','SB-AP-02','SB-AP-03','SB-AP-04','SB-OF-01','SB-OF-02']),
  ('/project-media/' || 'tatweer/mp-ap-b.webp','masterplan',0,array['TM-BL-01','TM-BL-02','TM-BL-03','TM-BL-04','TM-BL-05','TM-BL-06','TM-BL-07','TM-BL-08']),
  ('/project-media/' || 'tatweer/mp-ap-r.webp','masterplan',0,array['TM-RV-01','TM-RV-02','TM-RV-03','TM-RV-04','TM-RV-05']),
  ('/project-media/' || 'tatweer/mp-ap2-il-tm.webp','masterplan',0,array['TM-IM-05']),
  ('/project-media/' || 'tatweer/mp-dbay.webp','masterplan',0,array['TM-DB-01','TM-DB-02','TM-DB-03']),
  ('/project-media/' || 'tatweer/mp-f.webp','masterplan',0,array['TM-FK-01','TM-FK-02','TM-FK-03','TM-FK-04']),
  ('/project-media/' || 'tatweer/mp-lo2-tm-il.webp','masterplan',0,array['TM-IM-10']),
  ('/project-media/' || 'tatweer/mp-lo3-tm-il.webp','masterplan',0,array['TM-IM-11']),
  ('/project-media/' || 'tatweer/mp-scene.webp','masterplan',0,array['TM-SC-01','TM-SC-02','TM-SC-03']),
  ('/project-media/' || 'tatweer/mp-sl-th.webp','masterplan',0,array['TM-SL-04','TM-SL-05','TM-SL-06']),
  ('/project-media/' || 'tatweer/mp-st-sv-il.webp','masterplan',0,array['TM-IM-02']),
  ('/project-media/' || 'tatweer/mp-tm-ap1-il.webp','masterplan',0,array['TM-IM-04']),
  ('/project-media/' || 'tatweer/mp-tm-ca1-il.webp','masterplan',0,array['TM-IM-14']),
  ('/project-media/' || 'tatweer/mp-tm-ch1-il.webp','masterplan',0,array['TM-IM-03']),
  ('/project-media/' || 'tatweer/mp-tm-ch2-il.webp','masterplan',0,array['TM-IM-06']),
  ('/project-media/' || 'tatweer/mp-tm-ch3-il.webp','masterplan',0,array['TM-IM-07']),
  ('/project-media/' || 'tatweer/mp-tm-ch4-il.webp','masterplan',0,array['TM-IM-08']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il-copy-copy.webp','masterplan',0,array['TM-IM-17']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il-copy-copy.webp','masterplan',1,array['TM-IM-16']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il-copy-copy.webp','masterplan',2,array['TM-IM-15']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il-copy.webp','masterplan',0,array['TM-IM-16']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il-copy.webp','masterplan',1,array['TM-IM-15']),
  ('/project-media/' || 'tatweer/mp-tm-ch5-il.webp','masterplan',0,array['TM-IM-15']),
  ('/project-media/' || 'tatweer/mp-tm-lo-il.webp','masterplan',0,array['TM-IM-09']),
  ('/project-media/' || 'tatweer/mp-tm-st2-il.webp','masterplan',0,array['TM-IM-18']),
  ('/project-media/' || 'tatweer/mp-tm-sv-il.webp','masterplan',0,array['TM-IM-01']),
  ('/project-media/' || 'tatweer/mp-tm-sv2-il.webp','masterplan',0,array['TM-IM-13']),
  ('/project-media/' || 'tatweer/mp-tm-th1-il.webp','masterplan',0,array['TM-IM-12']),
  ('/project-media/' || 'tatweer/open-salt-scape-masterplan.webp','masterplan',0,array['TM-SL-01','TM-SL-02','TM-SL-03'])
) as v(path, role, sort_order, owners)
cross join lateral unnest(v.owners) as owner_code
join cms.media_assets a on a.path = v.path
join cms.units o on lower(o.unit_code) = lower(owner_code);
