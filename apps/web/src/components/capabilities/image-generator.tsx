"use client";

import React, { useState } from "react";

export function ImageGenerator({ onGenerate }: { onGenerate?: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Image prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 font-mono text-xs bg-surface-container-low border border-[#111111]"
      />
      <button
        type="button"
        onClick={() => onGenerate?.(prompt)}
        className="py-1 bg-primary text-white font-mono text-xs uppercase font-bold"
      >
        Generate Image
      </button>
    </div>
  );
}

