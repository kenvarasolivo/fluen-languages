"use client";

import { useEffect, useState } from "react";
import { Plus, Check, RefreshCw } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import type {
  ImmerseKind,
  ImmerseLevel,
  Story,
  WordDefinition,
} from "@/lib/types";

interface PopoverState {
  x: number;
  y: number;
  word: string;
  sentence: string;
  definition: WordDefinition | null;
  loading: boolean;
  added: boolean;
}

const LEVELS: { id: ImmerseLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const KINDS: { id: ImmerseKind; label: string }[] = [
  { id: "story", label: "Geschichte" },
  { id: "dialog", label: "Dialog" },
];

export function ImmerseDemo() {
  const [level, setLevel] = useState<ImmerseLevel>("beginner");
  const [kind, setKind] = useState<ImmerseKind>("story");
  const [showEnglish, setShowEnglish] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const generate = async (l = level, k = kind) => {
    setLoading(true);
    setError(false);
    setPopover(null);
    try {
      const res = await fetch("/api/immerse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: l, kind: k }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setStory(data.story);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWordClick = async (
    e: React.MouseEvent,
    rawWord: string,
    sentence: string,
  ) => {
    e.stopPropagation();
    const word = rawWord.replace(/[.,!?;:"'„“()–—]/g, "");
    if (!word) return;

    setPopover({
      x: Math.min(e.clientX, window.innerWidth - 280),
      y: e.clientY + 12,
      word,
      sentence,
      definition: null,
      loading: true,
      added: false,
    });

    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, sentence }),
      });
      const { definition } = await res.json();
      setPopover((p) => (p && p.word === word ? { ...p, definition, loading: false } : p));
    } catch {
      setPopover((p) => (p && p.word === word ? { ...p, loading: false } : p));
    }
  };

  const addToDeck = async () => {
    if (!popover?.definition) return;
    const d = popover.definition;
    const sentence = popover.sentence;
    try {
      const session = await ensureSession();
      const pos = d.pos || "phrase";
      const gender =
        d.gender === "der" || d.gender === "die" || d.gender === "das"
          ? d.gender
          : null;

      // Insert into the shared dictionary if missing, then read the id back.
      await supabase
        .from("words")
        .upsert(
          { language: "de", lemma: d.lemma, pos, gender, meaning_en: d.meaning_en },
          { onConflict: "language,lemma,pos", ignoreDuplicates: true },
        );
      const { data: word, error } = await supabase
        .from("words")
        .select("id")
        .eq("language", "de")
        .eq("lemma", d.lemma)
        .eq("pos", pos)
        .single();
      if (error || !word) throw error ?? new Error("word not found");

      // The Bridge: new SRS card with the subtitle sentence as context.
      await supabase.from("user_words").upsert(
        {
          user_id: session.user.id,
          word_id: word.id,
          context_sentence: sentence,
          source: "immerse",
        },
        { onConflict: "user_id,word_id", ignoreDuplicates: true },
      );

      setPopover((p) => (p ? { ...p, added: true } : p));
    } catch (err) {
      console.error("[add to srs]", err);
    }
  };

  return (
    <div className="flex h-full flex-col" onClick={() => setPopover(null)}>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-medium">Immerse</h1>
        <button
          onClick={() => setShowEnglish((v) => !v)}
          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
            showEnglish
              ? "border-accent/40 text-accent"
              : "border-border text-muted hover:border-border-strong"
          }`}
        >
          Übersetzung
        </button>
      </header>

      {/* Controls */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-6 py-3">
        <Segmented options={LEVELS} value={level} onChange={(v) => { setLevel(v); generate(v, kind); }} />
        <Segmented options={KINDS} value={kind} onChange={(v) => { setKind(v); generate(level, v); }} />
        <button
          onClick={() => generate()}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw size={12} strokeWidth={1.75} className={loading ? "animate-spin" : ""} />
          Neu generieren
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {loading && <p className="text-sm text-muted">Wird generiert …</p>}
          {error && !loading && (
            <p className="text-sm text-muted">
              Generierung fehlgeschlagen — versuch es nochmal.
            </p>
          )}

          {story && !loading && (
            <article lang="de">
              <h2 className="text-lg font-medium">{story.title}</h2>
              <p className="mt-1 text-xs text-muted">
                Tipp auf ein Wort, um es zu lernen.
              </p>
              <div className="mt-8 flex flex-col gap-5">
                {story.lines.map((line, i) => (
                  <div key={i}>
                    <p className="text-[15px] leading-relaxed">
                      {line.speaker && (
                        <span className="mr-2 text-xs font-medium text-accent">
                          {line.speaker}
                        </span>
                      )}
                      {line.text_de.split(/(\s+)/).map((token, j) =>
                        token.trim() ? (
                          <button
                            key={j}
                            onClick={(e) => onWordClick(e, token, line.text_de)}
                            className="rounded-sm transition-colors hover:bg-accent-soft hover:text-accent"
                          >
                            {token}
                          </button>
                        ) : (
                          token
                        )
                      )}
                    </p>
                    {showEnglish && (
                      <p lang="en" className="mt-1 text-xs leading-relaxed text-muted">
                        {line.text_en}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      </div>

      {/* Word popover — the Bridge */}
      {popover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ left: popover.x, top: popover.y }}
          className="fixed z-50 w-64 rounded-xl border border-border bg-surface-raised p-4 shadow-xl shadow-black/10"
        >
          {popover.loading ? (
            <p className="text-xs text-muted">Wird nachgeschlagen …</p>
          ) : popover.definition ? (
            <>
              <p lang="de" className="text-sm font-medium">
                {popover.definition.gender
                  ? `${popover.definition.gender} ${popover.definition.lemma}`
                  : popover.definition.lemma}
                <span className="ml-2 text-xs font-normal text-muted">
                  {popover.definition.pos}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted">{popover.definition.meaning_en}</p>
              <button
                onClick={addToDeck}
                disabled={popover.added}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-60"
              >
                {popover.added ? (
                  <>
                    <Check size={12} strokeWidth={2} /> Im Deck
                  </>
                ) : (
                  <>
                    <Plus size={12} strokeWidth={2} /> Add to SRS
                  </>
                )}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted">Keine Definition gefunden.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            value === o.id
              ? "bg-surface-raised text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
