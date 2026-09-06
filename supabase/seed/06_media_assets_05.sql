-- Every image path the site references, stored once.
insert into cms.media_assets (path) values
  ('/project-media/tatweer/tm-th1-il-01.webp'),
  ('/project-media/tatweer/tm-th1-il-02.webp'),
  ('/project-media/tatweer/tw-dbay-0.webp'),
  ('/project-media/tatweer/tw-dbay-01.webp'),
  ('/project-media/tatweer/tw-dbay-02.webp'),
  ('/project-media/tatweer/tw-sc-0.webp'),
  ('/project-media/tatweer/tw-sc-01.webp'),
  ('/project-media/tatweer/tw-sc-02.webp'),
  ('/project-media/tatweer/villa-210-scenes-first-floor.webp'),
  ('/project-media/tatweer/villa-second-floor-scenes.webp'),
  ('/project-media/the-estates/apartment.webp'),
  ('/project-media/the-estates/villa.webp'),
  ('/project-media/villette/apartment.webp'),
  ('/project-media/villette/i-villa.webp'),
  ('/project-media/villette/town-house.webp')
on conflict (path) do nothing;
