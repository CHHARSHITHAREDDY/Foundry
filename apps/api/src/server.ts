import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { createLogger, registerErrorHandler } from "@venture-studio/service-kit";
import { getApiEnv } from "./config/env.js";

// Domain Modules
import { healthRoutes } from "./modules/health/health.routes.js";
import { ideationRoutes } from "./modules/ideation/ideation.routes.js";
import { researchRoutes } from "./modules/research/research.routes.js";
import { runtimeRoutes } from "./modules/agent-runtime/runtime.routes.js";
import { workflowRoutes } from "./modules/workflow/workflow.routes.js";
import { realtimeRoutes } from "./modules/realtime/stream.routes.js";

export async function createApiServer(): Promise<FastifyInstance> {
  const env = getApiEnv();
  const logger = createLogger("@venture-studio/api");

  const app: FastifyInstance = Fastify({
    logger: logger as any,
    genReqId: () => `req_${Math.random().toString(36).substring(2, 9)}`,
    disableRequestLogging: false,
  });

  // Security & Utility Plugins
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  });
  await app.register(sensible);
  registerErrorHandler(app);

  // Register Domain Modules
  await app.register(healthRoutes);
  await app.register(ideationRoutes);
  await app.register(researchRoutes);
  await app.register(runtimeRoutes);
  await app.register(workflowRoutes);
  await app.register(realtimeRoutes);

  return app;
}
