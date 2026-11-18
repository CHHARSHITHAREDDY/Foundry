"use client";

import React, { useState } from "react";

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscript, disabled = false }: VoiceButtonProps) {
  const [listening, setListening] = useState(false);

  const toggleListen = () => {
    if (disabled) return;
    if (!listening) {
      setListening(true);
      // Simulate brief voice recognition
      setTimeout(() => {
        setListening(false);
        onTranscript?.("Add webhook retry backoff for Shopify orders update");
      }, 2500);
    } else {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      disabled={disabled}
      className={`px-2.5 py-1.5 border-2 border-[#111111] font-mono text-xs uppercase font-bold transition-all flex items-center gap-1.5 ${
        listening
          ? "bg-error text-white animate-pulse shadow-[2px_2px_0px_0px_#111111]"
          : "bg-surface hover:bg-surface-container text-on-surface shadow-[1px_1px_0px_0px_#111111]"
      }`}
      title="Dictate instruction via voice"
    >
      <span>🎤</span>
      <span>{listening ? "LISTENING..." : "VOICE"}</span>
    </button>
  );
}

