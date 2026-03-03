export type PaymentMethod = "fib" | "cod" | "stripe";

export type PaymentState =
  | "payment_pending"
  | "payment_authorised"
  | "payment_failed"
  | "payment_expired"
  | "payment_cancelled"
  | "cod_pending"
  | "paid";

export type PaymentEventSource = "checkout" | "callback" | "poll" | "manual";

export type FibPaymentStatus = "PAID" | "UNPAID" | "DECLINED";

export type FibDeclineReason =
  | "SERVER_FAILURE"
  | "PAYMENT_EXPIRATION"
  | "PAYMENT_CANCELLATION"
  | "UNKNOWN";

export interface FibCreatePaymentResponse {
  paymentId: string;
  qrCode: string;
  readableCode: string;
  businessAppLink?: string;
  corporateAppLink?: string;
  validUntil: string;
}

export interface FibStatusResponse {
  status: FibPaymentStatus;
  validUntil?: string;
  paidAt?: string;
  declineReason?: FibDeclineReason | string;
  [key: string]: unknown;
}

export interface PaymentTransitionResult {
  nextState: PaymentState;
  reason?: string;
}
