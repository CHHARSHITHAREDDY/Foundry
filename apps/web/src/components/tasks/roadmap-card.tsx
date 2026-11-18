"use client";

import React from "react";

export interface DocumentItem {
  id: string;
  title: string;
  type: "MARKDOWN" | "PDF" | "CONFIG";
  updatedAt: string;
  size: string;
}

interface RoadmapCardProps {
  documents?: DocumentItem[];
  onOpenDoc?: (doc: DocumentItem) => void;
}

const DEFAULT_DOCS: DocumentItem[] = [
  { id: "doc-1", title: "Product Roadmap & Epics", type: "MARKDOWN", updatedAt: "Today 12:40", size: "14 KB" },
  { id: "doc-2", title: "Design System & Tokens Spec", type: "CONFIG", updatedAt: "Today 09:15", size: "32 KB" },
  { id: "doc-3", title: "Company Profile & Unit Economics", type: "PDF", updatedAt: "Yesterday", size: "84 KB" },
];

export function RoadmapCard({
  documents = DEFAULT_DOCS,
  onOpenDoc,
}: RoadmapCardProps) {
  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <span className="font-mono text-xs uppercase font-bold text-on-surface flex items-center gap-2">
          <span>📁</span>
          DOCUMENTS &amp; ROADMAP
        </span>
        <span className="font-mono text-[10px] text-secondary">
          {documents.length} ARTIFACTS
        </span>
      </div>

      <div className="flex flex-col divide-y divide-[#111111]/15">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onOpenDoc?.(doc)}
            className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-surface-container/50 px-1 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary font-bold">
                {doc.type === "MARKDOWN" ? "MD" : doc.type === "PDF" ? "PDF" : "TS"}
              </span>
              <span className="font-serif text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                {doc.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-secondary">
                {doc.updatedAt}
              </span>
              <span className="font-mono text-xs text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                ➔
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

