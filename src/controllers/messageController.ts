import { Request, Response } from "express";
import {
  saveMessageToDb,
  getMessagesBySessionId,
} from "../services/messageService";
// import your OpenAI/GPT client here if available

// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
  try {
    const { session_id, user_id, content } = req.body;
    if (!session_id || !user_id || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Save user message
    const userMessage = await saveMessageToDb({
      session_id,
      user_id,
      role: "user",
      content,
    });

    // Call GPT/OpenAI here (placeholder)
    const assistantReply = `AI reply to: ${content}`; // Replace with real GPT call

    // Save assistant message
    const assistantMessage = await saveMessageToDb({
      session_id,
      user_id,
      role: "assistant",
      content: assistantReply,
    });

    res.status(201).json({ userMessage, assistantMessage });
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
