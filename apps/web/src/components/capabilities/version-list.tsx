"use client";

import React from "react";

export function VersionList({ versions = [] }: { versions?: any[] }) {
  return (
    <div className="flex flex-col gap-1 font-mono text-xs">
      {versions.map((v, i) => (
        <div key={i} className="flex justify-between p-1 border border-[#111111]/20">
          <span>{v.hash || "#e9a2b84"}</span>
          <span className="text-secondary">{v.date || "Just now"}</span>
        </div>
      ))}
    </div>
  );
}

