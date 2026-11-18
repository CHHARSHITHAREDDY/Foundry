"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { TaskCard, TaskItem } from "@/components/tasks/task-card";
import { NewTaskDialog, NewTaskPayload } from "@/components/tasks/new-task-dialog";
import { api } from "@/lib/api-client";

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "t-1",
    code: "#043",
    title: "Shopify GraphQL Webhook Exponential Backoff & Retry Queue",
    description: "Incorporate Redis BullMQ retry queue with jittered exponential delay on 429 Shopify Admin rate limits.",
    status: "RUNNING",
    type: "FEATURE",
    priority: "P0",
    credits: 3,
    progress: 68,
    timeElapsed: "16m 38s",
    assignedAgent: "Ember-02",
  },
  {
    id: "t-2",
    code: "#042",
    title: "Margin Threshold Breach Email Alert to Merchant Store Owner",
    description: "Send instant transactional email via Resend when gross product margin drops below configured slider floor.",
    status: "NEEDS_APPROVAL",
    type: "FEATURE",
    priority: "P1",
    credits: 2,
    diffStats: { added: 84, removed: 12 },
    assignedAgent: "Ember-01",
  },
  {
    id: "t-3",
    code: "#041",
    title: "Slack Channel Incoming Webhook Integration for Price Drop Notifications",
    description: "Allow merchants to paste Slack incoming webhook URL to broadcast pricing shifts to their internal teams.",
    status: "QUEUED",
    type: "FEATURE",
    priority: "P2",
    credits: 3,
  },
  {
    id: "t-4",
    code: "#040",
    title: "Dual-Thumb Polaris Range Slider Component Ast Patch",
    description: "Replace standard HTML range input with Shopify Polaris themed dual slider with live dollar floor calculation.",
    status: "DONE",
    type: "FEATURE",
    priority: "P1",
    credits: 3,
    completedAt: "Today 11:20",
    diffStats: { added: 142, removed: 28 },
  },
  {
    id: "t-5",
    code: "#039",
    title: "HMAC Sha256 Webhook Timing Attack Guard",
    description: "Enforce crypto.timingSafeEqual comparison on Shopify webhook headers to prevent timing leaks.",
    status: "DONE",
    type: "BUG",
    priority: "P1",
    credits: 2,
    completedAt: "Today 10:15",
    diffStats: { added: 31, removed: 4 },
  },
  {
    id: "t-6",
    code: "#038",
    title: "Stripe Customer Portal Checkout Session Generator",
    description: "Connect Stripe Billing API for automatic SaaS tiered licensing ($49/mo & $199/mo).",
    status: "QUEUED",
    type: "FEATURE",
    priority: "P2",
    credits: 3,
  },
  {
    id: "t-7",
    code: "#037",
    title: "Night Task: Run Playwright Synthetic E2E Checkout Flow",
    description: "Execute end-to-end checkout assertion simulating 10 concurrent Shopify order webhooks.",
    status: "QUEUED",
    type: "FEATURE",
    priority: "P3",
    credits: 1,
  },
  {
    id: "t-8",
    code: "#036",
    title: "Fix Null Pointer on Missing Shopify Inventory Level ID",
    description: "Handle unmapped SKU variant items in catalog sync worker without throwing unhandled rejection.",
    status: "DONE",
    type: "BUG",
    priority: "P0",
    credits: 2,
    completedAt: "Yesterday",
    diffStats: { added: 12, removed: 6 },
  },
  {
    id: "t-9",
    code: "#035",
    title: "Synthesize 3 Meta Ad Creatives with High-Margin Value Hook",
    description: "Generate ad copy and 1200x630 pixel banners focusing on Shopify profit recovery.",
    status: "DONE",
    type: "MARKETING",
    priority: "P2",
    credits: 2,
    completedAt: "Yesterday",
  },
  {
    id: "t-10",
    code: "#034",
    title: "Legacy REST Webhook Endpoints Deprecation Notice",
    description: "Migrate all legacy REST API calls to 2024-04 GraphQL Admin schema mutations.",
    status: "DONE",
    type: "BUG",
    priority: "P1",
    credits: 2,
    completedAt: "2 days ago",
  },
];

