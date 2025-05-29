import { Request, Response } from "express";
import {
  saveMessageToDb,
  getAllMessagesBySessionId,
  getUnsummaryUserMessageCount,
  getLastTenMessagesMetadataBySessionId,
  markMessagesAsSummarized,
} from "../respository/messageRepository";
import { getAIReply } from "../services/chatAiService";
import { MessageResponse, MessageRequest } from "../types/message";
import {
  extractLightWeightMetadata,
  generateChunkSummary,
  mergeLightWeightMetadataToFullSummary,
} from "../services/metaService";
import {
  addChunkSummary,
  getLatestChunkIndex,
} from "../respository/chunkSummaryRepository";
import { Metadata } from "../types/lightweightMetadata";

// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
  try {
    const { session_id, user_id, content } = req.body;
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

    const { id, content: agentContent, role, created_at } = agentMessage;

    res.status(201).json({ id, agentContent, role, created_at });

    (async () => {
      try {
        // Metadata extraction
        const lightweightMetadata: Metadata = await extractLightWeightMetadata(
          content
        );
        console.log("Lightweight Metadata:", lightweightMetadata);

        // Save user message to database
        const userMessage: MessageResponse = await saveMessageToDb({
          session_id,
          user_id,
          role: "user",
          content,
          metadata: lightweightMetadata,
        });

        // const unsummeredMesssageCount = await getUnsummaryUserMessageCount(
        //   session_id
        // );
        console.log(userMessage.message_index)

        if (
          userMessage.message_index != null &&
          userMessage.message_index % 10 === 0
        ) {
          const rawMessages = await getLastTenMessagesMetadataBySessionId(
            session_id,
            10
          );

          const lastTenMessages: Array<Metadata> = rawMessages.map(
            (msg) => msg.metadata
          );
          const messageIds = rawMessages.map((msg) => msg.id);

          const start_message_id = rawMessages[rawMessages.length - 1]?.id;
          const end_message_id = rawMessages[0]?.id;
          console.log("Last 10 messages:", lastTenMessages);

          // Keep full messages to track start/end IDs

          const mergedata: Metadata =
            await mergeLightWeightMetadataToFullSummary(lastTenMessages);

          //here chunk summary function will b called
          console.log("Merged Metadata:", mergedata);

          // //generate chunk summary
          const chunkSummary = await getLatestChunkIndex(session_id);
          const chunkIndex =
            typeof chunkSummary === "number" ? chunkSummary : 0;
          const newChunkIndex = chunkIndex + 1;
          console.log("New Chunk Index:", newChunkIndex);

          //summary text
          const generatedChunkSummary = await generateChunkSummary(
            mergedata.key_sentence,
            mergedata
          );

        
          const chunkLightWeightMetadata: Metadata =
            await extractLightWeightMetadata(generatedChunkSummary);

          const saveChunkSummary = await addChunkSummary({
            session_id,
            chunk_index: newChunkIndex,
            metadata: chunkLightWeightMetadata,
            start_message_id: userMessage.id,
            end_message_id: userMessage.id,
            summary_text: generatedChunkSummary,
          });
          await markMessagesAsSummarized(messageIds);
        }
      } catch (err) {
        console.error("[postMessage background async]", err);
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
    const messages = await getAllMessagesBySessionId(session_id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
