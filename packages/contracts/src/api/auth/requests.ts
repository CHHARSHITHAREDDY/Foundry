import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(10, "Verification token is required"),
});

export const ResendVerificationRequestSchema = z.object({
  email: z.string().email().optional(),
});

export const TwoFactorVerifyRequestSchema = z.object({
  code: z.string().min(6, "6-digit code or recovery code is required").max(32),
  challengeToken: z.string().optional(),
  trustDevice: z.boolean().optional().default(false),
  isRecoveryCode: z.boolean().optional().default(false),
});

export const TwoFactorDisableRequestSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;
export type ResendVerificationRequest = z.infer<typeof ResendVerificationRequestSchema>;
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifyRequestSchema>;
export type TwoFactorDisableRequest = z.infer<typeof TwoFactorDisableRequestSchema>;
