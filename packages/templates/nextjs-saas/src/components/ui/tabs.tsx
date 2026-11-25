import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex border-b border-zinc-800 space-x-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === t.id ? "border-indigo-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
