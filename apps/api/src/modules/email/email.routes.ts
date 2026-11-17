import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { emailService } from "./services/email.service.js";

const SendSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  template: z.string(),
});

export const emailRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/send", async (req, reply) => {
    const body = SendSchema.parse(req.body);
    const result = await emailService.sendTransactional(body.to, body.subject, body.template);
    return reply.send(result);
  });

  app.get("/verify-dns", async (req, reply) => {
    const { domain } = req.query as { domain?: string };
    const status = await emailService.verifyDnsRecords(domain || "foundry.studio");
    return reply.send(status);
  });
};

