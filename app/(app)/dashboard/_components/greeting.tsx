"use client";

import { useEffect, useState } from "react";

function greetingForHour(h: number) {
  if (h < 11) return "Guten Morgen.";
  if (h < 18) return "Guten Tag.";
  return "Guten Abend.";
}

export function Greeting() {
  // Rendered client-side only so the server/client hour can't disagree.
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <div className="fade-up flex min-h-24 flex-col items-center gap-3 text-center">
      <h1
        lang="de"
        className="text-gradient-warm pb-1 text-4xl font-semibold tracking-[-0.02em] md:text-5xl"
      >
        {greeting ?? " "}
      </h1>
      <p className="text-base text-muted">Bereit für ein bisschen Deutsch?</p>
    </div>
  );
}
