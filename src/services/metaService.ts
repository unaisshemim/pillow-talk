import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { convertToEmbedding, model } from "../config/llmService";
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
const metadataStore: any[] = [];

export async function extractLightWeightMetadata(
  text: string
): Promise<Array<{ topics: string[]; tone: string; key_sentence: string }>> {
  const chain = RunnableSequence.from([lightmetaPrompt, model]);
  const response = await chain.invoke({ text });

  // Try to parse the response as JSON
  try {
    let raw = response.content;

    // Normalize: remove ```json or ``` wrappers
    if (typeof raw === "string") {
      raw = raw
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
      const parsed = JSON.parse(raw);
      metadataStore.push(parsed);
      console.log("hellow");

      console.log("metadataStore", metadataStore);

      return parsed;
    }

    if (Array.isArray(response.content)) {
      const joined = response.content
        .map((part: any) => (typeof part === "string" ? part : part.text || ""))
        .join(" ")
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      const parsed = JSON.parse(joined);
      metadataStore.push(parsed);
      console.log("hellow");

      console.log("metadataStore", metadataStore);

      return parsed;
    }
  } catch (e) {
    console.error(
      "Failed to parse meta extraction response:",
      response.content
    );
    throw new Error("Meta extraction failed");
  }
  throw new Error("Meta extraction failed");
}

// Merge an array of lightweight metadata objects into a single summary string
export async function mergeLightWeightMetadataToFullSummary(
  metas: Array<{ topics: string[]; tone: string; key_sentence: string }>
): Promise<string> {
  // Simple merge: join topics, tones, and key sentences
  const allTopics = Array.from(new Set(metas.flatMap((meta) => meta.topics)));
  const allTones = Array.from(new Set(metas.map((meta) => meta.tone)));
  const keySentences = metas.map((meta) => meta.key_sentence).filter(Boolean);
  return `Topics: ${allTopics.join(", ")}. Tones: ${allTones.join(
    ", "
  )}. Key sentences: ${keySentences.join(" ")}`;
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

// export async function saveEmbeddingToDb({
//   session_id,
//   embedding,
//   meta,
// }: {
//   session_id: string;
//   embedding: number[];
//   meta: any;
// }) {
//   // Index name should match your Pinecone setup
//   const index = pinecone.index(process.env.PINECONE_INDEX!);
//   await index.upsert([
//     {
//       id: session_id,
//       values: embedding,
//       metadata: meta,
//     },
//   ]);
//   return { success: true };
// }

// Prompt and function to generate a final summary of 300 words
const finalSummaryPrompt = ChatPromptTemplate.fromMessages([
  new SystemMessage(
    `You are a relationship AI coach. Given the following chat and metadata, write a clear, emotionally intelligent, and actionable summary for the user(s) in 300 words or less. Focus on the main issues, emotional tones, and key moments. End with a positive, growth-oriented suggestion. Respond ONLY with the summary text.`
  ),
  ["human", "{fulltext}\n\nMetadata: {meta}"],
]);

export async function generateFinalSummary({
  fulltext,
  meta,
}: {
  fulltext: string;
  meta: string;
}): Promise<string> {
  const chain = RunnableSequence.from([finalSummaryPrompt, model]);
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
