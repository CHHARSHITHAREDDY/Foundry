import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "@venture-studio/api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    };
  });

  app.get("/ready", async () => {
    return {
      status: "ready",
      service: "@venture-studio/api",
      timestamp: new Date().toISOString(),
    };
  });
}
