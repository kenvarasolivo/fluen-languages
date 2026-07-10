-- ============================================================
-- FLUEN — Database Schema (Supabase / Postgres)
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to re-run: drops and recreates everything.
--
-- Requires: Authentication → Sign In / Providers →
--           "Allow anonymous sign-ins" = ON
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists immerse_texts cascade;
drop table if exists chat_messages cascade;
drop table if exists chat_sessions cascade;
drop table if exists user_media_progress cascade;
drop table if exists media_cues cascade;
drop table if exists media_items cascade;
drop table if exists deck_cards cascade;
drop table if exists decks cascade;
drop table if exists review_logs cascade;
drop table if exists user_languages cascade;
drop table if exists user_words cascade;
drop table if exists words cascade;
drop table if exists profiles cascade;

-- ------------------------------------------------------------
-- Profiles (1:1 with auth.users, auto-created on sign-in)
-- ------------------------------------------------------------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  username        text,                  -- chosen public handle (unique, case-insensitive)
  avatar_url      text,                  -- public URL into the `avatars` storage bucket
  target_language text not null default 'de',
  cefr_level      text not null default 'A1'
                  check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  new_cards_per_day int not null default 10,

  -- Guest (anonymous-session) usage counters. Only enforced while the
  -- user is anonymous; registered accounts are unlimited.
  usage_foundations int not null default 0,
  usage_immerse     int not null default 0,
  usage_chat        int not null default 0,

  -- Stamped when the first-run questionnaire finishes (or is skipped).
  onboarded_at    timestamptz,

  created_at      timestamptz not null default now()
);

-- Case-insensitive uniqueness for usernames ("Anna" == "anna"), nulls allowed.
create unique index profiles_username_lower_idx
  on profiles (lower(username))
  where username is not null;

-- Auto-create a profile row for every new auth user (incl. anonymous).
-- A username chosen at sign-up arrives as auth metadata and is copied
-- across here so the email-confirmation flow (no client session yet)
-- still records it.
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Per-language learner state. Each language is its own environment,
-- so the CEFR level is tracked per (user, language): a learner can be
-- B1 in German and A1 in Spanish at once. profiles.target_language
-- holds whichever one is currently active.
-- ------------------------------------------------------------
create table user_languages (
  user_id    uuid not null references profiles(id) on delete cascade,
  language   text not null,
  cefr_level text not null default 'A1'
             check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  -- From onboarding: why they're learning (drives AI personalisation)
  -- and the level they want to reach (drives the dashboard progress bar).
  purpose    text check (purpose in ('travel','business','exam','everyday','culture')),
  goal_level text check (goal_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  primary key (user_id, language)
);

-- ------------------------------------------------------------
-- Shared multi-language dictionary. AI-generated entries are inserted
-- by signed-in users; rows are shared/deduplicated by language+lemma+pos.
-- ------------------------------------------------------------
create table words (
  id          uuid primary key default gen_random_uuid(),
  language    text not null default 'de',
  lemma       text not null,                  -- "Haus", "laufen", "casa", "你好"
  pinyin      text,                           -- romanization for non-Latin scripts (Mandarin Pinyin: "nǐ hǎo")
  pos         text not null,                  -- noun / verb / adjective / ...
  gender      text,                           -- nouns only: der/die/das, el/la, ...
  plural      text,                           -- "Häuser"
  meaning_en  text not null,
  cefr_level  text check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  audio_path  text,                           -- cached TTS (later)
  created_at  timestamptz not null default now(),
  unique (language, lemma, pos)
);

-- ------------------------------------------------------------
-- Per-user SRS state (ts-fsrs card fields)
-- ------------------------------------------------------------
create table user_words (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  word_id        uuid not null references words(id) on delete cascade,

  -- FSRS card state (mirrors ts-fsrs Card)
  state          smallint not null default 0,     -- 0 new, 1 learning, 2 review, 3 relearning
  due            timestamptz not null default now(),
  stability      real not null default 0,
  difficulty     real not null default 0,
  elapsed_days   real not null default 0,
  scheduled_days real not null default 0,
  reps           int not null default 0,
  lapses         int not null default 0,
  last_review    timestamptz,

  -- Card content
  context_sentence    text,    -- German example (AI or captured from Immerse)
  context_translation text,    -- English translation of the example
  source              text not null default 'generated'
                      check (source in ('generated','immerse')),

  created_at     timestamptz not null default now(),
  unique (user_id, word_id)
);

create index user_words_due_idx on user_words (user_id, due);

-- ------------------------------------------------------------
-- Custom card decks (user-named groups of existing cards)
-- ------------------------------------------------------------
create table decks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  language   text not null default 'de',
  name       text not null,
  created_at timestamptz not null default now()
);

create index decks_user_idx on decks (user_id, language, created_at);

