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
    "Learn languages with flashcards, real texts and conversations - calm, focused and without the noise. German available now, more languages coming.",
};

const features = [
  {
    icon: Layers,
    title: "Foundations",
    text: "Build your vocabulary with smart repetition - right when you need it.",
    chip: "bg-accent-soft text-accent",
  },
  {
    icon: Clapperboard,
    title: "Immerse",
    text: "Dive into real texts and collect new words straight from context.",
    chip: "bg-coral-soft text-coral",
  },
  {
    icon: MessageCircle,
    title: "Speak",
    text: "Have real conversations and get gentle corrections as you write and speak.",
    chip: "bg-teal-soft text-teal",
  },
  {
    icon: Library,
    title: "Cards",
    text: "Your personal collection grows with you - every word with an example and context.",
    chip: "bg-amber-soft text-amber",
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
          className="flex items-center gap-2.5 rounded-md text-sm font-semibold tracking-[0.18em]"
        >
          <span
            aria-hidden
            className="size-2 rounded-[3px] bg-accent shadow-[0_0_8px] shadow-accent/40"
          />
          FLUEN
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <p className="fade-up flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium text-muted shadow-xs">
          <Sparkles size={12} className="text-amber" aria-hidden />
          Available now: German - more languages coming
        </p>
        <h1 className="fade-up fade-up-1 mt-6 text-4xl font-semibold leading-tight tracking-[-0.02em] md:text-6xl">
          Languages that{" "}
          <span className="text-gradient-warm">stick.</span>
        </h1>
        <p className="fade-up fade-up-2 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Flashcards, real texts and conversations - all in one place. Calm,
          focused and at your own pace. Start with German today.
        </p>
        <div className="fade-up fade-up-3 mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-pop active:scale-[0.99]"
          >
            Start for free
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-surface-raised px-6 py-3 text-sm font-medium text-muted shadow-xs transition-all duration-150 hover:border-border-strong hover:text-foreground"
          >
            Try as guest
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="text-center text-sm font-medium uppercase tracking-[0.14em] text-muted">
          Four ways to get there
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, chip }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface-raised p-5 shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop"
            >
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${chip}`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="rounded-2xl border border-border bg-surface-raised px-6 py-10 shadow-raised md:px-10">
          <h2 className="text-center text-sm font-medium uppercase tracking-[0.14em] text-muted">
            How it works
          </h2>
          <div className="mt-8 grid gap-8 text-center md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {s.n}
                </span>
                <h3 className="mt-1 text-sm font-semibold">{s.title}</h3>
                <p className="text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-pop active:scale-[0.99]"
            >
              Get started
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted">
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
