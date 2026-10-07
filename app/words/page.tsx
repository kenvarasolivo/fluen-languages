"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Search, Trash2, Volume2 } from "lucide-react";
import { Header, Footer } from "@/components/header";
import { Vocabulary, languageNames, languageTag } from "@/lib/practice";
import { speak } from "@/components/feedback";
export default function WordsPage() {
  const [words, setWords] = useState<Vocabulary[]>([]),
    [query, setQuery] = useState("");
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("fluen:words") || "[]");
      if (Array.isArray(stored))
        setWords(
          stored.filter(
            (w) =>
              w &&
              typeof w.german === "string" &&
              typeof w.english === "string",
          ),
        );
    } catch {}
  }, []);
  function remove(word: Vocabulary) {
    const next = words.filter((w) => w.german !== word.german || (w.language ?? "german") !== (word.language ?? "german"));
    setWords(next);
    try {
      localStorage.setItem("fluen:words", JSON.stringify(next));
      window.dispatchEvent(new Event("fluen:words"));
    } catch {}
  }
  const filtered = words.filter((w) =>
    (w.german + " " + w.english).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Header active="words" />
      <main className="practice-main words-main">
        <div className="practice-heading">
          <div>
            <div className="eyebrow">
              <BookOpen size={15} /> YOUR ACTIVE VOCABULARY
            </div>
            <h1>Words for your next conversation.</h1>
            <p>
              Revisit what you’ve learned, then use it in your next sentence.
              Saved in this browser.
            </p>
          </div>
          <span className="session-count">{words.length} words collected</span>
        </div>
        {words.length === 0 ? (
          <section className="words-empty">
            <div className="mascot-art">
              <Image src="/illustrations/fluen-shape-friends.png" alt="Fluen companions ready to collect new words with you" width={1774} height={887} />
            </div>
            <h2>Make your vocabulary work for you.</h2>
            <p>
              Save vocabulary from your writing feedback or conversations.
              <br />
              You’ll find it here, ready for another little practice.
            </p>
            <Link className="button primary" href="/write">
              Find your first words <ArrowRight size={18} />
            </Link>
          </section>
        ) : (
          <>
            <label className="word-search">
              <Search size={19} />
              <input
                placeholder="Find a word…"
                aria-label="Search saved words"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="saved-words">
              {filtered.map((w) => (
                <article key={`${w.language ?? "german"}:${w.german}`}>
                  <div>
                    <h2 lang={languageTag(w.language)}>{w.german}</h2>
                    <p>{w.english}</p>
                    <small>{languageNames[w.language === "chinese" ? "chinese" : "german"]}</small>
                  </div>
                  <div>
                    {w.language !== "chinese" && <button
                      className="icon-button"
                      onClick={() => speak(w.german)}
                      aria-label={`Listen to ${w.german}`}
                    >
                      <Volume2 size={18} />
                    </button>}
                    <button
                      className="icon-button"
                      onClick={() => remove(w)}
                      aria-label={`Remove ${w.german}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="gentle-note">No words match that search yet.</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
