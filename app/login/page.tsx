import type { Metadata } from "next";
import { AuthForm } from "./_components/auth-form";

export const metadata: Metadata = { title: "FLEUN — Anmelden" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-semibold tracking-[0.18em]">
          FLEUN
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          Deutsch lernen. Ohne Lärm.
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
