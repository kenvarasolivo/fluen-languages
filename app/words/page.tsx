"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, Trash2, Volume2 } from "lucide-react";
import { Header, Footer } from "@/components/header";
import { Vocabulary } from "@/lib/practice";
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
  function remove(german: string) {
    const next = words.filter((w) => w.german !== german);
    setWords(next);
    try {
      localStorage.setItem("fluen:words", JSON.stringify(next));
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
              <BookOpen size={15} /> LITTLE DISCOVERIES
            </div>
            <h1>Words that stay with you.</h1>
            <p>Your collection of German words, saved on this browser.</p>
          </div>
          <span className="session-count">{words.length} words collected</span>
        </div>
        {words.length === 0 ? (
          <section className="words-empty">
            <span className="empty-art">
              <BookOpen size={40} />
            </span>
            <h2>A little room for new words.</h2>
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
                <article key={w.german}>
                  <div>
                    <h2 lang="de">{w.german}</h2>
                    <p>{w.english}</p>
                  </div>
                  <div>
                    <button
                      className="icon-button"
                      onClick={() => speak(w.german)}
                      aria-label={`Listen to ${w.german}`}
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => remove(w.german)}
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
