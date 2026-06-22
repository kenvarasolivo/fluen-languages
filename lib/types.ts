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

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** A user-named custom deck of existing cards (Foundations). */
export interface Deck {
  id: string;
  name: string;
}

/** Result of drawing the next curriculum batch (/api/curriculum/next). */
export interface DrawResult {
  /** How many new cards were added to the learner's deck. */
  added: number;
  /** The CEFR theme the batch was drawn from (null when none added). */
  theme: string | null;
  level: CefrLevel;
  /** Unseen curriculum words still left at this level. */
  remaining: number;
  /** True when the level is fully seeded and the learner owns all of it. */
  levelComplete: boolean;
  /** The level to advance to, when levelComplete and one exists. */
  nextLevel: CefrLevel | null;
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
  /** Romanization for non-Latin scripts (Mandarin Pinyin); null otherwise. */
  pinyin?: string | null;
  gender: "der" | "die" | "das" | null;
  pos: string;
  meaning_en: string;
  cefr_level?: CefrLevel | string;
}
