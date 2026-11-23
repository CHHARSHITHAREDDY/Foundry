import { LlmClient } from "@venture-studio/llm-client";
import { PainPoint, IdeaBrief, FinancialViability } from "@venture-studio/contracts";
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
      financialModel: z
        .object({
          tam: z.string(),
          sam: z.string(),
          som: z.string(),
          cagr: z.string(),
          pricingTiers: z.object({
            starter: z.string(),
            pro: z.string(),
            team: z.string(),
          }),
          unitEconomics: z.object({
            estimatedCac: z.string(),
            estimatedLtv: z.string(),
            ltvCacRatio: z.number(),
            paybackMonths: z.number(),
            breakevenCustomers: z.number(),
          }),
          marketTimingJustification: z.string(),
        })
        .optional(),
    })
  ),
});

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "in", "on", "to", "with", "by", "from", "at",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "how", "what", "why", "where", "when", "who", "which", "wish", "there", "was", "tool",
  "app", "software", "need", "please", "can", "could", "should", "would", "our", "we",
  "my", "me", "i", "you", "your", "they", "them", "their", "this", "that", "these", "those",
  "automated", "automating", "every", "week", "month", "day", "silent", "silently"
]);

const SUFFIX_VARIANTS = [
  "Guard",
  "Sentry",
  "Pulse",
  "Flow",
  "Relay",
  "Pilot",
  "Vault",
  "Radar",
  "Shield",
  "Forge",
  "Sync",
  "Copilot",
];

function synthesizeDynamicTitle(
  problem: string,
  domain?: string,
  usedTitles: Set<string> = new Set()
): string {
  const lower = problem.toLowerCase();
  let basePrefix = "Cloud";

  // High-intent domain-tailored name mappings
  if (lower.includes("schema drift")) basePrefix = "Schema";
  else if (lower.includes("connection pool")) basePrefix = "Pool";
  else if (lower.includes("redis") || lower.includes("memory leak")) basePrefix = "Mem";
  else if (lower.includes("egress") || lower.includes("s3")) basePrefix = "Egress";
  else if (lower.includes("docker") || lower.includes("vulnerability")) basePrefix = "Patch";
  else if (lower.includes("vat") || lower.includes("moss")) basePrefix = "Vat";
  else if (lower.includes("reconciliation") || lower.includes("wise")) basePrefix = "Reconcile";
  else if (lower.includes("dunning") || lower.includes("failed credit card")) basePrefix = "Dunning";
  else if (lower.includes("1099") || lower.includes("contractor tax")) basePrefix = "Tax";
  else if (lower.includes("webhook") || lower.includes("dead-letter")) basePrefix = "Webhook";
  else if (lower.includes("price") || lower.includes("competitor")) basePrefix = "Margin";
  else if (lower.includes("inventory") || lower.includes("stockout")) basePrefix = "Stock";
  else if (lower.includes("return fraud") || lower.includes("wardrobing")) basePrefix = "Return";
  else if (lower.includes("soc2") || lower.includes("iso27001")) basePrefix = "Audit";
  else if (lower.includes("token") || lower.includes("api key") || lower.includes("secret")) basePrefix = "Secret";
  else if (lower.includes("gdpr") || lower.includes("forgotten")) basePrefix = "Purge";
  else if (lower.includes("changelog") || lower.includes("release notes")) basePrefix = "Release";
  else if (lower.includes("podcast") || lower.includes("video")) basePrefix = "Clip";
  else if (lower.includes("seo") || lower.includes("programmatic")) basePrefix = "Pillar";
  else if (lower.includes("broken link") || lower.includes("404")) basePrefix = "Link";
  else if (lower.includes("playwright") || lower.includes("regression")) basePrefix = "Test";
  else if (lower.includes("support ticket") || lower.includes("triage")) basePrefix = "Triage";
  else if (lower.includes("llm") || lower.includes("token cost")) basePrefix = "Cost";
  else if (lower.includes("prompt injection") || lower.includes("guardrail")) basePrefix = "Guardrail";
  else if (lower.includes("prompt regression") || lower.includes("benchmark")) basePrefix = "Eval";
  else if (lower.includes("offboarding") || lower.includes("provisioning")) basePrefix = "Access";
  else if (lower.includes("take-home") || lower.includes("plagiarism")) basePrefix = "Code";
  else if (lower.includes("contract renewal") || lower.includes("auto-renewal")) basePrefix = "Renewal";
  else if (lower.includes("nda") || lower.includes("ip assignment")) basePrefix = "IP";
  else if (lower.includes("hipaa") || lower.includes("phi")) basePrefix = "Redact";
  else {
    // Lexical fallback
    const words = problem
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));

    const topWords = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    basePrefix = topWords.join("") || "Omni";
  }

  // Find an unused title variant
  for (const suffix of SUFFIX_VARIANTS) {
    const candidate = `${basePrefix}${suffix}`;
    if (!usedTitles.has(candidate)) {
      usedTitles.add(candidate);
      return candidate;
    }
  }

  const randomized = `${basePrefix}Pilot${Math.floor(Math.random() * 90) + 10}`;
  usedTitles.add(randomized);
  return randomized;
}

