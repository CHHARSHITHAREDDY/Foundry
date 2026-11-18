"use client";

import React from "react";
import { LiveLogStream, LogEntry } from "./live-log-stream";

export function TerminalView({ logs }: { logs?: LogEntry[] }) {
  return <LiveLogStream initialLogs={logs} />;
}

