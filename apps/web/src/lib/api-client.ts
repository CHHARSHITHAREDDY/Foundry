import {
  AuthMeResponse,
  AuthMeResponseSchema,
  LoginRequest,
  LoginResponse,
  LoginResponseSchema,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseSchema,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  TwoFactorSetupResponse,
  TwoFactorSetupResponseSchema,
  TwoFactorVerifyRequest,
  TwoFactorDisableRequest,
  SessionsListResponse,
  SessionsListResponseSchema,
  CreditsBalanceResponse,
  CreditsBalanceResponseSchema,
  LedgerQuery,
  LedgerResponse,
  LedgerResponseSchema,
  PlansResponse,
  PlansResponseSchema,
  PricingResponse,
  PricingResponseSchema,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutResponseSchema,
  InvoicesResponse,
  InvoicesResponseSchema,
  CompaniesListQuery,
  CompaniesListResponse,
  CompaniesListResponseSchema,
  CompanyDetailResponse,
  CompanyDetailResponseSchema,
  DashboardSummaryResponse,
  DashboardSummaryResponseSchema,
  NotificationsQuery,
  NotificationsListResponse,
  NotificationsListResponseSchema,
  MarkNotificationsReadRequest,
} from "@venture-studio/contracts";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  retryAfter?: number;

  constructor(message: string, statusCode: number, code = "API_ERROR", retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export class StudioApiClient {
  private baseUrl: string;
  private cachedCsrf: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        : process.env.INTERNAL_API_URL || "http://localhost:3001");
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getUserStreamUrl(): string {
    return `${this.baseUrl}/api/stream/user`;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    parser?: { parse: (val: unknown) => T }
  ): Promise<T> {
    const method = (init.method || "GET").toUpperCase();
    const headers: Record<string, string> = {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrf = getCookie("foundry_csrf") || this.cachedCsrf;
      if (csrf) {
        headers["x-csrf-token"] = csrf;
      }
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { message: text };
    }

    if (!res.ok) {
      throw new ApiError(
        json?.message || `Request failed with status ${res.status}`,
        res.status,
        json?.error || "API_ERROR",
        json?.retryAfter
      );
    }

    if (json?.csrfToken) {
      this.cachedCsrf = json.csrfToken;
    }

    return parser ? parser.parse(json) : (json as T);
  }

  // --- AUTH ---
  getMe(): Promise<AuthMeResponse> {
    return this.request("/api/auth/me", {}, AuthMeResponseSchema);
  }

  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return this.request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }, RegisterResponseSchema);
  }

  login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }, LoginResponseSchema);
  }

  logout(): Promise<{ success: boolean }> {
    return this.request("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
  }

  verifyEmail(payload: VerifyEmailRequest): Promise<{ verified: boolean }> {
    return this.request("/api/auth/verify-email", { method: "POST", body: JSON.stringify(payload) });
  }

  resendVerification(payload: ResendVerificationRequest): Promise<{ sent: boolean; cooldownSeconds: number }> {
    return this.request("/api/auth/resend-verification", { method: "POST", body: JSON.stringify(payload) });
  }

  forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
  }

  resetPassword(payload: ResetPasswordRequest): Promise<{ reset: boolean; message: string }> {
    return this.request("/api/auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
  }

  setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    return this.request("/api/auth/2fa/setup", { method: "POST", body: JSON.stringify({}) }, TwoFactorSetupResponseSchema);
  }

  verifyTwoFactor(payload: TwoFactorVerifyRequest): Promise<LoginResponse> {
    return this.request("/api/auth/2fa/verify", { method: "POST", body: JSON.stringify(payload) });
  }

  disableTwoFactor(payload: TwoFactorDisableRequest): Promise<{ disabled: boolean }> {
    return this.request("/api/auth/2fa/disable", { method: "POST", body: JSON.stringify(payload) });
  }

  getSessions(): Promise<SessionsListResponse> {
    return this.request("/api/auth/sessions", {}, SessionsListResponseSchema);
  }

  revokeSession(id: string): Promise<{ revoked: boolean; id: string }> {
    return this.request(`/api/auth/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  getDevOutbox(to?: string): Promise<{ emails: Array<{ id: string; to: string; subject: string; body: string; link: string | null; type: string; createdAt: string }> }> {
    const q = to ? `?to=${encodeURIComponent(to)}` : "";
    return this.request(`/api/dev/outbox${q}`);
  }

  // --- BILLING & PRICING ---
  getCredits(): Promise<CreditsBalanceResponse> {
    return this.request("/api/billing/credits", {}, CreditsBalanceResponseSchema);
  }

  getLedger(query: Partial<LedgerQuery> = {}): Promise<LedgerResponse> {
    const params = new URLSearchParams();
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.action) params.set("action", query.action);
    const qs = params.toString();
    return this.request(`/api/billing/ledger${qs ? `?${qs}` : ""}`, {}, LedgerResponseSchema);
  }

  getPlans(): Promise<PlansResponse> {
    return this.request("/api/billing/plans", {}, PlansResponseSchema);
  }

  getInvoices(cursor?: string): Promise<InvoicesResponse> {
    const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return this.request(`/api/billing/invoices${q}`, {}, InvoicesResponseSchema);
  }

  createCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
    return this.request("/api/billing/checkout", { method: "POST", body: JSON.stringify(payload) }, CheckoutResponseSchema);
  }

  getPricing(): Promise<PricingResponse> {
    return this.request("/api/pricing", {}, PricingResponseSchema);
  }

  // --- COMPANIES & DASHBOARD ---
  getCompanies(query: Partial<CompaniesListQuery> = {}): Promise<CompaniesListResponse> {
    const params = new URLSearchParams();
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    const qs = params.toString();
    return this.request(`/api/companies${qs ? `?${qs}` : ""}`, {}, CompaniesListResponseSchema);
  }

  getCompany(id: string): Promise<CompanyDetailResponse> {
    return this.request(`/api/companies/${encodeURIComponent(id)}`, {}, CompanyDetailResponseSchema);
  }

  deleteCompany(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/api/companies/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return this.request("/api/dashboard/summary", {}, DashboardSummaryResponseSchema);
  }

  // --- NOTIFICATIONS ---
  getNotifications(query: Partial<NotificationsQuery> = {}): Promise<NotificationsListResponse> {
    const params = new URLSearchParams();
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.unreadOnly !== undefined) params.set("unreadOnly", String(query.unreadOnly));
    const qs = params.toString();
    return this.request(`/api/notifications${qs ? `?${qs}` : ""}`, {}, NotificationsListResponseSchema);
  }

  markNotificationsRead(payload: { id?: string; all?: boolean }): Promise<{ success: boolean }> {
    return this.request("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ id: payload.id, all: payload.all ?? false } satisfies MarkNotificationsReadRequest),
    });
  }

  // --- PHASE B: IDEATION ENGINE ---
  getIdeaJobStreamUrl(jobId: string): string {
    return `${this.baseUrl}/api/ideas/jobs/${encodeURIComponent(jobId)}/stream`;
  }
  startSurprise(maxCandidates = 8): Promise<{ jobId: string; status: string }> {
    return this.request("/api/ideas/surprise", { method: "POST", body: JSON.stringify({ maxCandidates }) });
  }
  getIdeaJob(jobId: string): Promise<{ job: any; topIdeas: any[] }> {
    return this.request(`/api/ideas/jobs/${encodeURIComponent(jobId)}`);
  }
  cancelIdeaJob(jobId: string): Promise<{ cancelled: boolean }> {
    return this.request(`/api/ideas/jobs/${encodeURIComponent(jobId)}/cancel`, { method: "POST", body: JSON.stringify({}) });
  }
  getIdeaDrafts(): Promise<{ drafts: any[] }> {
    return this.request("/api/ideas/drafts");
  }
  createCustomIdea(promptText: string): Promise<{ id: string; needsClarification: boolean; questions: any[] }> {
    return this.request("/api/ideas", { method: "POST", body: JSON.stringify({ promptText }) });
  }
  clarifyCustomIdea(id: string, answers: Record<string, string>): Promise<{ ideaId: string; status: string }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/clarify`, { method: "POST", body: JSON.stringify({ answers }) });
  }
  getIdea(id: string): Promise<{ idea: any }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}`);
  }
  tweakIdea(id: string, data: Record<string, any>): Promise<{ idea: any }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/tweak`, { method: "POST", body: JSON.stringify(data) });
  }
  rescoreIdea(id: string): Promise<{ before: any; after: any }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/rescore`, { method: "POST", body: JSON.stringify({}) });
  }
  getIdeaEvidence(id: string): Promise<{ title: string; evidence: any[] }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/evidence`);
  }
  getIdeaCompetitors(id: string): Promise<{ title: string; competitors: any[] }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/competitors`);
  }
  getNextIdea(afterId: string): Promise<{ id: string; title: string; generatedFresh: boolean }> {
    return this.request(`/api/ideas/next?after=${encodeURIComponent(afterId)}`);
  }
  approveIdea(id: string): Promise<{ companyId: string; runId: string }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/approve`, { method: "POST", body: JSON.stringify({}) });
  }
  rejectIdea(id: string): Promise<{ rejected: boolean; id: string }> {
    return this.request(`/api/ideas/${encodeURIComponent(id)}/reject`, { method: "POST", body: JSON.stringify({}) });
  }

  // --- LEGACY PHASE B/C/D METHODS (retained until Phases B-D rebuild) ---
  getStreamUrl(): string {
    return `${this.baseUrl}/api/stream`;
  }
  async surpriseMe(req: any = {}): Promise<any> {
    return this.request("/api/ideas/surprise", { method: "POST", body: JSON.stringify(req) });
  }
  async clarify(req: any): Promise<any> {
    return this.request("/api/ideas/clarify", { method: "POST", body: JSON.stringify(req) });
  }
  async validate(req: any): Promise<any> {
    return this.request("/api/ideas/validate", { method: "POST", body: JSON.stringify(req) });
  }
  async getNextCandidate(currentId?: string): Promise<any> {
    return this.request(`/api/ideas/next-candidate${currentId ? `?currentId=${currentId}` : ""}`);
  }
  async tweak(id: string, modifications: any): Promise<any> {
    return this.request(`/api/ideas/${id}/tweak`, { method: "POST", body: JSON.stringify({ modifications }) });
  }
  async approve(id: string, userNotes?: string): Promise<any> {
    return this.request(`/api/ideas/${id}/approve`, { method: "POST", body: JSON.stringify({ userNotes }) });
  }
  async getPainPoints(): Promise<any> {
    return this.request("/api/research/pain-points").catch(() => ({ painPoints: [], sourcesScanned: [], total: 0 }));
  }
  async getTasks(filter?: string): Promise<any> {
    return this.request(`/api/tasks${filter ? `?filter=${filter}` : ""}`);
  }
  async createTask(payload: any): Promise<any> {
    return this.request("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
  }
  async approveTask(id: string): Promise<any> {
    return this.request(`/api/tasks/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
  }
  async cancelTask(id: string): Promise<any> {
    return this.request(`/api/tasks/${id}/cancel`, { method: "POST", body: JSON.stringify({}) });
  }
  async retryTask(id: string): Promise<any> {
    return this.request(`/api/tasks/${id}/retry`, { method: "POST", body: JSON.stringify({}) });
  }
  async getDocuments(): Promise<any> {
    return this.request("/api/documents");
  }
  async sendEmailOutreach(payload: any, _extra?: any): Promise<any> {
    return this.request("/api/email/send", { method: "POST", body: JSON.stringify(payload) });
  }
  async postTweet(payload: any, _extra?: any): Promise<any> {
    return this.request("/api/social/post", { method: "POST", body: JSON.stringify(payload) });
  }
  async deployAds(payload: any): Promise<any> {
    return this.request("/api/ads/deploy", { method: "POST", body: JSON.stringify(payload) });
  }
  async generateMedia(payload: any): Promise<any> {
    return this.request("/api/media/generate", { method: "POST", body: JSON.stringify(payload) });
  }
  async chatWithCompanion(payload: any, _extra?: any): Promise<any> {
    return this.request("/api/assistant/chat", { method: "POST", body: JSON.stringify(payload) });
  }
  async getReviewAudit(runId: string = "latest"): Promise<any> {
    return this.request(`/api/review/${runId}`);
  }
  async approveReview(runId: string = "latest"): Promise<any> {
    return this.request(`/api/review/${runId}/approve`, { method: "POST", body: JSON.stringify({}) });
  }
  async exportReviewAudit(runId: string = "latest"): Promise<any> {
    return this.request(`/api/review/${runId}/export`);
  }
  async getDeployments(): Promise<any> {
    return this.request("/api/deployments");
  }
  async triggerDeployment(payload: any): Promise<any> {
    return this.request("/api/deployments/trigger", { method: "POST", body: JSON.stringify(payload) });
  }
  async rollbackDeployment(id: string): Promise<any> {
    return this.request(`/api/deployments/${id}/rollback`, { method: "POST", body: JSON.stringify({}) });
  }
  async triggerBuild(idea: any): Promise<any> {
    return this.request("/api/runtime/build", { method: "POST", body: JSON.stringify({ idea }) });
  }
  async cancelBuild(runId: string = "latest"): Promise<any> {
    return this.request(`/api/runtime/runs/${runId}/cancel`, { method: "POST", body: JSON.stringify({}) });
  }
  async toggleCompanyAutoRun(id: string, enabled?: boolean): Promise<any> {
    return this.request(`/api/companies/${id}/auto-run`, { method: "POST", body: JSON.stringify({ enabled }) });
  }
  async toggleCompanyNightTasks(id: string, enabled?: boolean): Promise<any> {
    return this.request(`/api/companies/${id}/night-tasks`, { method: "POST", body: JSON.stringify({ enabled }) });
  }
  async getDeployStatus(id: string = "latest"): Promise<any> {
    return this.request(`/api/deployments/${id}`);
  }
  async completeDeploy(id: string = "latest"): Promise<any> {
    return this.request(`/api/deployments/${id}/complete`, { method: "POST", body: JSON.stringify({}) });
  }
  async cancelDeploy(id: string = "latest"): Promise<any> {
    return this.request(`/api/deployments/${id}/cancel`, { method: "POST", body: JSON.stringify({}) });
  }
  async getBuilds(): Promise<any> {
    return this.request("/api/builds");
  }
  getRuntimeRun(runId: string): Promise<any> {
    return this.request(`/api/runtime/runs/${encodeURIComponent(runId)}`);
  }
}

export const api = new StudioApiClient();
