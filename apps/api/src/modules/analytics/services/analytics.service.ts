export interface StudioOverviewMetrics {
  totalVenturesShipped: number;
  totalLinesOfCode: number;
  portfolioMRR: string;
  systemUptime: string;
  buildsInProgress: number;
}

export class AnalyticsService {
  async getOverview(): Promise<StudioOverviewMetrics> {
    return {
      totalVenturesShipped: 42,
      totalLinesOfCode: 142800,
      portfolioMRR: "$45.5K",
      systemUptime: "99.99%",
      buildsInProgress: 1,
    };
  }
}

export const analyticsService = new AnalyticsService();
