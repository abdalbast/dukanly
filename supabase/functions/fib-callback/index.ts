import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { fibCallbackSchema } from "../_shared/schemas.ts";
import { getFibPaymentStatus } from "../_shared/payments/fib-client.ts";
import { getPaymentByProviderPaymentId, reconcileFromFibStatus } from "../_shared/payments/reconcile.ts";
import { getCorrelationId, log } from "../_shared/log.ts";
import { handleUnhandled, HttpError, parseJson, success } from "../_shared/http.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type, x-forwarded-for, x-correlation-id",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
      });
    }

    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Only POST is supported.");
    }

    enforceRateLimit(req, "fib-callback", { maxRequests: 120, windowMs: 60_000 });
    const correlationId = getCorrelationId(req);
    const payload = await parseJson(req, fibCallbackSchema);

    let paymentExists = true;

    try {
      await getPaymentByProviderPaymentId(payload.id);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        paymentExists = false;
      } else {
        throw error;
      }
    }

    if (!paymentExists) {
      log("warn", "fib.callback.unknown_payment", {
        correlationId,
        providerPaymentId: payload.id,
        providerStatus: payload.status,
      });

      return success(
        {
          accepted: true,
          ignored: true,
        },
        202,
      );
    }

    const canonical = await getFibPaymentStatus(payload.id);
    const reconciled = await reconcileFromFibStatus({
      providerPaymentId: payload.id,
      source: "callback",
      providerStatus: canonical.status,
      validUntil: canonical.validUntil,
      paidAt: canonical.paidAt,
      declineReason: typeof canonical.declineReason === "string" ? canonical.declineReason : undefined,
      rawPayload: {
        callback: payload,
        canonical,
      },
    });

    log("info", "fib.callback.reconciled", {
      correlationId,
      providerPaymentId: payload.id,
      providerStatus: canonical.status,
      orderId: reconciled.order_id,
      paymentState: reconciled.payment_state,
      changed: reconciled.changed,
      terminal: reconciled.terminal,
    });

    return success(
      {
        accepted: true,
        orderId: reconciled.order_id,
        paymentState: reconciled.payment_state,
      },
      202,
    );
  } catch (error) {
    return handleUnhandled(error);
  }
});
