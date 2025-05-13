import { Request, Response } from "express";
import {
  createSessionInDb,
  completeSessionInDb,
  getSessionsByUserId,
  getSessionById,
  deleteSessionById,
  getSessionsByLobbyId,
} from "../services/sessionService";
import { SessionRole } from "../enums/sessionRole";
import { Lobby } from "../types/lobby";
import { getLobbyByUserId } from "../services/lobbyService";

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

// PATCH /session/:id/complete
export const completeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { summary, tone, topics, embedding_id } = req.body;
    const session = await completeSessionInDb(id, {
      summary,
      tone,
      topics,
      embedding_id,
    });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to complete session" });
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
