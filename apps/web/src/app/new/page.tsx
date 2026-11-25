"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function NewVenturePage() {
  const { data: pricingData, isLoading: pricingLoading, isError: pricingError, refetch } = useQuery({
    queryKey: ["billing", "pricing"],
    queryFn: () => api.getPricing(),
  });

  const { data: draftsData } = useQuery({
    queryKey: ["ideas", "drafts"],
    queryFn: () => api.getIdeaDrafts(),
  });

  const surpriseCost = pricingData?.items.find((i) => i.action === "SURPRISE_SCOUT")?.credits;
  const customCost = pricingData?.items.find((i) => i.action === "IDEA_VALIDATE")?.credits;
  const drafts = draftsData?.drafts ?? [];

  return (
    <AppShell breadcrumb="New Company">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
        <div className="border-b border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
            VENTURE GENESIS
          </span>
          <h1 className="font-serif text-4xl font-bold text-ink mt-1">Start a New Company</h1>
          <p className="font-serif text-sm text-muted mt-1">
            Discover an evidence-backed opportunity from live discussions or validate your own concept.
          </p>
        </div>

        {pricingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56 bg-stone animate-pulse border border-border-subtle" />
            <div className="h-56 bg-stone animate-pulse border border-border-subtle" />
          </div>
        ) : pricingError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load action pricing.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/new/surprise"
              className="p-6 bg-surface-container-lowest border-editorial border-ink shadow-editorial hover:shadow-editorial-lg transition-all flex flex-col justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-accent bg-accent-soft px-2 py-0.5 border border-accent">
                    LIVE RECONNAISSANCE
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    {surpriseCost !== undefined ? `${surpriseCost} CREDITS` : "—"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-ink">Surprise Me</h2>
                <p className="font-serif text-sm text-muted">
                  Scour Hacker News, GitHub, Reddit, Stack Exchange, and Dev.to, verify every citation, and synthesize 3 critiqued angles.
                </p>
              </div>
              <span className="font-mono text-xs text-link font-bold">Start Scouting →</span>
            </Link>

            <Link
              href="/new/idea"
              className="p-6 bg-surface-container-lowest border-editorial border-ink shadow-editorial hover:shadow-editorial-lg transition-all flex flex-col justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-link bg-link-soft px-2 py-0.5 border border-link">
                    FOUNDER BRIEF
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    {customCost !== undefined ? `${customCost} CREDITS` : "—"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-ink">I Have an Idea</h2>
                <p className="font-serif text-sm text-muted">
                  Describe your idea in plain English, answer up to 3 clarifying questions, and run competitor &amp; scorecard validation.
                </p>
              </div>
              <span className="font-mono text-xs text-link font-bold">Enter Idea →</span>
            </Link>
          </div>
        )}

        {/* Resume Draft Link — ONLY if a draft exists */}
        {drafts.length > 0 && (
          <section className="p-5 bg-stone border-editorial border-ink space-y-3">
            <h3 className="font-mono text-xs uppercase font-bold text-ink">
              Resume Draft ({drafts.length})
            </h3>
            <div className="space-y-2">
              {drafts.map((d) => (
                <Link
                  key={d.id}
                  href={`/new/idea?draft=${encodeURIComponent(d.id)}`}
                  className="block p-3 bg-surface-container-lowest border border-ink hover:bg-paper font-mono text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-ink truncate pr-4">{d.title}</span>
                  <span className="text-link shrink-0">Resume Draft →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
