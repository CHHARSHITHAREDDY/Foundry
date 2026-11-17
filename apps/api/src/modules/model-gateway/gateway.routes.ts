import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { modelGatewayService } from "./services/gateway.service.js";

const GenerateSchema = z.object({
  tier: z.enum(["fast", "reasoner", "coder", "writer", "vision"]),
  systemPrompt: z.string(),
  userPrompt: z.string(),
});

export const modelGatewayRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/tiers", async (_req, reply) => {
    return reply.send({ tiers: modelGatewayService.getTiers() });
  });

  app.post("/generate", async (req, reply) => {
    const body = GenerateSchema.parse(req.body);
    const text = await modelGatewayService.generate(body.tier, body.systemPrompt, body.userPrompt);
    return reply.send({ text });
  });
};
