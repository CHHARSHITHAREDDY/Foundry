export interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  author: string;
  subreddit: string;
  permalink: string;
  score: number;
}

export class RedditSourceClient {
  private userAgent = "venture-studio-researcher:v1.0.0 (by /u/venture-studio)";

  async searchPainPoints(
    subreddits: string[] = ["SaaS", "webdev"],
    query: string = 'pain point OR "I wish there was"'
  ): Promise<RedditPost[]> {
    const results: RedditPost[] = [];

    await Promise.all(
      subreddits.map(async (sub) => {
        try {
          const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=6&restrict_sr=1`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1200);

          const response = await fetch(url, {
            headers: {
              "User-Agent": this.userAgent,
              Accept: "application/json",
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!response.ok) return;

          const data: any = await response.json();
          const children = data?.data?.children || [];

          for (const child of children) {
            const post = child.data;
            if (post && post.title && (post.selftext || post.title.length > 20)) {
              results.push({
                title: post.title,
                selftext: post.selftext || "",
                url: `https://reddit.com${post.permalink}`,
                author: post.author,
                subreddit: post.subreddit,
                permalink: post.permalink,
                score: post.score || 1,
              });
            }
          }
        } catch {}
      })
    );

    return results;
  }
}

