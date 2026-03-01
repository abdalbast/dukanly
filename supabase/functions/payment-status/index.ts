import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { handleUnhandled, HttpError, parseJson, success } from "../_shared/http.ts";
import { requireAuth } from "../_shared/auth.ts";
import { paymentStatusSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/db.ts";
import { getFibPaymentStatus } from "../_shared/payments/fib-client.ts";
import { getOrderPaymentState, getPaymentForOrder, reconcileFromFibStatus } from "../_shared/payments/reconcile.ts";
import { isTerminalPaymentState } from "../_shared/payments/state-machine.ts";
import { getCorrelationId, log } from "../_shared/log.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, content-type, x-forwarded-for, x-correlation-id",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
      });
    }

    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Only POST is supported.");
    }

    enforceRateLimit(req, "payment-status", { maxRequests: 90, windowMs: 60_000 });
    const auth = await requireAuth(req);
    const correlationId = getCorrelationId(req);
    const payload = await parseJson(req, paymentStatusSchema);

    const admin = getAdminClient();
    const { data: orderOwnership, error: orderOwnershipError } = await admin
      .from("orders")
      .select("id, user_id")
      .eq("id", payload.orderId)
      .single();

    if (orderOwnershipError || !orderOwnership) {
      throw new HttpError(404, "order_not_found", "Order not found.");
    }

    if (orderOwnership.user_id && orderOwnership.user_id !== auth.userId && auth.role !== "admin") {
      throw new HttpError(403, "forbidden", "You do not have access to this order.");
    }

    const payment = await getPaymentForOrder(payload.orderId);
    if (!payment) {
      throw new HttpError(404, "payment_not_found", "Payment not found for this order.");
    }

    let orderState = await getOrderPaymentState(payload.orderId);

    if (
      payment.provider === "fib" &&
      payment.provider_payment_id &&
      !isTerminalPaymentState(orderState.payment_state)
    ) {
      const providerStatus = await getFibPaymentStatus(payment.provider_payment_id);

      const reconciled = await reconcileFromFibStatus({
        providerPaymentId: payment.provider_payment_id,
        source: "poll",
        providerStatus: providerStatus.status,
        validUntil: providerStatus.validUntil,
        paidAt: providerStatus.paidAt,
        declineReason: typeof providerStatus.declineReason === "string" ? providerStatus.declineReason : undefined,
        rawPayload: providerStatus as Record<string, unknown>,
      });

      orderState = await getOrderPaymentState(payload.orderId);

      log("info", "payment.poll.reconciled", {
        correlationId,
        userId: auth.userId,
        orderId: payload.orderId,
        paymentId: payment.id,
        providerPaymentId: payment.provider_payment_id,
        changed: reconciled.changed,
        terminal: reconciled.terminal,
        paymentState: orderState.payment_state,
      });
    }

    const latestPayment = await getPaymentForOrder(payload.orderId);

    return success({
      orderId: payload.orderId,
      paymentId: latestPayment?.id ?? payment.id,
      paymentMethod: orderState.payment_method,
      paymentState: orderState.payment_state,
      terminal: isTerminalPaymentState(orderState.payment_state),
      providerStatus: latestPayment?.provider_status ?? payment.provider_status,
      validUntil: latestPayment?.valid_until ?? payment.valid_until,
      paidAt: latestPayment?.paid_at ?? payment.paid_at,
      declineReason: latestPayment?.decline_reason ?? payment.decline_reason,
      lastReconciledAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleUnhandled(error);
  }
});
