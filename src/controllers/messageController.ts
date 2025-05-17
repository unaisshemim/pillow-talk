import { Request, Response } from "express";
import {
  saveMessageToDb,
  getMessagesBySessionId,
} from "../respository/messageService";
import { getAIReply } from "../services/chatAiService";
import { Message } from "../types/message";


// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
  try {
    const { session_id, user_id, content } = req.body;
    console.log("postMessage", { session_id, user_id, content });
    if (!session_id || !user_id || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Save user message
    await saveMessageToDb({
      session_id,
      user_id,
      role: "user",
      content,
    });

    // Call GPT/OpenAI via aiService
    const assistantReply = await getAIReply(content, session_id);

    // Save assistant message
    const agentMessage: Message = await saveMessageToDb({
      session_id,
      user_id,
      role: "agent",
      content: assistantReply,
    });
    const { id, content: agentContent, role, timestamp } = agentMessage;

    res.status(201).json({ id, agentContent, role, timestamp });


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
