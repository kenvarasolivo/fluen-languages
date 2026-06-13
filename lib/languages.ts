/**
 * The languages FLUEN teaches. Each language is its own "environment":
 * separate cards, decks, conversations, immerse texts and CEFR level,
 * keyed by the language `code` everywhere it matters.
 *
 * This module is shared by client and server, so it must stay free of
 * any `"use client"` directive and of imports that only exist on one
 * side. The active-language helpers at the bottom guard `window`.
 */

export interface LanguageDef {
  /** ISO 639-1 code — the key used in the DB and in localStorage. */
  code: string;
  /** English name, e.g. "German". */
  name: string;
  /** Endonym, e.g. "Deutsch". */
  nativeName: string;
  /** Flag emoji for chips and switchers. */
  flag: string;
  /** BCP-47 tag for Web Speech (STT + TTS), e.g. "de-DE". */
  speechLang: string;
  /** Value for the HTML `lang` attribute, e.g. "de". */
  htmlLang: string;
  /** Gender/article words a noun can carry (empty when the language has none). */
  articles: string[];
  /**
   * One-line brief describing the grammatical "core" cell for the
   * curriculum (function words specific to this language).
   */
  coreBrief: string;
  /** Coach's opening line in the target language. */
  welcome: string;
  /** Time-of-day greetings shown on the dashboard hero. */
  greetings: { morning: string; afternoon: string; evening: string };
  /** Slim flag-band CSS class used as an accent rule. */
  flagRuleClass: string;
}

export const LANGUAGES: Record<string, LanguageDef> = {
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    speechLang: "de-DE",
    htmlLang: "de",
    articles: ["der", "die", "das"],
    coreBrief:
      "the grammatical backbone: modal verbs, auxiliary verbs, pronouns, articles, the most common conjunctions and prepositions, and the highest-frequency verbs — function words that are grammatical glue and don't belong to any topic",
    welcome: "Hallo! Worüber möchtest du heute sprechen?",
    greetings: {
      morning: "Guten Morgen",
      afternoon: "Guten Tag",
      evening: "Guten Abend",
    },
    flagRuleClass: "flag-rule-de",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    speechLang: "es-ES",
    htmlLang: "es",
    articles: ["el", "la", "los", "las"],
    coreBrief:
      "the grammatical backbone: ser/estar and the most common verbs, pronouns, articles, the most frequent conjunctions and prepositions — function words that are grammatical glue and don't belong to any topic",
    welcome: "¡Hola! ¿De qué te gustaría hablar hoy?",
    greetings: {
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
    },
    flagRuleClass: "flag-rule-es",
  },
};

/** Languages offered in the switcher, in display order. */
export const SUPPORTED_LANGUAGES: readonly string[] = ["de", "es"];

/** The language a brand-new learner starts in. */
export const DEFAULT_LANGUAGE = "de";

/** Resolve a code to its definition, falling back to the default. */
export function getLanguage(code: string | null | undefined): LanguageDef {
  return LANGUAGES[code ?? ""] ?? LANGUAGES[DEFAULT_LANGUAGE];
}

/** A leading-article stripper covering every supported language. */
const ALL_ARTICLES = Array.from(
  new Set(Object.values(LANGUAGES).flatMap((l) => l.articles)),
);
const LEADING_ARTICLE_RE = new RegExp(`^(${ALL_ARTICLES.join("|")})\\s+`, "i");

/** Strip a leading article from a lemma (for any supported language). */
export function stripLeadingArticle(lemma: string): string {
  return lemma.replace(LEADING_ARTICLE_RE, "");
}

// ------------------------------------------------------------------
// Active-language state (client). The source of truth for server-side
// routes is `profiles.target_language`; this localStorage mirror lets
// client components pick the right environment without a round-trip.
// The switcher keeps both in sync and reloads the page on change.
// ------------------------------------------------------------------

const STORAGE_KEY = "fluen.lang";

/** The learner's active language code (browser only; SSR → default). */
export function getActiveLanguageCode(): string {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const code = window.localStorage.getItem(STORAGE_KEY);
  return code && LANGUAGES[code] ? code : DEFAULT_LANGUAGE;
}

/** Mirror the active language into localStorage (does not reload). */
export function setActiveLanguageCode(code: string): void {
  if (typeof window === "undefined") return;
  if (!LANGUAGES[code]) return;
  window.localStorage.setItem(STORAGE_KEY, code);
}
