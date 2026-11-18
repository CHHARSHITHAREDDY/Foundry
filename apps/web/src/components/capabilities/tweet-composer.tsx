"use client";

import React, { useState } from "react";

interface TweetComposerProps {
  initialContent?: string;
  onSend?: (content: string) => void;
}

export function TweetComposer({
  initialContent = "",
  onSend,
}: TweetComposerProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface border border-[#111111]">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Compose launch update or changelog tweet..."
        className="w-full p-2 font-serif text-sm bg-transparent border-none focus:outline-none resize-none"
      />
      <div className="flex items-center justify-between pt-2 border-t border-[#111111]/20">
        <span className="font-mono text-[10px] text-secondary">
          {280 - content.length} / 280
        </span>
        <button
          type="button"
          onClick={() => onSend?.(content)}
          className="px-3 py-1 bg-primary text-white font-mono text-xs uppercase font-bold hover:bg-primary-container transition-colors"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

