# FLUEN — Architecture & Product Design

> Multi-language learning (German, Spanish & Mandarin Chinese today). Each
> language is its own environment — separate cards, decks, conversations,
> immerse texts and CEFR level — switchable from the sidebar, Duolingo-style.
> Three methodologies, one dashboard, zero gamified bloat.
> SRS for foundations · Comprehensible Input for immersion · AI Coach for output.

**Language model:** the active language lives on `profiles.target_language`
(the source of truth for server routes) and is mirrored to `localStorage` for
instant client reads; switching reloads the app. Per-language CEFR level lives
in `user_languages`. The dictionary (`words`) and every learner-owned table
(`user_words` via the dictionary, `decks`, `immerse_texts`, `chat_sessions`)
is keyed by language so nothing bleeds across environments. The shared
language registry is `lib/languages.ts`; server routes resolve the active
environment via `lib/learning-context.ts`. The Speak coach replies at native
(C2) level regardless of the learner's level.

Non-Latin scripts are taught romanization-first: Mandarin is studied in Hanyu
Pinyin (the typeable, readable form), with the Hanzi shown as a `<ruby>`
annotation on top via the shared `<Lemma>` component. The dictionary stores the
characters in `words.lemma` (canonical/dedup key, used for TTS) and the
tone-marked Pinyin in `words.pinyin`; a language opts into this behaviour through
the `romanization` field in `lib/languages.ts`, which also injects the right
instructions into the word, definition, Immerse, coach and correction prompts.

---

## 1. Technical Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router, RSC)** | Server components keep the SRS/feed pages near-zero JS; API routes colocate the AI proxy layer; streaming-first primitives. |
| Language | **TypeScript** (strict) | End-to-end types from DB row → component prop. |
| Styling | **Tailwind CSS v4** | Token-based design system in CSS variables; no runtime CSS-in-JS cost. |
| Database / Auth | **Supabase** (Postgres + RLS + Auth) | Relational SRS state needs real SQL; RLS gives per-user isolation for free. Runs fully without a DB for guests via `localStorage`. |
| SRS algorithm | **`ts-fsrs`** (FSRS) | Modern successor to SM-2 — fewer reviews for the same retention. Runs client-side at review time; state persisted to Postgres (`lib/srs.ts`). |
| LLM (chat, corrections, generation) | **Gemini** via `@google/genai` | Free-tier eligible (key from AI Studio); streaming responses for the coach; `responseSchema` structured output for deterministic grammar-correction and word-list JSON. Two models split for quota — see §5. |
| Voice (STT + TTS) | **Browser Web Speech API** (`SpeechRecognition` + `speechSynthesis`) | Zero-dependency, zero-cost voice mode that ships today; built-in language models in Chrome/Edge. The production swap is Deepgram streaming STT + ElevenLabs Flash TTS — see *Planned* below. |
| Hosting | **Vercel** | Edge streaming for the chat route; same region as the Supabase project to keep RTT down. |

**Planned (not yet implemented):** Deepgram Nova-3 for sub-300 ms streaming STT,
ElevenLabs Flash v2.5 (or Cartesia Sonic) for sub-150 ms TTS with cached card
audio in Supabase Storage, and Mux for video-based Immerse with WebVTT cue rows.
The current build deliberately uses browser-native voice and AI-generated text
Immerse so it runs end-to-end on a single free Gemini key.

### Latency budget — target voice-to-voice (production stack)

```
user stops speaking
  → Deepgram final transcript        ~300 ms
  → Gemini first token (streaming)   ~400–700 ms
  → sentence-chunked TTS (Flash)     ~150 ms TTFB
  ≈ 1.0–1.3 s perceived gap — conversational.
```

The trick: stream the model's text, split on sentence boundaries, and pipe each
sentence to TTS as soon as it completes rather than waiting for the full reply.
Today's browser-native path follows the same shape with `SpeechRecognition`
final transcripts and `speechSynthesis` playback.

---

## 2. Core User Flows

### Flow A — Daily SRS session (`/learn`)
1. The deck view loads the learner's cards; the curriculum endpoint
   (`/api/curriculum/next`) draws unseen words for the active language at the
   learner's CEFR level, generating more lazily only when the pool runs dry.
2. Card front: the word (with article for nouns — gender is half the battle in
   German; Pinyin + Hanzi ruby for Mandarin).
3. `Space` flips → meaning + AI-generated example sentence.
4. `1–4` keys or buttons (Again / Hard / Good / Easy) → `ts-fsrs` computes the
   next state → persisted to `user_words` (`review_logs` for history).
5. Counter at top decrements. Session ends with a plain "Done." — no confetti.

### Flow B — Immersion (`/immerse`)
1. The learner generates a short story or dialog at their level via
   `/api/immerse`; texts persist to `immerse_texts` so they're never regenerated.
2. The text renders as **individually clickable word spans** (the `<Lemma>`
   component handles Pinyin/Hanzi for Mandarin).
3. Click a word → minimal popover with lemma, meaning, and one-tap **"Add to
   SRS"** (`/api/define` supplies the definition).
4. "Add to SRS" creates a `user_words` row (state = new) linked to the dictionary
   `words` row, with the surrounding sentence captured as the card's context.

### Flow C — AI Coach (`/speak`)
1. Chat log with a voice panel (the orb) for hands-free mode.
2. **Text mode:** the user sends a message. Two parallel requests fire:
   - `/api/chat` — streaming conversational reply (the coach responds *in the
     target language*, naturally, never lecturing).
   - `/api/correct` — structured-output check of the user's message. If a mistake
     is found, a small expandable badge appears under the user's bubble:
     *Original → Correction → one-line explanation*.
   The conversation never stops for corrections — they're ambient and low-stakes;
   any failure (rate limit, malformed JSON) degrades to "no correction".
