import { test, expect } from "@playwright/test";

test("auth pages render without crash", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle(/Sign In|Login/i);
});
