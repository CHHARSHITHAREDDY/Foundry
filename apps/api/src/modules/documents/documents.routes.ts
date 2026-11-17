import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { documentsService } from "./services/documents.service.js";

const DocGenSchema = z.object({
  type: z.enum(["prd", "openapi", "terms", "privacy"]),
  ventureTitle: z.string(),
});

export const documentsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/generate", async (req, reply) => {
    const body = DocGenSchema.parse(req.body);
    const doc = await documentsService.generateDoc(body.type, body.ventureTitle);
    return reply.send(doc);
  });
};
