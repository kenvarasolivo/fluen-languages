// Seed the curriculum catalog: pre-generates every (level, theme) module
// of a language into the shared `words` table so learners never wait on
// an AI call when drawing. Resumable — cells already at target are
// skipped, so re-running only fills what's missing.
//
//   node scripts/seed-curriculum.mjs <de|es|zh> [A1|A2|B1|B2|C1]
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
// GEMINI_API_KEY in .env.local. Values below mirror lib/curriculum.ts,
// lib/languages.ts and /api/curriculum/next — keep them in sync.
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const MODEL = "gemini-3.1-flash-lite";
const BATCH = 15; // words per AI call
const PAUSE_MS = 4500; // stay under free-tier requests/minute

// --- mirrors lib/curriculum.ts ------------------------------------
const CORE = "core";
const THEMES = [
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
];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const CORE_LEVELS = ["A1", "A2"];
const CORE_TARGET = 30;
const THEME_TARGETS = { A1: 25, A2: 35, B1: 50, B2: 75, C1: 100 };
const LEVEL_GUIDE = {
  A1: "absolute beginner: the most basic, highest-frequency everyday words",
  A2: "elementary: common everyday vocabulary for routine situations",
  B1: "intermediate: vocabulary for familiar matters, work, school, leisure",
  B2: "upper-intermediate: broader, more abstract and topic-specific vocabulary",
  C1: "advanced: nuanced, idiomatic and lower-frequency vocabulary",
};
const cellTarget = (theme, level) => (theme === CORE ? CORE_TARGET : THEME_TARGETS[level]);
const themeOrder = (level) => (CORE_LEVELS.includes(level) ? [CORE, ...THEMES] : THEMES);

// --- mirrors lib/languages.ts (the fields the word prompt needs) ---
const LANGS = {
  de: {
    name: "German",
    articles: ["der", "die", "das"],
    coreBrief:
      "the grammatical backbone: modal verbs, auxiliary verbs, pronouns, articles, the most common conjunctions and prepositions, and the highest-frequency verbs — function words that are grammatical glue and don't belong to any topic",
  },
  es: {
    name: "Spanish",
    articles: ["el", "la", "los", "las"],
    coreBrief:
      "the grammatical backbone: ser/estar and the most common verbs, pronouns, articles, the most frequent conjunctions and prepositions — function words that are grammatical glue and don't belong to any topic",
  },
  zh: {
    name: "Mandarin Chinese",
    articles: [],
    coreBrief:
      "the grammatical backbone: pronouns, the most common measure words, structural particles (的, 了, 吗, 呢, 吧), coverbs/prepositions, the most frequent conjunctions and the highest-frequency verbs — function words that are grammatical glue and don't belong to any topic",
    wordNote:
      'This is Mandarin Chinese. Put the SIMPLIFIED Chinese characters (Hanzi) in the "lemma" field and ALWAYS fill "pinyin" with the matching Hanyu Pinyin WITH tone marks (example: lemma "你好", pinyin "nǐ hǎo"). Mandarin has no articles, so always set "gender" to null. Also write "example_de" in Pinyin.',
  },
};

// --- mirrors CELL_SCHEMA in /api/curriculum/next -------------------
const CELL_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      lemma: { type: Type.STRING },
      pinyin: { type: Type.STRING, nullable: true },
      gender: { type: Type.STRING, nullable: true },
      pos: { type: Type.STRING },
      meaning_en: { type: Type.STRING },
      example_de: { type: Type.STRING },
      example_en: { type: Type.STRING },
    },
    required: ["lemma", "pinyin", "gender", "pos", "meaning_en", "example_de", "example_en"],
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const [langCode, onlyLevel] = process.argv.slice(2);
const lang = LANGS[langCode];
if (!lang) {
  console.error("usage: node scripts/seed-curriculum.mjs <de|es|zh> [A1|A2|B1|B2|C1]");
  process.exit(1);
}
if (onlyLevel && !LEVELS.includes(onlyLevel)) {
  console.error(`unknown level "${onlyLevel}"`);
  process.exit(1);
}

async function fetchLevel(level) {
  const { data, error } = await supabase
    .from("words")
    .select("lemma, theme, freq_rank")
    .eq("language", langCode)
    .eq("cefr_level", level)
    .not("freq_rank", "is", null)
    .limit(2000);
  if (error) throw error;
  return data ?? [];
}

/**
 * Every lemma the language already has, at ANY level — the DB deduplicates
 * per (language, lemma, pos), so an A2 batch must not re-propose A1 words
 * (they'd be silently dropped and the cell would never fill). Paginated:
 * Supabase caps a select at 1000 rows.
 */
