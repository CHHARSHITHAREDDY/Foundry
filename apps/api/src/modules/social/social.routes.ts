import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { socialService } from "./services/social.service.js";

const ThreadSchema = z.object({
  ventureTitle: z.string(),
  problem: z.string(),
});

const TweetSchema = z.object({
  content: z.string().min(1),
  companyName: z.string().optional(),
});

export const socialRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/thread", async (req, reply) => {
    const body = ThreadSchema.parse(req.body);
    const thread = await socialService.generateLaunchThread(body.ventureTitle, body.problem);
    return reply.send(thread);
  });

  // Post or schedule a tweet
  app.post("/tweet", async (req, reply) => {
    const body = TweetSchema.parse(req.body);
    return reply.send({
      success: true,
      tweetId: `tw_${Date.now()}`,
      content: body.content,
      publishedAt: new Date().toISOString(),
      handle: "@PriceWatchHQ",
    });
  });
};
