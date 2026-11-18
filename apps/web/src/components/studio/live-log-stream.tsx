"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success" | "edge";
  tag: string;
  message: string;
}

interface LiveLogStreamProps {
  initialLogs?: LogEntry[];
  isStreaming?: boolean;
  maxLogs?: number;
}

const DEFAULT_STREAM_LOGS: LogEntry[] = [
  { id: "1", timestamp: "12:48:02.102", level: "info", tag: "BUILD", message: "Optimizing Next.js 15 server bundles for Cloudflare Workerd target..." },
  { id: "2", timestamp: "12:48:04.420", level: "success", tag: "BUILD", message: "Compiled 14 modules in 1.4s (Bundle size: 142 KB gzip)" },
  { id: "3", timestamp: "12:48:08.810", level: "edge", tag: "OCI", message: "Pushing layer sha256:8b4e723 to edge registry us-east (IAD1)..." },
  { id: "4", timestamp: "12:48:11.205", level: "edge", tag: "OCI", message: "Pushing layer sha256:8b4e723 to edge registry eu-central (FRA1)..." },
  { id: "5", timestamp: "12:48:13.900", level: "info", tag: "CNAME", message: "Binding route pricewatch-4k2.foundry.app -> Edge Ingress Gate" },
  { id: "6", timestamp: "12:48:16.140", level: "success", tag: "DNS", message: "Cloudflare Anycast routing synchronized across 238/285 PoPs" },
  { id: "7", timestamp: "12:48:18.500", level: "info", tag: "SSL", message: "Let's Encrypt / Cloudflare Edge TLS 1.3 certificate verified (OCSP stapled)" },
  { id: "8", timestamp: "12:48:21.010", level: "info", tag: "SMOKE", message: "Synthetic probe GET /api/health -> 200 OK (Latency: 18ms)" },
  { id: "9", timestamp: "12:48:23.750", level: "warn", tag: "WARMUP", message: "Cold start warming request issued to Tokyo NRT1 container..." },
  { id: "10", timestamp: "12:48:26.110", level: "success", tag: "WARMUP", message: "Tokyo container warm response in 24ms. Ingress active." },
];

export function LiveLogStream({
  initialLogs = DEFAULT_STREAM_LOGS,
  isStreaming = true,
}: LiveLogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Periodic heartbeat log when streaming
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + Math.floor(Math.random() * 900 + 100);
      const newEntry: LogEntry = {
        id: String(Date.now()),
        timestamp: timeStr,
        level: "edge",
        tag: "EDGE_METRIC",
        message: `PoP [${["IAD1", "FRA1", "NRT1", "LHR2", "SIN1"][Math.floor(Math.random() * 5)]}] edge handshake ACK (RTT: ${Math.floor(Math.random() * 15 + 12)}ms)`,
      };
      setLogs((prev) => [...prev.slice(-40), newEntry]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "EDGE") return log.level === "edge" || log.tag === "OCI";
    if (filter === "SSL") return log.tag === "SSL" || log.tag === "DNS";
    return log.tag === filter;
  });

  return (
    <div className="flex flex-col h-full bg-[#111111] text-[#ffffff] border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] font-mono">
      {/* Stream Header */}
      <div className="px-3 py-2 bg-[#1c1c1c] border-b border-[#333333] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping"></span>
          <span className="font-bold text-[#ffffff] uppercase tracking-wider">
            REAL-TIME EDGE LOG STREAM
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-1.5 py-0.5 border uppercase font-bold transition-colors ${
              autoScroll ? "bg-primary text-white border-primary" : "bg-black text-secondary border-[#444444]"
            }`}
          >
            {autoScroll ? "AUTO-SCROLL: ON" : "PAUSED"}
          </button>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="px-1.5 py-0.5 border border-[#444444] text-secondary hover:text-white uppercase"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-3 py-1 bg-[#181818] border-b border-[#2b2b2b] flex items-center gap-2 text-[10px]">
        <span className="text-secondary uppercase">FILTER:</span>
        {["ALL", "EDGE", "SSL", "BUILD"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-1.5 py-0.2 border transition-colors ${
              filter === f
                ? "bg-white text-black border-white font-bold"
                : "text-secondary border-transparent hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log Stream Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-auto space-y-1 text-xs select-text"
      >
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-tight">
            <span className="text-[#666666] shrink-0 text-[11px]">{log.timestamp}</span>
            <span
              className={`shrink-0 px-1 text-[10px] font-bold uppercase border ${
                log.level === "success"
                  ? "bg-[#15803D]/20 text-[#4ade80] border-[#15803D]"
                  : log.level === "warn"
                  ? "bg-[#b45309]/20 text-[#fde047] border-[#b45309]"
                  : log.level === "edge"
                  ? "bg-primary/20 text-primary-fixed-dim border-primary"
                  : "bg-surface-container/20 text-[#93c5fd] border-[#3b82f6]"
              }`}
            >
              {log.tag}
            </span>
            <span
              className={`break-all ${
                log.level === "success"
                  ? "text-[#4ade80]"
                  : log.level === "warn"
                  ? "text-[#fde047]"
                  : "text-[#d1d5db]"
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

