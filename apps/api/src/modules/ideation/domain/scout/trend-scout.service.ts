import { PainPoint } from "@venture-studio/contracts";
import { RedditSourceClient } from "../../../research/sources/reddit.client.js";
import { HnAlgoliaSourceClient } from "../../../research/sources/hn-algolia.client.js";
import { GitHubSourceClient } from "../../../research/sources/github.client.js";

export class TrendScoutService {
  private reddit = new RedditSourceClient();
  private hn = new HnAlgoliaSourceClient();
  private github = new GitHubSourceClient();

  async scoutPainPoints(): Promise<PainPoint[]> {
    const [redditRes, hnStoriesRes, hnCommentsRes, githubRes] = await Promise.allSettled([
      this.reddit.searchPainPoints(),
      this.hn.searchAskHn(),
      this.hn.searchCommentPainPoints(),
      this.github.searchPainPoints(),
    ]);

    const painPoints: PainPoint[] = [];

    // 1. Ingest Hacker News Ask HN Stories
    if (hnStoriesRes.status === "fulfilled") {
      for (const hit of hnStoriesRes.value) {
        painPoints.push({
          id: `pp_hn_${Math.random().toString(36).substring(2, 9)}`,
          problem: hit.title.replace(/^Ask HN:\s*/i, ""),
          who_has_it: `Hacker News founders & engineers (${hit.author})`,
          source_url: hit.url,
          quote: hit.story_text ? hit.story_text.slice(0, 300) : hit.title,
          frequency_score: Math.min(10, Math.max(4, Math.floor(hit.points / 15))),
          domain: "Hacker News (Ask HN)",
          scouted_at: new Date().toISOString(),
        });
      }
    }

    // 2. Ingest Hacker News Comments
    if (hnCommentsRes.status === "fulfilled") {
      for (const comment of hnCommentsRes.value) {
        painPoints.push({
          id: `pp_hnc_${Math.random().toString(36).substring(2, 9)}`,
          problem: comment.title,
          who_has_it: `Hacker News operator (${comment.author})`,
          source_url: comment.url,
          quote: comment.story_text ? comment.story_text.slice(0, 300) : comment.title,
          frequency_score: Math.min(10, Math.max(3, Math.floor(comment.points / 5))),
          domain: "Hacker News (Comments)",
          scouted_at: new Date().toISOString(),
        });
      }
    }

    // 3. Ingest GitHub Issues & Feature Requests
    if (githubRes.status === "fulfilled") {
      for (const issue of githubRes.value) {
        painPoints.push({
          id: `pp_gh_${Math.random().toString(36).substring(2, 9)}`,
          problem: issue.title.replace(/^Feature Request:\s*/i, ""),
          who_has_it: `Developers of ${issue.repo} (${issue.author})`,
          source_url: issue.url,
          quote: issue.body ? issue.body.slice(0, 300) : issue.title,
          frequency_score: Math.min(10, Math.max(4, Math.floor((issue.reactions + issue.comments) / 8))),
          domain: `GitHub (${issue.repo})`,
          scouted_at: new Date().toISOString(),
        });
      }
    }

    // 4. Ingest Reddit Posts
    if (redditRes.status === "fulfilled") {
      for (const post of redditRes.value) {
        painPoints.push({
          id: `pp_reddit_${Math.random().toString(36).substring(2, 9)}`,
          problem: post.title,
          who_has_it: `r/${post.subreddit} community (${post.author})`,
          source_url: post.url,
          quote: post.selftext ? post.selftext.slice(0, 300) : post.title,
          frequency_score: Math.min(10, Math.max(3, Math.floor(post.score / 10))),
          domain: `r/${post.subreddit}`,
          scouted_at: new Date().toISOString(),
        });
      }
    }

    return painPoints;
  }
}
