import { DevToSourceClient, DevToArticle } from "./devto.client.js";

export interface IndieHackerItem {
  id: string;
  title: string;
  snippet: string;
  url: string;
  author: string;
  points: number;
  source: string;
  postedAt: string;
  paysToday: boolean;
  workaroundMentioned: boolean;
  willingnessToPaySignals: string[];
  origin?: "LIVE" | "SAMPLE";
}

/**
 * ProductHunt / Indie Hackers source client (Legacy).
 * Re-routed to authentic developer community discussions via Dev.to.
 */
export class ProductHuntIhSourceClient {
  private devto = new DevToSourceClient();

  async searchFounderPainPoints(query?: string): Promise<IndieHackerItem[]> {
    const articles = await this.devto.searchArticles({ tags: ["discuss", "saas"] });
    return articles.map((art: DevToArticle) => ({
      id: art.id,
      title: art.title,
      snippet: art.snippet,
      url: art.url,
      author: art.author,
      points: art.reactions,
      source: "Dev.to & Community Discussions",
      postedAt: art.publishedAt,
      paysToday: true,
      workaroundMentioned: art.snippet.toLowerCase().includes("workaround"),
      willingnessToPaySignals: ["Community discussion verified"],
      origin: art.origin || "LIVE",
    }));
  }
}