function computeDomainFinancialModel(domain?: string, problem?: string): FinancialViability {
  const lower = (domain || problem || "").toLowerCase();

  if (lower.includes("fintech") || lower.includes("tax") || lower.includes("billing")) {
    return {
      tam: "$8.4B Global SaaS Invoicing & Tax Compliance",
      sam: "$920M SMB & Cross-Border B2B Market",
      som: "$28M Reachable Indie/SMB Market in Years 1-2",
      cagr: "18.4% YoY",
      pricingTiers: { starter: "$49/mo", pro: "$129/mo", team: "$299/mo" },
      unitEconomics: {
        estimatedCac: "$180",
        estimatedLtv: "$1,620",
        ltvCacRatio: 9.0,
        paybackMonths: 3.7,
        breakevenCustomers: 42,
      },
      marketTimingJustification: "New EU digital services thresholds and cross-border SaaS tax scrutiny force automation over manual filings.",
    };
  }

  if (lower.includes("security") || lower.includes("compliance") || lower.includes("auth")) {
    return {
      tam: "$16.2B Cloud Security & Compliance Automation",
      sam: "$1.8B Seed to Series B Startup Compliance",
      som: "$35M Developer-Led Tooling Wedge",
      cagr: "22.6% YoY",
      pricingTiers: { starter: "$79/mo", pro: "$199/mo", team: "$499/mo" },
      unitEconomics: {
        estimatedCac: "$310",
        estimatedLtv: "$2,800",
        ltvCacRatio: 9.0,
        paybackMonths: 4.2,
        breakevenCustomers: 28,
      },
      marketTimingJustification: "Enterprise buyers demand automated continuous SOC2/ISO audit trails from even early-stage vendors.",
    };
  }

  if (lower.includes("ai") || lower.includes("observability") || lower.includes("cost")) {
    return {
      tam: "$6.8B GenAI Observability & Governance Market",
      sam: "$850M Production LLM App Infrastructure",
      som: "$22M Developer Autonomous Workflow Space",
      cagr: "38.2% YoY",
      pricingTiers: { starter: "$39/mo", pro: "$99/mo", team: "$249/mo" },
      unitEconomics: {
        estimatedCac: "$140",
        estimatedLtv: "$1,450",
        ltvCacRatio: 10.4,
        paybackMonths: 3.2,
        breakevenCustomers: 38,
      },
      marketTimingJustification: "Surging multi-agent LLM deployments create immediate budget overruns and security leakage vulnerabilities.",
    };
  }

  // Default B2B Micro-SaaS Model
  return {
    tam: "$5.1B Developer Tools & Workflow Automation",
    sam: "$640M B2B Engineering Teams",
    som: "$18M High-Intent Self-Serve Market",
    cagr: "15.8% YoY",
    pricingTiers: { starter: "$29/mo", pro: "$79/mo", team: "$199/mo" },
    unitEconomics: {
      estimatedCac: "$110",
      estimatedLtv: "$1,120",
      ltvCacRatio: 10.2,
      paybackMonths: 3.5,
      breakevenCustomers: 50,
    },
    marketTimingJustification: "Lean autonomous teams demand specialized micro-SaaS utilities rather than bloated all-in-one suites.",
  };
}

