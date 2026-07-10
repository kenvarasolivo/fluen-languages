/**
 * Shared username rules for registration and the profile editor.
 * 3–20 characters, letters / numbers / underscore / dot, must start
 * with a letter or number. Kept deliberately strict so handles read
 * cleanly wherever they're shown.
 */
export const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.]{2,19}$/;

/** Returns an error message, or null when the username is valid. */
export function validateUsername(value: string): string | null {
  const v = value.trim();
  if (v.length < 3) return "Username must be at least 3 characters.";
  if (v.length > 20) return "Username must be at most 20 characters.";
  if (!USERNAME_PATTERN.test(v)) {
    return "Use letters, numbers, . or _ (starting with a letter or number).";
  }
  return null;
}
