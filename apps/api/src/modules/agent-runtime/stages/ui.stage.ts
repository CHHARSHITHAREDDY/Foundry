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
        `You are the Lead Autonomous UI Frontend Coding Agent. Inspect template layout and styling and write a visually rich, deeply interactive landing page, authenticated layout, client dashboard, analytics view, and navigation tailored specifically to the venture domain.`,
        `Build domain-tailored landing page in "src/app/page.tsx", layout in "src/app/(app)/layout.tsx", deeply interactive dashboard in "src/app/(app)/dashboard/page.tsx", settings in "src/app/(app)/settings/page.tsx", analytics in "src/app/(app)/analytics/page.tsx", and navigation components in "src/components/app/sidebar.tsx" and "src/components/app/topbar.tsx" for ${spec.metadata.name} (${spec.metadata.tagline}).`,
        templatePath,
        6,
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

    // 2. Direct LLM Structured Generation with Deep Domain Prompts
    const prompt = `You are the Lead Frontend UI Coding Agent for an autonomous venture studio.
Using Tailwind CSS and modern React 19 / Next.js 15 App Router, build visually rich, production-grade, highly interactive code tailored SPECIFICALLY to the problem domain of this venture:

Product Name: ${spec.metadata.name}
Tagline: ${spec.metadata.tagline}
Problem Statement: ${spec.metadata.description}
Target Audience: ${spec.metadata.targetAudience}
Primary Color: ${spec.designTokens.primaryColor || "#3b82f6"}
Accent Color: ${spec.designTokens.accentColor || "#10b981"}

CRITICAL REQUIREMENTS:
1. "src/app/page.tsx":
   - Complete bespoke domain landing page ("use client").
   - Sticky navbar with brand logo and Launch Studio CTA.
   - Hero section with badge, headline, subheadline, and dual CTA buttons.
   - Interactive Problem Simulator or Live Calculator for the domain.
   - 3-feature grid specifically addressing the pain points described in "${spec.metadata.description}".
   - Interactive Pricing tier comparison section (Starter vs Pro).
   - Testimonial quote from an ideal persona matching ${spec.metadata.targetAudience}.

2. "src/app/(app)/layout.tsx":
   - Authenticated application workspace layout wrapping children with sidebar and topbar.

3. "src/app/(app)/dashboard/page.tsx":
   - Client dashboard ("use client") with rich interactive state.
   - Top navigation bar with Search input and status badges.
   - 3-4 domain-specific metric stat cards with real domain terminology.
   - Filterable data table with status pills, search query filtering, and interactive row selection.
   - Interactive "+ New Entry" modal or form that appends to state and recalculates stats.
   - "⚡ Run Batch Process" button with animated state that triggers a simulated pipeline completion.
   - "⬇ Export CSV" button that generates a downloadable CSV blob directly in the browser.

4. "src/app/(app)/settings/page.tsx":
   - Domain settings page: API Keys, Webhook notification URLs, Alert threshold toggles.

5. "src/app/(app)/analytics/page.tsx":
   - Domain analytics page: metric cards, activity event trail, and operational status.

6. "src/components/app/sidebar.tsx":
   - Branded sidebar with navigation links (/dashboard, /analytics, /settings), brand badge, and user menu.

7. "src/components/app/topbar.tsx":
   - Branded header with search input, notifications indicator, and quick actions.

Return JSON in this format:
{
  "files": {
    "src/app/page.tsx": "<full_typescript_react_code>",
    "src/app/(app)/layout.tsx": "<full_typescript_react_code>",
    "src/app/(app)/dashboard/page.tsx": "<full_typescript_react_code>",
    "src/app/(app)/settings/page.tsx": "<full_typescript_react_code>",
    "src/app/(app)/analytics/page.tsx": "<full_typescript_react_code>",
    "src/components/app/sidebar.tsx": "<full_typescript_react_code>",
    "src/components/app/topbar.tsx": "<full_typescript_react_code>"
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

    // 3. Dynamic Fallback Generator: Synthesizes domain-specific code
    const files = this.generateDynamicDomainUI(spec);
    return {
      files,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  private generateDynamicDomainUI(spec: BuildSpec): Record<string, string> {
    const name = spec.metadata.name;
    const tagline = spec.metadata.tagline;
    const description = spec.metadata.description;
    const audience = spec.metadata.targetAudience;
    const primaryColor = spec.designTokens.primaryColor || "#3b82f6";
    const accentColor = spec.designTokens.accentColor || "#10b981";

    const descLower = (description + " " + tagline + " " + name).toLowerCase();

    // Domain detection
    const isFinance = /finance|csv|ledger|accounting|money|bank|cfo|reconcil|payment|invoice|tax/i.test(descLower);
    const isSecurity = /security|webhook|auth|token|secret|api|proxy|firewall|audit|leak/i.test(descLower);
    const isAi = /ai|llm|agent|model|prompt|rag|embedding|gpt|inference/i.test(descLower);

    let kpi1Label = "Total Throughput";
    let kpi1Val = "14,820";
    let kpi2Label = "Active Pipeline Units";
    let kpi2Val = "42";
    let kpi3Label = "Success Rate";
    let kpi3Val = "99.8%";

    let itemType = "Transaction Batch";
    let initialRecords = [
      { id: "REC-104", name: "Inbound Source Feed #482", status: "synced", value: "$12,450.00", time: "Just now" },
      { id: "REC-103", name: "Schema Normalization Diff #481", status: "processing", value: "$4,820.50", time: "14m ago" },
      { id: "REC-102", name: "Discrepancy Resolution Item #480", status: "flagged", value: "$890.00", time: "1h ago" },
      { id: "REC-101", name: "Master Settlement Sync #479", status: "synced", value: "$32,100.00", time: "3h ago" },
    ];

    if (isFinance) {
      kpi1Label = "Reconciled Volume";
      kpi1Val = "$1,482,900";
      kpi2Label = "Unmatched Discrepancies";
      kpi2Val = "3";
      kpi3Label = "Auto-Match Accuracy";
      kpi3Val = "99.6%";
      itemType = "Ledger Ingestion";
      initialRecords = [
        { id: "LED-904", name: "Silicon Valley Bank CSV Feed (Oct 2026)", status: "synced", value: "$142,500.00", time: "Just now" },
        { id: "LED-903", name: "Stripe Monthly Fee Reconciliation", status: "synced", value: "$28,450.20", time: "25m ago" },
        { id: "LED-902", name: "Ramp Card Travel Expenses Discrepancy", status: "flagged", value: "$1,840.00", time: "2h ago" },
        { id: "LED-901", name: "QuickBooks Online Ledger Sync", status: "processing", value: "$88,200.00", time: "4h ago" },
      ];
    } else if (isSecurity) {
      kpi1Label = "Relayed Webhooks";
      kpi1Val = "2,481,020";
      kpi2Label = "Dead-Letter Buffer";
      kpi2Val = "0";
      kpi3Label = "P99 Delivery Latency";
      kpi3Val = "42ms";
      itemType = "Webhook Relay";
      initialRecords = [
        { id: "WH-804", name: "GitHub Push Event Ingestion", status: "synced", value: "200 OK", time: "Just now" },
        { id: "WH-803", name: "Stripe Invoice Payment Succeeded", status: "synced", value: "200 OK", time: "8m ago" },
        { id: "WH-802", name: "Shopify Order Created Retry Circuit", status: "processing", value: "Retry #2", time: "18m ago" },
        { id: "WH-801", name: "SendGrid Delivery Status Webhook", status: "synced", value: "200 OK", time: "1h ago" },
      ];
    } else if (isAi) {
      kpi1Label = "Total Tokens Processed";
      kpi1Val = "14.2M";
      kpi2Label = "Active Agent Threads";
      kpi2Val = "8";
      kpi3Label = "Grounding Precision";
      kpi3Val = "98.7%";
      itemType = "Agent Execution";
      initialRecords = [
        { id: "AGT-404", name: "Deep Research Market Synthesis", status: "synced", value: "94.2 Score", time: "Just now" },
        { id: "AGT-403", name: "Automated Code Review AST Scan", status: "synced", value: "Zero Leaks", time: "12m ago" },
        { id: "AGT-402", name: "Vector Index Refresh Chunk #14", status: "processing", value: "842 docs", time: "45m ago" },
        { id: "AGT-401", name: "Multi-Turn Prompt Calibration", status: "synced", value: "0.99 BLEU", time: "2h ago" },
      ];
    }

    const landingPage = `import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-blue-500/20 font-sans">
      {/* Navigation */}
      <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            ${name.slice(0, 1)}
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">${name}</span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Autonomous SaaS</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-mono text-zinc-400 hover:text-white transition uppercase">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/25 font-bold"
          >
            Launch Studio &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Tailored for ${audience}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-white max-w-4xl mx-auto leading-tight">
          ${tagline}
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          ${description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition shadow-xl shadow-blue-600/30"
          >
            Launch Interactive Dashboard &rarr;
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-wider transition"
          >
            Explore Architecture
          </a>
        </div>

        {/* Visual Product Mockup Frame */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500">app.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.studio/workspace</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE ENGINE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left p-2">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">${kpi1Label}</span>
              <span className="text-2xl font-bold text-white font-mono">${kpi1Val}</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">${kpi2Label}</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">${kpi2Val}</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">${kpi3Label}</span>
              <span className="text-2xl font-bold text-blue-400 font-mono">${kpi3Val}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">Engineered for Autonomous Reliability</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm">
            Eliminates high-friction manual bottlenecks with zero-intervention background intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4 font-mono">01</div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Ingestion</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Zero-friction payload parsing and proactive schema mapping without human intervention.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4 font-mono">02</div>
            <h3 className="text-lg font-bold text-white mb-2">Self-Healing Execution</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Continuous drift detection with real-time error isolation and zero-downtime retry circuits.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 font-mono">03</div>
            <h3 className="text-lg font-bold text-white mb-2">Enterprise Audit Trails</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tamper-evident operational logging, compliance verification, and instant export capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10 text-center text-xs text-zinc-600 font-mono">
        &copy; {new Date().getFullYear()} ${name}. Autonomous micro-SaaS software built with Venture Studio.
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
  status: "synced" | "processing" | "flagged";
  value: string;
  time: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<RecordItem[]>(${JSON.stringify(initialRecords, null, 2)});
  const [filter, setFilter] = useState<"all" | "synced" | "processing" | "flagged">("all");
  const [search, setSearch] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const newItem: RecordItem = {
      id: "REC-" + Math.floor(100 + Math.random() * 900),
      name: inputName.trim(),
      status: "synced",
      value: inputValue.trim() || "$1,250.00",
      time: "Just now",
    };
    setRecords([newItem, ...records]);
    setInputName("");
    setInputValue("");
    triggerToast("Record added and synced to live ledger.");
  };

  const handleRunSync = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      triggerToast("Autonomous batch sync executed in 340ms: 0 errors detected.");
    }, 1200);
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Status,Value,Time\\n" + 
      records.map((r) => \`\${r.id},"\${r.name}",\${r.status},\${r.value},\${r.time}\`).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "${name.toLowerCase().replace(/[^a-z0-9]/g, "")}_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported " + records.length + " records as CSV.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold text-white text-base hover:text-blue-400 transition flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              ${name.slice(0, 1)}
            </span>
            ${name}
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
            ${itemType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={handleRunSync}
            disabled={isProcessing}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Run Autonomous Sync</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            ⬇ Export CSV
          </button>
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800">
            Exit
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">${kpi1Label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">${kpi1Val}</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+14.2%</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">${kpi2Label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">${kpi2Val}</span>
              <span className="text-xs font-mono text-zinc-500">Live</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">${kpi3Label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-blue-400 font-mono">${kpi3Val}</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Managed ${itemType} Items</span>
                <span className="text-xs font-mono text-zinc-500 font-normal">({filtered.length} total)</span>
              </h2>
              <p className="text-xs text-zinc-400">Live operational items actively parsed and normalized.</p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                {(["all", "synced", "processing", "flagged"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={\`px-2.5 py-1 rounded capitalize transition \${filter === f ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}\`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAdd} className="mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-wrap gap-2.5 items-center">
            <input
              type="text"
              placeholder="New item label..."
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Metric / Value (e.g. $2,500.00)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-48 px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              + Add Item
            </button>
          </form>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-zinc-950/80 text-zinc-500 font-mono border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Record ID</th>
                  <th className="px-4 py-3">Label / Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3 rounded-r-lg">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/50 transition">
                    <td className="px-4 py-3.5 font-mono text-zinc-400 font-medium">{r.id}</td>
                    <td className="px-4 py-3.5 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={"text-[11px] font-mono px-2 py-0.5 rounded-full font-medium " + (
                          r.status === "synced"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : r.status === "processing"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        )}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-300">{r.value}</td>
                    <td className="px-4 py-3.5 text-zinc-500 font-mono">{r.time}</td>
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

    const appLayout = `"use client";

import Sidebar from "@/components/app/sidebar";
import Topbar from "@/components/app/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
`;

    const sidebarCode = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Analytics", href: "/analytics", icon: "📈" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            ${name.slice(0, 1)}
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">${name}</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">LIVE WORKSPACE</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition " +
                  (isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900")
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-800/80">
        <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-mono text-[10px] uppercase">Engine Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="font-mono text-[11px] text-zinc-200">100% Operational</p>
        </div>
      </div>
    </aside>
  );
}
`;

    const topbarCode = `"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-semibold">
          ${name} OS
        </span>
        <span className="text-xs text-zinc-500 hidden sm:inline font-mono">
          / ${audience || "Production"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-zinc-400">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search resources..."
            className="bg-transparent border-none text-xs focus:outline-none text-zinc-200 w-36 font-mono"
            readOnly
          />
        </div>
        <Link
          href="/"
          className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition"
        >
          View Landing ➔
        </Link>
      </div>
    </header>
  );
}
`;

    const settingsPage = `"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("vst_live_" + Math.random().toString(36).substring(2, 14));
  const [webhookUrl, setWebhookUrl] = useState("https://api.mycompany.com/webhooks/vst");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Configure integrations, API credentials, and notification thresholds for ${name}.</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
          ✓ Settings saved and synced with runtime environment.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-4">
          <h2 className="text-sm font-semibold text-white">API Credentials</h2>
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Production Secret Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="flex-1 px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300"
              />
              <button
                type="button"
                onClick={() => setApiKey("vst_live_" + Math.random().toString(36).substring(2, 14))}
                className="px-3 py-2 text-xs font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition"
              >
                Roll Key
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-4">
          <h2 className="text-sm font-semibold text-white">Webhook Delivery</h2>
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Notification Endpoint URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-4">
          <h2 className="text-sm font-semibold text-white">Alert Routing</h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
              />
              <span className="text-zinc-300">Email dispatch on critical threshold violation</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
              />
              <span className="text-zinc-300">Relay alerts to Slack operations channel</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase rounded-lg transition shadow-md shadow-blue-500/20"
        >
          Save Configuration
        </button>
      </form>
    </main>
  );
}
`;

    const analyticsPage = `"use client";

export default function AnalyticsPage() {
  const metrics = [
    { label: "Operating Volume", value: "$412,850", change: "+18.2%" },
    { label: "Autonomous Actions", value: "9,824", change: "+24.5%" },
    { label: "System Uptime", value: "99.98%", change: "+0.02%" },
    { label: "Avg Latency", value: "48ms", change: "-6ms" },
  ];

  const logs = [
    { id: "EVT-801", event: "Automated batch reconciliation completed", time: "2m ago", status: "SUCCESS" },
    { id: "EVT-800", event: "Webhook payload dispatched to subscriber", time: "14m ago", status: "SUCCESS" },
    { id: "EVT-799", event: "Anomaly alert triggered and auto-resolved", time: "1h ago", status: "RESOLVED" },
    { id: "EVT-798", event: "Scheduled data integrity sweep passed", time: "3h ago", status: "SUCCESS" },
  ];

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Telemetry & Analytics</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Real-time performance indicators and operational event trail for ${name}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">{m.label}</span>
            <span className="text-xl font-bold text-white font-mono mt-1 block">{m.value}</span>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">{m.change} vs last cycle</span>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-semibold text-white">Event Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 text-zinc-500 uppercase border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Event ID</th>
                <th className="px-4 py-2.5">Activity</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-900/30">
                  <td className="px-4 py-3 text-zinc-400">{l.id}</td>
                  <td className="px-4 py-3 text-zinc-200">{l.event}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
`;

    return {
      "src/app/page.tsx": landingPage,
      "src/app/(app)/layout.tsx": appLayout,
      "src/app/(app)/dashboard/page.tsx": dashboardPage,
      "src/app/(app)/settings/page.tsx": settingsPage,
      "src/app/(app)/analytics/page.tsx": analyticsPage,
      "src/components/app/sidebar.tsx": sidebarCode,
      "src/components/app/topbar.tsx": topbarCode,
    };
  }
}
