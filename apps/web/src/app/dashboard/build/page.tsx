"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { BuildSpecDrawer, BuildSpecTab } from "@/components/studio/build-spec-drawer";
import { api } from "@/lib/api-client";

interface TerminalLine {
  id: string;
  time: string;
  type: "info" | "success" | "warn" | "stage" | "cmd";
  text: string;
  filter: "compiler" | "tests" | "all";
}

const INITIAL_LOGS: TerminalLine[] = [
  { id: "1", time: "06:38:02", type: "info", text: "INITIALIZING DAEDALUS AUTONOMOUS RUNNER CONTAINER (x86_64)", filter: "all" },
  { id: "2", time: "06:38:04", type: "info", text: "Mounting ephemeral volume /var/foundry/workspaces/syndicate-01/Workspace...", filter: "all" },
  { id: "3", time: "06:38:12", type: "cmd", text: "git checkout -b autonomous/bld-8841-margin-engine", filter: "all" },
  { id: "4", time: "06:38:15", type: "info", text: "Loaded AST indexer: 42 typescript files parsed in 188ms.", filter: "compiler" },
  { id: "5", time: "06:38:45", type: "stage", text: "--- STAGE 1: ARCHITECT COMPLETE [Prisma + Next.js App Router] ---", filter: "all" },
  { id: "6", time: "06:39:00", type: "success", text: "Generated Prisma Client v5.14.0 (PostgreSQL target)", filter: "compiler" },
  { id: "7", time: "06:39:30", type: "stage", text: "--- STAGE 2: BACKEND COMPLETE [Shopify Webhooks & Price Ingestion] ---", filter: "all" },
  { id: "8", time: "06:39:45", type: "info", text: "Webhook register: PRODUCTS_UPDATE, INVENTORY_LEVELS_UPDATE", filter: "compiler" },
  { id: "9", time: "06:39:52", type: "success", text: "HMAC signature verification middleware verified.", filter: "compiler" },
  { id: "10", time: "06:40:00", type: "stage", text: "--- STAGE 3: UI SYNTHESIS IN PROGRESS [Component Tree] ---", filter: "all" },
  { id: "11", time: "06:40:02", type: "info", text: 'Reading design requirements: "Shopify Polaris aesthetic with Foundry High-Contrast Slate theme".', filter: "compiler" },
  { id: "12", time: "06:40:15", type: "cmd", text: "Compiling src/components/margin-guardrails.tsx via SWC...", filter: "compiler" },
  { id: "13", time: "06:40:22", type: "info", text: "AST Patch applied: Add DualThumbRangeSlider with strict 10% min threshold", filter: "compiler" },
  { id: "14", time: "06:40:48", type: "info", text: "Analyzing tailwind tokens: compiling utility grid layout...", filter: "compiler" },
  { id: "15", time: "06:41:04", type: "success", text: "✓ Tailwind CSS built in 42ms (CSS payload: 18.2 KB)", filter: "compiler" },
  { id: "16", time: "06:41:15", type: "cmd", text: "Executing test suite: vitest run tests/e2e/webhook-guard.spec.ts", filter: "tests" },
  { id: "17", time: "06:41:18", type: "success", text: "  ✓ tests/e2e/webhook-guard.spec.ts > rejects unsigned payload (12ms)", filter: "tests" },
  { id: "18", time: "06:41:19", type: "success", text: "  ✓ tests/e2e/webhook-guard.spec.ts > dispatches price delta warning on margin < 20% (44ms)", filter: "tests" },
  { id: "19", time: "06:41:20", type: "success", text: "  ✓ tests/e2e/webhook-guard.spec.ts > buffers concurrent Shopify webhook bursts (112ms)", filter: "tests" },
  { id: "20", time: "06:41:40", type: "info", text: "Synthesizing live data connector: src/hooks/use-price-delta.ts", filter: "compiler" },
  { id: "21", time: "06:41:50", type: "warn", text: "[WARN] Deprecated GraphQL query format on Shopify ProductByHandle, migrating to 2024-04 syntax...", filter: "compiler" },
  { id: "22", time: "06:42:02", type: "info", text: "Patching Shopify Admin GraphQL mutation `productVariantUpdate`...", filter: "compiler" },
  { id: "23", time: "06:42:15", type: "info", text: "Hot reload update emitted to WebSocket port :3001 (1 module recompiled)", filter: "compiler" },
];

function BuildConsoleInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modals & Navigation state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [specDrawerOpen, setSpecDrawerOpen] = useState(false);
  const [specDrawerTab, setSpecDrawerTab] = useState<BuildSpecTab>("pages");

  // Timer & Pipeline Telemetry
  const [elapsedSeconds, setElapsedSeconds] = useState(402); // 06:42
  const [termFilter, setTermFilter] = useState<"all" | "compiler" | "tests">("all");
  const [logs, setLogs] = useState<TerminalLine[]>(INITIAL_LOGS);
  const [previewViewportMode, setPreviewViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [marginThreshold, setMarginThreshold] = useState<number>(45);
  const [sandboxTokenCopied, setSandboxTokenCopied] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  // Check URL query for spec drawer
  useEffect(() => {
    const specParam = searchParams.get("spec");
    if (specParam === "open") {
      setSpecDrawerOpen(true);
      const tabParam = searchParams.get("tab") as BuildSpecTab;
      if (tabParam) setSpecDrawerTab(tabParam);
    }
  }, [searchParams]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live SSE Telemetry listener for real-time 8-agent swarm updates
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      if (typeof window !== "undefined" && "EventSource" in window) {
        es = new EventSource("/api/backend/stream");

        es.addEventListener("agent:log", (e: any) => {
          try {
            const data = JSON.parse(e.data);
            const now = new Date().toTimeString().split(" ")[0] || "12:00:00";
            setLogs((prev) => [
              ...prev,
              {
                id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                time: now,
                type: data.level === "warn" ? "warn" : data.stage === "BUILDING" ? "cmd" : "info",
                text: `[${data.stage || "SWARM"}] ${data.message}`,
                filter: data.stage === "QA" ? "tests" : "compiler",
              },
            ]);
          } catch {}
        });

        es.addEventListener("stage:change", (e: any) => {
          try {
            const data = JSON.parse(e.data);
            const now = new Date().toTimeString().split(" ")[0] || "12:00:00";
            setLogs((prev) => [
              ...prev,
              {
                id: `stage_${Date.now()}`,
                time: now,
                type: "stage",
                text: `=== STAGE: ${data.stage} === ${data.message || ""}`,
                filter: "all",
              },
            ]);
          } catch {}
        });

        es.addEventListener("build:complete", (e: any) => {
          try {
            const data = JSON.parse(e.data);
            const now = new Date().toTimeString().split(" ")[0] || "12:00:00";
            setLogs((prev) => [
              ...prev,
              {
                id: `complete_${Date.now()}`,
                time: now,
                type: "success",
                text: `✓ [COMPLETE] Venture Swarm shipped: ${data.liveUrl || data.simulatedUrl} (${data.filesWritten || 24} files written)`,
                filter: "all",
              },
            ]);
          } catch {}
        });
      }
    } catch {}

    return () => {
      es?.close();
    };
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const filteredLogs = logs.filter((log) => {
    if (termFilter === "all") return true;
    return log.filter === termFilter || log.filter === "all";
  });

  const handleClearBuffer = () => {
    setLogs([
      {
        id: "cleared",
        time: formatTime(elapsedSeconds),
        type: "info",
        text: "[DAEDALUS STREAM CLEARED] Running node session preserved.",
        filter: "all",
      },
    ]);
  };

  const handleCopySandboxToken = () => {
    navigator.clipboard.writeText("sndbx_token_live_8841_daedalus_99182");
    setSandboxTokenCopied(true);
    setTimeout(() => setSandboxTokenCopied(false), 2000);
  };

  const handleDownloadArtifacts = () => {
    const payload = JSON.stringify(
      {
        bldId: "BLD-8841",
        name: "Venture Workspace",
        version: "1.0.0-rc1",
        files: 24,
        tests: "18/18 passing",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Workspace-build-8841-manifest.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* Main Container */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Global Dashboard Header */}
        <DashboardHeader
          currentBreadcrumb="Build Pipeline // Workspace"
          onOpenCommandPalette={() => setPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
        />

        {/* Build Workspace Page Body */}
        <main className="w-full pt-14 flex-1 bg-surface flex flex-col justify-between">
          <div className="flex flex-col w-full">
            {/* Top Command & Pipeline Header */}
            <div className="w-full bg-surface-container-lowest border-b-2 border-on-surface px-space-md py-space-sm flex flex-col gap-space-sm select-none">
              {/* Row 1: Telemetry Meta & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-y-2 text-on-surface">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  <span className="text-on-surface font-bold">WORKSPACE</span>
                  <span>//</span>
                  <span>SYNDICATE-01</span>
                  <span>/</span>
                  <span>COMPANIES</span>
                  <span>/</span>
                  <span className="text-primary font-bold">Workspace_FOR_SHOPIFY</span>
                  <span>/</span>
                  <span className="bg-surface-container px-1 py-0.5 border border-on-surface text-on-surface font-semibold">
                    AUTONOMOUS_BUILD_PIPELINE #BLD-8841
                  </span>
                </div>

                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-container border border-on-surface font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-bold text-on-surface">BUILDING · IN_PROGRESS</span>
                  </div>

                  <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest border border-on-surface font-label-sm text-label-sm text-secondary">
                    <span className="text-on-surface font-bold">
                      ELAPSED: <span id="elapsed-timer">{formatTime(elapsedSeconds)}</span>
                    </span>
                    <span>(EST TOTAL: ~14:00)</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-surface-container-lowest border border-on-surface font-label-sm text-label-sm">
                    <span className="text-secondary">CREDITS:</span>
                    <span className="font-bold text-primary">17</span>
                    <span className="text-secondary">/ 42 CONSUMED</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="h-8 px-2.5 bg-surface-container-lowest text-error hover:bg-error-container border border-error font-label-sm text-label-sm uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#ba1a1a]"
                      type="button"
                    >
                      Cancel Build
                    </button>

                    <button
                      onClick={() => {
                        setSpecDrawerTab("pages");
                        setSpecDrawerOpen(true);
                      }}
                      className="h-8 px-2.5 bg-on-surface text-surface-container-lowest hover:bg-primary border border-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#111111]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      <span>View Build Spec</span>
                    </button>

                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-2.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#111111]"
                    >
                      <span>View Repo (GitHub)</span>
                      <span className="material-symbols-outlined text-[14px]">north_east</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Row 2: Headline Serif + Stage Telemetry Summary */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-t border-surface-variant pt-space-xs gap-2">
                <div className="flex items-baseline gap-space-sm">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Venture Workspace
                  </h1>
                  <span className="font-label-md text-label-md text-secondary uppercase tracking-widest hidden sm:inline">
                    [Venture Gen-04]
                  </span>
                </div>
                <div className="font-label-sm text-label-sm text-secondary uppercase flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-on-surface"></span>
                    <span>Target: Shopify App Store (Production API 2024-04)</span>
                  </span>
                  <span className="text-surface-variant">|</span>
                  <span className="text-on-surface font-bold">Node 3 of 7 Active</span>
                </div>
              </div>

              {/* Row 3: 7-Stage Horizontal Pipeline Track */}
              <div className="pt-space-xs pb-1 overflow-x-auto">
                <div className="min-w-[860px] grid grid-cols-7 gap-2 relative">
                  {/* Node 1: ARCHITECT (Done) */}
                  <div
                    onClick={() => {
                      setSpecDrawerTab("pages");
                      setSpecDrawerOpen(true);
                    }}
                    className="flex flex-col gap-1 p-2 bg-surface-container border border-on-surface shadow-[2px_2px_0px_0px_#111111] cursor-pointer hover:border-primary transition-all"
                    title="Click to view Stage 1 Architecture Spec"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface">1. ARCHITECT</span>
                      <span className="w-4 h-4 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-sm text-[10px]">
                        ✓
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Prisma schema &amp; Next.js
                    </span>
                    <div className="h-1 w-full bg-on-surface mt-0.5"></div>
                  </div>

                  {/* Node 2: BACKEND (Done) */}
                  <div
                    onClick={() => {
                      setSpecDrawerTab("api");
                      setSpecDrawerOpen(true);
                    }}
                    className="flex flex-col gap-1 p-2 bg-surface-container border border-on-surface shadow-[2px_2px_0px_0px_#111111] cursor-pointer hover:border-primary transition-all"
                    title="Click to view Backend API & Webhook Specs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface">2. BACKEND</span>
                      <span className="w-4 h-4 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-sm text-[10px]">
                        ✓
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Shopify Webhooks &amp; OCR
                    </span>
                    <div className="h-1 w-full bg-on-surface mt-0.5"></div>
                  </div>

                  {/* Node 3: UI (Active) */}
                  <div
                    onClick={() => {
                      setSpecDrawerTab("taskgraph");
                      setSpecDrawerOpen(true);
                    }}
                    className="flex flex-col gap-1 p-2 bg-surface-container-lowest border-2 border-primary shadow-[3px_3px_0px_0px_#a23a00] cursor-pointer"
                    title="Click to inspect Active UI Task Node"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold text-primary flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        <span>3. UI BUILD</span>
                      </span>
                      <span className="px-1 py-0.2 bg-primary text-on-primary font-label-sm text-[9px] font-bold">
                        RUNNING
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] text-on-surface font-semibold line-clamp-1">
                      Margin Sliders &amp; Tables
                    </span>
                    <div className="grid grid-cols-4 gap-0.5 h-1 mt-0.5">
                      <div className="bg-primary h-full"></div>
                      <div className="bg-primary h-full"></div>
                      <div className="bg-primary h-full animate-pulse"></div>
                      <div className="bg-surface-variant h-full"></div>
                    </div>
                  </div>

                  {/* Node 4: CONTENT (Future) */}
                  <div className="flex flex-col gap-1 p-2 bg-surface-container-low border border-surface-variant text-secondary">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm">4. CONTENT</span>
                      <span className="font-label-sm text-[10px] text-outline">QUEUE</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Empty states &amp; onboarding
                    </span>
                    <div className="h-1 w-full bg-surface-variant mt-0.5"></div>
                  </div>

                  {/* Node 5: INTEGRATE (Future) */}
                  <div className="flex flex-col gap-1 p-2 bg-surface-container-low border border-surface-variant text-secondary">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm">5. INTEGRATE</span>
                      <span className="font-label-sm text-[10px] text-outline">QUEUE</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Polaris SDK &amp; Auth2
                    </span>
                    <div className="h-1 w-full bg-surface-variant mt-0.5"></div>
                  </div>

                  {/* Node 6: QA & CODE REVIEW GATE */}
                  <div
                    onClick={() => router.push("/dashboard/review")}
                    className="flex flex-col gap-1 p-2 bg-surface-container-lowest border-2 border-primary text-on-surface cursor-pointer hover:bg-primary-fixed/20 shadow-[2px_2px_0px_0px_#111111] transition-all"
                    title="Click to view Code Review & QA Verification Gate"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold">6. QA GATE</span>
                      <span className="font-label-sm text-[10px] text-white bg-primary px-1 font-bold">REVIEW</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Playwright &amp; Invariants
                    </span>
                    <div className="h-1 w-full bg-[#15803D] mt-0.5"></div>
                  </div>

                  {/* Node 7: DEPLOY (Clickable to view Stage 07 Deploy) */}
                  <div
                    onClick={() => router.push("/dashboard/deploy")}
                    className="flex flex-col gap-1 p-2 bg-surface-container-low border border-surface-variant text-secondary cursor-pointer hover:border-on-surface hover:text-on-surface transition-all"
                    title="Click to preview Active Stage 07 Deployment"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold">7. DEPLOY</span>
                      <span className="font-label-sm text-[10px] text-primary font-bold">STAGE 07</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-secondary line-clamp-1">
                      Cloudflare Edge &amp; DNS
                    </span>
                    <div className="h-1 w-full bg-surface-variant mt-0.5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Tri-Split Workspace */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-14rem)] bg-surface">
              {/* ========================================================================= */}
              {/* LEFT COLUMN: Autonomous Agent Command Panel (approx 28% -> col-span-3) */}
              {/* ========================================================================= */}
              <div className="lg:col-span-3 border-r-2 border-on-surface bg-surface-container-low p-space-md flex flex-col justify-between gap-space-md">
                <div className="flex flex-col gap-space-md">
                  {/* Agent Identity & Mascot (Ember) */}
                  <div className="bg-surface-container-lowest border border-on-surface p-space-sm shadow-[3px_3px_0px_0px_#111111]">
                    <div className="flex items-start gap-space-sm">
                      {/* Ember Mascot Box */}
                      <div className="w-10 h-10 border-2 border-on-surface bg-surface-container-lowest relative flex flex-col items-center justify-center shrink-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-1.5 h-1.5 bg-on-surface rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-on-surface rounded-full"></span>
                        </div>
                        <div className="w-4 h-0.5 bg-on-surface"></div>
                        {/* Status Signal Square */}
                        <span className="w-1.5 h-1.5 bg-primary absolute -top-1 -right-1"></span>
                      </div>

                      {/* Speech / Status */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md font-bold text-on-surface tracking-wider">
                            DAEDALUS-03
                          </span>
                          <span className="font-label-sm text-[9px] bg-primary text-on-primary px-1 font-bold">
                            SYNTHESIS
                          </span>
                        </div>
                        <span className="font-label-sm text-[10px] text-secondary tracking-widest uppercase">
                          Ember Coder Core
                        </span>
                        <div className="mt-1.5 p-1 bg-surface-container border border-surface-variant font-label-sm text-[10px] text-on-surface font-semibold flex items-center gap-1">
                          <span className="text-primary font-bold">»</span>
                          <span className="tracking-wide">&quot;MAKING THE CHANGES&quot;</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-surface-variant flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary uppercase">Model Engine</span>
                      <span className="font-label-sm text-[10px] font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 border border-on-surface">
                        CODER · REASONER T1
                      </span>
                    </div>
                  </div>

                  {/* Current Micro-Objective Card */}
                  <div className="p-space-sm bg-surface-container-lowest border-l-4 border-l-primary border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      CURRENT OBJECTIVE
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface mt-1 leading-snug">
                      Synthesizing reactive margin slider component with sub-second GraphQL mutation debouncing against
                      Shopify Storefront pricing graph.
                    </p>
                    <div className="mt-2 pt-2 border-t border-surface-variant flex items-center justify-between font-label-sm text-label-sm">
                      <span className="text-secondary">AST NODES TOUCHED</span>
                      <span className="font-bold text-on-surface">148 ELEMENTS</span>
                    </div>
                  </div>

                  {/* Live Agent Activity Feed */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-surface-variant">
                      <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface">
                        TELEMETRY FEED
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    </div>

                    <div className="space-y-1.5 font-label-sm text-[10px] max-h-56 overflow-y-auto pr-1">
                      <div className="p-1.5 bg-surface-container-lowest border border-surface-variant flex flex-col gap-0.5 hover:border-on-surface transition-colors">
                        <div className="flex items-center justify-between text-secondary">
                          <span className="text-on-surface font-semibold">06:42:10</span>
                          <span className="px-1 bg-surface-container text-on-surface font-bold border border-surface-variant">
                            APPLY_PATCH
                          </span>
                        </div>
                        <span className="text-on-surface font-mono truncate text-[10px]">
                          src/hooks/use-price-delta.ts
                        </span>
                        <span className="text-secondary text-[9px]">+31 lines (Debounced callback hook)</span>
                      </div>

                      <div className="p-1.5 bg-surface-container-lowest border border-surface-variant flex flex-col gap-0.5 hover:border-on-surface transition-colors">
                        <div className="flex items-center justify-between text-secondary">
                          <span className="text-on-surface font-semibold">06:41:55</span>
                          <span className="px-1 bg-surface-container text-on-surface font-bold border border-surface-variant">
                            READ
                          </span>
                        </div>
                        <span className="text-on-surface font-mono truncate text-[10px]">
                          src/lib/shopify-graphql-client.ts
                        </span>
                      </div>

                      <div className="p-1.5 bg-surface-container-lowest border border-surface-variant flex flex-col gap-0.5 hover:border-on-surface transition-colors">
                        <div className="flex items-center justify-between text-secondary">
                          <span className="text-on-surface font-semibold">06:41:18</span>
                          <span className="px-1 bg-[#15803D] text-[#ffffff] font-bold">RUN_TESTS</span>
                        </div>
                        <span className="text-on-surface font-mono truncate text-[10px]">
                          tests/e2e/webhook-guard.spec.ts
                        </span>
                        <span className="text-[#15803D] font-bold text-[9px]">PASS 18/18 (214ms)</span>
                      </div>

                      <div className="p-1.5 bg-surface-container-lowest border border-surface-variant flex flex-col gap-0.5 hover:border-on-surface transition-colors">
                        <div className="flex items-center justify-between text-secondary">
                          <span className="text-on-surface font-semibold">06:40:04</span>
                          <span className="px-1 bg-surface-container text-on-surface font-bold border border-surface-variant">
                            EDIT
                          </span>
                        </div>
                        <span className="text-on-surface font-mono truncate text-[10px]">
                          src/components/pricing-table.tsx
                        </span>
                        <span className="text-secondary text-[9px]">+48 / -12 lines</span>
                      </div>

                      <div className="p-1.5 bg-surface-container-lowest border border-surface-variant flex flex-col gap-0.5 hover:border-on-surface transition-colors">
                        <div className="flex items-center justify-between text-secondary">
                          <span className="text-on-surface font-semibold">06:39:12</span>
                          <span className="px-1 bg-surface-container text-on-surface font-bold border border-surface-variant">
                            READ
                          </span>
                        </div>
                        <span className="text-on-surface font-mono truncate text-[10px]">
                          src/components/margin-guardrails.tsx
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent System Vitals Mini-Box */}
                <div className="p-space-sm bg-surface-container border border-on-surface mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                      RUNNER VITALS
                    </span>
                    <span className="font-label-sm text-[10px] text-secondary">AWS T4G.XLARGE</span>
                  </div>
                  <div className="space-y-1.5 font-label-sm text-label-sm">
                    <div>
                      <div className="flex justify-between text-[10px] text-secondary mb-0.5">
                        <span>CPU UTILIZATION</span>
                        <span className="font-bold text-on-surface">68%</span>
                      </div>
                      <div className="grid grid-cols-10 gap-0.5 h-1.5 bg-surface-container-high border border-surface-variant p-px">
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-primary h-full"></div>
                        <div className="bg-surface-variant h-full"></div>
                        <div className="bg-surface-variant h-full"></div>
                        <div className="bg-surface-variant h-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-surface-variant">
                      <span className="text-secondary">RAM: 1.42 GB / 4.0 GB</span>
                      <span className="text-on-surface font-bold">CONCURRENCY: 4</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* CENTER COLUMN: Terminal & Build Logs Stream (approx 44% -> col-span-5) */}
              {/* ========================================================================= */}
              <div className="lg:col-span-5 border-r-2 border-on-surface bg-[#18181b] text-[#f4f4f5] flex flex-col justify-between">
                {/* Terminal Control Bar */}
                <div className="h-10 px-3 bg-[#111112] border-b border-[#27272a] flex items-center justify-between select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                    </div>
                    <span className="font-label-sm text-[10px] text-[#a1a1aa] uppercase tracking-wider ml-2">
                      FOUNDRY_RUNTIME_DAEMON v4.12 · tty1
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTermFilter("all")}
                      className={`px-2 py-0.5 font-label-sm text-[9px] uppercase transition-colors ${
                        termFilter === "all" ? "bg-[#27272a] text-[#ffffff]" : "bg-[#18181b] text-[#a1a1aa] hover:text-[#ffffff]"
                      }`}
                      type="button"
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setTermFilter("compiler")}
                      className={`px-2 py-0.5 font-label-sm text-[9px] uppercase transition-colors ${
                        termFilter === "compiler" ? "bg-[#27272a] text-[#ffffff]" : "bg-[#18181b] text-[#a1a1aa] hover:text-[#ffffff]"
                      }`}
                      type="button"
                    >
                      COMPILER
                    </button>
                    <button
                      onClick={() => setTermFilter("tests")}
                      className={`px-2 py-0.5 font-label-sm text-[9px] uppercase transition-colors ${
                        termFilter === "tests" ? "bg-[#27272a] text-[#ffffff]" : "bg-[#18181b] text-[#a1a1aa] hover:text-[#ffffff]"
                      }`}
                      type="button"
                    >
                      TESTS
                    </button>
                    <div className="h-3 w-px bg-[#3f3f46] mx-1"></div>
                    <span className="flex items-center gap-1 text-[9px] font-label-sm text-[#22c55e]">
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full"></span>
                      SCROLL: ON
                    </span>
                  </div>
                </div>

                {/* Real Terminal Output Window */}
                <div
                  className="p-4 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[580px] space-y-1 text-[#d4d4d8] select-text flex-1"
                  id="terminal-scroll"
                >
                  {filteredLogs.map((log) => {
                    if (log.type === "stage") {
                      return (
                        <div key={log.id} className="text-[#e4e2dd] pt-1 font-bold">
                          {log.text}
                        </div>
                      );
                    }
                    if (log.type === "success") {
                      return (
                        <div key={log.id} className="text-[#22c55e]">
                          [{log.time}] {log.text}
                        </div>
                      );
                    }
                    if (log.type === "warn") {
                      return (
                        <div key={log.id} className="text-[#facc15]">
                          [{log.time}] {log.text}
                        </div>
                      );
                    }
                    if (log.type === "cmd") {
                      return (
                        <div key={log.id} className="text-[#38bdf8]">
                          [{log.time}] <span className="text-[#22c55e]">$</span> {log.text}
                        </div>
                      );
                    }
                    return (
                      <div key={log.id} className="text-[#71717a]">
                        [{log.time}] {log.text}
                      </div>
                    );
                  })}

                  <div className="text-[#ea580c] flex items-center gap-1 font-bold pt-1">
                    <span>[daedalus@foundry-runner-04 ~]$ compiling reactive margin table...</span>
                    <span className="animate-pulse inline-block w-2 h-3.5 bg-[#ea580c]"></span>
                  </div>
                </div>

                {/* Terminal Command Bar Footer */}
                <div className="p-2 bg-[#111112] border-t border-[#27272a] flex items-center justify-between font-label-sm text-[10px] shrink-0">
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <span className="text-[#22c55e]">● RUNNING</span>
                    <span>PID: 19482</span>
                    <span>MEM: 124MB (NODE_WORKER)</span>
                  </div>
                  <button
                    onClick={handleClearBuffer}
                    className="px-2 py-0.5 bg-[#27272a] text-[#a1a1aa] hover:text-[#ffffff] uppercase transition-colors"
                    type="button"
                  >
                    Clear Buffer
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* RIGHT COLUMN: Live Sandbox Preview Frame (approx 28% -> col-span-4) */}
              {/* ========================================================================= */}
              <div className="lg:col-span-4 bg-surface p-space-md flex flex-col justify-between gap-space-sm">
                {/* Preview Frame Header / Toolbar */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                      <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        LIVE SANDBOX PREVIEW
                      </span>
                    </div>
                    <span className="font-label-sm text-[9px] text-secondary uppercase bg-surface-container px-1 py-0.5 border border-surface-variant">
                      PORT 3000 · HOT RELOAD
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-surface-container p-1 border border-on-surface">
                    {/* Viewport Mode Toggle */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setPreviewViewportMode("desktop")}
                        className={`px-2 py-1 font-label-sm text-[10px] transition-all ${
                          previewViewportMode === "desktop"
                            ? "bg-surface-container-lowest text-on-surface border border-on-surface font-bold shadow-[1px_1px_0px_0px_#111111]"
                            : "bg-transparent text-secondary hover:text-on-surface uppercase"
                        }`}
                        type="button"
                      >
                        DESKTOP
                      </button>
                      <button
                        onClick={() => setPreviewViewportMode("mobile")}
                        className={`px-2 py-1 font-label-sm text-[10px] transition-all ${
                          previewViewportMode === "mobile"
                            ? "bg-surface-container-lowest text-on-surface border border-on-surface font-bold shadow-[1px_1px_0px_0px_#111111]"
                            : "bg-transparent text-secondary hover:text-on-surface uppercase"
                        }`}
                        type="button"
                      >
                        MOBILE
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const el = document.getElementById("preview-viewport");
                          if (el) {
                            el.style.opacity = "0.5";
                            setTimeout(() => {
                              el.style.opacity = "1";
                            }, 200);
                          }
                        }}
                        className="w-6 h-6 bg-surface-container-lowest border border-on-surface flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                        title="Force Reload Frame"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                      </button>
                      <a
                        href="/dashboard/launch"
                        className="font-label-sm text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 pl-1"
                      >
                        <span>POPOUT</span>
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Rendered Mock App Preview Container */}
                <div
                  className={`w-full flex-1 min-h-[460px] bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_#111111] flex flex-col overflow-hidden transition-all duration-300 ${
                    previewViewportMode === "mobile" ? "max-w-[320px] mx-auto" : "max-w-full"
                  }`}
                  id="preview-viewport"
                >
                  {/* Mock Browser Chrome */}
                  <div className="h-6 bg-surface-container border-b border-on-surface px-2 flex items-center justify-between select-none">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    </div>
                    <span className="font-label-sm text-[9px] text-secondary truncate max-w-[200px]">
                      http://localhost:3000/dashboard/margins
                    </span>
                    <span className="material-symbols-outlined text-[12px] text-secondary">lock</span>
                  </div>

                  {/* Rendered Venture Workspace Inside Sandbox */}
                  <div className="p-3 bg-surface flex-1 flex flex-col gap-2.5 overflow-y-auto">
                    {/* Mock In-App Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                          PW
                        </div>
                        <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                          Workspace Admin
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#dcfce7] text-[#15803D] font-label-sm text-[9px] font-bold border border-[#86efac]">
                        SHOPIFY STORE CONNECTED
                      </span>
                    </div>

                    {/* Alert Banner */}
                    <div className="p-2 bg-surface-container border border-primary text-on-surface flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">verified_user</span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] font-bold text-primary">
                          LIVE MUTATION INTERCEPTOR ACTIVE
                        </span>
                        <span className="text-[10px] text-secondary leading-tight">
                          Intercepted 4 price changes under 35% gross threshold in last 24h.
                        </span>
                      </div>
                    </div>

                    {/* KPI Metric Pill Cards in Sandbox */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-2 bg-surface-container-lowest border border-on-surface">
                        <span className="font-label-sm text-[9px] text-secondary uppercase block">
                          Margin Protected
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">+$18,420</span>
                        <span className="font-label-sm text-[9px] text-[#15803D] font-bold block mt-0.5">
                          ↑ 4.2% vs last week
                        </span>
                      </div>
                      <div className="p-2 bg-surface-container-lowest border border-on-surface">
                        <span className="font-label-sm text-[9px] text-secondary uppercase block">Flagged SKUs</span>
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">12 SKUs</span>
                        <span className="font-label-sm text-[9px] text-secondary block mt-0.5">Floor violation rule</span>
                      </div>
                    </div>

                    {/* Reactive Margin Slider Mock (Interactive!) */}
                    <div className="p-2.5 bg-surface-container-lowest border border-on-surface shadow-[2px_2px_0px_0px_#a23a00]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-sm text-[10px] font-bold uppercase text-on-surface">
                          Guardrail Threshold
                        </span>
                        <span className="font-label-sm text-[10px] font-bold text-primary px-1 bg-surface-container">
                          {marginThreshold}% TARGET
                        </span>
                      </div>

                      {/* Interactive range slider track */}
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={marginThreshold}
                        onChange={(e) => setMarginThreshold(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-surface-container cursor-pointer border border-on-surface"
                      />

                      <div className="flex justify-between text-[8px] font-label-sm text-secondary mt-1">
                        <span>0% (BREAK-EVEN)</span>
                        <span>100% (FULL RETAIL)</span>
                      </div>
                    </div>

                    {/* SKU Table Miniature */}
                    <div className="border border-on-surface bg-surface-container-lowest">
                      <div className="px-2 py-1 bg-surface-container border-b border-on-surface flex items-center justify-between">
                        <span className="font-label-sm text-[9px] font-bold uppercase text-on-surface">
                          Monitored Inventory
                        </span>
                        <span className="font-label-sm text-[8px] text-secondary">3 of 420 SKUs</span>
                      </div>
                      <div className="divide-y divide-surface-variant font-label-sm text-[9px]">
                        <div className="p-1.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-on-surface">Merino Wool Beanie</div>
                            <div className="text-secondary text-[8px]">SKU: MW-BEAN-BLK</div>
                          </div>
                          <div className="text-right">
                            <div className="text-error font-bold">28.4% MARGIN</div>
                            <div className="text-secondary line-through text-[8px]">$34.00 MSRP</div>
                          </div>
                        </div>

                        <div className="p-1.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-on-surface">Canvas Field Overshirt</div>
                            <div className="text-secondary text-[8px]">SKU: CFO-OLV-M</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#15803D] font-bold">54.2% MARGIN</div>
                            <div className="text-secondary text-[8px]">$120.00 MSRP</div>
                          </div>
                        </div>

                        <div className="p-1.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-on-surface">Heavyweight Boxy Tee</div>
                            <div className="text-secondary text-[8px]">SKU: HBT-RAW-L</div>
                          </div>
                          <div className="text-right">
                            <div className="text-on-surface font-bold">46.0% MARGIN</div>
                            <div className="text-secondary text-[8px]">$48.00 MSRP</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frame Footer Telemetry */}
                  <div className="p-1.5 bg-surface-container-high border-t border-on-surface flex items-center justify-between font-label-sm text-[9px] text-secondary">
                    <span>
                      FRAME: {previewViewportMode === "mobile" ? "320 x 510px" : "380 x 510px"}
                    </span>
                    <span className="text-on-surface font-semibold">REACT DOM: 4ms RENDER</span>
                  </div>
                </div>

                {/* Quick Action Under Sandbox */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-sm text-[10px] text-secondary">AUTO-COMPILING PREVIEW STREAM</span>
                  <button
                    onClick={handleCopySandboxToken}
                    className="text-primary hover:underline font-label-sm text-[10px] font-bold uppercase"
                    type="button"
                  >
                    {sandboxTokenCopied ? "Token Copied!" : "Copy Sandbox Token"}
                  </button>
                </div>
              </div>
            </div>

            {/* Grounded Bottom Telemetry Strip */}
            <div className="w-full bg-surface-container-highest border-t-2 border-on-surface px-space-md py-2 flex flex-wrap items-center justify-between gap-y-2 select-none">
              <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-on-surface"></span>
                  <span className="text-secondary">FILES CHANGED:</span>
                  <span className="font-bold text-on-surface">24</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#15803D]"></span>
                  <span className="text-secondary">TESTS PASSING:</span>
                  <span className="font-bold text-[#15803D]">18 / 18 (100%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#15803D]"></span>
                  <span className="text-secondary">ERRORS:</span>
                  <span className="font-bold text-on-surface">0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary"></span>
                  <span className="text-secondary">WARNINGS:</span>
                  <span className="font-bold text-primary">1 (DEPRECATED HOOK)</span>
                </div>
                <div className="hidden xl:flex items-center gap-1.5 border-l border-surface-variant pl-space-md text-secondary">
                  <span>BUILD WORKER:</span>
                  <span className="font-bold text-on-surface">AWS-US-EAST-1D</span>
                  <span className="px-1 bg-[#15803D] text-[#ffffff] text-[9px] font-bold">RUNNER_ACTIVE</span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
                <button
                  onClick={handleDownloadArtifacts}
                  className="px-2 py-1 bg-surface-container-lowest border border-on-surface hover:bg-surface-container font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1 text-on-surface shadow-[2px_2px_0px_0px_#111111]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>Download Artifacts (.tar.gz)</span>
                </button>

                <button
                  onClick={() => router.push("/dashboard/review")}
                  className="px-2.5 py-1 bg-surface-container-low text-on-surface border border-on-surface hover:bg-surface-container font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#111111]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">rule</span>
                  <span>Review Code</span>
                </button>

                <button
                  onClick={() => router.push("/dashboard/deploy")}
                  className="px-2.5 py-1 bg-primary text-on-primary border border-on-surface hover:bg-primary-container font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#ca4b00]"
                  type="button"
                >
                  <span>Stage 07 Deploy</span>
                  <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Build Spec Drawer (70% slide-over) */}
      <BuildSpecDrawer
        isOpen={specDrawerOpen}
        onClose={() => setSpecDrawerOpen(false)}
        defaultTab={specDrawerTab}
      />

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface border-2 border-on-surface p-space-md max-w-md w-full shadow-[6px_6px_0px_0px_#111111] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b border-surface-variant pb-2">
              <span className="font-label-sm text-label-sm font-bold text-error uppercase">HALT_PIPELINE // CONFIRM</span>
              <button onClick={() => setCancelModalOpen(false)} className="text-secondary hover:text-on-surface">✕</button>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Cancel Live Build BLD-8841?
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Halting this pipeline will stop the Daedalus-03 synthesizer and release the AWS T4g container runner. 17 credits consumed will not be refunded.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-3 py-1.5 bg-surface-container border border-on-surface font-label-sm text-label-sm font-bold uppercase"
              >
                Continue Build
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.cancelBuild();
                  } catch {}
                  setCancelModalOpen(false);
                  router.push("/dashboard");
                }}
                className="px-3 py-1.5 bg-error text-[#ffffff] border border-on-surface font-label-sm text-label-sm font-bold uppercase shadow-[2px_2px_0px_0px_#111111]"
              >
                Halt Build
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(path) => {
          setPaletteOpen(false);
          if (path === "new") router.push("/dashboard/new");
          if (path === "scout") router.push("/dashboard/scout");
          if (path === "validation") router.push("/dashboard/validation");
          if (path === "build") router.push("/dashboard/build");
          if (path === "launch") router.push("/dashboard/launch");
          if (path === "notifications") router.push("/dashboard/notifications");
          if (path === "billing") router.push("/dashboard?tab=billing");
          if (path === "settings") router.push("/dashboard?tab=settings");
        }}
      />

      {/* Notifications Popover */}
      <NotificationsPopover
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-label-md text-label-md uppercase">
          Loading Build Pipeline...
        </div>
      }
    >
      <BuildConsoleInner />
    </Suspense>
  );
}
