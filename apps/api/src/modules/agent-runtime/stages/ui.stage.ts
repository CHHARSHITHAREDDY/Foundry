import path from "path";
import { LlmClient, ModelUsage } from "@venture-studio/llm-client";
import { BuildSpec } from "@venture-studio/contracts";
import { z } from "zod";
import { reActRunner } from "../tools/react-agent.js";

const GeneratedFilesSchema = z.object({
  files: z.record(z.string()),
});

export class UiStage {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async execute(
    spec: BuildSpec,
    templatePath: string = path.resolve(process.cwd(), "packages/templates/nextjs-saas"),
    runId: string = "run_default"
  ): Promise<{ files: Record<string, string>; usage: ModelUsage; reactSteps?: any[] }> {
    // 1. Execute Autonomous ReAct Loop with Code Tools (read_file, search_code, write_file, finish)
    try {
      const reactResult = await reActRunner.runLoop(
        `You are the Lead Autonomous UI Frontend Coding Agent. Inspect template layout and styling and write high-converting landing page and interactive dashboard.`,
        `Build dark-theme landing page in "src/app/page.tsx" and interactive dashboard in "src/app/(app)/dashboard/page.tsx" for ${spec.metadata.name} (${spec.metadata.tagline}).`,
        templatePath,
        4,
        runId,
        "UI"
      );

      if (reactResult.completed && reactResult.output && Object.keys(reactResult.output).length >= 2) {
        return {
          files: reactResult.output,
          usage: {
            promptTokens: reactResult.tokensIn,
            completionTokens: reactResult.tokensOut,
            totalTokens: reactResult.tokensIn + reactResult.tokensOut,
          },
          reactSteps: reactResult.steps,
        };
      }
    } catch {}

    // 2. Direct LLM Structured Generation if ReAct loop steps skipped
    const prompt = `You are the Lead Frontend UI Coding Agent for an autonomous venture studio.
Using Tailwind CSS and modern React 19 / Next.js 15 App Router, build clean components and pages for:

Product: ${spec.metadata.name}
Tagline: ${spec.metadata.tagline}
Description: ${spec.metadata.description}
Target Audience: ${spec.metadata.targetAudience}
Primary Color: ${spec.designTokens.primaryColor}
Accent Color: ${spec.designTokens.accentColor}

Generate two files:
1. "src/app/page.tsx": High-converting dark-theme landing page with sticky nav, Hero section with CTA to /dashboard, 3-feature grid highlighting the solution to ${spec.metadata.description}, and footer.
2. "src/app/(app)/dashboard/page.tsx": Client dashboard ("use client") with interactive state, key stats cards (Total Operations, Active Alerts, Latency), table of records with status badges, and an interactive "+ Add Record" button.

Return a JSON object in this format:
{
  "files": {
    "src/app/page.tsx": "<typescript_react_code>",
    "src/app/(app)/dashboard/page.tsx": "<typescript_react_code>"
  }
}`;

    try {
      const { data: res, usage } = await this.llm.completeStructured(
        { tier: "coder", messages: [{ role: "user", content: prompt }], temperature: 0.2 },
        GeneratedFilesSchema
      );
      if (res && res.files && Object.keys(res.files).length >= 2) {
        return { files: res.files, usage };
      }
    } catch {}

    const primaryColor = spec.designTokens.primaryColor || "#3b82f6";
    const accentColor = spec.designTokens.accentColor || "#10b981";

    const landingPage = `import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-blue-500/20">
      <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            ${spec.metadata.name.slice(0, 1)}
          </div>
          <span className="font-bold text-lg tracking-tight text-white">${spec.metadata.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-sm hover:shadow-blue-500/25"
          >
            Launch Studio &rarr;
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span>Targeting ${spec.metadata.targetAudience}</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 text-white max-w-3xl mx-auto leading-tight">
          ${spec.metadata.tagline}
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          ${spec.metadata.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition shadow-lg shadow-blue-600/30"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-base transition"
          >
            Explore Architecture
          </a>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Core Autonomous Capabilities</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Engineered specifically to solve high-frequency failure points with zero human intervention.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4">01</div>
            <h3 className="text-lg font-semibold text-white mb-2">Automated Drift Mitigation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Continuous monitoring and proactive self-healing for mission-critical operations.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4">02</div>
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security Rules</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Strict input sanitization, zero plain-text leaks, and automated compliance verification.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4">03</div>
            <h3 className="text-lg font-semibold text-white mb-2">Zero-Latency Sync</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Optimized for high-throughput edge execution with sub-second feedback loops.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-10 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} ${spec.metadata.name}. Autonomous software built with Venture Studio.
      </footer>
    </main>
  );
}
`;

    const dashboardPage = `"use client";

import { useState } from "react";
import Link from "next/link";

interface RecordItem {
  id: string;
  name: string;
  status: "active" | "resolving" | "synced";
  timestamp: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<RecordItem[]>([
    { id: "rec_1", name: "Primary Node Monitor", status: "active", timestamp: "Just now" },
    { id: "rec_2", name: "Inbound Pipeline Sync", status: "synced", timestamp: "12m ago" },
    { id: "rec_3", name: "Health Sentinel Worker", status: "resolving", timestamp: "1h ago" },
  ]);

  const [inputName, setInputName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const newItem: RecordItem = {
      id: "rec_" + Math.random().toString(36).substring(2, 7),
      name: inputName.trim(),
      status: "active",
      timestamp: "Just now",
    };
    setRecords([newItem, ...records]);
    setInputName("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-white text-lg hover:text-blue-400 transition">
            ${spec.metadata.name}
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">WORKSPACE</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">User: <strong className="text-zinc-200">Operator</strong></span>
          <Link href="/" className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
            Exit
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Operations</div>
            <div className="text-3xl font-bold text-white">{records.length * 142 + 89}</div>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Active Sentinels</div>
            <div className="text-3xl font-bold text-emerald-400">{records.length}</div>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Pipeline Health</div>
            <div className="text-3xl font-bold text-blue-400">99.8%</div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Active Operational Units</h2>
              <p className="text-sm text-zinc-400">Managed endpoints monitored by ${spec.metadata.name}</p>
            </div>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="New node label..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
              >
                + Register
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ID</th>
                  <th className="px-4 py-3">Node Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-zinc-500">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={"text-xs px-2 py-0.5 rounded-full font-medium " + (r.status === "active" ? "bg-emerald-500/10 text-emerald-400" : r.status === "resolving" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400")}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{r.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
`;

    return {
      files: {
        "src/app/page.tsx": landingPage,
        "src/app/(app)/dashboard/page.tsx": dashboardPage,
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}
