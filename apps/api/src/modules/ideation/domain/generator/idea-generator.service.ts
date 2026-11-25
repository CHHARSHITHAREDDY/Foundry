import { LlmClient } from "@venture-studio/llm-client";
import { PainPoint, IdeaBrief, FinancialViability } from "@venture-studio/contracts";
import { z } from "zod";
import { PainCluster } from "../cluster/idea-cluster.service.js";
import { NoveltyMemoryService } from "../novelty/novelty-memory.service.js";

export const ALLOWED_ARCHETYPES = [
  "monitor",
  "converter",
  "tracker",
  "bridge/automation",
  "generator",
  "auditor/checker",
  "directory/portal",
  "calculator",
  "scheduler",
  "inbox/triage",
  "report builder",
] as const;

export const BANNED_BOILERPLATE_PHRASES = [
  "zero-friction",
  "eliminating manual errors",
  "automated solution for",
  "seamless",
  "supercharge",
];

const SUFFIX_PATTERNS = /(?:ify|ly|hub|flow|vault|watch|forge|pulse|sync|desk|pilot|mind|craft|base|stack|mate|guard|scope|lens)$/i;

const ThreePassAngleSchema = z.object({
  title: z.string().min(2),
  tagline: z.string().min(5),
  archetype: z.string(),
  persona: z.string(),
  jobToBeDone: z.string(),
  wedge: z.string(),
  whyNow: z.string(),
  mvpScope: z.object({
    screens: z.array(z.string()).min(2),
    coreApis: z.array(z.string()).min(1),
    keyFeatures: z.array(z.string()).min(2),
    estimatedComplexity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  }),
});

const ThreePassClusterSchema = z.object({
  framedProblem: z.string(),
  angles: z.array(ThreePassAngleSchema).min(2).max(4),
});

const CritiqueOutputSchema = z.object({
  evaluations: z.array(
    z.object({
      title: z.string(),
      specificityScore: z.number().min(0).max(10),
      noveltyScore: z.number().min(0).max(10),
      buildabilityScore: z.number().min(0).max(10),
      wedgeScore: z.number().min(0).max(10),
      keep: z.boolean(),
      reason: z.string(),
    })
  ),
});

export interface DroppedCandidateLog {
  title: string;
  archetype: string;
  reason: string;
}

export function hasBannedBoilerplate(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of BANNED_BOILERPLATE_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}

export function extractConcreteNounsFromQuote(quote: string): string[] {
  const stopWords = new Set([
    "about", "after", "again", "against", "because", "before", "being", "between",
    "could", "doing", "during", "every", "first", "found", "great", "having",
    "hours", "issue", "issues", "manual", "never", "other", "people", "really",
    "should", "since", "something", "still", "their", "there", "these", "thing",
    "things", "think", "those", "through", "trying", "using", "where", "which",
    "while", "would", "years", "always", "around", "cannot", "doesn", "getting",
  ]);
  const words = quote
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w) && !/^\d+$/.test(w));
  return Array.from(new Set(words));
}

export function taglineContainsEvidenceNoun(tagline: string, quote: string): boolean {
  const nouns = extractConcreteNounsFromQuote(quote);
  if (nouns.length === 0) return true;
  const lowerTagline = tagline.toLowerCase();
  return nouns.some((n) => lowerTagline.includes(n));
}

