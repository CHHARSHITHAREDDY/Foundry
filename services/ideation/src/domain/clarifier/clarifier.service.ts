import { LlmClient } from "@venture-studio/llm-client";
import { ClarifierResult, ClarifierQuestion } from "@venture-studio/contracts";
import { z } from "zod";

const ClarifierOutputSchema = z.object({
  needsClarification: z.boolean(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      context: z.string().optional(),
      options: z.array(z.string()).optional(),
      targetGap: z.enum(["customer", "problem", "pricing", "scope", "geography"]),
    })
  ).max(3),
  clarifiedIdea: z.string().optional(),
});

export class ClarifierService {
  private llm: LlmClient;

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  async clarify(rawIdea: string, userAnswers?: Record<string, string>): Promise<ClarifierResult> {
    const answersContext = userAnswers
      ? `\nPREVIOUS QUESTIONS AND USER ANSWERS:\n${Object.entries(userAnswers)
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join("\n")}`
      : "";

    const prompt = `You are a Clarifier Agent (Fast Tier) for an autonomous venture studio.
A user has submitted an idea for a software product:
"${rawIdea}"${answersContext}

YOUR MISSION:
Evaluate if the idea has critical gaps in:
1. Target Customer (who pays/uses it?)
2. Core Problem (what exact workflow is broken?)
3. Scope/Geography (is it localized, e.g. EU VAT, US taxes, or global?)

RULES:
- If the idea is already specific enough to validate, set "needsClarification": false and "questions": [].
- If critical gaps exist, return AT MOST 2 to 3 concise, multiple-choice questions.
- NEVER ask more than 3 questions.
- If answers are provided and sufficient, synthesize the final "clarifiedIdea" and set "needsClarification": false.`;

    try {
      return await this.llm.completeStructured(
        {
          tier: "fast",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        },
        ClarifierOutputSchema
      );
    } catch {
      // Deterministic fallback if LLM offline
      if (rawIdea.length < 20) {
        return {
          needsClarification: true,
          questions: [
            {
              id: "q_customer",
              question: "Who is the primary customer for this tool?",
              options: ["Solo Founders / Indie Hackers", "Agencies & Freelancers", "E-commerce Stores", "Internal Developer Teams"],
              targetGap: "customer",
            },
            {
              id: "q_problem",
              question: "What is the primary manual action this software replaces?",
              options: ["Manual data entry & spreadsheets", "Manual monitoring / checking websites", "Repetitive copywriting & distribution", "Invoice and payment reconciliations"],
              targetGap: "problem",
            },
          ],
        };
      }
      return {
        needsClarification: false,
        questions: [],
        clarifiedIdea: rawIdea,
      };
    }
  }
}
