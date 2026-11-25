import { PainPoint } from "@venture-studio/contracts";
import { RedditSourceClient } from "../../../research/sources/reddit.client.js";
import { HnAlgoliaSourceClient } from "../../../research/sources/hn-algolia.client.js";
import { GitHubSourceClient } from "../../../research/sources/github.client.js";
import { DevToSourceClient } from "../../../research/sources/devto.client.js";
import { StackExchangeSourceClient } from "../../../research/sources/stackexchange.client.js";
import { LinkedInApifySourceClient } from "../../../research/sources/linkedin-apify.client.js";
import { verifySourceCitation } from "../../../research/filters/citation-verifier.js";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function computeSimilarityKey(text: string): string {
  const words = normalizeText(text)
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 8)
    .sort();
  return words.join("-");
}

export const MIN_LIVE_ITEMS = 4;

export class TrendScoutService {
  private reddit = new RedditSourceClient();
  private hn = new HnAlgoliaSourceClient();
  private github = new GitHubSourceClient();
  private devto = new DevToSourceClient();
  private stackexchange = new StackExchangeSourceClient();
  private linkedin = new LinkedInApifySourceClient();
  private static seenProblemHashes = new Set<string>();

  /**
   * Scours live market sources with query rotation and progressive window widening:
   * 30 days -> 90 days -> 180 days.
   */
  async scoutPainPoints(): Promise<PainPoint[]> {
    const detailed = await this.scoutPainPointsDetailed();
    return detailed.painPoints;
  }

  async scoutPainPointsDetailed(): Promise<{
    painPoints: PainPoint[];
    sourcesSummary: Record<string, number>;
    windowDaysUsed: number;
  }> {
    const windows: (7 | 30 | 90 | 180)[] = [30, 90, 180];
    let lastSummary: Record<string, number> = {};

    for (const windowDays of windows) {
      const { pool, sourcesSummary } = await this.queryAllSourcesWithCounts(windowDays);
      lastSummary = sourcesSummary;

      // Verify citation quotes against live source URLs (drop items that fail)
      const verified = await this.verifyCitations(pool);

      if (verified.length >= MIN_LIVE_ITEMS) {
        return { painPoints: verified, sourcesSummary, windowDaysUsed: windowDays };
      }
    }

    if (process.env.SAMPLE_DATA === "1") {
      return { painPoints: this.getSampleSpecimens(), sourcesSummary: { sample: 2 }, windowDaysUsed: 180 };
    }

    return { painPoints: [], sourcesSummary: lastSummary, windowDaysUsed: 180 };
  }

  private async queryAllSources(windowDays: 7 | 30 | 90 | 180): Promise<PainPoint[]> {
    const { pool } = await this.queryAllSourcesWithCounts(windowDays);
    return pool;
  }

