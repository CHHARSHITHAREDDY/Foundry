"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.getMe(),
  });

  const policy = meData?.passwordPolicy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(res.user.email)}&cooldown=${res.cooldownSeconds}`
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Network error: unable to reach registration endpoint.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between p-4 sm:p-8 font-mono">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-ink pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">Foundry</span>
          <span className="w-2 h-2 bg-accent inline-block" />
        </Link>
        <span className="text-xs text-muted uppercase tracking-wider">[AUTH // REGISTER]</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-6 sm:p-8">
        <div className="border-b border-ink pb-4 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-accent-soft px-2 py-0.5 border border-accent inline-block mb-2">
            NEW OPERATOR
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">Create Account</h1>
          <p className="font-serif text-sm text-muted mt-1">
            Includes 20 starter credits recorded in your immutable ledger.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-ink">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-ink">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@analytical.io"
              className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-ink">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 bg-paper border-editorial border-ink font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-[11px] text-muted mt-1.5">
              {policy?.description || "Min 8 chars, 1 uppercase, 1 lowercase, 1 number."}
            </p>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-error-soft border border-error text-error text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-ink text-on-primary font-mono text-xs uppercase tracking-widest font-bold border border-ink hover:bg-accent hover:border-accent hover:shadow-editorial transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-muted">
          <span>Already registered?</span>
          <Link href="/login" className="text-link font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto border-t border-border-subtle pt-4 text-[11px] text-muted">
        <span>Foundry Venture System</span>
      </div>
    </div>
  );
}
