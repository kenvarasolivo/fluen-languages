"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

export function Composer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  };

  return (
    <div className="shrink-0 border-t border-border px-6 py-4">
      <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 transition-colors focus-within:border-border-strong">
        <input
          lang="de"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Schreib etwas auf Deutsch…"
          className="flex-1 bg-transparent py-1 text-sm leading-relaxed outline-none placeholder:text-muted"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-opacity disabled:opacity-30"
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-2xl text-xs text-muted">
        Fehler sind hier erwünscht — du bekommst leise Korrekturen.
      </p>
    </div>
  );
}
