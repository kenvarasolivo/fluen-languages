"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import type { VoiceState } from "@/lib/types";

const statusLabel: Record<VoiceState, string> = {
  idle: "Tap to start talking",
  listening: "Listening ...",
  thinking: "Thinking ...",
  speaking: "Coach is speaking ...",
};

/**
 * Voice mode — demo implementation on the browser's Web Speech API
 * (SpeechRecognition for STT, works in Chrome/Edge; German built in).
 * Production swaps this for Deepgram streaming + ElevenLabs Flash —
 * see docs/ARCHITECTURE.md §1.
 *
 * Rendered as a side panel on large screens and as a floating mic
 * button + full-screen overlay on phones, sharing one recognizer.
 *
 * Hands-free: starting the mic opens a continuous conversation loop.
 * Each turn (listen → coach replies → listen again) restarts the
 * recognizer automatically once the coach stops talking, so you never
 * have to press to talk between turns. Tapping the orb ends the loop.
 */
export function VoicePanel({
  state,
  onStateChange,
  onTranscript,
}: {
  state: VoiceState;
  onStateChange: (s: VoiceState) => void;
  onTranscript: (text: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  // True while a hands-free conversation loop is running. Drives the
  // auto-restart of the recognizer between turns.
  const [conversing, setConversing] = useState(false);
  // Set when the current recognizer captured a final transcript, so its
  // `onend` doesn't drop us back to "idle" while the reply is forming.
  const submittedRef = useRef(false);
  // Pending "end of turn" timer — speech is only submitted after a short
  // pause, so brief mid-sentence silences don't cut the user off.
  const silenceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // How long the user can pause before a turn is considered finished.
  const SILENCE_MS = 2800;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      clearTimeout(silenceRef.current);
      recRef.current?.abort?.();
    };
  }, []);

  const stopListening = () => {
    clearTimeout(silenceRef.current);
    recRef.current?.stop();
    recRef.current = null;
  };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR || recRef.current) return;

    speechSynthesis.cancel(); // interrupt the coach if it's talking
    submittedRef.current = false;

    const rec = new SR();
    rec.lang = "de-DE";
    rec.interimResults = true;
    // Keep the mic open across natural pauses; we decide when the turn is
    // over ourselves (after SILENCE_MS of quiet) instead of letting the
    // browser end on the first finalized phrase.
    rec.continuous = true;

    // Latest transcript split into already-finalized and still-interim
    // parts; rebuilt from scratch on every result event.
    let finalText = "";
    let interimText = "";

    // End the turn: hand the collected speech to the parent and stop.
    const commit = () => {
      clearTimeout(silenceRef.current);
      const text = (finalText + interimText).trim();
      if (!text || submittedRef.current) return;
      submittedRef.current = true;
      setInterim("");
      onTranscript(text);
      onStateChange("thinking");
      rec.stop();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      finalText = "";
      interimText = "";
      for (const result of e.results) {
        if (result.isFinal) finalText += result[0].transcript + " ";
        else interimText += result[0].transcript;
      }
      setInterim((finalText + interimText).trim());
      // Restart the silence countdown on every bit of speech — the turn
      // ends only once the user has actually paused.
      clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(commit, SILENCE_MS);
    };

    rec.onend = () => {
      clearTimeout(silenceRef.current);
      recRef.current = null;
      setInterim("");
      // If we handed off a transcript, the parent now owns the state
      // ("thinking" → "speaking" → "idle"); don't clobber it. Otherwise
      // the recognizer ended without input — fall back to idle, and the
      // conversation loop (if active) will pick listening up again.
      if (!submittedRef.current) onStateChange("idle");
    };

    rec.onerror = () => {
      clearTimeout(silenceRef.current);
      recRef.current = null;
      setInterim("");
      onStateChange("idle");
    };

    recRef.current = rec;
    rec.start();
    onStateChange("listening");
  };

  // Conversation loop: once the coach has finished a turn (state settles
  // back to "idle") while a conversation is active, start listening again
  // automatically so the user can just keep talking. A short delay avoids
  // a tight restart loop if the recognizer ends immediately.
  useEffect(() => {
    if (!conversing || state !== "idle" || recRef.current) return;
    const t = setTimeout(() => {
      if (conversing && !recRef.current) startListening();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversing, state]);

  const startConversation = () => {
    setConversing(true);
    startListening();
  };

  const stopConversation = () => {
    setConversing(false);
    speechSynthesis.cancel();
    stopListening();
    onStateChange("idle");
  };

  // The orb is a single toggle for the whole hands-free session.
  const active = conversing || state !== "idle";
  const toggle = () => {
    if (active) stopConversation();
    else startConversation();
  };

  const closeOverlay = () => {
    stopConversation();
    setOverlayOpen(false);
  };

  const orb = (
    <button
      onClick={toggle}
      disabled={!supported}
      data-state={state}
      aria-label={active ? "End conversation" : "Start voice conversation"}
      className="orb flex size-44 items-center justify-center rounded-full text-foreground disabled:opacity-40"
    >
      {active ? (
        <Square size={28} strokeWidth={1.5} className="text-accent" />
      ) : (
        <Mic size={32} strokeWidth={1.25} />
      )}
    </button>
  );

  const status = (
    <div className="flex min-h-12 flex-col items-center gap-1.5 px-8 text-center">
      {!supported ? (
        <p className="text-xs text-muted">
          Speech recognition is not supported by this browser -
          try Chrome or Edge.
        </p>
      ) : interim ? (
        <p lang="de" className="text-sm text-muted">
          „{interim}“
        </p>
      ) : (
        <>
          <p className={`text-sm font-medium ${state !== "idle" ? "text-accent" : ""}`}>
            {statusLabel[state]}
          </p>
          <p className="text-xs text-muted">
            {active
              ? "Hands-free — just keep talking. Tap to end."
              : "Speak freely. No one is judging you."}
          </p>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Large screens — fixed side panel */}
      <section className="hidden w-[400px] shrink-0 flex-col items-center justify-center gap-12 border-l border-border bg-surface lg:flex">
        {orb}
        {status}
      </section>

      {/* Small screens — floating mic that opens the voice overlay */}
      {!overlayOpen && (
        <button
          onClick={() => setOverlayOpen(true)}
          aria-label="Open voice mode"
          className="absolute bottom-28 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-accent text-white shadow-pop transition-transform duration-150 active:scale-95 lg:hidden"
        >
          <Mic size={20} strokeWidth={1.75} />
        </button>
      )}

      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-background/95 px-6 backdrop-blur-sm lg:hidden">
          <button
            onClick={closeOverlay}
            aria-label="Close voice mode"
            className="absolute right-4 top-4 mt-[env(safe-area-inset-top)] rounded-full border border-border bg-surface-raised p-2.5 text-muted shadow-xs transition-colors duration-150 hover:text-foreground"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
          {orb}
          {status}
        </div>
      )}
    </>
  );
}