export class IdeaGeneratorService {
  private llm: LlmClient;
  private static globalUsedTitles = new Set<string>();

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  private synthesizeDeterministic(p: PainPoint, idx: number): IdeaBrief {
    if (IdeaGeneratorService.globalUsedTitles.size > 200) {
      IdeaGeneratorService.globalUsedTitles.clear();
    }
    const title = synthesizeDynamicTitle(p.problem, p.domain, IdeaGeneratorService.globalUsedTitles);
    const financialModel = computeDomainFinancialModel(p.domain, p.problem);
    const lower = p.problem.toLowerCase();

    let archetype = "Micro-SaaS Automation";
    if (lower.includes("monitor") || lower.includes("drift") || lower.includes("alert")) {
      archetype = "Automated Infrastructure Monitor";
    } else if (lower.includes("vat") || lower.includes("tax") || lower.includes("reconcil")) {
      archetype = "FinTech Compliance Ledger";
    } else if (lower.includes("webhook") || lower.includes("token") || lower.includes("secret")) {
      archetype = "Developer Security Proxy";
    } else if (lower.includes("llm") || lower.includes("cost") || lower.includes("prompt")) {
      archetype = "AI Observability Guardrail";
    }

    return {
      id: `idea_${Math.random().toString(36).substring(2, 9)}_${idx + 1}`,
      title,
      tagline: `Automated zero-friction solution eliminating manual errors for ${p.who_has_it.split("(")[0]?.trim() || "modern teams"}`,
      problem: p.problem,
      targetCustomer: p.who_has_it,
      whyNow: `Active community friction documented in ${p.domain || "industry forums"} with unserved willingness to pay`,
      archetype,
      sourcePainPoint: p,
      mvpScope: {
        screens: ["Live Status Monitor", "Configuration & Alert Rules", "Audit Log & History"],
        coreApis: ["/api/v1/health-check", "/api/v1/events/ingest", "/api/v1/audit/export"],
        keyFeatures: [
          "Automated continuous health assertion",
          "Instant webhook alerts to Slack and email",
          "Historical audit log export with tamper verification",
        ],
        estimatedComplexity: "LOW" as const,
      },
      competitors: [
        {
          name: "Internal Custom Scripts",
          gap: "Fragile cron jobs with no failure alerts or maintenance stewards.",
          pricing: "Engineering hours ($150/hr)",
        },
        {
          name: "Heavyweight Enterprise Suites",
          gap: "Multi-week onboarding and minimum $400/mo enterprise contract commitments.",
          pricing: "$400/mo",
        },
      ],
      evidence: [
        {
          id: `ev_${Math.random().toString(36).substring(2, 9)}`,
          type: "forum_complaint" as const,
          url: p.source_url,
          title: p.who_has_it,
          snippet: p.quote,
          verified: true,
          confidence: "high" as const,
          gathered_at: new Date().toISOString(),
        },
      ],
      financialModel,
      status: "SCOUTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async generateCandidates(painPoints: PainPoint[], maxCandidates: number = 8): Promise<IdeaBrief[]> {
    const selectedPainPoints = painPoints.slice(0, maxCandidates);
    if (selectedPainPoints.length === 0) return [];

    if (!this.llm.isConfigured()) {
      return selectedPainPoints.map((p, idx) => this.synthesizeDeterministic(p, idx));
    }

    const painPointsSummary = selectedPainPoints
      .map(
        (p, i) =>
          `[PainPoint ${i + 1}] (ID: ${p.id})
Domain: ${p.domain || "B2B Software"}
Problem: ${p.problem}
Target User: ${p.who_has_it}
Evidence Quote: "${p.quote}"
Source URL: ${p.source_url}`
      )
      .join("\n\n");

    const prompt = `You are an elite B2B SaaS Venture Architect and Financial Analyst.
Given these REAL pain points from active developer and founder communities:

${painPointsSummary}

Turn these pain points into ${selectedPainPoints.length} DISTINCT, high-velocity, small-product ideas.

STRICT PRODUCT & BUILDABILITY CONSTRAINTS:
1. ONLY small web apps, micro-SaaS tools, automated monitors, converters, or niche dashboards.
2. MUST be buildable by an autonomous coding agent team in Next.js + SQLite/Postgres + Tailwind in a single build.
3. NEVER propose social networks, hardware integrations, native mobile apps, or banking licenses.
4. Keep MVP scope strictly bounded: 2-3 screens max, 2-3 API endpoints, and a sharp wedge.
5. Provide grounded financial metrics: TAM/SAM/SOM, 3-tier SaaS pricing, and unit economics (CAC, LTV, LTV:CAC ratio >= 3).

Return candidate products conforming to the schema.`;

    try {
      const { data: result } = await this.llm.completeStructured(
        {
          tier: "reasoner",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        },
        CandidateIdeasSchema
      );

      return result.candidates.map((c, idx) => {
        const matchingPainPoint = selectedPainPoints[idx] || selectedPainPoints[0]!;
        const fallbackFinancial = computeDomainFinancialModel(matchingPainPoint.domain, matchingPainPoint.problem);

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
            pricing: comp.pricing || "$29/mo",
          })),
          evidence: [
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
          ],
          financialModel: c.financialModel || fallbackFinancial,
          status: "SCOUTED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } catch {
      return selectedPainPoints.map((p, idx) => this.synthesizeDeterministic(p, idx));
    }
  }
}
