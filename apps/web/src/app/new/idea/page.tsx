"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/layout/app-shell";

interface ClarifyQuestion {
  id: string;
  question: string;
  options?: string[];
}

function CustomIdeaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const draftIdParam = searchParams.get("draft");

  const [step, setStep] = useState<"prompt" | "clarify" | "validating">("prompt");
  const [promptText, setPromptText] = useState("");
  const [ideaId, setIdeaId] = useState<string | null>(draftIdParam);
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftIdParam) return;
    api
      .getIdea(draftIdParam)
      .then((res) => {
        if (res.idea) {
          setPromptText(res.idea.problem || "");
          setIdeaId(res.idea.id);
        }
      })
      .catch(() => {});
  }, [draftIdParam]);

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.createCustomIdea(promptText.trim());
      setIdeaId(res.id);
      if (res.needsClarification && res.questions.length > 0) {
        setQuestions(res.questions.slice(0, 3));
        setStep("clarify");
      } else {
        setStep("validating");
        await api.clarifyCustomIdea(res.id, {});
        queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
        router.push(`/ideas/${res.id}`);
      }
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to submit idea.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClarify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaId) return;
    setStep("validating");
    setError(null);
    try {
      await api.clarifyCustomIdea(ideaId, answers);
      queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
      router.push(`/ideas/${ideaId}`);
    } catch (err: any) {
      setStep("clarify");
      setError(err instanceof ApiError ? err.message : "Validation failed.");
    }
  };

  return (
    <AppShell breadcrumb="New / Custom Idea">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="border-b border-ink pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-link font-bold">
            FOUNDER BRIEF WIZARD
          </span>
          <h1 className="font-serif text-4xl font-bold text-ink mt-1">I Have an Idea</h1>
        </div>

        {step === "prompt" && (
          <form onSubmit={handleSubmitPrompt} className="bg-surface-container-lowest border-editorial border-ink shadow-editorial p-6 space-y-4">
            <div>
              <label htmlFor="idea-prompt" className="block font-mono text-xs uppercase font-bold text-ink mb-2">
                Describe the problem, target customer, and product concept
              </label>
              <textarea
                id="idea-prompt"
                required
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. A webhook delivery auditor for small Shopify apps that flags dropped orders and replays failed payloads..."
                className="w-full p-3 bg-paper border-editorial border-ink font-serif text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <div role="alert" className="p-3 bg-error-soft border border-error text-error font-mono text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-ink text-on-primary font-mono text-xs uppercase font-bold border border-ink hover:bg-accent cursor-pointer disabled:opacity-50"
            >
              {loading ? "Analyzing Gaps..." : "Continue to Validation →"}
            </button>
          </form>
        )}

        {step === "clarify" && (
          <form onSubmit={handleSubmitClarify} className="bg-surface-container-lowest border-editorial border-ink shadow-editorial p-6 space-y-5">
            <h2 className="font-serif text-2xl font-bold text-ink">Quick Clarifying Questions</h2>
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="font-mono text-xs font-bold text-ink">{q.question}</p>
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`p-2.5 text-left font-mono text-xs border cursor-pointer ${
                          answers[q.id] === opt
                            ? "bg-ink text-on-primary border-ink font-bold"
                            : "bg-paper text-ink border-ink hover:bg-stone"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full h-10 px-3 bg-paper border border-ink font-mono text-xs"
                  />
                )}
              </div>
            ))}

            {error && (
              <div role="alert" className="p-3 bg-error-soft border border-error text-error font-mono text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-ink text-on-primary font-mono text-xs uppercase font-bold border border-ink hover:bg-accent cursor-pointer"
            >
              Run Competitor &amp; Scorecard Validation →
            </button>
          </form>
        )}

        {step === "validating" && (
          <div className="p-8 bg-surface-container-lowest border-editorial border-ink text-center space-y-3 font-mono">
            <div className="h-4 w-48 mx-auto bg-stone animate-pulse" />
            <p className="text-xs text-ink font-bold uppercase">Fetching competitor pricing &amp; building scorecard...</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function NewIdeaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface p-8 font-mono text-xs text-muted">Loading...</div>}>
      <CustomIdeaContent />
    </Suspense>
  );
}
