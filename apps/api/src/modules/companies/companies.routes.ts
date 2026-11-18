import { FastifyInstance, FastifyPluginAsync } from "fastify";

export interface CompanyRecord {
  name: string;
  slug: string;
  status: "LIVE" | "BUILDING" | "STAGING" | "PAUSED";
  subdomain: string;
  sslActive: boolean;
  version: string;
  edgePoPs: string[];
  autoRunEnabled: boolean;
  nightTasksEnabled: boolean;
  metrics: {
    arr: string;
    visitors: number;
    merchants: number;
    conversionRate: string;
  };
  documents: Array<{
    id: string;
    title: string;
    type: "MARKDOWN" | "PDF" | "CONFIG";
    updatedAt: string;
    size: string;
  }>;
}

const COMPANIES: Map<string, CompanyRecord> = new Map([
  [
    "pricewatch",
    {
      name: "PriceWatch",
      slug: "pricewatch",
      status: "LIVE",
      subdomain: "https://pricewatch-4k2.foundry.app",
      sslActive: true,
      version: "#e9a2b84",
      edgePoPs: ["IAD1", "FRA1", "NRT1"],
      autoRunEnabled: true,
      nightTasksEnabled: true,
      metrics: {
        arr: "$0.00",
        visitors: 1,
        merchants: 0,
        conversionRate: "0.0%",
      },
      documents: [
        { id: "doc-1", title: "Product Roadmap & Epics", type: "MARKDOWN", updatedAt: "Today 12:40", size: "14 KB" },
        { id: "doc-2", title: "Design System & Tokens Spec", type: "CONFIG", updatedAt: "Today 09:15", size: "32 KB" },
        { id: "doc-3", title: "Company Profile & Unit Economics", type: "PDF", updatedAt: "Yesterday", size: "84 KB" },
      ],
    },
  ],
  [
    "dispatch",
    {
      name: "Dispatch",
      slug: "dispatch",
      status: "LIVE",
      subdomain: "https://dispatch.foundry.app",
      sslActive: true,
      version: "#b188c02",
      edgePoPs: ["IAD1", "FRA1"],
      autoRunEnabled: true,
      nightTasksEnabled: false,
      metrics: {
        arr: "$1,420.00",
        visitors: 2840,
        merchants: 142,
        conversionRate: "5.0%",
      },
      documents: [
        { id: "doc-d1", title: "Dispatch Content Calendar", type: "MARKDOWN", updatedAt: "Today", size: "18 KB" },
      ],
    },
  ],
]);

export const companiesRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Get all companies
  app.get("/", async (_req, reply) => {
    return reply.send({ companies: Array.from(COMPANIES.values()) });
  });

  // Get specific company
  app.get("/:name", async (req, reply) => {
    const { name } = req.params as { name: string };
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const company = COMPANIES.get(key) || COMPANIES.get("pricewatch");
    return reply.send(company);
  });

  // Toggle Auto-Run
  app.post("/:name/toggle-auto", async (req, reply) => {
    const { name } = req.params as { name: string };
    const { enabled } = (req.body || {}) as { enabled: boolean };
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const company = COMPANIES.get(key) || COMPANIES.get("pricewatch")!;
    company.autoRunEnabled = enabled;
    return reply.send({ success: true, autoRunEnabled: company.autoRunEnabled });
  });

  // Toggle Night Tasks
  app.post("/:name/toggle-night", async (req, reply) => {
    const { name } = req.params as { name: string };
    const { enabled } = (req.body || {}) as { enabled: boolean };
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const company = COMPANIES.get(key) || COMPANIES.get("pricewatch")!;
    company.nightTasksEnabled = enabled;
    return reply.send({ success: true, nightTasksEnabled: company.nightTasksEnabled });
  });

  // Get company documents
  app.get("/:name/documents", async (req, reply) => {
    const { name } = req.params as { name: string };
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const company = COMPANIES.get(key) || COMPANIES.get("pricewatch")!;
    return reply.send({ documents: company.documents });
  });
};

