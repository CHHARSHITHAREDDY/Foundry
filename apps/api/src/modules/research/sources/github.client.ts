export interface GitHubIssueItem {
  id: string;
  title: string;
  body: string;
  url: string;
  repo: string;
  author: string;
  reactions: number;
  comments: number;
  createdAt: string;
  origin?: "LIVE" | "SAMPLE";
}

export const GITHUB_PHRASE_POOL = [
  "wish there was",
  "pain point",
  "manual workaround",
  "silent failure",
  "data drift",
  "webhook retry",
  "connection timeout",
  "connection pool exhaustion",
  "memory leak under load",
  "broken migration rollback",
  "race condition in queue",
  "impossible to debug",
  "feature request automate",
  "losing customer data",
  "rate limit exceeded",
  "inconsistent state across services",
  "cannot scale beyond",
  "sync conflict in database",
  "unhandled promise rejection in worker",
  "schema mismatch in production",
  "slow query pins cpu",
  "flaky webhook delivery",
  "missing audit logs",
  "oauth token refresh bug",
  "silent corruption in cache",
];

export interface GitHubSearchOptions {
  windowDays?: 7 | 30 | 90 | 180;
  page?: number;
  phrases?: string[];
}

export class GitHubSourceClient {
  private baseUrl = "https://api.github.com";
  private token?: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN;
  }

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  async searchPainPoints(options: GitHubSearchOptions = {}): Promise<GitHubIssueItem[]> {
    const windowDays = options.windowDays || ([7, 30, 90][Math.floor(Math.random() * 3)] as 7 | 30 | 90);
    const minDate = new Date(Date.now() - 86400000 * windowDays).toISOString().slice(0, 10);
    const page = (options.page ?? Math.floor(Math.random() * 3)) + 1; // GitHub pages are 1-indexed

    const phrasesToUse = options.phrases && options.phrases.length > 0
      ? options.phrases
      : this.shuffle(GITHUB_PHRASE_POOL).slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 phrases

    const results: GitHubIssueItem[] = [];
    const seenIds = new Set<string>();

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "venture-studio-researcher/2.0",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    for (const phrase of phrasesToUse) {
      // Exactly one phrase per query, comments:>1, created:>(date), sort=created desc
      const query = `is:issue is:open "${phrase}" comments:>1 created:>${minDate}`;
      const url = `${this.baseUrl}/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=10&page=${page}`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          if (response.status === 403) {
            console.warn(`[GitHub Live] Rate limit or 403 on GitHub Search.`);
          }
          continue;
        }

        const data: any = await response.json();
        const items = (data.items || []).filter(
          (item: any) => item.title && !seenIds.has(String(item.id))
        );

        for (const item of items) {
          seenIds.add(String(item.id));
          const repoUrlParts = item.repository_url ? item.repository_url.split("/") : [];
          const repoName = repoUrlParts.slice(-2).join("/") || "github-repo";
          const reactionCount = item.reactions
            ? item.reactions.total_count || item.reactions["+1"] || 0
            : 0;

          results.push({
            id: `gh_${item.id}`,
            title: item.title,
            body: (item.body || "").slice(0, 450),
            url: item.html_url,
            repo: repoName,
            author: item.user?.login || "gh_developer",
            reactions: reactionCount,
            comments: item.comments || 0,
            createdAt: item.created_at || new Date().toISOString(),
            origin: "LIVE",
          });
        }
      } catch (err: any) {
        console.warn(`[GitHub Live] Query for "${phrase}" failed: ${err.message}`);
      }
    }

    if (results.length === 0 && process.env.SAMPLE_DATA === "1") {
      return this.getSampleSpecimens();
    }

    return results;
  }

  private getSampleSpecimens(): GitHubIssueItem[] {
    const timestamp = Date.now().toString(36);
    return [
      {
        id: `gh_sample_${timestamp}_1`,
        title: "[SAMPLE] Feature Request: Automated schema drift detection & alert for Postgres",
        body: "When deploying microservices across environments, schema drifts between staging and prod break queries silently.",
        url: "https://github.com/drizzle-team/drizzle-orm/issues/sample_1",
        repo: "drizzle-team/drizzle-orm",
        author: "sample_gh_user",
        reactions: 12,
        comments: 4,
        createdAt: new Date().toISOString(),
        origin: "SAMPLE",
      },
    ];
  }
}
