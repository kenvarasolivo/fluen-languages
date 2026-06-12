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
    <div className="shrink-0 border-t border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 shadow-xs transition-all duration-150 focus-within:border-accent/50 focus-within:ring-[3px] focus-within:ring-accent/15">
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
          placeholder="Write something in German..."
          className="min-w-0 flex-1 bg-transparent py-1 text-base leading-relaxed outline-none placeholder:text-muted sm:text-sm"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-95 disabled:opacity-30 disabled:hover:bg-accent"
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-2xl text-xs text-muted">
        Mistakes are welcome here - you get quiet corrections.
      </p>
    </div>
  );
}
