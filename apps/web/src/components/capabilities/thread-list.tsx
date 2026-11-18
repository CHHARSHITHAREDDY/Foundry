"use client";

import React from "react";

export function ThreadList({ threads = [] }: { threads?: any[] }) {
  return (
    <div className="flex flex-col gap-1">
      {threads.map((t, i) => (
        <div key={i} className="p-2 border border-[#111111]/20 font-serif text-xs">
          {t.subject || "Message thread"}
        </div>
      ))}
    </div>
  );
}

