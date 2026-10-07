-- Run after the Fluen migration and a backup. Only the inspected old app's
-- tables are removed. Existing Supabase Auth users and Storage are preserved.
begin;

-- Old signup hooks that insert into profiles would break signup after cleanup.
-- Remove only auth.users triggers whose function references that old table.
do $$
declare hook record;
begin
  for hook in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
      and pg_get_functiondef(p.oid) ~* '\mprofiles\M'
  loop
    execute format('drop trigger %I on auth.users', hook.tgname);
  end loop;
end $$;

drop table if exists public.review_logs, public.deck_cards,
  public.chat_messages, public.user_media_progress, public.user_words,
  public.immerse_texts, public.user_languages, public.media_cues,
  public.chat_sessions, public.decks, public.media_items,
  public.words, public.profiles cascade;

-- Old RPC is unrelated to the new email/password login flow.
do $$
declare old_function record;
begin
  for old_function in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'check_username_available'
  loop
    execute format('drop function %s', old_function.signature);
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;
