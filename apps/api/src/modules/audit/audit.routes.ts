import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { auditService } from "./services/audit.service.js";

export const auditRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/logs", async (_req, reply) => {
    return reply.send({ logs: auditService.getEntries() });
  });
};

