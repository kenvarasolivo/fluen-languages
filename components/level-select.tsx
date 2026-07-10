"use client";

import { useState } from "react";
import type { CefrLevel } from "@/lib/types";

/** Levels a learner can work at (matches the curriculum; C2 is out of scope). */
const LEVELS: readonly CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

/**
 * Level dropdown with a confirmation step. The CEFR level is persisted
 * per language and used everywhere (draws, Immerse texts, dashboard
 * progress), so an accidental click shouldn't silently re-scope the
 * whole environment — the change only commits after confirming.
 */
export function LevelSelect({
  value,
  onChange,
}: {
  value: CefrLevel;
  onChange: (v: CefrLevel) => void;
}) {
  const [pending, setPending] = useState<CefrLevel | null>(null);

  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value as CefrLevel;
          if (next !== value) setPending(next);
        }}
        aria-label="Your level"
        className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-sm text-foreground shadow-xs outline-none transition-colors duration-150 hover:border-border-strong focus:border-accent/40"
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="pop-in w-full max-w-sm rounded-2xl border-[1.5px] border-border-strong bg-surface-raised p-6 shadow-pop">
            <h3 className="text-lg font-extrabold tracking-tight">
              Switch to {pending}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your level is saved for this language and used everywhere —
              new cards, generated texts and your dashboard progress will
              target {pending} from now on.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                className="btn-outline rounded-md px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onChange(pending);
                  setPending(null);
                }}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
              >
                Switch to {pending}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
