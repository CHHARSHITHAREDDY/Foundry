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

export interface ModelUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CompletionResult {
  content: string;
  usage: ModelUsage;
}

export interface StructuredResult<T> {
  data: T;
  usage: ModelUsage;
}

export class LlmClient {
  private baseUrl: string;
  private apiKey: string;
  private geminiKey?: string;
  private groqKey?: string;
  private openAiKey?: string;

  private static qwenHealthCheckedAt = 0;
  private static isQwenAlive = false;
  private static lastWarnTime = 0;

  private async isLocalServerAvailable(): Promise<boolean> {
    const now = Date.now();
    if (now - LlmClient.qwenHealthCheckedAt < 15000) {
      return LlmClient.isQwenAlive;
    }
    LlmClient.qwenHealthCheckedAt = now;
    try {
      const probeCtrl = new AbortController();
      const probeTimeout = setTimeout(() => probeCtrl.abort(), 1200);
      const res = await fetch(`${this.baseUrl.replace(/\/+$/, "")}/health`, {
        signal: probeCtrl.signal,
      }).catch(() => null);
      clearTimeout(probeTimeout);
      LlmClient.isQwenAlive = !!(res && res.ok);
      return LlmClient.isQwenAlive;
    } catch {
      LlmClient.isQwenAlive = false;
      return false;
    }
  }

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;

    const provider = (process.env.LLM_PROVIDER || "").toLowerCase();
    const isLocalQwen = provider === "qwen" || provider === "local" || provider === "auto" || process.env.USE_QWEN === "true";

    if (isLocalQwen) {
      this.baseUrl = process.env.QWEN_URL || process.env.INFERENCE_BASE_URL || "http://localhost:8000";
      this.apiKey = process.env.INFERENCE_API_KEY || "local-qwen-key";
    } else if (this.groqKey && !process.env.LITELLM_URL) {
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
    const provider = (process.env.LLM_PROVIDER || "auto").toLowerCase();
    if (provider === "qwen" || provider === "local" || provider === "auto" || process.env.USE_QWEN === "true") {
      return true;
    }
    return !!(
      this.geminiKey ||
      this.groqKey ||
      this.openAiKey ||
      process.env.INFERENCE_API_KEY ||
      process.env.OPENAI_API_KEY
    );
  }

  async completeWithUsage(options: CompletionOptions): Promise<CompletionResult> {
    const provider = (process.env.LLM_PROVIDER || "auto").toLowerCase();
    const useQwen = provider === "qwen" || provider === "local" || provider === "auto" || process.env.USE_QWEN === "true";

    if (useQwen) {
      const isAlive = await this.isLocalServerAvailable();
      if (isAlive) {
        try {
          return await this.callOpenAiCompatible(options);
        } catch (err: any) {
          console.warn(`[LLM] Qwen request failed (${err?.message || err}), falling back to Gemini...`);
        }
      } else {
        if (this.geminiKey) {
          const now = Date.now();
          if (now - LlmClient.lastWarnTime > 60000) {
            console.log(`⚡ [LLM] Local Qwen server not running at ${this.baseUrl}. Using Gemini (Start Qwen anytime with '.\\start-qwen.bat' for $0 cost).`);
            LlmClient.lastWarnTime = now;
          }
        }
      }
    }

    if (this.geminiKey) {
      try {
        return await this.callGemini(options);
      } catch (err: any) {
        console.warn(`[LLM] Gemini call failed (${err?.message || err}), falling back to Qwen / OpenAI gateway...`);
        return this.callOpenAiCompatible(options);
      }
    }
    return this.callOpenAiCompatible(options);
  }

  async complete(options: CompletionOptions): Promise<string> {
    const res = await this.completeWithUsage(options);
    return res.content;
  }

  async completeStructured<T>(
    options: CompletionOptions,
    schema: z.ZodType<T>
  ): Promise<StructuredResult<T>> {
    const systemPrompt = `You MUST return your response as a valid, well-formed JSON object or array conforming to the requested schema. Do NOT include any explanations, greetings, or markdown fences outside the JSON.`;
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...options.messages,
    ];

    const { content: raw, usage } = await this.completeWithUsage({
      ...options,
      messages,
      jsonMode: true,
    });

    const data = parseStructuredOutput(raw, schema);
    return { data, usage };
  }

  private async callOpenAiCompatible(options: CompletionOptions): Promise<CompletionResult> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/v1/chat/completions`;
    const controller = new AbortController();
    const timeoutMs = parseInt(process.env.QWEN_TIMEOUT_MS || "180000", 10);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let modelName = options.tier as string;
    const provider = (process.env.LLM_PROVIDER || "").toLowerCase();
    const isQwen = provider === "qwen" || provider === "local" || process.env.USE_QWEN === "true" || this.baseUrl.includes("8000") || this.baseUrl.includes("11434");

    if (isQwen) {
      modelName = process.env.INFERENCE_MODEL || "Qwen2.5-Coder-7B-Instruct";
    } else if (this.groqKey && this.baseUrl.includes("groq.com")) {
      modelName =
        options.tier === "reasoner" || options.tier === "coder"
          ? "llama-3.3-70b-versatile"
          : "llama-3.1-8b-instant";
    } else if (this.openAiKey && this.baseUrl.includes("openai.com")) {
      modelName =
        options.tier === "reasoner" || options.tier === "coder"
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
      const content = data.choices[0]?.message?.content || "";

      const promptTokens =
        data.usage?.prompt_tokens ?? Math.ceil(JSON.stringify(options.messages).length / 4);
      const completionTokens =
        data.usage?.completion_tokens ?? Math.ceil(content.length / 4);

      const usage: ModelUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      };

      return { content, usage };
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error(`LLM request timed out after ${Math.round(timeoutMs / 1000)}s for tier ${options.tier}`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callGemini(options: CompletionOptions): Promise<CompletionResult> {
    const candidateModels = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.8-flash"];

    const systemMessages = options.messages.filter((m) => m.role === "system");
    const nonSystemMessages = options.messages.filter((m) => m.role !== "system");

    const systemInstruction =
      systemMessages.length > 0
        ? {
            parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
          }
        : undefined;

    let contents = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents = [{ role: "user", parts: [{ text: "Proceed." }] }];
    }

    let lastError: Error | null = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction,
            contents,
            generationConfig: {
              temperature: options.temperature ?? 0.2,
              maxOutputTokens: options.maxTokens ?? 8192,
              responseMimeType: options.jsonMode ? "application/json" : undefined,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If model is overloaded (503) or not found (404), fall back to next model candidate
          if (response.status === 503 || response.status === 404) {
            lastError = new Error(`Gemini API error ${response.status} for ${model}: ${errorText}`);
            continue;
          }
          throw new Error(`Gemini API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const promptTokens =
          data.usageMetadata?.promptTokenCount ?? Math.ceil(JSON.stringify(options.messages).length / 4);
        const completionTokens =
          data.usageMetadata?.candidatesTokenCount ?? Math.ceil(content.length / 4);

        const usage: ModelUsage = {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        };

        return { content, usage };
      } catch (err: any) {
        lastError = err;
        if (err.message && (err.message.includes("503") || err.message.includes("404"))) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Failed to execute Gemini completion across candidate models.");
  }
}

export const llmClient = new LlmClient();
export const llmGateway = llmClient;
