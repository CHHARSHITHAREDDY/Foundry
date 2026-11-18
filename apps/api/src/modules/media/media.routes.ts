import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { mediaService } from "./services/media.service.js";

const MediaGenSchema = z.object({
  type: z.enum(["image", "video"]).optional(),
  prompt: z.string().min(1),
  aspectRatio: z.string().optional(),
});

export const mediaRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/badge", async (req, reply) => {
    const { label = "SYS", value = "OK" } = req.query as { label?: string; value?: string };
    const svg = mediaService.generateSvgBadge(label, value);
    return reply.type("image/svg+xml").send(svg);
  });

  // Generate image or video asset
  app.post("/generate", async (req, reply) => {
    const body = MediaGenSchema.parse(req.body);
    const isVideo = body.type === "video";
    return reply.send({
      success: true,
      assetId: `ast_${Date.now()}`,
      type: body.type || "image",
      prompt: body.prompt,
      assetUrl: isVideo
        ? "https://pricewatch-4k2.foundry.app/assets/promo_10s.mp4"
        : "https://pricewatch-4k2.foundry.app/assets/hero_og.png",
      resolution: isVideo ? "1080p 60fps" : "1200x630",
      status: "READY",
      generatedAt: new Date().toISOString(),
    });
  });
};
