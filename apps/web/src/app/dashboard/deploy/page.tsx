"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { AgentMascot } from "@/components/studio/agent-mascot";
import { LiveLogStream } from "@/components/studio/live-log-stream";
import { BuildTimeline, PipelineStep } from "@/components/studio/build-timeline";
import { api } from "@/lib/api-client";

function DeployProgressContent() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(768); // 12:48
  const [propagationProgress, setPropagationProgress] = useState(84);
  const [copied, setCopied] = useState(false);
  const [rawLogsModalOpen, setRawLogsModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Dynamic seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic propagation progression
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setPropagationProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    api.getDeployStatus().then((status) => {
      if (status && typeof status.propagationProgress === "number") {
        setPropagationProgress(status.propagationProgress);
      }
    }).catch(() => {});
  }, []);

  const handleCompleteDeploy = async () => {
    try {
      await api.completeDeploy();
    } catch {}
    router.push("/dashboard/company?company=Workspace");
  };

  const handleConfirmAbort = async () => {
    try {
      await api.cancelDeploy();
    } catch {}
    router.push("/dashboard/build");
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const endpointUrl = "https://Workspace-4k2.foundry.app";

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFullyDeployed = propagationProgress >= 100;

  const dynamicSteps: PipelineStep[] = [
    {
      id: "step-1",
      number: "01",
      name: "BUILD",
      description: "Compiled Next.js 15 App Router & Prisma schema in 44.2s",
      status: "COMPLETE",
      duration: "44.2s",
    },
    {
      id: "step-2",
      number: "02",
      name: "PUSH",
      description: "Container image OCI sha256:8b4e723 pushed to IAD1, FRA1, NRT1",
      status: "COMPLETE",
      duration: "18.5s",
    },
    {
      id: "step-3",
      number: "03",
      name: "ALLOCATE SUBDOMAIN",
      description: "Workspace-4k2.foundry.app CNAME verified & mapped",
      status: "COMPLETE",
      duration: "4.1s",
    },
    {
      id: "step-4",
      number: "04",
      name: "SMOKE TEST",
      description: "Synthetic ping to /api/health returned 200 OK in 18ms",
      status: "COMPLETE",
      duration: "1.2s",
    },
    {
      id: "step-5",
      number: "05",
      name: "GO LIVE",
      description: "Global Anycast traffic flip & Cloudflare TLS 1.3 propagation",
      status: isFullyDeployed ? "COMPLETE" : "RUNNING",
      duration: isFullyDeployed ? "8.4s" : undefined,
      progress: propagationProgress,
    },
  ];

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
        onSelectCompany={() => router.push("/dashboard/company?company=Workspace")}
      />

      {/* 2. Main Shell */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Header */}
        <DashboardHeader
          currentBreadcrumb="Workspace / Stage 07 Deploy In-Progress"
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
            if (path === "review") router.push("/dashboard/review");
            if (path === "company") router.push("/dashboard/company?company=Workspace");
          }}
        />

        {/* Content Viewport */}
        <main className="w-full pt-14 flex-1 flex flex-col bg-surface">
          {/* Top Deployment Hero Header */}
          <div className="bg-surface-container-low border-b-2 border-[#111111] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 bg-primary text-white border border-[#111111] shadow-[1px_1px_0px_0px_#111111] animate-pulse">
                  STAGE 05/05 ACTIVE
                </span>
                <h1 className="font-serif text-2xl font-bold text-on-surface">
                  Deploying Venture Workspace
                </h1>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs text-secondary">
                <span>ACTIVE BUILD PIPELINE</span>
                <span>•</span>
                <span>ELAPSED: <strong className="text-on-surface">{formatTimer(elapsedSeconds)}</strong></span>
                <span>•</span>
                <span>COMPUTE RESERVE: <strong className="text-primary font-bold">40/42 CREDITS</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isFullyDeployed ? (
                <button
                  type="button"
                  onClick={handleCompleteDeploy}
                  className="px-5 py-2.5 bg-[#15803D] text-white hover:bg-[#15803D]/90 border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[3px_3px_0px_0px_#111111]"
                >
                  ENTER LIVE CONSOLE ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteDeploy}
                  className="px-4 py-2 bg-surface text-on-surface hover:bg-surface-container border-2 border-[#111111] font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
                >
                  Skip to Company Console ➔
                </button>
              )}
            </div>
          </div>

          {/* Target Production Edge Endpoint Banner */}
          <div className="bg-surface-container-lowest border-b-2 border-[#111111] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase font-bold text-secondary">
                TARGET PRODUCTION EDGE:
              </span>
              <div className="font-mono text-sm font-bold text-primary px-3 py-1 bg-surface-container-low border border-[#111111] flex items-center gap-2">
                <span>{endpointUrl}</span>
                <span className="inline-block w-2 h-4 bg-primary animate-pulse"></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEndpoint}
                className="px-3 py-1 bg-surface border border-[#111111] font-mono text-xs uppercase font-bold hover:bg-surface-container transition-colors shadow-[1px_1px_0px_0px_#111111]"
              >
                {copied ? "COPIED ✓" : "COPY ENDPOINT"}
              </button>
              <a
                href={endpointUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-[#111111] text-white border border-[#111111] font-mono text-xs uppercase font-bold hover:bg-primary transition-colors shadow-[1px_1px_0px_0px_#111111]"
              >
                TEST EDGE ↗
              </a>
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
            {/* Left Column (7 cols): Stepped Pipeline Timeline & Propagation Bar */}
            <div className="col-span-7 p-6 border-r-2 border-[#111111] bg-surface flex flex-col gap-6 overflow-y-auto">
              {/* Live Propagation Progress Strip */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-5 shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-ping"></span>
                    <span className="font-mono text-xs uppercase font-bold text-on-surface">
                      GLOBAL CLOUDFLARE EDGE PROPAGATION
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {propagationProgress}% // 285 DNS NODES
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-4 bg-surface-container border-2 border-[#111111] overflow-hidden flex">
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const filled = (idx + 1) * 2.5 <= propagationProgress;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 border-r border-[#111111]/20 transition-all ${
                          filled ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-secondary pt-1 border-t border-[#111111]/15">
                  <div>
                    <span className="block text-on-surface font-bold">238 LIVE</span>
                    Edge PoPs Active
                  </div>
                  <div>
                    <span className="block text-primary font-bold">32 SYNCING</span>
                    TLS Handshake
                  </div>
                  <div>
                    <span className="block text-secondary font-bold">15 QUEUED</span>
                    Asia-Pacific Cluster
                  </div>
                </div>
              </div>

              {/* 5 Sequential Stepped Pipeline Timeline */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
                    SEQUENTIAL DEPLOYMENT PIPELINE
                  </span>
                  <span className="font-mono text-[11px] text-secondary">
                    STAGE 05 // FINAL ROLLOUT
                  </span>
                </div>
                <BuildTimeline steps={dynamicSteps} />
              </div>
            </div>

            {/* Right Column (5 cols): Mascot Ember, Real-Time Edge Logs & Ingress Map */}
            <div className="col-span-5 bg-surface-container-low flex flex-col gap-4 p-6 overflow-y-auto">
              {/* Agent Ember Unit */}
              <AgentMascot
                mood={isFullyDeployed ? "celebrating" : "deploying"}
                title="DAEDALUS-07 // DEPLOY ORCHESTRATOR"
                subtitle={
                  isFullyDeployed
                    ? "TRAFFIC FLIPPED // GLOBAL EDGE IS LIVE"
                    : "GLOBAL DNS FLIP IN PROGRESS // SSL 1.3 ACTIVE"
                }
              />

              {/* Global Node Ingress Map Visualization */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
                <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
                  <span className="font-mono text-xs uppercase font-bold text-on-surface">
                    GLOBAL EDGE INGRESS DISTRIBUTION
                  </span>
                  <span className="font-mono text-[10px] text-[#15803D] font-bold">
                    ANYCAST 0ms GEO-ROUTING
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2 border border-[#111111] bg-surface flex flex-col">
                    <span className="text-secondary text-[10px]">AMERICAS</span>
                    <span className="font-bold text-on-surface">IAD1 / SFO2</span>
                    <span className="text-[#15803D] text-[10px] mt-1">11ms • HEALTHY</span>
                  </div>
                  <div className="p-2 border border-[#111111] bg-surface flex flex-col">
                    <span className="text-secondary text-[10px]">EUROPE</span>
                    <span className="font-bold text-on-surface">FRA1 / LHR1</span>
                    <span className="text-[#15803D] text-[10px] mt-1">16ms • HEALTHY</span>
                  </div>
                  <div className="p-2 border border-[#111111] bg-surface flex flex-col">
                    <span className="text-secondary text-[10px]">ASIA-PACIFIC</span>
                    <span className="font-bold text-on-surface">NRT1 / SIN1</span>
                    <span className="text-primary text-[10px] mt-1">24ms • SYNCING</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Edge Log Stream */}
              <div className="h-64 border-2 border-[#111111]">
                <LiveLogStream isStreaming={!isFullyDeployed} />
              </div>
            </div>
          </div>

          {/* Action & Safety Footer */}
          <div className="bg-[#111111] text-[#ffffff] px-6 py-3 border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-4 font-mono text-xs select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRawLogsModalOpen(true)}
                className="px-3 py-1 bg-surface text-on-surface hover:bg-white font-mono text-xs uppercase font-bold transition-colors"
              >
                View Raw Edge Logs
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(true)}
                className="px-3 py-1 bg-surface text-error hover:bg-error hover:text-white font-mono text-xs uppercase font-bold transition-colors"
              >
                Cancel Deployment
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-secondary-fixed-dim">DAEDALUS-07 DEPLOY AGENT</span>
              <span className="text-primary font-bold">STATUS: RUNNING</span>
            </div>
          </div>
        </main>
      </div>

      {/* Raw Edge Logs Modal */}
      {rawLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[#111111] text-white border-2 border-[#111111] p-6 shadow-[8px_8px_0px_0px_#ca4b00] flex flex-col gap-4 max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <span className="font-mono text-xs uppercase font-bold text-primary">
                RAW EDGE CONTAINER RUNTIME LOGS (OCI / WORKERD)
              </span>
              <button
                onClick={() => setRawLogsModalOpen(false)}
                className="font-mono text-xs hover:text-primary"
              >
                [ CLOSE ]
              </button>
            </div>
            <pre className="font-mono text-xs text-[#d1d5db] overflow-y-auto p-3 bg-black border border-[#222222] whitespace-pre-wrap leading-relaxed max-h-[500px]">
{`[2026-11-18 12:48:01.002] [OCI] Layer sha256:1a84f verified in registry
[2026-11-18 12:48:02.102] [NEXT] App Router compilation: 14 dynamic routes, 2 API routes
[2026-11-18 12:48:04.420] [BUNDLE] Client bundle size: 142 KB (gzip: 38 KB)
[2026-11-18 12:48:08.810] [EDGE] Push to us-east: 200 OK
[2026-11-18 12:48:11.205] [EDGE] Push to eu-central: 200 OK
[2026-11-18 12:48:13.900] [CNAME] Workspace-4k2.foundry.app -> cloudflare-edge-ingress
[2026-11-18 12:48:16.140] [DNS] Anycast replication: 238/285 PoPs confirmed
[2026-11-18 12:48:18.500] [SSL] Edge cert valid until 2027-11-18 (TLS 1.3 only)
[2026-11-18 12:48:21.010] [SMOKE] Synthetic GET /api/health -> 200 OK (Latency: 18ms)
[2026-11-18 12:48:26.110] [WARMUP] PoP Tokyo NRT1 warm response 24ms`}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setRawLogsModalOpen(false)}
                className="px-4 py-1.5 bg-primary text-white font-mono text-xs uppercase font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest border-2 border-[#111111] p-6 shadow-[6px_6px_0px_0px_#ba1a1a] flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-error">
              Halt &amp; Abort Edge Deployment?
            </h3>
            <p className="font-serif text-sm text-secondary">
              This will tear down DNS allocations and leave the domain in standby mode. 40 credits have already been allocated.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmCancelOpen(false)}
                className="px-3 py-1.5 bg-surface border border-[#111111] font-mono text-xs uppercase font-bold"
              >
                Resume Deployment
              </button>
              <button
                onClick={handleConfirmAbort}
                className="px-4 py-1.5 bg-error text-white font-mono text-xs uppercase font-bold"
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeployProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-mono text-xs uppercase">
          Loading Deployment Pipeline...
        </div>
      }
    >
      <DeployProgressContent />
    </Suspense>
  );
}

