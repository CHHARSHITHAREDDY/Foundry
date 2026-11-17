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

    // Fast check: does it need clarification?
    if (prompt.trim().split(" ").length < 6) {
      setTimeout(() => {
        setQuestions([
          "Who is the exact primary paying customer?",
          "What is the single biggest bottleneck in their daily workflow?",
        ]);
        setStage("clarifying");
      }, 1000);
    } else {
      runValidation();
    }
  };

  const runValidation = () => {
    setStage("validating");
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
      };
      setValidationResult(mockResult);
      setStage("result");
    }, 2500);
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
            className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-[#EDEDEA] hover:bg-[#111111] hover:text-white font-mono text-[12px] transition-colors"
          >
            ✕
          </button>
        </div>

        {stage === "input" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] block mb-2">
                Describe your software idea or the problem you want to solve:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A lightweight uptime and SSL monitor that alerts via Telegram and WhatsApp with instant automated remediation webhooks..."
                className="w-full border-[1.5px] border-[#111111] p-3 font-body text-[15px] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                rows={4}
                required
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-[10px] text-[#5F5E5E]">
                CLARIFIER &amp; VALIDATOR RUN IN REAL-TIME
              </span>
              <button
                type="submit"
                className="h-11 px-6 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold border border-[#111111] hover:shadow-[3px_3px_0px_0px_#F25C05] transition-all"
              >
                EVALUATE MARKET FIT
              </button>
            </div>
          </form>
        )}

        {stage === "clarifying" && questions.length > 0 && (
          <div className="space-y-4 py-2">
            <div className="bg-[#EDEDEA] border border-[#111111] p-3">
              <span className="font-mono text-[10px] uppercase text-[#F25C05] font-bold block mb-1">
                CLARIFIER STEP (FAST TIER)
              </span>
              <p className="font-body text-[14px] text-[#111111]">
                To ensure high precision validation, please answer these brief clarifying questions:
              </p>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="font-mono text-[11px] uppercase font-bold text-[#111111]">
                  {q}
                </label>
                <input
                  type="text"
                  value={answers[q] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                  className="w-full border border-[#111111] p-2 font-body text-[14px]"
                  placeholder="Your answer..."
                />
              </div>
            ))}

            <div className="pt-3">
              <button
                onClick={runValidation}
                className="w-full h-11 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] font-bold hover:shadow-[3px_3px_0px_0px_#F25C05] transition-all"
              >
                RUN DEEP VALIDATION
              </button>
            </div>
          </div>
        )}

        {stage === "validating" && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-[#EDEDEA] border border-[#111111] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-[#F25C05] animate-spin">
                autorenew
              </span>
            </div>
            <h4 className="font-headline text-[20px] font-bold text-[#111111]">
              Grounded Evidence Validator Active
            </h4>
            <p className="font-body text-[14px] text-[#5F5E5E] max-w-sm mx-auto">
              Scanning competitor pricing, search demand, customer willingness-to-pay, and micro-SaaS technical buildability...
            </p>
          </div>
        )}

        {stage === "result" && validationResult && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-[#EDEDEA] p-3 border border-[#111111]">
              <div>
                <span className="font-mono text-[10px] text-[#5F5E5E] uppercase block">
                  VALIDATION VERDICT
                </span>
                <span className="font-headline text-[18px] font-bold text-[#111111]">
                  {validationResult.verdict === "GO" ? "GO — HIGH VIABILITY" : "GO WITH CHANGES"}
                </span>
              </div>
              <span className="bg-[#15803D] text-white font-mono text-[12px] px-2.5 py-1 font-bold">
                SCORE: {validationResult.scorecard.total}/5.0
              </span>
            </div>

            {/* Scorecard grid */}
            <div className="grid grid-cols-5 gap-2 bg-[#EDEDEA] p-3 border border-[#111111] text-center font-mono text-[10px]">
              <div>
                <span className="text-[#5F5E5E] block">DEMAND</span>
                <span className="font-bold text-[12px]">{validationResult.scorecard.demand}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">COMPETITION</span>
                <span className="font-bold text-[12px]">{validationResult.scorecard.competition}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">DIFF</span>
                <span className="font-bold text-[12px]">{validationResult.scorecard.differentiation}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">MONETIZATION</span>
                <span className="font-bold text-[12px]">{validationResult.scorecard.monetization}</span>
              </div>
              <div>
                <span className="text-[#5F5E5E] block">BUILDABLE</span>
                <span className="font-bold text-[12px]">{validationResult.scorecard.buildability}</span>
              </div>
            </div>

            {/* Competitors & Pricing */}
            <div className="border border-[#111111] p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase text-[#F25C05] font-bold block">
                COMPETITOR SCAN &amp; PRICING HYPOTHESIS
              </span>
              <p className="font-body text-[14px] text-[#111111]">
                Recommended Pricing: <strong>{validationResult.pricingHypothesis}</strong>
              </p>
              <div className="space-y-1 pt-1 font-mono text-[11px]">
                {validationResult.competitors.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between bg-[#EDEDEA] p-1.5 border border-[#D6D6D1]">
                    <span>{c.name} ({c.pricing})</span>
                    <span className="text-[#5F5E5E] text-[10px]">{c.weaknesses}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#111111]">
              <button
                onClick={() => setStage("input")}
                className="px-4 py-2 bg-white border border-[#111111] font-mono text-[11px] hover:bg-[#EDEDEA]"
              >
                EDIT CONCEPT
              </button>

              <button
                onClick={() => {
                  if (onApproveBuild) onApproveBuild(validationResult);
                }}
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
