"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { DiffViewer, DiffFile } from "@/components/studio/diff-viewer";
import { QaReport } from "@/components/studio/qa-report";
import { api } from "@/lib/api-client";

// Sample files with realistic diff data
const REVIEW_FILES: DiffFile[] = [
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
  {
    id: "f-3",
    path: "src/lib/margin-guardrail.ts",
    status: "modified",
    added: 44,
    removed: 12,
    lines: [
      { type: "header", content: "@@ -12,6 +12,12 @@ export function calculateSafetyMargin(cost: number, price: number): number {" },
      { type: "context", oldLineNumber: 12, newLineNumber: 12, content: "  if (price <= 0) return 0;" },
      { type: "context", oldLineNumber: 13, newLineNumber: 13, content: "  const grossProfit = price - cost;" },
      { type: "add", newLineNumber: 14, content: "  const marginPercent = (grossProfit / price) * 100;" },
      { type: "add", newLineNumber: 15, content: "  // Enforce invariant: alert if margin dips below 15%" },
      { type: "add", newLineNumber: 16, content: "  return Math.round(marginPercent * 100) / 100;" },
    ],
  },
  {
    id: "f-4",
    path: "src/components/pricing-slider.tsx",
    status: "modified",
    added: 28,
    removed: 6,
    lines: [
      { type: "header", content: "@@ -1,5 +1,11 @@ export function PricingSlider() {" },
      { type: "context", oldLineNumber: 1, newLineNumber: 1, content: "  // Dual thumb range slider with Polaris brutalist tokens" },
      { type: "add", newLineNumber: 2, content: "  const [floor, setFloor] = useState<number>(20);" },
      { type: "add", newLineNumber: 3, content: "  const [ceiling, setCeiling] = useState<number>(65);" },
    ],
  },
  {
    id: "f-5",
    path: "src/components/margin-alert-banner.tsx",
    status: "modified",
    added: 22,
    removed: 3,
    lines: [
      { type: "header", content: "@@ -5,4 +5,9 @@ export function MarginAlertBanner({ alert }) {" },
      { type: "context", oldLineNumber: 5, newLineNumber: 5, content: "  return (" },
      { type: "add", newLineNumber: 6, content: "    <div className='bg-[#ca4b00] text-white p-3 border-2 border-[#111111]'>" },
      { type: "add", newLineNumber: 7, content: "      <span>Alert: Margin threshold breached on SKU #881</span>" },
      { type: "add", newLineNumber: 8, content: "    </div>" },
    ],
  },
  {
    id: "f-6",
    path: "src/app/api/webhooks/shopify/route.ts",
    status: "modified",
    added: 35,
    removed: 5,
    isPatched: true,
    lines: [
      { type: "header", content: "@@ -18,6 +18,14 @@ export async function POST(req: Request) {" },
      { type: "context", oldLineNumber: 18, newLineNumber: 18, content: "  const rawBody = await req.text();" },
      { type: "add", newLineNumber: 19, content: "  const hmac = req.headers.get('x-shopify-hmac-sha256');" },
      { type: "add", newLineNumber: 20, content: "  if (!verifyShopifyWebhook(rawBody, hmac || '')) {" },
      { type: "add", newLineNumber: 21, content: "    return new Response('Unauthorized Webhook HMAC', { status: 401 });" },
      { type: "add", newLineNumber: 22, content: "  }" },
    ],
  },
  {
    id: "f-7",
    path: "src/app/api/cron/sync-catalog/route.ts",
    status: "modified",
    added: 18,
    removed: 2,
    lines: [
      { type: "header", content: "@@ -10,3 +10,8 @@ export async function GET() {" },
      { type: "context", oldLineNumber: 10, newLineNumber: 10, content: "  // Cron job for synchronizing catalog items" },
      { type: "add", newLineNumber: 11, content: "  const queue = new PQueue({ concurrency: 3 });" },
    ],
  },
  {
    id: "f-8",
    path: "prisma/schema.prisma",
    status: "modified",
    added: 18,
    removed: 3,
    lines: [
      { type: "header", content: "@@ -25,4 +25,12 @@ model ProductVariant {" },
      { type: "context", oldLineNumber: 25, newLineNumber: 25, content: "  id String @id @default(cuid())" },
      { type: "add", newLineNumber: 26, content: "  costPrice Float @default(0.0)" },
      { type: "add", newLineNumber: 27, content: "  minMarginPercent Float @default(15.0)" },
      { type: "add", newLineNumber: 28, content: "  autoAdjust Boolean @default(true)" },
    ],
  },
];

