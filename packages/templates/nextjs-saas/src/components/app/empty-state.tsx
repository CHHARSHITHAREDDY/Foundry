import React from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "No records found",
  description = "Get started by creating your first entry.",
  actionLabel = "Create New",
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 flex flex-col items-center">
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm mb-4">{description}</p>
      {onAction && (
        <Button onClick={onAction} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
