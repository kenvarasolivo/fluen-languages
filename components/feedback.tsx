"use client";
import { CheckCheck, BookmarkPlus, Volume2, Sparkles } from "lucide-react";
import { Feedback, Vocabulary, saveWords } from "@/lib/practice";
import { useState } from "react";
export function speak(text: string) {
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
export function Words({ words }: { words: Vocabulary[] }) {
  const [saved, setSaved] = useState(false);
  if (!words.length) return null;
  return (
    <div className="vocabulary">
      <div className="vocab-heading">
        <span>A few words to take with you</span>
        <button
          className="small-button"
          onClick={() => {
            saveWords(words);
            setSaved(true);
          }}
          disabled={saved}
        >
          <BookmarkPlus size={14} />
          {saved ? "Saved!" : "Save words"}
        </button>
      </div>
      <div className="word-chips">
        {words.map((word, i) => (
          <span key={i}>
            <strong lang="de">{word.german}</strong>
            <span>{word.english}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
export function FeedbackCard({ feedback }: { feedback: Feedback }) {
  return (
    <section
      className={`feedback-card ${feedback.correct ? "correct" : "learning"}`}
      aria-label="Your feedback"
    >
      <div className="feedback-heading">
        {feedback.correct ? <CheckCheck size={21} /> : <Sparkles size={21} />}
        <h3>
          {feedback.correct
            ? "That’s your German flowing."
            : "A little polish. A little progress."}
        </h3>
      </div>
      <div className="corrected-answer">
        <p lang="de">{feedback.corrected}</p>
        <button
          className="icon-button"
          aria-label="Listen to the corrected German"
          onClick={() => speak(feedback.corrected)}
        >
          <Volume2 size={18} />
        </button>
      </div>
      <p className="feedback-explanation">{feedback.explanation}</p>
      {feedback.corrections.map((correction, i) => (
        <div className="correction" key={i}>
          <div>
            <del>{correction.original}</del>
            <span>→</span>
            <strong lang="de">{correction.corrected}</strong>
          </div>
          <p>{correction.explanation}</p>
        </div>
      ))}
      <Words words={feedback.vocabulary} />
    </section>
  );
}
