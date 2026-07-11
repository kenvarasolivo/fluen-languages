"use client";

import { useEffect, useState } from "react";
import { useActiveLanguage } from "@/lib/use-active-language";
import { useCefrLevel } from "@/lib/use-cefr-level";

function greetingForHour(
  h: number,
  greetings: { morning: string; afternoon: string; evening: string },
) {
  if (h < 11) return greetings.morning;
  if (h < 18) return greetings.afternoon;
  return greetings.evening;
}

export function Greeting() {
  const language = useActiveLanguage();
  // Rendered client-side only so the server/client hour can't disagree.
  const [greeting, setGreeting] = useState<string | null>(null);
  // Shared, live level — no hardcoded label, stays in sync with the picker.
  const { level, loaded } = useCefrLevel();

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours(), language.greetings));
  }, [language.greetings]);

  return (
    <section className="banner-de fade-up relative w-full overflow-hidden rounded-[2.5rem] shadow-raised">
      {/* Country photo + a light dark scrim so the white text stays crisp. */}
      <div
        aria-hidden
        className="banner-photo"
        style={{ backgroundImage: `url("${language.bannerImage}")` }}
      />
      <span aria-hidden className="banner-scrim" />

      <div className="relative flex w-full flex-col gap-5 px-6 py-12 sm:px-10 sm:py-16">
        <span className="eyebrow inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
          <span aria-hidden className="text-sm leading-none">{language.flag}</span>
          {language.nativeName}
          {loaded && <> · {level}</>}
        </span>

        <h1
          lang={language.htmlLang}
          className="display pb-1 text-5xl text-white sm:text-6xl md:text-7xl"
        >
          {greeting ?? " "}
        </h1>
        <p className="-mt-2 max-w-md text-base text-white/70 sm:text-lg">
          Ready for a bit of {language.name}? Pick up where you left off.
        </p>
      </div>

      {/* Flag accent rule along the very bottom */}
      <span aria-hidden className={`${language.flagRuleClass} absolute inset-x-0 bottom-0 h-2`} />
    </section>
  );
}
