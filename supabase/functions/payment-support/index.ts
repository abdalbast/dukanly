import { requireAuth, requireRole } from "../_shared/auth.ts";
import { getAdminClient } from "../_shared/db.ts";
import { handleUnhandled, HttpError, success } from "../_shared/http.ts";
import { parseQuery } from "../_shared/query.ts";
import { paymentSupportQuerySchema } from "../_shared/schemas.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, content-type, x-forwarded-for, x-correlation-id",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
      });
    }

    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Only GET is supported.");
    }

    const auth = await requireAuth(req);
    requireRole(auth, ["admin"]);

    const query = await parseQuery(req, paymentSupportQuerySchema);
    const admin = getAdminClient();

    let paymentId: string | null = null;
    let orderId: string | null = query.orderId ?? null;

    if (query.providerPaymentId) {
      const { data: paymentLookup, error: lookupError } = await admin
        .from("payments")
        .select("id, order_id")
        .eq("provider", "fib")
        .eq("provider_payment_id", query.providerPaymentId)
        .maybeSingle();

      if (lookupError) {
        throw new HttpError(500, "database_error", "Failed to lookup payment by provider payment id.", lookupError.message);
      }

      if (!paymentLookup) {
        throw new HttpError(404, "payment_not_found", "Provider payment id was not found.");
      }

      paymentId = paymentLookup.id;
      orderId = paymentLookup.order_id;
    }

    if (!orderId) {
      throw new HttpError(422, "validation_error", "orderId is required when providerPaymentId is absent.");
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, order_number, user_id, payment_method, payment_state, payment_state_reason, payment_status, fulfillment_status, region_code, total_amount, currency_code, placed_at")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new HttpError(404, "order_not_found", "Order not found.");
    }

    const paymentQuery = admin
      .from("payments")
      .select("id, provider, provider_payment_id, provider_status, status, amount, currency_code, valid_until, paid_at, declined_at, decline_reason, status_callback_url, raw_provider_payload, last_reconciled_at, created_at, updated_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (paymentId) {
      paymentQuery.eq("id", paymentId);
    }

    const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

    if (paymentError) {
      throw new HttpError(500, "database_error", "Failed to load payment details.", paymentError.message);
    }

    const { data: events, error: eventsError } = await admin
      .from("payment_events")
      .select("id, source, provider_status, payment_state, payload_hash, raw_payload, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (eventsError) {
      throw new HttpError(500, "database_error", "Failed to load payment events.", eventsError.message);
    }

    return success({
      order,
      payment,
      events: events ?? [],
    });
  } catch (error) {
    return handleUnhandled(error);
  }
});
