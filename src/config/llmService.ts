import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

import dotenv from "dotenv";
import { TaskType } from "@google/generative-ai";
dotenv.config();

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 800,
});

export async function convertToEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
      dimensions: 1024,
    });
    const [embedding] = await embedder.embedDocuments([text]);
    return embedding;
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}

export const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-pro",
  temperature: 0.7,
  maxOutputTokens: 800,
});

export async function convertToGeminiEmbedding(
  text: string
): Promise<number[]> {
  try {
    const embedder = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "embedding-001", // Default embedding model for Gemini
      taskType: TaskType.RETRIEVAL_DOCUMENT, // Optional: depends on use case
    });
    const [embedding] = await embedder.embedDocuments([text]);
    return embedding;
  } catch (error) {
    console.error("Gemini Embedding error:", error);
    throw new Error("Failed to generate Gemini embedding");
  }
}
