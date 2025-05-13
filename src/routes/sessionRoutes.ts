import express from "express";
import {
  startSession,
  completeSession,
  getUserSessions,
  getSession,
  deleteSession,
  getLobbySessions,
} from "../controllers/sessionController";

const router = express.Router();

// POST /session/start
router.post("/start", startSession);

// PATCH /session/:id/complete
router.patch("/:id/complete", completeSession);

// GET /sessions/:user_id
router.get("/:user_id", getUserSessions);

// GET /session/:id
router.get("/:id", getSession);

// DELETE /session/:id
router.delete("/:id", deleteSession);

// GET /sessions?lobby_id=
router.get("/sessions", getLobbySessions);

export default router;