function TasksContent() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "BOARD">("LIST");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch tasks from backend on mount
  useEffect(() => {
    api.getTasks().then((res) => {
      if (res && res.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);
      }
    }).catch(() => {});
  }, []);

  const handleCreateTask = async (payload: NewTaskPayload) => {
    try {
      const created = await api.createTask({
        specification: payload.specification,
        type: payload.type,
        priority: payload.priority,
        credits: payload.estimatedCredits,
        requiresApproval: payload.requiresApproval,
      });
      if (created) {
        setTasks((prev) => [created, ...prev]);
        return;
      }
    } catch {}

    const nextCodeNumber = tasks.length + 35;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      code: `#0${nextCodeNumber}`,
      title: payload.specification.slice(0, 60) + (payload.specification.length > 60 ? "..." : ""),
      description: payload.specification,
      status: "QUEUED",
      type: payload.type,
      priority: payload.priority,
      credits: payload.estimatedCredits,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleApproveTask = async (task: TaskItem) => {
    try {
      await api.approveTask(task.id);
    } catch {}
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "DONE" as const, completedAt: "Just now" } : t))
    );
  };

  const handleCancelTask = async (task: TaskItem) => {
    try {
      await api.cancelTask(task.id);
    } catch {}
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "FAILED" as const } : t))
    );
  };

  const handleRetryTask = async (task: TaskItem) => {
    try {
      await api.retryTask(task.id);
    } catch {}
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "RUNNING" as const, progress: 10 } : t))
    );
  };

  const runningCount = tasks.filter((t) => t.status === "RUNNING").length;
  const queuedCount = tasks.filter((t) => t.status === "QUEUED").length;
  const needsApprovalCount = tasks.filter((t) => t.status === "NEEDS_APPROVAL").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const failedCount = tasks.filter((t) => t.status === "FAILED").length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "RUNNING") return t.status === "RUNNING";
    if (filter === "QUEUED") return t.status === "QUEUED";
    if (filter === "NEEDS_APPROVAL") return t.status === "NEEDS_APPROVAL";
    if (filter === "DONE") return t.status === "DONE";
    if (filter === "FAILED") return t.status === "FAILED";
    return true;
  });

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Left Navigation Sidebar */}
      <DashboardSidebar
        currentTab="overview"
        onTabChange={(tab) => {
          if (tab === "onboarding") router.push("/dashboard");
          if (tab === "overview") router.push("/dashboard");
          if (tab === "billing") router.push("/dashboard?tab=billing");
          if (tab === "settings") router.push("/dashboard?tab=settings");
        }}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => router.push("/dashboard?tab=billing")}
        onSelectCompany={() => router.push("/dashboard/company?company=PriceWatch")}
      />

      {/* 2. Main Shell */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Header */}
        <DashboardHeader
          currentBreadcrumb="PriceWatch / Sprint Tasks Queue"
          onOpenCommandPalette={() => setPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((prev) => !prev)}
        />

        {/* Notifications Drawer */}
        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onNavigate={(path) => {
            setPaletteOpen(false);
            if (path === "build") router.push("/dashboard/build");
            if (path === "review") router.push("/dashboard/review");
            if (path === "company") router.push("/dashboard/company?company=PriceWatch");
          }}
        />

        {/* Content Viewport */}
        <main className="w-full pt-14 flex-1 flex flex-col bg-surface">
          {/* Top Sprint Controls Bar */}
          <div className="bg-surface-container-low border-b-2 border-[#111111] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-on-surface">
                  Sprint Task Backlog &amp; Queue
                </h1>
                <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 bg-primary text-white border border-[#111111]">
                  SPRINT 04 ACTIVE
                </span>
              </div>
              <p className="font-serif text-xs text-secondary">
                Autonomous task orchestration for PriceWatch. Tasks are compiled into Playwright assertions &amp; AST patches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher: LIST vs BOARD */}
              <div className="flex border-2 border-[#111111] bg-surface shadow-[2px_2px_0px_0px_#111111]">
                <button
                  type="button"
                  onClick={() => setViewMode("LIST")}
                  className={`px-3 py-1 font-mono text-xs uppercase font-bold transition-colors ${
                    viewMode === "LIST" ? "bg-[#111111] text-white" : "hover:bg-surface-container"
                  }`}
                >
                  LIST
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("BOARD")}
                  className={`px-3 py-1 font-mono text-xs uppercase font-bold transition-colors ${
                    viewMode === "BOARD" ? "bg-[#111111] text-white" : "hover:bg-surface-container"
                  }`}
                >
                  BOARD
                </button>
              </div>

              <button
                type="button"
                onClick={() => setNewTaskOpen(true)}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-container border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[3px_3px_0px_0px_#111111]"
              >
                + NEW TASK →
              </button>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="bg-surface-container-lowest border-b-2 border-[#111111] px-6 py-2.5 flex flex-wrap items-center gap-2 font-mono text-xs select-none">
            {[
              { id: "ALL", label: `ALL (${tasks.length})` },
              { id: "RUNNING", label: `RUNNING (${runningCount})` },
              { id: "NEEDS_APPROVAL", label: `NEEDS APPROVAL (${needsApprovalCount})` },
              { id: "QUEUED", label: `QUEUED (${queuedCount})` },
              { id: "DONE", label: `DONE (${doneCount})` },
              { id: "FAILED", label: `FAILED (${failedCount})` },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`px-2.5 py-1 border uppercase font-bold transition-all ${
                  filter === chip.id
                    ? "bg-[#111111] text-white border-[#111111] shadow-[2px_2px_0px_0px_#ca4b00]"
                    : "bg-surface hover:bg-surface-container text-on-surface border-[#111111]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Main 2-Column Split: Task Stream & Sprint Accounting */}
          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
            {/* Left 8 cols: Tasks Stream */}
            <div className="col-span-8 p-6 border-r-2 border-[#111111] bg-surface flex flex-col gap-4 overflow-y-auto">
              {viewMode === "LIST" ? (
                <div className="flex flex-col gap-3">
                  {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-[#111111]/30 font-mono text-xs text-secondary uppercase">
                      No tasks match the active filter.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onReview={() => router.push("/dashboard/review")}
                        onApprove={() => handleApproveTask(task)}
                        onCancel={() => handleCancelTask(task)}
                        onRetry={() => handleRetryTask(task)}
                      />
                    ))
                  )}
                </div>
              ) : (
                /* Kanban Board View */
                <div className="grid grid-cols-3 gap-4">
                  {/* Column 1: Queued */}
                  <div className="flex flex-col gap-3 bg-surface-container-low p-3 border-2 border-[#111111]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#111111]">
                      <span className="font-mono text-xs uppercase font-bold text-on-surface">
                        QUEUED ({tasks.filter((t) => t.status === "QUEUED").length})
                      </span>
                    </div>
                    {tasks
                      .filter((t) => t.status === "QUEUED")
                      .map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                  </div>

                  {/* Column 2: Running & Approval */}
                  <div className="flex flex-col gap-3 bg-surface-container-low p-3 border-2 border-[#111111]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#111111]">
                      <span className="font-mono text-xs uppercase font-bold text-primary">
                        IN FLIGHT ({tasks.filter((t) => t.status === "RUNNING" || t.status === "NEEDS_APPROVAL").length})
                      </span>
                    </div>
                    {tasks
                      .filter((t) => t.status === "RUNNING" || t.status === "NEEDS_APPROVAL")
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onReview={() => router.push("/dashboard/review")}
                          onApprove={() => handleApproveTask(task)}
                          onCancel={() => handleCancelTask(task)}
                          onRetry={() => handleRetryTask(task)}
                        />
                      ))}
                  </div>

                  {/* Column 3: Done */}
                  <div className="flex flex-col gap-3 bg-surface-container-low p-3 border-2 border-[#111111]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#111111]">
                      <span className="font-mono text-xs uppercase font-bold text-[#15803D]">
                        DONE ({tasks.filter((t) => t.status === "DONE").length})
                      </span>
                    </div>
                    {tasks
                      .filter((t) => t.status === "DONE")
                      .slice(0, 5)
                      .map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 cols: Sprint Accounting & Ember Advisor */}
            <div className="col-span-4 bg-surface-container-low p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Sprint Accounting Card */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-3 shadow-[3px_3px_0px_0px_#111111]">
                <div className="flex items-center justify-between pb-2 border-b border-[#111111]/30">
                  <span className="font-mono text-xs uppercase font-bold text-on-surface">
                    SPRINT ACCOUNTING
                  </span>
                  <span className="font-mono text-[10px] text-[#15803D] font-bold">
                    HEALTHY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2.5 bg-surface-container-low border border-[#111111]">
                    <div className="text-secondary text-[10px] uppercase">RESERVED CREDITS</div>
                    <div className="font-serif text-lg font-bold text-on-surface mt-0.5">6 CR</div>
                    <div className="text-[10px] text-secondary mt-1">2 in-flight tasks</div>
                  </div>
                  <div className="p-2.5 bg-surface-container-low border border-[#111111]">
                    <div className="text-secondary text-[10px] uppercase">TASKS TODAY</div>
                    <div className="font-serif text-lg font-bold text-on-surface mt-0.5">4 Done</div>
                    <div className="text-[10px] text-[#15803D] mt-1">100% test pass</div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between font-mono text-[10px] text-secondary">
                    <span>SYNDICATE POOL CONSUMPTION</span>
                    <span>84% CONSUMED</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high border border-[#111111] overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: "84%" }}></div>
                  </div>
                </div>
              </div>

              {/* Ember Sprint Advisor Callout */}
              <div className="bg-[#111111] text-white p-4 border-2 border-[#111111] shadow-[3px_3px_0px_0px_#ca4b00] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg text-primary font-bold">[ · _ · ]</span>
                  <span className="font-mono text-xs uppercase font-bold text-primary-fixed-dim">
                    EMBER SPRINT ADVISOR
                  </span>
                </div>
                <p className="font-serif text-xs text-[#ffffff] leading-relaxed">
                  &ldquo;Shopify rate-limiting patch is in flight. Next suggested task: Add Slack alert incoming webhook to alert the merchant store owner in real time.&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setNewTaskOpen(true)}
                  className="mt-1 py-1.5 bg-primary text-white hover:bg-primary-container font-mono text-xs uppercase font-bold transition-all shadow-[1px_1px_0px_0px_#ffffff]"
                >
                  Adopt Suggested Task (3 CR) ➔
                </button>
              </div>

              {/* Runtime Telemetry Sparkline Info */}
              <div className="bg-surface-container-lowest border-2 border-[#111111] p-4 flex flex-col gap-2 shadow-[2px_2px_0px_0px_#111111]">
                <div className="font-mono text-xs uppercase font-bold text-on-surface">
                  SYSTEM RUNTIME EFFICIENCY
                </div>
                <div className="font-mono text-[11px] text-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>Average Task Compile Time:</span>
                    <strong className="text-on-surface">4.2 min</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Autonomous Patch Accuracy:</span>
                    <strong className="text-[#15803D]">98.6%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Human Approval Latency:</span>
                    <strong className="text-on-surface">1.8 min</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Task Dialog Modal */}
      <NewTaskDialog
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onSubmit={handleCreateTask}
        companyName="PriceWatch"
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-mono text-xs uppercase">
          Loading Sprint Task Backlog...
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}

