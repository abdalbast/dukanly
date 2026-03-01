import { getAdminClient } from "../db.ts";
import { HttpError } from "../http.ts";
import type { PaymentEventSource, PaymentState } from "./types.ts";
import { assertNonRegressiveTransition, mapFibStatusToState } from "./state-machine.ts";

interface DbPaymentRow {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  provider_status: string | null;
  valid_until: string | null;
  paid_at: string | null;
  decline_reason: string | null;
}

interface DbOrderRow {
  id: string;
  payment_state: PaymentState;
  payment_method: string;
}

interface ApplyTransitionResult {
  order_id: string;
  payment_state: PaymentState;
  changed: boolean;
  terminal: boolean;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getPaymentByProviderPaymentId(providerPaymentId: string): Promise<DbPaymentRow> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("payments")
    .select("id, order_id, provider, provider_payment_id, provider_status, valid_until, paid_at, decline_reason")
    .eq("provider", "fib")
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "database_error", "Failed to fetch payment mapping.", error.message);
  }

  if (!data) {
    throw new HttpError(404, "payment_not_found", "Payment mapping was not found.");
  }

  return data as DbPaymentRow;
}

export async function getPaymentForOrder(orderId: string): Promise<DbPaymentRow | null> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("payments")
    .select("id, order_id, provider, provider_payment_id, provider_status, valid_until, paid_at, decline_reason")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "database_error", "Failed to fetch payment for order.", error.message);
  }

  return (data as DbPaymentRow | null) ?? null;
}

export async function getOrderPaymentState(orderId: string): Promise<DbOrderRow> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("id, payment_state, payment_method")
    .eq("id", orderId)
    .single();

  if (error) {
    throw new HttpError(500, "database_error", "Failed to fetch order payment state.", error.message);
  }

  if (!data) {
    throw new HttpError(404, "order_not_found", "Order not found.");
  }

  return data as DbOrderRow;
}

export async function applyPaymentTransition(input: {
  paymentId: string;
  currentOrderState: PaymentState;
  nextState: PaymentState;
  source: PaymentEventSource;
  providerStatus?: string;
  declineReason?: string;
  validUntil?: string;
  paidAt?: string;
  rawPayload?: Record<string, unknown>;
}): Promise<ApplyTransitionResult> {
  const admin = getAdminClient();
  const effectiveState = assertNonRegressiveTransition(input.currentOrderState, input.nextState);
  const payload = input.rawPayload ?? {};
  const payloadHash = await sha256Hex(
    JSON.stringify({
      paymentId: input.paymentId,
      source: input.source,
      providerStatus: input.providerStatus,
      nextState: effectiveState,
      declineReason: input.declineReason,
      validUntil: input.validUntil,
      paidAt: input.paidAt,
      payload,
    }),
  );

  const { data, error } = await admin.rpc("apply_payment_transition", {
    p_payment_id: input.paymentId,
    p_next_payment_state: effectiveState,
    p_source: input.source,
    p_provider_status: input.providerStatus ?? null,
    p_decline_reason: input.declineReason ?? null,
    p_valid_until: input.validUntil ?? null,
    p_paid_at: input.paidAt ?? null,
    p_raw_payload: payload,
    p_payload_hash: payloadHash,
  });

  if (error) {
    throw new HttpError(500, "database_error", "Failed to apply payment transition.", error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new HttpError(500, "database_error", "Payment transition did not return a result.");
  }

  return {
    order_id: row.order_id,
    payment_state: row.payment_state,
    changed: Boolean(row.changed),
    terminal: Boolean(row.terminal),
  } as ApplyTransitionResult;
}

export async function reconcileFromFibStatus(input: {
  providerPaymentId: string;
  source: PaymentEventSource;
  providerStatus: "PAID" | "UNPAID" | "DECLINED";
  validUntil?: string;
  paidAt?: string;
  declineReason?: string;
  rawPayload?: Record<string, unknown>;
}): Promise<ApplyTransitionResult> {
  const payment = await getPaymentByProviderPaymentId(input.providerPaymentId);
  const order = await getOrderPaymentState(payment.order_id);

  const mapped = mapFibStatusToState({
    status: input.providerStatus,
    validUntil: input.validUntil,
    paidAt: input.paidAt,
    declineReason: input.declineReason,
  });

  return applyPaymentTransition({
    paymentId: payment.id,
    currentOrderState: order.payment_state,
    nextState: mapped.nextState,
    source: input.source,
    providerStatus: input.providerStatus,
    declineReason: mapped.reason ?? input.declineReason,
    validUntil: input.validUntil,
    paidAt: input.paidAt,
    rawPayload: input.rawPayload,
  });
}
