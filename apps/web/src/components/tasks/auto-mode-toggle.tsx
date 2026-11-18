"use client";

import React from "react";

interface AutoModeToggleProps {
  enabled: boolean;
  onToggle: (state: boolean) => void;
  disabled?: boolean;
}

export function AutoModeToggle({
  enabled,
  onToggle,
  disabled = false,
}: AutoModeToggleProps) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-surface border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            AUTO-RUNNER
          </span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 border uppercase ${
              enabled
                ? "bg-[#15803D] text-white border-[#15803D]"
                : "bg-surface-container text-secondary border-[#111111]"
            }`}
          >
            {enabled ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <span className="font-serif text-[11px] text-secondary">
          Autonomously executes queued tasks
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer border-2 border-[#111111] transition-colors focus:outline-none ${
          enabled ? "bg-primary" : "bg-surface-container-high"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform border border-[#111111] bg-white transition duration-200 ease-in-out mt-0.5 ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

