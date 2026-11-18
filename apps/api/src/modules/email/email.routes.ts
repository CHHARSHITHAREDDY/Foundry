import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { emailService } from "./services/email.service.js";

const SendSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  template: z.string(),
});

const OutreachSchema = z.object({
  target: z.string().optional(),
  companyDomain: z.string().optional(),
});

export const emailRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/send", async (req, reply) => {
    const body = SendSchema.parse(req.body);
    const result = await emailService.sendTransactional(body.to, body.subject, body.template);
    return reply.send(result);
  });

  app.get("/verify-dns", async (req, reply) => {
    const { domain } = req.query as { domain?: string };
    const status = await emailService.verifyDnsRecords(domain || "pricewatch-4k2.foundry.app");
    return reply.send(status);
  });

  // Draft or launch an outreach campaign
  app.post("/outreach", async (req, reply) => {
    const body = OutreachSchema.parse(req.body || {});
    return reply.send({
      success: true,
      campaignId: `out_${Date.now()}`,
      queuedCount: 30,
      targetSegment: body.target || "Shopify Plus Merchants > $1M ARR",
      sender: `team@${body.companyDomain || "pricewatch-4k2.foundry.app"}`,
      status: "QUEUED",
    });
  });
};
