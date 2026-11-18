"use client";

import React, { useState } from "react";

export interface FindingItem {
  id: string;
  category: "SECURITY" | "INVARIANT" | "DRIFT" | "HEALTH";
  severity: "P1" | "P2" | "P3" | "INFO";
  title: string;
  description: string;
  status: "FIXED" | "ACCEPTED" | "PASSED";
  patchRef?: string;
  file?: string;
}

const DEFAULT_FINDINGS: FindingItem[] = [
  {
    id: "f-1",
    category: "SECURITY",
    severity: "P1",
    title: "Shopify GraphQL rate limit handling absent in batch catalog sync",
    description: "Daedalus-03 detected that concurrent SKU updates exceeded Shopify API buckets. Injected leaky-bucket queue with exponential backoff.",
    status: "FIXED",
    patchRef: "Patch #e9a2b84-sec",
    file: "src/lib/shopify-graphql-client.ts",
  },
  {
    id: "f-2",
    category: "INVARIANT",
    severity: "P2",
    title: "Unbounded retry loop in HMAC verification failure hook",
    description: "Webhook listener continued retrying expired tokens. Added cryptographic timestamp validation and 3-attempt circuit breaker.",
    status: "FIXED",
    patchRef: "Patch #e9a2b84-inv",
    file: "src/lib/webhook-hmac-verify.ts",
  },
  {
    id: "f-3",
    category: "DRIFT",
    severity: "P3",
    title: "Optional margin alert audio tone omitted",
    description: "Audio tone was specified as secondary optional flair in genesis prompt. Omitted to preserve minimal payload size.",
    status: "ACCEPTED",
    file: "src/components/margin-alert-banner.tsx",
  },
  {
    id: "f-4",
    category: "HEALTH",
    severity: "INFO",
    title: "AST strict typing passes with 0 'any' type assertions",
    description: "TypeScript compiler v5.4 in strict mode emitted zero diagnostics across all 14 synthesized files.",
    status: "PASSED",
    file: "src/types/schema.ts",
  },
];

interface QaReportProps {
  findings?: FindingItem[];
  onSelectFile?: (file: string) => void;
}

export function QaReport({
  findings = DEFAULT_FINDINGS,
  onSelectFile,
}: QaReportProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = findings.filter((f) => {
    if (filter === "ALL") return true;
    return f.category === filter;
  });

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border-2 border-[#111111] overflow-hidden shadow-[3px_3px_0px_0px_#111111]">
      {/* Header */}
      <div className="bg-[#111111] text-[#ffffff] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-bold text-white bg-primary px-2 py-0.5">
            FINDINGS &amp; INVARIANTS
          </span>
          <span className="font-mono text-xs text-secondary-fixed-dim">
            // 4 VERIFIED
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4ade80] font-bold">
          0 BLOCKERS
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 bg-surface-container border-b border-[#111111]/30 flex items-center gap-1.5 font-mono text-xs">
        {["ALL", "SECURITY", "INVARIANT", "DRIFT", "HEALTH"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-2 py-0.5 uppercase font-bold transition-all border ${
              filter === tab
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-surface text-secondary border-[#111111]/20 hover:border-[#111111]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface">
        {filtered.map((item) => {
          const isFixed = item.status === "FIXED";
          const isAccepted = item.status === "ACCEPTED";
          const isPassed = item.status === "PASSED";

          return (
            <div
              key={item.id}
              className="p-3 bg-surface-container-lowest border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-1.5 py-0.2 border ${
                      item.severity === "P1"
                        ? "bg-error text-white border-error"
                        : item.severity === "P2"
                        ? "bg-primary text-white border-primary"
                        : item.severity === "P3"
                        ? "bg-secondary text-white border-secondary"
                        : "bg-[#15803D] text-white border-[#15803D]"
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="font-mono text-[10px] text-secondary uppercase font-bold">
                    {item.category}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 border ${
                    isFixed
                      ? "bg-[#15803D]/10 text-[#15803D] border-[#15803D]"
                      : isAccepted
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-surface-container text-secondary border-[#111111]"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h5 className="font-serif text-sm font-bold text-on-surface leading-tight">
                {item.title}
              </h5>

              <p className="font-serif text-xs text-secondary leading-relaxed">
                {item.description}
              </p>

              {item.file && (
                <div className="flex items-center justify-between pt-1 border-t border-[#111111]/15 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => onSelectFile?.(item.file!)}
                    className="text-primary hover:underline font-bold truncate max-w-[240px]"
                  >
                    {item.file} ➔
                  </button>
                  {item.patchRef && (
                    <span className="text-secondary">{item.patchRef}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Ember Notice Strip */}
      <div className="p-3 bg-[#111111] text-white border-t-2 border-[#111111] flex items-center gap-3">
        <span className="font-mono text-xl text-primary font-bold">[ · _ · ]</span>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-primary-fixed-dim uppercase font-bold">
            AGENT EMBER AUDIT VERDICT
          </span>
          <span className="font-serif text-xs text-[#ffffff]">
            Invariants satisfied. Auto-patches verified against test suites. Safe to flip production edge traffic.
          </span>
        </div>
      </div>
    </div>
  );
}

