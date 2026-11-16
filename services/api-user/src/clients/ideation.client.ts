import { TypedHttpClient } from "@venture-studio/service-kit";
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
import { z } from "zod";

export class IdeationClient {
  private http: TypedHttpClient;

  constructor(baseUrl: string = process.env.IDEATION_URL || "http://localhost:3003") {
    this.http = new TypedHttpClient({ baseUrl });
  }

  async surpriseMe(req: SurpriseMeRequest): Promise<SurpriseMeResponse> {
    return this.http.post("/ideas/surprise", req, SurpriseMeResponseSchema);
  }

  async clarify(req: ClarifyIdeaRequest): Promise<ClarifyIdeaResponse> {
    return this.http.post("/ideas/clarify", req, ClarifyIdeaResponseSchema);
  }

  async validate(req: ValidateIdeaRequest): Promise<ValidateIdeaResponse> {
    return this.http.post("/ideas/validate", req, ValidateIdeaResponseSchema);
  }

  async getIdea(id: string): Promise<IdeaBrief> {
    return this.http.get(`/ideas/${id}`, IdeaBriefSchema);
  }

  async getNextCandidate(currentId?: string): Promise<IdeaBrief> {
    const query = currentId ? `?currentId=${currentId}` : "";
    return this.http.get(`/ideas/next-candidate${query}`, IdeaBriefSchema);
  }

  async tweak(id: string, modifications: any): Promise<IdeaBrief> {
    return this.http.post(`/ideas/${id}/tweak`, { modifications }, IdeaBriefSchema);
  }

  async approve(id: string, userNotes?: string): Promise<IdeaBrief> {
    return this.http.post(`/ideas/${id}/approve`, { userNotes }, IdeaBriefSchema);
  }
}
