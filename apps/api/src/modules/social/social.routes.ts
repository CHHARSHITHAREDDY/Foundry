import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { socialService } from "./services/social.service.js";

const ThreadSchema = z.object({
  ventureTitle: z.string(),
  problem: z.string(),
});

export const socialRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/thread", async (req, reply) => {
    const body = ThreadSchema.parse(req.body);
    const thread = await socialService.generateLaunchThread(body.ventureTitle, body.problem);
    return reply.send(thread);
  });
};
