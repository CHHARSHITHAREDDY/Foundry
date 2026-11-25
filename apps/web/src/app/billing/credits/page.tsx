"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";
import { BillingNav } from "@/components/billing/billing-nav";

const ACTIONS = ["ALL", "BONUS", "PURCHASE", "RESERVE", "SETTLE", "REFUND"] as const;

export default function BillingCreditsPage() {
  const [actionFilter, setActionFilter] = useState<(typeof ACTIONS)[number]>("ALL");

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["billing", "ledger", actionFilter],
    queryFn: ({ pageParam }) => api.getLedger({ cursor: pageParam, limit: 20, action: actionFilter }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const rows = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <AppShell breadcrumb="Billing / Credits">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="border-b border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
            IMMUTABLE LEDGER
          </span>
          <h1 className="font-serif text-4xl font-bold text-ink mt-1">Credit Ledger</h1>
        </div>

        <BillingNav />

        {/* Action Filter */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActionFilter(a)}
              className={`px-2.5 py-1 border uppercase font-bold cursor-pointer ${
                actionFilter === a ? "bg-ink text-on-primary border-ink" : "bg-paper text-ink border-ink hover:bg-stone"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="h-48 bg-stone animate-pulse border border-border-subtle" />
        ) : isError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load credit ledger.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest border-editorial border-ink font-mono text-xs text-muted">
            No ledger entries found for filter &ldquo;{actionFilter}&rdquo;.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-surface-container-lowest border-editorial border-ink overflow-x-auto">
              <table className="w-full text-left font-mono text-xs" data-testid="credit-ledger-table">
                <thead className="bg-stone border-b border-ink uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Idempotency Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {rows.map((r) => (
                    <tr key={r.id} data-testid="ledger-row">
                      <td className="p-3 text-muted whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 border border-ink bg-paper text-[10px] font-bold uppercase">
                          {r.action}
                        </span>
                      </td>
                      <td className="p-3 text-ink">{r.reason}</td>
                      <td className={`p-3 font-bold ${r.amount >= 0 ? "text-success" : "text-error"}`}>
                        {r.amount >= 0 ? `+${r.amount}` : r.amount}
                      </td>
                      <td className="p-3 font-bold text-ink">{r.balance}</td>
                      <td className="p-3 text-[10px] text-muted">{r.idempotencyKey || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasNextPage && (
              <div className="text-center">
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="px-4 py-2 bg-stone border border-ink font-mono text-xs uppercase font-bold hover:bg-ink hover:text-on-primary cursor-pointer"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More Entries"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
