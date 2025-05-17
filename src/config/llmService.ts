import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import dotenv from "dotenv";
dotenv.config();

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 200,
});

export async function convertToEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const [embedding] = await embedder.embedDocuments([text]);
    return embedding;
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}
