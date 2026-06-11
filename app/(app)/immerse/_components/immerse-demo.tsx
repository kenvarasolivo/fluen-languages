"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Check, Sparkles, History, Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import type {
  ImmerseKind,
  ImmerseLevel,
  SavedText,
  Story,
  StoryLine,
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
  { id: "A1", label: "A1" },
  { id: "A2", label: "A2" },
  { id: "B1", label: "B1" },
  { id: "B2", label: "B2" },
  { id: "C1", label: "C1" },
];

const KINDS: { id: ImmerseKind; label: string }[] = [
  { id: "story", label: "Geschichte" },
  { id: "dialog", label: "Dialog" },
];

export function ImmerseDemo() {
  const [level, setLevel] = useState<ImmerseLevel>("A1");
  const [kind, setKind] = useState<ImmerseKind>("story");
  const [showEnglish, setShowEnglish] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedText[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  // Resume: load saved texts and show the most recent one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("immerse_texts")
        .select("id, kind, level, title, lines, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (cancelled || !data?.length) return;
      const texts = data as SavedText[];
      setSaved(texts);
      setStory({ title: texts[0].title, lines: texts[0].lines });
      setCurrentId(texts[0].id);
      setLevel(texts[0].level);
      setKind(texts[0].kind);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSaved = (t: SavedText) => {
    setStory({ title: t.title, lines: t.lines });
    setCurrentId(t.id);
    setLevel(t.level);
    setKind(t.kind);
    setShowHistory(false);
    setError(null);
  };

  const deleteSaved = async (id: string) => {
    setSaved((prev) => prev.filter((t) => t.id !== id));
    if (id === currentId) {
      setStory(null);
      setCurrentId(null);
    }
    const { error } = await supabase.from("immerse_texts").delete().eq("id", id);
    if (error) console.error("[immerse delete]", error);
  };

  // Generation costs tokens, so it only ever runs on an explicit click —
  // never on mount, never when switching level or kind.
  const generate = async () => {
    setLoading(true);
    setError(null);
    setLimitMsg(null);
    setPopover(null);
    try {
      const res = await fetch("/api/immerse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, kind }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.code === "guest_limit") {
          setLimitMsg(body.error);
          return;
        }
        throw new Error(body?.error ?? String(res.status));
      }
      const data = await res.json();
      setStory(data.story);
      setCurrentId(null);
      await persist(data.story);
    } catch (err) {
      setError(
        err instanceof Error && err.message.length > 4
          ? err.message
          : "Generierung fehlgeschlagen — versuch es nochmal.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Persisting is best-effort: a failed save never hides the fresh text.
  const persist = async (s: Story) => {
    try {
      const session = await ensureSession();
      const { data, error } = await supabase
        .from("immerse_texts")
        .insert({
          user_id: session.user.id,
          kind,
          level,
          title: s.title,
          lines: s.lines,
        })
        .select("id, kind, level, title, lines, created_at")
        .single();
      if (error || !data) throw error ?? new Error("insert failed");
      setCurrentId(data.id);
      setSaved((prev) => [data as SavedText, ...prev]);
    } catch (err) {
      console.error("[immerse save]", err);
    }
  };

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
      const cefr =
        d.cefr_level && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(d.cefr_level)
          ? d.cefr_level
          : null;

      // Insert into the shared dictionary if missing, then read the id back.
      await supabase
        .from("words")
        .upsert(
          {
            language: "de",
            lemma: d.lemma,
            pos,
            gender,
            meaning_en: d.meaning_en,
            cefr_level: cefr,
          },
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

  const renderTokens = (line: StoryLine) =>
    line.text_de.split(/(\s+)/).map((token, j) =>
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
      ),
    );

  // Dialogs render as a two-sided conversation: the first speaker sits
  // on the left, the second on the right.
  const isDialog = story?.lines.some((l) => l.speaker) ?? false;
  const rightSpeaker = isDialog
    ? ([...new Set(story!.lines.map((l) => l.speaker).filter(Boolean))][1] ?? null)
    : null;

  return (
    <div className="flex h-full flex-col" onClick={() => setPopover(null)}>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-medium">Immerse</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              showHistory
                ? "border-accent/40 text-accent"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            <History size={12} strokeWidth={2} />
            Verlauf
          </button>
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
        </div>
      </header>

      {/* Controls — switching only sets options; generation is the button. */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-6 py-3">
        <Segmented options={LEVELS} value={level} onChange={setLevel} />
        <Segmented options={KINDS} value={kind} onChange={setKind} />
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
        >
          <Sparkles size={12} strokeWidth={2} />
          {story ? "Neu generieren" : "Generieren"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {showHistory && (
            <div className="mb-8 rounded-xl border border-border">
              <p className="border-b border-border px-4 py-2.5 text-xs font-medium text-muted">
                Gespeicherte Texte
              </p>
              {saved.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted">
                  Noch nichts gespeichert.
                </p>
              ) : (
                <ul>
                  {saved.map((t) => (
                    <li
                      key={t.id}
                      className="group flex items-center gap-2 border-b border-border px-2 py-1 last:border-b-0"
                    >
                      <button
                        onClick={() => openSaved(t)}
                        className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-raised ${
                          t.id === currentId ? "text-accent" : ""
                        }`}
                      >
                        <span className="block truncate text-sm">{t.title}</span>
                        <span className="text-xs text-muted">
                          {t.kind === "dialog" ? "Dialog" : "Geschichte"} · {t.level} ·{" "}
                          {new Date(t.created_at).toLocaleDateString("de-DE")}
                        </span>
                      </button>
                      <button
                        onClick={() => deleteSaved(t.id)}
                        aria-label="Löschen"
                        className="rounded-md p-2 text-muted opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {loading && <p className="text-sm text-muted">Wird generiert …</p>}

          {error && !loading && <p className="text-sm text-muted">{error}</p>}

          {limitMsg && !loading && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted">{limitMsg}</p>
              <Link
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Konto erstellen
              </Link>
            </div>
          )}

          {!story && !loading && !error && !limitMsg && !showHistory && (
            <div className="flex flex-col items-center gap-3 pt-16 text-center">
              <p className="text-sm">Noch kein Text.</p>
              <p className="max-w-xs text-xs leading-relaxed text-muted">
                Wähl Niveau und Format, dann tippe auf <em>Generieren</em>.
                Inhalte entstehen nur auf Klick — nie automatisch.
              </p>
            </div>
          )}

          {story && !loading && (
            <article lang="de">
              <h2 className="text-lg font-medium">{story.title}</h2>
              <p className="mt-1 text-xs text-muted">
                Tipp auf ein Wort, um es zu lernen.
              </p>

              {isDialog ? (
                <div className="mt-8 flex flex-col gap-3">
                  {story.lines.map((line, i) => {
                    const right = line.speaker === rightSpeaker;
                    const newSpeaker = line.speaker !== story.lines[i - 1]?.speaker;
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${right ? "items-end" : "items-start"}`}
                      >
                        {line.speaker && newSpeaker && (
                          <span className="mb-1 px-1 text-xs font-medium text-accent">
                            {line.speaker}
                          </span>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            right
                              ? "rounded-br-md bg-accent-soft"
                              : "rounded-bl-md border border-border bg-surface-raised"
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed">
                            {renderTokens(line)}
                          </p>
                          {showEnglish && (
                            <p lang="en" className="mt-1 text-xs leading-relaxed text-muted">
                              {line.text_en}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-5">
                  {story.lines.map((line, i) => (
                    <div key={i}>
                      <p className="text-[15px] leading-relaxed">
                        {renderTokens(line)}
                      </p>
                      {showEnglish && (
                        <p lang="en" className="mt-1 text-xs leading-relaxed text-muted">
                          {line.text_en}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
