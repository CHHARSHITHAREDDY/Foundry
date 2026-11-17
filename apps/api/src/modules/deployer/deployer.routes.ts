import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { deployerService } from "./services/deployer.service.js";

const AllocateSchema = z.object({
  ventureId: z.string(),
  title: z.string(),
});

export const deployerRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/", async (_req, reply) => {
    return reply.send({ deployments: await deployerService.listDeployments() });
  });

  app.post("/allocate", async (req, reply) => {
    const body = AllocateSchema.parse(req.body);
    const result = await deployerService.allocateDeployment(body.ventureId, body.title);
    return reply.send(result);
  });

  app.get("/:siteId", async (req, reply) => {
    const { siteId } = req.params as { siteId: string };
    const dep = await deployerService.getDeployment(siteId);
    if (!dep) return reply.status(404).send({ error: "Deployment not found" });
    return reply.send(dep);
  });
};

