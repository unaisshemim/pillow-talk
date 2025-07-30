import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import { model } from "../config/llmService";
import { cleanJsonResponse } from "../helpers/cleanJson";

/**
 * Generate a merged story/summary, tone, topics, and suggestions from two session summaries.
 * @param summaryA string (first partner's summary)
 * @param summaryB string (second partner's summary)
 * @returns JSON: { merged_summary, tone, topics, suggestions }
 */
export async function generateSessionStoryReport(
  summaryA: string,
  summaryB: string
) {
  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      `You are a relationship therapist AI. Two partners have completed private reflection sessions. Here are their summaries:\n\nPartner A summary:\n{summaryA}\n\nPartner B summary:\n{summaryB}\n\nPlease provide:\n- A merged story or summary (neutral, emotionally intelligent, 200-300 words)\n- The emotional tone for each partner (as JSON: {\"partnerA\": \"...\", \"partnerB\": \"...\"})\n- Key topics of discussion/conflict (string array)\n- 2-3 actionable suggestions for the couple (as a single string)\n\nRespond in this JSON format:\n{\n  "merged_summary": "...",\n  "tone": {"partnerA": "...", "partnerB": "..."},\n  "topics": ["...", "..."],\n  "suggestions": "..."\n}`
    ),
    ["human", "{summaryA}\n{summaryB}"],
  ]);

  const chain = RunnableSequence.from([prompt, model]);
  const response = await chain.invoke({ summaryA, summaryB });
  let text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .map((part: any) =>
            typeof part === "string" ? part : part.text || ""
          )
          .join(" ")
      : "";
  text = cleanJsonResponse(text);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse LLM session report JSON: " + text);
  }
}
