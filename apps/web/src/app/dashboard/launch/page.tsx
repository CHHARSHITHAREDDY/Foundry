"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";

export default function LaunchPage() {
  const router = useRouter();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [previewMargin, setPreviewMargin] = useState(45);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://pricewatch-shopify.foundry.live");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadTar = () => {
    const manifest = {
      productionRelease: "BLD-8841",
      companyName: "PriceWatch for Shopify",
      url: "https://pricewatch-shopify.foundry.live",
      deployedAt: new Date().toISOString(),
      sla: "13m 42s",
      files: 86,
      tests: "24/24 pass",
      edgeRegion: "Cloudflare Edge Global (280+ PoPs)",
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pricewatch-shopify-production-dist.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* Main Container */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Header */}
        <DashboardHeader
          currentBreadcrumb="Launch Delivery // PriceWatch"
          onOpenCommandPalette={() => setPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
        />

        {/* Launch Body */}
        <main className="w-full pt-14 flex-1 bg-surface">
          <div className="flex flex-col w-full p-space-md md:p-space-lg lg:p-space-xl max-w-[1440px] mx-auto gap-space-lg">
            {/* 1. TELEMETRY STRIP & HEADER BADGES */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-variant">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                <span className="text-on-surface font-semibold">Workspace</span>
                <span>//</span>
                <span>Syndicate-01</span>
                <span>/</span>
                <span>Companies</span>
                <span>/</span>
                <span className="text-on-surface font-semibold">PriceWatch_for_Shopify</span>
                <span>/</span>
                <span className="text-primary font-bold">#BLD-8841</span>
                <span className="text-outline-variant">·</span>
                <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface font-bold">
                  STAGE 07: DEPLOY [PASSED]
                </span>
              </div>
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest border border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                  <span className="w-2 h-2 rounded-none bg-[#15803D] animate-pulse"></span>
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                    LIVE IN PRODUCTION // SSL ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* 2. HERO CELEBRATION UNIT */}
            <div className="flex flex-col items-center text-center my-space-md gap-space-md max-w-4xl mx-auto">
              {/* Ember Mascot Display */}
              <div className="relative inline-flex flex-col items-center">
                <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-md shadow-[4px_4px_0px_0px_#111111] relative">
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary border border-[#111111]"></span>
                  <pre className="font-label-md text-label-md font-bold text-on-surface tracking-wider leading-none select-none">
{`  \\ [ · _ · ] /
    (  ___  )  
     |     |   `}
                  </pre>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-container border border-[#111111]">
                  <span className="w-1.5 h-1.5 bg-primary"></span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wider">
                    EMBER // DEPLOYMENT VERIFIED
                  </span>
                </div>
              </div>

              <h1 className="font-display text-display text-on-surface tracking-tight mt-space-xs">
                Your company is ready.
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
                <span className="font-semibold text-on-surface">PriceWatch for Shopify</span> was compiled, verified, and deployed to global edge infrastructure in{" "}
                <span className="font-label-md text-label-md text-primary font-bold">13 minutes, 42 seconds</span>.
              </p>
            </div>

            {/* 3. LIVE URL CALLOUT BAR */}
            <div className="w-full bg-surface-container-lowest border-2 border-[#111111] p-space-md shadow-[4px_4px_0px_0px_#111111] flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm min-w-0">
                <div className="w-7 h-7 bg-[#111111] text-surface-container-lowest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                    Edge Canonical Host
                  </span>
                  <a
                    className="font-label-lg text-label-lg md:text-[18px] text-tertiary underline decoration-2 underline-offset-4 font-bold truncate hover:text-primary transition-colors"
                    href="https://pricewatch-shopify.foundry.live"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    https://pricewatch-shopify.foundry.live
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-surface-variant font-label-sm text-label-sm text-secondary">
                  <span className="w-1.5 h-1.5 bg-[#15803D]"></span>
                  <span>200 OK</span>
                  <span className="text-surface-variant">|</span>
                  <span>LATENCY 24ms</span>
                  <span className="text-surface-variant">|</span>
                  <span>CLOUDFLARE EDGE</span>
                </div>

                <button
                  onClick={handleCopyUrl}
                  className="h-9 px-3 bg-surface-container border border-[#111111] hover:bg-surface-container-high transition-all shadow-[2px_2px_0px_0px_#111111] flex items-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface">content_copy</span>
                  <span className="font-label-md text-label-md uppercase font-bold text-on-surface">
                    {copiedUrl ? "COPIED!" : "COPY"}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary ml-1">[⌘C]</span>
                </button>

                <a
                  href="https://pricewatch-shopify.foundry.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 bg-primary text-on-primary border border-on-surface hover:bg-primary-container transition-all shadow-[2px_2px_0px_0px_#ca4b00] flex items-center gap-1.5 font-label-md text-label-md uppercase font-bold"
                >
                  <span>OPEN LIVE APP</span>
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </a>
              </div>
            </div>

            {/* 4. THREE STAT TILES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {/* Tile 1 */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-md shadow-[3px_3px_0px_0px_#111111] relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-widest">
                    Built In
                  </span>
                  <span className="w-2 h-2 bg-primary"></span>
                </div>
                <div className="my-space-sm">
                  <div className="font-headline-lg text-headline-lg text-on-surface">13:42</div>
                  <p className="font-label-sm text-label-sm text-secondary mt-1 tracking-tight">
                    4.2m under SLA envelope
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-0.5 h-1 bg-surface-container-high">
                  <div className="bg-primary h-full col-span-5"></div>
                </div>
              </div>

              {/* Tile 2 */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-md shadow-[3px_3px_0px_0px_#111111] relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-widest">
                    Files
                  </span>
                  <span className="w-2 h-2 bg-[#111111]"></span>
                </div>
                <div className="my-space-sm">
                  <div className="font-headline-lg text-headline-lg text-on-surface">86</div>
                  <p className="font-label-sm text-label-sm text-secondary mt-1 tracking-tight">
                    Next.js App Router + Prisma
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-0.5 h-1 bg-surface-container-high">
                  <div className="bg-[#111111] h-full col-span-6"></div>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-space-md shadow-[3px_3px_0px_0px_#111111] relative flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-widest">
                    Tests
                  </span>
                  <span className="w-2 h-2 bg-[#15803D]"></span>
                </div>
                <div className="my-space-sm">
                  <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-2">
                    <span>24</span>
                    <span className="font-label-sm text-label-sm text-[#15803D] uppercase font-bold">
                      Passing
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-secondary mt-1 tracking-tight">
                    100% E2E Playwright coverage
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-0.5 h-1 bg-surface-container-high">
                  <div className="bg-[#15803D] h-full col-span-6"></div>
                </div>
              </div>
            </div>

            {/* 5. FRAMED LIVE SITE PREVIEW */}
            <div className="flex flex-col w-full bg-surface-container-lowest border-2 border-[#111111] shadow-[5px_5px_0px_0px_#111111]">
              {/* Mockup Chrome Header */}
              <div className="h-10 px-space-md bg-surface-container border-b-2 border-[#111111] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#ba1a1a] border border-[#111111]"></span>
                  <span className="w-2.5 h-2.5 bg-[#ca4b00] border border-[#111111]"></span>
                  <span className="w-2.5 h-2.5 bg-[#15803D] border border-[#111111]"></span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 border border-[#111111] font-label-sm text-label-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span className="font-mono">https://pricewatch-shopify.foundry.live</span>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                </div>
              </div>

              {/* Framed Application Interior */}
              <div className="p-space-md md:p-space-lg bg-surface flex flex-col gap-space-md">
                {/* Simulated In-App Navigation Bar */}
                <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 bg-primary text-on-primary font-bold flex items-center justify-center font-headline-sm">
                      PW
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                        PriceWatch for Shopify
                      </h3>
                      <span className="font-label-sm text-label-sm text-secondary">Store: apex-merch.myshopify.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-600 font-label-sm text-label-sm font-bold">
                      ACTIVE STOREFRONT SYNC
                    </span>
                  </div>
                </div>

                {/* Banner & Metric Grid */}
                <div className="p-space-sm bg-surface-container-low border border-primary text-on-surface flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-primary">
                      AUTOMATED MARGIN GUARDRAIL ACTIVE
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      All catalog adjustments respect your 45% floor threshold. 4 price changes intercepted and normalized in the last 24h.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div className="p-space-sm bg-surface-container-lowest border border-on-surface">
                    <span className="font-label-sm text-label-sm text-secondary uppercase block">Gross Margin Yield</span>
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">+$18,420</span>
                    <span className="font-label-sm text-label-sm text-[#15803D] font-bold block mt-0.5">↑ 4.2% delta</span>
                  </div>

                  <div className="p-space-sm bg-surface-container-lowest border border-on-surface">
                    <span className="font-label-sm text-label-sm text-secondary uppercase block">Monitored SKUs</span>
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">420 SKUs</span>
                    <span className="font-label-sm text-label-sm text-secondary block mt-0.5">100% catalog coverage</span>
                  </div>

                  <div className="p-space-sm bg-surface-container-lowest border border-on-surface">
                    <span className="font-label-sm text-label-sm text-secondary uppercase block">Floor Violations</span>
                    <span className="font-headline-md text-headline-md font-bold text-primary">12 Protected</span>
                    <span className="font-label-sm text-label-sm text-secondary block mt-0.5">Zero margin drift</span>
                  </div>
                </div>

                {/* Interactive In-App Slider */}
                <div className="p-space-md bg-surface-container-lowest border-2 border-on-surface shadow-[3px_3px_0px_0px_#111111]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-md text-label-md font-bold uppercase text-on-surface">
                      Global Store Margin Threshold
                    </span>
                    <span className="font-label-md text-label-md font-bold text-primary px-2 py-0.5 bg-surface-container border border-on-surface">
                      {previewMargin}% TARGET FLOOR
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    value={previewMargin}
                    onChange={(e) => setPreviewMargin(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-surface-container border border-on-surface cursor-pointer"
                  />
                  <div className="flex justify-between font-label-sm text-label-sm text-secondary mt-1">
                    <span>15% (Minimum Liquidation)</span>
                    <span>85% (High Luxury Margin)</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame Footer */}
              <div className="px-space-md py-2 bg-surface-container-high border-t-2 border-[#111111] flex flex-wrap items-center justify-between font-label-sm text-label-sm text-secondary">
                <span>FRAME: 100% RESPONSIVE · SSL CERT: DIGICERT ED25519</span>
                <span className="text-on-surface font-semibold">REACT 18 HYDRATED · EDGE RUNTIME</span>
              </div>
            </div>

            {/* 6. POST-LAUNCH ACTION SUITE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-space-md border-t border-surface-variant">
              <button
                onClick={handleDownloadTar}
                className="p-space-md bg-surface-container-lowest border-2 border-on-surface hover:bg-surface-container shadow-[3px_3px_0px_0px_#111111] transition-all flex flex-col justify-between text-left"
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">download</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">.tar.gz</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Download Artifacts</span>
                <span className="font-label-sm text-label-sm text-secondary mt-1">
                  Full codebase, Prisma schemas, and Playwright tests.
                </span>
              </button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-space-md bg-surface-container-lowest border-2 border-on-surface hover:bg-surface-container shadow-[3px_3px_0px_0px_#111111] transition-all flex flex-col justify-between text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-on-surface text-[24px]">terminal</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">GITHUB</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Repository</span>
                <span className="font-label-sm text-label-sm text-secondary mt-1">
                  View commits, PRs, and GitHub Actions CI pipelines.
                </span>
              </a>

              <button
                onClick={() => router.push("/dashboard/build")}
                className="p-space-md bg-surface-container-lowest border-2 border-on-surface hover:bg-surface-container shadow-[3px_3px_0px_0px_#111111] transition-all flex flex-col justify-between text-left"
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">history</span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">TELEMETRY</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Build Telemetry</span>
                <span className="font-label-sm text-label-sm text-secondary mt-1">
                  Inspect terminal output and SWC compiler logs.
                </span>
              </button>

              <button
                onClick={() => router.push("/dashboard/new")}
                className="p-space-md bg-primary text-on-primary border-2 border-on-surface hover:bg-primary-container shadow-[3px_3px_0px_0px_#ca4b00] transition-all flex flex-col justify-between text-left"
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-on-primary text-[24px]">add_circle</span>
                  <span className="font-label-sm text-label-sm text-on-primary uppercase font-bold">GENESIS</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-primary">Launch Next Company</span>
                <span className="font-label-sm text-label-sm text-on-primary/80 mt-1">
                  Initiate Genesis Protocol for another micro-SaaS venture.
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(path) => {
          setPaletteOpen(false);
          if (path === "new") router.push("/dashboard/new");
          if (path === "scout") router.push("/dashboard/scout");
          if (path === "validation") router.push("/dashboard/validation");
          if (path === "build") router.push("/dashboard/build");
          if (path === "launch") router.push("/dashboard/launch");
          if (path === "notifications") router.push("/dashboard/notifications");
          if (path === "billing") router.push("/dashboard?tab=billing");
          if (path === "settings") router.push("/dashboard?tab=settings");
        }}
      />

      {/* Notifications Popover */}
      <NotificationsPopover
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
