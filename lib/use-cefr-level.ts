"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, ensureSession } from "@/lib/supabase";
import { getActiveLanguageCode } from "@/lib/languages";
import type { CefrLevel } from "@/lib/types";

const LEVELS: readonly CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function sanitize(l: string | null | undefined): CefrLevel {
  return LEVELS.includes((l ?? "") as CefrLevel) ? (l as CefrLevel) : "A1";
}

/** Broadcast so every mounted consumer re-syncs without a page reload. */
const LEVEL_EVENT = "fluen:cefr-level";

/**
 * Shared CEFR level for the active language. `user_languages.cefr_level`
 * is the single source of truth: every screen that shows or changes the
 * level (sidebar, dashboard, Foundations, Immerse) reads it through this
 * hook, and `setLevel` persists the change and broadcasts it so the other
 * mounted screens update immediately — change it once, it changes
 * everywhere.
 */
export function useCefrLevel() {
  const [level, setLevelState] = useState<CefrLevel>("A1");
  const [loaded, setLoaded] = useState(false);

  // Settle to the learner's real level for the active language on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await ensureSession();
        const { data } = await supabase
          .from("user_languages")
          .select("cefr_level")
          .eq("user_id", session.user.id)
          .eq("language", getActiveLanguageCode())
          .maybeSingle();
        if (!cancelled) setLevelState(sanitize(data?.cefr_level));
      } catch {
        if (!cancelled) setLevelState("A1");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep sibling instances in sync within the same page session.
  useEffect(() => {
    const onChange = (e: Event) =>
      setLevelState((e as CustomEvent<CefrLevel>).detail);
    window.addEventListener(LEVEL_EVENT, onChange);
    return () => window.removeEventListener(LEVEL_EVENT, onChange);
  }, []);

  const setLevel = useCallback(async (next: CefrLevel) => {
    setLevelState(next);
    window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: next }));
    try {
      const session = await ensureSession();
      const { error } = await supabase
        .from("user_languages")
        .upsert(
          {
            user_id: session.user.id,
            language: getActiveLanguageCode(),
            cefr_level: next,
          },
          { onConflict: "user_id,language" },
        );
      if (error) throw error;
    } catch (err) {
      console.error("[cefr level]", err);
    }
  }, []);

  return { level, setLevel, loaded };
}
