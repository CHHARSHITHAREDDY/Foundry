"use client";

import React from "react";

export function ConnectAccountButton({
  provider = "Shopify",
  onConnect,
}: {
  provider?: string;
  onConnect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onConnect}
      className="px-3 py-1.5 bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold transition-all shadow-[1px_1px_0px_0px_#111111]"
    >
      Connect {provider}
    </button>
  );
}

