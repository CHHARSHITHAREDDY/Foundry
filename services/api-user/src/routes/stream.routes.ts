import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export interface LogEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

export async function streamBffRoutes(app: FastifyInstance) {
  app.get("/api/stream", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    // Initial connection ping
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`);

    // Keepalive heartbeat
    const interval = setInterval(() => {
      reply.raw.write(`event: ping\ndata: ${Date.now()}\n\n`);
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(interval);
    });
  });
}
