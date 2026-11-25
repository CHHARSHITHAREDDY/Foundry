import { z } from "zod";

export const LedgerQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  action: z.enum(["ALL", "BONUS", "PURCHASE", "RESERVE", "SETTLE", "REFUND"]).optional().default("ALL"),
});

export const CheckoutRequestSchema = z.object({
  planId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type LedgerQuery = z.infer<typeof LedgerQuerySchema>;
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
