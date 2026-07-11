"use client";

import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { useActiveLanguage } from "@/lib/use-active-language";
import { GRAMMAR, grammarCategories, type GrammarExample } from "@/lib/grammar";

/** Speak an example aloud in the target language. */
function speak(text: string, speechLang: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLang;
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

export function GrammarView() {
  const language = useActiveLanguage();
  const topics = GRAMMAR[language.code] ?? [];
  const categories = useMemo(
    () => grammarCategories(language.code),
    [language.code],
  );

  // null = show everything; otherwise filter to one category.
  const [category, setCategory] = useState<string | null>(null);

  const shown = category ? topics.filter((t) => t.category === category) : topics;

  // Group the shown topics under their category headings.
  const groups = useMemo(() => {
    const map = new Map<string, typeof topics>();
    for (const t of shown) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return [...map.entries()];
  }, [shown]);

  return (
    <div className="flex h-full flex-col">
      <header className="app-header topbar-inset mt-3 flex h-14 shrink-0 items-center justify-between gap-3 rounded-full px-5 shadow-raised sm:mt-4">
        <h1 className="eyebrow text-sm text-white">Grammar</h1>
        <span className="hdr-chip flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          <span aria-hidden className="text-sm leading-none">
            {language.flag}
          </span>
          {language.name}
        </span>
      </header>

      {/* Category filter — All plus one pill per category. */}
      <div className="topbar-inset mt-2 flex shrink-0 flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-xs">
        <CategoryPill
          label="All"
          active={category === null}
          onClick={() => setCategory(null)}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6">
          <p className="text-sm leading-relaxed text-muted">
            Short, practical lessons on how {language.name} fits together — word
            order, verbs, and the small rules that shape every sentence. Tap the
            speaker on any example to hear it.
          </p>

          {groups.map(([cat, list]) => (
            <section key={cat} className="flex flex-col gap-4">
              <h2 className="eyebrow text-xs text-accent">{cat}</h2>
              {list.map((topic) => (
                <article
                  key={topic.id}
                  className="rounded-2xl border border-border bg-surface-raised p-5 shadow-xs sm:p-6"
                >
                  <h3 className="text-lg font-bold tracking-tight">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-accent">
                    {topic.summary}
                  </p>

                  <div className="mt-3 flex flex-col gap-2.5">
                    {topic.body.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted">
                        {p}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {topic.examples.map((ex, i) => (
                      <ExampleRow
                        key={i}
                        example={ex}
                        htmlLang={language.htmlLang}
                        onSpeak={() => speak(ex.target, language.speechLang)}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ))}

          {topics.length === 0 && (
            <p className="text-sm text-muted">
              Grammar lessons for {language.name} are coming soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-150 ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ExampleRow({
  example,
  htmlLang,
  onSpeak,
}: {
  example: GrammarExample;
  htmlLang: string;
  onSpeak: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p lang={htmlLang} className="text-base font-semibold tracking-tight">
            {example.target}
          </p>
          {example.roman && (
            <p className="mt-0.5 text-sm text-muted">{example.roman}</p>
          )}
          <p className="mt-1 text-sm text-foreground/80">{example.en}</p>
        </div>
        <button
          onClick={onSpeak}
          aria-label="Play audio"
          title="Play audio"
          className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <Volume2 size={16} strokeWidth={1.75} />
        </button>
      </div>
      {example.note && (
        <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted">
          {example.note}
        </p>
      )}
    </div>
  );
}
