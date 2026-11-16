import { LlmClient } from "@venture-studio/llm-client";
import { IdeaBrief, BuildSpec, BuildSpecSchema } from "@venture-studio/contracts";

export class ArchitectStage {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async execute(idea: IdeaBrief): Promise<BuildSpec> {
    const prompt = `You are the Lead System Architect for an autonomous software studio.
You must read this approved Idea Brief and produce the master Build Spec (the single source of truth for the entire coding team).

IDEA BRIEF:
Title: ${idea.title}
Tagline: ${idea.tagline}
Problem: ${idea.problem}
Target Customer: ${idea.targetCustomer}
MVP Scope: ${JSON.stringify(idea.mvpScope)}

TASK:
Produce a complete BuildSpec conforming to the schema:
1. metadata: name, slug, tagline, description, targetAudience.
2. designTokens: primaryColor (hex), accentColor (hex), borderRadius, darkMode: true.
3. pages:
   - Route '/' (landing page with hero, features, how-it-works, pricing)
   - Route '/dashboard' (main app workspace with data table/metrics)
   - Route '/settings' (configuration, API keys, webhooks)
4. database:
   - Drizzle tables: users, records/items matching the problem, audit_logs.
5. api:
   - OpenAPI endpoints for the core CRUD and automation workflows with request/response schemas.
6. tasks:
   - The DAG of tasks assigned to: BACKEND, UI, CONTENT, INTEGRATOR, QA, REVIEWER, DEPLOYER.`;

    try {
      return await this.llm.completeStructured(
        {
          tier: "reasoner",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        },
        BuildSpecSchema
      );
    } catch (err) {
      console.warn("Architect LLM call failed, generating deterministic BuildSpec:", err);
      const slug = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return {
        id: `spec_${Math.random().toString(36).substring(2, 9)}`,
        ideaId: idea.id,
        metadata: {
          id: `meta_${slug}`,
          name: idea.title,
          slug,
          tagline: idea.tagline,
          description: idea.problem,
          version: "0.1.0",
          targetAudience: idea.targetCustomer,
        },
        designTokens: {
          primaryColor: "#3b82f6",
          accentColor: "#10b981",
          backgroundColor: "#09090b",
          foregroundColor: "#fafafa",
          fontFamily: "Inter, sans-serif",
          borderRadius: "0.5rem",
          darkMode: true,
        },
        pages: [
          {
            route: "/",
            title: `${idea.title} - ${idea.tagline}`,
            description: idea.problem,
            layout: "marketing",
            components: [
              { name: "HeroSection", type: "hero", props: {}, description: "Main value prop and CTA" },
              { name: "FeatureGrid", type: "feature-grid", props: {}, description: "Core features" },
              { name: "PricingTable", type: "table", props: {}, description: "Simple $19/mo tier" },
            ],
            mockDataRequired: false,
          },
          {
            route: "/dashboard",
            title: "App Dashboard",
            description: "Main workspace",
            layout: "dashboard",
            components: [
              { name: "StatsOverview", type: "stats", props: {}, description: "Key metrics and alerts" },
              { name: "DataTable", type: "table", props: {}, description: "Active records and checks" },
            ],
            mockDataRequired: true,
          },
        ],
        database: {
          tables: [
            {
              name: "items",
              description: "Core tracked records",
              columns: [
                { name: "id", type: "text", primaryKey: true, nullable: false, unique: true },
                { name: "userId", type: "text", primaryKey: false, nullable: false, unique: false },
                { name: "name", type: "text", primaryKey: false, nullable: false, unique: false },
                { name: "status", type: "text", primaryKey: false, nullable: false, unique: false, defaultValue: "active" },
                { name: "createdAt", type: "timestamp", primaryKey: false, nullable: false, unique: false },
              ],
            },
          ],
        },
        api: {
          endpoints: [
            {
              path: "/api/items",
              method: "get",
              summary: "List all items for user",
              authRequired: true,
            },
            {
              path: "/api/items",
              method: "post",
              summary: "Create a new item",
              authRequired: true,
            },
          ],
        },
        tasks: {
          tasks: [
            { id: "task_be_1", agent: "BACKEND", title: "Create Drizzle schema & API routes", description: "Implement tables and handlers", dependencies: [], status: "PENDING", outputArtifacts: ["src/db/schema/app.ts", "src/app/api/items/route.ts"] },
            { id: "task_fe_1", agent: "UI", title: "Build Dashboard & Landing pages", description: "Implement UI with design tokens and mocks", dependencies: [], status: "PENDING", outputArtifacts: ["src/app/page.tsx", "src/app/dashboard/page.tsx"] },
            { id: "task_ct_1", agent: "CONTENT", title: "Write landing page copy & SEO", description: "Value proposition and metadata", dependencies: [], status: "PENDING", outputArtifacts: ["src/app/opengraph-image.tsx"] },
            { id: "task_int_1", agent: "INTEGRATOR", title: "Merge branches & wire API calls", description: "Replace mocks with live endpoints", dependencies: ["task_be_1", "task_fe_1", "task_ct_1"], status: "PENDING", outputArtifacts: [] },
            { id: "task_qa_1", agent: "QA", title: "Playwright E2E & visual validation", description: "Verify user flows & zero console errors", dependencies: ["task_int_1"], status: "PENDING", outputArtifacts: ["playwright-report"] },
            { id: "task_rev_1", agent: "REVIEWER", title: "Security audit & spec check", description: "Check diff vs spec", dependencies: ["task_qa_1"], status: "PENDING", outputArtifacts: [] },
            { id: "task_dep_1", agent: "DEPLOYER", title: "Production build & deploy", description: "Deploy to subdomain & healthcheck", dependencies: ["task_rev_1"], status: "PENDING", outputArtifacts: [] },
          ],
        },
        createdAt: new Date().toISOString(),
      };
    }
  }
}
