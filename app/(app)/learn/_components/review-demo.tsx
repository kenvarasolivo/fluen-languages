"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { DECK_STORAGE_KEY, type DemoWord } from "@/lib/types";

type Phase = "loading" | "review" | "done" | "error";

interface QueueCard extends DemoWord {
  isReview: boolean; // requeued via "Again"
}

function speakGerman(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.92;
  speechSynthesis.speak(u);
}

export function ReviewDemo() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<QueueCard[]>([]);
  const [flipped, setFlipped] = useState(false);

  const load = useCallback(async () => {
    setPhase("loading");
    setFlipped(false);

    // Words saved from Immerse ("Add to SRS") come first — the Bridge.
    let saved: DemoWord[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(DECK_STORAGE_KEY) ?? "[]");
    } catch {
      saved = [];
    }

    try {
      const res = await fetch("/api/foundations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "B1", count: 10 }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { words } = (await res.json()) as { words: DemoWord[] };

      const seen = new Set(saved.map((w) => w.lemma.toLowerCase()));
      const fresh = words.filter((w) => !seen.has(w.lemma.toLowerCase()));
      setQueue([...saved, ...fresh].map((w) => ({ ...w, isReview: false })));
      setPhase("review");
    } catch {
      setPhase("error");
    }
  }, []);

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
      setFlipped(false);
      setQueue((prev) => {
        const [current, ...rest] = prev;
        // "Again" requeues the card at the end; everything else retires it.
        const next = rating === 1 ? [...rest, { ...current, isReview: true }] : rest;
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

  const newCount = queue.filter((c) => !c.isReview).length;
  const reviewCount = queue.filter((c) => c.isReview).length;

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
          <p className="text-sm text-muted">Wörter werden generiert …</p>
        )}

        {phase === "error" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted">Generierung fehlgeschlagen.</p>
            <button
              onClick={load}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-border-strong"
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm">Fertig.</p>
            <button
              onClick={load}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              Neue Wörter
            </button>
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
                  <div className="mt-2 border-t border-border pt-4">
                    <p className="text-sm leading-relaxed">{card.example_de}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {card.example_en}
                    </p>
                  </div>
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
