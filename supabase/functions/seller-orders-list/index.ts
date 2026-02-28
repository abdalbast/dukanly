import { requireAuth, requireRole } from "../_shared/auth.ts";
import { handleUnhandled, HttpError, success } from "../_shared/http.ts";
import { parseQuery } from "../_shared/query.ts";
import { paginationQuerySchema } from "../_shared/schemas.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, content-type, idempotency-key, x-forwarded-for",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
      });
    }

    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Only GET is supported.");
    }

    const auth = await requireAuth(req);
    requireRole(auth, ["seller", "admin"]);
    const query = await parseQuery(req, paginationQuerySchema);

    return success({
      action: "seller.orders.list",
      accepted: true,
      role: auth.role,
      pagination: query,
      next: "connect to orders read model with DB pagination",
    });
  } catch (error) {
    return handleUnhandled(error);
  }
});
