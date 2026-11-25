import path from "path";
import fs from "fs";
import { validatePatch } from "../security/patch-validator.js";

export interface SandboxExecutionResult {
  runId: string;
  sandboxPath: string;
  filesWritten: number;
  buildStatus: "success" | "failed";
  durationMs: number;
  artifacts: string[];
}

export class SandboxService {
  private baseDir: string;
  private templateDir: string;

  constructor() {
    const rootDir = process.cwd().includes("apps")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();
    this.baseDir = path.resolve(rootDir, "builds");
    this.templateDir = path.resolve(rootDir, "packages/templates/nextjs-saas");
  }

  async hydrateSandbox(
    runId: string,
    files: Record<string, string>,
    buildSpec?: any
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const sandboxPath = path.join(this.baseDir, runId);

    // 1. Ensure directory exists
    if (!fs.existsSync(sandboxPath)) {
      fs.mkdirSync(sandboxPath, { recursive: true });
    }

    const artifacts: string[] = [];

    // 2. Hydrate from golden nextjs-saas template
    if (fs.existsSync(this.templateDir)) {
      this.copyTemplateFiles(this.templateDir, sandboxPath, artifacts);

      // Link node_modules from golden template to eliminate network install
      const templateModules = path.join(this.templateDir, "node_modules");
      const sandboxModules = path.join(sandboxPath, "node_modules");
      if (fs.existsSync(templateModules) && !fs.existsSync(sandboxModules)) {
        try {
          fs.symlinkSync(templateModules, sandboxModules, "junction");
        } catch {
          // Fallback if junction not supported
        }
      }
    }

    // 3. Write build-spec.json
    if (buildSpec) {
      const specPath = path.join(sandboxPath, "build-spec.json");
      fs.writeFileSync(specPath, JSON.stringify(buildSpec, null, 2), "utf-8");
      artifacts.push("build-spec.json");
    }

    // 4. Write .env.local
    const envPath = path.join(sandboxPath, ".env.local");
    fs.writeFileSync(
      envPath,
      `DATABASE_URL="file:./dev.db"\nNEXT_PUBLIC_APP_URL="https://${runId}.foundry.studio"\n`,
      "utf-8"
    );
    artifacts.push(".env.local");

    // 5. Overlay synthesized files with strict shared patch validation
    const resolvedSandboxBase = path.resolve(sandboxPath);

    for (const [relativePath, content] of Object.entries(files)) {
      if (!relativePath || typeof relativePath !== "string") {
        continue;
      }

      // Validates path, extensions, traversal, reserved names, file size, @ts-ignore, mass 'as any', and symlinks
      validatePatch(relativePath, content, resolvedSandboxBase);

      const fullPath = path.resolve(resolvedSandboxBase, relativePath);
      const dirName = path.dirname(fullPath);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, "utf-8");
      artifacts.push(relativePath);
    }

    return {
      runId,
      sandboxPath,
      filesWritten: artifacts.length,
      buildStatus: "success",
      durationMs: Date.now() - startTime,
      artifacts,
    };
  }

  private copyTemplateFiles(src: string, dest: string, artifacts: string[], relativeRoot: string = ""): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".studio" || entry.name === ".git" || entry.name === ".next") {
        continue;
      }

      const relPath = path.join(relativeRoot, entry.name).replace(/\\/g, "/");

      // Option A: Omit preset application pages, demo marketing sections, and mock schema
      // so the Autonomous Coding Agent authors 100% bespoke code for the venture.
      if (
        relPath === "src/app/page.tsx" ||
        relPath.startsWith("src/app/(app)") ||
        relPath.startsWith("src/components/landing") ||
        relPath.startsWith("src/components/app") ||
        relPath === "src/db/schema/app.ts"
      ) {
        continue;
      }

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        this.copyTemplateFiles(srcPath, destPath, artifacts, relPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        artifacts.push(path.relative(this.baseDir, destPath));
      }
    }
  }
}

export const sandboxService = new SandboxService();
