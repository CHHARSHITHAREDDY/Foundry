import { test, expect } from "@playwright/test";

const API_BASE = process.env.API_URL || "http://localhost:3001";

async function registerVerifyAndLogin(page: any, request: any, prefix: string) {
  const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const email = `${prefix}_${uniq}@foundry.test`;
  const password = "StrongPassword123";

  await page.goto("/signup");
  await page.fill("#signup-name", "Phase B Tester");
  await page.fill("#signup-email", email);
  await page.fill("#signup-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/verify-email/);

  const outboxRes = await request.get(`${API_BASE}/api/dev/outbox?to=${encodeURIComponent(email)}`);
  expect(outboxRes.ok()).toBeTruthy();
  const outboxJson = await outboxRes.json();
  const verifyEmailRow = outboxJson.emails.find((e: any) => e.type === "VERIFY_EMAIL" && e.link);
  expect(verifyEmailRow).toBeTruthy();

  const verifyUrl = new URL(verifyEmailRow.link);
  await page.goto(`${verifyUrl.pathname}${verifyUrl.search}`);
  await expect(page.getByText("Email verified")).toBeVisible();

  await page.goto("/login");
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);

  return { email, password };
}

test.describe("Phase B: Idea Engine & Idea Screens", () => {
  test("1. Signup -> verify -> login -> Surprise Me -> Idea Card w/ evidence -> Another Idea -> Approve insufficient credits -> Billing path", async ({
    page,
    request,
  }) => {
    test.setTimeout(180000);
    await registerVerifyAndLogin(page, request, "phase_b_surprise");

    // Navigate to /new and verify both options
    await page.goto("/new");
    await expect(page.getByText("Start a New Company")).toBeVisible();
    await expect(page.getByText("Surprise Me")).toBeVisible();
    await expect(page.getByText("Build My Own Idea")).toBeVisible();

    // Start Surprise Me scouting
    await page.click('a[href="/new/surprise"]');
    await page.waitForURL(/\/new\/surprise/);

    // Wait for candidates or automatic redirect or button
    const viewIdeaLink = page.locator('a[href^="/ideas/"]').first();
    await expect(viewIdeaLink).toBeVisible({ timeout: 120000 });
    const firstIdeaHref = await viewIdeaLink.getAttribute("href");
    expect(firstIdeaHref).toBeTruthy();
    await viewIdeaLink.click();

    await page.waitForURL(/\/ideas\/.+/);
    const firstUrl = page.url();

    // Verify Idea Card renders scorecard and evidence links
    await expect(page.getByText("VALIDATION SCORECARD")).toBeVisible();
    await expect(page.getByText("LIVE EVIDENCE CITATIONS")).toBeVisible();

    const evidenceLink = page.locator('a[target="_blank"]').first();
    await expect(evidenceLink).toBeVisible();
    const href = await evidenceLink.getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);

    // Click Another Idea -> lands on a different idea URL
    await page.getByRole("button", { name: "Another Idea" }).click();
    await page.waitForFunction((prev) => window.location.href !== prev && /\/ideas\//.test(window.location.href), firstUrl, {
      timeout: 60000,
    });
    expect(page.url()).not.toEqual(firstUrl);

    // Approve & Build with insufficient credits (initial 20 - 5 scout = 15 < 25 build cost) -> Billing path
    await page.getByRole("button", { name: /Approve & Build/i }).click();
    await expect(page.getByText(/Insufficient credits/i)).toBeVisible();
    await expect(page.locator('a[href="/billing"]')).toBeVisible();
  });

  test("2. Custom Idea Wizard -> Clarification/Validation -> Idea Card -> Tweak & Rescore", async ({
    page,
    request,
  }) => {
    test.setTimeout(120000);
    await registerVerifyAndLogin(page, request, "phase_b_custom");

    await page.goto("/new/idea");
    await page.fill(
      "textarea",
      "An automated freight invoice reconciliation tool for mid-market 3PL warehouses that flags duplicate detention fees from carrier PDFs."
    );
    await page.click('button[type="submit"]');

    // Wait for either clarifying questions or direct redirect to /ideas/:id
    await page.waitForFunction(
      () => /\/ideas\//.test(window.location.pathname) || document.body.innerText.includes("Clarify"),
      { timeout: 60000 }
    );

    if (!/\/ideas\//.test(page.url())) {
      const inputs = page.locator('input[type="text"], textarea');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        await inputs.nth(i).fill("Mid-market 3PL operations teams processing 500+ carrier invoices weekly.");
      }
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/ideas\/.+/, { timeout: 60000 });
    }

    await expect(page.getByText("VALIDATION SCORECARD")).toBeVisible();

    // Open Tweak & Rescore modal
    await page.getByRole("button", { name: /Tweak & Rescore/i }).click();
    await expect(page.getByText("Tweak & Rescore Idea")).toBeVisible();
    await page.getByRole("button", { name: /Save & Rescore/i }).click();
    await expect(page.getByText(/RESCORE COMPLETE/i)).toBeVisible({ timeout: 60000 });
  });
});
