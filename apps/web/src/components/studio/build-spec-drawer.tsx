"use client";

import React, { useState, useEffect } from "react";

export type BuildSpecTab = "pages" | "datamodel" | "api" | "tokens" | "taskgraph";

interface BuildSpecDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: BuildSpecTab;
  onExportJson?: () => void;
}

interface DagNode {
  id: string;
  code: string;
  title: string;
  track: "backend" | "ui" | "integration";
  phase: number;
  status: "done" | "active" | "queued" | "blocked";
  progress?: number;
  agent: string;
  prereqs: string;
  artifacts: string;
  elapsed: string;
  remaining: string;
  tokens: string;
  badge?: string;
}

const DAG_NODES: Record<string, DagNode> = {
  "T-01": {
    id: "T-01",
    code: "CORE_DATA",
    title: "Prisma Schema & PG Migration",
    track: "backend",
    phase: 1,
    status: "done",
    agent: "ARCHITECT-CORE (Ember-T1)",
    prereqs: "None (Genesis Node)",
    artifacts: "prisma/schema.prisma, prisma/migrations/20240318_init_clean.sql",
    elapsed: "00:48",
    remaining: "00:00",
    tokens: "2,140 TKN",
  },
  "T-02": {
    id: "T-02",
    code: "DESIGN_SYS",
    title: "Design Tokens & Typography",
    track: "ui",
    phase: 1,
    status: "done",
    agent: "EMBER-STYLER-T2",
    prereqs: "None",
    artifacts: "tailwind.config.ts, src/app/globals.css",
    elapsed: "00:32",
    remaining: "00:00",
    tokens: "1,420 TKN",
  },
  "T-03": {
    id: "T-03",
    code: "LEGAL_METADATA",
    title: "App Store Listing & TOS",
    track: "integration",
    phase: 1,
    status: "done",
    agent: "LEX-COMPLIANCE",
    prereqs: "None",
    artifacts: "public/app-store/manifest.json, docs/terms.md",
    elapsed: "00:25",
    remaining: "00:00",
    tokens: "980 TKN",
  },
  "T-04": {
    id: "T-04",
    code: "WEBHOOK_ENGINE",
    title: "Webhook Ingestion Engine",
    track: "backend",
    phase: 2,
    status: "done",
    agent: "BACKEND-CORE-02",
    prereqs: "T-01",
    artifacts: "src/app/api/webhooks/shopify/route.ts, src/lib/hmac.ts",
    elapsed: "01:12",
    remaining: "00:00",
    tokens: "3,210 TKN",
  },
  "T-05": {
    id: "T-05",
    code: "OCR_PIPELINE",
    title: "Vendor PDF/CSV OCR Parser",
    track: "backend",
    phase: 2,
    status: "done",
    agent: "BACKEND-CORE-02",
    prereqs: "T-01",
    artifacts: "src/services/ocr-parser.ts, src/workers/invoice-queue.ts",
    elapsed: "01:30",
    remaining: "00:00",
    tokens: "4,100 TKN",
  },
  "T-06": {
    id: "T-06",
    code: "NAVIGATION",
    title: "Polaris Layout & App Shell",
    track: "ui",
    phase: 2,
    status: "done",
    agent: "DAEDALUS-03",
    prereqs: "T-02",
    artifacts: "src/components/layout/app-shell.tsx, src/components/layout/sidebar.tsx",
    elapsed: "01:05",
    remaining: "00:00",
    tokens: "3,890 TKN",
  },
  "T-07": {
    id: "T-07",
    code: "ENGINE_MATH",
    title: "Margin Guardrails & Math Logic",
    track: "backend",
    phase: 3,
    status: "done",
    agent: "BACKEND-CORE-02",
    prereqs: "T-04",
    artifacts: "src/services/margin-engine.ts, src/lib/pricing-calculator.ts",
    elapsed: "01:10",
    remaining: "00:00",
    tokens: "3,450 TKN",
  },
  "T-09": {
    id: "T-09",
    code: "ACTIVE_SYNTHESIS",
    title: "Reactive Margin Sliders & SKU Table",
    track: "ui",
    phase: 3,
    status: "active",
    progress: 65,
    agent: "DAEDALUS-03 (Coder Core)",
    prereqs: "T-06 (Done), T-07 (Done)",
    artifacts: "src/components/pricing-table.tsx, src/hooks/use-price-delta.ts",
    elapsed: "01:45",
    remaining: "00:45",
    tokens: "4,812 TKN",
  },
  "T-10": {
    id: "T-10",
    code: "SHOPIFY_API",
    title: "GraphQL Mutation Throttle",
    track: "backend",
    phase: 4,
    status: "queued",
    agent: "BACKEND-CORE-02",
    prereqs: "T-07",
    artifacts: "src/lib/shopify-graphql-client.ts",
    elapsed: "00:00",
    remaining: "01:15",
    tokens: "0 TKN",
  },
  "T-11": {
    id: "T-11",
    code: "AUTH_SERVICE",
    title: "OAuth 2.0 Token Vaulting",
    track: "integration",
    phase: 4,
    status: "queued",
    agent: "INTEGRATOR-01",
    prereqs: "T-03",
    artifacts: "src/lib/auth/token-vault.ts",
    elapsed: "00:00",
    remaining: "00:50",
    tokens: "0 TKN",
  },
  "T-12": {
    id: "T-12",
    code: "MODAL_UI",
    title: "Invoice Upload & Diff Modal",
    track: "ui",
    phase: 4,
    status: "queued",
    agent: "DAEDALUS-03",
    prereqs: "T-09",
    artifacts: "src/components/invoices/diff-modal.tsx",
    elapsed: "00:00",
    remaining: "01:00",
    tokens: "0 TKN",
  },
  "T-14": {
    id: "T-14",
    code: "BACKGROUND_JOB",
    title: "Bulk Inventory SKU Push",
    track: "backend",
    phase: 5,
    status: "queued",
    agent: "BACKEND-CORE-02",
    prereqs: "T-10",
    artifacts: "src/jobs/bulk-inventory-sync.ts",
    elapsed: "00:00",
    remaining: "01:20",
    tokens: "0 TKN",
  },
  "T-15": {
    id: "T-15",
    code: "PREFERENCES",
    title: "Store Settings Guardrails",
    track: "ui",
    phase: 5,
    status: "queued",
    agent: "DAEDALUS-03",
    prereqs: "T-09",
    artifacts: "src/app/settings/page.tsx",
    elapsed: "00:00",
    remaining: "00:40",
    tokens: "0 TKN",
  },
  "T-16": {
    id: "T-16",
    code: "QA_AUTOMATION",
    title: "Playwright E2E Spec Suite",
    track: "integration",
    phase: 5,
    status: "queued",
    agent: "QA-VERIFIER-01",
    prereqs: "T-09, T-10",
    artifacts: "tests/e2e/margin-guardrails.spec.ts, tests/e2e/webhook-guard.spec.ts",
    elapsed: "00:00",
    remaining: "02:00",
    tokens: "0 TKN",
  },
  "T-18": {
    id: "T-18",
    code: "EDGE_DEPLOY",
    title: "Vercel Edge Health Check",
    track: "integration",
    phase: 5,
    status: "queued",
    agent: "DEPLOYER-01",
    prereqs: "T-16",
    artifacts: "vercel.json, src/app/api/health/route.ts",
    elapsed: "00:00",
    remaining: "00:30",
    tokens: "0 TKN",
  },
};

