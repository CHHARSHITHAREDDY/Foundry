import crypto from "crypto";
import argon2 from "argon2";
import { prismaDatabase } from "../../../db/prisma.service.js";
import { emailDeliveryService } from "./email.service.js";
import {
  buildOtpAuthUri,
  generateBase32Secret,
  generateRecoveryCodes,
  verifyTotpCode,
} from "./totp.service.js";

export interface StudioUser {
  id: string;
  email: string;
  name: string;
  role: "FOUNDER" | "ADMIN" | "MEMBER";
  credits: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  demo: boolean;
  createdAt: string;
}

export class AuthError extends Error {
  statusCode: number;
  code: string;
  retryAfter?: number;

  constructor(message: string, statusCode = 400, code = "AUTH_ERROR", retryAfter?: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  description: "Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.",
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60;
const SESSION_TTL_DAYS = 7;
const TRUSTED_DEVICE_DAYS = 30;
const RESEND_COOLDOWN_SECONDS = 60;

function sha256(val: string): string {
  return crypto.createHash("sha256").update(val).digest("hex");
}

function mapUser(u: any): StudioUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    credits: u.credits,
    emailVerified: Boolean(u.emailVerifiedAt),
    twoFactorEnabled: Boolean(u.twoFactorEnabled),
    demo: Boolean(u.demo),
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
  };
}

export class AuthService {
  private secret: string;

  constructor() {
    this.secret =
      process.env.JWT_SECRET ||
      process.env.LITELLM_MASTER_KEY ||
      "foundry-session-hmac-secret-dev-only-change-in-prod";
  }

  getOAuthProviders() {
    return {
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    };
  }

  async register(params: {
    email: string;
    name: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: StudioUser; cooldownSeconds: number }> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const normalizedEmail = params.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new AuthError("An account with this email already exists.", 409, "EMAIL_TAKEN");
    }

