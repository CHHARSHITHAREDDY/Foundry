"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

const SCORECARD_DIMS = [
  { key: "demand", label: "Demand Signal" },
  { key: "competition", label: "Competitive Gap" },
  { key: "differentiation", label: "Differentiation" },
  { key: "monetization", label: "Monetization" },
  { key: "buildability", label: "Buildability" },
] as const;

export default function IdeaCardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const [approveOpen, setApproveOpen] = useState(false);
  const [tweakOpen, setTweakOpen] = useState(false);
  const [tweakForm, setTweakForm] = useState({
    title: "",
    tagline: "",
    problem: "",
    persona: "",
    wedge: "",
  });
  const [rescoreDiff, setRescoreDiff] = useState<{ before: any; after: any } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["idea", id],
    queryFn: () => api.getIdea(id),
    enabled: Boolean(id),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["billing", "pricing"],
    queryFn: () => api.getPricing(),
    enabled: approveOpen,
  });

  const { data: creditsData } = useQuery({
    queryKey: ["billing", "credits"],
    queryFn: () => api.getCredits(),
    enabled: approveOpen,
  });

  const nextIdeaMutation = useMutation({
    mutationFn: () => api.getNextIdea(id),
    onSuccess: (res) => {
      router.push(`/ideas/${res.id}`);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.rejectIdea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      router.push("/new");
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.approveIdea(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      router.push(`/companies/${res.companyId}/build?runId=${encodeURIComponent(res.runId)}`);
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const tweakRescoreMutation = useMutation({
    mutationFn: async () => {
      await api.tweakIdea(id, tweakForm);
      return api.rescoreIdea(id);
    },
    onSuccess: (res) => {
      setRescoreDiff(res);
      queryClient.invalidateQueries({ queryKey: ["idea", id] });
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const idea = data?.idea;
  const buildCost = pricingData?.items.find((i) => i.action === "BUILD_COMPANY")?.credits ?? 25;
  const creditBalance = creditsData?.balance ?? 0;
  const hasEnoughCredits = creditBalance >= buildCost;

  const openTweak = () => {
    if (!idea) return;
    setTweakForm({
      title: idea.title || "",
      tagline: idea.tagline || "",
      problem: idea.problem || "",
      persona: idea.persona || "",
      wedge: idea.wedge || "",
    });
    setRescoreDiff(null);
    setActionError(null);
    setTweakOpen(true);
  };

  return (
    <AppShell breadcrumb={idea ? idea.title : "Idea Card"}>
      <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/new" className="font-mono text-xs text-link underline">
            ← Back to New Venture
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
            <Link
              href={`/ideas/${id}/evidence`}
              className="px-2.5 py-1 border border-ink bg-paper hover:bg-stone font-bold"
            >
              Evidence ({idea?.evidence?.length ?? 0})
            </Link>
            <Link
              href={`/ideas/${id}/competitors`}
              className="px-2.5 py-1 border border-ink bg-paper hover:bg-stone font-bold"
            >
              Competitors ({idea?.competitors?.length ?? 0})
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-stone animate-pulse border border-border-subtle" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 bg-stone animate-pulse border border-border-subtle" />
              <div className="h-64 bg-stone animate-pulse border border-border-subtle" />
            </div>
          </div>
        ) : isError || !idea ? (
          <div className="p-6 bg-error-soft border border-error text-error font-mono text-xs flex items-center justify-between">
            <span>Could not load idea details. It may not exist or belong to another account.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1 border border-error font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {actionError && (
              <div className="p-3 bg-error-soft border border-error text-error font-mono text-xs flex justify-between">
                <span>{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="underline font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {(idea.verdictLabel === "INSUFFICIENT_DATA" ||
              !idea.evidence?.length ||
              SCORECARD_DIMS.some((d) => idea.scorecard?.[d.key] === null)) && (
              <div className="p-4 bg-warning-soft border border-ink font-mono text-xs text-ink flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold uppercase mr-2">ADVISORY: LIMITED EVIDENCE</span>
                  <span>
                    One or more scorecard dimensions are NOT_ASSESSED due to limited live citations. You may still tweak or approve this concept.
                  </span>
                </div>
                <span className="px-2 py-0.5 border border-ink bg-paper font-bold uppercase text-[10px]">
                  {idea.verdictLabel}
                </span>
              </div>
            )}

            {/* Header Card */}
            <div className="p-6 bg-surface-container-lowest border-editorial border-ink shadow-editorial space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase">
                    <span className="px-2 py-0.5 bg-accent-soft text-accent border border-accent font-bold">
                      {idea.archetype || "VENTURE"}
                    </span>
                    <span className="px-2 py-0.5 bg-stone text-ink border border-border-subtle font-bold">
                      STATUS: {idea.ideaStatus}
                    </span>
                    <span
                      className={`px-2 py-0.5 border font-bold ${
                        idea.verdictLabel === "NO_GO_SIGNALS"
                          ? "bg-error-soft text-error border-error"
                          : idea.verdictLabel === "INSUFFICIENT_DATA"
                            ? "bg-warning-soft text-ink border-ink"
                            : "bg-success-soft text-success border-success"
                      }`}
                    >
                      VERDICT: {idea.verdictLabel}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">{idea.title}</h1>
                  <p className="font-serif text-base text-muted">{idea.tagline}</p>
                </div>

                <div className="text-right font-mono border border-ink bg-paper px-4 py-3">
                  <div className="text-[10px] uppercase text-muted">TOTAL SCORE</div>
                  <div className="text-3xl font-bold text-ink">
                    {idea.scorecard?.total !== null && idea.scorecard?.total !== undefined
                      ? `${idea.scorecard.total}`
                      : "N/A"}
                    <span className="text-sm text-muted font-normal">/100</span>
                  </div>
                  <div className="text-[10px] uppercase text-muted mt-1">
                    BASIS: {idea.scorecard?.basis || "NOT_ASSESSED"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setApproveOpen(true);
                  }}
                  disabled={approveMutation.isPending}
                  className="px-5 py-2.5 bg-ink text-surface font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
                >
                  Approve &amp; Build (8 Agents)
                </button>
                <button
                  type="button"
                  onClick={openTweak}
                  className="px-4 py-2.5 bg-paper border border-ink text-ink font-mono text-xs font-bold uppercase hover:bg-stone cursor-pointer"
                >
                  Tweak &amp; Rescore
                </button>
                <button
                  type="button"
                  onClick={() => nextIdeaMutation.mutate()}
                  disabled={nextIdeaMutation.isPending}
                  className="px-4 py-2.5 bg-paper border border-ink text-ink font-mono text-xs font-bold uppercase hover:bg-stone cursor-pointer disabled:opacity-50"
                >
                  {nextIdeaMutation.isPending ? "Finding Another..." : "Another Idea"}
                </button>
                <button
                  type="button"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="ml-auto px-4 py-2.5 bg-paper border border-error text-error font-mono text-xs font-bold uppercase hover:bg-error-soft cursor-pointer disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Thesis & Problem */}
              <div className="p-6 bg-paper border-editorial border-ink space-y-4">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest border-b border-border-subtle pb-2">
                  OPPORTUNITY THESIS
                </h2>
                <div className="space-y-3 text-sm font-serif">
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted font-bold">PROBLEM</div>
                    <p className="text-ink mt-0.5">{idea.problem}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted font-bold">TARGET PERSONA</div>
                    <p className="text-ink mt-0.5">{idea.persona}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted font-bold">JOB TO BE DONE</div>
                    <p className="text-ink mt-0.5">{idea.jobToBeDone || "—"}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted font-bold">WHY NOW</div>
                    <p className="text-ink mt-0.5">{idea.whyNow || "—"}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-muted font-bold">DISTRIBUTION WEDGE</div>
                    <p className="text-ink mt-0.5">{idea.wedge || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Scorecard */}
              <div className="p-6 bg-paper border-editorial border-ink space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest">
                    VALIDATION SCORECARD
                  </h2>
                  <span className="font-mono text-[10px] uppercase text-muted">
                    TYPE: {idea.scorecard?.scorecardType || "PROVISIONAL"}
                  </span>
                </div>
                <div className="space-y-3">
                  {SCORECARD_DIMS.map((dim) => {
                    const val: number | null | undefined = idea.scorecard?.[dim.key];
                    const isUnassessed = val === null || val === undefined;
                    const pct = isUnassessed ? 100 : Math.min(100, Math.max(0, (val / 20) * 100));
                    return (
                      <div key={dim.key} className="space-y-1">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="font-bold text-ink">{dim.label}</span>
                          <span className={isUnassessed ? "text-muted uppercase" : "text-ink font-bold"}>
                            {isUnassessed ? "NOT_ASSESSED" : `${val}/20`}
                          </span>
                        </div>
                        <div className="h-3 w-full border border-ink bg-surface overflow-hidden">
                          {isUnassessed ? (
                            <div
                              aria-label={`${dim.label} not assessed`}
                              className="h-full w-full bg-stone opacity-50"
                              style={{
                                backgroundImage:
                                  "repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)",
                              }}
                            />
                          ) : (
                            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {idea.scorecard?.sources?.length > 0 && (
                  <div className="pt-2 border-t border-border-subtle font-mono text-[10px] text-muted">
                    SOURCES: {idea.scorecard.sources.join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Evidence & Competitors Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-paper border-editorial border-ink space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest">
                    LIVE EVIDENCE CITATIONS
                  </h2>
                  <Link href={`/ideas/${id}/evidence`} className="font-mono text-xs text-link underline">
                    View All →
                  </Link>
                </div>
                {!idea.evidence?.length ? (
                  <p className="font-mono text-xs text-muted py-4">
                    No live external citations attached to this idea yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {idea.evidence.slice(0, 4).map((ev: any) => (
                      <li key={ev.id} className="p-3 bg-surface border border-border-subtle space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted">
                          <span>{ev.source}</span>
                          <span className={ev.citationVerified ? "text-success font-bold" : "text-warning"}>
                            {ev.citationVerified ? "VERIFIED URL" : "UNVERIFIED"}
                          </span>
                        </div>
                        <p className="font-serif text-xs text-ink">&ldquo;{ev.quote}&rdquo;</p>
                        <div className="flex items-center justify-between font-mono text-[10px] pt-1">
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-link underline truncate max-w-[260px]"
                          >
                            {ev.url}
                          </a>
                          {ev.sourceCreatedAt && (
                            <span className="text-muted">
                              {new Date(ev.sourceCreatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-6 bg-paper border-editorial border-ink space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest">
                    COMPETITORS &amp; PRICING
                  </h2>
                  <Link href={`/ideas/${id}/competitors`} className="font-mono text-xs text-link underline">
                    View All →
                  </Link>
                </div>
                {!idea.competitors?.length ? (
                  <p className="font-mono text-xs text-muted py-4">
                    No direct competitors verified in live search.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {idea.competitors.slice(0, 4).map((comp: any) => (
                      <li key={comp.id} className="p-3 bg-surface border border-border-subtle space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-sm text-ink">{comp.name}</span>
                          {comp.fetchedAt && (
                            <span className="font-mono text-[10px] text-muted">
                              Fetched {new Date(comp.fetchedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-link underline block truncate"
                        >
                          {comp.url}
                        </a>
                        {comp.pricingText && (
                          <div className="font-mono text-[11px] text-ink">
                            Pricing: {comp.pricingText}
                          </div>
                        )}
                        {comp.gap && (
                          <div className="font-serif text-xs text-muted">Gap: {comp.gap}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* MVP Scope */}
            {idea.mvpScope && (
              <div className="p-6 bg-paper border-editorial border-ink space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest">
                    DERIVED MVP SCOPE
                  </h2>
                  <span className="font-mono text-[10px] uppercase text-muted">
                    COMPLEXITY: {idea.mvpScope.estimatedComplexity || "STANDARD"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted mb-1">SCREENS</div>
                    <ul className="space-y-1 list-disc list-inside text-ink">
                      {(idea.mvpScope.screens || []).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted mb-1">CORE APIS</div>
                    <ul className="space-y-1 list-disc list-inside text-ink">
                      {(idea.mvpScope.coreApis || []).map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted mb-1">KEY FEATURES</div>
                    <ul className="space-y-1 list-disc list-inside text-ink">
                      {(idea.mvpScope.keyFeatures || []).map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Approve Modal */}
        {approveOpen && (
          <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h3 className="font-serif text-xl font-bold text-ink">Approve &amp; Launch Build</h3>
                <button
                  type="button"
                  onClick={() => setApproveOpen(false)}
                  className="font-mono text-xs underline cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="font-serif text-sm text-muted">
                Approving launches the 8-agent autonomous build swarm to architect, code, and verify{" "}
                <strong className="text-ink">{idea?.title}</strong>.
              </p>
              <div className="p-3 bg-paper border border-ink font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Build Cost:</span>
                  <span className="font-bold">{buildCost} CREDITS</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span className={`font-bold ${hasEnoughCredits ? "text-success" : "text-error"}`}>
                    {creditBalance} CREDITS
                  </span>
                </div>
              </div>

              {!hasEnoughCredits ? (
                <div className="p-3 bg-error-soft border border-error space-y-2">
                  <p className="font-mono text-xs text-error font-bold">
                    Insufficient credits to start an 8-agent company build.
                  </p>
                  <Link
                    href="/billing"
                    className="inline-block px-4 py-2 bg-ink text-surface font-mono text-xs font-bold uppercase"
                  >
                    Go to Billing &amp; Credits →
                  </Link>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApproveOpen(false)}
                    className="px-4 py-2 border border-ink font-mono text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 bg-ink text-surface font-mono text-xs font-bold uppercase hover:bg-accent cursor-pointer disabled:opacity-50"
                  >
                    {approveMutation.isPending ? "Launching..." : `Confirm (-${buildCost} Credits)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tweak & Rescore Modal */}
        {tweakOpen && (
          <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h3 className="font-serif text-xl font-bold text-ink">Tweak &amp; Rescore Idea</h3>
                <button
                  type="button"
                  onClick={() => setTweakOpen(false)}
                  className="font-mono text-xs underline cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <label className="block space-y-1">
                  <span className="uppercase font-bold text-muted">Title</span>
                  <input
                    value={tweakForm.title}
                    onChange={(e) => setTweakForm({ ...tweakForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-ink bg-paper text-ink"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="uppercase font-bold text-muted">Tagline</span>
                  <input
                    value={tweakForm.tagline}
                    onChange={(e) => setTweakForm({ ...tweakForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-ink bg-paper text-ink"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="uppercase font-bold text-muted">Problem</span>
                  <textarea
                    rows={3}
                    value={tweakForm.problem}
                    onChange={(e) => setTweakForm({ ...tweakForm, problem: e.target.value })}
                    className="w-full px-3 py-2 border border-ink bg-paper text-ink"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="uppercase font-bold text-muted">Target Persona</span>
                  <input
                    value={tweakForm.persona}
                    onChange={(e) => setTweakForm({ ...tweakForm, persona: e.target.value })}
                    className="w-full px-3 py-2 border border-ink bg-paper text-ink"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="uppercase font-bold text-muted">Wedge</span>
                  <input
                    value={tweakForm.wedge}
                    onChange={(e) => setTweakForm({ ...tweakForm, wedge: e.target.value })}
                    className="w-full px-3 py-2 border border-ink bg-paper text-ink"
                  />
                </label>
              </div>

              {rescoreDiff && (
                <div className="p-3 bg-success-soft border border-success font-mono text-xs space-y-1">
                  <div className="font-bold uppercase">RESCORE COMPLETE (BEFORE → AFTER)</div>
                  <div>
                    Total: {rescoreDiff.before?.total ?? "N/A"} → {rescoreDiff.after?.total ?? "N/A"}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {SCORECARD_DIMS.map((d) => (
                      <div key={d.key}>
                        {d.label}: {rescoreDiff.before?.[d.key] ?? "—"} → {rescoreDiff.after?.[d.key] ?? "—"}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTweakOpen(false)}
                  className="px-4 py-2 border border-ink font-mono text-xs uppercase cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => tweakRescoreMutation.mutate()}
                  disabled={tweakRescoreMutation.isPending}
                  className="px-4 py-2 bg-ink text-surface font-mono text-xs font-bold uppercase hover:bg-accent cursor-pointer disabled:opacity-50"
                >
                  {tweakRescoreMutation.isPending ? "Rescoring..." : "Save & Rescore"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
