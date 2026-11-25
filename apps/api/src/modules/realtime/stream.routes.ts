import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { RealtimeEventHub, StreamEvent } from "./event-hub.js";
import { prismaDatabase } from "../../db/prisma.service.js";
import { resolveOptionalAuth } from "../auth/guards/auth.guard.js";

export async function realtimeRoutes(app: FastifyInstance) {
  const hub = RealtimeEventHub.getInstance();

  app.get("/api/stream/user", async (request: FastifyRequest, reply: FastifyReply) => {
    const resolved = await resolveOptionalAuth(request);
    if (!resolved) {
      return reply.status(401).send({ statusCode: 401, error: "UNAUTHORIZED", message: "Authentication required." });
    }

    const userId = resolved.user.id;
    const origin = request.headers.origin || "http://localhost:3000";
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", origin);
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");

    const lastEventId =
      (request.headers["last-event-id"] as string | undefined) ||
      (request.query as any)?.lastEventId;

    const prisma = await prismaDatabase.ensureReady();
    let unreadCount = 0;
    let creditsBalance = resolved.user.credits;
    if (prisma) {
      const [u, unread] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
        prisma.notification.count({ where: { userId, read: false } }),
      ]);
      creditsBalance = u?.credits ?? creditsBalance;
      unreadCount = unread;
    }

    reply.raw.write(
      `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        userId,
        credits: creditsBalance,
        unreadCount,
        replayed: Boolean(lastEventId),
        time: new Date().toISOString(),
      })}\n\n`
    );

    if (lastEventId) {
      try {
        const missed = await prismaDatabase.getEventsSince(`user:${userId}`, lastEventId);
        for (const evt of missed) {
          reply.raw.write(`id: ${evt.id}\nevent: ${evt.eventType}\ndata: ${JSON.stringify(evt.payload)}\n\n`);
        }
      } catch {}
    }

    const onEvent = (event: StreamEvent) => {
      const targetUserId = (event.payload as any)?.userId;
      if (targetUserId && targetUserId !== userId) return;
      if (!targetUserId) return;
      try {
        reply.raw.write(`id: ${event.id || ""}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
      } catch {}
    };

    hub.on("stream-event", onEvent);
    const interval = setInterval(() => {
      try {
        reply.raw.write(`event: ping\ndata: ${Date.now()}\n\n`);
      } catch {}
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(interval);
      hub.off("stream-event", onEvent);
    });
  });

  app.get("/api/stream", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    // Check for Last-Event-ID header or query param for reconnection replay
    const lastEventId =
      (request.headers["last-event-id"] as string | undefined) ||
      (request.query as any)?.lastEventId;

    // Send initial connection handshake
    reply.raw.write(
      `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        time: new Date().toISOString(),
        replayed: Boolean(lastEventId),
      })}\n\n`
    );

    // If reconnecting, replay missed events from PostgreSQL durability store
    if (lastEventId) {
      try {
        const missedEvents = await prismaDatabase.getEventsSince("sse:studio", lastEventId);
        for (const evt of missedEvents) {
          reply.raw.write(
            `id: ${evt.id}\nevent: ${evt.eventType}\ndata: ${JSON.stringify(evt.payload)}\n\n`
          );
        }
      } catch (err: any) {
        request.log.warn(`[SSE REPLAY] Failed to replay events since ${lastEventId}: ${err.message}`);
      }
    }

    // Listener for live broadcast events
    const onEvent = (event: StreamEvent) => {
      try {
        reply.raw.write(`id: ${event.id || ""}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
      } catch {}
    };

    hub.on("stream-event", onEvent);

    // Heartbeat every 15s to keep the connection alive
    const interval = setInterval(() => {
      try {
        reply.raw.write(`event: ping\ndata: ${Date.now()}\n\n`);
      } catch {}
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(interval);
      hub.off("stream-event", onEvent);
    });
  });
}
