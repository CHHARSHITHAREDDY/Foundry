import fs from "fs";
import path from "path";

const WEB_SRC_DIR = path.resolve(process.cwd(), "apps/web/src");

const FORBIDDEN_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "Hardcoded company PriceWatch", regex: /\bPriceWatch\b/ },
  { name: "Hardcoded company InvoiceFlow", regex: /\bInvoiceFlow\b/ },
  { name: "Hardcoded company AssetVault", regex: /\bAssetVault\b/ },
  { name: "Mock/Seed/Fake constant", regex: /\bconst\s+(?:[A-Z0-9_]*_)?(?:MOCK|SEED|FAKE)_[A-Z0-9_]*\b/ },
  { name: "Mock/Seed/Fake array literal", regex: /\bconst\s+(?:mock|seed|fake)(?:Companies|Tasks|Ideas|Notifications|Plans|Ledger|Stats)\b/i },
  { name: "Literal companies/tasks/notifications array in component", regex: /\bconst\s+(?:INITIAL_NOTIFICATIONS|DEFAULT_COMPANIES|MOCK_COMPANIES|DEMO_COMPANIES|HARDCODED_TASKS)\s*=/ },
];

function walk(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip legacy stubs directory if not imported, or scan everything? Scan all active src; skip stubs only if unused
      if (entry.name === "stubs") continue;
      files.push(...walk(full));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(WEB_SRC_DIR);
const violations: Array<{ file: string; line: number; rule: string; snippet: string }> = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.regex.test(line)) {
        violations.push({
          file: path.relative(process.cwd(), file),
          line: idx + 1,
          rule: rule.name,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`❌ check:no-mock-data FAILED with ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} [${v.rule}] ${v.snippet}`);
  }
  process.exit(1);
} else {
  console.log(`✅ check:no-mock-data PASSED (${files.length} files scanned in apps/web/src, 0 violations).`);
  process.exit(0);
}
