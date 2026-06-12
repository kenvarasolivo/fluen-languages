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
  title: "FLUEN — Sprachen, die hängen bleiben",
  description:
    "Lerne Sprachen mit Karteikarten, echten Texten und Gesprächen — ruhig, fokussiert und ohne Lärm. Jetzt mit Deutsch, weitere Sprachen folgen.",
};

const features = [
  {
    icon: Layers,
    title: "Foundations",
    text: "Baue deinen Wortschatz mit intelligenten Wiederholungen auf — genau dann, wenn du sie brauchst.",
    chip: "bg-accent-soft text-accent",
  },
  {
    icon: Clapperboard,
    title: "Immerse",
    text: "Tauche in echte Texte ein und sammle neue Wörter direkt aus dem Kontext.",
    chip: "bg-coral-soft text-coral",
  },
  {
    icon: MessageCircle,
    title: "Speak",
    text: "Führe echte Gespräche und bekomme sanfte Korrekturen, während du schreibst und sprichst.",
    chip: "bg-teal-soft text-teal",
  },
  {
    icon: Library,
    title: "Cards",
    text: "Deine persönliche Sammlung wächst mit dir — jedes Wort mit Beispiel und Kontext.",
    chip: "bg-amber-soft text-amber",
  },
];

const steps = [
  {
    n: "1",
    title: "Sammle Wörter",
    text: "Aus Texten, Gesprächen oder eigenen Listen.",
  },
  {
    n: "2",
    title: "Wiederhole klug",
    text: "Das System erinnert dich im richtigen Moment.",
  },
  {
    n: "3",
    title: "Sprich drauflos",
    text: "Wende alles sofort im Gespräch an.",
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
            Anmelden
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <p className="fade-up flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium text-muted shadow-xs">
          <Sparkles size={12} className="text-amber" aria-hidden />
          Jetzt verfügbar: Deutsch — weitere Sprachen folgen
        </p>
        <h1
          lang="de"
          className="fade-up fade-up-1 mt-6 text-4xl font-semibold leading-tight tracking-[-0.02em] md:text-6xl"
        >
          Sprachen, die{" "}
          <span className="text-gradient-warm">hängen bleiben.</span>
        </h1>
        <p className="fade-up fade-up-2 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Karteikarten, echte Texte und Gespräche — alles an einem Ort. Ruhig,
          fokussiert und genau in deinem Tempo. Starte heute mit Deutsch.
        </p>
        <div className="fade-up fade-up-3 mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-raised transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-pop active:scale-[0.99]"
          >
            Kostenlos starten
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-surface-raised px-6 py-3 text-sm font-medium text-muted shadow-xs transition-all duration-150 hover:border-border-strong hover:text-foreground"
          >
            Als Gast ausprobieren
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="text-center text-sm font-medium uppercase tracking-[0.14em] text-muted">
          Vier Wege zum Ziel
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
            So funktioniert&apos;s
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
              Jetzt loslegen
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted">
          <p>© {new Date().getFullYear()} FLUEN · Sprachen lernen. Ohne Lärm.</p>
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
