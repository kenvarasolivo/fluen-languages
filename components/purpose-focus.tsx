"use client";

import { useState } from "react";
import {
  Briefcase,
  Clapperboard,
  GraduationCap,
  MessageCircle,
  Plane,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { PURPOSES, PURPOSE_ORDER, type Purpose } from "@/lib/purposes";

const PURPOSE_ICONS: Record<Purpose, LucideIcon> = {
  everyday: MessageCircle,
  travel: Plane,
  business: Briefcase,
  exam: GraduationCap,
  culture: Clapperboard,
};

/**
 * The learner's focus, shown as a bold colour-keyed hero at the top of
 * the module grid — the same purpose that steers module order, Speak's
 * scenarios and Immerse's scenes. "Change" opens a picker (with a
 * confirm step, since switching reshuffles all three) that writes the
 * new purpose to `user_languages`; the parent then re-orders.
 */
export function PurposeBanner({
  purpose,
  languageCode,
  onChanged,
}: {
  purpose: Purpose | null;
  languageCode: string;
  /** Fired after a successful switch so the grid re-fetches its order. */
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Purpose | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const current = purpose ? PURPOSES[purpose] : null;
  const Icon = purpose ? PURPOSE_ICONS[purpose] : Sparkles;

  const confirmChange = async () => {
    if (!pending) return;
    setSaving(true);
    setError(false);
    try {
      const session = await ensureSession();
      // Only the purpose column is written — the primary key defaults
      // keep cefr_level/goal_level untouched on conflict.
      const { error: err } = await supabase.from("user_languages").upsert(
        { user_id: session.user.id, language: languageCode, purpose: pending },
        { onConflict: "user_id,language" },
      );
      if (err) throw err;
      setOpen(false);
      setPending(null);
      onChanged();
    } catch (err) {
      console.error("[purpose change]", err);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fade-up relative isolate flex items-center gap-4 overflow-hidden rounded-lg border-[1.5px] border-border-strong px-5 py-5 text-white shadow-pop"
        style={{ background: current ? current.color : "#0b0b0d" }}
      >
        {/* A soft radial sheen so the flat colour block still has depth. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(28rem 14rem at 88% -40%, rgba(255,255,255,0.22), transparent 70%)",
          }}
        />
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Icon size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-[11px] text-white/70">Learning focus</p>
          <p className="mt-0.5 truncate text-xl font-extrabold tracking-tight sm:text-2xl">
            {current ? current.label : "Choose your focus"}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/70">
            {current
              ? current.description
              : "Tailor your modules, Speak and Immerse"}
          </p>
        </div>
        <button
          onClick={() => {
            setPending(null);
            setError(false);
            setOpen(true);
          }}
          className="shrink-0 rounded-md border-[1.5px] border-white/40 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors duration-150 hover:bg-white hover:text-foreground"
        >
          {current ? "Change" : "Choose"}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="pop-in w-full max-w-lg rounded-2xl border-[1.5px] border-border-strong bg-surface-raised p-6 shadow-pop sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-[11px] text-muted">Learning focus</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                  What are you learning it for?
                </h2>
              </div>
              <button
                onClick={() => !saving && setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              This reorders your modules and changes the scenes Speak and
              Immerse generate. Your learned words stay exactly where they are.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {PURPOSE_ORDER.map((id) => {
                const p = PURPOSES[id];
                const PIcon = PURPOSE_ICONS[id];
                const isCurrent = id === purpose;
                const armed = id === pending;
                return (
                  <button
                    key={id}
                    disabled={saving}
                    onClick={() => setPending(isCurrent ? null : id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop disabled:opacity-50 ${
                      armed
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-surface hover:border-border-strong"
                    }`}
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-md text-white"
                      style={{ background: p.color }}
                    >
                      <PIcon size={16} strokeWidth={2} aria-hidden />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {p.label}
                        {isCurrent && (
                          <span className="ml-2 text-[11px] font-medium text-muted">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted">
                        {p.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mt-3 text-xs text-negative">
                Could not switch focus — please try again.
              </p>
            )}

            {/* Confirm step — only a real, different pick arms it. */}
            {pending && (
              <div className="pop-in mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
                <p className="text-sm">
                  Switch to{" "}
                  <span className="font-semibold">{PURPOSES[pending].label}</span>?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPending(null)}
                    disabled={saving}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:text-foreground disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmChange}
                    disabled={saving}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90 disabled:opacity-40"
                  >
                    {saving ? "Switching …" : "Confirm switch"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
