"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { AgentMascot } from "@/components/studio/agent-mascot";
import { AgentStatusCard } from "@/components/studio/agent-status-card";
import { WebsitePanel } from "@/components/capabilities/website-panel";
import { BusinessStats } from "@/components/capabilities/business-stats";
import { TaskCard, TaskItem } from "@/components/tasks/task-card";
import { RoadmapCard } from "@/components/tasks/roadmap-card";
import { NewTaskDialog, NewTaskPayload } from "@/components/tasks/new-task-dialog";
import { CapabilityGrid } from "@/components/capabilities/capability-grid";
import { AssistantChat } from "@/components/studio/assistant-chat";
import { api } from "@/lib/api-client";

const COMPANY_TASKS: TaskItem[] = [
  {
    id: "ct-1",
    code: "#043",
    title: "Shopify GraphQL Webhook Exponential Backoff & Retry Queue",
    description: "Refactoring Shopify GraphQL webhook listener with exponential backoff & rate-limit hedging...",
    status: "RUNNING",
    type: "FEATURE",
    priority: "P0",
    credits: 3,
    progress: 72,
    timeElapsed: "16m 38s",
    assignedAgent: "Ember-02",
  },
  {
    id: "ct-2",
    code: "#042",
    title: "Margin Threshold Breach Email Alert to Merchant Store Owner",
    description: "Send instant transactional email via Resend when gross product margin drops below configured floor.",
    status: "NEEDS_APPROVAL",
    type: "FEATURE",
    priority: "P1",
    credits: 2,
    diffStats: { added: 84, removed: 12 },
  },
  {
    id: "ct-3",
    code: "#041",
    title: "Slack Channel Incoming Webhook Integration for Price Drop Notifications",
    description: "Allow merchants to paste Slack incoming webhook URL to broadcast pricing shifts to internal teams.",
    status: "QUEUED",
    type: "FEATURE",
    priority: "P2",
    credits: 3,
  },
  {
    id: "ct-4",
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
];

function CompanyConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyName = searchParams.get("company") || "Workspace";

  // Tab State: OVERVIEW | TASKS | CODE & REPO | SETTINGS | GROWTH
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TASKS" | "CODE" | "SETTINGS" | "GROWTH">("OVERVIEW");
  const [tasks, setTasks] = useState<TaskItem[]>(COMPANY_TASKS);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [autoRunEnabled, setAutoRunEnabled] = useState(true);
  const [nightTasksEnabled, setNightTasksEnabled] = useState(true);

  // Sync state from backend
  useEffect(() => {
    api.getCompany(companyName).then((c: any) => {
      if (c) {
        if (typeof c.autoRunEnabled === "boolean") setAutoRunEnabled(c.autoRunEnabled);
        if (typeof c.nightTasksEnabled === "boolean") setNightTasksEnabled(c.nightTasksEnabled);
      }
    }).catch(() => {});

    api.getTasks().then((res) => {
      if (res && res.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);
      }
    }).catch(() => {});
  }, [companyName]);

  const handleCreateTask = async (payload: NewTaskPayload) => {
    try {
      const created = await api.createTask({
        specification: payload.specification,
        type: payload.type,
        priority: payload.priority,
        credits: payload.estimatedCredits,
        requiresApproval: payload.requiresApproval,
        companyName,
      });
      if (created) {
        setTasks((prev) => [created, ...prev]);
        return;
      }
    } catch {}

    const nextCode = tasks.length + 41;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      code: `#0${nextCode}`,
      title: payload.specification.slice(0, 60),
      description: payload.specification,
      status: "QUEUED",
      type: payload.type,
      priority: payload.priority,
      credits: payload.estimatedCredits,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleAuto = async (enabled: boolean) => {
    setAutoRunEnabled(enabled);
    try {
      await api.toggleCompanyAutoRun(companyName, enabled);
    } catch {}
  };

  const handleToggleNight = async (enabled: boolean) => {
    setNightTasksEnabled(enabled);
    try {
      await api.toggleCompanyNightTasks(companyName, enabled);
    } catch {}
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Left Fixed Sidebar */}
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
        onSelectCompany={(comp) => router.push(`/dashboard/company?company=${encodeURIComponent(comp)}`)}
      />

      {/* 2. Main Shell */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Sticky Header */}
        <DashboardHeader
          currentBreadcrumb={`${companyName} / Company Console`}
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
            if (path === "tasks") router.push("/dashboard/tasks");
            if (path === "review") router.push("/dashboard/review");
            if (path === "deploy") router.push("/dashboard/deploy");
          }}
        />

        {/* Main Content Area */}
        <main className="w-full pt-14 flex-1 flex flex-col bg-surface">
          {/* Company Subheader Bar */}
          <div className="bg-surface-container-low border-b-2 border-[#111111] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold text-on-surface">
                {companyName}
              </h1>
              <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 bg-[#15803D] text-white border border-[#111111] shadow-[1px_1px_0px_0px_#111111]">
                LIVE IN PRODUCTION
              </span>
              <a
                href="https://Workspace-4k2.foundry.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary hover:underline"
              >
                https://Workspace-4k2.foundry.app ↗
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard/tasks")}
                className="px-3 py-1.5 bg-surface text-on-surface hover:bg-surface-container border-2 border-[#111111] font-mono text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_#111111]"
              >
                Task Queue ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setNewTaskOpen(true)}
                className="px-4 py-1.5 bg-primary text-white hover:bg-primary-container border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-[2px_2px_0px_0px_#111111]"
              >
                + NEW TASK →
              </button>
            </div>
          </div>

          {/* Workspace Tabs Strip */}
          <div className="bg-surface-container-lowest border-b-2 border-[#111111] px-6 flex items-center gap-2 font-mono text-xs select-none">
            {[
              { id: "OVERVIEW", label: "OVERVIEW" },
              { id: "TASKS", label: `TASKS (${tasks.length})` },
              { id: "CODE", label: "CODE & REPO" },
              { id: "SETTINGS", label: "SETTINGS" },
              { id: "GROWTH", label: "GROWTH" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-bold border-b-2 uppercase transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-surface-container-low"
                    : "border-transparent text-secondary hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Viewport Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left 3-Column Studio Workspace */}
            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-12 gap-6">
              {/* Column 1 (4 cols): Ember Agent, Status Card, Website & Business Telemetry */}
              <div className="col-span-4 flex flex-col gap-4">
                <AgentMascot
                  mood="working"
                  title="EMBER AGENT RUNNER"
                  subtitle="WRITING THE CODE // MAKING THE CHANGES"
                />
                <AgentStatusCard
                  currentActivity="Refactoring Shopify GraphQL webhook listener with exponential backoff & rate-limit hedging..."
                  autoEnabled={autoRunEnabled}
                  nightEnabled={nightTasksEnabled}
                  onAutoToggle={handleToggleAuto}
                  onNightToggle={handleToggleNight}
                />
                <BusinessStats revenue="$0.00" visitors={1} activeInstalls={0} />
                <WebsitePanel companyName={companyName} endpoint="https://Workspace-4k2.foundry.app" />
              </div>

              {/* Column 2 (4 cols): Tasks & Documents */}
              <div className="col-span-4 flex flex-col gap-4">
                {/* Active Running Task Card */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
                      IN-FLIGHT TASK
                    </span>
                    <span className="font-mono text-[10px] text-primary font-bold animate-pulse">
                      ● RUNNING
                    </span>
                  </div>
                  {tasks
                    .filter((t) => t.status === "RUNNING")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onReview={() => router.push("/dashboard/review")}
                        onApprove={() => router.push("/dashboard/deploy")}
                      />
                    ))}
                </div>

                {/* Backlog Task Cards */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
                      SPRINT BACKLOG
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewTaskOpen(true)}
                      className="font-mono text-[10px] text-primary hover:underline font-bold"
                    >
                      + ADD TASK
                    </button>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {tasks
                      .filter((t) => t.status !== "RUNNING")
                      .slice(0, 3)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onReview={() => router.push("/dashboard/review")}
                          onApprove={() => router.push("/dashboard/deploy")}
                        />
                      ))}
                  </div>
                </div>

                {/* Documents & Roadmap */}
                <RoadmapCard />
              </div>

              {/* Column 3 (4 cols): Venture Capabilities (Twitter, Email, Meta Ads, Media) */}
              <div className="col-span-4 flex flex-col gap-4">
                <CapabilityGrid companyName={companyName} />
              </div>
            </div>

            {/* Persistent Right Chat Rail (340px width) */}
            <div className="w-80 border-l-2 border-[#111111] flex flex-col bg-surface-container-lowest shrink-0">
              <AssistantChat
                companyName={companyName}
                onNewTaskFromChat={(text) => {
                  handleCreateTask({
                    specification: text,
                    type: "FEATURE",
                    priority: "P1",
                    requiresApproval: true,
                    estimatedCredits: 3,
                  });
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* New Task Dialog */}
      <NewTaskDialog
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onSubmit={handleCreateTask}
        companyName={companyName}
      />
    </div>
  );
}

export default function CompanyConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center font-mono text-xs uppercase">
          Loading Company Operational Console...
        </div>
      }
    >
      <CompanyConsoleContent />
    </Suspense>
  );
}

