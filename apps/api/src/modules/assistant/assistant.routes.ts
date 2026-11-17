import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { assistantService } from "./services/assistant.service.js";

const ChatSchema = z.object({
  prompt: z.string(),
  ventureId: z.string().optional(),
});

export const assistantRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/status", async (_req, reply) => {
    return reply.send(assistantService.getStatus());
  });

  app.post("/chat", async (req, reply) => {
    const body = ChatSchema.parse(req.body);
    const result = await assistantService.processRefinement(body.prompt, body.ventureId);
    return reply.send(result);
  });
};

