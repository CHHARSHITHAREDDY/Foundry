import { FastifyInstance, FastifyPluginAsync } from "fastify";

export interface ReviewFile {
  id: string;
  path: string;
  status: "modified" | "added" | "deleted";
  added: number;
  removed: number;
  isPatched?: boolean;
  annotation?: {
    author: string;
    type: "SECURITY" | "PERF" | "SPEC_DRIFT";
    message: string;
    line: number;
  };
  lines: Array<{
    type: "add" | "remove" | "context" | "header";
    oldLineNumber?: number;
    newLineNumber?: number;
    content: string;
  }>;
}

const REVIEW_DATA = {
  status: "APPROVED WITH 2 FIXES",
  commit: "#e9a2b84",
  invariantsSatisfied: 3,
  autoPatchesApplied: 2,
  integrityIndex: 99.8,
  blockers: 0,
  diffStats: { added: 248, removed: 43 },
  findings: [
    {
      id: "f-1",
      category: "SECURITY",
      severity: "P1",
      title: "Shopify GraphQL rate limit handling absent in batch catalog sync",
      description: "Daedalus-03 detected that concurrent SKU updates exceeded Shopify API buckets. Injected leaky-bucket queue with exponential backoff.",
      status: "FIXED",
      patchRef: "Patch #e9a2b84-sec",
      file: "src/lib/shopify-graphql-client.ts",
    },
    {
      id: "f-2",
      category: "INVARIANT",
      severity: "P2",
      title: "Unbounded retry loop in HMAC verification failure hook",
      description: "Webhook listener continued retrying expired tokens. Added cryptographic timestamp validation and 3-attempt circuit breaker.",
      status: "FIXED",
      patchRef: "Patch #e9a2b84-inv",
      file: "src/lib/webhook-hmac-verify.ts",
    },
    {
      id: "f-3",
      category: "DRIFT",
      severity: "P3",
      title: "Optional margin alert audio tone omitted",
      description: "Audio tone was specified as secondary optional flair in genesis prompt. Omitted to preserve minimal payload size.",
      status: "ACCEPTED",
      file: "src/components/margin-alert-banner.tsx",
    },
    {
      id: "f-4",
      category: "HEALTH",
      severity: "INFO",
      title: "AST strict typing passes with 0 'any' type assertions",
      description: "TypeScript compiler v5.4 in strict mode emitted zero diagnostics across all 14 synthesized files.",
      status: "PASSED",
      file: "src/types/schema.ts",
    },
  ],
  files: [
    {
      id: "f-1",
      path: "src/lib/shopify-graphql-client.ts",
      status: "modified",
      added: 52,
      removed: 8,
      isPatched: true,
      annotation: {
        author: "DAEDALUS-03",
        type: "SECURITY",
        message: "Shopify GraphQL rate limit handling absent in batch sync. Injected leaky-bucket token bucket algorithm with exponential backoff on 429 Throttle status.",
        line: 42,
      },
      lines: [
        { type: "header", content: "@@ -35,14 +35,26 @@ export class ShopifyClient {" },
        { type: "context", oldLineNumber: 35, newLineNumber: 35, content: "  private endpoint: string;" },
        { type: "context", oldLineNumber: 36, newLineNumber: 36, content: "  private accessToken: string;" },
        { type: "remove", oldLineNumber: 37, content: "  async executeQuery<T>(query: string, variables?: any): Promise<T> {" },
        { type: "remove", oldLineNumber: 38, content: "    const res = await fetch(this.endpoint, { method: 'POST', body: JSON.stringify({ query, variables }) });" },
        { type: "remove", oldLineNumber: 39, content: "    return res.json();" },
        { type: "add", newLineNumber: 37, content: "  private rateLimiter: LeakyBucketQueue = new LeakyBucketQueue(40, 2);" },
        { type: "add", newLineNumber: 38, content: "  " },
        { type: "add", newLineNumber: 39, content: "  async executeQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {" },
        { type: "add", newLineNumber: 40, content: "    return this.rateLimiter.enqueue(async () => {" },
        { type: "add", newLineNumber: 41, content: "      const res = await fetch(this.endpoint, {" },
        { type: "add", newLineNumber: 42, content: "        method: 'POST'," },
        { type: "add", newLineNumber: 43, content: "        headers: { 'X-Shopify-Access-Token': this.accessToken, 'Content-Type': 'application/json' }," },
        { type: "add", newLineNumber: 44, content: "        body: JSON.stringify({ query, variables })," },
        { type: "add", newLineNumber: 45, content: "      });" },
        { type: "add", newLineNumber: 46, content: "      if (res.status === 429) throw new ShopifyThrottleError('Rate limit exceeded');" },
        { type: "add", newLineNumber: 47, content: "      return res.json();" },
        { type: "add", newLineNumber: 48, content: "    });" },
        { type: "context", oldLineNumber: 40, newLineNumber: 49, content: "  }" },
        { type: "context", oldLineNumber: 41, newLineNumber: 50, content: "}" },
      ],
    },
    {
      id: "f-2",
      path: "src/lib/webhook-hmac-verify.ts",
      status: "modified",
      added: 31,
      removed: 4,
      isPatched: true,
      annotation: {
        author: "DAEDALUS-03",
        type: "SECURITY",
        message: "Webhook listener continued retrying expired tokens. Added crypto.timingSafeEqual and timestamp replay window guard (max 300s drift).",
        line: 28,
      },
      lines: [
        { type: "header", content: "@@ -20,8 +20,16 @@ export function verifyShopifyWebhook(rawBody: string, hmacHeader: string) {" },
        { type: "context", oldLineNumber: 20, newLineNumber: 20, content: "  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;" },
        { type: "remove", oldLineNumber: 21, content: "  const calculated = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');" },
        { type: "remove", oldLineNumber: 22, content: "  return calculated === hmacHeader;" },
        { type: "add", newLineNumber: 21, content: "  const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');" },
        { type: "add", newLineNumber: 22, content: "  const hashBuffer = Buffer.from(hash);" },
        { type: "add", newLineNumber: 23, content: "  const headerBuffer = Buffer.from(hmacHeader);" },
        { type: "add", newLineNumber: 24, content: "  if (hashBuffer.length !== headerBuffer.length) return false;" },
        { type: "add", newLineNumber: 25, content: "  return crypto.timingSafeEqual(hashBuffer, headerBuffer);" },
        { type: "context", oldLineNumber: 23, newLineNumber: 26, content: "}" },
      ],
    },
  ],
};

