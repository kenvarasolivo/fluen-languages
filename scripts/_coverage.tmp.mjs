import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const CORE = "core";
const THEMES = ["daily life","food & drink","home & living","work & study","travel & transport","health & body","people & relationships","shopping & money","nature & weather","leisure & culture"];
const LEVELS = ["A1","A2","B1","B2","C1"];
const CORE_LEVELS = ["A1","A2"];
const THEME_TARGETS = { A1: 25, A2: 35, B1: 50, B2: 75, C1: 100 };
const cellTarget = (t, l) => (t === CORE ? 30 : THEME_TARGETS[l]);
const themeOrder = (l) => (CORE_LEVELS.includes(l) ? [CORE, ...THEMES] : THEMES);

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("words")
    .select("language, cefr_level, theme")
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

const key = (a, b, c) => `${a}|${b}|${c}`;
const counts = new Map();
for (const r of rows) counts.set(key(r.language, r.cefr_level, r.theme), (counts.get(key(r.language, r.cefr_level, r.theme)) ?? 0) + 1);

for (const lang of ["de", "es", "zh"]) {
  let have = 0, want = 0;
  const missing = [];
  for (const level of LEVELS) {
    for (const theme of themeOrder(level)) {
      const t = cellTarget(theme, level);
      const h = counts.get(key(lang, level, theme)) ?? 0;
      have += Math.min(h, t); want += t;
      if (h < t) missing.push(`${level}/${theme} ${h}/${t}`);
    }
  }
  console.log(`\n=== ${lang}: ${have}/${want} (${Math.round((have / want) * 100)}%) — total rows ${rows.filter(r=>r.language===lang).length}`);
  if (missing.length === 0) console.log("  complete ✓");
  else for (const m of missing) console.log("  " + m);
}
