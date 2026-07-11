"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Master gain at volume = 1. Kept well below unity so even "full" stays a
// calm background hush rather than a roar.
const MAX_GAIN = 0.3;
const VOLUME_KEY = "fluen:ambient-volume";

/**
 * Calming "galaxy" white noise, generated live with the Web Audio API so no
 * audio asset needs to ship. It's soft filtered brown noise with a slow,
 * drifting swell that reads as a distant cosmic hum.
 *
 * Deliberately never auto-plays and never persists its on/off state: audio
 * only starts on an explicit button press (browsers require a user gesture
 * anyway), and a page reload always comes back silent. The chosen *volume*,
 * however, is remembered as a preference.
 *
 * Two layouts: `inline` (a toggle + an always-visible volume slider, used in
 * the sidebar) and `icon` (just the toggle, for the tight mobile header).
 */
export function AmbientSoundButton({
  variant = "inline",
}: {
  variant?: "inline" | "icon";
}) {
  const [playing, setPlaying] = useState(false);
  // 0..1. Starts at a gentle default; the saved preference is read after mount
  // so server and client markup agree.
  const [volume, setVolume] = useState(0.5);
  const nodesRef = useRef<{
    ctx: AudioContext;
    source: AudioBufferSourceNode;
    gain: GainNode;
    lfo: OscillatorNode;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOLUME_KEY);
      if (saved !== null) {
        const v = Number(saved);
        if (Number.isFinite(v)) setVolume(Math.min(1, Math.max(0, v)));
      }
    } catch {
      /* storage unavailable — keep the default */
    }
  }, []);

  // Tear everything down if the component unmounts while playing.
  useEffect(() => {
    return () => {
      const n = nodesRef.current;
      if (n) {
        try {
          n.lfo.stop();
          n.source.stop();
          n.ctx.close();
        } catch {
          /* already gone */
        }
        nodesRef.current = null;
      }
    };
  }, []);

  const start = () => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();

    // Two seconds of brown noise (integrated white noise) — warmer and less
    // hissy than raw white noise, so it stays calming over long listens.
    const frames = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < frames; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Gentle low-pass to soften the top end into a distant hush.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.6;

    // Slow LFO drifting the cutoff up and down for the "galaxy swell".
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(filter.frequency);

    // Master gain — fade in from silence to the current volume so it never
    // starts with a click.
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * MAX_GAIN, ctx.currentTime + 1.4);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    lfo.start();

    nodesRef.current = { ctx, source, gain, lfo };
    setPlaying(true);
  };

  const stop = () => {
    const n = nodesRef.current;
    if (!n) return;
    const { ctx, source, gain, lfo } = n;
    nodesRef.current = null;
    // Fade out, then release the nodes.
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    window.setTimeout(() => {
      try {
        lfo.stop();
        source.stop();
        ctx.close();
      } catch {
        /* already closed */
      }
    }, 900);
    setPlaying(false);
  };

  const toggle = () => (playing ? stop() : start());

  const changeVolume = (v: number) => {
    setVolume(v);
    try {
      localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      /* ignore */
    }
    // Apply live if currently playing.
    const n = nodesRef.current;
    if (n) {
      const now = n.ctx.currentTime;
      n.gain.gain.cancelScheduledValues(now);
      n.gain.gain.setValueAtTime(n.gain.gain.value, now);
      n.gain.gain.linearRampToValueAtTime(v * MAX_GAIN, now + 0.12);
    }
  };

  const toggleButton = (
    <button
      onClick={toggle}
      aria-label={playing ? "Turn off ambient sound" : "Turn on ambient sound"}
      aria-pressed={playing}
      title={playing ? "Ambient sound: on" : "Ambient sound: off"}
      className={`flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-foreground/[0.04] ${
        playing ? "text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      {playing ? (
        <Volume2 size={14} strokeWidth={1.75} />
      ) : (
        <VolumeX size={14} strokeWidth={1.75} />
      )}
    </button>
  );

  if (variant === "icon") return toggleButton;

  return (
    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5">
      {toggleButton}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => changeVolume(Number(e.target.value))}
        aria-label="Ambient sound volume"
        className="accent-accent h-1 flex-1 cursor-pointer"
      />
    </div>
  );
}
