"use client";

import { useEffect, useRef } from "react";
import type { CoachMessage } from "@/lib/types";
import { ChatMessage } from "./chat-message";

export function ChatLog({
  messages,
  isStreaming,
}: {
  messages: CoachMessage[];
  isStreaming: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1}
          />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
