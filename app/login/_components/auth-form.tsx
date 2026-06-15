"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validateUsername } from "@/lib/username";

type Mode = "signin" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"form" | "guest" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const goToApp = () => {
    // Full navigation so the middleware sees the fresh auth cookies.
    window.location.href = "/dashboard";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setNotice(null);
    setPending("form");

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        goToApp();
        return;
      }

      // Registration — validate the chosen handle and make sure it's free.
      const handle = username.trim();
      const usernameError = validateUsername(handle);
      if (usernameError) throw new Error(usernameError);

      const { data: available, error: checkError } = await supabase.rpc(
        "check_username_available",
        { candidate: handle },
      );
      if (checkError) throw checkError;
      if (!available) throw new Error("That username is already taken.");

      // If the visitor is currently a guest (anonymous session), upgrade
      // that user in place — their cards survive.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user.is_anonymous) {
        const { error } = await supabase.auth.updateUser({
          email,
          password,
          data: { username: handle },
        });
        if (error) throw error;
        // The trigger only fires for brand-new users, so set the handle
        // on the existing profile row directly (RLS allows own-row).
        await supabase
          .from("profiles")
          .update({ username: handle })
          .eq("id", session.user.id);
        setNotice(
          "Account created. If a confirmation email arrives, confirm it - your cards will be kept.",
        );
        setTimeout(goToApp, 1600);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: handle } },
      });
      if (error) throw error;
      if (data.session) {
        // Belt-and-braces: ensure the handle landed even if metadata
        // timing differs from the trigger.
        await supabase
          .from("profiles")
          .update({ username: handle })
          .eq("id", data.session.user.id);
        goToApp();
      } else {
        // Email confirmation is enabled in Supabase.
        setNotice("Almost there - confirm your email address, then you can sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  };

  const continueAsGuest = async () => {
    if (pending) return;
    setError(null);
    setPending("guest");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Returning guest: reuse the existing anonymous session.
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      goToApp();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Guest mode is not available.",
      );
      setPending(null);
    }
  };

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex rounded-md border-[1.5px] border-border-strong p-1">
        {(
          [
            { id: "signin", label: "Sign in" },
            { id: "register", label: "Create account" },
          ] as { id: Mode; label: string }[]
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setMode(o.id);
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 rounded-sm py-1.5 text-xs uppercase tracking-[0.06em] transition-all duration-150 ${
              mode === o.id
                ? "bg-foreground font-semibold text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        {mode === "register" && (
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            minLength={3}
            maxLength={20}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base shadow-xs outline-none transition-all duration-150 placeholder:text-muted focus:border-accent/50 focus:ring-[3px] focus:ring-accent/15 sm:text-sm"
          />
        )}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base shadow-xs outline-none transition-all duration-150 placeholder:text-muted focus:border-accent/50 focus:ring-[3px] focus:ring-accent/15 sm:text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base shadow-xs outline-none transition-all duration-150 placeholder:text-muted focus:border-accent/50 focus:ring-[3px] focus:ring-accent/15 sm:text-sm"
        />

        {error && <p className="text-xs text-negative">{error}</p>}
        {notice && <p className="text-xs text-positive">{notice}</p>}

        <button
          type="submit"
          disabled={pending !== null}
          className="btn-primary mt-1 rounded-md py-2.5 text-sm"
        >
          {pending === "form"
            ? "One moment ..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={continueAsGuest}
        disabled={pending !== null}
        className="btn-outline mt-6 w-full rounded-md py-2.5 text-sm disabled:opacity-50"
      >
        {pending === "guest" ? "One moment ..." : "Continue as guest"}
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        Guests can generate cards once, read one text and write 5 messages.
      </p>
    </div>
  );
}
