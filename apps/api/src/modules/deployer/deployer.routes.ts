import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { deployerService } from "./services/deployer.service.js";

const AllocateSchema = z.object({
  ventureId: z.string(),
  title: z.string(),
});

export const deployerRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // List all deployments
  app.get("/", async (_req, reply) => {
    return reply.send({ deployments: await deployerService.listDeployments() });
  });

  // Get active deployment status (Stage 07 Deploy)
  app.get("/status", async (req, reply) => {
    const { id } = req.query as { id?: string };
    const status = deployerService.getDeployStatus(id);
    return reply.send(status);
  });

  // Get real-time edge runtime logs
  app.get("/logs", async (_req, reply) => {
    const logs = deployerService.getEdgeLogs();
    return reply.send({ logs });
  });

  // Cancel in-flight deployment
  app.post("/cancel", async (req, reply) => {
    const { id } = (req.body || {}) as { id?: string };
    const result = deployerService.cancelDeployment(id);
    if (!result) return reply.status(404).send({ error: "Deployment not found" });
    return reply.send({ success: true, deployment: result });
  });

  // Finalize & complete deployment
  app.post("/complete", async (req, reply) => {
    const { id } = (req.body || {}) as { id?: string };
    const result = deployerService.completeDeployment(id);
    return reply.send({ success: true, deployment: result });
  });

  // Allocate new edge deployment
  app.post("/allocate", async (req, reply) => {
    const body = AllocateSchema.parse(req.body);
    const result = await deployerService.allocateDeployment(body.ventureId, body.title);
    return reply.send(result);
  });

  // Get deployment by ID
  app.get("/:siteId", async (req, reply) => {
    const { siteId } = req.params as { siteId: string };
    const dep = await deployerService.getDeployment(siteId);
    if (!dep) return reply.status(404).send({ error: "Deployment not found" });
    return reply.send(dep);
  });
};
