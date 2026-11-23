import fs from "fs";
import path from "path";
import { z } from "zod";
import { LlmClient, ModelUsage } from "@venture-studio/llm-client";
import { buildRunner, CompilerError } from "../../sandbox/services/build-runner.service.js";
import { RealtimeEventHub } from "../../realtime/event-hub.js";
import { validatePatch } from "../../sandbox/security/patch-validator.js";

const RepairFixSchema = z.object({
  fixedContent: z.string().min(10),
  explanation: z.string(),
});

export interface RepairAttemptResult {
  attemptNumber: number;
  fixedFiles: string[];
  resolved: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  durationMs: number;
}

export class CodeRepairService {
  private static instance: CodeRepairService;
  private llm = new LlmClient();
  private hub = RealtimeEventHub.getInstance();

  public static getInstance(): CodeRepairService {
    if (!CodeRepairService.instance) {
      CodeRepairService.instance = new CodeRepairService();
    }
    return CodeRepairService.instance;
  }

  /**
   * Executes autonomous self-healing repair loop up to maxAttempts
   */
  async repairBuild(
    sandboxPath: string,
    initialErrors: CompilerError[],
    runId: string,
    maxAttempts: number = 3
  ): Promise<{
    repaired: boolean;
    attempts: RepairAttemptResult[];
    remainingErrors: CompilerError[];
    usage: ModelUsage;
  }> {
    let currentErrors = initialErrors;
    const attempts: RepairAttemptResult[] = [];
    let repairTokensIn = 0;
    let repairTokensOut = 0;
    let previousDiagHash: string | null = null;

    this.hub.broadcast("agent:log", {
      runId,
      stage: "INTEGRATING",
      level: "warn",
      message: `[REPAIR LOOP TRIGGERED] ${currentErrors.length} type errors detected. Initiating autonomous repair loop (Max ${maxAttempts} attempts)...`,
    }, runId);

    for (let attempt = 1; attempt <= maxAttempts && currentErrors.length > 0; attempt++) {
      const startTime = Date.now();
      const fixedFiles: string[] = [];

      // Check repeated diagnostics to stop early and prevent credit burn
      const currentDiagHash = currentErrors
        .map((e) => `${e.filePath}:${e.line}:${e.column}:${e.code}`)
        .sort()
        .join("|");
      if (attempt > 1 && currentDiagHash === previousDiagHash) {
        this.hub.broadcast("agent:log", {
          runId,
          stage: "INTEGRATING",
          level: "warn",
          message: `[REPAIR LOOP ABORTED] Repeated diagnostic hash detected on attempt ${attempt}. Halting repair loop.`,
        }, runId);
        break;
      }
      previousDiagHash = currentDiagHash;

      // Group errors by file
      const errorsByFile = new Map<string, CompilerError[]>();
      for (const err of currentErrors) {
        const list = errorsByFile.get(err.filePath) || [];
        list.push(err);
        errorsByFile.set(err.filePath, list);
      }

      // Bounded repair: max 6 files per attempt
      const filesToRepair = Array.from(errorsByFile.entries()).slice(0, 6);

      for (const [relPath, fileErrors] of filesToRepair) {
        const fullPath = path.join(sandboxPath, relPath);
        if (!fs.existsSync(fullPath)) continue;

        const currentContent = fs.readFileSync(fullPath, "utf-8");
        const errorDescriptions = fileErrors
          .map((e) => `Line ${e.line}:${e.column} [${e.code}]: ${e.message}`)
          .join("\n");

        const prompt = `You are the Autonomous Code Repair Agent.
A TypeScript compiler error occurred during the build in file "${relPath}":

ERRORS:
${errorDescriptions}

CURRENT FILE CONTENT:
${currentContent}

REQUIREMENTS:
1. Fix the syntax, type annotations, imports, or return values causing the errors.
2. Maintain strict TypeScript strict: true compliance.
3. Return the entire corrected file content.

Return JSON in this format:
{
  "fixedContent": "<corrected_typescript_code>",
  "explanation": "<brief summary of fix>"
}`;

        try {
          const { data: result, usage } = await this.llm.completeStructured(
            {
              tier: "coder",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
            },
            RepairFixSchema
          );
          repairTokensIn += usage.promptTokens;
          repairTokensOut += usage.completionTokens;

          if (result && result.fixedContent) {
            validatePatch(relPath, result.fixedContent, sandboxPath);
            fs.writeFileSync(fullPath, result.fixedContent, "utf-8");
            fixedFiles.push(relPath);
            this.hub.broadcast("agent:log", {
              runId,
              stage: "INTEGRATING",
              level: "info",
              message: `[REPAIR ATTEMPT ${attempt}] Patched ${relPath}: ${result.explanation}`,
            }, runId);
          }
        } catch (repairErr: any) {
          // If LLM completion is unavailable or patch rejected, apply common deterministic heuristics
          try {
            this.applyHeuristicFixes(fullPath, relPath, sandboxPath, currentContent, fileErrors);
            fixedFiles.push(relPath);
          } catch {}
        }
      }

      // Re-run type check to verify if errors were resolved
      const checkResult = await buildRunner.runTypeCheck(sandboxPath);
      const errorCountBefore = currentErrors.length;
      currentErrors = checkResult.errors || [];

      attempts.push({
        attemptNumber: attempt,
        fixedFiles,
        resolved: checkResult.success,
        errorCountBefore,
        errorCountAfter: currentErrors.length,
        durationMs: Date.now() - startTime,
      });

      if (checkResult.success) {
        this.hub.broadcast("agent:log", {
          runId,
          stage: "INTEGRATING",
          level: "info",
          message: `[REPAIR SUCCESS] All TypeScript errors resolved on attempt ${attempt} (${Date.now() - startTime}ms)!`,
        }, runId);
        return {
          repaired: true,
          attempts,
          remainingErrors: [],
          usage: { promptTokens: repairTokensIn, completionTokens: repairTokensOut, totalTokens: repairTokensIn + repairTokensOut },
        };
      }
    }

    return {
      repaired: currentErrors.length === 0,
      attempts,
      remainingErrors: currentErrors,
      usage: { promptTokens: repairTokensIn, completionTokens: repairTokensOut, totalTokens: repairTokensIn + repairTokensOut },
    };
  }

  /**
   * Deterministic heuristics for common Next.js / TypeScript errors
   */
  private applyHeuristicFixes(
    fullPath: string,
    relPath: string,
    sandboxPath: string,
    content: string,
    errors: CompilerError[]
  ): void {
    let fixed = content;

    for (const err of errors) {
      // Fix missing React import
      if (err.code === "TS2686" && !fixed.includes("import React")) {
        fixed = `import React from 'react';\n` + fixed;
      }
      // Fix missing JSX intrinsic elements
      if (err.code === "TS2742" && !fixed.includes("/// <reference types=\"next\" />")) {
        fixed = `/// <reference types="next" />\n` + fixed;
      }
      // Fix unresolved Link or Image
      if (err.message.includes("Cannot find name 'Link'") && !fixed.includes("from \"next/link\"")) {
        fixed = `import Link from 'next/link';\n` + fixed;
      }
    }

    validatePatch(relPath, fixed, sandboxPath);
    fs.writeFileSync(fullPath, fixed, "utf-8");
  }
}

export const codeRepair = CodeRepairService.getInstance();
