import { z } from "zod";

export const BillingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceMonthlyCents: z.number().int(),
  credits: z.number().int(),
  maxActiveVentures: z.number().int(),
  features: z.array(z.string()),
});

export const CreditsBalanceResponseSchema = z.object({
  balance: z.number().int(),
  reserved: z.number().int(),
  available: z.number().int(),
});

export const CreditLedgerEntrySchema = z.object({
  id: z.string(),
  idempotencyKey: z.string().nullable(),
  action: z.string(),
  amount: z.number().int(),
  balance: z.number().int(),
  reason: z.string(),
  stage: z.string().nullable(),
  runId: z.string().nullable(),
  tokensIn: z.number().int(),
  tokensOut: z.number().int(),
  createdAt: z.string(),
});

export const LedgerResponseSchema = z.object({
  items: z.array(CreditLedgerEntrySchema),
  nextCursor: z.string().nullable(),
  total: z.number().int(),
});

export const PlansResponseSchema = z.object({
  plans: z.array(BillingPlanSchema),
  providerConfigured: z.boolean(),
  mode: z.enum(["TEST", "LIVE", "UNCONFIGURED"]),
});

export const PricingActionSchema = z.object({
  action: z.string(),
  label: z.string(),
  credits: z.number().int(),
  description: z.string(),
});

export const PricingResponseSchema = z.object({
  items: z.array(PricingActionSchema),
});

export const CheckoutResponseSchema = z.object({
  sessionId: z.string(),
  checkoutUrl: z.string(),
  mode: z.enum(["TEST", "LIVE"]),
});

export const InvoicesResponseSchema = z.object({
  invoices: z.array(
    z.object({
      id: z.string(),
      amountCents: z.number().int(),
      creditsGranted: z.number().int(),
      status: z.string(),
      description: z.string(),
      createdAt: z.string(),
    })
  ),
  nextCursor: z.string().nullable(),
});

export type BillingPlan = z.infer<typeof BillingPlanSchema>;
export type CreditsBalanceResponse = z.infer<typeof CreditsBalanceResponseSchema>;
export type CreditLedgerEntry = z.infer<typeof CreditLedgerEntrySchema>;
export type LedgerResponse = z.infer<typeof LedgerResponseSchema>;
export type PlansResponse = z.infer<typeof PlansResponseSchema>;
export type PricingAction = z.infer<typeof PricingActionSchema>;
export type PricingResponse = z.infer<typeof PricingResponseSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
export type InvoicesResponse = z.infer<typeof InvoicesResponseSchema>;
