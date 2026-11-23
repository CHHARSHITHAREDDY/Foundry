import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { RealtimeEventHub, StreamEvent } from "./event-hub.js";
import { prismaDatabase } from "../../db/prisma.service.js";

export async function realtimeRoutes(app: FastifyInstance) {
  const hub = RealtimeEventHub.getInstance();

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
