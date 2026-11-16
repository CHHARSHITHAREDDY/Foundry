import { TypedHttpClient } from "@venture-studio/service-kit";
import { IdeaBrief } from "@venture-studio/contracts";
import { z } from "zod";

export class AgentRuntimeClient {
  private http: TypedHttpClient;

  constructor(baseUrl: string = process.env.AGENT_RUNTIME_URL || "http://localhost:3006") {
    this.http = new TypedHttpClient({ baseUrl, timeoutMs: 120000 });
  }

  async triggerBuild(idea: IdeaBrief): Promise<any> {
    return this.http.post("/build", idea, z.any());
  }
}

