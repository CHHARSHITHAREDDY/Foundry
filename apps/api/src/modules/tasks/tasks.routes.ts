import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { tasksService } from "./services/tasks.service.js";

export const tasksRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const task = tasksService.getTask(id);
    if (!task) return reply.status(404).send({ error: "Task not found" });
    return reply.send(task);
  });
};
