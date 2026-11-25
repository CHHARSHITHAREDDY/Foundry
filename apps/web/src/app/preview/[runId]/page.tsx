"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface PreviewPageProps {
  params: Promise<{ runId: string }>;
}

interface TableRecord {
  id: string;
  name: string;
  status: "synced" | "processing" | "flagged";
  value: string;
  source: string;
  time: string;
}

export default function VenturePreviewPage({ params }: PreviewPageProps) {
  const { runId } = use(params);
  const [loading, setLoading] = useState(true);
  const [runData, setRunData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"landing" | "dashboard" | "settings" | "analytics" | "code" | "architecture">("dashboard");
  const [selectedFile, setSelectedFile] = useState<string>("src/app/page.tsx");
  const [copied, setCopied] = useState(false);

  // Settings Interactive State
  const [apiKey, setApiKey] = useState("vst_live_" + (runId ? runId.replace(/[^a-zA-Z0-9]/g, "") : "key123"));
  const [webhookUrl, setWebhookUrl] = useState("https://api.mycompany.com/webhooks/vst");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Dashboard interactive state
  const [records, setRecords] = useState<TableRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "synced" | "processing" | "flagged">("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newStatus, setNewStatus] = useState<"synced" | "processing" | "flagged">("synced");

  // Landing Page Interactive State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        let res: Response | null = null;
        try {
          res = await fetch(`/api/backend/runtime/runs/${runId}`);
        } catch {}

        if (!res || !res.ok) {
          const directUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          try {
            res = await fetch(`${directUrl.replace(/\/$/, "")}/api/runtime/runs/${runId}`);
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          setRunData(data);
          if (data.files && Object.keys(data.files).length > 0) {
            setSelectedFile(Object.keys(data.files)[0] || "src/app/page.tsx");
          }
        }
      } catch {}
      setLoading(false);
    }
    loadData();
  }, [runId]);

  const title = runData?.buildSpec?.metadata?.name || "Autonomous Venture";
  const tagline = runData?.buildSpec?.metadata?.tagline || "Autonomous micro-SaaS software solution";
  const description = runData?.buildSpec?.metadata?.description || "High-velocity automated software pipeline";
  const targetAudience = runData?.buildSpec?.metadata?.targetAudience || "Founders & Engineers";
  const files = runData?.files || {};
  const sandboxPath = runData?.sandboxPath || `D:\\project\\builds\\${runId}`;

  // Domain detection
  const textBlob = (title + " " + tagline + " " + description).toLowerCase();
  const isFinance = /finance|csv|ledger|accounting|money|bank|cfo|reconcil|payment|invoice|tax/i.test(textBlob);
  const isSecurity = /security|webhook|auth|token|secret|api|proxy|firewall|audit|leak/i.test(textBlob);
  const isAi = /ai|llm|agent|model|prompt|rag|embedding|gpt|inference/i.test(textBlob);

  // Domain-specific seed configuration
  let domainBadge = "AUTOMATED PIPELINE";
  let kpi1Title = "Processed Units";
  let kpi1Value = "14,820";
  let kpi2Title = "Active Pipelines";
  let kpi2Value = "6";
  let kpi3Title = "System Health";
  let kpi3Value = "99.98%";
  let kpi4Title = "Avg Latency";
  let kpi4Value = "42ms";

  useEffect(() => {
    if (records.length === 0) {
      if (isFinance) {
        setRecords([
          { id: "LED-904", name: "Silicon Valley Bank CSV Feed (Oct 2026)", status: "synced", value: "$142,500.00", source: "CSV Feed", time: "Just now" },
          { id: "LED-903", name: "Stripe Monthly Fee Reconciliation #841", status: "synced", value: "$28,450.20", source: "Stripe API", time: "25m ago" },
          { id: "LED-902", name: "Ramp Corporate Travel Card Diff", status: "flagged", value: "$1,840.00", source: "Card Ingest", time: "2h ago" },
          { id: "LED-901", name: "QuickBooks Online General Ledger Sync", status: "processing", value: "$88,200.00", source: "QBO Sync", time: "4h ago" },
          { id: "LED-900", name: "Brex Treasury Yield Accrual Export", status: "synced", value: "$6,120.00", source: "CSV Feed", time: "6h ago" },
        ]);
      } else if (isSecurity) {
        setRecords([
          { id: "WH-804", name: "GitHub Release Webhook Event", status: "synced", value: "200 OK", source: "GitHub", time: "Just now" },
          { id: "WH-803", name: "Stripe Customer Subscription Created", status: "synced", value: "200 OK", source: "Stripe", time: "8m ago" },
          { id: "WH-802", name: "Shopify Abandoned Cart Relay #12", status: "processing", value: "Retry #2", source: "Shopify", time: "18m ago" },
          { id: "WH-801", name: "PagerDuty Critical Alert Callback", status: "synced", value: "200 OK", source: "PagerDuty", time: "1h ago" },
          { id: "WH-800", name: "Twilio SMS Delivery Status Webhook", status: "flagged", value: "429 Throttle", source: "Twilio", time: "3h ago" },
        ]);
      } else if (isAi) {
        setRecords([
          { id: "AGT-404", name: "Deep Market Synthesis Thread", status: "synced", value: "94.2 Score", source: "Swarm", time: "Just now" },
          { id: "AGT-403", name: "Automated Code Review AST Scan", status: "synced", value: "0 Leaks", source: "Security", time: "12m ago" },
          { id: "AGT-402", name: "Vector Index Refresh Chunk #14", status: "processing", value: "842 docs", source: "Embeddings", time: "45m ago" },
          { id: "AGT-401", name: "Multi-Turn Prompt Calibration", status: "synced", value: "0.99 BLEU", source: "Optimizer", time: "2h ago" },
        ]);
      } else {
        setRecords([
          { id: "REC-104", name: "Primary Stream Ingestion #482", status: "synced", value: "Active", source: "Webhook", time: "Just now" },
          { id: "REC-103", name: "Schema Normalization Diff #481", status: "processing", value: "Batching", source: "Worker", time: "14m ago" },
          { id: "REC-102", name: "Discrepancy Resolution Item #480", status: "flagged", value: "Requires Review", source: "Queue", time: "1h ago" },
          { id: "REC-101", name: "Master Settlement Sync #479", status: "synced", value: "Synced", source: "Database", time: "3h ago" },
        ]);
      }
    }
  }, [isFinance, isSecurity, isAi]);

  if (isFinance) {
    domainBadge = "FINANCIAL DATA PIPELINE";
    kpi1Title = "Reconciled Volume";
    kpi1Value = "$1,482,900";
    kpi2Title = "Flagged Discrepancies";
    kpi2Value = String(records.filter((r) => r.status === "flagged").length);
    kpi3Title = "Auto-Match Accuracy";
    kpi3Value = "99.6%";
    kpi4Title = "P95 Ingestion Speed";
    kpi4Value = "420ms";
  } else if (isSecurity) {
    domainBadge = "SECURITY & RELAY GATEWAY";
    kpi1Title = "Relayed Payloads";
    kpi1Value = "2,481,020";
    kpi2Title = "Dead-Letter Buffer";
    kpi2Value = String(records.filter((r) => r.status === "flagged").length);
    kpi3Title = "Delivery Success";
    kpi3Value = "99.99%";
    kpi4Title = "P99 Relay Latency";
    kpi4Value = "38ms";
  } else if (isAi) {
    domainBadge = "AUTONOMOUS AI RUNTIME";
    kpi1Title = "Tokens Processed";
    kpi1Value = "14.8M";
    kpi2Title = "Active Agents";
    kpi2Value = "8";
    kpi3Title = "Grounding Precision";
    kpi3Value = "98.7%";
    kpi4Title = "Execution Cadence";
    kpi4Value = "1.2s";
  }

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesFilter = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newRecord: TableRecord = {
      id: `${isFinance ? "LED" : isSecurity ? "WH" : "REC"}-${Math.floor(100 + Math.random() * 900)}`,
      name: newName.trim(),
      status: newStatus,
      value: newValue.trim() || (isFinance ? "$4,500.00" : isSecurity ? "200 OK" : "Active"),
      source: "Manual Console",
      time: "Just now",
    };
    setRecords([newRecord, ...records]);
    setNewName("");
    setNewValue("");
    setShowAddModal(false);
    showToast(`Added new entry "${newRecord.name}" to live workspace.`);
  };

  const handleRunSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Resolve flagged items
      setRecords((prev) =>
        prev.map((r) => (r.status === "flagged" ? { ...r, status: "synced", value: isFinance ? r.value : "200 OK" } : r))
      );
      showToast(`Autonomous pipeline batch completed in 380ms: 0 errors detected.`);
    }, 1200);
  };

  const handleExportCsv = () => {
    const headers = "ID,Name,Status,Value,Source,Timestamp\n";
    const rows = records.map((r) => `"${r.id}","${r.name}","${r.status}","${r.value}","${r.source}","${r.time}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${records.length} records to CSV file.`);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCopyCode = () => {
    const code = files[selectedFile] || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] text-[#111111] flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent animate-spin mb-4" />
        <span className="text-sm font-bold uppercase tracking-wider">Hydrating Venture Workspace...</span>
        <span className="text-xs text-[#5F5E5E] mt-1">{runId}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111] flex flex-col font-sans select-none">
      {/* Real-time Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-lg font-mono text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 border border-[#333333]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Control Bar */}
      <header className="border-b border-[#D6D6D1] bg-white sticky top-0 z-50 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="font-mono text-xs text-[#5F5E5E] hover:text-[#111111] flex items-center gap-1 border border-[#D6D6D1] px-2.5 py-1.5 bg-[#EDEDEA] font-bold"
          >
            ← Studio Dashboard
          </Link>
          <div className="h-4 w-px bg-[#D6D6D1]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-bold tracking-tight text-[#111111] font-mono">{title}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {domainBadge}
              </span>
            </div>
            <span className="text-[11px] text-[#5F5E5E] line-clamp-1">{tagline}</span>
          </div>
        </div>

        {/* View Switcher Tabs (6 Distinct Screens) */}
        <div className="flex items-center flex-wrap gap-1 border border-[#111111] bg-[#EDEDEA] p-1 shadow-[2px_2px_0px_#111111]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "dashboard" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            ★ 1. Live App Dashboard
          </button>
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "landing" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            2. Landing Page
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "settings" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            3. System Settings
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "analytics" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            4. Analytics &amp; Telemetry
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "code" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            5. Code Files ({Object.keys(files).length})
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all font-bold border ${
              activeTab === "architecture" ? "bg-[#111111] text-white border-[#111111]" : "text-[#5F5E5E] hover:text-[#111111] hover:bg-white border-transparent"
            }`}
          >
            6. Architecture &amp; Spec
          </button>
        </div>
      </header>

      {/* Main Interactive Canvas */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ======================================================== */}
        {/* TAB 1: INTERACTIVE LANDING PAGE                         */}
        {/* ======================================================== */}
        {activeTab === "landing" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xl">
            {/* Browser Header Bar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 font-mono text-xs text-zinc-400 bg-zinc-950 px-4 py-1 rounded border border-zinc-800">
                  https://{title.toLowerCase().replace(/[^a-z0-9]/g, "")}.preview.local
                </span>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="font-mono text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                Go to Live Dashboard →
              </button>
            </div>

            {/* Hero Section */}
            <div className="p-8 sm:p-16 max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs mb-8">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Engineered specifically for {targetAudience}</span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                {tagline}
              </h2>

              <p className="text-lg sm:text-xl text-zinc-400 font-normal max-w-3xl mx-auto mb-10 leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-xl shadow-blue-500/25 transition-all"
                >
                  Launch App Dashboard &rarr;
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className="px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs uppercase tracking-wider font-bold transition-all"
                >
                  Inspect TypeScript Code
                </button>
              </div>

              {/* Visual Mockup Frame with Live SVG Sparklines */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto mb-20 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white uppercase">{title} Core Engine</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                    Live Telemetry Stream
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">{kpi1Title}</span>
                    <span className="text-2xl font-bold font-mono text-white">{kpi1Value}</span>
                    <span className="text-[10px] font-mono text-emerald-400 block mt-1">+14.2% this period</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">{kpi2Title}</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{kpi2Value}</span>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-1">Zero latency delay</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">{kpi3Title}</span>
                    <span className="text-2xl font-bold font-mono text-blue-400">{kpi3Value}</span>
                    <span className="text-[10px] font-mono text-blue-400 block mt-1">99.99% SLA Target</span>
                  </div>
                </div>

                {/* SVG Visual Activity Chart */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
                    <span>7-Day Operational Activity</span>
                    <span className="text-emerald-400">● 100% Normalized</span>
                  </div>
                  <div className="h-28 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 Q70,40 140,65 T280,30 T420,50 T500,20 L500,100 L0,100 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M0,80 Q70,40 140,65 T280,30 T420,50 T500,20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun (Today)</span>
                  </div>
                </div>
              </div>

              {/* 3 Domain Value Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-800/80 text-left mb-20">
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold mb-4 font-mono">
                    01
                  </div>
                  <h3 className="font-bold text-white mb-2 text-base">Continuous Ingestion</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Zero-friction automated data parsing and normalization across disparate feeds and third-party APIs.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-4 font-mono">
                    02
                  </div>
                  <h3 className="font-bold text-white mb-2 text-base">Self-Healing Integrity</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Automatic drift detection, schema validation with Zod, and self-correcting error resolution circuits.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold mb-4 font-mono">
                    03
                  </div>
                  <h3 className="font-bold text-white mb-2 text-base">Tamper-Proof Audit</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Full cryptographic ledger history, instant CSV export, and granular role-based access controls.
                  </p>
                </div>
              </div>

              {/* Interactive Pricing Table */}
              <div className="pt-10 border-t border-zinc-800/80">
                <h3 className="text-2xl font-bold text-white mb-3">Simple, Transparent Pricing</h3>
                <p className="text-zinc-400 text-xs mb-6">Designed to scale effortlessly from solo operators to high-growth teams.</p>

                <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono mb-10">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      billingCycle === "monthly" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      billingCycle === "annual" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400"
                    }`}
                  >
                    Annual (Save 20%)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
                  <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-xs text-blue-400 uppercase font-bold">Starter Plan</span>
                      <div className="text-4xl font-extrabold text-white font-mono my-3">
                        {billingCycle === "monthly" ? "$49" : "$39"}
                        <span className="text-xs text-zinc-500 font-normal"> / month</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-6">For single founders and lightweight operational workloads.</p>
                      <ul className="space-y-2.5 text-xs text-zinc-300 font-mono mb-8">
                        <li>✓ Up to 10,000 monthly operations</li>
                        <li>✓ Automated schema normalization</li>
                        <li>✓ Standard email notifications</li>
                        <li>✓ 7-day retention audit log</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => showToast("Starter tier selected. Ready for deployment.")}
                      className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase font-bold transition"
                    >
                      Get Started
                    </button>
                  </div>

                  <div className="p-8 rounded-2xl bg-zinc-900/80 border-2 border-blue-500/60 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
                    <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-mono uppercase px-3 py-0.5 rounded-full font-bold">
                      POPULAR
                    </span>
                    <div>
                      <span className="font-mono text-xs text-emerald-400 uppercase font-bold">Pro Swarm Tier</span>
                      <div className="text-4xl font-extrabold text-white font-mono my-3">
                        {billingCycle === "monthly" ? "$199" : "$159"}
                        <span className="text-xs text-zinc-500 font-normal"> / month</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-6">For production workloads demanding sub-second response times.</p>
                      <ul className="space-y-2.5 text-xs text-zinc-300 font-mono mb-8">
                        <li>✓ Unlimited monthly throughput</li>
                        <li>✓ High-priority parallel processing</li>
                        <li>✓ Real-time Slack & Webhook dispatch</li>
                        <li>✓ 90-day retention & instant CSV export</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => showToast("Pro Swarm tier selected. Ready for deployment.")}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase font-bold transition shadow-lg shadow-blue-500/25"
                    >
                      Deploy Pro Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LIVE APP DASHBOARD (DEEPLY INTERACTIVE)           */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xl">
            {/* Top Workspace Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs font-mono shadow-md">
                  {title.slice(0, 1)}
                </span>
                <div>
                  <span className="font-bold text-sm text-white font-mono block leading-none">{title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{domainBadge}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <button
                  onClick={handleRunSync}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Run Pipeline Sync</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/20"
                >
                  + Add Entry
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition border border-zinc-700"
                >
                  ⬇ Export CSV
                </button>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-6 sm:p-8">
              {/* 4 Dynamic Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">{kpi1Title}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-white">{kpi1Value}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+14.2%</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">{kpi2Title}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-emerald-400">{kpi2Value}</span>
                    <span className="text-[10px] font-mono text-zinc-400">Live</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">{kpi3Title}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-blue-400">{kpi3Value}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Verified</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">{kpi4Title}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-purple-400">{kpi4Value}</span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Table Controls (Search, Filters, Selection Action) */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <span>Operational Activity Ledger</span>
                      <span className="text-xs font-normal text-zinc-400 font-mono">({filteredRecords.length} records)</span>
                    </h2>
                    <p className="text-xs text-zinc-400">All transactions, webhooks, and events processed by {title}.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter Pills */}
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
                      {(["all", "synced", "processing", "flagged"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg capitalize transition font-bold ${
                            statusFilter === st ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Filter by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono w-48"
                    />
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="uppercase bg-zinc-950/80 text-zinc-500 font-mono border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3.5 rounded-l-lg w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(filteredRecords.map((r) => r.id));
                              else setSelectedIds([]);
                            }}
                            className="rounded bg-zinc-900 border-zinc-800"
                          />
                        </th>
                        <th className="px-4 py-3.5">Record ID</th>
                        <th className="px-4 py-3.5">Description / Event</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Metric / Value</th>
                        <th className="px-4 py-3.5">Source Channel</th>
                        <th className="px-4 py-3.5 rounded-r-lg">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-mono">
                            No records match the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((r) => (
                          <tr
                            key={r.id}
                            className={`hover:bg-zinc-900/50 transition cursor-pointer ${
                              selectedIds.includes(r.id) ? "bg-zinc-900/40" : ""
                            }`}
                            onClick={() => toggleSelectRow(r.id)}
                          >
                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(r.id)}
                                onChange={() => toggleSelectRow(r.id)}
                                className="rounded bg-zinc-900 border-zinc-800"
                              />
                            </td>
                            <td className="px-4 py-3.5 font-mono text-zinc-400 font-bold">{r.id}</td>
                            <td className="px-4 py-3.5 font-medium text-white">{r.name}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                  r.status === "synced"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : r.status === "processing"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-zinc-300 font-bold">{r.value}</td>
                            <td className="px-4 py-3.5 font-mono text-zinc-400">{r.source}</td>
                            <td className="px-4 py-3.5 font-mono text-zinc-500">{r.time}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal: Add New Entry */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-5">
                    <h3 className="font-bold text-white font-mono text-sm">Add New {isFinance ? "Ledger" : "Operational"} Entry</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white font-mono text-xs">
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleAddRecord} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Record Name</label>
                      <input
                        type="text"
                        required
                        placeholder={isFinance ? "e.g. Q3 Chase Business Checking CSV" : "e.g. New Webhook Payload Dispatch"}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Value / Amount</label>
                      <input
                        type="text"
                        placeholder={isFinance ? "e.g. $14,250.00" : "e.g. 200 OK"}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Status</label>
                      <select
                        value={newStatus}
                        onChange={(e: any) => setNewStatus(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                      >
                        <option value="synced">Synced (Healthy)</option>
                        <option value="processing">Processing (In Flight)</option>
                        <option value="flagged">Flagged (Action Required)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25"
                      >
                        Save &amp; Ingest
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SYSTEM SETTINGS (INTERACTIVE)                     */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-8 shadow-2xl space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                  SCREEN 3 OF 6 // SYSTEM SETTINGS &amp; INTEGRATIONS
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">{title} Settings</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">Configure API keys, webhooks, and threshold alerts for {title}.</p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                ✓ Configuration updated and synchronized with local sandbox runtime.
              </div>
            )}

            <div className="space-y-6">
              <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-white">API Credentials</h3>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Production Secret Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      readOnly
                      className="flex-1 px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setApiKey("vst_live_" + Math.random().toString(36).substring(2, 14));
                        showToast("Generated fresh production secret key.");
                      }}
                      className="px-3.5 py-2 text-xs font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition font-bold"
                    >
                      Roll Key
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-white">Webhook Delivery</h3>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Notification Endpoint URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-white">Alert Routing</h3>
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
                type="button"
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                  showToast("Configuration saved and applied.");
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase rounded-lg transition shadow-md shadow-blue-500/20"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TELEMETRY & ANALYTICS (INTERACTIVE)               */}
        {/* ======================================================== */}
        {activeTab === "analytics" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-8 shadow-2xl space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                  SCREEN 4 OF 6 // TELEMETRY &amp; OPERATIONAL HEALTH
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">{title} Telemetry</h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">Real-time performance indicators and operational event trail.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">{kpi1Title}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{kpi1Value}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-1 block">+18.2% vs last cycle</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">{kpi2Title}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{records.length} items</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Live tracked</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">{kpi3Title}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{kpi3Value}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-1 block">+0.02% SLA</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[11px] font-mono uppercase text-zinc-400 block">{kpi4Title}</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{kpi4Value}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-1 block">-6ms latency</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">Event Audit Log</h3>
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
                    {[
                      { id: "EVT-801", event: "Automated batch reconciliation completed", time: "2m ago", status: "SUCCESS" },
                      { id: "EVT-800", event: "Webhook payload dispatched to subscriber", time: "14m ago", status: "SUCCESS" },
                      { id: "EVT-799", event: "Anomaly alert triggered and auto-resolved", time: "1h ago", status: "RESOLVED" },
                      { id: "EVT-798", event: "Scheduled data integrity sweep passed", time: "3h ago", status: "SUCCESS" },
                    ].map((l) => (
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
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: CODE INSPECTOR                                    */}
        {/* ======================================================== */}
        {activeTab === "code" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xl">
            <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">Physical Repository Code Inspector</span>
              <button
                onClick={handleCopyCode}
                className="font-mono text-xs px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold transition flex items-center gap-1.5"
              >
                {copied ? <span className="text-emerald-400">✓ Copied to Clipboard</span> : <span>Copy File</span>}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
              {/* File Tree */}
              <div className="border-r border-zinc-800 bg-zinc-950/60 p-4 font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-2 font-bold">
                  Hydrated Source Tree
                </span>
                {Object.keys(files).map((filePath) => (
                  <button
                    key={filePath}
                    onClick={() => setSelectedFile(filePath)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-mono truncate block ${
                      selectedFile === filePath
                        ? "bg-blue-600 text-white font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    {filePath}
                  </button>
                ))}
              </div>

              {/* Code Preview Frame */}
              <div className="col-span-3 p-6 bg-zinc-950 overflow-x-auto font-mono text-xs text-zinc-300">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900 text-zinc-500 text-[11px]">
                  <span>{selectedFile}</span>
                  <span>{(files[selectedFile]?.length || 0).toLocaleString()} bytes</span>
                </div>
                <pre className="leading-relaxed">
                  <code>{files[selectedFile] || "// File contents loaded from disk."}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ARCHITECTURE & RUNNER SPEC                        */}
        {/* ======================================================== */}
        {activeTab === "architecture" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-8 shadow-2xl space-y-8">
            <div>
              <span className="font-mono text-xs text-blue-400 uppercase font-bold tracking-wider block mb-2">
                Autonomous Architecture Spec
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-2">{title}</h2>
              <p className="text-zinc-400 text-sm">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="font-mono text-xs text-zinc-500 uppercase font-bold block">Target Persona</span>
                <p className="text-white text-sm">{targetAudience}</p>
                <span className="font-mono text-xs text-zinc-500 uppercase font-bold block pt-3">Domain Category</span>
                <p className="text-emerald-400 text-sm font-mono">{domainBadge}</p>
              </div>

              <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="font-mono text-xs text-zinc-500 uppercase font-bold block">Physical Disk Directory</span>
                <code className="text-xs font-mono text-amber-300 bg-zinc-950 p-2.5 rounded border border-zinc-800 block break-all">
                  {sandboxPath}
                </code>
                <span className="font-mono text-xs text-zinc-500 uppercase font-bold block pt-2">Local Port Runner</span>
                <code className="text-xs font-mono text-emerald-400 bg-zinc-950 p-2.5 rounded border border-zinc-800 block">
                  cd {sandboxPath} &amp;&amp; pnpm dev --port 3005
                </code>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
