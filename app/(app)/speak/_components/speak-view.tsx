"use client";

import { useCallback, useRef, useState } from "react";
import type { CoachMessage, VoiceState } from "@/lib/types";
import { ChatLog } from "./chat-log";
import { Composer } from "./composer";
import { VoicePanel } from "./voice-panel";

export function SpeakView() {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hallo! Worüber möchtest du heute sprechen?",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const idRef = useRef(0);

  const nextId = () => `m${++idRef.current}`;

  const speakReply = useCallback((text: string) => {
    if (typeof speechSynthesis === "undefined" || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.95;
    u.onend = () => setVoiceState("idle");
    u.onerror = () => setVoiceState("idle");
    setVoiceState("speaking");
    speechSynthesis.speak(u);
  }, []);

  const sendMessage = useCallback(
    async (text: string, fromVoice = false) => {
      const userMsg: CoachMessage = { id: nextId(), role: "user", content: text };
      const assistantId = nextId();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      // Correction check runs in parallel — it never delays the reply.
      fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
        .then((res) => res.json())
        .then(({ correction }) => {
          if (!correction) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsg.id ? { ...m, correction } : m)),
          );
        })
        .catch(() => {}); // corrections are ambient; failure is silent

      try {
        const history = [...messages, userMsg].map(({ role, content }) => ({
          role,
          content,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok || !res.body) throw new Error(`chat failed: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const delta = decoder.decode(value, { stream: true });
          full += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + delta } : m,
            ),
          );
        }

        // Voice mode: read the coach's reply aloud.
        if (fromVoice) speakReply(full);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "— Verbindung unterbrochen. Versuch es nochmal." }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, speakReply],
  );

  return (
    <div className="flex h-full">
      {/* Left — chat log */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
          <h1 className="text-sm font-medium">Speak</h1>
          <span className="text-xs text-muted">Gespräch · Deutsch B1</span>
        </header>

        <ChatLog messages={messages} isStreaming={isStreaming} />

        <Composer onSend={sendMessage} disabled={isStreaming} />
      </section>

      {/* Right — voice mode */}
      <VoicePanel
        state={voiceState}
        onStateChange={setVoiceState}
        onTranscript={(text) => sendMessage(text, true)}
      />
    </div>
  );
}
