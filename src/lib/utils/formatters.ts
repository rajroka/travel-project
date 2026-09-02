/**
 * Format a number as a USD currency string.
 * e.g. 1234.5 → "$1,234.50"
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a Date or ISO string into a readable date.
 * e.g. "2026-08-08" → "August 8, 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format a Date or ISO string into date + time.
 * e.g. "2026-08-08T14:30:00Z" → "August 8, 2026, 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Truncate a string to a max length, appending "…" if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type NameFields = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

function dedupeConsecutiveWords(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (out.length && out[out.length - 1]!.toLowerCase() === part.toLowerCase()) continue;
    out.push(part);
  }
  return out.join(" ");
}

/** Display a person's name once (skips a last name that repeats the first). */
export function formatUserName(user?: NameFields | null, fallback = "—"): string {
  if (!user) return fallback;

  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";

  if (first || last) {
    if (!last || first.toLowerCase() === last.toLowerCase()) {
      return first || last || fallback;
    }
    return `${first} ${last}`;
  }

  if (user.name?.trim()) {
    return dedupeConsecutiveWords(user.name.trim()) || fallback;
  }

  return user.email?.split("@")[0] || fallback;
}
