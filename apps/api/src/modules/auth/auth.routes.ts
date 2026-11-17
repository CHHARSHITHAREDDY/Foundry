import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { authService } from "./services/auth.service.js";

const LoginSchema = z.object({
  email: z.string().email(),
});

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/session", async (req, reply) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    const user = await authService.getCurrentUser(token);
    return reply.send({ authenticated: true, user });
  });

  app.post("/login", async (req, reply) => {
    const body = LoginSchema.parse(req.body);
    const result = await authService.login(body.email);
    return reply.send(result);
  });
};
