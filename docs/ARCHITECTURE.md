# FLUEN — Architecture & Product Design

> Multi-language learning (German, Spanish & Mandarin Chinese today). Each
> language is its own environment — separate cards, decks, conversations,
> immerse texts and CEFR level — switchable from the sidebar, Duolingo-style.
> Three methodologies,
> one dashboard, zero gamified bloat.
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
| Database / Auth / Storage | **Supabase** (Postgres + RLS + Auth + Storage) | Relational SRS state needs real SQL; RLS gives per-user isolation for free; Storage hosts cached TTS audio for flashcards. |
| SRS algorithm | **`ts-fsrs`** (FSRS-5) | Modern successor to SM-2 — fewer reviews for the same retention. Runs client-side at review time; state persisted to Postgres. |
| LLM (chat, corrections, example sentences) | **Gemini 3.5 Flash** (`gemini-3.5-flash`) via `@google/genai` | Free-tier eligible (key from AI Studio); streaming responses for the coach; `responseSchema` structured output for deterministic grammar-correction JSON. Fallback to `gemini-2.5-flash` if free-tier rate limits bite. |
| STT (voice mode) | **Deepgram Nova-3 streaming** (WebSocket) | ~300 ms partial transcripts; native German model. |
| TTS (voice mode + card audio) | **ElevenLabs Flash v2.5** (or Cartesia Sonic) | Sub-150 ms time-to-first-byte; card audio is generated once and cached in Supabase Storage. |
| Media | **Mux** (video) / native `<audio>` (podcasts) + WebVTT cues stored in Postgres | Cue-level rows enable the click-word → SRS bridge. |
| Hosting | **Vercel** | Edge streaming for the chat route; same region as Supabase project to keep RTT down. |

### Latency budget for voice-to-voice

```
user stops speaking
  → Deepgram final transcript        ~300 ms
  → Gemini first token (streaming)   ~400–700 ms
  → sentence-chunked TTS (Flash)     ~150 ms TTFB
  ≈ 1.0–1.3 s perceived gap — conversational.
```

The trick: stream the model's text, split on sentence boundaries, and pipe each
sentence to TTS as soon as it completes rather than waiting for the full reply.

---

## 2. Core User Flows

### Flow A — Daily SRS session (`/learn`)
1. Server component fetches due cards (`user_words WHERE due <= now()` + new-card quota).
2. Card front: German word (with article for nouns — gender is half the battle in German).
3. `Space` flips → meaning, AI-generated example sentence, cached audio autoplays.
4. `1–4` keys or buttons (Again / Hard / Good / Easy) → `ts-fsrs.repeat()` computes next state → single `UPDATE` + `INSERT` into `review_logs`.
5. Counter at top ("14 New | 22 Review") decrements. Session ends with a plain "Done." — no confetti.

### Flow B — Immersion with the Bridge (`/immerse`)
1. Curated feed grouped by CEFR level (A1–C1), each item tagged Beginner / Intermediate / Advanced.
2. Player view: media on top, current subtitle cue rendered as **individually clickable word spans** below.
3. Click a word → player pauses → minimal popover anchored to the word: lemma, gender/plural (nouns), meaning, one-tap **"Add to SRS"**.
4. "Add to SRS" inserts a `user_words` row (state = new) linked to the dictionary `words` row, with the subtitle sentence captured as the card's context sentence. Popover closes, media resumes.

### Flow C — AI Coach (`/speak`)
1. Split screen: chat log left, voice orb right.
2. **Text mode:** user sends a German message. Two parallel requests fire:
   - `/api/chat` — streaming conversational reply (the coach responds *in German*, naturally, never lecturing).
   - `/api/correct` — structured-output check of the user's message. If a mistake is found, a small expandable badge appears under the user's bubble: *Original → Correction → one-line explanation*.
   The conversation never stops for corrections — they're ambient, low-stakes.
3. **Voice mode:** hold/toggle the orb → Deepgram streams STT → transcript enters the same chat pipeline → reply is sentence-streamed to TTS.

---

## 3. Frontend Component Architecture

