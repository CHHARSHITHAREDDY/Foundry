"use client";

import React from "react";

export interface ChatMessageItem {
  id: string;
  sender: "user" | "ember" | "system";
  timestamp: string;
  content: string;
  attachment?: {
    name: string;
    url?: string;
  };
  linkAction?: {
    label: string;
    href: string;
  };
}

interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const isEmber = message.sender === "ember";

  return (
    <div
      className={`flex flex-col gap-1.5 p-3 border-2 border-[#111111] transition-all ${
        isUser
          ? "bg-surface-container-low ml-4 shadow-[2px_2px_0px_0px_#111111]"
          : "bg-surface-container-lowest mr-4 shadow-[2px_2px_0px_0px_#ca4b00]"
      }`}
    >
      <div className="flex items-center justify-between pb-1 border-b border-[#111111]/20">
        <span
          className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
            isEmber ? "text-primary" : "text-on-surface"
          }`}
        >
          {isEmber ? "EMBER // AGENT [ · _ · ]" : "FOUNDER"}
        </span>
        <span className="font-mono text-[10px] text-secondary">
          {message.timestamp}
        </span>
      </div>

      <div className="font-serif text-sm text-on-surface whitespace-pre-line leading-relaxed">
        {message.content}
      </div>

      {message.attachment && (
        <div className="mt-1 p-2 bg-surface-container border border-[#111111] font-mono text-xs flex items-center justify-between">
          <span className="truncate">📎 {message.attachment.name}</span>
          <span className="text-primary font-bold">VIEW</span>
        </div>
      )}

      {message.linkAction && (
        <a
          href={message.linkAction.href}
          className="mt-1 inline-flex items-center justify-between px-3 py-1.5 bg-[#111111] text-white hover:bg-primary font-mono text-xs uppercase font-bold transition-all shadow-[1px_1px_0px_0px_#111111]"
        >
          <span>{message.linkAction.label}</span>
          <span>➔</span>
        </a>
      )}
    </div>
  );
}

