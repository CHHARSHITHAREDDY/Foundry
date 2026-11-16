import { z } from "zod";

export const CreditsSchema = z.number().int().nonnegative();
export type Credits = z.infer<typeof CreditsSchema>;

