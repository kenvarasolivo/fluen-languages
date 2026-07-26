import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Clapperboard,
  MessageCircle,
  Library,
  ArrowRight,
  Sparkles,
  Plane,
  Briefcase,
  GraduationCap,
  Check,
} from "lucide-react";
import { FluenLogo } from "@/components/logo";
import {
  HeroRibbons,
  SectionRibbons,
  Squiggle,
  ArcConfetti,
  StepConnector,
} from "@/components/flow-art";

export const metadata: Metadata = {
  title: "fluen - Languages that flow",
  description:
    "Learn languages with flashcards, real texts and conversations - calm, focused and without the noise. German, Spanish and Mandarin Chinese available now, more languages coming.",
};

/* Each feature takes one segment of the brand ribbon, so a row of
   them replays the blue→mint gradient from left to right. */
const features = [
  {
    icon: Layers,
    title: "Foundations",
    text: "Build your vocabulary with smart repetition - right when you need it.",
    chip: "chip-blue",
  },
  {
    icon: Clapperboard,
    title: "Immerse",
    text: "Dive into real texts and collect new words straight from context.",
    chip: "chip-azure",
  },
  {
    icon: MessageCircle,
    title: "Speak",
    text: "Have real conversations and get gentle corrections as you write and speak.",
    chip: "chip-cyan",
  },
  {
    icon: Library,
    title: "Cards",
    text: "Your personal collection grows with you - every word with an example and context.",
    chip: "chip-mint",
  },
];

const deepDives = [
  {
    icon: Layers,
    chip: "chip-blue",
    kicker: "Foundations",
    headline: "Vocabulary that arrives right on time.",
    text: "A CEFR-aligned curriculum from A1 to C1, drilled with spaced repetition. Each word comes back exactly when you're about to forget it — no wasted reviews, no cramming.",
    points: [
      "Structured modules from A1 to C1",
      "Smart scheduling — review only what's due",
      "Every card carries a real example sentence",
    ],
    visual: "flashcard" as const,
  },
  {
    icon: Clapperboard,
    chip: "chip-azure",
    kicker: "Immerse",
    headline: "Read the real world, not textbook filler.",
    text: "Stories and texts matched to your level and your reason for learning. Tap any word you don't know and it lands in your collection — with the sentence it came from.",
    points: [
      "Texts graded to your CEFR level",
      "Tap a word to save it with full context",
      "Scenes shaped by your learning focus",
    ],
    visual: "reader" as const,
  },
  {
    icon: MessageCircle,
    chip: "chip-cyan",
    kicker: "Speak",
    headline: "Conversations, not flash quizzes.",
    text: "Talk about your day, order a coffee, nail a job interview — out loud or in writing. fluen answers naturally and corrects you gently, mid-conversation, the way a good friend would.",
    points: [
      "Voice and text conversation practice",
      "Gentle inline corrections as you go",
      "Scenarios that match your goals",
    ],
    visual: "chat" as const,
  },
  {
    icon: Library,
    chip: "chip-mint",
    kicker: "Cards",
    headline: "A collection that's genuinely yours.",
    text: "Every word you meet — from a story, a conversation or your own list — lives in one place, with its example, its context and its review history. Watch it grow into fluency.",
    points: [
      "One home for every word you collect",
      "Search, filter and edit your cards",
      "Progress you can actually see",
    ],
    visual: "collection" as const,
  },
];

const purposes = [
  { icon: MessageCircle, label: "Everyday talk" },
  { icon: Plane, label: "Travel" },
  { icon: Briefcase, label: "Business" },
  { icon: GraduationCap, label: "Exams" },
  { icon: Clapperboard, label: "Culture & media" },
];

