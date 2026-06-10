import { Type } from "@google/genai";
import { ai, CHAT_MODEL } from "@/lib/ai";

const WORDS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      lemma: {
        type: Type.STRING,
        description: "Base form WITHOUT the article, e.g. 'Haus', 'laufen'",
      },
      gender: {
        type: Type.STRING,
        nullable: true,
        description: "der/die/das for nouns, null for everything else",
      },
      pos: {
        type: Type.STRING,
        description: "noun | verb | adjective | adverb | phrase",
      },
      meaning_en: { type: Type.STRING },
      example_de: {
        type: Type.STRING,
        description: "One short, natural German sentence using the word",
      },
      example_en: { type: Type.STRING },
    },
    required: ["lemma", "gender", "pos", "meaning_en", "example_de", "example_en"],
  },
};

export async function POST(req: Request) {
  try {
    const { level = "B1", count = 10 } = await req.json().catch(() => ({}));

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORDS_SCHEMA,
      },
      contents: `Create ${count} useful German vocabulary words for a ${level}-level
learner. Mix parts of speech (mostly nouns and verbs, a few adjectives or
everyday phrases). Pick genuinely useful everyday words, not obscure ones.
Vary the topics. Each example sentence must be short and natural.`,
    });

    const words = response.text ? JSON.parse(response.text) : [];
    return Response.json({ words });
  } catch (err) {
    console.error("[/api/foundations]", err);
    return Response.json(
      { error: "Wörter konnten nicht generiert werden." },
      { status: 502 },
    );
  }
}
