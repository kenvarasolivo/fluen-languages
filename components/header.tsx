"use client";
import Link from "next/link";
import { ArrowUpRight, AudioLines, PenLine, BookOpen, ChevronDown } from "lucide-react";
import { languages, languageNames } from "@/lib/practice";
import { useLanguage } from "./language-provider";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Fluen home">
      <span className="logo-mark">
        <AudioLines size={23} />
      </span>
      fluen<span className="logo-dot">.</span>
    </Link>
  );
}
export function Header({ active }: { active?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <header className={`header${active ? " practice-header" : ""}`}>
      <div className="brand-lockup">
        <Logo />
        <span>Language in action.</span>
      </div>
      <nav aria-label="Main navigation">
        {active ? (
          <>
            <Link
              aria-current={active === "write" ? "page" : undefined}
              className={active === "write" ? "active" : ""}
              href="/write"
            >
              <PenLine size={16} /> Writing
            </Link>
            <Link
              aria-current={active === "speak" ? "page" : undefined}
              className={active === "speak" ? "active" : ""}
              href="/speak"
            >
              <AudioLines size={16} /> Conversation
            </Link>
            <Link
              aria-current={active === "words" ? "page" : undefined}
              className={active === "words" ? "active" : ""}
              href="/words"
            >
              <BookOpen size={16} /> My words
            </Link>
          </>
        ) : (
          <>
            <a href="#how-it-works">How it works</a>
            <a href="#practice">Ways to practice</a>
            <Link href="/write" className="nav-cta">
              Start practicing <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </nav>
      {active && (
        <label className="language-pill header-language">
          {language === "german" && <span className="german-flag" />}
          {language === "chinese" && <span className="chinese-flag">★</span>}
          <select aria-label="Practice language" value={language} onChange={(event) => setLanguage(event.target.value === "chinese" ? "chinese" : "german")}>
            {languages.map((value) => <option key={value} value={value}>{languageNames[value]}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <Logo />
      <span>Learn a language by putting it into words.</span>
      <span>German and Chinese (pinyin). More languages coming soon.</span>
    </footer>
  );
}
