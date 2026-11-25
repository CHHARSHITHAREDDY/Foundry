"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "popover"],
    queryFn: () => api.getNotifications({ limit: 8 }),
    enabled: isOpen,
  });

  const markMutation = useMutation({
    mutationFn: (payload: { id?: string; all?: boolean }) => api.markNotificationsRead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!isOpen) return null;

  const notifications = data?.notifications ?? [];

  return (
    <div className="fixed top-14 right-4 w-96 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg z-50 font-mono">
      <div className="px-4 py-3 border-b border-ink flex items-center justify-between bg-stone">
        <span className="text-xs font-bold uppercase tracking-wider text-ink">
          Notifications ({data?.unreadCount ?? 0} unread)
        </span>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              type="button"
              onClick={() => markMutation.mutate({ all: true })}
              className="text-[10px] text-link underline uppercase cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button type="button" onClick={onClose} className="text-xs text-muted hover:text-ink cursor-pointer">
            ✕
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <div className="h-10 bg-stone animate-pulse" />
            <div className="h-10 bg-stone animate-pulse" />
          </div>
        ) : isError ? (
          <div className="p-4 text-xs text-error space-y-2">
            <p>Failed to load notifications.</p>
            <button type="button" onClick={() => refetch()} className="underline text-link cursor-pointer">
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 space-y-1 ${n.read ? "bg-surface-container-lowest" : "bg-accent-soft/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink">{n.title}</span>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markMutation.mutate({ id: n.id })}
                    className="text-[10px] text-link underline shrink-0 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted">{n.message}</p>
              <span className="text-[10px] text-muted block">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-ink bg-paper text-right">
        <Link href="/notifications" onClick={onClose} className="text-[11px] text-link font-bold hover:underline">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
