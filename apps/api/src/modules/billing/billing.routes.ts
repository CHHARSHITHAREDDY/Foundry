import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { billingService } from "./services/billing.service.js";

const CheckoutSchema = z.object({
  planId: z.enum(["starter", "founder", "syndicate"]),
});

export const billingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/plans", async (_req, reply) => {
    return reply.send({ plans: billingService.getPlans() });
  });

  app.get("/credits", async (req, reply) => {
    const credits = await billingService.getCredits("usr_default");
    return reply.send(credits);
  });

  app.post("/checkout", async (req, reply) => {
    const body = CheckoutSchema.parse(req.body);
    const session = await billingService.createCheckoutSession("usr_default", body.planId);
    return reply.send(session);
  });
};

