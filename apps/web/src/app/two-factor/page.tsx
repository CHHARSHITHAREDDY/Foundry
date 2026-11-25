"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const challengeToken = searchParams.get("challenge") || "";
  const nextPath = searchParams.get("next") || "/dashboard";

  const [code, setCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.verifyTwoFactor({
        code: code.trim(),
        challengeToken: challengeToken || undefined,
        isRecoveryCode,
        trustDevice,
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Invalid verification code.");
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
        <span className="text-xs text-muted uppercase">[AUTH // 2FA_CHALLENGE]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Two-Factor Verification</h1>
        <p className="font-serif text-sm text-muted mb-6">
          {isRecoveryCode
            ? "Enter one of your backup recovery codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="totp-code" className="block text-[11px] uppercase font-bold mb-1.5 text-ink">
              {isRecoveryCode ? "Recovery Code" : "6-Digit Code"}
            </label>
            <input
              id="totp-code"
              type="text"
              required
              autoFocus
              maxLength={isRecoveryCode ? 16 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={isRecoveryCode ? "ABCD-1234" : "000000"}
              className="w-full h-12 px-3 bg-paper border-editorial border-ink font-mono text-lg tracking-widest text-center text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span>Trust this device for 30 days</span>
          </label>

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
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRecoveryCode((v) => !v);
              setCode("");
              setError(null);
            }}
            className="w-full text-xs text-link hover:underline text-center pt-2 cursor-pointer"
          >
            {isRecoveryCode ? "Use authenticator 6-digit code instead" : "Use a recovery code"}
          </button>
        </form>
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 text-[11px] text-muted">
        Foundry Venture System
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface p-8 font-mono text-xs text-muted">Loading...</div>}>
      <TwoFactorContent />
    </Suspense>
  );
}
