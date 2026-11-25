"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";
import { BillingNav } from "@/components/billing/billing-nav";
import type { BillingPlan } from "@venture-studio/contracts";

export default function BillingPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => api.getPlans(),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.createCheckout({ planId }),
    onSuccess: (res) => {
      if (res.checkoutUrl && typeof window !== "undefined") {
        window.location.href = res.checkoutUrl;
      }
    },
    onError: (err: any) => {
      if (err instanceof ApiError) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError("Unable to start checkout session.");
      }
    },
  });

  const plans = data?.plans ?? [];

  return (
    <AppShell breadcrumb="Billing / Plans">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              CREDIT PACKAGES
            </span>
            <h1 className="font-serif text-4xl font-bold text-ink mt-1">Plans &amp; Top-Up</h1>
          </div>
          {data && (
            <span className="px-2.5 py-1 border border-ink bg-stone font-mono text-[11px] uppercase font-bold">
              Provider Mode: {data.mode}
            </span>
          )}
        </div>

        <BillingNav />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-stone animate-pulse border border-border-subtle" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load plans.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest border-editorial border-ink font-mono text-xs text-muted">
            No billing plans configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface-container-lowest p-6 border-editorial border-ink shadow-editorial flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <span className="font-mono text-xs uppercase font-bold text-accent">{plan.name}</span>
                  <div className="font-serif text-4xl font-bold text-ink">
                    \${(plan.priceMonthlyCents / 100).toFixed(0)}
                    <span className="font-mono text-xs text-muted font-normal"> / pack</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-ink">{plan.credits} Compute Credits</p>
                  <ul className="space-y-1.5 font-mono text-xs text-muted pt-2 border-t border-border-subtle">
                    {plan.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutError(null);
                    setSelectedPlan(plan);
                  }}
                  className="w-full h-10 bg-ink text-on-primary font-mono text-xs uppercase font-bold border border-ink hover:bg-accent hover:border-accent cursor-pointer"
                >
                  Select {plan.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Checkout Modal */}
        {selectedPlan && (
          <div
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPlan(null)}
          >
            <div
              className="w-full max-w-md bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 space-y-4 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-ink pb-3">
                <h2 className="font-serif text-2xl font-bold text-ink">Checkout: {selectedPlan.name}</h2>
                <button type="button" onClick={() => setSelectedPlan(null)} className="text-xs cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="p-3 bg-paper border border-border-subtle text-xs space-y-1">
                <p>
                  <strong>Credits:</strong> {selectedPlan.credits}
                </p>
                <p>
                  <strong>Amount:</strong> \${(selectedPlan.priceMonthlyCents / 100).toFixed(2)}
                </p>
                <p>
                  <strong>Provider Status:</strong> {data?.providerConfigured ? `${data.mode} MODE` : "NOT CONFIGURED"}
                </p>
              </div>

              {!data?.providerConfigured && (
                <div className="p-3 bg-warning-soft border border-warning text-warning text-xs">
                  Payment provider keys (STRIPE_SECRET_KEY) are not configured. Checkout will return HTTP 501.
                </div>
              )}

              {checkoutError && (
                <div role="alert" className="p-3 bg-error-soft border border-error text-error text-xs">
                  {checkoutError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2 border border-ink bg-paper text-xs uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={checkoutMutation.isPending}
                  onClick={() => checkoutMutation.mutate(selectedPlan.id)}
                  className="px-4 py-2 bg-ink text-on-primary border border-ink text-xs uppercase font-bold hover:bg-accent cursor-pointer disabled:opacity-50"
                >
                  {checkoutMutation.isPending ? "Starting..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
