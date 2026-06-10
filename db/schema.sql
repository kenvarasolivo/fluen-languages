-- ============================================================
-- FLEUN — Database Schema (Supabase / Postgres)
-- German-only at launch; `language` columns exist so a second
-- language is a data migration, not a schema migration.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ------------------------------------------------------------
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  target_language text not null default 'de',
  cefr_level      text not null default 'A1'
                  check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  new_cards_per_day int not null default 10,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Global German dictionary (shared, read-only to users)
-- Gender + plural are first-class: they ARE the hard part of
-- German vocabulary, so they live on the word, not in metadata.
-- ------------------------------------------------------------
create table words (
  id          uuid primary key default gen_random_uuid(),
  language    text not null default 'de',
  lemma       text not null,                  -- "Haus", "laufen"
  pos         text not null                   -- part of speech
              check (pos in ('noun','verb','adjective','adverb','preposition','conjunction','pronoun','particle','phrase')),
  gender      text check (gender in ('der','die','das')),   -- nouns only
  plural      text,                           -- "Häuser"
  meaning_en  text not null,
  ipa         text,
  cefr_level  text check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  frequency_rank int,                         -- for "new card" ordering
  audio_path  text,                           -- cached TTS in Supabase Storage
  unique (language, lemma, pos)
);

create index words_frequency_idx on words (language, frequency_rank);

-- ------------------------------------------------------------
-- Per-user SRS state (FSRS-5 fields, managed by ts-fsrs)
-- ------------------------------------------------------------
create table user_words (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  word_id       uuid not null references words(id) on delete cascade,

  -- FSRS card state
  state         smallint not null default 0,      -- 0 new, 1 learning, 2 review, 3 relearning
  due           timestamptz not null default now(),
  stability     real not null default 0,
  difficulty    real not null default 0,
  reps          int not null default 0,
  lapses        int not null default 0,
  last_review   timestamptz,

  -- Card content
  context_sentence text,                          -- AI-generated or captured from subtitles
  source_media_id  uuid,                          -- where the word was met (the Bridge)

  created_at    timestamptz not null default now(),
  unique (user_id, word_id)
);

create index user_words_due_idx on user_words (user_id, due) where state <> 0;
create index user_words_new_idx on user_words (user_id, created_at) where state = 0;

-- ------------------------------------------------------------
-- Review history (analytics + FSRS parameter optimization)
-- ------------------------------------------------------------
create table review_logs (
  id           uuid primary key default gen_random_uuid(),
  user_word_id uuid not null references user_words(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  rating       smallint not null check (rating between 1 and 4),  -- again/hard/good/easy
  state_before smallint not null,
  elapsed_days real not null,
  reviewed_at  timestamptz not null default now()
);

create index review_logs_user_idx on review_logs (user_id, reviewed_at);

-- ------------------------------------------------------------
-- Comprehensible Input: media + subtitle cues
-- ------------------------------------------------------------
create table media_items (
  id          uuid primary key default gen_random_uuid(),
  language    text not null default 'de',
  kind        text not null check (kind in ('video','podcast')),
  title       text not null,
  description text,
  difficulty  text not null check (difficulty in ('beginner','intermediate','advanced')),
  cefr_level  text check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  duration_s  int not null,
  source_url  text not null,                  -- Mux playback ID or audio URL
  thumb_path  text,
  published_at timestamptz not null default now()
);

create index media_items_feed_idx on media_items (language, difficulty, published_at desc);

-- One row per subtitle cue; tokens pre-split server-side so the
-- client can render clickable word spans without NLP in the browser.
create table media_cues (
  id        uuid primary key default gen_random_uuid(),
  media_id  uuid not null references media_items(id) on delete cascade,
  idx       int not null,
  start_ms  int not null,
  end_ms    int not null,
  text      text not null,
  tokens    jsonb not null,    -- [{ "t": "Häuser", "word_id": "uuid|null" }]
  unique (media_id, idx)
);

create index media_cues_time_idx on media_cues (media_id, start_ms);

create table user_media_progress (
  user_id     uuid not null references profiles(id) on delete cascade,
  media_id    uuid not null references media_items(id) on delete cascade,
  position_ms int not null default 0,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, media_id)
);

-- ------------------------------------------------------------
-- AI Coach: sessions + messages
-- ------------------------------------------------------------
create table chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  mode       text not null default 'text' check (mode in ('text','voice')),
  topic      text,
  started_at timestamptz not null default now()
);

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  -- Populated by /api/correct for user messages with mistakes:
  -- { "original": "...", "corrected": "...", "explanation": "..." }
  correction jsonb,
  created_at timestamptz not null default now()
);

create index chat_messages_session_idx on chat_messages (session_id, created_at);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles            enable row level security;
alter table user_words          enable row level security;
alter table review_logs         enable row level security;
alter table user_media_progress enable row level security;
alter table chat_sessions       enable row level security;
alter table chat_messages       enable row level security;
alter table words               enable row level security;
alter table media_items         enable row level security;
alter table media_cues          enable row level security;

-- Own-row access for user data
create policy "own profile"  on profiles            for all using (id = auth.uid());
create policy "own words"    on user_words          for all using (user_id = auth.uid());
create policy "own logs"     on review_logs         for all using (user_id = auth.uid());
create policy "own progress" on user_media_progress for all using (user_id = auth.uid());
create policy "own sessions" on chat_sessions       for all using (user_id = auth.uid());
create policy "own messages" on chat_messages       for all using (user_id = auth.uid());

-- Shared content: readable by any signed-in user, written via service role only
create policy "read words"  on words       for select using (auth.role() = 'authenticated');
create policy "read media"  on media_items for select using (auth.role() = 'authenticated');
create policy "read cues"   on media_cues  for select using (auth.role() = 'authenticated');
