/**
 * Date utility helpers for timezone-safe date handling.
 * Used across attendance and calendar features to ensure consistent date comparisons.
 */

/**
 * Extracts YYYY-MM-DD date key from an ISO datetime string.
 * @param iso - ISO 8601 datetime string (e.g., "2026-09-02T00:00:00.000Z")
 * @returns Date key in YYYY-MM-DD format (e.g., "2026-09-02")
 */
export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Formats a Date object to YYYY-MM-DD using UTC timezone.
 * This ensures consistency with backend @db.Date fields which serialize as ISO datetimes
 * with the date portion in UTC.
 * @param d - Date object
 * @returns Date key in YYYY-MM-DD format (UTC)
 */
export function formatUTCDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Gets today's date as YYYY-MM-DD in local timezone.
 * Use this for comparing with user-local "today" (what the user considers today).
 * @returns Today's date key in local timezone
 */
export function getTodayKey(): string {
  return formatLocalDateKey(new Date());
}

/**
 * Formats a Date object to YYYY-MM-DD using local timezone.
 * Use this only for display purposes, not for comparison with backend dates.
 * @param d - Date object
 * @returns Date key in YYYY-MM-DD format (local timezone)
 */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
