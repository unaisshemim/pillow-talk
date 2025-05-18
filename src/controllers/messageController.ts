import { Request, Response } from "express";
import {
  saveMessageToDb,
  getMessagesBySessionId,
} from "../respository/messageRepository";
import { getAIReply } from "../services/chatAiService";
import { MessageResponse, MessageRequest } from "../types/message";
import { extractLightWeightMetadata } from "../services/metaService";
import {
  addChunkSummary,
  getLatestChunkIndex,
} from "../respository/chunkSummaryRepository";
import { Metadata } from "../types/lightweightMetadata";

// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
  try {
    const { session_id, user_id, content } = req.body;
    console.log("postMessage", { session_id, user_id, content });
    if (!session_id || !user_id || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Save user message

    // Call GPT/OpenAI via aiService
    const assistantReply = await getAIReply(content, session_id);

    // Save assistant message
    const agentMessage: MessageResponse = await saveMessageToDb({
      session_id,
      user_id,
      role: "agent",
      content: assistantReply,
    });

    const { id, content: agentContent, role, timestamp } = agentMessage;

    res.status(201).json({ id, agentContent, role, timestamp });

    void (async () => {
      // Metadata extraction
      const lightweightMetadata: Metadata = await extractLightWeightMetadata(
        content
      );
      // Save user message to database
      await saveMessageToDb({
        session_id,
        user_id,
        role: "user",
        content,
        metadata: lightweightMetadata,
      });

      // Get all messages for this session
      const allMessages = await getMessagesBySessionId(session_id);
      // Only consider messages with metadata (i.e., user messages)
      const userMessagesWithMeta = allMessages.filter(
        (msg: any) => msg.role === "user" && msg.metadata
      );

      // If we have a multiple of 10 user messages, generate a chunk summary
      if (
        userMessagesWithMeta.length > 0 &&
        userMessagesWithMeta.length % 10 === 0
      ) {
        // Pull metadata from the last 10 messages
        const last10Metas = userMessagesWithMeta
          .slice(-10)
          .map((msg: any) => msg.metadata);
        // Import merge and summary functions
        const { mergeLightWeightMetadataToFullSummary, generateChunkSummary } =
          await import("../services/metaService");
        // Merge metadata into a summary string
        const mergedMeta = await mergeLightWeightMetadataToFullSummary(
          last10Metas
        );
        // Optionally, concatenate the last 10 message contents for context
        const last10Contents = userMessagesWithMeta
          .slice(-10)
          .map((msg: any) => msg.content)
          .join("\n");
        // Generate a GPT-based summary
        const gptSummary = await generateChunkSummary({
          fulltext: last10Contents,
          meta: mergedMeta,
        });
        // Get the latest chunk index and increment for the new chunk
        const latestChunkIndex = await getLatestChunkIndex(session_id);
        const newChunkIndex =
          (typeof latestChunkIndex === "number" ? latestChunkIndex : 0) + 1;
        // Save chunk summary to database
        const chunkSummary = await addChunkSummary({
          session_id,
          chunk_index: newChunkIndex,
          metadata: {
            topics: last10Metas.flatMap((m: any) => m.topics),
            tone: last10Metas.map((m: any) => m.tone).join(", "),
            key_sentence: gptSummary,
          },
        });
        console.log("chunkSummary (10 messages)", chunkSummary);
      }
    })();
  } catch (error) {
    res.status(500).json({ error: "Failed to process message" });
  }
};

// GET /api/messages/:session_id
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }
    const messages = await getMessagesBySessionId(session_id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
