import { describe, expect, it } from "vitest";
import { mapFibStatusToState } from "../../supabase/functions/_shared/payments/state-machine";

describe("payment state machine", () => {
  it("maps PAID to paid", () => {
    expect(mapFibStatusToState({ status: "PAID" }).nextState).toBe("paid");
  });

  it("maps UNPAID before expiry to payment_pending", () => {
    const validUntil = new Date(Date.now() + 60_000).toISOString();
    expect(mapFibStatusToState({ status: "UNPAID", validUntil }).nextState).toBe("payment_pending");
  });

  it("maps UNPAID after expiry to payment_expired", () => {
    const validUntil = new Date(Date.now() - 60_000).toISOString();
    const mapped = mapFibStatusToState({ status: "UNPAID", validUntil });
    expect(mapped.nextState).toBe("payment_expired");
    expect(mapped.reason).toBe("PAYMENT_EXPIRATION");
  });

  it("maps DECLINED with cancellation reason to payment_cancelled", () => {
    const mapped = mapFibStatusToState({ status: "DECLINED", declineReason: "PAYMENT_CANCELLATION" });
    expect(mapped.nextState).toBe("payment_cancelled");
  });

  it("maps DECLINED with unknown reason to payment_failed", () => {
    const mapped = mapFibStatusToState({ status: "DECLINED", declineReason: "RANDOM_REASON" });
    expect(mapped.nextState).toBe("payment_failed");
    expect(mapped.reason).toBe("UNKNOWN");
  });
});
