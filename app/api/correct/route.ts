import { Type } from "@google/genai";
import { ai, LITE_MODEL } from "@/lib/ai";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Correction } from "@/lib/types";

const CORRECTION_SYSTEM = `You check a German learner's message for errors
(grammar, gender, case, word order, idiomatic usage). Judge only genuinely
wrong usage — informal register and minor punctuation are fine. If there are
multiple errors, correct the full sentence once and explain the most
important error in one short English sentence.`;

const CORRECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    has_error: { type: Type.BOOLEAN },
    original: { type: Type.STRING },
    corrected: { type: Type.STRING },
    explanation: {
      type: Type.STRING,
      description: "One short English sentence. Empty if has_error is false.",
    },
  },
  required: ["has_error", "original", "corrected", "explanation"],
};

export async function POST(req: Request) {
  // Corrections are ambient — any failure (rate limit, malformed JSON)
  // degrades to "no correction" instead of a 500.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ correction: null }, { status: 401 });

  try {
    const { text } = (await req.json()) as { text: string };

    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      config: {
        systemInstruction: CORRECTION_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: CORRECTION_SCHEMA,
      },
      contents: text,
    });

    const result = response.text
      ? JSON.parse(response.text)
      : { has_error: false };

    const correction: Correction | null = result.has_error
      ? {
          original: result.original,
          corrected: result.corrected,
          explanation: result.explanation,
        }
      : null;

    return Response.json({ correction });
  } catch (err) {
    console.error("[/api/correct]", err);
    return Response.json({ correction: null });
  }
}
