/**
 * Minimal in-memory brute-force guard for the login endpoint.
 *
 * Tracks failed attempts per key (IP + email) inside a sliding window and
 * locks the key out for a cooldown once the threshold is crossed.
 *
 * Caveat: state lives in the module scope, so it is per-instance. On a
 * multi-instance / serverless deployment each instance keeps its own
 * counters — this raises the cost of a brute-force attack but is not a
 * distributed limiter. For strong guarantees back this with a shared store
 * (Redis/Upstash). For a single-admin, low-traffic site this is enough.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min rolling window
const BLOCK_MS = 15 * 60 * 1000; // lockout duration once tripped

interface AttemptRecord {
  count: number;
  firstAt: number;
  blockedUntil: number;
}

const attempts = new Map<string, AttemptRecord>();

function now(): number {
  return Date.now();
}

/**
 * Opportunistically drop stale records so the map can't grow unbounded.
 */
function sweep(current: number): void {
  for (const [key, rec] of attempts) {
    const expired =
      rec.blockedUntil < current && current - rec.firstAt > WINDOW_MS;
    if (expired) attempts.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

/**
 * Check whether `key` is currently allowed to attempt a login.
 * Does not mutate the failure counter — call `recordFailure` on a bad login.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const current = now();
  const rec = attempts.get(key);

  if (rec && rec.blockedUntil > current) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((rec.blockedUntil - current) / 1000),
    };
  }

  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Record a failed login attempt for `key`. Once the attempts within the
 * window exceed the threshold the key is blocked for BLOCK_MS.
 */
export function recordFailure(key: string): void {
  const current = now();
  sweep(current);

  const rec = attempts.get(key);

  if (!rec || current - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: current, blockedUntil: 0 });
    return;
  }

  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.blockedUntil = current + BLOCK_MS;
  }
}

/**
 * Clear the counter for `key` after a successful login.
 */
export function resetAttempts(key: string): void {
  attempts.delete(key);
}
