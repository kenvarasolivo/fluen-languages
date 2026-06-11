"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, ensureSession } from "@/lib/supabase";

interface CatalogCard {
  id: string;
  state: number;
  due: string;
  created_at: string;
  source: string;
  context_sentence: string | null;
  lemma: string;
  gender: string | null;
  pos: string;
  meaning_en: string;
  cefr_level: string | null;
}

type Phase = "loading" | "guest" | "ready" | "error";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const NO_LEVEL = "–";

const STATE_LABELS: Record<number, string> = {
  0: "Neu",
  1: "Lernen",
  2: "Wiederholen",
  3: "Neu lernen",
};

function formatDue(due: string) {
  const d = new Date(due);
  if (d.getTime() <= Date.now()) return "jetzt fällig";
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function CardCatalog() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<CatalogCard[]>([]);
  const [tab, setTab] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const session = await ensureSession();
        // The catalog is an account feature — guests only have a demo
        // deck and get the upgrade prompt instead.
        if (session.user.is_anonymous) {
          setPhase("guest");
          return;
        }

        const { data, error } = await supabase
          .from("user_words")
          .select(
            "id, state, due, created_at, source, context_sentence, words(lemma, gender, pos, meaning_en, cefr_level)",
          )
          .order("created_at", { ascending: false });
        if (error) throw error;

        setCards(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any[]).map(({ words, ...rest }) => ({ ...rest, ...words })),
        );
        setPhase("ready");
      } catch (err) {
        console.error("[cards]", err);
        setPhase("error");
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const card of cards) {
      const lvl = card.cefr_level ?? NO_LEVEL;
      c.set(lvl, (c.get(lvl) ?? 0) + 1);
    }
    return c;
  }, [cards]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string; count: number }[] = [
      { id: "all", label: "Alle", count: cards.length },
    ];
    for (const lvl of LEVELS) {
      const count = counts.get(lvl) ?? 0;
      if (count > 0) t.push({ id: lvl, label: lvl, count });
    }
    if ((counts.get(NO_LEVEL) ?? 0) > 0) {
      t.push({ id: NO_LEVEL, label: "Ohne Level", count: counts.get(NO_LEVEL)! });
    }
    return t;
  }, [cards.length, counts]);

  const visible = useMemo(
    () =>
      tab === "all"
        ? cards
        : cards.filter((c) => (c.cefr_level ?? NO_LEVEL) === tab),
    [cards, tab],
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-medium">Cards</h1>
        {phase === "ready" && (
          <span className="text-xs tabular-nums text-muted">
            {cards.length} {cards.length === 1 ? "Karte" : "Karten"}
          </span>
        )}
      </header>

      {phase === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted">Katalog wird geladen …</p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted">
            Katalog konnte nicht geladen werden.
          </p>
        </div>
      )}

      {phase === "guest" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm">Der Kartenkatalog gehört zu deinem Konto.</p>
          <p className="max-w-xs text-xs leading-relaxed text-muted">
            Erstelle ein kostenloses Konto, um alle gespeicherten Karten zu
            sehen — sortiert nach Schwierigkeit. Deine bisherigen Karten
            bleiben dabei erhalten.
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Konto erstellen
          </Link>
        </div>
      )}

      {phase === "ready" && (
        <>
          {/* Difficulty tabs — "Alle" shows everything */}
          <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-6 py-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  tab === t.id
                    ? "bg-accent-soft text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums opacity-60">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-6">
              {visible.length === 0 ? (
                <p className="pt-10 text-center text-sm text-muted">
                  Noch keine Karten. Generiere welche in Foundations oder
                  sammle Wörter in Immerse.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {visible.map((c) => (
                    <li key={c.id} className="flex items-baseline gap-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p lang="de" className="text-sm font-medium">
                          {c.gender ? `${c.gender} ${c.lemma}` : c.lemma}
                          <span className="ml-2 text-xs font-normal text-muted">
                            {c.pos}
                          </span>
                        </p>
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {c.meaning_en}
                        </p>
                      </div>
                      <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
                        {c.cefr_level ?? "—"}
                      </span>
                      <span className="w-24 shrink-0 text-right text-xs text-muted">
                        {STATE_LABELS[c.state] ?? "—"}
                      </span>
                      <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted">
                        {formatDue(c.due)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
