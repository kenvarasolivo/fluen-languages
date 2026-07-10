-- ============================================================
-- 010 — Auto-purge stale guest accounts
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- Every guest visit creates an anonymous auth user (that's what lets
-- the server enforce guest quotas), and its rows linger if the guest
-- never returns. This schedules a nightly job that deletes anonymous
-- users older than 7 days; the FK cascade removes their profiles,
-- user_languages, cards, texts and chats. Returning guests keep
-- working within the 7-day window (their session cookie maps to the
-- same anonymous user). Registered accounts are never touched.
-- ============================================================

create extension if not exists pg_cron;

select cron.schedule(
  'purge-stale-guests',
  '0 3 * * *',  -- daily, 03:00 UTC
  $$
    delete from auth.users
    where is_anonymous
      and created_at < now() - interval '7 days'
  $$
);
