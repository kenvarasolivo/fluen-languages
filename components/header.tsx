import Link from "next/link";
import { ArrowUpRight, AudioLines, PenLine, BookOpen } from "lucide-react";
import { Language, languageNames } from "@/lib/practice";
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
export function Header({ active, language }: { active?: string; language?: Language }) {
  return (
    <header className="header">
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
      {active && language && (
        <span className="language-pill">
          {language === "german" && <span className="german-flag" />} {languageNames[language]}{" "}
          <span className="online-dot" />
        </span>
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
