-- Where each image is attached. The path is written once and the owner
-- codes are unnested beside it. A link is only written when both the asset
-- and its owner exist, so a stale reference inserts nothing rather than
-- pointing at the wrong row.
insert into cms.media_links (asset_id, developer_id, role, sort_order)
select a.id, o.id, v.role::cms.media_role, v.sort_order
from (values
  ('/project-media/' || 'orascom/portfolio/taba-heights.webp','gallery',2,array['orascom']),
  ('/project-media/' || 'orascom/portfolio/uae.webp','gallery',9,array['orascom']),
  ('/project-media/' || 'orascom/portfolio/west-carclaze.webp','gallery',10,array['orascom']),
  ('/project-media/' || 'sodic/caesar.webp','gallery',4,array['sodic']),
  ('/project-media/' || 'sodic/eastown.webp','gallery',2,array['sodic']),
  ('/project-media/' || 'sodic/ogami.webp','gallery',5,array['sodic']),
  ('/project-media/' || 'sodic/sodic-west.webp','gallery',0,array['sodic']),
  ('/project-media/' || 'sodic/the-estates.webp','gallery',1,array['sodic']),
  ('/project-media/' || 'sodic/villette.webp','gallery',3,array['sodic']),
  ('/project-media/' || 'sumou/ap2-03.webp','gallery',4,array['sumou']),
  ('/project-media/' || 'sumou/ap5-0.webp','gallery',2,array['sumou']),
  ('/project-media/' || 'sumou/of4.webp','gallery',5,array['sumou']),
  ('/project-media/' || 'sumou/st-01.webp','gallery',1,array['sumou']),
  ('/project-media/' || 'sumou/st-02.webp','gallery',3,array['sumou']),
  ('/project-media/' || 'sumou/st-03.webp','gallery',0,array['sumou']),
  ('/logos/al-ahly-sabbour.webp','logo',0,array['alahlysabbour']),
  ('/logos/al-marasem.webp','logo',0,array['marasem']),
  ('/logos/beit-al-bahr.webp','logo',0,array['beitalbahr']),
  ('/logos/city-edge.webp','logo',0,array['cityedge']),
  ('/logos/elmasria-group.webp','logo',0,array['elmasria']),
  ('/logos/emaar-misr.webp','logo',0,array['emaarmisr']),
  ('/logos/hassan-allam.webp','logo',0,array['hassanallam']),
  ('/logos/hyde-park.webp','logo',0,array['hydepark']),
  ('/logos/il-cazar.webp','logo',0,array['ilcazar']),
  ('/logos/inertia.webp','logo',0,array['inertia']),
  ('/logos/la-vista.webp','logo',0,array['lavista']),
  ('/logos/lmd.webp','logo',0,array['lmd']),
  ('/logos/m-squared.webp','logo',0,array['msquared']),
  ('/logos/madinet-masr.webp','logo',0,array['madinetmasr']),
  ('/logos/marakez.webp','logo',0,array['marakez']),
  ('/logos/marsa-baghush.webp','logo',0,array['baghush']),
  ('/logos/misr-italia.webp','logo',0,array['misritalia']),
  ('/logos/modon.webp','logo',0,array['modon']),
  ('/logos/mountain-view.webp','logo',0,array['mountainview']),
  ('/logos/ora.webp','logo',0,array['ora']),
  ('/logos/orascom.webp','logo',0,array['orascom']),
  ('/logos/palm-hills.webp','logo',0,array['palmhills']),
  ('/logos/qatari-diar.webp','logo',0,array['qataridiar']),
  ('/logos/saudi-egyptian.webp','logo',0,array['saudiegyptian']),
  ('/logos/sodic.webp','logo',0,array['sodic']),
  ('/logos/sumou.webp','logo',0,array['sumou']),
  ('/logos/tatweer-misr.webp','logo',0,array['tatweer']),
  ('/logos/tmg.webp','logo',0,array['tmg']),
  ('/logos/travco.webp','logo',0,array['travco']),
  ('/project-media/' || 'baghush/masterplan-coded.webp','masterplan',0,array['baghush']),
  ('/project-media/' || 'beitalbahr/masterplan.webp','masterplan',0,array['beitalbahr']),
  ('/project-media/' || 'marakez/d5-masterplan.webp','masterplan',0,array['marakez']),
  ('/project-media/' || 'modon/masterplan.webp','masterplan',0,array['modon']),
  ('/project-media/' || 'mountainview/projects-map.webp','masterplan',0,array['mountainview']),
  ('/project-media/' || 'ora/brochure/silversands-aerial.webp','masterplan',0,array['ora']),
  ('/project-media/' || 'sodic/where-we-operate.webp','masterplan',0,array['sodic']),
  ('/project-media/' || 'sumou/mp-s.webp','masterplan',0,array['sumou'])
) as v(path, role, sort_order, owners)
cross join lateral unnest(v.owners) as owner_code
join cms.media_assets a on a.path = v.path
join cms.developers o on lower(o.slug) = lower(owner_code);
