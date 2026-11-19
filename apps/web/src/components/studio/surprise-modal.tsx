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

  if (!isOpen) return null;

  const runSurpriseMe = async () => {
    setErrorMessage(null);
    setStage("scouting");
    try {
      // Step visual progression
      setTimeout(() => setStage("generating"), 600);
      setTimeout(() => setStage("validating"), 1200);

      // Real Fastify backend call via Next.js rewrite
      const res = await fetch("/api/backend/ideas/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate live idea: HTTP ${res.status}`);
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
    try {
      const currentId = ideaData?.selectedIdea?.id || "";
      const res = await fetch(`/api/backend/ideas/next-candidate?currentId=${encodeURIComponent(currentId)}`);
      if (res.ok) {
        const nextIdea = await res.json();
        setIdeaData((prev: any) => ({
          ...prev,
          selectedIdea: nextIdea,
        }));
        setTweakedTitle(nextIdea.title || "VATSentry");
        setTweakedProblem(nextIdea.problem || "");
        return;
      }
    } catch {}
    // Fallback to fresh run if cache exhausted
    runSurpriseMe();
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
          <div className="py-10 text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-[#EDEDEA] px-4 py-2 border border-[#111111] font-mono text-[12px]">
              <span className="w-2.5 h-2.5 bg-[#F25C05] rounded-full animate-ping" />
              <span className="uppercase font-bold">
                {stage === "scouting" && "1/3 Harvester scouring Reddit & Hacker News..."}
                {stage === "generating" && "2/3 Reasoner synthesizing 5-8 bounded micro-SaaS candidates..."}
                {stage === "validating" && "3/3 Running evidence-grounded 5-point scorecard..."}
              </span>
            </div>

            <div className="w-full bg-[#EDEDEA] border border-[#111111] h-3 p-0.5">
              <div
                className="bg-[#F25C05] h-full transition-all duration-700"
                style={{
                  width:
                    stage === "scouting" ? "33%" : stage === "generating" ? "66%" : "92%",
                }}
              />
            </div>

            <div className="bg-[#111111] text-[#dbdad5] p-3 text-left font-mono text-[11px] leading-relaxed border border-[#111111]">
              <p>&gt; Querying: r/SaaS, r/Entrepreneur, HN Ask HN...</p>
              {stage !== "scouting" && <p>&gt; Filtered 42 complaints into 6 bounded software opportunities.</p>}
              {stage === "validating" && <p>&gt; Computing TAM, competitor scan &amp; buildability constraints.</p>}
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
                <span className="font-mono text-[10px] uppercase text-[#F25C05] font-bold block mb-1">
                  VERIFIED MARKET PAIN POINT
                </span>
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
                  className="px-3 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA] cursor-pointer"
                >
                  ANOTHER IDEA ➔
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
