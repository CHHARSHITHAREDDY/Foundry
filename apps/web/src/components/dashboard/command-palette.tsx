"use client";

import { useEffect, useState, useRef } from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewCompany: () => void;
  onBuyCredits: () => void;
  onSelectCompany: (company: string) => void;
  onNavigate: (path: string) => void;
}

interface CommandItem {
  id: string;
  group: "actions" | "companies" | "pages";
  title: string;
  subtitle: string;
  tag?: string;
  badgeColor?: string;
  shortcut?: string;
  icon?: string;
  statusDot?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewCompany,
  onBuyCredits,
  onSelectCompany,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    // GROUP 1: ACTIONS
    {
      id: "action-new-company",
      group: "actions",
      title: "New company",
      subtitle: "Scaffold a new autonomous venture protocol with reserve allocations",
      tag: "PROMPT",
      icon: "add",
      shortcut: "ENTER ↵",
      action: () => {
        onNewCompany();
        onClose();
      },
    },
    {
      id: "action-buy-credits",
      group: "actions",
      title: "Buy credits",
      subtitle: "Add reserve compute credits to syndicate wallet (Stripe / USDC)",
      icon: "bolt",
      shortcut: "⌘B",
      action: () => {
        onBuyCredits();
        onClose();
      },
    },
    // GROUP 2: COMPANIES
    {
      id: "company-dispatch",
      group: "companies",
      title: "Dispatch",
      subtitle: "Autonomous daily newsletter · MRR $1,420 · 2,840 readers",
      tag: "HEALTHY",
      badgeColor: "text-[#15803D]",
      statusDot: "bg-[#15803D]",
      shortcut: "⌘1",
      action: () => {
        onSelectCompany("Dispatch");
        onClose();
      },
    },
    {
      id: "company-codex",
      group: "companies",
      title: "Codex AI",
      subtitle: "Technical documentation generator · Sprint 03 in progress",
      tag: "BUILDING",
      badgeColor: "text-primary",
      statusDot: "bg-primary",
      shortcut: "⌘2",
      action: () => {
        onSelectCompany("Codex AI");
        onClose();
      },
    },
    {
      id: "company-vesper",
      group: "companies",
      title: "Vesper",
      subtitle: "Generative ambient soundscapes · Awaiting founder approval",
      tag: "STAGING",
      badgeColor: "text-[#D97706]",
      statusDot: "bg-[#D97706]",
      shortcut: "⌘3",
      action: () => {
        onSelectCompany("Vesper");
        onClose();
      },
    },
    {
      id: "company-pulse",
      group: "companies",
      title: "Pulse Wire",
      subtitle: "Competitive intelligence radar · CI/CD exit code 137",
      tag: "FATAL_ERR",
      badgeColor: "text-error",
      statusDot: "bg-error",
      shortcut: "⌘4",
      action: () => {
        onSelectCompany("Pulse Wire");
        onClose();
      },
    },
    // GROUP 3: PAGES
    {
      id: "page-billing",
      group: "pages",
      title: "Billing & Reserves",
      subtitle: "Credit breakdown, Stripe keys, automated payment ledgers",
      icon: "receipt_long",
      shortcut: "G then B",
      action: () => {
        onNavigate("billing");
        onClose();
      },
    },
    {
      id: "page-settings",
      group: "pages",
      title: "Settings & Security",
      subtitle: "Cryptographic enclaves, SSH keys, syndicate team permissions",
      icon: "tune",
      shortcut: "G then S",
      action: () => {
        onNavigate("settings");
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.tag?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  const actionItems = filteredItems.filter((i) => i.group === "actions");
  const companyItems = filteredItems.filter((i) => i.group === "companies");
  const pageItems = filteredItems.filter((i) => i.group === "pages");

  let globalIndex = -1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#141414]/45 backdrop-blur-[2px] flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100"
    >
      {/* COMMAND MENU MODAL DIALOG (640px) */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="w-full max-w-[640px] bg-surface border-[1.5px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Archival Modal Header Ribbon */}
        <div className="h-8 px-space-md bg-surface-container-high border-b border-[#111111] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-primary" />
            <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold tracking-wider">
              [COMMAND_PALETTE // DISPATCH_NAV]
            </span>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
            <span className="px-1 border border-secondary-fixed-dim bg-surface-container text-[9px] leading-tight">
              ESC
            </span>
            <span className="uppercase">TO DISMISS</span>
          </div>
        </div>

        {/* Search Input Container */}
        <div className="relative flex items-center bg-surface-container-lowest px-space-md py-3.5 border-b border-[#111111]">
          <span className="material-symbols-outlined text-[20px] text-on-surface mr-3 shrink-0">search</span>
          <div className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type an action or press shortcut..."
              className="w-full bg-transparent font-headline-sm text-headline-sm text-on-surface outline-none placeholder:font-body-md placeholder:text-body-md placeholder:text-secondary/40 placeholder:italic"
            />
            {!query && <span className="inline-block w-2.5 h-5 bg-primary ml-0.5 animate-pulse shrink-0" />}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="px-1.5 py-0.5 border border-[#111111] bg-surface-container font-label-sm text-label-sm uppercase font-bold text-on-surface shadow-[1px_1px_0px_0px_#111111]">
              RETURN ↵
            </span>
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[460px] overflow-y-auto flex flex-col p-2 space-y-3 bg-surface">
          {/* GROUP 1: ACTIONS */}
          {actionItems.length > 0 && (
            <div>
              <div className="px-space-sm py-1 font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center justify-between">
                <span>ACTIONS // EXECUTION</span>
                <span className="text-[9px] text-secondary/70">PRIMITIVE_OPS</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {actionItems.map((item) => {
                  globalIndex++;
                  const isSelected = selectedIndex === globalIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`group relative flex items-center justify-between px-space-sm py-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-surface-container-low border-l-[3px] border-l-primary border-t border-r border-b border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                          : "bg-surface hover:bg-surface-container-low border border-transparent hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center gap-space-sm min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 flex items-center justify-center shrink-0 border border-[#111111] ${
                            isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate">
                              {item.title}
                            </span>
                            {item.tag && (
                              <span className="px-1 py-0.2 border border-primary font-label-sm text-[9px] text-primary uppercase bg-surface">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-secondary truncate mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        {item.shortcut && (
                          <span
                            className={`px-1.5 py-0.5 font-label-sm text-label-sm uppercase font-bold tracking-wider ${
                              isSelected
                                ? "bg-[#111111] text-surface"
                                : "border border-surface-variant bg-surface-container-lowest text-on-surface"
                            }`}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {actionItems.length > 0 && (companyItems.length > 0 || pageItems.length > 0) && (
            <div className="h-px bg-surface-variant mx-space-sm" />
          )}

          {/* GROUP 2: COMPANIES */}
          {companyItems.length > 0 && (
            <div>
              <div className="px-space-sm py-1 font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center justify-between">
                <span>COMPANIES // ACTIVE_PROTOCOLS</span>
                <span className="text-[9px] text-secondary/70">{companyItems.length} RUNNING</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {companyItems.map((item) => {
                  globalIndex++;
                  const isSelected = selectedIndex === globalIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`group flex items-center justify-between px-space-sm py-2 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-surface-container-low border-l-[3px] border-l-primary border-t border-r border-b border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                          : "bg-surface hover:bg-surface-container-low border border-transparent hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center gap-space-sm min-w-0 pr-2">
                        <div className="w-7 h-7 bg-surface-container-lowest border border-[#111111] flex items-center justify-center shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.statusDot}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                              {item.title}
                            </span>
                            {item.tag && (
                              <span className={`font-label-sm text-label-sm uppercase font-semibold ${item.badgeColor}`}>
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-secondary truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {item.shortcut && (
                          <span className="px-1.5 py-0.5 border border-surface-variant bg-surface-container-lowest font-label-sm text-label-sm text-on-surface uppercase">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {companyItems.length > 0 && pageItems.length > 0 && (
            <div className="h-px bg-surface-variant mx-space-sm" />
          )}

          {/* GROUP 3: PAGES */}
          {pageItems.length > 0 && (
            <div>
              <div className="px-space-sm py-1 font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center justify-between">
                <span>NAVIGATION // DIRECTORY</span>
                <span className="text-[9px] text-secondary/70">WORKSPACE</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {pageItems.map((item) => {
                  globalIndex++;
                  const isSelected = selectedIndex === globalIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`group flex items-center justify-between px-space-sm py-2 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-surface-container-low border-l-[3px] border-l-primary border-t border-r border-b border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                          : "bg-surface hover:bg-surface-container-low border border-transparent hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center gap-space-sm min-w-0 pr-2">
                        <div className="w-7 h-7 bg-surface-container border border-[#111111] text-on-surface flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">
                            {item.title}
                          </span>
                          <span className="font-body-sm text-body-sm text-secondary truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {item.shortcut && (
                          <span className="px-1.5 py-0.5 border border-surface-variant bg-surface-container-lowest font-label-sm text-label-sm text-secondary uppercase">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-secondary font-label-md text-label-md uppercase">
              No matching actions or entities for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Technical Modal Footer */}
        <div className="px-space-md py-2.5 bg-surface-container-low border-t border-[#111111] flex flex-wrap items-center justify-between font-label-sm text-label-sm text-secondary select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface">{filteredItems.length} RESULTS INDEXED</span>
            <span className="text-surface-variant">|</span>
            <span>LATENCY 2ms</span>
          </div>
          <div className="flex items-center gap-space-sm uppercase">
            <span className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="px-1 py-0.5 border border-secondary-fixed-dim bg-surface text-[9px]">↑↓</span>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="px-1 py-0.5 border border-secondary-fixed-dim bg-surface text-[9px]">↵</span>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 border border-secondary-fixed-dim bg-surface text-[9px]">ESC</span>
              <span>Close</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 border border-secondary-fixed-dim bg-surface text-[9px]">TAB</span>
              <span>Actions</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

