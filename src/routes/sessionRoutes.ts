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

// Put /session/:id/complete
router.put("/:userId/complete", completeSession);

// GET /users/:user_id/sessions
router.get("/users/:user_id", getUserSessions);

// GET /session/:id
router.get("/:id", getSession);

// DELETE /session/:id
router.delete("/:id", deleteSession);

// GET /sessions?lobby_id=
router.get("/lobby/:lobby_id", getLobbySessions);

export default router;
