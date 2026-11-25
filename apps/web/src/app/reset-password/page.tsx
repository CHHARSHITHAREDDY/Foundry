"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between p-4 sm:p-8 font-mono">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-ink pb-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">Foundry</span>
          <span className="w-2 h-2 bg-accent inline-block" />
        </Link>
        <span className="text-xs text-muted uppercase">[AUTH // NEW_PASSWORD]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8">
        {!token ? (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-error-soft text-error border border-error inline-block">
              MISSING TOKEN
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink">Invalid reset link</h1>
            <p className="text-xs text-muted">The password reset token is missing or malformed.</p>
            <Link href="/forgot-password" className="text-xs text-link font-bold hover:underline inline-block">
              Request a new reset link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-success-soft text-success border border-success inline-block">
              PASSWORD UPDATED
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink">Your password has been reset</h1>
            <Link
              href="/login"
              className="block w-full text-center py-3 bg-ink text-on-primary text-xs uppercase font-bold tracking-widest border border-ink hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-ink">Set New Password</h1>
            <div>
              <label htmlFor="reset-password" className="block text-[11px] uppercase font-bold mb-1.5 text-ink">
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-[11px] text-muted mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
            </div>

            {error && (
              <div role="alert" className="p-3 bg-error-soft border border-error text-error text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-ink text-on-primary text-xs uppercase font-bold tracking-widest border border-ink hover:bg-accent cursor-pointer disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 text-[11px] text-muted">
        Foundry Venture System
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface p-8 font-mono text-xs text-muted">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
