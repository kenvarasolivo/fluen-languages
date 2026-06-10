"use client";

import { useEffect, useState } from "react";
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
    { label: "Due now", value: stats?.due },
    { label: "New cards", value: stats?.fresh },
    { label: "Words collected", value: stats?.total },
    { label: "Reviews today", value: stats?.reviewsToday },
  ];

  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="bg-surface px-5 py-6 text-center">
          <p className="text-2xl font-medium tabular-nums">
            {t.value ?? "–"}
          </p>
          <p className="mt-1 text-xs text-muted">{t.label}</p>
        </div>
      ))}
    </div>
  );
}
