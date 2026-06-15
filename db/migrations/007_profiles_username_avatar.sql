-- ============================================================
-- 007 — Public profile: username + avatar, and a ranking board
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- Adds a chosen, case-insensitively-unique `username` and an
-- `avatar_url` to profiles, an `avatars` Storage bucket for uploads,
-- and two SECURITY DEFINER helpers:
--   * check_username_available(text) — pre-flight check that works
--     under RLS (a user can't read other people's profiles).
--   * get_leaderboard() — public ranking of every named learner by
--     the number of words they've collected, again bypassing the
--     own-row RLS so everyone can see everyone on the board.
-- ============================================================

-- ------------------------------------------------------------
-- Profile columns
-- ------------------------------------------------------------
alter table profiles add column if not exists username   text;
alter table profiles add column if not exists avatar_url  text;

-- Case-insensitive uniqueness ("Anna" and "anna" collide), nulls allowed.
create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username))
  where username is not null;

-- ------------------------------------------------------------
-- Capture a username chosen at sign-up. The browser passes it as
-- auth metadata; the new-user trigger copies it onto the profile so
-- the email-confirmation flow (no client session yet) still works.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(trim(new.raw_user_meta_data->>'username'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Username availability check (RLS-safe, read-only)
-- ------------------------------------------------------------
create or replace function public.check_username_available(candidate text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(trim(candidate))
  );
$$;

grant execute on function public.check_username_available(text) to authenticated, anon;

-- ------------------------------------------------------------
-- Leaderboard — every named learner ranked by words collected.
-- Returns only public-facing fields, so it's safe to expose despite
-- the own-row RLS on profiles / user_words.
-- ------------------------------------------------------------
create or replace function public.get_leaderboard()
returns table (
  user_id         uuid,
  username        text,
  avatar_url      text,
  words_collected bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    p.avatar_url,
    count(uw.id) as words_collected
  from public.profiles p
  left join public.user_words uw on uw.user_id = p.id
  where p.username is not null
  group by p.id, p.username, p.avatar_url
  order by words_collected desc, lower(p.username) asc;
$$;

grant execute on function public.get_leaderboard() to authenticated, anon;

-- ------------------------------------------------------------
-- Avatar storage bucket + policies
-- Files live under `<user_id>/<filename>`, so the first path segment
-- is the owner — that's what the write policies check.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read"   on storage.objects;
drop policy if exists "avatars owner insert"  on storage.objects;
drop policy if exists "avatars owner update"  on storage.objects;
drop policy if exists "avatars owner delete"  on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
