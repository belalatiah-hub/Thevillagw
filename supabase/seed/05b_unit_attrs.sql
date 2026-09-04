-- `lvl` and `roof` have no column of their own; they ride in attrs.
update cms.units u set attrs = v.attrs::jsonb
from (values
  ('V-TH22','{"lvl": 2}'),
  ('SE-T12','{"lvl": 2}'),
  ('ET-D07','{"lvl": 2}'),
  ('AL-V03','{"lvl": 2}'),
  ('AL-TW6','{"lvl": 2}'),
  ('MV-D14','{"lvl": 2}'),
  ('IB-V05','{"lvl": 2}'),
  ('HP-P03','{"roof": true}'),
  ('VL-IV3','{"lvl": 3}'),
  ('AL-TV2','{"lvl": 2}'),
  ('CS-TH1','{"lvl": 2}'),
  ('CS-TW1','{"lvl": 2}')
) as v(unit_code, attrs)
where lower(u.unit_code) = lower(v.unit_code);
