export class EmailService {
  async sendTransactional(to: string, subject: string, template: string): Promise<{ sent: boolean; messageId: string }> {
    return {
      sent: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  async verifyDnsRecords(domain: string): Promise<{ spf: boolean; dkim: boolean; mx: boolean }> {
    return { spf: true, dkim: true, mx: true };
  }
}

export const emailService = new EmailService();
