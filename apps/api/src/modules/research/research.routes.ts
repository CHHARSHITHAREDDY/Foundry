import type { FastifyInstance } from "fastify";
import { RedditSourceClient } from "./sources/reddit.client.js";
import { HnAlgoliaSourceClient } from "./sources/hn-algolia.client.js";
import { SearchRouter } from "./search/search.router.js";
import { PainPoint, SearchRequestSchema } from "@venture-studio/contracts";

export async function researchRoutes(app: FastifyInstance) {
  const reddit = new RedditSourceClient();
  const hn = new HnAlgoliaSourceClient();
  const searchRouter = new SearchRouter();

  app.get("/api/research/pain-points", async () => {
    const [redditPosts, hnHits] = await Promise.all([
      reddit.searchPainPoints(),
      hn.searchAskHn(),
    ]);

    const painPoints: PainPoint[] = [];

    for (const post of redditPosts) {
      painPoints.push({
        id: `pp_reddit_${Math.random().toString(36).substring(2, 9)}`,
        problem: post.title,
        who_has_it: `Users of r/${post.subreddit} (${post.author})`,
        source_url: post.url,
        quote: post.selftext ? post.selftext.slice(0, 300) : post.title,
        frequency_score: Math.min(10, Math.max(3, Math.floor(post.score / 10))),
        domain: `r/${post.subreddit}`,
        scouted_at: new Date().toISOString(),
      });
    }

    for (const hit of hnHits) {
      painPoints.push({
        id: `pp_hn_${Math.random().toString(36).substring(2, 9)}`,
        problem: hit.title.replace(/^Ask HN:\s*/i, ""),
        who_has_it: `Hacker News founders & devs (${hit.author})`,
        source_url: hit.url,
        quote: hit.story_text ? hit.story_text.slice(0, 300) : hit.title,
        frequency_score: Math.min(10, Math.max(4, Math.floor(hit.points / 20))),
        domain: "news.ycombinator.com",
        scouted_at: new Date().toISOString(),
      });
    }

    return {
      painPoints,
      sourcesScanned: ["reddit", "hackernews"],
      total: painPoints.length,
    };
  });

  app.post("/api/research/search", async (request) => {
    const body = SearchRequestSchema.parse(request.body);
    const results = await searchRouter.search(body.query, body.limit);
    return { results };
  });
}

