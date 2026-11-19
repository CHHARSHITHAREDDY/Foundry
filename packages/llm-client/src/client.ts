import { ModelTier } from "./tiers.js";
import { parseStructuredOutput } from "./structured-output.js";
import { z } from "zod";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  tier: ModelTier;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export class LlmClient {
  private baseUrl: string;
  private apiKey: string;
  private geminiKey?: string;
  private groqKey?: string;
  private openAiKey?: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;

    if (this.groqKey && !process.env.LITELLM_URL) {
      this.baseUrl = "https://api.groq.com/openai";
      this.apiKey = this.groqKey;
    } else if (this.openAiKey && !process.env.LITELLM_URL) {
      this.baseUrl = "https://api.openai.com";
      this.apiKey = this.openAiKey;
    } else {
      this.baseUrl = process.env.LITELLM_URL || process.env.INFERENCE_BASE_URL || "http://localhost:4000";
      this.apiKey = process.env.LITELLM_MASTER_KEY || process.env.INFERENCE_API_KEY || "sk-local-dev";
    }
  }

  isConfigured(): boolean {
    return !!(
      this.geminiKey ||
      this.groqKey ||
      this.openAiKey ||
      process.env.INFERENCE_API_KEY ||
      process.env.OPENAI_API_KEY
    );
  }

  async complete(options: CompletionOptions): Promise<string> {
    // 1. Direct Google Gemini API
    if (this.geminiKey) {
      return this.callGemini(options);
    }

    // 2. Default: Call OpenAI-compatible endpoint (LiteLLM, Groq, OpenAI, Ollama)
    return this.callOpenAiCompatible(options);
  }

  async completeStructured<T>(options: CompletionOptions, schema: z.ZodType<T>): Promise<T> {
    const systemPrompt = `You MUST return your response as a valid, well-formed JSON object or array conforming to the requested schema. Do NOT include any explanations, greetings, or markdown fences outside the JSON.`;
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...options.messages,
    ];

    const raw = await this.complete({
      ...options,
      messages,
      jsonMode: true,
    });

    return parseStructuredOutput(raw, schema);
  }

  private async callOpenAiCompatible(options: CompletionOptions): Promise<string> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/v1/chat/completions`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    // Resolve model name based on provider
    let modelName = options.tier as string;
    if (this.groqKey && this.baseUrl.includes("groq.com")) {
      modelName = options.tier === "reasoner" || options.tier === "coder"
        ? "llama-3.3-70b-versatile"
        : "llama-3.1-8b-instant";
    } else if (this.openAiKey && this.baseUrl.includes("openai.com")) {
      modelName = options.tier === "reasoner" || options.tier === "coder"
        ? "gpt-4o"
        : "gpt-4o-mini";
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: options.messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 4000,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM Error ${response.status} from ${url}: ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(`LLM request timed out after 60s for tier ${options.tier}`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callGemini(options: CompletionOptions): Promise<string> {
    const model = options.tier === "reasoner" || options.tier === "coder"
      ? "gemini-2.0-flash"
      : "gemini-2.0-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;

    const contents = options.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 4000,
          responseMimeType: options.jsonMode ? "application/json" : undefined,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}

export const llmClient = new LlmClient();
export const llmGateway = llmClient;
