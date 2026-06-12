/**
 * Maps a failed Gemini call to a user-readable error Response.
 * The SDK surfaces upstream failures as ApiError with the JSON body
 * in the message, so we match on code/status strings.
 */
export function aiErrorResponse(err: unknown, fallback: string): Response {
  const msg = err instanceof Error ? err.message : String(err);
  const quotaHit = /RESOURCE_EXHAUSTED|"code"\s*:\s*429/.test(msg);
  const overloaded = /UNAVAILABLE|"code"\s*:\s*503|high demand|overloaded/i.test(msg);

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      {
        error:
          "GEMINI_API_KEY is missing on the server - set it in Vercel under Settings > Environment Variables and redeploy.",
      },
      { status: 502 },
    );
  }
  if (overloaded) {
    return Response.json(
      {
        error:
          "The AI is overloaded right now - this is usually brief. Try again in a few minutes.",
      },
      { status: 503 },
    );
  }
  if (quotaHit) {
    return Response.json(
      {
        error:
          "Gemini daily limit reached (free tier: 20 requests/day per model). Available again tomorrow - or enable billing in Google AI Studio.",
      },
      { status: 429 },
    );
  }
  return Response.json({ error: fallback }, { status: 502 });
}
