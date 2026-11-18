"use client";

import React, { useState } from "react";

export interface DiffLine {
  type: "add" | "remove" | "context" | "header";
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface DiffFile {
  id: string;
  path: string;
  status: "modified" | "added" | "deleted";
  added: number;
  removed: number;
  isPatched?: boolean;
  annotation?: {
    author: string;
    type: "SECURITY" | "PERF" | "SPEC_DRIFT";
    message: string;
    line: number;
  };
  lines: DiffLine[];
}

interface DiffViewerProps {
  file: DiffFile;
  onApproveDiff?: () => void;
}

export function DiffViewer({ file }: DiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const raw = file.lines.map((l) => `${l.type === "add" ? "+" : l.type === "remove" ? "-" : " "} ${l.content}`).join("\n");
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border-2 border-[#111111] overflow-hidden shadow-[3px_3px_0px_0px_#111111]">
      {/* Diff Header */}
      <div className="bg-[#111111] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#111111] select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase font-bold text-white bg-primary px-2 py-0.5">
            DIFF
          </span>
          <span className="font-mono text-xs font-bold text-[#fbf9f4] truncate">
            {file.path}
          </span>
          {file.isPatched && (
            <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#15803D] text-white border border-white/40">
              AUTO-PATCHED ✓
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs flex items-center gap-1.5">
            <span className="text-[#4ade80] font-bold">+{file.added}</span>
            <span className="text-[#f87171] font-bold">-{file.removed}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 bg-surface text-on-surface hover:bg-white font-mono text-[11px] uppercase font-bold transition-colors"
          >
            {copied ? "COPIED ✓" : "COPY DIFF"}
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto font-mono text-xs bg-[#1e1e1e] text-[#d4d4d4] select-text">
        <table className="w-full border-collapse">
          <tbody>
            {file.lines.map((line, idx) => {
              const isAdd = line.type === "add";
              const isRemove = line.type === "remove";
              const isHeader = line.type === "header";
              const hasAnnotation = file.annotation && file.annotation.line === (line.newLineNumber || line.oldLineNumber);

              return (
                <React.Fragment key={idx}>
                  <tr
                    className={`transition-colors leading-relaxed ${
                      isAdd
                        ? "bg-[#1e3a1e]/80 text-[#86efac]"
                        : isRemove
                        ? "bg-[#3e1e1e]/80 text-[#fca5a5]"
                        : isHeader
                        ? "bg-[#2d2d2d] text-secondary-fixed-dim italic"
                        : "hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {/* Old line number */}
                    <td className="w-10 px-2 py-0.5 text-right text-[11px] text-[#6e7681] border-r border-[#333333] select-none">
                      {line.oldLineNumber || ""}
                    </td>
                    {/* New line number */}
                    <td className="w-10 px-2 py-0.5 text-right text-[11px] text-[#6e7681] border-r border-[#333333] select-none">
                      {line.newLineNumber || ""}
                    </td>
                    {/* Prefix + / - */}
                    <td className="w-5 px-1 py-0.5 text-center font-bold select-none">
                      {isAdd ? "+" : isRemove ? "-" : " "}
                    </td>
                    {/* Code Content */}
                    <td className="px-2 py-0.5 whitespace-pre font-mono">
                      {line.content}
                    </td>
                  </tr>

                  {/* Inline Security / Fix Annotation Box */}
                  {hasAnnotation && file.annotation && (
                    <tr className="bg-[#111111]">
                      <td colSpan={4} className="p-3">
                        <div className="bg-[#241712] border-2 border-primary p-3 flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_#111111]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs uppercase font-bold text-white bg-primary px-1.5 py-0.5">
                                [FIXED BY {file.annotation.author} · {file.annotation.type} AUDIT]
                              </span>
                              <span className="font-mono text-xs text-primary-fixed-dim">
                                Line {file.annotation.line}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-[#4ade80] font-bold">
                              PASSES INVARIANTS ✓
                            </span>
                          </div>
                          <p className="font-serif text-xs text-[#ffdbce]">
                            {file.annotation.message}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

