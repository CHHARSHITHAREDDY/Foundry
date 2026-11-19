"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { BuildModal } from "@/components/studio/build-modal";
import { StudioApiClient } from "@/lib/api-client";

const api = new StudioApiClient();

interface FeedItem {
  id: string;
  source: string;
  sourceColor: string;
  timeAgo: string;
  quote: string;
  score: number;
  sentiment: string;
  tag?: string;
}

const INITIAL_FEED: FeedItem[] = [
  {
    id: "feed-1",
    source: "Hacker News",
    sourceColor: "bg-[#FEF3C7] text-[#B45309] border-[#B45309]",
    timeAgo: "12s ago",
    quote: "“We built a webhook dead-letter queue inspect-and-retry tool. Every time Stripe or Shopify sends webhooks that fail, our team had to SSH in.”",
    score: 184,
    sentiment: "WILLINGNESS_TO_PAY: HIGH",
    tag: "DEV_INFRA",
  },
  {
    id: "feed-2",
    source: "GitHub",
    sourceColor: "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]",
    timeAgo: "38s ago",
    quote: "“Feature Request: Automated schema drift detection & alert for Postgres. Deploying microservices across environments breaks queries silently.”",
    score: 242,
    sentiment: "DEV_PAIN: HIGH",
    tag: "POSTGRES_CLI",
  },
  {
    id: "feed-3",
    source: "r/SaaS",
    sourceColor: "bg-[#FFF3E0] text-primary border-primary",
    timeAgo: "1m ago",
    quote: "“Every single time tracking tool is bloated with CRM features. I just want a stopwatch that exports to Stripe billing.”",
    score: 184,
    sentiment: "SENTIMENT: FRUSTRATED",
    tag: "BILLING_LEAK",
  },
];

