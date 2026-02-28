import { expect, test } from "@playwright/test";

test("home page smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^dukanly$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /cart/i })).toBeVisible();
});

test("auth routes smoke", async ({ page }) => {
  await page.goto("/auth/signin");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/auth/forgot-password");
  await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
});

test("protected seller area redirects unauthenticated users", async ({ page }) => {
  await page.goto("/seller");
  await expect(page).toHaveURL(/\/auth\/signin/);
});
