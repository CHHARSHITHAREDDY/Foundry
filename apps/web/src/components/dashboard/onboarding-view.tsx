"use client";

interface OnboardingViewProps {
  onSurpriseClick: () => void;
  onIdeaClick: () => void;
  onViewSpecs?: () => void;
}

export function OnboardingView({
  onSurpriseClick,
  onIdeaClick,
  onViewSpecs,
}: OnboardingViewProps) {
  return (
    <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-xl">
      {/* Top Sequence Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-md border-b-2 border-[#111111]">
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-secondary font-mono">
          <span className="w-2 h-2 bg-primary" />
          <span className="font-bold text-on-surface">[INITIAL_SETUP // ONBOARDING_SEQUENCE]</span>
          <span className="text-surface-variant">•</span>
          <span>NODE: US-EAST-01</span>
          <span className="text-surface-variant">•</span>
          <span>SYS_STATUS: NOMINAL</span>
        </div>
        <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-secondary font-mono">
          <span className="px-2 py-0.5 border border-[#111111] bg-surface-container font-semibold uppercase text-on-surface">
            SYS_TRIAL_TIER
          </span>
          <span className="px-2 py-0.5 border border-[#111111] bg-[#111111] text-[#ffffff] font-bold">
            20 CR AVAILABLE
          </span>
        </div>
      </div>

      {/* Editorial Hero Section with Ember Mascot */}
      <div className="flex flex-col lg:flex-row gap-space-xl items-start lg:items-center justify-between bg-surface-container-lowest p-space-lg lg:p-space-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
        <div className="flex flex-col gap-space-sm max-w-2xl">
          <div className="inline-flex items-center gap-2 self-start px-2 py-1 bg-surface-container-low border border-[#111111]">
            <span className="w-1.5 h-1.5 bg-[#15803D] rounded-none" />
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface font-mono">
              PROTOCOL_ID: GENESIS_INIT
            </span>
          </div>
          <h1 className="font-display text-display text-on-surface tracking-tight leading-none font-serif">
            Let’s build your first company.
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-xl leading-relaxed">
            Foundry’s autonomous agent team scaffolds technical architecture, drafts editorial copy, configures Stripe pipelines, and deploys directly to broadsheet CDN edge clusters.
          </p>
        </div>

        {/* Mascot Box: Ember */}
        <div className="flex flex-col items-center bg-surface p-space-md border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] w-full sm:w-64 self-center lg:self-auto">
          <div className="relative w-28 h-28 bg-[#FFFFFF] border-2 border-[#111111] flex flex-col items-center justify-center p-2 mb-space-sm shadow-[2px_2px_0px_0px_#111111]">
            {/* Robot Antenna */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#111111]" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2.5 h-1.5 bg-primary border border-[#111111]" />
            {/* Robot Face Graphic */}
            <div className="w-full flex items-center justify-between px-3 mb-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#111111]" />
              <span className="w-2.5 h-2.5 bg-primary" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#111111]" />
            </div>
            {/* Robot Mouth & Hairline Cheeks */}
            <div className="w-10 h-1 bg-[#111111]" />
            <div className="flex justify-between w-full px-2 mt-2">
              <span className="text-[9px] font-label-sm text-secondary font-mono tracking-tighter">[L]</span>
              <span className="text-[9px] font-label-sm text-secondary font-mono tracking-tighter">[R]</span>
            </div>
          </div>
          <div className="w-full text-center">
            <div className="inline-block px-2 py-0.5 border border-[#111111] bg-surface-container font-label-sm text-label-sm uppercase font-bold text-on-surface mb-1 font-mono">
              EMBER // READY TO DEPLOY
            </div>
            <p className="font-label-sm text-label-sm text-secondary uppercase tracking-tight font-mono">
              AGENT_ID #00-ALPHA
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Choice Cards (Core Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Option Card A: Surprise Me */}
        <div className="group relative flex flex-col justify-between bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#ca4b00] transition-all">
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#111111] pb-space-sm">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary font-mono">
                [AUTONOMOUS // DISCOVERY_MODE]
              </span>
              <span className="px-2 py-0.5 font-label-sm text-label-sm uppercase border border-[#111111] bg-surface-container font-bold text-on-surface font-mono">
                COST: 10 CREDITS
              </span>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container border-2 border-[#111111] flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
                <span className="material-symbols-outlined text-[26px] text-on-surface">explore</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight font-serif">
                  Surprise me
                </h2>
                <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary font-bold font-mono">
                  Heuristic Search Synthesis
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              Find me a high-signal, validated market idea based on real-time search trends, unbundled software forums, and unsatisfied consumer demand.
            </p>
            {/* Specifications List */}
            <div className="bg-surface-container-low border border-[#111111] p-space-md flex flex-col gap-2">
              <div className="font-label-sm text-label-sm uppercase font-bold text-secondary border-b border-surface-variant pb-1 font-mono">
                SPECIFICATION_MANIFEST
              </div>
              <ul className="flex flex-col gap-1.5 font-label-sm text-label-sm text-on-surface font-mono">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span>Trend validation scraped across 40+ dynamic sources</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span>Pre-rendered technical thesis &amp; responsive landing node</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span>Deterministic pipeline scaffolds build in ~12 minutes</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md border-t border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary font-mono">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>READY_FOR_DISPATCH</span>
            </div>
            <button
              onClick={onSurpriseClick}
              type="button"
              className="w-full sm:w-auto px-space-md h-10 bg-[#111111] text-[#ffffff] font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#111111] hover:bg-primary hover:border-primary transition-all shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-mono"
            >
              <span>Launch Discovery Protocol</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Option Card B: I Have an Idea */}
        <div className="group relative flex flex-col justify-between bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#ca4b00] transition-all">
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#111111] pb-space-sm">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary font-mono">
                [DIRECT_SYNTHESIS // USER_DIRECTED]
              </span>
              <span className="px-2 py-0.5 font-label-sm text-label-sm uppercase border border-[#111111] bg-surface-container font-bold text-on-surface font-mono">
                COST: 10 CREDITS
              </span>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container border-2 border-[#111111] flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
                <span className="material-symbols-outlined text-[26px] text-on-surface">edit_note</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight font-serif">
                  I have an idea
                </h2>
                <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary font-bold font-mono">
                  Parametric User Input
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              Describe your concept, target customer, or an existing operational problem. Our autonomous compiler parses the prompt into verifiable specifications.
            </p>
            {/* Specifications List */}
            <div className="bg-surface-container-low border border-[#111111] p-space-md flex flex-col gap-2">
              <div className="font-label-sm text-label-sm uppercase font-bold text-secondary border-b border-surface-variant pb-1 font-mono">
                SPECIFICATION_MANIFEST
              </div>
              <ul className="flex flex-col gap-1.5 font-label-sm text-label-sm text-on-surface font-mono">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#111111]" />
                  <span>Custom PRD generation &amp; available domain recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#111111]" />
                  <span>Bespoke database schema, auth rules &amp; Stripe bindings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#111111]" />
                  <span>Autonomous sprint compilation &amp; review in ~15 minutes</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md border-t border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary font-mono">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>AWAITING_PAYLOAD</span>
            </div>
            <button
              onClick={onIdeaClick}
              type="button"
              className="w-full sm:w-auto px-space-md h-10 bg-[#111111] text-[#ffffff] font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#111111] hover:bg-primary hover:border-primary transition-all shadow-[2px_2px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-mono"
            >
              <span>Enter Your Thesis</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Step Checklist Protocol */}
      <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
        {/* Section Header with Stepped Segment Meter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-[#111111] pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-serif">Onboarding Protocol</span>
            <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 bg-surface-container border border-[#111111] font-bold text-on-surface font-mono">
              SEQUENCE: 01 / 04
            </span>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase font-mono">
            <span className="text-secondary font-semibold">PROGRESS: 25%</span>
            {/* Segmented Brutalist Progress Bar */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-[#111111] border border-[#111111]" />
              <div className="w-4 h-2 bg-surface-container-highest border border-surface-variant" />
              <div className="w-4 h-2 bg-surface-container-highest border border-surface-variant" />
              <div className="w-4 h-2 bg-surface-container-highest border border-surface-variant" />
            </div>
          </div>
        </div>

        {/* 4 Horizontal Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Step 1: Verified (Completed) */}
          <div className="flex flex-col justify-between p-space-md bg-surface-container-low border border-[#111111] opacity-90">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 bg-[#15803D] text-[#ffffff] border border-[#111111] flex items-center justify-center font-label-sm text-[12px] font-bold">
                  ✓
                </span>
                <span className="font-label-sm text-[10px] uppercase font-bold text-[#15803D] bg-surface-container px-1 border border-[#15803D] font-mono">
                  COMPLETED
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-secondary line-through font-serif">1. Verify email</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                Identity verified on cryptographic ledger via zero-trust handshake.
              </p>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-surface-variant">
              <span className="font-label-sm text-[10px] text-secondary font-mono">12M AGO // TX_9041</span>
            </div>
          </div>

          {/* Step 2: Pick an idea (Current Active) */}
          <div className="flex flex-col justify-between p-space-md bg-surface border-2 border-primary shadow-[2px_2px_0px_0px_#ca4b00]">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 bg-primary text-on-primary border border-[#111111] flex items-center justify-center font-label-sm text-label-sm font-bold font-mono">
                  2
                </span>
                <span className="font-label-sm text-[10px] uppercase font-bold text-on-primary bg-primary px-1.5 py-0.5 border border-[#111111] font-mono">
                  CURRENT
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">2. Pick an idea</h3>
              <p className="font-body-sm text-body-sm text-on-surface">
                Trigger autonomous heuristic or supply parameterized venture prompt.
              </p>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-primary/30 flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-bold text-primary font-mono tracking-wider">ACTION REQUIRED</span>
              <span className="w-2 h-2 bg-primary animate-pulse" />
            </div>
          </div>

          {/* Step 3: Approve the build (Locked) */}
          <div className="flex flex-col justify-between p-space-md bg-surface-container-high/50 border border-surface-variant">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 bg-surface-container-highest text-secondary border border-surface-variant flex items-center justify-center font-label-sm text-label-sm font-bold font-mono">
                  3
                </span>
                <span className="font-label-sm text-[10px] uppercase font-mono text-secondary bg-surface-container px-1 border border-surface-variant">
                  QUEUED
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-secondary font-serif">3. Approve build</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                Review Ember’s modular code diffs, database architecture, and copy decks.
              </p>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-surface-variant">
              <span className="font-label-sm text-[10px] text-secondary font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                <span>LOCKED BY STEP 2</span>
              </span>
            </div>
          </div>

          {/* Step 4: Share your site (Locked) */}
          <div className="flex flex-col justify-between p-space-md bg-surface-container-high/50 border border-surface-variant">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 bg-surface-container-highest text-secondary border border-surface-variant flex items-center justify-center font-label-sm text-label-sm font-bold font-mono">
                  4
                </span>
                <span className="font-label-sm text-[10px] uppercase font-mono text-secondary bg-surface-container px-1 border border-surface-variant">
                  FINAL
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-secondary font-serif">4. Share your site</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                Attach bespoke vanity domain, hook webhooks, and process transaction #0001.
              </p>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-surface-variant">
              <span className="font-label-sm text-[10px] text-secondary font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                <span>LOCKED BY STEP 3</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Archival Machine System Footer */}
      <div className="p-space-md bg-surface-container-lowest border border-[#111111] flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-secondary font-mono">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="font-bold text-on-surface">FOUNDRY RUNTIME v2.4</span>
          <span>//</span>
          <span>20 CREDITS ALLOCATED</span>
          <span>//</span>
          <span>ZERO SERVER MANAGEMENT REQUIRED</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#15803D]" />
            <span>AUDIT TRAIL LOGGED</span>
          </span>
          <button
            onClick={onViewSpecs}
            className="text-primary hover:text-on-surface underline font-bold uppercase transition-colors cursor-pointer"
          >
            View Protocol Specs ↗
          </button>
        </div>
      </div>
    </div>
  );
}

