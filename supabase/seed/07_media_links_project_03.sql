-- Where each image is attached. The path is written once and the owner
-- codes are unnested beside it. A link is only written when both the asset
-- and its owner exist, so a stale reference inserts nothing rather than
-- pointing at the wrong row.
insert into cms.media_links (asset_id, project_id, role, sort_order)
select a.id, o.id, v.role::cms.media_role, v.sort_order
from (values
  ('/logos/projects/ogami.webp','logo',0,array['ogami-north-coast']),
  ('/logos/projects/sodic-east.webp','logo',0,array['sodic-east']),
  ('/logos/projects/the-estates.webp','logo',0,array['the-estates-zayed']),
  ('/logos/projects/villette.webp','logo',0,array['villette']),
  ('/project-media/' || 'emaarmisr/marassi-red-sea/units/masterplan.webp','masterplan',0,array['marassi-red-sea']),
  ('/project-media/' || 'marakez/shams-soma/masterplan.webp','masterplan',0,array['shams-soma']),
  ('/project-media/' || 'msquared/masyaf-masterplan.webp','masterplan',0,array['masyaf-ras-alhekma']),
  ('/project-media/' || 'msquared/mist-masterplan.webp','masterplan',0,array['mist-new-cairo']),
  ('/project-media/' || 'msquared/trio-masterplan.webp','masterplan',0,array['trio-new-cairo']),
  ('/project-media/' || 'msquared/w31-masterplan.webp','masterplan',0,array['31-west-october']),
  ('/project-media/' || 'orascom/ledge-valley/masterplan.webp','masterplan',0,array['ledge-valley']),
  ('/project-media/' || 'orascom/makadi-heights/plans/masterplan.webp','masterplan',0,array['makadi-heights']),
  ('/project-media/' || 'orascom/siyal/masterplan.webp','masterplan',0,array['siyal']),
  ('/project-media/' || 'qataridiar/alam-al-roum/masterplan.webp','masterplan',0,array['alam-al-roum'])
) as v(path, role, sort_order, owners)
cross join lateral unnest(v.owners) as owner_code
join cms.media_assets a on a.path = v.path
join cms.projects o on lower(o.slug) = lower(owner_code);
