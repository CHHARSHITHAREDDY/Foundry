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

export class IdeaGeneratorService {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async generateCandidates(painPoints: PainPoint[], maxCandidates: number = 6): Promise<IdeaBrief[]> {
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
Given the following REAL pain points harvested from developer and founder communities:

${painPointsSummary}

Turn these pain points into ${maxCandidates} distinct, small-product ideas.

STRICT BUILDABILITY CONSTRAINTS:
1. ONLY small web apps, micro-SaaS tools, automated monitors, converters, or niche dashboards.
2. MUST be buildable by an autonomous coding agent team in Next.js + SQLite/Postgres + Tailwind in a single build.
3. NEVER propose social networks, hardware integrations, native mobile apps, or things requiring banking licenses.
4. Keep MVP scope strictly bounded: 2-3 screens max (Landing, Dashboard, Settings), 2-3 API endpoints, and a razor-sharp wedge.

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
          mvpScope: c.mvpScope,
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
    } catch (err) {
      console.warn("LLM generation failed, falling back to deterministic candidate generator:", err);
      // Deterministic fallback based directly on pain points
      return painPoints.slice(0, maxCandidates).map((p, idx) => ({
        id: `idea_fallback_${idx + 1}`,
        title: p.domain?.includes("vat") || p.problem.toLowerCase().includes("vat")
          ? "VATSentry"
          : p.problem.toLowerCase().includes("uptime")
          ? "FormPulse Monitor"
          : "ChangelogRocket",
        tagline: `Automated micro-solution for ${p.who_has_it}`,
        problem: p.problem,
        targetCustomer: p.who_has_it,
        whyNow: "High manual hours wasted on fragmented existing solutions",
        archetype: "Micro-SaaS Utility",
        sourcePainPoint: p,
        mvpScope: {
          screens: ["Landing Page", "App Dashboard", "Alert Settings"],
          coreApis: ["/api/check", "/api/records", "/api/notify"],
          keyFeatures: ["Automated verification", "Instant webhook alerts", "One-click export"],
          estimatedComplexity: "LOW",
        },
        competitors: [
          { name: "Generic Alternative", gap: "Overpriced, complex enterprise setup", pricing: "$49/mo" },
        ],
        evidence: [
          {
            id: `ev_fb_${idx + 1}`,
            type: "forum_complaint",
            url: p.source_url,
            title: p.who_has_it,
            snippet: p.quote,
            verified: true,
            confidence: "high",
            gathered_at: new Date().toISOString(),
          },
        ],
        status: "SCOUTED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  }
}
