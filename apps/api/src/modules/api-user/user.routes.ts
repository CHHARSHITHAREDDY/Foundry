import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { userService } from "./services/user.service.js";

export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/dashboard", async (_req, reply) => {
    const data = await userService.getDashboard("usr_default");
    return reply.send(data);
  });
};
