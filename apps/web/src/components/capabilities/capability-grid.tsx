"use client";

import React from "react";
import { TwitterPanel } from "./twitter-panel";
import { EmailPanel } from "./email-panel";
import { MetaAdsPanel } from "./meta-ads-panel";
import { MediaPanel } from "./media-panel";

interface CapabilityGridProps {
  companyName?: string;
  companyDomain?: string;
}

export function CapabilityGrid({
  companyName = "PriceWatch",
  companyDomain = "pricewatch-4k2.foundry.app",
}: CapabilityGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            ACTIVE VENTURE CAPABILITIES
          </span>
          <span className="font-mono text-[10px] bg-primary text-white px-1.5 py-0.2 font-bold">
            4 SYNTHESIZED
          </span>
        </div>
        <button
          type="button"
          className="px-2.5 py-1 bg-surface-container border border-[#111111] font-mono text-[11px] uppercase font-bold hover:bg-surface-container-high transition-colors"
        >
          + NEW CAPABILITY
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <TwitterPanel companyName={companyName} />
        <EmailPanel companyDomain={companyDomain} />
        <MetaAdsPanel />
        <MediaPanel />
      </div>
    </div>
  );
}

