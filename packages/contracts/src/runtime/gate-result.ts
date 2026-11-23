import { z } from "zod";

export const GateStatusSchema = z.enum([
  "PASSED",
  "FAILED",
  "NOT_RUN",
  "SKIPPED",
  "SIMULATED",
]);

export type GateStatus = z.infer<typeof GateStatusSchema>;

export const GateStepSchema = z.enum([
  "TYPECHECK",
  "BUILD",
  "TESTS",
  "E2E",
  "REVIEW",
  "DEPLOY",
]);

export type GateStep = z.infer<typeof GateStepSchema>;

export const CompilerErrorSchema = z.object({
  filePath: z.string(),
  line: z.number(),
  column: z.number(),
  code: z.string(),
  message: z.string(),
});

export type CompilerError = z.infer<typeof CompilerErrorSchema>;

export const GateResultSchema = z.object({
  step: GateStepSchema,
  status: GateStatusSchema,
  success: z.boolean(),
  command: z.string().min(1, "command must not be empty"),
  exitCode: z.number().int(),
  durationMs: z.number().nonnegative(),
  logRef: z.string().min(1, "logRef must not be empty"),
  ranAt: z.string().min(1, "ranAt must not be empty"),
  stdout: z.string().default(""),
  stderr: z.string().default(""),
  errors: z.array(CompilerErrorSchema).optional(),
  journeysTested: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.status === "PASSED") {
    if (data.exitCode !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status PASSED must have exitCode === 0",
        path: ["exitCode"],
      });
    }
    if (!data.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status PASSED must have success === true",
        path: ["success"],
      });
    }
    if (!data.command || data.command.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status PASSED must have a non-empty command",
        path: ["command"],
      });
    }
    if (!data.logRef || data.logRef.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status PASSED must have a valid logRef",
        path: ["logRef"],
      });
    }
    if (!data.ranAt || data.ranAt.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status PASSED must have a valid ranAt timestamp",
        path: ["ranAt"],
      });
    }
  }

  if (data.status === "FAILED") {
    if (data.exitCode === 0 && data.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A gate reporting status FAILED cannot have exitCode 0 and success true",
        path: ["status"],
      });
    }
  }
});

export type GateResult = z.infer<typeof GateResultSchema>;

// Deprecated alias for backwards compatibility
export type BuildExecutionResult = GateResult;
