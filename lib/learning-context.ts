import type { createSupabaseServer } from "@/lib/supabase-server";
import { getLanguage, type LanguageDef } from "@/lib/languages";
import type { CefrLevel } from "@/lib/types";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServer>>;

export interface LearningContext {
  /** The learner's currently active target language. */
  language: LanguageDef;
  /** Their CEFR level in that language (defaults to A1). */
  level: CefrLevel;
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function sanitizeLevel(l: string | null | undefined): CefrLevel {
  return (LEVELS as readonly string[]).includes(l ?? "") ? (l as CefrLevel) : "A1";
}

/**
 * Resolves which environment a server route should operate in: the
 * active language (from `profiles.target_language`) and the learner's
 * level in that language (from `user_languages`). The source of truth
 * lives server-side so guest limits and curriculum draws can't be
 * spoofed from the client.
 */
export async function getLearningContext(
  supabase: SupabaseServer,
  userId: string,
): Promise<LearningContext> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("target_language")
    .eq("id", userId)
    .single();

  const language = getLanguage(profile?.target_language);

  const { data: ul } = await supabase
    .from("user_languages")
    .select("cefr_level")
    .eq("user_id", userId)
    .eq("language", language.code)
    .maybeSingle();

  return { language, level: sanitizeLevel(ul?.cefr_level) };
}
