import { LlmClient } from "@venture-studio/llm-client";
import { PainPoint } from "@venture-studio/contracts";
import { z } from "zod";
import { computeEmbedding, cosineSimilarity } from "../novelty/novelty-memory.service.js";
import { prismaDatabase } from "../../../../db/prisma.service.js";

export interface ExtractedPainSignal {
  painPointId: string;
  problem: string;
  persona: string;
  current_workaround: string;
  severity_signals: string;
  willingness_to_pay_clues: string;
  quote: string;
  sourceUrl: string;
  source: string;
  createdAt: string;
  embedding: number[];
}

export interface PainCluster {
  id: string;
  centroid: number[];
  signals: ExtractedPainSignal[];
  mentionsCount: number;
  recencyScore: number;
  paySignalScore: number;
  rankScore: number;
}

const ExtractedItemSchema = z.object({
  problem: z.string(),
  persona: z.string(),
  current_workaround: z.string(),
  severity_signals: z.string(),
  willingness_to_pay_clues: z.string(),
});

const ExtractedBatchSchema = z.object({
  items: z.array(ExtractedItemSchema),
});

export class IdeaClusterService {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async extractSignals(painPoints: PainPoint[]): Promise<ExtractedPainSignal[]> {
    const subset = painPoints.slice(0, 12);
    let extractedMeta: Array<z.infer<typeof ExtractedItemSchema>> = [];

    try {
      const prompt = `Extract structured pain-point metadata for each live signal below. Use ONLY facts present in the quote and problem text. Do not invent metrics or personas not implied by the text.

SIGNALS:
${subset.map((p, i) => `[${i}] Source: ${p.domain} | Problem: ${p.problem} | Quote: "${p.quote.slice(0, 260)}"`).join("\n")}

Return JSON { "items": [ { "problem": "...", "persona": "...", "current_workaround": "...", "severity_signals": "...", "willingness_to_pay_clues": "..." } ] } with length ${subset.length}.`;

      const { data } = await this.llm.completeStructured(
        { tier: "fast", messages: [{ role: "user", content: prompt }], temperature: 0.1 },
        ExtractedBatchSchema
      );
      if (data?.items?.length) {
        extractedMeta = data.items;
      }
    } catch {
      // Fallback to direct extraction from verified text if LLM is unavailable
    }

    const prisma = await prismaDatabase.ensureReady();
    const signals: ExtractedPainSignal[] = [];

    for (let i = 0; i < subset.length; i++) {
      const p = subset[i]!;
      const meta = extractedMeta[i];
      const problem = (meta?.problem || p.problem).trim();
      const persona = (meta?.persona || p.who_has_it || "Operators").trim();
      const current_workaround = (meta?.current_workaround || "Manual scripts and spreadsheets").trim();
      const severity_signals = (meta?.severity_signals || `Frequency score ${p.frequency_score}/10`).trim();
      const willingness_to_pay_clues = (
        meta?.willingness_to_pay_clues ||
        (/\b(pay|cost|expensive|hours|lost|production|billing|compliance|downtime)\b/i.test(p.quote)
          ? "Explicit time/revenue cost mentioned in evidence"
          : "Implicit workflow friction")
      ).trim();

      const embedding = computeEmbedding(`${problem} ${p.quote}`);
      let painPointId = p.id;

      if (prisma) {
        try {
          const saved = await prisma.painPointRecord.upsert({
            where: { url: p.source_url },
            create: {
              source: p.domain || "Live Source",
              url: p.source_url,
              quote: p.quote,
              problem,
              persona,
              currentWorkaround: current_workaround,
              severitySignals: severity_signals,
              willingnessToPayClues: willingness_to_pay_clues,
              origin: "LIVE",
              citationVerified: Boolean(p.citation_verified),
              embedding,
              sourceCreatedAt: p.scouted_at ? new Date(p.scouted_at) : new Date(),
            },
            update: {
              problem,
              persona,
              citationVerified: Boolean(p.citation_verified),
              embedding,
            },
          });
          painPointId = saved.id;
        } catch {}
      }

      signals.push({
        painPointId,
        problem,
        persona,
        current_workaround,
        severity_signals,
        willingness_to_pay_clues,
        quote: p.quote,
        sourceUrl: p.source_url,
        source: p.domain || "Live Source",
        createdAt: p.scouted_at || new Date().toISOString(),
        embedding,
      });
    }

    return signals;
  }

  clusterAndRank(signals: ExtractedPainSignal[]): PainCluster[] {
    const clusters: PainCluster[] = [];
    const threshold = 0.55;

    for (const sig of signals) {
      let bestCluster: PainCluster | null = null;
      let bestSim = -1;

      for (const c of clusters) {
        const sim = cosineSimilarity(sig.embedding, c.centroid);
        if (sim >= threshold && sim > bestSim) {
          bestSim = sim;
          bestCluster = c;
        }
      }

      if (bestCluster) {
        bestCluster.signals.push(sig);
      } else {
        clusters.push({
          id: `cluster_${clusters.length + 1}`,
          centroid: sig.embedding,
          signals: [sig],
          mentionsCount: 1,
          recencyScore: 0,
          paySignalScore: 0,
          rankScore: 0,
        });
      }
    }

    const now = Date.now();
    for (const c of clusters) {
      c.mentionsCount = c.signals.length;
      const avgAgeDays =
        c.signals.reduce((acc, s) => acc + Math.max(0, (now - new Date(s.createdAt).getTime()) / 86400000), 0) /
        c.signals.length;
      c.recencyScore = Math.max(0.1, 1 - avgAgeDays / 180);
      const payHits = c.signals.filter((s) =>
        /\b(pay|cost|price|revenue|billing|hours|loss|client|customer|money)\b/i.test(
          `${s.willingness_to_pay_clues} ${s.quote}`
        )
      ).length;
      c.paySignalScore = payHits / c.signals.length;
      c.rankScore = c.mentionsCount * 2.0 + c.recencyScore * 1.5 + c.paySignalScore * 2.0;
    }

    return clusters.sort((a, b) => b.rankScore - a.rankScore);
  }
}
