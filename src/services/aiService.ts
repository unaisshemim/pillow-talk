import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 200,
});

// In-memory store for session memory (for demo; use DB for production)
const sessionMemories: Record<string, BufferMemory> = {};

export async function getAIReply(
  userMessage: string,
  session_id: string
): Promise<string> {
  try {
    // Use a separate memory for each session
    if (!sessionMemories[session_id]) {
      sessionMemories[session_id] = new BufferMemory();
    }
    const memory = sessionMemories[session_id];
    const chain = new ConversationChain({ llm: model, memory });
    const response = await chain.call({ input: userMessage });
    return response.response || "";
  } catch (error) {
    console.error("LangChain error:", error);
    return "Sorry, I couldn't process your request right now.";
  }
}
