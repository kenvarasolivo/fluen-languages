import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

export function SentenceLearning() {
  return <section className="sentence-learning" id="sentence-learning" aria-labelledby="sentence-learning-title">
    <div className="sentence-learning-heading">
      <span className="section-kicker">LITTLE WORDS. WHOLE NEW POSSIBILITIES.</span>
      <h2 id="sentence-learning-title">A word is a start.<br /><span>A sentence makes it yours.</span></h2>
      <p>Learn words and grammar together, in whole sentences.<br className="desktop-break" /> Then write your own. That’s where the practice comes to life.</p>
    </div>
    <div className="sentence-learning-cards">
      <article className="sentence-lesson lesson-context">
        <div className="sentence-lesson-art"><span className="sentence-step">01 / MEET THE WORDS</span><Image src="/illustrations/fluen-pebble-curious.png" alt="A curious lavender Fluen companion" width={1254} height={1254} sizes="110px" /></div>
        <h3>Words, with company.</h3>
        <p>A word is easier to use when you know its surroundings. Meet its meaning inside a full sentence.</p>
        <div className="sentence-example"><span className="sentence-example-label">A LITTLE CONTEXT</span><p lang="de">Ich trinke einen <mark>Kaffee.</mark></p><span>I drink a coffee.</span><div className="sentence-word-meaning"><strong>Kaffee</strong><ArrowRight size={13} /> coffee</div></div>
      </article>
      <article className="sentence-lesson lesson-pattern">
        <div className="sentence-lesson-art"><span className="sentence-step">02 / NOTICE THE PATTERN</span><Image src="/illustrations/fluen-arch-aha.png" alt="A delighted yellow Fluen companion having an aha moment" width={1254} height={1254} sizes="110px" /></div>
        <h3>Grammar you can see.</h3>
        <p>Articles, endings, word order: see how they work together. The sentence gives the rule a real example.</p>
        <div className="sentence-example"><span className="sentence-example-label">THE SAME SENTENCE, A NEW DISCOVERY</span><p lang="de">Ich trinke <mark>einen</mark> Kaffee.</p><span>Kaffee is masculine. As the object here, it takes <strong lang="de">einen.</strong></span><div className="sentence-pattern-pair"><span lang="de">einen Kaffee</span><span lang="de">einen Tee</span></div></div>
      </article>
      <article className="sentence-lesson lesson-write">
        <div className="sentence-lesson-art"><span className="sentence-step">03 / MAKE IT YOURS</span><Image src="/illustrations/fluen-coral-determined.png" alt="A focused coral Fluen companion ready to give writing a go" width={1254} height={1254} sizes="110px" /></div>
        <h3>Now you write it.</h3>
        <p>Go from recognising a sentence to building one yourself. Choose your words, get feedback, and try again.</p>
        <div className="sentence-example"><span className="sentence-example-label">YOUR TURN TO USE THE PATTERN</span><p className="sentence-writing-prompt">“I drink a tea.”</p><span>How would you say it in German?</span><Link href="/write" className="sentence-write-link"><PenLine size={15} /> Write your first sentence <ArrowRight size={15} /></Link></div>
      </article>
    </div>
    <p className="sentence-learning-note">One sentence. New vocabulary, a grammar pattern, and something you can actually say.</p>
  </section>;
}
