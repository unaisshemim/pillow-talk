import express from "express";
import {
  createLobby,
  joinLobbyByCode,
  getLobbyByUser,
} from "../controllers/lobbyController";

const router = express.Router();

// POST /api/lobby/create
router.post("/create", createLobby);

// POST /api/lobby/join
router.post("/join", joinLobbyByCode);

// GET /api/lobby/user/:userId
router.get("/user/:userId", getLobbyByUser);

export default router;
