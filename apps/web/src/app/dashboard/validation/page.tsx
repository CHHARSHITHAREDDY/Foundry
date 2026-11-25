"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { TweakSpecModal, SpecData } from "@/components/studio/tweak-spec-modal";
import { BuildModal } from "@/components/studio/build-modal";
import { StudioApiClient } from "@/lib/api-client";

const api = new StudioApiClient();

type VerdictMode = "go" | "changes" | "deficit" | "nogo";

const DEFAULT_SPEC: SpecData = {
  name: "Venture Workspace",
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

  useEffect(() => {
    async function loadActiveDossier() {
      try {
        let loadedIdea: any = null;
        if (typeof window !== "undefined") {
          const stored = sessionStorage.getItem("active_scouted_idea");
          if (stored) {
            try {
              loadedIdea = JSON.parse(stored);
            } catch {}
          }
        }
        if (!loadedIdea) {
          loadedIdea = await api.getNextCandidate();
        }
        if (loadedIdea && loadedIdea.title) {
          setSpec({
            name: loadedIdea.title,
            thesis: loadedIdea.tagline || loadedIdea.problem,
            targetAudience: loadedIdea.targetCustomer,
            problemStatement: loadedIdea.problem,
            moat: loadedIdea.archetype || "Autonomous Micro-SaaS Wedge",
            mvpScope: loadedIdea.mvpScope?.screens || [
              "Landing Page & Onboarding",
              "Live Monitoring & Alerts Dashboard",
              "Configuration & Webhook Settings",
            ],
            pricing: loadedIdea.competitors?.[0]?.pricing
              ? `${loadedIdea.competitors[0].pricing} (Fast ROI)`
              : "$29 - $79/mo recurring B2B",
          });

          const vStatus = loadedIdea.verdict?.status;
          if (vStatus === "GO") setMode("go");
          else if (vStatus === "GO_WITH_CHANGES") setMode("changes");
          else if (vStatus === "NO_GO") setMode("nogo");
        }
      } catch {}
    }
    loadActiveDossier();
  }, []);

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
            {/* FOUNDER VALIDATION TELEMETRY BAR */}
            <div className="w-full bg-[#111111] text-[#ffffff] px-space-md py-2 flex flex-wrap items-center justify-between gap-space-sm font-mono text-[11px] select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <span className="font-bold text-primary">FOUNDER VALIDATION GATE:</span>
                <span className="text-surface-variant">Review product specifications, market signals, and approve autonomous build.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#15803D] text-white font-bold uppercase">
                  HUMAN CHOICE REQUIRED
                </span>
              </div>
            </div>

            {/* TOP TELEMETRY BREADCRUMB & METADATA BAR */}
            <div className="w-full bg-surface-container-low border-b border-[#111111] px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm select-none font-mono text-label-sm">
              <div className="flex items-center gap-space-xs text-secondary uppercase tracking-wider">
                <span>WORKSPACE</span>
                <span className="text-secondary-fixed-dim">//</span>
                <span className="text-on-surface font-semibold">FOUNDRY</span>
                <span>/</span>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  OPPORTUNITIES
                </Link>
                <span>/</span>
                <span className="text-primary font-bold">FOUNDER_VALIDATION</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="px-2 py-0.5 border border-[#111111] bg-surface text-on-surface font-semibold uppercase">
                  MICRO-SAAS
                </span>
                <span className="px-2 py-0.5 border border-primary text-primary bg-[#fff4ee] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  SCOUTED SIGNALS ACTIVE
                </span>
              </div>
            </div>

            {/* HERO HEADER DOSSIER TITLE & FOUNDER BADGE */}
            <div className="w-full bg-surface border-b border-[#111111] px-space-lg md:px-space-xl py-space-xl">
              <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
                <div className="flex flex-col gap-space-xs max-w-3xl">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-label-sm uppercase tracking-widest text-primary font-bold">
                      SCOUTED OPPORTUNITY DOSSIER
                    </span>
                    <span className="h-px w-8 bg-[#111111]" />
                    <span className="text-label-sm uppercase tracking-wider text-secondary">
                      READY FOR FOUNDER EVALUATION
                    </span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold font-serif text-on-surface tracking-tight leading-none mt-1">
                    {spec.name}
                  </h1>
                  <p className="font-body-lg text-lg text-secondary italic mt-1 font-serif">
                    {spec.thesis}
                  </p>
                </div>

                {/* Founder Validation Stamp */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-space-xs shrink-0 font-mono">
                  <div className="px-space-md py-2 border-2 border-[#111111] bg-[#111111] text-[#ffffff] shadow-[3px_3px_0px_0px_#111111] flex items-center gap-2 select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      verified_user
                    </span>
                    <span className="text-label-md uppercase font-bold tracking-widest">
                      AWAITING FOUNDER DECISION
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-label-sm">
                    <span className="text-secondary font-semibold">VALIDATION:</span>
                    <span className="font-bold text-[#15803D]">HUMAN CONTROLLED</span>
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

                {/* RIGHT COLUMN: FOUNDER DECISION CONSOLE (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20 font-mono">
                  {/* Founder Validation Console Card */}
                  <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-lg shadow-[4px_4px_0px_0px_#111111]">
                    <div className="flex items-center justify-between border-b-2 border-[#111111] pb-space-sm mb-space-md">
                      <div>
                        <span className="text-label-sm text-primary font-bold block uppercase tracking-wider">
                          VALIDATION GATE // FOUNDER CHOICE
                        </span>
                        <h3 className="font-headline-sm text-lg font-bold text-on-surface font-serif">
                          DECISION CONSOLE
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-label-sm bg-[#15803D] text-white px-2.5 py-1 font-bold uppercase">
                          HUMAN CHOICE
                        </span>
                      </div>
                    </div>

                    {/* Architectural & Market Metadata */}
                    <div className="flex flex-col gap-3 text-label-sm mb-6">
                      <div className="p-3 bg-surface-container border border-[#111111]">
                        <span className="text-secondary block text-[11px] uppercase">PRODUCT CANDIDATE:</span>
                        <span className="font-bold text-base text-on-surface font-serif">{spec.name}</span>
                        <p className="text-xs text-secondary mt-1 font-serif">{spec.thesis}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-surface border border-surface-variant">
                          <span className="text-secondary block uppercase">TARGET AUDIENCE:</span>
                          <span className="font-bold text-on-surface line-clamp-2">{spec.targetAudience}</span>
                        </div>
                        <div className="p-2.5 bg-surface border border-surface-variant">
                          <span className="text-secondary block uppercase">PRICING MODEL:</span>
                          <span className="font-bold text-on-surface">{spec.pricing}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#FAF8F5] border border-[#111111] flex items-center justify-between">
                        <div>
                          <span className="text-secondary block text-[10px] uppercase font-bold">TECH STACK ARCHITECTURE</span>
                          <span className="font-bold text-on-surface text-xs">Next.js 15 · PostgreSQL · Tailwind CSS</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-primary">code</span>
                      </div>

                      <div className="p-2.5 bg-[#F0FDF4] border border-[#15803D] text-[#15803D] text-xs">
                        <span className="font-bold block uppercase mb-0.5">AUTONOMOUS BUILD SWARM READY</span>
                        <span>8 agents standing by: Architect, UI, Backend, Integrator, QA, Security, Deployer.</span>
                      </div>
                    </div>

                    {/* Direct Founder Validation Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-[#111111]">
                      <button
                        onClick={() => setBuildModalOpen(true)}
                        className="w-full h-12 bg-[#111111] text-white font-mono text-label-md uppercase font-bold tracking-wider hover:bg-primary hover:shadow-[3px_3px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        <span>VALIDATE &amp; START BUILD</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTweakModalOpen(true)}
                          className="h-10 bg-surface text-on-surface border border-[#111111] hover:bg-surface-container font-mono text-label-sm uppercase font-bold cursor-pointer transition-colors"
                          type="button"
                        >
                          TWEAK SPEC
                        </button>
                        <button
                          onClick={() => router.push("/dashboard/scout")}
                          className="h-10 bg-surface text-on-surface border border-[#111111] hover:bg-surface-container font-mono text-label-sm uppercase font-bold cursor-pointer transition-colors"
                          type="button"
                        >
                          ANOTHER IDEA
                        </button>
                      </div>
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

              {/* Primary Founder Build Approval Button */}
              <button
                onClick={() => setBuildModalOpen(true)}
                className="h-10 px-space-lg text-[#ffffff] bg-[#111111] hover:bg-primary text-label-md uppercase font-bold tracking-widest border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] transition-all flex items-center gap-space-xs cursor-pointer"
                type="button"
              >
                <span>VALIDATE &amp; START BUILD</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

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
          id: "Workspace-shopify",
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
