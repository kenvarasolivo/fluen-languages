import { ai, LITE_MODEL } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai-errors";
import { gateAiRequest } from "@/lib/guest-limits";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getLearningContext } from "@/lib/learning-context";
import { PURPOSES, type Purpose } from "@/lib/purposes";
import type { LanguageDef } from "@/lib/languages";

/** Coach prompt — speaks like an educated native (C2) in the target language. */
function coachSystem(language: LanguageDef, purpose: Purpose | null): string {
  return `You are FLUEN's ${language.name} conversation partner.

Rules:
- Reply ONLY in ${language.name}. Speak like an educated native speaker
  (C2): natural, idiomatic and fluent — never simplified or textbook-stiff.
- Be a conversation partner, not a lecturer. Never correct mistakes in your
  reply — a separate system handles corrections. Just respond naturally to
  what the learner meant.
- Keep replies VERY short: 1–2 sentences, never more than ~25 words total.
  Always end with something that invites a response: a question, a gentle
  prompt, an opinion to react to.
- Warm, low-stakes, zero condescension.${
    purpose ? `\n- ${PURPOSES[purpose].coachNote}` : ""
  }${language.romanization ? `\n- ${language.romanization.textNote}` : ""}`;
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  // One request = one user message — that's what the guest quota counts.
  const gate = await gateAiRequest("chat");
  if (!gate.ok) return gate.response;

  // Which language environment this conversation belongs to.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { language, purpose } = await getLearningContext(supabase, user!.id);

  const { messages } = (await req.json()) as { messages: ChatTurn[] };

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is missing on the server - set the environment variable and redeploy." },
      { status: 502 },
    );
  }

  let stream;
  try {
    stream = await ai.models.generateContentStream({
      model: LITE_MODEL,
      config: {
        systemInstruction: coachSystem(language, purpose),
        // Thinking would eat the small output budget before any text.
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 256,
      },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return aiErrorResponse(err, "Reply failed - please try again.");
  }

  // The model accepted the request — count it against the guest quota.
  await gate.commit();

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
