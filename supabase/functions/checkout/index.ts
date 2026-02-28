import { parseJson } from "../_shared/http.ts";
import { checkoutSchema } from "../_shared/schemas.ts";
import { handleWrite } from "../_shared/write-handler.ts";

Deno.serve((req) =>
  handleWrite(req, "checkout", async ({ auth, idempotencyKey }) => {
    const payload = await parseJson(req, checkoutSchema);

    // Phase 3 scaffold: endpoint contract and guardrails are active.
    // Database transaction wiring is intentionally deferred until Phase 2/3 RLS completion.
    return {
      action: "checkout.submit",
      accepted: true,
      userId: auth.userId,
      request: payload,
      next: "wire transactional order creation",
      requestId: `${auth.userId}:${idempotencyKey}`,
    };
  }),
);
