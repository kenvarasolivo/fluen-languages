# Fluen

An output-first language learning app for writing and conversation. German and Mandarin Chinese (pinyin only) are available now. Supabase email/password accounts store saved vocabulary and writing progress across devices. Guests can practice with browser storage.

## Brand

**Fluen — Language in action.** An output-first language learning app. The promise: turn what you know into what you can say. Every practice session asks learners to produce language through writing or conversation, understand their feedback, and use what they learn in the next attempt. The brand speaks to language learners broadly; German and Mandarin Chinese (pinyin only) are available. Keep current availability explicit.

The interface uses bold sky-blue backgrounds, rounded panels, tactile buttons, and expressive illustrated characters. The selling point is active language learning through output: learn by writing, speaking, and applying feedback. Conversation supports spoken dictation and typed replies; pronunciation is not assessed.

Correct answers get a cheerful character bounce and confetti celebration. Incorrect answers get a gentle movement, encouraging guidance, and a retry of the same sentence. There are no points, streaks, game levels, or win/loss counters. Animations respect reduced-motion preferences. Illustration prompts and generation details live in `docs/illustrations.md`.

## Run

`npm install`, then `npm run dev`. Open http://localhost:3000.

Keep `GEMINI_API_KEY` in `.env.local` or `.env`. Optional `GEMINI_MODEL` overrides the default `gemini-3.1-flash-lite`, configured for minimal thinking. Existing environment files are preserved; keys stay on the server. Temporary upstream 503/504 errors are retried once, using the same Lite model. Quota errors are not retried, and there is no fallback to Flash or Pro.

## Practice

- `/` — landing page
- `/write` — English-to-German or Chinese pinyin translation, A1–C2, six topics, single sentences or two ideas joined with a connector. Hints, model translations, and AI corrections that accept valid alternatives.
- `/speak` — German or Chinese pinyin AI chat, per-message corrections, optional English translations, microphone dictation, and German read-aloud.
- `/words` — vocabulary with search, playback, and removal; synced to Supabase when signed in.
- `/login` — email/password sign-in and account creation.

Microphone input uses browser SpeechRecognition, usually available in Chrome/Edge. It needs microphone permission and HTTPS or localhost. The browser/provider may process speech remotely. Dictation creates editable text; send it to receive feedback. Read-aloud uses browser speech synthesis, and German voice quality depends on installed voices. Conversation is turn-based; pronunciation is not assessed.

Writing practice uses a preloaded German bank of 144 authored sentences and 144 two-idea exercises, plus a Chinese pinyin bank of 72 sentences and 144 two-idea exercises across all six levels and topics. Each connected pool includes “and,” “but,” “because,” and “although,” with authored reasons and contrasts that fit the topic. The prompt names the required connector meaning, hints show the target connector and word order, and AI checking accepts equivalent connectors while requiring the requested relationship. Questions, hints, vocabulary and model translations work without an API key. Reroll instantly replaces the question, clears the current attempt and animates the new prompt (respecting reduced-motion preferences). Prompts do not repeat within the selected pool until all have been seen; exhausted pools revisit the least recently seen question. The sentence API also uses this bank without calling Gemini.

Writing practice offers two explicit options: **Check myself** instantly reveals the authored model answer and vocabulary for learners to compare with their own writing, without grading or any API call; **Check with AI** requests correctness feedback and corrections. Manual checking allows retrying the same sentence or moving on, and Ctrl/Cmd + Enter reveals the model answer. The check API requires `useAI: true` before an unmatched answer can reach Gemini; model-answer matches still use its free deterministic shortcut. Conversation also uses Gemini. AI failures show error messages and retry paths. Guest vocabulary belongs to this browser and is lost if its storage is cleared. Signed-in vocabulary and writing progress are saved to the user?s Supabase account.

The vocabulary section explains every word in sentence order, including pronouns, articles, connectors and grammatical particles. Built-in exercises use authored contextual meanings; AI feedback and chat are instructed to provide the same complete breakdown. Chinese model answers and AI feedback show correct pinyin tone marks even when the learner's accepted answer omits them.

Select Chinese (pinyin) in practice settings for Mandarin written entirely in Latin pinyin. Checking ignores missing or incorrect tone marks, optional tone numbers, punctuation, capitalization and syllable spacing. Type ü as u, v or u: on a standard keyboard. The same rules apply to AI feedback on alternative answers and chat messages. Chinese voice features are disabled because browser speech services do not reliably support pinyin text. Saved words retain their language; older saved words default to German.

## Supabase setup

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. The browser uses the anon key and the signed-in user's token. Row-level security restricts every record to its owner. Keep the service-role key server-side; never give it a `NEXT_PUBLIC_` prefix.

Run `supabase/migrations/202610070001_fluen.sql` in Supabase SQL Editor to create the two Fluen tables and access policies. Enable Email authentication and configure the Site URL and allowed redirect URLs for the app's addresses, including `http://localhost:3000/login` in development. With email confirmation enabled, new users confirm their email before signing in.

To replace the old app's tables, first run `npm run supabase:backup`; it saves all inspected legacy table rows in the git-ignored `.local-backups/` directory. This is a row export, not a full schema/Auth/Storage backup. Then run `supabase/cleanup-legacy.sql` in SQL Editor. It removes the 13 inspected legacy tables, their dependent objects through `CASCADE`, and signup triggers referencing the old `profiles` table. Existing Auth accounts, Storage and Fluen tables are preserved. Both SQL files are transactional and support reruns.

Alternatively, add `SUPABASE_DB_URL` (a PostgreSQL connection string from Supabase Connect) or `SUPABASE_ACCESS_TOKEN` (a personal management token) to `.env.local`, then run `npm run supabase:setup -- --cleanup-legacy`. This backs up legacy rows, applies the migration, and removes legacy tables. Omit `--cleanup-legacy` to create only the Fluen tables. URL, anon key and service-role key alone cannot execute schema migrations. Scripts never log credentials.

Signed-in saved words and completed writing exercises sync to Supabase. Guest data stays in this browser and is kept separate from account data; signing out restores guest data. Guest words and progress are not automatically imported into an account. Failed progress writes remain queued during the current page session and are retried by **Retry sync**. Other devices' changes are loaded when the app is reopened. Conversation history is not persisted.

Run `npm run test:supabase` to verify actual PostgreSQL access policies, duplicate completion handling, account deletion and legacy signup-hook cleanup using a local PGlite database.

## Checks

`npm run typecheck`, `npm run test:bank`, `npm run test:feedback`, `npm run test:supabase` and `npm run build`. The bank tests cover all settings, pool cycling, provider-free question and model-answer API paths, and explicit AI opt-in for unmatched answers. Feedback tests cover accessible announcements, correctness celebrations without scores, and reduced-motion support.
