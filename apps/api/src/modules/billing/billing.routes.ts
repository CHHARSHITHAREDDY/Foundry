import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { LedgerQuerySchema, CheckoutRequestSchema } from "@venture-studio/contracts";
import { billingService, BillingError } from "./services/billing.service.js";
import { requireAuth, requireRateLimit } from "../auth/guards/auth.guard.js";

export const billingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof BillingError) {
      return reply.status(err.statusCode).send({
        statusCode: err.statusCode,
        error: err.code,
        message: err.message,
      });
    }
    if (err?.name === "ZodError") {
      return reply.status(400).send({
        statusCode: 400,
        error: "VALIDATION_ERROR",
        message: err.errors?.[0]?.message || "Invalid request",
      });
    }
    throw err;
  });

  app.get("/plans", async (_req, reply) => {
    const result = await billingService.getPlans();
    return reply.send(result);
  });

  app.get("/credits", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    const credits = await billingService.getCredits(user.id);
    return reply.send(credits);
  });

  app.get("/ledger", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    const query = LedgerQuerySchema.parse(req.query || {});
    const ledger = await billingService.getLedger(user.id, query);
    return reply.send(ledger);
  });

  app.get("/invoices", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    const { cursor, limit } = (req.query as { cursor?: string; limit?: string }) || {};
    const result = await billingService.getInvoices(user.id, cursor, Math.min(100, Math.max(1, Number(limit) || 20)));
    return reply.send(result);
  });

  app.post("/checkout", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "billing:checkout", 15, 60_000))) return;
    const body = CheckoutRequestSchema.parse(req.body);
    const session = await billingService.createCheckoutSession(user.id, body.planId, body.successUrl, body.cancelUrl);
    return reply.send(session);
  });

  app.post("/webhook", async (req, reply) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return reply.status(501).send({ statusCode: 501, error: "NOT_CONFIGURED", message: "Webhook secret not configured." });
    }
    const sig = req.headers["stripe-signature"] as string | undefined;
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!billingService.verifyStripeSignature(rawBody, sig, secret)) {
      return reply.status(400).send({ statusCode: 400, error: "INVALID_SIGNATURE", message: "Invalid webhook signature." });
    }
    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    await billingService.handleWebhookEvent(event);
    return reply.send({ received: true });
  });
};

export const pricingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/api/pricing", async (_req, reply) => {
    const pricing = await billingService.getPricing();
    return reply.send(pricing);
  });
};
