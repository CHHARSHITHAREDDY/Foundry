import type { FastifyRequest, FastifyReply } from "fastify";
import { authService, StudioUser } from "../services/auth.service.js";

// Daily rate limit counters: key = `${userId}:${action}:${YYYY-MM-DD}`
const dailyCounters = new Map<string, number>();

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<StudioUser | void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();

  if (!token) {
    reply.status(401).send({
      statusCode: 401,
      error: "UNAUTHORIZED",
      message: "Authentication required: Missing Bearer token in Authorization header.",
    });
    return;
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    reply.status(401).send({
      statusCode: 401,
      error: "UNAUTHORIZED",
      message: "Authentication failed: Invalid or expired Bearer token.",
    });
    return;
  }

  const user = await authService.getCurrentUser(token);
  (req as any).user = user;
  return user;
}

export function enforceRateLimitAndBudget(
  user: StudioUser,
  action: "surprise" | "build",
  costCredits: number,
  dailyLimit: number
): { allowed: boolean; error?: string; statusCode?: number } {
  const today = new Date().toISOString().slice(0, 10);
  const counterKey = `${user.id}:${action}:${today}`;
  const currentCount = dailyCounters.get(counterKey) || 0;

  if (currentCount >= dailyLimit) {
    return {
      allowed: false,
      statusCode: 429,
      error: `Daily rate limit of ${dailyLimit} ${action} operations reached for user ${user.email}.`,
    };
  }

  if (user.credits < costCredits) {
    return {
      allowed: false,
      statusCode: 402,
      error: `Insufficient credits. Action '${action}' requires ${costCredits} credits, but current balance is ${user.credits}.`,
    };
  }

  // Deduct credits and increment daily counter
  user.credits -= costCredits;
  dailyCounters.set(counterKey, currentCount + 1);

  return { allowed: true };
}
