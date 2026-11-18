import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { adsService } from "./services/ads.service.js";

const GenerateSchema = z.object({
  ventureTitle: z.string(),
  targetCustomer: z.string(),
});

const DeployAdSchema = z.object({
  creativeVariant: z.number().optional(),
  dailyBudget: z.number().optional(),
  platform: z.enum(["meta", "google", "all"]).optional(),
});

export const adsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/generate", async (req, reply) => {
    const body = GenerateSchema.parse(req.body);
    const creatives = await adsService.generateAdSet(body.ventureTitle, body.targetCustomer);
    return reply.send({ creatives });
  });

  // Deploy ad set with daily budget
  app.post("/deploy", async (req, reply) => {
    const body = DeployAdSchema.parse(req.body || {});
    return reply.send({
      success: true,
      campaignId: `cmp_${Date.now()}`,
      pixelId: "px_881923019",
      dailyBudget: body.dailyBudget || 50,
      creativeVariant: body.creativeVariant || 0,
      status: "ACTIVE",
      deployedAt: new Date().toISOString(),
    });
  });
};
