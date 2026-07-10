"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, ensureSession } from "@/lib/supabase";
import { getActiveLanguageCode } from "@/lib/languages";
import { sanitizePurpose, type Purpose } from "@/lib/purposes";

/** Broadcast so every mounted consumer re-syncs without a page reload. */
const PURPOSE_EVENT = "fluen:purpose";

/**
 * Shared learning purpose for the active language.
 * `user_languages.purpose` is the single source of truth: the sidebar
 * focus chip and the Foundations banner both read it through this hook,
 * and `setPurpose` persists the change and broadcasts it so the other
 * mounted screens (module order, and — server-side — Speak and Immerse)
 * follow immediately. Mirrors `useCefrLevel`.
 */
export function usePurpose() {
  const [purpose, setPurposeState] = useState<Purpose | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Settle to the learner's real purpose for the active language on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await ensureSession();
        const { data } = await supabase
          .from("user_languages")
          .select("purpose")
          .eq("user_id", session.user.id)
          .eq("language", getActiveLanguageCode())
          .maybeSingle();
        if (!cancelled) setPurposeState(sanitizePurpose(data?.purpose));
      } catch {
        if (!cancelled) setPurposeState(null);
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
      setPurposeState((e as CustomEvent<Purpose | null>).detail);
    window.addEventListener(PURPOSE_EVENT, onChange);
    return () => window.removeEventListener(PURPOSE_EVENT, onChange);
  }, []);

  const setPurpose = useCallback(async (next: Purpose) => {
    setPurposeState(next);
    window.dispatchEvent(new CustomEvent(PURPOSE_EVENT, { detail: next }));
    try {
      const session = await ensureSession();
      // Only the purpose column is written — the primary-key defaults
      // keep cefr_level/goal_level untouched on conflict.
      const { error } = await supabase.from("user_languages").upsert(
        {
          user_id: session.user.id,
          language: getActiveLanguageCode(),
          purpose: next,
        },
        { onConflict: "user_id,language" },
      );
      if (error) throw error;
    } catch (err) {
      console.error("[purpose]", err);
      throw err;
    }
  }, []);

  return { purpose, setPurpose, loaded };
}
