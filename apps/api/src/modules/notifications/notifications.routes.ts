import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { notificationsService } from "./services/notifications.service.js";

export const notificationsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/list", async (_req, reply) => {
    const list = await notificationsService.list();
    return reply.send({ notifications: list });
  });
};