export function BuildSpecDrawer({
  isOpen,
  onClose,
  defaultTab = "pages",
  onExportJson,
}: BuildSpecDrawerProps) {
  const [activeTab, setActiveTab] = useState<BuildSpecTab>(defaultTab);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("T-09");
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedNode = (DAG_NODES[selectedNodeId] || DAG_NODES["T-09"]) as DagNode;

  const handleCopySpecJson = () => {
    const sampleSpec = {
      specId: "#SPEC-PW-8841",
      ventureName: "Venture Workspace",
      stage: "01_ARCHITECT",
      status: "LOCKED_PASSED",
      stack: {
        framework: "Next.js 14 App Router",
        orm: "Prisma Client 5.12",
        database: "PostgreSQL 16 with pgvector",
        styling: "Tailwind CSS + Archival Editorial Presets",
      },
      models: ["Store", "ProductVariant", "VendorInvoice", "MarginInterceptionEvent"],
      routes: [
        "/",
        "/dashboard",
        "/invoices",
        "/invoices/[id]",
        "/rules",
        "/settings/webhooks",
      ],
      nodesCompiled: 18,
      criticalPathMinutes: 14,
    };
    navigator.clipboard.writeText(JSON.stringify(sampleSpec, null, 2));
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
    if (onExportJson) onExportJson();
  };

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* 30% Dimmed Left Backdrop */}
      <div
        className="w-[30%] h-full bg-on-surface/40 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
        title="Click to Close Drawer"
      />

      {/* 70% Right Spec Drawer */}
      <div className="w-[70%] h-full bg-background border-l-[2px] border-on-surface shadow-[-12px_0px_24px_rgba(27,28,25,0.18)] z-10 flex flex-col justify-between overflow-hidden">
        {/* TOP SECTION: HEADER, METADATA & TAB NAVIGATION */}
        <div className="flex flex-col border-b-[1.5px] border-on-surface bg-surface-bright shrink-0">
          {/* Topmost Monospace Micro-Bar */}
          <div className="px-space-md lg:px-space-lg py-2 border-b border-surface-dim flex flex-wrap items-center justify-between gap-space-xs bg-surface-container-low text-secondary">
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm tracking-widest">
              <span className="text-on-surface font-semibold">BUILD_SPEC</span>
              <span>//</span>
              <span>
                SPEC_ID: <span className="text-on-surface font-bold">#SPEC-PW-8841</span>
              </span>
              <span>·</span>
              <span>
                STAGE 01: <span className="text-primary font-bold">ARCHITECT</span>
              </span>
              <span>·</span>
              <span>COMPILED VIA EMBER-REASONER-T1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary font-bold tracking-wider">
                COMPILATION STABLE
              </span>
            </div>
          </div>

          {/* Drawer Main Hero Title Header */}
          <div className="px-space-md lg:px-space-lg py-3 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 bg-surface-container-high border border-on-surface text-on-surface font-bold">
                  SPECIFICATION VIEW
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium">
                  SHOPIFY-APP-NODE-V14
                </span>
              </div>
              <h1 className="font-display text-headline-md lg:text-headline-lg text-on-surface leading-tight tracking-tight">
                Venture Architecture &amp; Build Spec
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
                Autonomous compilation blueprint for{" "}
                <span className="text-on-surface font-semibold">Venture Workspace</span> (Shopify
                Embedded App · Next.js 14 App Router · Prisma ORM · Tailwind).
              </p>
            </div>

            {/* Action Control Group */}
            <div className="flex items-center gap-space-xs shrink-0 self-start md:self-center">
              <span className="font-label-sm text-label-sm bg-surface-container-high border border-on-surface px-2 py-1 text-on-surface font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
                STATUS: LOCKED // PASSED
              </span>
              <button
                onClick={handleCopySpecJson}
                className="h-8 px-space-sm bg-on-surface text-surface-container-lowest font-label-md text-label-md uppercase tracking-wider font-semibold rounded-DEFAULT flex items-center gap-1 border-[1.5px] border-on-surface hover:bg-primary hover:border-primary transition-all shadow-[2px_2px_0px_0px_#1b1c19]"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">file_download</span>
                <span>{copiedStatus ? "COPIED JSON!" : "EXPORT SPEC (JSON)"}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-surface-container border-[1.5px] border-on-surface text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors ml-1 shadow-[2px_2px_0px_0px_#1b1c19]"
                type="button"
                title="Close Drawer (ESC)"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Tab Strip Bar */}
          <div className="px-space-md lg:px-space-lg flex items-center justify-between border-t border-surface-dim bg-surface-container-low overflow-x-auto">
            <div className="flex items-center gap-0">
              <button
                onClick={() => setActiveTab("pages")}
                className={`px-space-md py-2.5 font-label-md text-label-md uppercase tracking-wider border-r border-surface-dim transition-all flex items-center gap-1.5 ${
                  activeTab === "pages"
                    ? "bg-on-surface text-surface-container-lowest font-bold shadow-[0px_2px_0px_0px_#a23a00]"
                    : "text-secondary hover:text-on-surface"
                }`}
                type="button"
              >
                {activeTab === "pages" && <span className="w-1.5 h-1.5 bg-primary"></span>}
                <span>[01. PAGES &amp; TOKENS]</span>
              </button>

              <button
                onClick={() => setActiveTab("datamodel")}
                className={`px-space-md py-2.5 font-label-md text-label-md uppercase tracking-wider border-r border-on-surface transition-all flex items-center gap-1.5 ${
                  activeTab === "datamodel"
                    ? "bg-on-surface text-surface-container-lowest font-bold shadow-[0px_2px_0px_0px_#a23a00]"
                    : "text-secondary hover:text-on-surface"
                }`}
                type="button"
              >
                {activeTab === "datamodel" && <span className="w-1.5 h-1.5 bg-primary"></span>}
                <span>[02. DATA MODEL]</span>
              </button>

              <button
                onClick={() => setActiveTab("api")}
                className={`px-space-md py-2.5 font-label-md text-label-md uppercase tracking-wider border-r border-on-surface transition-all flex items-center gap-1.5 ${
                  activeTab === "api"
                    ? "bg-on-surface text-surface-container-lowest font-bold shadow-[0px_2px_0px_0px_#a23a00]"
                    : "text-secondary hover:text-on-surface"
                }`}
                type="button"
              >
                {activeTab === "api" && <span className="w-1.5 h-1.5 bg-primary"></span>}
                <span>[03. API &amp; WEBHOOKS]</span>
              </button>

              <button
                onClick={() => setActiveTab("tokens")}
                className={`px-space-md py-2.5 font-label-md text-label-md uppercase tracking-wider border-r border-surface-dim transition-all flex items-center gap-1.5 ${
                  activeTab === "tokens"
                    ? "bg-on-surface text-surface-container-lowest font-bold shadow-[0px_2px_0px_0px_#a23a00]"
                    : "text-secondary hover:text-on-surface"
                }`}
                type="button"
              >
                {activeTab === "tokens" && <span className="w-1.5 h-1.5 bg-primary"></span>}
                <span>[04. DESIGN TOKENS]</span>
              </button>

              <button
                onClick={() => setActiveTab("taskgraph")}
                className={`px-space-md py-2.5 font-label-md text-label-md uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "taskgraph"
                    ? "bg-on-surface text-surface-container-lowest font-bold shadow-[0px_2px_0px_0px_#a23a00]"
                    : "text-secondary hover:text-on-surface"
                }`}
                type="button"
              >
                {activeTab === "taskgraph" && <span className="w-1.5 h-1.5 bg-primary"></span>}
                <span>[05. TASK GRAPH]</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest bg-primary/10 px-2 py-0.5 border border-primary/20">
                {activeTab === "pages" && "SHOWING: 01. ROUTE HIERARCHY & ARCHETYPE"}
                {activeTab === "datamodel" && "SHOWING: 02. PRISMA MODELS & FOREIGN KEYS"}
                {activeTab === "api" && "SHOWING: 03. REST/GRAPHQL ENDPOINT MATRIX"}
                {activeTab === "tokens" && "SHOWING: 04. COMPILED DESIGN SYSTEM TOKENS"}
                {activeTab === "taskgraph" && "SHOWING: 05. AUTONOMOUS TASK DEPENDENCY GRAPH (DAG)"}
              </span>
            </div>
          </div>
        </div>

        {/* DRAWER BODY CONTENT (Scrollable Interior) */}
        <div className="p-space-md lg:p-space-lg flex-1 overflow-y-auto bg-background space-y-space-xl">
          {/* ========================================================================= */}
          {/* TAB 1: PAGES & LAYOUT HIERARCHY */}
          {/* ========================================================================= */}
          {activeTab === "pages" && (
            <div className="space-y-space-lg animate-in fade-in duration-150">
              <section className="space-y-space-md">
                <div className="flex items-center justify-between border-b-[1.5px] border-on-surface pb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 bg-on-surface"></span>
                    <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
                      // 01 · ROUTE HIERARCHY &amp; LAYOUT ARCHITECTURE
                    </h2>
                    <span className="font-label-sm text-label-sm bg-surface-container px-1.5 py-0.5 border border-surface-dim text-secondary font-bold">
                      6 ROUTES COMPILED
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">
                    APP ROUTER TREE · RUNTIME: NODEJS / EDGE HYBRID
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-space-sm font-label-md text-label-md">
                  {/* Route 1 */}
                  <div className="bg-surface-container-low border-[1.5px] border-on-surface p-space-md shadow-[3px_3px_0px_0px_#1b1c19] hover:border-primary transition-colors">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface px-1.5 py-0.5 border border-surface-dim text-label-lg font-label-lg">
                            /
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Root Ingress Layout
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface text-secondary border border-surface-dim">
                            SSR SERVER COMPONENT
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Hosts embedded frame handshake, Polaris Bridge runtime provider, session token exchange, and base theme hydration.
                        </p>
                      </div>
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface text-on-surface border border-surface-dim font-semibold">
                          ARCHETYPE: AppShell (Polaris + Custom)
                        </span>
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface text-primary border border-surface-dim font-semibold">
                          STATE: AuthProvider, QueryClient
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route 2 */}
                  <div className="bg-surface border-[1.5px] border-on-surface p-space-md hover:shadow-[3px_3px_0px_0px_#1b1c19] transition-all ml-4 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface-container px-1.5 py-0.5 border border-surface-dim font-label-lg">
                            ├── /dashboard
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Live Margin Overview
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-600 font-bold">
                            HYDRATED CACHE
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Executive pulse showing aggregate margin leakage across Shopify catalog. Real-time SKU threshold status and sync alerts.
                        </p>
                        <div className="pt-1 flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
                          <span className="text-on-surface font-semibold">BOUND COMPONENTS:</span>
                          <code className="bg-surface-container px-1 text-on-surface">MarginHero</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">RealTimeAlertBanner</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">SkuTable</code>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-on-surface border border-surface-dim font-semibold">
                          LAYOUT: DashboardLayout
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          GUARDS: ShopifyAuthGate, StorePlanCheck
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route 3 */}
                  <div className="bg-surface border-[1.5px] border-on-surface p-space-md hover:shadow-[3px_3px_0px_0px_#1b1c19] transition-all ml-4">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface-container px-1.5 py-0.5 border border-surface-dim font-label-lg">
                            ├── /invoices
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Supplier Ingestion Hub
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-secondary border border-surface-dim">
                            SUSPENSE STREAMING
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Supplier PDF, EDI, and CSV dropzone. Coordinates autonomous optical character recognition (OCR) and vendor line-item diffs.
                        </p>
                        <div className="pt-1 flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
                          <span className="text-on-surface font-semibold">BOUND COMPONENTS:</span>
                          <code className="bg-surface-container px-1 text-on-surface">OCRDropzone</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">LineItemReviewModal</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">VendorSelector</code>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-on-surface border border-surface-dim font-semibold">
                          LAYOUT: DashboardLayout
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          ACTIONS: IngestQueue, ParseBatch
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route 4 */}
                  <div className="bg-surface-container-low border-[1.5px] border-on-surface p-space-md hover:shadow-[3px_3px_0px_0px_#1b1c19] transition-all ml-8">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface px-1.5 py-0.5 border border-surface-dim font-label-lg">
                            ├── /invoices/[id]
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Invoice Discrepancy Diff
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-primary/10 text-primary border border-primary font-bold">
                            TRANSACTION CRITICAL
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Side-by-side granular ledger view: Shopify Cost-of-Goods sold vs. supplier invoice statement delta with margin impact matrix.
                        </p>
                        <div className="pt-1 flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
                          <span className="text-on-surface font-semibold">OPERATIONS:</span>
                          <code className="bg-surface px-1 text-on-surface border border-surface-dim">ApprovePriceDelta</code>
                          <span>·</span>
                          <code className="bg-surface px-1 text-on-surface border border-surface-dim">DisputeVendor</code>
                          <span>·</span>
                          <code className="bg-surface px-1 text-on-surface border border-surface-dim">SyncCOGSWithShopify</code>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface text-on-surface border border-surface-dim font-semibold">
                          LAYOUT: DetailDrawer (Modal Overlay)
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          CACHE: On-Demand Revalidate
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route 5 */}
                  <div className="bg-surface border-[1.5px] border-on-surface p-space-md hover:shadow-[3px_3px_0px_0px_#1b1c19] transition-all ml-4">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface-container px-1.5 py-0.5 border border-surface-dim font-label-lg">
                            ├── /rules
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Margin Guardrails &amp; Repricing
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-secondary border border-surface-dim">
                            FORM CONTROL
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Configurable floor/ceiling margin automation rules per product vendor or collection tag. Automated Shopify price adjustment triggers.
                        </p>
                        <div className="pt-1 flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
                          <span className="text-on-surface font-semibold">BOUND COMPONENTS:</span>
                          <code className="bg-surface-container px-1 text-on-surface">ThresholdSliders</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">WebhookToggle</code>
                          <span>·</span>
                          <code className="bg-surface-container px-1 text-on-surface">RuleSimulationDryRun</code>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-on-surface border border-surface-dim font-semibold">
                          LAYOUT: SettingsLayout
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          SECURITY: StoreAdminRole
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route 6 */}
                  <div className="bg-surface border-[1.5px] border-on-surface p-space-md hover:shadow-[3px_3px_0px_0px_#1b1c19] transition-all ml-4">
                    <div className="flex items-start justify-between gap-space-md flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-bold text-on-surface bg-surface-container px-1.5 py-0.5 border border-surface-dim font-label-lg">
                            └── /settings/webhooks
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Shopify Event Subscriptions
                          </span>
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-secondary border border-surface-dim">
                            SECURE ENDPOINTS
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                          Manages inbound Webhook subscriptions for <code className="text-on-surface">products/update</code>,{" "}
                          <code className="text-on-surface">inventory_levels/update</code>, and app uninstallation hooks.
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-surface-container text-on-surface border border-surface-dim font-semibold">
                          SECURITY: HMAC Signature Check
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          BACKOFF: Exponential Retry
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DATA MODEL */}
          {/* ========================================================================= */}
          {activeTab === "datamodel" && (
            <div className="space-y-space-lg animate-in fade-in duration-150">
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-[1.5px] border-on-surface pb-space-xs gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 bg-on-surface"></span>
                    <h2 className="font-label-md text-label-md uppercase font-bold tracking-widest text-on-surface">
                      // 02 · POSTGRESQL &amp; PRISMA DATA ENTITIES (4 MODELS COMPILED)
                    </h2>
                  </div>
                  <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-secondary">
                    <span>DATABASE: PG_VECTOR_16</span>
                    <span>·</span>
                    <span className="text-on-surface font-semibold">ORM: PRISMA CLIENT 5.12</span>
                    <span>·</span>
                    <span className="text-primary font-bold">STATUS: DRAFT_SYNCED</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {/* Model 1: Store */}
                  <div className="bg-surface-container-lowest border-[1.5px] border-on-surface rounded-DEFAULT shadow-[3px_3px_0px_0px_#1b1c19] flex flex-col">
                    <div className="px-space-md py-space-xs bg-surface-container border-b-[1.5px] border-on-surface flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[15px] text-primary">storefront</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">Store</span>
                        <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-1 border border-surface-dim">
                          Tenant Root
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 border border-on-surface">
                        1 : N (CASCADE)
                      </span>
                    </div>

                    <div className="p-space-md flex flex-col gap-1 font-label-sm text-label-sm border-b border-surface-dim">
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">id</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-primary font-semibold">[PK] @default(uuid())</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">shopifyDomain</span>
                          <span className="text-secondary">: String</span>
                        </div>
                        <span className="text-secondary">[UNIQUE, INDEXED]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">accessToken</span>
                          <span className="text-secondary">: String</span>
                        </div>
                        <span className="text-error font-medium">[ENCRYPTED AES-GCM]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">planTier</span>
                          <span className="text-secondary">: Enum</span>
                        </div>
                        <span className="text-secondary">&apos;GROWTH&apos; | &apos;SCALE&apos;</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">minMarginThreshold</span>
                          <span className="text-secondary">: Decimal</span>
                        </div>
                        <span className="text-secondary">@default(0.45)</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">createdAt</span>
                          <span className="text-secondary">: DateTime</span>
                        </div>
                        <span className="text-secondary">@default(now())</span>
                      </div>
                    </div>

                    <div className="px-space-md py-1.5 bg-surface-container-low flex flex-wrap items-center gap-2 font-label-sm text-label-sm">
                      <span className="text-secondary uppercase">RELATIONS:</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">hasMany Products →</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">hasMany Invoices →</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">hasMany RepriceLogs</span>
                    </div>
                  </div>

                  {/* Model 2: ProductVariant */}
                  <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-DEFAULT shadow-[3px_3px_0px_0px_#a23a00] flex flex-col">
                    <div className="px-space-md py-space-xs bg-primary/10 border-b-[1.5px] border-primary flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[15px] text-primary">barcode_scanner</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">ProductVariant</span>
                        <span className="font-label-sm text-label-sm text-primary font-bold bg-surface px-1 border border-primary">Core Entity</span>
                      </div>
                      <span className="font-label-sm text-label-sm font-bold text-primary bg-surface px-1.5 py-0.5 border border-primary">
                        N : 1 Store
                      </span>
                    </div>

                    <div className="p-space-md flex flex-col gap-1 font-label-sm text-label-sm border-b border-surface-dim">
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">id</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-primary font-semibold">[PK]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">storeId</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-on-surface font-semibold">[FK -&gt; Store.id]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">shopifyVariantId</span>
                          <span className="text-secondary">: BigInt</span>
                        </div>
                        <span className="text-secondary">[INDEXED GID]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">sku / title</span>
                          <span className="text-secondary">: String</span>
                        </div>
                        <span className="text-secondary">Text Index</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">cogsCost / retailPrice</span>
                          <span className="text-secondary">: Decimal(10,2)</span>
                        </div>
                        <span className="text-secondary">Live Margin Base</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">currentMarginPct</span>
                          <span className="text-secondary">: Decimal</span>
                        </div>
                        <span className="text-primary font-bold">Calculated Trigger</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">isFlagged</span>
                          <span className="text-secondary">: Boolean</span>
                        </div>
                        <span className="text-secondary">@default(false)</span>
                      </div>
                    </div>

                    <div className="px-space-md py-1.5 bg-surface-container-low flex flex-wrap items-center gap-2 font-label-sm text-label-sm">
                      <span className="text-secondary uppercase">RELATIONS:</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">belongsTo Store (storeId)</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">hasMany LineMatches</span>
                    </div>
                  </div>

                  {/* Model 3: VendorInvoice */}
                  <div className="bg-surface-container-lowest border-[1.5px] border-on-surface rounded-DEFAULT shadow-[3px_3px_0px_0px_#1b1c19] flex flex-col">
                    <div className="px-space-md py-space-xs bg-surface-container border-b-[1.5px] border-on-surface flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[15px] text-primary">receipt_long</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">VendorInvoice</span>
                        <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-1 border border-surface-dim">
                          OCR Stream
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 border border-on-surface">
                        N : 1 Store
                      </span>
                    </div>

                    <div className="p-space-md flex flex-col gap-1 font-label-sm text-label-sm border-b border-surface-dim">
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">id</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-primary font-semibold">[PK]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">storeId</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-on-surface font-semibold">[FK -&gt; Store.id]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">vendorName / invoiceRef</span>
                          <span className="text-secondary">: String</span>
                        </div>
                        <span className="text-secondary">Indexed Header</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">fileUrl</span>
                          <span className="text-secondary">: String</span>
                        </div>
                        <span className="text-secondary">S3 Object Vault URI</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">rawParsedPayload</span>
                          <span className="text-secondary">: JsonB</span>
                        </div>
                        <span className="text-secondary">Schema v2 OCR Dump</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">ocrConfidenceScore</span>
                          <span className="text-secondary">: Float</span>
                        </div>
                        <span className="text-on-surface font-bold">0.984 [THRESHOLD: 0.92]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">status</span>
                          <span className="text-secondary">: Enum</span>
                        </div>
                        <span className="text-secondary">&apos;PROCESSED&apos; | &apos;FLAGGED&apos;</span>
                      </div>
                    </div>

                    <div className="px-space-md py-1.5 bg-surface-container-low flex flex-wrap items-center gap-2 font-label-sm text-label-sm">
                      <span className="text-secondary uppercase">RELATIONS:</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">belongsTo Store</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">hasMany LineItems (1:N)</span>
                    </div>
                  </div>

                  {/* Model 4: MarginInterceptionEvent */}
                  <div className="bg-surface-container-lowest border-[1.5px] border-on-surface rounded-DEFAULT shadow-[3px_3px_0px_0px_#1b1c19] flex flex-col">
                    <div className="px-space-md py-space-xs bg-surface-container border-b-[1.5px] border-on-surface flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[15px] text-primary">shield_with_heart</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">MarginInterceptionEvent</span>
                        <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-1 border border-surface-dim">
                          Immutable Audit
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 border border-on-surface">
                        N : 1 Variant
                      </span>
                    </div>

                    <div className="p-space-md flex flex-col gap-1 font-label-sm text-label-sm border-b border-surface-dim">
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">id</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-primary font-semibold">[PK]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">variantId</span>
                          <span className="text-secondary">: UUID</span>
                        </div>
                        <span className="text-on-surface font-semibold">[FK -&gt; ProductVariant.id]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">oldCogs / newCogs</span>
                          <span className="text-secondary">: Decimal(10,2)</span>
                        </div>
                        <span className="text-secondary">Direct Shift Vector</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-error">marginDelta</span>
                          <span className="text-secondary">: Decimal</span>
                        </div>
                        <span className="text-error font-bold">-8.4% [CRITICAL_EROSION]</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">actionTaken</span>
                          <span className="text-secondary">: Enum</span>
                        </div>
                        <span className="text-secondary">&apos;PRICE_HELD&apos; | &apos;SYNCED&apos;</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 hover:bg-surface-container-low px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface">executedAt</span>
                          <span className="text-secondary">: DateTime</span>
                        </div>
                        <span className="text-secondary">@default(now())</span>
                      </div>
                    </div>

                    <div className="px-space-md py-1.5 bg-surface-container-low flex flex-wrap items-center gap-2 font-label-sm text-label-sm">
                      <span className="text-secondary uppercase">RELATIONS:</span>
                      <span className="bg-surface border border-surface-dim px-1 text-on-surface font-semibold">belongsTo ProductVariant (variantId)</span>
                      <span className="text-secondary">readOnly: true</span>
                    </div>
                  </div>
                </div>

                {/* Relationship Topology Metadata Legend */}
                <div className="p-space-sm bg-surface-container border-[1.5px] border-surface-dim flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-md font-label-sm text-label-sm">
                    <span className="text-secondary font-bold uppercase">RELATION TOPOLOGY:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-on-surface"></span>
                      <span>Store (1) ──&lt; ProductVariant (N)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-on-surface"></span>
                      <span>Store (1) ──&lt; VendorInvoice (N)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary"></span>
                      <span>ProductVariant (1) ──&lt; InterceptionEvents (N)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>FOREIGN KEYS INDEXED &amp; TYPE-CHECKED</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: API & WEBHOOKS */}
          {/* ========================================================================= */}
          {activeTab === "api" && (
            <div className="space-y-space-lg animate-in fade-in duration-150">
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-[1.5px] border-on-surface pb-space-xs gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 bg-primary"></span>
                    <h2 className="font-label-md text-label-md uppercase font-bold tracking-widest text-on-surface">
                      // 03 · REST / GRAPHQL ENDPOINT MATRIX &amp; WEBHOOK LISTENERS (6 COMPILED)
                    </h2>
                  </div>
                  <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-secondary">
                    <span>PROTOCOL: HTTP/2 + TLS 1.3</span>
                    <span>·</span>
                    <span className="text-on-surface font-semibold">GATEWAY: NEXT.js EDGE RUNTIME</span>
                  </div>
                </div>

                <div className="w-full border-[1.5px] border-on-surface rounded-DEFAULT shadow-[3px_3px_0px_0px_#1b1c19] overflow-x-auto bg-surface-bright">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b-[1.5px] border-on-surface font-label-md text-label-md text-on-surface uppercase tracking-wider">
                        <th className="py-2.5 px-space-md font-bold w-24">METHOD</th>
                        <th className="py-2.5 px-space-md font-bold">ROUTE PATH &amp; HANDLER</th>
                        <th className="py-2.5 px-space-md font-bold">AUTH / SCOPE</th>
                        <th className="py-2.5 px-space-md font-bold">PAYLOAD DEFINITION</th>
                        <th className="py-2.5 px-space-md font-bold text-right">EXPECTED LATENCY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-dim font-label-sm text-label-sm">
                      {/* Row 1 */}
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-on-surface text-surface-container-lowest font-bold px-2 py-0.5 border border-on-surface">
                            POST
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/webhooks/shopify/products-update
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">handleShopifyProductIngest()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            HMAC_SHA256
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <span className="text-on-surface font-medium">Shopify Product GraphQL Webhook</span>
                          <div className="text-[10px] text-secondary">
                            Payload schema: <code className="text-primary font-mono">ShopifyPayloadVariantNode</code>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                            200 OK (12ms)
                          </span>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-on-surface text-surface-container-lowest font-bold px-2 py-0.5 border border-on-surface">
                            POST
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/invoices/ocr-ingest
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">queueVendorInvoiceOcr()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            SESSION_JWT
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <span className="text-on-surface font-medium">Multipart/form-data</span>
                          <div className="text-[10px] text-secondary">
                            Accepted types: <code className="font-mono">application/pdf, text/csv</code> (max 25MB)
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5">
                            202 ACCEPTED (Async)
                          </span>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-surface-container-high text-on-surface font-bold px-2 py-0.5 border border-on-surface">
                            GET
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/invoices/[id]/discrepancies
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">getInvoiceVarianceAudit()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            SESSION_JWT
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <span className="text-on-surface font-medium">Empty (Query: limit=50&amp;cursor=...)</span>
                          <div className="text-[10px] text-secondary">Returns: Array&lt;VarianceLineMatch&gt;</div>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                            200 OK (Cache 30s)
                          </span>
                        </td>
                      </tr>

                      {/* Row 4 */}
                      <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-primary text-surface-container-lowest font-bold px-2 py-0.5 border border-on-surface">
                            PATCH
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/variants/[id]/guardrail
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">updateVariantMarginFloor()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            SESSION_JWT
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <code className="text-on-surface font-mono bg-surface-container px-1 py-0.5 border border-surface-dim">
                            &#123; minMargin: 0.45, autoReprice: true &#125;
                          </code>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                            200 OK (38ms)
                          </span>
                        </td>
                      </tr>

                      {/* Row 5 */}
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-on-surface text-surface-container-lowest font-bold px-2 py-0.5 border border-on-surface">
                            POST
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/shopify/graphql/mutate-price
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">execProductVariantPriceMutation()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            POLARIS_OAUTH
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <span className="text-on-surface font-medium">
                            Shopify GraphQL: <code className="text-primary font-mono">productVariantUpdate</code>
                          </span>
                          <div className="text-[10px] text-secondary">Includes rate-limit token bucket budget</div>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                            200 OK (Debounced 400ms)
                          </span>
                        </td>
                      </tr>

                      {/* Row 6 */}
                      <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                        <td className="py-3 px-space-md align-top">
                          <span className="inline-block bg-surface-container-high text-on-surface font-bold px-2 py-0.5 border border-on-surface">
                            GET
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface font-label-md text-label-md">
                              /api/telemetry/margin-yield
                            </span>
                            <span className="text-secondary">
                              Handler: <code className="text-on-surface-variant font-mono">getMarginYieldTimeSeries()</code>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md align-top">
                          <span className="bg-surface-container-high px-1.5 py-0.5 border border-surface-dim font-bold text-on-surface">
                            SESSION_JWT
                          </span>
                        </td>
                        <td className="py-3 px-space-md align-top text-secondary">
                          <span className="text-on-surface font-medium">Aggregate Time-series Range [start, end, interval]</span>
                        </td>
                        <td className="py-3 px-space-md align-top text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                            200 OK (Cache 60s)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* EMBER SYSTEM REASONING SNIPPET */}
                <div className="p-space-md bg-surface-container border-[1.5px] border-on-surface rounded-DEFAULT shadow-[3px_3px_0px_0px_#1b1c19] flex flex-col md:flex-row items-start gap-space-md">
                  <div className="w-10 h-10 border-[1.5px] border-on-surface bg-surface-bright flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1b1c19]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface"></span>
                    </div>
                    <div className="w-4 h-0.5 bg-on-surface"></div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        EMBER ARCHITECTURAL PROOF: CONCURRENCY SAFEGUARD
                      </span>
                      <span className="font-label-sm text-label-sm text-primary font-bold">VERIFIED 100%</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      All price mutation requests through{" "}
                      <code className="font-mono text-on-surface bg-surface-container-high px-1">
                        /api/shopify/graphql/mutate-price
                      </code>{" "}
                      are wrapped in an optimistic lock on{" "}
                      <code className="font-mono text-on-surface bg-surface-container-high px-1">
                        ProductVariant.updatedAt
                      </code>
                      . Rapid OCR line imports from simultaneous vendor invoices will queue deterministically without race
                      conditions or Shopify rate-limit penalties.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COMPILED DESIGN SYSTEM TOKENS */}
          {/* ========================================================================= */}
          {activeTab === "tokens" && (
            <div className="space-y-space-lg animate-in fade-in duration-150">
              <section className="space-y-space-md">
                <div className="flex items-center justify-between border-b-[1.5px] border-on-surface pb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 bg-primary"></span>
                    <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">
                      // 04 · COMPILED DESIGN SYSTEM TOKENS
                    </h2>
                    <span className="font-label-sm text-label-sm bg-surface-container px-1.5 py-0.5 border border-surface-dim text-primary font-bold">
                      EDITORIAL MONO PRESET
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">
                    STANDARDS: BROADSHEET TERMINAL · 8PX RHYTHM
                  </span>
                </div>

                {/* Color Swatch Grid */}
                <div className="space-y-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                    01. CHROMATIC PALETTE &amp; SURFACE MATRICES
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-sm">
                    {/* Swatch 1 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">SURFACE CANVAS</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">#fbf9f4</span>
                      </div>
                      <div className="h-12 w-full border border-surface-dim bg-background flex items-end p-1">
                        <span className="font-label-sm text-label-sm text-secondary">--surface-canvas</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Warm archival paper base plane. Diffuses eye strain during high-density audit sessions.
                      </p>
                    </div>

                    {/* Swatch 2 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">SURFACE CARD</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">#f5f3ee</span>
                      </div>
                      <div className="h-12 w-full border border-surface-dim bg-surface-container-low flex items-end p-1">
                        <span className="font-label-sm text-label-sm text-secondary">--surface-container-low</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Muted bone container tone for elevated panels, ledger segments, and structural cards.
                      </p>
                    </div>

                    {/* Swatch 3 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">PRIMARY INK</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">#121110</span>
                      </div>
                      <div className="h-12 w-full border border-surface-dim bg-on-surface flex items-end p-1">
                        <span className="font-label-sm text-label-sm text-surface-container-lowest font-mono">--text-main</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        High-contrast carbon ink for uncompromising editorial typographic legibility.
                      </p>
                    </div>

                    {/* Swatch 4 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-primary">EDITORIAL ACCENT</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">#f25c05</span>
                      </div>
                      <div className="h-12 w-full border border-surface-dim bg-primary flex items-end p-1">
                        <span className="font-label-sm text-label-sm text-on-primary font-mono">--color-amber-orange</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Signal orange highlight for critical margin warnings, active task nodes, and focus rings.
                      </p>
                    </div>

                    {/* Swatch 5 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-emerald-800">GUARDED GREEN</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">#1b7a43</span>
                      </div>
                      <div className="h-12 w-full border border-surface-dim bg-emerald-700 flex items-end p-1">
                        <span className="font-label-sm text-label-sm text-surface-container-lowest font-mono">--color-verified-green</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Profitable margin verification, passed invariant tests, and healthy HMAC handshakes.
                      </p>
                    </div>

                    {/* Swatch 6 */}
                    <div className="border-[1.5px] border-on-surface p-space-sm bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">BORDER HAIRLINE</span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">1.5px SOLID</span>
                      </div>
                      <div className="h-12 w-full bg-surface-container flex items-center justify-center p-1">
                        <div className="w-full h-0 border-b-[1.5px] border-on-surface"></div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Pure structural perimeter without blurred shadows or synthetic elevation illusions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Typography Specimens */}
                <div className="space-y-space-xs pt-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                    02. TYPOGRAPHIC PAIRINGS &amp; SPECIMENS
                  </span>
                  <div className="border-[1.5px] border-on-surface bg-surface p-space-md space-y-space-md">
                    <div className="border-b border-surface-dim pb-space-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                          SERIF EDITORIAL DISPLAY // NEWSREADER (OPTICAL 72PT / 28PT)
                        </span>
                        <span className="font-label-sm text-label-sm text-primary font-bold">PRIMARY HEADINGS</span>
                      </div>
                      <div className="font-display text-headline-lg lg:text-display text-on-surface leading-tight tracking-tight">
                        The quick brown fox jumps over the margin guardrail.
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary mt-1">
                        Used for venture titles, macro financial narratives, and ledger section leads.
                      </p>
                    </div>

                    <div className="border-b border-surface-dim pb-space-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                          MONOSPACE TELEMETRY // JETBRAINS MONO (12PX / 11PX / 10PX · TRACKING +0.08EM)
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface font-bold">SYSTEM DATA &amp; CODE</span>
                      </div>
                      <div className="font-label-lg text-label-lg text-on-surface font-bold tracking-wider bg-surface-container-low p-space-sm border border-surface-dim font-mono">
                        SYS_OK // LATENCY 18ms // 420 SKUS AUDITED // DRIFT_DETECTED: FALSE // HMAC_SHA256: VALIDATED
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary mt-1">
                        Applied to status tags, timestamps, API payloads, schema tokens, and operational metadata.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">
                          BODY SERIF RUNTIME // NEWSREADER BODY-MD (16PX / 14PX)
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-bold">CONTEXTUAL COPY</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface leading-relaxed max-w-3xl">
                        Automated wholesale invoice ingestion reconciles merchant supplier records directly against live
                        Shopify product variants. Discrepancies greater than 2.5% automatically halt inventory auto-repricing
                        routines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Geometry, Borders & Shadows Matrix */}
                <div className="space-y-space-xs pt-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                    03. GEOMETRIC LAWS &amp; HARD ELEVATION
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                    <div className="border-[1.5px] border-on-surface p-space-md bg-surface">
                      <div className="font-label-sm text-label-sm text-secondary uppercase font-bold">CORNER RADIUS</div>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">0px / 2px Strict</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        No rounded bubbles or soft pills. Sharp brutalist angles assert technical precision and broadsheet identity.
                      </p>
                    </div>

                    <div className="border-[1.5px] border-on-surface p-space-md bg-surface shadow-[4px_4px_0px_0px_#1b1c19]">
                      <div className="font-label-sm text-label-sm text-secondary uppercase font-bold">HARD OFFSET SHADOW</div>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">3px 3px / 4px 4px Solid</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Un-blurred directional drop shadows in pure ink black (#1b1c19) or signal orange (#ca4b00).
                      </p>
                    </div>

                    <div className="border-[1.5px] border-on-surface p-space-md bg-surface">
                      <div className="font-label-sm text-label-sm text-secondary uppercase font-bold">SEGMENTED METERS</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="h-2 w-5 bg-on-surface"></div>
                        <div className="h-2 w-5 bg-on-surface"></div>
                        <div className="h-2 w-5 bg-on-surface"></div>
                        <div className="h-2 w-5 bg-primary"></div>
                        <div className="h-2 w-5 bg-surface-dim"></div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        Continuous gradients are replaced by stepped categorical blocks mimicking mechanical physical counters.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TASK GRAPH (DAG BOARD) */}
          {/* ========================================================================= */}
          {activeTab === "taskgraph" && (
            <div className="space-y-space-lg animate-in fade-in duration-150">
              <section className="flex flex-col gap-space-md">
                {/* Legend & Pipeline Vitals */}
                <div className="p-space-md bg-surface-container border border-surface-dim flex flex-wrap items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">STATUS KEY:</span>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm">
                      <span className="w-3 h-3 bg-on-surface border border-on-surface inline-block"></span>
                      <span>COMPLETED</span>
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold">
                      <span className="w-3 h-3 border-[1.5px] border-primary flex items-center justify-center bg-surface">
                        <span className="w-1.5 h-1.5 bg-primary animate-ping"></span>
                      </span>
                      <span>IN_PROGRESS</span>
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
                      <span className="w-3 h-3 border border-secondary-fixed-dim bg-surface-container-lowest inline-block"></span>
                      <span>QUEUED</span>
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-error">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      <span>BLOCKED</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-md border-l border-surface-dim pl-space-md">
                    <span className="font-label-sm text-label-sm font-bold uppercase text-secondary">TRACKS:</span>
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center gap-1">
                      <span className="w-2 h-2 bg-on-surface rounded-full"></span> BACKEND CORE
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold text-primary flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full"></span> UI &amp; SYNTHESIS
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold text-tertiary flex items-center gap-1">
                      <span className="w-2 h-2 bg-tertiary rounded-full"></span> CONTENT &amp; DOCS
                    </span>
                  </div>
                </div>

                {/* Pipeline Execution Vitals Banner */}
                <div className="grid grid-cols-2 md:grid-cols-5 border border-on-surface divide-x divide-on-surface bg-surface-container-lowest text-center">
                  <div className="p-2 flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-secondary">CRITICAL PATH</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">14 MIN EST.</span>
                  </div>
                  <div className="p-2 flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-secondary">TOTAL NODES</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">18 COMPILED</span>
                  </div>
                  <div className="p-2 flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-secondary">COMPLETED</span>
                    <span className="font-label-md text-label-md font-bold text-emerald-700">08 NODES (44%)</span>
                  </div>
                  <div className="p-2 flex flex-col bg-primary-fixed/20">
                    <span className="font-label-sm text-label-sm uppercase text-primary font-bold">CURRENT ACTIVE</span>
                    <span className="font-label-md text-label-md font-bold text-primary">T-09 (UI_SLIDERS)</span>
                  </div>
                  <div className="p-2 flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase text-secondary">REMAINING</span>
                    <span className="font-label-md text-label-md font-bold text-secondary">09 PENDING</span>
                  </div>
                </div>

                {/* Main Directed Acyclic Graph (Horizontal DAG Board) */}
                <div className="border-[1.5px] border-on-surface bg-surface-container-lowest relative overflow-x-auto shadow-[3px_3px_0px_0px_#111111]">
                  {/* Canvas Top Phase Header */}
                  <div className="grid grid-cols-5 border-b-[1.5px] border-on-surface bg-surface-container-high divide-x divide-on-surface font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    <div className="p-2.5 flex items-center justify-between">
                      <span>01. INIT &amp; SCHEMA</span>
                      <span className="text-emerald-700">✓ PASS</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span>02. CORE PIPELINES</span>
                      <span className="text-emerald-700">✓ PASS</span>
                    </div>
                    <div className="p-2.5 bg-primary-fixed/30 text-on-primary-fixed-variant flex items-center justify-between">
                      <span>03. UI SYNTHESIS</span>
                      <span className="text-primary animate-pulse">● ACTIVE</span>
                    </div>
                    <div className="p-2.5 text-secondary flex items-center justify-between">
                      <span>04. SECURITY &amp; SYNC</span>
                      <span>QUEUED</span>
                    </div>
                    <div className="p-2.5 text-secondary flex items-center justify-between">
                      <span>05. VERIFY &amp; DEPLOY</span>
                      <span>QUEUED</span>
                    </div>
                  </div>

                  {/* DAG Swimlanes Container */}
                  <div className="p-space-lg flex flex-col gap-space-lg relative min-w-[920px]">
                    {/* SVG Vector Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-on-surface/40 z-0" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <marker id="arrow" markerHeight={6} markerWidth={6} orient="auto-start-reverse" refX={6} refY={5} viewBox="0 0 10 10">
                          <path d="M 0 1 L 8 5 L 0 9 z" fill="#1b1c19"></path>
                        </marker>
                        <marker id="arrow-orange" markerHeight={6} markerWidth={6} orient="auto-start-reverse" refX={6} refY={5} viewBox="0 0 10 10">
                          <path d="M 0 1 L 8 5 L 0 9 z" fill="#a23a00"></path>
                        </marker>
                      </defs>
                      {/* Track 1 connections */}
                      <path d="M 175 60 L 215 45" fill="none" markerEnd="url(#arrow)" strokeWidth={1.5}></path>
                      <path d="M 175 60 L 215 75" fill="none" markerEnd="url(#arrow)" strokeWidth={1.5}></path>
                      <path d="M 375 45 L 415 45" fill="none" markerEnd="url(#arrow)" strokeWidth={1.5}></path>
                      <path d="M 575 45 L 615 45" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>
                      <path d="M 775 45 L 815 45" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>

                      {/* Cross-Lane Link: T-07 to T-09 */}
                      <path d="M 575 45 C 595 45, 400 160, 420 160" fill="none" markerEnd="url(#arrow-orange)" stroke="#a23a00" strokeWidth={2}></path>

                      {/* Track 2 connections */}
                      <path d="M 175 160 L 215 160" fill="none" markerEnd="url(#arrow)" strokeWidth={1.5}></path>
                      <path d="M 375 160 L 415 160" fill="none" markerEnd="url(#arrow-orange)" stroke="#a23a00" strokeWidth={2}></path>
                      <path d="M 575 160 L 615 160" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>
                      <path d="M 775 160 L 815 160" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>

                      {/* Track 3 connections */}
                      <path d="M 175 275 L 615 275" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>
                      <path d="M 775 275 L 815 275" fill="none" markerEnd="url(#arrow)" strokeDasharray="3 3" strokeWidth={1.5}></path>
                    </svg>

                    {/* TRACK 1: BACKEND CORE */}
                    <div className="flex items-center gap-space-md z-10">
                      <div className="w-24 shrink-0 font-label-sm text-label-sm font-bold uppercase text-on-surface border-r border-surface-dim pr-2">
                        <span>[TRACK:01]</span>
                        <span className="block text-secondary font-normal">BACKEND</span>
                      </div>
                      <div className="grid grid-cols-5 gap-space-lg flex-1">
                        {/* Col 1: T-01 */}
                        <div
                          onClick={() => setSelectedNodeId("T-01")}
                          className={`p-2.5 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                            selectedNodeId === "T-01" ? "border-primary bg-primary/5" : "border-on-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-01</span>
                            <span className="text-emerald-700">DONE</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1">Prisma Schema &amp; PG Migration</div>
                          <div className="mt-2 font-label-sm text-label-sm text-secondary">CORE_DATA</div>
                        </div>

                        {/* Col 2: T-04 & T-05 */}
                        <div className="flex flex-col gap-2">
                          <div
                            onClick={() => setSelectedNodeId("T-04")}
                            className={`p-2 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                              selectedNodeId === "T-04" ? "border-primary bg-primary/5" : "border-on-surface"
                            }`}
                          >
                            <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                              <span>T-04</span>
                              <span className="text-emerald-700">DONE</span>
                            </div>
                            <div className="font-body-sm text-body-sm leading-tight font-semibold mt-0.5">Webhook Ingestion Engine</div>
                          </div>
                          <div
                            onClick={() => setSelectedNodeId("T-05")}
                            className={`p-2 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                              selectedNodeId === "T-05" ? "border-primary bg-primary/5" : "border-on-surface"
                            }`}
                          >
                            <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                              <span>T-05</span>
                              <span className="text-emerald-700">DONE</span>
                            </div>
                            <div className="font-body-sm text-body-sm leading-tight font-semibold mt-0.5">Vendor PDF/CSV OCR Parser</div>
                          </div>
                        </div>

                        {/* Col 3: T-07 */}
                        <div
                          onClick={() => setSelectedNodeId("T-07")}
                          className={`p-2.5 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] h-fit ${
                            selectedNodeId === "T-07" ? "border-primary bg-primary/5" : "border-on-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-07</span>
                            <span className="text-emerald-700">DONE</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1">Margin Guardrails &amp; Math Logic</div>
                          <div className="mt-2 font-label-sm text-label-sm text-secondary">ENGINE_MATH</div>
                        </div>

                        {/* Col 4: T-10 */}
                        <div
                          onClick={() => setSelectedNodeId("T-10")}
                          className={`p-2.5 bg-surface-container border border-surface-dim text-secondary h-fit cursor-pointer transition-all ${
                            selectedNodeId === "T-10" ? "border-primary text-on-surface" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-10</span>
                            <span>QUEUED</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1 text-on-surface-variant">GraphQL Mutation Throttle</div>
                          <div className="mt-2 font-label-sm text-label-sm">SHOPIFY_API</div>
                        </div>

                        {/* Col 5: T-14 */}
                        <div
                          onClick={() => setSelectedNodeId("T-14")}
                          className={`p-2.5 bg-surface-container border border-surface-dim text-secondary h-fit cursor-pointer transition-all ${
                            selectedNodeId === "T-14" ? "border-primary text-on-surface" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-14</span>
                            <span>QUEUED</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1 text-on-surface-variant">Bulk Inventory SKU Push</div>
                          <div className="mt-2 font-label-sm text-label-sm">BACKGROUND_JOB</div>
                        </div>
                      </div>
                    </div>

                    {/* TRACK 2: UI & SYNTHESIS */}
                    <div className="flex items-center gap-space-md z-10">
                      <div className="w-24 shrink-0 font-label-sm text-label-sm font-bold uppercase text-primary border-r border-surface-dim pr-2">
                        <span>[TRACK:02]</span>
                        <span className="block text-primary-fixed-dim font-normal">UI/CLIENT</span>
                      </div>
                      <div className="grid grid-cols-5 gap-space-lg flex-1">
                        {/* Col 1: T-02 */}
                        <div
                          onClick={() => setSelectedNodeId("T-02")}
                          className={`p-2.5 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                            selectedNodeId === "T-02" ? "border-primary bg-primary/5" : "border-on-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-02</span>
                            <span className="text-emerald-700">DONE</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1">Design Tokens &amp; Typography</div>
                          <div className="mt-2 font-label-sm text-label-sm text-secondary">DESIGN_SYS</div>
                        </div>

                        {/* Col 2: T-06 */}
                        <div
                          onClick={() => setSelectedNodeId("T-06")}
                          className={`p-2.5 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                            selectedNodeId === "T-06" ? "border-primary bg-primary/5" : "border-on-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-06</span>
                            <span className="text-emerald-700">DONE</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1">Polaris Layout &amp; App Shell</div>
                          <div className="mt-2 font-label-sm text-label-sm text-secondary">NAVIGATION</div>
                        </div>

                        {/* Col 3: T-09 (ACTIVE NODE HIGHLIGHTED) */}
                        <div
                          onClick={() => setSelectedNodeId("T-09")}
                          className="p-3 bg-surface-container-lowest border-[2px] border-primary shadow-[3px_3px_0px_0px_#ca4b00] relative cursor-pointer"
                        >
                          <div className="absolute -top-2.5 -right-2 px-1.5 py-0.2 bg-primary text-on-primary font-label-sm text-label-sm font-bold uppercase">
                            ★ ACTIVE
                          </div>
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold text-primary">
                            <span>T-09</span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> 65%
                            </span>
                          </div>
                          <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1 leading-snug">
                            Reactive Margin Sliders &amp; SKU Table
                          </div>
                          <div className="mt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                            <span>DAEDALUS-03</span>
                            <span className="font-bold text-primary">SYNTHESIZING</span>
                          </div>
                          <div className="w-full bg-surface-dim h-1.5 mt-2 overflow-hidden">
                            <div className="bg-primary h-full w-[65%]"></div>
                          </div>
                        </div>

                        {/* Col 4: T-12 */}
                        <div
                          onClick={() => setSelectedNodeId("T-12")}
                          className={`p-2.5 bg-surface-container border border-surface-dim text-secondary cursor-pointer transition-all ${
                            selectedNodeId === "T-12" ? "border-primary text-on-surface" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-12</span>
                            <span>QUEUED</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1 text-on-surface-variant">Invoice Upload &amp; Diff Modal</div>
                          <div className="mt-2 font-label-sm text-label-sm">MODAL_UI</div>
                        </div>

                        {/* Col 5: T-15 */}
                        <div
                          onClick={() => setSelectedNodeId("T-15")}
                          className={`p-2.5 bg-surface-container border border-surface-dim text-secondary cursor-pointer transition-all ${
                            selectedNodeId === "T-15" ? "border-primary text-on-surface" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-15</span>
                            <span>QUEUED</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1 text-on-surface-variant">Store Settings Guardrails</div>
                          <div className="mt-2 font-label-sm text-label-sm">PREFERENCES</div>
                        </div>
                      </div>
                    </div>

                    {/* TRACK 3: CONTENT & INTEGRATION */}
                    <div className="flex items-center gap-space-md z-10">
                      <div className="w-24 shrink-0 font-label-sm text-label-sm font-bold uppercase text-tertiary border-r border-surface-dim pr-2">
                        <span>[TRACK:03]</span>
                        <span className="block text-secondary font-normal">INTEGRATION</span>
                      </div>
                      <div className="grid grid-cols-5 gap-space-lg flex-1">
                        {/* Col 1: T-03 */}
                        <div
                          onClick={() => setSelectedNodeId("T-03")}
                          className={`p-2.5 bg-surface-container-low border-[1.5px] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111111] ${
                            selectedNodeId === "T-03" ? "border-primary bg-primary/5" : "border-on-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-03</span>
                            <span className="text-emerald-700">DONE</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1">App Store Listing &amp; TOS</div>
                          <div className="mt-2 font-label-sm text-label-sm text-secondary">LEGAL_METADATA</div>
                        </div>

                        {/* Col 2 */}
                        <div className="p-2.5 border border-dashed border-surface-dim flex items-center justify-center font-label-sm text-label-sm text-secondary">
                          NO DEPENDENCY
                        </div>

                        {/* Col 3 */}
                        <div className="p-2.5 border border-dashed border-surface-dim flex items-center justify-center font-label-sm text-label-sm text-secondary">
                          PARALLEL WAIT
                        </div>

                        {/* Col 4: T-11 */}
                        <div
                          onClick={() => setSelectedNodeId("T-11")}
                          className={`p-2.5 bg-surface-container border border-surface-dim text-secondary cursor-pointer transition-all ${
                            selectedNodeId === "T-11" ? "border-primary text-on-surface" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                            <span>T-11</span>
                            <span>QUEUED</span>
                          </div>
                          <div className="font-body-sm text-body-sm font-semibold mt-1 text-on-surface-variant">OAuth 2.0 Token Vaulting</div>
                          <div className="mt-2 font-label-sm text-label-sm">AUTH_SERVICE</div>
                        </div>

                        {/* Col 5: T-16 & T-18 */}
                        <div className="flex flex-col gap-2">
                          <div
                            onClick={() => setSelectedNodeId("T-16")}
                            className={`p-2 bg-surface-container border border-surface-dim text-secondary cursor-pointer transition-all ${
                              selectedNodeId === "T-16" ? "border-primary text-on-surface" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                              <span>T-16</span>
                              <span>QUEUED</span>
                            </div>
                            <div className="font-body-sm text-body-sm leading-tight font-semibold mt-0.5 text-on-surface-variant">Playwright E2E Spec</div>
                          </div>
                          <div
                            onClick={() => setSelectedNodeId("T-18")}
                            className={`p-2 bg-surface-container border border-surface-dim text-secondary cursor-pointer transition-all ${
                              selectedNodeId === "T-18" ? "border-primary text-on-surface" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between font-label-sm text-label-sm font-bold">
                              <span>T-18</span>
                              <span>QUEUED</span>
                            </div>
                            <div className="font-body-sm text-body-sm leading-tight font-semibold mt-0.5 text-on-surface-variant">Vercel Edge Health Check</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Node Inspection Drawer Panel */}
                <div className="border-[1.5px] border-on-surface bg-surface-container-low p-space-md shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between border-b border-surface-dim pb-space-xs">
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
                      <span className="px-1.5 py-0.5 bg-primary text-on-primary font-bold">INSPECTOR</span>
                      <span className="font-bold text-on-surface uppercase tracking-wider">
                        NODE_TARGET: {selectedNode.id} // {selectedNode.title}
                      </span>
                    </div>
                    <div className="font-label-sm text-label-sm text-secondary font-mono">
                      EXEC_ID: #EX-8841-{selectedNode.id.replace("T-", "")}-D3
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md pt-space-xs">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase text-secondary">ASSIGNED AGENT</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 bg-primary"></span> {selectedNode.agent}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm uppercase text-secondary">PREREQUISITE TASKS</span>
                      <span className="font-label-md text-label-md font-semibold text-emerald-800 mt-0.5">
                        {selectedNode.prereqs}
                      </span>
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <span className="font-label-sm text-label-sm uppercase text-secondary">OUTPUT ARTIFACTS</span>
                      <span className="font-label-sm text-label-sm font-mono text-on-surface mt-0.5 truncate bg-surface border border-surface-dim px-2 py-1">
                        {selectedNode.artifacts}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-space-xs border-t border-surface-dim mt-space-xs font-label-sm text-label-sm gap-2">
                    <div className="flex items-center gap-space-md flex-wrap">
                      <span className="text-secondary">
                        ELAPSED: <strong className="text-on-surface">{selectedNode.elapsed}</strong>
                      </span>
                      <span className="text-secondary">
                        ESTIMATED REMAINING: <strong className="text-on-surface">{selectedNode.remaining}</strong>
                      </span>
                      <span className="text-secondary">
                        TOKEN CONSUMPTION: <strong className="text-on-surface">{selectedNode.tokens}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span className="font-semibold text-on-surface uppercase">CONCURRENCY: 3 WORKERS OK</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* DRAWER FIXED FOOTER BAR */}
        <div className="px-space-md lg:px-space-lg py-space-sm bg-surface-container-low border-t-[1.5px] border-on-surface flex flex-wrap items-center justify-between gap-space-md shrink-0">
          <div className="flex items-center gap-space-md font-label-sm text-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-on-surface font-bold">SCHEMA DRIFT: 0%</span>
            </div>
            <span className="text-secondary">·</span>
            <span className="text-secondary">
              PRISMA MIGRATION TESTED: <code className="text-on-surface font-mono font-semibold">20240318_init_clean</code>
            </span>
            <span className="text-secondary">·</span>
            <span className="text-secondary">OPENAPI 3.1 COMPLIANT</span>
          </div>

          <div className="flex items-center gap-space-sm">
            {activeTab !== "pages" && (
              <button
                onClick={() => {
                  const tabs: BuildSpecTab[] = ["pages", "datamodel", "api", "tokens", "taskgraph"];
                  const prevIdx = Math.max(0, tabs.indexOf(activeTab) - 1);
                  const targetTab = tabs[prevIdx];
                  if (targetTab) setActiveTab(targetTab);
                }}
                className="h-8 px-space-md bg-surface text-on-surface font-label-md text-label-md uppercase tracking-wider font-semibold rounded-DEFAULT border-[1.5px] border-on-surface hover:bg-surface-container-high transition-all shadow-[2px_2px_0px_0px_#1b1c19]"
                type="button"
              >
                ← PREV TAB
              </button>
            )}

            {activeTab !== "taskgraph" ? (
              <button
                onClick={() => {
                  const tabs: BuildSpecTab[] = ["pages", "datamodel", "api", "tokens", "taskgraph"];
                  const nextIdx = Math.min(tabs.length - 1, tabs.indexOf(activeTab) + 1);
                  const targetTab = tabs[nextIdx];
                  if (targetTab) setActiveTab(targetTab);
                }}
                className="h-8 px-space-md bg-on-surface text-surface-container-lowest font-label-md text-label-md uppercase tracking-wider font-bold rounded-DEFAULT border-[1.5px] border-on-surface hover:bg-primary transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#a23a00]"
                type="button"
              >
                <span>NEXT TAB</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="h-8 px-space-md bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider font-bold rounded-DEFAULT border-[1.5px] border-on-surface hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#ca4b00]"
                type="button"
              >
                <span>RETURN TO BUILD</span>
                <span className="material-symbols-outlined text-[15px]">check</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
