# FLUEN

Minimalist German learning. Three methodologies, one dashboard:

1. **Foundations** — FSRS spaced repetition for vocabulary
2. **Immerse** — comprehensible input with click-to-SRS subtitles
3. **Speak** — low-stakes AI conversation with ambient corrections

No streaks. No leaderboards. No confetti.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, user flows, component architecture, latency budget
- [`db/schema.sql`](db/schema.sql) — Supabase/Postgres schema with RLS

## Run

```sh
npm install
echo GEMINI_API_KEY=... > .env.local   # free key: https://aistudio.google.com
npm run dev
```

All four tabs work without a database: streaming Gemini chat with parallel
grammar corrections (**Speak**, with browser speech recognition for voice
mode), AI-generated flashcards (**Foundations**), and AI-generated
stories/dialogs with click-to-learn words (**Immerse**).

Models are configured in `lib/ai.ts` — `gemini-2.5-flash` for generation,
`gemini-2.5-flash-lite` for corrections/definitions (much higher free-tier
limits than `gemini-3.5-flash`, which only allows ~20 requests/day free).

## Theme

Light by default; toggle to dark via the sun/moon button in the sidebar
(persisted in localStorage). Tokens for both themes live in `app/globals.css`.
