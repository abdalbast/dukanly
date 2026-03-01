import { HttpError } from "./http.ts";

type Counter = {
  count: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 60;
const counters = new Map<string, Counter>();

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export function enforceRateLimit(
  req: Request,
  routeKey: string,
  options?: { windowMs?: number; maxRequests?: number },
): void {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS_PER_WINDOW;
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${routeKey}:${ip}`;
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  counters.set(key, existing);

  if (existing.count > maxRequests) {
    throw new HttpError(429, "rate_limited", "Too many requests. Please retry in a minute.", {
      retryAfterMs: existing.resetAt - now,
    });
  }
}
