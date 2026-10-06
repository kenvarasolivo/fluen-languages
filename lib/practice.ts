export const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof levels)[number];
export const languages = ["german", "chinese"] as const;
export type Language = (typeof languages)[number];
export const languageNames: Record<Language, string> = {
  german: "German",
  chinese: "Chinese (pinyin)",
};
export const languageTag = (language: Language = "german") =>
  language === "chinese" ? "zh-Latn-pinyin" : "de";
export const topics = [
  "Everyday life",
  "Travel & adventure",
  "Food & cafés",
  "Work & study",
  "People & culture",
  "Ideas & opinions",
] as const;
export type Settings = {
  language?: Language;
  level: Level;
  topic: string;
  format: "single" | "connected";
};
// Keep the existing text key so previously saved words remain readable.
export type Vocabulary = { german: string; english: string; language?: Language };
// Gloss the actual sentence forms, including pronouns, articles and particles.
// Meanings are authored in sentence order, so ambiguous words retain context.
export function sentenceVocabulary(text: string, glosses: string, language: Language = "german"): Vocabulary[] {
  const words = text.match(/[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*/gu) ?? [];
  const meanings = glosses.split("|");
  if (words.length !== meanings.length) throw new Error(`Incomplete word meanings: ${text}`);
  return words.map((german, i) => ({ german, english: meanings[i], language }));
}
export type Exercise = {
  english: string;
  german: string;
  hint: string;
  vocabulary: Vocabulary[];
  connector?: { english: string; target: string };
};
export type Correction = {
  original: string;
  corrected: string;
  explanation: string;
};
export type Feedback = {
  correct: boolean;
  corrected: string;
  explanation: string;
  corrections: Correction[];
  vocabulary: Vocabulary[];
};
export type Reply = {
  reply: string;
  translation: string;
  feedback: Feedback | null;
  vocabulary: Vocabulary[];
};
export type Message = {
  role: "user" | "assistant";
  text: string;
  translation?: string;
  feedback?: Feedback | null;
};
export const defaults: Settings = {
  language: "german",
  level: "A1",
  topic: topics[0],
  format: "single",
};
export const starter: Exercise = {
  english: "I drink a coffee every morning.",
  german: "Ich trinke jeden Morgen einen Kaffee.",
  hint: "Start with ‘Ich’. Remember: Kaffee is masculine.",
  vocabulary: sentenceVocabulary("Ich trinke jeden Morgen einen Kaffee.", "I|drink|every|morning|a|coffee"),
};
export async function request<T>(
  action: string,
  data: object,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch("/api/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
    signal,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Something went wrong. Please try again.");
  return result as T;
}
export function getSavedWords(): Vocabulary[] {
  try {
    const stored = JSON.parse(localStorage.getItem("fluen:words") || "[]");
    return Array.isArray(stored)
      ? stored.filter(
          (w) =>
            w && typeof w.german === "string" && typeof w.english === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export function saveWords(words: Vocabulary[]): boolean {
  try {
    const existing = getSavedWords();
    const merged = [...existing];
    for (const word of words)
      if (!merged.some((item) => item.german === word.german &&
          (item.language ?? "german") === (word.language ?? "german")))
        merged.push(word);
    localStorage.setItem("fluen:words", JSON.stringify(merged));
    window.dispatchEvent(new Event("fluen:words"));
    return true;
  } catch {
    /* Storage can be unavailable in private browsing. */
    return false;
  }
}
