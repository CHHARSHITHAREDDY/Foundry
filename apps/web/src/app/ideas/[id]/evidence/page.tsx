"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function IdeaEvidencePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["idea", id, "evidence"],
    queryFn: () => api.getIdeaEvidence(id),
    enabled: Boolean(id),
  });

  const evidence = data?.evidence ?? [];

  return (
    <AppShell breadcrumb="Evidence Citations">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-ink pb-4">
          <div>
            <Link href={`/ideas/${id}`} className="font-mono text-xs text-link underline">
              ← Back to Idea Card
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mt-2">
              {data?.title ? `Evidence: ${data.title}` : "Evidence Citations"}
            </h1>
          </div>
          <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 border border-ink bg-paper">
            {evidence.length} CITATIONS
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 bg-stone animate-pulse border border-border-subtle" />
            <div className="h-24 bg-stone animate-pulse border border-border-subtle" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load evidence citations.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : evidence.length === 0 ? (
          <div className="p-8 bg-paper border-editorial border-ink text-center font-mono text-xs text-muted">
            No live evidence citations are recorded for this idea.
          </div>
        ) : (
          <ul className="space-y-4">
            {evidence.map((ev: any) => (
              <li key={ev.id} className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase">
                  <span className="px-2 py-0.5 bg-stone border border-border-subtle font-bold text-ink">
                    {ev.source}
                  </span>
                  <div className="flex items-center gap-3">
                    {ev.sourceCreatedAt && (
                      <span className="text-muted">
                        Published: {new Date(ev.sourceCreatedAt).toLocaleString()}
                      </span>
                    )}
                    <span className={ev.citationVerified ? "text-success font-bold" : "text-warning font-bold"}>
                      {ev.citationVerified ? "URL VERIFIED" : "UNVERIFIED"}
                    </span>
                  </div>
                </div>
                <blockquote className="font-serif text-sm text-ink border-l-2 border-accent pl-3">
                  &ldquo;{ev.quote}&rdquo;
                </blockquote>
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-link underline break-all block"
                >
                  {ev.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
