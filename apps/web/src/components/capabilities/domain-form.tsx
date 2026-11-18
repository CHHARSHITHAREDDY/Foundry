"use client";

import React, { useState } from "react";

export function DomainForm({ onSave }: { onSave?: (domain: string) => void }) {
  const [domain, setDomain] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="custom-domain.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="flex-1 p-2 font-mono text-xs bg-surface-container-low border border-[#111111]"
      />
      <button
        type="button"
        onClick={() => onSave?.(domain)}
        className="px-3 py-1 bg-primary text-white font-mono text-xs uppercase font-bold"
      >
        Save
      </button>
    </div>
  );
}

