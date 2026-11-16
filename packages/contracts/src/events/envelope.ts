import { z } from "zod";

export const EventEnvelopeSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    id: z.string().default(() => `evt_${Math.random().toString(36).substring(2, 9)}`),
    type: z.string(),
    source: z.string(),
    timestamp: z.string().datetime().default(() => new Date().toISOString()),
    correlationId: z.string().optional(),
    payload: payloadSchema,
  });

export type EventEnvelope<T = any> = {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  correlationId?: string;
  payload: T;
};
