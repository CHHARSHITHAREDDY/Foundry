export interface SocialThread {
  platform: "x" | "linkedin";
  posts: string[];
  scheduledAt?: string;
}

export class SocialService {
  async generateLaunchThread(ventureTitle: string, problem: string): Promise<SocialThread> {
    return {
      platform: "x",
      posts: [
        `1/ We built ${ventureTitle} in public with autonomous AI agents. Here is how it solves: ${problem.slice(0, 100)}... 🧵`,
        `2/ Architecture: Built on Next.js 15, PostgreSQL with RLS, and Drizzle ORM. Zero scaffolding overhead.`,
        `3/ Try it live now at https://${ventureTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}.foundry.studio`,
      ],
    };
  }
}

export const socialService = new SocialService();
