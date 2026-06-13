"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Shuffle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { gradeCard, isDueSoon, type SrsFields } from "@/lib/srs";
import { withGender } from "@/lib/format";
import type { Deck, DemoWord } from "@/lib/types";
import { DeckEditor } from "./deck-editor";

type Phase = "loading" | "empty" | "generating" | "review" | "done" | "error";

/** Which language is shown on the prompt side before flipping. */
type Direction = "en-de" | "de-en";

/**
 * Soft, part-of-speech-keyed card tints. Each maps to one of the design
 * accent tokens, mixed heavily into the surface so the foreground text
 * stays fully legible (see the `.tint-*` classes in globals.css).
 */
function posTint(pos: string): string {
  switch (pos?.toLowerCase()) {
    case "noun":
      return "tint-noun";
    case "verb":
      return "tint-verb";
    case "adjective":
      return "tint-adjective";
    case "adverb":
      return "tint-adverb";
    case "pronoun":
      return "tint-pronoun";
    default:
      return "tint-default";
  }
}

interface QueueCard extends SrsFields {
  id: string; // user_words.id
  lemma: string;
  gender: string | null;
  pos: string;
  meaning_en: string;
  context_sentence: string | null;
  context_translation: string | null;
}

const SRS_COLUMNS =
  "id, state, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, last_review, context_sentence, context_translation";

/**
 * Built-in decks; any other deckId is the uuid of a custom deck.
 * "learning" and "due" are disjoint: a card is in Lernen until it
 * graduates (FSRS state 2), then it only ever shows up in Wiederholen.
 */
const BUILTIN_DECKS = [
  { id: "learning", label: "Learning" },
  { id: "due", label: "Review" },
  { id: "random", label: "Random" },
] as const;

type BuiltinDeckId = (typeof BUILTIN_DECKS)[number]["id"];

const RANDOM_DECK_SIZE = 15;

class GuestLimitError extends Error {}

function speakGerman(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.92;
  speechSynthesis.speak(u);
}

function sanitizeGender(g: string | null | undefined) {
  return g === "der" || g === "die" || g === "das" ? g : null;
}

