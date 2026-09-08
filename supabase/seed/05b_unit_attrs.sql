-- `lvl` and `roof` have no column of their own; they ride in attrs.
update cms.units u set attrs = v.attrs::jsonb
from (values
  ('MV-D14','{"lvl": 2}'),
  ('IB-V05','{"lvl": 2}'),
  ('HP-P03','{"roof": true}'),
  ('CS-TH1','{"lvl": 2}'),
  ('CS-TW1','{"lvl": 2}')
) as v(unit_code, attrs)
where lower(u.unit_code) = lower(v.unit_code);
