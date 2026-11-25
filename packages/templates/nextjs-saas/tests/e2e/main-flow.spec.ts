import { test, expect } from "@playwright/test";

test("main flow navigation renders without crash", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
