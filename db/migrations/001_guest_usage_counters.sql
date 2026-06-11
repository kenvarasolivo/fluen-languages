-- ============================================================
-- Migration 001 — guest usage counters
-- Non-destructive: run this in Supabase → SQL Editor if you
-- already have data and don't want to re-run schema.sql.
--
-- Also required (Supabase dashboard, not SQL):
--   Authentication → Sign In / Providers
--     · "Allow anonymous sign-ins" = ON   (guest mode)
--     · Email provider = ON               (login / registration)
-- ============================================================

alter table profiles
  add column if not exists usage_foundations int not null default 0,
  add column if not exists usage_immerse     int not null default 0,
  add column if not exists usage_chat        int not null default 0;
