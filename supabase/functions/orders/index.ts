import { parseJson } from "../_shared/http.ts";
import { createOrderSchema } from "../_shared/schemas.ts";
import { handleWrite } from "../_shared/write-handler.ts";

Deno.serve((req) =>
  handleWrite(req, "orders", async ({ auth, idempotencyKey }) => {
    const payload = await parseJson(req, createOrderSchema);

    return {
      action: "orders.create",
      accepted: true,
      userId: auth.userId,
      request: payload,
      next: "connect to orders/order_items/payments writes",
      requestId: `${auth.userId}:${idempotencyKey}`,
    };
  }),
);
