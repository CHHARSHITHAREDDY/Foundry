import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { adminService } from "./services/admin.service.js";

const GrantSchema = z.object({
  userId: z.string(),
  amount: z.number().int().positive(),
});

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/stats", async (_req, reply) => {
    return reply.send(await adminService.getSystemStats());
  });

  app.post("/credits/grant", async (req, reply) => {
    const body = GrantSchema.parse(req.body);
    const result = await adminService.grantCredits(body.userId, body.amount);
    return reply.send(result);
  });
};
