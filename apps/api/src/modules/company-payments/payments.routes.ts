import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { companyPaymentsService } from "./services/payments.service.js";

const ConnectSchema = z.object({
  companyId: z.string(),
});

export const companyPaymentsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/connect", async (req, reply) => {
    const body = ConnectSchema.parse(req.body);
    const result = await companyPaymentsService.createConnectLink(body.companyId);
    return reply.send(result);
  });

  app.get("/:companyId/status", async (req, reply) => {
    const { companyId } = req.params as { companyId: string };
    const status = await companyPaymentsService.getMerchantStatus(companyId);
    return reply.send(status);
  });
};

