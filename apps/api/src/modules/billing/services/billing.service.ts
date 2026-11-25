import crypto from "crypto";
import { prismaDatabase } from "../../../db/prisma.service.js";

export class BillingError extends Error {
  statusCode: number;
  code: string;
  constructor(message: string, statusCode = 400, code = "BILLING_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const DEFAULT_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthlyCents: 4900,
    credits: 50,
    maxActiveVentures: 2,
    features: [
      "50 Build Credits / Mo",
      "2 Active Ventures",
      "Live Market Reconnaissance",
      "PostgreSQL Venture Persistence",
    ],
    sortOrder: 1,
  },
  {
    id: "founder",
    name: "Founder",
    priceMonthlyCents: 14900,
    credits: 250,
    maxActiveVentures: 10,
    features: [
      "250 Build Credits / Mo",
      "10 Active Ventures",
      "Full Autonomous Repair Loop",
      "Priority Build Queue",
    ],
    sortOrder: 2,
  },
  {
    id: "syndicate",
    name: "Syndicate",
    priceMonthlyCents: 49900,
    credits: 1000,
    maxActiveVentures: 50,
    features: [
      "1,000 Build Credits / Mo",
      "50 Active Ventures",
      "Isolated Container Sandbox Gates",
      "Dedicated Studio Telemetry",
    ],
    sortOrder: 3,
  },
];

const DEFAULT_PRICING = [
  {
    action: "SURPRISE_SCOUT",
    label: "Surprise Me Reconnaissance",
    credits: 5,
    description: "Live multi-source scraping, citation verification, and 3-pass idea critique.",
  },
  {
    action: "IDEA_VALIDATE",
    label: "Custom Idea Validation",
    credits: 3,
    description: "Clarifying interview, competitor pricing fetch, and evidence scorecard.",
  },
  {
    action: "BUILD_VENTURE",
    label: "Full Autonomous Build Swarm",
    credits: 25,
    description: "Architect, UI, Backend, Content, Integrator, QA, and Security Review stages.",
  },
  {
    action: "TASK_RUN",
    label: "Feature Iteration Task",
    credits: 10,
    description: "Incremental code modification, typecheck, and regression verification.",
  },
];

export class BillingService {
  private seeded = false;

  async ensureConfigSeeded() {
    if (this.seeded) return;
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return;

    const planCount = await prisma.billingPlan.count();
    if (planCount === 0) {
      for (const p of DEFAULT_PLANS) {
        await prisma.billingPlan.upsert({
          where: { id: p.id },
          create: p,
          update: p,
        });
      }
    }

    const pricingCount = await prisma.pricingConfig.count();
    if (pricingCount === 0) {
      for (const pr of DEFAULT_PRICING) {
        await prisma.pricingConfig.upsert({
          where: { action: pr.action },
          create: pr,
          update: pr,
        });
      }
    }

    this.seeded = true;
  }

