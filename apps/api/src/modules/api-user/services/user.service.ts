export interface VentureSummary {
  id: string;
  title: string;
  status: "building" | "live" | "archived";
  subdomain: string;
  mrr: string;
  createdAt: string;
}

export class UserService {
  private ventures: VentureSummary[] = [
    {
      id: "vnt_01",
      title: "LedgerPulse",
      status: "live",
      subdomain: "https://ledgerpulse.foundry.studio",
      mrr: "$14.2K",
      createdAt: "2025-01-10T12:00:00Z",
    },
    {
      id: "vnt_02",
      title: "OmniBrief",
      status: "live",
      subdomain: "https://omnibrief.foundry.studio",
      mrr: "$8.9K",
      createdAt: "2025-02-14T12:00:00Z",
    },
    {
      id: "vnt_03",
      title: "Substacker",
      status: "live",
      subdomain: "https://substacker.foundry.studio",
      mrr: "$22.4K",
      createdAt: "2025-03-01T12:00:00Z",
    },
  ];

  async getDashboard(userId: string) {
    return {
      userId,
      activeVentures: this.ventures,
      creditsRemaining: 250,
      tier: "Founder",
    };
  }
}

export const userService = new UserService();

