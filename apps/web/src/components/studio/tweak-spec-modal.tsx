"use client";

import { useState } from "react";

export interface SpecData {
  name: string;
  thesis: string;
  targetAudience: string;
  problemStatement: string;
  moat: string;
  mvpScope: string[];
  pricing: string;
}

interface TweakSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: SpecData;
  onSaveAndRescore: (updatedSpec: SpecData) => void;
}

export function TweakSpecModal({
  isOpen,
  onClose,
  spec,
  onSaveAndRescore,
}: TweakSpecModalProps) {
  const [formData, setFormData] = useState<SpecData>(spec);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onSaveAndRescore(formData);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 left-60 top-14 bg-on-surface/40 backdrop-blur-sm z-50 flex items-start justify-center p-space-md overflow-y-auto">
      {/* 720px CENTERED MODAL */}
      <div className="relative w-full max-w-[720px] my-6 bg-surface-container-lowest border-[1.5px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] flex flex-col transition-all">
        {/* TOP STATUS / IDENTIFIER BANNER */}
        <div className="px-space-lg py-space-sm bg-surface-container-high border-b-[1.5px] border-[#111111] flex items-center justify-between select-none font-mono">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-bold text-on-surface tracking-widest uppercase">
            <span className="w-2 h-2 bg-primary" />
            <span>// SPEC_CALIBRATION_PROTOCOL · MANUAL OVERRIDE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-1.5 py-0.5 border border-surface-variant">
              SYS_LOCK: BYPASSED
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 border border-[#111111] bg-surface hover:bg-[#111111] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* MODAL HEADER */}
        <div className="px-space-xl pt-space-lg pb-space-md border-b border-surface-variant bg-surface-bright">
          <div className="flex items-baseline justify-between">
            <h2 className="font-headline-lg text-2xl font-bold font-serif text-on-surface tracking-tight">
              Tweak this idea
            </h2>
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest font-mono">
              [STATE: DRAFT_EDIT]
            </span>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mt-1 max-w-xl font-serif">
            Adjust parametric bounds, target cohort, or scope boundaries before triggering re-scoring
            simulation.
          </p>
        </div>

        {/* EDITABLE FORM BODY */}
        <form
          onSubmit={handleSubmit}
          className="px-space-xl py-space-lg flex flex-col gap-space-md bg-surface-container-lowest"
        >
          {/* FIELD 1: NAME */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">Venture Candidate Name</label>
              <span className="text-secondary text-[10px]">CHAR_LIMIT: 40</span>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-9 px-3 bg-surface border border-[#111111] font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* FIELD 2: ONE-LINE THESIS */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">One-Line Market Thesis</label>
              <span className="text-secondary text-[10px]">CORE VALUE PROPOSITION</span>
            </div>
            <input
              type="text"
              value={formData.thesis}
              onChange={(e) => setFormData({ ...formData, thesis: e.target.value })}
              className="w-full h-9 px-3 bg-surface border border-[#111111] font-serif text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* FIELD 3: TARGET AUDIENCE / ICP */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">Target Customer Profile (ICP)</label>
              <span className="text-primary text-[10px]">REVENUE QUALIFIER</span>
            </div>
            <textarea
              rows={2}
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full p-2.5 bg-surface border border-[#111111] font-serif text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* FIELD 4: PROBLEM STATEMENT */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">Problem Statement &amp; Friction Pattern</label>
              <span className="text-secondary text-[10px]">EVIDENCE GROUNDED</span>
            </div>
            <textarea
              rows={3}
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full p-2.5 bg-surface border border-[#111111] font-serif text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* FIELD 5: WEDGE & MOAT */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">Structural Wedge &amp; Defensibility</label>
              <span className="text-[#15803D] text-[10px]">MOAT DEFENSE</span>
            </div>
            <input
              type="text"
              value={formData.moat}
              onChange={(e) => setFormData({ ...formData, moat: e.target.value })}
              className="w-full h-9 px-3 bg-surface border border-[#111111] font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* FIELD 6: PRICING & MONETIZATION */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-label-sm uppercase font-bold">
              <label className="text-on-surface">Pricing &amp; Monetization Tier</label>
              <span className="text-secondary text-[10px]">PAYBACK &lt; 5 DAYS</span>
            </div>
            <input
              type="text"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              className="w-full h-9 px-3 bg-surface border border-[#111111] font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-[2px_2px_0px_0px_#111111]"
              required
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-space-md border-t-[1.5px] border-[#111111] flex items-center justify-between font-mono">
            <div className="flex items-center gap-1.5 text-label-sm text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              <span>Re-scoring consumes 0 credits. Simulation ~1s.</span>
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 bg-surface hover:bg-surface-container border border-[#111111] font-bold text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSimulating}
                className="h-9 px-5 bg-[#111111] text-[#ffffff] hover:bg-primary border border-[#111111] font-bold text-label-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_#111111] transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>Simulating...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Re-Score Spec</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
