import { z } from "zod";

export const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const NotificationsListResponseSchema = z.object({
  notifications: z.array(NotificationItemSchema),
  unreadCount: z.number().int(),
  nextCursor: z.string().nullable(),
});

export type NotificationItemContract = z.infer<typeof NotificationItemSchema>;
export type NotificationsListResponse = z.infer<typeof NotificationsListResponseSchema>;
