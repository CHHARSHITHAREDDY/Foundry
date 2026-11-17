import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { moderationService } from "./services/moderation.service.js";

const ModSchema = z.object({
  text: z.string(),
});

export const moderationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/check", async (req, reply) => {
    const body = ModSchema.parse(req.body);
    const result = moderationService.checkContent(body.text);
    return reply.send(result);
  });
};
