import { stripLeadingArticle } from "@/lib/languages";

/**
 * Display form of a dictionary word: "<gender> <lemma>".
 *
 * Some AI-generated lemmas arrive with the article already baked in
 * ("der Vorteil" instead of "Vorteil", "la casa" instead of "casa"),
 * which would double the article once the gender column is prefixed
 * ("der der Vorteil"). Strip a leading article from the lemma whenever
 * a gender is present. Works for every supported language.
 */
export function withGender(
  gender: string | null | undefined,
  lemma: string,
): string {
  if (!gender) return lemma;
  return `${gender} ${stripLeadingArticle(lemma)}`;
}
