"use client";

import React, { useState } from "react";

export function MediaPanel() {
  const [activeMedia, setActiveMedia] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(2);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedCount((prev) => prev + 1);
      setPrompt("");
    }, 1800);
  };

  return (
    <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[2px_2px_0px_0px_#111111]">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base">🎨</span>
          <span className="font-mono text-xs uppercase font-bold text-on-surface">
            MEDIA &amp; VISUAL ASSETS
          </span>
        </div>
        <div className="flex gap-1 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setActiveMedia("image")}
            className={`px-1.5 py-0.5 border ${
              activeMedia === "image" ? "bg-primary text-white border-primary" : "border-[#111111]"
            }`}
          >
            IMAGE
          </button>
          <button
            type="button"
            onClick={() => setActiveMedia("video")}
            className={`px-1.5 py-0.5 border ${
              activeMedia === "video" ? "bg-primary text-white border-primary" : "border-[#111111]"
            }`}
          >
            VIDEO
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            activeMedia === "image"
              ? "Prompt: High-contrast brutalist banner for Shopify app store..."
              : "Prompt: 10s kinetic typography promo showcasing margin slider..."
          }
          className="flex-1 p-2 font-serif text-xs bg-surface-container-low border border-[#111111] focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="px-3 py-1 bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold disabled:opacity-50"
        >
          {generating ? "..." : "GEN"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-secondary">
        <div className="p-2 border border-[#111111]/30 bg-surface text-center">
          <div className="font-bold text-on-surface">HERO_OG.PNG</div>
          <div className="text-[10px]">1200x630 · Rendered</div>
        </div>
        <div className="p-2 border border-[#111111]/30 bg-surface text-center">
          <div className="font-bold text-on-surface">APP_ICON_512.PNG</div>
          <div className="text-[10px]">512x512 · Shopify Ready</div>
        </div>
      </div>
    </div>
  );
}