function sanitizeLevel(l: string | null | undefined) {
  return l && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(l) ? l : null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ReviewDemo() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<QueueCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  // Default to English prompt → German answer; toggleable per session.
  const [direction, setDirection] = useState<Direction>("en-de");
  const [errorMsg, setErrorMsg] = useState("");
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const [deckId, setDeckId] = useState<string>("learning");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [editing, setEditing] = useState<Deck | null>(null);
  const [newDeckOpen, setNewDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const isBuiltin = (id: string): id is BuiltinDeckId =>
    BUILTIN_DECKS.some((d) => d.id === id);

  const fetchQueue = useCallback(async (deck: string): Promise<QueueCard[]> => {
    const wordsJoin = "words(lemma, gender, pos, meaning_en)";

    if (deck === "random") {
      // Supabase has no random ordering from the client — pull a window
      // of cards and shuffle locally instead.
      const { data, error } = await supabase
        .from("user_words")
        .select(`${SRS_COLUMNS}, ${wordsJoin}`)
        .limit(200);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data as any[]).map(({ words, ...srs }) => ({ ...srs, ...words }));
      return shuffle(rows).slice(0, RANDOM_DECK_SIZE);
    }

    if (deck === "learning") {
      // Everything still in progress (new / learning / relearning),
      // regardless of when it's due.
      const { data, error } = await supabase
        .from("user_words")
        .select(`${SRS_COLUMNS}, ${wordsJoin}`)
        .in("state", [0, 1, 3])
        .order("due")
        .limit(30);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map(({ words, ...srs }) => ({ ...srs, ...words }));
    }

    if (deck === "due") {
      // Only graduated cards (state 2) that are due again — cards still
      // being learned live exclusively in the Lernen deck.
      const { data, error } = await supabase
        .from("user_words")
        .select(`${SRS_COLUMNS}, ${wordsJoin}`)
        .eq("state", 2)
        .lte("due", new Date().toISOString())
        .order("due")
        .limit(30);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map(({ words, ...srs }) => ({ ...srs, ...words }));
    }

    // Custom deck — membership lives in deck_cards.
    const { data, error } = await supabase
      .from("deck_cards")
      .select(`user_words(${SRS_COLUMNS}, ${wordsJoin})`)
      .eq("deck_id", deck)
      .order("added_at");
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).flatMap(({ user_words: uw }) => {
      if (!uw) return [];
      const { words, ...srs } = uw;
      return [{ ...srs, ...words }];
    });
  }, []);

  /** Generate fresh AI vocabulary and persist it as new cards. */
  const generateCards = useCallback(async (userId: string) => {
    const res = await fetch("/api/foundations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: "B1", count: 10 }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.code === "guest_limit") throw new GuestLimitError(body.error);
      throw new Error(body?.error ?? "generation failed");
    }
    const { words } = (await res.json()) as { words: DemoWord[] };

    // Dictionary rows are shared — insert only the missing ones, then
    // read ids back (upsert+DO NOTHING keeps RLS to insert-only).
    const dictRows = words.map((w) => ({
      language: "de",
      lemma: w.lemma,
      pos: w.pos || "phrase",
      gender: sanitizeGender(w.gender),
      meaning_en: w.meaning_en,
      cefr_level: sanitizeLevel(w.cefr_level),
    }));
    const { error: insertErr } = await supabase
      .from("words")
      .upsert(dictRows, { onConflict: "language,lemma,pos", ignoreDuplicates: true });
    if (insertErr) throw insertErr;

    const { data: dict, error: dictErr } = await supabase
      .from("words")
      .select("id, lemma, pos")
      .eq("language", "de")
      .in("lemma", words.map((w) => w.lemma));
    if (dictErr) throw dictErr;

    const idFor = (w: DemoWord) =>
      dict?.find((d) => d.lemma === w.lemma && d.pos === (w.pos || "phrase"))?.id ??
      dict?.find((d) => d.lemma === w.lemma)?.id;

    const cardRows = words.flatMap((w) => {
      const wordId = idFor(w);
      if (!wordId) return [];
      return [
        {
          user_id: userId,
          word_id: wordId,
          context_sentence: w.example_de,
          context_translation: w.example_en,
          source: "generated",
        },
      ];
    });
    const { error: cardErr } = await supabase
      .from("user_words")
      .upsert(cardRows, { onConflict: "user_id,word_id", ignoreDuplicates: true });
    if (cardErr) throw cardErr;
  }, []);

  /** Load the selected deck's queue. Never generates — that's a deliberate click. */
  const load = useCallback(async () => {
    setPhase("loading");
    setFlipped(false);
    try {
      const session = await ensureSession();
      userIdRef.current = session.user.id;

      const cards = await fetchQueue(deckId);
      setQueue(cards);
      setPhase(cards.length > 0 ? "review" : "empty");
    } catch (err) {
      console.error("[foundations]", err);
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(
        msg && msg !== "not signed in"
          ? msg
          : "Loading failed - check the Supabase keys and the Vercel logs.",
      );
      setPhase("error");
    }
  }, [fetchQueue, deckId]);

  /** Explicit, token-conscious generation — only ever runs on click. */
  const generate = useCallback(async () => {
    setPhase("generating");
    setFlipped(false);
    setLimitMsg(null);
    try {
      const session = await ensureSession();
      userIdRef.current = session.user.id;

      await generateCards(session.user.id);
      const cards = await fetchQueue(deckId);
      setQueue(cards);
      setPhase(cards.length > 0 ? "review" : "empty");
    } catch (err) {
      console.error("[foundations generate]", err);
      if (err instanceof GuestLimitError) {
        setLimitMsg(err.message);
        setPhase("empty");
        return;
      }
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(
        msg && msg !== "generation failed"
          ? msg
          : "Generation failed - please try again.",
      );
      setPhase("error");
    }
  }, [fetchQueue, generateCards, deckId]);

  useEffect(() => {
    load();
  }, [load]);

  // Custom decks are loaded once; create/delete keep the list in sync.
  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        const { data, error } = await supabase
          .from("decks")
          .select("id, name")
          .order("created_at");
        if (error) throw error;
        setDecks(data ?? []);
      } catch (err) {
        console.error("[decks]", err);
      }
    })();
  }, []);

  const createDeck = useCallback(async () => {
    const name = newDeckName.trim();
    if (!name) return;
    try {
      const session = await ensureSession();
      const { data, error } = await supabase
        .from("decks")
        .insert({ user_id: session.user.id, name })
        .select("id, name")
        .single();
      if (error) throw error;
      setDecks((d) => [...d, data]);
      setNewDeckName("");
      setNewDeckOpen(false);
      setDeckId(data.id);
      // A fresh deck is empty — jump straight into picking words.
      setEditing(data);
    } catch (err) {
      console.error("[deck create]", err);
    }
  }, [newDeckName]);

  const card = queue[0];

  const flip = useCallback(() => {
    if (!card || flipped) return;
    setFlipped(true);
    speakGerman(withGender(card.gender, card.lemma));
  }, [card, flipped]);

  const grade = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!card || !flipped) return;
      const updated = gradeCard(card, rating);

      // Persist in the background — reviewing stays instant.
      supabase
        .from("user_words")
        .update(updated)
        .eq("id", card.id)
        .then(({ error }) => error && console.error("[srs update]", error));
      supabase
        .from("review_logs")
        .insert({
          user_word_id: card.id,
          user_id: userIdRef.current,
          rating,
          state_before: card.state,
        })
        .then(({ error }) => error && console.error("[review log]", error));

      setFlipped(false);
      setQueue((prev) => {
        const rest = prev.slice(1);
        // FSRS may schedule the card again within minutes (learning steps) —
        // keep those in this session's queue. Random and custom decks are a
        // fixed stack instead: each card appears exactly once per run.
        const requeue = deckId === "due" || deckId === "learning";
        const next =
          requeue && isDueSoon(updated.due) ? [...rest, { ...card, ...updated }] : rest;
        if (next.length === 0) setPhase("done");
        return next;
      });
    },
    [card, flipped, deckId],
  );

  // Space flips, 1–4 grades — keyboard-first review.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        flip();
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(Number(e.key) as 1 | 2 | 3 | 4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, grade, flipped, editing]);

  const newCount = queue.filter((c) => c.state === 0).length;
  const reviewCount = queue.length - newCount;
  const activeDeck = decks.find((d) => d.id === deckId) ?? null;

  const emptyMessage = isBuiltin(deckId)
    ? {
        due: "No reviews due.",
        learning: "Nothing in progress right now.",
        random: "No cards to shuffle yet.",
      }[deckId]
    : "This deck is still empty.";

  const doneMessage = isBuiltin(deckId)
    ? {
        due: "Done. All reviews finished.",
        learning: "Done. Everything is learned.",
        random: "Round finished.",
      }[deckId]
    : "Deck completed.";

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <h1 className="text-sm font-semibold tracking-tight">Foundations</h1>
        <div className="flex items-center gap-3">
          {!editing && phase !== "loading" && phase !== "error" && (
            <button
              onClick={() => {
                setDirection((d) => (d === "en-de" ? "de-en" : "en-de"));
                setFlipped(false);
              }}
              title="Switch which language is shown first"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] font-medium text-muted shadow-xs transition-colors duration-150 hover:border-border-strong hover:text-foreground"
            >
              <ArrowLeftRight size={12} strokeWidth={1.75} />
              {direction === "en-de" ? "EN → DE" : "DE → EN"}
            </button>
          )}
          {phase === "review" && !editing && (
            <span className="rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted shadow-xs">
              {newCount} New | {reviewCount} Review
            </span>
          )}
          {/* Always reachable — generating new words shouldn't require an
              empty queue. */}
          {!editing && phase !== "loading" && phase !== "error" && (
            <button
              onClick={generate}
              disabled={phase === "generating"}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99] disabled:opacity-60"
            >
              {phase === "generating" ? (
                <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
              ) : (
                <Sparkles size={13} strokeWidth={1.75} />
              )}
              New words
            </button>
          )}
        </div>
      </header>

      {/* Deck switcher — built-in decks plus the user's custom decks */}
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-surface px-4 py-2.5 sm:px-6">
        {BUILTIN_DECKS.map((d) => (
          <DeckTab
            key={d.id}
            label={d.label}
            active={deckId === d.id && !editing}
            onClick={() => {
              setEditing(null);
              setDeckId(d.id);
            }}
          />
        ))}
        {decks.length > 0 && <span className="mx-1.5 h-4 w-px bg-border" />}
        {decks.map((d) => (
          <span key={d.id} className="flex items-center">
            <DeckTab
              label={d.name}
              active={deckId === d.id && !editing}
              onClick={() => {
                setEditing(null);
                setDeckId(d.id);
              }}
            />
            {deckId === d.id && (
              <button
                onClick={() => setEditing(d)}
                aria-label={`Edit deck "${d.name}"`}
                className={`ml-0.5 rounded-md p-1 transition-colors duration-150 ${
                  editing?.id === d.id
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
                }`}
              >
                <Pencil size={12} strokeWidth={1.75} />
              </button>
            )}
          </span>
        ))}
        {newDeckOpen ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createDeck();
            }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setNewDeckOpen(false)}
              onBlur={() => !newDeckName.trim() && setNewDeckOpen(false)}
              placeholder="Deck name ..."
              className="w-36 rounded-md border border-accent/40 bg-surface-raised px-2 py-1 text-base outline-none placeholder:text-muted sm:w-32 sm:text-xs"
            />
            <button
              type="submit"
              className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-accent/90"
            >
              OK
            </button>
          </form>
        ) : (
          <button
            onClick={() => setNewDeckOpen(true)}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <Plus size={12} strokeWidth={2} />
            New deck
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-1 flex-col overflow-hidden px-4 sm:px-6">
          <DeckEditor
            deck={editing}
            onClose={() => {
              setEditing(null);
              load();
            }}
            onDeleted={() => {
              setDecks((d) => d.filter((x) => x.id !== editing.id));
              setEditing(null);
              setDeckId("learning");
            }}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-6 sm:gap-8 sm:px-6">
          {phase === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
              <p className="text-sm text-muted">Loading cards ...</p>
            </div>
          )}

          {phase === "generating" && (
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft">
                <Loader2 size={18} strokeWidth={1.75} className="animate-spin text-accent" />
              </span>
              <p className="text-sm text-muted">Generating new words ...</p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex max-w-sm flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted">{errorMsg}</p>
              <button
                onClick={() => load()}
                className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm shadow-xs transition-all duration-150 hover:border-border-strong active:scale-[0.99]"
              >
                Try again
              </button>
            </div>
          )}

          {(phase === "empty" || phase === "done") && (
            <div className="flex max-w-sm flex-col items-center gap-4 text-center">
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  phase === "done"
                    ? "bg-accent-soft"
                    : "border border-border bg-surface-raised shadow-xs"
                }`}
              >
                {phase === "done" ? (
                  <CheckCircle2 size={20} strokeWidth={1.75} className="text-accent" />
                ) : (
                  <Sparkles size={20} strokeWidth={1.5} className="text-muted" />
                )}
              </span>
              <p className="text-sm font-medium">
                {phase === "done" ? doneMessage : emptyMessage}
              </p>
              {limitMsg ? (
                <>
                  <p className="text-sm text-muted">{limitMsg}</p>
                  <Link
                    href="/login"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
                  >
                    Create account
                  </Link>
                </>
              ) : activeDeck ? (
                <button
                  onClick={() =>
                    phase === "done" ? load() : setEditing(activeDeck)
                  }
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99]"
                >
                  {phase === "done" ? (
                    <>
                      <Shuffle size={14} strokeWidth={1.75} />
                      Practice again
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2} />
                      Add words
                    </>
                  )}
                </button>
              ) : deckId === "random" && phase === "done" ? (
                <button
                  onClick={() => load()}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99]"
                >
                  <Shuffle size={14} strokeWidth={1.75} />
                  Shuffle again
                </button>
              ) : (
                <>
                  <button
                    onClick={generate}
                    className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99]"
                  >
                    <Sparkles size={14} strokeWidth={1.75} />
                    Generate new words
                  </button>
                  <p className="text-xs text-muted">
                    Generates 10 words with AI - only on click, never automatically.
                  </p>
                </>
              )}
            </div>
          )}

          {phase === "review" && card && (
            <>
              {/* Card — both faces stacked in one grid cell; the wrapper
                  rotates in 3D, backface-visibility hides the far side. */}
              <button
                onClick={flip}
                className="group w-full max-w-lg rounded-2xl text-center [perspective:1200px]"
              >
                <div
                  key={card.id}
                  className={`grid w-full transition-transform duration-500 ease-[cubic-bezier(0.3,0.7,0.3,1)] [transform-style:preserve-3d] ${
                    flipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* Front — the prompt; which language depends on direction */}
                  <div
                    inert={flipped}
                    className={`flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-border ${posTint(card.pos)} px-8 py-12 shadow-raised transition-[border-color,box-shadow] duration-150 [backface-visibility:hidden] [grid-area:1/1] group-hover:border-accent/30 group-hover:shadow-pop`}
                  >
                    {direction === "de-en" ? (
                      <span lang="de" className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        {withGender(card.gender, card.lemma)}
                      </span>
                    ) : (
                      <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        {card.meaning_en}
                      </span>
                    )}
                    <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                      {card.pos}
                    </span>
                  </div>

                  {/* Back — the full reveal, pre-rotated so it reads correctly once the wrapper turns */}
                  <div
                    inert={!flipped}
                    className={`flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-border ${posTint(card.pos)} px-8 py-12 shadow-raised transition-[border-color,box-shadow] duration-150 [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] group-hover:border-accent/30 group-hover:shadow-pop`}
                  >
                    <div className="flex items-center gap-2">
                      <span lang="de" className="text-3xl font-semibold tracking-tight">
                        {withGender(card.gender, card.lemma)}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Play audio"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakGerman(withGender(card.gender, card.lemma));
                        }}
                        className="text-muted transition-colors hover:text-foreground"
                      >
                        <Volume2 size={16} strokeWidth={1.75} />
                      </span>
                    </div>
                    <p className="text-base text-foreground">{card.meaning_en}</p>
                    {card.context_sentence && (
                      <div className="mt-2 border-t border-border pt-4">
                        <p className="text-sm leading-relaxed">{card.context_sentence}</p>
                        {card.context_translation && (
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            {card.context_translation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Grade bar / flip hint */}
              {flipped ? (
                <div className="flex w-full max-w-lg justify-center gap-2">
                  <GradeButton label="Again" hint="1" tone="negative" onClick={() => grade(1)} />
                  <GradeButton label="Hard" hint="2" tone="muted" onClick={() => grade(2)} />
                  <GradeButton label="Good" hint="3" tone="accent" onClick={() => grade(3)} />
                  <GradeButton label="Easy" hint="4" tone="positive" onClick={() => grade(4)} />
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted sm:hidden">Tap the card to flip</p>
                  <p className="hidden text-xs text-muted sm:block">
                    <kbd className="rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-medium shadow-xs">
                      Space
                    </kbd>{" "}
                    to flip
                  </p>
                </>
              )}
            </>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

function DeckTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`max-w-40 truncate rounded-md px-2.5 py-1 text-xs transition-colors duration-150 ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

const tones = {
  negative: "text-negative hover:border-negative/40 hover:bg-negative/[0.06]",
  muted: "text-muted hover:border-border-strong hover:bg-foreground/[0.03]",
  accent: "text-accent hover:border-accent/40 hover:bg-accent-soft",
  positive: "text-positive hover:border-positive/40 hover:bg-positive/[0.06]",
};

function GradeButton({
  label,
  hint,
  tone,
  onClick,
}: {
  label: string;
  hint: string;
  tone: keyof typeof tones;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl border border-border bg-surface-raised py-3 text-sm font-medium shadow-xs transition-all duration-150 active:scale-[0.98] sm:max-w-28 ${tones[tone]}`}
    >
      {label}
      <span className="text-[10px] text-muted">{hint}</span>
    </button>
  );
}
