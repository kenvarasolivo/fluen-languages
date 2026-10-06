# Fluen

German practice through writing and conversation. No accounts or database.

## Run

`npm install`, then `npm run dev`. Open http://localhost:3000.

Keep `GEMINI_API_KEY` in `.env.local` or `.env`. Optional `GEMINI_MODEL` overrides the default `gemini-3.1-flash-lite`, configured for minimal thinking. Existing environment files are preserved; keys stay on the server. Temporary upstream 503/504 errors are retried once, using the same Lite model. Quota errors are not retried, and there is no fallback to Flash or Pro.

## Practice

- `/` — landing page
- `/write` — English-to-German translation, A1–C2, six topics, single sentences or two ideas joined with a connector. Hints, model translations, and AI corrections that accept valid alternatives.
- `/speak` — German AI chat, per-message corrections, optional English translations, microphone dictation, and German read-aloud.
- `/words` — locally saved vocabulary with search, playback, and removal.

Microphone input uses browser SpeechRecognition, usually available in Chrome/Edge. It needs microphone permission and HTTPS or localhost. The browser/provider may process speech remotely. Dictation creates editable text; send it to receive feedback. Read-aloud uses browser speech synthesis, and German voice quality depends on installed voices. Conversation is turn-based; pronunciation is not assessed.

The first A1 everyday-life sentence is a built-in starter. Subsequent exercises and all corrections use Gemini. AI failures show error messages and retry paths. Saved vocabulary belongs to this browser and is lost if its storage is cleared.

## Checks

`npm run typecheck` and `npm run build`.
