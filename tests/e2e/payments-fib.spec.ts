import { test } from "@playwright/test";

test.describe("FIB checkout", () => {
  test.skip(true, "Requires FIB sandbox credentials, callback URL reachability, and authenticated test accounts.");

  test("creates payment session and reconciles paid callback", async () => {
    // Scenario checklist for launch validation:
    // 1) Sign in as buyer with eligible Kurdistan delivery address.
    // 2) Add IQD-priced item(s) to cart.
    // 3) Select Pay with FIB and submit checkout.
    // 4) Assert payment page displays app links, QR image, readable code, and countdown.
    // 5) Complete payment in FIB sandbox.
    // 6) Verify callback/poll updates order to paid and confirmation view is shown.
  });
});
