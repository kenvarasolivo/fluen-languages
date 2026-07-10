// Read-only overview: how full every curriculum module is, per
// language and level. Run any time: node scripts/curriculum-status.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Mirrors lib/curriculum.ts targets.
const CORE_TARGET = 30;
const THEME_TARGETS = { A1: 25, A2: 35, B1: 50, B2: 75, C1: 100 };
const THEME_COUNT = 10;
const levelTarget = (level) =>
  THEME_COUNT * THEME_TARGETS[level] + (level === "A1" || level === "A2" ? CORE_TARGET : 0);

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("words")
    .select("language, cefr_level, theme")
    .not("freq_rank", "is", null)
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

const byLevel = {};
for (const w of rows) {
  const key = `${w.language} ${w.cefr_level}`;
  byLevel[key] = (byLevel[key] ?? 0) + 1;
}
for (const lang of ["de", "zh", "es"]) {
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    const have = byLevel[`${lang} ${level}`] ?? 0;
    const target = levelTarget(level);
    const pct = Math.round((have / target) * 100);
    console.log(`${lang} ${level}: ${String(have).padStart(4)} / ${target}  (${pct}%)`);
  }
}
console.log(`total: ${rows.length} curriculum words`);