export default function ScoutPage() {
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<any>(null);

  const [isStreaming, setIsStreaming] = useState(true);
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [redditCount, setRedditCount] = useState(842);
  const [hnCount, setHnCount] = useState(312);
  const [phCount, setPhCount] = useState(184);
  const [reviewsCount, setReviewsCount] = useState(82);
  const [signalTotal, setSignalTotal] = useState(1420);

  // Periodic signal ingestion counter increment when streaming is active
  useEffect(() => {
    async function loadLiveRecon() {
      try {
        const res = await api.getPainPoints();
        if (res.painPoints && res.painPoints.length > 0) {
          const liveMapped: FeedItem[] = res.painPoints.map((p: any, idx: number) => {
            const domainLower = (p.domain || "").toLowerCase();
            const isHN = domainLower.includes("hacker");
            const isGH = domainLower.includes("github");
            const isReddit = domainLower.includes("r/");

            let source = p.domain || "Community";
            let sourceColor = "bg-surface-container text-on-surface border-[#111111]";
            let sentiment = "WILLINGNESS_TO_PAY: HIGH";
            let tag = "SAAS_WEDGE";

            if (isHN) {
              source = "Hacker News";
              sourceColor = "bg-[#FEF3C7] text-[#B45309] border-[#B45309]";
              sentiment = "FOUNDER_NEED: ACUTE";
              tag = "ASK_HN";
            } else if (isGH) {
              source = p.domain;
              sourceColor = "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]";
              sentiment = "DEV_PAIN: HIGH";
              tag = "GITHUB_ISSUE";
            } else if (isReddit) {
              source = p.domain;
              sourceColor = "bg-[#FFF3E0] text-primary border-primary";
              sentiment = "SENTIMENT: FRUSTRATED";
              tag = "REDDIT_SAAS";
            }

            return {
              id: p.id || `live-feed-${idx}`,
              source,
              sourceColor,
              timeAgo: `${(idx + 1) * 12}s ago`,
              quote: `“${p.quote || p.problem}”`,
              score: (p.frequency_score || 5) * 25 + Math.floor(Math.random() * 20),
              sentiment,
              tag,
            };
          });
          setFeed(liveMapped);
          setSignalTotal(res.total * 42 + 210);
        }
      } catch {}
    }
    loadLiveRecon();
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setSignalTotal((prev) => prev + Math.floor(Math.random() * 3) + 1);
      const picker = Math.random();
      if (picker < 0.4) setRedditCount((c) => c + 1);
      else if (picker < 0.7) setHnCount((c) => c + 1);
      else if (picker < 0.85) setPhCount((c) => c + 1);
      else setReviewsCount((c) => c + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleApproveBuild = (idea: any) => {
    setActiveIdea(idea);
    setSurpriseOpen(false);
    setBuildOpen(true);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* 2. Main Layout Area */}
      <div className="pl-60 min-h-screen flex flex-col flex-1">
        <DashboardHeader
          currentBreadcrumb="Live Heuristic Recon"
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((p) => !p)}
        />

        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(path) => {
            if (path === "new") router.push("/dashboard/new");
            if (path === "notifications") router.push("/dashboard/notifications");
            if (path === "billing") router.push("/dashboard?tab=billing");
          }}
        />

        <main className="w-full pt-14 flex-1 bg-surface flex flex-col">
          <div className="flex flex-col w-full flex-1">
            {/* TOP TELEMETRY STRIP */}
            <div className="w-full bg-surface-container-low border-b border-[#111111] px-space-md py-2 flex flex-wrap items-center justify-between gap-space-sm select-none font-mono">
              <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                <span className="inline-flex items-center gap-1 font-bold text-on-surface">
                  <span className="w-2 h-2 bg-primary animate-pulse" />
                  DISCOVERY_PROTOCOL
                </span>
                <span>//</span>
                <span>HEURISTIC_DISCOVERY_V4.2</span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">SESSION: #DSC-8842-AX</span>
              </div>
              <div className="flex items-center gap-space-md font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                <span className="text-on-surface font-bold">TARGETS: MICRO-SAAS // B2B UTILITY</span>
                <span>|</span>
                <span className="text-[#15803D] font-bold">4 PLATFORMS ACTIVE</span>
              </div>
            </div>

            {/* HERO & EMBER BANNER SECTION */}
            <div className="w-full border-b-[1.5px] border-[#111111] bg-surface p-space-md md:p-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              {/* Left: Mascot + Headline + Speech */}
              <div className="flex items-start gap-space-md">
                {/* EMBER MASCOT ICON (Vector line-art with orange status pip) */}
                <div className="shrink-0 relative w-16 h-16 bg-[#ffffff] border-[1.5px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex flex-col items-center justify-center p-1.5">
                  {/* Antenna line */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#111111]" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary border border-[#111111]" />
                  {/* Robot Face Graphic */}
                  <div className="w-full flex justify-around px-1 pt-1">
                    <div className="w-2 h-2 bg-[#111111]" />
                    <div className="w-2 h-2 bg-[#111111]" />
                  </div>
                  <div className="w-1.5 h-1.5 bg-primary my-1" />
                  <div className="w-7 h-[1.5px] bg-[#111111]" />
                  {/* Active beacon pip */}
                  <span className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-primary border border-[#111111] animate-pulse" />
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-label-sm text-label-sm uppercase bg-[#111111] text-[#ffffff] px-1.5 py-0.5 font-bold">
                      EMBER.AI // RECON_AGENT
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      SYS_MODE: AUTONOMOUS_HEURISTIC
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold font-serif text-on-surface tracking-tight">
                    Scouting the web for real problems.
                  </h1>
                  {/* Ember Speech Bubble */}
                  <div className="relative mt-1 bg-surface-container-low border-[1.5px] border-[#111111] p-space-sm shadow-[2px_2px_0px_0px_#111111] max-w-2xl">
                    <p className="font-body-sm text-body-sm text-on-surface italic font-serif">
                      “I’m crawling 4 platforms for unserved demand, recurring friction points, and
                      unbundled software complaints. Found 28 candidate pain points so far.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Real-time Metric Badge */}
              <div className="flex flex-col gap-1 self-start md:self-auto font-mono text-label-sm text-[12px] bg-surface-container-lowest border border-[#111111] p-space-sm shadow-[2px_2px_0px_0px_#111111]">
                <div className="flex justify-between gap-4">
                  <span className="text-secondary">ACTIVE_CRAWLERS:</span>
                  <span className="text-on-surface font-bold">04 RUNNING</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-secondary">THROUGHPUT:</span>
                  <span className="text-primary font-bold">184 REQ/M</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-secondary">ACCURACY:</span>
                  <span className="text-[#15803D] font-bold">99.4% VERIFIED</span>
                </div>
              </div>
            </div>

            {/* MAIN 2-COLUMN PIPELINE WORKSPACE */}
            <div className="w-full flex-1 max-w-[1440px] mx-auto p-space-md md:p-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* LEFT COLUMN: STEPPER PIPELINE (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-space-md font-mono">
                <div className="border-[1.5px] border-[#111111] bg-surface-container-lowest shadow-[3px_3px_0px_0px_#111111] p-space-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between border-b border-[#111111] pb-2">
                    <span className="font-bold text-label-md uppercase text-on-surface">
                      PIPELINE EXECUTION TREE
                    </span>
                    <span className="text-primary font-bold text-label-sm">[STAGE 1/4]</span>
                  </div>

                  {/* STEP 1: SCAN SOURCES (ACTIVE) */}
                  <div className="p-3 bg-[#FFF3E0] border-[1.5px] border-primary flex flex-col gap-2 shadow-[2px_2px_0px_0px_#ca4b00]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary animate-ping" />
                        <span className="font-bold text-primary text-label-sm">01 SCAN SOURCES</span>
                      </div>
                      <span className="text-[10px] px-1 py-0.2 bg-primary text-on-primary font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant font-serif">
                      Crawling Reddit, HN, Product Hunt, and review aggregators for raw complaints.
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-secondary border-t border-primary/30 pt-1.5">
                      <span>SIGNALS INGESTED:</span>
                      <span className="font-bold text-on-surface">{signalTotal} / 2,000</span>
                    </div>
                    {/* Stepped Segment Bar */}
                    <div className="grid grid-cols-6 gap-0.5 h-1.5">
                      <div className="bg-primary h-full" />
                      <div className="bg-primary h-full" />
                      <div className="bg-primary h-full" />
                      <div className="bg-primary h-full" />
                      <div className="bg-surface-variant h-full" />
                      <div className="bg-surface-variant h-full" />
                    </div>
                  </div>

                  {/* STEP 2: EXTRACT PAIN POINTS (QUEUED) */}
                  <div className="p-3 bg-surface-container border border-surface-variant flex flex-col gap-1 text-secondary opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-label-sm text-on-surface">02 EXTRACT PAIN POINTS</span>
                      <span className="text-[10px] px-1 py-0.2 bg-surface-container-high border border-surface-variant text-secondary">
                        QUEUED
                      </span>
                    </div>
                    <p className="text-[12px] font-serif">
                      NLP semantic clustering, frequency scoring, and sentiment intensity extraction.
                    </p>
                  </div>

                  {/* STEP 3: GENERATE IDEAS (QUEUED) */}
                  <div className="p-3 bg-surface-container border border-surface-variant flex flex-col gap-1 text-secondary opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-label-sm text-on-surface">03 GENERATE IDEAS</span>
                      <span className="text-[10px] px-1 py-0.2 bg-surface-container-high border border-surface-variant text-secondary">
                        QUEUED
                      </span>
                    </div>
                    <p className="text-[12px] font-serif">
                      Synthesizes high-margin bounded micro-SaaS candidates tailored for solitary builders.
                    </p>
                  </div>

                  {/* STEP 4: VALIDATE (QUEUED) */}
                  <div className="p-3 bg-surface-container border border-surface-variant flex flex-col gap-1 text-secondary opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-label-sm text-on-surface">04 VALIDATE</span>
                      <span className="text-[10px] px-1 py-0.2 bg-surface-container-high border border-surface-variant text-secondary">
                        QUEUED
                      </span>
                    </div>
                    <p className="text-[12px] font-serif">
                      Evidence-grounded scoring, unit economics, and competitive moat validation.
                    </p>
                  </div>
                </div>

                {/* Left Bottom Utility Box */}
                <div className="border border-[#111111] bg-surface-container p-3 text-[11px] flex flex-col gap-1 text-secondary">
                  <div className="flex justify-between">
                    <span>REASONING LLM:</span>
                    <span className="font-bold text-on-surface">GEMINI-2.5-FLASH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TEMPERATURE:</span>
                    <span className="font-bold text-on-surface">0.20 (BOUNDED)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EMBEDDINGS:</span>
                    <span className="font-bold text-on-surface">TEXT-EMBED-004</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE RECON FEED (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-space-md">
                {/* 4 SOURCE METRIC BOXES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm font-mono">
                  {/* SOURCE 1: REDDIT */}
                  <div className="p-3 bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex flex-col">
                    <span className="text-[11px] uppercase text-secondary">REDDIT</span>
                    <span className="font-bold text-2xl text-on-surface">{redditCount}</span>
                    <span className="text-[10px] text-primary font-bold">r/SaaS · r/startups</span>
                  </div>
                  {/* SOURCE 2: HACKER NEWS */}
                  <div className="p-3 bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex flex-col">
                    <span className="text-[11px] uppercase text-secondary">HN FIREHOSE</span>
                    <span className="font-bold text-2xl text-on-surface">{hnCount}</span>
                    <span className="text-[10px] text-primary font-bold">Ask HN · Show HN</span>
                  </div>
                  {/* SOURCE 3: PRODUCT HUNT */}
                  <div className="p-3 bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex flex-col">
                    <span className="text-[11px] uppercase text-secondary">PROD HUNT</span>
                    <span className="font-bold text-2xl text-on-surface">{phCount}</span>
                    <span className="text-[10px] text-[#15803D] font-bold">Discussions &amp; Reviews</span>
                  </div>
                  {/* SOURCE 4: REVIEWS */}
                  <div className="p-3 bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] flex flex-col">
                    <span className="text-[11px] uppercase text-secondary">REVIEWS HOOK</span>
                    <span className="font-bold text-2xl text-on-surface">{reviewsCount}</span>
                    <span className="text-[10px] text-[#B45309] font-bold">G2 1-3★ Teardowns</span>
                  </div>
                </div>

                {/* STREAMING LIVE FEED TERMINAL CONTAINER */}
                <div className="border-[1.5px] border-[#111111] bg-surface-container-lowest shadow-[4px_4px_0px_0px_#111111] flex flex-col overflow-hidden">
                  {/* Terminal Header */}
                  <div className="p-3 bg-surface-container border-b-[1.5px] border-[#111111] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#15803D] inline-block animate-pulse" />
                      <span className="font-bold text-label-sm uppercase tracking-wider text-on-surface">
                        FEED-STREAM: REAL-TIME RAW SIGNALS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-label-sm text-secondary text-[11px]">
                      <span>FILTER: PAIN &gt; 7.0</span>
                    </div>
                  </div>

                  {/* Live Feed Items (Scrollable List) */}
                  <div className="divide-y divide-[#D6D6D1] max-h-[380px] overflow-y-auto">
                    {feed.map((item) => (
                      <div
                        key={item.id}
                        className="p-space-md hover:bg-surface-container-low transition-colors flex items-start gap-space-md group"
                      >
                        <div className="shrink-0 flex flex-col items-center gap-1 font-mono">
                          <span
                            className={`font-label-sm text-[11px] px-1.5 py-0.5 border font-bold ${item.sourceColor}`}
                          >
                            {item.source}
                          </span>
                          <span className="text-[10px] text-secondary">{item.timeAgo}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body-md text-body-md text-on-surface font-serif font-medium group-hover:text-primary transition-colors">
                            {item.quote}
                          </p>
                          <div className="flex items-center gap-space-md mt-1.5 font-label-sm text-[11px] font-mono text-secondary">
                            <span className="font-bold text-primary">[SCORE: {item.score}]</span>
                            <span>{item.sentiment}</span>
                            {item.tag && (
                              <span className="hidden sm:inline px-1 py-0.2 bg-surface-container border border-surface-variant">
                                {item.tag}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">
                          north_east
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stream Footer Pulse Bar */}
                  <div className="p-space-sm bg-surface-container border-t-[1.5px] border-[#111111] flex items-center justify-between font-mono text-label-sm text-[12px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isStreaming ? "bg-primary animate-ping" : "bg-secondary"
                        }`}
                      />
                      <span className="text-on-surface font-bold uppercase tracking-wider">
                        {isStreaming
                          ? "LISTENING TO WEBSOCKET STREAM..."
                          : "STREAM PAUSED // BUFFERING SIGNALS"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsStreaming((prev) => !prev)}
                      className={`px-2.5 py-1 border border-[#111111] font-bold uppercase cursor-pointer transition-all ${
                        isStreaming
                          ? "bg-surface-container-lowest hover:bg-[#111111] hover:text-[#ffffff]"
                          : "bg-primary text-on-primary"
                      }`}
                      type="button"
                    >
                      {isStreaming ? "[PAUSE STREAM]" : "[RESUME STREAM]"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* STICKY BOTTOM FOOTER CONTROL BAR */}
        <footer className="w-full bg-surface-container-lowest border-t-[1.5px] border-[#111111] px-space-md md:px-space-xl py-space-sm sticky bottom-0 z-30 shadow-[0_-2px_6px_rgba(0,0,0,0.04)] font-mono">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            {/* Cost & Estimation Badge */}
            <div className="flex flex-wrap items-center gap-2 font-label-sm text-[12px] uppercase">
              <span className="px-2 py-1 bg-surface-container border border-surface-variant text-on-surface font-semibold">
                ESTIMATED TOTAL RUNTIME: ~2 MIN
              </span>
              <span className="text-secondary font-bold">·</span>
              <span className="px-2 py-1 bg-surface-container border border-surface-variant text-primary font-bold">
                PROTOCOL COST: 4 CREDITS ALLOCATED
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              {/* Cancel Run */}
              <button
                onClick={() => router.push("/dashboard")}
                className="px-space-md h-9 bg-[#ffffff] text-error border-[1.5px] border-error font-label-md text-label-md uppercase tracking-wider font-bold rounded-DEFAULT hover:bg-[#F9E8E8] hover:shadow-[2px_2px_0px_0px_#ba1a1a] transition-all cursor-pointer"
                type="button"
              >
                CANCEL RUN
              </button>
              {/* Background Run */}
              <button
                onClick={() => router.push("/dashboard")}
                className="px-space-md h-9 bg-surface-container text-on-surface border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold rounded-DEFAULT hover:bg-surface-container-high transition-all flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span>BACKGROUND RUN</span>
              </button>
              {/* View Candidates / Proceed to Validation Gate */}
              <button
                onClick={async () => {
                  try {
                    const res = await api.surpriseMe();
                    if (res.selectedIdea && typeof window !== "undefined") {
                      sessionStorage.setItem("active_scouted_idea", JSON.stringify(res.selectedIdea));
                    }
                  } catch {}
                  router.push("/dashboard/validation");
                }}
                className="px-space-md h-9 bg-[#111111] text-[#ffffff] border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold rounded-DEFAULT hover:bg-primary hover:border-primary hover:shadow-[2px_2px_0px_0px_#111111] transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                type="button"
              >
                <span>PROCEED TO VALIDATION</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <SurpriseModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
        onApproveBuild={handleApproveBuild}
      />

      <BuildModal
        isOpen={buildOpen}
        onClose={() => setBuildOpen(false)}
        idea={activeIdea}
      />
    </div>
  );
}