    const passwordHash = await argon2.hash(params.password, { type: argon2.argon2id });

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: params.name.trim(),
          role: "FOUNDER",
          credits: 20,
          passwordHash,
        },
      });

      await tx.creditLedger.create({
        data: {
          idempotencyKey: `signup:${user.id}`,
          userId: user.id,
          action: "BONUS",
          amount: 20,
          balance: 20,
          reason: "SIGNUP_WELCOME_BONUS",
        },
      });

      await tx.auditLog.create({
        data: {
          actor: user.id,
          action: "AUTH_REGISTER",
          target: user.id,
          metadata: { email: normalizedEmail, ipAddress: params.ipAddress },
        },
      });

      return user;
    });

    await this.issueEmailVerification(created.id, created.email);
    return { user: mapUser(created), cooldownSeconds: RESEND_COOLDOWN_SECONDS };
  }

  async issueEmailVerification(userId: string, email: string): Promise<number> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.emailVerification.create({
      data: {
        userId,
        tokenHash: sha256(rawToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${appUrl.replace(/\/+$/, "")}/verify-email?token=${rawToken}`;
    await emailDeliveryService.send({
      to: email,
      subject: "Verify your Foundry email address",
      body: `Click the link below to verify your email address and activate your Foundry workspace.`,
      link,
      type: "VERIFY_EMAIL",
    });

    return RESEND_COOLDOWN_SECONDS;
  }

  async resendVerification(emailOrUserId: { email?: string; userId?: string }): Promise<{ cooldownSeconds: number }> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const user = emailOrUserId.userId
      ? await prisma.user.findUnique({ where: { id: emailOrUserId.userId } })
      : emailOrUserId.email
      ? await prisma.user.findUnique({ where: { email: emailOrUserId.email.trim().toLowerCase() } })
      : null;

    if (!user) {
      return { cooldownSeconds: RESEND_COOLDOWN_SECONDS };
    }
    if (user.emailVerifiedAt) {
      throw new AuthError("Email is already verified.", 400, "ALREADY_VERIFIED");
    }

    const latest = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (latest) {
      const elapsed = Math.floor((Date.now() - latest.createdAt.getTime()) / 1000);
      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        const remaining = RESEND_COOLDOWN_SECONDS - elapsed;
        throw new AuthError(
          `Please wait ${remaining}s before requesting another verification email.`,
          429,
          "COOLDOWN_ACTIVE",
          remaining
        );
      }
    }

    await this.issueEmailVerification(user.id, user.email);
    return { cooldownSeconds: RESEND_COOLDOWN_SECONDS };
  }

  async verifyEmail(rawToken: string): Promise<StudioUser> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const record = await prisma.emailVerification.findUnique({
      where: { tokenHash: sha256(rawToken) },
      include: { user: true },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new AuthError("Verification link is invalid or expired.", 400, "INVALID_TOKEN");
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.emailVerification.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      const u = await tx.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      });
      await tx.auditLog.create({
        data: { actor: u.id, action: "AUTH_VERIFY_EMAIL", target: u.id },
      });
      return u;
    });

    return mapUser(updatedUser);
  }

  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
    trustedDeviceToken?: string;
  }): Promise<
    | { requiresTwoFactor: true; challengeToken: string }
    | { requiresTwoFactor: false; user: StudioUser; sessionToken: string; csrfToken: string; expiresAt: Date }
  > {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const normalizedEmail = params.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.passwordHash) {
      throw new AuthError("email or password incorrect", 401, "INVALID_CREDENTIALS");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const retryAfter = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000));
      throw new AuthError("Account temporarily locked due to too many failed attempts.", 423, "ACCOUNT_LOCKED", retryAfter);
    }

    const valid = await argon2.verify(user.passwordHash, params.password);
    if (!valid) {
      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_SECONDS * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : nextAttempts,
          lockedUntil,
        },
      });

      await prisma.auditLog.create({
        data: {
          actor: user.id,
          action: shouldLock ? "AUTH_LOCKOUT" : "AUTH_LOGIN_FAILED",
          target: user.id,
          metadata: { ipAddress: params.ipAddress, attempts: nextAttempts },
        },
      });

      if (shouldLock) {
        throw new AuthError(
          "Account temporarily locked due to too many failed attempts.",
          423,
          "ACCOUNT_LOCKED",
          LOCKOUT_SECONDS
        );
      }
      throw new AuthError("email or password incorrect", 401, "INVALID_CREDENTIALS");
    }

    // Reset failed attempts on valid password
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Check 2FA requirement unless trusted device cookie matches
    if (user.twoFactorEnabled) {
      let deviceTrusted = false;
      if (params.trustedDeviceToken) {
        const expected = crypto
          .createHmac("sha256", this.secret)
          .update(`trusted:${user.id}`)
          .digest("hex");
        if (params.trustedDeviceToken === expected) {
          deviceTrusted = true;
        }
      }
      if (!deviceTrusted) {
        const challengePayload = Buffer.from(
          JSON.stringify({ uid: user.id, exp: Date.now() + 10 * 60 * 1000 })
        ).toString("base64url");
        const sig = crypto.createHmac("sha256", this.secret).update(challengePayload).digest("base64url");
        return { requiresTwoFactor: true, challengeToken: `${challengePayload}.${sig}` };
      }
    }

    const session = await this.createSession(user.id, params.ipAddress, params.userAgent);
    await prisma.auditLog.create({
      data: {
        actor: user.id,
        action: "AUTH_LOGIN",
        target: session.id,
        metadata: { ipAddress: params.ipAddress },
      },
    });

    return {
      requiresTwoFactor: false,
      user: mapUser(user),
      sessionToken: session.rawToken,
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt,
    };
  }

  private async createSession(userId: string, ipAddress?: string, userAgent?: string, trustDevice = false) {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const rawToken = crypto.randomBytes(32).toString("hex");
    const csrfToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    const trustedDeviceUntil = trustDevice
      ? new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const session = await prisma.session.create({
      data: {
        userId,
        tokenHash: sha256(rawToken),
        csrfToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        trustedDeviceUntil,
        expiresAt,
      },
    });

    return { id: session.id, rawToken, csrfToken, expiresAt };
  }

  async getSessionByRawToken(rawToken: string): Promise<{ user: StudioUser; sessionId: string; csrfToken: string } | null> {
    if (!rawToken) return null;
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: sha256(rawToken) },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    return {
      user: mapUser(session.user),
      sessionId: session.id,
      csrfToken: session.csrfToken,
    };
  }

  async refreshSession(rawToken: string): Promise<{ user: StudioUser; expiresAt: Date; csrfToken: string } | null> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma || !rawToken) return null;

    const existing = await prisma.session.findUnique({
      where: { tokenHash: sha256(rawToken) },
      include: { user: true },
    });
    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      return null;
    }

    const newExpires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.session.update({
      where: { id: existing.id },
      data: { expiresAt: newExpires },
    });

    return { user: mapUser(existing.user), expiresAt: newExpires, csrfToken: existing.csrfToken };
  }

  async logout(rawToken: string): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma || !rawToken) return;

    const session = await prisma.session.findUnique({ where: { tokenHash: sha256(rawToken) } });
    if (session && !session.revokedAt) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      await prisma.auditLog.create({
        data: { actor: session.userId, action: "AUTH_LOGOUT", target: session.id },
      });
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return;

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: sha256(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${appUrl.replace(/\/+$/, "")}/reset-password?token=${rawToken}`;
    await emailDeliveryService.send({
      to: user.email,
      subject: "Reset your Foundry password",
      body: "Use this link to reset your password. It expires in 1 hour.",
      link,
      type: "PASSWORD_RESET",
    });

    await prisma.auditLog.create({
      data: { actor: user.id, action: "AUTH_FORGOT_PASSWORD", target: user.id },
    });
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const reset = await prisma.passwordReset.findUnique({
      where: { tokenHash: sha256(rawToken) },
    });

    if (!reset || reset.consumedAt || reset.expiresAt < new Date()) {
      throw new AuthError("Password reset link is invalid or expired.", 400, "INVALID_TOKEN");
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.update({
        where: { id: reset.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: reset.userId },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      });
      await tx.session.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.auditLog.create({
        data: { actor: reset.userId, action: "AUTH_RESET_PASSWORD", target: reset.userId },
      });
    });
  }

  async setupTwoFactor(userId: string, email: string): Promise<{ secret: string; otpauthUri: string; recoveryCodes: string[] }> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const secret = generateBase32Secret(20);
    const recoveryCodes = generateRecoveryCodes(8);
    const hashedCodes = recoveryCodes.map((c) => sha256(c.toUpperCase()));

    await prisma.twoFactor.upsert({
      where: { userId },
      create: { userId, secret, recoveryCodes: hashedCodes, enabled: false },
      update: { secret, recoveryCodes: hashedCodes, enabled: false },
    });

    return {
      secret,
      otpauthUri: buildOtpAuthUri(email, secret),
      recoveryCodes,
    };
  }

  async verifyTwoFactor(params: {
    userId?: string;
    challengeToken?: string;
    code: string;
    isRecoveryCode?: boolean;
    trustDevice?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    verified: boolean;
    user?: StudioUser;
    sessionToken?: string;
    csrfToken?: string;
    expiresAt?: Date;
    trustedDeviceToken?: string;
  }> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    let targetUserId = params.userId;
    const isLoginChallenge = Boolean(params.challengeToken && !targetUserId);

    if (params.challengeToken) {
      const [payloadB64, sig] = params.challengeToken.split(".");
      if (!payloadB64 || !sig) throw new AuthError("Invalid 2FA challenge", 401, "INVALID_CHALLENGE");
      const expectedSig = crypto.createHmac("sha256", this.secret).update(payloadB64).digest("base64url");
      if (sig !== expectedSig) throw new AuthError("Invalid 2FA challenge", 401, "INVALID_CHALLENGE");
      const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
      if (parsed.exp < Date.now()) throw new AuthError("2FA challenge expired", 401, "CHALLENGE_EXPIRED");
      targetUserId = parsed.uid;
    }

    if (!targetUserId) throw new AuthError("Authentication required", 401, "UNAUTHORIZED");

    const tf = await prisma.twoFactor.findUnique({ where: { userId: targetUserId } });
    if (!tf) throw new AuthError("2FA is not configured", 400, "TWO_FACTOR_NOT_SETUP");

    let valid = false;
    if (params.isRecoveryCode) {
      const codeHash = sha256(params.code.trim().toUpperCase());
      if (tf.recoveryCodes.includes(codeHash)) {
        valid = true;
        await prisma.twoFactor.update({
          where: { userId: targetUserId },
          data: { recoveryCodes: tf.recoveryCodes.filter((c) => c !== codeHash) },
        });
      }
    } else {
      valid = verifyTotpCode(tf.secret, params.code);
    }

    if (!valid) {
      throw new AuthError("Invalid verification code.", 401, "INVALID_2FA_CODE");
    }

    if (!tf.enabled) {
      await prisma.$transaction(async (tx) => {
        await tx.twoFactor.update({ where: { userId: targetUserId! }, data: { enabled: true } });
        await tx.user.update({ where: { id: targetUserId! }, data: { twoFactorEnabled: true } });
        await tx.auditLog.create({
          data: { actor: targetUserId!, action: "AUTH_2FA_ENABLED", target: targetUserId! },
        });
      });
    }

    if (isLoginChallenge) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!user) throw new AuthError("User not found", 404, "NOT_FOUND");

      const session = await this.createSession(user.id, params.ipAddress, params.userAgent, Boolean(params.trustDevice));
      const trustedDeviceToken = params.trustDevice
        ? crypto.createHmac("sha256", this.secret).update(`trusted:${user.id}`).digest("hex")
        : undefined;

      await prisma.auditLog.create({
        data: { actor: user.id, action: "AUTH_LOGIN_2FA", target: session.id },
      });

      return {
        verified: true,
        user: mapUser(user),
        sessionToken: session.rawToken,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt,
        trustedDeviceToken,
      };
    }

    return { verified: true };
  }

  async disableTwoFactor(userId: string, password: string): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new AuthError("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new AuthError("Password is incorrect", 401, "INVALID_CREDENTIALS");

    await prisma.$transaction(async (tx) => {
      await tx.twoFactor.deleteMany({ where: { userId } });
      await tx.user.update({ where: { id: userId }, data: { twoFactorEnabled: false } });
      await tx.auditLog.create({
        data: { actor: userId, action: "AUTH_2FA_DISABLED", target: userId },
      });
    });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const rows = await prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      current: s.id === currentSessionId,
      trustedDeviceUntil: s.trustedDeviceUntil ? s.trustedDeviceUntil.toISOString() : null,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) throw new AuthError("Database unavailable", 503, "DB_UNAVAILABLE");

    const target = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!target) {
      throw new AuthError("Session not found", 404, "NOT_FOUND");
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: { actor: userId, action: "AUTH_REVOKE_SESSION", target: sessionId },
    });
  }
}

export const authService = new AuthService();
