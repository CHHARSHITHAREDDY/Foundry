"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list", unreadOnly],
    queryFn: ({ pageParam }) => api.getNotifications({ cursor: pageParam, limit: 20, unreadOnly }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const markMutation = useMutation({
    mutationFn: (payload: { id?: string; all?: boolean }) => api.markNotificationsRead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  return (
    <AppShell breadcrumb="Notifications">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              ACTIVITY STREAM
            </span>
            <h1 className="font-serif text-3xl font-bold text-ink mt-1">
              Notifications ({unreadCount} unread)
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span>Unread only</span>
            </label>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markMutation.mutate({ all: true })}
                disabled={markMutation.isPending}
                className="px-3 py-1.5 bg-ink text-on-primary uppercase font-bold border border-ink hover:bg-accent cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 bg-error-soft border border-error text-error font-mono text-xs flex items-center justify-between">
            <span>Failed to load notifications.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center bg-surface-container-lowest border-editorial border-ink font-mono text-xs text-muted">
            {unreadOnly ? "No unread notifications." : "You have no notifications yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                className={`p-4 border-editorial border-ink flex items-start justify-between gap-4 ${
                  n.read ? "bg-surface-container-lowest" : "bg-accent-soft/40 shadow-editorial-sm"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 border border-ink bg-stone uppercase font-bold">
                      {n.type}
                    </span>
                    <h2 className="font-serif text-lg font-bold text-ink">{n.title}</h2>
                  </div>
                  <p className="font-serif text-sm text-muted">{n.message}</p>
                  <span className="font-mono text-[10px] text-muted block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markMutation.mutate({ id: n.id })}
                    className="px-2.5 py-1 border border-ink bg-surface-container-lowest font-mono text-[10px] uppercase font-bold hover:bg-ink hover:text-on-primary shrink-0 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}

            {hasNextPage && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="px-4 py-2 bg-stone border border-ink font-mono text-xs uppercase font-bold hover:bg-ink hover:text-on-primary cursor-pointer"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
