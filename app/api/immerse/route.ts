import { Type } from "@google/genai";
import { ai, CHAT_MODEL } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai-errors";
import { gateAiRequest } from "@/lib/guest-limits";
import type { ImmerseKind, ImmerseLevel } from "@/lib/types";

const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short German title" },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: {
            type: Type.STRING,
            nullable: true,
            description: "Speaker name for dialogs, null for stories",
          },
          text_de: { type: Type.STRING },
          text_en: { type: Type.STRING, description: "English translation" },
        },
        required: ["speaker", "text_de", "text_en"],
      },
    },
  },
  required: ["title", "lines"],
};

const LEVEL_GUIDE: Record<ImmerseLevel, string> = {
  A1: "A1 level: present tense only, very short main clauses, only the most basic high-frequency words",
  A2: "A2 level: present tense and Perfekt, short main clauses, high-frequency everyday vocabulary",
  B1: "B1 level: past tenses allowed, some subclauses, everyday vocabulary",
  B2: "B2 level: complex sentences, abstract topics possible, broad vocabulary",
  C1: "C1 level: natural native-like German, idioms welcome, varied structures",
};

/** Tolerates code fences or trailing junk around the JSON payload. */
function parseJsonLoose(text: string | undefined) {
  if (!text) return null;
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const gate = await gateAiRequest("immerse");
  if (!gate.ok) return gate.response;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      kind?: ImmerseKind;
      level?: ImmerseLevel;
    };
    const kind = body.kind === "dialog" ? "dialog" : "story";
    const guide = LEVEL_GUIDE[body.level ?? "A1"] ?? LEVEL_GUIDE.A1;

    const format =
      kind === "dialog"
        ? "a dialog of 10-12 turns between two named people (set speaker to their first names)"
        : "a short story of 8-10 sentences, one sentence per line (speaker is null)";

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: STORY_SCHEMA,
        // No hidden reasoning for creative text — thinking tokens count
        // against the output budget and were truncating longer dialogs
        // (invalid JSON → 502). Also saves free-tier tokens.
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8192,
      },
      contents: `Write ${format} in German about an everyday situation
(pick something fresh and a little charming — not always the same café scene).
Language difficulty: ${guide}.
Comprehensible-input style: engaging, concrete, lightly repetitive so
learners can infer meaning from context.`,
    });

    const story = parseJsonLoose(response.text);
    if (!story) {
      const finishReason = response.candidates?.[0]?.finishReason ?? "unknown";
      throw new Error(
        `empty or invalid JSON response (finishReason: ${finishReason})`,
      );
    }
    await gate.commit();
    return Response.json({ story });
  } catch (err) {
    console.error("[/api/immerse]", err);
    return aiErrorResponse(
      err,
      "Inhalt konnte nicht generiert werden (siehe Vercel Function Logs).",
    );
  }
}
