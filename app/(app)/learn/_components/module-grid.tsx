"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { getActiveLanguageCode } from "@/lib/languages";
import { CORE, cellTarget, nextLevel, themeOrder } from "@/lib/curriculum";
import { PURPOSES } from "@/lib/purposes";
import { usePurpose } from "@/lib/use-purpose";
import type { CefrLevel } from "@/lib/types";
import { PurposeBanner } from "@/components/purpose-focus";

/** One curriculum module = one (level, theme) cell of the shared catalog. */
export interface ModuleStat {
  theme: string;
  /** Words this module holds once complete. */
  target: number;
  /** Words from it already in the learner's deck. */
  owned: number;
  /** Owned but never reviewed (state 0) — the batch still being learned. */
  unseen: number;
}

/** Display name for a module ("core" → "Essentials"). */
export function moduleLabel(theme: string): string {
  if (theme === CORE) return "Essentials";
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

/**
 * The Learn-new home: every module of the current level as a card with
 * its own progress bar, ordered by the learner's purpose (business
 * front-loads "Work & study", travel "Travel & transport", …). Learning
 * happens in batches: a module only offers the next 10 words once the
 * previous batch has been seen.
 */
export function ModuleGrid({
  level,
  refreshKey,
  onStart,
  onAdvance,
}: {
  level: CefrLevel;
  /** Bump to refetch (e.g. after a finished session). */
  refreshKey: number;
  onStart: (stat: ModuleStat) => void;
  onAdvance: (next: CefrLevel) => void;
}) {
  const { purpose, setPurpose } = usePurpose();
  const [stats, setStats] = useState<ModuleStat[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSession();
        const lang = getActiveLanguageCode();

        // Curriculum cards the learner owns at this level, with their
        // module; freq_rank filters out loose Immerse pickups.
        const { data: owned, error } = await supabase
          .from("user_words")
          .select("state, words!inner(theme, language, cefr_level, freq_rank)")
          .eq("words.language", lang)
          .eq("words.cefr_level", level)
          .not("words.freq_rank", "is", null)
          .limit(2000);
        if (error) throw error;
        if (cancelled) return;

        const counts = new Map<string, { owned: number; unseen: number }>();
        for (const row of owned ?? []) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const theme = (row as any).words?.theme as string | null;
          if (!theme) continue;
          const c = counts.get(theme) ?? { owned: 0, unseen: 0 };
          c.owned += 1;
          if (row.state === 0) c.unseen += 1;
          counts.set(theme, c);
        }

        const order = themeOrder(
          level,
          purpose ? PURPOSES[purpose].boostThemes : [],
        );
        setStats(
          order.map((theme) => ({
            theme,
            target: cellTarget(theme, level),
            owned: counts.get(theme)?.owned ?? 0,
            unseen: counts.get(theme)?.unseen ?? 0,
          })),
        );
      } catch (err) {
        console.error("[modules]", err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [level, refreshKey, purpose]);

  if (failed) {
    return (
      <p className="pt-16 text-center text-sm text-muted">
        Modules could not be loaded - please try again.
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16">
        <Loader2 size={20} strokeWidth={1.75} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading modules ...</p>
      </div>
    );
  }

  const allComplete = stats.every((s) => s.owned >= s.target);
  const next = nextLevel(level);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <PurposeBanner purpose={purpose} onChange={setPurpose} />

      <p className="eyebrow mt-5 text-[11px] text-muted">
        {level} modules{purpose ? " · ordered for your focus" : ""} · learn 10
        words at a time
      </p>

      {allComplete && next && (
        <div className="pop-in mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="text-sm">
            Every <span className="font-semibold">{level}</span> module is
            complete. Ready for <span className="font-semibold">{next}</span>?
          </p>
          <button
            onClick={() => onAdvance(next)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
          >
            Move to {next}
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const complete = s.owned >= s.target;
          const pct = Math.min(100, Math.round((s.owned / s.target) * 100));
          return (
            <div
              key={s.theme}
              className="flex flex-col gap-3 rounded-md border-[1.5px] border-border-strong bg-surface-raised p-5 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{moduleLabel(s.theme)}</p>
                {complete && (
                  <CheckCircle2
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-positive"
                    aria-label="Module complete"
                  />
                )}
              </div>

              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${moduleLabel(s.theme)} progress`}
                className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.07]"
              >
                <div
                  className={`h-full rounded-full ${complete ? "bg-positive" : "bg-accent"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs tabular-nums text-muted">
                {s.owned} / {s.target} words
              </p>

              {complete ? (
                <p className="mt-auto text-xs text-muted">
                  Done - these words now live in your reviews.
                </p>
              ) : (
                <button
                  onClick={() => onStart(s)}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.98]"
                >
                  {s.unseen > 0 ? (
                    <>
                      <ArrowRight size={13} strokeWidth={2} />
                      Continue · {s.unseen} to learn
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} strokeWidth={2} />
                      {s.owned > 0 ? "Next 10 words" : "Start · first 10 words"}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
