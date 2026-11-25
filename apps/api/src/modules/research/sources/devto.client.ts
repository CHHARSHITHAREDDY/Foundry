export interface DevToArticle {
  id: string;
  title: string;
  snippet: string;
  url: string;
  author: string;
  reactions: number;
  tags: string[];
  publishedAt: string;
  origin?: "LIVE" | "SAMPLE";
}

export const DEVTO_TAGS_POOL = [
  "discuss",
  "saas",
  "devops",
  "productivity",
  "webdev",
  "architecture",
  "database",
  "api",
  "security",
  "testing",
  "ai",
  "nextjs",
  "typescript",
  "backend",
  "cloud",
  "automation",
  "performance",
  "kubernetes",
  "docker",
  "monitoring",
  "microservices",
  "postgres",
];

export interface DevToSearchOptions {
  windowDays?: 7 | 30 | 90 | 180;
  tags?: string[];
  page?: number;
}

export class DevToSourceClient {
  private baseUrl = "https://dev.to/api/articles";

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  async searchArticles(options: DevToSearchOptions = {}): Promise<DevToArticle[]> {
    const tagsToUse = options.tags && options.tags.length > 0
      ? options.tags
      : this.shuffle(DEVTO_TAGS_POOL).slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 tags

    const page = (options.page ?? Math.floor(Math.random() * 3)) + 1;
    const windowDays = options.windowDays || 30;
    const minTimestamp = Date.now() - 86400000 * windowDays;

    const results: DevToArticle[] = [];
    const seenUrls = new Set<string>();

    for (const tag of tagsToUse) {
      try {
        const url = `${this.baseUrl}?tag=${encodeURIComponent(tag)}&page=${page}&per_page=12`;
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

        const articles: any = await response.json();
        for (const art of articles || []) {
          if (!art || !art.title || seenUrls.has(art.url)) continue;

          const publishedTime = new Date(art.published_timestamp || art.readable_publish_date).getTime();
          if (publishedTime && publishedTime < minTimestamp) continue;

          seenUrls.add(art.url);
          results.push({
            id: `devto_${art.id}`,
            title: art.title,
            snippet: (art.description || art.title).slice(0, 400),
            url: art.url,
            author: art.user?.username || "dev_author",
            reactions: art.positive_reactions_count || 5,
            tags: art.tag_list || [tag],
            publishedAt: art.published_timestamp || new Date().toISOString(),
            origin: "LIVE",
          });
        }
      } catch (err: any) {
        console.warn(`[Dev.to Live] Tag #${tag} search error: ${err.message}`);
      }
    }

    if (results.length === 0 && process.env.SAMPLE_DATA === "1") {
      return this.getSampleSpecimens();
    }

    return results;
  }

  private getSampleSpecimens(): DevToArticle[] {
    const timestamp = Date.now().toString(36);
    return [
      {
        id: `devto_sample_${timestamp}`,
        title: "[SAMPLE] Why multi-tenant database connection management still breaks in 2026",
        snippet: "Serverless edge migrations trigger race conditions that desynchronize database read replicas.",
        url: "https://dev.to/sample/multi-tenant-connection-headaches",
        author: "sample_author",
        reactions: 28,
        tags: ["database", "devops"],
        publishedAt: new Date().toISOString(),
        origin: "SAMPLE",
      },
    ];
  }
}
