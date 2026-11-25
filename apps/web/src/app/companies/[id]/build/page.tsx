"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

export default function CompanyBuildPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const companyId = params.id;
  const queryRunId = searchParams.get("runId");

  const [liveLogs, setLiveLogs] = useState<Array<{ type: string; message: string; timestamp: string }>>([]);

  const {
    data: companyData,
    isLoading: companyLoading,
    isError: companyError,
    refetch: refetchCompany,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => api.getCompany(companyId),
    enabled: Boolean(companyId),
  });

  const activeRunId = queryRunId || companyData?.company?.latestRunId || "";

  const {
    data: runData,
    isLoading: runLoading,
    refetch: refetchRun,
  } = useQuery({
    queryKey: ["runtime-run", activeRunId],
    queryFn: () => api.getRuntimeRun(activeRunId),
    enabled: Boolean(activeRunId),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 4000;
    },
  });

  useEffect(() => {
    if (!activeRunId) return;
    const es = new EventSource(api.getStreamUrl(), { withCredentials: true });
    const handleEvent = (evt: MessageEvent) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed.runId && parsed.runId !== activeRunId) return;
        setLiveLogs((prev) => [
          {
            type: parsed.stage || parsed.type || evt.type,
            message: parsed.message || parsed.detail || JSON.stringify(parsed),
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);
        if (parsed.type === "run_completed" || parsed.type === "run_failed" || parsed.stage) {
          refetchRun();
          refetchCompany();
        }
      } catch {}
    };

    es.addEventListener("agent_stage", handleEvent);
    es.addEventListener("agent_log", handleEvent);
    es.addEventListener("run_completed", handleEvent);
    es.addEventListener("run_failed", handleEvent);
    es.onmessage = handleEvent;

    return () => es.close();
  }, [activeRunId, refetchCompany, refetchRun]);

  const company = companyData?.company;
  const completedStages: string[] = runData?.completedStages || [];
  const checkpoints: any[] = runData?.checkpoints || [];
  const artifacts: any[] = runData?.artifacts || [];

  return (
    <AppShell breadcrumb={company ? `${company.name} · Build` : "Build Pipeline"}>
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-4">
          <div>
            <Link href={`/companies/${companyId}`} className="font-mono text-xs text-link underline">
              ← Back to Company Overview
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mt-2">
              {company ? company.name : "Autonomous 8-Agent Build"}
            </h1>
            <p className="font-mono text-xs text-muted mt-1">
              RUN ID: {activeRunId || "PENDING"} · STATUS: {runData?.status || runData?.currentStage || "INITIALIZING"}
            </p>
          </div>
          <span className="px-3 py-1 border border-ink bg-accent-soft text-accent font-mono text-xs font-bold uppercase">
            {runData?.status === "COMPLETED" ? "BUILD COMPLETE" : "8-AGENT SWARM ACTIVE"}
          </span>
        </div>

        {companyLoading || (activeRunId && runLoading) ? (
          <div className="space-y-4">
            <div className="h-28 bg-stone animate-pulse border border-border-subtle" />
            <div className="h-56 bg-stone animate-pulse border border-border-subtle" />
          </div>
        ) : companyError ? (
          <div className="p-4 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
            <span>Failed to load company build status.</span>
            <button type="button" onClick={() => refetchCompany()} className="underline font-bold cursor-pointer">
              Retry
            </button>
          </div>
        ) : !activeRunId ? (
          <div className="p-8 bg-paper border-editorial border-ink text-center font-mono text-xs text-muted">
            No build run has been launched for this company yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-paper border-editorial border-ink space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest border-b border-border-subtle pb-2">
                AGENT STAGE PROGRESS ({completedStages.length}/8)
              </h2>
              {checkpoints.length === 0 && completedStages.length === 0 ? (
                <p className="font-mono text-xs text-muted">
                  Waiting for first agent checkpoint (current stage: {runData?.currentStage || "ARCHITECTING"})...
                </p>
              ) : (
                <ul className="space-y-2 font-mono text-xs">
                  {checkpoints.map((cp: any) => (
                    <li
                      key={cp.id}
                      className="p-3 bg-surface border border-ink flex items-center justify-between"
                    >
                      <span className="font-bold text-ink">{cp.stageName || cp.stage}</span>
                      <span className="text-success font-bold uppercase">{cp.status || "DONE"}</span>
                    </li>
                  ))}
                </ul>
              )}

              {artifacts.length > 0 && (
                <div className="pt-3 border-t border-border-subtle space-y-2">
                  <div className="font-mono text-[10px] uppercase font-bold text-muted">
                    GENERATED ARTIFACTS ({artifacts.length})
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
                    {artifacts.map((art: any) => (
                      <li key={art.id} className="truncate text-ink">
                        • {art.filePath}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 bg-paper border-editorial border-ink space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest border-b border-border-subtle pb-2">
                LIVE SWARM TELEMETRY
              </h2>
              {liveLogs.length === 0 ? (
                <p className="font-mono text-xs text-muted">
                  Listening on `/api/stream` for real-time agent events...
                </p>
              ) : (
                <ul className="space-y-2 font-mono text-[11px] max-h-96 overflow-y-auto">
                  {liveLogs.map((log, idx) => (
                    <li key={idx} className="p-2 bg-surface border border-border-subtle">
                      <span className="text-accent font-bold mr-2">[{log.type}]</span>
                      <span className="text-ink">{log.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
