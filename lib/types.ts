export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Set asynchronously by /api/correct on user messages with mistakes. */
  correction?: Correction | null;
}

export type VoiceState = "idle" | "listening" | "speaking";

/** AI-generated vocabulary card (Foundations demo). */
export interface DemoWord {
  lemma: string;
  gender: "der" | "die" | "das" | null;
  pos: string;
  meaning_en: string;
  example_de: string;
  example_en: string;
}

/** One line of an AI-generated story or dialog (Immerse demo). */
export interface StoryLine {
  speaker: string | null;
  text_de: string;
  text_en: string;
}

export interface Story {
  title: string;
  lines: StoryLine[];
}

export type ImmerseLevel = "beginner" | "intermediate" | "advanced";
export type ImmerseKind = "story" | "dialog";

/** Result of clicking a word in Immerse (the Bridge). */
export interface WordDefinition {
  lemma: string;
  gender: "der" | "die" | "das" | null;
  pos: string;
  meaning_en: string;
}

/** localStorage key for words saved from Immerse → reviewed in Foundations. */
export const DECK_STORAGE_KEY = "fleun:deck";
