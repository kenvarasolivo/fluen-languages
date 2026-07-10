"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Flag } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { getActiveLanguageCode } from "@/lib/languages";
import { useCefrLevel } from "@/lib/use-cefr-level";
import { levelWordTarget, nextLevel } from "@/lib/curriculum";
import type { CefrLevel } from "@/lib/types";

/**
 * Progress toward the next CEFR step. The denominator is the curriculum's
 * word target for the current level (core + all themes), so the bar
 * measures something real — vocabulary covered — rather than a made-up
 * score. It never claims certified attainment; the caption says so.
 */
export function LevelProgress() {
  const { level, loaded } = useCefrLevel();
  const [collected, setCollected] = useState<number | null>(null);
  const [goal, setGoal] = useState<CefrLevel | null>(null);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await ensureSession();
        const lang = getActiveLanguageCode();

        const [{ count }, { data: ul }] = await Promise.all([
          supabase
            .from("user_words")
            .select("*, words!inner(language, cefr_level)", {
              count: "exact",
              head: true,
            })
            .eq("words.language", lang)
            .eq("words.cefr_level", level),
          supabase
            .from("user_languages")
            .select("goal_level")
            .eq("user_id", session.user.id)
            .eq("language", lang)
            .maybeSingle(),
        ]);

        if (cancelled) return;
        setCollected(count ?? 0);
        setGoal((ul?.goal_level as CefrLevel | undefined) ?? null);
      } catch (err) {
        console.error("[level progress]", err);
        if (!cancelled) setCollected(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, level]);

  const target = levelWordTarget(level);
  const next = nextLevel(level);
  const pct =
    collected === null ? 0 : Math.min(100, Math.round((collected / target) * 100));

  return (
    <section className="fade-up fade-up-1 w-full max-w-4xl rounded-md border-[1.5px] border-border-strong bg-surface-raised px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-1.5 text-[11px] text-muted">
          <TrendingUp size={13} strokeWidth={2} aria-hidden className="text-accent" />
          {next ? `Progress to ${next}` : `${level} vocabulary`}
        </p>
        {goal && (
          <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
            <Flag size={11} strokeWidth={2} aria-hidden className="text-accent" />
            Goal: {goal}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight">
          {level}
          {next && <span className="text-muted"> → {next}</span>}
        </p>
        <p className="text-sm tabular-nums text-muted">
          {collected === null ? "–" : `${collected} of ~${target} words`}
        </p>
      </div>

      {/* Meter — track + accent fill, value carried by the text above. */}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={next ? `Vocabulary progress toward ${next}` : `${level} vocabulary coverage`}
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-foreground/[0.07]"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        {next
          ? `${pct}% of the ${level} vocabulary collected — cover it all and you're ready to step up to ${next}.`
          : `You're at the top of the curriculum — keep collecting.`}
      </p>
    </section>
  );
}
