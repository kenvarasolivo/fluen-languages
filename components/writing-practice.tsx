"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Lightbulb,
  LoaderCircle,
  PenLine,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Header, Footer } from "./header";
import { PracticeSettings } from "./settings";
import { FeedbackCard, Words, speak } from "./feedback";
import {
  defaults,
  languageNames,
  languageTag,
  Exercise,
  Feedback,
  request,
  Settings,
  starter,
} from "@/lib/practice";
import { pickExercise } from "@/lib/question-bank";
import { ChallengeResult } from "./challenge-result";

export function WritingPractice() {
  const [settings, setSettings] = useState<Settings>(defaults),
    [exercise, setExercise] = useState<Exercise>(starter),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [busy, setBusy] = useState<"check" | null>(null),
    [error, setError] = useState(""),
    [hint, setHint] = useState(false),
    [revealed, setRevealed] = useState(false),
    [attempt, setAttempt] = useState(0),
    [roll, setRoll] = useState(0);
  const language = settings.language ?? "german";
  const chinese = language === "chinese";
  const target = languageNames[language];
  const history = useRef<string[]>([starter.english]);
  const input = useRef<HTMLTextAreaElement>(null);
  const current = useRef(settings);
  const controller = useRef<AbortController | null>(null);
  const resultPanel = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (feedback)
      resultPanel.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [feedback]);
  function retry() {
    setFeedback(null);
    setError("");
    setHint(false);
    requestAnimationFrame(() => input.current?.focus());
  }
  function next(nextSettings = settings) {
    controller.current?.abort();
    const selected = pickExercise(nextSettings, history.current);
    setBusy(null);
    setError("");
    setFeedback(null);
    setAnswer("");
    setHint(false);
    setRevealed(false);
    setExercise(selected);
    history.current = [...history.current, selected.english].slice(-576);
    setRoll((value) => value + 1);
    requestAnimationFrame(() => input.current?.focus());
  }
  async function check() {
    if (!answer.trim() || busy || feedback || revealed) return;
    setBusy("check");
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await request<Feedback>(
        "check",
        { settings: current.current, english: exercise.english, answer },
        abort.signal,
      );
      if (abort.signal.aborted) return;
      setFeedback(result);
      setAttempt((value) => value + 1);
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      if (!abort.signal.aborted) setBusy(null);
    }
  }
  function change(value: Settings) {
    current.current = value;
    setSettings(value);
    void next(value);
  }
  return (
    <>
      <Header active="write" language={language} />
      <main className="practice-main writing-main">
        <div className="practice-heading">
          <div>
            <div className="eyebrow">
              <PenLine size={15} /> LEARN BY DOING / WRITING
            </div>
            <h1>Make the next sentence yours.</h1>
            <p>
              Write it in {target}, learn from the feedback, and try what you’ve
              learned.
            </p>
          </div>
        </div>
        <div className="practice-grid">
          <PracticeSettings
            settings={settings}
            onChange={change}
            disabled={!!busy}
          />
          <div className="exercise-column">
            <section
              className={`exercise-card challenge-card ${feedback ? (feedback.correct ? "is-won" : "is-lost") : ""}`}
              aria-busy={!!busy}
            >
              <div className="challenge-banner">
                <span>
                  <PenLine size={18} /> SENTENCE{" "}
                  {String(roll + 1).padStart(2, "0")}
                </span>
                <span>
                  <Sparkles size={15} /> Your words. Your progress.
                </span>
              </div>
              <div className="exercise-top">
                <span className="pill">
                  {settings.level} · {settings.topic}
                </span>
                <span className="exercise-kind">
                  {settings.format === "single"
                    ? "One sentence"
                    : "Connect two ideas"}
                </span>
              </div>
              <div className="demo-caption">
                HOW WOULD YOU SAY THIS IN {target.toUpperCase()}?
              </div>
              <h2
                key={roll}
                className={`english-sentence${roll ? " sentence-reroll" : ""}`}
                aria-live="polite"
                aria-atomic="true"
              >
                “{exercise.english}”
              </h2>
              <div className="question-tools">
                <span>Every sentence is a chance to express yourself.</span>
                <button
                  type="button"
                  className="reroll-button"
                  disabled={!!busy}
                  onClick={() => next()}
                  title="Get a different question and clear this attempt"
                >
                  <Shuffle
                    key={roll}
                    className={roll ? "reroll-icon" : ""}
                    size={16}
                  />
                  Different sentence
                </button>
              </div>
              {settings.format === "connected" && (
                <p className="connector-note">
                  Combine both ideas in {target} using “{exercise.connector?.english ?? "and"}”.
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void check();
                }}
              >
                <label className="answer-label" htmlFor="answer">
                  YOUR TURN <span>{chinese ? "Pinyin, please. Tone marks optional." : "Deutsch, bitte."}</span>
                </label>
                <textarea
                  ref={input}
                  id="answer"
                  lang={languageTag(language)}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={chinese ? "Your pinyin goes here… e.g. wo xiang he cha" : "Your German goes here…"}
                  maxLength={4000}
                  disabled={!!busy || !!feedback || revealed}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      void check();
                    }
                  }}
                />
                <div className="umlaut-row">
                  <div>
                    {(chinese ? [] : ["ä", "ö", "ü", "ß"]).map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        disabled={!!busy || !!feedback || revealed}
                        onClick={() => {
                          const el = input.current;
                          const start = el?.selectionStart ?? answer.length;
                          const end = el?.selectionEnd ?? start;
                          setAnswer(
                            answer.slice(0, start) + letter + answer.slice(end),
                          );
                          requestAnimationFrame(() => {
                            el?.focus();
                            el?.setSelectionRange(start + 1, start + 1);
                          });
                        }}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  <span>⌘ / Ctrl + Enter to check</span>
                </div>
                <div className="exercise-actions">
                  <button
                    type="button"
                    className="hint-button"
                    disabled={!!busy}
                    onClick={() => setHint(!hint)}
                  >
                    <Lightbulb size={17} />
                    {hint ? "Hide hint" : "Get a hint"}
                  </button>
                  {feedback && !feedback.correct ? (
                    <button
                      type="button"
                      className="button primary"
                      onClick={(event) => {
                        event.preventDefault();
                        retry();
                      }}
                    >
                      <RotateCcw size={17} /> Try again
                    </button>
                  ) : feedback || revealed ? (
                    <button
                      type="button"
                      className="button primary"
                      disabled={!!busy}
                      onClick={() => void next()}
                    >
                      Next sentence <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      className="button primary"
                      disabled={!answer.trim() || !!busy}
                    >
                      {busy === "check" ? (
                        <>
                          <LoaderCircle className="spin" size={17} /> Checking…
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Submit answer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
              {hint && (
                <div className="hint-box">
                  <Lightbulb size={17} />
                  <p>{exercise.hint}</p>
                </div>
              )}
              {!feedback && !revealed && (
                <button
                  className="reveal-button"
                  disabled={!!busy}
                  onClick={() => {
                    setRevealed(true);
                    setHint(false);
                  }}
                >
                  I’m not sure — show me a translation
                </button>
              )}
              {error && (
                <div className="error-box" role="alert">
                  {error}
                </div>
              )}
            </section>
            {feedback && (
              <div ref={resultPanel} key={`${roll}-${attempt}`}>
                <ChallengeResult correct={feedback.correct} />
                <FeedbackCard feedback={feedback} language={language} />
              </div>
            )}
            {revealed && (
              <section className="feedback-card learning">
                <div className="feedback-heading">
                  <Sparkles size={20} />
                  <h3>Another way to put it.</h3>
                </div>
                <div className="corrected-answer">
                  <p lang={languageTag(language)}>{exercise.german}</p>
                  {!chinese && <button
                    className="icon-button"
                    aria-label="Listen to the German translation"
                    onClick={() => speak(exercise.german, language)}
                  >
                    <Volume2 size={18} />
                  </button>}
                </div>
                <p className="feedback-explanation">
                  Read it aloud, notice the word order, and try the next one.
                  Every attempt counts.
                </p>
                <Words key={exercise.english} words={exercise.vocabulary} language={language} />
              </section>
            )}
            <p className="gentle-note">
              ✦ You learn by trying. Every attempt gives you something to build
              on.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
