export interface StackExchangeQuestion {
  id: string;
  title: string;
  snippet: string;
  url: string;
  author: string;
  score: number;
  tags: string[];
  createdAt: string;
  origin?: "LIVE" | "SAMPLE";
}

export const STACKEXCHANGE_PHRASE_POOL = [
  "how to automate",
  "workaround for",
  "alternative to",
  "performance bottleneck",
  "connection pool timeout",
  "memory leak under load",
  "silent failure",
  "data desync",
  "rate limit exceeded retry",
  "webhook delivery failed",
  "schema migration broken",
  "race condition worker queue",
  "cors header error api",
  "jwt token expiration refresh",
  "stripe webhook signature failed",
  "docker container oom killed",
  "redis connection dropped",
  "postgres lock timeout",
  "s3 upload timeout large file",
  "infinite loop in background job",
  "drizzle migration conflict",
  "nextjs cold start latency",
];

export interface StackExchangeSearchOptions {
  windowDays?: 7 | 30 | 90 | 180;
  phrases?: string[];
  page?: number;
}

export class StackExchangeSourceClient {
  private baseUrl = "https://api.stackexchange.com/2.3";

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  async searchQuestions(options: StackExchangeSearchOptions = {}): Promise<StackExchangeQuestion[]> {
    const phrasesToUse = options.phrases && options.phrases.length > 0
      ? options.phrases
      : this.shuffle(STACKEXCHANGE_PHRASE_POOL).slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 phrases

    const page = (options.page ?? Math.floor(Math.random() * 3)) + 1;
    const windowDays = options.windowDays || 30;
    const minTimestampSec = Math.floor(Date.now() / 1000) - windowDays * 86400;

    const results: StackExchangeQuestion[] = [];
    const seenIds = new Set<string>();

    for (const phrase of phrasesToUse) {
      try {
        const url = `${this.baseUrl}/search/advanced?order=desc&sort=creation&q=${encodeURIComponent(phrase)}&site=stackoverflow&fromdate=${minTimestampSec}&page=${page}&pagesize=10&filter=withbody`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          headers: {
            "User-Agent": "venture-studio-researcher/2.0",
            Accept: "application/json",
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) continue;

        const data: any = await response.json();
        const items = (data?.items || []).filter(
          (item: any) => item.title && !seenIds.has(String(item.question_id))
        );

        for (const q of items) {
          seenIds.add(String(q.question_id));
          const cleanBody = (q.body || q.title || "").replace(/<[^>]*>/g, " ").trim();
          results.push({
            id: `so_${q.question_id}`,
            title: q.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
            snippet: cleanBody.slice(0, 400),
            url: q.link || `https://stackoverflow.com/questions/${q.question_id}`,
            author: q.owner?.display_name || "so_developer",
            score: q.score || 0,
            tags: q.tags || [],
            createdAt: q.creation_date ? new Date(q.creation_date * 1000).toISOString() : new Date().toISOString(),
            origin: "LIVE",
          });
        }
      } catch (err: any) {
        console.warn(`[StackExchange Live] Query for "${phrase}" failed: ${err.message}`);
      }
    }

    if (results.length === 0 && process.env.SAMPLE_DATA === "1") {
      return this.getSampleSpecimens();
    }

    return results;
  }

  private getSampleSpecimens(): StackExchangeQuestion[] {
    const timestamp = Date.now().toString(36);
    return [
      {
        id: `so_sample_${timestamp}`,
        title: "[SAMPLE] How to handle silent dead-letter queue drops in worker pipelines",
        snippet: "When worker nodes crash unexpectedly, unprocessed events in redis remain locked without triggering DLQ alerts.",
        url: "https://stackoverflow.com/questions/sample_dlq_1",
        author: "sample_dev",
        score: 18,
        tags: ["redis", "node.js", "queues"],
        createdAt: new Date().toISOString(),
        origin: "SAMPLE",
      },
    ];
  }
}
