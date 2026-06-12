"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Inbox, Library, Loader2, Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { withGender } from "@/lib/format";

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
  // Two-step delete: first click arms the row, second click deletes.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const deleteCard = async (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    const prev = cards;
    setCards((cs) => cs.filter((c) => c.id !== id)); // optimistic
    const { error } = await supabase.from("user_words").delete().eq("id", id);
    if (error) {
      console.error("[cards delete]", error);
      setCards(prev);
    }
  };

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
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
        <h1 className="text-sm font-semibold tracking-tight">Cards</h1>
        {phase === "ready" && (
          <span className="rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted shadow-xs">
            {cards.length} {cards.length === 1 ? "Karte" : "Karten"}
          </span>
        )}
      </header>

      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Katalog wird geladen …</p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface-raised shadow-xs">
            <AlertCircle size={18} strokeWidth={1.75} className="text-negative" />
          </span>
          <p className="text-sm text-muted">
            Katalog konnte nicht geladen werden.
          </p>
        </div>
      )}

      {phase === "guest" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-surface-raised px-8 py-10 text-center shadow-raised">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft">
              <Library size={20} strokeWidth={1.75} className="text-accent" />
            </span>
            <p className="text-sm font-medium">Der Kartenkatalog gehört zu deinem Konto.</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Erstelle ein kostenloses Konto, um alle gespeicherten Karten zu
              sehen — sortiert nach Schwierigkeit. Deine bisherigen Karten
              bleiben dabei erhalten.
            </p>
            <Link
              href="/login"
              className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
            >
              Konto erstellen
            </Link>
          </div>
        </div>
      )}

      {phase === "ready" && (
        <>
          {/* Difficulty tabs — "Alle" shows everything */}
          <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-surface px-6 py-2.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors duration-150 ${
                  tab === t.id
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 tabular-nums ${
                    tab === t.id ? "text-accent/70" : "opacity-60"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-6">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-3 pt-16 text-center">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-xs">
                    <Inbox size={20} strokeWidth={1.5} className="text-muted" />
                  </span>
                  <p className="max-w-xs text-sm leading-relaxed text-muted">
                    Noch keine Karten. Generiere welche in Foundations oder
                    sammle Wörter in Immerse.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {visible.map((c) => {
                    const due = formatDue(c.due);
                    const armed = confirmId === c.id;
                    return (
                      <li
                        key={c.id}
                        className="group relative -mx-3 flex items-baseline gap-4 px-3 py-3.5 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-foreground/[0.025]"
                        onMouseLeave={() =>
                          setConfirmId((id) => (id === c.id ? null : id))
                        }
                      >
                        <div className="min-w-0 flex-1">
                          <p lang="de" className="text-sm font-medium tracking-tight">
                            {withGender(c.gender, c.lemma)}
                            <span className="ml-2 text-xs font-normal text-muted">
                              {c.pos}
                            </span>
                          </p>
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {c.meaning_en}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${
                            c.cefr_level
                              ? "border border-accent/20 bg-accent-soft text-accent"
                              : "border border-border text-muted"
                          }`}
                        >
                          {c.cefr_level ?? "—"}
                        </span>
                        <span className="w-24 shrink-0 text-right text-xs text-muted">
                          {STATE_LABELS[c.state] ?? "—"}
                        </span>
                        <span
                          className={`w-20 shrink-0 text-right text-xs tabular-nums ${
                            due === "jetzt fällig" ? "font-medium text-accent" : "text-muted"
                          }`}
                        >
                          {due}
                        </span>
                        <button
                          onClick={() => deleteCard(c.id)}
                          aria-label={
                            armed ? "Löschen bestätigen" : "Karte löschen"
                          }
                          className={`shrink-0 self-center rounded-md transition-colors duration-150 ${
                            armed
                              ? "pop-in bg-negative/10 px-2 py-1 text-negative"
                              : "p-1 text-muted opacity-0 hover:bg-negative/10 hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
                          }`}
                        >
                          {armed ? (
                            <span className="text-xs font-medium">Löschen?</span>
                          ) : (
                            <Trash2 size={14} strokeWidth={1.75} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
