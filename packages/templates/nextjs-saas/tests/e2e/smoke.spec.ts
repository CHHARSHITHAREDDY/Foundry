import { test, expect } from "@playwright/test";

test("smoke test loads health check", async ({ page }) => {
  const res = await page.request.get("/api/health");
  expect(res.ok()).toBeTruthy();
});
