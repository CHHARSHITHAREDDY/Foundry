import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { RealtimeEventHub, StreamEvent } from "./event-hub.js";

export async function realtimeRoutes(app: FastifyInstance) {
  const hub = RealtimeEventHub.getInstance();

  app.get("/api/stream", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    // Initial connection message
    reply.raw.write(
      `event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`
    );

    // Listener for real-time broadcast events
    const onEvent = (event: StreamEvent) => {
      try {
        reply.raw.write(`event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
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