  getProviderMode(): { providerConfigured: boolean; mode: "TEST" | "LIVE" | "UNCONFIGURED" } {
    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!key) return { providerConfigured: false, mode: "UNCONFIGURED" };
    if (key.startsWith("sk_live_")) return { providerConfigured: true, mode: "LIVE" };
    return { providerConfigured: true, mode: "TEST" };
  }

  async getPlans() {
    await this.ensureConfigSeeded();
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const plans = await prisma.billingPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    const provider = this.getProviderMode();
    return {
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        priceMonthlyCents: p.priceMonthlyCents,
        credits: p.credits,
        maxActiveVentures: p.maxActiveVentures,
        features: p.features,
      })),
      ...provider,
    };
  }

  async getPricing() {
    await this.ensureConfigSeeded();
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const items = await prisma.pricingConfig.findMany({ orderBy: { credits: "asc" } });
    return { items };
  }

  async getCredits(userId: string): Promise<{ balance: number; reserved: number; available: number }> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
    if (!user) throw new BillingError("User not found", 404, "NOT_FOUND");

    // Reserved credits = active PENDING/ARCHITECTING/BUILDING/INTEGRATING/QA/REVIEW runs
    const activeRunsCount = await prisma.workflowRun.count({
      where: {
        ownerId: userId,
        currentStage: { in: ["PENDING", "ARCHITECTING", "BUILDING", "INTEGRATING", "QA", "REVIEW"] },
      },
    });
    const reserved = activeRunsCount * 25;
    return {
      balance: user.credits,
      reserved,
      available: Math.max(0, user.credits),
    };
  }

  async getLedger(userId: string, opts: { cursor?: string; limit: number; action: string }) {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const where: any = { userId };
    if (opts.action && opts.action !== "ALL") {
      where.action = opts.action;
    }

    const total = await prisma.creditLedger.count({ where });
    const rows = await prisma.creditLedger.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: opts.limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > opts.limit;
    const sliced = hasMore ? rows.slice(0, opts.limit) : rows;
    const nextCursor = hasMore ? sliced[sliced.length - 1]!.id : null;

    return {
      items: sliced.map((r) => ({
        id: r.id,
        idempotencyKey: r.idempotencyKey,
        action: r.action,
        amount: r.amount,
        balance: r.balance,
        reason: r.reason,
        stage: r.stage,
        runId: r.runId,
        tokensIn: r.tokensIn,
        tokensOut: r.tokensOut,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor,
      total,
    };
  }

  async getInvoices(userId: string, cursor?: string, limit = 20) {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const rows = await prisma.creditLedger.findMany({
      where: { userId, action: "PURCHASE" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const sliced = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? sliced[sliced.length - 1]!.id : null;

    return {
      invoices: sliced.map((r) => ({
        id: r.id,
        amountCents: Number((r.metadata as any)?.amountCents ?? 0),
        creditsGranted: r.amount,
        status: "PAID",
        description: r.reason,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async createCheckoutSession(userId: string, planId: string, successUrl?: string, cancelUrl?: string) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new BillingError(
        "Payment provider is not configured on this server.",
        501,
        "NOT_CONFIGURED"
      );
    }

    await this.ensureConfigSeeded();
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new BillingError("Database unavailable", 503, "DB_UNAVAILABLE");

    const plan = await prisma.billingPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      throw new BillingError("Plan not found", 404, "PLAN_NOT_FOUND");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const form = new URLSearchParams({
      mode: "payment",
      success_url: successUrl || `${appUrl}/billing?checkout=success`,
      cancel_url: cancelUrl || `${appUrl}/billing?checkout=cancelled`,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": `Foundry ${plan.name} (${plan.credits} credits)`,
      "line_items[0][price_data][unit_amount]": String(plan.priceMonthlyCents),
      "line_items[0][quantity]": "1",
      "metadata[userId]": userId,
      "metadata[planId]": plan.id,
      "metadata[credits]": String(plan.credits),
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new BillingError(`Stripe checkout error: ${text}`, 502, "STRIPE_ERROR");
    }

    const session: any = await res.json();
    await prisma.auditLog.create({
      data: {
        actor: userId,
        action: "BILLING_CHECKOUT_CREATED",
        target: session.id,
        metadata: { planId },
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      mode: stripeKey.startsWith("sk_live_") ? ("LIVE" as const) : ("TEST" as const),
    };
  }

  verifyStripeSignature(rawBody: string, sigHeader: string | undefined, secret: string): boolean {
    if (!sigHeader || !secret) return false;
    const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=")));
    const timestamp = parts["t"];
    const v1 = parts["v1"];
    if (!timestamp || !v1) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  async handleWebhookEvent(event: any): Promise<void> {
    if (event?.type !== "checkout.session.completed") return;
    const session = event.data?.object;
    const userId = session?.metadata?.userId;
    const credits = parseInt(session?.metadata?.credits || "0", 10);
    const planId = session?.metadata?.planId || "plan";
    if (!userId || credits <= 0) return;

    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return;

    const idempotencyKey = `stripe:${event.id}`;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.creditLedger.findUnique({ where: { idempotencyKey } });
      if (existing) return;

      const updated = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });

      await tx.creditLedger.create({
        data: {
          idempotencyKey,
          userId,
          action: "PURCHASE",
          amount: credits,
          balance: updated.credits,
          reason: `PLAN_PURCHASE_${planId.toUpperCase()}`,
          metadata: { amountCents: session.amount_total, stripeEventId: event.id },
        },
      });
    });
  }
}

export const billingService = new BillingService();
