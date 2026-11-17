import { EventEmitter } from "events";

export class RedisPubSubService extends EventEmitter {
  private static instance: RedisPubSubService;

  private constructor() {
    super();
  }

  public static getInstance(): RedisPubSubService {
    if (!RedisPubSubService.instance) {
      RedisPubSubService.instance = new RedisPubSubService();
    }
    return RedisPubSubService.instance;
  }

  async publish(channel: string, message: any): Promise<void> {
    const payload = typeof message === "string" ? message : JSON.stringify(message);
    this.emit(channel, payload);
  }

  subscribe(channel: string, listener: (message: any) => void): void {
    this.on(channel, (raw) => {
      try {
        listener(JSON.parse(raw));
      } catch {
        listener(raw);
      }
    });
  }
}

export const redisPubSub = RedisPubSubService.getInstance();
