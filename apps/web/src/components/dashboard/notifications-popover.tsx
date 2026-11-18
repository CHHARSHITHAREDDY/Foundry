"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  category: "approvals" | "builds" | "tasks" | "billing";
  unread: boolean;
  actionLabel?: string;
  actionBadge?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveDiff?: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Autonomous build finished",
    timestamp: "4M AGO",
    description: "Codex AI sprint #03 compiled and ready for deployment preview.",
    category: "builds",
    unread: true,
    icon: "check_circle",
    iconBg: "bg-[#E8F5E9]",
    iconColor: "text-[#15803D]",
  },
  {
    id: "notif-2",
    title: "Approval needed: Vesper DNS",
    timestamp: "18M AGO",
    description: "Production domain zone records awaiting cryptographic manual signature.",
    category: "approvals",
    unread: true,
    actionLabel: "Review Diff",
    actionBadge: "[BLOCKING]",
    icon: "shield",
    iconBg: "bg-[#FFF3E0]",
    iconColor: "text-primary",
  },
  {
    id: "notif-3",
    title: "Task executed: Newsletter dispatch",
    timestamp: "1H AGO",
    description: "Dispatch issue #142 sent to 1,280 subscribers via archival batch pipeline.",
    category: "tasks",
    unread: true,
    icon: "terminal",
    iconBg: "bg-surface-container",
    iconColor: "text-on-surface",
  },
  {
    id: "notif-4",
    title: "Credit reserve below threshold",
    timestamp: "2H AGO",
    description: "184 credits remaining. Active autonomous jobs may pause upon exhaustion.",
    category: "billing",
    unread: false,
    icon: "battery_alert",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
  },
  {
    id: "notif-5",
    title: "Deploy failed on Pulse Wire",
    timestamp: "4H AGO",
    description: "npm build socket hangup on step 4/7: core/runtime-engine.",
    category: "builds",
    unread: false,
    icon: "cancel",
    iconBg: "bg-error-container",
    iconColor: "text-error",
  },
];

export function NotificationsPopover({
  isOpen,
  onClose,
  onApproveDiff,
}: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "approvals">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const approvalsCount = notifications.filter((n) => n.category === "approvals").length;

  const filteredNotifications =
    activeTab === "approvals"
      ? notifications.filter((n) => n.category === "approvals")
      : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Close on ESC and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Notifications Panel"
      aria-modal="true"
      className="fixed top-14 right-8 z-50 w-[380px] bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Popover Header */}
      <div className="p-space-md border-b-[1.5px] border-[#111111] bg-surface flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase font-serif font-bold">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-primary text-on-primary font-label-sm text-label-sm font-bold tracking-wider rounded-DEFAULT shadow-[1px_1px_0px_0px_#111111] font-mono">
                {String(unreadCount).padStart(2, "0")} UNREAD
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary hover:text-primary transition-colors underline decoration-dotted underline-offset-4 cursor-pointer font-mono"
            type="button"
          >
            Mark All As Read
          </button>
        </div>

        {/* Segmented Category Tabs */}
        <div className="flex items-center gap-0 pt-1 -mb-space-md">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-space-sm py-2 font-label-md text-label-md uppercase tracking-wider font-bold border-b-2 flex items-center gap-1.5 cursor-pointer font-mono ${
              activeTab === "all"
                ? "text-on-surface border-[#111111] bg-surface-container-lowest"
                : "text-secondary hover:text-on-surface border-transparent"
            }`}
            type="button"
          >
            <span>All</span>
            <span className="font-label-sm text-label-sm px-1 bg-surface-container border border-surface-variant">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-space-sm py-2 font-label-md text-label-md uppercase tracking-wider border-b-2 flex items-center gap-1.5 cursor-pointer font-mono ${
              activeTab === "approvals"
                ? "text-on-surface border-[#111111] bg-surface-container-lowest font-bold"
                : "text-secondary hover:text-on-surface border-transparent"
            }`}
            type="button"
          >
            <span>Approvals</span>
            <span className="font-label-sm text-label-sm px-1 bg-surface-container border border-surface-variant font-bold text-primary">
              {approvalsCount}
            </span>
          </button>
          <div className="flex-1 border-b-2 border-surface-variant" />
        </div>
      </div>

      {/* Notification List (5 Stacked Archival Items) */}
      <div className="flex flex-col max-h-[460px] overflow-y-auto divide-y divide-[#D6D6D1]">
        {filteredNotifications.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`p-space-md transition-colors flex items-start gap-space-sm group cursor-pointer ${
              item.unread
                ? item.category === "approvals"
                  ? "bg-surface-container-lowest hover:bg-surface-container-low border-l-2 border-primary"
                  : "bg-surface-container-lowest hover:bg-surface-container-low"
                : "bg-surface-container-low/70 hover:bg-surface-container-low opacity-80 hover:opacity-100"
            }`}
          >
            {/* Icon Block */}
            <div
              className={`w-8 h-8 shrink-0 ${item.iconBg} border border-[#111111] flex items-center justify-center ${item.iconColor} shadow-[1.5px_1.5px_0px_0px_#111111]`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-1">
                <h3
                  className={`font-headline-sm text-[14px] leading-tight text-on-surface truncate ${
                    item.unread ? "font-bold font-serif" : "font-medium"
                  }`}
                >
                  {item.title}
                </h3>
                <span className="font-label-sm text-label-sm text-secondary shrink-0 font-mono">
                  {item.timestamp}
                </span>
              </div>
              <p
                className={`font-body-sm text-body-sm leading-snug line-clamp-2 ${
                  item.unread ? "text-on-surface-variant" : "text-secondary"
                }`}
              >
                {item.description}
              </p>

              {/* Action Strip (if approval or action) */}
              {item.actionLabel && (
                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveDiff?.();
                    }}
                    className="h-6 px-2 bg-[#111111] hover:bg-primary-container text-[#ffffff] font-label-sm text-label-sm uppercase font-bold tracking-wider rounded-DEFAULT border border-[#111111] transition-all flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#111111] cursor-pointer font-mono"
                    type="button"
                  >
                    <span>{item.actionLabel}</span>
                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </button>
                  {item.actionBadge && (
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-mono">
                      {item.actionBadge}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Unread dot or spacer */}
            <div className="pt-1.5 shrink-0">
              {item.unread ? (
                <span className="block w-1.5 h-1.5 rounded-full bg-primary" title="Unread" />
              ) : (
                <div className="w-1.5" />
              )}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-space-lg text-center font-mono text-secondary font-label-sm text-label-sm">
            NO NOTIFICATIONS IN THIS CATEGORY
          </div>
        )}
      </div>

      {/* Popover Footer Action Strip */}
      <div className="p-space-sm bg-surface border-t-[1.5px] border-[#111111] flex flex-col gap-1.5">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="w-full h-8 bg-surface-container hover:bg-[#111111] text-on-surface hover:text-[#ffffff] border border-[#111111] font-label-md text-label-md uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#111111] font-mono"
        >
          <span>View All Notifications</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
        <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-secondary font-mono">
          <span>ARCHIVE_REF // NOTIF_SYS</span>
          <span className="flex items-center gap-1">
            <span className="px-1 py-0.2 border border-surface-variant bg-surface-container">
              ESC
            </span>{" "}
            to dismiss
          </span>
        </div>
      </div>
    </div>
  );
}

