import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Clapperboard,
  MessageCircle,
  Library,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "FLUEN - Languages that stick",
  description:
    "Learn languages with flashcards, real texts and conversations - calm, focused and without the noise. German, Spanish and Mandarin Chinese available now, more languages coming.",
};

const features = [
  {
    icon: Layers,
    title: "Foundations",
    text: "Build your vocabulary with smart repetition - right when you need it.",
    chip: "bg-accent text-white",
  },
  {
    icon: Clapperboard,
    title: "Immerse",
    text: "Dive into real texts and collect new words straight from context.",
    chip: "bg-coral text-white",
  },
  {
    icon: MessageCircle,
    title: "Speak",
    text: "Have real conversations and get gentle corrections as you write and speak.",
    chip: "bg-teal text-white",
  },
  {
    icon: Library,
    title: "Cards",
    text: "Your personal collection grows with you - every word with an example and context.",
    chip: "bg-amber text-white",
  },
];

const steps = [
  {
    n: "1",
    title: "Collect words",
    text: "From texts, conversations or your own lists.",
  },
  {
    n: "2",
    title: "Review smart",
    text: "The system reminds you at the right moment.",
  },
  {
    n: "3",
    title: "Start speaking",
    text: "Use everything right away in conversation.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-mesh flex min-h-dvh flex-col">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-base font-extrabold tracking-[0.2em]"
        >
          <span
            aria-hidden
            className="size-2.5 bg-accent shadow-[0_0_10px] shadow-accent/50"
          />
          FLUEN
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="btn-primary rounded-md px-5 py-2 text-xs"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-24 pt-10 text-center md:pt-14">
        <p className="eyebrow fade-up flex items-center gap-1.5 border-[1.5px] border-border-strong bg-surface-raised px-3 py-1 text-[11px]">
          <Sparkles size={12} className="text-amber" aria-hidden />
          German, Spanish &amp; Mandarin — more coming
        </p>
        <h1 className="display fade-up fade-up-1 mt-7 text-5xl uppercase md:text-7xl">
          Languages
          <br />
          that <span className="text-gradient-warm">stick.</span>
        </h1>
        <p className="fade-up fade-up-2 mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Flashcards, real texts and conversations — all in one place. Focused
          and at your own pace. Start with German, Spanish or Mandarin today.
        </p>
        <div className="fade-up fade-up-3 mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="btn-primary flex items-center justify-center gap-2 rounded-md px-7 py-3.5 text-sm"
          >
            Start for free
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/login"
            className="btn-outline flex items-center justify-center rounded-md px-7 py-3.5 text-sm"
          >
            Try as guest
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <h2 className="eyebrow text-center text-xs text-muted">
          Four ways to get there
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, chip }) => (
            <div
              key={title}
              className="rounded-md border-[1.5px] border-border-strong bg-surface-raised p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-pop"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-md ${chip}`}
              >
                <Icon size={20} strokeWidth={2} aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — inverted, full-bleed block (white-on-black) */}
      <section className="bg-foreground text-background">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
          <h2 className="eyebrow text-center text-xs text-background/60">
            How it works
          </h2>
          <div className="mt-10 grid gap-10 text-center md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-md bg-accent text-lg font-extrabold text-white">
                  {s.n}
                </span>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{s.title}</h3>
                <p className="max-w-xs text-sm text-background/70">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md bg-background px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-foreground transition-transform duration-150 hover:-translate-y-1 active:translate-y-0"
            >
              Get started
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-muted">
          <p>© {new Date().getFullYear()} FLUEN · Learn languages. Without the noise.</p>
          <Link
            href="/impressum"
            className="rounded-md transition-colors hover:text-foreground"
          >
            Impressum
          </Link>
        </div>
      </footer>
    </div>
  );
}
