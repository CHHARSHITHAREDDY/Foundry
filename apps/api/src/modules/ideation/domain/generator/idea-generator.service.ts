import { LlmClient } from "@venture-studio/llm-client";
import { PainPoint, IdeaBrief } from "@venture-studio/contracts";
import { z } from "zod";

const CandidateIdeasSchema = z.object({
  candidates: z.array(
    z.object({
      title: z.string(),
      tagline: z.string(),
      problem: z.string(),
      targetCustomer: z.string(),
      whyNow: z.string(),
      archetype: z.string(),
      mvpScope: z.object({
        screens: z.array(z.string()),
        coreApis: z.array(z.string()),
        keyFeatures: z.array(z.string()),
        estimatedComplexity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
      }),
      suggestedCompetitors: z.array(
        z.object({
          name: z.string(),
          gap: z.string(),
          pricing: z.string().optional(),
        })
      ),
    })
  ),
});

function synthesizeCandidateFromPainPoint(p: PainPoint, idx: number) {
  const cleanTitle = p.problem
    .replace(/^Ask HN:\s*/i, "")
    .replace(/^Tell HN:\s*/i, "")
    .replace(/^Feature Request:\s*/i, "")
    .replace(/^\[FEA\]\s*/i, "")
    .replace(/^\[Request\]\s*/i, "")
    .replace(/^\[Enhancement\]\s*/i, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim();

  const stopWords = new Set([
    "what", "when", "where", "which", "with", "from", "that", "this", "there", "have",
    "been", "wish", "want", "need", "some", "someone", "tool", "software", "could",
    "would", "about", "your", "their", "will", "more", "make", "doing", "manually",
    "please", "implement", "does", "anyone", "know", "best", "like"
  ]);

  const meaningfulWords = cleanTitle
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

  const w1 = meaningfulWords[0] ? meaningfulWords[0].charAt(0).toUpperCase() + meaningfulWords[0].slice(1).toLowerCase() : "Cloud";
  const w2 = meaningfulWords[1] ? meaningfulWords[1].charAt(0).toUpperCase() + meaningfulWords[1].slice(1).toLowerCase() : "Flow";
  const w3 = meaningfulWords[2] ? meaningfulWords[2].charAt(0).toUpperCase() + meaningfulWords[2].slice(1).toLowerCase() : "";

  const suffixes = ["Engine", "Relay", "Router", "Gateway", "Mesh", "Sentry", "Pulse", "Forge"];
  const dynamicSuffix = suffixes[(idx + cleanTitle.length) % suffixes.length];

  const productTitle = w3 ? `${w1} ${w2} ${dynamicSuffix}` : `${w1}${w2} ${dynamicSuffix}`;

  const archetype = p.domain?.includes("GitHub")
    ? "Developer Tool & CLI Utility"
    : p.domain?.includes("Comments")
    ? "Workflow Micro-SaaS"
    : "Founder SaaS Wedge";

  const keyTerm = `${w1} ${w2}`.trim();

  return {
    title: productTitle,
    tagline: `Lightweight automated utility eliminating manual friction around ${p.problem.slice(0, 60)} for ${p.who_has_it}`,
    archetype,
    screens: [`${keyTerm} Live Stream`, "Rule & Webhook Configuration", "Audit & Export Ledger"],
    coreApis: ["/api/workflow/run", "/api/events/ingest", "/api/reports/export"],
    keyFeatures: [
      `Automated ${cleanTitle.slice(0, 40)} workflow engine`,
      "Real-time event capture & status notification",
      "One-click CSV and JSON telemetry export"
    ],
    competitors: [
      {
        name: "Manual Custom Scripts",
        gap: `Ad-hoc in-house scripts that break during updates; lacks the zero-config ${productTitle} integration`,
        pricing: "Internal dev time ($400/mo labor)"
      }
    ],
  };
}

export class IdeaGeneratorService {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async generateCandidates(painPoints: PainPoint[], maxCandidates: number = 8): Promise<IdeaBrief[]> {
    const synthesizeAll = () =>
      painPoints.slice(0, maxCandidates).map((p, idx) => {
        const synthesized = synthesizeCandidateFromPainPoint(p, idx);

        return {
          id: `idea_candidate_${idx + 1}`,
          title: synthesized.title,
          tagline: synthesized.tagline,
          problem: p.problem,
          targetCustomer: p.who_has_it,
          whyNow: p.domain?.includes("GitHub")
            ? `Growing issue reports in ${p.domain} with unaddressed open developer demand`
            : p.domain?.includes("Hacker News")
            ? `Active founder traction & problem discussion trending on Hacker News`
            : `Recent community friction reported in online developer & founder discussions`,
          archetype: synthesized.archetype,
          sourcePainPoint: p,
          mvpScope: {
            screens: synthesized.screens,
            coreApis: synthesized.coreApis,
            keyFeatures: synthesized.keyFeatures,
            estimatedComplexity: "LOW" as const,
          },
          competitors: synthesized.competitors,
          evidence: [
            {
              id: `ev_cand_${idx + 1}`,
              type: "forum_complaint" as const,
              url: p.source_url,
              title: p.who_has_it,
              snippet: p.quote,
              verified: true,
              confidence: "high" as const,
              gathered_at: new Date().toISOString(),
            },
          ],
          status: "SCOUTED" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

    if (!this.llm.isConfigured()) {
      return synthesizeAll();
    }

    const painPointsSummary = painPoints
      .map(
        (p, i) =>
          `[PainPoint ${i + 1}]
Problem: ${p.problem}
Target User: ${p.who_has_it}
Evidence Quote: "${p.quote}"
Source URL: ${p.source_url}`
      )
      .join("\n\n");

    const prompt = `You are a high-level SaaS Product Architect.
Given these REAL pain points from developer & founder communities:

${painPointsSummary}

Turn these pain points into ${maxCandidates} distinct, small-product ideas.

STRICT BUILDABILITY CONSTRAINTS:
1. ONLY small web apps, micro-SaaS tools, automated monitors, converters, or niche dashboards.
2. MUST be buildable by an autonomous coding agent team in Next.js + SQLite/Postgres + Tailwind in a single build.
3. NEVER propose social networks, hardware integrations, native mobile apps, or banking licenses.
4. Keep MVP scope strictly bounded: 2-3 screens max, 2-3 API endpoints, and a sharp wedge.

Return candidate products conforming to the schema.`;

    try {
      const result = await this.llm.completeStructured(
        {
          tier: "reasoner",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        },
        CandidateIdeasSchema
      );

      return result.candidates.map((c, idx) => {
        const matchingPainPoint = painPoints[idx % painPoints.length];
        return {
          id: `idea_${Math.random().toString(36).substring(2, 9)}`,
          title: c.title,
          tagline: c.tagline,
          problem: c.problem,
          targetCustomer: c.targetCustomer,
          whyNow: c.whyNow,
          archetype: c.archetype,
          sourcePainPoint: matchingPainPoint,
          mvpScope: {
            ...c.mvpScope,
            estimatedComplexity: c.mvpScope.estimatedComplexity || "LOW",
          },
          competitors: c.suggestedCompetitors.map((comp) => ({
            name: comp.name,
            gap: comp.gap,
            pricing: comp.pricing || "$19/mo",
          })),
          evidence: matchingPainPoint
            ? [
                {
                  id: `ev_${Math.random().toString(36).substring(2, 9)}`,
                  type: "forum_complaint" as const,
                  url: matchingPainPoint.source_url,
                  title: matchingPainPoint.who_has_it,
                  snippet: matchingPainPoint.quote,
                  verified: true,
                  confidence: "high" as const,
                  gathered_at: new Date().toISOString(),
                },
              ]
            : [],
          status: "SCOUTED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } catch {
      return synthesizeAll();
    }
  }
}
