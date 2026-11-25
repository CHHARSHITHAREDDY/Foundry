"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";

interface TwitterPanelProps {
  companyName?: string;
  defaultHandle?: string;
}

export function TwitterPanel({
  companyName = "Workspace",
  defaultHandle = "@WorkspaceHQ",
}: TwitterPanelProps) {
  const [tweetText, setTweetText] = useState(
    `🚀 Today we are launching Venture Workspace! Guard your profit margins in real-time with automated Shopify GraphQL price adjustments.\n\nLive on https://Workspace-4k2.foundry.app`
  );
  const [posted, setPosted] = useState(false);

  const handlePost = async () => {
    setPosted(true);
    try {
      await api.postTweet(tweetText, companyName);
    } catch {}
    setTimeout(() => setPosted(false), 4000);
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base">𝕏</span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            TWITTER / X LAUNCH ENGINE
          </span>
        </div>
        <span className="font-mono text-[10px] text-secondary">
          {defaultHandle}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
          rows={3}
          className="w-full p-2.5 font-serif text-sm bg-surface-container-low border border-[#111111] focus:outline-none focus:border-primary resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-secondary">
            {280 - tweetText.length} CHARS REMAINING // DRAFTED BY EMBER
          </span>
          <button
            type="button"
            onClick={handlePost}
            className="px-3 py-1 bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[1px_1px_0px_0px_#111111]"
          >
            {posted ? "POSTED ✓" : "TWEET →"}
          </button>
        </div>
      </div>
    </div>
  );
}

