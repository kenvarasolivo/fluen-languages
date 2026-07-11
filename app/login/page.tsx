import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "./_components/auth-form";

export const metadata: Metadata = { title: "FLUEN - Sign in" };

export default function LoginPage() {
  return (
    <div className="bg-mesh flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="fade-up mb-6 inline-flex items-center gap-1.5 rounded-md text-xs text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} aria-hidden />
          Back to home
        </Link>
        <Link
          href="/"
          className="fade-up flex items-center justify-center gap-3 rounded-md text-center text-5xl font-extrabold tracking-[0.2em]"
        >
          <span aria-hidden className="logo-dot size-3.5" />
          FLUEN
        </Link>
        <p className="eyebrow fade-up fade-up-1 mt-4 text-center text-[11px] text-muted">
          Learn languages. Without the noise.
        </p>
        <div className="fade-up fade-up-2 mt-8 rounded-3xl border border-border bg-surface-raised/85 p-6 shadow-raised backdrop-blur-sm">
          <AuthForm />
        </div>
        <p className="mt-8 text-center text-xs text-muted">
          <Link
            href="/impressum"
            className="rounded-md transition-colors hover:text-foreground"
          >
            Impressum
          </Link>
        </p>
      </div>
    </div>
  );
}
