import { EventEmitter } from "node:events";
import { prismaDatabase } from "../../db/prisma.service.js";
import { redisClient } from "../../redis/client.js";

export interface StreamEvent {
  id?: string;
  stream?: string;
  type:
    | "connected"
    | "ping"
    | "agent:log"
    | "stage:change"
    | "qa:screenshot"
    | "build:complete"
    | "task:update"
    | "idea:stage"
    | "idea:sources"
    | "idea:pain_point"
    | "idea:dropped"
    | "idea:completed"
    | "idea:insufficient"
    | "idea:error";
  payload: any;
  timestamp: string;
}

export class RealtimeEventHub extends EventEmitter {
  private static instance: RealtimeEventHub;
  private streamKey = "foundry:stream:studio";

  static getInstance(): RealtimeEventHub {
    if (!RealtimeEventHub.instance) {
      RealtimeEventHub.instance = new RealtimeEventHub();
    }
    return RealtimeEventHub.instance;
  }

  async broadcast(
    type: StreamEvent["type"],
    payload: any,
    runId?: string,
    stream: string = "sse:studio"
  ): Promise<string> {
    const timestamp = new Date().toISOString();

    // 1. Durable persistence in Neon PostgreSQL
    const eventId = await prismaDatabase.persistStudioEvent(stream, type, payload, runId);

    const event: StreamEvent = {
      id: eventId,
      stream,
      type,
      payload,
      timestamp,
    };

    // 2. Redis Stream / Cache publish (for multi-instance distribution)
    try {
      await redisClient.set(`${this.streamKey}:${eventId}`, JSON.stringify(event), 3600);
    } catch {}

    // 3. Local in-process broadcast
    this.emit("stream-event", event);
    return eventId;
  }
}
