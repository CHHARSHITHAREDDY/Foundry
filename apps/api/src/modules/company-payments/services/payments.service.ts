export interface ConnectedMerchant {
  id: string;
  companyId: string;
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export class CompanyPaymentsService {
  async createConnectLink(companyId: string): Promise<{ onboardingUrl: string; accountId: string }> {
    const accountId = `acct_test_${Date.now()}`;
    return {
      accountId,
      onboardingUrl: `https://connect.stripe.com/setup/s/${accountId}`,
    };
  }

  async getMerchantStatus(companyId: string): Promise<ConnectedMerchant> {
    return {
      id: `mch_${companyId}`,
      companyId,
      stripeAccountId: `acct_test_${companyId}`,
      chargesEnabled: true,
      payoutsEnabled: true,
    };
  }
}

export const companyPaymentsService = new CompanyPaymentsService();
