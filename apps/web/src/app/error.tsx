"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface text-ink flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-8 space-y-4">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-error-soft text-error border border-error inline-block">
          HTTP 500
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink">Something went wrong</h1>
        <p className="text-xs text-muted">{error?.message || "An unexpected server error occurred."}</p>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-ink text-on-primary text-xs uppercase font-bold border border-ink hover:bg-accent cursor-pointer"
          >
            Try Again
          </button>
          <Link href="/dashboard" className="text-xs text-link font-bold hover:underline">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
