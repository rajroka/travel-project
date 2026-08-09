/**
 * Merge class names — a simple utility for conditional className strings.
 * Filters out falsy values and joins with a space.
 * Used in frontend components; safe to import in shared code.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
