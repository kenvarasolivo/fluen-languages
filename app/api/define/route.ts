import { Type } from "@google/genai";
import { ai, LITE_MODEL } from "@/lib/ai";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getLearningContext } from "@/lib/learning-context";

const DEFINITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    lemma: {
      type: Type.STRING,
      description:
        "Dictionary base form of the lexical unit (infinitive for verbs), without article. For separable or reflexive verbs, the full form (e.g. 'umziehen', 'sich freuen') — not just the tapped fragment.",
    },
    pinyin: {
      type: Type.STRING,
      nullable: true,
      description:
        "Romanization for non-Latin scripts (Mandarin: Hanyu Pinyin with tone marks); null otherwise",
    },
    gender: {
      type: Type.STRING,
      nullable: true,
      description:
        "The noun's gender article (e.g. der/die/das, el/la), null otherwise",
    },
    pos: { type: Type.STRING },
    meaning_en: {
      type: Type.STRING,
      description:
        "Short English meaning of the lexical unit as used in the given sentence",
    },
    cefr_level: {
      type: Type.STRING,
      description: "CEFR difficulty of the word: A1 | A2 | B1 | B2 | C1 | C2",
    },
  },
  required: ["lemma", "pinyin", "gender", "pos", "meaning_en", "cefr_level"],
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const { word, sentence } = (await req.json()) as {
      word: string;
      sentence: string;
    };
    const { language } = await getLearningContext(supabase, user.id);

    const response = await ai.models.generateContent({
      model: LITE_MODEL,
      config: {
        responseMimeType: "application/json",
        responseSchema: DEFINITION_SCHEMA,
      },
      contents: `A learner tapped "${word}" while reading this ${language.name} sentence:
"${sentence}"

Read the whole sentence. Identify the lexical unit the learner is trying to learn — the word or phrase "${word}" belongs to in this context (separable verb, reflexive verb, fixed expression, etc.). Return the dictionary base form of THAT unit as "lemma" and its English meaning as used here.

If "${word}" is truly standalone in this sentence (noun, article, adjective, ordinary preposition, etc.), define it normally.
${language.defineNote ? `\n${language.defineNote}` : ""}${language.romanization ? `\n${language.romanization.wordNote}` : ""}`,
    });

    const definition = response.text ? JSON.parse(response.text) : null;
    if (!definition) throw new Error("empty response");
    return Response.json({ definition });
  } catch (err) {
    console.error("[/api/define]", err);
    return Response.json({ error: "definition failed" }, { status: 502 });
  }
}
