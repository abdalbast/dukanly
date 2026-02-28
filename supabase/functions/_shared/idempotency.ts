import { HttpError } from "./http.ts";

type CacheEntry = {
  expiresAt: number;
  response: Response;
};

const STORE_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyStore = new Map<string, CacheEntry>();

function cleanup(now: number) {
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.expiresAt <= now) {
      idempotencyStore.delete(key);
    }
  }
}

export function readIdempotencyKey(req: Request): string {
  const key = req.headers.get("idempotency-key")?.trim();

  if (!key) {
    throw new HttpError(400, "missing_idempotency_key", "idempotency-key header is required.");
  }

  if (key.length < 16 || key.length > 128) {
    throw new HttpError(
      400,
      "invalid_idempotency_key",
      "idempotency-key must be between 16 and 128 characters.",
    );
  }

  return key;
}

export function getCachedResponse(cacheKey: string): Response | null {
  const now = Date.now();
  cleanup(now);
  const hit = idempotencyStore.get(cacheKey);

  if (!hit) return null;
  return hit.response.clone();
}

export function saveCachedResponse(cacheKey: string, response: Response): void {
  const now = Date.now();
  cleanup(now);
  idempotencyStore.set(cacheKey, {
    expiresAt: now + STORE_TTL_MS,
    response: response.clone(),
  });
}

export function buildIdempotencyCacheKey(path: string, userId: string, idempotencyKey: string): string {
  return `${path}:${userId}:${idempotencyKey}`;
}
