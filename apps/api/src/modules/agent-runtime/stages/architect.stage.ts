import { LlmClient } from "@venture-studio/llm-client";
import { IdeaBrief, BuildSpec, BuildSpecSchema } from "@venture-studio/contracts";

export class ArchitectStage {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async execute(idea: IdeaBrief): Promise<BuildSpec> {
    const prompt = `You are the Lead System Architect for an autonomous software studio.
Read this approved Idea Brief and produce the master Build Spec:

IDEA BRIEF:
Title: ${idea.title}
Tagline: ${idea.tagline}
Problem: ${idea.problem}
Target Customer: ${idea.targetCustomer}
MVP Scope: ${JSON.stringify(idea.mvpScope)}

TASK:
Produce a complete BuildSpec conforming to the schema:
1. metadata: name, slug, tagline, description, targetAudience.
2. designTokens: primaryColor, accentColor, borderRadius, darkMode: true.
3. pages:
   - Route '/' (landing page)
   - Route '/dashboard' (app workspace)
4. database: Drizzle tables for items/records.
5. api: OpenAPI endpoints.
6. tasks: DAG of tasks for BACKEND, UI, CONTENT, INTEGRATOR, QA, REVIEWER, DEPLOYER.`;

    try {
      const spec = await this.llm.completeStructured(
        {
          tier: "reasoner",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        },
        BuildSpecSchema
      );
      return {
        ...spec,
        createdAt: spec.createdAt || new Date().toISOString(),
      } as BuildSpec;
    } catch {
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
              { name: "DataTable", type: "table", props: {}, description: "Active records" },
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
                { name: "name", type: "text", primaryKey: false, nullable: false, unique: false },
                { name: "status", type: "text", primaryKey: false, nullable: false, unique: false, defaultValue: "active" },
                { name: "createdAt", type: "timestamp", primaryKey: false, nullable: false, unique: false },
              ],
            },
          ],
        },
        api: {
          endpoints: [
            { path: "/api/items", method: "get", summary: "List items", authRequired: true },
            { path: "/api/items", method: "post", summary: "Create item", authRequired: true },
          ],
        },
        tasks: {
          tasks: [
            { id: "t_be", agent: "BACKEND" as const, title: "Build Schema & Routes", description: "Drizzle & Handlers", dependencies: [], status: "PENDING" as const, outputArtifacts: [] },
            { id: "t_ui", agent: "UI" as const, title: "Build UI Components", description: "Pages & Tokens", dependencies: [], status: "PENDING" as const, outputArtifacts: [] },
            { id: "t_int", agent: "INTEGRATOR" as const, title: "Merge Codebases", description: "Wiring and Typecheck", dependencies: ["t_be", "t_ui"], status: "PENDING" as const, outputArtifacts: [] },
            { id: "t_qa", agent: "QA" as const, title: "Playwright Journeys", description: "Zero console errors", dependencies: ["t_int"], status: "PENDING" as const, outputArtifacts: [] },
            { id: "t_dep", agent: "DEPLOYER" as const, title: "Deploy Subdomain", description: "Live verification", dependencies: ["t_qa"], status: "PENDING" as const, outputArtifacts: [] },
          ],
        },
        createdAt: new Date().toISOString(),
      };
    }
  }
}
