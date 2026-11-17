export interface AdCreative {
  headline: string;
  primaryText: string;
  cta: string;
  targetAudience: string;
}

export class AdsService {
  async generateAdSet(ventureTitle: string, targetCustomer: string): Promise<AdCreative[]> {
    return [
      {
        headline: `Stop Wasting Time on Invoicing - Meet ${ventureTitle}`,
        primaryText: `Built specifically for ${targetCustomer}. Automate your workflow in under 10 minutes.`,
        cta: "TRY LIVE NOW",
        targetAudience: targetCustomer,
      },
      {
        headline: `${ventureTitle}: The Micro-SaaS Built For Speed`,
        primaryText: `Zero setup. Instant edge deployment. Get started today.`,
        cta: "START FREE",
        targetAudience: targetCustomer,
      },
    ];
  }
}

export const adsService = new AdsService();
