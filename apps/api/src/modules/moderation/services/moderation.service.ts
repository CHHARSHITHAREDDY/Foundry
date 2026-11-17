export class ModerationService {
  checkContent(text: string): { approved: boolean; reason?: string } {
    const prohibitedKeywords = ["malware", "ransomware", "phishing", "ddos"];
    const lower = text.toLowerCase();
    for (const kw of prohibitedKeywords) {
      if (lower.includes(kw)) {
        return { approved: false, reason: `Contains restricted keyword: ${kw}` };
      }
    }
    return { approved: true };
  }
}

export const moderationService = new ModerationService();

