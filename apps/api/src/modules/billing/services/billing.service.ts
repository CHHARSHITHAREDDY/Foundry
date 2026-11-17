export interface Plan {
  id: "starter" | "founder" | "syndicate";
  name: string;
  priceMonthly: number;
  credits: number;
  maxActiveVentures: number;
  features: string[];
}

export class BillingService {
  private plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      priceMonthly: 49,
      credits: 50,
      maxActiveVentures: 2,
      features: [
        "50 Build Credits / Mo",
        "2 Live Active Ventures",
        "Shared Edge Database",
        "Standard Community Support",
      ],
    },
    {
      id: "founder",
      name: "Founder",
      priceMonthly: 149,
      credits: 250,
      maxActiveVentures: 10,
      features: [
        "250 Build Credits / Mo",
        "10 Live Active Ventures",
        "Custom Domains + SSL In 60s",
        "Stripe Connect Integration",
        "Dedicated Compilation Queue",
      ],
    },
    {
      id: "syndicate",
      name: "Syndicate",
      priceMonthly: 499,
      credits: -1, // Unlimited
      maxActiveVentures: -1,
      features: [
        "Unlimited Autonomous Credits",
        "Unlimited Live Apps & Domains",
        "Isolated Docker Sandbox Runtime",
        "Guaranteed 99.99% Node SLA",
        "Private Ember Coprocessor",
      ],
    },
  ];

  getPlans(): Plan[] {
    return this.plans;
  }

  async getCredits(userId: string): Promise<{ balance: number; tier: string }> {
    return { balance: 250, tier: "founder" };
  }

  async createCheckoutSession(
    userId: string,
    planId: "starter" | "founder" | "syndicate"
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    return {
      sessionId: `cs_test_${Date.now()}`,
      checkoutUrl: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
    };
  }
}

export const billingService = new BillingService();

