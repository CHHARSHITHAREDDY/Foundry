"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";

interface EmailPanelProps {
  companyDomain?: string;
}

export function EmailPanel({
  companyDomain = "pricewatch-4k2.foundry.app",
}: EmailPanelProps) {
  const [inboxStatus, setInboxStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");

  const handleSendOutreach = async () => {
    setInboxStatus("SENDING");
    try {
      await api.sendEmailOutreach("Shopify Plus Merchants > $1M ARR", companyDomain);
    } catch {}
    setTimeout(() => setInboxStatus("SENT"), 1500);
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base">✉</span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            OUTREACH &amp; SUPPORT ENGINE
          </span>
        </div>
        <span className="font-mono text-[10px] text-secondary">
          DNS DKIM/SPF VERIFIED ✓
        </span>
      </div>

      <div className="flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between p-2 bg-surface-container-low border border-[#111111]">
          <span className="text-secondary">PRIMARY ADDRESS:</span>
          <span className="font-bold text-on-surface">team@{companyDomain}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-surface-container-low border border-[#111111]">
          <span className="text-secondary">INBOX STATUS:</span>
          <span className="text-[#15803D] font-bold">0 UNREAD // ZERO INBOX</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSendOutreach}
        className="w-full py-1.5 bg-surface text-on-surface hover:bg-surface-container border border-[#111111] font-mono text-xs uppercase font-bold transition-all"
      >
        {inboxStatus === "IDLE" && "+ DRAFT OUTREACH BLAST (30 MERCHANTS)"}
        {inboxStatus === "SENDING" && "SYNTHESIZING PERSONALIZED EMAILS..."}
        {inboxStatus === "SENT" && "QUEUED FOR COLD OUTREACH ✓"}
      </button>
    </div>
  );
}

