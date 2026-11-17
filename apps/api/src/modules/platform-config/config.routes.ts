import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { platformConfigService } from "./services/config.service.js";

export const platformConfigRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/", async (_req, reply) => {
    return reply.send(platformConfigService.getConfig());
  });
};

