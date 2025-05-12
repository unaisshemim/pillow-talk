import { Request, Response } from "express";
import {
  createLobbyInDb,
  joinLobbyInDb,
  getLobbyByUserId,
} from "../services/supabaseClient";
import { logger } from "../logger";
import { Lobby } from "../types/lobby";

// POST /api/lobby/create
export const createLobby = async (req: Request, res: Response) => {
  try {
    const { creator_id } = req.body; // Assume user is authenticated and ID is provided

    const lobby:Lobby = await createLobbyInDb(creator_id);
    console.log("Lobby created:", lobby);

    res.status(201).json({ lobby_id: lobby.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to create lobby" });
  }
};

// POST /api/lobby/join
export const joinLobby = async (req: Request, res: Response) => {
  try {
    const { lobby_id, partner_id } = req.body; // Assume user is authenticated and ID is provided
    const result = await joinLobbyInDb(lobby_id, partner_id);
  
    if (result) {
      res.status(200).json({ message: "Joined lobby" });
    } else {
      res.status(400).json({ error: "Failed to join lobby" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to join lobby" });
  }
};

// GET /api/lobby/user/:userId
export const getLobbyByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const lobby = await getLobbyByUserId(userId);
    if (lobby) {
      res.status(200).json(lobby);
    } else {
      res.status(404).json({ error: "Lobby not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lobby" });
  }
};
