"use client";

import { useState } from "react";
import { ChevronRight, MoveRight } from "lucide-react";
import type { Correction } from "@/lib/types";

/**
 * Ambient correction under a user message.
 * Collapsed: a quiet pill. Expanded: Original → Correction → why.
 */
export function CorrectionBadge({ correction }: { correction: Correction }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        <span className="size-1 rounded-full bg-negative" />
        1 correction
        <ChevronRight size={12} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setOpen(false)}
      className="max-w-[80%] rounded-lg border border-border bg-surface px-3.5 py-3 text-left text-xs"
    >
      <div lang="de" className="flex flex-wrap items-center gap-2 leading-relaxed">
        <s className="text-negative/80 decoration-negative/40">
          {correction.original}
        </s>
        <MoveRight size={12} strokeWidth={1.75} className="shrink-0 text-muted" />
        <span className="font-medium text-accent">{correction.corrected}</span>
      </div>
      <p className="mt-2 leading-relaxed text-muted">{correction.explanation}</p>
    </button>
  );
}
