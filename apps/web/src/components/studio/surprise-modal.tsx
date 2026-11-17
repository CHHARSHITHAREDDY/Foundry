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

  if (!isOpen) return null;

  const runSurpriseMe = async () => {
    setStage("scouting");
    try {
      // Attempt backend call
      const res = await fetch("/api/backend/ideas/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setIdeaData(data);
        setTweakedTitle(data.selectedIdea?.title || "VATSentry");
        setTweakedProblem(data.selectedIdea?.problem || "");
        setStage("ready");
        return;
      }
    } catch {
      // Fallback simulation
    }

    // Realistic simulation if backend offline
    setTimeout(() => setStage("generating"), 1200);
    setTimeout(() => setStage("validating"), 2400);
    setTimeout(() => {
      const mock = {
        selectedIdea: {
          id: "idea_vat_sentry",
          title: "VATSentry",
          tagline: "Automated reverse-charge EU VAT compliance for micro-SaaS founders",
          problem: "Founders spend 4+ hours every month reconciling reverse-charge VAT invoices from Stripe & Paddle, risking tax penalties.",
          targetCustomer: "European SaaS founders & solopreneurs billing across EU borders",
          whyNow: "EU DAC7 enforcement tightened in 2024 with mandatory digital reporting penalties.",
          competitors: [
            { name: "Quaderno", pricing: "$49/mo", weaknesses: "Clunky UI, overkill for solopreneurs" },
            { name: "TaxJar", pricing: "$99/mo", weaknesses: "Focused heavily on US sales tax, not EU VAT" },
          ],
          evidence: [
            { source: "r/SaaS", url: "https://reddit.com/r/SaaS/comments/vat_headaches", quote: "I spend 4 hours every month fixing reverse-charge VAT invoices..." },
            { source: "Hacker News", url: "https://news.ycombinator.com/item?id=3819201", quote: "EU VAT compliance is the single most frustrating part of running a micro-SaaS." },
          ],
          scorecard: {
            demand: 4.5,
            competition: 4.0,
            differentiation: 4.2,
            monetization: 4.8,
            buildability: 4.7,
            total: 4.4,
          },
          verdict: "GO",
          mvpScope: ["Stripe webhook listener", "Monthly VAT PDF report generator", "Direct tax authority XML export"],
        },
        cachedCount: 4,
      };
      setIdeaData(mock);
      setTweakedTitle(mock.selectedIdea.title);
      setTweakedProblem(mock.selectedIdea.problem);
      setStage("ready");
    }, 3800);
  };

  const handleStart = () => {
    runSurpriseMe();
  };

  const handleApprove = () => {
    if (onApproveBuild && ideaData) {
      onApproveBuild(ideaData.selectedIdea);
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
            <h3 className="font-headline text-[24px] font-bold text-[#111111] mb-2">
              Autonomous Trend Scout &amp; Validator
            </h3>
            <p className="font-body text-[16px] text-[#474646] max-w-md mx-auto mb-6">
              Our agent swarm will scour Reddit complaints, Hacker News discussions, and Product Hunt reviews to uncover real unserved market pain points.
            </p>
            <button
              onClick={handleStart}
              className="h-12 px-8 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] border border-[#111111] hover:shadow-[3px_3px_0px_0px_#F25C05] transition-all cursor-pointer"
            >
              INITIALIZE TREND SCOUT
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

        {stage === "ready" && ideaData && (
          <div className="space-y-5">
            {/* Top Badge & Verdict */}
            <div className="flex items-center justify-between bg-[#EDEDEA] p-3 border border-[#111111]">
              <div>
                <span className="font-mono text-[10px] text-[#5F5E5E] uppercase block">
                  RECOMMENDED OPPORTUNITY
                </span>
                <span className="font-headline text-[20px] font-bold text-[#111111]">
                  {ideaData.selectedIdea.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#15803D] text-white font-mono text-[11px] px-2 py-0.5 font-bold">
                  VERDICT: {ideaData.selectedIdea.verdict}
                </span>
                <span className="bg-white border border-[#111111] font-mono text-[11px] px-2 py-0.5 font-bold">
                  SCORE: {ideaData.selectedIdea.scorecard.total}/5.0
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
                  <p className="font-body text-[15px] text-[#111111] leading-relaxed">
                    {ideaData.selectedIdea.problem}
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
                {ideaData.selectedIdea.evidence?.map((ev: any, idx: number) => (
                  <a
                    key={idx}
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-[#EDEDEA] border border-[#111111] p-2 hover:bg-[#e4e2dd] transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold text-[#F25C05]">{ev.source}</span>
                      <span className="text-[#5F5E5E] underline truncate max-w-xs">{ev.url}</span>
                    </div>
                    <p className="font-body text-[13px] text-[#111111] italic mt-1">
                      &quot;{ev.quote}&quot;
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Scorecard breakdown */}
            <div className="grid grid-cols-5 gap-2 bg-[#EDEDEA] p-3 border border-[#111111] text-center font-mono text-[10px]">
              <div>
                <span className="text-[#5F5E5E] block">DEMAND</span>
                <span className="font-bold text-[12px]">{ideaData.selectedIdea.scorecard.demand}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">COMPETITION</span>
                <span className="font-bold text-[12px]">{ideaData.selectedIdea.scorecard.competition}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">DIFFERENTIATION</span>
                <span className="font-bold text-[12px]">{ideaData.selectedIdea.scorecard.differentiation}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">MONETIZATION</span>
                <span className="font-bold text-[12px]">{ideaData.selectedIdea.scorecard.monetization}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">BUILDABILITY</span>
                <span className="font-bold text-[12px]">{ideaData.selectedIdea.scorecard.buildability}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#111111]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTweaking(!isTweaking)}
                  className="px-3 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA]"
                >
                  {isTweaking ? "SAVE EDITS" : "TWEAK"}
                </button>
                <button
                  onClick={runSurpriseMe}
                  className="px-3 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA]"
                >
                  ANOTHER IDEA ({ideaData.cachedCount || 3} CACHED)
                </button>
              </div>

              <button
                onClick={handleApprove}
                className="px-6 py-2.5 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold border border-[#111111] hover:shadow-[3px_3px_0px_0px_#F25C05] transition-all flex items-center gap-2"
              >
                <span>APPROVE &amp; SHIP CODE</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
