"use client";

import React from "react";

interface StagePillProps {
  currentStage: number;
  totalStages?: number;
  stageName: string;
  status?: "ACTIVE" | "COMPLETE" | "PENDING";
}

export function StagePill({
  currentStage,
  totalStages = 7,
  stageName,
  status = "ACTIVE",
}: StagePillProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
      <span className="font-mono text-xs uppercase font-bold text-primary">
        STAGE 0{currentStage}/0{totalStages}
      </span>
      <span className="font-mono text-xs text-on-surface font-bold">
        {stageName}
      </span>
      <span
        className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 border ${
          status === "COMPLETE"
            ? "bg-[#15803D] text-white border-[#15803D]"
            : status === "ACTIVE"
            ? "bg-primary text-white border-primary"
            : "bg-surface text-secondary border-[#111111]"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

