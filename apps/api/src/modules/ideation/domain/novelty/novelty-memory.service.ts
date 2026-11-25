import { prismaDatabase } from "../../../../db/prisma.service.js";

export function computeEmbedding(text: string, dimensions: number = 128): number[] {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const vector = new Array(dimensions).fill(0);

  for (const word of words) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash + word.charCodeAt(i)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.0;
  }

  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.slice(i, i + 3);
    let hash = 0;
    for (let j = 0; j < 3; j++) {
      hash = (hash * 31 + trigram.charCodeAt(j)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 0.4;
  }

  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
  }
  return Math.max(-1, Math.min(1, dotProduct));
}

export class NoveltyMemoryService {
  private static instance: NoveltyMemoryService;

  private constructor() {}

  public static getInstance(): NoveltyMemoryService {
    if (!NoveltyMemoryService.instance) {
      NoveltyMemoryService.instance = new NoveltyMemoryService();
    }
    return NoveltyMemoryService.instance;
  }

  async getRecentSeenIdeas(userId: string, limit = 50): Promise<Array<{ title: string; problem: string; embedding: number[] }>> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return [];
    const rows = await prisma.userSeenIdea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => ({ title: r.title, problem: r.problem, embedding: r.embedding }));
  }

  async recordShownIdea(
    userId: string,
    title: string,
    problem: string,
    status: "SHOWN" | "APPROVED" | "REJECTED" = "SHOWN"
  ): Promise<void> {
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return;
    const embedding = computeEmbedding(`${title} ${problem}`);
    await prisma.userSeenIdea.create({
      data: { userId, title, problem, embedding, status },
    });
  }

  async recordShownItem(userId: string, _itemType: "PAIN_POINT" | "IDEA", text: string): Promise<void> {
    await this.recordShownIdea(userId, text.slice(0, 60), text, "SHOWN");
  }

  async isNovel(
    userId: string,
    text: string,
    threshold = 0.80
  ): Promise<{ novel: boolean; maxSimilarity: number; matchedText?: string }> {
    const seen = await this.getRecentSeenIdeas(userId, 50);
    if (seen.length === 0) return { novel: true, maxSimilarity: 0 };

    const targetVec = computeEmbedding(text);
    let maxSim = 0;
    let matchedText: string | undefined;

    for (const item of seen) {
      const sim = cosineSimilarity(targetVec, item.embedding);
      if (sim > maxSim) {
        maxSim = sim;
        matchedText = `${item.title} - ${item.problem}`;
      }
    }

    return { novel: maxSim < threshold, maxSimilarity: maxSim, matchedText };
  }
}
