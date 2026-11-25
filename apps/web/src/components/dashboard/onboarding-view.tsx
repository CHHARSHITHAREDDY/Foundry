"use client";

import { useState, useEffect } from "react";

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
  const [livePainPoints, setLivePainPoints] = useState<any[]>([]);

  useEffect(() => {
    setLivePainPoints([
      {
        source: "Ask HN (Today)",
        title: "Coworker rejects PR because it does not meet strict architectural standards",
        url: "https://news.ycombinator.com/item?id=50622809",
        category: "Code Review & Quality Gate",
      },
      {
        source: "Show HN (Today)",
        title: "Genesis Map – Visualize agent changes and see where they can break",
        url: "https://news.ycombinator.com/item?id=50623965",
        category: "Agent Observability",
      },
      {
        source: "Dev.to (Today)",
        title: "I Made My RAG Safer. It Got Worse Under Load",
        url: "https://dev.to/ayush_singh_9b0d83152be5b/i-made-my-rag-safer-it-got-worse-under-load-3olm",
        category: "LLM Pipeline Concurrency",
      },
    ]);
  }, []);

  return (
    <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-xl">
      {/* Top Sequence Status Bar (Editorial Mono) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-md border-b-2 border-[#111111]">
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-secondary font-mono">
          <span className="w-2 h-2 bg-[#15803D]" />
          <span className="font-bold text-on-surface">[LIVE_RESEARCH_PIPELINE // CONNECTED]</span>
          <span className="text-surface-variant">•</span>
          <span>HN · GITHUB · REDDIT · DEV.TO</span>
          <span className="text-surface-variant">•</span>
          <span>ZERO_STATIC_SEEDS</span>
        </div>
        <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-secondary font-mono">
          <span className="px-2 py-0.5 border border-[#111111] bg-surface-container font-semibold uppercase text-on-surface">
            SYS_OPERATOR_TIER
          </span>
          <span className="px-2 py-0.5 border border-[#111111] bg-[#111111] text-[#ffffff] font-bold">
            245 CR AVAILABLE
          </span>
        </div>
      </div>

      {/* Editorial Hero Section */}
      <div className="flex flex-col lg:flex-row gap-space-xl items-start lg:items-center justify-between bg-surface-container-lowest p-space-lg lg:p-space-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
        <div className="flex flex-col gap-space-sm max-w-2xl">
          <div className="inline-flex items-center gap-2 self-start px-2 py-1 bg-surface-container-low border border-[#111111]">
            <span className="w-1.5 h-1.5 bg-[#15803D] rounded-none" />
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface font-mono">
              PROTOCOL_ID: LIVE_GENESIS_2.0
            </span>
          </div>
          <h1 className="font-display text-display text-on-surface tracking-tight leading-none font-serif">
            Let’s build your first company from real market demand.
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-xl leading-relaxed">
            Foundry’s autonomous agent team monitors live discussions across Hacker News, GitHub, and Dev.to from the last 24–48 hours, verifies source citations, and scaffolds a complete Next.js 15 application.
          </p>
        </div>

        <div className="flex flex-col items-center bg-surface p-space-md border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] w-full sm:w-64 self-center lg:self-auto font-mono text-center">
          <div className="font-bold text-xs uppercase mb-1">SWARM STATUS</div>
          <div className="text-2xl font-extrabold text-primary mb-1">8/8 AGENTS</div>
          <div className="text-[10px] text-secondary">ARCHITECT · BACKEND · UI · INTEGRATOR · QA · SEC · DEPLOY</div>
        </div>
      </div>

      {/* 2-Column Choice Cards (Core Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Option Card A: Surprise Me */}
        <div
          onClick={onSurpriseClick}
          className="group relative flex flex-col justify-between bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#ca4b00] transition-all cursor-pointer"
        >
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#111111] pb-space-sm">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary font-mono">
                [AUTONOMOUS // LIVE_DISCOVERY]
              </span>
              <span className="px-2 py-0.5 font-label-sm text-label-sm uppercase border border-[#111111] bg-surface-container font-bold text-on-surface font-mono">
                5 CREDITS
              </span>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container border-2 border-[#111111] flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
                <span className="material-symbols-outlined text-[26px] text-on-surface">explore</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">
                  Surprise Me (Live Market Scout)
                </h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1 leading-relaxed">
                  Scours live Hacker News, GitHub & Dev.to for unaddressed developer bottlenecks from the past 7–30 days. Generates LLM-backed product architectures with zero static seeds.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-[#111111] flex items-center justify-between font-label-sm text-label-sm font-mono font-bold text-primary">
            <span>DISPATCH AGENT SWARM →</span>
          </div>
        </div>

        {/* Option Card B: Custom Idea */}
        <div
          onClick={onIdeaClick}
          className="group relative flex flex-col justify-between bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:shadow-[6px_6px_0px_0px_#15803D] transition-all cursor-pointer"
        >
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#111111] pb-space-sm">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary font-mono">
                [CUSTOM_THESIS // DIRECT_BUILD]
              </span>
              <span className="px-2 py-0.5 font-label-sm text-label-sm uppercase border border-[#111111] bg-surface-container font-bold text-on-surface font-mono">
                10 CREDITS
              </span>
            </div>
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container border-2 border-[#111111] flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
                <span className="material-symbols-outlined text-[26px] text-on-surface">code</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">
                  Custom Thesis Input
                </h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1 leading-relaxed">
                  Input a specific market problem or API wedge. The 8 agents validate viability, architect Drizzle tables, and scaffold the Next.js 15 repository.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-[#111111] flex items-center justify-between font-label-sm text-label-sm font-mono font-bold text-on-surface">
            <span>INITIALIZE CUSTOM THESIS →</span>
          </div>
        </div>
      </div>

      {/* Live Scouted Ticker (Editorial Mono) */}
      <div className="border-2 border-[#111111] bg-surface-container-lowest p-space-md shadow-[3px_3px_0px_0px_#111111]">
        <div className="flex items-center justify-between mb-space-sm pb-1 border-b border-surface-variant font-mono">
          <span className="font-label-sm text-label-sm font-bold uppercase text-on-surface">
            Live Opportunity Stream (Unmodified Citations)
          </span>
          <span className="text-[10px] text-secondary">PROVENANCE VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          {livePainPoints.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-space-sm border border-[#111111] bg-surface hover:bg-surface-container-high transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary">
                  {item.source}
                </span>
                <p className="text-xs font-serif text-on-surface mt-1 line-clamp-2">
                  "{item.title}"
                </p>
              </div>
              <div className="mt-2 text-[10px] text-secondary font-mono uppercase">
                {item.category}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
