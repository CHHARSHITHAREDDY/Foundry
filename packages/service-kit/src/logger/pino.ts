import pino from "pino";

export function createLogger(serviceName: string) {
  const isDev = process.env.NODE_ENV !== "production";
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || "info",
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss Z",
          },
        }
      : undefined,
  });
}

