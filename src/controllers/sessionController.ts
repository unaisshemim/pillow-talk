import { Request, Response } from "express";
import {
  createSessionInDb,
  completeSessionInDb,
  getSessionsByUserId,
  getSessionById,
  deleteSessionById,
  getSessionsByLobbyId,
  getSessionIdByUserId,
  getUserIdBySessionId,
} from "../respository/sessionRepository";
import { SessionRole } from "../enums/sessionRole";
import { Lobby } from "../types/lobby";
import { getLobbyByUserId } from "../respository/lobbyRepository";
import {
  getChunksBySessionId,
  markChunksAsSummarized,
} from "../respository/chunkSummaryRepository";
import { mergeSummaryText } from "../helpers/mergeSummary";
import { ChunkSummaryWithId } from "../types/chunkSummary";
import { generateFinalSummary } from "../services/metaService";
import { convertToEmbedding } from "../config/llmService";
import { upsertFinalSummaryToPineCone } from "../respository/pineconeRepository";

// POST /session/start
export const startSession = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const lobby: Lobby = await getLobbyByUserId(user_id);

    // Determine role based on user_id's position in the lobby
    let role: SessionRole;
    let lobby_id = lobby.id;
    if (!lobby_id) {
      role = SessionRole.SOLO;
    } else {
      lobby_id = lobby.id;
      role = SessionRole.PARTNER;
    }

    const session = await createSessionInDb({ lobby_id, user_id, role });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to create session" });
  }
};

type finalSummary = {
  report: string;
  metadata: {
    topics: string[];
    tone: string;
    key_sentence: string;
  };
  advice: string;
};

// put /session/:sessionId/complete
export const completeSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const userId = await getUserIdBySessionId(sessionId);
    if (!userId) {
      return res.status(400).json({ error: "User ID not found for session" });
    }

    const chunks: Array<ChunkSummaryWithId> = await getChunksBySessionId(
      sessionId
    );
    const chunkIds: string[] = chunks.map((chunk) => chunk.id);
    const mergedSummary: string = mergeSummaryText(chunks).trim();

    if (mergedSummary.length < 30) {
      console.warn("Skipping embedding: merged summary too short.");

      await completeSessionInDb(sessionId, {
        summary: mergedSummary,
        metadata: { topics: [], tone: "neutral", key_sentence: "" },
        advice: "",
        report: "",
      });

      await markChunksAsSummarized(chunkIds);

      return res.status(200).json({
        message: "Session too short — skipped embedding, marked complete.",
      });
    }

    const finalSummary: finalSummary = await generateFinalSummary(
      mergedSummary
    );
    const embedding = await convertToEmbedding(mergedSummary);
    const storePinconeEmbedding: string = await upsertFinalSummaryToPineCone({
      sessionId,
      userId,
      summary: mergedSummary,
      embedding,
      tone: finalSummary.metadata.tone,
      topics: finalSummary.metadata.topics,
    });

    await completeSessionInDb(sessionId, {
      summary: mergedSummary,
      metadata: finalSummary.metadata,
      advice: finalSummary.advice,
      report: finalSummary.report,
      embedding_id: storePinconeEmbedding,
    });

    await markChunksAsSummarized(chunkIds);

    return res.status(200).json({ message: "Session completed and embedded." });
  } catch (error) {
    console.error("Error completing session:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to complete session" });
    }
  }
};

// GET /sessions/:user_id
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const sessions = await getSessionsByUserId(user_id);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// GET /session/:id
export const getSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

// DELETE /session/:id
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteSessionById(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete session" });
  }
};

// GET /sessions (by lobby_id)
export const getLobbySessions = async (req: Request, res: Response) => {
  try {
    const { lobby_id } = req.params;
    if (!lobby_id || typeof lobby_id !== "string") {
      return res.status(400).json({ error: "Missing or invalid lobby_id" });
    }
    const sessions = await getSessionsByLobbyId(lobby_id);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};
