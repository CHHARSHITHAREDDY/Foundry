import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["FOUNDER", "ADMIN", "MEMBER"]),
  credits: z.number().int(),
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  demo: z.boolean().optional(),
  createdAt: z.string(),
});

export const PasswordPolicySchema = z.object({
  minLength: z.number().int(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumber: z.boolean(),
  description: z.string(),
});

export const AuthMeResponseSchema = z.object({
  authenticated: z.boolean(),
  user: AuthUserSchema.nullable(),
  csrfToken: z.string().optional(),
  oauthProviders: z.object({
    google: z.boolean(),
    github: z.boolean(),
  }),
  passwordPolicy: PasswordPolicySchema,
});

export const LoginResponseSchema = z.object({
  authenticated: z.boolean(),
  requiresTwoFactor: z.boolean().optional(),
  challengeToken: z.string().optional(),
  user: AuthUserSchema.optional(),
  csrfToken: z.string().optional(),
});

export const RegisterResponseSchema = z.object({
  user: AuthUserSchema,
  verificationRequired: z.boolean(),
  cooldownSeconds: z.number().int(),
  message: z.string(),
});

export const SessionItemSchema = z.object({
  id: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  current: z.boolean(),
  trustedDeviceUntil: z.string().nullable(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

export const SessionsListResponseSchema = z.object({
  sessions: z.array(SessionItemSchema),
});

export const TwoFactorSetupResponseSchema = z.object({
  secret: z.string(),
  otpauthUri: z.string(),
  recoveryCodes: z.array(z.string()),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type PasswordPolicy = z.infer<typeof PasswordPolicySchema>;
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type SessionItem = z.infer<typeof SessionItemSchema>;
export type SessionsListResponse = z.infer<typeof SessionsListResponseSchema>;
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;
