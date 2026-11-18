"use client";

import React from "react";

export type MascotMood = "idle" | "working" | "verifying" | "deploying" | "celebrating";

interface AgentMascotProps {
  mood?: MascotMood;
  title?: string;
  subtitle?: string;
  showStatusIndicator?: boolean;
}

export function AgentMascot({
  mood = "working",
  title = "EMBER // AGENT RUNNER v2.4",
  subtitle = "WRITING THE CODE // MAKING THE CHANGES",
  showStatusIndicator = true,
}: AgentMascotProps) {
  const getMascotFace = () => {
    switch (mood) {
      case "idle":
        return "[ - _ - ]";
      case "working":
        return "[ · _ · ]";
      case "verifying":
        return "[ o _ o ]";
      case "deploying":
        return "[ * _ * ]";
      case "celebrating":
        return "[ ^ _ ^ ]";
      default:
        return "[ · _ · ]";
    }
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[3px_3px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <span className="font-mono text-xs uppercase font-bold text-on-surface">
          {title}
        </span>
        {showStatusIndicator && (
          <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 bg-primary text-white border border-[#111111] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            ACTIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 bg-surface-container-low p-3 border border-[#111111]">
        <div className="font-mono text-2xl font-bold tracking-tight text-primary px-3 py-2 bg-surface border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] select-none">
          {getMascotFace()}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
            {subtitle}
          </span>
          <span className="font-serif text-xs text-secondary mt-0.5">
            Syndicate autonomous runner with zero-trust AST verification
          </span>
        </div>
      </div>
    </div>
  );
}

