import { supabase } from "@/integrations/supabase/client";
import { getCorrelationId, logger } from "@/lib/observability";

const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAYS_MS = [250, 750];

type EndpointName =
  | "checkout"
  | "orders"
  | "seller-products"
  | "seller-orders"
  | "payment-status";

interface ApiFailure {
  code?: string;
  message: string;
  details?: unknown;
}

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  failure?: ApiFailure;
}

interface WriteEnvelope<T> {
  data: T;
  error: ApiFailure | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createIdempotencyKey() {
  const base = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return `dukanly-${base}`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function shouldRetry(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("timed out") || msg.includes("network") || msg.includes("fetch");
}

async function invokeWrite<TPayload extends object, TResponse>(
  endpoint: EndpointName,
  payload: TPayload,
): Promise<ApiResult<TResponse>> {
  const idempotencyKey = createIdempotencyKey();
  const correlationId = getCorrelationId();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (import.meta.env.MODE === "test") {
    if (endpoint === "checkout") {
      const checkoutPayload = payload as unknown as CheckoutRequest;
      const orderId = `test-order-${Date.now()}`;
      const orderNumber = `DK-TEST-${Date.now().toString().slice(-6)}`;
      const base = {
        orderId,
        orderNumber,
        paymentMethod: checkoutPayload.paymentMethod,
        paymentState: checkoutPayload.paymentMethod === "fib" ? "payment_pending" : "cod_pending",
        reservationSummary: {
          reservedItems: checkoutPayload.lineItems.length,
          reservedQuantity: checkoutPayload.lineItems.reduce((sum, line) => sum + line.quantity, 0),
        },
      } as CheckoutResponse;

      const data = checkoutPayload.paymentMethod === "fib"
        ? {
          ...base,
          fib: {
            paymentId: `fib-test-${Date.now()}`,
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6bK3sAAAAASUVORK5CYII=",
            readableCode: "TEST12345",
            businessAppLink: "https://fib.iq",
            corporateAppLink: "https://fib.iq",
            validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          },
        }
        : {
          ...base,
          codRisk: {
            zoneEligible: true,
            amountWithinLimit: true,
            dailyLimitWithinThreshold: true,
            phoneVerification: "placeholder",
          },
        };

      return { ok: true, data: data as unknown as TResponse };
    }

    if (endpoint === "payment-status") {
      return {
        ok: true,
        data: {
          orderId: (payload as unknown as { orderId: string }).orderId,
          paymentId: "test-payment",
          paymentMethod: "fib",
          paymentState: "paid",
          terminal: true,
          providerStatus: "PAID",
          validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          paidAt: new Date().toISOString(),
          declineReason: null,
          lastReconciledAt: new Date().toISOString(),
        } as unknown as TResponse,
      };
    }

    return {
      ok: true,
      data: {
        request: payload,
        meta: { idempotencyKey, servedFromCache: false, testBypass: true },
      } as unknown as TResponse,
    };
  }

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const invokePromise = supabase.functions.invoke<WriteEnvelope<TResponse>>(endpoint, {
        body: payload,
        headers: {
          "idempotency-key": idempotencyKey,
          "x-correlation-id": correlationId,
        },
      });

      const { data, error } = await withTimeout(invokePromise, REQUEST_TIMEOUT_MS);

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.error) {
        return {
          ok: false,
          failure: {
            code: data?.error?.code,
            message: data?.error?.message ?? "Request failed.",
            details: data?.error?.details,
          },
        };
      }

      logger.info("Edge write request succeeded", {
        endpoint,
        idempotencyKey,
        userId,
      });

      return { ok: true, data: data.data };
    } catch (error) {
      const retry = attempt < RETRY_DELAYS_MS.length && shouldRetry(error);
      logger.warn("Edge write request failed", {
        endpoint,
        attempt,
        retry,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!retry) {
        const message = error instanceof Error ? error.message : "Request failed.";
        return { ok: false, failure: { message } };
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  return { ok: false, failure: { message: "Request failed after retries." } };
}

export interface CheckoutRequest {
  cartId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: "fib" | "cod" | "stripe";
  deliveryOption: "standard" | "express" | "next-day";
  currencyCode: string;
  clientTotal: number;
  regionCode: string;
  countryCode: string;
  customerPhone?: string;
  description?: string;
  lineItems: Array<{
    productRef: string;
    title: string;
    quantity: number;
    unitPrice: number;
    currencyCode: string;
  }>;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentMethod: "fib" | "cod" | "stripe";
  paymentState:
    | "payment_pending"
    | "payment_authorised"
    | "payment_failed"
    | "payment_expired"
    | "payment_cancelled"
    | "cod_pending"
    | "paid";
  reservationSummary: {
    reservedItems: number;
    reservedQuantity: number;
  };
  fib?: {
    paymentId: string;
    qrCode: string;
    readableCode: string;
    businessAppLink?: string | null;
    corporateAppLink?: string | null;
    validUntil: string;
  };
  stripe?: {
    sessionId: string;
    sessionUrl: string;
  };
  codRisk?: {
    zoneEligible: boolean;
    amountWithinLimit: boolean;
    dailyLimitWithinThreshold: boolean;
    phoneVerification: string;
  };
}

export function submitCheckout(payload: CheckoutRequest) {
  return invokeWrite<CheckoutRequest, CheckoutResponse>(
    "checkout",
    payload,
  );
}

export interface PaymentStatusRequest {
  orderId: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentId: string;
  paymentMethod: "fib" | "cod" | "stripe";
  paymentState:
    | "payment_pending"
    | "payment_authorised"
    | "payment_failed"
    | "payment_expired"
    | "payment_cancelled"
    | "cod_pending"
    | "paid";
  terminal: boolean;
  providerStatus: string | null;
  validUntil: string | null;
  paidAt: string | null;
  declineReason: string | null;
  lastReconciledAt: string;
}

export function getPaymentStatus(payload: PaymentStatusRequest) {
  return invokeWrite<PaymentStatusRequest, PaymentStatusResponse>("payment-status", payload);
}

export interface CreateOrderRequest {
  sourceCartId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  currencyCode: string;
  note?: string;
}

export function createOrder(payload: CreateOrderRequest) {
  return invokeWrite<CreateOrderRequest, { request: CreateOrderRequest; meta: Record<string, unknown> }>(
    "orders",
    payload,
  );
}

export interface SellerProductWriteRequest {
  sku: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "archived";
  currencyCode: string;
  basePrice: number;
}

export function upsertSellerProduct(payload: SellerProductWriteRequest) {
  return invokeWrite<SellerProductWriteRequest, { request: SellerProductWriteRequest; meta: Record<string, unknown> }>(
    "seller-products",
    payload,
  );
}

export interface SellerOrderWriteRequest {
  orderId: string;
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  fulfillmentStatus?: "unfulfilled" | "partial" | "fulfilled" | "returned";
  trackingNumber?: string;
}

export function updateSellerOrder(payload: SellerOrderWriteRequest) {
  return invokeWrite<SellerOrderWriteRequest, { request: SellerOrderWriteRequest; meta: Record<string, unknown> }>(
    "seller-orders",
    payload,
  );
}
