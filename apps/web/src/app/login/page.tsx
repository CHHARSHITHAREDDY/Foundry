"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

function sanitizeNext(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/dashboard";
  }
  return nextParam;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const nextPath = sanitizeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState<number>(0);

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.getMe(),
  });

  useEffect(() => {
    if (meData?.authenticated) {
      router.replace(nextPath);
    }
  }, [meData, nextPath, router]);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email: email.trim(), password });
      if (res.requiresTwoFactor && res.challengeToken) {
        router.push(
          `/two-factor?challenge=${encodeURIComponent(res.challengeToken)}&next=${encodeURIComponent(nextPath)}`
        );
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push(nextPath);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.statusCode === 423 && err.retryAfter) {
          setLockSeconds(err.retryAfter);
        }
        setError(err.message);
      } else {
        setError("Network error: unable to reach authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showOAuth = Boolean(meData?.oauthProviders?.google || meData?.oauthProviders?.github);

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between p-4 sm:p-8 font-mono">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-ink pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">Foundry</span>
          <span className="w-2 h-2 bg-accent inline-block group-hover:scale-125 transition-transform" />
        </Link>
        <span className="text-xs text-muted uppercase tracking-wider">[AUTH // OPERATOR_PORTAL]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8">
        <div className="border-b border-ink pb-4 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-accent-soft px-2 py-0.5 border border-accent inline-block mb-2">
            OPERATOR GATEWAY
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">Sign in to Console</h1>
          <p className="font-serif text-sm text-muted mt-1">
            Access your ventures, build pipelines, and credit ledger.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-ink">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-[11px] uppercase tracking-wider font-bold text-ink">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-link hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {lockSeconds > 0 && (
            <div role="alert" className="p-3 bg-warning-soft border border-warning text-warning text-xs font-mono">
              Account locked. Try again in <strong>{lockSeconds}s</strong>.
            </div>
          )}

          {error && lockSeconds === 0 && (
            <div role="alert" className="p-3 bg-error-soft border border-error text-error text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || lockSeconds > 0}
            className="w-full h-12 bg-ink text-on-primary font-mono text-xs uppercase tracking-widest font-bold border border-ink hover:bg-accent hover:border-accent hover:shadow-editorial transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating..." : lockSeconds > 0 ? `Locked (${lockSeconds}s)` : "Sign In"}
          </button>
        </form>

        {showOAuth && (
          <div className="mt-6 pt-5 border-t border-border-subtle space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted text-center mb-2">Or continue with</p>
            {meData?.oauthProviders?.google && (
              <a
                href={`${api.getBaseUrl()}/api/auth/oauth/google`}
                className="w-full h-10 flex items-center justify-center border border-ink bg-paper hover:bg-stone text-xs uppercase font-bold"
              >
                Google
              </a>
            )}
            {meData?.oauthProviders?.github && (
              <a
                href={`${api.getBaseUrl()}/api/auth/oauth/github`}
                className="w-full h-10 flex items-center justify-center border border-ink bg-paper hover:bg-stone text-xs uppercase font-bold"
              >
                GitHub
              </a>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-muted">
          <span>New to Foundry?</span>
          <Link href="/signup" className="text-link font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 flex items-center justify-between text-[11px] text-muted">
        <span>Foundry Venture System</span>
        <span>Argon2id + HttpOnly Session</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface p-8 font-mono text-xs text-muted">Loading gateway...</div>}>
      <LoginContent />
    </Suspense>
  );
}
