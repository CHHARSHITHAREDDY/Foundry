"use client";

import React from "react";

interface BusinessStatsProps {
  revenue?: string;
  visitors?: number;
  activeInstalls?: number;
  conversionRate?: string;
}

export function BusinessStats({
  revenue = "$0.00",
  visitors = 1,
  activeInstalls = 0,
  conversionRate = "0.0%",
}: BusinessStatsProps) {
  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <span className="font-mono text-xs uppercase font-bold text-on-surface flex items-center gap-1.5">
          <span>📈</span>
          VENTURE REVENUE &amp; TELEMETRY
        </span>
        <span className="font-mono text-[10px] text-[#15803D] font-bold">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-surface-container-low border border-[#111111]">
          <div className="font-mono text-[10px] text-secondary uppercase">ARR REVENUE</div>
          <div className="font-serif text-xl font-bold text-on-surface mt-0.5">{revenue}</div>
          <div className="font-mono text-[9px] text-secondary mt-1">STRIPE BILLING</div>
        </div>

        <div className="p-2.5 bg-surface-container-low border border-[#111111]">
          <div className="font-mono text-[10px] text-secondary uppercase">VISITORS TODAY</div>
          <div className="font-serif text-xl font-bold text-on-surface mt-0.5">{visitors}</div>
          <div className="font-mono text-[9px] text-[#15803D] mt-1">+100% TODAY</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
        <span className="text-secondary">ACTIVE SHOPIFY MERCHANTS: {activeInstalls}</span>
        <button
          type="button"
          className="text-primary font-bold hover:underline"
        >
          SET UP STRIPE PAYMENTS ➔
        </button>
      </div>
    </div>
  );
}

