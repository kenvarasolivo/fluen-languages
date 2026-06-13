"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { withGender } from "@/lib/format";
import { getActiveLanguageCode } from "@/lib/languages";
import { useActiveLanguage } from "@/lib/use-active-language";
import type { Deck } from "@/lib/types";

interface PickableWord {
  id: string; // user_words.id
  lemma: string;
  gender: string | null;
  pos: string;
  meaning_en: string;
}

/**
 * Membership editor for one custom deck: every card the user owns is
 * listed and can be toggled in or out of the deck. Writes go straight
 * to deck_cards (optimistic), so closing needs no save step.
 */
export function DeckEditor({
  deck,
  onClose,
  onDeleted,
}: {
  deck: Deck;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const language = useActiveLanguage();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<PickableWord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const lang = getActiveLanguageCode();
        const [{ data: all, error: wordsErr }, { data: members, error: memErr }] =
          await Promise.all([
            supabase
              .from("user_words")
              .select("id, words!inner(lemma, gender, pos, meaning_en, language)")
              .eq("words.language", lang)
              .order("created_at", { ascending: false }),
            supabase
              .from("deck_cards")
              .select("user_word_id")
              .eq("deck_id", deck.id),
          ]);
        if (wordsErr) throw wordsErr;
        if (memErr) throw memErr;

        setWords(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (all as any[]).map(({ id, words: w }) => ({ id, ...w })),
        );
        setSelected(new Set(members?.map((m) => m.user_word_id)));
      } catch (err) {
        console.error("[deck editor]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [deck.id]);

  const toggle = (wordId: string) => {
    const adding = !selected.has(wordId);
    setSelected((prev) => {
      const next = new Set(prev);
      if (adding) next.add(wordId);
      else next.delete(wordId);
      return next;
    });
    const revert = () =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (adding) next.delete(wordId);
        else next.add(wordId);
        return next;
      });
    if (adding) {
      supabase
        .from("deck_cards")
        .insert({ deck_id: deck.id, user_word_id: wordId })
        .then(({ error }) => {
          if (error) {
            console.error("[deck add]", error);
            revert();
          }
        });
    } else {
      supabase
        .from("deck_cards")
        .delete()
        .eq("deck_id", deck.id)
        .eq("user_word_id", wordId)
        .then(({ error }) => {
          if (error) {
            console.error("[deck remove]", error);
            revert();
          }
        });
    }
  };

  const deleteDeck = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const { error } = await supabase.from("decks").delete().eq("id", deck.id);
    if (error) {
      console.error("[deck delete]", error);
      setConfirmDelete(false);
      return;
    }
    onDeleted();
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.lemma.toLowerCase().includes(q) ||
        w.meaning_en.toLowerCase().includes(q),
    );
  }, [words, query]);

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col gap-4 self-center overflow-hidden py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">{deck.name}</h2>
          <p className="mt-0.5 text-xs text-muted">
            {selected.size} {selected.size === 1 ? "card" : "cards"} in this deck
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={deleteDeck}
            onMouseLeave={() => setConfirmDelete(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150 ${
              confirmDelete
                ? "bg-negative/10 text-negative"
                : "border border-border bg-surface-raised text-muted shadow-xs hover:text-negative"
            }`}
          >
            <Trash2 size={13} strokeWidth={1.75} />
            {confirmDelete ? "Really delete?" : "Delete deck"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors duration-150 hover:bg-accent/90"
          >
            Done
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 shadow-xs focus-within:border-accent/40">
        <Search size={14} strokeWidth={1.75} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words ..."
          className="w-full bg-transparent text-base outline-none placeholder:text-muted sm:text-sm"
        />
      </label>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-surface-raised shadow-xs">
        {loading ? (
          <div className="flex h-full items-center justify-center py-16">
            <Loader2 size={18} strokeWidth={1.75} className="animate-spin text-muted" />
          </div>
        ) : words.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">
            You don&apos;t have any cards yet. Generate words first, then you
            can group them into decks here.
          </p>
        ) : visible.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">
            Nothing found for &quot;{query}&quot;.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((w) => {
              const inDeck = selected.has(w.id);
              return (
                <li key={w.id}>
                  <button
                    onClick={() => toggle(w.id)}
                    aria-pressed={inDeck}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-foreground/[0.025]"
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
                        inDeck
                          ? "border-accent bg-accent text-white"
                          : "border-border bg-surface text-transparent"
                      }`}
                    >
                      {inDeck ? (
                        <Check size={12} strokeWidth={2.5} />
                      ) : (
                        <Plus size={12} strokeWidth={2} className="text-muted" />
                      )}
                    </span>
                    <span lang={language.htmlLang} className="min-w-0 flex-1 truncate text-sm font-medium">
                      {withGender(w.gender, w.lemma)}
                      <span className="ml-2 text-xs font-normal text-muted">{w.pos}</span>
                    </span>
                    <span className="max-w-[40%] truncate text-sm text-muted">
                      {w.meaning_en}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
