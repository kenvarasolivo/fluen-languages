-- ============================================================
-- 007 — Mandarin Chinese (Pinyin-first, Hanzi on top)
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- Mandarin is taught romanization-first: learners read and type Hanyu
-- Pinyin, with the Hanzi shown as an annotation above it. Words store
-- the Simplified characters in `lemma` (kept as the canonical/dedup key
-- and used for text-to-speech) and the tone-marked Pinyin in a new
-- `pinyin` column. The column is null for Latin-script languages.
-- ============================================================

alter table words add column if not exists pinyin text;
