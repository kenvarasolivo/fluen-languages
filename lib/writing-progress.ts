import { Exercise, Language, Settings, levels, topics } from "./practice";
import { getExercisePool } from "./question-bank";

export type Progress = { correct: number; total: number; percent: number };
export type ProgressGroup = Partial<Pick<Settings, "level" | "topic" | "format">>;
export const progressStorageKey = "fluen:writing-progress:v1";

export function exerciseProgressKey(settings: Settings, exercise: Exercise): string {
  return JSON.stringify([settings.language ?? "german", settings.level, settings.topic,
    settings.format, exercise.english, exercise.german]);
}

const catalogs = new Map<Language, { settings: Settings; key: string }[]>();
export function groupProgress(completed: ReadonlySet<string>, language: Language, group: ProgressGroup): Progress {
  let catalog = catalogs.get(language);
  if (!catalog) {
    catalog = [];
    for (const level of levels) for (const topic of topics) for (const format of ["single", "connected"] as const) {
      const settings = { language, level, topic, format };
      for (const exercise of getExercisePool(settings)) {
        catalog.push({ settings, key: exerciseProgressKey(settings, exercise) });
      }
    }
    catalogs.set(language, catalog);
  }
  const entries = catalog.filter(({ settings }) =>
    (!group.level || settings.level === group.level) &&
    (!group.topic || settings.topic === group.topic) &&
    (!group.format || settings.format === group.format));
  const correct = entries.filter(({ key }) => completed.has(key)).length;
  const total = entries.length;
  // Only show 100% when every sentence in the group has been correct.
  const percent = total && correct === total ? 100 : total ? Math.min(99, Math.round(correct / total * 100)) : 0;
  return { correct, total, percent };
}

export function readWritingProgress(): Set<string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(progressStorageKey) ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter((key): key is string => typeof key === "string") : []);
  } catch {
    return new Set();
  }
}
