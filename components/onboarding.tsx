"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Clapperboard,
  GraduationCap,
  MessageCircle,
  Plane,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import {
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  PENDING_ONBOARD_KEY,
  getActiveLanguageCode,
  setActiveLanguageCode,
} from "@/lib/languages";
import { PURPOSES, PURPOSE_ORDER, type Purpose } from "@/lib/purposes";
import type { CefrLevel } from "@/lib/types";

/**
 * First-run questionnaire — shown once (guest or registered) until
 * `profiles.onboarded_at` is stamped. Four quick picks: target language,
 * current level, purpose, goal level. The answers land in the existing
 * environment tables (`profiles.target_language`, `user_languages`), so
 * every AI surface personalises itself from the first generation on.
 */

const LEVELS: { id: CefrLevel; hint: string }[] = [
  { id: "A1", hint: "Just starting out" },
  { id: "A2", hint: "I know basic phrases" },
  { id: "B1", hint: "I can hold a conversation" },
  { id: "B2", hint: "Comfortable in most situations" },
  { id: "C1", hint: "Advanced — polishing the details" },
  { id: "C2", hint: "Near-native" },
];

const PURPOSE_ICONS: Record<Purpose, LucideIcon> = {
  everyday: MessageCircle,
  travel: Plane,
  business: Briefcase,
  exam: GraduationCap,
  culture: Clapperboard,
};

