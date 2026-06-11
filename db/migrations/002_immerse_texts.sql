-- ============================================================
-- Migration 002 — saved Immerse texts
-- Non-destructive: run this in Supabase → SQL Editor if you
-- already have data and don't want to re-run schema.sql.
--
-- Generated stories/dialogs are saved per user so they survive
-- reloads; users can delete them to free up space.
-- ============================================================

create table if not exists immerse_texts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  kind       text not null check (kind in ('story','dialog')),
  level      text not null check (level in ('A1','A2','B1','B2','C1')),
  title      text not null,
  lines      jsonb not null,          -- [{speaker, text_de, text_en}, ...]
  created_at timestamptz not null default now()
);

create index if not exists immerse_texts_user_idx
  on immerse_texts (user_id, created_at desc);

alter table immerse_texts enable row level security;

drop policy if exists "own texts" on immerse_texts;
create policy "own texts" on immerse_texts for all using (user_id = auth.uid());