  private async queryAllSourcesWithCounts(windowDays: 7 | 30 | 90 | 180): Promise<{
    pool: PainPoint[];
    sourcesSummary: Record<string, number>;
  }> {
    const [redditRes, hnRes, githubRes, devtoRes, soRes, linkedinRes] = await Promise.allSettled([
      this.reddit.searchPainPoints({ windowDays }),
      this.hn.searchLiveHn({ windowDays }),
      this.github.searchPainPoints({ windowDays }),
      this.devto.searchArticles({ windowDays }),
      this.stackexchange.searchQuestions({ windowDays }),
      this.linkedin.searchLivePosts(["software pain point", "saas tool missing", "developer workflow bottleneck"]),
    ]);

    const sourcesSummary = {
      hackerNews: hnRes.status === "fulfilled" && Array.isArray(hnRes.value) ? hnRes.value.length : 0,
      github: githubRes.status === "fulfilled" && Array.isArray(githubRes.value) ? githubRes.value.length : 0,
      reddit: redditRes.status === "fulfilled" && Array.isArray(redditRes.value) ? redditRes.value.length : 0,
      devTo: devtoRes.status === "fulfilled" && Array.isArray(devtoRes.value) ? devtoRes.value.length : 0,
      stackExchange: soRes.status === "fulfilled" && Array.isArray(soRes.value) ? soRes.value.length : 0,
      linkedIn: linkedinRes.status === "fulfilled" && Array.isArray(linkedinRes.value) ? linkedinRes.value.length : 0,
    };

    const rawPool: PainPoint[] = [];

    // 1. Hacker News (Ask HN, Stories, Comments)
    if (hnRes.status === "fulfilled" && Array.isArray(hnRes.value)) {
      for (const item of hnRes.value) {
        rawPool.push({
          id: `pp_hn_${item.objectID || Math.random().toString(36).substring(2, 9)}`,
          problem: item.title,
          who_has_it: `Hacker News founders & engineers (${item.author || "community"})`,
          source_url: item.url,
          quote: (item.story_text || item.title).slice(0, 300).trim(),
          frequency_score: Math.min(10, Math.max(4, Math.floor((item.points || 15) / 15))),
          domain: `Hacker News (${item.type || "discussion"})`,
          source_type: item.origin === "SAMPLE" ? "SAMPLE_SPECIMEN" : "LIVE_API",
          origin: item.origin || "LIVE",
          citation_verified: false,
          scouted_at: item.created_at || new Date().toISOString(),
        });
      }
    }

    // 2. GitHub Issues (sorted created desc, comments:>1)
    if (githubRes.status === "fulfilled" && Array.isArray(githubRes.value)) {
      for (const issue of githubRes.value) {
        rawPool.push({
          id: `pp_gh_${issue.id || Math.random().toString(36).substring(2, 9)}`,
          problem: issue.title.replace(/^Feature Request:\s*/i, "").trim(),
          who_has_it: `Developers of ${issue.repo} (${issue.author})`,
          source_url: issue.url,
          quote: (issue.body || issue.title).slice(0, 300).trim(),
          frequency_score: Math.min(10, Math.max(4, Math.floor(((issue.reactions || 1) + (issue.comments || 1)) / 8))),
          domain: `GitHub (${issue.repo})`,
          source_type: issue.origin === "SAMPLE" ? "SAMPLE_SPECIMEN" : "LIVE_API",
          origin: issue.origin || "LIVE",
          citation_verified: false,
          scouted_at: issue.createdAt || new Date().toISOString(),
        });
      }
    }

    // 3. Reddit Posts (OAuth API)
    if (redditRes.status === "fulfilled" && Array.isArray(redditRes.value)) {
      for (const post of redditRes.value) {
        rawPool.push({
          id: `pp_reddit_${Math.random().toString(36).substring(2, 9)}`,
          problem: post.title.trim(),
          who_has_it: `r/${post.subreddit} community (${post.author})`,
          source_url: post.url,
          quote: (post.selftext || post.title).slice(0, 300).trim(),
          frequency_score: Math.min(10, Math.max(3, Math.floor((post.score || 10) / 10))),
          domain: `r/${post.subreddit}`,
          source_type: post.origin === "SAMPLE" ? "SAMPLE_SPECIMEN" : "LIVE_API",
          origin: post.origin || "LIVE",
          citation_verified: false,
          scouted_at: post.createdAt || new Date().toISOString(),
        });
      }
    }

    // 4. Dev.to Community Discussions
    if (devtoRes.status === "fulfilled" && Array.isArray(devtoRes.value)) {
      for (const art of devtoRes.value) {
        rawPool.push({
          id: `pp_${art.id}`,
          problem: art.title.trim(),
          who_has_it: `Developers on Dev.to (${art.author})`,
          source_url: art.url,
          quote: art.snippet.slice(0, 300).trim(),
          frequency_score: Math.min(10, Math.max(4, Math.floor((art.reactions || 5) / 4))),
          domain: `Dev.to (#${(art.tags && art.tags[0]) || "discuss"})`,
          source_type: art.origin === "SAMPLE" ? "SAMPLE_SPECIMEN" : "LIVE_API",
          origin: art.origin || "LIVE",
          citation_verified: false,
          scouted_at: art.publishedAt || new Date().toISOString(),
        });
      }
    }

    // 5. Stack Exchange Software & API Questions
    if (soRes.status === "fulfilled" && Array.isArray(soRes.value)) {
      for (const q of soRes.value) {
        rawPool.push({
          id: `pp_${q.id}`,
          problem: q.title.trim(),
          who_has_it: `Engineers on Stack Overflow (${q.author})`,
          source_url: q.url,
          quote: q.snippet.slice(0, 300).trim(),
          frequency_score: Math.min(10, Math.max(3, Math.floor((q.score || 3) / 3))),
          domain: `Stack Overflow (${(q.tags && q.tags[0]) || "tech"})`,
          source_type: q.origin === "SAMPLE" ? "SAMPLE_SPECIMEN" : "LIVE_API",
          origin: q.origin || "LIVE",
          citation_verified: false,
          scouted_at: q.createdAt || new Date().toISOString(),
        });
      }
    }

    // 6. LinkedIn public posts (Apify actor harvestapi/linkedin-post-search)
    if (linkedinRes.status === "fulfilled" && Array.isArray(linkedinRes.value)) {
      for (const li of linkedinRes.value) {
        rawPool.push({
          id: `pp_li_${Math.random().toString(36).substring(2, 9)}`,
          problem: li.content.slice(0, 100).trim(),
          who_has_it: "LinkedIn Professional Community",
          source_url: li.url,
          quote: li.content.slice(0, 300).trim(),
          frequency_score: 5,
          domain: "LinkedIn Posts",
          source_type: "LIVE_API",
          origin: "LIVE",
          citation_verified: false,
          scouted_at: li.date || new Date().toISOString(),
        });
      }
    }

    // Deduplicate by URL and semantic problem key
    const uniquePool: PainPoint[] = [];
    const seenUrls = new Set<string>();
    const seenSimKeys = new Set<string>();

    for (const p of rawPool) {
      if (!p.source_url || seenUrls.has(p.source_url)) continue;
      const simKey = computeSimilarityKey(p.problem);
      if (simKey && (seenSimKeys.has(simKey) || TrendScoutService.seenProblemHashes.has(simKey))) {
        continue;
      }

      seenUrls.add(p.source_url);
      if (simKey) {
        seenSimKeys.add(simKey);
        TrendScoutService.seenProblemHashes.add(simKey);
      }
      uniquePool.push(p);
    }

    if (TrendScoutService.seenProblemHashes.size > 250) {
      TrendScoutService.seenProblemHashes.clear();
    }

    return { pool: uniquePool, sourcesSummary };
  }

