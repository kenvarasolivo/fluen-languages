import { Type } from "@google/genai";
import { ai, CHAT_MODEL } from "@/lib/ai";
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
  beginner:
    "A2 level: present tense, short main clauses, high-frequency vocabulary only",
  intermediate:
    "B1 level: past tenses allowed, some subclauses, everyday vocabulary",
  advanced:
    "B2/C1 level: natural native-like German, idioms welcome, varied structures",
};

export async function POST(req: Request) {
  try {
    const { kind = "story", level = "beginner" } = (await req
      .json()
      .catch(() => ({}))) as { kind?: ImmerseKind; level?: ImmerseLevel };

    const format =
      kind === "dialog"
        ? "a dialog of 10-12 turns between two named people (set speaker to their first names)"
        : "a short story of 8-10 sentences, one sentence per line (speaker is null)";

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: STORY_SCHEMA,
      },
      contents: `Write ${format} in German about an everyday situation
(pick something fresh and a little charming — not always the same café scene).
Language difficulty: ${LEVEL_GUIDE[level]}.
Comprehensible-input style: engaging, concrete, lightly repetitive so
learners can infer meaning from context.`,
    });

    const story = response.text ? JSON.parse(response.text) : null;
    if (!story) throw new Error("empty response");
    return Response.json({ story });
  } catch (err) {
    console.error("[/api/immerse]", err);
    return Response.json(
      { error: "Inhalt konnte nicht generiert werden." },
      { status: 502 },
    );
  }
}
