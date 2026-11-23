import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { adminService } from "./services/admin.service.js";
import { requireAuth } from "../auth/guards/auth.guard.js";

const GrantSchema = z.object({
  userId: z.string(),
  amount: z.number().int().positive(),
});

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Enforce Super-Admin RBAC check
  app.addHook("preHandler", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (user.role !== "admin") {
      return reply.status(403).send({
        statusCode: 403,
        error: "FORBIDDEN",
        message: "Forbidden: Super-admin privilege required for operator administration endpoints.",
      });
    }
  });

  app.get("/stats", async (_req, reply) => {
    return reply.send(await adminService.getSystemStats());
  });

  app.post("/credits/grant", async (req, reply) => {
    const body = GrantSchema.parse(req.body);
    const result = await adminService.grantCredits(body.userId, body.amount);
    return reply.send(result);
  });
};
