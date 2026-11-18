"use client";

import React, { useState } from "react";

export function PaymentsPanel() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <span className="font-mono text-xs uppercase font-bold text-on-surface">
          STRIPE CONNECT BILLING
        </span>
        <span className={`font-mono text-[10px] ${connected ? "text-[#15803D]" : "text-secondary"}`}>
          {connected ? "LINKED ✓" : "NOT CONNECTED"}
        </span>
      </div>
      <p className="font-serif text-xs text-secondary">
        Direct subscription billing and revenue splits deposited into your verified business bank account.
      </p>
      <button
        type="button"
        onClick={() => setConnected(!connected)}
        className="w-full py-2 bg-primary text-white font-mono text-xs uppercase font-bold hover:bg-primary-container transition-colors shadow-[1px_1px_0px_0px_#111111]"
      >
        {connected ? "DISCONNECT STRIPE ACCOUNT" : "CONNECT WITH STRIPE ➔"}
      </button>
    </div>
  );
}

