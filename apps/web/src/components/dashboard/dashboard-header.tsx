"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface DashboardHeaderProps {
  currentBreadcrumb?: string;
  onOpenCommandPalette: () => void;
  onNotificationsClick?: () => void;
  user?: { name: string; email: string };
}

export function DashboardHeader({
  currentBreadcrumb = "Dashboard",
  onOpenCommandPalette,
  onNotificationsClick,
  user,
}: DashboardHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "count"],
    queryFn: () => api.getNotifications({ limit: 1, unreadOnly: true }),
  });

  const unreadCount = notifData?.unreadCount ?? 0;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } finally {
      queryClient.clear();
      router.push("/login");
    }
  };

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-surface/95 backdrop-blur-md border-b border-ink z-40 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="font-mono text-xs text-muted uppercase flex items-center gap-1.5">
          <span className="text-ink font-semibold">Foundry</span>
          <span>/</span>
          <span className="text-accent font-bold">{currentBreadcrumb}</span>
        </div>
      </div>

      {/* Command Menu Trigger */}
      <div className="flex-1 max-w-sm mx-6">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full h-8 px-3 bg-surface-container-lowest border border-ink font-mono text-xs text-muted flex items-center justify-between hover:border-accent transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>Search companies &amp; pages...</span>
          </span>
          <span className="px-1.5 py-0.5 border border-border-subtle bg-stone text-[10px] text-ink">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={onNotificationsClick}
          type="button"
          data-testid="notifications-bell-button"
          className="relative p-1.5 text-ink hover:text-accent transition-colors cursor-pointer border border-transparent hover:border-ink"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span
              data-testid="notifications-unread-badge"
              className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-accent text-on-primary font-mono text-[10px] font-bold flex items-center justify-center border border-ink"
            >
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-border-subtle" />

        <div className="relative">
          <button
            type="button"
            data-testid="user-menu-button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-2.5 py-1 border border-ink bg-surface-container-lowest hover:bg-stone font-mono text-xs cursor-pointer"
          >
            <span className="w-2 h-2 bg-success inline-block" />
            <span className="font-bold text-ink max-w-32 truncate">{user?.name || "Operator"}</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-surface-container-lowest border-editorial border-ink shadow-editorial p-3 z-50 space-y-2 font-mono text-xs">
              <div className="pb-2 border-b border-border-subtle">
                <p className="font-bold text-ink truncate">{user?.name}</p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>
              <Link
                href="/billing"
                onClick={() => setMenuOpen(false)}
                className="block py-1.5 px-2 hover:bg-stone text-ink"
              >
                Billing &amp; Credits
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMenuOpen(false)}
                className="block py-1.5 px-2 hover:bg-stone text-ink"
              >
                Notifications
              </Link>
              <button
                type="button"
                data-testid="logout-button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="w-full text-left py-1.5 px-2 bg-error-soft text-error border border-error font-bold uppercase text-[11px] hover:bg-error hover:text-on-primary transition-colors cursor-pointer"
              >
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
