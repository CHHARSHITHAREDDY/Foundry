import { LlmClient } from "@venture-studio/llm-client";
import { BuildSpec } from "@venture-studio/contracts";

export class UiStage {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async execute(spec: BuildSpec): Promise<{ files: Record<string, string> }> {
    const prompt = `You are the Lead Frontend UI Coding Agent.
Using Tailwind CSS and modern React 19 / Next.js 15, build clean components and pages using these Design Tokens:
Primary: ${spec.designTokens.primaryColor}
Radius: ${spec.designTokens.borderRadius}
Product: ${spec.metadata.name} (${spec.metadata.tagline})

Generate:
- "src/app/page.tsx": High-converting landing page with hero, features, pricing, CTA.
- "src/app/(app)/dashboard/page.tsx": Dashboard displaying statistics cards, active records, and an "Add New" button using mocked responses.

Return a JSON object with { "files": { "path": "code" } }.`;

    try {
      const res: any = await this.llm.completeStructured(
        {
          tier: "coder",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        },
        null as any
      );
      if (res && res.files) return res;
    } catch {}

    // Deterministic fallback UI components
    return {
      files: {
        "src/app/page.tsx": `import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="font-bold text-xl tracking-tight text-blue-500">${spec.metadata.name}</div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition">
            Open Dashboard
          </Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
          ${spec.metadata.tagline}
        </h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          ${spec.metadata.description}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} ${spec.metadata.name}. All rights reserved.
      </footer>
    </main>
  );
}
`,
        "src/app/(app)/dashboard/page.tsx": `"use client";
import { useState } from "react";

export default function DashboardPage() {
  const [items, setItems] = useState([
    { id: "1", name: "Production Endpoint Monitor", status: "Active" },
    { id: "2", name: "Checkout Webhook Relay", status: "Active" },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto text-zinc-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 text-sm">Manage your active monitors and configurations</p>
        </div>
        <button 
          onClick={() => setItems([...items, { id: String(items.length + 1), name: \`New Monitor #\${items.length + 1}\`, status: "Active" }])}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium text-sm">
          + Add Monitor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="text-zinc-400 text-xs font-semibold uppercase">Total Active</div>
          <div className="text-3xl font-bold mt-2">{items.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="text-zinc-400 text-xs font-semibold uppercase">Success Rate</div>
          <div className="text-3xl font-bold mt-2 text-emerald-400">99.9%</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="text-zinc-400 text-xs font-semibold uppercase">Incidents Today</div>
          <div className="text-3xl font-bold mt-2">0</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 font-semibold">Active Records</div>
        <ul className="divide-y divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="px-6 py-4 flex items-center justify-between">
              <span>{item.name}</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
`,
      },
    };
  }
}