const languages = [
  { code: "DE", name: "German", native: "Deutsch", hello: "Hallo!", rule: "flag-rule-de" },
  { code: "ES", name: "Spanish", native: "Español", hello: "¡Hola!", rule: "flag-rule-es" },
  { code: "ZH", name: "Mandarin", native: "中文", hello: "你好!", rule: "flag-rule-zh" },
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

/* ---- Small product vignettes for the deep-dive rows ---- */

function FlashcardVisual() {
  return (
    <div aria-hidden className="relative mx-auto w-64">
      <div className="card-flow absolute inset-x-3 -top-3 h-full -rotate-3 rounded-3xl opacity-50" />
      <div className="card-flow absolute inset-x-1.5 -top-1.5 h-full rotate-2 rounded-3xl opacity-70" />
      <div className="card-flow relative rounded-3xl p-6 text-center">
        <p className="eyebrow text-[10px] text-white/45">Noun · A1</p>
        <p className="display mt-3 text-2xl text-white">der Bahnhof</p>
        <p className="mt-1 text-sm text-white/60">the train station</p>
        <p className="mt-4 text-xs italic leading-relaxed text-white/45">
          &ldquo;Der Zug wartet am Bahnhof.&rdquo;
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/60">
            Again
          </span>
          <span className="grad-accent rounded-full px-4 py-1.5 text-xs font-semibold">
            Good
          </span>
        </div>
      </div>
    </div>
  );
}

function ReaderVisual() {
  return (
    <div aria-hidden className="card-flow mx-auto w-72 rounded-3xl p-6">
      <p className="eyebrow text-[10px] text-white/45">Un café en Madrid · A2</p>
      <div className="mt-4 space-y-2.5">
        <span className="block h-2 w-full rounded-full bg-white/15" />
        <span className="block h-2 w-10/12 rounded-full bg-white/15" />
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 py-0.5 text-sm leading-relaxed text-white/75">
          Pedí un
          <span className="rounded-full bg-[#06a3f0]/35 px-2 py-0.5 font-semibold text-white ring-1 ring-[#5ff5ff]/60">
            cortado
          </span>
          en la barra…
        </p>
        <span className="block h-2 w-full rounded-full bg-white/15" />
        <span className="block h-2 w-8/12 rounded-full bg-white/15" />
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/65">
        <Check size={13} className="text-[#3ce8a8]" aria-hidden />
        Saved to your cards — with this sentence
      </p>
    </div>
  );
}

function ChatVisual() {
  return (
    <div aria-hidden className="mx-auto flex w-72 flex-col gap-2.5">
      <div className="card-flow max-w-[85%] self-start rounded-3xl rounded-bl-lg px-4 py-3 text-sm text-white/85">
        ¿Qué hiciste el fin de semana?
      </div>
      <div className="grad-accent max-w-[85%] self-end rounded-3xl rounded-br-lg px-4 py-3 text-sm">
        Fui al cine con mis amigos.
      </div>
      <div className="card-flow max-w-[85%] self-start rounded-3xl rounded-bl-lg px-4 py-3 text-sm text-white/85">
        ¡Perfecto! 🎬 ¿Qué película viste?
      </div>
      <p className="mt-1 flex items-center gap-1.5 self-end text-xs text-white/55">
        <Check size={13} className="text-[#3ce8a8]" aria-hidden />
        Past tense — spot on
      </p>
    </div>
  );
}

function CollectionVisual() {
  const words = [
    ["der Zug", "#1b3ce8"],
    ["viajar", "#06a3f0"],
    ["谢谢", "#00d3dd"],
    ["la playa", "#16e3a2"],
    ["sprechen", "#06a3f0"],
    ["mañana", "#00d3dd"],
    ["朋友", "#16e3a2"],
    ["das Meer", "#1b3ce8"],
    ["quizás", "#06a3f0"],
  ] as const;
  return (
    <div aria-hidden className="card-flow mx-auto w-72 rounded-3xl p-6">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-[10px] text-white/45">Your collection</p>
        <p className="text-xs font-bold tabular-nums text-white/70">438 words</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {words.map(([w, dot]) => (
          <span
            key={w}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/85"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: dot }}
            />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

const visuals = {
  flashcard: FlashcardVisual,
  reader: ReaderVisual,
  chat: ChatVisual,
  collection: CollectionVisual,
};

export default function LandingPage() {
  return (
    <div className="page-flow relative flex min-h-dvh flex-col overflow-x-clip">
      {/* ============ Header + hero share one ribbon field, so the
           ribbons run behind the logo with no seam at the header's
           foot, and fade out into the page below. ============ */}
      <div className="relative">
        <div
          aria-hidden
          className="ribbon-veil absolute inset-0 z-0 overflow-hidden"
        >
          <HeroRibbons />
        </div>

        <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="rounded-full text-white">
            <FluenLogo height={30} />
          </Link>
          <Link href="/login" className="btn-primary px-5 py-2.5 text-xs">
            Sign in
          </Link>
        </header>

        {/* The copy sits a little above the ribbon field's centre — the
            heavier bottom padding is what lifts it. */}
        <section className="relative flex min-h-[calc(100svh-92px)] flex-col items-center justify-center px-6 pb-36 pt-8 text-center">
          <ArcConfetti />
          <div aria-hidden className="hero-scrim" />

          <div className="relative z-10 flex flex-col items-center">
            <p className="eyebrow fade-up flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.07] px-4 py-1.5 text-[11px] text-white/85 backdrop-blur-sm">
              <Sparkles size={12} className="text-[#5ff5ff]" aria-hidden />
              German, Spanish &amp; Mandarin — more coming
            </p>
            <h1 className="display fade-up fade-up-1 mt-8 text-5xl text-white [text-shadow:0_2px_40px_rgba(5,8,64,0.85)] sm:text-6xl md:text-8xl">
              Languages
              <br />
              that <span className="text-ribbon">flow.</span>
            </h1>
            <p className="fade-up fade-up-2 mt-7 max-w-xl text-base leading-relaxed text-white/80 [text-shadow:0_1px_18px_rgba(5,8,64,0.9)] md:text-lg">
              Flashcards, real texts and conversations — one calm place, no
              streak-guilt, no noise. Just you, a whole world of words, and the
              right moment to learn each one.
            </p>
            <div className="fade-up fade-up-3 mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
              >
                Start for free
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/login"
                className="btn-flow flex items-center justify-center px-8 py-3.5 text-sm"
              >
                Try as guest
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Squiggle className="relative z-10 -mt-2" />

      {/* ============ Four ways to get there ============ */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 pt-16">
        <h2 className="eyebrow text-center text-xs text-[#5ff5ff]/85">
          Four ways to get there
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-white/60">
          Learn, read, talk, collect — four surfaces that feed each other, so
          every word you meet comes back until it&apos;s yours.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, chip }) => (
            <div
              key={title}
              className="card-flow rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <span
                className={`chip-blob ${chip} flex size-12 items-center justify-center`}
              >
                <Icon size={20} strokeWidth={2} aria-hidden />
              </span>
              <h3 className="display mt-4 text-lg text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Deep dives — one bend of the ribbon per feature ============ */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
        {/* Full-bleed: the section's max-width would otherwise clip the
            ribbons into a visible rectangle. */}
        <div
          aria-hidden
          className="ribbon-veil-y absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden"
        >
          <SectionRibbons />
        </div>
        <div className="flex flex-col gap-24 md:gap-32">
          {deepDives.map(
            ({ icon: Icon, chip, kicker, headline, text, points, visual }, i) => {
              const Visual = visuals[visual];
              return (
                <div
                  key={kicker}
                  className={`flex flex-col items-center gap-10 md:gap-16 ${
                    i % 2 ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  <div className="flex-1">
                    <span
                      className={`chip-blob ${chip} flex size-12 items-center justify-center`}
                    >
                      <Icon size={20} strokeWidth={2} aria-hidden />
                    </span>
                    <p className="eyebrow mt-5 text-xs text-[#5ff5ff]/85">
                      {kicker}
                    </p>
                    <h3 className="display mt-3 text-3xl text-white md:text-4xl">
                      {headline}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                      {text}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {points.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2.5 text-sm text-white/80"
                        >
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-[#3ce8a8]"
                            aria-hidden
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-full flex-1">
                    <Visual />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      <Squiggle className="relative z-10 mt-20" />

      {/* ============ Purpose — learning shaped around your "why" ============ */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 py-24 text-center">
        <h2 className="eyebrow text-xs text-[#5ff5ff]/85">Made for your why</h2>
        <p className="display mx-auto mt-4 max-w-2xl text-3xl text-white md:text-4xl">
          Tell fluen why you&apos;re learning — everything reshapes around it.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
          Pick a focus and your modules reorder, your reading scenes change and
          your conversations practice the situations you&apos;ll actually be in.
          Switch it any time.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {purposes.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="card-flow flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white/90"
            >
              <Icon size={16} className="text-[#5ff5ff]" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ============ Languages ============ */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-32">
        <div
          aria-hidden
          className="ribbon-veil-y absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden"
        >
          <SectionRibbons flip />
        </div>
        <h2 className="eyebrow text-center text-xs text-[#5ff5ff]/85">
          Three worlds to explore
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-white/60">
          Full A1–C1 curriculums, native example audio and real texts in every
          language — with more on the way.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {languages.map(({ code, name, native, hello, rule }) => (
            <div
              key={name}
              className="card-flow relative overflow-hidden rounded-3xl p-7 pb-8 text-center transition-transform duration-300 hover:-translate-y-1.5"
            >
              <span
                aria-hidden
                className="ring-ribbon mx-auto flex size-14 items-center justify-center text-sm font-extrabold tracking-widest text-white"
              >
                {code}
              </span>
              <h3 className="display mt-4 text-xl text-white">{name}</h3>
              <p className="text-sm text-white/55">{native}</p>
              <p className="text-ribbon display mt-4 text-2xl">{hello}</p>
              {/* National colours as a soft rule along the card's foot */}
              <span
                aria-hidden
                className={`${rule} absolute inset-x-6 bottom-0 h-1.5 rounded-full opacity-85`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ How it works + finale — the ribbon threads the
           steps together, then the page ends on a crest. ============ */}
      <section className="relative z-10 mt-auto overflow-hidden">
        <div className="mx-auto w-full max-w-5xl px-6 pt-8">
          <h2 className="eyebrow text-center text-xs text-[#5ff5ff]/85">
            How it works
          </h2>
          <div className="relative mt-10 grid gap-10 text-center md:grid-cols-3">
            <StepConnector />
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center gap-3">
                <span className="grad-accent flex size-14 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-pop">
                  {s.n}
                </span>
                <h3 className="display mt-1 text-xl text-white">{s.title}</h3>
                <p className="max-w-xs text-sm text-white/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA floating just above the closing crest */}
        <div className="relative mt-24 pb-14 md:mt-28">
          <div aria-hidden className="flow-crest" />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-6 pt-16 text-center">
            <p className="display text-3xl text-white md:text-5xl">
              Ready to get flowing?
            </p>
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              Free to start, no card needed — you&apos;ll be collecting your
              first words two minutes from now.
            </p>
            <Link
              href="/login"
              className="btn-primary mt-2 flex items-center gap-2 px-9 py-4 text-sm"
            >
              Get started
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          {/* Footer — one quiet line resting on the crest */}
          <footer className="relative mx-auto mt-20 w-full max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/12 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-6 text-xs text-white/55">
              <p className="flex items-center gap-2.5">
                <FluenLogo height={18} />
                <span aria-hidden className="text-white/25">·</span>©{" "}
                {new Date().getFullYear()} · Learn languages. Without the noise.
              </p>
              <Link
                href="/impressum"
                className="rounded-full transition-colors hover:text-white"
              >
                Impressum
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