function CodeReviewContent() {
  const router = useRouter();
  const [selectedFileId, setSelectedFileId] = useState<string>("f-1");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [files, setFiles] = useState<DiffFile[]>(REVIEW_FILES);
  const activeFile: DiffFile = (files.find((f) => f.id === selectedFileId) || files[0]) as DiffFile;

  useEffect(() => {
    api.getReviewAudit().then((res) => {
      if (res && res.files && res.files.length > 0) {
        setFiles(res.files);
      }
    }).catch(() => {});
  }, []);

  const handleExportAudit = async () => {
    setIsExporting(true);
    try {
      const res = await api.exportReviewAudit();
      const blob = new Blob([res.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "audit-report-e9a2b84.md";
      a.click();
    } catch {
      const auditMd = `# AUDIT REPORT: PriceWatch for Shopify\nStage: 05 -> 06 Review Gate\nCommit: #e9a2b84\nStatus: APPROVED WITH 2 FIXES`;
      const blob = new Blob([auditMd], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-report-e9a2b84.md";
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleProceedToDeploy = async () => {
    try {
      await api.approveReview();
    } catch {}
    router.push("/dashboard/deploy");
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Left Navigation Sidebar */}
      <DashboardSidebar
        currentTab="overview"
        onTabChange={(tab) => {
          if (tab === "onboarding") router.push("/dashboard");
          if (tab === "overview") router.push("/dashboard");
          if (tab === "billing") router.push("/dashboard?tab=billing");
          if (tab === "settings") router.push("/dashboard?tab=settings");
        }}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={() => router.push("/dashboard/company?company=PriceWatch")}
      />

      {/* 2. Main Shell */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Header */}
        <DashboardHeader
          currentBreadcrumb="PriceWatch / Stage 05 Code Review Gate"
          onOpenCommandPalette={() => setPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((prev) => !prev)}
        />

        {/* Notifications Drawer */}
        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onNavigate={(path) => {
            setPaletteOpen(false);
            if (path === "build") router.push("/dashboard/build");
            if (path === "deploy") router.push("/dashboard/deploy");
            if (path === "company") router.push("/dashboard/company");
          }}
        />

        {/* Content Viewport */}
        <main className="w-full pt-14 flex-1 flex flex-col bg-surface">
          {/* Top Review Stage Status Bar */}
          <div className="bg-surface-container-low border-b-2 border-[#111111] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 bg-[#15803D] text-white border border-[#111111] shadow-[1px_1px_0px_0px_#111111]">
                  APPROVED WITH 2 FIXES
                </span>
                <span className="font-mono text-xs font-bold text-on-surface">
                  [STAGE 05 → 06 INVARIANTS SATISFIED · 2 AUTO-PATCHES APPLIED · COMMIT #e9a2b84]
                </span>
              </div>
              <p className="font-serif text-xs text-secondary">
                Autonomous QA synthesis verified all 14 AST files against Prisma schema &amp; Shopify Polaris invariants.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportAudit}
                className="px-3.5 py-1.5 bg-surface text-on-surface hover:bg-surface-container border-2 border-[#111111] font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
              >
                {isExporting ? "EXPORTING..." : "Export Full Audit (.MD)"}
              </button>
              <button
                type="button"
                onClick={handleProceedToDeploy}
                className="px-5 py-2 bg-primary text-white hover:bg-primary-container border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[3px_3px_0px_0px_#111111]"
              >
                Proceed to Deploy ➔
              </button>
            </div>
          </div>

          {/* 3-Panel Review Workbench */}
          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden min-h-[calc(100vh-170px)]">
            {/* Panel 1 (Left): Collapsible File Tree */}
            <div className="col-span-3 bg-surface-container-lowest border-r-2 border-[#111111] flex flex-col overflow-hidden">
              <div className="bg-[#111111] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#111111] select-none">
                <span className="font-mono text-xs uppercase font-bold">
                  MODIFIED FILES (14)
                </span>
                <div className="font-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#4ade80] font-bold">+248</span>
                  <span className="text-[#f87171] font-bold">-43</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#111111]/15">
                {REVIEW_FILES.map((file) => {
                  const isSelected = file.id === selectedFileId;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full text-left p-3 flex flex-col gap-1 transition-all ${
                        isSelected
                          ? "bg-primary-fixed/30 border-l-4 border-l-primary"
                          : "hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-on-surface truncate max-w-[200px]">
                          {file.path.split("/").pop()}
                        </span>
                        {file.isPatched && (
                          <span className="font-mono text-[9px] uppercase font-bold px-1 bg-[#15803D] text-white">
                            PATCHED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-secondary">
                        <span className="truncate max-w-[180px]">{file.path}</span>
                        <div className="flex gap-1 shrink-0">
                          <span className="text-[#15803D]">+{file.added}</span>
                          <span className="text-error">-{file.removed}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel 2 (Center): Unified Diff Viewer */}
            <div className="col-span-6 bg-surface-container-low border-r-2 border-[#111111] flex flex-col overflow-hidden p-3">
              <DiffViewer file={activeFile} />
            </div>

            {/* Panel 3 (Right): Findings & Invariants */}
            <div className="col-span-3 bg-surface-container-lowest flex flex-col overflow-hidden">
              <QaReport onSelectFile={(filePath) => {
                const found = REVIEW_FILES.find((f) => f.path.includes(filePath) || filePath.includes(f.path));
                if (found) setSelectedFileId(found.id);
              }} />
            </div>
          </div>

          {/* Bottom Audit Telemetry Strip */}
          <div className="bg-[#111111] text-[#ffffff] px-6 py-2.5 border-t-2 border-[#111111] flex flex-wrap items-center justify-between font-mono text-xs select-none">
            <div className="flex items-center gap-4">
              <span className="text-primary font-bold">EMBER AUDIT ENGINE v2.4</span>
              <span className="text-secondary-fixed-dim">// ZERO BLOCKERS DETECTED</span>
              <span className="text-[#4ade80] font-bold">INTEGRITY INDEX: 99.8%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary-fixed-dim">STATUS:</span>
              <span className="bg-[#15803D] text-white px-2 py-0.5 font-bold uppercase">
                READY_TO_DEPLOY
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CodeReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-mono text-xs uppercase">
          Loading Code Review Workbench...
        </div>
      }
    >
      <CodeReviewContent />
    </Suspense>
  );
}
