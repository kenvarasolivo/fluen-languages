/**
 * Learning purposes — the "why are you learning?" answer collected at
 * onboarding and stored per language in `user_languages.purpose`.
 *
 * Because every story, dialog, coach reply and vocabulary batch is
 * AI-generated, the purpose can actually reshape the whole experience:
 * it steers the setting and register of Immerse texts, the scenarios
 * the Speak coach plays, and which curriculum themes unlock first.
 *
 * Shared by client (onboarding UI) and server (prompt building), so it
 * must stay free of `"use client"` and one-sided imports.
 */

export type Purpose = "travel" | "business" | "exam" | "everyday" | "culture";

export interface PurposeDef {
  id: Purpose;
  /** Short label for the onboarding option. */
  label: string;
  /** One-line description under the label. */
  description: string;
  /**
   * Topic + register brief appended to the Immerse story/dialog prompt
   * (completes the sentence "Write a story in German …").
   */
  immerseBrief: string;
  /** Extra rule for the Speak coach's system prompt. */
  coachNote: string;
  /**
   * Curriculum themes (from `THEMES` in lib/curriculum.ts) to unlock
   * first for this purpose. Empty = keep the default order.
   */
  boostThemes: readonly string[];
}

export const PURPOSES: Record<Purpose, PurposeDef> = {
  travel: {
    id: "travel",
    label: "Travel",
    description: "Get around, order food, ask for directions",
    immerseBrief:
      "set in a travel situation the learner will actually face — ordering in a restaurant, asking for directions, buying tickets, checking into a hotel, small talk with locals (vary the scene; don't repeat the same one)",
    coachNote:
      "The learner is preparing for travel. Prefer travel scenarios: play the waiter, hotel receptionist, ticket clerk or a helpful local, and steer toward practical situations.",
    boostThemes: ["travel & transport", "food & drink", "shopping & money"],
  },
  business: {
    id: "business",
    label: "Work & business",
    description: "Meetings, colleagues, professional settings",
    immerseBrief:
      "set in a professional situation — a meeting, small talk with colleagues, a phone call with a client, a job interview — written in the polite, formal register used at work (vary the scene)",
    coachNote:
      "The learner needs the language for work. Prefer professional contexts: play a colleague, client or business contact, and keep a polite, professional register.",
    boostThemes: ["work & study", "people & relationships", "travel & transport"],
  },
  exam: {
    id: "exam",
    label: "Exam prep",
    description: "HSK, Goethe, DELE and other certificates",
    immerseBrief:
      "about a topic typical of official language-exam reading passages — daily routines, school and work, health, the environment — in a clear, standard register like exam material",
    coachNote:
      "The learner is preparing for an official language exam. Favour exam-style topics and keep to a clear, standard register — no slang.",
    boostThemes: [],
  },
  everyday: {
    id: "everyday",
    label: "Everyday conversation",
    description: "Chat naturally with friends and family",
    immerseBrief:
      "about everyday life among friends — casual and natural; where the level allows (B1 and up), common colloquial expressions and a little slang are welcome",
    coachNote:
      "The learner wants natural everyday conversation. Keep it casual — everyday topics, and the colloquial phrasing a friend would actually use.",
    boostThemes: ["daily life", "people & relationships", "food & drink"],
  },
  culture: {
    id: "culture",
    label: "Culture & media",
    description: "Films, music, books and food culture",
    immerseBrief:
      "rooted in the culture where the language is spoken — food traditions, festivals, music, films, city life (pick something fresh and a little charming)",
    coachNote:
      "The learner is here for the culture. Favour cultural topics: food, music, films, books and traditions of places where the language is spoken.",
    boostThemes: ["leisure & culture", "food & drink", "people & relationships"],
  },
};

/** Purposes in onboarding display order. */
export const PURPOSE_ORDER: readonly Purpose[] = [
  "everyday",
  "travel",
  "business",
  "exam",
  "culture",
];

/** Resolve a stored value to a known purpose, or null. */
export function sanitizePurpose(p: string | null | undefined): Purpose | null {
  return p && p in PURPOSES ? (p as Purpose) : null;
}
