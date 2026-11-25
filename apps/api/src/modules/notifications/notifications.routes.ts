import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { NotificationsQuerySchema, MarkNotificationsReadRequestSchema } from "@venture-studio/contracts";
import { prismaDatabase } from "../../db/prisma.service.js";
import { requireAuth, requireRateLimit } from "../auth/guards/auth.guard.js";

export const notificationsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    const query = NotificationsQuerySchema.parse(req.query || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    const where: any = { userId: user.id };
    if (query.unreadOnly) where.read = false;

    const [unreadCount, rows] = await Promise.all([
      prisma.notification.count({ where: { userId: user.id, read: false } }),
      prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: query.limit + 1,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
    ]);

    const hasMore = rows.length > query.limit;
    const sliced = hasMore ? rows.slice(0, query.limit) : rows;
    const nextCursor = hasMore ? sliced[sliced.length - 1]!.id : null;

    return reply.send({
      notifications: sliced.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      nextCursor,
    });
  });

  app.post("/read", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "notifications:read", 60, 60_000))) return;

    const body = MarkNotificationsReadRequestSchema.parse(req.body || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    if (body.all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      await prismaDatabase.recordAuditLog(user.id, "NOTIFICATIONS_MARK_ALL_READ", user.id);
      return reply.send({ success: true });
    }

    if (!body.id) {
      return reply.status(400).send({ statusCode: 400, error: "VALIDATION_ERROR", message: "Notification id or all=true required." });
    }

    const existing = await prisma.notification.findFirst({
      where: { id: body.id, userId: user.id },
    });
    if (!existing) {
      return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Notification not found." });
    }

    await prisma.notification.update({
      where: { id: body.id },
      data: { read: true },
    });
    await prismaDatabase.recordAuditLog(user.id, "NOTIFICATION_MARK_READ", body.id);
    return reply.send({ success: true });
  });
};
