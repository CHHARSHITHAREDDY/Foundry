export interface GitHubIssueItem {
  id: string;
  title: string;
  body: string;
  url: string;
  repo: string;
  author: string;
  reactions: number;
  comments: number;
  createdAt: string;
}

export class GitHubSourceClient {
  private baseUrl = "https://api.github.com";
  private token?: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN;
  }

  async searchPainPoints(
    query: string = 'is:issue is:open label:"feature request" "wish there was a"'
  ): Promise<GitHubIssueItem[]> {
    try {
      const url = `${this.baseUrl}/search/issues?q=${encodeURIComponent(query)}&sort=reactions&order=desc&per_page=15`;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "venture-studio-scout/1.0",
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();
      const items = data.items || [];

      return items.map((item: any) => {
        const repoUrlParts = item.repository_url ? item.repository_url.split("/") : [];
        const repoName = repoUrlParts.slice(-2).join("/") || "github-repo";
        const reactionCount = item.reactions ? (item.reactions.total_count || item.reactions["+1"] || 0) : 0;

        return {
          id: `gh_${item.id}`,
          title: item.title,
          body: (item.body || "").slice(0, 400),
          url: item.html_url,
          repo: repoName,
          author: item.user?.login || "gh_user",
          reactions: reactionCount,
          comments: item.comments || 0,
          createdAt: item.created_at || new Date().toISOString(),
        };
      });
    } catch {
      return [];
    }
  }
}
