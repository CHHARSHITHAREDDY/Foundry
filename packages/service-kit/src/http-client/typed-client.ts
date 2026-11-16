import { z } from "zod";

export interface HttpClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class TypedHttpClient {
  private baseUrl: string;
  private timeoutMs: number;
  private headers: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs || 15000;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };
  }

  async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}: ${await response.text()}`);
      }

      const json = await response.json();
      return schema.parse(json);
    } finally {
      clearTimeout(timer);
    }
  }

  async post<T>(path: string, body: any, schema: z.ZodType<T>): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}: ${await response.text()}`);
      }

      const json = await response.json();
      return schema.parse(json);
    } finally {
      clearTimeout(timer);
    }
  }
}
