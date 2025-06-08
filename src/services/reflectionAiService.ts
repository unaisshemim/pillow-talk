import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import { model } from "../config/llmService";

// 1. New user prompt
const newUserPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship coach AI. Generate a thoughtful, open-ended self-reflection question for a new user who is starting their first session. The question should help them explore their feelings, values, or relationship patterns. Avoid yes/no questions. Respond with only the question.`
  ),
  ["human", "Start the session."],
]);

// 2. Previous user prompt (with summary)
const previousUserPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship coach AI. Based on the following summary of the user's previous reflections or sessions, generate a new, open-ended self-reflection question that helps them go deeper or build on their past insights. Avoid yes/no questions. Respond with only the question.`
  ),
  ["human", "{summary}"],
]);

// 3. Partner perspective prompt
const partnerPerspectivePrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship coach AI. Generate a question that encourages the user to reflect on their perspective, feelings, or assumptions about their partner. The question should promote empathy and understanding, not blame. Respond with only the question.`
  ),
  ["human", "Reflect on your partner."],
]);

// Generate a question for a new user
export async function generateNewUserReflectionQuestion(): Promise<string> {
  const chain = RunnableSequence.from([newUserPrompt, model]);
  const response = await chain.invoke({});
  return typeof response.content === "string"
    ? response.content.trim()
    : Array.isArray(response.content)
    ? response.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join(" ")
        .trim()
    : "";
}

// Generate a question for a previous user (with summary)
export async function generatePreviousUserReflectionQuestion(
  summary: string
): Promise<string> {
  const chain = RunnableSequence.from([previousUserPrompt, model]);
  const response = await chain.invoke({ summary });
  return typeof response.content === "string"
    ? response.content.trim()
    : Array.isArray(response.content)
    ? response.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join(" ")
        .trim()
    : "";
}

// Generate a question for partner perspective
export async function generatePartnerPerspectiveReflectionQuestion(): Promise<string> {
  const chain = RunnableSequence.from([partnerPerspectivePrompt, model]);
  const response = await chain.invoke({});
  return typeof response.content === "string"
    ? response.content.trim()
    : Array.isArray(response.content)
    ? response.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join(" ")
        .trim()
    : "";
}

const sentimentPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are an emotional intelligence analyzer for relationship coaching. Analyze the following reflection deeply and respond in this exact flat JSON format (no nested "scores" object):

{
  "summary": "Brief emotional summary...",
  "interpretation": "Deeper interpretation of emotional patterns...",
  "confidence_score": 0.91,
  "version": "v1",
  "self_awareness": 0.85,
  "emotional_expression": 0.76,
  "attachment_secure": 0.6,
  "attachment_anxious": 0.3,
  "attachment_avoidant": 0.1,
  "attachment_fearful": 0.2,
  "communication_empathic": 0.9,
  "communication_aggressive": 0.1,
  "communication_passive": 0.2,
  "conflict_avoidance": 0.2,
  "conflict_confrontation": 0.4,
  "conflict_compromise": 0.8,
  "growth_mindset": 0.7,
  "values_alignment": 0.65,
  "past_patterns_toxic": 0.25,
  "love_language_quality_time": 0.6,
  "love_language_words": 0.8,
  "love_language_touch": 0.7,
  "love_language_gifts": 0.4,
  "love_language_service": 0.5,
  "relationship_expectations": 0.75
}

Ensure all score values are between 0 and 1 (float). Respond only with valid JSON.`
  ),
  ["human", "{answer}"],
]);

export async function analyzeSentiment(answer: string) {
  const chain = RunnableSequence.from([sentimentPrompt, model]);
  const result = await chain.invoke({ answer });

  const content =
    typeof result.content === "string"
      ? result.content
      : JSON.stringify(result.content);
      
  return JSON.parse(content);
}
