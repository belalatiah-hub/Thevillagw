-- Where each image is attached. The path is written once and the owner
-- codes are unnested beside it. A link is only written when both the asset
-- and its owner exist, so a stale reference inserts nothing rather than
-- pointing at the wrong row.
insert into cms.media_links (asset_id, unit_id, role, sort_order)
select a.id, o.id, v.role::cms.media_role, v.sort_order
from (values
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
