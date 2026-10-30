"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const examples = {
  german: { label: "German", language: "de", sentence: <>Ich möchte <mark>einen Kaffee,</mark> bitte.</>, translation: "I would like a coffee, please.", word: "einen Kaffee", note: "Kaffee is masculine. As the object here, it takes einen. The sentence gives the grammar a little context." },
  chinese: { label: "Chinese (pinyin)", language: "zh-Latn", sentence: <>Wǒ xiǎng yào <mark>yì bēi kāfēi.</mark></>, translation: "I would like a cup of coffee.", word: "yì bēi kāfēi", note: "Bēi means cup. In Chinese, a measure word sits between the number and the thing. One sentence, a useful new pattern." },
};
export function LandingDemo() {
  const [language, setLanguage] = useState<keyof typeof examples>("german");
  const example = examples[language];
  return <div className="landing-demo" data-ui>
    <div className="demo-language-tabs" role="group" aria-label="Example language">{(Object.keys(examples) as (keyof typeof examples)[]).map((key) => <button type="button" key={key} aria-pressed={key === language} onClick={() => setLanguage(key)}>{examples[key].label}</button>)}</div>
    <div className="demo-sentence" aria-live="polite" aria-atomic="true" key={language}><span>One sentence. So much to learn.</span><p lang={example.language}>{example.sentence}</p><span>{example.translation}</span><div className="demo-feedback"><Check size={20} /><p>That’s something you can actually say.</p></div><div className="demo-explanation"><strong lang={example.language}>{example.word}</strong><p>{example.note}</p></div></div>
    <Link href="/write" className="demo-your-turn">Make a sentence of your own <ArrowRight size={19} /></Link>
  </div>;
}
