"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cookie-based browser client (@supabase/ssr) so middleware and the
 * /api/* route handlers can read the same session — that's what lets
 * the server enforce guest limits instead of trusting the client.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Returns the current session. The middleware guarantees one exists on
 * every (app) page — guests get an anonymous session from the login
 * screen. If it's somehow gone (cookies cleared), send the user back.
 */
export async function ensureSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  if (typeof window !== "undefined") window.location.href = "/login";
  throw new Error("not signed in");
}
