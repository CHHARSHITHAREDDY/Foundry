export interface DeploymentRecord {
  id: string;
  ventureId: string;
  title: string;
  subdomain: string;
  status: "building" | "live" | "failed";
  createdAt: string;
  edgeNodes: number;
}

export class DeployerService {
  private deployments: Map<string, DeploymentRecord> = new Map();

  async allocateDeployment(ventureId: string, title: string): Promise<DeploymentRecord> {
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const subdomain = `https://${slug}.foundry.studio`;
    const record: DeploymentRecord = {
      id: `dep_${Date.now()}`,
      ventureId,
      title,
      subdomain,
      status: "live",
      createdAt: new Date().toISOString(),
      edgeNodes: 310,
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
