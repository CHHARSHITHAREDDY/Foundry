"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [items, setItems] = useState([
    { id: "1", name: "Primary Service Node", status: "ONLINE" },
    { id: "2", name: "Webhook Inbound Relay", status: "HEALTHY" },
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Dashboard</h1>
          <p className="text-zinc-400 text-sm">Real-time status and operational controls</p>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          &larr; Back to Home
        </Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-zinc-400 text-sm mb-1">Active Services</div>
          <div className="text-3xl font-bold text-white">{items.length}</div>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-zinc-400 text-sm mb-1">Uptime SLA</div>
          <div className="text-3xl font-bold text-emerald-400">99.98%</div>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-zinc-400 text-sm mb-1">Response Latency</div>
          <div className="text-3xl font-bold text-blue-400">18ms</div>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Registered Resources</h2>
          <button
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { id: String(prev.length + 1), name: `Resource Node #${prev.length + 1}`, status: "ONLINE" },
              ])
            }
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            + Add Node
          </button>
        </div>
        <ul className="divide-y divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-200">{item.name}</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
