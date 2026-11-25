"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

const STATUS_BADGE_MAP: Record<string, string> = {
  LIVE: "bg-success-soft text-success border-success",
  BUILDING: "bg-accent-soft text-accent border-accent",
  AWAITING_APPROVAL: "bg-warning-soft text-warning border-warning",
  FAILED: "bg-error-soft text-error border-error",
  DRAFT: "bg-stone text-muted border-border-subtle",
};

export default function DashboardPage() {
  const [search, setSearch] = useState("");

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.getDashboardSummary(),
  });

  const {
    data: companiesPages,
    isLoading: companiesLoading,
    isError: companiesError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchCompanies,
  } = useInfiniteQuery({
    queryKey: ["companies", "dashboard", search],
    queryFn: ({ pageParam }) =>
      api.getCompanies({ cursor: pageParam, limit: 8, search: search.trim() || undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const companies = companiesPages?.pages.flatMap((p) => p.companies) ?? [];
  const totalCompanies = companiesPages?.pages[0]?.total ?? 0;

  return (
    <AppShell breadcrumb="Dashboard">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8">
        {/* Top Masthead */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              EXECUTIVE BROADSHEET // LIVE TELEMETRY
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-ink mt-1">
              Studio Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/new/surprise"
              className="px-4 py-2 bg-ink text-on-primary border border-ink uppercase font-bold shadow-editorial-sm hover:bg-accent hover:border-accent transition-colors"
            >
              Surprise Me
            </Link>
            <Link
              href="/new/idea"
              className="px-4 py-2 bg-surface-container-lowest text-ink border border-ink uppercase font-bold hover:bg-stone transition-colors"
            >
              I Have an Idea
            </Link>
          </div>
        </div>

        {/* Stat Tiles from /api/dashboard/summary */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-stone border border-border-subtle animate-pulse" />
            ))}
          </div>
        ) : summaryError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex items-center justify-between">
            <span>Failed to load dashboard summary metrics.</span>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="px-3 py-1 bg-surface-container-lowest border border-error text-error font-bold uppercase cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Companies Live</span>
              <span className="font-serif text-3xl font-bold text-ink mt-1 block" data-testid="stat-companies-live">
                {summary?.companiesLive ?? 0}
              </span>
              <span className="font-mono text-[10px] text-muted mt-1 block">
                of {summary?.companiesTotal ?? 0} total
              </span>
            </div>

            <div className="bg-surface-container-lowest p-4 border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Tasks Done (7d)</span>
              <span className="font-serif text-3xl font-bold text-ink mt-1 block" data-testid="stat-tasks-done">
                {summary?.tasksDoneThisWeek ?? 0}
              </span>
              <span className="font-mono text-[10px] text-muted mt-1 block">Completed runs this week</span>
            </div>

            <div className="bg-surface-container-lowest p-4 border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Credits Used</span>
              <span className="font-serif text-3xl font-bold text-ink mt-1 block" data-testid="stat-credits-used">
                {summary?.creditsUsed ?? 0}
              </span>
              <span className="font-mono text-[10px] text-muted mt-1 block">
                {summary?.creditsBalance ?? 0} remaining
              </span>
            </div>

            <div className="bg-surface-container-lowest p-4 border-editorial border-ink shadow-editorial-sm">
              <span className="font-mono text-[10px] uppercase text-muted block">Visitors (7d)</span>
              <span className="font-serif text-3xl font-bold text-ink mt-1 block" data-testid="stat-visitors">
                {summary?.visitors7d === null || summary?.visitors7d === undefined ? "n/a" : summary.visitors7d}
              </span>
              <span className="font-mono text-[10px] text-muted mt-1 block">
                {summary?.visitors7d === null ? "No analytics ingest yet" : "Unique sessions"}
              </span>
            </div>
          </div>
        )}

        {/* Needs Your Attention */}
        {summary && summary.attentionItems.length > 0 && (
          <section className="space-y-3" data-testid="attention-section">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-ink border-b border-border-subtle pb-1">
              Needs Your Attention ({summary.attentionItems.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.attentionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-4 bg-warning-soft/50 border-editorial border-ink flex items-center justify-between gap-4 hover:bg-warning-soft transition-colors"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-ink">{item.title}</p>
                    <p className="font-serif text-sm text-muted">{item.description}</p>
                  </div>
                  <span className="font-mono text-xs text-link font-bold shrink-0">Open →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Companies Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-2">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-ink">
              Your Companies ({totalCompanies})
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter companies..."
              className="h-8 px-3 bg-surface-container-lowest border border-ink font-mono text-xs text-ink placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {companiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-stone border border-border-subtle animate-pulse" />
              ))}
            </div>
          ) : companiesError ? (
            <div className="p-6 bg-error-soft border border-error text-error font-mono text-xs flex items-center justify-between">
              <span>Failed to load your companies.</span>
              <button
                type="button"
                onClick={() => refetchCompanies()}
                className="px-3 py-1 bg-surface-container-lowest border border-error text-error font-bold uppercase cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : companies.length === 0 && !search ? (
            /* True Empty State with Two Start Cards */
            <div
              data-testid="dashboard-empty-state"
              className="p-8 border-editorial border-dashed border-ink bg-surface-container-lowest space-y-6"
            >
              <div className="text-center max-w-lg mx-auto space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
                  EMPTY WORKSPACE
                </span>
                <h3 className="font-serif text-2xl font-bold text-ink">Launch your first company</h3>
                <p className="font-serif text-sm text-muted">
                  Choose live market reconnaissance to uncover real pain points, or bring your own concept for validation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <Link
                  href="/new/surprise"
                  className="p-6 border-editorial border-ink bg-paper shadow-editorial hover:shadow-editorial-lg transition-all space-y-2 block"
                >
                  <span className="font-mono text-[10px] uppercase font-bold text-accent">OPTION A // AUTONOMOUS SCOUT</span>
                  <h4 className="font-serif text-xl font-bold text-ink">Surprise Me</h4>
                  <p className="font-serif text-sm text-muted">
                    Scour Hacker News, GitHub, Reddit, Stack Exchange, and Dev.to for verified user pain points.
                  </p>
                  <span className="inline-block pt-2 font-mono text-xs text-link font-bold">Start Scouting →</span>
                </Link>

                <Link
                  href="/new/idea"
                  className="p-6 border-editorial border-ink bg-paper shadow-editorial hover:shadow-editorial-lg transition-all space-y-2 block"
                >
                  <span className="font-mono text-[10px] uppercase font-bold text-link">OPTION B // FOUNDER BRIEF</span>
                  <h4 className="font-serif text-xl font-bold text-ink">I Have an Idea</h4>
                  <p className="font-serif text-sm text-muted">
                    Describe your target audience and product concept for structured critique and architecture.
                  </p>
                  <span className="inline-block pt-2 font-mono text-xs text-link font-bold">Enter Idea →</span>
                </Link>
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center border border-border-subtle bg-surface-container-lowest font-mono text-xs text-muted">
              No companies match &ldquo;{search}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-surface-container-lowest p-5 border-editorial border-ink shadow-editorial flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl font-bold text-ink">{company.name}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {company.demo && (
                            <span className="px-1.5 py-0.5 border border-warning bg-warning-soft text-warning font-mono text-[10px] font-bold uppercase">
                              DEMO
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 border font-mono text-[10px] font-bold uppercase ${
                              STATUS_BADGE_MAP[company.status] || STATUS_BADGE_MAP.DRAFT
                            }`}
                          >
                            {company.status}
                          </span>
                        </div>
                      </div>
                      <p className="font-serif text-sm text-muted line-clamp-2">
                        {company.tagline || "Autonomous venture workspace"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted">
                        Updated {new Date(company.lastActivityAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <Link href={`/companies/${company.id}`} className="text-link font-bold hover:underline">
                          Workspace →
                        </Link>
                        {company.latestRunId && (
                          <Link
                            href={`/preview/${company.latestRunId}`}
                            className="px-2.5 py-1 bg-ink text-on-primary text-[10px] uppercase font-bold hover:bg-accent"
                          >
                            Preview ↗
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasNextPage && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="px-4 py-2 bg-stone border border-ink font-mono text-xs uppercase font-bold hover:bg-ink hover:text-on-primary cursor-pointer"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More Companies"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
