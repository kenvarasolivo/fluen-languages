"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { getSavedWords, saveWords as saveGuestWords, type Vocabulary } from "@/lib/practice";
import { progressStorageKey, readWritingProgress } from "@/lib/writing-progress";

type Account = {
  user: User | null; loading: boolean; error: string;
  words: Vocabulary[]; completed: Set<string>;
  saveWord: (word: Vocabulary) => Promise<void>;
  removeWord: (word: Vocabulary) => Promise<void>;
  recordCorrect: (key: string) => Promise<void>;
  retry: () => void;
};
const Context = createContext<Account | null>(null);
const identity = (w: Vocabulary) => JSON.stringify([w.language ?? "german", w.german]);
const message = (e: unknown) => e instanceof Error ? e.message : "Could not sync your account. Please try again.";

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [revision, setRevision] = useState(0);
  const scope = useRef<string | null>(null);
  const pendingProgress = useRef(new Map<string, Set<string>>());

  useEffect(() => {
    const client = getSupabase();
    if (!client) { setInitialized(true); return; }
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      if (scope.current !== (next?.id ?? null)) {
        scope.current = next?.id ?? null;
        setWords([]); setCompleted(new Set()); setLoading(true); setError("");
      }
      setUser(next); setInitialized(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    let cancelled = false;
    const client = getSupabase();
    if (!user || !client) {
      const restore = () => { setWords(getSavedWords()); setCompleted(readWritingProgress()); };
      restore(); setLoading(false); setError("");
      window.addEventListener("storage", restore);
      window.addEventListener("fluen:words", restore);
      return () => {
        window.removeEventListener("storage", restore);
        window.removeEventListener("fluen:words", restore);
      };
    }
    const userId = user.id;
    setLoading(true); setError("");
    async function load() {
      // Read every page; PostgREST limits each response to 1,000 rows.
      async function pages(table: string, columns: string) {
        const rows: Record<string, string>[] = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await client!.from(table).select(columns).eq("user_id", userId)
            .order(table === "fluen_saved_words" ? "word" : "exercise_key").range(offset, offset + 999);
          if (error) throw new Error(error.message);
          rows.push(...data as unknown as Record<string, string>[]);
          if (data.length < 1000) return rows;
        }
      }
      try {
        const pending = [...(pendingProgress.current.get(userId) ?? [])];
        if (pending.length) {
          const { error } = await client!.from("fluen_writing_progress").upsert(
            pending.map(exercise_key => ({ user_id: userId, exercise_key })),
            { onConflict: "user_id,exercise_key", ignoreDuplicates: true },
          );
          if (error) throw new Error(error.message);
          const queue = pendingProgress.current.get(userId);
          pending.forEach(key => queue?.delete(key));
        }
        const [saved, progress] = await Promise.all([
          pages("fluen_saved_words", "word,meaning,language"),
          pages("fluen_writing_progress", "exercise_key"),
        ]);
        if (cancelled || scope.current !== userId) return;
        setWords(saved.map(row => ({ german: row.word, english: row.meaning, language: row.language === "chinese" ? "chinese" : "german" })));
        setCompleted(new Set(progress.map(row => row.exercise_key)));
      } catch (e) {
        if (!cancelled) setError(message(e));
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [initialized, user?.id, revision]);

  function ready() {
    if (loading || error) throw new Error("Your data is still loading or could not sync. Retry before saving.");
  }
  async function saveWord(word: Vocabulary) {
    ready();
    if (!user) {
      if (!saveGuestWords([word])) throw new Error("Could not save this word in your browser.");
      setWords(getSavedWords()); return;
    }
    const userId = user.id;
    const { error } = await getSupabase()!.from("fluen_saved_words").upsert({
      user_id: userId, language: word.language ?? "german", word: word.german, meaning: word.english,
    }, { onConflict: "user_id,language,word" });
    if (error) throw new Error(error.message);
    if (scope.current === userId) setWords(previous => [...previous.filter(w => identity(w) !== identity(word)), word]);
  }
  async function removeWord(word: Vocabulary) {
    ready();
    if (!user) {
      const next = words.filter(w => identity(w) !== identity(word));
      localStorage.setItem("fluen:words", JSON.stringify(next));
      setWords(next); window.dispatchEvent(new Event("fluen:words")); return;
    }
    const userId = user.id;
    const { error } = await getSupabase()!.from("fluen_saved_words").delete()
      .eq("user_id", userId).eq("language", word.language ?? "german").eq("word", word.german);
    if (error) throw new Error(error.message);
    if (scope.current === userId) setWords(previous => previous.filter(w => identity(w) !== identity(word)));
  }
  async function recordCorrect(key: string) {
    const userId = user?.id ?? null;
    if (userId) {
      const queue = pendingProgress.current.get(userId) ?? new Set<string>();
      queue.add(key); pendingProgress.current.set(userId, queue);
    }
    try {
      ready();
      if (!user) {
        const next = new Set([...readWritingProgress(), key]);
        localStorage.setItem(progressStorageKey, JSON.stringify([...next]));
        setCompleted(next); return;
      }
      const { error } = await getSupabase()!.from("fluen_writing_progress").upsert({ user_id: userId, exercise_key: key }, { onConflict: "user_id,exercise_key", ignoreDuplicates: true });
      if (error) throw new Error(error.message);
      pendingProgress.current.get(userId!)?.delete(key);
      if (scope.current === userId) setCompleted(previous => new Set([...previous, key]));
    } catch (e) { if (scope.current === userId) setError(message(e)); }
  }
  return <Context.Provider value={{ user, loading, error, words, completed, saveWord, removeWord, recordCorrect, retry: () => setRevision(r => r + 1) }}>
    {children}
    {error && <div className="account-sync-error" role="alert">Your progress could not sync: {error} <button onClick={() => setRevision(r => r + 1)}>Retry sync</button></div>}
  </Context.Provider>;
}

export function useAccount() {
  const account = useContext(Context);
  if (!account) throw new Error("useAccount requires AccountProvider");
  return account;
}
