"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { IdeaModal } from "@/components/studio/idea-modal";
import { BuildModal } from "@/components/studio/build-modal";

export default function NewCompanyPage() {
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<any>(null);

  const handleApproveBuild = (idea: any) => {
    setActiveIdea(idea);
    setSurpriseOpen(false);
    setIdeaOpen(false);
    setBuildOpen(true);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => {}}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* 2. Main Content Canvas */}
      <div className="pl-60 min-h-screen flex flex-col">
        <DashboardHeader
          currentBreadcrumb="New Venture"
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((p) => !p)}
        />

        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(path) => {
            if (path === "scout") router.push("/dashboard/scout");
            if (path === "billing") router.push("/dashboard?tab=billing");
            if (path === "notifications") router.push("/dashboard/notifications");
          }}
        />

        <main className="w-full pt-14 flex-1 bg-surface pb-20">
          <div className="flex flex-col w-full">
            {/* Telemetry Subheader Ribbon */}
            <div className="w-full bg-surface-container-low border-b border-[#111111] px-6 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-space-sm select-none font-mono">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                <span className="inline-block w-2 h-2 bg-[#15803D] mr-1" />
                <span className="text-on-surface font-bold">[GENESIS_PROTOCOL</span>
                <span>//</span>
                <span>INITIALIZE_NEW_VENTURE]</span>
              </div>
              <div className="flex items-center gap-space-md font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span className="text-on-surface font-bold">184 CREDITS</span>
                  <span>BALANCE</span>
                </div>
                <span>|</span>
                <span className="text-[#15803D] font-bold">STATUS: READY</span>
              </div>
            </div>

            {/* Main Canvas Container */}
            <div className="max-w-6xl mx-auto w-full px-6 lg:px-12 py-10 flex flex-col gap-10">
              {/* Header Section with Editorial Tension */}
              <div className="flex flex-col gap-2 max-w-3xl border-b-[1.5px] border-[#111111] pb-8">
                <div className="flex items-center gap-2 font-mono text-label-sm uppercase tracking-widest text-primary font-bold">
                  <span>DISPATCH METHODOLOGY</span>
                  <span>—</span>
                  <span>STEP 01/03</span>
                </div>
                <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold font-serif tracking-tight text-on-surface leading-tight">
                  How do you want to start?
                </h1>
                <p className="font-body-md text-lg text-on-surface-variant font-serif leading-relaxed">
                  Select an initialization path. Each venture begins with empirical market signal or a
                  validated founder thesis. The autonomous swarm will architect, synthesize, and deploy
                  your software factory.
                </p>
              </div>

              {/* Cards Grid: Two Dual-Path Gateways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CARD 1: SURPRISE ME (HEURISTIC DISCOVERY) */}
                <div className="bg-surface-container-lowest border-[2px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#111111] transition-all">
                  <div className="flex flex-col gap-6">
                    {/* Protocol Pill & Cost Indicator */}
                    <div className="flex items-center justify-between border-b border-[#111111] pb-3">
                      <span className="font-mono text-label-sm text-[11px] uppercase tracking-wider font-bold text-secondary">
                        [PROTOCOL: HEURISTIC_DISCOVERY]
                      </span>
                      <span className="px-2 py-0.5 bg-[#FFF3E0] border border-[#111111] font-mono text-label-sm text-[11px] font-bold text-primary uppercase shadow-[1px_1px_0px_0px_#ca4b00]">
                        COST: 4 CREDITS
                      </span>
                    </div>

                    {/* Icon Emblem + Geometric Twin Dice Vector */}
                    <div className="w-16 h-16 bg-surface-container border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] p-2 flex items-center justify-center">
                      <svg
                        className="w-full h-full text-on-surface"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeWidth="1.75"
                        viewBox="0 0 48 48"
                      >
                        {/* Die 1 */}
                        <rect fill="#FAF9F4" height="22" width="22" x="6" y="16" />
                        <circle cx="17" cy="27" fill="currentColor" r="1.75" stroke="none" />
                        <circle cx="11" cy="21" fill="currentColor" r="1.75" stroke="none" />
                        <circle cx="23" cy="33" fill="currentColor" r="1.75" stroke="none" />
                        {/* Die 2 (Shifted back) */}
                        <path d="M20 16V8H40V28H28" />
                        <circle cx="30" cy="18" fill="currentColor" r="1.75" stroke="none" />
                        <circle cx="34" cy="14" fill="currentColor" r="1.75" stroke="none" />
                        <circle cx="26" cy="22" fill="currentColor" r="1.75" stroke="none" />
                      </svg>
                    </div>

                    {/* Title & Editorial Description */}
                    <div className="flex flex-col gap-2">
                      <div className="font-mono text-label-sm text-[12px] uppercase text-secondary">
                        METHOD 01 // AUTONOMOUS
                      </div>
                      <h2 className="font-headline-md text-2xl font-bold font-serif text-on-surface">
                        Find me a validated idea
                      </h2>
                      <p className="font-body-md text-sm text-on-surface-variant font-serif leading-relaxed">
                        Autonomous reconnaissance agent crawls developer forums, changelogs, and support
                        threads to synthesize unserved niche demand into an empirical specification.
                      </p>
                    </div>

                    {/* 3 Technical Step Points */}
                    <div className="flex flex-col gap-2.5 font-mono text-label-sm text-[12px] text-on-surface-variant border-t border-surface-variant pt-4">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">Heuristic Signal Gathering:</strong> 4 platform
                          crawlers running sentiment analysis
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">Market Proof Verification:</strong> Algorithmic
                          threshold check (pain-score ≥ 7.8)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">Specification Synthesis:</strong> Generates{" "}
                          <code className="text-primary font-bold">build-spec.json</code> + 8-agent swarm
                          briefing
                        </span>
                      </div>
                    </div>

                    {/* Manifest Telemetry Meta Box */}
                    <div className="p-3 bg-surface-container border border-[#111111] font-mono text-label-sm text-[11px] flex flex-col gap-1 text-secondary">
                      <div className="flex justify-between">
                        <span>EST. SCAN DURATION:</span>
                        <span className="text-on-surface font-bold">~240s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SWARM MEMBERS:</span>
                        <span className="text-on-surface font-bold">8 AGENTS PARALLEL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TARGET:</span>
                        <span className="text-primary font-bold">BOUNDED MICRO-SAAS</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Deck */}
                  <div className="mt-8 pt-4 border-t-[1.5px] border-[#111111] flex flex-col gap-2.5 font-mono">
                    <button
                      onClick={() => router.push("/dashboard/scout")}
                      className="w-full h-11 bg-[#111111] text-[#ffffff] hover:bg-primary border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold shadow-[3px_3px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">radar</span>
                      <span>SURPRISE ME</span>
                    </button>
                    <button
                      onClick={() => setSurpriseOpen(true)}
                      className="w-full h-9 bg-surface hover:bg-surface-container text-on-surface border border-[#111111] font-label-sm text-label-sm uppercase tracking-wider font-bold transition-all cursor-pointer"
                      type="button"
                    >
                      Browse Past Candidates
                    </button>
                  </div>
                </div>

                {/* CARD 2: I HAVE AN IDEA (DIRECT PARAMETRIC) */}
                <div className="bg-surface-container-lowest border-[2px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#111111] transition-all">
                  <div className="flex flex-col gap-6">
                    {/* Protocol Pill & Cost Indicator */}
                    <div className="flex items-center justify-between border-b border-[#111111] pb-3">
                      <span className="font-mono text-label-sm text-[11px] uppercase tracking-wider font-bold text-secondary">
                        [PROTOCOL: DIRECT_PARAMETRIC]
                      </span>
                      <span className="px-2 py-0.5 bg-[#E8F5E9] border border-[#111111] font-mono text-label-sm text-[11px] font-bold text-[#15803D] uppercase shadow-[1px_1px_0px_0px_#15803D]">
                        COST: 2 CREDITS
                      </span>
                    </div>

                    {/* Icon Emblem + Geometric Filament / Lightbulb Vector */}
                    <div className="w-16 h-16 bg-surface-container border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] p-2 flex items-center justify-center">
                      <svg
                        className="w-full h-full text-on-surface"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="square"
                        strokeWidth="1.75"
                        viewBox="0 0 48 48"
                      >
                        {/* Bulb Contour */}
                        <path
                          d="M16 26C13.5 23.5 12 20 12 16C12 9.37 17.37 4 24 4C30.63 4 36 9.37 36 16C36 20 34.5 23.5 32 26V34H16V26Z"
                          fill="#FAF9F4"
                        />
                        {/* Filament Core */}
                        <path d="M20 18L24 12L28 18" stroke="currentColor" strokeWidth="1.5" />
                        <line stroke="currentColor" strokeWidth="1.5" x1="24" x2="24" y1="12" y2="24" />
                        {/* Base Threading */}
                        <line x1="18" x2="30" y1="38" y2="38" />
                        <line x1="20" x2="28" y1="42" y2="42" />
                      </svg>
                    </div>

                    {/* Title & Editorial Description */}
                    <div className="flex flex-col gap-2">
                      <div className="font-mono text-label-sm text-[12px] uppercase text-secondary">
                        METHOD 02 // THESIS-LED
                      </div>
                      <h2 className="font-headline-md text-2xl font-bold font-serif text-on-surface">
                        Validate and build mine
                      </h2>
                      <p className="font-body-md text-sm text-on-surface-variant font-serif leading-relaxed">
                        Input your thesis, domain model, or user journey. The reasoning validator interrogates
                        feasibility, unit economics, and competitive moats before dispatching code generation.
                      </p>
                    </div>

                    {/* 3 Technical Step Points */}
                    <div className="flex flex-col gap-2.5 font-mono text-label-sm text-[12px] text-on-surface-variant border-t border-surface-variant pt-4">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-[#15803D] mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">Parametric Clarification:</strong> Interactive
                          interrogator (max 2 precision questions)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-[#15803D] mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">Competitive Moat Interrogation:</strong> Identifies
                          substitution risks &amp; pricing power
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-[#15803D] mt-1.5 shrink-0" />
                        <span>
                          <strong className="text-on-surface">GO / NO-GO Verdict:</strong> Bounded
                          recommendation + architecture specification
                        </span>
                      </div>
                    </div>

                    {/* Manifest Telemetry Meta Box */}
                    <div className="p-3 bg-surface-container border border-[#111111] font-mono text-label-sm text-[11px] flex flex-col gap-1 text-secondary">
                      <div className="flex justify-between">
                        <span>EST. VALIDATION:</span>
                        <span className="text-on-surface font-bold">~120s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SWARM MEMBERS:</span>
                        <span className="text-on-surface font-bold">8 AGENTS DETERMINISTIC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TARGET:</span>
                        <span className="text-[#15803D] font-bold">FOUNDER SPECIFICATION</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Deck */}
                  <div className="mt-8 pt-4 border-t-[1.5px] border-[#111111] flex flex-col gap-2.5 font-mono">
                    <button
                      onClick={() => setIdeaOpen(true)}
                      className="w-full h-11 bg-[#111111] text-[#ffffff] hover:bg-primary border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold shadow-[3px_3px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                      <span>START DISPATCH</span>
                    </button>
                    <button
                      onClick={() => setIdeaOpen(true)}
                      className="w-full h-9 bg-surface hover:bg-surface-container text-on-surface border border-[#111111] font-label-sm text-label-sm uppercase tracking-wider font-bold transition-all cursor-pointer"
                      type="button"
                    >
                      Upload Spec / PRD
                    </button>
                  </div>
                </div>
              </div>

              {/* Supplementary Navigation: Drafts & System Health */}
              <div className="mt-4 flex flex-col gap-4 font-mono">
                {/* Resume Draft Banner */}
                <div className="p-4 bg-surface-container-low border-[1.5px] border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#111111]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">drafts</span>
                    <div className="flex flex-col">
                      <div className="font-bold text-on-surface text-label-md">
                        RESUME DRAFT: Aura Logistics // Freight Invoice Parser
                      </div>
                      <div className="text-secondary text-[11px]">
                        DRAFT AUTO-SAVED 2H AGO • STEP 2/4 (SPECIFICATION DEFINED)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveIdea({
                        id: "aura-draft",
                        title: "Aura Logistics",
                        tagline: "Freight invoice audit and discrepancy extractor",
                        score: 8.6,
                        problem: "Logistics coordinators spend 4 hours daily matching BOLs with line invoices",
                        targetAudience: "Mid-market freight brokerages ($10M-$50M GMV)",
                        monetization: "$299/mo + $0.15 per matched invoice",
                      });
                      setBuildOpen(true);
                    }}
                    className="h-8 px-4 bg-surface-container hover:bg-[#111111] hover:text-[#ffffff] border border-[#111111] font-bold text-label-sm uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    type="button"
                  >
                    <span>Resume Setup</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                {/* Financial & Allotment Metadata */}
                <div className="flex flex-wrap items-center justify-between text-secondary text-label-sm pt-2 border-t border-surface-variant">
                  <div className="flex items-center gap-4">
                    <span>184 CREDITS REMAINING</span>
                    <span>·</span>
                    <span>AVG RUN: 3.2 CREDITS</span>
                    <span>·</span>
                    <Link href="/pricing" className="text-primary hover:underline">
                      TOP UP CREDITS
                    </Link>
                  </div>
                  <div className="text-[11px] text-secondary">
                    ALL ARTIFACTS COMPILED WITHIN EPHEMERAL SANDBOX VIRTUAL FILESYSTEMS. 100% EXPORTABLE NEXT.JS + PRISMA CODEBASE.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Studio Modals */}
      <SurpriseModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
        onApproveBuild={handleApproveBuild}
      />

      <IdeaModal
        isOpen={ideaOpen}
        onClose={() => setIdeaOpen(false)}
        onApproveBuild={handleApproveBuild}
      />

      <BuildModal
        isOpen={buildOpen}
        onClose={() => setBuildOpen(false)}
        idea={activeIdea}
      />
    </div>
  );
}
