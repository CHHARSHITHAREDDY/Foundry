"use client";

import React, { useState } from "react";

export function OutreachCampaignForm({ onLaunch }: { onLaunch?: (campaign: any) => void }) {
  const [target, setTarget] = useState("Shopify Plus merchants > $1M ARR");
  return (
    <div className="flex flex-col gap-2 p-3 border border-[#111111]">
      <label className="font-mono text-xs uppercase font-bold">Campaign Segment</label>
      <input
        type="text"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="p-2 font-serif text-xs bg-surface-container-low border border-[#111111]"
      />
      <button
        type="button"
        onClick={() => onLaunch?.({ target })}
        className="py-1 bg-primary text-white font-mono text-xs uppercase font-bold"
      >
        Launch Campaign
      </button>
    </div>
  );
}

