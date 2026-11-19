import {
  SurpriseMeRequest,
  SurpriseMeResponse,
  SurpriseMeResponseSchema,
  ClarifyIdeaRequest,
  ClarifyIdeaResponse,
  ClarifyIdeaResponseSchema,
  ValidateIdeaRequest,
  ValidateIdeaResponse,
  ValidateIdeaResponseSchema,
  IdeaBrief,
  IdeaBriefSchema,
} from "@venture-studio/contracts";

export class StudioApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
        : (process.env.INTERNAL_API_URL || "http://localhost:3001"));
  }

  getStreamUrl(): string {
    return `${this.baseUrl}/api/stream`;
  }

  // --- 1. IDEATION & GENESIS ---
  async surpriseMe(req: Partial<SurpriseMeRequest> = { maxCandidates: 5 }): Promise<SurpriseMeResponse> {
    const payload: SurpriseMeRequest = {
      maxCandidates: req.maxCandidates ?? 5,
      targetAudience: req.targetAudience,
      domainPreference: req.domainPreference,
    };
    const res = await fetch(`${this.baseUrl}/api/ideas/surprise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Surprise Me failed: ${await res.text()}`);
    return SurpriseMeResponseSchema.parse(await res.json());
  }

  async clarify(req: ClarifyIdeaRequest): Promise<ClarifyIdeaResponse> {
    const res = await fetch(`${this.baseUrl}/api/ideas/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Clarify failed: ${await res.text()}`);
    return ClarifyIdeaResponseSchema.parse(await res.json());
  }

  async validate(req: ValidateIdeaRequest): Promise<ValidateIdeaResponse> {
    const res = await fetch(`${this.baseUrl}/api/ideas/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Validate failed: ${await res.text()}`);
    return ValidateIdeaResponseSchema.parse(await res.json());
  }

  async getNextCandidate(currentId?: string): Promise<IdeaBrief> {
    const query = currentId ? `?currentId=${currentId}` : "";
    const res = await fetch(`${this.baseUrl}/api/ideas/next-candidate${query}`);
    if (!res.ok) throw new Error(`Next candidate failed: ${await res.text()}`);
    return IdeaBriefSchema.parse(await res.json());
  }

  async tweak(id: string, modifications: any): Promise<IdeaBrief> {
    const res = await fetch(`${this.baseUrl}/api/ideas/${id}/tweak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modifications }),
    });
    if (!res.ok) throw new Error(`Tweak failed: ${await res.text()}`);
    return IdeaBriefSchema.parse(await res.json());
  }

  async approve(id: string, userNotes?: string): Promise<IdeaBrief> {
    const res = await fetch(`${this.baseUrl}/api/ideas/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userNotes }),
    });
    if (!res.ok) throw new Error(`Approve failed: ${await res.text()}`);
    return IdeaBriefSchema.parse(await res.json());
  }

  async getPainPoints(): Promise<{ painPoints: any[]; sourcesScanned: string[]; total: number }> {
    const res = await fetch(`${this.baseUrl}/api/research/pain-points`);
    if (!res.ok) return { painPoints: [], sourcesScanned: [], total: 0 };
    return res.json();
  }

  // --- 2. SPRINT TASKS ---
  async getTasks(filter?: string): Promise<{ tasks: any[]; total: number }> {
    const q = filter && filter !== "ALL" ? `?filter=${encodeURIComponent(filter)}` : "";
    const res = await fetch(`${this.baseUrl}/api/tasks${q}`);
    if (!res.ok) return { tasks: [], total: 0 };
    return res.json();
  }

  async createTask(payload: {
    specification: string;
    type?: string;
    priority?: string;
    credits?: number;
    requiresApproval?: boolean;
    companyName?: string;
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create task failed: ${await res.text()}`);
    return res.json();
  }

  async approveTask(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/tasks/${id}/approve`, { method: "POST" });
    if (!res.ok) throw new Error(`Approve task failed: ${await res.text()}`);
    return res.json();
  }

  async cancelTask(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/tasks/${id}/cancel`, { method: "POST" });
    if (!res.ok) throw new Error(`Cancel task failed: ${await res.text()}`);
    return res.json();
  }

  async retryTask(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/tasks/${id}/retry`, { method: "POST" });
    if (!res.ok) throw new Error(`Retry task failed: ${await res.text()}`);
    return res.json();
  }

  // --- 3. STAGE 07 DEPLOY ---
  async getDeployStatus(id?: string): Promise<any> {
    const q = id ? `?id=${encodeURIComponent(id)}` : "";
    const res = await fetch(`${this.baseUrl}/api/deployments/status${q}`);
    if (!res.ok) return null;
    return res.json();
  }

  async getDeployLogs(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/deployments/logs`);
    if (!res.ok) return { logs: [] };
    return res.json();
  }

  async cancelDeploy(id?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/deployments/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  }

  async completeDeploy(id?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/deployments/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  }

  // --- 4. CODE REVIEW GATE ---
  async getReviewAudit(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/review/audit`);
    if (!res.ok) return null;
    return res.json();
  }

  async applyReviewPatch(patchId?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/review/patch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patchId }),
    });
    return res.json();
  }

  async exportReviewAudit(): Promise<{ content: string; filename: string }> {
    const res = await fetch(`${this.baseUrl}/api/review/export`);
    if (!res.ok) throw new Error("Failed to export audit");
    return res.json();
  }

  async approveReview(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/review/approve`, { method: "POST" });
    return res.json();
  }

  // --- 5. BUILD CONSOLE ---
  async getBuildStatus(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/builds/status`);
    if (!res.ok) return null;
    return res.json();
  }

  async getBuildLogs(filter?: string): Promise<any> {
    const q = filter ? `?filter=${encodeURIComponent(filter)}` : "";
    const res = await fetch(`${this.baseUrl}/api/builds/logs${q}`);
    if (!res.ok) return { logs: [] };
    return res.json();
  }

  async cancelBuild(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/builds/cancel`, { method: "POST" });
    return res.json();
  }

  // --- 6. COMPANY HUB ---
  async getCompany(name: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/companies/${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    return res.json();
  }

  async toggleCompanyAutoRun(name: string, enabled: boolean): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/companies/${encodeURIComponent(name)}/toggle-auto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  }

  async toggleCompanyNightTasks(name: string, enabled: boolean): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/companies/${encodeURIComponent(name)}/toggle-night`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  }

  async getCompanyDocuments(name: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/companies/${encodeURIComponent(name)}/documents`);
    if (!res.ok) return { documents: [] };
    return res.json();
  }

  // --- 7. CAPABILITIES ---
  async postTweet(content: string, companyName?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/social/tweet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, companyName }),
    });
    return res.json();
  }

  async sendEmailOutreach(target?: string, companyDomain?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/email/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, companyDomain }),
    });
    return res.json();
  }

  async deployAds(payload: { creativeVariant?: number; dailyBudget?: number }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/ads/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async generateMedia(payload: { prompt: string; type?: "image" | "video" }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/media/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async chatWithCompanion(prompt: string, ventureId?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ventureId }),
    });
    return res.json();
  }

  // --- 8. NOTIFICATIONS ---
  async getNotifications(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/notifications`);
    if (!res.ok) return { notifications: [] };
    return res.json();
  }

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/notifications/${id}/read`, { method: "POST" });
    return res.json();
  }

  // --- 9. AUTHENTICATION ---
  async login(email: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
    return res.json();
  }

  async getSession(token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${this.baseUrl}/api/auth/session`, { headers });
    if (!res.ok) return { authenticated: false };
    return res.json();
  }
}

export const api = new StudioApiClient();
