"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Search, Trash2, Volume2 } from "lucide-react";
import { Header, Footer } from "@/components/header";
import { Vocabulary, languageNames, languageTag } from "@/lib/practice";
import { speak } from "@/components/feedback";
import { useLanguage } from "@/components/language-provider";
import { useAccount } from "@/components/account-provider";
import { GuestSaveNotice } from "@/components/guest-save-notice";
export default function WordsPage() {
  const { language } = useLanguage();
  const { words, removeWord, user, loading } = useAccount();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string[]>([]);
  async function remove(word: Vocabulary) {
    const key = `${word.language}:${word.german}`;
    setRemoving(previous => [...previous, key]); setError("");
    try { await removeWord(word); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not remove this word. Please try again."); }
    finally { setRemoving(previous => previous.filter(w => w !== key)); }
  }
  const languageWords = words.filter((word) => (word.language ?? "german") === language);
  const filtered = languageWords.filter((w) =>
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
              {user ? " Saved to your account." : " Your guest collection is saved in this browser."}
            </p>
          </div>
          <span className="session-count">{languageWords.length} {languageNames[language]} words collected</span>
        </div>
        <GuestSaveNotice />
        {error && <p role="alert">{error}</p>}
        {loading ? <p role="status">Loading your saved words…</p> : languageWords.length === 0 ? (
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
                      disabled={removing.includes(`${w.language}:${w.german}`)}
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
