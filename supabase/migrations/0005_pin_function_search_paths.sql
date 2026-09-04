-- The Village Investment — CMS content model, part 5 of 5.
--
-- Supabase's security linter flagged these two: a function without a pinned
-- search_path can be pointed at a caller-supplied schema. Both run inside
-- triggers and check constraints on every write, so they are pinned like the
-- rest. Part 1 now creates them pinned; this migration is what fixed the
-- already-deployed copies.
alter function cms.set_updated_at() set search_path = cms, public, pg_temp;
alter function cms.is_slug(text)    set search_path = cms, public, pg_temp;
