-- ============================================================
-- 004 — Curriculum metadata on the shared dictionary
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- Turns `words` into an ordered A1–C1 master catalog: each
-- curriculum word carries a CEFR `theme` and a `freq_rank`
-- (lower = more useful / learned earlier). Example sentences
-- live here too so a drawn card has context without a per-draw
-- AI call. Rows WITHOUT freq_rank (e.g. Immerse lookups) are
-- ignored by curriculum draws.
-- ============================================================

alter table words add column if not exists theme      text;
alter table words add column if not exists freq_rank   int;
alter table words add column if not exists example_de  text;
alter table words add column if not exists example_en  text;

-- Fast lookup of the next words in a level, core-first then by rank.
create index if not exists words_curriculum_idx
  on words (language, cefr_level, theme, freq_rank)
  where freq_rank is not null;
