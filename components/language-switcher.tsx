"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import {
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  getActiveLanguageCode,
  getLanguage,
  setActiveLanguageCode,
} from "@/lib/languages";
import { useCefrLevel } from "@/lib/use-cefr-level";

/**
 * Language switcher — picking a language swaps the whole environment
 * (cards, decks, conversations, immerse texts and CEFR level), so a
 * switch persists the choice and reloads into the new environment.
 *
 * Two layouts share the logic: `full` for the desktop sidebar (flag +
 * name + level) and `compact` for the mobile header (flag + level).
 */
export function LanguageSwitcher({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const [code, setCode] = useState(getLanguage(null).code);
  // Shared, live level — kept in sync with the Foundations/Immerse pickers.
  const { level, loaded } = useCefrLevel();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Settle to the learner's real active language once mounted.
  useEffect(() => {
    setCode(getActiveLanguageCode());
  }, []);

  // Close the menu on any outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = getLanguage(code);

  const switchTo = async (next: string) => {
    if (next === code || switching) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    try {
      const session = await ensureSession();
      // Make sure the target language has a learner-state row (level A1).
      await supabase
        .from("user_languages")
        .upsert(
          { user_id: session.user.id, language: next },
          { onConflict: "user_id,language", ignoreDuplicates: true },
        );
      await supabase
        .from("profiles")
        .update({ target_language: next })
        .eq("id", session.user.id);
      setActiveLanguageCode(next);
      // Reload so every page refetches from the new environment.
      window.location.reload();
    } catch (err) {
      console.error("[language switch]", err);
      setSwitching(false);
    }
  };

  const menu = open && (
    <div
      className={`absolute z-50 overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-pop ${
        variant === "full" ? "left-0 top-full mt-2 w-56" : "right-0 top-full mt-2 w-48"
      }`}
    >
      <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
        Language
      </p>
      {SUPPORTED_LANGUAGES.map((c) => {
        const lang = LANGUAGES[c];
        const isActive = c === code;
        return (
          <button
            key={c}
            onClick={() => switchTo(c)}
            disabled={switching}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 disabled:opacity-60 ${
              isActive
                ? "bg-accent-soft text-accent"
                : "text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <span aria-hidden className="text-base leading-none">{lang.flag}</span>
            <span className="flex-1">{lang.nativeName}</span>
            {isActive && <Check size={15} strokeWidth={2} className="text-accent" />}
          </button>
        );
      })}
    </div>
  );

  if (variant === "compact") {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Switch language"
          aria-expanded={open}
          className="flex items-center gap-1 rounded-md px-1 py-1 text-xs font-medium tracking-wide text-muted transition-colors duration-150 hover:text-foreground"
        >
          <span aria-hidden className="text-sm leading-none">{active.flag}</span>
          {loaded && <span className="text-accent">{level}</span>}
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium tracking-wide text-muted shadow-xs transition-colors duration-150 hover:border-border-strong hover:text-foreground"
      >
        <span aria-hidden className="text-sm leading-none">{active.flag}</span>
        {active.nativeName}
        {loaded && <span className="text-accent">· {level}</span>}
        <ChevronsUpDown size={12} strokeWidth={1.75} className="text-muted" />
      </button>
      {menu}
    </div>
  );
}
