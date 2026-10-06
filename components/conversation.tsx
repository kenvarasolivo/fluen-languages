"use client";
import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Languages,
  LoaderCircle,
  Mic,
  RotateCcw,
  Send,
  Square,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { Header, Footer } from "./header";
import { PracticeSettings } from "./settings";
import { FeedbackCard, Words, speak } from "./feedback";
import {
  defaults,
  languageNames,
  languageTag,
  Message,
  Reply,
  request,
  Settings,
  Vocabulary,
} from "@/lib/practice";
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: {
          length: number;
          [key: number]: { [key: number]: { transcript: string } };
        };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function Conversation() {
  const [settings, setSettings] = useState<Settings>(defaults),
    [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [autoSpeak, setAutoSpeak] = useState(false),
    [listening, setListening] = useState(false),
    [voiceAvailable, setVoiceAvailable] = useState(false),
    [latestWords, setLatestWords] = useState<Vocabulary[]>([]),
    [showTranslations, setShowTranslations] = useState(false);
  const language = settings.language ?? "german";
  const chinese = language === "chinese";
  const target = languageNames[language];
  const greeting = chinese ? "Nǐ hǎo" : "Hallo";
  const recognition = useRef<Recognition | null>(null),
    controller = useRef<AbortController | null>(null),
    bottom = useRef<HTMLDivElement>(null),
    compose = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const w = window as SpeechWindow;
    setVoiceAvailable(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      recognition.current?.abort();
      controller.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    if (messages.length)
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  async function send(message = text) {
    const value = message.trim();
    if (busy || listening || (messages.length > 0 && !value)) return;
    const next: Message[] = value
      ? [...messages, { role: "user", text: value }]
      : messages;
    setBusy(true);
    setError("");
    window.speechSynthesis?.cancel();
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await request<Reply>(
        "chat",
        { settings, messages: next.slice(-30) },
        abort.signal,
      );
      const updated: Message[] = value
        ? [
            ...messages,
            { role: "user", text: value, feedback: result.feedback },
            {
              role: "assistant",
              text: result.reply,
              translation: result.translation,
            },
          ]
        : [
            {
              role: "assistant",
              text: result.reply,
              translation: result.translation,
            },
          ];
      setMessages(updated);
      setText("");
      setLatestWords(result.vocabulary);
      if (autoSpeak) speak(result.reply, language);
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      if (!abort.signal.aborted) {
        setBusy(false);
        compose.current?.focus();
      }
    }
  }
  function reset(value = settings) {
    controller.current?.abort();
    recognition.current?.abort();
    window.speechSynthesis?.cancel();
    setListening(false);
    setBusy(false);
    setSettings(value);
    setAutoSpeak(false);
    setMessages([]);
    setText("");
    setError("");
    setLatestWords([]);
  }
  function toggleMic() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    window.speechSynthesis?.cancel();
    const w = window as SpeechWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) return;
    const mic = new Constructor();
    recognition.current = mic;
    mic.lang = "de-DE";
    mic.continuous = false;
    mic.interimResults = true;
    const before = text.trim();
    setError("");
    mic.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++)
        transcript += e.results[i][0].transcript;
      setText((before ? before + " " : "") + transcript);
    };
    mic.onerror = (e) => {
      setListening(false);
      if (e.error !== "aborted")
        setError(
          e.error === "not-allowed"
            ? "Microphone permission is blocked. Allow it in your browser’s site settings, or type your reply."
            : e.error === "no-speech"
              ? "We didn’t catch that. Try the microphone again."
              : "Voice recognition isn’t available right now. You can still type your reply.",
        );
    };
    mic.onend = () => {
      setListening(false);
      compose.current?.focus();
    };
    try {
      mic.start();
      setListening(true);
    } catch {
      setError("The microphone couldn’t start. Please try again.");
    }
  }
  return (
    <>
      <Header active="speak" language={language} />
      <main className="practice-main">
        <div className="practice-heading">
          <div>
            <div className="eyebrow">
              <AudioLines size={15} /> OUTPUT PRACTICE / CONVERSATION
            </div>
            <h1>Give your {target} a voice.</h1>
            <p>
              Speak or type your own replies. Build confidence one conversation
              at a time.
            </p>
          </div>
          <button
            className="small-button reset-button"
            disabled={busy || listening}
            onClick={() => reset()}
          >
            <RotateCcw size={15} /> New conversation
          </button>
        </div>
        <div className="practice-grid">
          <div>
            <PracticeSettings
              settings={settings}
              onChange={(value) => reset(value)}
              disabled={busy || listening}
              conversation
            />
            <div className="voice-info">
              <Mic size={18} />
              <div>
                <strong>Speak your mind</strong>
                <p>
                  {chinese
                    ? "Type your replies in pinyin. Tone marks are optional. Voice features are available for German."
                    : voiceAvailable
                    ? "Tap the mic, speak German, then send your reply. Turn on read-aloud to hear your companion."
                    : "Typing works in every browser. Microphone input needs a browser with speech recognition, such as Chrome or Edge."}
                </p>
              </div>
            </div>
          </div>
          <div className="exercise-column">
            <section className="conversation-card">
              <div className="conversation-top">
                <div>
                  <span className="chat-avatar">
                    <Waves size={23} />
                  </span>
                  <div>
                    <strong>Your {target} companion</strong>
                    <span>
                      <i className="online-dot" /> Here to help you flow
                    </span>
                  </div>
                </div>
                <button
                  className={`small-button ${autoSpeak ? "toggled" : ""}`}
                  disabled={chinese}
                  aria-pressed={autoSpeak}
                  onClick={() => {
                    setAutoSpeak(!autoSpeak);
                    if (autoSpeak) window.speechSynthesis?.cancel();
                  }}
                >
                  {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>Read aloud {autoSpeak ? "on" : "off"}</span>
                </button>
              </div>
              <div className="chat-log" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="conversation-empty">
                    <span className="empty-art">
                      <Waves size={45} />
                      <span>{greeting}!</span>
                    </span>
                    <span className="eyebrow">
                      {settings.level} · {settings.topic}
                    </span>
                    <h2>
                      Every conversation
                      <br />
                      starts somewhere.
                    </h2>
                    <p>
                      Talk about your day, share an idea, or find a new word.
                      <br />
                      Your companion will meet you at your level.
                    </p>
                    <button
                      className="button primary"
                      onClick={() => void send("")}
                      disabled={busy}
                    >
                      {busy ? (
                        <>
                          <LoaderCircle size={18} className="spin" /> Saying
                          {greeting}…
                        </>
                      ) : (
                        <>
                          Say {greeting} <AudioLines size={18} />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="translation-toggle"
                      aria-pressed={showTranslations}
                      onClick={() => setShowTranslations(!showTranslations)}
                    >
                      <Languages size={14} />
                      {showTranslations
                        ? "Hide English translations"
                        : "Show English translations"}
                    </button>
                    {messages.map((message, i) => (
                      <div key={i} className={`message-group ${message.role}`}>
                        <div className="message-label">
                          {message.role === "user" ? "YOU" : "FLUEN"}
                        </div>
                        <div className="message-bubble">
                          <p lang={languageTag(language)}>{message.text}</p>
                          {message.role === "assistant" && !chinese && (
                            <button
                              className="icon-button"
                              aria-label="Listen to this reply"
                              onClick={() => speak(message.text, language)}
                            >
                              <Volume2 size={16} />
                            </button>
                          )}
                        </div>
                        {showTranslations && message.translation && (
                          <p className="message-translation">
                            {message.translation}
                          </p>
                        )}
                        {message.feedback && (
                          <FeedbackCard feedback={message.feedback} language={language} />
                        )}
                      </div>
                    ))}
                    {busy && (
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                        <small>Thinking in {target}…</small>
                      </div>
                    )}
                  </>
                )}
                <div ref={bottom} />
              </div>
              {error && (
                <div className="error-box" role="alert">
                  {error}
                </div>
              )}
              <form
                className="chat-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <label className="sr-only" htmlFor="chat-text">
                  Your {target} message
                </label>
                <textarea
                  ref={compose}
                  id="chat-text"
                  lang={languageTag(language)}
                  placeholder={
                    messages.length
                      ? `What’s on your mind? Try it in ${target}…`
                      : `Say ${greeting} to start your conversation…`
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={4000}
                  disabled={busy || messages.length === 0 || listening}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <div className="composer-buttons">
                  <button
                    type="button"
                    className={`icon-button mic-button ${listening ? "listening" : ""}`}
                    disabled={chinese || busy || !voiceAvailable || !messages.length}
                    aria-label={
                      listening ? "Stop recording" : chinese ? "Type pinyin for Chinese" : "Speak in German"
                    }
                    title={
                      chinese ? "Type pinyin for Chinese" : voiceAvailable
                        ? "Speak in German"
                        : "Speech recognition unavailable in this browser"
                    }
                    onClick={toggleMic}
                  >
                    {listening ? <Square size={18} /> : <Mic size={20} />}
                  </button>
                  <button
                    className="send-button"
                    disabled={
                      !text.trim() || busy || listening || !messages.length
                    }
                    aria-label="Send message"
                  >
                    {busy ? (
                      <LoaderCircle size={18} className="spin" />
                    ) : (
                      <Send size={19} />
                    )}
                  </button>
                </div>
              </form>
              <div className="composer-note">
                {listening
                  ? "Listening… tap stop when you’re done."
                  : chinese ? "Type pinyin · Tone marks optional · Enter to send" : "Speak or type · Enter to send · Shift + Enter for a new line"}
              </div>
            </section>
            {latestWords.length > 0 && (
              <section className="chat-vocabulary">
                <Words key={messages.length} words={latestWords} language={language} />
              </section>
            )}
            <p className="gentle-note">
              ✦ AI feedback is a helping hand. Ask your companion when
              something’s unclear.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
