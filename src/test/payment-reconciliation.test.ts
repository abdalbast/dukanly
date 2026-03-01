import { describe, expect, it } from "vitest";
import { assertNonRegressiveTransition, isTerminalPaymentState } from "../../supabase/functions/_shared/payments/state-machine";

describe("payment reconciliation guards", () => {
  it("treats paid as terminal", () => {
    expect(isTerminalPaymentState("paid")).toBe(true);
  });

  it("treats payment_failed as terminal", () => {
    expect(isTerminalPaymentState("payment_failed")).toBe(true);
  });

  it("does not regress terminal states", () => {
    expect(assertNonRegressiveTransition("paid", "payment_pending")).toBe("paid");
    expect(assertNonRegressiveTransition("payment_cancelled", "payment_pending")).toBe("payment_cancelled");
  });

  it("allows transition when current state is non-terminal", () => {
    expect(assertNonRegressiveTransition("payment_pending", "paid")).toBe("paid");
  });
});
