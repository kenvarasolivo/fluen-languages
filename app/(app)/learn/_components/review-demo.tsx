"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Volume2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { gradeCard, isDueSoon, type SrsFields } from "@/lib/srs";
import type { DemoWord } from "@/lib/types";

type Phase = "loading" | "empty" | "generating" | "review" | "done" | "error";

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

export function ReviewDemo() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<QueueCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const fetchQueue = useCallback(async (): Promise<QueueCard[]> => {
    const { data, error } = await supabase
      .from("user_words")
      .select(`${SRS_COLUMNS}, words(lemma, gender, pos, meaning_en)`)
      .lte("due", new Date().toISOString())
      .order("due")
      .limit(30);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(({ words, ...srs }) => ({ ...srs, ...words }));
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

  /** Load the due queue. Never generates — that's a deliberate click. */
  const load = useCallback(async () => {
    setPhase("loading");
    setFlipped(false);
    try {
      const session = await ensureSession();
      userIdRef.current = session.user.id;

      const cards = await fetchQueue();
      setQueue(cards);
      setPhase(cards.length > 0 ? "review" : "empty");
    } catch (err) {
      console.error("[foundations]", err);
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(
        msg && msg !== "not signed in"
          ? msg
          : "Laden fehlgeschlagen — prüfe die Supabase-Keys und die Vercel-Logs.",
      );
      setPhase("error");
    }
  }, [fetchQueue]);

  /** Explicit, token-conscious generation — only ever runs on click. */
  const generate = useCallback(async () => {
    setPhase("generating");
    setFlipped(false);
    setLimitMsg(null);
    try {
      const session = await ensureSession();
      userIdRef.current = session.user.id;

      await generateCards(session.user.id);
      const cards = await fetchQueue();
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
          : "Generierung fehlgeschlagen — versuch es nochmal.",
      );
      setPhase("error");
    }
  }, [fetchQueue, generateCards]);

  useEffect(() => {
    load();
  }, [load]);

  const card = queue[0];

  const flip = useCallback(() => {
    if (!card || flipped) return;
    setFlipped(true);
    speakGerman(card.gender ? `${card.gender} ${card.lemma}` : card.lemma);
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
        // keep those in this session's queue.
        const next = isDueSoon(updated.due) ? [...rest, { ...card, ...updated }] : rest;
        if (next.length === 0) setPhase("done");
        return next;
      });
    },
    [card, flipped],
  );

  // Space flips, 1–4 grades — keyboard-first review.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flip();
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(Number(e.key) as 1 | 2 | 3 | 4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, grade, flipped]);

  const newCount = queue.filter((c) => c.state === 0).length;
  const reviewCount = queue.length - newCount;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-medium">Foundations</h1>
        {phase === "review" && (
          <span className="text-xs tabular-nums text-muted">
            {newCount} New | {reviewCount} Review
          </span>
        )}
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        {phase === "loading" && (
          <p className="text-sm text-muted">Karten werden geladen …</p>
        )}

        {phase === "generating" && (
          <p className="text-sm text-muted">Neue Wörter werden generiert …</p>
        )}

        {phase === "error" && (
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted">{errorMsg}</p>
            <button
              onClick={() => load()}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-border-strong"
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {(phase === "empty" || phase === "done") && (
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <p className="text-sm">
              {phase === "done"
                ? "Fertig. Alles ist gelernt."
                : "Keine Karten fällig."}
            </p>
            {limitMsg ? (
              <>
                <p className="text-sm text-muted">{limitMsg}</p>
                <Link
                  href="/login"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
                >
                  Konto erstellen
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={generate}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <Sparkles size={14} strokeWidth={1.75} />
                  Neue Wörter generieren
                </button>
                <p className="text-xs text-muted">
                  Generiert 10 Wörter per KI — nur auf Klick, nie automatisch.
                </p>
              </>
            )}
          </div>
        )}

        {phase === "review" && card && (
          <>
            {/* Card */}
            <button
              onClick={flip}
              lang="de"
              className="flex min-h-64 w-full max-w-md flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-8 py-10 text-center transition-colors hover:border-border-strong"
            >
              {!flipped ? (
                <>
                  <span className="text-3xl font-medium">
                    {card.gender ? `${card.gender} ${card.lemma}` : card.lemma}
                  </span>
                  <span className="text-xs text-muted">{card.pos}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium">
                      {card.gender ? `${card.gender} ${card.lemma}` : card.lemma}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Play audio"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakGerman(
                          card.gender ? `${card.gender} ${card.lemma}` : card.lemma,
                        );
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
                </>
              )}
            </button>

            {/* Grade bar / flip hint */}
            {flipped ? (
              <div className="flex gap-2">
                <GradeButton label="Again" hint="1" tone="negative" onClick={() => grade(1)} />
                <GradeButton label="Hard" hint="2" tone="muted" onClick={() => grade(2)} />
                <GradeButton label="Good" hint="3" tone="accent" onClick={() => grade(3)} />
                <GradeButton label="Easy" hint="4" tone="positive" onClick={() => grade(4)} />
              </div>
            ) : (
              <p className="text-xs text-muted">
                <kbd className="rounded border border-border px-1.5 py-0.5">Space</kbd>{" "}
                zum Umdrehen
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const tones = {
  negative: "text-negative hover:border-negative/40",
  muted: "text-muted hover:border-border-strong",
  accent: "text-accent hover:border-accent/40",
  positive: "text-positive hover:border-positive/40",
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
      className={`flex w-24 flex-col items-center gap-0.5 rounded-lg border border-border bg-surface py-2.5 text-sm transition-colors ${tones[tone]}`}
    >
      {label}
      <span className="text-[10px] text-muted">{hint}</span>
    </button>
  );
}
