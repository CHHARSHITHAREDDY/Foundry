"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function CompanyOverviewPage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => api.getCompany(companyId),
    enabled: Boolean(companyId),
  });

  const company = data?.company;

  return (
    <AppShell breadcrumb={company ? company.name : "Company"}>
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-mono text-xs text-link underline">
            ← Back to Dashboard
          </Link>
          {company?.latestRunId && (
            <Link
              href={`/companies/${companyId}/build?runId=${encodeURIComponent(company.latestRunId)}`}
              className="px-4 py-2 bg-ink text-surface font-mono text-xs font-bold uppercase hover:bg-accent"
            >
              View 8-Agent Build →
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="h-48 bg-stone animate-pulse border border-border-subtle" />
        ) : isError || !company ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load company overview.</span>
            <button type="button" onClick={() => refetch()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : (
          <div className="p-6 bg-surface-container-lowest border-editorial border-ink shadow-editorial space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-stone border border-border-subtle font-bold">
                STATUS: {company.status}
              </span>
              <span className="font-mono text-[10px] text-muted">
                CREATED {new Date(company.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-ink">{company.name}</h1>
            <p className="font-serif text-base text-muted">{company.tagline}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle font-serif text-sm">
              <div>
                <div className="font-mono text-[10px] uppercase font-bold text-muted">PROBLEM</div>
                <p className="text-ink mt-1">{company.problem || "—"}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase font-bold text-muted">SLUG</div>
                <p className="font-mono text-ink mt-1">{company.slug}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
