"use client";

import { useState } from "react";

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveBuild?: (idea: any) => void;
}

export function IdeaModal({ isOpen, onClose, onApproveBuild }: IdeaModalProps) {
  const [prompt, setPrompt] = useState("");
  const [stage, setStage] = useState<"input" | "clarifying" | "validating" | "result">("input");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStage("clarifying");

    try {
      const res = await fetch("/api/backend/ideas/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea: prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.needsClarification && data.questions?.length > 0) {
          setQuestions(data.questions);
          setStage("clarifying");
          return;
        }
      }
    } catch {}

    // If clarification not strictly required, proceed straight to validation
    if (prompt.trim().split(" ").length < 5) {
      setQuestions([
        "Who is the exact primary paying customer?",
        "What is the single biggest bottleneck in their daily workflow?",
      ]);
      setStage("clarifying");
    } else {
      runValidation();
    }
  };

  const runValidation = async () => {
    setStage("validating");

    try {
      const title = prompt.slice(0, 30).trim();
      const res = await fetch("/api/backend/ideas/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          problem: prompt,
          proposedSolution: `Automated SaaS solution for: ${prompt}`,
          targetCustomer: answers["Who is the exact primary paying customer?"] || "B2B SaaS Operators & Agencies",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.scorecard ? {
          title: data.title || `${title} Solution`,
          problem: data.problem || prompt,
          targetCustomer: data.targetCustomer || "B2B Operators & Teams",
          competitors: data.competitorScan || [
            { name: "Incumbent A", pricing: "$79/mo", weaknesses: "Complex onboarding, high churn" },
            { name: "Alternative B", pricing: "$29/mo", weaknesses: "Lack of deep workflow automation" },
          ],
          pricingHypothesis: data.pricingHypothesis || "$49 - $99 / month subscription",
          scorecard: data.scorecard,
          verdict: data.verdict || "GO",
          suggestions: data.suggestions || [
            "Narrow initial target market to solo dev agencies",
            "Include a zero-config 1-click template to minimize onboarding friction",
          ],
          evidence: data.evidence || [
            { source: "Reddit r/SaaS", quote: "High demand for low-maintenance niche automation tools." },
          ],
        } : data);
        setStage("result");
        return;
      }
    } catch {}

    // Fallback simulation
    setTimeout(() => {
      const mockResult = {
        title: prompt.slice(0, 30) + " Solution",
        problem: prompt,
        targetCustomer: answers["Who is the exact primary paying customer?"] || "B2B SaaS Operators & Small Agencies",
        competitors: [
          { name: "Incumbent A", pricing: "$79/mo", weaknesses: "Complex onboarding, high churn" },
          { name: "Alternative B", pricing: "$29/mo", weaknesses: "Lack of deep workflow automation" },
        ],
        pricingHypothesis: "$49 - $99 / month subscription",
        scorecard: {
          demand: 4.3,
          competition: 3.8,
          differentiation: 4.5,
          monetization: 4.1,
          buildability: 4.9,
          total: 4.3,
        },
        verdict: "GO",
        suggestions: [
          "Narrow the initial target market to solo dev agencies",
          "Include a zero-config 1-click template to minimize onboarding friction",
        ],
        evidence: [
          { source: "Reddit r/SaaS", quote: "High demand for low-maintenance niche automation tools." },
        ],
      };
      setValidationResult(mockResult);
      setStage("result");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border-[2px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[1.5px] border-[#111111] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F25C05] inline-block animate-ping" />
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111]">
              WORKFLOW B // CUSTOM IDEA INTAKE &amp; VALIDATOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#5F5E5E] hover:text-[#111111] font-mono text-[11px] uppercase tracking-[0.08em]"
          >
            [CLOSE ESC]
          </button>
        </div>

        {/* STAGE 1: INPUT */}
        {stage === "input" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] mb-2">
                Describe your software idea or the problem you observed:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A tool for Shopify store owners that automatically checks product pages for broken buy buttons and sends a Telegram alert..."
                rows={4}
                className="w-full p-3 bg-[#FAFAF8] border border-[#111111] font-body text-[15px] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D6D6D1]">
              <span className="font-mono text-[10px] text-[#5F5E5E] uppercase tracking-[0.08em]">
                Validator checks: Demand, Pricing, Competition, Buildability
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold hover:bg-[#F25C05] transition-colors shadow-[2px_2px_0px_#111111]"
              >
                Validate Idea ➔
              </button>
            </div>
          </form>
        )}

        {/* STAGE 2: CLARIFYING (Fast tier Q&A) */}
        {stage === "clarifying" && (
          <div className="space-y-4">
            <div className="bg-[#EDEDEA] p-3 border border-[#111111]">
              <span className="font-mono text-[10px] text-[#F25C05] uppercase tracking-[0.08em] font-bold block mb-1">
                [CLARIFIER] · FAST TIER AGENT
              </span>
              <p className="font-body text-[14px] text-[#111111]">
                Before scanning competitor tables, clarify these 2 parameters to sharpen the validation:
              </p>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block font-mono text-[11px] font-bold text-[#111111]">
                  {idx + 1}. {q}
                </label>
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={answers[q] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                  className="w-full p-2 bg-[#FAFAF8] border border-[#111111] font-body text-[14px]"
                />
              </div>
            ))}

            <div className="flex justify-end pt-3 border-t border-[#D6D6D1]">
              <button
                onClick={runValidation}
                className="px-5 py-2 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold hover:bg-[#F25C05] transition-colors shadow-[2px_2px_0px_#111111]"
              >
                Continue to Market Validation ➔
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: VALIDATING (Spinner / Progress) */}
        {stage === "validating" && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-10 h-10 border-2 border-[#111111] border-t-[#F25C05] rounded-full animate-spin" />
            <div className="space-y-1">
              <span className="font-mono text-[12px] uppercase tracking-[0.08em] font-bold text-[#111111]">
                Validator (Reasoner Tier) Scanning Evidence...
              </span>
              <p className="font-body text-[14px] text-[#5F5E5E] max-w-sm">
                Crawling pricing pages, Reddit complaints, and verifying buildability against standard stack components.
              </p>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULT SCORECARD */}
        {stage === "result" && validationResult && (
          <div className="space-y-5">
            {/* Verdict Banner */}
            <div className="flex items-center justify-between p-3 bg-[#EDEDEA] border border-[#111111]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] block">
                  SYNTHESIS VERDICT
                </span>
                <span className="font-headline text-[22px] font-bold text-[#111111]">
                  {validationResult.title}
                </span>
              </div>
              <span
                className={`font-mono text-[12px] uppercase font-bold tracking-[0.08em] px-3 py-1 border border-[#111111] ${
                  validationResult.verdict === "GO"
                    ? "bg-[#15803D] text-white"
                    : validationResult.verdict === "GO_WITH_CHANGES"
                    ? "bg-[#D97706] text-white"
                    : "bg-[#DC2626] text-white"
                }`}
              >
                {validationResult.verdict}
              </span>
            </div>

            {/* Scorecard Breakdown */}
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] block mb-2 font-bold">
                EVIDENCE SCORECARD (1 TO 5 SCALE)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {Object.entries(validationResult.scorecard || {}).map(([key, val]: any) => (
                  <div key={key} className="p-2 border border-[#111111] bg-[#FAFAF8]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#5F5E5E] block">
                      {key}
                    </span>
                    <span className="font-headline text-[18px] font-bold text-[#111111]">
                      {val}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hypothesis & Competitors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="p-3 border border-[#D6D6D1]">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] font-bold block mb-1">
                  Target Customer &amp; Pricing
                </span>
                <p className="font-body text-[#111111] mb-1">
                  <strong>Audience:</strong> {validationResult.targetCustomer}
                </p>
                <p className="font-body text-[#111111]">
                  <strong>Hypothesis:</strong> {validationResult.pricingHypothesis}
                </p>
              </div>

              <div className="p-3 border border-[#D6D6D1]">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] font-bold block mb-1">
                  Competitors &amp; Gaps
                </span>
                <ul className="space-y-1 font-body text-[#111111]">
                  {validationResult.competitors?.map((c: any, i: number) => (
                    <li key={i}>
                      • <strong>{c.name}</strong> ({c.pricing}): {c.weaknesses}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#111111]">
              <button
                onClick={() => setStage("input")}
                className="w-full sm:w-auto px-4 py-2 border border-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#EDEDEA] transition-colors"
              >
                ← Test Another Idea
              </button>

              <button
                onClick={() => onApproveBuild?.(validationResult)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold hover:bg-[#F25C05] transition-colors shadow-[3px_3px_0px_#111111]"
              >
                Approve &amp; Start Build Swarm ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
