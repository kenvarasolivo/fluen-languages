import type { CefrLevel } from "@/lib/types";

/**
 * The curriculum is a shared, ordered master catalog stored in the
 * `words` table (one row per lemma, deduped). Each curriculum word has a
 * `theme` and a `freq_rank` (lower = more useful, learned earlier).
 *
 * A learner draws their next batch sequentially: the grammatical backbone
 * (`CORE` — modal verbs, auxiliaries, pronouns, articles, connectors) is
 * front-loaded, then one coherent theme at a time. Words are generated
 * lazily per (level, theme) cell the first time a cell runs low, then
 * reused by everyone — so most draws need no AI call.
 */

/** Reserved theme for high-frequency function words with no topic. */
export const CORE = "core";

/** Topic themes, in the order a learner unlocks them within a level. */
export const THEMES = [
  "daily life",
  "food & drink",
  "home & living",
  "work & study",
  "travel & transport",
  "health & body",
  "people & relationships",
  "shopping & money",
  "nature & weather",
  "leisure & culture",
] as const;

/** Full draw order: the grammatical core first, then the topic themes. */
export const THEME_ORDER: readonly string[] = [CORE, ...THEMES];

/**
 * Levels where the `core` track applies. Function words (modal verbs,
 * pronouns, articles, connectors) are inherently beginner vocabulary —
 * a B1+ learner already knows them, so higher levels skip core and draw
 * topic vocabulary straight away.
 */
const CORE_LEVELS: readonly CefrLevel[] = ["A1", "A2"];

/** The themes to draw, in order, for a given level. */
export function themeOrder(level: CefrLevel): readonly string[] {
  return CORE_LEVELS.includes(level) ? [CORE, ...THEMES] : [...THEMES];
}

/** Levels the curriculum covers (C2 is intentionally out of scope). */
export const CURRICULUM_LEVELS: readonly CefrLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
];

/** How many words each cell should eventually hold before we move on. */
const CORE_TARGET = 30;
const THEME_TARGET = 20;

export function cellTarget(theme: string): number {
  return theme === CORE ? CORE_TARGET : THEME_TARGET;
}

/** Sort key: core first, then theme order, then frequency rank. */
export function curriculumOrder(theme: string, freqRank: number): number {
  const themeIdx = THEME_ORDER.indexOf(theme);
  // Unknown themes sort after the known ones; rank breaks ties within a cell.
  const bucket = themeIdx === -1 ? THEME_ORDER.length : themeIdx;
  return bucket * 100_000 + freqRank;
}

/** The next level up, or null at the top of the curriculum. */
export function nextLevel(level: CefrLevel): CefrLevel | null {
  const i = CURRICULUM_LEVELS.indexOf(level);
  return i >= 0 && i < CURRICULUM_LEVELS.length - 1
    ? CURRICULUM_LEVELS[i + 1]
    : null;
}

/** A minimal description of what a learner should know at each level. */
export const LEVEL_GUIDE: Record<CefrLevel, string> = {
  A1: "absolute beginner: the most basic, highest-frequency everyday words",
  A2: "elementary: common everyday vocabulary for routine situations",
  B1: "intermediate: vocabulary for familiar matters, work, school, leisure",
  B2: "upper-intermediate: broader, more abstract and topic-specific vocabulary",
  C1: "advanced: nuanced, idiomatic and lower-frequency vocabulary",
  C2: "mastery: rare, specialised and highly idiomatic vocabulary",
};
