begin;

create table if not exists public.fluen_saved_words (
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null check (language in ('german', 'chinese')),
  word text not null check (length(word) between 1 and 500),
  meaning text not null check (length(meaning) between 1 and 2000),
  created_at timestamptz not null default now(),
  primary key (user_id, language, word)
);

create table if not exists public.fluen_writing_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_key text not null check (length(exercise_key) between 1 and 10000),
  completed_at timestamptz not null default now(),
  primary key (user_id, exercise_key)
);

alter table public.fluen_saved_words enable row level security;
alter table public.fluen_writing_progress enable row level security;

revoke all on public.fluen_saved_words, public.fluen_writing_progress from anon;
grant select, insert, update, delete on public.fluen_saved_words, public.fluen_writing_progress to authenticated;
grant all on public.fluen_saved_words, public.fluen_writing_progress to service_role;

drop policy if exists fluen_words_owner on public.fluen_saved_words;
create policy fluen_words_owner on public.fluen_saved_words for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists fluen_progress_owner on public.fluen_writing_progress;
create policy fluen_progress_owner on public.fluen_writing_progress for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
commit;
