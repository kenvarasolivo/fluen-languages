"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  getActiveLanguageCode,
  getLanguage,
  type LanguageDef,
} from "@/lib/languages";

/**
 * The active language for display. Starts at the default so the server
 * and the first client render agree (no hydration mismatch), then
 * settles to the learner's real choice from localStorage on mount.
 * Switching languages reloads the page, so this never needs to react to
 * changes beyond that initial settle.
 */
export function useActiveLanguage(): LanguageDef {
  const [code, setCode] = useState(DEFAULT_LANGUAGE);
  useEffect(() => {
    setCode(getActiveLanguageCode());
  }, []);
  return getLanguage(code);
}
