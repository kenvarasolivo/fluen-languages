"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { VoiceState } from "@/lib/types";

const statusLabel: Record<VoiceState, string> = {
  idle: "Tippe, um zu sprechen",
  listening: "Ich höre zu …",
  speaking: "Coach spricht …",
};

/**
 * Voice mode — demo implementation on the browser's Web Speech API
 * (SpeechRecognition for STT, works in Chrome/Edge; German built in).
 * Production swaps this for Deepgram streaming + ElevenLabs Flash —
 * see docs/ARCHITECTURE.md §1.
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

  return (
    <section className="hidden w-[400px] shrink-0 flex-col items-center justify-center gap-12 border-l border-border bg-surface lg:flex">
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

      <div className="flex min-h-12 flex-col items-center gap-1.5 px-8 text-center">
        {!supported ? (
          <p className="text-xs text-muted">
            Spracherkennung wird von diesem Browser nicht unterstützt —
            probier Chrome oder Edge.
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
            <p className="text-xs text-muted">Sprich frei. Niemand bewertet dich.</p>
          </>
        )}
      </div>
    </section>
  );
}