```
app/
├── layout.tsx                     # Root: fonts, theme class, <html>
├── globals.css                    # Design tokens (dark default + light theme)
├── (app)/
│   ├── layout.tsx                 # Persistent sidebar shell
│   ├── dashboard/page.tsx         # Due counts, minutes immersed, last session — numbers only
│   ├── learn/
│   │   ├── page.tsx               # RSC: fetch due queue
│   │   └── _components/
│   │       ├── review-session.tsx # Client: keyboard handling, FSRS scheduling
│   │       ├── flashcard.tsx      # Flip state, audio playback
│   │       └── grade-bar.tsx      # Again / Hard / Good / Easy
│   ├── immerse/
│   │   ├── page.tsx               # RSC: curated feed by level
│   │   ├── [mediaId]/page.tsx     # Player view
│   │   └── _components/
│   │       ├── media-player.tsx   # Video/audio + cue sync (timeupdate → active cue)
│   │       ├── subtitle-track.tsx # Clickable word spans
│   │       └── word-popover.tsx   # Definition + "Add to SRS" (the Bridge)
│   └── speak/
│       ├── page.tsx               # RSC shell
│       └── _components/
│           ├── speak-view.tsx     # Client: state machine, streaming fetch
│           ├── chat-log.tsx       # Scroll anchoring, message list
│           ├── chat-message.tsx   # Bubbles + correction badge slot
│           ├── correction-badge.tsx
│           ├── composer.tsx       # Input + send
│           └── voice-panel.tsx    # The orb; STT/TTS lifecycle hooks
├── api/
│   ├── chat/route.ts              # Claude streaming proxy (system prompt server-side)
│   ├── correct/route.ts           # Claude structured-output grammar check
│   ├── srs/review/route.ts        # Persist FSRS transitions
│   └── words/add/route.ts         # The Bridge endpoint
├── components/
│   ├── sidebar.tsx                # Persistent nav
│   └── ui/                        # button, popover, badge primitives
└── lib/
    ├── types.ts                   # Shared domain types
    ├── fsrs.ts                    # ts-fsrs wrapper
    ├── supabase/{client,server}.ts
    └── anthropic.ts               # Shared client + system prompts
```

**Principles**
- Server components by default; `"use client"` only at interaction leaves (review session, player, chat).
- All Anthropic/Deepgram/ElevenLabs keys live server-side; the browser only ever talks to `/api/*`.
- One accent color (`--accent: #5E6AD2`). Status colors are muted, never saturated. No animation except functional state feedback (orb pulse, card flip ≤150 ms).

---

## 4. Design System Tokens

| Token | Dark (default) | Light |
|---|---|---|
| `--background` | `#0A0A0A` | `#FAFAFA` |
| `--surface` | `#101011` | `#FFFFFF` |
| `--surface-raised` | `#161618` | `#FFFFFF` |
| `--border` | `#1F1F1F` | `#E7E7E4` |
| `--foreground` | `#FAFAFA` | `#141415` |
| `--muted` | `#7E7E85` | `#6F6F76` |
| `--accent` | `#5E6AD2` | `#5E6AD2` |
| `--positive` | `#4F9E70` (muted) | `#3D8A5F` |
| `--negative` | `#B45454` (muted) | `#B45454` |

Typography: Inter (or Geist Sans), `leading-relaxed` body, strict scale
(12 / 14 / 16 / 20 / 28). German text in learning contexts gets `lang="de"`
for correct hyphenation and screen-reader pronunciation.

---

## 5. AI Integration Notes

- **Coach chat** (`/api/chat`): `gemini-3.5-flash`, streaming
  (`generateContentStream`), German-tutor system prompt pinned server-side via
  `systemInstruction` (Gemini applies implicit caching to repeated prefixes
  automatically).
- **Corrections** (`/api/correct`): same model, non-streaming,
  `responseMimeType: "application/json"` + `responseSchema` → `{ has_error,
  original, corrected, explanation }`. Fires in parallel with chat so it never
  adds latency to the reply.
- **Free tier:** `gemini-3.5-flash` and `gemini-2.5-flash` are both free-tier
  eligible with an AI Studio key — rate-limited, but plenty for development
  and personal use. Paid tier: $1.50/$9.00 per 1M tokens (3.5 Flash) vs
  $0.30/$2.50 (2.5 Flash).
- **Example sentences for cards**: generated lazily on first card creation,
  persisted to `user_words.context_sentence` so they're never regenerated.
