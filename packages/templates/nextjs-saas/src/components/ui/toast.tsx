import React from "react";

export function Toast({ message, type = "info" }: { message: string; type?: "info" | "success" | "error" }) {
  const bg = type === "error" ? "bg-red-950 border-red-800 text-red-200" : type === "success" ? "bg-emerald-950 border-emerald-800 text-emerald-200" : "bg-zinc-900 border-zinc-800 text-zinc-200";
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2.5 rounded-lg border text-xs font-medium shadow-lg ${bg}`}>
      {message}
    </div>
  );
}
