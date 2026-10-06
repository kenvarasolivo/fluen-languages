import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  CheckCheck,
  Globe2,
  Heart,
  MessageCircle,
  Mic,
  MoveUpRight,
  PenLine,
  Sparkles,
  Sprout,
  Waves,
} from "lucide-react";
import { Header, Footer } from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="german-flag" /> GERMAN, ONE LITTLE WIN AT A TIME
            </div>
            <h1>
              Less overthinking.
              <br />
              More{" "}
              <span className="flow-word">
                Deutsch.
                <svg viewBox="0 0 360 20" aria-hidden="true">
                  <path d="M4 12 Q150 -2 355 10 M12 18 Q170 6 325 15" />
                </svg>
              </span>
            </h1>
            <p>
              You don’t learn a language by watching from the sidelines.
              <br className="desktop-break" /> Write it. Speak it. Make a few
              mistakes. Find your flow.
            </p>
            <Link href="/write" className="button primary">
              Find your flow <ArrowUpRight size={20} />
            </Link>
            <div className="hero-note">
              <Check size={15} /> No sign-up. No pressure. Just you and German.
            </div>
            <div className="hero-levels">
              <span>YOUR FIRST HALLO TO YOUR NEXT BIG IDEA</span>
              <div>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l, i) => (
                  <span key={l} className={i === 0 ? "selected" : ""}>
                    {l}
                  </span>
                ))}
                <span className="level-line" />
                <Sprout size={23} />
              </div>
            </div>
          </div>
          <div className="hero-art" aria-label="Preview of German practice">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="floating-label label-top">
              <Sparkles size={16} /> A little better, every day
            </div>
            <div className="doodle-star">✳</div>
            <div className="demo-writing">
              <div className="demo-top">
                <span className="mini-icon">
                  <PenLine size={17} />
                </span>{" "}
                A moment to write <span className="tiny-tag">A1</span>
              </div>
              <div className="demo-caption">HOW WOULD YOU SAY…</div>
              <h3>“I would like a coffee, please.”</h3>
              <div className="demo-answer">
                Ich möchte einen Kaffee, bitte.
                <span className="cursor" />
              </div>
              <div className="demo-success">
                <span>
                  <CheckCheck size={18} />
                </span>
                <div>
                  <strong>That’s your German flowing.</strong>
                  <small>A perfectly natural way to say it.</small>
                </div>
                <span>✦</span>
              </div>
            </div>
            <div className="demo-chat">
              <div className="chat-avatar">
                <Waves size={23} />
              </div>
              <div>
                <div className="demo-caption">YOUR CONVERSATION COMPANION</div>
                <p>
                  Und wie war dein Tag? <span>☀</span>
                </p>
                <small>And how was your day?</small>
              </div>
              <button
                className="demo-mic"
                aria-label="Microphone preview"
                disabled
              >
                <Mic size={18} />
              </button>
            </div>
            <div className="floating-label label-bottom">
              <Heart size={15} /> Mistakes welcome here.
            </div>
            <div className="art-squiggle">
              <svg viewBox="0 0 100 65">
                <path d="M5 50 Q60 55 48 25 Q35 5 28 27 Q22 60 91 8 M74 9 L93 6 L91 24" />
              </svg>
            </div>
          </div>
        </section>
        <div className="belief-strip">
          <span>
            <PenLine size={17} /> Learn by doing
          </span>
          <span>
            <MessageCircle size={18} /> Feedback that makes sense
          </span>
          <span>
            <Globe2 size={18} /> Real-life German
          </span>
          <span>
            <Heart size={18} /> At your own pace
          </span>
        </div>
        <section className="modes-section" id="practice">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TWO WAYS IN. ENDLESS WAYS FORWARD.</div>
              <h2>
                A little writing. A little talking.
                <br />A lot more confidence.
              </h2>
            </div>
            <p>
              Less tapping through lessons.
              <br />
              More putting your German into the world.
            </p>
          </div>
          <div className="mode-cards">
            <Link href="/write" className="mode-card writing-card">
              <div className="mode-card-top">
                <span className="mode-icon">
                  <PenLine size={26} />
                </span>
                <span className="mode-number">01 / WRITE IT OUT</span>
                <ArrowUpRight size={24} />
              </div>
              <h3>From “I think” to “Ich denke.”</h3>
              <p>
                Turn English sentences into your own German. Get kind, clear
                corrections and pick up new words along the way.
              </p>
              <div className="mode-tags">
                <span>Your level</span>
                <span>Your topics</span>
                <span>Real feedback</span>
              </div>
              <span className="text-link">
                Try writing practice <ArrowRight size={18} />
              </span>
            </Link>
            <Link href="/speak" className="mode-card speaking-card">
              <div className="mode-card-top">
                <span className="mode-icon">
                  <AudioLines size={27} />
                </span>
                <span className="mode-number">02 / TALK IT THROUGH</span>
                <ArrowUpRight size={24} />
              </div>
              <h3>Good conversations start with Hallo.</h3>
              <p>
                Talk or type with your AI companion. Explore a topic, follow
                your curiosity, and get helpful corrections as you go.
              </p>
              <div className="mode-tags">
                <span>Speak or type</span>
                <span>Instant corrections</span>
                <span>Zero awkwardness</span>
              </div>
              <span className="text-link">
                Start a conversation <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </section>
        <section id="how-it-works" className="how-section">
          <div className="eyebrow">SMALL STEPS. REAL PROGRESS.</div>
          <h2>Your German. Your rhythm.</h2>
          <div className="steps">
            <div>
              <span>01</span>
              <h3>Find your starting point</h3>
              <p>
                Choose your level from A1 to C2 and a topic you actually want to
                talk about.
              </p>
            </div>
            <div>
              <span>02</span>
              <h3>Give it a go</h3>
              <p>
                Write a sentence or have a conversation. You don’t have to get
                it perfect.
              </p>
            </div>
            <div>
              <span>03</span>
              <h3>Take something with you</h3>
              <p>
                Understand your corrections and save new words for the next time
                they come up.
              </p>
            </div>
          </div>
        </section>
        <section className="bottom-cta">
          <div>
            <span className="eyebrow">YOU ALREADY KNOW YOUR FIRST WORD.</span>
            <h2>Hallo, new possibilities.</h2>
            <p>Your next sentence is a great place to start.</p>
          </div>
          <Link className="button primary" href="/write">
            Let’s practice <MoveUpRight size={19} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
