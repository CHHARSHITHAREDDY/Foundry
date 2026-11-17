import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sandboxService } from "./services/sandbox.service.js";

const HydrateSchema = z.object({
  runId: z.string(),
  files: z.record(z.string()),
});

export const sandboxRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/hydrate", async (req, reply) => {
    const body = HydrateSchema.parse(req.body);
    const result = await sandboxService.hydrateSandbox(body.runId, body.files);
    return reply.send(result);
  });
};
