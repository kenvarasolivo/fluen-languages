"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Inbox, Library, Loader2, Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { Lemma } from "@/components/lemma";
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
  pinyin: string | null;
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

// First letter used by the A–Z filter. Falls back to pinyin for scripts
// without a Latin alphabet (e.g. Mandarin), then to "#" for anything else.
function firstLetter(card: { lemma: string; pinyin: string | null }) {
  const src = (card.pinyin ?? card.lemma).trim();
  const ch = src.charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const NO_POS = "—";
const ALL = "all";

export function CardCatalog() {
  const language = useActiveLanguage();
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<CatalogCard[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [posFilter, setPosFilter] = useState<string>(ALL);
  const [letterFilter, setLetterFilter] = useState<string>(ALL);
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
            "id, state, due, created_at, source, context_sentence, words!inner(lemma, pinyin, gender, pos, meaning_en, cefr_level, language)",
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

  // Part-of-speech options, most common first. Built from the CEFR-filtered
  // set so the chips track whatever level tab is active.
  const levelScoped = useMemo(
    () =>
      tab === "all"
        ? cards
        : cards.filter((c) => (c.cefr_level ?? NO_LEVEL) === tab),
    [cards, tab],
  );

  const posOptions = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of levelScoped) {
      const p = c.pos?.trim() || NO_POS;
      m.set(p, (m.get(p) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [levelScoped]);

  const letterOptions = useMemo(() => {
    const s = new Set<string>();
    for (const c of levelScoped) s.add(firstLetter(c));
    return [...s].sort();
  }, [levelScoped]);

  const visible = useMemo(
    () =>
      levelScoped.filter((c) => {
        if (posFilter !== ALL && (c.pos?.trim() || NO_POS) !== posFilter)
          return false;
        if (letterFilter !== ALL && firstLetter(c) !== letterFilter)
          return false;
        return true;
      }),
    [levelScoped, posFilter, letterFilter],
  );

  return (
    <div className="flex h-full flex-col">
      <header className="app-header topbar-inset mt-3 flex h-14 shrink-0 items-center justify-between gap-3 rounded-full px-5 shadow-raised sm:mt-4">
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
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 topbar-inset mt-2 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-xs">
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

          {/* Type + A–Z filters */}
          <div className="flex shrink-0 flex-col gap-2.5 topbar-inset mt-2 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-xs">
            {/* Part of speech */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="eyebrow mr-1 text-[10px] text-muted">Type</span>
              <button
                onClick={() => setPosFilter(ALL)}
                aria-pressed={posFilter === ALL}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors duration-150 ${
                  posFilter === ALL
                    ? "bg-foreground font-medium text-background"
                    : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
                }`}
              >
                All
              </button>
              {posOptions.map(([p, n]) => (
                <button
                  key={p}
                  onClick={() => setPosFilter(p)}
                  aria-pressed={posFilter === p}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors duration-150 ${
                    posFilter === p
                      ? "bg-foreground font-medium text-background"
                      : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
                  }`}
                >
                  {cap(p)}
                  <span
                    className={`ml-1.5 tabular-nums ${
                      posFilter === p ? "opacity-70" : "opacity-60"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              ))}
            </div>

            {/* Alphabet */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="eyebrow mr-1 text-[10px] text-muted">A–Z</span>
              <button
                onClick={() => setLetterFilter(ALL)}
                aria-pressed={letterFilter === ALL}
                className={`rounded-md px-2 py-1 text-xs transition-colors duration-150 ${
                  letterFilter === ALL
                    ? "bg-accent font-medium text-white"
                    : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
                }`}
              >
                All
              </button>
              {letterOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLetterFilter(l)}
                  aria-pressed={letterFilter === l}
                  className={`min-w-[1.75rem] rounded-md px-1.5 py-1 text-xs tabular-nums transition-colors duration-150 ${
                    letterFilter === l
                      ? "bg-accent font-medium text-white"
                      : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-3 pt-16 text-center">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-xs">
                    <Inbox size={20} strokeWidth={1.5} className="text-muted" />
                  </span>
                  {cards.length > 0 ? (
                    <>
                      <p className="max-w-xs text-sm leading-relaxed text-muted">
                        No cards match these filters.
                      </p>
                      <button
                        onClick={() => {
                          setTab("all");
                          setPosFilter(ALL);
                          setLetterFilter(ALL);
                        }}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <p className="max-w-xs text-sm leading-relaxed text-muted">
                      No cards yet. Generate some in Foundations or collect
                      words in Immerse.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((c) => {
                    const due = formatDue(c.due);
                    const dueNow = due === "due now";
                    const armed = confirmId === c.id;
                    return (
                      <li
                        key={c.id}
                        className="group relative flex aspect-[3/2] flex-col rounded-xl border-[1.5px] border-border-strong bg-surface-raised p-4 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop"
                        onMouseLeave={() =>
                          setConfirmId((id) => (id === c.id ? null : id))
                        }
                      >
                        {/* Top row: CEFR badge + delete */}
                        <div className="flex items-start justify-between">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              c.cefr_level
                                ? "bg-accent text-white"
                                : "border border-border text-muted"
                            }`}
                          >
                            {c.cefr_level ?? "–"}
                          </span>
                          <button
                            onClick={() => deleteCard(c.id)}
                            aria-label={armed ? "Confirm delete" : "Delete card"}
                            className={`-mr-1 -mt-1 shrink-0 rounded-md transition-colors duration-150 ${
                              armed
                                ? "pop-in bg-negative/10 px-2 py-1 text-negative"
                                : "p-1.5 text-muted hover:bg-negative/10 hover:text-negative sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                            }`}
                          >
                            {armed ? (
                              <span className="text-xs font-medium">Delete?</span>
                            ) : (
                              <Trash2 size={14} strokeWidth={1.75} />
                            )}
                          </button>
                        </div>

                        {/* Word + meaning */}
                        <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center">
                          <p className="text-xl font-semibold leading-tight tracking-tight">
                            <Lemma
                              language={language}
                              lemma={c.lemma}
                              pinyin={c.pinyin}
                              gender={c.gender}
                              lang={language.htmlLang}
                            />
                          </p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
                            {c.pos}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                            {c.meaning_en}
                          </p>
                        </div>

                        {/* Footer: state + due */}
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
                          <span className="text-muted">
                            {STATE_LABELS[c.state] ?? "-"}
                          </span>
                          <span
                            className={`tabular-nums ${
                              dueNow ? "font-medium text-accent" : "text-muted"
                            }`}
                          >
                            {due}
                          </span>
                        </div>
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
