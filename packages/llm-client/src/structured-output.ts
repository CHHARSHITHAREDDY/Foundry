import { z } from "zod";

export function extractJsonFromText(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {}

  // Look for markdown code fence ```json ... ```
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }

  // Look for first { to last } or first [ to last ]
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    } catch {}
  }

  throw new Error(`Failed to extract valid JSON from model response: ${text.slice(0, 300)}...`);
}

export function parseStructuredOutput<T>(text: string, schema: z.ZodType<T>): T {
  const raw = extractJsonFromText(text);
  return schema.parse(raw);
}
