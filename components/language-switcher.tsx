"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown, Sparkles, X } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import {
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  PENDING_ONBOARD_KEY,
  getActiveLanguageCode,
  getLanguage,
  setActiveLanguageCode,
} from "@/lib/languages";
import { useCefrLevel } from "@/lib/use-cefr-level";

/**
 * Language switcher — picking a language swaps the whole environment
 * (cards, decks, conversations, immerse texts and CEFR level), so a
 * switch goes through a confirm dialog, then persists the choice and
 * reloads into the new environment. The first time a learner opens a
 * language they've never studied, the confirm flags it so the onboarding
 * questionnaire runs for it after the reload.
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
  const ref = useRef<HTMLDivElement>(null);

  // The language awaiting confirmation, plus whether it's one the learner
  // has never studied (drives the confirm copy + the onboarding flag).
  const [pending, setPending] = useState<string | null>(null);
  const [pendingIsNew, setPendingIsNew] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(false);

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

  // Arm the confirm dialog for a picked language, and find out whether the
  // learner has a state row for it yet (i.e. has ever studied it).
  const arm = async (next: string) => {
    setOpen(false);
    if (next === code) return;
    setPending(next);
    setPendingIsNew(false);
    setError(false);
    try {
      const session = await ensureSession();
      const { data } = await supabase
        .from("user_languages")
        .select("language")
        .eq("user_id", session.user.id)
        .eq("language", next)
        .maybeSingle();
      setPendingIsNew(!data);
    } catch {
      // Best-effort — if we can't tell, treat it as an existing language.
    }
  };

  const confirmSwitch = async () => {
    if (!pending) return;
    setSwitching(true);
    setError(false);
    try {
      const session = await ensureSession();
      // Make sure the target language has a learner-state row (level A1).
      await supabase
        .from("user_languages")
        .upsert(
          { user_id: session.user.id, language: pending },
          { onConflict: "user_id,language", ignoreDuplicates: true },
        );
      await supabase
        .from("profiles")
        .update({ target_language: pending })
        .eq("id", session.user.id);
      setActiveLanguageCode(pending);
      // A never-studied language gets the onboarding questionnaire after
      // the reload; an already-known one just swaps environments.
      try {
        if (pendingIsNew) localStorage.setItem(PENDING_ONBOARD_KEY, pending);
      } catch {
        /* ignore storage failure — the switch still works */
      }
      // Reload so every page refetches from the new environment.
      window.location.reload();
    } catch (err) {
      console.error("[language switch]", err);
      setError(true);
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
            onClick={() => arm(c)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
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

  const trigger =
    variant === "compact" ? (
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-1 py-1 text-xs font-medium tracking-wide text-muted transition-colors duration-150 hover:text-foreground"
      >
        <span aria-hidden className="text-sm leading-none">{active.flag}</span>
        {loaded && <span className="text-accent">{level}</span>}
      </button>
    ) : (
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
    );

  return (
    <div ref={ref} className="relative">
      {trigger}
      {menu}
      {pending && (
        <SwitchConfirm
          from={active}
          to={getLanguage(pending)}
          isNew={pendingIsNew}
          switching={switching}
          error={error}
          onConfirm={confirmSwitch}
          onCancel={() => !switching && setPending(null)}
        />
      )}
    </div>
  );
}

/**
 * Confirm dialog for a language switch. Portalled to <body> so it escapes
 * the sidebar's re-scoped theme tokens (which would otherwise render white
 * text on white cards).
 */
function SwitchConfirm({
  from,
  to,
  isNew,
  switching,
  error,
  onConfirm,
  onCancel,
}: {
  from: ReturnType<typeof getLanguage>;
  to: ReturnType<typeof getLanguage>;
  isNew: boolean;
  switching: boolean;
  error: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="pop-in w-full max-w-md rounded-2xl border-[1.5px] border-border-strong bg-surface-raised p-6 shadow-pop sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-[11px] text-muted">Switch language</p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <span aria-hidden className="text-2xl leading-none">{to.flag}</span>
              {to.nativeName}
            </h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          Switch from{" "}
          <span className="font-semibold text-foreground">{from.nativeName}</span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">{to.name}</span>? This
          swaps your whole environment — cards, decks, conversations and Immerse
          texts — and reloads the app. Your {from.name} progress is kept.
        </p>

        {isNew && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
            <Sparkles
              size={16}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-accent"
              aria-hidden
            />
            <p className="text-xs leading-relaxed">
              First time with {to.name} — we&apos;ll ask a couple of quick
              questions (your level and what you&apos;re learning it for) to set
              it up.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-negative">
            Could not switch — please try again.
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={switching}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={switching}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-accent/90 disabled:opacity-40"
          >
            {switching ? "Switching …" : isNew ? "Set up & switch" : "Switch"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
