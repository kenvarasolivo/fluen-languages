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

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** AI-generated vocabulary card (Foundations demo). */
export interface DemoWord {
  lemma: string;
  gender: "der" | "die" | "das" | null;
  pos: string;
  meaning_en: string;
  cefr_level: CefrLevel | string;
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

export type ImmerseLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type ImmerseKind = "story" | "dialog";

/** A generated story/dialog persisted in `immerse_texts`. */
export interface SavedText {
  id: string;
  kind: ImmerseKind;
  level: ImmerseLevel;
  title: string;
  lines: StoryLine[];
  created_at: string;
}

/** Result of clicking a word in Immerse (the Bridge). */
export interface WordDefinition {
  lemma: string;
  gender: "der" | "die" | "das" | null;
  pos: string;
  meaning_en: string;
  cefr_level?: CefrLevel | string;
}
