"use client";

import React from "react";

export interface PipelineStep {
  id: string;
  number: string;
  name: string;
  description: string;
  status: "COMPLETE" | "RUNNING" | "QUEUED" | "FAILED";
  duration?: string;
  progress?: number;
}

interface BuildTimelineProps {
  steps?: PipelineStep[];
  currentStepIndex?: number;
}

const DEFAULT_DEPLOY_STEPS: PipelineStep[] = [
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
    description: "pricewatch-4k2.foundry.app CNAME verified & mapped",
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
    status: "RUNNING",
    progress: 78,
  },
];

export function BuildTimeline({
  steps = DEFAULT_DEPLOY_STEPS,
}: BuildTimelineProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {steps.map((step) => {
        const isComplete = step.status === "COMPLETE";
        const isRunning = step.status === "RUNNING";
        const isQueued = step.status === "QUEUED";

        return (
          <div
            key={step.id}
            className={`p-4 border-2 border-[#111111] transition-all flex flex-col gap-2 ${
              isRunning
                ? "bg-surface-container-lowest shadow-[3px_3px_0px_0px_#ca4b00] border-primary"
                : isComplete
                ? "bg-surface-container-low shadow-[2px_2px_0px_0px_#111111]"
                : "bg-surface opacity-60 border-dashed"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                    isComplete
                      ? "bg-[#15803D] text-white border-[#15803D]"
                      : isRunning
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-secondary border-[#111111]"
                  }`}
                >
                  {step.number}
                </span>
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-on-surface">
                  {step.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {step.duration && (
                  <span className="font-mono text-xs text-secondary">
                    {step.duration}
                  </span>
                )}
                {isComplete && (
                  <span className="font-mono text-xs uppercase font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 border border-[#15803D]">
                    PASSED ✓
                  </span>
                )}
                {isRunning && (
                  <span className="font-mono text-xs uppercase font-bold text-primary bg-primary-fixed px-2 py-0.5 border border-primary flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    RUNNING ({step.progress || 78}%)
                  </span>
                )}
                {isQueued && (
                  <span className="font-mono text-xs uppercase font-bold text-secondary">
                    QUEUED
                  </span>
                )}
              </div>
            </div>

            <p className="font-serif text-sm text-secondary">
              {step.description}
            </p>

            {isRunning && (
              <div className="pt-2 flex flex-col gap-1">
                <div className="flex justify-between font-mono text-[10px] text-secondary">
                  <span>ANYCAST EDGE PROPAGATION</span>
                  <span>{step.progress || 78}% SYNCED</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container border border-[#111111] overflow-hidden flex">
                  {Array.from({ length: 25 }).map((_, idx) => {
                    const filled = (idx + 1) * 4 <= (step.progress || 78);
                    return (
                      <div
                        key={idx}
                        className={`flex-1 border-r border-[#111111]/20 ${
                          filled ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

