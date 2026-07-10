import { Type } from "@google/genai";
import { ai, LITE_MODEL } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai-errors";
import { gateAiRequest } from "@/lib/guest-limits";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getLearningContext } from "@/lib/learning-context";
import { PURPOSES } from "@/lib/purposes";
import type { LanguageDef } from "@/lib/languages";
import {
  CORE,
  LEVEL_GUIDE,
  themeOrder,
  cellTarget,
  curriculumOrder,
  nextLevel,
} from "@/lib/curriculum";
import type { CefrLevel } from "@/lib/types";

/** Max (level, theme) cells we'll lazily generate within one request. */
const MAX_EXTENDS = 2;
/** Words to generate per extend — keeps each AI call small and cheap. */
const EXTEND_BATCH = 15;

const CELL_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      lemma: {
        type: Type.STRING,
        description: "Base form WITHOUT the article, e.g. 'Haus', 'laufen', 'casa', '你好'",
      },
      pinyin: {
        type: Type.STRING,
        nullable: true,
        description:
          "Romanization for non-Latin scripts (Mandarin: Hanyu Pinyin with tone marks, e.g. 'nǐ hǎo'); null for Latin-script languages",
      },
      gender: {
        type: Type.STRING,
        nullable: true,
        description:
          "The noun's gender article (e.g. der/die/das, el/la), null for everything else",
      },
      pos: { type: Type.STRING, description: "noun | verb | adjective | adverb | phrase" },
      meaning_en: { type: Type.STRING },
      example_de: {
        type: Type.STRING,
        description: "One short, natural sentence in the target language using the word",
      },
      example_en: { type: Type.STRING },
    },
    required: ["lemma", "pinyin", "gender", "pos", "meaning_en", "example_de", "example_en"],
  },
};

interface CurriculumWord {
  id: string;
  lemma: string;
  pos: string;
  gender: string | null;
  meaning_en: string;
  theme: string;
  freq_rank: number;
  example_de: string | null;
  example_en: string | null;
}

/** Keep only an article that's valid for the language; else null. */
function sanitizeGender(
  g: string | null | undefined,
  language: LanguageDef,
): string | null {
  const v = g?.toLowerCase().trim();
  return v && language.articles.includes(v) ? v : null;
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in.", code: "unauthorized" }, { status: 401 });
  }

  try {
    const { count = 10, theme: requestedTheme } = (await req
      .json()
      .catch(() => ({}))) as { count?: number; theme?: string };

    // Draw from the active language environment at the learner's level in it.
    const { language, level, purpose } = await getLearningContext(supabase, user.id);

    // Auto-draw order: the learner's purpose front-loads its themes
    // (travel unlocks "travel & transport" before "daily life", etc.).
    const boost = purpose ? PURPOSES[purpose].boostThemes : [];
    const order = themeOrder(level, boost);

    // With a purpose at A1/A2, interleave the grammatical core with the
    // first purpose theme — otherwise the first ~3 draws would be pure
    // function words and the purpose would feel ignored.
    const pair: readonly string[] | null =
      boost.length > 0 && order[0] === CORE ? [CORE, order[1]] : null;

    // An explicit theme pins the draw to one cell; otherwise we auto-pick
    // in curriculum order. Ignore a theme that isn't valid for this level.
    const targetTheme =
      requestedTheme && order.includes(requestedTheme) ? requestedTheme : null;

    // Words the learner already owns — excluded from every draw.
    const { data: owned } = await supabase
      .from("user_words")
      .select("word_id")
      .eq("user_id", user.id);
    const ownedIds = new Set((owned ?? []).map((r) => r.word_id as string));

    const fetchCurriculum = async (): Promise<CurriculumWord[]> => {
      const { data, error } = await supabase
        .from("words")
        .select("id, lemma, pos, gender, meaning_en, theme, freq_rank, example_de, example_en")
        .eq("language", language.code)
        .eq("cefr_level", level)
        .not("freq_rank", "is", null);
      if (error) throw error;
      return (data ?? []) as CurriculumWord[];
    };

    // Draw sort key: interleaved pair cells alternate word for word;
    // everything else follows the (purpose-boosted) curriculum order.
    const drawKey = (w: CurriculumWord): number => {
      const pairIdx = pair ? pair.indexOf(w.theme) : -1;
      if (pairIdx !== -1) return w.freq_rank * 2 + pairIdx;
      return 1_000_000 + curriculumOrder(w.theme, w.freq_rank, order);
    };

    // The unseen draw pool — restricted to the chosen theme when pinned,
    // otherwise the whole level in curriculum order.
    const poolOf = (all: CurriculumWord[]) =>
      all
        .filter((w) => !ownedIds.has(w.id) && (!targetTheme || w.theme === targetTheme))
        .sort((a, b) => drawKey(a) - drawKey(b));

    // First theme cell that hasn't reached its target size yet, in draw
    // order. `core` is only in the order for A1/A2 — higher levels skip it.
    const firstIncompleteCell = (all: CurriculumWord[]): string | null => {
      const counts = new Map<string, number>();
      for (const w of all) counts.set(w.theme, (counts.get(w.theme) ?? 0) + 1);
      for (const theme of order) {
        if ((counts.get(theme) ?? 0) < cellTarget(theme, level)) return theme;
      }
      return null;
    };

    // The cell to grow before drawing: the pinned theme when it runs dry,
    // else an interleaved pair cell with no unseen words left (both halves
    // of the mix must be stocked), else the next incomplete cell when the
    // pool can't fill the batch.
    const cellToExtend = (
      all: CurriculumWord[],
      pool: CurriculumWord[],
    ): string | null => {
      if (targetTheme) {
        if (pool.length >= count) return null;
        const have = all.filter((w) => w.theme === targetTheme).length;
        return have < cellTarget(targetTheme, level) ? targetTheme : null;
      }
      if (pair) {
        for (const cell of pair) {
          if (pool.some((w) => w.theme === cell)) continue;
          const have = all.filter((w) => w.theme === cell).length;
          if (have < cellTarget(cell, level)) return cell;
        }
      }
      return pool.length < count ? firstIncompleteCell(all) : null;
    };

    let curriculum = await fetchCurriculum();
    let pool = poolOf(curriculum);

    // Lazily grow the catalog only when the learner would otherwise run dry.
    // Generation is the AI action, so the guest quota is checked here — never
    // when we can serve already-seeded words.
    let gate: Awaited<ReturnType<typeof gateAiRequest>> | null = null;
    let generated = false;

    for (let i = 0; i < MAX_EXTENDS; i++) {
      const cell = cellToExtend(curriculum, pool);
      if (!cell) break; // nothing left to generate for this draw

      if (!gate) {
        gate = await gateAiRequest("foundations");
        if (!gate.ok) {
          // Out of guest quota: still serve whatever is already unlocked.
          if (pool.length > 0) break;
          return gate.response;
        }
      }

      await extendCell(supabase, language, level, cell, curriculum);
      generated = true;
      curriculum = await fetchCurriculum();
      pool = poolOf(curriculum);
    }

    if (gate?.ok && generated) await gate.commit();

    const batch = pool.slice(0, count);

    if (batch.length > 0) {
      const rows = batch.map((w) => ({
        user_id: user.id,
        word_id: w.id,
        context_sentence: w.example_de,
        context_translation: w.example_en,
        source: "generated",
      }));
      const { error } = await supabase
        .from("user_words")
        .upsert(rows, { onConflict: "user_id,word_id", ignoreDuplicates: true });
      if (error) throw error;
    }

    const remaining = pool.length - batch.length;
    // Auto-advance only makes sense in auto mode — a pinned theme running
    // out doesn't mean the whole level is done.
    const levelComplete =
      !targetTheme && remaining === 0 && firstIncompleteCell(curriculum) === null;

    return Response.json({
      added: batch.length,
      theme: batch[0]?.theme ?? targetTheme ?? null,
      level,
      remaining,
      levelComplete,
      nextLevel: levelComplete ? nextLevel(level) : null,
    });
  } catch (err) {
    console.error("[/api/curriculum/next]", err);
    return aiErrorResponse(err, "Words could not be generated (see the function logs).");
  }
}

