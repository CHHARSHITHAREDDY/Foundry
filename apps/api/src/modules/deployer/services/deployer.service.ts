export interface DeploymentRecord {
  id: string;
  ventureId: string;
  title: string;
  subdomain: string;
  status: "building" | "live" | "failed" | "running";
  createdAt: string;
  edgeNodes: number;
  propagationProgress: number;
  activeStep: number;
  dnsStats: {
    live: number;
    syncing: number;
    queued: number;
    total: number;
  };
}

export interface EdgeLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success" | "edge";
  tag: string;
  message: string;
}

export class DeployerService {
  private deployments: Map<string, DeploymentRecord> = new Map();
  private edgeLogs: EdgeLog[] = [
    { id: "1", timestamp: "12:48:02.102", level: "info", tag: "BUILD", message: "Optimizing Next.js 15 server bundles for Cloudflare Workerd target..." },
    { id: "2", timestamp: "12:48:04.420", level: "success", tag: "BUILD", message: "Compiled 14 modules in 1.4s (Bundle size: 142 KB gzip)" },
    { id: "3", timestamp: "12:48:08.810", level: "edge", tag: "OCI", message: "Pushing layer sha256:8b4e723 to edge registry us-east (IAD1)..." },
    { id: "4", timestamp: "12:48:11.205", level: "edge", tag: "OCI", message: "Pushing layer sha256:8b4e723 to edge registry eu-central (FRA1)..." },
    { id: "5", timestamp: "12:48:13.900", level: "info", tag: "CNAME", message: "Binding route pricewatch-4k2.foundry.app -> Edge Ingress Gate" },
    { id: "6", timestamp: "12:48:16.140", level: "success", tag: "DNS", message: "Cloudflare Anycast routing synchronized across 238/285 PoPs" },
    { id: "7", timestamp: "12:48:18.500", level: "info", tag: "SSL", message: "Let's Encrypt / Cloudflare Edge TLS 1.3 certificate verified (OCSP stapled)" },
    { id: "8", timestamp: "12:48:21.010", level: "info", tag: "SMOKE", message: "Synthetic probe GET /api/health -> 200 OK (Latency: 18ms)" },
    { id: "9", timestamp: "12:48:23.750", level: "warn", tag: "WARMUP", message: "Cold start warming request issued to Tokyo NRT1 container..." },
    { id: "10", timestamp: "12:48:26.110", level: "success", tag: "WARMUP", message: "Tokyo container warm response in 24ms. Ingress active." },
  ];

  constructor() {
    // Seed default PriceWatch deployment
    const defaultDep: DeploymentRecord = {
      id: "dep_pricewatch_01",
      ventureId: "v_pricewatch",
      title: "PriceWatch for Shopify",
      subdomain: "https://pricewatch-4k2.foundry.app",
      status: "running",
      createdAt: new Date().toISOString(),
      edgeNodes: 285,
      propagationProgress: 84,
      activeStep: 5,
      dnsStats: {
        live: 238,
        syncing: 32,
        queued: 15,
        total: 285,
      },
    };
    this.deployments.set(defaultDep.id, defaultDep);
  }

  getDeployStatus(id: string = "dep_pricewatch_01"): DeploymentRecord {
    return (
      this.deployments.get(id) || {
        id,
        ventureId: "v_pricewatch",
        title: "PriceWatch for Shopify",
        subdomain: "https://pricewatch-4k2.foundry.app",
        status: "live",
        createdAt: new Date().toISOString(),
        edgeNodes: 285,
        propagationProgress: 100,
        activeStep: 5,
        dnsStats: { live: 285, syncing: 0, queued: 0, total: 285 },
      }
    );
  }

  getEdgeLogs(): EdgeLog[] {
    return this.edgeLogs;
  }

  cancelDeployment(id: string = "dep_pricewatch_01"): DeploymentRecord | null {
    const dep = this.deployments.get(id);
    if (!dep) return null;
    dep.status = "failed";
    return dep;
  }

  completeDeployment(id: string = "dep_pricewatch_01"): DeploymentRecord {
    let dep = this.deployments.get(id);
    if (!dep) {
      dep = {
        id,
        ventureId: "v_pricewatch",
        title: "PriceWatch for Shopify",
        subdomain: "https://pricewatch-4k2.foundry.app",
        status: "live",
        createdAt: new Date().toISOString(),
        edgeNodes: 285,
        propagationProgress: 100,
        activeStep: 5,
        dnsStats: { live: 285, syncing: 0, queued: 0, total: 285 },
      };
      this.deployments.set(id, dep);
    } else {
      dep.status = "live";
      dep.propagationProgress = 100;
      dep.dnsStats.live = 285;
      dep.dnsStats.syncing = 0;
      dep.dnsStats.queued = 0;
    }
    return dep;
  }

  async allocateDeployment(ventureId: string, title: string): Promise<DeploymentRecord> {
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const subdomain = `https://${slug}.foundry.app`;
    const record: DeploymentRecord = {
      id: `dep_${Date.now()}`,
      ventureId,
      title,
      subdomain,
      status: "live",
      createdAt: new Date().toISOString(),
      edgeNodes: 285,
      propagationProgress: 100,
      activeStep: 5,
      dnsStats: { live: 285, syncing: 0, queued: 0, total: 285 },
    };
    this.deployments.set(record.id, record);
    return record;
  }

  async getDeployment(id: string): Promise<DeploymentRecord | null> {
    return this.deployments.get(id) || null;
  }

  async listDeployments(): Promise<DeploymentRecord[]> {
    return Array.from(this.deployments.values());
  }
}

export const deployerService = new DeployerService();
