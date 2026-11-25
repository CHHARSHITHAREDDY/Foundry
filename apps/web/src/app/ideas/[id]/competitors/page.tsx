"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function IdeaCompetitorsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["idea", id, "competitors"],
    queryFn: () => api.getIdeaCompetitors(id),
    enabled: Boolean(id),
  });

  const competitors = data?.competitors ?? [];

  return (
    <AppShell breadcrumb="Competitors">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-ink pb-4">
          <div>
            <Link href={`/ideas/${id}`} className="font-mono text-xs text-link underline">
              ← Back to Idea Card
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mt-2">
              {data?.title ? `Competitors: ${data.title}` : "Competitor Analysis"}
            </h1>
          </div>
          <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 border border-ink bg-paper">
            {competitors.length} COMPETITORS
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 bg-stone animate-pulse border border-border-subtle" />
            <div className="h-24 bg-stone animate-pulse border border-border-subtle" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load competitor records.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : competitors.length === 0 ? (
          <div className="p-8 bg-paper border-editorial border-ink text-center font-mono text-xs text-muted">
            No live competitor records found for this idea.
          </div>
        ) : (
          <div className="space-y-4">
            {competitors.map((comp: any) => (
              <div key={comp.id} className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-xl font-bold text-ink">{comp.name}</h2>
                  {comp.fetchedAt && (
                    <span className="font-mono text-[10px] uppercase text-muted">
                      Fetched {new Date(comp.fetchedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <a
                  href={comp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-link underline break-all block"
                >
                  {comp.url}
                </a>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border-subtle text-xs">
                  <div>
                    <div className="font-mono text-[10px] uppercase font-bold text-muted">PRICING SIGNAL</div>
                    <p className="font-mono text-ink mt-0.5">{comp.pricingText || "Not detected on fetched page"}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase font-bold text-muted">POSITIONING GAP</div>
                    <p className="font-serif text-ink mt-0.5">{comp.gap || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
