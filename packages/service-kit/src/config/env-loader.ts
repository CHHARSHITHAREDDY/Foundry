import { z } from "zod";

export function loadEnv<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.error("Environment configuration error:", errorDetails);
    throw new Error(`Failed to load environment variables:\n${errorDetails}`);
  }
  return result.data;
}
