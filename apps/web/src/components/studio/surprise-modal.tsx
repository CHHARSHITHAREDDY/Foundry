"use client";

import { useState } from "react";

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveBuild?: (idea: any) => void;
}

export function SurpriseModal({ isOpen, onClose, onApproveBuild }: SurpriseModalProps) {
  const [stage, setStage] = useState<"idle" | "scouting" | "generating" | "validating" | "ready">("idle");
  const [ideaData, setIdeaData] = useState<any>(null);
  const [isTweaking, setIsTweaking] = useState(false);
  const [tweakedTitle, setTweakedTitle] = useState("");
  const [tweakedProblem, setTweakedProblem] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  if (!isOpen) return null;

  const getApiEndpoint = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl.replace(/\/$/, "")}${path}`;
  };

  const runSurpriseMe = async () => {
    setErrorMessage(null);
    setStage("scouting");
    try {
      setTimeout(() => setStage("generating"), 600);
      setTimeout(() => setStage("validating"), 1200);

      const token = typeof window !== "undefined"
        ? localStorage.getItem("studio_token") || "vst_mock_jwt_session"
        : "vst_mock_jwt_session";

      let res: Response | null = null;
      try {
        // Direct Fastify API call
        res = await fetch(getApiEndpoint("/api/ideas/surprise"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
      } catch {
        // Fallback to Next.js proxy rewrite
        res = await fetch("/api/backend/ideas/surprise", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
      }

      if (!res || !res.ok) {
        throw new Error(`Failed to generate live idea: HTTP ${res?.status || "connection failed"}`);
      }

      const data = await res.json();
      setIdeaData(data);
      setTweakedTitle(data.selectedIdea?.title || "Scouted Opportunity");
      setTweakedProblem(data.selectedIdea?.problem || "");
      setStage("ready");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to reach backend reconnaissance server. Ensure API is running at http://localhost:3001.");
      setStage("idle");
    }
  };

  const handleNextCandidate = async () => {
    setIsFetchingNext(true);
    try {
      const currentId = ideaData?.selectedIdea?.id || "";
      let res: Response | null = null;
      try {
        res = await fetch(getApiEndpoint(`/api/ideas/next-candidate?currentId=${encodeURIComponent(currentId)}`));
      } catch {
        res = await fetch(`/api/backend/ideas/next-candidate?currentId=${encodeURIComponent(currentId)}`);
      }

      if (res && res.ok) {
        const nextIdea = await res.json();
        setIdeaData((prev: any) => ({
          ...prev,
          selectedIdea: nextIdea,
        }));
        setTweakedTitle(nextIdea.title || "Scouted Opportunity");
        setTweakedProblem(nextIdea.problem || "");
        setIsFetchingNext(false);
        return;
      }
    } catch { }
    // Fallback to fresh run if stream exhausted
    await runSurpriseMe();
    setIsFetchingNext(false);
  };

  const handleStart = () => {
    runSurpriseMe();
  };

  const handleApprove = () => {
    if (onApproveBuild && ideaData?.selectedIdea) {
      const ideaToBuild = {
        ...ideaData.selectedIdea,
        title: tweakedTitle || ideaData.selectedIdea.title,
        problem: tweakedProblem || ideaData.selectedIdea.problem,
      };
      onApproveBuild(ideaToBuild);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border-[2px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[1.5px] border-[#111111] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F25C05] inline-block animate-ping" />
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111]">
              WORKFLOW A // SURPRISE ME ENGINE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-[#EDEDEA] hover:bg-[#111111] hover:text-white font-mono text-[12px] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content based on stage */}
        {stage === "idle" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#EDEDEA] border-[1.5px] border-[#111111] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[#F25C05]">bolt</span>
            </div>
            <h3 className="font-headline text-[24px] font-bold text-[#111111] mb-2 font-serif">
              Autonomous Trend Scout &amp; Validator
            </h3>
            <p className="font-body text-[16px] text-[#474646] max-w-md mx-auto mb-6 font-serif">
              Our agent swarm will scour Hacker News discussions, GitHub feature requests, and Reddit communities to uncover real unserved market pain points.
            </p>
            {errorMessage && (
              <div className="mb-4 p-3 bg-[#FCE8E8] border border-error text-error text-left font-mono text-[12px]">
                <span className="font-bold">ERROR:</span> {errorMessage}
              </div>
            )}
            <button
              onClick={handleStart}
              className="h-12 px-8 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] border border-[#111111] hover:bg-[#F25C05] hover:border-[#F25C05] hover:shadow-[3px_3px_0px_0px_#111111] transition-all cursor-pointer font-bold"
            >
              INITIALIZE TREND SCOUT ➔
            </button>
          </div>
        )}

        {(stage === "scouting" || stage === "generating" || stage === "validating") && (
          <div className="py-12 text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-[#EDEDEA] px-4 py-2 border border-[#111111] font-mono text-[12px]">
              <span className="w-2.5 h-2.5 bg-[#F25C05] rounded-full animate-ping" />
              <span className="uppercase font-bold">
                {stage === "scouting" && "1/2 Scouring live Hacker News & GitHub discussions..."}
                {(stage === "generating" || stage === "validating") && "2/2 Synthesizing verified software opportunities..."}
              </span>
            </div>

            <div className="w-full bg-[#EDEDEA] border border-[#111111] h-3 p-0.5">
              <div
                className="bg-[#F25C05] h-full transition-all duration-700"
                style={{
                  width:
                    stage === "scouting" ? "45%" : "90%",
                }}
              />
            </div>
          </div>
        )}

        {stage === "ready" && ideaData?.selectedIdea && (
          <div className="space-y-5">
            {/* Top Badge & Status */}
            <div className="flex items-center justify-between bg-[#EDEDEA] p-3 border border-[#111111]">
              <div>
                <span className="font-mono text-[10px] text-[#5F5E5E] uppercase block">
                  SCOUTED OPPORTUNITY // FOR FOUNDER REVIEW
                </span>
                <span className="font-headline text-[20px] font-bold text-[#111111] font-serif">
                  {tweakedTitle || ideaData.selectedIdea.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#111111] text-white font-mono text-[11px] px-2.5 py-1 font-bold">
                  FOUNDER CHOICE
                </span>
              </div>
            </div>

            {/* Problem & Target */}
            <div className="bg-white border border-[#111111] p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase text-[#F25C05] font-bold block">
                    MARKET OPPORTUNITY
                  </span>
                  {ideaData.selectedIdea.sourcePainPoint?.source_type === "SAMPLE_SPECIMEN" ? (
                    <span className="bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-mono text-[9px] px-2 py-0.5 font-bold">
                      SAMPLE BENCHMARK SPECIMEN · UNVERIFIED
                    </span>
                  ) : ideaData.selectedIdea.sourcePainPoint?.citation_verified ? (
                    <span className="bg-[#DCFCE7] text-[#166534] border border-[#22C55E] font-mono text-[9px] px-2 py-0.5 font-bold">
                      LIVE RECONNAISSANCE · VERIFIED CITATION
                    </span>
                  ) : null}
                  {ideaData.selectedIdea.verdict?.status === "INSUFFICIENT_DATA" && (
                    <span className="bg-[#F3F4F6] text-[#374151] border border-[#9CA3AF] font-mono text-[9px] px-2 py-0.5 font-bold">
                      INSUFFICIENT DATA (2/5 ASSESSED)
                    </span>
                  )}
                </div>
                {isTweaking ? (
                  <textarea
                    value={tweakedProblem}
                    onChange={(e) => setTweakedProblem(e.target.value)}
                    className="w-full border border-[#111111] p-2 font-body text-[14px]"
                    rows={3}
                  />
                ) : (
                  <p className="font-body text-[15px] text-[#111111] leading-relaxed font-serif">
                    {tweakedProblem || ideaData.selectedIdea.problem}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#EDEDEA]">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#5F5E5E] font-bold block">
                    TARGET CUSTOMER
                  </span>
                  <p className="font-body text-[14px] text-[#111111]">
                    {ideaData.selectedIdea.targetCustomer}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#5F5E5E] font-bold block">
                    WHY NOW
                  </span>
                  <p className="font-body text-[14px] text-[#111111]">
                    {ideaData.selectedIdea.whyNow}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Viability & Unit Economics */}
            {ideaData.selectedIdea.financialModel && (
              <div className="bg-[#EDEDEA] border border-[#111111] p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-[#D6D5D0] pb-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#111111] flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#15803D] inline-block" />
                    MARKET GROWTH &amp; UNIT ECONOMICS
                  </span>
                  <span className="font-mono text-[10px] text-[#15803D] font-bold">
                    {ideaData.selectedIdea.financialModel.cagr}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-white border border-[#111111] p-1.5">
                    <span className="font-mono text-[9px] text-[#5F5E5E] uppercase block">TAM</span>
                    <span className="font-mono text-[12px] font-bold text-[#111111]">{ideaData.selectedIdea.financialModel.tam.split(" ")[0]}</span>
                  </div>
                  <div className="bg-white border border-[#111111] p-1.5">
                    <span className="font-mono text-[9px] text-[#5F5E5E] uppercase block">SAM</span>
                    <span className="font-mono text-[12px] font-bold text-[#111111]">{ideaData.selectedIdea.financialModel.sam.split(" ")[0]}</span>
                  </div>
                  <div className="bg-white border border-[#111111] p-1.5">
                    <span className="font-mono text-[9px] text-[#5F5E5E] uppercase block">LTV : CAC</span>
                    <span className="font-mono text-[12px] font-bold text-[#15803D]">
                      {ideaData.selectedIdea.financialModel.unitEconomics.ltvCacRatio}x
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-[#474646] pt-1">
                  <span>Payback: <strong className="text-[#111111]">{ideaData.selectedIdea.financialModel.unitEconomics.paybackMonths} mo</strong></span>
                  <span>Starter: <strong className="text-[#111111]">{ideaData.selectedIdea.financialModel.pricingTiers.starter}</strong></span>
                  <span>Pro: <strong className="text-[#111111]">{ideaData.selectedIdea.financialModel.pricingTiers.pro}</strong></span>
                  <span>Breakeven: <strong className="text-[#111111]">{ideaData.selectedIdea.financialModel.unitEconomics.breakevenCustomers} users</strong></span>
                </div>
              </div>
            )}

            {/* Citations & Evidence Links */}
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] font-bold block mb-2">
                VERIFIED EVIDENCE CITATIONS
              </span>
              <div className="space-y-2">
                {ideaData.selectedIdea.evidence?.map((ev: any, idx: number) => {
                  const sourceLabel = ev.source || ev.title || ev.type || "Community Signal";
                  const quoteSnippet = ev.quote || ev.snippet || "Reported in community discussion";
                  const sourceUrl = ev.url || "#";
                  return (
                    <a
                      key={idx}
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-[#EDEDEA] border border-[#111111] p-2 hover:bg-[#e4e2dd] transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-[#F25C05]">{sourceLabel}</span>
                        <span className="text-[#5F5E5E] underline truncate max-w-xs">{sourceUrl}</span>
                      </div>
                      <p className="font-body text-[13px] text-[#111111] italic mt-1 font-serif">
                        &quot;{quoteSnippet}&quot;
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Founder Validation Gate */}
            <div className="bg-[#EDEDEA] p-3 border border-[#111111] flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#111111] font-bold">FOUNDER EVALUATION:</span>
              <span className="text-[#15803D] font-bold uppercase">Human Decision Required · You Control What Gets Built</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#111111]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTweaking(!isTweaking)}
                  className="px-3 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA] cursor-pointer"
                >
                  {isTweaking ? "SAVE EDITS" : "TWEAK"}
                </button>
                <button
                  onClick={handleNextCandidate}
                  disabled={isFetchingNext}
                  className="px-3 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA] cursor-pointer disabled:opacity-50"
                >
                  {isFetchingNext ? "SCOUTING NEXT..." : "ANOTHER IDEA ➔"}
                </button>
              </div>

              <button
                onClick={handleApprove}
                className="px-6 py-2.5 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold border border-[#111111] hover:bg-[#F25C05] hover:border-[#F25C05] hover:shadow-[3px_3px_0px_0px_#111111] transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
              >
                <span>VALIDATE &amp; SHIP CODE</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
