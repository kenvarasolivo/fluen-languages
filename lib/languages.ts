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
  /** Country photo shown behind the dashboard greeting (under a dark scrim). */
  bannerImage: string;
  /**
   * Non-Latin-script languages that learners read through a typeable
   * romanization (Mandarin → Pinyin). When set, words carry both the
   * native script (stored in `lemma`) and the romanization (in the
   * `pinyin` column), the UI shows the script on top of the romanization,
   * and the AI generators are told to produce both. Absent for
   * Latin-script languages.
   */
  romanization?: {
    /** Human label, e.g. "Pinyin". */
    name: string;
    /**
     * Instruction appended to free-text generation prompts (Immerse,
     * Speak coach, corrections) so the learner-facing text comes back in
     * the typeable romanization rather than the native script.
     */
    textNote: string;
    /**
     * Instruction appended to word / definition prompts so the model
     * fills both the native-script `lemma` and the `pinyin` field.
     */
    wordNote: string;
  };
  /**
   * Extra instructions for the Immerse word-definition prompt (e.g.
   * separable verbs in German). Appended by `/api/define`.
   */
  defineNote?: string;
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
    // Berlin skyline (Fernsehturm + Spree).
    bannerImage:
      "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=1600&q=70",
    defineNote:
      "German separable verbs (trennbare Verben) split in main clauses — e.g. 'zieht … um' is umziehen, 'steht … auf' is aufstehen. If the tapped token is the verb stem OR the detached prefix/particle, return the full infinitive (umziehen, not um or ziehen). Reflexive verbs likewise: 'freut sich' → sich freuen. Only return a fragment when the token is truly standalone (a noun, article, plain preposition, etc.).",
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
    // Madrid — Gran Vía at sunset.
    bannerImage:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=70",
    defineNote:
      "Reflexive and pronominal verbs: if the tapped token is the verb or its clitic (me, se, lo, …), return the full infinitive with pronoun(s) where idiomatic (e.g. 'se levanta' → levantarse). Fixed expressions spanning several words → return the natural dictionary phrase.",
  },
  zh: {
    code: "zh",
    name: "Mandarin Chinese",
    nativeName: "中文 Zhōngwén",
    flag: "🇨🇳",
    speechLang: "zh-CN",
    htmlLang: "zh",
    // Mandarin has no articles or grammatical gender.
    articles: [],
    coreBrief:
      "the grammatical backbone: pronouns, the most common measure words, structural particles (的, 了, 吗, 呢, 吧), coverbs/prepositions, the most frequent conjunctions and the highest-frequency verbs — function words that are grammatical glue and don't belong to any topic",
    welcome: "Nǐ hǎo! Jīntiān xiǎng liáo diǎnr shénme?",
    greetings: {
      morning: "Zǎoshang hǎo",
      afternoon: "Xiàwǔ hǎo",
      evening: "Wǎnshàng hǎo",
    },
    flagRuleClass: "flag-rule-zh",
    // The Great Wall at Mutianyu.
    bannerImage:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=70",
    romanization: {
      name: "Pinyin",
      textNote:
        'Write ALL Mandarin text in Hanyu Pinyin WITH tone marks (e.g. "Nǐ hǎo, nǐ jīntiān zěnme yàng?"), NOT in Chinese characters. Put a space between every word so the text stays readable and typeable on a standard keyboard.',
      wordNote:
        'This is Mandarin Chinese. Put the SIMPLIFIED Chinese characters (Hanzi) in the "lemma" field and ALWAYS fill "pinyin" with the matching Hanyu Pinyin WITH tone marks (example: lemma "你好", pinyin "nǐ hǎo"). Mandarin has no articles, so always set "gender" to null.',
    },
  },
};

/** Languages offered in the switcher, in display order. */
export const SUPPORTED_LANGUAGES: readonly string[] = ["de", "es", "zh"];

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
