export interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  author: string;
  subreddit: string;
  permalink: string;
  score: number;
  createdAt: string;
  origin?: "LIVE" | "SAMPLE";
}

export const REDDIT_PHRASE_POOL = [
  "pain point",
  "what tool do you wish existed",
  "we still do this manually",
  "hate doing this manually",
  "too expensive alternative",
  "spreadsheets nightmare",
  "biggest headache in your business",
  "hours wasted on admin",
  "why does no software solve",
  "looking for tool that can",
  "unreliable webhook integration",
  "dunning failed payments churn",
  "invoicing multi currency mess",
  "silent data corruption",
  "customer onboarding drop off",
  "feature request wish existed",
  "switched away because too complex",
  "frustrating manual export",
  "reconciliation takes days",
  "compliance paperwork bottleneck",
  "internal dashboard too slow",
  "automate repetitive client tasks",
  "billing dispute chargeback tool",
  "unhandled edge cases in api",
  "inventory stockout alert tool",
];

const TARGET_SUBREDDITS = ["SaaS", "startups", "webdev", "devops", "Entrepreneur"];

export interface RedditSearchOptions {
  windowDays?: 7 | 30 | 90 | 180;
  phrases?: string[];
  subreddits?: string[];
}

export class RedditSourceClient {
  private clientId?: string;
  private clientSecret?: string;
  private userAgent = "desktop:venture-studio-market-scout:v2.0 (by /u/venturestudio)";
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
  }

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60000) {
      return this.cachedToken.token;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn("[Reddit OAuth] REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not configured in .env. Skipping Reddit live API.");
      return null;
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "User-Agent": this.userAgent,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[Reddit OAuth] Token request failed: ${res.status} ${res.statusText}`);
        return null;
      }

      const data: any = await res.json();
      if (data && data.access_token) {
        this.cachedToken = {
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        };
        return this.cachedToken.token;
      }
    } catch (err: any) {
      console.warn(`[Reddit OAuth] Failed to fetch access token: ${err?.message || err}`);
    }

    return null;
  }

  async searchPainPoints(options: RedditSearchOptions = {}): Promise<RedditPost[]> {
    const token = await this.getAccessToken();
    if (!token) {
      if (process.env.SAMPLE_DATA === "1") {
        return this.getSampleSpecimens();
      }
      return [];
    }

    const phrasesToUse = options.phrases && options.phrases.length > 0
      ? options.phrases
      : this.shuffle(REDDIT_PHRASE_POOL).slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 phrases

    const subreddits = options.subreddits || TARGET_SUBREDDITS;
    const windowDays = options.windowDays || 30;
    const timeFilter = windowDays <= 7 ? "week" : windowDays <= 30 ? "month" : "year";

    const results: RedditPost[] = [];
    const seenPermalinks = new Set<string>();

    for (const phrase of phrasesToUse) {
      const sub = subreddits[Math.floor(Math.random() * subreddits.length)]!;
      try {
        const url = `https://oauth.reddit.com/r/${sub}/search?q=${encodeURIComponent(phrase)}&sort=new&t=${timeFilter}&limit=15&restrict_sr=1`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": this.userAgent,
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          console.warn(`[Reddit OAuth] Search for r/${sub} returned ${response.status}`);
          continue;
        }

        const data: any = await response.json();
        const children = data?.data?.children || [];

        for (const child of children) {
          const post = child.data;
          if (
            post &&
            post.title &&
            post.title.length > 20 &&
            !seenPermalinks.has(post.permalink)
          ) {
            seenPermalinks.add(post.permalink);
            results.push({
              title: post.title,
              selftext: post.selftext || "",
              url: `https://reddit.com${post.permalink}`,
              author: post.author || "reddit_user",
              subreddit: post.subreddit,
              permalink: post.permalink,
              score: post.score || 10,
              createdAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString(),
              origin: "LIVE",
            });
          }
        }
      } catch (err: any) {
        console.warn(`[Reddit OAuth] Query failed: ${err?.message || err}`);
      }
    }

    if (results.length === 0 && process.env.SAMPLE_DATA === "1") {
      return this.getSampleSpecimens();
    }

    return results;
  }

  private getSampleSpecimens(): RedditPost[] {
    const timestamp = Date.now().toString(36);
    return [
      {
        title: "[SAMPLE] Automating EU VAT reverse-charge and digital services MOSS quarterly filings",
        selftext: "Stripe Tax tells me I owe VAT in 14 EU countries but doesn't handle the MOSS quarterly XML filing.",
        url: "https://reddit.com/r/SaaS/comments/sample_reddit_1",
        author: "sample_reddit_founder",
        subreddit: "SaaS",
        permalink: "/r/SaaS/comments/sample_reddit_1",
        score: 35,
        createdAt: new Date().toISOString(),
        origin: "SAMPLE",
      },
    ];
  }
}
