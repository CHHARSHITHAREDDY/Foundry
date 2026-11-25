import { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  VerifyEmailRequestSchema,
  ResendVerificationRequestSchema,
  TwoFactorVerifyRequestSchema,
  TwoFactorDisableRequestSchema,
} from "@venture-studio/contracts";
import {
  authService,
  AuthError,
  PASSWORD_POLICY,
} from "./services/auth.service.js";
import {
  requireAuth,
  resolveOptionalAuth,
  requireRateLimit,
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  TRUSTED_DEVICE_COOKIE_NAME,
} from "./guards/auth.guard.js";
import { prismaDatabase } from "../../db/prisma.service.js";

function setSessionCookies(reply: any, sessionToken: string, csrfToken: string, expiresAt: Date) {
  const isProd = process.env.NODE_ENV === "production";
  reply.setCookie(SESSION_COOKIE_NAME, sessionToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires: expiresAt,
  });
  reply.setCookie(CSRF_COOKIE_NAME, csrfToken, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    expires: expiresAt,
  });
}

function clearSessionCookies(reply: any) {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  reply.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
}

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof AuthError) {
      return reply.status(err.statusCode).send({
        statusCode: err.statusCode,
        error: err.code,
        message: err.message,
        retryAfter: err.retryAfter,
      });
    }
    if (err?.name === "ZodError") {
      return reply.status(400).send({
        statusCode: 400,
        error: "VALIDATION_ERROR",
        message: err.errors?.[0]?.message || "Invalid input",
        issues: err.errors,
      });
    }
    throw err;
  });

  app.get("/me", async (req, reply) => {
    const resolved = await resolveOptionalAuth(req);
    if (!resolved) {
      return reply.status(200).send({
        authenticated: false,
        user: null,
        oauthProviders: authService.getOAuthProviders(),
        passwordPolicy: PASSWORD_POLICY,
      });
    }
    return reply.send({
      authenticated: true,
      user: resolved.user,
      csrfToken: resolved.csrfToken,
      oauthProviders: authService.getOAuthProviders(),
      passwordPolicy: PASSWORD_POLICY,
    });
  });

  app.post("/register", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:register", 10, 60_000))) return;
    const body = RegisterRequestSchema.parse(req.body);
    const result = await authService.register({
      email: body.email,
      name: body.name,
      password: body.password,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    return reply.status(201).send({
      user: result.user,
      verificationRequired: true,
      cooldownSeconds: result.cooldownSeconds,
      message: "Account created. Check your inbox to verify your email.",
    });
  });

  app.post("/login", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:login", 20, 60_000))) return;
    const body = LoginRequestSchema.parse(req.body);
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    const trustedDeviceToken = cookies?.[TRUSTED_DEVICE_COOKIE_NAME];

    const result = await authService.login({
      email: body.email,
      password: body.password,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      trustedDeviceToken,
    });

    if (result.requiresTwoFactor) {
      return reply.send({
        authenticated: false,
        requiresTwoFactor: true,
        challengeToken: result.challengeToken,
      });
    }

    setSessionCookies(reply, result.sessionToken, result.csrfToken, result.expiresAt);
    return reply.send({
      authenticated: true,
      requiresTwoFactor: false,
      user: result.user,
      csrfToken: result.csrfToken,
    });
  });

  app.post("/logout", async (req, reply) => {
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    const rawToken = cookies?.[SESSION_COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (rawToken) {
      await authService.logout(rawToken);
    }
    clearSessionCookies(reply);
    return reply.send({ success: true });
  });

  app.post("/refresh", async (req, reply) => {
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    const rawToken = cookies?.[SESSION_COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!rawToken) {
      return reply.status(401).send({ statusCode: 401, error: "UNAUTHORIZED", message: "No active session." });
    }
    const refreshed = await authService.refreshSession(rawToken);
    if (!refreshed) {
      clearSessionCookies(reply);
      return reply.status(401).send({ statusCode: 401, error: "UNAUTHORIZED", message: "Session expired." });
    }
    setSessionCookies(reply, rawToken, refreshed.csrfToken, refreshed.expiresAt);
    return reply.send({ authenticated: true, user: refreshed.user, csrfToken: refreshed.csrfToken });
  });

  app.post("/verify-email", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:verify-email", 20, 60_000))) return;
    const body = VerifyEmailRequestSchema.parse(req.body);
    const user = await authService.verifyEmail(body.token);
    return reply.send({ verified: true, user });
  });

  app.post("/resend-verification", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:resend", 10, 60_000))) return;
    const body = ResendVerificationRequestSchema.parse(req.body || {});
    const resolved = await resolveOptionalAuth(req);
    const res = await authService.resendVerification({
      email: body.email,
      userId: resolved?.user.id,
    });
    return reply.send({ sent: true, cooldownSeconds: res.cooldownSeconds });
  });

  app.post("/forgot-password", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:forgot", 10, 60_000))) return;
    const body = ForgotPasswordRequestSchema.parse(req.body);
    await authService.forgotPassword(body.email);
    return reply.send({ message: "If an account exists for that email, a reset link has been sent." });
  });

  app.post("/reset-password", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:reset", 10, 60_000))) return;
    const body = ResetPasswordRequestSchema.parse(req.body);
    await authService.resetPassword(body.token, body.password);
    return reply.send({ reset: true, message: "Password updated. You can now sign in." });
  });

  app.post("/2fa/setup", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "auth:2fa-setup", 10, 60_000))) return;
    const setup = await authService.setupTwoFactor(user.id, user.email);
    return reply.send(setup);
  });

  app.post("/2fa/verify", async (req, reply) => {
    if (!(await requireRateLimit(req, reply, "auth:2fa-verify", 15, 60_000))) return;
    const body = TwoFactorVerifyRequestSchema.parse(req.body);
    const resolved = await resolveOptionalAuth(req);

    const res = await authService.verifyTwoFactor({
      userId: resolved?.user.id,
      challengeToken: body.challengeToken,
      code: body.code,
      isRecoveryCode: body.isRecoveryCode,
      trustDevice: body.trustDevice,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    if (res.sessionToken && res.csrfToken && res.expiresAt) {
      setSessionCookies(reply, res.sessionToken, res.csrfToken, res.expiresAt);
      if (res.trustedDeviceToken) {
        reply.setCookie(TRUSTED_DEVICE_COOKIE_NAME, res.trustedDeviceToken, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    }

    return reply.send({
      verified: true,
      authenticated: Boolean(res.user || resolved),
      user: res.user || resolved?.user,
      csrfToken: res.csrfToken || resolved?.csrfToken,
    });
  });

  app.post("/2fa/disable", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "auth:2fa-disable", 10, 60_000))) return;
    const body = TwoFactorDisableRequestSchema.parse(req.body);
    await authService.disableTwoFactor(user.id, body.password);
    return reply.send({ disabled: true });
  });

  app.get("/sessions", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    const currentSessionId = (req as any).sessionId;
    const sessions = await authService.listSessions(user.id, currentSessionId);
    return reply.send({ sessions });
  });

  app.delete("/sessions/:id", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "auth:revoke-session", 20, 60_000))) return;
    const { id } = req.params as { id: string };
    await authService.revokeSession(user.id, id);
    return reply.send({ revoked: true, id });
  });
};

export const devOutboxRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/outbox", async (req, reply) => {
    if (process.env.NODE_ENV === "production") {
      return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Not available in production" });
    }
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.send({ emails: [] });
    const { to } = req.query as { to?: string };
    const emails = await prisma.devOutbox.findMany({
      where: to ? { to: to.toLowerCase() } : undefined,
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    return reply.send({ emails });
  });
};
