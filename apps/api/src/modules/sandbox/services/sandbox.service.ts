import path from "path";
import fs from "fs";

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

  constructor() {
    const rootDir = process.cwd().includes("apps")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();
    this.baseDir = path.resolve(rootDir, "builds");
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

    // 2. Write build-spec.json if provided
    if (buildSpec) {
      const specPath = path.join(sandboxPath, "build-spec.json");
      fs.writeFileSync(specPath, JSON.stringify(buildSpec, null, 2), "utf-8");
      artifacts.push("build-spec.json");
    }

    // 3. Ensure standard scaffolding files exist if not present in synthesized files
    const standardFiles: Record<string, string> = {
      "package.json": JSON.stringify(
        {
          name: `@venture/${runId.toLowerCase()}`,
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint",
          },
          dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            zod: "^3.23.8",
            clsx: "^2.1.1",
            "tailwind-merge": "^2.5.2",
            "lucide-react": "^0.441.0",
          },
          devDependencies: {
            typescript: "^5.6.0",
            "@types/node": "^20.14.9",
            "@types/react": "^19.0.0",
            "@types/react-dom": "^19.0.0",
            tailwindcss: "^3.4.4",
            postcss: "^8.4.38",
          },
        },
        null,
        2
      ),
      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./src/*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2
      ),
      "next.config.ts": `import type { NextConfig } from "next";\nconst nextConfig: NextConfig = { reactStrictMode: true };\nexport default nextConfig;\n`,
      "postcss.config.mjs": `export default { plugins: { tailwindcss: {} } };\n`,
      "tailwind.config.ts": `import type { Config } from "tailwindcss";\nconst config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx}"] };\nexport default config;\n`,
      ".env.example": `DATABASE_URL="file:./dev.db"\nSTRIPE_SECRET_KEY="sk_test_mock"\nNEXT_PUBLIC_APP_URL="https://${runId}.foundry.studio"\n`,
    };

    // Combine standard files with synthesized files
    const allFiles = { ...standardFiles, ...files };

    // 4. Physically write every file to disk
    for (const [relativePath, content] of Object.entries(allFiles)) {
      const fullPath = path.join(sandboxPath, relativePath);
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
}

export const sandboxService = new SandboxService();
