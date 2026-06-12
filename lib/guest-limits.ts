import { createSupabaseServer } from "./supabase-server";

/**
 * Token-conscious guest quotas. Guests (anonymous sessions) may try
 * each AI feature a fixed number of times; registered accounts are
 * unlimited. Enforced server-side in the /api/* routes — the counters
 * live on `profiles` and survive page reloads.
 */
export const GUEST_LIMITS = {
  foundations: 1,
  immerse: 1,
  chat: 5,
} as const;

export type GuestFeature = keyof typeof GUEST_LIMITS;

const LIMIT_MESSAGES: Record<GuestFeature, string> = {
  foundations:
    "As a guest you can only generate cards once. Create a free account to keep learning.",
  immerse:
    "As a guest you can only generate one text. Create a free account to keep reading.",
  chat: "Guests get 5 messages. Create a free account to keep talking.",
};

type GateResult =
  | { ok: true; /** call after the AI call succeeds */ commit: () => Promise<void> }
  | { ok: false; response: Response };

/**
 * Checks auth + guest quota for an AI feature. Returns a ready-made
 * error Response when blocked. The quota is only consumed when the
 * caller invokes `commit()` — so a failed Gemini call doesn't burn a
 * guest's single attempt.
 */
export async function gateAiRequest(feature: GuestFeature): Promise<GateResult> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Not signed in.", code: "unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (!user.is_anonymous) {
    return { ok: true, commit: async () => {} };
  }

  const column = `usage_${feature}`;
  const { data: profile } = await supabase
    .from("profiles")
    .select(column)
    .eq("id", user.id)
    .single();
  const used = (profile as Record<string, number> | null)?.[column] ?? 0;

  if (used >= GUEST_LIMITS[feature]) {
    return {
      ok: false,
      response: Response.json(
        { error: LIMIT_MESSAGES[feature], code: "guest_limit" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    commit: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ [column]: used + 1 })
        .eq("id", user.id);
      if (error) console.error(`[guest-limits] ${feature}`, error);
    },
  };
}
