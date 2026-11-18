import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { tasksService } from "./services/tasks.service.js";

const CreateTaskSchema = z.object({
  specification: z.string().min(1),
  type: z.enum(["FEATURE", "BUG", "CONTENT", "MARKETING"]).optional(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
  credits: z.number().optional(),
  requiresApproval: z.boolean().optional(),
  companyName: z.string().optional(),
});

export const tasksRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // List all sprint tasks
  app.get("/", async (req, reply) => {
    const { filter } = req.query as { filter?: string };
    const tasks = tasksService.listTasks(filter);
    return reply.send({ tasks, total: tasks.length });
  });

  // Create new task from NewTaskDialog
  app.post("/", async (req, reply) => {
    const body = CreateTaskSchema.parse(req.body);
    const task = tasksService.createSprintTask(body);
    return reply.status(201).send(task);
  });

  // Get single task
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const task = tasksService.getTask(id);
    if (!task) return reply.status(404).send({ error: "Task not found" });
    return reply.send(task);
  });

  // Approve task diff
  app.post("/:id/approve", async (req, reply) => {
    const { id } = req.params as { id: string };
    const updated = tasksService.approveTask(id);
    if (!updated) return reply.status(404).send({ error: "Task not found" });
    return reply.send({ success: true, task: updated });
  });

  // Cancel/abort task
  app.post("/:id/cancel", async (req, reply) => {
    const { id } = req.params as { id: string };
    const updated = tasksService.cancelTask(id);
    if (!updated) return reply.status(404).send({ error: "Task not found" });
    return reply.send({ success: true, task: updated });
  });

  // Retry failed task
  app.post("/:id/retry", async (req, reply) => {
    const { id } = req.params as { id: string };
    const updated = tasksService.retryTask(id);
    if (!updated) return reply.status(404).send({ error: "Task not found" });
    return reply.send({ success: true, task: updated });
  });
};
