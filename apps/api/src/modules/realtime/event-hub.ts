import { EventEmitter } from "node:events";

export interface StreamEvent {
  type: "connected" | "ping" | "agent:log" | "stage:change" | "qa:screenshot" | "build:complete";
  payload: any;
  timestamp: string;
}

export class RealtimeEventHub extends EventEmitter {
  private static instance: RealtimeEventHub;

  static getInstance(): RealtimeEventHub {
    if (!RealtimeEventHub.instance) {
      RealtimeEventHub.instance = new RealtimeEventHub();
    }
    return RealtimeEventHub.instance;
  }

  broadcast(type: StreamEvent["type"], payload: any) {
    const event: StreamEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.emit("stream-event", event);
  }
}

