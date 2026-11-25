"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";
  const initialCooldown = Number(searchParams.get("cooldown") || "0");

  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">(
    token ? "verifying" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(initialCooldown);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setStatus("verifying");
    api
      .verifyEmail({ token })
      .then(() => {
        if (active) setStatus("verified");
      })
      .catch((err: any) => {
        if (active) {
          setStatus("error");
          setError(err instanceof ApiError ? err.message : "Verification failed.");
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 1 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = async () => {
    setError(null);
    setResendMessage(null);
    try {
      const res = await api.resendVerification({ email: emailParam || undefined });
      setCooldown(res.cooldownSeconds);
      setResendMessage("Verification email re-sent. Check your inbox.");
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.retryAfter) setCooldown(err.retryAfter);
        setError(err.message);
      } else {
        setError("Failed to resend verification email.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between p-4 sm:p-8 font-mono">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-ink pb-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">Foundry</span>
          <span className="w-2 h-2 bg-accent inline-block" />
        </Link>
        <span className="text-xs text-muted uppercase">[AUTH // EMAIL_VERIFICATION]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8 space-y-5">
        {status === "verifying" && (
          <div className="space-y-3">
            <div className="h-6 w-48 bg-stone animate-pulse" />
            <p className="text-xs text-muted">Verifying your email token...</p>
          </div>
        )}

        {status === "verified" && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-success-soft text-success border border-success inline-block">
              VERIFIED
            </span>
            <h1 className="font-serif text-3xl font-bold text-ink">Email verified</h1>
            <p className="font-serif text-sm text-muted">
              Your Foundry operator account is active and 20 starter credits have been credited.
            </p>
            <Link
              href="/login"
              className="block w-full text-center py-3 bg-ink text-on-primary text-xs uppercase font-bold tracking-widest border border-ink hover:bg-accent hover:border-accent"
            >
              Continue to Sign In
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-error-soft text-error border border-error inline-block">
              VERIFICATION FAILED
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink">Invalid or expired link</h1>
            <p className="text-xs text-error">{error}</p>
            <Link href="/login" className="text-xs text-link font-bold hover:underline inline-block">
              Return to Sign In
            </Link>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-accent-soft text-accent border border-accent inline-block">
              CHECK YOUR INBOX
            </span>
            <h1 className="font-serif text-3xl font-bold text-ink">Verify your email</h1>
            <p className="font-serif text-sm text-muted">
              We sent a verification link{emailParam ? ` to ${emailParam}` : ""}. Click the link in that email to activate your account.
            </p>

            {resendMessage && (
              <div className="p-3 bg-success-soft border border-success text-success text-xs">{resendMessage}</div>
            )}
            {error && (
              <div className="p-3 bg-error-soft border border-error text-error text-xs">{error}</div>
            )}

            <button
              type="button"
              disabled={cooldown > 0}
              onClick={handleResend}
              className="w-full h-11 bg-stone border-editorial border-ink text-ink text-xs uppercase font-bold hover:bg-ink hover:text-on-primary transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Verification Email"}
            </button>

            <div className="pt-2 text-xs text-muted">
              <Link href="/login" className="text-link font-bold hover:underline">
                Already verified? Sign in
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 text-[11px] text-muted">
        Foundry Venture System
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface p-8 font-mono text-xs text-muted">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
