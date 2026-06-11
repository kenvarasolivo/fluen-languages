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
          "GEMINI_API_KEY fehlt auf dem Server — in Vercel unter Settings → Environment Variables setzen und neu deployen.",
      },
      { status: 502 },
    );
  }
  if (overloaded) {
    return Response.json(
      {
        error:
          "Die KI ist gerade überlastet — das ist meist nur kurz. Versuch es in ein paar Minuten nochmal.",
      },
      { status: 503 },
    );
  }
  if (quotaHit) {
    return Response.json(
      {
        error:
          "Gemini-Tageslimit erreicht (Free Tier: 20 Anfragen/Tag pro Modell). Morgen wieder verfügbar — oder Billing in Google AI Studio aktivieren.",
      },
      { status: 429 },
    );
  }
  return Response.json({ error: fallback }, { status: 502 });
}
