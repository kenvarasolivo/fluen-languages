"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number) {
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export function Greeting() {
  // Rendered client-side only so the server/client hour can't disagree.
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <section className="banner-de fade-up relative w-full overflow-hidden rounded-3xl border border-border shadow-raised">
      <div className="relative flex flex-col gap-5 px-6 py-10 sm:px-10 sm:py-12">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-raised/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm">
          <span aria-hidden className="text-sm leading-none">🇩🇪</span>
          Deutsch lernen · B1
        </span>

        <h1
          lang="de"
          className="text-gradient-warm pb-1 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl md:text-6xl"
        >
          {greeting ?? " "}
        </h1>
        <p className="-mt-2 max-w-md text-base text-muted sm:text-lg">
          Ready for a bit of German? Pick up where you left off.
        </p>
      </div>

      {/* German flag accent rule along the very bottom */}
      <span aria-hidden className="flag-rule absolute inset-x-0 bottom-0 h-1.5" />
    </section>
  );
}
