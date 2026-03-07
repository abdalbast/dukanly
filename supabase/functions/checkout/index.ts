import { HttpError, parseJson } from "../_shared/http.ts";
import { checkoutSchema } from "../_shared/schemas.ts";
import { handleWrite } from "../_shared/write-handler.ts";
import { getAdminClient } from "../_shared/db.ts";
import { log } from "../_shared/log.ts";
import { createFibPayment } from "../_shared/payments/fib-client.ts";
import { applyPaymentTransition } from "../_shared/payments/reconcile.ts";
import type { PaymentMethod, PaymentState } from "../_shared/payments/types.ts";
import Stripe from "npm:stripe@18.5.0";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function normalizeRegion(value: string): string {
  return value.trim().toUpperCase();
}

function generateOrderNumber() {
  return `DK-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

function getFibEnabledRegions(): Set<string> {
  const raw = Deno.env.get("PAYMENTS_FIB_ENABLED_REGIONS") || "KRD";
  return new Set(raw.split(",").map((value) => normalizeRegion(value)).filter(Boolean));
}

function assertKurdistanCurrency(regionCode: string, currencyCode: string) {
  if (regionCode === "KRD" && currencyCode !== "IQD") {
    throw new HttpError(
      422,
      "invalid_currency",
      "Kurdistan checkout must use IQD for launch payment flows.",
    );
  }
}

async function validateDualCurrencyPricing(itemRefs: string[], currencyCode: string) {
  const uuidRefs = itemRefs.filter((value) => isUuid(value));
  if (uuidRefs.length === 0) {
    return;
  }

  const admin = getAdminClient();

  // Check product_prices table first
  const { data: priceData, error: priceError } = await admin
    .from("product_prices")
    .select("product_id")
    .in("product_id", uuidRefs)
    .eq("currency_code", currencyCode);

  if (priceError) {
    throw new HttpError(500, "database_error", "Failed to validate dual-currency prices.", priceError.message);
  }

  const availableFromPrices = new Set((priceData ?? []).map((row) => String(row.product_id)));
  const stillMissing = uuidRefs.filter((ref) => !availableFromPrices.has(ref));

  if (stillMissing.length === 0) {
    return;
  }

  // Fall back: check if the product's own currency_code matches (base_price is the canonical price)
  const { data: productData, error: productError } = await admin
    .from("products")
    .select("id")
    .in("id", stillMissing)
    .eq("currency_code", currencyCode);

  if (productError) {
    throw new HttpError(500, "database_error", "Failed to validate product base prices.", productError.message);
  }

  const availableFromProducts = new Set((productData ?? []).map((row) => String(row.id)));
  const finalMissing = stillMissing.filter((ref) => !availableFromProducts.has(ref));

  if (finalMissing.length > 0) {
    throw new HttpError(422, "missing_currency_price", "Missing currency price for one or more products.", {
      currencyCode,
      missingProductRefs: finalMissing,
    });
  }
}

async function evaluateCodRisk(input: {
  regionCode: string;
  countryCode: string;
  clientTotal: number;
  customerPhone?: string;
}) {
  const maxAmount = Number(Deno.env.get("COD_MAX_AMOUNT_IQD") || 1500000);
  const maxDailyPerPhone = Number(Deno.env.get("COD_MAX_DAILY_ORDERS_PER_PHONE") || 3);
  const zoneEligible = input.regionCode === "KRD" && input.countryCode === "IQ";
  const amountWithinLimit = input.clientTotal <= maxAmount;
  let dailyLimitWithinThreshold = true;

  if (input.customerPhone) {
    const admin = getAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("payments")
      .select("raw_provider_payload")
      .eq("provider", "cod")
      .gte("created_at", since);

    if (error) {
      throw new HttpError(500, "database_error", "Failed to evaluate COD risk controls.", error.message);
    }

    const countForPhone = (data ?? []).filter((row) => {
      const payload = row.raw_provider_payload as Record<string, unknown> | null;
      return payload?.customerPhone === input.customerPhone;
    }).length;

    dailyLimitWithinThreshold = countForPhone < maxDailyPerPhone;
  }

  if (!zoneEligible) {
    throw new HttpError(422, "cod_zone_not_supported", "Cash on delivery is only enabled in Kurdistan at launch.");
  }

  if (!amountWithinLimit) {
    throw new HttpError(422, "cod_amount_exceeded", "Cash on delivery amount exceeds launch risk threshold.", {
      maxAmount,
    });
  }

  if (!dailyLimitWithinThreshold) {
    throw new HttpError(422, "cod_daily_limit_exceeded", "Cash on delivery daily order limit exceeded for phone.", {
      maxDailyPerPhone,
    });
  }

  return {
    zoneEligible,
    amountWithinLimit,
    dailyLimitWithinThreshold,
    phoneVerification: "placeholder",
  };
}

function mapInitialState(method: PaymentMethod): PaymentState {
  if (method === "fib") return "payment_pending";
  if (method === "stripe") return "payment_pending";
  return "cod_pending";
}

Deno.serve((req) =>
  handleWrite(req, "checkout", async ({ auth, idempotencyKey, correlationId }) => {
    const payload = await parseJson(req, checkoutSchema);

    const regionCode = normalizeRegion(payload.regionCode);
    const countryCode = payload.countryCode.toUpperCase();
    const paymentMethod = payload.paymentMethod as PaymentMethod;

    assertKurdistanCurrency(regionCode, payload.currencyCode);
    await validateDualCurrencyPricing(
      payload.lineItems.map((item) => item.productRef),
      payload.currencyCode,
    );

    const serverItemTotal = payload.lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (payload.clientTotal + 0.01 < serverItemTotal) {
      throw new HttpError(422, "invalid_client_total", "Client total is less than computed line-item total.", {
        serverItemTotal,
        clientTotal: payload.clientTotal,
      });
    }

    const fibEnabledRegions = getFibEnabledRegions();
    if (paymentMethod === "fib" && !fibEnabledRegions.has(regionCode)) {
      throw new HttpError(422, "fib_not_enabled", "FIB is not enabled for this region.", {
        regionCode,
      });
    }

    const codRisk = paymentMethod === "cod"
      ? await evaluateCodRisk({
        regionCode,
        countryCode,
        clientTotal: payload.clientTotal,
        customerPhone: payload.customerPhone,
      })
      : null;

    const admin = getAdminClient();
    const orderNumber = generateOrderNumber();
    const initialState = mapInitialState(paymentMethod);

    const { data: orderData, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: auth.userId,
        status: "pending",
        payment_status: paymentMethod === "cod" ? "pending" : "pending",
        fulfillment_status: "unfulfilled",
        currency_code: payload.currencyCode,
        subtotal_amount: serverItemTotal,
        shipping_amount: 0,
        tax_amount: 0,
        total_amount: payload.clientTotal,
        source_cart_id: isUuid(payload.cartId) ? payload.cartId : null,
        shipping_address_id: isUuid(payload.shippingAddressId) ? payload.shippingAddressId : null,
        billing_address_id: payload.billingAddressId && isUuid(payload.billingAddressId) ? payload.billingAddressId : null,
        payment_method: paymentMethod,
        payment_state: initialState,
        payment_state_reason: null,
        region_code: regionCode,
      })
      .select("id, order_number, payment_state")
      .single();

    if (orderError || !orderData) {
      throw new HttpError(500, "database_error", "Failed to create order.", orderError?.message);
    }

    const idemKey = `${auth.userId}:${idempotencyKey}:${paymentMethod}`;

    // Check if payment already exists for this idempotency key (retry-safe)
    const { data: existingPayment } = await admin
      .from("payments")
      .select("id")
      .eq("idempotency_key", idemKey)
      .maybeSingle();

    let paymentData: { id: string };

    if (existingPayment) {
      paymentData = existingPayment;
      log("info", "checkout.payment_reused", { correlationId, paymentId: existingPayment.id, idemKey });
    } else {
      const { data: newPayment, error: paymentError } = await admin
        .from("payments")
        .insert({
          order_id: orderData.id,
          provider: paymentMethod,
          amount: payload.clientTotal,
          currency_code: payload.currencyCode,
          status: "initiated",
          idempotency_key: idemKey,
          raw_provider_payload: {
            customerPhone: payload.customerPhone ?? null,
            regionCode,
            countryCode,
          },
        })
        .select("id")
        .single();

      if (paymentError || !newPayment) {
        throw new HttpError(500, "database_error", "Failed to create payment row.", paymentError?.message);
      }
      paymentData = newPayment;
    }

    const reservationRows = payload.lineItems.map((item) => ({
      order_id: orderData.id,
      product_id: isUuid(item.productRef) ? item.productRef : null,
      product_ref: item.productRef,
      quantity: item.quantity,
      state: "reserved",
    }));

    const { error: reservationError } = await admin
      .from("inventory_reservations")
      .insert(reservationRows);

    if (reservationError) {
      throw new HttpError(500, "database_error", "Failed to reserve inventory.", reservationError.message);
    }

    const baseResponse = {
      orderId: orderData.id,
      orderNumber: orderData.order_number,
      paymentMethod,
      paymentState: initialState,
      reservationSummary: {
        reservedItems: reservationRows.length,
        reservedQuantity: reservationRows.reduce((sum, row) => sum + row.quantity, 0),
      },
    };

    if (paymentMethod === "cod") {
      await applyPaymentTransition({
        paymentId: paymentData.id,
        currentOrderState: initialState,
        nextState: "cod_pending",
        source: "checkout",
        providerStatus: "COD_PENDING",
        rawPayload: {
          codRisk,
          customerPhone: payload.customerPhone ?? null,
        },
      });

      log("info", "checkout.cod_created", {
        correlationId,
        userId: auth.userId,
        orderId: orderData.id,
        paymentId: paymentData.id,
        paymentState: "cod_pending",
      });

      return {
        action: "checkout.submit",
        accepted: true,
        userId: auth.userId,
        requestId: `${auth.userId}:${idempotencyKey}`,
        ...baseResponse,
        codRisk,
      };
    }

    // ── Stripe payment flow ──
    if (paymentMethod === "stripe") {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        throw new HttpError(500, "config_error", "Stripe secret key is not configured.");
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      // Stripe does not support IQD — convert to USD for Stripe checkout
      const stripeCurrency = "usd";
      const exchangeRate = Number(Deno.env.get("IQD_TO_USD_RATE") || "0.000769"); // ~1/1300

      const origin = req.headers.get("origin") || "https://dukanly.lovable.app";
      log("info", "checkout.stripe_creating_session", {
        correlationId,
        origin,
        lineItemCount: payload.lineItems.length,
        originalCurrency: payload.currencyCode,
        stripeCurrency,
      });

      let session;
      try {
        session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: payload.lineItems.map((item) => ({
            price_data: {
              currency: stripeCurrency,
              product_data: { name: item.title },
              // Convert IQD unit price to USD cents
              unit_amount: payload.currencyCode === "IQD"
                ? Math.max(50, Math.round(item.unitPrice * exchangeRate * 100))
                : Math.round(item.unitPrice * 100),
            },
            quantity: item.quantity,
          })),
          metadata: {
            order_id: orderData.id,
            payment_id: paymentData.id,
            original_currency: payload.currencyCode,
            original_total: String(payload.clientTotal),
          },
          success_url: `${origin}/order-confirmation?order_id=${orderData.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout?cancelled=true`,
        });
      } catch (stripeErr: unknown) {
        const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
        log("error", "checkout.stripe_session_error", { correlationId, error: msg });
        throw new HttpError(502, "stripe_error", "Failed to create Stripe checkout session.", msg);
      }

      const { error: stripeUpdateError } = await admin
        .from("payments")
        .update({
          provider_payment_id: session.id,
          provider_status: "open",
          raw_provider_payload: {
            sessionId: session.id,
            sessionUrl: session.url,
          },
        })
        .eq("id", paymentData.id);

      if (stripeUpdateError) {
        throw new HttpError(500, "database_error", "Failed to persist Stripe session.", stripeUpdateError.message);
      }

      await applyPaymentTransition({
        paymentId: paymentData.id,
        currentOrderState: initialState,
        nextState: "payment_pending",
        source: "checkout",
        providerStatus: "open",
        rawPayload: { sessionId: session.id },
      });

      log("info", "checkout.stripe_created", {
        correlationId,
        userId: auth.userId,
        orderId: orderData.id,
        paymentId: paymentData.id,
        stripeSessionId: session.id,
        paymentState: "payment_pending",
      });

      return {
        action: "checkout.submit",
        accepted: true,
        userId: auth.userId,
        requestId: `${auth.userId}:${idempotencyKey}`,
        ...baseResponse,
        stripe: {
          sessionId: session.id,
          sessionUrl: session.url,
        },
      };
    }

    // ── FIB payment flow ──
    const callbackBase = Deno.env.get("FIB_CALLBACK_PUBLIC_URL");
    if (!callbackBase || !callbackBase.startsWith("https://")) {
      throw new HttpError(500, "config_error", "FIB callback URL is missing or not HTTPS.");
    }

    const fibPayment = await createFibPayment({
      amount: Math.round(payload.clientTotal),
      currency: "IQD",
      statusCallbackUrl: callbackBase,
      description: payload.description,
    });

    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        provider_payment_id: fibPayment.paymentId,
        provider_status: "UNPAID",
        valid_until: fibPayment.validUntil,
        status_callback_url: callbackBase,
        raw_provider_payload: {
          paymentId: fibPayment.paymentId,
          readableCode: fibPayment.readableCode,
          businessAppLink: fibPayment.businessAppLink ?? null,
          corporateAppLink: fibPayment.corporateAppLink ?? null,
          qrCode: fibPayment.qrCode,
          validUntil: fibPayment.validUntil,
        },
      })
      .eq("id", paymentData.id);

    if (paymentUpdateError) {
      throw new HttpError(
        500,
        "database_error",
        "Failed to persist FIB payment mapping.",
        paymentUpdateError.message,
      );
    }

    await applyPaymentTransition({
      paymentId: paymentData.id,
      currentOrderState: initialState,
      nextState: "payment_pending",
      source: "checkout",
      providerStatus: "UNPAID",
      validUntil: fibPayment.validUntil,
      rawPayload: {
        paymentId: fibPayment.paymentId,
      },
    });

    log("info", "checkout.fib_created", {
      correlationId,
      userId: auth.userId,
      orderId: orderData.id,
      paymentId: paymentData.id,
      providerPaymentId: fibPayment.paymentId,
      paymentState: "payment_pending",
      validUntil: fibPayment.validUntil,
    });

    return {
      action: "checkout.submit",
      accepted: true,
      userId: auth.userId,
      requestId: `${auth.userId}:${idempotencyKey}`,
      ...baseResponse,
      fib: {
        paymentId: fibPayment.paymentId,
        qrCode: fibPayment.qrCode,
        readableCode: fibPayment.readableCode,
        businessAppLink: fibPayment.businessAppLink ?? null,
        corporateAppLink: fibPayment.corporateAppLink ?? null,
        validUntil: fibPayment.validUntil,
      },
    };
  }),
);
