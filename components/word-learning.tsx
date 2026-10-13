"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Lightbulb, Volume2 } from "lucide-react";
import { Header, Footer } from "./header";
import { useLanguage } from "./language-provider";
import { useAccount } from "./account-provider";
import { GuestSaveNotice } from "./guest-save-notice";
import { speak } from "./feedback";
import { firstLetterHint, Language, languageNames, languageTag } from "@/lib/practice";
import { beginnerWords, matchesWord, wordCategories, WordCategory, wordProgressKey } from "@/lib/beginner-words";
import { answersMatch, germanSpellingCorrections } from "@/lib/question-bank";

function WordSession({ language, category }: { language: Language; category: WordCategory }) {
  const { completed, recordCorrect, saveWord, words: saved, loading } = useAccount();
  const pool = beginnerWords(language, category);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "retry" | "revealed" | null>(null);
  const [hint, setHint] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const word = pool[index];
  const correct = pool.filter(item => completed.has(wordProgressKey(item))).length;
  const isSaved = saved.some(item => (item.language ?? "german") === language && item.german === word.german);
  const matchedModel = word.accepted.find(model => answersMatch(answer, model, language));
  const spellingNote = language === "german" && matchedModel && germanSpellingCorrections(answer, matchedModel).length > 0;

  function check() {
    if (!answer.trim() || loading || result === "revealed" || result === "correct") return;
    if (matchesWord(word, answer)) {
      setResult("correct");
      void recordCorrect(wordProgressKey(word));
    } else setResult("retry");
  }
  function retry() {
    setAnswer(""); setResult(null); setHint(false); setError("");
    requestAnimationFrame(() => input.current?.focus());
  }
  function next() {
    // Revisit unlearned words first, then keep the full set available for review.
    const candidates = Array.from({ length: pool.length - 1 }, (_, offset) => (index + offset + 1) % pool.length);
    setIndex(candidates.find(i => !completed.has(wordProgressKey(pool[i]))) ?? candidates[0]);
    setAnswer(""); setResult(null); setHint(false); setError("");
    input.current?.focus();
  }
  async function save() {
    setSaving(true); setError("");
    try { await saveWord(word); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save this word."); }
    finally { setSaving(false); }
  }

  return <section className="word-lesson" aria-label={`${category} word practice`}>
    <div className="word-lesson-top"><span>BEGINNER · {category}</span><span>{correct} / {pool.length} learned</span></div>
    <progress value={correct} max={pool.length} aria-label="Words learned in this set" />
    <p className="word-prompt-label">How do you say this in {languageNames[language]}?</p>
    <h2 lang="en">{word.english}</h2>
    <form onSubmit={event => { event.preventDefault(); check(); }}>
      <label htmlFor="word-answer">Write the {languageNames[language]} word</label>
      <input id="word-answer" ref={input} lang={languageTag(language)} value={answer}
        onChange={event => { setAnswer(event.target.value); if (result === "retry") setResult(null); }}
        placeholder={language === "german" ? "Your German word…" : "Your pinyin word…"}
        autoComplete="off" autoCapitalize="off" spellCheck={false} readOnly={result === "correct" || result === "revealed"}
        aria-describedby="word-help" />
      <p id="word-help" className="gentle-note">{language === "german" ? "For nouns, try including der, die or das. The word on its own also counts." : "Write pinyin. Tone marks are welcome, but optional."}</p>
      {!result || result === "retry" ? <div className="word-actions">
        <button className="button primary" type="submit" disabled={!answer.trim() || loading}>Check word <Check size={17} /></button>
        <button className="button secondary" type="button" onClick={() => setHint(true)}><Lightbulb size={16} /> Hint</button>
        <button className="button secondary" type="button" onClick={() => setResult("revealed")}>Show answer</button>
      </div> : null}
    </form>
    {hint && (!result || result === "retry") && <p className="word-hint" role="status">{firstLetterHint(word.german)}</p>}
    {result === "retry" && <p role="status">Try again, or reveal the word and learn it first.</p>}
    {(result === "correct" || result === "revealed") && <div className="word-result" role="status">
      <span>{result === "correct" ? "You’ve got it!" : "Meet your new word. Try writing it from memory."}</span>
      <strong lang={languageTag(language)}>{word.german}</strong>
      {result === "correct" && spellingNote && <p className="spelling-note">Small spelling error: remember the umlaut marks. This word still counts as learned.</p>}
      <div className="word-actions">
        {result === "revealed" && <button type="button" className="button secondary" onClick={retry}>Try again</button>}
        {language === "german" && <button type="button" className="button secondary" onClick={() => speak(word.german)}><Volume2 size={17} /> Listen</button>}
        <button type="button" className="button secondary" onClick={save} disabled={loading || saving || isSaved}>{isSaved ? "Saved to My words" : saving ? "Saving…" : "Save word"}</button>
        <button type="button" className="button primary" onClick={next}>Next word <ArrowRight size={17} /></button>
      </div>
    </div>}
    {error && <p role="alert">{error}</p>}
    {correct === pool.length && <p className="word-set-complete" role="status">You’ve learned this set. Keep reviewing, or put your words into a sentence.</p>}
    <Link className="sentence-write-link" href="/write">Put your words into sentences <ArrowRight size={16} /></Link>
  </section>;
}

export function WordLearning() {
  const { language } = useLanguage();
  const [category, setCategory] = useState<WordCategory>(wordCategories[0]);
  return <><Header active="learn-words" /><main className="practice-main beginner-main">
    <div className="practice-heading"><div><div className="eyebrow"><BookOpen size={15} /> A FIRST STEP</div>
      <h1>Start with words you’ll use.</h1>
      <p>Completely new? Learn a few everyday words, then start using them in whole sentences.</p>
    </div><Link href="/write" className="button secondary">Practice sentences <ArrowRight size={17} /></Link></div>
    <GuestSaveNotice />
    <div className="word-categories" aria-label="Word sets">{wordCategories.map(value => <button type="button" key={value}
      aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
    <WordSession key={`${language}:${category}`} language={language} category={category} />
  </main><Footer /></>;
}
