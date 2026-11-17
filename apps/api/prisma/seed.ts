import { getApiEnv } from "../src/config/env.js";

async function main() {
  const env = getApiEnv();
  console.log(`🌱 Seeding database at ${env.DATABASE_URL}...`);

  const initialUser = {
    id: "usr_founder_01",
    email: "founder@venturestudio.io",
    name: "Lead Founder",
    role: "FOUNDER",
    credits: 250,
  };

  const initialVentures = [
    {
      id: "vnt_ledgerpulse",
      title: "LedgerPulse",
      tagline: "Autonomous crypto compliance auditor for decentralized organizations",
      problem: "DAOs struggle with automated transaction tagging and treasury compliance.",
      targetCustomer: "Web3 Treasuries & DAO Stewards",
      subdomain: "https://ledgerpulse.foundry.studio",
      status: "LIVE",
      totalScore: 4.6,
    },
    {
      id: "vnt_omnibrief",
      title: "OmniBrief",
      tagline: "Morning financial intelligence briefing curating 10-K and 8-K filings",
      problem: "Hedge fund analysts waste hours reading raw SEC filings.",
      targetCustomer: "Financial Analysts & Family Offices",
      subdomain: "https://omnibrief.foundry.studio",
      status: "LIVE",
      totalScore: 4.3,
    },
    {
      id: "vnt_substacker",
      title: "Substacker",
      tagline: "Cross-platform newsletter syndication & dynamic sponsorship engine",
      problem: "Independent writers need automated distribution across Substack, Beehiiv, and Ghost.",
      targetCustomer: "Publishers & Newsletter Operators",
      subdomain: "https://substacker.foundry.studio",
      status: "LIVE",
      totalScore: 4.8,
    },
  ];

  console.log(`✅ Seed ready: 1 User (${initialUser.email}) and ${initialVentures.length} showcase ventures.`);
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
