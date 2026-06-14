"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Inbox, Library, Loader2, Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { withGender } from "@/lib/format";
import { getActiveLanguageCode } from "@/lib/languages";
import { useActiveLanguage } from "@/lib/use-active-language";

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
  0: "New",
  1: "Learning",
  2: "Review",
  3: "Relearning",
};

function formatDue(due: string) {
  const d = new Date(due);
  if (d.getTime() <= Date.now()) return "due now";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function CardCatalog() {
  const language = useActiveLanguage();
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
            "id, state, due, created_at, source, context_sentence, words!inner(lemma, gender, pos, meaning_en, cefr_level, language)",
          )
          .eq("words.language", getActiveLanguageCode())
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
      { id: "all", label: "All", count: cards.length },
    ];
    for (const lvl of LEVELS) {
      const count = counts.get(lvl) ?? 0;
      if (count > 0) t.push({ id: lvl, label: lvl, count });
    }
    if ((counts.get(NO_LEVEL) ?? 0) > 0) {
      t.push({ id: NO_LEVEL, label: "No level", count: counts.get(NO_LEVEL)! });
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
      <header className="app-header flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <h1 className="eyebrow text-sm text-white">Cards</h1>
        {phase === "ready" && (
          <span className="hdr-chip rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
        )}
      </header>

      {phase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading catalog ...</p>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface-raised shadow-xs">
            <AlertCircle size={18} strokeWidth={1.75} className="text-negative" />
          </span>
          <p className="text-sm text-muted">
            The catalog could not be loaded.
          </p>
        </div>
      )}

      {phase === "guest" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-surface-raised px-8 py-10 text-center shadow-raised">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft">
              <Library size={20} strokeWidth={1.75} className="text-accent" />
            </span>
            <p className="text-sm font-medium">The card catalog belongs to your account.</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              Create a free account to see all your saved cards - sorted by
              difficulty. The cards you already have will be kept.
            </p>
            <Link
              href="/login"
              className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {phase === "ready" && (
        <>
          {/* Difficulty tabs — "Alle" shows everything */}
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border bg-surface px-4 py-3 sm:px-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
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
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-3 pt-16 text-center">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-xs">
                    <Inbox size={20} strokeWidth={1.5} className="text-muted" />
                  </span>
                  <p className="max-w-xs text-sm leading-relaxed text-muted">
                    No cards yet. Generate some in Foundations or collect
                    words in Immerse.
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
                        className="group relative -mx-3 flex items-baseline gap-3 px-3 py-3.5 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-foreground/[0.025] sm:gap-4"
                        onMouseLeave={() =>
                          setConfirmId((id) => (id === c.id ? null : id))
                        }
                      >
                        <div className="min-w-0 flex-1">
                          <p lang={language.htmlLang} className="text-sm font-medium tracking-tight">
                            {withGender(c.gender, c.lemma)}
                            <span className="ml-2 text-xs font-normal text-muted">
                              {c.pos}
                            </span>
                          </p>
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {c.meaning_en}
                          </p>
                          {/* On phones the state/due columns collapse into
                              this secondary line. */}
                          <p className="mt-1 text-[11px] text-muted sm:hidden">
                            {STATE_LABELS[c.state] ?? "-"} ·{" "}
                            <span
                              className={
                                due === "due now" ? "font-medium text-accent" : ""
                              }
                            >
                              {due}
                            </span>
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${
                            c.cefr_level
                              ? "border border-accent/20 bg-accent-soft text-accent"
                              : "border border-border text-muted"
                          }`}
                        >
                          {c.cefr_level ?? "-"}
                        </span>
                        <span className="hidden w-24 shrink-0 text-right text-xs text-muted sm:block">
                          {STATE_LABELS[c.state] ?? "-"}
                        </span>
                        <span
                          className={`hidden w-20 shrink-0 text-right text-xs tabular-nums sm:block ${
                            due === "due now" ? "font-medium text-accent" : "text-muted"
                          }`}
                        >
                          {due}
                        </span>
                        <button
                          onClick={() => deleteCard(c.id)}
                          aria-label={
                            armed ? "Confirm delete" : "Delete card"
                          }
                          className={`shrink-0 self-center rounded-md transition-colors duration-150 ${
                            armed
                              ? "pop-in bg-negative/10 px-2 py-1 text-negative"
                              : "p-1.5 text-muted hover:bg-negative/10 hover:text-negative sm:p-1 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                          }`}
                        >
                          {armed ? (
                            <span className="text-xs font-medium">Delete?</span>
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
