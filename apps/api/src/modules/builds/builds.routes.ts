import { FastifyInstance, FastifyPluginAsync } from "fastify";

export const buildsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/status", async (_request, reply) => {
    return reply.send({
      status: "IDLE",
      currentPhase: "IDLE",
      progress: 0,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/logs", async (request, reply) => {
    const { filter } = (request.query as { filter?: string }) || {};
    return reply.send({
      logs: [],
      filter: filter || null,
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/cancel", async (_request, reply) => {
    return reply.send({
      success: true,
      message: "Build cancelled",
      timestamp: new Date().toISOString(),
    });
  });
};
