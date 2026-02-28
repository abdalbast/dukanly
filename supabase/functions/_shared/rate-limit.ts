import { HttpError } from "./http.ts";

type Counter = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const counters = new Map<string, Counter>();

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export function enforceRateLimit(req: Request, routeKey: string): void {
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${routeKey}:${ip}`;
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  existing.count += 1;
  counters.set(key, existing);

  if (existing.count > MAX_REQUESTS_PER_WINDOW) {
    throw new HttpError(429, "rate_limited", "Too many requests. Please retry in a minute.", {
      retryAfterMs: existing.resetAt - now,
    });
  }
}
