import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { createLogger } from "../logger/pino.js";
import { registerErrorHandler } from "./plugins/error-handler.js";

export interface CreateServerOptions {
  serviceName: string;
  enableCors?: boolean;
  enableHelmet?: boolean;
}

export async function createServer(options: CreateServerOptions): Promise<FastifyInstance> {
  const logger = createLogger(options.serviceName);

  const server = Fastify({
    logger,
    genReqId: () => `req_${Math.random().toString(36).substring(2, 9)}`,
    disableRequestLogging: false,
  });

  if (options.enableHelmet !== false) {
    await server.register(helmet, { contentSecurityPolicy: false });
  }

  if (options.enableCors !== false) {
    await server.register(cors, {
      origin: true,
      credentials: true,
    });
  }

  await server.register(sensible);
  registerErrorHandler(server);

  server.get("/health", async () => {
    return {
      status: "ok",
      service: options.serviceName,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  return server;
}
