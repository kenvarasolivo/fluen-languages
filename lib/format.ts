/**
 * Display form of a dictionary word: "<gender> <lemma>".
 *
 * Some AI-generated lemmas arrive with the article already baked in
 * ("der Vorteil" instead of "Vorteil"), which would double the article
 * once the gender column is prefixed ("der der Vorteil"). Strip a
 * leading article from the lemma whenever a gender is present.
 */
export function withGender(
  gender: string | null | undefined,
  lemma: string,
): string {
  if (!gender) return lemma;
  return `${gender} ${lemma.replace(/^(der|die|das)\s+/i, "")}`;
}
