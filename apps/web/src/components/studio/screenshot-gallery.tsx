"use client";

import React from "react";

export function ScreenshotGallery({ screenshots = [] }: { screenshots?: string[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto p-2 bg-surface-container border border-[#111111]">
      {screenshots.length === 0 ? (
        <div className="font-mono text-xs text-secondary p-4">No screenshots captured.</div>
      ) : (
        screenshots.map((s, idx) => (
          <div key={idx} className="border border-[#111111] p-1 bg-white shrink-0">
            <img src={s} alt={`Preview ${idx + 1}`} className="h-32 object-contain" />
          </div>
        ))
      )}
    </div>
  );
}

