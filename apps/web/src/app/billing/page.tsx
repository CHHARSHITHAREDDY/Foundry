"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";
import { BillingNav } from "@/components/billing/billing-nav";

export default function BillingOverviewPage() {
  const {
    data: credits,
    isLoading: creditsLoading,
    isError: creditsError,
    refetch: refetchCredits,
  } = useQuery({
    queryKey: ["billing", "credits"],
    queryFn: () => api.getCredits(),
  });

  const {
    data: pricing,
    isLoading: pricingLoading,
    isError: pricingError,
    refetch: refetchPricing,
  } = useQuery({
    queryKey: ["billing", "pricing"],
    queryFn: () => api.getPricing(),
  });

  return (
    <AppShell breadcrumb="Billing">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="border-b border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
            COMPUTE TREASURY
          </span>
          <h1 className="font-serif text-4xl font-bold text-ink mt-1">Billing &amp; Credits</h1>
        </div>

        <BillingNav />

        {creditsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-stone animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : creditsError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load credit balance.</span>
            <button type="button" onClick={() => refetchCredits()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Current Balance</span>
              <span className="font-serif text-4xl font-bold text-ink mt-1 block" data-testid="billing-balance">
                {credits?.balance ?? 0}
              </span>
              <Link href="/billing/credits" className="font-mono text-[11px] text-link underline mt-2 inline-block">
                Inspect Ledger →
              </Link>
            </div>
            <div className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Reserved in Active Runs</span>
              <span className="font-serif text-4xl font-bold text-ink mt-1 block">
                {credits?.reserved ?? 0}
              </span>
              <span className="font-mono text-[10px] text-muted mt-2 block">Held until completion</span>
            </div>
            <div className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Available</span>
              <span className="font-serif text-4xl font-bold text-ink mt-1 block">
                {credits?.available ?? 0}
              </span>
              <Link href="/billing/plans" className="font-mono text-[11px] text-accent font-bold underline mt-2 inline-block">
                Top up credits →
              </Link>
            </div>
          </div>
        )}

        {/* Server-Side Action Pricing */}
        <section className="space-y-3">
          <h2 className="font-mono text-xs uppercase font-bold text-ink border-b border-border-subtle pb-1">
            Action Credit Schedule (Server Config)
          </h2>

          {pricingLoading ? (
            <div className="h-40 bg-stone animate-pulse border border-border-subtle" />
          ) : pricingError ? (
            <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
              <span>Failed to load pricing schedule.</span>
              <button type="button" onClick={() => refetchPricing()} className="underline font-bold cursor-pointer">
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border-editorial border-ink divide-y divide-border-subtle">
              {(pricing?.items ?? []).map((item) => (
                <div key={item.action} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-ink">{item.label}</p>
                    <p className="font-serif text-sm text-muted">{item.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-stone border border-ink font-mono text-xs font-bold shrink-0">
                    {item.credits} CREDITS
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
