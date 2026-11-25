"use client";

import React, { useState, useEffect } from "react";

export type TaskType = "FEATURE" | "BUG" | "CONTENT" | "MARKETING";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export interface NewTaskPayload {
  specification: string;
  type: TaskType;
  priority: TaskPriority;
  requiresApproval: boolean;
  estimatedCredits: number;
}

interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: NewTaskPayload) => void;
  companyName?: string;
}

export function NewTaskDialog({
  isOpen,
  onClose,
  onSubmit,
  companyName = "Workspace",
}: NewTaskDialogProps) {
  const [specification, setSpecification] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("FEATURE");
  const [priority, setPriority] = useState<TaskPriority>("P1");
  const [requiresApproval, setRequiresApproval] = useState(true);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate dynamic credit estimate based on task type and specification length
  const baseCredits =
    taskType === "FEATURE" ? 3 : taskType === "BUG" ? 2 : taskType === "MARKETING" ? 2 : 1;
  const wordCount = specification.trim().split(/\s+/).filter(Boolean).length;
  const dynamicCredits = wordCount > 30 ? baseCredits + 1 : baseCredits;
  const estimatedMinutes = dynamicCredits * 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specification.trim()) return;

    onSubmit({
      specification,
      type: taskType,
      priority,
      requiresApproval,
      estimatedCredits: dynamicCredits,
    });
    setSpecification("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[680px] bg-surface-container-lowest border-2 border-[#111111] shadow-[8px_8px_0px_0px_#111111] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#111111] text-[#ffffff] px-6 py-4 flex items-center justify-between border-b-2 border-[#111111]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest bg-primary px-2 py-0.5 text-white font-bold">
              TASK SPECIFICATION
            </span>
            <span className="font-mono text-xs text-secondary-fixed-dim">
              // FOR {companyName.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm px-2 py-0.5 hover:bg-white hover:text-black transition-colors"
            title="Close (ESC)"
          >
            [ ESC ]
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Natural Language Prompt Area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
                1. What should Ember build or execute?
              </label>
              <span className="font-mono text-[11px] text-secondary">
                PLAIN ENGLISH SPEC
              </span>
            </div>
            <textarea
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="e.g. Add Slack webhook notifications when Shopify margin drops below 15% on high-volume SKUs..."
              rows={4}
              required
              className="w-full p-3 font-serif text-base bg-surface-container-low border-2 border-[#111111] focus:outline-none focus:border-primary placeholder:text-secondary/60 resize-none shadow-[2px_2px_0px_0px_#111111]"
              autoFocus
            />
            {specification.trim().length > 10 && (
              <div className="bg-surface-container border border-[#111111] px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                <span className="text-primary font-bold">✦ AI PARSER:</span>
                <span>
                  Detected intent:{" "}
                  <strong className="text-on-surface">
                    {taskType === "FEATURE" ? "Full-stack code synthesis + test suite" : "Targeted patch & verification"}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Task Type Chips */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
              2. Task Domain / Classification
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["FEATURE", "BUG", "CONTENT", "MARKETING"] as TaskType[]).map((type) => {
                const isSelected = taskType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setTaskType(type)}
                    className={`py-2 px-3 border-2 border-[#111111] font-mono text-xs uppercase tracking-wider font-bold transition-all text-center ${
                      isSelected
                        ? "bg-primary text-white shadow-[2px_2px_0px_0px_#111111] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-surface hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    {type === "FEATURE" && "⚡ "}
                    {type === "BUG" && "🐞 "}
                    {type === "CONTENT" && "📝 "}
                    {type === "MARKETING" && "📣 "}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Priority */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface">
                3. Execution Priority
              </label>
              <span className="font-mono text-[11px] text-secondary">
                QUEUE PLACEMENT
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "P0", label: "P0 IMMEDIATE", desc: "Interrupts current sprint" },
                { id: "P1", label: "P1 HIGH", desc: "Next in queue" },
                { id: "P2", label: "P2 NORMAL", desc: "Standard backlog" },
                { id: "P3", label: "P3 BACKGROUND", desc: "Night run" },
              ].map((item) => {
                const isSelected = priority === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPriority(item.id as TaskPriority)}
                    className={`p-2 border-2 border-[#111111] text-left transition-all ${
                      isSelected
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_0px_#ca4b00]"
                        : "bg-surface hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{item.label}</div>
                    <div
                      className={`text-[10px] font-mono mt-0.5 ${
                        isSelected ? "text-secondary-fixed-dim" : "text-secondary"
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compilation Estimate Card */}
          <div className="bg-surface-container p-4 border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#111111]/30">
              <span className="font-mono text-xs uppercase font-bold text-on-surface flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                COMPILATION ESTIMATE
              </span>
              <span className="font-mono text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 border border-primary">
                {dynamicCredits} CREDITS // ~{estimatedMinutes} MIN DURATION
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 font-mono text-[11px] text-secondary">
              <div className="border-r border-[#111111]/20 pr-2">
                <span className="block text-on-surface font-bold">1 CR</span>
                AST Reasoning &amp; Plan
              </div>
              <div className="border-r border-[#111111]/20 pr-2">
                <span className="block text-on-surface font-bold">
                  {taskType === "FEATURE" ? "1 CR" : "0.5 CR"}
                </span>
                Code &amp; Component Gen
              </div>
              <div>
                <span className="block text-on-surface font-bold">
                  {taskType === "FEATURE" ? "1 CR" : "0.5 CR"}
                </span>
                Vitest + E2E Assertion
              </div>
            </div>
          </div>

          {/* Human Review Gate Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-surface border border-[#111111] cursor-pointer hover:bg-surface-container transition-colors">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary rounded-none border border-[#111111]"
            />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-on-surface uppercase">
                Require QA &amp; Code Review Gate before deploying
              </span>
              <span className="font-serif text-xs text-secondary mt-0.5">
                Ember will pause at Stage 05 to show unified code diffs and Playwright test output before flipping traffic.
              </span>
            </div>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#111111]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface text-on-surface border-2 border-[#111111] font-mono text-xs uppercase font-bold hover:bg-surface-container transition-all"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={!specification.trim()}
              className="px-6 py-2.5 bg-primary text-white border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_#111111] transition-all"
            >
              + ADD TASK ({dynamicCredits} CR) →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

