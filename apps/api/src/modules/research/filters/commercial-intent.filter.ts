export interface CommercialIntentAnalysis {
  pays_today: boolean;
  workaround_mentioned: boolean;
  workaround_description?: string;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  persona: string;
  willingness_to_pay_signals: string[];
}

const WILLINGNESS_TO_PAY_PATTERNS = [
  /\b(i pay for|paying for|we pay|we're paying|paying \$\d+|paying \d+\/mo)\b/i,
  /\b(alternative to|switching from|cancel my|replaced by|competitor to)\b/i,
  /\b(too expensive|pricing is insane|enterprise pricing|ridiculous price|overpriced)\b/i,
  /\b(looking for a tool|looking for software|recommend a software|is there a saas)\b/i,
  /\b(would gladly pay|take my money|willing to pay|would buy this)\b/i,
  /\b(billing|invoice|churn|revenue|stripe|chargebee|subscription|checkout)\b/i,
];

const WORKAROUND_PATTERNS = [
  /\b(spreadsheet|excel|google sheets|airtable|notion table)\b/i,
  /\b(manual workaround|manually doing this|copy paste|copying and pasting)\b/i,
  /\b(ad-hoc script|custom python script|cron job|bash script)\b/i,
  /\b(hiring someone|virtual assistant|outsourcing this)\b/i,
];

export function analyzeCommercialIntent(text: string, domain?: string, author?: string): CommercialIntentAnalysis {
  const lower = text.toLowerCase();
  const signals: string[] = [];

  for (const pattern of WILLINGNESS_TO_PAY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      signals.push(match[0].toLowerCase());
    }
  }

  const paysToday = signals.length > 0 && /pay|pricing|expensive|billing|subscription/i.test(signals.join(" "));

  let workaroundMentioned = false;
  let workaroundDescription: string | undefined;

  for (const pattern of WORKAROUND_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      workaroundMentioned = true;
      workaroundDescription = `Uses ${match[0]} as a manual workaround`;
      signals.push(match[0].toLowerCase());
      break;
    }
  }

  // Determine intensity based on commercial signals and urgency markers
  let intensity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  const urgencyCount = (lower.match(/urgent|nightmare|frustrating|hours wasted|broken|painful|hate/g) || []).length;
  if (paysToday || signals.length >= 2 || urgencyCount >= 2) {
    intensity = "HIGH";
  } else if (signals.length >= 1 || urgencyCount >= 1 || workaroundMentioned) {
    intensity = "MEDIUM";
  }

  // Infer persona from domain and keywords
  let persona = "SaaS Operator";
  if (lower.includes("store") || lower.includes("shopify") || lower.includes("ecommerce") || lower.includes("cart") || lower.includes("order")) {
    persona = "E-Commerce Brand Owner";
  } else if (lower.includes("invoice") || lower.includes("tax") || lower.includes("accounting") || lower.includes("client billing")) {
    persona = "Agency & Small Business Finance Lead";
  } else if (lower.includes("database") || lower.includes("postgres") || lower.includes("deploy") || lower.includes("infra") || lower.includes("docker")) {
    persona = "DevOps & Cloud Engineer";
  } else if (lower.includes("lead") || lower.includes("marketing") || lower.includes("seo") || lower.includes("serp") || lower.includes("traffic")) {
    persona = "Growth Marketer & SEO Operator";
  } else if (lower.includes("freelance") || lower.includes("client") || lower.includes("agency")) {
    persona = "Independent Freelancer / Agency Owner";
  } else if (domain?.includes("Hacker News")) {
    persona = `Bootstrapped Founder / Engineer (${author || "HN"})`;
  } else if (domain?.includes("GitHub")) {
    persona = `Developer Maintainer (${author || "GitHub"})`;
  }

  return {
    pays_today: paysToday,
    workaround_mentioned: workaroundMentioned,
    workaround_description: workaroundDescription,
    intensity,
    persona,
    willingness_to_pay_signals: Array.from(new Set(signals)),
  };
}