create table deck_cards (
  deck_id      uuid not null references decks(id) on delete cascade,
  user_word_id uuid not null references user_words(id) on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (deck_id, user_word_id)
);

-- ------------------------------------------------------------
-- Review history
-- ------------------------------------------------------------
create table review_logs (
  id           uuid primary key default gen_random_uuid(),
  user_word_id uuid not null references user_words(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 4),
  state_before smallint not null,
  reviewed_at  timestamptz not null default now()
);

create index review_logs_user_idx on review_logs (user_id, reviewed_at);

-- ------------------------------------------------------------
-- Comprehensible Input (curated media — for the post-demo phase)
-- ------------------------------------------------------------
create table media_items (
  id          uuid primary key default gen_random_uuid(),
  language    text not null default 'de',
  kind        text not null check (kind in ('video','podcast')),
  title       text not null,
  description text,
  difficulty  text not null check (difficulty in ('beginner','intermediate','advanced')),
  duration_s  int not null,
  source_url  text not null,
  published_at timestamptz not null default now()
);

create table media_cues (
  id        uuid primary key default gen_random_uuid(),
  media_id  uuid not null references media_items(id) on delete cascade,
  idx       int not null,
  start_ms  int not null,
  end_ms    int not null,
  text      text not null,
  tokens    jsonb not null,
  unique (media_id, idx)
);

create table user_media_progress (
  user_id     uuid not null references profiles(id) on delete cascade,
  media_id    uuid not null references media_items(id) on delete cascade,
  position_ms int not null default 0,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, media_id)
);

-- ------------------------------------------------------------
-- AI Coach history
-- ------------------------------------------------------------
create table chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  language   text not null default 'de',
  mode       text not null default 'text' check (mode in ('text','voice')),
  started_at timestamptz not null default now()
);

create index chat_sessions_user_lang_idx
  on chat_sessions (user_id, language, started_at desc);

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  correction jsonb,
  created_at timestamptz not null default now()
);

create index chat_messages_session_idx on chat_messages (session_id, created_at);

-- ------------------------------------------------------------
-- Saved Immerse texts (generated stories/dialogs, deletable)
-- ------------------------------------------------------------
create table immerse_texts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  language   text not null default 'de',
  kind       text not null check (kind in ('story','dialog')),
  level      text not null check (level in ('A1','A2','B1','B2','C1')),
  title      text not null,
  lines      jsonb not null,          -- [{speaker, text_de, text_en}, ...]
  created_at timestamptz not null default now()
);

create index immerse_texts_user_idx on immerse_texts (user_id, language, created_at desc);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles            enable row level security;
alter table user_languages      enable row level security;
alter table words               enable row level security;
alter table user_words          enable row level security;
alter table decks               enable row level security;
alter table deck_cards          enable row level security;
alter table review_logs         enable row level security;
alter table media_items         enable row level security;
alter table media_cues          enable row level security;
alter table user_media_progress enable row level security;
alter table chat_sessions       enable row level security;
alter table chat_messages       enable row level security;
alter table immerse_texts       enable row level security;

-- Own-row access for user data
create policy "own profile"  on profiles            for all using (id = auth.uid());
create policy "own languages" on user_languages     for all using (user_id = auth.uid());
create policy "own words"    on user_words          for all using (user_id = auth.uid());
create policy "own decks"    on decks               for all using (user_id = auth.uid());
-- deck_cards has no user_id column — ownership flows through the deck.
create policy "own deck cards" on deck_cards for all
  using (
    exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid())
  )
  with check (
    exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid())
  );
create policy "own logs"     on review_logs         for all using (user_id = auth.uid());
create policy "own progress" on user_media_progress for all using (user_id = auth.uid());
create policy "own sessions" on chat_sessions       for all using (user_id = auth.uid());
create policy "own messages" on chat_messages       for all using (user_id = auth.uid());
create policy "own texts"    on immerse_texts       for all using (user_id = auth.uid());

-- Dictionary: readable by all signed-in users; AI-generated entries
-- may be inserted (but never modified/deleted) from the client.
create policy "read words"   on words for select using (auth.role() = 'authenticated');
create policy "insert words" on words for insert with check (auth.role() = 'authenticated');

-- Curated media: read-only from the client (service role writes)
create policy "read media" on media_items for select using (auth.role() = 'authenticated');
create policy "read cues"  on media_cues  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Public-profile helpers (SECURITY DEFINER — bypass the own-row RLS
-- above so username availability can be checked across accounts).
-- ------------------------------------------------------------

-- Pre-flight check used by registration + the profile editor.
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
-- Avatar storage bucket + policies. Files live under
-- `<user_id>/<filename>`, so the first path segment is the owner.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read"  on storage.objects;
drop policy if exists "avatars owner insert" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
