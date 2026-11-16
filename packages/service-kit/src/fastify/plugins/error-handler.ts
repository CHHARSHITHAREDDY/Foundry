import type { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    if (error instanceof ZodError) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: error.flatten(),
        timestamp: new Date().toISOString(),
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  });
}

