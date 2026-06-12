"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
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

      // Registration. If the visitor is currently a guest (anonymous
      // session), upgrade that user in place — their cards survive.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user.is_anonymous) {
        const { error } = await supabase.auth.updateUser({ email, password });
        if (error) throw error;
        setNotice(
          "Account created. If a confirmation email arrives, confirm it - your cards will be kept.",
        );
        setTimeout(goToApp, 1600);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
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
      <div className="flex rounded-lg border border-border bg-foreground/[0.03] p-1">
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
            className={`flex-1 rounded-md py-1.5 text-xs transition-all duration-150 ${
              mode === o.id
                ? "bg-surface-raised font-medium text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
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
          className="mt-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-accent/90 active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-accent"
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
        className="mt-6 w-full rounded-xl border border-border bg-surface py-2.5 text-sm text-muted shadow-xs transition-all duration-150 hover:border-border-strong hover:text-foreground active:scale-[0.99] disabled:opacity-50"
      >
        {pending === "guest" ? "One moment ..." : "Continue as guest"}
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        Guests can generate cards once, read one text and write 5 messages.
      </p>
    </div>
  );
}
