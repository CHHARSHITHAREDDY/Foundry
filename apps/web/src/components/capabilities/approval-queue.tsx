"use client";

import React from "react";

export function ApprovalQueue({ items = [] }: { items?: any[] }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface border border-[#111111]">
      <div className="font-mono text-xs uppercase font-bold text-on-surface">
        Approval Queue ({items.length})
      </div>
      {items.length === 0 ? (
        <div className="font-serif text-xs text-secondary">No pending approvals.</div>
      ) : (
        items.map((it, i) => (
          <div key={i} className="font-mono text-xs p-1 border border-[#111111]/20">
            {it.title || "Task item"}
          </div>
        ))
      )}
    </div>
  );
}

