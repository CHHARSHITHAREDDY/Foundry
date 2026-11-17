import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { analyticsService } from "./services/analytics.service.js";

export const analyticsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/overview", async (_req, reply) => {
    const data = await analyticsService.getOverview();
    return reply.send(data);
  });
};
