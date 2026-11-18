"use client";

import React from "react";

export function SurpriseMeChip({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container border-2 border-[#111111] hover:bg-primary hover:text-white font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
    >
      <span>🎲</span>
      <span>Surprise Me</span>
    </button>
  );
}

