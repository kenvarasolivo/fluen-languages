import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  PenLine,
  Sprout,
  BookOpen,
} from "lucide-react";
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
  return (
    <header className="header">
      <Logo />
      <nav aria-label="Main navigation">
        {active ? (
          <>
            <Link className={active === "write" ? "active" : ""} href="/write">
              <PenLine size={16} /> Writing
            </Link>
            <Link className={active === "speak" ? "active" : ""} href="/speak">
              <AudioLines size={16} /> Conversation
            </Link>
            <Link className={active === "words" ? "active" : ""} href="/words">
              <BookOpen size={16} /> My words
            </Link>
          </>
        ) : (
          <>
            <a href="#how-it-works">How it works</a>
            <a href="#practice">Ways to practice</a>
            <Link href="/write" className="nav-cta">
              Let’s get started <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </nav>
      {active && (
        <span className="language-pill">
          <span className="german-flag" /> German{" "}
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
      <span>A little practice. A lot more possibility.</span>
      <span>
        Made for your German journey <Sprout size={15} />
      </span>
    </footer>
  );
}
