export class AdminService {
  async getSystemStats() {
    return {
      activeRuns: 1,
      totalDeployments: 42,
      databaseConnections: 3,
      nodeStatus: "HEALTHY",
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }

  async grantCredits(userId: string, amount: number): Promise<{ userId: string; granted: number; newTotal: number }> {
    return {
      userId,
      granted: amount,
      newTotal: 250 + amount,
    };
  }
}

export const adminService = new AdminService();
