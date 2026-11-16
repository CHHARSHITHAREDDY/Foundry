import { z } from "zod";

export const DesignTokensSchema = z.object({
  primaryColor: z.string().default("#3b82f6"),
  accentColor: z.string().default("#10b981"),
  backgroundColor: z.string().default("#09090b"),
  foregroundColor: z.string().default("#fafafa"),
  fontFamily: z.string().default("Inter, sans-serif"),
  borderRadius: z.string().default("0.5rem"),
  darkMode: z.boolean().default(true),
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
