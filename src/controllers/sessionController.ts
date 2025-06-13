import { Request, Response } from "express";
import {
  createSessionInDb,
  completeSessionInDb,
  getSessionsByUserId,
  getSessionById,
  deleteSessionById,
  getSessionsByLobbyId,
  getUserIdBySessionId,
  updateReportId,
  updateSessionStatus,
} from "../respository/sessionRepository";
import { SessionRole, SessionStatus } from "../enums/sessionRole";
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
import { generateReport } from "../respository/reportRepository";
import { getAllMessagesBySessionId } from "../respository/messageRepository";

// POST /session/start
export const startSession = async (req: Request, res: Response) => {
  try {
    const { user_id, title } = req.body;
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
      role = SessionRole.SOLO;
    }

    const session = await createSessionInDb({ lobby_id, user_id, role, title });
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

    const session = await getSessionById(sessionId);

    const chunks: Array<ChunkSummaryWithId> = await getChunksBySessionId(
      sessionId
    );
    const chunkIds: string[] = chunks.map((chunk) => chunk.id);
    const mergedSummary: string = mergeSummaryText(chunks).trim();
    console.log("merged summary: " + mergedSummary);

    if (mergedSummary.length < 30) {
      let summary = await getAllMessagesBySessionId(sessionId);
      if (summary.length === 0) {
        return res.status(400).json({
          error: "Session has no messages to summarize",
        });
      }

      const mergedUserContent = summary
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.content)
        .join(" ");

      await completeSessionInDb(sessionId, {
        summary: mergedUserContent,
        metadata: { topics: [], tone: "neutral", key_sentence: "" },
      });

      if (session.parent_session_id) {
        await updateSessionStatus(
          session.parent_session_id,
          SessionStatus.COMPLETED
        );
        await updateSessionStatus(sessionId, SessionStatus.COMPLETED);
      }

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
    if (session.parent_session_id) {
      console.log("hi");
      await updateSessionStatus(
        session.parent_session_id,
        SessionStatus.COMPLETED
      );
      await updateSessionStatus(sessionId, SessionStatus.COMPLETED);
    }

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

export const shareSessionToPartner = async (req: Request, res: Response) => {
  try {
    const { sessionId, user_id } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    let session = await getSessionById(sessionId);
    let { lobby_id, partner_id } = await getLobbyByUserId(user_id);
    let title = `Your partner reflected on "${session.title}"– want to share your side?`;
    console.log("bomb1");
    await updateSessionStatus(sessionId, SessionStatus.SHARED);

    console.log("bomb2");

    await createSessionInDb({
      lobby_id,
      user_id: partner_id,
      role: SessionRole.PARTNER,
      title,
      parent_session_id: sessionId,
    });

    // Update the session to share with the partner

    res
      .status(200)
      .json({ message: "Session shared with partner successfully" });
  } catch (error) {
    console.error("Error sharing session:", error);
    res.status(500).json({ error: "Failed to share session" });
  }
};

// POST /sessions/:id/generate-report

export const generateSessionReport = async (req: Request, res: Response) => {
  const { id: sessionId } = req.params;

  try {
    // Step 1: Validate session

    const currentSession = await getSessionById(sessionId);
    if (!currentSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (!currentSession.summary || !currentSession.is_completed) {
      return res
        .status(400)
        .json({ error: "Session is incomplete or missing summary" });
    }

    // Step 2: Get partner session
    const partnerSession = currentSession.parent_session_id
      ? await getSessionById(currentSession.parent_session_id) // This is partner B
      : await getSessionById(currentSession.id); // Fallback to current session if no parent

    if (!partnerSession) {
      return res.status(400).json({ error: "Partner session not found" });
    }
    if (!partnerSession.summary || !partnerSession.is_completed) {
      return res
        .status(400)
        .json({ error: "Partner session is incomplete or missing summary" });
    }

    // Step 3: Prevent duplicate report generation
    if (currentSession.report_id || partnerSession.report_id) {
      return res
        .status(400)
        .json({ error: "Report already exists for one of the sessions" });
    }

    // Step 4: Generate report with GPT (stubbed)
    const mergedSummary = `Merged summary of A and B`;
    const tone = { a: "frustrated", b: "quiet" };
    const topics = ["trust", "communication"];
    const suggestions = ["Try a no-phone dinner", "Share 1 compliment daily"];

    // Step 5: Store report using repository
    const reportData = await generateReport({
      merged_summary: mergedSummary,
      tone,
      topics,
      suggestions: suggestions.join("; "),
    });

    const reportId = reportData.id;
    console.log("Generated report ID:", );

    // Step 6: Update both sessions with report_id
    await updateReportId(reportId, currentSession.id, partnerSession.id);

    // Step 7: Return success
    return res.status(200).json({ success: true, report_id: reportId });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
