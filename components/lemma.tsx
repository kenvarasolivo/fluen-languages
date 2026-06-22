import { withGender } from "@/lib/format";
import type { LanguageDef } from "@/lib/languages";

/**
 * Renders a dictionary word for display.
 *
 * For Latin-script languages this is just the gendered lemma
 * ("der Vorteil", "la casa"). For languages with a romanization
 * (Mandarin → Pinyin) the learner reads the typeable romanization as the
 * main line, with the native script set above it as a `<ruby>` annotation
 * — so the focus stays on the Pinyin you can actually type, while the
 * Hanzi rides along on top. The `rt` scales with the surrounding font
 * size, so the same component works in a 5xl flashcard and a small list.
 */
export function Lemma({
  language,
  lemma,
  pinyin,
  gender,
  className,
  lang,
}: {
  language: LanguageDef;
  lemma: string;
  pinyin?: string | null;
  gender?: string | null;
  className?: string;
  /** Value for the HTML `lang` attribute (helps the browser pick fonts). */
  lang?: string;
}) {
  if (language.romanization && pinyin) {
    return (
      <ruby className={className} lang={lang}>
        {pinyin}
        <rt className="font-normal text-muted" lang={language.htmlLang}>
          {lemma}
        </rt>
      </ruby>
    );
  }
  return (
    <span className={className} lang={lang}>
      {withGender(gender, lemma)}
    </span>
  );
}
