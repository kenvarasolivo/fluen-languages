"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Check, Sparkles, History, Trash2 } from "lucide-react";
import { supabase, ensureSession } from "@/lib/supabase";
import { withGender } from "@/lib/format";
import { getActiveLanguageCode } from "@/lib/languages";
import { useActiveLanguage } from "@/lib/use-active-language";
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
  { id: "story", label: "Story" },
  { id: "dialog", label: "Dialog" },
];

export function ImmerseDemo() {
  const language = useActiveLanguage();
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
        .eq("language", getActiveLanguageCode())
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
          : "Generation failed - please try again.",
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
          language: getActiveLanguageCode(),
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

    // Keep the popover fully on-screen, even near the edges of a phone.
    setPopover({
      x: Math.max(8, Math.min(e.clientX, window.innerWidth - 272)),
      y: Math.min(e.clientY + 12, window.innerHeight - 190),
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
      const lang = getActiveLanguageCode();
      const session = await ensureSession();
      const pos = d.pos || "phrase";
      // Keep only an article valid for the active language (der/die/das, el/la, ...).
      const gender =
        d.gender && language.articles.includes(d.gender.toLowerCase())
          ? d.gender.toLowerCase()
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
            language: lang,
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
        .eq("language", lang)
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
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <h1 className="text-sm font-semibold tracking-tight">Immerse</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory((v) => !v)}
            aria-pressed={showHistory}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
              showHistory
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            <History size={12} strokeWidth={2} />
            History
          </button>
          <button
            onClick={() => setShowEnglish((v) => !v)}
            aria-pressed={showEnglish}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
              showEnglish
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            Translation
          </button>
        </div>
      </header>

      {/* Controls — switching only sets options; generation is the button. */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <Segmented options={LEVELS} value={level} onChange={setLevel} />
        <Segmented options={KINDS} value={kind} onChange={setKind} />
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-accent"
        >
          <Sparkles size={14} strokeWidth={2} />
          {story ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
          {showHistory && (
            <div className="pop-in mb-8 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-raised">
              <p className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                Saved texts
              </p>
              {saved.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted">
                  Nothing saved yet.
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
                        className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-foreground/[0.04] ${
                          t.id === currentId ? "text-accent" : ""
                        }`}
                      >
                        <span className="block truncate text-sm">{t.title}</span>
                        <span className="text-xs text-muted">
                          {t.kind === "dialog" ? "Dialog" : "Story"} · {t.level} ·{" "}
                          {new Date(t.created_at).toLocaleDateString("en-GB")}
                        </span>
                      </button>
                      <button
                        onClick={() => deleteSaved(t.id)}
                        aria-label="Delete"
                        className="rounded-md p-2 text-muted transition-all duration-150 hover:bg-negative/10 hover:text-negative sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 pt-16">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft">
                <Sparkles size={16} strokeWidth={1.75} className="text-accent" />
              </span>
              <p className="text-sm text-muted">Generating ...</p>
            </div>
          )}

          {error && !loading && (
            <p className="rounded-lg border border-negative/20 bg-negative/[0.06] px-4 py-3 text-sm text-negative">
              {error}
            </p>
          )}

          {limitMsg && !loading && (
            <div className="flex w-full max-w-sm flex-col items-start gap-3 rounded-2xl border border-border bg-surface-raised px-6 py-5 shadow-raised">
              <p className="text-sm leading-relaxed text-muted">{limitMsg}</p>
              <Link
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
              >
                Create account
              </Link>
            </div>
          )}

          {!story && !loading && !error && !limitMsg && !showHistory && (
            <div className="flex flex-col items-center gap-3 pt-16 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-xs">
                <Sparkles size={20} strokeWidth={1.5} className="text-muted" />
              </span>
              <p className="text-sm font-medium">No text yet.</p>
              <p className="max-w-xs text-xs leading-relaxed text-muted">
                Pick a level and format, then tap <em>Generate</em>.
                Content is only created on click - never automatically.
              </p>
            </div>
          )}

          {story && !loading && (
            <article lang={language.htmlLang}>
              <h2 className="text-xl font-semibold tracking-tight">{story.title}</h2>
              <p lang="en" className="mt-1 text-xs text-muted">
                Tap a word to learn it.
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
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-xs ${
                            right
                              ? "rounded-br-md border border-accent/15 bg-accent-soft"
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
          className="pop-in fixed z-50 w-64 rounded-xl border border-border bg-surface-raised p-4 shadow-pop"
        >
          {popover.loading ? (
            <p className="text-xs text-muted">Looking it up ...</p>
          ) : popover.definition ? (
            <>
              <p lang={language.htmlLang} className="text-sm font-medium">
                {withGender(popover.definition.gender, popover.definition.lemma)}
                <span className="ml-2 text-xs font-normal text-muted">
                  {popover.definition.pos}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted">{popover.definition.meaning_en}</p>
              <button
                onClick={addToDeck}
                disabled={popover.added}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-1.5 text-xs font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60 disabled:hover:bg-accent"
              >
                {popover.added ? (
                  <>
                    <Check size={12} strokeWidth={2} /> In deck
                  </>
                ) : (
                  <>
                    <Plus size={12} strokeWidth={2} /> Add to SRS
                  </>
                )}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted">No definition found.</p>
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
    <div className="flex rounded-md border border-border bg-foreground/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`rounded px-3 py-1.5 text-sm transition-all duration-150 ${
            value === o.id
              ? "bg-surface-raised font-medium text-foreground shadow-xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
