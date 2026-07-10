-- ============================================================
-- 008 — Onboarding: learning purpose + goal level
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- New users answer a short questionnaire (target language, current
-- level, why they're learning, goal level). The purpose personalises
-- what the AI generates — story style/register in Immerse, coach
-- scenarios in Speak, and the order curriculum themes unlock in — and
-- the goal level powers the dashboard progress bar.
--
--   * user_languages.purpose / goal_level — per language, because a
--     learner can study Mandarin for business and Spanish for travel.
--   * profiles.onboarded_at — stamped when the questionnaire finishes
--     (or is skipped) so it only ever shows once. Existing accounts
--     have it null, so they see the questionnaire once too.
-- ============================================================

alter table user_languages add column if not exists purpose text
  check (purpose in ('travel','business','exam','everyday','culture'));

alter table user_languages add column if not exists goal_level text
  check (goal_level in ('A1','A2','B1','B2','C1','C2'));

alter table profiles add column if not exists onboarded_at timestamptz;
