"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlarmClock, Sparkles, Library, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";

interface Stats {
  due: number;
  fresh: number;
  total: number;
  reviewsToday: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        const now = new Date().toISOString();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = (q: PromiseLike<{ count: number | null }>) =>
          q.then((r) => r.count ?? 0);

        const [due, fresh, total, reviewsToday] = await Promise.all([
          count(
            supabase
              .from("user_words")
              .select("*", { count: "exact", head: true })
              .gt("state", 0)
              .lte("due", now),
          ),
          count(
            supabase
              .from("user_words")
              .select("*", { count: "exact", head: true })
              .eq("state", 0),
          ),
          count(
            supabase.from("user_words").select("*", { count: "exact", head: true }),
          ),
          count(
            supabase
              .from("review_logs")
              .select("*", { count: "exact", head: true })
              .gte("reviewed_at", startOfDay.toISOString()),
          ),
        ]);

        setStats({ due, fresh, total, reviewsToday });
      } catch (err) {
        console.error("[dashboard]", err);
        setStats({ due: 0, fresh: 0, total: 0, reviewsToday: 0 });
      }
    })();
  }, []);

  const tiles = [
    {
      label: "Due now",
      value: stats?.due,
      icon: AlarmClock,
      chip: "bg-coral-soft text-coral",
      number: "text-coral",
    },
    {
      label: "New cards",
      value: stats?.fresh,
      icon: Sparkles,
      chip: "bg-accent-soft text-accent",
      number: "text-accent",
    },
    {
      label: "Words collected",
      value: stats?.total,
      icon: Library,
      chip: "bg-teal-soft text-teal",
      number: "text-teal",
    },
    {
      label: "Reviews today",
      value: stats?.reviewsToday,
      icon: CheckCircle2,
      chip: "bg-amber-soft text-amber",
      number: "text-amber",
    },
  ];

  return (
    <div className="fade-up fade-up-1 flex w-full max-w-2xl flex-col items-center gap-6">
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, chip, number }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-raised px-4 pb-5 pt-5 text-center shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className={`flex size-9 items-center justify-center rounded-xl ${chip}`}>
              <Icon size={16} strokeWidth={1.75} aria-hidden />
            </span>
            <p
              className={`text-3xl font-semibold tabular-nums tracking-tight ${
                value === undefined
                  ? "text-muted"
                  : (value ?? 0) > 0
                    ? number
                    : ""
              }`}
            >
              {value ?? "–"}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Gentle nudge driven by the real numbers — no invented streaks. */}
      {stats && stats.due > 0 && (
        <Link
          href="/learn"
          className="group flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-muted shadow-xs transition-all duration-150 hover:border-border-strong hover:text-foreground"
        >
          {stats.due === 1
            ? "Eine Karte wartet auf dich"
            : `${stats.due} Karten warten auf dich`}
          <ArrowRight
            size={14}
            aria-hidden
            className="text-accent transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </Link>
      )}
      {stats && stats.due === 0 && stats.reviewsToday > 0 && (
        <p className="flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-muted shadow-xs">
          <CheckCircle2 size={14} className="text-positive" aria-hidden />
          Alles erledigt für heute — schön gemacht!
        </p>
      )}
    </div>
  );
}
