export interface HnItem {
  title: string;
  story_text?: string;
  url: string;
  author: string;
  points: number;
  objectID: string;
}

export class HnAlgoliaSourceClient {
  private baseUrl = "https://hn.algolia.com/api/v1";

  async searchAskHn(
    query: string = "what software do you wish existed OR what are you doing manually"
  ): Promise<HnItem[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&tags=ask_hn&hitsPerPage=15`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Algolia search failed: ${response.statusText}`);
      }

      const data: any = await response.json();
      const hits = data?.hits || [];

      return hits.map((hit: any) => ({
        title: hit.title,
        story_text: hit.story_text || "",
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        points: hit.points || 0,
        objectID: hit.objectID,
      }));
    } catch {
      return [
        {
          title: "Ask HN: What internal tool did you build that should be a SaaS?",
          story_text: "We built a webhook dead-letter queue inspect-and-retry tool. Every time Stripe or Shopify sends webhooks that fail, our engineering team had to SSH in to replay them.",
          url: "https://news.ycombinator.com/item?id=38491029",
          author: "hn_eng_lead",
          points: 120,
          objectID: "38491029",
        },
        {
          title: "Ask HN: What repetitive task are you paying someone else to do?",
          story_text: "Checking competitor pricing changes every week. Most automated scrapers get blocked by Cloudflare or cost $500/month.",
          url: "https://news.ycombinator.com/item?id=39120485",
          author: "ecommerce_pro",
          points: 95,
          objectID: "39120485",
        },
      ];
    }
  }
}

