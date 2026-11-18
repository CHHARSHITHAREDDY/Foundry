"use client";

import React from "react";

interface TaskCreditBadgeProps {
  credits: number;
  variant?: "solid" | "outline" | "subtle";
  size?: "sm" | "md";
}

export function TaskCreditBadge({
  credits,
  variant = "outline",
  size = "sm",
}: TaskCreditBadgeProps) {
  const isSm = size === "sm";

  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center font-mono font-bold uppercase tracking-wider bg-primary text-white border border-[#111111] shadow-[1px_1px_0px_0px_#111111] ${
          isSm ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
        }`}
      >
        {credits} CR
      </span>
    );
  }

  if (variant === "subtle") {
    return (
      <span
        className={`inline-flex items-center font-mono font-bold uppercase tracking-wider bg-primary-fixed text-primary-fixed-dim border border-primary/40 ${
          isSm ? "text-[10px] px-1.5 py-0.2" : "text-xs px-2 py-0.5"
        }`}
      >
        {credits} CR
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase tracking-wider bg-surface-container text-on-surface border border-[#111111] ${
        isSm ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      }`}
    >
      {credits} CR
    </span>
  );
}

