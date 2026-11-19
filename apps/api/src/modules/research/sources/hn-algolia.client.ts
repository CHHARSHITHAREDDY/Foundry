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
    query: string = "wish existed"
  ): Promise<HnItem[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&tags=ask_hn&hitsPerPage=10`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

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
      return [];
    }
  }

  async searchCommentPainPoints(
    query: string = "wish there was a tool"
  ): Promise<HnItem[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=10`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

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
      return [];
    }
  }
}
