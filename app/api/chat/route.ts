import { ai, CHAT_MODEL } from "@/lib/ai";
import { gateAiRequest } from "@/lib/guest-limits";

const COACH_SYSTEM = `You are FLEUN's German conversation partner.

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
    return new Response(
      "GEMINI_API_KEY fehlt auf dem Server — Umgebungsvariable setzen und neu deployen.",
      { status: 502 },
    );
  }

  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    config: { systemInstruction: COACH_SYSTEM, maxOutputTokens: 256 },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

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
