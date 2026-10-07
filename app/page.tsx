import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, AudioLines, Check, Coffee, Heart, MessageCircle, PenLine, Sparkles, Sprout } from "lucide-react";
import { Header, Footer } from "@/components/header";

export default function Home() {
  return <>
    <Header />
    <main className="play-home">
      <section className="play-hero">
        <div className="play-copy">
          <h1>Learn a language<br />by <span className="using-word">using it.</span></h1>
          <p>Practice writing and talking about your day.<br className="desktop-break" /> Put the words you know to use, with feedback along the way.</p>
          <div className="play-actions">
            <Link href="/write" className="button primary">Start practicing <ArrowRight size={19} /></Link>
            <Link href="/speak" className="hero-chat"><AudioLines size={20} /> Or, let’s talk</Link>
          </div>
          <div className="hero-reassurance"><Check size={16} /> No account needed <span>•</span> Your pace. Your words.</div>

        </div>
        <div className="hero-characters">
          <Image src="/illustrations/fluen-shape-friends.png" width={1774} height={887} className="shape-friends" alt="Three cheerful shape friends: a lavender pebble, a yellow arch, and a coral trapezoid, each with a tiny smiling face" priority />
        </div>
      </section>
      <section className="practice-demo" aria-labelledby="demo-title">
        <div className="demo-copy">
          <span className="section-kicker">A LITTLE LOOK AT HOW IT WORKS</span>
          <h2 id="demo-title">Practice here.<br />Order your next coffee.</h2>
          <p>A coffee order today. A conversation tomorrow. Write a sentence, get helpful feedback, and take it into your day.</p>
          <div className="language-row"><span className="language-chip"><span className="german-flag" /> German</span><span className="language-chip"><span className="chinese-flag">★</span> Chinese <small>(pinyin)</small></span><span className="level-note">A1–C2 <Sparkles size={13} /></span></div>
        </div>
        <div className="demo-preview" aria-label="Example of German writing practice and feedback">
          <div className="mini-practice">
            <div className="mini-heading"><span><PenLine size={15} /> A LITTLE WRITING MOMENT</span><span className="mini-level">A1</span></div>
            <p className="mini-prompt">How would you say...</p><h2>“I would like a coffee, please.” <Coffee size={21} /></h2>
            <div className="mini-answer" lang="de">Ich möchte einen Kaffee, bitte.<span className="typing-caret" /></div>
            <div className="mini-success"><span className="success-check"><Check size={16} /></span><div><strong>Look at you, using German!</strong><p>One sentence closer to your next coffee.</p></div><Sparkles size={19} /></div>
            <Link href="/write" className="mini-bottom">Your turn? <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
      <div className="belief-strip"><span><Sprout size={21} /> Less memorizing. <strong>More making.</strong></span><span><PenLine size={19} /> Your own sentences</span><span><MessageCircle size={19} /> Conversations at your level</span><span><Heart size={19} /> Helpful, gentle feedback</span></div>
      <section className="play-modes" id="practice">
        <div className="section-heading"><div><span className="section-kicker">FIND YOUR KIND OF PRACTICE</span><h2>Small starts. Big “I said that!” energy.</h2></div><p>Pick a little adventure.<br />There’s no perfect place to begin.</p></div>
        <div className="mode-grid">
          <Link href="/write" className="play-mode writing-mode"><div className="mode-top"><span className="mode-icon"><PenLine size={27} /></span><span className="mode-tag">THINK IT. WRITE IT.</span><ArrowUpRight size={25} /></div><h3>A thought becomes<br />a sentence.</h3><p>Make something with the words you know. Get clear corrections, learn the why, and give it another go.</p><div className="mode-bottom"><span>Let’s write <ArrowRight size={19} /></span><span className="mode-detail">Your ideas, in a new language</span></div></Link>
          <Link href="/speak" className="play-mode talking-mode"><div className="mode-top"><span className="mode-icon"><AudioLines size={28} /></span><span className="mode-tag">SAY IT. KEEP IT GOING.</span><ArrowUpRight size={25} /></div><h3>Start with hello.<br />See where it goes.</h3><p>Chat with your AI companion about your day, a big idea, or absolutely anything. Speak or type. You’ve got this.</p><div className="mode-bottom"><span>Let’s talk <ArrowRight size={19} /></span><span className="mode-detail">A friendly space to find your voice</span></div></Link>
        </div>
      </section>
      <section className="play-method" id="how-it-works"><div className="method-heading"><span className="section-kicker">THE FLUEN WAY</span><h2>Try. Tweak. <span>Try again.</span></h2><p>You don’t need all the words. Just a place to start using them.</p></div><div className="play-steps">{[{n:"01",title:"Make it yours",text:"Choose your language, level, and a topic you actually want to talk about.",icon:PenLine},{n:"02",title:"Give it a go",text:"Write your own sentence or start a conversation. A little unsure is welcome here.",icon:MessageCircle},{n:"03",title:"Take it with you",text:"Learn from feedback, save useful words, and bring them into your next attempt.",icon:Sprout}].map(({n,title,text,icon:Icon})=><div className="play-step" key={n}><div><span>{n}</span><Icon size={24} /></div><h3>{title}</h3><p>{text}</p></div>)}</div></section>
      <section className="play-cta"><span className="cta-spark" aria-hidden="true">✳</span><div><span className="section-kicker">FROM “I KNOW THIS” TO “I CAN SAY THIS”</span><h2>Your next little leap starts here.</h2><p>Bring the words you know. Make something that’s yours.</p></div><Link href="/write" className="button primary">Let’s give it a go <ArrowRight size={19} /></Link></section>
    </main><Footer />
  </>;
}
