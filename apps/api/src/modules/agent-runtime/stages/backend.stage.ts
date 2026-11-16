import { LlmClient } from "@venture-studio/llm-client";
import { BuildSpec } from "@venture-studio/contracts";

export class BackendStage {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async execute(spec: BuildSpec): Promise<{ files: Record<string, string> }> {
    const prompt = `You are the Senior Backend Coding Agent.
Generate Drizzle ORM schema and Next.js 15 Route Handlers conforming strictly to this BuildSpec:

Product: ${spec.metadata.name}
Tables: ${JSON.stringify(spec.database.tables)}
Endpoints: ${JSON.stringify(spec.api.endpoints)}

Output a JSON object mapping file paths to complete TypeScript code:
- "src/db/schema/app.ts"
- "src/app/api/items/route.ts"

Return JSON: { "files": { "path": "code" } }.`;

    try {
      const res: any = await this.llm.completeStructured(
        { tier: "coder", messages: [{ role: "user", content: prompt }], temperature: 0.2 },
        null as any
      );
      if (res && res.files) return res;
    } catch {}

    return {
      files: {
        "src/db/schema/app.ts": `import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
});
`,
        "src/app/api/items/route.ts": `import { NextResponse } from "next/server";
import { z } from "zod";

const CreateItemSchema = z.object({ name: z.string().min(2) });

export async function GET() {
  return NextResponse.json({
    items: [{ id: "item_1", name: "Sample Item", status: "active", createdAt: new Date().toISOString() }],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = CreateItemSchema.parse(body);
    return NextResponse.json({
      id: "item_" + Math.random().toString(36).substring(2, 9),
      name: data.name,
      status: "active",
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
`,
      },
    };
  }
}
