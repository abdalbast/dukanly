export type PaymentMethod = "fib" | "cod" | "stripe";

export type PaymentState =
  | "payment_pending"
  | "payment_authorised"
  | "payment_failed"
  | "payment_expired"
  | "payment_cancelled"
  | "cod_pending"
  | "paid";

export interface CodRiskResult {
  zoneEligible: boolean;
  amountWithinLimit: boolean;
  dailyLimitWithinThreshold: boolean;
  phoneVerification: string;
}

export interface FibPaymentSession {
  paymentId: string;
  qrCode: string;
  readableCode: string;
  businessAppLink?: string | null;
  corporateAppLink?: string | null;
  validUntil: string;
}

export interface CheckoutPaymentResponse {
  orderId: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentState: PaymentState;
  reservationSummary: {
    reservedItems: number;
    reservedQuantity: number;
  };
  fib?: FibPaymentSession;
  codRisk?: CodRiskResult;
}

export interface PaymentStatusSnapshot {
  orderId: string;
  paymentId: string;
  paymentMethod: PaymentMethod;
  paymentState: PaymentState;
  terminal: boolean;
  providerStatus: string | null;
  validUntil: string | null;
  paidAt: string | null;
  declineReason: string | null;
  lastReconciledAt: string;
}
