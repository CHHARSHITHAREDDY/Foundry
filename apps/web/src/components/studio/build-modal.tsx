"use client";

import { useEffect, useState } from "react";

interface BuildModalProps {
  isOpen: boolean;
  idea: any;
  onClose: () => void;
}

export function BuildModal({ isOpen, idea, onClose }: BuildModalProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [subdomain, setSubdomain] = useState("");

  const stages = [
    { name: "ARCHITECT", role: "Master Build Spec & OpenAPI contract generation" },
    { name: "BACKEND & UI", role: "Concurrent Drizzle schemas, API routes & React tokens" },
    { name: "INTEGRATOR", role: "Wiring endpoints, mock replacement & compile pass" },
    { name: "QA VISION", role: "Headless Playwright journeys & visual snapshot audit" },
    { name: "REVIEWER", role: "Diff security audit & strict specification coverage" },
    { name: "DEPLOYER", role: "Production edge bundle & custom SSL routing" },
  ];

  useEffect(() => {
    if (!isOpen || !idea) return;

    setStageIndex(0);
    setIsCompleted(false);
    setLogs([`>> Initializing 8-Agent Swarm for: "${idea.title || "Venture"}"...`]);

    const titleSlug = (idea.title || "saas")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    setSubdomain(`https://${titleSlug}.foundry.studio`);

    const timer1 = setTimeout(() => {
      setStageIndex(1);
      setLogs((p) => [
        ...p,
        ">> [Architect] Emitted build-spec.json (6 routes, 4 tables, design tokens).",
      ]);
    }, 1800);

    const timer2 = setTimeout(() => {
      setStageIndex(2);
      setLogs((p) => [
        ...p,
        ">> [Backend] src/db/schema/app.ts written with PostgreSQL RLS.",
        ">> [UI] Generated responsive layout and editorial typography components.",
      ]);
    }, 3600);

    const timer3 = setTimeout(() => {
      setStageIndex(3);
      setLogs((p) => [
        ...p,
        ">> [Integrator] Merged branch. Typecheck passed with 0 errors.",
        ">> [QA] Starting headless Chromium browser journeys...",
      ]);
    }, 5400);

    const timer4 = setTimeout(() => {
      setStageIndex(4);
      setLogs((p) => [
        ...p,
        ">> [QA] 12 Playwright assertions passed. 0 layout regressions detected.",
        ">> [Reviewer] Audited diff. Security rating: 98/100. Spec coverage: 100%.",
      ]);
    }, 7200);

    const timer5 = setTimeout(() => {
      setStageIndex(5);
      setIsCompleted(true);
      setLogs((p) => [
        ...p,
        `>> [Deployer] Production bundle compiled. Live edge endpoint allocated: https://${titleSlug}.foundry.studio`,
      ]);
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isOpen, idea]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border-[2px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[1.5px] border-[#111111] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? "bg-[#15803D]" : "bg-[#F25C05] animate-ping"}`} />
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111]">
              FOUNDRY AGENT SWARM // PRODUCTION COMPILATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-[#EDEDEA] hover:bg-[#111111] hover:text-white font-mono text-[12px] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Target Idea Info */}
        <div className="bg-[#EDEDEA] border border-[#111111] p-3 mb-5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[#5F5E5E] uppercase block">ACTIVE VENTURE TARGET</span>
            <span className="font-headline text-[18px] font-bold text-[#111111]">{idea?.title}</span>
          </div>
          <span className="font-mono text-[11px] bg-white border border-[#111111] px-2 py-0.5 font-bold">
            NODE #08 · SANDBOX RUNNING
          </span>
        </div>

        {/* 6 Stage Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5 font-mono text-[10px]">
          {stages.map((stg, i) => {
            const isDone = stageIndex > i || isCompleted;
            const isCurrent = stageIndex === i && !isCompleted;
            return (
              <div
                key={i}
                className={`p-2.5 border transition-all ${
                  isDone
                    ? "bg-[#EDEDEA] border-[#15803D] text-[#15803D]"
                    : isCurrent
                    ? "bg-white border-[#F25C05] shadow-[2px_2px_0px_0px_#F25C05] font-bold text-[#111111]"
                    : "bg-white border-[#D6D6D1] text-[#5F5E5E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{stg.name}</span>
                  <span>{isDone ? "✓" : isCurrent ? "RUNNING" : "QUEUED"}</span>
                </div>
                <p className="text-[9px] text-[#5F5E5E] leading-tight truncate">{stg.role}</p>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log Stream */}
        <div className="bg-[#111111] text-[#dbdad5] p-3.5 font-mono text-[11px] space-y-1.5 h-44 overflow-y-auto border border-[#111111] mb-5 select-text">
          {logs.map((log, i) => (
            <p key={i} className={log.includes("Allocated") || log.includes("passed") ? "text-[#15803D]" : ""}>
              {log}
            </p>
          ))}
          {!isCompleted && (
            <p className="text-[#F25C05] animate-pulse">
              &gt;&gt; Compiling artifacts...
            </p>
          )}
        </div>

        {/* Completed State */}
        {isCompleted && (
          <div className="bg-[#EDEDEA] border-[1.5px] border-[#15803D] p-4 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-[#15803D] text-white font-mono text-[11px] px-3 py-1 font-bold">
              <span>DEPLOYMENT COMPLETE &amp; VERIFIED</span>
            </div>
            <h4 className="font-headline text-[20px] font-bold text-[#111111]">
              Your SaaS Application is Live!
            </h4>
            <div className="font-mono text-[12px] bg-white border border-[#111111] p-2 inline-block">
              <a href={subdomain} target="_blank" rel="noreferrer" className="text-[#F25C05] hover:underline font-bold">
                {subdomain} ↗
              </a>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#111111] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#30312d]"
          >
            {isCompleted ? "CLOSE STUDIO" : "RUN IN BACKGROUND"}
          </button>
        </div>
      </div>
    </div>
  );
}
