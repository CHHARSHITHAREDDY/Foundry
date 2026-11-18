"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";

export function MetaAdsPanel() {
  const [budget, setBudget] = useState(50);
  const [selectedCreative, setSelectedCreative] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const creatives = [
    { title: "Margin Bleed Guard", hook: "Stop losing 18% margin on Shopify unhedged discounts.", ctr: "4.2% est" },
    { title: "Algorithmic Pricing vs Competitors", hook: "Autonomous repricing every 60 seconds without merchant intervention.", ctr: "3.8% est" },
    { title: "One-Click Shopify App Store Install", hook: "Zero setup friction. Connect your GraphQL token in 45 seconds.", ctr: "5.1% est" },
  ];

  const handleDeployAd = async () => {
    setDeploying(true);
    try {
      await api.deployAds({ dailyBudget: budget, creativeVariant: selectedCreative });
      setDeployed(true);
    } catch {}
    setDeploying(false);
    setTimeout(() => setDeployed(false), 3000);
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base">📊</span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            META &amp; GOOGLE AD GENERATOR
          </span>
        </div>
        <span className="font-mono text-[10px] text-secondary">
          3 CREATIVES READY
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {creatives.map((c, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedCreative(idx)}
            className={`p-2 border cursor-pointer transition-all ${
              selectedCreative === idx
                ? "border-primary bg-primary-fixed/20 shadow-[1px_1px_0px_0px_#111111]"
                : "border-[#111111]/30 bg-surface hover:border-[#111111]"
            }`}
          >
            <div className="font-mono text-[10px] text-primary font-bold">VARIANT 0{idx + 1}</div>
            <div className="font-serif text-xs font-bold truncate mt-0.5">{c.title}</div>
            <div className="font-mono text-[10px] text-[#15803D] mt-1">{c.ctr}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 pt-1 border-t border-[#111111]/15">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="text-secondary">DAILY CAMPAIGN BUDGET:</span>
          <span className="font-bold text-on-surface">${budget} USD / DAY</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      <button
        type="button"
        onClick={handleDeployAd}
        disabled={deploying}
        className="w-full py-1.5 bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold transition-all shadow-[1px_1px_0px_0px_#111111] disabled:opacity-50"
      >
        {deploying ? "DEPLOYING TO PIXEL..." : deployed ? "DEPLOYED TO META PIXEL ✓" : "DEPLOY AD SET TO META PIXEL →"}
      </button>
    </div>
  );
}

