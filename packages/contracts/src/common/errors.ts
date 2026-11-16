import { z } from "zod";

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
