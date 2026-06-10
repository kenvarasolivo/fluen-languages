import { Type } from "@google/genai";
import { ai, LITE_MODEL } from "@/lib/ai";

const DEFINITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    lemma: {
      type: Type.STRING,
      description: "Dictionary base form without article",
    },
    gender: {
      type: Type.STRING,
      nullable: true,
      description: "der/die/das for nouns, null otherwise",
    },
    pos: { type: Type.STRING },
    meaning_en: {
      type: Type.STRING,
      description: "Short English meaning as used in the given sentence",
    },
  },
  required: ["lemma", "gender", "pos", "meaning_en"],
};

export async function POST(req: Request) {
  try {
    const { word, sentence } = (await req.json()) as {
      word: string;
      sentence: string;
    };

    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: DEFINITION_SCHEMA,
      },
      contents: `Define the German word "${word}" as it is used in this sentence:
"${sentence}"`,
    });

    const definition = response.text ? JSON.parse(response.text) : null;
    if (!definition) throw new Error("empty response");
    return Response.json({ definition });
  } catch (err) {
    console.error("[/api/define]", err);
    return Response.json({ error: "definition failed" }, { status: 502 });
  }
}
