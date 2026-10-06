"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Lightbulb,
  LoaderCircle,
  PenLine,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Header, Footer } from "./header";
import { PracticeSettings } from "./settings";
import { FeedbackCard, Words, speak } from "./feedback";
import {
  defaults,
  Exercise,
  Feedback,
  request,
  Settings,
  starter,
} from "@/lib/practice";

export function WritingPractice() {
  const [settings, setSettings] = useState<Settings>(defaults),
    [exercise, setExercise] = useState<Exercise>(starter),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [busy, setBusy] = useState<"sentence" | "check" | null>(null),
    [error, setError] = useState(""),
    [hint, setHint] = useState(false),
    [revealed, setRevealed] = useState(false),
    [count, setCount] = useState(0),
    [ready, setReady] = useState(true);
  const history = useRef<string[]>([starter.english]);
  const input = useRef<HTMLTextAreaElement>(null);
  const current = useRef(settings);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function next(nextSettings = settings) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy("sentence");
    setError("");
    setReady(false);
    setFeedback(null);
    setAnswer("");
    setHint(false);
    setRevealed(false);
    try {
      const generated = await request<Exercise>(
        "sentence",
        { settings: nextSettings, previous: history.current },
        abort.signal,
      );
      setExercise(generated);
      history.current = [...history.current, generated.english].slice(-12);
      setReady(true);
      input.current?.focus();
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      if (!abort.signal.aborted) setBusy(null);
    }
  }
  async function check() {
    if (!answer.trim() || busy || !ready || feedback || revealed) return;
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
      setFeedback(result);
      setCount((c) => c + 1);
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
      <Header active="write" />
      <main className="practice-main">
        <div className="practice-heading">
          <div>
            <div className="eyebrow">
              <PenLine size={15} /> WRITE IT OUT
            </div>
            <h1>One sentence closer.</h1>
            <p>Make it yours in German. We’ll help with the little things.</p>
          </div>
          <div className="session-count">
            <Sparkles size={18} />
            <strong>{count}</strong> sentences practiced
          </div>
        </div>
        <div className="practice-grid">
          <PracticeSettings
            settings={settings}
            onChange={change}
            disabled={!!busy}
          />
          <div className="exercise-column">
            <section className="exercise-card">
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
                HOW WOULD YOU SAY THIS IN GERMAN?
              </div>
              {busy === "sentence" ? (
                <div className="sentence-loading">
                  <LoaderCircle className="spin" size={22} /> Finding your next
                  little challenge…
                </div>
              ) : ready ? (
                <h2 className="english-sentence">“{exercise.english}”</h2>
              ) : (
                <h2 className="english-sentence">
                  Let’s find your next sentence.
                </h2>
              )}
              {settings.format === "connected" && (
                <p className="connector-note">
                  Combine both ideas in German using a suitable Konnektor.
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void check();
                }}
              >
                <label className="answer-label" htmlFor="answer">
                  YOUR TURN <span>Deutsch, bitte.</span>
                </label>
                <textarea
                  ref={input}
                  id="answer"
                  lang="de"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your German goes here…"
                  maxLength={4000}
                  disabled={!!busy || !!feedback || revealed || !ready}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      void check();
                    }
                  }}
                />
                <div className="umlaut-row">
                  <div>
                    {["ä", "ö", "ü", "ß"].map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        disabled={!!busy || !!feedback || revealed || !ready}
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
                    disabled={!!busy || !ready}
                    onClick={() => setHint(!hint)}
                  >
                    <Lightbulb size={17} />
                    {hint ? "Hide hint" : "A little hint"}
                  </button>
                  {feedback || revealed ? (
                    <button
                      type="button"
                      className="button primary"
                      onClick={() => void next()}
                    >
                      Next sentence <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      className="button primary"
                      disabled={!answer.trim() || !!busy || !ready}
                    >
                      {busy === "check" ? (
                        <>
                          <LoaderCircle className="spin" size={17} /> Checking…
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Check my German
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
              {hint && ready && (
                <div className="hint-box">
                  <Lightbulb size={17} />
                  <p>{exercise.hint}</p>
                </div>
              )}
              {!feedback && !revealed && ready && (
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
                  {!ready && (
                    <button onClick={() => void next()}>
                      <RotateCcw size={14} /> Try again
                    </button>
                  )}
                </div>
              )}
            </section>
            {feedback && (
              <FeedbackCard key={exercise.english} feedback={feedback} />
            )}{" "}
            {revealed && (
              <section className="feedback-card learning">
                <div className="feedback-heading">
                  <Sparkles size={20} />
                  <h3>A new sentence to take with you.</h3>
                </div>
                <div className="corrected-answer">
                  <p lang="de">{exercise.german}</p>
                  <button
                    className="icon-button"
                    aria-label="Listen to the German translation"
                    onClick={() => speak(exercise.german)}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                <p className="feedback-explanation">
                  Read it aloud, notice the word order, and try the next one.
                  Every attempt counts.
                </p>
                <Words key={exercise.english} words={exercise.vocabulary} />
              </section>
            )}
            <p className="gentle-note">
              ✦ Making mistakes is part of making progress.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
