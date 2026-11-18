"use client";

import Link from "next/link";
import { useState } from "react";

interface SidebarProps {
  currentTab: "onboarding" | "overview" | "billing" | "settings";
  onTabChange: (tab: "onboarding" | "overview" | "billing" | "settings") => void;
  onNewCompany: () => void;
  onBuyCredits: () => void;
  onSelectCompany: (company: string) => void;
}

export function Sidebar({
  currentTab,
  onTabChange,
  onNewCompany,
  onBuyCredits,
  onSelectCompany,
}: SidebarProps) {
  const [companiesOpen, setCompaniesOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface-container-low border-r border-[#111111] z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand & Version Badge */}
        <div className="h-14 px-space-md border-b border-[#111111] flex items-center justify-between bg-surface">
          <Link href="/" className="flex items-center gap-space-xs">
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-serif">
              Foundry
            </span>
            <span className="w-1.5 h-1.5 bg-primary mt-1" />
          </Link>
          <span className="font-label-sm text-label-sm text-secondary uppercase px-1 py-0.5 border border-secondary-fixed-dim bg-surface-container font-mono">
            v2.4
          </span>
        </div>

        {/* Primary Action Button */}
        <div className="p-space-md border-b border-surface-variant">
          <button
            onClick={onNewCompany}
            className="w-full h-9 bg-[#111111] text-[#ffffff] font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-space-xs rounded-DEFAULT border border-[#111111] hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Company</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-space-sm flex flex-col gap-1">
          <button
            onClick={() => onTabChange("onboarding")}
            className={`w-full flex items-center gap-space-sm px-space-sm py-2 rounded-DEFAULT font-label-md text-label-md uppercase tracking-wider transition-colors text-left ${
              currentTab === "onboarding"
                ? "bg-[#111111] text-[#ffffff] font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Dashboard</span>
          </button>

          <div className="flex flex-col">
            <button
              onClick={() => {
                onTabChange("overview");
                setCompaniesOpen(!companiesOpen);
              }}
              className={`w-full flex items-center justify-between px-space-sm py-2 rounded-DEFAULT font-label-md text-label-md uppercase tracking-wider transition-colors text-left ${
                currentTab === "overview"
                  ? "bg-[#111111] text-[#ffffff] font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">domain</span>
                <span>Companies</span>
              </div>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform ${
                  companiesOpen ? "rotate-0" : "-rotate-90"
                }`}
              >
                expand_more
              </span>
            </button>

            {companiesOpen && (
              <div className="ml-space-md pl-space-sm my-1 border-l-2 border-[#111111] flex flex-col gap-0.5">
                <button
                  onClick={() => onSelectCompany("Dispatch")}
                  className="flex items-center justify-between px-space-sm py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                  <span>Dispatch</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                </button>
                <button
                  onClick={() => onSelectCompany("Codex AI")}
                  className="flex items-center justify-between px-space-sm py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                  <span>Codex</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </button>
                <button
                  onClick={() => onSelectCompany("Pulse Wire")}
                  className="flex items-center justify-between px-space-sm py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                  <span>Pulse</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                </button>
                <button
                  onClick={() => onSelectCompany("Vesper")}
                  className="flex items-center justify-between px-space-sm py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                  <span>Vesper</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onTabChange("billing")}
            className={`w-full flex items-center gap-space-sm px-space-sm py-2 rounded-DEFAULT font-label-md text-label-md uppercase tracking-wider transition-colors text-left ${
              currentTab === "billing"
                ? "bg-[#111111] text-[#ffffff] font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Billing</span>
          </button>

          <button
            onClick={() => onTabChange("settings")}
            className={`w-full flex items-center gap-space-sm px-space-sm py-2 rounded-DEFAULT font-label-md text-label-md uppercase tracking-wider transition-colors text-left ${
              currentTab === "settings"
                ? "bg-[#111111] text-[#ffffff] font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section: Credit Meter & Profile */}
      <div className="flex flex-col border-t border-[#111111] bg-surface">
        <div className="p-space-sm border-b border-surface-variant">
          <div className="p-space-sm bg-surface-container-lowest border border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-mono">Allotted</span>
              <span className="font-label-md text-label-md font-bold text-on-surface font-mono">184 CREDITS</span>
            </div>
            {/* 6-segment brutalist bar */}
            <div className="grid grid-cols-6 gap-0.5 h-1.5 mb-2">
              <div className="bg-primary h-full" />
              <div className="bg-primary h-full" />
              <div className="bg-primary h-full" />
              <div className="bg-primary h-full" />
              <div className="bg-surface-variant h-full" />
              <div className="bg-surface-variant h-full" />
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={onBuyCredits}
                className="font-label-sm text-label-sm uppercase font-bold text-primary hover:text-on-surface flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Buy Credits</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-space-sm flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 bg-[#111111] border border-[#111111] flex items-center justify-center text-[#ffffff] font-label-sm text-label-sm font-bold font-mono">
              EV
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-label-md text-label-md font-bold text-on-surface">Elena Vance</span>
              <span className="font-label-sm text-label-sm text-secondary">Foundry Press</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-secondary">unfold_more</span>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar as DashboardSidebar };

