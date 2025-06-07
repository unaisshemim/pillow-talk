import { RunnableSequence } from "@langchain/core/runnables";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { geminiModel, model } from "../config/llmService";

dotenv.config();

// In-memory store for session memory (for demo; use DB for production)
const sessionMemories: Record<string, BufferMemory> = {};

const useGemini = false;
const llmModel = useGemini ? geminiModel : model;

// Relationship therapist system message
const therapistPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship therapist. Respond with short, clear, emotionally intelligent guidance.
Keep responses to 2–4 sentences.
Avoid repeating what the user already said.
Be warm, supportive, and direct.
Ask thoughtful questions when appropriate, and encourage reflection or small next steps.
Avoid generic filler like "relationships take work" unless it’s necessary.`
  ),
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

export async function getAIReply(
  userMessage: string,
  session_id: string
): Promise<string> {
  try {
    if (!sessionMemories[session_id]) {
      sessionMemories[session_id] = new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
      });
    }
    const memory = sessionMemories[session_id];

    // Use RunnableSequence instead of ConversationChain
    const chain = RunnableSequence.from([therapistPrompt, llmModel]);

    // Get chat history from memory
    const chatHistory = await memory.loadMemoryVariables({});
    const input = {
      input: userMessage,
      history: chatHistory.history || [],
    };
    const response = await chain.invoke(input);
    // Save the new message to memory
    await memory.saveContext(
      { input: userMessage },
      { output: response.content }
    );

    // response.content may be a string or array (MessageContentComplex[])
    let reply = "";
    if (typeof response.content === "string") {
      reply = response.content;
    } else if (Array.isArray(response.content)) {
      // Concatenate all string parts from the array
      reply = response.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join(" ");
    }
    return reply;
  } catch (error) {
    console.error("LangChain error:", error);
    return "Sorry, I couldn't process your request right now.";
  }
}

// Convert text to embedding using OpenAI
