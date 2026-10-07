"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, AudioLines, PenLine, BookOpen, ChevronDown } from "lucide-react";
import { languages, languageNames } from "@/lib/practice";
import { useLanguage } from "./language-provider";
import { AccountMenu } from "./account-menu";
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
export function Header({ active, account = false }: { active?: string; account?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <header className={`header${active ? " practice-header" : ""}${account ? " account-header" : ""}`}>
      <div className="brand-lockup">
        <Logo />
        <span>Language in action.</span>
      </div>
      <nav aria-label="Main navigation">
        {account ? <Link className="account-back" href="/write"><ArrowLeft size={16} /> Back to practice</Link> : active ? (
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
      {!account && <div className="header-tools">{active && (
        <label className="language-pill header-language">
          {language === "german" && <span className="german-flag" />}
          {language === "chinese" && <span className="chinese-flag">★</span>}
          <select aria-label="Practice language" value={language} onChange={(event) => setLanguage(event.target.value === "chinese" ? "chinese" : "german")}>
            {languages.map((value) => <option key={value} value={value}>{languageNames[value]}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      )}
      <AccountMenu /></div>}
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
