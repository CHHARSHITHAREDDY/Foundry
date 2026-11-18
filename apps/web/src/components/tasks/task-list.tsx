"use client";

import React, { useState } from "react";
import { TaskCard, TaskItem } from "./task-card";

interface TaskListProps {
  tasks: TaskItem[];
  onReviewTask?: (task: TaskItem) => void;
  onApproveTask?: (task: TaskItem) => void;
  onCancelTask?: (task: TaskItem) => void;
  onRetryTask?: (task: TaskItem) => void;
  onNewTaskClick?: () => void;
}

export function TaskList({
  tasks,
  onReviewTask,
  onApproveTask,
  onCancelTask,
  onRetryTask,
  onNewTaskClick,
}: TaskListProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const runningCount = tasks.filter((t) => t.status === "RUNNING").length;
  const queuedCount = tasks.filter((t) => t.status === "QUEUED").length;
  const needsApprovalCount = tasks.filter((t) => t.status === "NEEDS_APPROVAL").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const failedCount = tasks.filter((t) => t.status === "FAILED").length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "RUNNING") return t.status === "RUNNING";
    if (filter === "QUEUED") return t.status === "QUEUED";
    if (filter === "NEEDS_APPROVAL") return t.status === "NEEDS_APPROVAL";
    if (filter === "DONE") return t.status === "DONE";
    if (filter === "FAILED") return t.status === "FAILED";
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: "ALL", label: `ALL (${tasks.length})` },
            { id: "RUNNING", label: `RUNNING (${runningCount})` },
            { id: "NEEDS_APPROVAL", label: `NEEDS APPROVAL (${needsApprovalCount})` },
            { id: "QUEUED", label: `QUEUED (${queuedCount})` },
            { id: "DONE", label: `DONE (${doneCount})` },
            { id: "FAILED", label: `FAILED (${failedCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-2.5 py-1 border border-[#111111] uppercase font-bold transition-all ${
                filter === item.id
                  ? "bg-[#111111] text-white shadow-[2px_2px_0px_0px_#ca4b00]"
                  : "bg-surface hover:bg-surface-container text-on-surface"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {onNewTaskClick && (
          <button
            onClick={onNewTaskClick}
            className="px-3 py-1.5 bg-primary text-white border-2 border-[#111111] font-mono text-xs uppercase font-bold tracking-wider hover:bg-primary-container transition-all shadow-[2px_2px_0px_0px_#111111]"
          >
            + NEW TASK →
          </button>
        )}
      </div>

      {/* Task Cards List */}
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-[#111111]/30 font-mono text-xs text-secondary uppercase">
            No tasks match the active filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onReview={onReviewTask}
              onApprove={onApproveTask}
              onCancel={onCancelTask}
              onRetry={onRetryTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

