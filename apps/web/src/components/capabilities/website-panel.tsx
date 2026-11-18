"use client";

import React, { useState } from "react";

interface WebsitePanelProps {
  companyName?: string;
  endpoint?: string;
}

export function WebsitePanel({
  companyName = "PriceWatch",
  endpoint = "https://pricewatch-4k2.foundry.app",
}: WebsitePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            PRODUCTION EDGE WEBSITE
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#15803D] font-bold">
          SSL CERT ACTIVE ✓
        </span>
      </div>

      <div className="flex items-center justify-between p-2.5 bg-surface-container-low border border-[#111111]">
        <a
          href={endpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-primary hover:underline truncate mr-2"
        >
          {endpoint}
        </a>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 bg-surface border border-[#111111] font-mono text-[10px] uppercase font-bold hover:bg-surface-container transition-colors"
          >
            {copied ? "COPIED ✓" : "COPY"}
          </button>
          <a
            href={endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 bg-[#111111] text-white border border-[#111111] font-mono text-[10px] uppercase font-bold hover:bg-primary transition-colors"
          >
            OPEN ↗
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] text-secondary">
        <span>VERSION: #e9a2b84 (LATEST)</span>
        <span>EDGE POP: IAD1 + FRA1 + NRT1</span>
      </div>
    </div>
  );
}

