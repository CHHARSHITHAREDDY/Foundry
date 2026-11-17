import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { adsService } from "./services/ads.service.js";

const GenerateSchema = z.object({
  ventureTitle: z.string(),
  targetCustomer: z.string(),
});

export const adsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/generate", async (req, reply) => {
    const body = GenerateSchema.parse(req.body);
    const creatives = await adsService.generateAdSet(body.ventureTitle, body.targetCustomer);
    return reply.send({ creatives });
  });
};
