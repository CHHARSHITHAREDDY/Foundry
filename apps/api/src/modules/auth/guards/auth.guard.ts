import type { FastifyRequest, FastifyReply } from "fastify";
import { authService, StudioUser } from "../services/auth.service.js";
import { checkRateLimit } from "../services/rate-limit.service.js";

export const SESSION_COOKIE_NAME = "foundry_session";
export const CSRF_COOKIE_NAME = "foundry_csrf";
export const TRUSTED_DEVICE_COOKIE_NAME = "foundry_trusted_device";

export async function resolveOptionalAuth(req: FastifyRequest): Promise<{
  user: StudioUser;
  sessionId: string;
  csrfToken: string;
  viaCookie: boolean;
} | null> {
  const cookies = (req as any).cookies as Record<string, string> | undefined;
  const cookieToken = cookies?.[SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "")?.trim();

  const rawToken = cookieToken || bearerToken;
  if (!rawToken) return null;

  const session = await authService.getSessionByRawToken(rawToken);
  if (!session) return null;

  return {
    ...session,
    viaCookie: Boolean(cookieToken && rawToken === cookieToken),
  };
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<StudioUser | void> {
  const resolved = await resolveOptionalAuth(req);
  if (!resolved) {
    reply.status(401).send({
      statusCode: 401,
      error: "UNAUTHORIZED",
      message: "Authentication required.",
    });
    return;
  }

  // Enforce CSRF token on state-changing requests authenticated via cookie
  const method = req.method.toUpperCase();
  if (resolved.viaCookie && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const headerCsrf = (req.headers["x-csrf-token"] as string | undefined)?.trim();
    if (!headerCsrf || headerCsrf !== resolved.csrfToken) {
      reply.status(403).send({
        statusCode: 403,
        error: "CSRF_INVALID",
        message: "Invalid or missing CSRF token.",
      });
      return;
    }
  }

  (req as any).user = resolved.user;
  (req as any).sessionId = resolved.sessionId;
  (req as any).csrfToken = resolved.csrfToken;
  return resolved.user;
}

export async function requireRateLimit(
  req: FastifyRequest,
  reply: FastifyReply,
  bucket: string,
  maxRequests = 60,
  windowMs = 60_000
): Promise<boolean> {
  const userId = (req as any).user?.id || req.ip || "anon";
  const res = await checkRateLimit(`${bucket}:${userId}`, maxRequests, windowMs);
  if (!res.allowed) {
    reply.header("Retry-After", String(res.retryAfterSeconds));
    reply.status(429).send({
      statusCode: 429,
      error: "RATE_LIMITED",
      message: `Too many requests. Retry after ${res.retryAfterSeconds}s.`,
      retryAfter: res.retryAfterSeconds,
    });
    return false;
  }
  return true;
}

const dailyActionCounters = new Map<string, number>();

export function enforceRateLimitAndBudget(
  user: StudioUser,
  action: "surprise" | "build",
  costCredits: number,
  dailyLimit: number
): { allowed: boolean; error?: string; statusCode?: number } {
  const today = new Date().toISOString().slice(0, 10);
  const counterKey = `${user.id}:${action}:${today}`;
  const currentCount = dailyActionCounters.get(counterKey) || 0;

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

  dailyActionCounters.set(counterKey, currentCount + 1);
  return { allowed: true };
}