export const reviewRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Get full code review audit data
  app.get("/audit", async (_req, reply) => {
    return reply.send(REVIEW_DATA);
  });

  // Verify / apply auto-patch
  app.post("/patch", async (req, reply) => {
    const { patchId } = (req.body || {}) as { patchId?: string };
    return reply.send({
      success: true,
      patchId: patchId || "e9a2b84-sec",
      appliedAt: new Date().toISOString(),
      verified: true,
    });
  });

  // Export audit report in Markdown format
  app.get("/export", async (_req, reply) => {
    const md = `# AUDIT REPORT: PriceWatch for Shopify
Stage: 05 -> 06 Review Gate
Commit: #e9a2b84
Status: APPROVED WITH 2 FIXES

- Security P1 Fixed: Shopify GraphQL rate limit handling in batch catalog sync
- Invariant P2 Fixed: Unbounded retry loop in HMAC verification failure hook
- Spec Gap P3 Accepted: Optional margin alert audio tone omitted
- Health Info Passed: AST strict typing passes with 0 any type assertions

Agent Ember Audit Engine v2.4
Integrity Index: 99.8% | 0 Blockers`;

    return reply.send({ content: md, filename: "audit-report-e9a2b84.md" });
  });

  // Approve QA & proceed to deployment
  app.post("/approve", async (_req, reply) => {
    return reply.send({
      success: true,
      status: "READY_TO_DEPLOY",
      nextStage: "/dashboard/deploy",
      timestamp: new Date().toISOString(),
    });
  });
};

