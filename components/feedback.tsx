"use client";
import { CheckCheck, BookmarkPlus, Volume2, Sparkles } from "lucide-react";
import { Feedback, Language, languageTag, Vocabulary } from "@/lib/practice";
import { useState } from "react";
import { useAccount } from "./account-provider";
import Link from "next/link";
export function speak(text: string, language: Language = "german") {
  if (language === "chinese") return;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.88;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("de"));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }
}
export function Words({ words, language = "german" }: { words: Vocabulary[]; language?: Language }) {
  const { words: savedWords, saveWord, loading, user } = useAccount();
  const saved = savedWords.filter(word => (word.language ?? "german") === language).map(word => word.german);
  const [saving, setSaving] = useState<string[]>([]);
  const [error, setError] = useState("");
  if (!words.length) return null;
  return (
    <div className="vocabulary">
      <div className="vocab-heading">
        <span>Every word to take with you</span>
        <span>{user ? "Save the words you want to practice." : <>Guest words stay in this browser. <Link href="/login">Sign in to save to your account.</Link></>}</span>
      </div>
      <div className="word-chips">
        {words.map((word, i) => (
          <span key={i}>
            <strong lang={languageTag(language)}>{word.german}</strong>
            <span>{word.english}</span>
            <button
              type="button"
              className="small-button word-save"
              aria-label={saved.includes(word.german) ? `${word.german} is saved${user ? "" : " in this browser"}` : `Save ${word.german}${user ? "" : " in this browser"}`}
              disabled={loading || saved.includes(word.german) || saving.includes(word.german)}
              onClick={async () => {
                setSaving(previous => [...previous, word.german]); setError("");
                try { await saveWord({ ...word, language }); }
                catch (e) { setError(e instanceof Error ? e.message : "Couldn’t save this word. Please try again."); }
                finally { setSaving(previous => previous.filter(w => w !== word.german)); }
              }}
            >
              {saved.includes(word.german) ? <CheckCheck size={14} /> : <BookmarkPlus size={14} />}
              {saving.includes(word.german) ? "Saving…" : saved.includes(word.german) ? user ? "Saved" : "Saved locally" : user ? "Save" : "Save locally"}
            </button>
          </span>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function FeedbackCard({ feedback, language = "german" }: { feedback: Feedback; language?: Language }) {
  return (
    <section
      className={`feedback-card ${feedback.correct ? "correct" : "learning"}`}
      aria-label="Your feedback"
    >
      <div className="feedback-heading">
        {feedback.correct ? <CheckCheck size={21} /> : <Sparkles size={21} />}
        <h3>
          {feedback.correct
            ? "Correct! That’s language in action."
            : "A little polish. A little progress."}
        </h3>
      </div>
      <div className="corrected-answer">
        <p lang={languageTag(language)}>{feedback.corrected}</p>
        {language === "german" && <button
          className="icon-button"
          aria-label="Listen to the corrected German"
          onClick={() => speak(feedback.corrected)}
        >
          <Volume2 size={18} />
        </button>}
      </div>
      <p className="feedback-explanation">{feedback.explanation}</p>
      {feedback.corrections.map((correction, i) => (
        <div className="correction" key={i}>
          <div>
            <del>{correction.original}</del>
            <span>→</span>
            <strong lang={languageTag(language)}>{correction.corrected}</strong>
          </div>
          <p>{correction.explanation}</p>
        </div>
      ))}
      <Words words={feedback.vocabulary} language={language} />
    </section>
  );
}
