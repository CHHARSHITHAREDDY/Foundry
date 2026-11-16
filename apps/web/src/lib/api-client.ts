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

  async surpriseMe(req: SurpriseMeRequest = {}): Promise<SurpriseMeResponse> {
    const res = await fetch(`${this.baseUrl}/api/ideas/surprise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
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

  async triggerRun(ideaId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId }),
    });
    if (!res.ok) throw new Error(`Trigger run failed: ${await res.text()}`);
    return res.json();
  }
}

export const api = new StudioApiClient();
