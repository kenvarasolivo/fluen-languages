import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * FLEUN uses anonymous auth for now — no login screen, but every
 * browser gets a real auth.users row so RLS works. Upgrading to
 * email auth later just replaces this call with a login flow.
 *
 * Requires "Allow anonymous sign-ins" in Supabase → Authentication.
 */
export async function ensureSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session!;
}
