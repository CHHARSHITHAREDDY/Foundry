"use client";

import { useEffect, useState } from "react";

interface HeroProps {
  onSurpriseClick?: () => void;
  onIdeaClick?: () => void;
}

const TERMINAL_LOGS = [
  ">> 14:48:02 UTC: Compiling Tailwind bundle... >> DNS records propagated. SSL active.",
  ">> 14:48:08 UTC: Drizzle ORM schema migrated >> 12 tables committed with RLS.",
  ">> 14:48:15 UTC: Headless Playwright vision journeys running... >> 0 regressions.",
  ">> 14:48:22 UTC: Stripe Connect checkout webhooks verified >> Edge routing live.",
  ">> 14:48:30 UTC: Reviewer security score: 98/100 >> Subdomain allocated.",
];

export function Hero({ onSurpriseClick, onIdeaClick }: HeroProps) {
  const [logIndex, setLogIndex] = useState(0);
  const [progressStep, setProgressStep] = useState(71);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % TERMINAL_LOGS.length);
    }, 3500);

    const progressInterval = setInterval(() => {
      setProgressStep((prev) => (prev >= 100 ? 65 : prev + 7));
    }, 2800);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-10 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Copy & Command Action */}
        <div className="lg:col-span-7 flex flex-col justify-center pt-2">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-[#F25C05] inline-block animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] bg-[#EDEDEA] px-2 py-0.5 border border-[#111111]">
              AUTONOMOUS VENTURE SYSTEM · V2.4
            </span>
          </div>

          <h1 className="font-display text-[44px] md:text-[54px] lg:text-[62px] text-[#111111] tracking-tight leading-[1.05] mb-6">
            Describe an idea.<br />
            <span className="italic font-normal">Your AI team ships it.</span>
          </h1>

          <p className="font-body text-[18px] md:text-[20px] text-[#474646] max-w-xl mb-8 leading-relaxed">
            From raw concept to custom code, live domain, automated marketing, and real revenue rails in minutes. No scaffolding. No prompt engineering.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={onSurpriseClick}
              className="h-12 px-6 bg-[#111111] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-[0.08em] border-[1.5px] border-[#111111] hover:shadow-[3px_3px_0px_0px_#F25C05] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>SURPRISE ME</span>
              <span className="material-symbols-outlined text-[16px] text-[#F25C05]">bolt</span>
            </button>

            <button
              onClick={onIdeaClick}
              className="h-12 px-6 bg-[#FFFFFF] text-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] border-[1.5px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#EDEDEA] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>I HAVE AN IDEA</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Monospace Subcaption */}
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 bg-[#F25C05] shrink-0" />
            <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E]">
              FREE CREDITS ON SIGNUP · NO CARD REQUIRED · PRODUCTION-READY ARCHIVAL ENGINE
            </span>
          </div>
        </div>

        {/* Right Column: Framed Studio Mock Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] p-5">
            {/* Mock Header Strip */}
            <div className="flex items-center justify-between border-b-[1.5px] border-[#111111] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F25C05] animate-ping" />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#111111] font-bold">
                  FOUNDRY STUDIO // ENGINE V2.4 [NODE 08]
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#5F5E5E]">SYS_ID: 981-AF</span>
            </div>

            {/* Ember Mascot Widget */}
            <div className="bg-[#EDEDEA] border-[1.5px] border-[#111111] p-3.5 mb-4 flex items-center gap-4">
              {/* Boxy Robot Mascot Line Art */}
              <div className="w-12 h-12 bg-[#FFFFFF] border-[1.5px] border-[#111111] shrink-0 flex flex-col items-center justify-center relative shadow-[2px_2px_0px_0px_#111111]">
                {/* Antenna */}
                <div className="w-[2px] h-1.5 bg-[#111111] absolute -top-2 left-1/2 -translate-x-1/2" />
                <div className="w-1 h-1 bg-[#F25C05] absolute -top-2.5 left-1/2 -translate-x-1/2" />
                {/* Eyes */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
                  <span className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
                </div>
                {/* Mouth */}
                <div className="w-5 h-[2px] bg-[#111111]" />
              </div>

              {/* Speech Bubble */}
              <div className="flex-1 bg-[#FFFFFF] border-[1.5px] border-[#111111] py-1.5 px-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#111111] font-bold uppercase tracking-[0.08em]">
                    EMBER COPILOT
                  </span>
                  <span className="font-mono text-[10px] text-[#F25C05] font-semibold animate-pulse">ACTIVE</span>
                </div>
                <p className="font-mono text-[11px] tracking-tight uppercase text-[#111111] mt-0.5">
                  &quot;WRITING THE CODE // DEPLOYING TO EDGE&quot;
                </p>
              </div>
            </div>

            {/* 3 Structured Task Cards */}
            <div className="space-y-2.5 mb-4">
              {/* Task 1: Stripe Connect */}
              <div className="bg-[#EDEDEA] border-[1.5px] border-[#111111] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-headline text-[16px] font-bold text-[#111111]">
                    Stripe Connect Billing Subsystem
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#FFFFFF] border border-[#111111] font-mono text-[10px] px-1.5 py-0.5">
                      FEATURE
                    </span>
                    <span className="bg-[#FFFFFF] border border-[#D6D6D1] font-mono text-[10px] text-[#5F5E5E] px-1.5 py-0.5">
                      1 CREDIT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-4 h-2 bg-[#F25C05]" />
                  <div className="w-4 h-2 bg-[#F25C05]" />
                  <div className="w-4 h-2 bg-[#F25C05]" />
                  <div className="w-4 h-2 bg-[#111111]" />
                  <div className="w-4 h-2 bg-[#111111]" />
                  <div className={`w-4 h-2 ${progressStep > 75 ? "bg-[#111111]" : "bg-[#EDEDEA] border border-[#D6D6D1]"}`} />
                  <div className={`w-4 h-2 ${progressStep > 90 ? "bg-[#F25C05]" : "bg-[#EDEDEA] border border-[#D6D6D1]"}`} />
                  <span className="ml-2 font-mono text-[10px] text-[#5F5E5E]">
                    {progressStep}% COMPILED
                  </span>
                </div>
              </div>

              {/* Task 2: PostgreSQL Schema */}
              <div className="bg-[#EDEDEA] border-[1.5px] border-[#111111] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-[16px] font-bold text-[#111111]">
                    PostgreSQL Schema &amp; Edge Functions
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#15803D] text-[#FFFFFF] font-mono text-[10px] px-1.5 py-0.5 font-bold">
                      VALIDATED
                    </span>
                    <span className="bg-[#FFFFFF] border border-[#D6D6D1] font-mono text-[10px] text-[#5F5E5E] px-1.5 py-0.5">
                      1 CREDIT
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#5F5E5E] mt-1.5">
                  MIGRATIONS: 12 TABLES COMMITTED · RLS ENABLED
                </div>
              </div>

              {/* Task 3: Landing Copy & Micro-Animations */}
              <div className="bg-[#EDEDEA] border-[1.5px] border-[#111111] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-[16px] font-bold text-[#111111]">
                    Landing Copy &amp; Micro-Animations
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#FFFFFF] border border-[#F25C05] text-[#F25C05] font-mono text-[10px] px-1.5 py-0.5 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 bg-[#F25C05] rounded-full animate-ping" />
                      LIVE
                    </span>
                    <span className="bg-[#FFFFFF] border border-[#D6D6D1] font-mono text-[10px] text-[#5F5E5E] px-1.5 py-0.5">
                      1 CREDIT
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#5F5E5E] mt-1.5">
                  TYPESETTING VERIFIED · LIGHTHOUSE PERF: 99/100
                </div>
              </div>
            </div>

            {/* Studio Terminal Log Strip */}
            <div className="bg-[#111111] text-[#FFFFFF] p-2.5 font-mono text-[10px] flex items-center justify-between overflow-hidden border-t-[1.5px] border-[#111111]">
              <span className="truncate text-[#dbdad5]">
                {TERMINAL_LOGS[logIndex]}
              </span>
              <span className="text-[#F25C05] shrink-0 font-bold ml-2">NODE_OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

