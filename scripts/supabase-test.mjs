import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const a = "00000000-0000-0000-0000-000000000001";
const b = "00000000-0000-0000-0000-000000000002";
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated;
    insert into auth.users values ('${a}'), ('${b}');
  `);
  const migration = await fs.readFile("supabase/migrations/202610070001_fluen.sql", "utf8");
  await db.exec(migration);
  await db.exec(migration);
  async function asUser(id) {
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`);
  }
  await asUser(a);
  await db.query("insert into fluen_saved_words(user_id, language, word, meaning) values ($1, 'german', 'Hallo', 'hello')", [a]);
  await db.query("insert into fluen_writing_progress(user_id, exercise_key) values ($1, 'exercise-one') on conflict do nothing", [a]);
  await db.query("insert into fluen_writing_progress(user_id, exercise_key) values ($1, 'exercise-one') on conflict do nothing", [a]);
  assert.equal((await db.query("select * from fluen_writing_progress")).rows.length, 1);
  await assert.rejects(db.query("insert into fluen_saved_words(user_id, language, word, meaning) values ($1, 'german', 'No', 'no')", [b]), /row-level security/);
  await assert.rejects(db.query("update fluen_saved_words set user_id = $1", [b]), /row-level security/);
  await assert.rejects(db.query("insert into fluen_writing_progress(user_id, exercise_key) values ($1, 'forged')", [b]), /row-level security/);
  await asUser(b);
  assert.equal((await db.query("select * from fluen_saved_words")).rows.length, 0);
  assert.equal((await db.query("select * from fluen_writing_progress")).rows.length, 0);
  await db.query("delete from fluen_saved_words where user_id = $1", [a]);
  await db.query("update fluen_writing_progress set exercise_key = 'tampered' where user_id = $1", [a]);
  await db.query("insert into fluen_saved_words(user_id, language, word, meaning) values ($1, 'german', 'Hallo', 'hello again')", [b]);
  await db.exec("reset role; set role anon;");
  await assert.rejects(db.query("select * from fluen_saved_words"), /permission denied/);
  await assert.rejects(db.query("select * from fluen_writing_progress"), /permission denied/);
  await asUser(a);
  assert.equal((await db.query("select * from fluen_saved_words")).rows.length, 1);
  assert.equal((await db.query("select exercise_key from fluen_writing_progress")).rows[0].exercise_key, "exercise-one");
  await assert.rejects(db.query("insert into fluen_saved_words(user_id, language, word, meaning) values ($1, 'invalid', 'word', 'meaning')", [a]), /check constraint/);
  await db.exec("reset role;");
  await db.query("delete from auth.users where id = $1", [a]);
  assert.equal((await db.query("select * from fluen_writing_progress")).rows.length, 0);
  assert.equal((await db.query("select * from fluen_saved_words")).rows.length, 1);
  await db.exec(`
    create table public.profiles (id uuid);
    create function public.legacy_signup() returns trigger language plpgsql as
      $$ begin insert into public.profiles values (new.id); return new; end $$;
    create trigger legacy_signup after insert on auth.users for each row execute function public.legacy_signup();
    create function public.unrelated_signup() returns trigger language plpgsql as $$ begin return new; end $$;
    create trigger unrelated_signup after insert on auth.users for each row execute function public.unrelated_signup();
    create function public.check_username_available(text) returns boolean language sql as $$ select true $$;
  `);
  const cleanup = await fs.readFile("supabase/cleanup-legacy.sql", "utf8");
  await db.exec(cleanup);
  await db.exec(cleanup);
  const triggers = (await db.query("select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal")).rows.map(r => r.tgname);
  assert.deepEqual(triggers, ["unrelated_signup"]);
  await db.query("insert into auth.users values ($1)", [a]);
  assert.equal((await db.query("select * from auth.users")).rows.length, 2);
  assert.equal((await db.query("select * from fluen_saved_words")).rows.length, 1);
  console.log("PASS: schema reruns, per-user isolation, forged writes blocked, anonymous access blocked, duplicate progress, constraints, account deletion and legacy cleanup/signup safety.");
} finally { await db.close(); }
