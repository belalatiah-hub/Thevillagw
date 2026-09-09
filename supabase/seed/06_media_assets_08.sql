-- Every image path the site references, stored once.
insert into cms.media_assets (path) values
  ('/project-media/travco/marina-gate/units/v1-marina-gate-0.webp'),
  ('/project-media/travco/marina-gate/units/v1-marina-gate-1.webp'),
  ('/project-media/travco/marina-gate/units/v1-marina-gate-2.webp'),
  ('/project-media/travco/marina-gate/units/v1-marina-gate-3.webp')
on conflict (path) do nothing;
