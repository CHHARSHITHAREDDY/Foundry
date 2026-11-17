import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { mediaService } from "./services/media.service.js";

export const mediaRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/badge", async (req, reply) => {
    const { label = "SYS", value = "OK" } = req.query as { label?: string; value?: string };
    const svg = mediaService.generateSvgBadge(label, value);
    return reply.type("image/svg+xml").send(svg);
  });
};

