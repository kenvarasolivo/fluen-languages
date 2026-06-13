import { ai, CHAT_MODEL, LITE_MODEL } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai-errors";
import { gateAiRequest } from "@/lib/guest-limits";

const COACH_SYSTEM = `You are FLUEN's German conversation partner.

Rules:
- Reply ONLY in German, calibrated slightly above the learner's level (i+1).
- Be a conversation partner, not a lecturer. Never correct mistakes in your
  reply — a separate system handles corrections. Just respond naturally to
  what the learner meant.
- Keep replies VERY short: 1–2 sentences, never more than ~25 words total.
  Always end with something that invites a response: a question, a gentle
  prompt, an opinion to react to.
- Warm, low-stakes, zero condescension.`;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  // One request = one user message — that's what the guest quota counts.
  const gate = await gateAiRequest("chat");
  if (!gate.ok) return gate.response;

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
        systemInstruction: COACH_SYSTEM,
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
