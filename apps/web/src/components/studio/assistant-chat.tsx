"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageItem } from "./chat-message";
import { ChatComposer } from "./chat-composer";

const INITIAL_COMPANION_MESSAGES: ChatMessageItem[] = [
  {
    id: "msg-1",
    sender: "user",
    timestamp: "12:30",
    content: "Surprise me with a targeted high-margin Shopify niche tool.",
  },
  {
    id: "msg-2",
    sender: "ember",
    timestamp: "12:31",
    content: "Identified PriceWatch: Margin Guardrail for high-volume Shopify Plus stores. Synthesized Prisma schemas, GraphQL webhooks, and modern Polaris slider components in 6 minutes.",
    linkAction: {
      label: "VIEW LIVE ENDPOINT",
      href: "https://pricewatch-4k2.foundry.app",
    },
  },
  {
    id: "msg-3",
    sender: "ember",
    timestamp: "12:44",
    content: "Completed Stage 05 QA Review Gate. All 3 invariants satisfied, 2 security patches applied automatically (Shopify rate-limiting + HMAC verification).",
  },
];

interface AssistantChatProps {
  companyName?: string;
  onNewTaskFromChat?: (text: string) => void;
}

export function AssistantChat({
  companyName = "PriceWatch",
  onNewTaskFromChat,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_COMPANION_MESSAGES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string, file?: File) => {
    const userMsg: ChatMessageItem = {
      id: String(Date.now()),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: text,
      attachment: file ? { name: file.name } : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Check if it's a task instruction
    if (text.toLowerCase().includes("task") || text.toLowerCase().includes("add") || text.toLowerCase().includes("fix")) {
      onNewTaskFromChat?.(text);
    }

    // Ember AI automated response
    setTimeout(() => {
      const emberMsg: ChatMessageItem = {
        id: String(Date.now() + 1),
        sender: "ember",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: `Acknowledged. Parsing instruction for ${companyName}. Adding targeted specification to the sprint queue with automated test assertions.`,
      };
      setMessages((prev) => [...prev, emberMsg]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111]">
      {/* Header */}
      <div className="bg-[#111111] text-[#ffffff] px-4 py-3 flex items-center justify-between border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-bold tracking-wider text-primary">
            ✦ EMBER COMPANION
          </span>
          <span className="font-mono text-[10px] text-secondary-fixed-dim">
            // PERSISTENT RAIL
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#15803D] text-white">
          ONLINE
        </span>
      </div>

      {/* Messages stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Chat composer */}
      <div className="p-3 bg-surface-container-lowest border-t-2 border-[#111111]">
        <ChatComposer onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

