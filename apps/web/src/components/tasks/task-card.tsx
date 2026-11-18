"use client";

import React from "react";
import { TaskCreditBadge } from "./task-credit-badge";

export type TaskStatus = "RUNNING" | "QUEUED" | "NEEDS_APPROVAL" | "DONE" | "FAILED";

export interface TaskItem {
  id: string;
  code: string; // e.g. "#043"
  title: string;
  description?: string;
  status: TaskStatus;
  type: "FEATURE" | "BUG" | "CONTENT" | "MARKETING";
  priority: "P0" | "P1" | "P2" | "P3";
  credits: number;
  progress?: number; // 0 - 100
  timeElapsed?: string;
  assignedAgent?: string;
  completedAt?: string;
  diffStats?: { added: number; removed: number };
}

interface TaskCardProps {
  task: TaskItem;
  onReview?: (task: TaskItem) => void;
  onApprove?: (task: TaskItem) => void;
  onCancel?: (task: TaskItem) => void;
  onRetry?: (task: TaskItem) => void;
}

export function TaskCard({
  task,
  onReview,
  onApprove,
  onCancel,
  onRetry,
}: TaskCardProps) {
  const isRunning = task.status === "RUNNING";
  const needsApproval = task.status === "NEEDS_APPROVAL";
  const isDone = task.status === "DONE";
  const isFailed = task.status === "FAILED";

  return (
    <div
      className={`border-2 border-[#111111] p-4 flex flex-col gap-3 transition-all ${
        isRunning
          ? "bg-surface-container-lowest shadow-[3px_3px_0px_0px_#ca4b00]"
          : needsApproval
          ? "bg-[#fffbf0] shadow-[3px_3px_0px_0px_#111111] border-primary"
          : "bg-surface-container-lowest shadow-[2px_2px_0px_0px_#111111] hover:border-primary/80"
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-on-surface">
            {task.code}
          </span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 border uppercase font-bold ${
              task.priority === "P0"
                ? "bg-error text-white border-error"
                : task.priority === "P1"
                ? "bg-primary text-white border-primary"
                : "bg-surface-container text-secondary border-[#111111]"
            }`}
          >
            {task.priority}
          </span>
          <span className="font-mono text-[10px] text-secondary uppercase px-1 border border-secondary/30">
            {task.type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TaskCreditBadge credits={task.credits} />
          {/* Status Badge */}
          {isRunning && (
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-primary text-white flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              RUNNING ({task.timeElapsed || "12m"})
            </span>
          )}
          {needsApproval && (
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-primary text-white border border-[#111111]">
              APPROVAL GATE
            </span>
          )}
          {isDone && (
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#15803D] text-white">
              DONE ✓
            </span>
          )}
          {isFailed && (
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-error text-white">
              FAILED ✕
            </span>
          )}
          {task.status === "QUEUED" && (
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-surface-container text-secondary border border-[#111111]">
              QUEUED
            </span>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="flex flex-col gap-1">
        <h4 className="font-serif text-base font-bold text-on-surface leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="font-serif text-sm text-secondary line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Running Segmented Progress Bar */}
      {isRunning && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
            <span>SYNTHESIS PROGRESS: {task.progress || 65}%</span>
            <span>ASSIGNED: {task.assignedAgent || "Ember-02"}</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high border border-[#111111] overflow-hidden flex">
            {Array.from({ length: 20 }).map((_, idx) => {
              const segmentFilled = (idx + 1) * 5 <= (task.progress || 65);
              return (
                <div
                  key={idx}
                  className={`flex-1 border-r border-[#111111]/30 transition-colors ${
                    segmentFilled ? "bg-primary" : "bg-transparent"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Diffs & Attribution Meta */}
      {task.diffStats && (
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-[#15803D] font-bold">+{task.diffStats.added}</span>
          <span className="text-error font-bold">-{task.diffStats.removed} lines</span>
          <span className="text-secondary">• Vitest 8/8 passed</span>
        </div>
      )}

      {/* Action Footer */}
      {(needsApproval || isRunning || isFailed) && (
        <div className="flex items-center justify-between pt-2 border-t border-[#111111]/20">
          <div className="font-mono text-[10px] text-secondary">
            {needsApproval ? "Automated build passed with 2 auto-fixes" : "Target: prod edge"}
          </div>
          <div className="flex items-center gap-2">
            {needsApproval && (
              <>
                <button
                  type="button"
                  onClick={() => onReview?.(task)}
                  className="px-2.5 py-1 bg-surface-container border border-[#111111] font-mono text-xs uppercase font-bold hover:bg-surface-container-high transition-colors"
                >
                  Review Diff
                </button>
                <button
                  type="button"
                  onClick={() => onApprove?.(task)}
                  className="px-3 py-1 bg-primary text-white border border-[#111111] font-mono text-xs uppercase font-bold hover:bg-primary-container transition-colors shadow-[1px_1px_0px_0px_#111111]"
                >
                  Approve &amp; Deploy →
                </button>
              </>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={() => onCancel?.(task)}
                className="px-2 py-0.5 bg-surface text-error border border-error font-mono text-[10px] uppercase font-bold hover:bg-error hover:text-white transition-colors"
              >
                Abort
              </button>
            )}
            {isFailed && (
              <button
                type="button"
                onClick={() => onRetry?.(task)}
                className="px-2.5 py-1 bg-primary text-white border border-[#111111] font-mono text-xs uppercase font-bold hover:bg-primary-container transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

