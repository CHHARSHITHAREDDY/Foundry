"use client";

import React, { useState } from "react";
import { VoiceButton } from "./voice-button";

interface ChatComposerProps {
  onSendMessage: (text: string, attachment?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSendMessage,
  disabled = false,
  placeholder = "Instruct Ember: 'Create task to add Slack alerts' or 'Update copy'...",
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSendMessage(text, file || undefined);
    setText("");
    setFile(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-surface-container border-2 border-[#111111] flex flex-col gap-2 shadow-[3px_3px_0px_0px_#111111]"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        className="w-full p-2.5 font-serif text-sm bg-surface-container-lowest border border-[#111111] focus:outline-none focus:border-primary resize-none placeholder:text-secondary/60"
      />

      {file && (
        <div className="flex items-center justify-between p-1.5 bg-surface border border-[#111111] font-mono text-xs">
          <span>📎 {file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-error font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* File attachment */}
          <label className="px-2.5 py-1.5 bg-surface hover:bg-surface-container-high border-2 border-[#111111] font-mono text-xs uppercase font-bold cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#111111]">
            <span>📎 ATTACH</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
          </label>

          {/* Voice Input */}
          <VoiceButton onTranscript={(transcript) => setText((prev) => (prev ? prev + " " + transcript : transcript))} />
        </div>

        <button
          type="submit"
          disabled={disabled || (!text.trim() && !file)}
          className="px-4 py-1.5 bg-primary text-white border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_#111111]"
        >
          SEND ➔
        </button>
      </div>
    </form>
  );
}

