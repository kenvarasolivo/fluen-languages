"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import type { CoachMessage, VoiceState } from "@/lib/types";
import { ChatLog } from "./chat-log";
import { Composer } from "./composer";
import { VoicePanel } from "./voice-panel";

const WELCOME: CoachMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hallo! Worüber möchtest du heute sprechen?",
};

export function SpeakView() {
  const [messages, setMessages] = useState<CoachMessage[]>([WELCOME]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  // The chat session row is created lazily on the first message and
  // reused afterwards, so empty visits never write to the database.
  const sessionIdRef = useRef<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  // Resume the most recent conversation instead of starting empty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !session) return;

      const { data: rows } = await supabase
        .from("chat_messages")
        .select("id, role, content, correction")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });
      if (cancelled || !rows?.length) return;

      sessionIdRef.current = session.id;
      setHasSession(true);
      setMessages([WELCOME, ...(rows as CoachMessage[])]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureChatSession = useCallback(async () => {
    if (sessionIdRef.current) return sessionIdRef.current;
    const auth = await ensureSession();
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: auth.user.id, mode: "text" })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("session insert failed");
    sessionIdRef.current = data.id;
    setHasSession(true);
    return data.id;
  }, []);

  const persistMessage = useCallback(
    async (msg: CoachMessage) => {
      try {
        const sessionId = await ensureChatSession();
        const auth = await ensureSession();
        await supabase.from("chat_messages").insert({
          id: msg.id,
          session_id: sessionId,
          user_id: auth.user.id,
          role: msg.role,
          content: msg.content,
        });
      } catch (err) {
        console.error("[chat save]", err); // saving is best-effort
      }
    },
    [ensureChatSession],
  );

  const deleteConversation = useCallback(async () => {
    const id = sessionIdRef.current;
    sessionIdRef.current = null;
    setHasSession(false);
    setMessages([WELCOME]);
    if (!id) return;
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) console.error("[chat delete]", error);
  }, []);

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
      const userMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      const savedUser = persistMessage(userMsg);

      // Correction check runs in parallel — it never delays the reply.
      fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
        .then((res) => res.json())
        .then(async ({ correction }) => {
          if (!correction) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsg.id ? { ...m, correction } : m)),
          );
          // Wait for the row to exist before attaching the correction.
          await savedUser;
          await supabase
            .from("chat_messages")
            .update({ correction })
            .eq("id", userMsg.id);
        })
        .catch(() => {}); // corrections are ambient; failure is silent

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .map(({ role, content }) => ({ role, content }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          if (res.status === 403 && body?.code === "guest_limit") {
            setLimitMsg(body.error);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: "The guest limit has been reached - create an account to keep talking." }
                  : m,
              ),
            );
            return;
          }
          // Show the server's message (e.g. "KI überlastet") instead of
          // a generic connection error.
          if (body?.error) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: body.error } : m,
              ),
            );
            return;
          }
          throw new Error(`chat failed: ${res.status}`);
        }
        if (!res.body) throw new Error("chat failed: empty body");

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

        if (full) {
          await persistMessage({ id: assistantId, role: "assistant", content: full });
        }

        // Voice mode: read the coach's reply aloud.
        if (fromVoice) speakReply(full);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Connection lost. Please try again." }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, persistMessage, speakReply],
  );

  return (
    <div className="flex h-full">
      {/* Left — chat log */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
          <h1 className="text-sm font-semibold tracking-tight">Speak</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tracking-wide text-muted">
              Conversation · German B1
            </span>
            {hasSession && (
              <button
                onClick={deleteConversation}
                aria-label="Delete conversation"
                title="Delete conversation"
                className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-negative/10 hover:text-negative"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </header>

        <ChatLog messages={messages} isStreaming={isStreaming} />

        {limitMsg ? (
          <div className="flex shrink-0 flex-col items-center gap-3 border-t border-border bg-surface px-6 py-5 text-center">
            <p className="text-sm text-muted">{limitMsg}</p>
            <Link
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
            >
              Create account
            </Link>
          </div>
        ) : (
          <Composer onSend={sendMessage} disabled={isStreaming} />
        )}
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
