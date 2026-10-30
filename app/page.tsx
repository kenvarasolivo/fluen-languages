import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, PenLine } from "lucide-react";
import { Header, Footer } from "@/components/header";
import { PracticeSaveHint } from "@/components/guest-save-notice";
import { LandingDemo } from "@/components/landing-demo";
import "./landing.css";

export default function Home() {
  return <div className="fluen-landing">
    <Header />
    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="hero-stage">
          <h1 id="landing-title"><span>LANGUAGE</span><span>IN ACTION.</span></h1>
          <div className="hero-sculpture"><Image src="/illustrations/fluen-conversation-sculpture.png" alt="Glossy blue and orange speech bubbles saying Hallo! and 你好" width={1536} height={1024} priority sizes="(max-width: 700px) 100vw, 65vw" /></div>
          <span className="hero-side-note">A little practice.<br />A whole new voice.</span>
          <a href="#how-it-works" className="hero-discover" aria-label="Explore how Fluen works"><ArrowDown size={22} /></a>
        </div>
        <div className="hero-invitation">
          <p>Learn a language by using it.<br />Your thoughts. Your words. Real conversations.</p>
          <Link href="/write" className="landing-button">Start practicing <ArrowUpRight size={20} /></Link>
          <PracticeSaveHint />
        </div>
        <div className="hero-bottom"><span>German &amp; Chinese (pinyin)</span><span>From your first words to your own voice.</span><span>A1–C2. At your pace.</span></div>
      </section>
      <section className="landing-method" id="how-it-works" aria-labelledby="method-title">
        <div className="method-intro"><h2 id="method-title">You know more<br />than you think.</h2><p>A word you recognise is a start. A sentence you make is a little breakthrough. Fluen gives you a place to write, talk, and turn what you know into something you can say.</p></div>
        <div className="method-demo-row">
          <div className="method-art"><Image src="/illustrations/topic-food.webp" width={768} height={512} alt="An illustrated café, a place to put your new language into practice" sizes="(max-width: 700px) 90vw, 40vw" /><p>For the coffee you’ll order.<br />And the conversation after.</p></div>
          <LandingDemo />
        </div>
        <div className="method-outro"><span>Make a sentence.</span><span>Understand the feedback.</span><span>Take it into your day.</span></div>
      </section>
      <section className="landing-practice" id="practice" aria-labelledby="practice-title">
        <div className="practice-intro"><h2 id="practice-title">Find your words.</h2><p>A quiet writing moment or a conversation that takes a turn.<br />There’s more than one way to find your voice.</p></div>
        <article className="practice-sheet sheet-write"><div className="sheet-copy"><span className="sheet-name"><PenLine size={22} /> Writing practice</span><h3>Your words.<br />Your sentence.</h3><p>Write about something that matters to you. Get clear corrections, understand the grammar, and give it another go.</p><Link href="/write" className="landing-button">Let’s write <ArrowUpRight size={20} /></Link></div><div className="sheet-visual"><Image src="/illustrations/topic-ideas.webp" width={768} height={512} alt="A playful illustration of ideas waiting to be put into words" sizes="(max-width: 700px) 90vw, 45vw" /><div className="example-slip"><span>Your idea, in a new language.</span><p lang="de">Ich habe eine Idee.</p><span>I have an idea.</span></div></div></article>
        <article className="practice-sheet sheet-talk"><div className="sheet-copy"><span className="sheet-name"><AudioLines size={23} /> Conversation practice</span><h3>Start with hello.<br />See where it goes.</h3><p>Talk with your AI companion about your day, your next trip, or whatever’s on your mind. Speak or type, at your level.</p><Link href="/speak" className="landing-button">Let’s talk <ArrowUpRight size={20} /></Link></div><div className="sheet-visual"><Image src="/illustrations/topic-travel.webp" width={768} height={512} alt="An illustrated travel scene full of opportunities for a conversation" sizes="(max-width: 700px) 90vw, 45vw" /><div className="example-slip"><span>A conversation can start anywhere.</span><p lang="de">Wohin möchtest du reisen?</p><span>Where would you like to travel?</span></div></div></article>
        <div className="beginner-path"><div><h3>Starting from hello?</h3><p>Get to know everyday words before you make them your own.</p></div><Link href="/learn-words">Learn your first words <ArrowRight size={20} /></Link></div>
      </section>
      <section className="landing-close" aria-labelledby="close-title"><h2 id="close-title">You’ve got<br />something to say.</h2><div><p>Bring the words you know.<br />Let’s see what you can do with them.</p><Link href="/write" className="landing-button">Start practicing <ArrowUpRight size={20} /></Link></div><span className="close-wordmark" aria-hidden="true">fluen.</span></section>
    </main>
    <Footer />
  </div>;
}
