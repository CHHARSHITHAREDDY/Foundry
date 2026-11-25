"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Unable to send reset request.");
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
        <span className="text-xs text-muted uppercase">[AUTH // PASSWORD_RECOVERY]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Reset Password</h1>
        <p className="font-serif text-sm text-muted mb-6">
          Enter your email address and we will send you a single-use reset link.
        </p>

        {sent ? (
          <div className="space-y-4">
            <div className="p-3 bg-success-soft border border-success text-success text-xs">
              If an account exists for {email}, a reset link has been dispatched.
            </div>
            <Link href="/login" className="text-xs text-link font-bold hover:underline inline-block">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-[11px] uppercase font-bold mb-1.5 text-ink">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <div role="alert" className="p-3 bg-error-soft border border-error text-error text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-ink text-on-primary text-xs uppercase font-bold tracking-widest border border-ink hover:bg-accent hover:border-accent cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="pt-2 text-xs text-muted">
              <Link href="/login" className="text-link font-bold hover:underline">
                Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 text-[11px] text-muted">
        Foundry Venture System
      </div>
    </div>
  );
}
