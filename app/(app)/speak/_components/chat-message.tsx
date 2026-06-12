"use client";

import type { CoachMessage } from "@/lib/types";
import { CorrectionBadge } from "./correction-badge";

export function ChatMessage({
  message,
  isStreaming,
}: {
  message: CoachMessage;
  isStreaming: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div
          lang="de"
          className="max-w-[80%] rounded-2xl rounded-br-md border border-border bg-surface-raised px-4 py-2.5 text-sm leading-relaxed shadow-xs"
        >
          {message.content}
        </div>
        {message.correction && <CorrectionBadge correction={message.correction} />}
      </div>
    );
  }

  return (
    <div className="flex max-w-[85%] flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_6px] shadow-accent/50" />
        Coach
      </span>
      <p lang="de" className="text-sm leading-relaxed">
        {message.content}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-accent" />
        )}
      </p>
    </div>
  );
}
