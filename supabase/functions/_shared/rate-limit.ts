import { getAdminClient } from "./db.ts";
import { HttpError } from "./http.ts";

const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 60;

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function enforceRateLimit(
  req: Request,
  routeKey: string,
  options?: { windowMs?: number; maxRequests?: number },
): Promise<void> {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS_PER_WINDOW;
  const ip = getClientIp(req);

  const admin = getAdminClient();

  const { data, error } = await admin.rpc("check_rate_limit", {
    p_route_key: routeKey,
    p_client_ip: ip,
    p_window_ms: windowMs,
    p_max_requests: maxRequests,
  });

  if (error) {
    // If rate limiting DB fails, allow the request (fail open) but log
    console.error("Rate limit check failed:", error.message);
    return;
  }

  if (data === true) {
    throw new HttpError(429, "rate_limited", "Too many requests. Please retry in a minute.");
  }
}
