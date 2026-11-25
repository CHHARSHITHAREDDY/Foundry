import { IdeaBrief } from "@venture-studio/contracts";
import { SearchRouter } from "../../../research/search/search.router.js";

export interface FetchedCompetitor {
  name: string;
  url: string;
  pricingText: string | null;
  gap: string;
  fetchedAt: string;
}

export interface HonestScorecard {
  demand: number | null;
  competition: number | null;
  differentiation: number | null;
  monetization: number | null;
  buildability: number | null;
  total: number | null;
  assessedDimensionsCount: number;
  scorecardType: "PRELIMINARY" | "INSUFFICIENT_DATA";
  basis: Record<string, "EVIDENCE" | "HEURISTIC" | "NOT_ASSESSED">;
  sources: string[];
  verdictLabel: "PRELIMINARY" | "INSUFFICIENT_DATA" | "NO_GO_SIGNALS";
}

export class ValidatorService {
  private searchRouter: SearchRouter;

  constructor() {
    this.searchRouter = new SearchRouter();
  }

  private async fetchPricingSnippet(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "FoundryMarketValidator/2.0" },
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const html = await res.text();
      const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const priceMatch = text.match(/(\$\d+(?:\.\d{2})?\s*(?:\/|\s*per\s*)(?:mo|month|yr|year|user|seat)?|free tier|enterprise pricing)/i);
      return priceMatch ? priceMatch[0].trim() : text.slice(0, 140).trim();
    } catch {
      return null;
    }
  }

  async validateIdea(idea: IdeaBrief): Promise<IdeaBrief & { honestScorecard: HonestScorecard; fetchedCompetitors: FetchedCompetitor[] }> {
    const query = `${idea.title} ${idea.problem.slice(0, 60)} pricing`;
    let searchResults: any[] = [];
    try {
      searchResults = await this.searchRouter.search(query, 4);
    } catch {
      searchResults = [];
    }

    const fetchedCompetitors: FetchedCompetitor[] = [];
    for (const r of searchResults.slice(0, 3)) {
      if (!r.url || !r.url.startsWith("http")) continue;
      const pricingText = await this.fetchPricingSnippet(r.url);
      fetchedCompetitors.push({
        name: (r.title?.split(/[-|:]/)[0] || "Competitor").trim(),
        url: r.url,
        pricingText: pricingText || null,
        gap: r.snippet ? r.snippet.slice(0, 140) : "Observed in search results",
        fetchedAt: new Date().toISOString(),
      });
    }

    const verifiedEvidenceCount = idea.evidence.filter((e) => e.verified).length;
    const sources = Array.from(new Set(idea.evidence.map((e) => e.url).filter(Boolean)));

    // Honest nullable dimensions: NOT_ASSESSED (null) if not researched!
    const demand = verifiedEvidenceCount >= 1
      ? Number(Math.min(5, Math.max(2.0, 2.2 + verifiedEvidenceCount * 0.6)).toFixed(1))
      : null;

    const competition = fetchedCompetitors.length > 0
      ? Number(Math.min(5, Math.max(2.5, 4.5 - fetchedCompetitors.length * 0.3)).toFixed(1))
      : null;

    const differentiation = (idea as any).wedge ? 3.8 : null;
    const monetization = fetchedCompetitors.some((c) => Boolean(c.pricingText)) ? 4.0 : null;
    const buildability = idea.mvpScope?.screens?.length ? Number(Math.min(5, Math.max(2.5, 5.0 - idea.mvpScope.screens.length * 0.25)).toFixed(1)) : null;

    const basis: Record<string, "EVIDENCE" | "HEURISTIC" | "NOT_ASSESSED"> = {
      demand: demand !== null ? "EVIDENCE" : "NOT_ASSESSED",
      competition: competition !== null ? "EVIDENCE" : "NOT_ASSESSED",
      differentiation: differentiation !== null ? "HEURISTIC" : "NOT_ASSESSED",
      monetization: monetization !== null ? "EVIDENCE" : "NOT_ASSESSED",
      buildability: buildability !== null ? "HEURISTIC" : "NOT_ASSESSED",
    };

    const assessedVals = [demand, competition, differentiation, monetization, buildability].filter(
      (v): v is number => v !== null
    );
    const total = assessedVals.length > 0
      ? Number(((assessedVals.reduce((a, b) => a + b, 0) / assessedVals.length) * 20).toFixed(1))
      : null;

    const verdictLabel: "PRELIMINARY" | "INSUFFICIENT_DATA" | "NO_GO_SIGNALS" =
      verifiedEvidenceCount === 0
        ? "INSUFFICIENT_DATA"
        : total !== null && total < 45
        ? "NO_GO_SIGNALS"
        : "PRELIMINARY";

    const honestScorecard: HonestScorecard = {
      demand,
      competition,
      differentiation,
      monetization,
      buildability,
      total,
      assessedDimensionsCount: assessedVals.length,
      scorecardType: assessedVals.length >= 3 ? "PRELIMINARY" : "INSUFFICIENT_DATA",
      basis,
      sources,
      verdictLabel,
    };

    return {
      ...idea,
      competitors: fetchedCompetitors.map((c) => ({
        name: c.name,
        url: c.url,
        pricing: c.pricingText || undefined,
        gap: c.gap,
      })),
      verdict: {
        status: verifiedEvidenceCount > 0 ? "GO" : "INSUFFICIENT_DATA",
        summary:
          verifiedEvidenceCount > 0
            ? `Advisory verdict (${verdictLabel}): grounded in ${verifiedEvidenceCount} verified live citation(s).`
            : "Insufficient verified evidence.",
        pivot_suggestions: [],
        warnings: fetchedCompetitors.length === 0 ? ["Competitor pricing not assessed"] : [],
        suggested_changes: ["Review evidence quotes", "Approve to launch build swarm"],
      },
      honestScorecard,
      fetchedCompetitors,
    };
  }
}
