import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FLUEN - Impressum" };

export default function ImpressumPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-5xl font-extrabold tracking-[0.2em]">
          FLUEN
        </h1>
        <p className="eyebrow mt-3 text-center text-[11px] text-muted">
          Impressum (Legal Notice)
        </p>

        <div className="mt-10 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <p className="text-muted">
              Information according to § 5 TMG / § 18 MStV:
            </p>
            <p className="mt-2 font-medium">Kenvara Solivo Lwie</p>
            <p>52064 Aachen, Germany</p>
          </section>

          <section>
            <p className="text-muted">Contact:</p>
            <p className="mt-2">
              Email:{" "}
              <a
                href="mailto:kenvara.solivo@gmail.com"
                className="text-accent underline-offset-2 hover:underline"
              >
                kenvara.solivo@gmail.com
              </a>
            </p>
          </section>

          <p className="text-xs leading-relaxed text-muted">
            Note: This website is a private, non-commercial portfolio whose
            sole purpose is to present my projects to potential employers and
            recruiters.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}
