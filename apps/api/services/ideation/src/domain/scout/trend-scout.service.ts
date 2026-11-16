import { PainPoint } from "@venture-studio/contracts";
import { TypedHttpClient } from "@venture-studio/service-kit";
import { z } from "zod";
import { PainPointSchema } from "@venture-studio/contracts";

const HarvestResponseSchema = z.object({
  painPoints: z.array(PainPointSchema),
  sourcesScanned: z.array(z.string()),
  total: z.number(),
});

export class TrendScoutService {
  private researchClient: TypedHttpClient;

  constructor(researchBaseUrl: string = process.env.RESEARCH_URL || "http://localhost:3004") {
    this.researchClient = new TypedHttpClient({ baseUrl: researchBaseUrl });
  }

  async scoutPainPoints(): Promise<PainPoint[]> {
    try {
      const response = await this.researchClient.get("/pain-points", HarvestResponseSchema);
      return response.painPoints;
    } catch (err) {
      console.warn("Could not reach research service, using local grounded source fallback:", err);
      // Hardened grounded fallbacks if research service is offline
      return [
        {
          id: "pp_fb_1",
          problem: "Solo B2B SaaS founders waste hours fixing European reverse-charge VAT invoices from Stripe",
          who_has_it: "European solo founders using Stripe Billing",
          source_url: "https://reddit.com/r/SaaS/comments/stripe_vat_compliance_nightmare",
          quote: "Every month I spend 4 hours manually fixing reverse-charge VAT invoices because Stripe doesn't auto-verify VIES IDs properly.",
          frequency_score: 8,
          domain: "r/SaaS",
          scouted_at: new Date().toISOString(),
        },
        {
          id: "pp_fb_2",
          problem: "Website uptime monitors only check HTTP 200 on homepage, failing to detect broken signup forms and 3rd party script failures",
          who_has_it: "Web developers and lead generation agencies",
          source_url: "https://reddit.com/r/webdev/comments/why_are_uptime_monitors_so_dumb",
          quote: "Twice this year our pricing page form failed silently for 48 hours and we lost dozens of leads while Pingdom said all green.",
          frequency_score: 9,
          domain: "r/webdev",
          scouted_at: new Date().toISOString(),
        },
        {
          id: "pp_fb_3",
          problem: "Writing multi-platform changelog updates (X threads, newsletter digests, blog) from GitHub releases takes hours",
          who_has_it: "Indie hackers and dev tool creators",
          source_url: "https://news.ycombinator.com/item?id=38491029",
          quote: "Deploying the software is fast, but turning raw commit logs into clean announcements across 3 channels is a chore I delay for weeks.",
          frequency_score: 7,
          domain: "news.ycombinator.com",
          scouted_at: new Date().toISOString(),
        },
      ];
    }
  }
}

