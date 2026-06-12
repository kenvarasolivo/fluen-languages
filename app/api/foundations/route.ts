import { Type } from "@google/genai";
import { ai, CHAT_MODEL } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai-errors";
import { gateAiRequest } from "@/lib/guest-limits";

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
      cefr_level: {
        type: Type.STRING,
        description: "CEFR difficulty of this word: A1 | A2 | B1 | B2 | C1 | C2",
      },
      example_de: {
        type: Type.STRING,
        description: "One short, natural German sentence using the word",
      },
      example_en: { type: Type.STRING },
    },
    required: [
      "lemma",
      "gender",
      "pos",
      "meaning_en",
      "cefr_level",
      "example_de",
      "example_en",
    ],
  },
};

export async function POST(req: Request) {
  const gate = await gateAiRequest("foundations");
  if (!gate.ok) return gate.response;

  try {
    const { level = "B1", count = 10 } = await req.json().catch(() => ({}));

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORDS_SCHEMA,
        // Vocabulary lists need no hidden reasoning — thinking tokens
        // would only burn free-tier quota and output budget.
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8192,
      },
      contents: `Create ${count} useful German vocabulary words for a ${level}-level
learner. Mix parts of speech (mostly nouns and verbs, a few adjectives or
everyday phrases). Pick genuinely useful everyday words, not obscure ones.
Vary the topics. Each example sentence must be short and natural.
Rate each word's own CEFR difficulty honestly (an everyday word in a B1 set
may itself be A2).`,
    });

    const words = response.text ? JSON.parse(response.text) : [];
    await gate.commit();
    return Response.json({ words });
  } catch (err) {
    console.error("[/api/foundations]", err);
    return aiErrorResponse(
      err,
      "Words could not be generated (see the Vercel function logs).",
    );
  }
}
