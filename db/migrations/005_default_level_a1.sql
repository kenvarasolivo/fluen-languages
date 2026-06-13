-- ============================================================
-- 005 — Start learners at A1
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- The curriculum runs A1 → C1, so new accounts should begin at the
-- bottom. Existing rows are left untouched — change your own level
-- with the picker in Foundations.
-- ============================================================

alter table profiles alter column cefr_level set default 'A1';

-- Clean up core function words mistakenly seeded at B1+ before core was
-- restricted to A1/A2. Cascades to any cards drawn from them.
delete from words
where theme = 'core'
  and freq_rank is not null
  and cefr_level in ('B1', 'B2', 'C1', 'C2');