3. **Voice mode:** toggle the orb → `SpeechRecognition` streams the transcript
   into the same chat pipeline → the reply is read back via `speechSynthesis`.

---

## 3. Frontend Component Architecture

```
app/
├── layout.tsx                       # Root: fonts, theme class, <html>
├── globals.css                      # Design tokens (light default + dark theme)
├── page.tsx                         # Landing page
├── login/                           # Auth (Supabase email + username)
├── impressum/                       # Legal notice (portfolio disclaimer)
├── (app)/
│   ├── layout.tsx                   # Persistent sidebar shell
│   ├── dashboard/                   # greeting · quick-actions · stats (numbers only)
│   ├── cards/_components/
│   │   └── card-catalog.tsx         # Browse the dictionary / owned words
│   ├── learn/_components/
│   │   ├── review-demo.tsx          # Client: keyboard handling, FSRS scheduling
│   │   └── deck-editor.tsx          # Deck create / word management
│   ├── immerse/_components/
│   │   └── immerse-demo.tsx         # Generated text + clickable word → SRS bridge
│   ├── speak/_components/
│   │   ├── speak-view.tsx           # Client: state machine, streaming fetch
│   │   ├── chat-log.tsx             # Scroll anchoring, message list
│   │   ├── chat-message.tsx         # Bubbles + correction badge slot
│   │   ├── correction-badge.tsx
│   │   ├── composer.tsx             # Input + send
│   │   └── voice-panel.tsx          # The orb; STT/TTS lifecycle hooks
│   ├── profile/_components/
│   │   └── profile-editor.tsx       # Username, avatar, target language
│   └── ranking/_components/
│       └── leaderboard.tsx
├── api/
│   ├── chat/route.ts                # Gemini streaming proxy (system prompt server-side)
│   ├── correct/route.ts             # Gemini structured-output grammar check
│   ├── curriculum/next/route.ts     # Draw / lazily generate next words by level
│   ├── define/route.ts              # Word definition for the Immerse bridge
│   └── immerse/route.ts             # Generate a story / dialog at level
├── components/
│   ├── sidebar.tsx                  # Persistent nav
│   ├── language-switcher.tsx        # Switch active language environment
│   ├── lemma.tsx                    # Hanzi-over-Pinyin <ruby> rendering
│   └── theme-toggle.tsx             # Light/dark (localStorage)
└── lib/
    ├── ai.ts                        # Shared Gemini client + model constants
    ├── ai-errors.ts                 # Rate-limit / parse error handling
    ├── languages.ts                 # Language registry + active-language state
    ├── learning-context.ts          # Resolve active environment server-side
    ├── curriculum.ts                # Theme ordering by CEFR level
    ├── srs.ts                       # ts-fsrs wrapper
    ├── guest-limits.ts              # Per-day quota for guests
    ├── supabase.ts / supabase-server.ts
    └── types.ts                     # Shared domain types
```

**Principles**
- Server components by default; `"use client"` only at interaction leaves
  (review session, immerse, chat).
- All Gemini keys live server-side; the browser only ever talks to `/api/*`.
- One accent color (`--accent`). Status colors are muted, never saturated.
  Animation is functional only (orb pulse, card flip).

---

## 4. Design System Tokens

Light is the default (`:root`); dark is opt-in (`:root.dark`, persisted to
`localStorage` via the sidebar toggle). The look is high-contrast and
near-monochrome — a black/white canvas with a single electric-indigo accent and
a hard offset shadow (`--border-strong` + `6px 6px 0`) for a bold, tactile feel.

| Token | Light (default) | Dark |
|---|---|---|
| `--background` | `#ffffff` | `#0a0a0b` |
| `--surface` | `#ffffff` | `#0a0a0b` |
| `--surface-raised` | `#ffffff` | `#161617` |
| `--border` | `#e4e0d8` | `#2a2a2c` |
| `--border-strong` | `#100f0e` | `#f5f4f2` |
| `--foreground` | `#100f0e` | `#f7f6f4` |
| `--muted` | `#6a635b` | `#9a948c` |
| `--accent` | `#4536f2` | `#6f60ff` |
| `--positive` | `#1f9d57` | `#34c46e` |
| `--negative` | `#db2b2b` | `#ff5a5a` |

Learning text gets `lang="…"` (e.g. `lang="de"`) for correct hyphenation and
screen-reader pronunciation.

---

## 5. AI Integration Notes

Two Gemini models are configured in `lib/ai.ts`. Free-tier quotas are **per
model per day**, so splitting the high-frequency lightweight calls onto a
separate model effectively doubles the daily budget:

- **`CHAT_MODEL` = `gemini-2.5-flash`** — conversation and content generation
  (coach chat, Immerse stories, vocab sets).
  - **Coach chat** (`/api/chat`): streaming (`generateContentStream`), tutor
    system prompt pinned server-side via `systemInstruction`; thinking is
    disabled so it doesn't eat the small output budget before any text streams.
- **`LITE_MODEL` = `gemini-3.1-flash-lite`** — high-frequency lightweight calls
  (corrections, word definitions, word-list generation).
  - **Corrections** (`/api/correct`): non-streaming,
    `responseMimeType: "application/json"` + `responseSchema` →
    `{ has_error, original, corrected, explanation }`. Fires in parallel with
    chat so it never adds latency to the reply.

- **Guest quota:** AI actions are metered per day for signed-out users
  (`lib/guest-limits.ts`); already-seeded words are always served for free, and
  the quota is only charged when an actual generation call is made.
- **Example sentences for cards** are generated lazily on first creation and
  persisted, so they're never regenerated.
