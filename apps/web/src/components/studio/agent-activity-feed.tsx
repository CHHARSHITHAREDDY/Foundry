"use client";

import React from "react";

export function AgentActivityFeed({ activities = [] }: { activities?: any[] }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface border border-[#111111]">
      <div className="font-mono text-xs uppercase font-bold">Activity Feed</div>
      {activities.length === 0 ? (
        <div className="font-serif text-xs text-secondary">No recent activities recorded.</div>
      ) : (
        activities.map((a, i) => (
          <div key={i} className="text-xs font-mono">
            {a.text || "Action executed"}
          </div>
        ))
      )}
    </div>
  );
}

