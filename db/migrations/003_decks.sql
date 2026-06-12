-- ============================================================
-- Migration 003 — custom card decks
-- Non-destructive: run this in Supabase → SQL Editor if you
-- already have data and don't want to re-run schema.sql.
--
-- Users group their existing cards into named decks and review
-- a deck on its own in Foundations.
-- ============================================================

create table if not exists decks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index if not exists decks_user_idx on decks (user_id, created_at);

create table if not exists deck_cards (
  deck_id      uuid not null references decks(id) on delete cascade,
  user_word_id uuid not null references user_words(id) on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (deck_id, user_word_id)
);

alter table decks      enable row level security;
alter table deck_cards enable row level security;

drop policy if exists "own decks" on decks;
create policy "own decks" on decks for all using (user_id = auth.uid());

-- deck_cards has no user_id column — ownership flows through the deck.
drop policy if exists "own deck cards" on deck_cards;
create policy "own deck cards" on deck_cards for all
  using (
    exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid())
  )
  with check (
    exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid())
  );