export class IdeaGeneratorService {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async generateFromClusters(
    clusters: PainCluster[],
    userId: string,
    maxCandidates = 8
  ): Promise<{ candidates: IdeaBrief[]; droppedLog: DroppedCandidateLog[] }> {
    const novelty = NoveltyMemoryService.getInstance();
    const seenIdeas = await novelty.getRecentSeenIdeas(userId, 50);
    const seenTitlesLower = new Set(seenIdeas.map((s) => s.title.toLowerCase().trim()));

    const droppedLog: DroppedCandidateLog[] = [];
    const accepted: IdeaBrief[] = [];
    const usedSuffixPatterns = new Set<string>();
    const topClusters = clusters.slice(0, 4);

    for (const cluster of topClusters) {
      if (accepted.length >= maxCandidates) break;
      const primarySignal = cluster.signals[0]!;
      const evidenceSummary = cluster.signals
        .slice(0, 3)
        .map((s) => `- [${s.source}] "${s.quote.slice(0, 220)}" (Persona: ${s.persona}, Workaround: ${s.current_workaround})`)
        .join("\n");

      const passPrompt = `You are a Venture Product Strategist executing a 2-pass divergent synthesis from verified market evidence.

CLUSTER EVIDENCE:
${evidenceSummary}

PASS A (Frame the Problem):
Write "framedProblem" as ONE crisp sentence using concrete words directly from the evidence above.

PASS B (Produce 3 Divergent Solution Angles):
Propose 3 distinct web-app product angles solving this problem, each from a DIFFERENT archetype chosen from:
${ALLOWED_ARCHETYPES.join(", ")}

TARGET PERSONA DIVERSITY:
Include non-developer personas (small business, creators, agencies, local services, finance/ops teams) wherever the evidence fits, not only developer tools.

NAMING & COPY RULES (STRICTLY ENFORCED):
1. Titles MUST be distinct, pronounceable brand names (e.g. "Tallymark", "Clearcut", "Dockside", "Briefcase", "Redline"). DO NOT use "<Noun><Suffix>" cliché compounds ending in -ify, -ly, -hub, -flow, -vault, -watch, -forge, -pulse, -sync.
2. NEVER use banned boilerplate phrases: "zero-friction", "eliminating manual errors", "automated solution for", "seamless", "supercharge".
3. Each tagline MUST include at least one concrete noun taken directly from the evidence quote!
4. Avoid repeating any of these previously shown names: ${Array.from(seenTitlesLower).slice(0, 15).join(", ") || "none"}.

Return valid JSON matching { "framedProblem": string, "angles": [ { title, tagline, archetype, persona, jobToBeDone, wedge, whyNow, mvpScope: { screens, coreApis, keyFeatures, estimatedComplexity } } ] }.`;

      let parsedCluster: { framedProblem: string; angles: any[] };
      try {
        const { data } = await this.llm.completeStructured(
          { tier: "reasoner", messages: [{ role: "user", content: passPrompt }], temperature: 0.55 },
          ThreePassClusterSchema
        );
        parsedCluster = data;
      } catch (err: any) {
        droppedLog.push({
          title: primarySignal.problem.slice(0, 40),
          archetype: "N/A",
          reason: `LLM synthesis failed: ${err?.message || "unknown error"}`,
        });
        continue;
      }

      // PASS C: Separate Critique Pass
      let critiqueMap = new Map<string, { keep: boolean; reason: string; score: number }>();
      try {
        const critiquePrompt = `You are an unforgiving Venture Critique Reviewer. Score each of these 3 product angles (0-10) on specificity, novelty vs user history, buildability as a Next.js web app, and wedge strength. Mark generic or vague angles keep=false with a clear reason.

EVIDENCE PROBLEM: ${parsedCluster.framedProblem}
ANGLES:
${parsedCluster.angles.map((a) => `- ${a.title} (${a.archetype}) for ${a.persona}: "${a.tagline}" | Wedge: ${a.wedge}`).join("\n")}

Return JSON { "evaluations": [ { "title": "...", "specificityScore": 0-10, "noveltyScore": 0-10, "buildabilityScore": 0-10, "wedgeScore": 0-10, "keep": boolean, "reason": "..." } ] }.`;

        const { data: crit } = await this.llm.completeStructured(
          { tier: "fast", messages: [{ role: "user", content: critiquePrompt }], temperature: 0.1 },
          CritiqueOutputSchema
        );
        for (const ev of crit.evaluations) {
          const avg = (ev.specificityScore + ev.noveltyScore + ev.buildabilityScore + ev.wedgeScore) / 4;
          critiqueMap.set(ev.title.toLowerCase(), { keep: ev.keep && avg >= 5.5, reason: ev.reason, score: avg });
        }
      } catch {
        // If critique call fails, evaluate deterministically below
      }

      for (const angle of parsedCluster.angles) {
        if (accepted.length >= maxCandidates) break;

        // 1. Check critique decision
        const critique = critiqueMap.get(angle.title.toLowerCase());
        if (critique && !critique.keep) {
          droppedLog.push({ title: angle.title, archetype: angle.archetype, reason: `Critique dropped: ${critique.reason}` });
          continue;
        }

        // 2. Check banned boilerplate
        const banned = hasBannedBoilerplate(`${angle.title} ${angle.tagline} ${parsedCluster.framedProblem} ${angle.wedge}`);
        if (banned) {
          droppedLog.push({ title: angle.title, archetype: angle.archetype, reason: `Banned boilerplate detected: "${banned}"` });
          continue;
        }

        // 3. Check tagline contains concrete noun from evidence quote
        if (!taglineContainsEvidenceNoun(angle.tagline, primarySignal.quote)) {
          droppedLog.push({
            title: angle.title,
            archetype: angle.archetype,
            reason: `Tagline lacks concrete noun from verified evidence quote.`,
          });
          continue;
        }

        // 4. Check naming uniqueness vs last 50 shown names & suffix pattern cap
        const titleLower = angle.title.trim().toLowerCase();
        if (seenTitlesLower.has(titleLower) || accepted.some((a) => a.title.toLowerCase() === titleLower)) {
          droppedLog.push({ title: angle.title, archetype: angle.archetype, reason: "Duplicate or previously shown name" });
          continue;
        }

        const suffixMatch = angle.title.trim().match(SUFFIX_PATTERNS);
        if (suffixMatch) {
          const suffix = suffixMatch[0].toLowerCase();
          if (usedSuffixPatterns.has(suffix)) {
            droppedLog.push({ title: angle.title, archetype: angle.archetype, reason: `Repeated <Noun><Suffix> pattern (-${suffix})` });
            continue;
          }
          usedSuffixPatterns.add(suffix);
        }

        // 5. Novelty embedding check vs user history
        const noveltyRes = await novelty.isNovel(userId, `${angle.title} ${parsedCluster.framedProblem}`, 0.82);
        if (!noveltyRes.novel) {
          droppedLog.push({
            title: angle.title,
            archetype: angle.archetype,
            reason: `Semantic similarity ${(noveltyRes.maxSimilarity * 100).toFixed(0)}% exceeds novelty threshold`,
          });
          continue;
        }

        seenTitlesLower.add(titleLower);

        const financialModel: FinancialViability = {
          tam: "Not assessed",
          sam: "Not assessed",
          som: "Not assessed",
          cagr: "Not assessed",
          pricingTiers: { starter: "$29/mo", pro: "$79/mo", team: "$199/mo" },
          unitEconomics: {
            estimatedCac: "n/a",
            estimatedLtv: "n/a",
            ltvCacRatio: 0,
            paybackMonths: 0,
            breakevenCustomers: 0,
          },
          marketTimingJustification: angle.whyNow,
        };

        accepted.push({
          id: `idea_${Math.random().toString(36).substring(2, 10)}`,
          title: angle.title.trim(),
          tagline: angle.tagline.trim(),
          problem: parsedCluster.framedProblem,
          targetCustomer: angle.persona,
          whyNow: angle.whyNow,
          archetype: angle.archetype,
          mvpScope: {
            screens: angle.mvpScope.screens.slice(0, 6),
            coreApis: angle.mvpScope.coreApis.slice(0, 6),
            keyFeatures: angle.mvpScope.keyFeatures.slice(0, 6),
            estimatedComplexity: angle.mvpScope.estimatedComplexity,
          },
          competitors: [],
          evidence: cluster.signals.map((s) => ({
            id: s.painPointId,
            type: "forum_complaint" as const,
            url: s.sourceUrl,
            title: s.source,
            snippet: s.quote,
            verified: true,
            confidence: "high" as const,
            gathered_at: s.createdAt,
          })),
          sourcePainPoint: {
            id: primarySignal.painPointId,
            problem: primarySignal.problem,
            who_has_it: primarySignal.persona,
            source_url: primarySignal.sourceUrl,
            quote: primarySignal.quote,
            frequency_score: Math.min(10, cluster.mentionsCount + 4),
            domain: primarySignal.source,
            source_type: "LIVE_API",
            origin: "LIVE",
            citation_verified: true,
            scouted_at: primarySignal.createdAt,
          },
          financialModel,
          ownerId: userId,
          status: "VALIDATED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Extended fields carried via object
          ...( { jobToBeDone: angle.jobToBeDone, wedge: angle.wedge } as any ),
        });
      }
    }

    return { candidates: accepted, droppedLog };
  }

  /**
   * Legacy wrapper for direct pain point arrays
   */
  async generateCandidates(painPoints: PainPoint[], maxCandidates = 8): Promise<IdeaBrief[]> {
    const fakeClusters: PainCluster[] = painPoints.slice(0, 4).map((p, i) => ({
      id: `cluster_${i + 1}`,
      centroid: [],
      signals: [
        {
          painPointId: p.id,
          problem: p.problem,
          persona: p.who_has_it,
          current_workaround: "Manual spreadsheets",
          severity_signals: "High",
          willingness_to_pay_clues: "Time lost",
          quote: p.quote,
          sourceUrl: p.source_url,
          source: p.domain || "Live Source",
          createdAt: p.scouted_at || new Date().toISOString(),
          embedding: [],
        },
      ],
      mentionsCount: 1,
      recencyScore: 1,
      paySignalScore: 0.5,
      rankScore: 1,
    }));

    const { candidates } = await this.generateFromClusters(fakeClusters, "system", maxCandidates);
    if (candidates.length === 0) {
      throw new Error("LLM synthesis produced 0 valid non-boilerplate ideas.");
    }
    return candidates;
  }
}
