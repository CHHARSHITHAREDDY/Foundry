import argon2 from "argon2";
import { prismaDatabase } from "../apps/api/src/db/prisma.service.js";

async function seedDev() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to run seed:dev when NODE_ENV=production.");
    process.exit(1);
  }

  const prisma = await prismaDatabase.ensureReady();
  if (!prisma) {
    console.error("❌ Database unavailable.");
    process.exit(1);
  }

  const demoEmail = "demo@foundry.studio";
  const passwordHash = await argon2.hash("DemoPass123!", { type: argon2.argon2id });

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      name: "Demo Operator",
      role: "FOUNDER",
      credits: 100,
      passwordHash,
      emailVerifiedAt: new Date(),
      demo: true,
    },
    update: {
      demo: true,
    },
  });

  await prisma.creditLedger.upsert({
    where: { idempotencyKey: `signup:${user.id}` },
    create: {
      idempotencyKey: `signup:${user.id}`,
      userId: user.id,
      action: "BONUS",
      amount: 100,
      balance: 100,
      reason: "DEMO_SEED_BONUS",
    },
    update: {},
  });

  const existingDemoVenture = await prisma.venture.findFirst({
    where: { ownerId: user.id, demo: true },
  });

  if (!existingDemoVenture) {
    const v = await prisma.venture.create({
      data: {
        title: "LedgerPulse (Demo)",
        tagline: "Automated bank feed discrepancy monitor for small SaaS finance teams.",
        problem: "Finance teams spend hours reconciling Stripe payouts against bank CSV exports.",
        targetCustomer: "SaaS Controllers & Ops Leads",
        whyNow: "Real-time open banking webhooks are widely available.",
        verdict: "GO",
        status: "LIVE",
        subdomain: `ledgerpulse-demo-${Date.now().toString(36)}`,
        demo: true,
        ownerId: user.id,
      },
    });

    await prisma.workflowRun.create({
      data: {
        ventureId: v.id,
        ownerId: user.id,
        currentStage: "COMPLETED",
        completedStages: ["ARCHITECTING", "BUILDING", "INTEGRATING", "QA", "REVIEW", "DEPLOY"],
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "BUILD",
        title: "Demo Venture Seeded",
        message: "LedgerPulse (Demo) was seeded via pnpm seed:dev with demo=true.",
        read: false,
        demo: true,
      },
    });
  }

  console.log("✅ Dev demo data seeded (demo=true). Login: demo@foundry.studio / DemoPass123!");
  process.exit(0);
}

seedDev().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
