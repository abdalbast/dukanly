import type { FibDeclineReason, FibPaymentStatus, PaymentState, PaymentTransitionResult } from "./types.ts";

export const TERMINAL_PAYMENT_STATES = new Set<PaymentState>([
  "paid",
  "payment_failed",
  "payment_expired",
  "payment_cancelled",
]);

export function isTerminalPaymentState(state: PaymentState): boolean {
  return TERMINAL_PAYMENT_STATES.has(state);
}

function resolveDeclineReason(reason?: string): FibDeclineReason {
  if (!reason) return "UNKNOWN";

  if (reason === "SERVER_FAILURE") return "SERVER_FAILURE";
  if (reason === "PAYMENT_EXPIRATION") return "PAYMENT_EXPIRATION";
  if (reason === "PAYMENT_CANCELLATION") return "PAYMENT_CANCELLATION";
  return "UNKNOWN";
}

function isExpired(validUntil?: string, nowIso?: string): boolean {
  if (!validUntil) return false;

  const validUntilMs = Date.parse(validUntil);
  if (Number.isNaN(validUntilMs)) return false;

  const nowMs = nowIso ? Date.parse(nowIso) : Date.now();
  if (Number.isNaN(nowMs)) return false;

  return nowMs >= validUntilMs;
}

export function mapFibStatusToState(input: {
  status: FibPaymentStatus;
  validUntil?: string;
  paidAt?: string;
  declineReason?: string;
  nowIso?: string;
}): PaymentTransitionResult {
  if (input.status === "PAID") {
    return {
      nextState: "paid",
    };
  }

  if (input.status === "UNPAID") {
    if (isExpired(input.validUntil, input.nowIso)) {
      return {
        nextState: "payment_expired",
        reason: "PAYMENT_EXPIRATION",
      };
    }

    return {
      nextState: "payment_pending",
    };
  }

  const reason = resolveDeclineReason(input.declineReason);

  if (reason === "PAYMENT_CANCELLATION") {
    return {
      nextState: "payment_cancelled",
      reason,
    };
  }

  if (reason === "PAYMENT_EXPIRATION") {
    return {
      nextState: "payment_expired",
      reason,
    };
  }

  return {
    nextState: "payment_failed",
    reason,
  };
}

export type StripeSessionStatus = "complete" | "open" | "expired";

export function mapStripeStatusToState(input: {
  sessionStatus: StripeSessionStatus;
  paymentStatus?: string;
}): PaymentTransitionResult {
  if (input.sessionStatus === "complete" && input.paymentStatus === "paid") {
    return { nextState: "paid" };
  }

  if (input.sessionStatus === "expired") {
    return { nextState: "payment_expired", reason: "STRIPE_SESSION_EXPIRED" };
  }

  if (input.sessionStatus === "open") {
    return { nextState: "payment_pending" };
  }

  return { nextState: "payment_failed", reason: "STRIPE_UNKNOWN_STATUS" };
}

export function assertNonRegressiveTransition(current: PaymentState, next: PaymentState): PaymentState {
  if (isTerminalPaymentState(current)) {
    return current;
  }

  return next;
}
