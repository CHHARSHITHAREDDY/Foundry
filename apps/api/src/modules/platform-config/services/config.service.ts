export class PlatformConfigService {
  getConfig() {
    return {
      version: "2.4",
      nodeId: "NODE_08",
      features: {
        surpriseMe: true,
        clarifier: true,
        swarmBuild: true,
        playwrightVisionQA: true,
        edgeDeployer: true,
      },
      creditCosts: {
        surpriseMe: 1,
        fullSwarmBuild: 5,
        visionQAPass: 1,
      },
    };
  }
}

export const platformConfigService = new PlatformConfigService();

