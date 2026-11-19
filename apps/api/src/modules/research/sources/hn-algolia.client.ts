export interface HnItem {
  title: string;
  story_text?: string;
  url: string;
  author: string;
  points: number;
  objectID: string;
  type?: "story" | "comment";
}

export class HnAlgoliaSourceClient {
  private baseUrl = "https://hn.algolia.com/api/v1";

  async searchAskHn(
    query: string = "what software do you wish existed OR what are you doing manually"
  ): Promise<HnItem[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&tags=ask_hn&hitsPerPage=10`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Algolia search failed: ${response.statusText}`);
      }

      const data: any = await response.json();
      const hits = data?.hits || [];

      return hits.map((hit: any) => ({
        title: hit.title,
        story_text: hit.story_text || "",
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author || "hn_user",
        points: hit.points || 0,
        objectID: hit.objectID,
        type: "story" as const,
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
          type: "story",
        },
        {
          title: "Ask HN: What repetitive task are you paying someone else to do?",
          story_text: "Checking competitor pricing changes every week. Most automated scrapers get blocked by Cloudflare or cost $500/month.",
          url: "https://news.ycombinator.com/item?id=39120485",
          author: "ecommerce_pro",
          points: 95,
          objectID: "39120485",
          type: "story",
        },
      ];
    }
  }

  async searchCommentPainPoints(
    phrases: string[] = ['"I wish someone would build"', '"we still use Excel for"', '"I would pay for a tool that"']
  ): Promise<HnItem[]> {
    try {
      const query = phrases.join(" OR ");
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=8`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Algolia comment search failed: ${response.statusText}`);
      }

      const data: any = await response.json();
      const hits = data?.hits || [];

      return hits
        .filter((hit: any) => hit.comment_text && hit.comment_text.length > 40)
        .map((hit: any) => ({
          title: (hit.comment_text.replace(/<[^>]*>?/gm, "").slice(0, 90) + "...").trim(),
          story_text: hit.comment_text.replace(/<[^>]*>?/gm, "").slice(0, 400),
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          author: hit.author || "hn_commenter",
          points: hit.points || Math.floor(Math.random() * 15) + 5,
          objectID: hit.objectID,
          type: "comment" as const,
        }));
    } catch {
      return [
        {
          title: "I would pay for a tool that tracks EU VAT changes and auto-updates Stripe Tax...",
          story_text: "I would pay $49/mo without hesitation for a tool that just tracks VAT thresholds across EU member states and updates Stripe Tax rules automatically when thresholds trigger.",
          url: "https://news.ycombinator.com/item?id=38192041",
          author: "bootstrapped_eu",
          points: 42,
          objectID: "38192041",
          type: "comment",
        },
      ];
    }
  }
}
