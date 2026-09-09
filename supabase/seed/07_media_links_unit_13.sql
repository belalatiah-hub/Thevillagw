-- Where each image is attached. The path is written once and the owner
-- codes are unnested beside it. A link is only written when both the asset
-- and its owner exist, so a stale reference inserts nothing rather than
-- pointing at the wrong row.
insert into cms.media_links (asset_id, unit_id, role, sort_order)
select a.id, o.id, v.role::cms.media_role, v.sort_order
from (values
  ('/project-media/' || 'ogami/units/ogami-masterplan.webp','masterplan',0,array['OG-01','OG-02','OG-03','OG-04','OG-05','OG-06','OG-07','OG-08','OG-09','OG-10']),
  ('/project-media/' || 'ora/fp-sw.webp','masterplan',0,array['OR-SW-01','OR-SW-02','OR-SW-03','OR-SW-04','OR-SW-05','OR-SW-06','OR-SW-07','OR-SW-08']),
  ('/project-media/' || 'ora/mp-em.webp','masterplan',1,array['OR-EM-01','OR-EM-02','OR-EM-03','OR-EM-04','OR-EM-05','OR-EM-06']),
  ('/project-media/' || 'ora/mp-s-e.webp','masterplan',0,array['OR-SE-01','OR-SE-02','OR-SE-03','OR-SE-04','OR-SE-05']),
  ('/project-media/' || 'ora/mp-si.webp','masterplan',0,array['OR-CR-01','OR-CR-02','OR-CR-03','OR-CR-04','OR-CR-05','OR-CR-06','OR-CR-07','OR-CR-08','OR-CR-09','OR-ST-01','OR-ST-02','OR-ST-03','OR-ST-04','OR-ST-05','OR-ST-06','OR-ST-07']),
  ('/project-media/' || 'ora/mp-sw.webp','masterplan',0,array['OR-SW-09','OR-SW-10','OR-SW-11','OR-SW-12','OR-SW-13','OR-SW-14','OR-SW-15','OR-SW-16']),
  ('/project-media/' || 'ora/mp-z2.webp','masterplan',1,array['OR-ZE-05','OR-ZE-06','OR-ZE-07','OR-ZE-08']),
  ('/project-media/' || 'ora/mp-zed.webp','masterplan',0,array['OR-ZE-01','OR-ZE-02','OR-ZE-03','OR-ZE-04','OR-ZE-05','OR-ZE-06','OR-ZE-07','OR-ZE-08','OR-EM-01','OR-EM-02','OR-EM-03','OR-EM-04','OR-EM-05','OR-EM-06']),
  ('/project-media/' || 'ora/mp-zw.webp','masterplan',0,array['OR-ZW-01','OR-ZW-02','OR-ZW-03','OR-ZW-04','OR-ZW-05','OR-ZW-06','OR-ZW-07']),
  ('/project-media/' || 'orascom/ledge-valley/units/mp-mko.webp','masterplan',0,array['LV-01','LV-02','LV-03','LV-04','LV-05','LV-06','LV-07','LV-08','LV-09','LV-10']),
  ('/project-media/' || 'orascom/siyal/units/mp-siyal.webp','masterplan',0,array['SY-01','SY-02','SY-03','SY-04','SY-05','SY-06','SY-07']),
  ('/project-media/' || 'ramla/units/mp-a.webp','masterplan',0,array['AE-AP01']),
  ('/project-media/' || 'sodic/caesar-north-coast/units/mp-ca.webp','masterplan',0,array['CS-01','CS-02','CS-03','CS-04','CS-05','CS-06']),
  ('/project-media/' || 'sodic/caesar-north-coast/units/mp-ca2.webp','masterplan',0,array['CS-07','CS-08','CS-09']),
  ('/project-media/' || 'sodic/june-north-coast/units/mp-june.webp','masterplan',0,array['JN-01','JN-02','JN-03','JN-04','JN-05','JN-06','JN-07','JN-08','JN-09','JN-10']),
  ('/project-media/' || 'sodic/sodic-east/units/mp-sodic-east.webp','masterplan',0,array['SE-01','SE-02','SE-03','SE-04','SE-05','SE-06','SE-07','SE-08','SE-09','SE-10','SE-11','SE-12','SE-13','SE-14','SE-15']),
  ('/project-media/' || 'sodic/the-estates-residence/units/mp-the-eastates.webp','masterplan',0,array['TR-01','TR-02','TR-03','TR-04','TR-05','TR-06','TR-07','TR-08','TR-09','TR-10','TR-11','TR-12','TR-13','TR-14','TR-15','TR-16','TR-17','TR-18','TR-19','TR-20','TR-21','TR-22','TR-23','TR-24']),
  ('/project-media/' || 'sodic/the-estates-zayed/units/mp-the-estates.webp','masterplan',0,array['ES-01','ES-02','ES-03']),
  ('/project-media/' || 'sodic/villette/units/mp-villette.webp','masterplan',0,array['VL-01','VL-02','VL-03','VL-04','VL-05']),
  ('/project-media/' || 'sodic/westown-medical-center/units/mp-westown.webp','masterplan',0,array['WM-01','WM-02','WM-03','WM-04','WM-05','WM-06','WM-07','WM-08','WM-09','WM-10','WM-11']),
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
  ('/project-media/' || 'tatweer/open-salt-scape-masterplan.webp','masterplan',0,array['TM-SL-01','TM-SL-02','TM-SL-03']),
  ('/project-media/' || 'travco/makadina/units/mp-makadina.webp','masterplan',0,array['MK-01','MK-02','MK-03','MK-04','MK-05','MK-06','MK-07','MK-08','MK-09','MK-10']),
  ('/project-media/' || 'travco/marina-gate/units/mp-marina-gate.webp','masterplan',0,array['MG-01','MG-02','MG-03','MG-04','MG-05','MG-06','MG-07'])
) as v(path, role, sort_order, owners)
cross join lateral unnest(v.owners) as owner_code
join cms.media_assets a on a.path = v.path
join cms.units o on lower(o.unit_code) = lower(owner_code);
