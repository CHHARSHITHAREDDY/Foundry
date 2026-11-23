import path from "path";
import fs from "fs";

export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityViolationError";
  }
}

const RESERVED_DEVICE_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
const PROTECTED_EXACT_FILES = new Set([
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "tsconfig.json",
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".ps1",
  ".dll",
  ".so",
  ".vbs",
  ".bin",
  ".com",
  ".msi",
  ".vba",
]);

/**
 * Validates a patch before applying it to the sandbox.
 * Rejects illegal paths, traversal, Windows device names, protected framework files,
 * files over 200KB, compiler-silencing annotations, mass 'as any', symlink escapes,
 * and deletion patches.
 */
export function validatePatch(
  filePath: string,
  content: string | null | undefined,
  sandboxDir?: string
): void {
  // 1. Basic path validations
  if (!filePath || typeof filePath !== "string") {
    throw new SecurityViolationError("Patch path must be a non-empty string.");
  }

  // Reject backslashes or mixed slashes (forward slashes only)
  if (filePath.includes("\\")) {
    throw new SecurityViolationError(
      `Security Violation: Backslashes or mixed slashes not allowed in patch path: '${filePath}'. Use forward slashes only.`
    );
  }

  // Reject absolute paths
  if (filePath.startsWith("/") || /^[a-zA-Z]:/.test(filePath)) {
    throw new SecurityViolationError(
      `Security Violation: Absolute paths not allowed: '${filePath}'. Use relative paths inside the sandbox.`
    );
  }

  // Reject null byte
  if (filePath.includes("\0")) {
    throw new SecurityViolationError(
      `Security Violation: Null byte detected in patch path: '${filePath}'.`
    );
  }

  // Reject NTFS alternate data streams
  if (filePath.includes(":")) {
    throw new SecurityViolationError(
      `Security Violation: NTFS alternate data stream or colon detected: '${filePath}'.`
    );
  }

  const segments = filePath.split("/").filter(Boolean);

  // Reject directory traversal
  for (const seg of segments) {
    if (seg === ".." || seg === ".") {
      throw new SecurityViolationError(
        `Security Violation: Directory traversal '${seg}' detected in relative path: '${filePath}'.`
      );
    }
  }

  // Reject Windows reserved device names
  for (const seg of segments) {
    if (RESERVED_DEVICE_NAMES.test(seg)) {
      throw new SecurityViolationError(
        `Security Violation: Windows reserved device name detected: '${seg}' in path '${filePath}'.`
      );
    }
  }

  // Reject blocked extensions
  const ext = path.posix.extname(filePath).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new SecurityViolationError(
      `Security Violation: Disallowed file extension '${ext}' for path '${filePath}'.`
    );
  }

  // Reject protected framework files
  const baseName = path.posix.basename(filePath);
  if (PROTECTED_EXACT_FILES.has(baseName)) {
    throw new SecurityViolationError(
      `Security Violation: Modifying protected framework file '${baseName}' is strictly prohibited.`
    );
  }

  if (baseName.startsWith("next.config.")) {
    throw new SecurityViolationError(
      `Security Violation: Modifying Next.js configuration '${baseName}' is strictly prohibited.`
    );
  }

  if (baseName.startsWith(".env")) {
    throw new SecurityViolationError(
      `Security Violation: Direct modification of environment files '${baseName}' is prohibited.`
    );
  }

  // Reject critical security paths
  if (filePath.startsWith("src/lib/auth/") || filePath.startsWith("lib/auth/")) {
    throw new SecurityViolationError(
      `Security Violation: Modifying authentication subsystem files under 'src/lib/auth/' is strictly prohibited.`
    );
  }

  if (filePath.startsWith(".git/") || filePath.startsWith("node_modules/")) {
    throw new SecurityViolationError(
      `Security Violation: Modifying '${filePath}' in protected segment is prohibited.`
    );
  }

  // 2. Content validations
  // Reject deletion patches
  if (content === null || content === undefined || content.trim() === "") {
    throw new SecurityViolationError(
      `Security Violation: File deletion patches or empty file updates are forbidden for '${filePath}'.`
    );
  }

  // Reject files over 200KB
  const byteSize = Buffer.byteLength(content, "utf-8");
  if (byteSize > 200 * 1024) {
    throw new SecurityViolationError(
      `Security Violation: File size exceeds 200KB limit (${Math.round(byteSize / 1024)}KB) for '${filePath}'.`
    );
  }

  // Reject compiler-silencing directives
  if (/@ts-ignore|@ts-nocheck|eslint-disable/.test(content)) {
    throw new SecurityViolationError(
      `Security Violation: Compiler-silencing directives (@ts-ignore, @ts-nocheck, eslint-disable) are forbidden in '${filePath}'.`
    );
  }

  // Reject mass 'as any'
  const asAnyMatches = (content.match(/\bas\s+any\b/g) || []).length;
  if (asAnyMatches > 2) {
    throw new SecurityViolationError(
      `Security Violation: Mass 'as any' type casts detected (${asAnyMatches} occurrences, max allowed: 2) in '${filePath}'.`
    );
  }

  // 3. Symlink and jail constraint checks (if sandbox directory is provided)
  if (sandboxDir) {
    const resolvedBase = path.resolve(sandboxDir);
    const resolvedTarget = path.resolve(resolvedBase, filePath);

    if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
      throw new SecurityViolationError(
        `Security Violation: Path traversal resolves outside sandbox boundary: '${filePath}'.`
      );
    }

    // Check if target or any existing ancestor is a symlink pointing outside sandbox
    let currentCheck = resolvedTarget;
    while (currentCheck && currentCheck !== resolvedBase) {
      if (fs.existsSync(currentCheck)) {
        try {
          const lstat = fs.lstatSync(currentCheck);
          if (lstat.isSymbolicLink()) {
            const real = fs.realpathSync(currentCheck);
            if (!real.startsWith(resolvedBase + path.sep) && real !== resolvedBase) {
              throw new SecurityViolationError(
                `Security Violation: Symlink at '${currentCheck}' resolves outside sandbox boundary to '${real}'.`
              );
            }
          }
        } catch {}
      }
      const parent = path.dirname(currentCheck);
      if (parent === currentCheck) break;
      currentCheck = parent;
    }
  }
}
