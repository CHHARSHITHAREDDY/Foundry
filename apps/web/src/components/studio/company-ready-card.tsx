"use client";

import React from "react";

export function CompanyReadyCard({
  companyName = "Workspace",
  url = "https://Workspace-4k2.foundry.app",
  onLaunch,
}: {
  companyName?: string;
  url?: string;
  onLaunch?: () => void;
}) {
  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-6 shadow-[4px_4px_0px_0px_#111111] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-bold text-primary">LIVE IN PRODUCTION</span>
          <span className="font-serif text-lg font-bold">{companyName}</span>
        </div>
        <span className="font-mono text-xs text-[#15803D] font-bold">READY ✓</span>
      </div>
      <p className="font-serif text-sm text-secondary">
        Edge containers deployed globally across 285 points of presence with verified SSL and database pooling.
      </p>
      <div className="flex gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 text-center bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
        >
          Open App ↗
        </a>
        <button
          type="button"
          onClick={onLaunch}
          className="flex-1 py-2 bg-primary text-white hover:bg-primary-container font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
        >
          Operational Console ➔
        </button>
      </div>
    </div>
  );
}

