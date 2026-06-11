import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "./_components/auth-form";

export const metadata: Metadata = { title: "FLUEN — Anmelden" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-4xl font-semibold tracking-[0.18em]">
          FLUEN
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          Deutsch lernen. Ohne Lärm.
        </p>
        <AuthForm />
        <p className="mt-10 text-center text-xs text-muted">
          <Link
            href="/impressum"
            className="transition-colors hover:text-foreground"
          >
            Impressum
          </Link>
        </p>
      </div>
    </div>
  );
}
