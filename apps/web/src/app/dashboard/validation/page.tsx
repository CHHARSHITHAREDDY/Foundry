"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { TweakSpecModal, SpecData } from "@/components/studio/tweak-spec-modal";
import { BuildModal } from "@/components/studio/build-modal";

type VerdictMode = "go" | "changes" | "deficit" | "nogo";

const DEFAULT_SPEC: SpecData = {
  name: "PriceWatch for Shopify",
  thesis: "Real-time Shopify supplier price hike alerts paired with automated margin guardrails.",
  targetAudience: "Shopify DTC Brands doing >100 orders/day ($1M-$10M GMV) experiencing gross margin volatility.",
  problemStatement: "Wholesale suppliers update pricing sheets across irregular Excel files and CSV links without notification, causing up to 14% gross margin loss.",
  moat: "Internal supplier cost-auditing linked with real-time Shopify Admin GraphQL variant repricing webhooks.",
  mvpScope: [
    "CSV/PDF Invoice Drop Zone & OCR parser",
    "Margin Threshold & Alert Rules per collection",
    "Variant Sync & Override Log with 1-click apply",
  ],
  pricing: "$79 - $149/mo flat SaaS fee (Direct ROI payback < 5 days)",
};

function ValidationGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode state: supports URL query param e.g. /dashboard/validation?mode=go|changes|deficit|nogo
  const initialMode = (searchParams.get("mode") as VerdictMode) || "changes";
  const [mode, setMode] = useState<VerdictMode>(initialMode);

  // Modals & Navigation
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tweakModalOpen, setTweakModalOpen] = useState(false);
  const [buildModalOpen, setBuildModalOpen] = useState(false);

  // Spec Data & Pivots
  const [spec, setSpec] = useState<SpecData>(DEFAULT_SPEC);
  const [selectedPivots, setSelectedPivots] = useState<number[]>([1]); // Pivot 1 selected by default in "changes"
  const [rescoreApplied, setRescoreApplied] = useState(false);
  const [expandedCrawlActive, setExpandedCrawlActive] = useState(false);

  const togglePivot = (pivotNum: number) => {
    setSelectedPivots((prev) =>
      prev.includes(pivotNum) ? prev.filter((p) => p !== pivotNum) : [...prev, pivotNum]
    );
  };

  const handleApplyRescore = () => {
    setRescoreApplied(true);
    setMode("go"); // Upgrades to GO with 83+ score
  };

  const handleExpandCrawl = () => {
    setExpandedCrawlActive(true);
    setTimeout(() => {
      setMode("changes"); // Unlocks more evidence and moves to conditional pass
    }, 1500);
  };

  const handleSelectPivotAngle = (angleName: string) => {
    setSpec((prev) => ({
      ...prev,
      name: angleName,
      thesis: `Enterprise-grade automated supplier discrepancy auditor and reconciliation workflow.`,
    }));
    setMode("changes");
  };

  const compositeScore =
    mode === "go"
      ? rescoreApplied
        ? 83
        : 88
      : mode === "changes"
      ? 74
      : mode === "deficit"
      ? 61
      : 42;

  const verdictLabel =
    mode === "go"
      ? "VERDICT: GO · PROCEED TO COMPILE"
      : mode === "changes"
      ? "VERDICT: GO WITH CHANGES"
      : mode === "deficit"
      ? "VERDICT: GO WITH CHANGES (LOW CONFIDENCE)"
      : "VERDICT: NO GO · HALTED";

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* 2. Main Content Layout */}
      <div className="pl-60 min-h-screen flex flex-col flex-1">
        <DashboardHeader
          currentBreadcrumb="Validation Gate"
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
            if (path === "new") router.push("/dashboard/new");
            if (path === "scout") router.push("/dashboard/scout");
            if (path === "notifications") router.push("/dashboard/notifications");
          }}
        />

        <main className="w-full pt-14 flex-1 bg-surface flex flex-col pb-28">
          <div className="flex flex-col w-full">
            {/* DEVELOPER VERDICT STATE SWITCHER STRIP */}
            <div className="w-full bg-[#111111] text-[#ffffff] px-space-md py-1.5 flex flex-wrap items-center justify-between gap-space-sm font-mono text-[11px] select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <span className="font-bold text-primary">EVALUATION SIMULATION ENGINE:</span>
                <span className="text-surface-variant">Switch verdict state to review all dossier outcomes:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMode("go")}
                  className={`px-2 py-0.5 border cursor-pointer font-bold transition-all ${
                    mode === "go"
                      ? "bg-[#15803D] text-[#ffffff] border-[#15803D]"
                      : "bg-surface-container-high text-secondary hover:text-white border-transparent"
                  }`}
                >
                  01 GO (88)
                </button>
                <button
                  onClick={() => setMode("changes")}
                  className={`px-2 py-0.5 border cursor-pointer font-bold transition-all ${
                    mode === "changes"
                      ? "bg-[#D97706] text-[#ffffff] border-[#D97706]"
                      : "bg-surface-container-high text-secondary hover:text-white border-transparent"
                  }`}
                >
                  02 GO WITH CHANGES (74)
                </button>
                <button
                  onClick={() => setMode("deficit")}
                  className={`px-2 py-0.5 border cursor-pointer font-bold transition-all ${
                    mode === "deficit"
                      ? "bg-[#B45309] text-[#ffffff] border-[#B45309]"
                      : "bg-surface-container-high text-secondary hover:text-white border-transparent"
                  }`}
                >
                  03 CORPUS DEFICIT (61)
                </button>
                <button
                  onClick={() => setMode("nogo")}
                  className={`px-2 py-0.5 border cursor-pointer font-bold transition-all ${
                    mode === "nogo"
                      ? "bg-error text-white border-error"
                      : "bg-surface-container-high text-secondary hover:text-white border-transparent"
                  }`}
                >
                  04 NO GO (42)
                </button>
              </div>
            </div>

            {/* TOP TELEMETRY BREADCRUMB & METADATA BAR */}
            <div className="w-full bg-surface-container-low border-b border-[#111111] px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm select-none font-mono text-label-sm">
              <div className="flex items-center gap-space-xs text-secondary uppercase tracking-wider">
                <span>WORKSPACE</span>
                <span className="text-secondary-fixed-dim">//</span>
                <span className="text-on-surface font-semibold">SYNDICATE-01</span>
                <span>/</span>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  COMPANIES
                </Link>
                <span>/</span>
                <span className="text-primary font-bold">VALIDATION_GATE</span>
                <span className="text-secondary-fixed-dim">·</span>
                <span className="px-1.5 py-0.5 bg-surface border border-[#111111] text-on-surface font-semibold">
                  ARCHIVE #8812
                </span>
                <span className="text-secondary-fixed-dim">·</span>
                <span className="text-primary font-bold">SPEC_ID: #PW-SHPFY-94812</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="px-2 py-0.5 border border-[#111111] bg-surface text-on-surface font-semibold uppercase">
                  SHOPIFY ECOSYSTEM
                </span>
                <span className="px-2 py-0.5 border border-[#111111] bg-surface text-on-surface font-semibold uppercase">
                  AUTOMATION &amp; MARGIN PROTECTION
                </span>
                <span className="px-2 py-0.5 border border-primary text-primary bg-[#fff4ee] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  VALIDATED 2 MIN AGO
                </span>
              </div>
            </div>

            {/* CRITICAL CORPUS DEFICIT BANNER (Mode: Deficit) */}
            {mode === "deficit" && (
              <div className="mx-space-lg md:mx-space-xl mt-space-md p-space-md bg-[#FFF7ED] border-[1.5px] border-[#D97706] shadow-[3px_3px_0px_0px_#D97706] relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-md">
                    <div className="w-9 h-9 shrink-0 bg-[#D97706] text-white flex items-center justify-center font-mono font-bold text-[18px]">
                      !
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-label-md font-bold uppercase tracking-wider text-[#92400E]">
                          CRITICAL CORPUS DEFICIT
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#FEF3C7] border border-[#D97706] text-label-sm font-bold text-[#B45309]">
                          SAMPLE_SIZE: N=4
                        </span>
                      </div>
                      <p className="font-headline-sm text-headline-sm text-[#78350F] leading-snug font-serif">
                        Limited evidence found in the wild. Model confidence: Low (32%).
                      </p>
                      <p className="font-label-sm text-label-sm text-[#92400E] max-w-4xl leading-relaxed mt-0.5 font-mono">
                        Ember scanned 420+ sources across Reddit, Hacker News, and Shopify App Store but located fewer
                        than 4 verified unprompted customer discussions in the trailing 90 days.
                      </p>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-end gap-2 shrink-0 font-mono">
                    <button
                      onClick={handleExpandCrawl}
                      disabled={expandedCrawlActive}
                      className="px-3 py-2 bg-[#111111] text-[#ffffff] text-label-sm uppercase tracking-wider border border-[#111111] shadow-[2px_2px_0px_0px_#D97706] hover:bg-primary transition-all flex items-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                      <span>{expandedCrawlActive ? "CRAWLING ARCHIVES..." : "EXPAND CRAWL (+1 CREDIT)"}</span>
                    </button>
                    <span className="text-[9px] text-[#92400E] tracking-tight">DEPTH: L3_SUBREDDIT_ARCHIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* HERO HEADER DOSSIER TITLE & VERDICT STAMP */}
            <div className="w-full bg-surface border-b border-[#111111] px-space-lg md:px-space-xl py-space-xl">
              <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
                <div className="flex flex-col gap-space-xs max-w-3xl">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-label-sm uppercase tracking-widest text-primary font-bold">
                      DISCOVERY DOSSIER // SYN-PRW-09
                    </span>
                    <span className="h-px w-8 bg-[#111111]" />
                    <span className="text-label-sm uppercase tracking-wider text-secondary">
                      CLASSIFIED LEVEL-2 REPO CANDIDATE
                    </span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold font-serif text-on-surface tracking-tight leading-none mt-1">
                    {spec.name}
                  </h1>
                  <p className="font-body-lg text-lg text-secondary italic mt-1 font-serif">
                    {spec.thesis}
                  </p>
                </div>

                {/* Verdict Stamp Card */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-space-xs shrink-0 font-mono">
                  <div
                    className={`px-space-md py-2 border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex items-center gap-2 select-none ${
                      mode === "go"
                        ? "bg-[#15803D] text-[#ffffff]"
                        : mode === "changes"
                        ? "bg-[#ffdbce] text-[#111111]"
                        : mode === "deficit"
                        ? "bg-[#FEF3C7] text-[#92400E] border-[#D97706]"
                        : "bg-surface-container-lowest border-2 border-error text-error shadow-[4px_4px_0px_0px_#ba1a1a]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {mode === "go"
                        ? "verified"
                        : mode === "changes"
                        ? "auto_fix_high"
                        : mode === "deficit"
                        ? "warning"
                        : "cancel"}
                    </span>
                    <span className="text-label-md uppercase font-bold tracking-widest">
                      {verdictLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-label-sm">
                    <span className="text-secondary uppercase">EVALUATION METRIC:</span>
                    <span className="px-2 py-0.5 bg-surface-container-highest border border-[#111111] font-bold text-on-surface tracking-wider">
                      COMPOSITE: {compositeScore} / 100
                    </span>
                    <span
                      className={`font-bold ${
                        mode === "go"
                          ? "text-[#15803D]"
                          : mode === "changes"
                          ? "text-[#D97706]"
                          : mode === "deficit"
                          ? "text-[#B45309]"
                          : "text-error"
                      }`}
                    >
                      {mode === "go"
                        ? "▲ CLASS-A"
                        : mode === "changes"
                        ? "▲ CLASS-B+"
                        : mode === "deficit"
                        ? "CLASS-C"
                        : "▼ CLASS-D"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN WORKSPACE CONTENT CONTAINER */}
            <div className="w-full max-w-[1440px] mx-auto px-space-lg md:px-space-xl py-space-xl flex flex-col gap-space-xl">
              {/* HERO CARD: "We suggest 3 changes" (Mode: Changes) */}
              {mode === "changes" && (
                <section className="bg-[#fffdfa] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] relative overflow-hidden">
                  <div className="w-full bg-[#ffdbce] border-b border-[#111111] px-space-md py-1.5 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2 text-label-sm font-bold text-on-primary-fixed uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px] text-primary">auto_fix_high</span>
                      <span>HEURISTIC_PIVOT_ENGINE // CALIBRATION_RECOMMENDED</span>
                    </div>
                    <span className="text-label-sm bg-[#111111] text-[#ffffff] px-2 py-0.2 uppercase font-bold tracking-widest">
                      3 CANDIDATES GENERATED
                    </span>
                  </div>

                  <div className="p-space-lg">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md mb-space-lg">
                      <div>
                        <h2 className="font-headline-md text-2xl font-bold font-serif text-on-surface mb-1">
                          We suggest 3 changes to de-risk market penetration
                        </h2>
                        <p className="font-body-md text-sm text-on-surface-variant font-serif max-w-3xl leading-relaxed">
                          Ember's simulation indicates the current specification faces friction in general DTC.
                          Selecting one or more architectural pivots will optimize your composite score before compilation.
                        </p>
                      </div>

                      <div className="shrink-0 bg-surface-container-low border border-[#111111] p-2 flex items-center gap-3 font-mono">
                        <div className="w-7 h-7 bg-[#111111] text-[#ffffff] flex items-center justify-center font-label-sm font-bold">
                          [·_·]
                        </div>
                        <div className="text-label-sm leading-tight">
                          <div className="font-bold text-on-surface uppercase">Ember Calibration</div>
                          <div className="text-primary font-bold">EST. NEW SCORE: 83 (+9 PTS)</div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Selectable Pivot Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
                      {/* Option 1 */}
                      <div
                        onClick={() => togglePivot(1)}
                        className={`relative bg-surface-container-lowest border-2 p-space-md cursor-pointer transition-all hover:-translate-y-0.5 ${
                          selectedPivots.includes(1)
                            ? "border-primary shadow-[3px_3px_0px_0px_#a23a00]"
                            : "border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-space-sm font-mono">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPivots.includes(1)
                                  ? "border-primary bg-primary"
                                  : "border-[#111111] bg-white"
                              }`}
                            >
                              {selectedPivots.includes(1) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
                              )}
                            </div>
                            <span className="text-label-sm font-bold uppercase text-primary tracking-wider">
                              PIVOT 01 · RECOMMENDED
                            </span>
                          </div>
                          {selectedPivots.includes(1) && (
                            <span className="text-label-sm bg-[#ffdbce] text-on-primary-fixed font-bold px-1.5 py-0.5 border border-primary">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h3 className="font-headline-sm text-lg font-bold font-serif text-on-surface mb-2 leading-snug">
                          Narrow to Shopify stores doing &gt;100 orders/day
                        </h3>
                        <p className="font-body-sm text-sm text-secondary mb-space-md leading-normal font-serif">
                          Filters out inactive low-GMV stores. Focuses positioning exclusively on high-velocity
                          merchants with active SKU churn and real margin pain.
                        </p>
                        <div className="pt-space-sm border-t border-surface-variant flex flex-wrap gap-1.5 font-mono">
                          <span className="text-label-sm font-bold bg-[#15803D] text-[#ffffff] px-2 py-0.5 uppercase tracking-wider">
                            +1 DEMAND (5/5)
                          </span>
                          <span className="text-label-sm font-bold bg-surface-container border border-[#111111] text-on-surface px-1.5 py-0.5 uppercase tracking-wider">
                            WILLINGNESS-TO-PAY +12%
                          </span>
                        </div>
                      </div>

                      {/* Option 2 */}
                      <div
                        onClick={() => togglePivot(2)}
                        className={`relative bg-surface-container-lowest border-2 p-space-md cursor-pointer transition-all hover:-translate-y-0.5 ${
                          selectedPivots.includes(2)
                            ? "border-primary shadow-[3px_3px_0px_0px_#a23a00]"
                            : "border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-space-sm font-mono">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPivots.includes(2)
                                  ? "border-primary bg-primary"
                                  : "border-[#111111] bg-white"
                              }`}
                            >
                              {selectedPivots.includes(2) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
                              )}
                            </div>
                            <span className="text-label-sm font-bold uppercase text-secondary tracking-wider">
                              PIVOT 02 · GEOGRAPHIC
                            </span>
                          </div>
                          <span className="text-label-sm text-secondary font-medium">OPTIONAL</span>
                        </div>
                        <h3 className="font-headline-sm text-lg font-bold font-serif text-on-surface mb-2 leading-snug">
                          Target India first (UPI &amp; GST Auto-Invoicing)
                        </h3>
                        <p className="font-body-sm text-sm text-secondary mb-space-md leading-normal font-serif">
                          Tap into fast-growing D2C brand volume in Gurgaon/Bengaluru with unaddressed localized
                          pricing APIs and wholesale invoice reconciliations.
                        </p>
                        <div className="pt-space-sm border-t border-surface-variant flex flex-wrap gap-1.5 font-mono">
                          <span className="text-label-sm font-bold bg-surface-container border border-[#111111] text-on-surface px-1.5 py-0.5 uppercase tracking-wider">
                            COMPETITION +1
                          </span>
                          <span className="text-label-sm font-medium bg-surface-container-high text-secondary px-1.5 py-0.5 uppercase tracking-wider">
                            DEV_CYCLES +2D
                          </span>
                        </div>
                      </div>

                      {/* Option 3 */}
                      <div
                        onClick={() => togglePivot(3)}
                        className={`relative bg-surface-container-lowest border-2 p-space-md cursor-pointer transition-all hover:-translate-y-0.5 ${
                          selectedPivots.includes(3)
                            ? "border-primary shadow-[3px_3px_0px_0px_#a23a00]"
                            : "border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-space-sm font-mono">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPivots.includes(3)
                                  ? "border-primary bg-primary"
                                  : "border-[#111111] bg-white"
                              }`}
                            >
                              {selectedPivots.includes(3) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
                              )}
                            </div>
                            <span className="text-label-sm font-bold uppercase text-secondary tracking-wider">
                              PIVOT 03 · VELOCITY
                            </span>
                          </div>
                          <span className="text-label-sm text-secondary font-medium">OPTIONAL</span>
                        </div>
                        <h3 className="font-headline-sm text-lg font-bold font-serif text-on-surface mb-2 leading-snug">
                          Start with email alerts only (Defer Admin webhooks)
                        </h3>
                        <p className="font-body-sm text-sm text-secondary mb-space-md leading-normal font-serif">
                          Bypasses Shopify Admin write permission reviews; cuts initial v1 compile cycle by 65%
                          by outputting plain digest emails directly to store owners.
                        </p>
                        <div className="pt-space-sm border-t border-surface-variant flex flex-wrap gap-1.5 font-mono">
                          <span className="text-label-sm font-bold bg-surface-container border border-[#111111] text-on-surface px-1.5 py-0.5 uppercase tracking-wider">
                            BUILDABILITY +1
                          </span>
                          <span className="text-label-sm font-bold bg-[#15803D] text-[#ffffff] px-1.5 py-0.5 uppercase tracking-wider">
                            SPEED_TO_MVP -6 MIN
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pivot Footer Action & Telemetry Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-md border-t-2 border-[#111111] bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg py-space-md font-mono">
                      <div className="flex items-center gap-space-sm">
                        <button
                          onClick={handleApplyRescore}
                          className="px-space-md py-2.5 bg-[#111111] text-[#ffffff] text-label-md font-bold uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#a23a00] hover:bg-primary transition-all flex items-center gap-2 cursor-pointer"
                          type="button"
                        >
                          <span>APPLY AND RE-SCORE</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                        <div className="hidden md:flex items-center text-label-sm border border-[#111111] bg-surface-container-lowest">
                          <span className="px-2 py-1 bg-[#111111] text-[#ffffff] font-bold">STATE: READY</span>
                          <span className="px-2 py-1 text-secondary uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
                            SIMULATE: ~10 SEC
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-label-sm text-secondary">
                        <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                        <span>
                          Re-scoring consumes <strong className="text-on-surface">0 credits</strong>. Takes ~10s to simulate.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* REALITY CHECK CARD: WHY EMBER RECOMMENDS HALTING (Mode: NoGo) */}
              {mode === "nogo" && (
                <div className="w-full bg-surface-container-lowest border-2 border-[#111111] p-space-lg shadow-[4px_4px_0px_0px_#111111]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-sm border-b border-[#111111] gap-space-xs font-mono">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 border border-[#111111] bg-surface flex flex-col items-center justify-center p-1 relative shadow-[2px_2px_0px_0px_#111111]">
                        <div className="w-full flex items-center justify-between px-1">
                          <div className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
                          <div className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
                        </div>
                        <div className="w-4 h-0.5 bg-[#111111] mt-1.5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-error" />
                      </div>
                      <div>
                        <span className="text-label-sm uppercase text-error tracking-widest font-bold block">
                          [CRITICAL_FAILURE_MODES // HEURISTIC_DEFICIT]
                        </span>
                        <h2 className="font-headline-md text-xl md:text-2xl font-bold font-serif text-on-surface">
                          Honest reality check: Why Ember recommends halting
                        </h2>
                      </div>
                    </div>
                    <div className="text-label-sm uppercase tracking-widest px-2 py-1 bg-surface-container-high border border-surface-variant text-secondary">
                      SYS_CONFIDENCE: 94.8%
                    </div>
                  </div>

                  {/* 3 Punchy Failure Modes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-md">
                    {/* Failure Mode 1 */}
                    <div className="p-space-md bg-surface border border-[#111111] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-space-xs border-b border-surface-variant mb-space-sm font-mono text-label-sm">
                          <span className="font-bold text-error">FM-01 · HIGH CHURN</span>
                          <span className="px-1 bg-error text-on-error font-bold">FATAL</span>
                        </div>
                        <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface mb-space-xs">
                          Micro-merchant churn (&lt;$50k GMV)
                        </h3>
                        <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed font-serif">
                          Target SMB operators lack dedicated inventory ops. 68% of test cohorts churn within
                          60 days before realizing net-positive ROI on a $79/mo subscription.
                        </p>
                      </div>
                      <div className="pt-space-sm mt-space-sm border-t border-surface-variant flex items-center justify-between font-mono text-label-sm text-secondary">
                        <span>CAC PAYBACK</span>
                        <span className="text-error font-bold">14.2 MONTHS</span>
                      </div>
                    </div>

                    {/* Failure Mode 2 */}
                    <div className="p-space-md bg-surface border border-[#111111] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-space-xs border-b border-surface-variant mb-space-sm font-mono text-label-sm">
                          <span className="font-bold text-error">FM-02 · PLATFORM RISK</span>
                          <span className="px-1 bg-error text-on-error font-bold">FATAL</span>
                        </div>
                        <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface mb-space-xs">
                          Native Shopify Admin lock-in
                        </h3>
                        <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed font-serif">
                          Shopify Editions introduced draft variant bulk cost editing and automated price thresholds
                          natively, collapsing 70% of the friction wedge without external apps.
                        </p>
                      </div>
                      <div className="pt-space-sm mt-space-sm border-t border-surface-variant flex items-center justify-between font-mono text-label-sm text-secondary">
                        <span>SURPLUS MOAT</span>
                        <span className="text-error font-bold">NEGLIGIBLE</span>
                      </div>
                    </div>

                    {/* Failure Mode 3 */}
                    <div className="p-space-md bg-surface border border-[#111111] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-space-xs border-b border-surface-variant mb-space-sm font-mono text-label-sm">
                          <span className="font-bold text-error">FM-03 · CAC DISTORTION</span>
                          <span className="px-1 bg-surface-container-high text-secondary font-bold">SEVERE</span>
                        </div>
                        <h3 className="font-headline-sm text-base font-bold font-serif text-on-surface mb-space-xs">
                          Saturated app store category
                        </h3>
                        <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed font-serif">
                          "Price Monitoring" lists 42 entrenched incumbents with &gt;500 reviews. App Store search
                          bid CPCs average $14.80, pushing install acquisition cost beyond $320.
                        </p>
                      </div>
                      <div className="pt-space-sm mt-space-sm border-t border-surface-variant flex items-center justify-between font-mono text-label-sm text-secondary">
                        <span>APP STORE RANK</span>
                        <span className="text-error font-bold">PAGE 4+</span>
                      </div>
                    </div>
                  </div>

                  {/* RECOMMENDED PIVOT ANGLES (Recovery Vectors) */}
                  <div className="mt-space-lg pt-space-md border-t border-[#111111] flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between pb-space-xs font-mono text-label-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="bg-[#111111] text-[#ffffff] px-1.5 py-0.5 font-bold uppercase">
                          RECOVERY VECTORS
                        </span>
                        <h3 className="font-bold text-on-surface">Recommended Pivot Angles (Alternative Paths)</h3>
                      </div>
                      <span className="text-secondary font-mono">3 ARCHITECTURES IDENTIFIED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                      {/* Angle 1 */}
                      <div className="bg-surface border border-[#111111] p-space-md flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111]">
                        <div className="flex flex-col gap-space-xs font-mono">
                          <div className="flex items-center justify-between text-label-sm">
                            <span className="text-secondary">PIVOT_01 // UP-MARKET</span>
                            <span className="bg-surface-container text-on-surface font-bold px-1.5 py-0.5 border border-[#111111]">
                              EST: 81 / 100
                            </span>
                          </div>
                          <h4 className="font-headline-sm text-base font-bold font-serif text-on-surface mt-1">
                            Enterprise Multi-Warehouse COGS Auditor
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed font-serif">
                            Pivot target to $10M+ brands managing 4+ 3PL warehouses with ERP bridges (NetSuite, Katana).
                          </p>
                          <div className="mt-space-xs py-1 border-y border-surface-variant flex items-center justify-between text-label-sm text-secondary">
                            <span>TARGET ACV</span>
                            <span className="font-bold text-on-surface">$12,000 / YR</span>
                          </div>
                        </div>
                        <div className="mt-space-md pt-space-sm font-mono">
                          <button
                            onClick={() => handleSelectPivotAngle("Enterprise Multi-Warehouse COGS Auditor")}
                            className="w-full h-8 bg-surface text-on-surface text-label-sm uppercase font-bold tracking-wider border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                            type="button"
                          >
                            <span>USE THIS ANGLE</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>

                      {/* Angle 2 */}
                      <div className="bg-surface border border-[#111111] p-space-md flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111]">
                        <div className="flex flex-col gap-space-xs font-mono">
                          <div className="flex items-center justify-between text-label-sm">
                            <span className="text-secondary">PIVOT_02 // WORKFLOW ESCROW</span>
                            <span className="bg-surface-container text-on-surface font-bold px-1.5 py-0.5 border border-[#111111]">
                              EST: 77 / 100
                            </span>
                          </div>
                          <h4 className="font-headline-sm text-base font-bold font-serif text-on-surface mt-1">
                            Supplier Invoice Discrepancy Escrow
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed font-serif">
                            Automate invoice-to-PO line reconciliation. Detect unannounced supplier freight surcharges.
                          </p>
                          <div className="mt-space-xs py-1 border-y border-surface-variant flex items-center justify-between text-label-sm text-secondary">
                            <span>TARGET ACV</span>
                            <span className="font-bold text-on-surface">$3,600 / YR</span>
                          </div>
                        </div>
                        <div className="mt-space-md pt-space-sm font-mono">
                          <button
                            onClick={() => handleSelectPivotAngle("Supplier Invoice Discrepancy Escrow")}
                            className="w-full h-8 bg-surface text-on-surface text-label-sm uppercase font-bold tracking-wider border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                            type="button"
                          >
                            <span>USE THIS ANGLE</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>

                      {/* Angle 3 */}
                      <div className="bg-surface border border-[#111111] p-space-md flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111]">
                        <div className="flex flex-col gap-space-xs font-mono">
                          <div className="flex items-center justify-between text-label-sm">
                            <span className="text-secondary">PIVOT_03 // OMNICHANNEL</span>
                            <span className="bg-surface-container text-on-surface font-bold px-1.5 py-0.5 border border-[#111111]">
                              EST: 74 / 100
                            </span>
                          </div>
                          <h4 className="font-headline-sm text-base font-bold font-serif text-on-surface mt-1">
                            Amazon-to-Shopify Margin Parity Agent
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed font-serif">
                            Autonomous arbitrage rebalancing. When Amazon dynamic pricing lowers margin, sync Shopify.
                          </p>
                          <div className="mt-space-xs py-1 border-y border-surface-variant flex items-center justify-between text-label-sm text-secondary">
                            <span>TARGET ACV</span>
                            <span className="font-bold text-on-surface">$2,400 / YR</span>
                          </div>
                        </div>
                        <div className="mt-space-md pt-space-sm font-mono">
                          <button
                            onClick={() => handleSelectPivotAngle("Amazon-to-Shopify Margin Parity Agent")}
                            className="w-full h-8 bg-surface text-on-surface text-label-sm uppercase font-bold tracking-wider border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                            type="button"
                          >
                            <span>USE THIS ANGLE</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN 2-COLUMN SPLIT: LEFT SPECIFICATION (62%) & RIGHT STICKY SCORECARD (38%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                {/* LEFT COLUMN: ANALYTICAL BREAKDOWN (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-space-xl">
                  {/* 01 THE PROBLEM STATEMENT */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">01 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          The Problem Statement
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">
                        {mode === "deficit" ? "[UNVERIFIED THESIS]" : "[SEV-1 COGS LEAKAGE]"}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed font-serif">
                      {spec.problemStatement}
                    </p>
                    <div className="mt-space-md p-space-sm bg-surface-container border-l-4 border-primary border-t border-r border-b border-[#111111] flex items-start gap-space-sm font-mono text-label-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                        warning
                      </span>
                      <div className="flex flex-col leading-snug">
                        <span className="font-bold text-on-surface uppercase tracking-wide">
                          Observed Friction Pattern:
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          REVENUE RECOGNIZED BEFORE COGS AUDIT · CRITICAL REVENUE LEAK OCCURS DURING 30-DAY INVOICE FLOAT PERIOD
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* 02 TARGET CUSTOMER PROFILE */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">02 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          Target Customer Profile
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">
                        [AUDIENCE PROFILE &amp; VOLUME]
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-space-md font-mono text-label-sm">
                      <span className="px-2.5 py-1 bg-surface-container border border-[#111111] text-on-surface font-semibold uppercase">
                        Shopify DTC Brands ($500K–$5M GMV)
                      </span>
                      <span className="px-2.5 py-1 bg-surface-container border border-[#111111] text-on-surface font-semibold uppercase">
                        Operations &amp; Merchandising Managers
                      </span>
                      <span className="px-2.5 py-1 bg-surface-container border border-[#111111] text-on-surface font-semibold uppercase">
                        E-Commerce Margin Analysts
                      </span>
                      <span className="px-2.5 py-1 bg-surface-container border border-[#111111] text-on-surface font-semibold uppercase">
                        Multi-Vendor Catalog Stores (500+ SKUs)
                      </span>
                    </div>
                    <div className="p-space-sm bg-surface-container-high border border-[#111111] flex items-center justify-between font-mono text-label-sm">
                      <span className="text-secondary uppercase font-semibold">Verified Addressability:</span>
                      <span className="font-bold text-on-surface tracking-wider">
                        ICP CONCENTRATION: 38,400 STORES (US/CA/UK) · CONFIDENCE 91%
                      </span>
                    </div>
                  </section>

                  {/* 03 WHY NOW & STRUCTURAL TAILWINDS */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">03 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          Why Now &amp; Structural Tailwinds
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">[MARKET INFLECTION]</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed font-serif">
                      Wholesale freight and raw material volatility has forced{" "}
                      <strong className="underline decoration-primary decoration-1">
                        3x higher price update frequency
                      </strong>{" "}
                      from suppliers. Meanwhile, Shopify’s Admin GraphQL 2024 webhooks and automated line-item
                      margin triggers enable instant sub-second price adjustments without requiring heavy custom ERP integrations.
                    </p>
                  </section>

                  {/* 04 PRIMARY SOURCES & UNPROMPTED VOICE OF CUSTOMER */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">04 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          Primary Sources &amp; Unsolicited Voice of Customer
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">[3 VERIFIED EXTRACTS]</span>
                    </div>
                    <div className="flex flex-col gap-space-md font-serif">
                      {/* Quote 1 */}
                      <div className="p-space-md bg-surface border-l-2 border-[#111111] border border-surface-variant flex flex-col gap-space-xs hover:border-[#111111] transition-colors">
                        <p className="font-body-lg text-body-lg italic text-on-surface">
                          “We lost $18,400 last quarter simply because our apparel supplier raised knitwear costs by 8% and we didn’t notice for 42 days.”
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-surface-variant font-mono">
                          <span className="text-label-sm text-secondary uppercase">
                            Apparel &amp; Dry Goods Merchant · $2.4M ARR
                          </span>
                          <span className="text-label-sm text-primary font-bold uppercase flex items-center gap-0.5">
                            r/shopify · Oct 14, 2024
                            <span className="material-symbols-outlined text-[13px]">north_east</span>
                          </span>
                        </div>
                      </div>

                      {/* Quote 2 */}
                      <div className="p-space-md bg-surface border-l-2 border-[#111111] border border-surface-variant flex flex-col gap-space-xs hover:border-[#111111] transition-colors">
                        <p className="font-body-lg text-body-lg italic text-on-surface">
                          “Reconciling 200-page vendor packing slips against our Shopify variant pricing is a full-time nightmare.”
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-surface-variant font-mono">
                          <span className="text-label-sm text-secondary uppercase">
                            Home Goods Founder · 1,200 active SKUs
                          </span>
                          <span className="text-label-sm text-primary font-bold uppercase flex items-center gap-0.5">
                            Hacker News (Ask HN) · Nov 02, 2024
                            <span className="material-symbols-outlined text-[13px]">north_east</span>
                          </span>
                        </div>
                      </div>

                      {/* Quote 3 */}
                      <div className="p-space-md bg-surface border-l-2 border-[#111111] border border-surface-variant flex flex-col gap-space-xs hover:border-[#111111] transition-colors">
                        <p className="font-body-lg text-body-lg italic text-on-surface">
                          “Every price monitoring app is built for competitors, not suppliers. We need supplier cost sync before our ad spend burns empty profit.”
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-surface-variant font-mono">
                          <span className="text-label-sm text-secondary uppercase">
                            DTC Growth Lead · Scaled Media Buyer
                          </span>
                          <span className="text-label-sm text-primary font-bold uppercase flex items-center gap-0.5">
                            Twitter/X @dtc_operator · Jan 19, 2025
                            <span className="material-symbols-outlined text-[13px]">north_east</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 05 COMPETITIVE MATRIX & DEFENSIBILITY */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">05 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          Competitive Matrix &amp; Structural Moat
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">[OPP_INDEX: HIGH]</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md font-mono">
                      <div className="border border-[#111111] bg-surface p-space-sm flex flex-col justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-label-md font-bold text-on-surface">PriceMole</span>
                          <span className="text-label-sm text-secondary uppercase">$49 / MO · EXTERIOR SCRAPER</span>
                          <p className="font-serif text-sm text-secondary mt-1">
                            Tracks competitor frontend HTML. Completely blind to inward COGS and supplier packing lists.
                          </p>
                        </div>
                        <div className="mt-space-md pt-space-xs border-t border-[#111111]">
                          <span className="text-label-sm px-1.5 py-0.5 bg-[#fee2e2] text-[#991b1b] border border-[#f87171] font-bold block text-center">
                            ✕ NO INVOICE INGESTION
                          </span>
                        </div>
                      </div>

                      <div className="border border-[#111111] bg-surface p-space-sm flex flex-col justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-label-md font-bold text-on-surface">Prisync</span>
                          <span className="text-label-sm text-secondary uppercase">$99 / MO · ENTERPRISE BOT</span>
                          <p className="font-serif text-sm text-secondary mt-1">
                            Focuses on global ecommerce competitive intelligence. No Shopify line-item cost syncing.
                          </p>
                        </div>
                        <div className="mt-space-md pt-space-xs border-t border-[#111111]">
                          <span className="text-label-sm px-1.5 py-0.5 bg-[#fee2e2] text-[#991b1b] border border-[#f87171] font-bold block text-center">
                            ✕ NO AUTOMATED GUARDS
                          </span>
                        </div>
                      </div>

                      <div className="border border-[#111111] bg-surface p-space-sm flex flex-col justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-label-md font-bold text-on-surface">ProfitProtect</span>
                          <span className="text-label-sm text-secondary uppercase">$149 / MO · RETROACTIVE AUDIT</span>
                          <p className="font-serif text-sm text-secondary mt-1">
                            Runs month-end post-mortem analyses. Discovers margin shortfalls weeks after loss occurs.
                          </p>
                        </div>
                        <div className="mt-space-md pt-space-xs border-t border-[#111111]">
                          <span className="text-label-sm px-1.5 py-0.5 bg-[#fee2e2] text-[#991b1b] border border-[#f87171] font-bold block text-center">
                            ✕ DELAYED 30-DAY REPORT
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 06 TARGET MVP SCOPE & ARCHITECTURE */}
                  <section className="bg-surface-container-lowest border border-[#111111] p-space-lg shadow-[2px_2px_0px_0px_#111111]">
                    <div className="flex items-baseline justify-between border-b border-[#111111] pb-space-xs mb-space-md font-mono">
                      <div className="flex items-baseline gap-2">
                        <span className="text-label-sm text-primary font-bold">06 //</span>
                        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface">
                          Target MVP Scope &amp; Architecture Spec
                        </h2>
                      </div>
                      <span className="text-label-sm text-secondary uppercase">[BUILD READY]</span>
                    </div>
                    <div className="flex flex-col gap-space-md font-mono">
                      <div>
                        <span className="text-label-sm uppercase font-bold text-secondary tracking-wider block mb-2">
                          3 CORE CLIENT SCREENS
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="border border-[#111111] bg-surface p-space-sm flex flex-col gap-1">
                            <span className="text-label-sm text-primary font-bold">SCREEN 01</span>
                            <span className="text-label-md font-bold text-on-surface">Invoice Drop Zone</span>
                            <p className="font-serif text-xs text-secondary">
                              Drag-and-drop parser with instant OCR tabular row verification.
                            </p>
                          </div>
                          <div className="border border-[#111111] bg-surface p-space-sm flex flex-col gap-1">
                            <span className="text-label-sm text-primary font-bold">SCREEN 02</span>
                            <span className="text-label-md font-bold text-on-surface">Margin Guard Rules</span>
                            <p className="font-serif text-xs text-secondary">
                              Set target floor % (e.g. 45% net) per collection or supplier ID.
                            </p>
                          </div>
                          <div className="border border-[#111111] bg-surface p-space-sm flex flex-col gap-1">
                            <span className="text-label-sm text-primary font-bold">SCREEN 03</span>
                            <span className="text-label-md font-bold text-on-surface">Variant Reprice Log</span>
                            <p className="font-serif text-xs text-secondary">
                              Real-time delta feed with one-click bulk apply to Shopify Admin.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-surface-variant pt-space-sm">
                        <span className="text-label-sm uppercase font-bold text-secondary tracking-wider block mb-2">
                          HEADLESS BACKEND SERVICES &amp; ENDPOINTS
                        </span>
                        <div className="flex flex-col gap-1.5 text-label-sm">
                          <div className="bg-surface border border-[#111111] px-space-sm py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-[#111111] text-[#ffffff] font-bold">POST</span>
                              <span className="font-bold text-on-surface">/api/webhooks/shopify/variant-update</span>
                            </div>
                            <span className="text-secondary uppercase">LATENCY TARGET &lt; 250MS</span>
                          </div>
                          <div className="bg-surface border border-[#111111] px-space-sm py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-primary text-on-primary font-bold">POST</span>
                              <span className="font-bold text-on-surface">/api/parser/invoice-ocr-sync</span>
                            </div>
                            <span className="text-secondary uppercase">ASYNC AWS TEXTRACT QUEUE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN: STICKY SCORECARD MATRIX & EMBER ADVISORY (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20 font-mono">
                  {/* Scorecard Audit Matrix Card */}
                  <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-lg shadow-[4px_4px_0px_0px_#111111]">
                    <div className="flex items-center justify-between border-b-2 border-[#111111] pb-space-sm mb-space-md">
                      <div>
                        <span className="text-label-sm text-primary font-bold block uppercase tracking-wider">
                          SCORECARD // AUDIT MATRIX
                        </span>
                        <h3 className="font-headline-sm text-lg font-bold text-on-surface font-serif">
                          HEURISTIC EVALUATION
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-label-lg text-xl font-bold text-on-surface">{compositeScore}%</span>
                        <span
                          className={`text-label-sm block font-bold ${
                            mode === "go"
                              ? "text-[#15803D]"
                              : mode === "changes"
                              ? "text-[#D97706]"
                              : mode === "deficit"
                              ? "text-[#B45309]"
                              : "text-error"
                          }`}
                        >
                          {mode === "go"
                            ? "HIGH VIABILITY"
                            : mode === "changes"
                            ? "CONDITIONAL PASS"
                            : mode === "deficit"
                            ? "LOW CONFIDENCE"
                            : "FATAL DEFICIT"}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Rows */}
                    <div className="flex flex-col divide-y divide-surface-variant text-label-sm">
                      {/* 1. Demand */}
                      <div className="py-space-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-on-surface">1. MARKET DEMAND</span>
                          <div className="flex items-center gap-1.5">
                            {mode === "deficit" ? (
                              <span className="text-[#D97706] font-bold">NOT ENOUGH DATA</span>
                            ) : (
                              <>
                                <div className="flex gap-0.5">
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className={`w-3.5 h-2 ${mode === "nogo" ? "bg-surface-variant" : "bg-[#111111]"}`} />
                                </div>
                                <span className="font-bold text-on-surface">
                                  {mode === "nogo" ? "2/5" : "5/5"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-serif text-xs text-secondary">
                          {mode === "deficit"
                            ? "Search velocity too low for statistically valid signal."
                            : mode === "nogo"
                            ? "68% of test cohorts churn within 60 days before realizing ROI."
                            : "28 verified complaint threads in 60d; high willingness-to-pay ($89/mo)."}
                        </p>
                      </div>

                      {/* 2. Competition */}
                      <div className="py-space-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-on-surface">2. COMPETITION VACANCY</span>
                          <div className="flex items-center gap-1.5">
                            {mode === "deficit" ? (
                              <span className="text-[#D97706] font-bold">NOT ENOUGH DATA</span>
                            ) : (
                              <>
                                <div className="flex gap-0.5">
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className={`w-3.5 h-2 ${mode === "nogo" ? "bg-surface-variant" : "bg-[#111111]"}`} />
                                  <div className="w-3.5 h-2 bg-surface-variant border border-[#111111]/30" />
                                </div>
                                <span className="font-bold text-on-surface">
                                  {mode === "nogo" ? "1/5" : "4/5"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-serif text-xs text-secondary">
                          {mode === "nogo"
                            ? "Red ocean: 42 entrenched incumbents with >500 reviews."
                            : "Zero dedicated supplier invoice cost-auditors live in Shopify ecosystem."}
                        </p>
                      </div>

                      {/* 3. Differentiation & Moat */}
                      <div
                        className={`py-space-sm flex flex-col gap-1 ${
                          mode === "changes"
                            ? "p-2.5 bg-[#fff7ed] border-2 border-primary shadow-[2px_2px_0px_0px_#a23a00]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold uppercase ${
                              mode === "changes" ? "text-on-primary-fixed" : "text-on-surface"
                            }`}
                          >
                            3. DIFFERENTIATION &amp; MOAT
                          </span>
                          <div className="flex items-center gap-1.5">
                            {mode === "deficit" ? (
                              <span className="text-[#D97706] font-bold">NOT ENOUGH DATA</span>
                            ) : (
                              <>
                                <div className="flex gap-0.5">
                                  <div className={`w-3.5 h-2 ${mode === "changes" ? "bg-primary" : "bg-[#111111]"}`} />
                                  <div className={`w-3.5 h-2 ${mode === "changes" ? "bg-primary" : "bg-[#111111]"}`} />
                                  <div className={`w-3.5 h-2 ${mode === "changes" ? "bg-primary" : "bg-[#111111]"}`} />
                                  <div
                                    className={`w-3.5 h-2 ${
                                      mode === "changes" || mode === "nogo"
                                        ? "bg-surface-variant border border-primary"
                                        : "bg-[#111111]"
                                    }`}
                                  />
                                  <div className="w-3.5 h-2 bg-surface-variant border border-[#111111]/30" />
                                </div>
                                <span
                                  className={`font-bold ${
                                    mode === "changes" ? "text-primary" : "text-on-surface"
                                  }`}
                                >
                                  {mode === "changes" ? "3/5" : mode === "nogo" ? "2/5" : "4/5"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-serif text-xs text-secondary">
                          {mode === "changes"
                            ? "Vulnerability: Moat is fragile without order volume filter. Low-GMV churn dilutes retention."
                            : mode === "nogo"
                            ? "Shopify Editions introduced draft variant bulk cost editing natively."
                            : "Proprietary CSV/PDF parser linked with instant margin guardrail webhooks."}
                        </p>
                      </div>

                      {/* 4. Monetization */}
                      <div className="py-space-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-on-surface">4. DIRECT MONETIZATION</span>
                          <div className="flex items-center gap-1.5">
                            {mode === "deficit" ? (
                              <span className="text-[#D97706] font-bold">NOT ENOUGH DATA</span>
                            ) : (
                              <>
                                <div className="flex gap-0.5">
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className="w-3.5 h-2 bg-[#111111]" />
                                  <div className={`w-3.5 h-2 ${mode === "nogo" ? "bg-surface-variant" : "bg-[#111111]"}`} />
                                  <div className={`w-3.5 h-2 ${mode === "nogo" ? "bg-surface-variant" : "bg-[#111111]"}`} />
                                </div>
                                <span className="font-bold text-on-surface">
                                  {mode === "nogo" ? "3/5" : "5/5"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="font-serif text-xs text-secondary">
                          {spec.pricing}
                        </p>
                      </div>

                      {/* 5. Buildability */}
                      <div className="py-space-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-on-surface">5. TECHNICAL BUILDABILITY</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              <div className="w-3.5 h-2 bg-[#15803D]" />
                              <div className="w-3.5 h-2 bg-[#15803D]" />
                              <div className="w-3.5 h-2 bg-[#15803D]" />
                              <div className="w-3.5 h-2 bg-[#15803D]" />
                              <div className={`w-3.5 h-2 ${mode === "deficit" ? "bg-surface-variant" : "bg-[#15803D]"}`} />
                            </div>
                            <span className="font-bold text-on-surface">
                              {mode === "deficit" ? "3/5" : mode === "nogo" ? "4/5" : "5/5"}
                            </span>
                          </div>
                        </div>
                        <p className="font-serif text-xs text-secondary">
                          Shopify Admin GraphQL + AWS Textract OCR pipeline is 100% turnkey.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Build Protocol Card */}
                  <div className="bg-surface border-2 border-[#111111] p-space-md shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between border-b border-[#111111] pb-space-xs">
                      <span className="text-label-sm uppercase font-bold text-secondary">
                        ESTIMATED BUILD // COMPILE PROTOCOL
                      </span>
                      <span
                        className={`text-label-sm px-1.5 py-0.5 font-bold ${
                          mode === "nogo" ? "bg-error text-white" : "bg-primary text-on-primary"
                        }`}
                      >
                        {mode === "nogo" ? "HALTED" : "READY"}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-[28px] font-bold text-on-surface tracking-tight">
                        ~14 MIN
                      </span>
                      <span className="text-label-lg font-bold text-primary">40 CREDITS ALLOCATED</span>
                    </div>
                    <div className="flex flex-col gap-1 text-label-sm pt-space-xs border-t border-surface-variant text-secondary">
                      <div className="flex justify-between py-0.5">
                        <span>3 screens compilation</span>
                        <span className="font-bold text-on-surface">~4 MIN</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Next.js API route orchestration</span>
                        <span className="font-bold text-on-surface">~5 MIN</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Supabase + Prisma schema migration</span>
                        <span className="font-bold text-on-surface">~3 MIN</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Shopify OAuth setup &amp; test harness</span>
                        <span className="font-bold text-on-surface">~2 MIN</span>
                      </div>
                    </div>
                  </div>

                  {/* Ember Supervisor Mascot Callout */}
                  <div className="bg-surface-container-high border border-[#111111] p-space-md shadow-[2px_2px_0px_0px_#111111] flex items-start gap-space-sm">
                    <div className="w-10 h-10 border-2 border-[#111111] bg-surface-container-lowest shrink-0 relative flex flex-col items-center justify-center p-1">
                      <div className="flex items-center justify-between w-full px-1 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                      </div>
                      <div className="w-4 h-0.5 bg-[#111111]" />
                      <span
                        className={`w-1.5 h-1.5 absolute -top-1 -right-1 border border-[#111111] ${
                          mode === "nogo" ? "bg-error" : "bg-primary"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col text-label-sm leading-relaxed">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-on-surface uppercase">Ember // Kernel Supervisor</span>
                        <span className="text-secondary text-[10px]">• SYSTEM ACTIVE</span>
                      </div>
                      <p className="text-on-surface-variant font-mono uppercase text-[10px]">
                        {mode === "go"
                          ? "“SPEC COMPLETENESS INDEX: 94.2%. AUTO-CONVERSION TO PRISMA SCHEMA & NEXT.JS REPO IS READY ON APPROVAL SIGNAL.”"
                          : mode === "changes"
                          ? "“APPLYING 'NARROW TO >100 ORDERS/DAY' ELEVATES COMPOSITE VIABILITY FROM 74 TO 83 (CLASS-A GO).”"
                          : mode === "deficit"
                          ? "“COMPILING CODE ON LOW-CONFIDENCE EVIDENCE CARRIES ELEVATED MARKET PIVOT RISK. RECOMMEND EXPANDED CRAWL.”"
                          : "“PROCEEDING WITH THIS ARCHITECTURE BURNS 40 CREDITS WITH PROJECTED 78% MORTALITY RATE. RECOMMEND PIVOT.”"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* STICKY BOTTOM APPROVAL BAR (Persistent Fixed Gate) */}
        <aside className="fixed bottom-0 left-60 right-0 bg-surface-container-low/95 backdrop-blur-md border-t-2 border-[#111111] z-40 px-space-lg py-space-sm shadow-[0px_-4px_12px_rgba(0,0,0,0.06)] font-mono">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-md">
            {/* Lock State & Verification */}
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 border border-[#111111] ${
                    mode === "go"
                      ? "bg-[#15803D]"
                      : mode === "changes" || mode === "deficit"
                      ? "bg-[#D97706] animate-pulse"
                      : "bg-error"
                  }`}
                />
                <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  {mode === "go"
                    ? "SPEC_LOCKED: READY FOR AUTONOMOUS COMPILATION"
                    : mode === "changes"
                    ? "SPEC_STATUS: CONDITIONAL_GO (AMBER)"
                    : mode === "deficit"
                    ? "SPEC_STATUS: LOW_CONFIDENCE_WARNING"
                    : "SPEC_STATUS: NO_GO_ADVISORY"}
                </span>
              </div>
              <div className="hidden xl:flex items-center gap-2 text-secondary text-label-sm">
                <span>|</span>
                <span>NO CODE ROLLBACK CHARGES</span>
                <span>·</span>
                <span className="text-primary font-bold">100% REVERSIBLE</span>
              </div>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  alert("Credits refunded: 40 credits returned to syndicate reserve.");
                  router.push("/dashboard/new");
                }}
                className="text-label-sm text-[#B91C1C] hover:underline uppercase tracking-wider font-bold cursor-pointer px-2"
                type="button"
              >
                Reject &amp; Refund Credits
              </button>

              <button
                onClick={() => router.push("/dashboard/scout")}
                className="h-9 px-space-md bg-surface text-on-surface text-label-sm uppercase font-bold tracking-wider border border-[#111111] hover:bg-surface-container-high hover:shadow-[2px_2px_0px_0px_#111111] transition-all cursor-pointer"
                type="button"
              >
                Another Idea
              </button>

              <button
                onClick={() => setTweakModalOpen(true)}
                className="h-9 px-space-md bg-surface text-on-surface text-label-sm uppercase font-bold tracking-wider border border-[#111111] hover:bg-surface-container-high hover:shadow-[2px_2px_0px_0px_#111111] transition-all cursor-pointer"
                type="button"
              >
                Tweak Spec
              </button>

              {/* Primary High-Impact Approval Button */}
              {mode !== "nogo" ? (
                <button
                  onClick={() => setBuildModalOpen(true)}
                  className={`h-10 px-space-lg text-[#ffffff] text-label-md uppercase font-bold tracking-widest border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] transition-all flex items-center gap-space-xs cursor-pointer ${
                    mode === "go"
                      ? "bg-[#111111] hover:bg-primary"
                      : "bg-primary hover:bg-primary-container hover:text-on-primary-container"
                  }`}
                  type="button"
                >
                  <span>
                    {mode === "go"
                      ? "Approve & Start Build"
                      : "Approve with Changes & Build"}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => setBuildModalOpen(true)}
                    className="h-9 px-space-md bg-surface text-error text-label-sm uppercase font-bold tracking-wider border-2 border-error hover:bg-error-container/30 transition-colors shadow-[2px_2px_0px_0px_#ba1a1a] flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>APPROVE ANYWAY</span>
                  </button>
                  <span className="text-[9px] uppercase text-error font-bold mt-0.5 tracking-tighter">
                    * We do not recommend this
                  </span>
                </div>
              )}

              {/* Syndicate Credit Balance Pill */}
              <div className="hidden lg:flex items-center gap-1.5 text-label-sm border border-[#111111] bg-surface px-2 py-1 shrink-0">
                <span className="text-secondary">SYNDICATE:</span>
                <span className="font-bold text-on-surface">184 CR</span>
                <span className="text-secondary-fixed-dim">→</span>
                <span className="text-primary font-bold">REM: 144 CR</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Tweak Spec Modal */}
      <TweakSpecModal
        isOpen={tweakModalOpen}
        onClose={() => setTweakModalOpen(false)}
        spec={spec}
        onSaveAndRescore={(updatedSpec) => {
          setSpec(updatedSpec);
          setMode("go"); // Re-scores up to GO
        }}
      />

      {/* Build Swarm Modal */}
      <BuildModal
        isOpen={buildModalOpen}
        onClose={() => setBuildModalOpen(false)}
        idea={{
          id: "pricewatch-shopify",
          title: spec.name,
          tagline: spec.thesis,
          score: compositeScore / 10,
          problem: spec.problemStatement,
          targetAudience: spec.targetAudience,
          monetization: spec.pricing,
        }}
      />
    </div>
  );
}

export default function ValidationGatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-mono text-sm">
          INITIALIZING VALIDATION GATE...
        </div>
      }
    >
      <ValidationGateContent />
    </Suspense>
  );
}
