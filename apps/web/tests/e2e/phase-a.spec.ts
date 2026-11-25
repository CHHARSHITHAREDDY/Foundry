import { test, expect } from "@playwright/test";

const API_BASE = process.env.API_URL || "http://localhost:3001";

test.describe("Phase A: Auth, App Shell, Dashboard, Billing", () => {
  test("1. Register -> dev-outbox verify -> login -> dashboard empty state -> ledger has 1 BONUS row -> logout", async ({
    page,
    request,
  }) => {
    const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const email = `phase_a_${uniq}@foundry.test`;
    const password = "StrongPassword123";

    // Register via UI
    await page.goto("/signup");
    await page.fill("#signup-name", "Phase A Tester");
    await page.fill("#signup-email", email);
    await page.fill("#signup-password", password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/verify-email/);
    await expect(page.getByText("Verify your email")).toBeVisible();

    // Fetch dev-outbox verification link
    const outboxRes = await request.get(`${API_BASE}/api/dev/outbox?to=${encodeURIComponent(email)}`);
    expect(outboxRes.ok()).toBeTruthy();
    const outboxJson = await outboxRes.json();
    const verifyEmailRow = outboxJson.emails.find((e: any) => e.type === "VERIFY_EMAIL" && e.link);
    expect(verifyEmailRow).toBeTruthy();

    // Visit verification link in browser
    const verifyUrl = new URL(verifyEmailRow.link);
    await page.goto(`${verifyUrl.pathname}${verifyUrl.search}`);
    await expect(page.getByText("Email verified")).toBeVisible();

    // Login via UI
    await page.goto("/login");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click('button[type="submit"]');

    // Dashboard empty state
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByTestId("dashboard-empty-state")).toBeVisible();
    await expect(page.getByTestId("sidebar-credits-balance")).toHaveText("20");
    await expect(page.getByTestId("stat-visitors")).toHaveText("n/a");

    // Navigate to billing credits ledger -> verify exactly 1 BONUS row
    await page.goto("/billing/credits");
    await expect(page.getByTestId("credit-ledger-table")).toBeVisible();
    const rows = page.getByTestId("ledger-row");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("BONUS");
    await expect(rows.first()).toContainText("+20");

    // Logout via user menu
    await page.getByTestId("user-menu-button").click();
    await page.getByTestId("logout-button").click();
    await page.waitForURL(/\/login/);
  });

  test("2. Lockout after 5 bad passwords", async ({ page, request }) => {
    const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const email = `lockout_${uniq}@foundry.test`;
    const password = "ValidPassword123";

    const regRes = await request.post(`${API_BASE}/api/auth/register`, {
      data: { name: "Lockout User", email, password },
    });
    expect(regRes.status()).toBe(201);

    await page.goto("/login");
    for (let i = 0; i < 5; i++) {
      await page.fill("#login-email", email);
      await page.fill("#login-password", "WrongPassword999");
      await page.click('button[type="submit"]');
      await expect(page.locator('form [role="alert"]')).toBeVisible();
    }

    await expect(page.locator('form [role="alert"]')).toContainText(/Account locked/i);
  });

  test("3. Unauthenticated access to /dashboard redirects to /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL(/\/login\?next=%2Fdashboard/);
    await expect(page.getByText("Sign in to Console")).toBeVisible();
  });

  test("4. Second user cannot read first user's company (404)", async ({ playwright }) => {
    const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const u2Email = `owner2_${uniq}@foundry.test`;
    const pw = "OwnerPass123!";

    // Context 1: login as seeded demo user (who owns a real company in DB)
    const ctx1 = await playwright.request.newContext({ baseURL: API_BASE });
    const login1 = await ctx1.post("/api/auth/login", {
      data: { email: "demo@foundry.studio", password: "DemoPass123!" },
    });
    expect(login1.ok()).toBeTruthy();

    const list1 = await ctx1.get("/api/companies");
    expect(list1.ok()).toBeTruthy();
    const list1Json = await list1.json();
    expect(list1Json.companies.length).toBeGreaterThan(0);
    const owner1CompanyId = list1Json.companies[0].id;
    await ctx1.dispose();

    // Context 2: register and login as second user
    const ctx2 = await playwright.request.newContext({ baseURL: API_BASE });
    const reg2 = await ctx2.post("/api/auth/register", {
      data: { name: "Owner Two", email: u2Email, password: pw },
    });
    expect(reg2.status()).toBe(201);

    const login2 = await ctx2.post("/api/auth/login", {
      data: { email: u2Email, password: pw },
    });
    expect(login2.ok()).toBeTruthy();

    // Attempt to read first user's real company ID as second user -> must return 404
    const foreignRead = await ctx2.get(`/api/companies/${owner1CompanyId}`);
    expect(foreignRead.status()).toBe(404);
    await ctx2.dispose();
  });
});
