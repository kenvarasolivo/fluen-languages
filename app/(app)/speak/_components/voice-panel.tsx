"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import type { VoiceState } from "@/lib/types";

const statusLabel: Record<VoiceState, string> = {
  idle: "Tap to speak",
  listening: "Listening ...",
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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.abort?.();
  }, []);

  const stopListening = () => {
    recRef.current?.stop();
    recRef.current = null;
  };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    speechSynthesis.cancel(); // interrupt the coach if it's talking

    const rec = new SR();
    rec.lang = "de-DE";
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let text = "";
      let isFinal = false;
      for (const result of e.results) {
        text += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }
      setInterim(text);
      if (isFinal && text.trim()) {
        setInterim("");
        onTranscript(text.trim());
        rec.stop();
      }
    };

    rec.onend = () => {
      recRef.current = null;
      setInterim("");
      // Don't clobber "speaking" if a reply already started.
      onStateChange("idle");
    };

    rec.onerror = () => {
      recRef.current = null;
      setInterim("");
      onStateChange("idle");
    };

    recRef.current = rec;
    rec.start();
    onStateChange("listening");
  };

  const toggle = () => {
    if (state === "listening") stopListening();
    else startListening();
  };

  const closeOverlay = () => {
    if (state === "listening") stopListening();
    setOverlayOpen(false);
  };

  const orb = (
    <button
      onClick={toggle}
      disabled={!supported}
      data-state={state}
      aria-label={state === "listening" ? "Stop listening" : "Start voice mode"}
      className="orb flex size-44 items-center justify-center rounded-full text-foreground disabled:opacity-40"
    >
      {state === "listening" ? (
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
          <p className="text-xs text-muted">Speak freely. No one is judging you.</p>
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
