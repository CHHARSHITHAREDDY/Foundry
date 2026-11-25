import { z } from "zod";

export const NotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
});

export const MarkNotificationsReadRequestSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional().default(false),
});

export type NotificationsQuery = z.infer<typeof NotificationsQuerySchema>;
export type MarkNotificationsReadRequest = z.infer<typeof MarkNotificationsReadRequestSchema>;
