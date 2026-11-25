export interface LinkedInPostItem {
  content: string;
  url: string;
  date: string;
  origin: "LIVE" | "SAMPLE";
}

/**
 * Client for harvesting live LinkedIn posts via Apify actor `harvestapi/linkedin-post-search`.
 * Field names strictly mapped from Apify actor input schema amvYJP3e0l9tqj6A9:
 * - Input: searchQueries, maxPosts, postedLimit, sortBy
 * - Output: content, linkedinUrl, postedAt.date
 * Includes per-run spend cap via `maxTotalChargeUsd`.
 */
export class LinkedInApifySourceClient {
  private apiToken: string;
  private spendCapUsd: number;

  constructor(options?: { spendCapUsd?: number }) {
    this.apiToken = process.env.APIFY_TOKEN || process.env.APIFY_API_KEY || "";
    this.spendCapUsd = options?.spendCapUsd ?? 0.05; // $0.05 spend cap per run
  }

  async searchLivePosts(queries: string[], maxPosts = 10): Promise<LinkedInPostItem[]> {
    if (!this.apiToken) {
      console.log("[Apify LinkedIn] APIFY_TOKEN / APIFY_API_KEY not configured. Skipping LinkedIn search.");
      return [];
    }

    try {
      const runUrl = `https://api.apify.com/v2/acts/harvestapi~linkedin-post-search/runs?token=${this.apiToken}&maxTotalChargeUsd=${this.spendCapUsd}&waitForFinish=60`;
      const inputBody = {
        searchQueries: queries.slice(0, 3),
        maxPosts: Math.min(maxPosts, 15),
        postedLimit: "month",
        sortBy: "date",
      };

      const runRes = await fetch(runUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputBody),
      });

      if (!runRes.ok) {
        console.warn(`[Apify LinkedIn] Actor start failed: HTTP ${runRes.status}`);
        return [];
      }

      const runData: any = await runRes.json();
      const defaultDatasetId = runData?.data?.defaultDatasetId;
      if (!defaultDatasetId) {
        return [];
      }

      // Fetch dataset items (strictly extracting text, URL, and date)
      const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${this.apiToken}&limit=15`;
      const datasetRes = await fetch(datasetUrl);
      if (!datasetRes.ok) return [];

      const rawItems: any = await datasetRes.json();
      if (!Array.isArray(rawItems)) return [];

      const results: LinkedInPostItem[] = [];
      for (const item of rawItems) {
        const text = item.content || "";
        const url = item.linkedinUrl || "";
        const date = item.postedAt?.date || (item.postedAt?.timestamp ? new Date(item.postedAt.timestamp).toISOString() : new Date().toISOString());

        if (text && url) {
          results.push({
            content: text,
            url,
            date,
            origin: "LIVE",
          });
        }
      }

      return results;
    } catch (err: any) {
      console.warn(`[Apify LinkedIn] Error during search: ${err?.message || err}`);
      return [];
    }
  }
}