/**
 * Generates the next ranked slice of one (level, theme) cell and appends it
 * to the shared dictionary. Excludes every lemma already in the level so a
 * word never appears twice or across themes.
 */
async function extendCell(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  language: LanguageDef,
  level: CefrLevel,
  theme: string,
  curriculum: CurriculumWord[],
) {
  const inLevel = new Set(curriculum.map((w) => w.lemma.toLowerCase()));
  const inCell = curriculum.filter((w) => w.theme === theme);
  const startRank = inCell.reduce((max, w) => Math.max(max, w.freq_rank), 0);
  const need = Math.min(cellTarget(theme, level) - inCell.length, EXTEND_BATCH);
  if (need <= 0) return;

  const themeBrief = theme === CORE ? language.coreBrief : `the topic "${theme}"`;

  const avoid = [...inLevel].slice(0, 400).join(", ");

  const response = await ai.models.generateContent({
    // Word-list generation is structured JSON with no reasoning needed,
    // so the cheaper, higher-quota lite model is the right fit.
    model: LITE_MODEL,
    config: {
      responseMimeType: "application/json",
      responseSchema: CELL_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 8192,
    },
    contents: `Generate the next ${need} most useful ${language.name} words for a ${level} learner
(${LEVEL_GUIDE[level]}) covering ${themeBrief}.
Order them from most to least useful/frequent.
Pick genuinely common words appropriate to ${level} — not obscure ones.
For nouns, set "gender" to the correct article (${language.articles.join("/") || "none — this language has no articles, so use null"}); null otherwise.
The "example_de" field holds a short, natural ${language.name} sentence using the word; "example_en" is its English translation.${
      language.romanization
        ? `\n${language.romanization.wordNote} Also write "example_de" in ${language.romanization.name}.`
        : ""
    }
${avoid ? `Do NOT include any of these already-covered words: ${avoid}.` : ""}`,
  });

  const words = response.text ? (JSON.parse(response.text) as Array<{
    lemma: string;
    pinyin: string | null;
    gender: string | null;
    pos: string;
    meaning_en: string;
    example_de: string;
    example_en: string;
  }>) : [];

  const rows = words
    .filter((w) => w.lemma && !inLevel.has(w.lemma.toLowerCase()))
    .map((w, i) => ({
      language: language.code,
      lemma: w.lemma,
      pinyin: language.romanization ? w.pinyin?.trim() || null : null,
      pos: w.pos || "phrase",
      gender: sanitizeGender(w.gender, language),
      meaning_en: w.meaning_en,
      cefr_level: level,
      theme,
      freq_rank: startRank + 1 + i,
      example_de: w.example_de,
      example_en: w.example_en,
    }));

  if (rows.length === 0) return;
  const { error } = await supabase
    .from("words")
    .upsert(rows, { onConflict: "language,lemma,pos", ignoreDuplicates: true });
  if (error) throw error;
}
