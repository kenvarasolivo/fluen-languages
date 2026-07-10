-- ============================================================
-- 009 — Remove the ranking feature
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- The ranking page is gone from the app; drop its SECURITY DEFINER
-- helper so no anonymous caller can enumerate learners any more.
-- Usernames and avatars stay — they're part of the profile.
-- ============================================================

drop function if exists public.get_leaderboard();
