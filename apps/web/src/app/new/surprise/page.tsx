"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

interface PainPointEvent {
  id: string;
  source: string;
  url: string;
  quote: string;
  problem: string;
  createdAt: string;
}

interface DroppedEvent {
  title: string;
  archetype: string;
  reason: string;
}

interface TopCandidate {
  id: string;
  title: string;
  tagline: string;
  archetype: string;
  verdictLabel: string;
}

export default function SurpriseScoutPage() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "insufficient" | "error" | "cancelled">("idle");
  const [sourcesSummary, setSourcesSummary] = useState<Record<string, number> | null>(null);
  const [windowDaysUsed, setWindowDaysUsed] = useState<number | null>(null);
  const [painPoints, setPainPoints] = useState<PainPointEvent[]>([]);
  const [droppedLog, setDroppedLog] = useState<DroppedEvent[]>([]);
  const [topCandidates, setTopCandidates] = useState<TopCandidate[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refundedCredits, setRefundedCredits] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  const connectStream = (id: string) => {
    esRef.current?.close();
    const es = new EventSource(api.getIdeaJobStreamUrl(id), { withCredentials: true });
    esRef.current = es;

    es.addEventListener("idea:sources", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setSourcesSummary(data.sourcesSummary || {});
      setWindowDaysUsed(data.windowDaysUsed ?? null);
    });

    es.addEventListener("idea:pain_point", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setPainPoints((prev) => (prev.some((p) => p.url === data.url) ? prev : [...prev, data]));
    });

    es.addEventListener("idea:dropped", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setDroppedLog((prev) => [...prev, data]);
    });

    es.addEventListener("idea:completed", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setTopCandidates(data.topCandidates || []);
      setStatus("completed");
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
      es.close();
    });

    es.addEventListener("idea:insufficient", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setErrorMsg(data.message || "No fresh signals found, try again.");
      setRefundedCredits(data.refunded ?? 5);
      setStatus("insufficient");
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
      es.close();
    });

    es.addEventListener("idea:error", (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      setErrorMsg(data.message || "Scouting pipeline failed.");
      setRefundedCredits(data.refunded ?? 5);
      setStatus("error");
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
      es.close();
    });
  };

  const handleStart = async () => {
    setStatus("running");
    setErrorMsg(null);
    setRefundedCredits(null);
    setSourcesSummary(null);
    setPainPoints([]);
    setDroppedLog([]);
    setTopCandidates([]);

    try {
      const res = await api.startSurprise(8);
      setJobId(res.jobId);
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
      connectStream(res.jobId);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to start scouting job.");
    }
  };

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await api.cancelIdeaJob(jobId);
      esRef.current?.close();
      setStatus("cancelled");
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
    } catch {}
  };

  return (
    <AppShell breadcrumb="New / Surprise Me">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              LIVE MARKET RECONNAISSANCE
            </span>
            <h1 className="font-serif text-4xl font-bold text-ink mt-1">Surprise Me Scout</h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {status === "running" ? (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-error-soft text-error border border-error uppercase font-bold cursor-pointer"
              >
                Cancel Job
              </button>
            ) : (
              <button
                type="button"
                data-testid="start-scouting-btn"
                onClick={handleStart}
                className="px-5 py-2.5 bg-ink text-on-primary border border-ink uppercase font-bold shadow-editorial-sm hover:bg-accent hover:border-accent cursor-pointer"
              >
                {status === "idle" ? "Start Scouting" : "Run Fresh Scout"}
              </button>
            )}
          </div>
        </div>

        {status === "idle" && (
          <div className="p-8 bg-surface-container-lowest border-editorial border-ink shadow-editorial space-y-3">
            <h2 className="font-serif text-2xl font-bold text-ink">Ready to scour live sources</h2>
            <p className="font-serif text-sm text-muted max-w-2xl">
              Clicking Start Scouting queries Hacker News, GitHub, Reddit, Stack Exchange, and Dev.to, re-fetches every URL to verify quotes, clusters pain points by embedding, and runs 3-pass divergent synthesis + critique.
            </p>
          </div>
        )}

        {status === "insufficient" && (
          <div className="p-6 bg-warning-soft border-editorial border-warning space-y-2 font-mono text-xs" data-testid="insufficient-banner">
            <p className="font-bold text-warning uppercase">INSUFFICIENT_LIVE_DATA</p>
            <p className="text-ink">{errorMsg || "No fresh signals found, try again."}</p>
            {refundedCredits !== null && (
              <p className="text-success font-bold">
                ✓ {refundedCredits} credits refunded to your ledger.
              </p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="p-6 bg-error-soft border-editorial border-error space-y-2 font-mono text-xs">
            <p className="font-bold text-error uppercase">SCOUT ERROR</p>
            <p className="text-ink">{errorMsg}</p>
            {refundedCredits !== null && (
              <p className="text-success font-bold">✓ {refundedCredits} credits refunded.</p>
            )}
            <button type="button" onClick={handleStart} className="underline text-link font-bold cursor-pointer">
              Retry Scouting
            </button>
          </div>
        )}

        {status === "cancelled" && (
          <div className="p-4 bg-stone border border-ink font-mono text-xs text-ink">
            Scouting job cancelled. Reserved credits will be refunded.
          </div>
        )}

        {/* Sources Queried Counts */}
        {(status === "running" || sourcesSummary) && (
          <section className="space-y-2">
            <h2 className="font-mono text-xs uppercase font-bold text-ink">
              1. Live Sources Queried {windowDaysUsed ? `(${windowDaysUsed}-day window)` : ""}
            </h2>
            {!sourcesSummary ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-stone animate-pulse border border-border-subtle" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono">
                {Object.entries(sourcesSummary).map(([src, count]) => (
                  <div key={src} className="p-3 bg-surface-container-lowest border border-ink">
                    <span className="text-[10px] uppercase text-muted block">{src}</span>
                    <span className="text-xl font-bold text-ink">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Live Verified Pain Points */}
        {painPoints.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-mono text-xs uppercase font-bold text-ink">
              2. Verified Pain Points ({painPoints.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {painPoints.map((pp) => (
                <div key={pp.url} className="p-4 bg-surface-container-lowest border border-ink space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 bg-stone border border-ink uppercase font-bold">{pp.source}</span>
                    <span className="text-muted">{new Date(pp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-serif text-sm font-bold text-ink">{pp.problem}</p>
                  <p className="font-serif text-xs text-muted italic line-clamp-2">&ldquo;{pp.quote}&rdquo;</p>
                  <a
                    href={pp.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-link hover:underline inline-block"
                  >
                    Open Source ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Critique Dropped Log */}
        {droppedLog.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-mono text-xs uppercase font-bold text-ink">
              3. Critique Pass — Dropped Generic Angles ({droppedLog.length})
            </h2>
            <div className="bg-surface-container-lowest border border-ink divide-y divide-border-subtle font-mono text-xs">
              {droppedLog.map((d, i) => (
                <div key={i} className="p-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-ink">
                    {d.title} <span className="text-muted font-normal">({d.archetype})</span>
                  </span>
                  <span className="text-error text-[11px]">{d.reason}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final Top 3 Candidates */}
        {topCandidates.length > 0 && (
          <section className="space-y-3" data-testid="top-candidates-section">
            <h2 className="font-mono text-xs uppercase font-bold text-success">
              4. Top Validated Opportunities ({topCandidates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/ideas/${c.id}`}
                  data-testid={`candidate-card-${c.id}`}
                  className="p-5 bg-surface-container-lowest border-editorial border-ink shadow-editorial hover:shadow-editorial-lg transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 bg-accent-soft text-accent border border-accent uppercase font-bold">
                        {c.archetype}
                      </span>
                      <span className="text-muted uppercase">{c.verdictLabel}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-ink">{c.title}</h3>
                    <p className="font-serif text-sm text-muted">{c.tagline}</p>
                  </div>
                  <span className="font-mono text-xs text-link font-bold">Inspect Evidence &amp; Approve →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
