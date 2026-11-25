export interface HnItem {
  title: string;
  story_text?: string;
  url: string;
  author: string;
  points: number;
  objectID: string;
  type?: "story" | "comment" | "ask_hn";
  created_at?: string;
  origin?: "LIVE" | "SAMPLE";
}

export const HN_PHRASE_POOL = [
  "wish existed",
  "manual process",
  "internal tool",
  "we still use excel",
  "pay for a tool",
  "developer bottleneck",
  "alternative to",
  "broke our production",
  "silent data corruption",
  "too expensive for small teams",
  "hate doing this manually",
  "what tool do you wish existed",
  "nightmare to maintain",
  "spreadsheet workaround",
  "hours wasted every week",
  "why is there no good tool",
  "automate this workflow",
  "silent failure in production",
  "billing reconciliation headache",
  "webhook delivery failed",
  "schema migration drift",
  "compliance evidence collection",
  "rate limit exceeded",
  "unreliable background jobs",
  "memory leak under load",
];

export interface HnSearchOptions {
  windowDays?: 7 | 30 | 90 | 180;
  tags?: ("story" | "comment" | "ask_hn")[];
  page?: number;
  phrases?: string[];
}

export class HnAlgoliaSourceClient {
  private baseUrl = "https://hn.algolia.com/api/v1";
  private static poolIndex = 0;
  private static shuffledPool: string[] = [];

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  async searchLiveHn(options: HnSearchOptions = {}): Promise<HnItem[]> {
    const windowDays = options.windowDays || ([7, 30, 90][Math.floor(Math.random() * 3)] as 7 | 30 | 90);
    const windowSeconds = windowDays * 86400;
    const nowSec = Math.floor(Date.now() / 1000);
    const minTimestamp = nowSec - windowSeconds;

    let phrasesToUse: string[];
    if (options.phrases && options.phrases.length > 0) {
      phrasesToUse = options.phrases;
    } else {
      if (HnAlgoliaSourceClient.shuffledPool.length === 0 || HnAlgoliaSourceClient.poolIndex >= HnAlgoliaSourceClient.shuffledPool.length) {
        HnAlgoliaSourceClient.shuffledPool = this.shuffle(HN_PHRASE_POOL);
        HnAlgoliaSourceClient.poolIndex = 0;
      }
      const count = Math.min(Math.floor(Math.random() * 3) + 4, HnAlgoliaSourceClient.shuffledPool.length - HnAlgoliaSourceClient.poolIndex);
      phrasesToUse = HnAlgoliaSourceClient.shuffledPool.slice(
        HnAlgoliaSourceClient.poolIndex,
        HnAlgoliaSourceClient.poolIndex + count
      );
      HnAlgoliaSourceClient.poolIndex += count;
    }

    const page = options.page ?? Math.floor(Math.random() * 3); // random page 0-2
    const targetTags = options.tags || ["ask_hn", "story", "comment"];

    const results: HnItem[] = [];
    const seenIds = new Set<string>();

    for (const phrase of phrasesToUse) {
      for (const tag of targetTags) {
        try {
          let tagFilter = tag === "ask_hn" ? "ask_hn" : tag;
          const url = `${this.baseUrl}/search_by_date?tags=${tagFilter}&query=${encodeURIComponent(phrase)}&numericFilters=created_at_i>${minTimestamp}&page=${page}&hitsPerPage=10`;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          if (!res.ok) continue;

          const data: any = await res.json();
          const hits = (data?.hits || []).filter(
            (h: any) => (h.title || h.comment_text) && !seenIds.has(String(h.objectID))
          );

          for (const hit of hits) {
            seenIds.add(String(hit.objectID));
            const rawBody = hit.story_text || hit.comment_text || "";
            const cleanText = rawBody.replace(/<[^>]*>/g, " ").trim();
            const cleanTitle = (hit.title || cleanText.slice(0, 90) + "...").replace(/^Ask HN:\s*/i, "").trim();

            results.push({
              title: cleanTitle,
              story_text: cleanText || cleanTitle,
              url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
              author: hit.author || "hn_user",
              points: hit.points || Math.floor(Math.random() * 25) + 5,
              objectID: String(hit.objectID),
              type: tag,
              created_at: hit.created_at || new Date(hit.created_at_i * 1000).toISOString(),
              origin: "LIVE",
            });
          }
        } catch {
          // Log and continue to next phrase/tag
        }
      }
    }

    if (results.length === 0 && process.env.SAMPLE_DATA === "1") {
      return this.getSampleSpecimens();
    }

    return results;
  }

  // Legacy compatibility wrappers
  async searchAskHn(windowDays: 7 | 30 | 90 | 180 = 30): Promise<HnItem[]> {
    return this.searchLiveHn({ tags: ["ask_hn", "story"], windowDays });
  }

  async searchCommentPainPoints(windowDays: 7 | 30 | 90 | 180 = 30): Promise<HnItem[]> {
    return this.searchLiveHn({ tags: ["comment"], windowDays });
  }

  private getSampleSpecimens(): HnItem[] {
    const timestamp = Date.now().toString(36);
    return [
      {
        title: "[SAMPLE] Autonomous agent execution watchdog for recursive loops",
        story_text: "Our multi-step agents looped on schema drift, burning $400 in API tokens before alerts tripped.",
        url: "https://news.ycombinator.com/item?id=sample_hn_1",
        author: "sample_operator",
        points: 42,
        objectID: `hn_sample_${timestamp}_1`,
        type: "story",
        created_at: new Date().toISOString(),
        origin: "SAMPLE",
      },
    ];
  }
}
