export interface SearchItem {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export class SearchRouter {
  private tavilyApiKey?: string;
  private searxngUrl?: string;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.searxngUrl = process.env.SEARXNG_URL || "http://localhost:8080";
  }

  async search(query: string, limit: number = 5): Promise<SearchItem[]> {
    if (this.tavilyApiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.tavilyApiKey,
            query,
            max_results: limit,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data: any = await res.json();
          return (data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
            source: "tavily",
          }));
        }
      } catch {}
    }

    if (this.searxngUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${this.searxngUrl}/search?q=${encodeURIComponent(query)}&format=json`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data: any = await res.json();
          return (data.results || []).slice(0, limit).map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
            source: "searxng",
          }));
        }
      } catch {}
    }

    return [];
  }
}

