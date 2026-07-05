const WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 6;

function maxRequestsPerWindow(): number {
  const raw = process.env.FITTD_RATE_LIMIT_PER_MINUTE;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_REQUESTS_PER_WINDOW;
}

type WindowState = { count: number; windowStart: number };

/**
 * In-memory, per-instance fixed-window counter — shared across every
 * analysis endpoint (one budget per IP, not one per feature), per
 * docs/non-functional.md. Deliberately not distributed: see
 * specs/002-jd-analysis/research.md for why that's an acceptable
 * limitation at this project's scale, not a hidden shortcut.
 */
const buckets = new Map<string, WindowState>();

/** Returns true if `key` (typically an IP) is still within budget for
 * the current window, recording the attempt either way. */
export function checkRateLimit(key: string, now: number = Date.now()): boolean {
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= maxRequestsPerWindow()) {
    return false;
  }

  existing.count += 1;
  return true;
}

/** Test-only: clears all tracked windows. */
export function resetRateLimits(): void {
  buckets.clear();
}