  /**
   * Re-fetches each candidate's cited source URL to confirm the quote appears.
   * Drops items that fail verification (Rule 8).
   */
  private async verifyCitations(candidates: PainPoint[]): Promise<PainPoint[]> {
    const verifiedList: PainPoint[] = [];

    // Verify in bounded batches of 5 concurrent requests
    const batchSize = 5;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (item) => {
          // If sample data, verification is bypassed
          if (item.origin === "SAMPLE" || item.source_type === "SAMPLE_SPECIMEN") {
            return { item, ok: true };
          }
          const ok = await verifySourceCitation(item.source_url, item.quote);
          return { item, ok };
        })
      );

      for (const res of results) {
        if (res.ok) {
          res.item.citation_verified = true;
          verifiedList.push(res.item);
        }
      }
    }

    return verifiedList;
  }

  private getSampleSpecimens(): PainPoint[] {
    const timestamp = Date.now().toString(36);
    const now = new Date().toISOString();
    return [
      {
        id: `pp_sample_${timestamp}_1`,
        problem: "[SAMPLE] Multi-cloud object storage egress cost optimizer and automated duplicate asset pruner",
        who_has_it: "FinOps engineers & media platform operators on AWS S3 and GCP",
        source_url: "https://reddit.com/r/devops/comments/sample_s3_egress",
        quote: "Our S3 bill jumped $4,000 this month because staging assets were replicated across 3 regions with no lifecycle rules.",
        frequency_score: 8,
        domain: "DevOps & Database Infrastructure",
        source_type: "SAMPLE_SPECIMEN",
        origin: "SAMPLE",
        citation_verified: true,
        sample_notice: "Sample benchmark specimen for offline testing.",
        scouted_at: now,
      },
      {
        id: `pp_sample_${timestamp}_2`,
        problem: "[SAMPLE] Automated EU VAT reverse-charge and digital services MOSS quarterly filings",
        who_has_it: "Indie founders and solo bootstrappers selling globally",
        source_url: "https://reddit.com/r/SaaS/comments/sample_vat_filing",
        quote: "Stripe Tax tells me I owe VAT in 14 EU countries but doesn't handle the MOSS quarterly XML filing.",
        frequency_score: 9,
        domain: "FinTech & Tax Compliance",
        source_type: "SAMPLE_SPECIMEN",
        origin: "SAMPLE",
        citation_verified: true,
        sample_notice: "Sample benchmark specimen for offline testing.",
        scouted_at: now,
      },
      {
        id: `pp_sample_${timestamp}_3`,
        problem: "[SAMPLE] Automated schema drift detection & alert for Postgres",
        who_has_it: "Backend engineering leads & DevOps stewards",
        source_url: "https://github.com/drizzle-team/drizzle-orm/issues/sample_schema_drift",
        quote: "When deploying microservices across environments, schema drifts between staging and prod break queries silently.",
        frequency_score: 9,
        domain: "DevOps & Cloud Databases",
        source_type: "SAMPLE_SPECIMEN",
        origin: "SAMPLE",
        citation_verified: true,
        sample_notice: "Sample benchmark specimen for offline testing.",
        scouted_at: now,
      },
      {
        id: `pp_sample_${timestamp}_4`,
        problem: "[SAMPLE] Dead-Letter Queue replay dashboard for dropped Stripe & Shopify webhook events",
        who_has_it: "Fintech infrastructure engineers",
        source_url: "https://news.ycombinator.com/item?id=sample_dlq_replay",
        quote: "Whenever payment webhooks 500 during deployment, merchants lose order syncs and devs spend hours manually replaying.",
        frequency_score: 8,
        domain: "Developer Tools & Reliability",
        source_type: "SAMPLE_SPECIMEN",
        origin: "SAMPLE",
        citation_verified: true,
        sample_notice: "Sample benchmark specimen for offline testing.",
        scouted_at: now,
      },
    ];
  }
}