const STEP_COUNT = 4;

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  // Set when we're onboarding a freshly-switched language rather than a
  // brand-new account — the language is already chosen, so we skip step 0.
  const [languageMode, setLanguageMode] = useState(false);

  const [lang, setLang] = useState(getActiveLanguageCode());
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [purpose, setPurpose] = useState<Purpose | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // A language the learner just opened for the first time gets its own
      // run of the questionnaire (level / purpose / goal), flagged by the
      // switcher and picked up here after the reload.
      try {
        const pendingLang = localStorage.getItem(PENDING_ONBOARD_KEY);
        if (pendingLang && pendingLang === getActiveLanguageCode()) {
          if (!cancelled) {
            setLang(pendingLang);
            setLevel("A1");
            setPurpose(null);
            setLanguageMode(true);
            setStep(1); // skip the "which language" step
            setShow(true);
          }
          return;
        }
      } catch {
        /* storage unavailable — fall through to the first-run check */
      }

      // Otherwise only appear when the profile explicitly says onboarding
      // never ran — a failed query (e.g. migration not applied yet) keeps
      // it hidden.
      try {
        const session = await ensureSession();
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarded_at")
          .eq("id", session.user.id)
          .single();
        if (!cancelled && !error && data && data.onboarded_at === null) {
          setShow(true);
        }
      } catch {
        // No session → the login redirect handles it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const firstStep = languageMode ? 1 : 0;
  const totalSteps = STEP_COUNT - firstStep;

  const clearPendingFlag = () => {
    try {
      localStorage.removeItem(PENDING_ONBOARD_KEY);
    } catch {
      /* ignore */
    }
  };

  const finish = async (purpose: Purpose | null, goal: CefrLevel | null) => {
    setSaving(true);
    try {
      const session = await ensureSession();
      const { error: ulError } = await supabase.from("user_languages").upsert(
        {
          user_id: session.user.id,
          language: lang,
          cefr_level: level,
          purpose,
          goal_level: goal,
        },
        { onConflict: "user_id,language" },
      );
      if (ulError) throw ulError;
      const { error: pError } = await supabase
        .from("profiles")
        .update({
          target_language: lang,
          onboarded_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);
      if (pError) throw pError;
      setActiveLanguageCode(lang);
      clearPendingFlag();
      // Reload so every screen boots into the personalised environment.
      window.location.reload();
    } catch (err) {
      console.error("[onboarding]", err);
      setSaving(false);
      setShow(false);
    }
  };

  // Skipping still stamps onboarded_at so the questionnaire never nags. In
  // language mode the account is already onboarded — we just clear the flag
  // so this language isn't asked again.
  const skip = async () => {
    setSaving(true);
    clearPendingFlag();
    if (!languageMode) {
      try {
        const session = await ensureSession();
        await supabase
          .from("profiles")
          .update({ onboarded_at: new Date().toISOString() })
          .eq("id", session.user.id);
      } catch (err) {
        console.error("[onboarding skip]", err);
      }
    }
    setShow(false);
  };

  // Goal options: only levels above the current one make sense.
  const goalOptions = LEVELS.filter(
    (l) => LEVELS.findIndex((x) => x.id === l.id) > LEVELS.findIndex((x) => x.id === level),
  );

  const steps = [
    {
      question: "Which language do you want to learn?",
      body: (
        <div className="flex flex-col gap-2">
          {SUPPORTED_LANGUAGES.map((c) => {
            const l = LANGUAGES[c];
            return (
              <OptionButton
                key={c}
                selected={c === lang}
                disabled={saving}
                onClick={() => {
                  setLang(c);
                  setStep(1);
                }}
              >
                <span aria-hidden className="text-xl leading-none">{l.flag}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{l.nativeName}</span>
                  <span className="block text-xs text-muted">{l.name}</span>
                </span>
              </OptionButton>
            );
          })}
        </div>
      ),
    },
    {
      question: `How much ${LANGUAGES[lang].name} do you already know?`,
      body: (
        <div className="flex flex-col gap-2">
          {LEVELS.map((l) => (
            <OptionButton
              key={l.id}
              selected={l.id === level}
              disabled={saving}
              onClick={() => {
                setLevel(l.id);
                setStep(2);
              }}
            >
              <span className="w-8 shrink-0 text-sm font-extrabold text-accent">{l.id}</span>
              <span className="flex-1 text-sm">{l.hint}</span>
            </OptionButton>
          ))}
        </div>
      ),
    },
    {
      question: "What are you learning it for?",
      body: (
        <div className="flex flex-col gap-2">
          {PURPOSE_ORDER.map((id) => {
            const p = PURPOSES[id];
            const Icon = PURPOSE_ICONS[id];
            return (
              <OptionButton
                key={id}
                selected={id === purpose}
                disabled={saving}
                onClick={() => {
                  setPurpose(id);
                  setStep(3);
                }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <Icon size={16} strokeWidth={2} aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="block text-xs text-muted">{p.description}</span>
                </span>
              </OptionButton>
            );
          })}
        </div>
      ),
    },
    {
      question: "Which level do you want to reach?",
      body: (
        <div className="flex flex-col gap-2">
          {goalOptions.map((l) => (
            <OptionButton
              key={l.id}
              selected={false}
              disabled={saving}
              onClick={() => finish(purpose, l.id)}
            >
              <span className="w-8 shrink-0 text-sm font-extrabold text-accent">{l.id}</span>
              <span className="flex-1 text-sm">{l.hint}</span>
            </OptionButton>
          ))}
          <OptionButton selected={false} disabled={saving} onClick={() => finish(purpose, null)}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Sparkles size={16} strokeWidth={2} aria-hidden />
            </span>
            <span className="flex-1 text-sm">Just exploring — no fixed goal</span>
          </OptionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="pop-in w-full max-w-lg rounded-2xl border-[1.5px] border-border-strong bg-surface-raised p-6 shadow-pop sm:p-8">
        <p className="eyebrow text-[11px] text-muted">
          {languageMode
            ? `Set up ${LANGUAGES[lang].name}`
            : "Welcome to FLUEN"}{" "}
          · Step {step - firstStep + 1} of {totalSteps}
        </p>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight">
          {steps[step].question}
        </h2>
        <div className="mt-5">{steps[step].body}</div>

        <div className="mt-6 flex items-center justify-between">
          {step > firstStep ? (
            <button
              onClick={() => setStep(step - 1)}
              disabled={saving}
              className="rounded-md px-2 py-1 text-sm text-muted transition-colors duration-150 hover:text-foreground disabled:opacity-40"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={skip}
            disabled={saving}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors duration-150 hover:text-foreground disabled:opacity-40"
          >
            {saving ? "Saving …" : "Skip for now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop disabled:opacity-50 ${
        selected
          ? "border-accent bg-accent-soft"
          : "border-border bg-surface hover:border-border-strong"
      }`}
    >
      {children}
    </button>
  );
}