async function fetchAllLemmas() {
  const taken = new Set();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("words")
      .select("lemma")
      .eq("language", langCode)
      .range(from, from + 999);
    if (error) throw error;
    for (const w of data ?? []) taken.add(w.lemma.toLowerCase());
    if (!data || data.length < 1000) return taken;
  }
}

async function extendCell(level, theme, existing, taken, rejected) {
  const inLevel = existing.map((w) => w.lemma);
  const inCell = existing.filter((w) => w.theme === theme);
  const startRank = inCell.reduce((max, w) => Math.max(max, w.freq_rank), 0);
  const need = Math.min(cellTarget(theme, level) - inCell.length, BATCH);
  if (need <= 0) return 0;
  // Over-ask: some candidates will collide with taken words, so request
  // extra and keep only the genuinely new ones.
  const ask = Math.min(need + 5, 20);

  const themeBrief = theme === CORE ? lang.coreBrief : `the topic "${theme}"`;
  // Rejected candidates go first — those are the exact words the model
  // keeps re-proposing, so they must survive the 400-entry cap.
  const avoid = [...rejected, ...inLevel].slice(0, 400).join(", ");

  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      responseMimeType: "application/json",
      responseSchema: CELL_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 8192,
    },
    contents: `Generate the next ${ask} most useful ${lang.name} words for a ${level} learner
(${LEVEL_GUIDE[level]}) covering ${themeBrief}.
Order them from most to least useful/frequent.
Pick genuinely common words appropriate to ${level} — not obscure ones.
For nouns, set "gender" to the correct article (${lang.articles.join("/") || "none — this language has no articles, so use null"}); null otherwise.
The "example_de" field holds a short, natural ${lang.name} sentence using the word; "example_en" is its English translation.${
      lang.wordNote ? `\n${lang.wordNote}` : ""
    }
${avoid ? `Do NOT include any of these already-covered words: ${avoid}.` : ""}`,
  });

  const words = response.text ? JSON.parse(response.text) : [];
  // Split candidates into genuinely new vs already taken anywhere in the
  // language; the taken ones feed the next attempt's avoid list.
  for (const w of words) {
    if (w.lemma && taken.has(w.lemma.toLowerCase())) rejected.add(w.lemma);
  }
  const rows = words
    .filter((w) => w.lemma && !taken.has(w.lemma.toLowerCase()))
    .slice(0, need)
    .map((w, i) => ({
      language: langCode,
      lemma: w.lemma,
      pinyin: langCode === "zh" ? w.pinyin?.trim() || null : null,
      pos: w.pos || "phrase",
      gender:
        w.gender && lang.articles.includes(w.gender.toLowerCase().trim())
          ? w.gender.toLowerCase().trim()
          : null,
      meaning_en: w.meaning_en,
      cefr_level: level,
      theme,
      freq_rank: startRank + 1 + i,
      example_de: w.example_de,
      example_en: w.example_en,
    }));

  if (rows.length === 0) return 0;
  const { error } = await supabase
    .from("words")
    .upsert(rows, { onConflict: "language,lemma,pos", ignoreDuplicates: true });
  if (error) throw error;
  for (const r of rows) taken.add(r.lemma.toLowerCase());
  return rows.length;
}

let calls = 0;
const taken = await fetchAllLemmas();
for (const level of onlyLevel ? [onlyLevel] : LEVELS) {
  for (const theme of themeOrder(level)) {
    const target = cellTarget(theme, level);
    const rejected = new Set();
    let dryRounds = 0;
    for (;;) {
      const existing = await fetchLevel(level);
      const have = existing.filter((w) => w.theme === theme).length;
      if (have >= target) break;
      process.stdout.write(`${langCode} ${level} · ${theme}: ${have}/${target} → generating ... `);
      const added = await extendCell(level, theme, existing, taken, rejected);
      calls += 1;
      console.log(`+${added}`);
      // Two dry rounds in a row (with the rejects fed back) means the
      // model is out of fresh common words for this cell — move on.
      dryRounds = added === 0 ? dryRounds + 1 : 0;
      if (dryRounds >= 2) {
        console.log(`  (no fresh words left for this cell — moving on)`);
        break;
      }
      await sleep(PAUSE_MS);
    }
    const final = (await fetchLevel(level)).filter((w) => w.theme === theme).length;
    console.log(`${langCode} ${level} · ${theme}: ${final}/${target} ✓`);
  }
}
console.log(`done — ${calls} generation calls.`);
