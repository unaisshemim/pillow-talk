import { Request, Response } from "express";
import {
  createLobbyInDb,

  getLobbyByUserId,
  joinLobbyByCodeInDb,
} from "../respository/lobbyRepository";
import { Lobby } from "../types/lobby";

// POST /api/lobby/create
export const createLobby = async (req: Request, res: Response) => {
  try {
    const { creator_id } = req.body;

    const lobby: Lobby = await createLobbyInDb(creator_id);
    console.log("Lobby created:", lobby);

    res.status(201).json({ lobby_id: lobby.id, code: lobby.code });
  } catch (error) {
    console.error("Create lobby error:", error);
    res.status(500).json({ error: "Failed to create lobby" });
  }
};

// POST /api/lobby/join
export const joinLobbyByCode = async (req: Request, res: Response) => {
  try {
    const { code, partner_id } = req.body;

    if (!code || !partner_id) {
      return res.status(400).json({ error: "Missing code or partner_id" });
    }

    const lobby = await joinLobbyByCodeInDb(code, partner_id);
    res.status(200).json({
      message: "Successfully joined the lobby",
      lobby_id: lobby.id,
      connected_at: lobby.connected_at,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to join lobby" });
  }
};

// GET /api/lobby/user/:userId
export const getLobbyByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const lobby: Lobby = await getLobbyByUserId(userId);
    if (lobby) {
      res.status(200).json(lobby);
    } else {
      res.status(404).json({ error: "Lobby not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lobby" });
  }
};
