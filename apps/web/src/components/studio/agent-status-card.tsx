"use client";

import React from "react";
import { AutoModeToggle } from "../tasks/auto-mode-toggle";
import { NightTaskToggle } from "../tasks/night-task-toggle";

interface AgentStatusCardProps {
  currentActivity?: string;
  autoEnabled?: boolean;
  nightEnabled?: boolean;
  onAutoToggle?: (state: boolean) => void;
  onNightToggle?: (state: boolean) => void;
}

export function AgentStatusCard({
  currentActivity = "Refactoring Shopify GraphQL webhook listener with exponential backoff & rate-limit hedging...",
  autoEnabled = true,
  nightEnabled = true,
  onAutoToggle,
  onNightToggle,
}: AgentStatusCardProps) {
  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[3px_3px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold text-primary">[ · _ · ]</span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            EMBER AGENT STREAM
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#15803D] uppercase font-bold px-1.5 py-0.2 border border-[#15803D] bg-[#15803D]/10">
          AUTONOMOUS
        </span>
      </div>

      <div className="p-3 bg-surface-container-low border border-[#111111] flex flex-col gap-1">
        <span className="font-mono text-[10px] text-secondary uppercase font-bold">
          CURRENT COGNITIVE REASONING:
        </span>
        <p className="font-mono text-xs text-on-surface leading-relaxed">
          {currentActivity}
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <AutoModeToggle enabled={autoEnabled} onToggle={onAutoToggle || (() => {})} />
        <NightTaskToggle enabled={nightEnabled} onToggle={onNightToggle || (() => {})} />
      </div>
    </div>
  );
}

