-- ============================================================
-- 006 — Multi-language: each language is its own environment
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
--
-- Adds Spanish (and any future language) alongside German. Every
-- learning surface — cards, decks, immerse texts, conversations and
-- the CEFR level — is keyed by language so switching language swaps
-- the whole environment (Duolingo-style), nothing bleeds across.
--
--   * profiles.target_language already holds the ACTIVE language.
--   * user_languages stores the per-language CEFR level, so a learner
--     can be B1 in German and A1 in Spanish at the same time.
--   * decks / immerse_texts / chat_sessions get a `language` column so
--     each is scoped to the environment it was created in.
--   * words.gender drops its German-only check (Spanish uses el/la).
-- ============================================================

-- ------------------------------------------------------------
-- Per-language learner state (CEFR level per language)
-- ------------------------------------------------------------
create table if not exists user_languages (
  user_id    uuid not null references profiles(id) on delete cascade,
  language   text not null,
  cefr_level text not null default 'A1'
             check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  primary key (user_id, language)
);

alter table user_languages enable row level security;

drop policy if exists "own languages" on user_languages;
create policy "own languages" on user_languages for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Backfill: every existing learner keeps their current level under the
-- language they were learning (defaults to German).
insert into user_languages (user_id, language, cefr_level)
  select id, coalesce(target_language, 'de'), coalesce(cefr_level, 'A1')
  from profiles
  on conflict (user_id, language) do nothing;

-- ------------------------------------------------------------
-- Scope each environment-bound table to a language
-- ------------------------------------------------------------
alter table decks         add column if not exists language text not null default 'de';
alter table immerse_texts add column if not exists language text not null default 'de';
alter table chat_sessions add column if not exists language text not null default 'de';

create index if not exists decks_user_lang_idx
  on decks (user_id, language, created_at);
create index if not exists immerse_texts_user_lang_idx
  on immerse_texts (user_id, language, created_at desc);
create index if not exists chat_sessions_user_lang_idx
  on chat_sessions (user_id, language, started_at desc);

-- ------------------------------------------------------------
-- The shared dictionary is already keyed by `language`; only its
-- German-only gender check needs to go (Spanish nouns are el/la, and
-- future languages bring their own articles).
-- ------------------------------------------------------------
alter table words drop constraint if exists words_gender_check;
