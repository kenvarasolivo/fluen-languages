-- ============================================================
-- FLEUN — Database Schema (Supabase / Postgres)
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to re-run: drops and recreates everything.
--
-- Requires: Authentication → Sign In / Providers →
--           "Allow anonymous sign-ins" = ON
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists chat_messages cascade;
drop table if exists chat_sessions cascade;
drop table if exists user_media_progress cascade;
drop table if exists media_cues cascade;
drop table if exists media_items cascade;
drop table if exists review_logs cascade;
drop table if exists user_words cascade;
drop table if exists words cascade;
drop table if exists profiles cascade;

-- ------------------------------------------------------------
-- Profiles (1:1 with auth.users, auto-created on sign-in)
-- ------------------------------------------------------------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  target_language text not null default 'de',
  cefr_level      text not null default 'B1'
                  check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  new_cards_per_day int not null default 10,

  -- Guest (anonymous-session) usage counters. Only enforced while the
  -- user is anonymous; registered accounts are unlimited.
  usage_foundations int not null default 0,
  usage_immerse     int not null default 0,
  usage_chat        int not null default 0,

  created_at      timestamptz not null default now()
);

-- Auto-create a profile row for every new auth user (incl. anonymous)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- German dictionary. AI-generated entries are inserted by
-- signed-in users; rows are shared/deduplicated by lemma+pos.
-- ------------------------------------------------------------
create table words (
  id          uuid primary key default gen_random_uuid(),
  language    text not null default 'de',
  lemma       text not null,                  -- "Haus", "laufen"
  pos         text not null,                  -- noun / verb / adjective / ...
  gender      text check (gender in ('der','die','das')),   -- nouns only
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
  mode       text not null default 'text' check (mode in ('text','voice')),
  started_at timestamptz not null default now()
);

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
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles            enable row level security;
alter table words               enable row level security;
alter table user_words          enable row level security;
alter table review_logs         enable row level security;
alter table media_items         enable row level security;
alter table media_cues          enable row level security;
alter table user_media_progress enable row level security;
alter table chat_sessions       enable row level security;
alter table chat_messages       enable row level security;

-- Own-row access for user data
create policy "own profile"  on profiles            for all using (id = auth.uid());
create policy "own words"    on user_words          for all using (user_id = auth.uid());
create policy "own logs"     on review_logs         for all using (user_id = auth.uid());
create policy "own progress" on user_media_progress for all using (user_id = auth.uid());
create policy "own sessions" on chat_sessions       for all using (user_id = auth.uid());
create policy "own messages" on chat_messages       for all using (user_id = auth.uid());

-- Dictionary: readable by all signed-in users; AI-generated entries
-- may be inserted (but never modified/deleted) from the client.
create policy "read words"   on words for select using (auth.role() = 'authenticated');
create policy "insert words" on words for insert with check (auth.role() = 'authenticated');

-- Curated media: read-only from the client (service role writes)
create policy "read media" on media_items for select using (auth.role() = 'authenticated');
create policy "read cues"  on media_cues  for select using (auth.role() = 'authenticated');
