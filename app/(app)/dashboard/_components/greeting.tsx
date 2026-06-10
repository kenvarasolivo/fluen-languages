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
    <div className="flex min-h-16 flex-col items-center gap-2 text-center">
      <h1 lang="de" className="text-3xl font-medium tracking-tight">
        {greeting ?? " "}
      </h1>
      <p className="text-sm text-muted">Bereit für ein bisschen Deutsch?</p>
    </div>
  );
}
