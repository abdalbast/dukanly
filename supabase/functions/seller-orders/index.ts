import { requireRole } from "../_shared/auth.ts";
import { parseJson } from "../_shared/http.ts";
import { sellerOrderUpdateSchema } from "../_shared/schemas.ts";
import { handleWrite } from "../_shared/write-handler.ts";

Deno.serve((req) =>
  handleWrite(req, "seller-orders", async ({ auth, idempotencyKey }) => {
    requireRole(auth, ["seller", "admin"]);
    const payload = await parseJson(req, sellerOrderUpdateSchema);

    return {
      action: "seller.orders.update",
      accepted: true,
      userId: auth.userId,
      role: auth.role,
      request: payload,
      next: "connect to order and shipment status transitions",
      requestId: `${auth.userId}:${idempotencyKey}`,
    };
  }),
);
