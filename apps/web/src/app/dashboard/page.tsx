"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { OnboardingView } from "@/components/dashboard/onboarding-view";
import { VenturesView } from "@/components/dashboard/ventures-view";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { IdeaModal } from "@/components/studio/idea-modal";
import { BuildModal } from "@/components/studio/build-modal";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";

export default function DashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<"onboarding" | "overview" | "billing" | "settings">("onboarding");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Global shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleApproveBuild = (idea: any) => {
    setActiveIdea(idea);
    setSurpriseOpen(false);
    setIdeaOpen(false);
    setBuildOpen(true);
  };

  const handleSelectCompany = (company: string) => {
    setSelectedCompany(company);
    setCurrentTab("overview");
  };

  const breadcrumbName =
    selectedCompany ||
    (currentTab === "onboarding"
      ? "Onboarding"
      : currentTab === "overview"
      ? "Companies"
      : currentTab === "billing"
      ? "Billing"
      : "Settings");

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedCompany(null);
          setCurrentTab(tab);
        }}
        onNewCompany={() => router.push("/dashboard/new")}
        onBuyCredits={() => setCurrentTab("billing")}
        onSelectCompany={handleSelectCompany}
      />

      {/* 2. Main Shell Content */}
      <div className="pl-60 min-h-screen flex flex-col">
        {/* Top Sticky Header */}
        <DashboardHeader
          currentBreadcrumb={breadcrumbName}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen((prev) => !prev)}
        />

        {/* Notifications Popover Drawer */}
        <NotificationsPopover
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Viewport Content */}
        <main className="w-full pt-14 flex-1 bg-surface">
          <div className="flex flex-col w-full relative min-h-full">
            {currentTab === "onboarding" && (
              <OnboardingView
                onSurpriseClick={() => setSurpriseOpen(true)}
                onIdeaClick={() => setIdeaOpen(true)}
                onViewSpecs={() => setCurrentTab("overview")}
              />
            )}

            {currentTab === "overview" && (
              <VenturesView
                onNewCompany={() => router.push("/dashboard/new")}
                onSelectCompany={handleSelectCompany}
              />
            )}

            {currentTab === "billing" && (
              <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-lg">
                <div className="border-b-2 border-[#111111] pb-space-sm flex items-center justify-between">
                  <h1 className="font-headline-lg text-headline-lg font-serif">Billing &amp; Compute Reserves</h1>
                  <span className="font-label-sm text-label-sm uppercase font-mono px-2 py-0.5 border border-[#111111] bg-surface-container">
                    184 CREDITS REMAINING
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm font-serif">Active Syndicate Subscription: Pro Auto-Run</h3>
                  <p className="font-body-md text-secondary">
                    Your monthly quota of 1,200 credits refreshes on the 1st of every month. Unused credits roll over for 90 days.
                  </p>
                  <div className="flex gap-space-sm pt-space-xs">
                    <a
                      href="/pricing"
                      className="px-space-md py-2 bg-[#111111] text-[#ffffff] font-label-md text-label-md uppercase font-mono hover:bg-primary transition-colors shadow-[2px_2px_0px_0px_#111111]"
                    >
                      Manage Plan on Pricing ➔
                    </a>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "settings" && (
              <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-lg">
                <div className="border-b-2 border-[#111111] pb-space-sm flex items-center justify-between">
                  <h1 className="font-headline-lg text-headline-lg font-serif">Syndicate Settings &amp; Security</h1>
                  <span className="font-label-sm text-label-sm uppercase font-mono px-2 py-0.5 border border-[#111111] bg-[#15803D] text-white">
                    ZERO-TRUST ENCLAVE ACTIVE
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-space-lg border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm font-serif">Cryptographic Deployment Keys</h3>
                  <p className="font-body-md text-secondary font-mono text-sm bg-surface-container-low p-space-sm border border-[#111111]">
                    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyFoundryVentureStudio2025
                  </p>
                  <p className="font-body-sm text-secondary">
                    All Edge builds and Cloudflare worker deployments are signed with this key prior to DNS verification.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewCompany={() => setIdeaOpen(true)}
        onBuyCredits={() => setCurrentTab("billing")}
        onSelectCompany={handleSelectCompany}
        onNavigate={(path) => {
          if (path === "billing") setCurrentTab("billing");
          if (path === "settings") setCurrentTab("settings");
          if (path === "dashboard") setCurrentTab("onboarding");
        }}
      />

      {/* 4. Studio Interactive Modals */}
      <SurpriseModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
        onApproveBuild={handleApproveBuild}
      />
      <IdeaModal
        isOpen={ideaOpen}
        onClose={() => setIdeaOpen(false)}
        onApproveBuild={handleApproveBuild}
      />
      <BuildModal
        isOpen={buildOpen}
        idea={activeIdea}
        onClose={() => setBuildOpen(false)}
      />
    </div>
  );
}

