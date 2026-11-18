"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";

interface FullNotification {
  id: string;
  section: "today" | "earlier";
  category: "approvals" | "builds" | "tasks" | "billing";
  title: string;
  timestamp: string;
  description: string;
  tags: string[];
  unread: boolean;
  statusBadge?: string;
  metricBar?: boolean;
  primaryAction?: {
    label: string;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
  };
  icon: string;
  iconBg: string;
  iconColor: string;
}

const INITIAL_ARCHIVE: FullNotification[] = [
  // SECTION A: TODAY
  {
    id: "notif-full-1",
    section: "today",
    category: "approvals",
    title: "Production Domain Delegation: Vesper DNS",
    timestamp: "18M AGO",
    description: "Production domain zone records awaiting cryptographic manual signature.",
    tags: ["VESPER_IO", "DNSSEC_STAGED", "TTL_300"],
    unread: true,
    statusBadge: "BLOCKING APPROVAL",
    primaryAction: { label: "Approve Records", icon: "verified_user" },
    secondaryAction: { label: "Inspect Zone File" },
    icon: "shield",
    iconBg: "bg-[#FFF3E0]",
    iconColor: "text-primary",
  },
  {
    id: "notif-full-2",
    section: "today",
    category: "builds",
    title: "Autonomous Build Passed: Codex AI #03",
    timestamp: "42M AGO",
    description: "Codex AI sprint #03 compiled and ready for deployment preview.",
    tags: ["NEXTJS_EDGE", "SANDBOX_OK", "LINT_CLEAN"],
    unread: true,
    statusBadge: "BUILD SUCCESS",
    primaryAction: { label: "Deploy Preview", icon: "rocket_launch" },
    secondaryAction: { label: "Artifacts" },
    icon: "check_circle",
    iconBg: "bg-[#E8F5E9]",
    iconColor: "text-[#15803D]",
  },
  {
    id: "notif-full-3",
    section: "today",
    category: "billing",
    title: "Credit Reserve Warning: 184 Credits Remaining",
    timestamp: "2H AGO",
    description: "Active autonomous jobs may pause upon credit exhaustion.",
    tags: ["BURN_RATE_12/D", "CRITICAL_FLOOR_50"],
    unread: true,
    statusBadge: "CREDIT ALERT",
    metricBar: true,
    primaryAction: { label: "Top Up Compute", icon: "add_card" },
    icon: "battery_alert",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
  },
  {
    id: "notif-full-4",
    section: "today",
    category: "tasks",
    title: "Weekly Newsletter Dispatched: Dispatch Press #142",
    timestamp: "3H AGO",
    description: "Dispatch issue #142 sent to 1,280 subscribers via archival batch pipeline.",
    tags: ["SENDGRID_HOOK", "1,280_DELIVERED", "BOUNCE_0.02%"],
    unread: false,
    statusBadge: "DISPATCHED",
    secondaryAction: { label: "Delivery Log" },
    icon: "terminal",
    iconBg: "bg-surface-container",
    iconColor: "text-on-surface",
  },

  // SECTION B: EARLIER THIS WEEK
  {
    id: "notif-full-5",
    section: "earlier",
    category: "builds",
    title: "Deploy Failed: Pulse Wire WebSocket Bridge",
    timestamp: "YESTERDAY 16:40",
    description: "npm build socket hangup on step 4/7: core/runtime-engine.",
    tags: ["NODE_22", "BUILD_FAIL_STEP_4/7"],
    unread: false,
    statusBadge: "FAIL_LOGGED",
    primaryAction: { label: "Retry Pipeline", icon: "refresh" },
    secondaryAction: { label: "View Trace" },
    icon: "cancel",
    iconBg: "bg-error-container",
    iconColor: "text-error",
  },
  {
    id: "notif-full-6",
    section: "earlier",
    category: "approvals",
    title: "OAuth Scope Expansion Approved",
    timestamp: "NOV 12 10:15",
    description: "User identity permission grant logged by administrator.",
    tags: ["GITHUB_APP", "READ_WRITE_ISSUES"],
    unread: false,
    statusBadge: "SETTLED // OK",
    icon: "lock_open",
    iconBg: "bg-surface-container",
    iconColor: "text-secondary",
  },
  {
    id: "notif-full-7",
    section: "earlier",
    category: "tasks",
    title: "Customer Support Ingestion Pipeline",
    timestamp: "NOV 11 14:02",
    description: "Synchronized 412 tickets to knowledge embeddings database.",
    tags: ["DISCORD_BOT", "VECTOR_SYNC"],
    unread: false,
    statusBadge: "COMPLETE",
    icon: "sync",
    iconBg: "bg-surface-container",
    iconColor: "text-secondary",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<FullNotification[]>(INITIAL_ARCHIVE);
  const [activeFilter, setActiveFilter] = useState<"all" | "approvals" | "builds" | "tasks" | "billing">("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showEmptyStatePreview, setShowEmptyStatePreview] = useState(false);

  const unreadCount = items.filter((i) => i.unread).length;

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  };

  const filteredItems = items.filter((i) => {
    if (activeFilter === "all") return true;
    return i.category === activeFilter;
  });

  const todayItems = filteredItems.filter((i) => i.section === "today");
  const earlierItems = filteredItems.filter((i) => i.section === "earlier");

  const filterCounts = {
    all: items.length,
    approvals: items.filter((i) => i.category === "approvals").length,
    builds: items.filter((i) => i.category === "builds").length,
    tasks: items.filter((i) => i.category === "tasks").length,
    billing: items.filter((i) => i.category === "billing").length,
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab="overview"
        onTabChange={(tab) => router.push(`/dashboard?tab=${tab}`)}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={(c) => router.push(`/dashboard?company=${c}`)}
      />

      {/* 2. Main Content Canvas */}
      <div className="pl-60 min-h-screen flex flex-col">
        <DashboardHeader
          currentBreadcrumb="Notifications"
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setPopoverOpen((p) => !p)}
        />

        <NotificationsPopover
          isOpen={popoverOpen}
          onClose={() => setPopoverOpen(false)}
        />

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(path) => {
            if (path === "new") router.push("/dashboard/new");
            if (path === "scout") router.push("/dashboard/scout");
            if (path === "billing") router.push("/dashboard?tab=billing");
          }}
        />

        <main className="w-full pt-14 flex-1 bg-surface pb-16">
          <div className="flex flex-col w-full">
            <div className="w-full max-w-[1360px] mx-auto px-space-md lg:px-space-xl py-space-lg flex flex-col gap-space-lg">
              {/* System Telemetry Overline */}
              <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs pb-space-xs border-b border-[#111111]">
                <div className="flex items-center gap-space-xs flex-wrap font-label-sm text-label-sm uppercase tracking-wider text-secondary font-mono">
                  <span className="text-on-surface font-bold">[REGISTRY</span>
                  <span>//</span>
                  <span>AUDIT_FEED</span>
                  <span>//</span>
                  <span className="text-primary font-bold">EVENT_STREAM]</span>
                </div>
                <div className="flex items-center gap-space-md font-label-sm text-label-sm uppercase tracking-wider font-mono text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#15803D] inline-block animate-pulse" />
                    STREAM_STATUS: LIVE
                  </span>
                  <span className="hidden md:inline">|</span>
                  <span className="hidden md:inline">POLL_INTERVAL: 15s</span>
                  <span>|</span>
                  <button
                    onClick={() => setShowEmptyStatePreview((prev) => !prev)}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {showEmptyStatePreview ? "[VIEW ACTIVE AUDIT FEED]" : "[PREVIEW CAUGHT-UP STATE]"}
                  </button>
                </div>
              </section>

              {/* Page Title & Global Actions */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b-[1.5px] border-[#111111] pb-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <h1 className="font-headline-lg text-headline-lg font-bold font-serif tracking-tight text-on-surface">
                      Notifications
                    </h1>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-primary text-on-primary font-label-sm text-label-sm font-bold tracking-wider rounded-DEFAULT shadow-[1.5px_1.5px_0px_0px_#111111] font-mono">
                        {String(unreadCount).padStart(2, "0")} UNREAD
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant font-serif">
                    Empirical audit trail, autonomous pipeline dispatches, and cryptographic gatekeeper approvals.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={handleMarkAllRead}
                    className="h-9 px-space-md bg-surface-container hover:bg-[#111111] text-on-surface hover:text-[#ffffff] border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold transition-all shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-1.5 font-mono"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    <span>Mark All as Read</span>
                  </button>
                </div>
              </div>

              {/* Filter & Scope Controls */}
              <div className="flex flex-wrap items-center gap-2 font-mono">
                {(
                  [
                    { id: "all", label: "All", count: filterCounts.all },
                    { id: "approvals", label: "Approvals", count: filterCounts.approvals },
                    { id: "builds", label: "Builds", count: filterCounts.builds },
                    { id: "tasks", label: "Tasks", count: filterCounts.tasks },
                    { id: "billing", label: "Billing", count: filterCounts.billing },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`h-8 px-3 text-label-sm uppercase tracking-wider font-bold border-[1.5px] border-[#111111] transition-all cursor-pointer flex items-center gap-2 ${
                      activeFilter === tab.id
                        ? "bg-[#111111] text-[#ffffff] shadow-[2px_2px_0px_0px_#111111]"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1 py-0.2 text-[10px] border ${
                        activeFilter === tab.id
                          ? "bg-primary border-primary text-[#ffffff]"
                          : "bg-surface border-surface-variant text-secondary"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* EMPTY STATE VIEW */}
              {(showEmptyStatePreview || filteredItems.length === 0) ? (
                <div className="w-full my-space-md p-space-xl bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] flex flex-col items-center justify-center text-center">
                  {/* Mascot Illustration: Ember with tea */}
                  <div className="relative w-28 h-28 mb-space-md flex items-center justify-center">
                    <svg
                      className="w-24 h-24 stroke-[#111111] fill-none"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      strokeWidth="2"
                      viewBox="0 0 100 100"
                    >
                      {/* Antenna */}
                      <line x1="50" x2="50" y1="12" y2="24" />
                      <circle cx="50" cy="9" fill="#111111" r="3" />
                      {/* Boxy Robot Head */}
                      <rect
                        fill="#FFFFFF"
                        height="48"
                        stroke="#111111"
                        strokeWidth="2.5"
                        width="56"
                        x="22"
                        y="24"
                      />
                      {/* Ear bolts */}
                      <rect fill="#111111" height="12" width="4" x="18" y="42" />
                      <rect fill="#111111" height="12" width="4" x="78" y="42" />
                      {/* Eyes (Dot Eyes) */}
                      <circle cx="38" cy="42" fill="#111111" r="3.5" />
                      <circle cx="62" cy="42" fill="#111111" r="3.5" />
                      {/* Subtle Relaxed Mouth */}
                      <line strokeWidth="2" x1="42" x2="58" y1="56" y2="56" />
                      {/* Tea Cup / Steaming Plate in hand */}
                      <path
                        d="M 66 64 L 66 70 C 66 74 76 74 76 70 L 76 64 Z"
                        fill="#F0EEE8"
                        stroke="#111111"
                        strokeWidth="1.5"
                      />
                      <path d="M 76 66 C 79 66 79 68 76 69" stroke="#111111" strokeWidth="1.5" />
                      <path
                        d="M 69 61 Q 71 58 69 55"
                        stroke="#ca4b00"
                        strokeDasharray="1 1"
                        strokeWidth="1"
                      />
                      <path
                        d="M 73 61 Q 75 58 73 55"
                        stroke="#ca4b00"
                        strokeDasharray="1 1"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>

                  {/* Mascot Status Indicator Pill */}
                  <div className="mb-space-sm px-2 py-0.5 bg-[#FFF3E0] border border-[#111111] font-label-sm text-label-sm uppercase font-mono font-bold text-primary flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#ca4b00]">
                    <span className="w-1.5 h-1.5 bg-primary" />
                    <span>EMBER_IDLE</span>
                  </div>

                  {/* Typography */}
                  <h2 className="font-headline-md text-headline-md font-serif text-on-surface mb-space-xs font-bold">
                    You are all caught up
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-md font-serif">
                    No unread alerts or pending approvals across your 5 autonomous companies. Ember is
                    continuously monitoring all background pipelines.
                  </p>

                  {/* Monospace Telemetry String */}
                  <div className="px-space-md py-1 bg-surface-container border border-[#111111] font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-space-md font-mono">
                    ALL CHANNELS CLEAR // 0 PENDING ACTIONS
                  </div>

                  {/* Secondary CTA */}
                  <button
                    onClick={() => {
                      setShowEmptyStatePreview(false);
                      router.push("/dashboard/scout");
                    }}
                    className="h-9 px-space-md bg-surface text-on-surface border-[1.5px] border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold hover:bg-[#111111] hover:text-[#ffffff] transition-all shadow-[2px_2px_0px_0px_#111111] cursor-pointer flex items-center gap-1.5 font-mono"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">radar</span>
                    <span>Launch Heuristic Scout</span>
                  </button>
                </div>
              ) : (
                /* NOTIFICATION AUDIT STREAM SECTIONS */
                <div className="flex flex-col gap-space-xl">
                  {/* SECTION A: TODAY */}
                  {todayItems.length > 0 && (
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center gap-space-sm border-b border-[#111111] pb-1">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-on-surface font-mono">
                          // TODAY — 14 NOV 2026
                        </span>
                        <span className="text-secondary font-mono text-label-sm">
                          ({todayItems.length} records)
                        </span>
                      </div>

                      <div className="border-[1.5px] border-[#111111] divide-y-[1.5px] divide-[#111111] bg-surface-container-lowest shadow-[3px_3px_0px_0px_#111111]">
                        {todayItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-space-md transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md ${
                              item.unread
                                ? item.category === "approvals"
                                  ? "bg-surface-container-lowest border-l-4 border-primary"
                                  : "bg-surface-container-lowest border-l-4 border-[#111111]"
                                : "bg-surface-container-low/50 hover:bg-surface-container-low"
                            }`}
                          >
                            <div className="flex items-start gap-space-md flex-1">
                              {/* Icon Block */}
                              <div
                                className={`w-9 h-9 shrink-0 ${item.iconBg} border border-[#111111] flex items-center justify-center ${item.iconColor} shadow-[1.5px_1.5px_0px_0px_#111111]`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {item.icon}
                                </span>
                              </div>

                              {/* Content & Metadata */}
                              <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3
                                    className={`font-headline-sm text-[16px] leading-tight text-on-surface ${
                                      item.unread ? "font-bold font-serif" : "font-medium"
                                    }`}
                                  >
                                    {item.title}
                                  </h3>
                                  {item.statusBadge && (
                                    <span
                                      className={`px-1.5 py-0.2 font-label-sm text-[10px] font-mono font-bold tracking-wider border ${
                                        item.category === "approvals"
                                          ? "bg-[#FFF3E0] border-primary text-primary"
                                          : item.category === "builds"
                                          ? "bg-[#E8F5E9] border-[#15803D] text-[#15803D]"
                                          : "bg-surface border-surface-variant text-secondary"
                                      }`}
                                    >
                                      {item.statusBadge}
                                    </span>
                                  )}
                                </div>

                                <p className="font-body-sm text-body-sm text-on-surface-variant font-serif">
                                  {item.description}
                                </p>

                                {/* Tags + Timestamp */}
                                <div className="flex items-center gap-space-sm flex-wrap pt-0.5 font-label-sm text-[11px] font-mono text-secondary">
                                  <span className="font-bold text-on-surface">{item.timestamp}</span>
                                  <span>·</span>
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1 py-0.2 bg-surface-container border border-surface-variant"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Metric bar if billing alert */}
                                {item.metricBar && (
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="grid grid-cols-6 gap-0.5 w-36 h-2">
                                      <div className="bg-primary h-full" />
                                      <div className="bg-primary h-full" />
                                      <div className="bg-primary h-full" />
                                      <div className="bg-primary h-full" />
                                      <div className="bg-surface-variant h-full" />
                                      <div className="bg-surface-variant h-full" />
                                    </div>
                                    <span className="font-mono text-label-sm text-primary font-bold">
                                      184 / 300 CREDITS
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 md:self-center">
                              {item.primaryAction && (
                                <button
                                  onClick={() => alert(`Action executed: ${item.primaryAction?.label}`)}
                                  className="h-8 px-3 bg-[#111111] hover:bg-primary-container text-[#ffffff] font-label-sm text-label-sm uppercase font-bold tracking-wider border border-[#111111] transition-all flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#111111] cursor-pointer font-mono"
                                  type="button"
                                >
                                  {item.primaryAction.icon && (
                                    <span className="material-symbols-outlined text-[14px]">
                                      {item.primaryAction.icon}
                                    </span>
                                  )}
                                  <span>{item.primaryAction.label}</span>
                                </button>
                              )}
                              {item.secondaryAction && (
                                <button
                                  onClick={() => alert(`Opening: ${item.secondaryAction?.label}`)}
                                  className="h-8 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase font-bold tracking-wider border border-[#111111] transition-all cursor-pointer font-mono"
                                  type="button"
                                >
                                  {item.secondaryAction.label}
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleRead(item.id)}
                                title={item.unread ? "Mark as read" : "Mark as unread"}
                                className="p-1.5 text-secondary hover:text-on-surface cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {item.unread ? "mark_email_read" : "mark_email_unread"}
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION B: EARLIER THIS WEEK */}
                  {earlierItems.length > 0 && (
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center gap-space-sm border-b border-[#111111] pb-1">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-on-surface font-mono">
                          // EARLIER THIS WEEK
                        </span>
                        <span className="text-secondary font-mono text-label-sm">
                          ({earlierItems.length} records)
                        </span>
                      </div>

                      <div className="border-[1.5px] border-[#111111] divide-y-[1.5px] divide-[#111111] bg-surface-container-lowest shadow-[3px_3px_0px_0px_#111111]">
                        {earlierItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-space-md transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low/50 hover:bg-surface-container-low opacity-90 hover:opacity-100"
                          >
                            <div className="flex items-start gap-space-md flex-1">
                              {/* Icon Block */}
                              <div
                                className={`w-9 h-9 shrink-0 ${item.iconBg} border border-[#111111] flex items-center justify-center ${item.iconColor} shadow-[1.5px_1.5px_0px_0px_#111111]`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {item.icon}
                                </span>
                              </div>

                              {/* Content & Metadata */}
                              <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-headline-sm text-[16px] leading-tight text-on-surface font-medium">
                                    {item.title}
                                  </h3>
                                  {item.statusBadge && (
                                    <span
                                      className={`px-1.5 py-0.2 font-label-sm text-[10px] font-mono font-bold tracking-wider border ${
                                        item.category === "builds"
                                          ? "bg-error-container border-error text-error"
                                          : "bg-surface border-surface-variant text-secondary"
                                      }`}
                                    >
                                      {item.statusBadge}
                                    </span>
                                  )}
                                </div>

                                <p className="font-body-sm text-body-sm text-on-surface-variant font-serif">
                                  {item.description}
                                </p>

                                <div className="flex items-center gap-space-sm flex-wrap pt-0.5 font-label-sm text-[11px] font-mono text-secondary">
                                  <span className="font-bold text-on-surface">{item.timestamp}</span>
                                  <span>·</span>
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1 py-0.2 bg-surface-container border border-surface-variant"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 md:self-center">
                              {item.primaryAction && (
                                <button
                                  onClick={() => alert(`Retrying: ${item.title}`)}
                                  className="h-8 px-3 bg-[#111111] hover:bg-primary-container text-[#ffffff] font-label-sm text-label-sm uppercase font-bold tracking-wider border border-[#111111] transition-all flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#111111] cursor-pointer font-mono"
                                  type="button"
                                >
                                  {item.primaryAction.icon && (
                                    <span className="material-symbols-outlined text-[14px]">
                                      {item.primaryAction.icon}
                                    </span>
                                  )}
                                  <span>{item.primaryAction.label}</span>
                                </button>
                              )}
                              {item.secondaryAction && (
                                <button
                                  onClick={() => alert(`Opening trace: ${item.title}`)}
                                  className="h-8 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase font-bold tracking-wider border border-[#111111] transition-all cursor-pointer font-mono"
                                  type="button"
                                >
                                  {item.secondaryAction.label}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
