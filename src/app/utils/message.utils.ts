/**
 * Simple utility to sanitize user-entered text.
 * Removes HTML tags and escapes any remaining angle brackets.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  // remove any HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  // escape angle brackets
  clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return clean.trim();
}
