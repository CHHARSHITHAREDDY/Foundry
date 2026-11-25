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

  // Handle slightly truncated arrays by closing after the last complete object
  if (firstBracket !== -1) {
    const lastObjectEnd = text.lastIndexOf("}");
    if (lastObjectEnd > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastObjectEnd + 1) + "\n]");
      } catch {}
    }
  }

  // Handle slightly truncated objects by closing after the last complete property
  if (firstBrace !== -1 && lastBrace === -1) {
    const lastQuote = text.lastIndexOf('"');
    if (lastQuote > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastQuote + 1) + "\n}");
      } catch {}
    }
  }

  throw new Error(`Failed to extract valid JSON from model response: ${text.slice(0, 300)}...`);
}

export function parseStructuredOutput<T>(text: string, schema: z.ZodType<T>): T {
  const raw = extractJsonFromText(text);
  return schema.parse(raw);
}

