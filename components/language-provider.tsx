"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/practice";

const storageKey = "fluen:language";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<Language>("german");

  useEffect(() => {
    function restore() {
      try {
        const saved = localStorage.getItem(storageKey);
        updateLanguage(saved === "chinese" ? "chinese" : "german");
      } catch { /* Keep the current selection when storage is unavailable. */ }
    }
    restore();
    function sync(event: StorageEvent) {
      if (event.key === storageKey || event.key === null) restore();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function setLanguage(next: Language) {
    updateLanguage(next);
    try { localStorage.setItem(storageKey, next); } catch { /* In-memory selection still works. */ }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires LanguageProvider");
  return value;
}
