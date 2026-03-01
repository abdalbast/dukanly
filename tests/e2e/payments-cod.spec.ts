import { test } from "@playwright/test";

test.describe("COD checkout", () => {
  test.skip(true, "Requires authenticated seeded cart and delivery test data in the target environment.");

  test("places order with cod_pending", async () => {
    // Scenario checklist for launch validation:
    // 1) Sign in as buyer with eligible Kurdistan delivery address.
    // 2) Add in-stock item(s) to cart.
    // 3) Select Cash on Delivery and submit checkout.
    // 4) Assert order confirmation includes payment state cod_pending.
    // 5) Verify support endpoint/logs show COD risk controls evaluation.
  });
});
