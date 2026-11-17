"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { IdeaModal } from "@/components/studio/idea-modal";
import { BuildModal } from "@/components/studio/build-modal";

export default function HowItWorksPage() {
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

  const handleLaunchSampleIdea = (title: string, desc: string) => {
    setActiveIdea({
      id: "sample_scout_01",
      title,
      summary: desc,
      targetAudience: "Niche B2B Professionals & Fleets",
      pricingHypothesis: "$89.00 / month",
      verdict: "GO",
      scorecard: {
        demand: 4.8,
        competition: 4.2,
        differentiation: 4.5,
        monetization: 4.6,
        buildability: 4.7,
      },
      evidence: [
        { source: "r/FreightBrokers & Fleet Forums", quote: "Detention tracking causes 10+ hours of unpaid friction." },
        { source: "Crawl of 412 competitor pricing tables", quote: "No standalone micro-solution priced under $200/mo." }
      ],
      features: [
        "Automated ELD telematics ingestion & GPS geofencing",
        "Deterministic detention invoice generation & PDF export",
        "Stripe Billing subscription integration",
        "Driver SMS alert dispatch webhook"
      ]
    });
    setBuildOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* 1. Header with activePath="how-it-works" */}
      <Header
        activePath="how-it-works"
        onSurpriseClick={() => setSurpriseOpen(true)}
        onIdeaClick={() => setIdeaOpen(true)}
      />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col w-full">
          {/* Masthead / Sequence Kicker */}
          <section className="w-full bg-surface border-b border-surface-container-highest">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-space-xl">
              <div className="flex flex-col gap-space-md max-w-4xl">
                <div className="inline-flex items-center gap-space-xs w-fit">
                  <span className="inline-block w-2 h-2 bg-primary" />
                  <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">
                    [PROTOCOL SEQUENCE // V2.4] · AUTONOMOUS VENTURE LIFECYCLE
                  </span>
                </div>
                <h1 className="font-display text-display tracking-tight text-on-surface font-serif">
                  From raw intuition to a sovereign, monetized business.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
                  Foundry decomposes venture creation into six deterministic, verifiable phases. Every prompt executes against isolated sandboxes, live web scrapers, verified code compilers, and automated edge infrastructure.
                </p>

                {/* System Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-md mt-space-sm border-t border-surface-container-highest">
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase text-secondary">MEAN PIPELINE TIME</span>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">8 MIN 42 SEC</span>
                  </div>
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase text-secondary">COMPILER PASS RATE</span>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">99.94% FIRST-RUN</span>
                  </div>
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase text-secondary">ISOLATION SANDBOX</span>
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">WASM / FIRECRACKER</span>
                  </div>
                  <div>
                    <span className="block font-label-sm text-label-sm uppercase text-secondary">SUPERVISION LEVEL</span>
                    <span className="font-label-lg text-label-lg font-bold text-primary">FULL HUMAN SOVEREIGNTY</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step Sequences */}
          <div className="w-full bg-surface">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
              <div className="flex flex-col divide-y divide-surface-container-highest">
                {/* STEP 01 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">01</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: DISCOVERY
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Idea Discovery &amp; Intuition Parsing
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Submit a rough hunch, voice transcription, or prompt. Foundry activates autonomous scouting workers that dissect TAM, search intent volumes, Reddit/X sentiment, and competitive moats in under 90 seconds.
                    </p>
                    <div className="flex flex-wrap gap-space-xs pt-space-xs font-label-sm text-label-sm text-secondary">
                      <span className="bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5">SEARCH VECTOR PARSING</span>
                      <span className="bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5">REDDIT NLP SCRAPE</span>
                      <span className="bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5">TAM ESTIMATION ENGINE</span>
                    </div>
                  </div>

                  {/* UI Fragment: Embedded Scout */}
                  <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest border-2 border-on-surface p-space-lg shadow-[3px_3px_0px_0px_#111111]">
                      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest mb-space-md">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2.5 h-2.5 bg-primary" />
                          <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                            EMBEDDED SCOUT // NODE-01
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 border border-on-surface text-on-surface">
                          QUERY: SURPRISE ME // UNTAPPED NICHE
                        </span>
                      </div>
                      <div className="flex flex-col gap-space-sm">
                        {/* Opportunity 1 */}
                        <div className="p-space-md bg-surface border border-on-surface hover:translate-x-0.5 transition-transform flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-sm text-label-sm text-primary font-bold">#01 RANKED</span>
                              <span className="font-label-sm text-label-sm text-secondary">TAM: $14.2M/YR</span>
                            </div>
                            <h4 className="font-headline-sm text-headline-sm font-serif text-on-surface">
                              Micro-SaaS for Freight Logistics
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Automated detention billing audits for independent reefer fleets.
                            </p>
                          </div>
                          <div className="flex items-center gap-space-sm self-end md:self-center">
                            <div className="text-right">
                              <span className="block font-label-sm text-label-sm text-secondary">VIABILITY</span>
                              <span className="font-label-md text-label-md font-bold text-primary">94% CONFIRM</span>
                            </div>
                            <button
                              onClick={() => handleLaunchSampleIdea("Micro-SaaS for Freight Logistics", "Automated detention billing audits for independent reefer fleets.")}
                              className="w-8 h-8 flex items-center justify-center bg-inverse-surface text-inverse-on-surface border border-inverse-surface hover:bg-primary transition-colors cursor-pointer"
                              title="Test Build"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                        </div>

                        {/* Opportunity 2 */}
                        <div className="p-space-md bg-surface border border-on-surface hover:translate-x-0.5 transition-transform flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-sm text-label-sm text-secondary font-bold">#02 RANKED</span>
                              <span className="font-label-sm text-label-sm text-secondary">TAM: $8.9M/YR</span>
                            </div>
                            <h4 className="font-headline-sm text-headline-sm font-serif text-on-surface">
                              Algorithmic Newsletter Curator
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Automated distillation of high-signal arXiv preprints for VC associates.
                            </p>
                          </div>
                          <div className="flex items-center gap-space-sm self-end md:self-center">
                            <div className="text-right">
                              <span className="block font-label-sm text-label-sm text-secondary">VIABILITY</span>
                              <span className="font-label-md text-label-md font-bold text-on-surface">88% CONFIRM</span>
                            </div>
                            <button
                              onClick={() => handleLaunchSampleIdea("Algorithmic Newsletter Curator", "Automated distillation of high-signal arXiv preprints for VC associates.")}
                              className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest text-on-surface border border-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                              title="Test Build"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                        </div>

                        {/* Opportunity 3 */}
                        <div className="p-space-md bg-surface border border-on-surface hover:translate-x-0.5 transition-transform flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-sm text-label-sm text-secondary font-bold">#03 RANKED</span>
                              <span className="font-label-sm text-label-sm text-secondary">TAM: $6.1M/YR</span>
                            </div>
                            <h4 className="font-headline-sm text-headline-sm font-serif text-on-surface">
                              Local Gov API Health Poller
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Realtime municipal permit webhook monitor for civil engineering contractors.
                            </p>
                          </div>
                          <div className="flex items-center gap-space-sm self-end md:self-center">
                            <div className="text-right">
                              <span className="block font-label-sm text-label-sm text-secondary">VIABILITY</span>
                              <span className="font-label-md text-label-md font-bold text-on-surface">91% CONFIRM</span>
                            </div>
                            <button
                              onClick={() => handleLaunchSampleIdea("Local Gov API Health Poller", "Realtime municipal permit webhook monitor for civil engineering contractors.")}
                              className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest text-on-surface border border-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                              title="Test Build"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-space-md pt-space-xs border-t border-surface-container-highest flex items-center justify-between text-secondary">
                        <span className="font-label-sm text-label-sm">SYNTHESIS LATENCY: 84.2 SEC</span>
                        <span className="font-label-sm text-label-sm text-primary uppercase font-bold">SCOUT BUFFER READY</span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* STEP 02 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">02</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: QUANTITATIVE AUDIT
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Autonomous Market Validation Scorecard
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Before writing a line of code, Foundry crawls 400+ competitor pricing tables, calculates customer acquisition unit economics, and produces a deterministic viability matrix. You review quantitative demand evidence, not hunches.
                    </p>
                    <div className="p-space-md bg-surface-container border border-surface-container-highest">
                      <span className="block font-label-sm text-label-sm uppercase text-secondary mb-1">
                        VALIDATION HEURISTIC:
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface italic">
                        &ldquo;Every venture must pass an algorithmic break-even simulation projecting organic conversion within 180 days before compiler clearance is granted.&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* UI Fragment: Scorecard */}
                  <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest border-2 border-on-surface p-space-lg shadow-[3px_3px_0px_0px_#111111]">
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-on-surface mb-space-md">
                        <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                          DETERMINISTIC VIABILITY MATRIX
                        </span>
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-sm text-label-sm bg-primary text-on-primary px-space-xs py-0.5 font-bold">
                            CONFIDENCE: 92.4%
                          </span>
                          <span className="font-label-sm text-label-sm bg-surface-container border border-on-surface text-on-surface px-space-xs py-0.5">
                            CAC/LTV: 3.8X
                          </span>
                        </div>
                      </div>

                      {/* Segmented Progress Indicator */}
                      <div className="mb-space-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-sm text-label-sm uppercase text-secondary">
                            VALIDATION INDEX GATEWAY
                          </span>
                          <span className="font-label-sm text-label-sm text-primary font-bold">
                            CLEARANCE PASS (11/12 BLOCKS)
                          </span>
                        </div>
                        <div className="flex gap-0.5 w-full">
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-surface-container border border-surface-container-highest" />
                        </div>
                      </div>

                      {/* Metrics Table */}
                      <div className="border border-on-surface mb-space-md">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-surface-container border-b border-on-surface font-label-sm text-label-sm uppercase text-on-surface">
                              <th className="p-space-sm">PARAMETER</th>
                              <th className="p-space-sm">PARSED VALUE</th>
                              <th className="p-space-sm">THRESHOLD</th>
                              <th className="p-space-sm text-right">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="font-label-md text-label-md divide-y divide-surface-container-highest">
                            <tr>
                              <td className="p-space-sm font-semibold text-on-surface">Search Demand Intent</td>
                              <td className="p-space-sm text-secondary">18,400 mo/vol</td>
                              <td className="p-space-sm text-secondary">&gt; 5,000</td>
                              <td className="p-space-sm text-right text-primary font-bold">VERIFIED</td>
                            </tr>
                            <tr>
                              <td className="p-space-sm font-semibold text-on-surface">Willingness to Pay (WTP)</td>
                              <td className="p-space-sm text-secondary">$89.00 / month</td>
                              <td className="p-space-sm text-secondary">&gt; $45.00</td>
                              <td className="p-space-sm text-right text-primary font-bold">VERIFIED</td>
                            </tr>
                            <tr>
                              <td className="p-space-sm font-semibold text-on-surface">Moat Defense Index</td>
                              <td className="p-space-sm text-secondary">0.78 Cosine Dist.</td>
                              <td className="p-space-sm text-secondary">&gt; 0.60</td>
                              <td className="p-space-sm text-right text-primary font-bold">VERIFIED</td>
                            </tr>
                            <tr>
                              <td className="p-space-sm font-semibold text-on-surface">CPC Acquisition Floor</td>
                              <td className="p-space-sm text-secondary">$1.84 / click</td>
                              <td className="p-space-sm text-secondary">&lt; $3.50</td>
                              <td className="p-space-sm text-right text-primary font-bold">VERIFIED</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                        <span>DATA SOURCES: 412 PRICING TABLES · AWARENESS CRAWL</span>
                        <span className="text-on-surface font-bold">AUTO-SIGNATURE #4889-X</span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* STEP 03 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">03</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: HUMAN GATE
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Human Gatekeeper &amp; Architectural Approval
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      You retain executive sovereignty. Foundry presents the complete system blueprint: relational schema, pricing mechanics, brand identity vector comps, and legal disclaimers. With a single click or conversational refinement, you sign off on production.
                    </p>
                    <div className="flex items-center gap-space-sm text-on-surface font-label-md text-label-md">
                      <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                      <span>NO CODE EXECUTES WITHOUT YOUR EXPLICIT CRYPTOGRAPHIC KEY</span>
                    </div>
                  </div>

                  {/* UI Fragment: Ember Mascot + Gatekeeper Card */}
                  <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest border-2 border-primary p-space-lg shadow-[3px_3px_0px_0px_#a23a00]">
                      <div className="flex items-center justify-between border-b border-surface-container-highest pb-space-sm mb-space-md">
                        <span className="font-label-md text-label-md uppercase font-bold text-on-surface">
                          ARCHITECTURAL SIGN-OFF DISPATCH
                        </span>
                        <span className="font-label-sm text-label-sm bg-primary text-on-primary px-space-xs py-0.5 font-bold">
                          STAGE 3/6 GATE
                        </span>
                      </div>

                      {/* Ember Mascot & Speech Token */}
                      <div className="flex items-start gap-space-md p-space-md bg-surface border border-on-surface mb-space-md">
                        {/* Ember Mascot Line Drawing SVG */}
                        <div className="w-14 h-14 bg-surface-container-lowest border border-on-surface flex-shrink-0 flex items-center justify-center relative">
                          <svg fill="none" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="#FFFFFF" height="24" stroke="#111111" strokeWidth="1.5" width="28" x="6" y="8" />
                            <line stroke="#111111" strokeWidth="1.5" x1="20" x2="20" y1="3" y2="8" />
                            <rect fill="#111111" height="2" width="4" x="18" y="1" />
                            <circle cx="14" cy="18" fill="#111111" r="2.5" />
                            <circle cx="26" cy="18" fill="#111111" r="2.5" />
                            <line stroke="#111111" strokeWidth="1.5" x1="15" x2="25" y1="26" y2="26" />
                            <rect fill="#a23a00" height="3" width="3" x="29" y="10" />
                          </svg>
                        </div>
                        {/* Mascot Speech / Dispatch Prompt */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-label-sm text-label-sm text-primary font-bold">EMBER CO-PROCESSOR</span>
                            <span className="text-secondary font-label-sm text-label-sm">· BLUEPRINT #BLU-891</span>
                          </div>
                          <p className="font-label-md text-label-md text-on-surface font-medium uppercase tracking-tight">
                            &ldquo;AWAITING YOUR AUTHORIZATION // COMPILE READY. POSTGRES SCHEMAS, STRIPE CONNECT WEBHOOKS, AND TAILWIND DESIGN TOKENS CALCULATED WITHOUT ANOMALIES.&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Blueprint Stack Pill Badges */}
                      <div className="flex flex-wrap gap-space-xs mb-space-lg">
                        <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-1 border border-on-surface text-on-surface">
                          DB: POSTGRESQL RELATIONAL
                        </span>
                        <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-1 border border-on-surface text-on-surface">
                          BILLING: STRIPE CONNECT
                        </span>
                        <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-1 border border-on-surface text-on-surface">
                          UI: TAILWIND EDGE
                        </span>
                        <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-1 border border-on-surface text-on-surface">
                          AUTH: WEBAUTHN + SUPABASE
                        </span>
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-wrap items-center gap-space-sm">
                        <button
                          onClick={() => handleLaunchSampleIdea("LedgerPulse Freight Detention", "Automated detention billing audits for independent reefer fleets.")}
                          className="px-space-md py-2.5 bg-inverse-surface text-inverse-on-surface font-label-md text-label-md uppercase border border-inverse-surface hover:bg-primary transition-all shadow-[2px_2px_0px_0px_#a23a00] cursor-pointer"
                        >
                          [APPROVE BLUEPRINT &amp; COMPILE]
                        </button>
                        <button
                          onClick={() => setIdeaOpen(true)}
                          className="px-space-md py-2.5 bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase border border-on-surface hover:bg-surface-container transition-all cursor-pointer"
                        >
                          [REQUEST VARIATION]
                        </button>
                        <span className="ml-auto font-label-sm text-label-sm text-secondary uppercase">
                          AUTO-TIMEOUT: NONE (WAITING FOREVER)
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* STEP 04 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">04</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: COMPILATION
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Deterministic Build &amp; Compilation Pipeline
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Ember and parallel co-processors build the entire stack: Next.js/React frontend with Tailwind, SQLite/PostgreSQL relational database, automated API routes, and transactional webhook handlers. No scaffolding templates; pure synthesized code.
                    </p>
                    <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                      <div className="p-space-sm bg-surface-container-lowest border border-surface-container-highest">
                        <span className="block font-label-sm text-label-sm text-secondary">TYPESCRIPT COMPILER</span>
                        <span className="font-label-md text-label-md font-bold text-on-surface">ZERO STRICT ERRORS</span>
                      </div>
                      <div className="p-space-sm bg-surface-container-lowest border border-surface-container-highest">
                        <span className="block font-label-sm text-label-sm text-secondary">LIGHTHOUSE AUDIT</span>
                        <span className="font-label-md text-label-md font-bold text-primary">TARGET 100/100</span>
                      </div>
                    </div>
                  </div>

                  {/* UI Fragment: Build Terminal & Stepped Timeline */}
                  <div className="lg:col-span-7">
                    <div className="bg-inverse-surface text-inverse-on-surface border-2 border-on-surface p-space-lg shadow-[3px_3px_0px_0px_#111111]">
                      <div className="flex items-center justify-between pb-space-sm border-b border-secondary mb-space-md">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                          <span className="font-label-md text-label-md uppercase font-bold text-inverse-on-surface">
                            CORE COMPILER TELEMETRY // PIPELINE-390
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm bg-secondary px-space-xs py-0.5 text-on-secondary">
                          PARALLEL WORKERS: 16
                        </span>
                      </div>

                      {/* Terminal Stepped Timeline Nodes */}
                      <div className="flex flex-col gap-space-xs font-label-md text-label-md mb-space-md">
                        <div className="flex items-center gap-space-sm p-space-xs bg-inverse-surface border border-secondary">
                          <span className="text-primary font-bold">[01]</span>
                          <span className="text-inverse-on-surface">SCHEMA GENERATED</span>
                          <span className="text-secondary">· 14 TABLES · FOREIGN KEYS PARSED</span>
                          <span className="ml-auto text-primary font-bold">DONE (1.2s)</span>
                        </div>
                        <div className="flex items-center gap-space-sm p-space-xs bg-inverse-surface border border-secondary">
                          <span className="text-primary font-bold">[02]</span>
                          <span className="text-inverse-on-surface">API ROUTES COMPILED</span>
                          <span className="text-secondary">· /v1/auth · /v1/checkout · /v1/telemetry</span>
                          <span className="ml-auto text-primary font-bold">DONE (2.4s)</span>
                        </div>
                        <div className="flex items-center gap-space-sm p-space-xs bg-secondary-container text-on-surface border border-primary">
                          <span className="text-primary font-bold">[03]</span>
                          <span className="font-bold">ASSET SYNTHESIS &amp; COPYWRITING</span>
                          <span className="text-secondary-fixed-dim">· VECTOR SVGS · EDITORIAL COPY</span>
                          <span className="ml-auto text-primary font-bold animate-pulse">RUNNING...</span>
                        </div>
                        <div className="flex items-center gap-space-sm p-space-xs opacity-50 border border-secondary">
                          <span className="text-secondary">[04]</span>
                          <span className="text-inverse-on-surface">LIGHTHOUSE 100/100 AUDIT</span>
                          <span className="text-secondary">· PWA · PERF SCORING</span>
                          <span className="ml-auto text-secondary">QUEUED</span>
                        </div>
                      </div>

                      {/* Segmented Progress Bar: 72% */}
                      <div className="pt-space-xs">
                        <div className="flex justify-between items-center mb-1 font-label-sm text-label-sm">
                          <span className="text-secondary">OVERALL COMPILATION PROGRESS</span>
                          <span className="text-primary font-bold">72% COMPLETE</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-primary" />
                          <span className="h-2 w-full bg-secondary" />
                          <span className="h-2 w-full bg-secondary" />
                          <span className="h-2 w-full bg-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* STEP 05 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">05</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: PROVISIONING
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Instant Global Edge Deployment &amp; DNS Provisioning
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Within 60 seconds, your business is live on the global edge CDN. Automatic TLS 1.3 certificates, apex custom domain propagation, and zero-configuration serverless auto-scaling are configured out of the box.
                    </p>
                    <div className="flex flex-col gap-space-xs font-label-sm text-label-sm text-secondary">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-base">public</span>
                        <span>285 EDGE LOCATIONS ACROSS 6 CONTINENTS</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-base">lock</span>
                        <span>CHACHA20-POLY1305 ENCRYPTED ZERO-TRUST ARCHITECTURE</span>
                      </div>
                    </div>
                  </div>

                  {/* UI Fragment: Mini Browser Preview Window */}
                  <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest border-2 border-on-surface p-0 shadow-[3px_3px_0px_0px_#111111] overflow-hidden">
                      {/* Mini Browser Header Chrome */}
                      <div className="bg-surface-container-high px-space-md py-space-xs border-b border-on-surface flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-on-surface bg-surface-container-lowest" />
                          <span className="w-3 h-3 rounded-full border border-on-surface bg-surface-container-lowest" />
                          <span className="w-3 h-3 rounded-full border border-on-surface bg-surface-container-lowest" />
                        </div>
                        <div className="bg-surface-container-lowest px-space-md py-1 border border-on-surface flex items-center gap-space-xs max-w-sm w-full mx-space-sm">
                          <span className="material-symbols-outlined text-sm text-primary">lock</span>
                          <span className="font-label-sm text-label-sm text-on-surface truncate">edge.ledgerpulse.io</span>
                        </div>
                        <span className="font-label-sm text-label-sm bg-surface-container-lowest text-primary border border-on-surface px-space-xs py-0.5 font-bold">
                          14MS WORLDWIDE
                        </span>
                      </div>

                      {/* Mini Browser Viewport */}
                      <div className="p-space-lg bg-surface">
                        {/* Mini Broadsheet Hero Fragment */}
                        <div className="border border-surface-container-highest p-space-md bg-surface-container-lowest mb-space-md">
                          <div className="flex items-center justify-between border-b border-surface-container-highest pb-space-xs mb-space-sm">
                            <span className="font-headline-sm text-headline-sm font-serif text-on-surface">LedgerPulse</span>
                            <span className="font-label-sm text-label-sm text-secondary uppercase">MONETIZED PRODUCTION INSTANCE</span>
                          </div>
                          <h3 className="font-headline-md text-headline-md font-serif text-on-surface mb-space-xs">
                            Autonomous Freight Detention Billing.
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-space-md">
                            Instantly turn ELD telematics into validated carrier dispute packets. Save $1,200 per driver annually.
                          </p>
                          <div className="flex items-center gap-space-sm">
                            <span className="px-space-sm py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm uppercase">
                              START BILLING AUDIT
                            </span>
                            <span className="font-label-sm text-label-sm text-secondary">$89 / MONTH · 14-DAY TRIAL</span>
                          </div>
                        </div>

                        {/* Edge Health Metrics Strip */}
                        <div className="grid grid-cols-3 gap-space-xs text-center">
                          <div className="p-space-xs bg-surface-container border border-surface-container-highest">
                            <span className="block font-label-sm text-label-sm text-secondary">DNS RESOLUTION</span>
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">3.8 MS</span>
                          </div>
                          <div className="p-space-xs bg-surface-container border border-surface-container-highest">
                            <span className="block font-label-sm text-label-sm text-secondary">SSL HANDSHAKE</span>
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">TLS 1.3 PASS</span>
                          </div>
                          <div className="p-space-xs bg-surface-container border border-surface-container-highest">
                            <span className="block font-label-sm text-label-sm text-secondary">EDGE REPLICATION</span>
                            <span className="font-label-sm text-label-sm font-bold text-primary">100% REGIONAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* STEP 06 */}
                <article className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                  <div className="lg:col-span-5 flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <span className="font-display text-display font-serif text-primary">06</span>
                      <span className="px-space-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-on-surface">
                        PHASE: AUTONOMOUS RUNTIME
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">
                      Autonomous Growth &amp; Post-Launch Operations
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Once live, Foundry does not idle. Automated agents manage lifecycle email sequences, schedule technical X/Meta launch copy, monitor SSL certificates and edge health, and queue product feature iterations based on real user analytics.
                    </p>
                    <div className="p-space-md bg-surface-container border border-on-surface">
                      <div className="flex items-center gap-space-xs mb-1">
                        <span className="w-2 h-2 bg-primary" />
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">OPERATIONAL PROMISE</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        You receive a weekly Sunday synthesis email detailing MRR growth, bug resolution traces, and planned compiler feature patches.
                      </p>
                    </div>
                  </div>

                  {/* UI Fragment: Active Task Engine Card */}
                  <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest border-2 border-on-surface p-space-lg shadow-[3px_3px_0px_0px_#111111]">
                      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest mb-space-md">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-base text-primary">smart_toy</span>
                          <span className="font-label-md text-label-md uppercase font-bold text-on-surface">
                            OPERATIONAL TASK QUEUE // LIVE CRON
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-0.5 border border-on-surface">
                          3 ACTIVE DISPATCHERS
                        </span>
                      </div>

                      {/* Task Rows */}
                      <div className="flex flex-col gap-space-sm mb-space-md">
                        {/* Task 1 */}
                        <div className="p-space-md bg-surface border border-primary flex items-center justify-between shadow-[2px_2px_0px_0px_#a23a00]">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-secondary">TASK #2884 · LIFECYCLE ENGINE</span>
                            <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                              SENDING WELCOME DRIP (#402 SENT)
                            </span>
                          </div>
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-sm text-label-sm bg-primary text-on-primary px-space-xs py-0.5 font-bold">
                              RUNNING
                            </span>
                            <span className="font-label-sm text-label-sm bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5 text-secondary">
                              1 CREDIT
                            </span>
                          </div>
                        </div>

                        {/* Task 2 */}
                        <div className="p-space-md bg-surface border border-on-surface flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-secondary">TASK #2883 · SYNDICATION DISPATCH</span>
                            <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                              POSTING CHANGELOG TO X (AUTONOMOUS)
                            </span>
                          </div>
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-sm text-label-sm bg-surface-container-highest text-on-surface px-space-xs py-0.5 font-bold border border-on-surface">
                              COMPLETED
                            </span>
                            <span className="font-label-sm text-label-sm bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5 text-secondary">
                              1 CREDIT
                            </span>
                          </div>
                        </div>

                        {/* Task 3 */}
                        <div className="p-space-md bg-surface border border-on-surface flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-secondary">TASK #2882 · FINANCIAL TELEMETRY</span>
                            <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                              STRIPE WEBHOOK VERIFIED ($89.00 ARRIVAL)
                            </span>
                          </div>
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-sm text-label-sm bg-surface-container-highest text-on-surface px-space-xs py-0.5 font-bold border border-on-surface">
                              COMPLETED
                            </span>
                            <span className="font-label-sm text-label-sm bg-surface-container-lowest border border-surface-container-highest px-space-xs py-0.5 text-secondary">
                              0 CREDITS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Burn Counter / Footer */}
                      <div className="flex flex-wrap items-center justify-between pt-space-sm border-t border-surface-container-highest text-secondary font-label-sm text-label-sm">
                        <span>BURN RATE: 0.14 CREDITS/HR</span>
                        <span className="text-primary font-bold">NEXT SCHEDULED TASK: DB VACUUM IN 41M</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          {/* Editorial Philosophy / Quote Strip */}
          <section className="w-full bg-surface-container-low border-t border-b border-surface-container-highest py-space-xl">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <div className="border-l-2 border-primary pl-space-md">
                  <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                    DETERMINISTIC NOT STOCHASTIC
                  </span>
                  <p className="font-body-md text-body-md text-on-surface">
                    We reject fragile, hallucinated app builders. Every Foundry module writes compile-time verified code covered by automated Playwright integration tests.
                  </p>
                </div>
                <div className="border-l-2 border-on-surface pl-space-md">
                  <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                    SOVEREIGN OWNERSHIP
                  </span>
                  <p className="font-body-md text-body-md text-on-surface">
                    Export entire codebases to GitHub whenever you wish. No lock-in, no proprietary hosting traps, and zero platform revenue share fees.
                  </p>
                </div>
                <div className="border-l-2 border-on-surface pl-space-md">
                  <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                    PRODUCTION RESILIENCE
                  </span>
                  <p className="font-body-md text-body-md text-on-surface">
                    Built from day one to handle real money, real compliance standards, automated tax reconciliation, and enterprise edge SLAs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Band */}
          <section className="w-full bg-inverse-surface text-inverse-on-surface py-space-xl">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
                <div className="flex flex-col gap-space-xs max-w-2xl">
                  <div className="inline-flex items-center gap-space-xs">
                    <span className="w-2 h-2 bg-primary" />
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-inverse-primary font-bold">
                      EXECUTE VENTURE COMPILATION
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg font-serif text-inverse-on-surface">
                    Ready to build your next business in 10 minutes?
                  </h2>
                  <p className="font-label-md text-label-md uppercase text-secondary-fixed-dim">
                    Autonomous engineering, validation, and infrastructure — zero scaffolding.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-space-md">
                  <button
                    onClick={() => setIdeaOpen(true)}
                    className="inline-flex items-center justify-center px-space-lg py-space-sm bg-primary text-on-primary font-label-md text-label-md uppercase font-bold border border-primary hover:bg-primary-container transition-all shadow-[3px_3px_0px_0px_#ffffff] cursor-pointer"
                  >
                    LAUNCH WITH FOUNDRY [START FREE]
                  </button>
                  <Link
                    href="/#examples"
                    className="inline-flex items-center justify-center px-space-lg py-space-sm bg-transparent text-inverse-on-surface font-label-md text-label-md uppercase border border-inverse-on-surface hover:bg-surface-container-highest hover:text-on-surface transition-all"
                  >
                    BROWSE EXAMPLES
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest pt-space-xl pb-space-lg">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-lg pb-space-xl border-b border-surface-container-highest">
            <div>
              <span className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-md">
                PRODUCT
              </span>
              <div className="flex flex-col gap-space-xs font-label-md text-label-md uppercase text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="/how-it-works">
                  SYSTEM ARCHITECTURE
                </Link>
                <Link className="hover:text-primary transition-colors" href="/pricing">
                  CREDIT RUNTIME
                </Link>
                <Link className="hover:text-primary transition-colors" href="/#capabilities">
                  COMPILER SPECS
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  RELEASE LOG
                </Link>
              </div>
            </div>
            <div>
              <span className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-md">
                SHOWCASE
              </span>
              <div className="flex flex-col gap-space-xs font-label-md text-label-md uppercase text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="/#examples">
                  INDEX &amp; CATALOG
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  ENTERPRISE BUILDS
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  OPEN REPOSITORIES
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  PERFORMANCE TRACES
                </Link>
              </div>
            </div>
            <div>
              <span className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-md">
                RESOURCES
              </span>
              <div className="flex flex-col gap-space-xs font-label-md text-label-md uppercase text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="#">
                  ARCHIVAL DOCS
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  REST &amp; SOCKET API
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  TACTICAL DISPATCHES
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  TELEMETRY GUILD
                </Link>
              </div>
            </div>
            <div>
              <span className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-md">
                COMPANY
              </span>
              <div className="flex flex-col gap-space-xs font-label-md text-label-md uppercase text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="#">
                  LABS FOUNDRY INC
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  EDITORIAL MANIFESTO
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  OPEN DISPATCHES
                </Link>
                <Link className="hover:text-primary transition-colors" href="#">
                  SECURE TRANSMISSION
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-serif">Foundry</span>
                <span className="font-label-sm text-label-sm uppercase text-secondary">PRESS &amp; ENGINE</span>
              </div>
              <div className="inline-flex items-center gap-space-xs px-space-xs py-0.5 bg-surface-container-lowest border border-outline-variant rounded">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span className="font-label-sm text-label-sm uppercase text-on-surface">SYSTEM STATUS: NOMINAL (99.98%)</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm uppercase text-on-surface-variant">
              <Link className="hover:text-on-surface transition-colors" href="#">
                PRIVACY POLICY
              </Link>
              <span className="text-secondary">/</span>
              <Link className="hover:text-on-surface transition-colors" href="#">
                TERMS OF SERVICE
              </Link>
              <span className="text-secondary">/</span>
              <Link className="hover:text-on-surface transition-colors" href="#">
                ARCHIVAL SECURITY
              </Link>
              <span className="text-secondary">/</span>
              <span>© 2025 FOUNDRY LABS INC.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Studio Interactive Modals */}
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
        idea={activeIdea}
        onClose={() => setBuildOpen(false)}
      />
    </div>
  );
}

