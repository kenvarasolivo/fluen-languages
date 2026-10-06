import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Check,
  CheckCheck,
  MessageCircle,
  Mic,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Header, Footer } from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="home-main">
        <section className="output-hero">
          <div className="output-copy">
            <div className="eyebrow">
              <span className="brand-status" /> THE OUTPUT-FIRST LANGUAGE APP
            </div>
            <h1>
              Learn a language
              <br />
              <span>by using it.</span>
            </h1>
            <p>
              Turn what you know into what you can say. Learn a language by
              writing your own sentences and having real conversations, with AI
              feedback that helps you improve.
            </p>
            <div className="hero-actions">
              <Link href="/write" className="button primary">
                Start writing <ArrowUpRight size={19} />
              </Link>
              <Link href="/speak" className="button secondary">
                <AudioLines size={19} /> Try a conversation
              </Link>
            </div>
            <div className="output-note">
              <Check size={15} /> No account needed <span>·</span> Output first
            </div>
            <div className="language-availability">
              <span>
                <span className="german-flag" /> German & Chinese (pinyin) · A1–C2
              </span>
              <span>More languages coming soon</span>
            </div>
            <div className="output-principle">
              <span className="principle-icon">
                <MessageCircle size={20} />
              </span>
              <p>
                Every session starts with <strong>something you create.</strong>
                <br />A sentence. An opinion. A conversation.
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              className="hero-illustration"
              src="/illustrations/language-in-action.png"
              alt="Friendly speech-bubble characters sharing ideas with a pencil and notebook"
              width={1536}
              height={1024}
              priority
            />
            <div
              className="practice-preview"
              aria-label="German example of writing practice and feedback"
            >
              <div className="preview-top">
                <span className="preview-brand">
                  <AudioLines size={18} /> YOUR PRACTICE SPACE
                </span>
                <span className="preview-example">German example</span>
              </div>
              <div className="preview-tabs">
                <span className="selected">
                  <PenLine size={15} /> Writing
                </span>
                <span>
                  <AudioLines size={15} /> Conversation
                </span>
              </div>
              <div className="preview-body">
                <div className="preview-meta">
                  <span>A1 · Everyday life</span>
                  <span>WRITE IT YOURSELF</span>
                </div>
                <p className="preview-label">PUT THIS INTO YOUR OWN WORDS</p>
                <h2>“I drink a coffee every morning.”</h2>
                <div className="preview-input">
                  <span className="preview-label">YOUR GERMAN</span>
                  <p lang="de">
                    Ich trinke <strong>einen</strong> Kaffee jeden Morgen.
                    <span className="preview-cursor" />
                  </p>
                </div>
                <div className="preview-feedback">
                  <div className="preview-feedback-title">
                    <Sparkles size={17} />
                    <strong>Yes! You made it yours.</strong>
                  </div>
                  <p lang="de">
                    Ich trinke <strong>einen</strong> Kaffee jeden Morgen.
                  </p>
                  <small>
                    You built the sentence yourself. That’s something to take
                    into your next conversation.
                  </small>
                </div>
                <div className="preview-bottom">
                  <span>
                    <CheckCheck size={16} /> Write. Learn. Use it again.
                  </span>
                  <Link href="/write" aria-label="Try this writing exercise">
                    <ArrowRight size={19} />
                  </Link>
                </div>
              </div>
              <div className="preview-voice">
                <span className="voice-icon">
                  <Mic size={19} />
                </span>
                <div>
                  <strong>Your voice belongs here, too.</strong>
                  <p>Speak or type. Keep the conversation going.</p>
                </div>
                <Link href="/speak" aria-label="Try conversation practice">
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <div className="output-strip">
          <span>LESSON LEARNED → LANGUAGE USED</span>
          <p>
            <PenLine size={18} /> Create your own sentences
          </p>
          <p>
            <MessageCircle size={18} /> Understand your mistakes
          </p>
          <p>
            <BookOpen size={18} /> Take new words with you
          </p>
        </div>
        <section className="practice-modes" id="practice">
          <div className="modes-heading">
            <div>
              <div className="eyebrow">YOUR LANGUAGE. IN ACTION.</div>
              <h2>Two ways to find your voice.</h2>
            </div>
            <p>
              Choose how you want to express yourself.
              <br />
              We’ll help you take the next step.
            </p>
          </div>
          <div className="output-modes">
            <Link href="/write" className="output-mode">
              <div className="output-mode-top">
                <span className="output-mode-icon">
                  <PenLine size={26} />
                </span>
                <span>01 / WRITING</span>
                <ArrowUpRight size={24} />
              </div>
              <h3>Put your thoughts into words.</h3>
              <p>
                Build your own sentences instead of choosing from a list. Get
                clear corrections, understand the why, and put what you learn
                into your next attempt.
              </p>
              <div className="output-tags">
                <span>A1–C2</span>
                <span>Topics you choose</span>
                <span>Feedback that teaches</span>
              </div>
              <span className="output-mode-link">
                Try writing practice <ArrowRight size={18} />
              </span>
            </Link>
            <Link href="/speak" className="output-mode conversation-mode">
              <div className="output-mode-top">
                <span className="output-mode-icon">
                  <AudioLines size={27} />
                </span>
                <span>02 / CONVERSATION</span>
                <ArrowUpRight size={24} />
              </div>
              <h3>Give your words a voice.</h3>
              <p>
                Have a back-and-forth with your AI companion. Speak or type your
                replies, explore a topic, and learn from feedback as you go.
              </p>
              <div className="output-tags">
                <span>Speak or type</span>
                <span>Read-aloud</span>
                <span>Corrections as you go</span>
              </div>
              <span className="output-mode-link">
                Start a conversation <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </section>
        <section className="output-method" id="how-it-works">
          <div className="method-intro">
            <div className="eyebrow">THE FLUEN WAY</div>
            <h2>
              Make it.
              <br />
              Improve it.
              <br />
              <span>Use it again.</span>
            </h2>
            <p>
              Recognition is a starting point. Fluen gives you a space to
              practice producing the language yourself.
            </p>
          </div>
          <div className="method-steps">
            {[
              {
                number: "01",
                title: "Choose your starting point",
                text: "Choose your level and a topic that matters to you. Choose German or Chinese in pinyin; more languages are coming soon.",
              },
              {
                number: "02",
                title: "Make the first move",
                text: "Write a sentence or reply in a conversation. Try what you know, even when you’re unsure.",
              },
              {
                number: "03",
                title: "Turn feedback into your next attempt",
                text: "Understand the corrections, save useful vocabulary, and bring it into what you say next.",
              },
            ].map((step) => (
              <div key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="output-cta">
          <div>
            <span className="eyebrow">
              FROM “I KNOW THIS” TO “I CAN SAY THIS.”
            </span>
            <h2>Your next sentence starts here.</h2>
            <p>Bring the words you know. Leave with something you can use.</p>
          </div>
          <Link href="/write" className="button">
            Let’s practice <ArrowUpRight size={20} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
