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
import { TopicIllustration } from "./topic-illustration";
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
import { localAnswerFeedback, pickExercise } from "@/lib/question-bank";
import { ChallengeResult } from "./challenge-result";
import { useLanguage } from "./language-provider";
import { exerciseProgressKey, groupProgress } from "@/lib/writing-progress";
import { useAccount } from "./account-provider";
import { GroupProgress } from "./group-progress";
import { GuestSaveNotice } from "./guest-save-notice";

export function WritingPractice() {
  const { language: selectedLanguage, setLanguage } = useLanguage();
  const { completed, recordCorrect: saveCorrect, loading: accountLoading } = useAccount();
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
  const review = completed.has(exerciseProgressKey(settings, exercise));
  function recordCorrect() {
    const key = exerciseProgressKey(settings, exercise);
    void saveCorrect(key);
  }
  useEffect(() => {
    if (current.current.language !== selectedLanguage) {
      change({ ...current.current, language: selectedLanguage });
    }
  }, [selectedLanguage]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (feedback || revealed)
      resultPanel.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [feedback, revealed]);
  function retry() {
    controller.current?.abort();
    setBusy(null);
    setFeedback(null);
    setRevealed(false);
    setAnswer("");
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
  function checkMyself() {
    if (busy || feedback || revealed || accountLoading) return;
    setError("");
    setHint(false);
    const matched = localAnswerFeedback(exercise, answer, language);
    if (matched) {
      recordCorrect();
      setFeedback(matched);
      setAttempt((value) => value + 1);
    } else {
      setRevealed(true);
    }
  }
  function markCorrect() {
    if (accountLoading) return;
    recordCorrect();
    setRevealed(false);
    setFeedback({
      correct: true,
      corrected: exercise.german,
      explanation: "You marked your translation as correct after comparing it with the model answer.",
      corrections: [],
      vocabulary: exercise.vocabulary,
    });
    setAttempt((value) => value + 1);
  }
  async function checkWithAI() {
    if (!answer.trim() || busy || feedback || revealed || accountLoading) return;
    setError("");
    setBusy("check");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await request<Feedback>(
        "check",
        { settings: current.current, english: exercise.english, answer, useAI: true },
        abort.signal,
      );
      if (abort.signal.aborted) return;
      if (result.correct) recordCorrect();
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
    setLanguage(value.language ?? "german");
    current.current = value;
    setSettings(value);
    void next(value);
  }
  return (
    <>
      <Header active="write" />
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
        <GuestSaveNotice />
        <div className="practice-grid">
          <PracticeSettings
            settings={settings}
            onChange={change}
            disabled={!!busy}
            progress={(group) => groupProgress(completed, language, group)}
          />
          <div className="exercise-column">
            <TopicIllustration
              topic={settings.topic}
              banner
              onTopicChange={(topic) => change({ ...settings, topic })}
              disabled={!!busy}
              progress={(group) => groupProgress(completed, language, group)}
            />
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
                  {review && <span className="review-label">Review</span>}
                  {exercise.connector ? "Connect two ideas" : "One sentence"}
                </span>
              </div>
              <div className="current-group-progress" aria-live="polite">
                <span>{settings.level} · {settings.topic} · {settings.format === "single" ? "One sentence" : "Connect two ideas"}</span>
                <GroupProgress label="Selected group" progress={groupProgress(completed, language, settings)} />
              </div>
              <div className="demo-caption">
                HOW WOULD YOU SAY THIS IN {target.toUpperCase()}?
              </div>
              <h2
                key={roll}
                className={`english-sentence${exercise.connector ? " connected-sentence" : ""}${roll ? " sentence-reroll" : ""}`}
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
              {exercise.connector && (
                <p className="connector-note">
                  Combine both ideas in {target} using “{exercise.connector?.english ?? "and"}”.
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  checkMyself();
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
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError("");
                  }}
                  placeholder={chinese ? "Your pinyin goes here… e.g. wo xiang he cha" : "Your German goes here…"}
                  maxLength={4000}
                  disabled={!!busy || !!feedback || revealed}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      checkMyself();
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
                          setError("");
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
                  <span>⌘ / Ctrl + Enter to check myself</span>
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
                      key="retry"
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
                    <div key="result-actions" className="check-options">
                      {revealed && (
                        <button type="button" className="button secondary" onClick={(event) => {
                          event.preventDefault();
                          retry();
                        }}>
                          <RotateCcw size={17} /> Try again
                        </button>
                      )}
                      <button
                        type="button"
                        className="button primary"
                        disabled={!!busy}
                        onClick={() => void next()}
                      >
                        Next sentence <ArrowRight size={17} />
                      </button>
                    </div>
                  ) : (
                    <div key="check-actions" className="check-options">
                      <button type="submit" className="button primary" disabled={!!busy || accountLoading}>
                        <Check size={18} /> Check myself
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        disabled={!answer.trim() || !!busy || accountLoading}
                        onClick={() => void checkWithAI()}
                      >
                        {busy === "check" ? (
                          <>
                            <LoaderCircle className="spin" size={17} /> Checking with AI…
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} /> Check with AI
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </form>
              <p className="gentle-note">Check myself celebrates matching answers or reveals a model answer for you to compare. Check with AI gives feedback on your writing.</p>
              {hint && (
                <div className="hint-box">
                  <Lightbulb size={17} />
                  <p>{exercise.hint}</p>
                </div>
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
              <section ref={resultPanel} className="feedback-card learning" aria-label="Manual check">
                <div className="feedback-heading">
                  <Sparkles size={20} />
                  <h3 role="status">Compare with the model answer.</h3>
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
                  Compare your answer above with this translation. Notice the
                  meaning, grammar and word order. Other translations can also
                  be correct. You decide how you did.
                </p>
                {answer.trim() && (
                  <button type="button" className="button primary" disabled={accountLoading} onClick={markCorrect}>
                    <Check size={18} /> I got it right
                  </button>
                )}
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
