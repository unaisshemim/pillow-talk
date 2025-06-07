import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { convertToEmbedding, model } from "../config/llmService";
import { Metadata } from "../types/lightweightMetadata";
import { cleanJsonResponse } from "../helpers/cleanJson";
import { Meta } from "@langchain/langgraph/dist/graph/zod/state";
// import { pinecone } from "../config/pineconeClient";
dotenv.config();

const lightmetaPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a JSON metadata extractor. Given a single user message:
- Extract 1–3 key topics (as lowercase single words or short phrases)
- Identify the emotional tone (e.g., "anxious", "angry", "hopeful", "neutral")
- Pick the most important sentence in the message

Respond ONLY as strict JSON. Do NOT include markdown, \`json\`, or code blocks. Just return:
{
  "topics": ["..."],
  "tone": "...",
  "key_sentence": "..."
}

If you're unsure, do your best — never leave fields empty.
`
  ),
  ["human", "{text}"],
]);

export async function extractLightWeightMetadata(
  text: string
): Promise<Metadata> {
  const chain = RunnableSequence.from([lightmetaPrompt, model]);
  const response = await chain.invoke({ text });
  let rawContent = response.content;

  try {
    // If string, clean and parse
    if (typeof rawContent === "string") {
      const cleaned = cleanJsonResponse(rawContent);
      const parsed: Metadata = JSON.parse(cleaned);

      return parsed;
    }

    // If it's array of parts (LLM streaming case), join and parse
    if (Array.isArray(rawContent)) {
      const joined = rawContent
        .map((part: any) =>
          typeof part === "string" ? part : part?.text || ""
        )
        .join(" ");
      const cleaned = cleanJsonResponse(joined);
      const parsed: Metadata = JSON.parse(cleaned);

      return parsed;
    }

    throw new Error("Unexpected response content format");
  } catch (e) {
    console.error("❌ Failed to parse meta extraction response:", rawContent);
    throw new Error("Meta extraction failed");
  }
}
// Merge an array of lightweight metadata objects into a single summary string

//plan to move this to a separate file
export async function mergeLightWeightMetadataToFullSummary(
  metas: Array<Metadata>
): Promise<Metadata> {
  // Maintain original order (first to last)
  const allTopics = Array.from(new Set(metas.flatMap((meta) => meta.topics)));
  const allTones = Array.from(new Set(metas.map((meta) => meta.tone)));
  const keySentences = metas
    .map((meta) => meta.key_sentence)
    .filter(Boolean)
    .reverse(); // Reverse again since Supabase returns latest first

  return {
    topics: allTopics,
    tone: allTones.join(", "),
    key_sentence: keySentences.join(","),
  };
}

// Convert metadata to an embedding using aiService
export async function convertMetaDataToEmbeddingInput(meta: {
  topics: string[];
  tone: string;
  key_sentence: string;
}): Promise<number[]> {
  const text = `Topics: ${meta.topics.join(", ")}. Tone: ${
    meta.tone
  }. Key sentence: ${meta.key_sentence}`;
  return await convertToEmbedding(text);
}

// Save an embedding to the DB (assumes you have an embeddings table)
// Save an embedding to Pinecone (vector DB)

// Prompt and function to generate a final summary of 300 words
const finalSummaryPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship AI coach. Given the following chat and metadata, return a JSON object with:

1. "report" (string): A clear, emotionally intelligent summary of the overall conversation in under 300 words.
2. "metadata" (object):
   - "topics" (string[]): Key recurring discussion themes (e.g., "trust", "household chores", "emotional distance").
   - "tone" (string): Overall emotional tone (e.g., "tense", "hopeful", "detached").
   - "key_sentence" (string): The most emotionally revealing or pivotal sentence spoken.
3. "advice" (string): A constructive, growth-oriented suggestion for moving forward.

### Respond ONLY in valid JSON. Ensure no string is cut off mid-sentence. Wrap up "advice" clearly. Do not use triple backticks.
Limit your total output to ~800 tokens max.
.`
  ),
  ["human", "{summary}\n"],
]);

export interface FinalSummary {
  report: string;
  metadata: Metadata;
  advice: string;
}

export async function generateFinalSummary(
  summary: string
): Promise<FinalSummary> {
  try {
    const chain = RunnableSequence.from([finalSummaryPrompt, model]);
    const response = await chain.invoke({ summary });

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
      return JSON.parse(text) as FinalSummary;
    } catch (err) {
      console.error("❌ JSON parse failed. Raw output:", text);
      throw err;
    }
  } catch (error) {
    console.error("❌ Failed to generate final summary:", error);
    throw new Error("Final summary generation failed");
  }
}

// Prompt and function to generate a chunk summary (short, focused, for every 10 messages)
const chunkSummaryPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship AI coach. Given the following 10 chat messages and their extracted metadata, write a concise (3-5 sentence) summary that captures the main topics, emotional tones, and any key moments or shifts. Be neutral and factual. Respond ONLY with the summary text.`
  ),
  ["human", "{fulltext}\n\nMetadata: {meta}"],
]);

export async function generateChunkSummary(
  fulltext: string,
  meta: Metadata
): Promise<string> {
  const chain = RunnableSequence.from([chunkSummaryPrompt, model]);
  const response = await chain.invoke({ fulltext, meta });
  if (typeof response.content === "string") {
    return response.content;
  } else if (Array.isArray(response.content)) {
    return response.content
      .map((part: any) => (typeof part === "string" ? part : part.text || ""))
      .join(" ");
  }
  return "";
}
