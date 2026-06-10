import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card,
  type Grade,
} from "ts-fsrs";

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

/** The FSRS columns of a user_words row. */
export interface SrsFields {
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
}

function rowToCard(row: SrsFields): Card {
  return {
    ...createEmptyCard(new Date()),
    state: row.state,
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  };
}

/** Apply a rating (1 Again · 2 Hard · 3 Good · 4 Easy) and return the new row fields. */
export function gradeCard(row: SrsFields, rating: 1 | 2 | 3 | 4): SrsFields {
  const result = scheduler.repeat(rowToCard(row), new Date());
  const next = result[rating as Grade].card;
  return {
    state: next.state,
    due: next.due.toISOString(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    last_review: (next.last_review ?? new Date()).toISOString(),
  };
}

/** Cards scheduled within this window stay in the current session queue. */
export function isDueSoon(dueIso: string, windowMinutes = 15) {
  return new Date(dueIso).getTime() - Date.now() < windowMinutes * 60_000;
}
