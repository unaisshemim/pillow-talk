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
