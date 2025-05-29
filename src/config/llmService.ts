import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import dotenv from "dotenv";
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
