import { requireRole } from "../_shared/auth.ts";
import { parseJson } from "../_shared/http.ts";
import { sellerProductUpsertSchema } from "../_shared/schemas.ts";
import { handleWrite } from "../_shared/write-handler.ts";

Deno.serve((req) =>
  handleWrite(req, "seller-products", async ({ auth, idempotencyKey }) => {
    requireRole(auth, ["seller", "admin"]);
    const payload = await parseJson(req, sellerProductUpsertSchema);

    return {
      action: "seller.products.upsert",
      accepted: true,
      userId: auth.userId,
      role: auth.role,
      request: payload,
      next: "connect to products/inventory persistence",
      requestId: `${auth.userId}:${idempotencyKey}`,
    };
  }),
);
