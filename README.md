# Fluen

An output-first language learning app for writing and conversation. German and Mandarin Chinese (pinyin only) are available now. No accounts or database.

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
- `/words` — locally saved vocabulary with search, playback, and removal.

Microphone input uses browser SpeechRecognition, usually available in Chrome/Edge. It needs microphone permission and HTTPS or localhost. The browser/provider may process speech remotely. Dictation creates editable text; send it to receive feedback. Read-aloud uses browser speech synthesis, and German voice quality depends on installed voices. Conversation is turn-based; pronunciation is not assessed.

Writing practice uses a preloaded German bank of 144 authored sentences and 144 two-idea exercises, plus a Chinese pinyin bank of 72 sentences and 144 two-idea exercises across all six levels and topics. Each connected pool includes “and,” “but,” “because,” and “although,” with authored reasons and contrasts that fit the topic. The prompt names the required connector meaning, hints show the target connector and word order, and AI checking accepts equivalent connectors while requiring the requested relationship. Questions, hints, vocabulary and model translations work without an API key. Reroll instantly replaces the question, clears the current attempt and animates the new prompt (respecting reduced-motion preferences). Prompts do not repeat within the selected pool until all have been seen; exhausted pools revisit the least recently seen question. The sentence API also uses this bank without calling Gemini.

Answers matching the model translation are checked locally on the server, ignoring case, whitespace and final sentence punctuation. Other answers use Gemini so valid alternative translations still receive fair feedback. Conversation also uses Gemini. AI failures show error messages and retry paths. Saved vocabulary belongs to this browser and is lost if its storage is cleared.

The vocabulary section explains every word in sentence order, including pronouns, articles, connectors and grammatical particles. Built-in exercises use authored contextual meanings; AI feedback and chat are instructed to provide the same complete breakdown. Chinese model answers and AI feedback show correct pinyin tone marks even when the learner's accepted answer omits them.

Select Chinese (pinyin) in practice settings for Mandarin written entirely in Latin pinyin. Checking ignores missing or incorrect tone marks, optional tone numbers, punctuation, capitalization and syllable spacing. Type ü as u, v or u: on a standard keyboard. The same rules apply to AI feedback on alternative answers and chat messages. Chinese voice features are disabled because browser speech services do not reliably support pinyin text. Saved words retain their language; older saved words default to German.

## Checks

`npm run typecheck`, `npm run test:bank`, `npm run test:feedback` and `npm run build`. The bank tests cover all settings, pool cycling, and provider-free question and model-answer API paths. Feedback tests cover accessible announcements, correctness celebrations without scores, and reduced-motion support.
