import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FLUEN — Impressum" };

export default function ImpressumPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-4xl font-semibold tracking-[0.18em]">
          FLUEN
        </h1>
        <p className="mt-2 text-center text-sm text-muted">Impressum</p>

        <div className="mt-10 flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <p className="text-muted">
              Angaben gemäß § 5 TMG / § 18 MStV:
            </p>
            <p className="mt-2 font-medium">Kenvara Solivo Lwie</p>
            <p>52064 Aachen</p>
          </section>

          <section>
            <p className="text-muted">Kontakt:</p>
            <p className="mt-2">
              E-Mail:{" "}
              <a
                href="mailto:kenvara.solivo@gmail.com"
                className="text-accent underline-offset-2 hover:underline"
              >
                kenvara.solivo@gmail.com
              </a>
            </p>
          </section>

          <p className="text-xs leading-relaxed text-muted">
            Hinweis: Diese Website ist ein privates, nicht-kommerzielles
            Portfolio, das ausschließlich dazu dient, meine Projekte
            potenziellen Arbeitgebern und Recruitern zu präsentieren.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            ← Zurück
          </Link>
        </div>
      </div>
    </div>
  );
}
