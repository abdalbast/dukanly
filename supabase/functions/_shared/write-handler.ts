import { AuthContext, requireAuth } from "./auth.ts";
import {
  buildIdempotencyCacheKey,
  getCachedResponse,
  readIdempotencyKey,
  saveCachedResponse,
} from "./idempotency.ts";
import { corsHeaders, HttpError, handleUnhandled, success } from "./http.ts";
import { enforceRateLimit } from "./rate-limit.ts";

export interface WriteContext {
  auth: AuthContext;
  idempotencyKey: string;
}

export async function handleWrite<T>(
  req: Request,
  routeKey: string,
  run: (ctx: WriteContext) => Promise<T>,
): Promise<Response> {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST" && req.method !== "PATCH") {
      throw new HttpError(405, "method_not_allowed", "Only POST/PATCH requests are supported.");
    }

    enforceRateLimit(req, routeKey);

    const auth = await requireAuth(req);
    const idempotencyKey = readIdempotencyKey(req);
    const cacheKey = buildIdempotencyCacheKey(routeKey, auth.userId, idempotencyKey);
    const cached = getCachedResponse(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await run({ auth, idempotencyKey });
    const response = success({
      ...data,
      meta: {
        idempotencyKey,
        servedFromCache: false,
      },
    });

    saveCachedResponse(cacheKey, response);
    return response;
  } catch (error) {
    return handleUnhandled(error);
  }
}
