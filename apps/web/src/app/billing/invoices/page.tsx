"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";
import { BillingNav } from "@/components/billing/billing-nav";

export default function BillingInvoicesPage() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["billing", "invoices"],
    queryFn: ({ pageParam }) => api.getInvoices(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const invoices = data?.pages.flatMap((p) => p.invoices) ?? [];

  return (
    <AppShell breadcrumb="Billing / Invoices">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="border-b border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
            PAYMENT RECEIPTS
          </span>
          <h1 className="font-serif text-4xl font-bold text-ink mt-1">Invoices</h1>
        </div>

        <BillingNav />

        {isLoading ? (
          <div className="h-40 bg-stone animate-pulse border border-border-subtle" />
        ) : isError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load invoices.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center bg-surface-container-lowest border-editorial border-ink font-mono text-xs text-muted">
            No invoices yet. Purchases made through Plans &amp; Top-Up will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-surface-container-lowest border-editorial border-ink overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-stone border-b border-ink uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-3 text-muted">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-ink">{inv.description}</td>
                      <td className="p-3 font-bold">+{inv.creditsGranted}</td>
                      <td className="p-3">\${(inv.amountCents / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 border border-success bg-success-soft text-success text-[10px] font-bold">
                          {inv.status}
                        </span>
                      </td>
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
                  className="px-4 py-2 bg-stone border border-ink font-mono text-xs uppercase font-bold cursor-pointer"
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
